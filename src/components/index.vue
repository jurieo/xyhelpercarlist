<template>
  <n-global-style />
  <n-grid x-gap="12" :cols="1">
    <n-gi>
      <div class="light-green" v-html="notice"></div>
    </n-gi>
  </n-grid>
  <n-divider></n-divider>
  <n-grid x-gap="10" y-gap="10" cols="2 s:3 m:4 l:5 xl:5 2xl:6" responsive="screen">
    <n-grid-item class="cardclss" v-for="item in itemslist" :key="item.carID">
      <n-card :title="item.carID" @click="redirectTo(item)">
        <img class="plusicon" :src="'https://img.closeai.biz/endpoint?url=' + item.iconurl" />
      </n-card>
    </n-grid-item>
  </n-grid>
  <n-divider></n-divider>
</template>

<script lang="ts">
import axios from "axios";
import { useMessage } from "naive-ui";
const message = useMessage();
export default {
  data() {
    return {
      itemslist: [],
      itemsplus: [],
      notice: "",
      total: 0,
      page: 1,
      isLoading: false,
      hasMoreData: true,
    };
  },
  mounted() {
    this.fetchData();
    window.addEventListener("scroll", this.handleScroll);
  },
  methods: {
    fetchData() {
      if (!this.hasMoreData || this.isLoading) return; // 如果没有更多数据或正在加载，则不执行任何操作

      this.isLoading = true;
      axios
        .post("/carpage", {
          page: this.page,
          size: 48,
        })
        .then((response) => {
          if (response.data.data.list === null) {
            this.hasMoreData = false;
            return;
          }
          this.notice = response.data.notice;
          let baseUrl = window.location.origin;
          const newItems = response.data.data.list.map((item) => {
            let carname = encodeURIComponent(`${item.carID}`);
            let iconUrl = `${baseUrl}/endpoint?carid=${carname}`;
            return { ...item, iconurl: encodeURIComponent(iconUrl) };
          });
          this.itemslist = [...this.itemslist, ...newItems];
          this.page += 1;
          if (window.top === window.self) {
            // 当前页面在顶级窗口中
            if (this.itemslist.length === 1 && this.itemslist[0].status === 1) {
              this.redirectTo(this.itemslist[0]);
            }
          }
        })
        .catch((error) => {
          console.error("请求错误:", error);
        })
    },
    handleScroll() {
      const nearBottomOfPage =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      if (nearBottomOfPage && !this.isLoading) {
        this.fetchData();
      }
    },
    redirectTo(carID) {
      if (carID.status === 0) {
        return message.error("翻车啦，换一个吧！");
      }
      // 尝试获取父页面的路径
      const parentPath = window.parent.location.pathname;
      const targetPath = parentPath === '/list' ? '/auth/login' : '/auth/loginSession';
      const redirectUrl = `${window.location.origin}${targetPath}?carid=${encodeURI(carID.carID)}`;
      // console.log("redirectUrl", redirectUrl);

      // 在iframe中执行重定向可能不会按预期工作
      // 可能需要在父页面上设置location或通过其他机制通知父页面进行重定向
      window.parent.location.href = redirectUrl;


      // window.location.href = `${
      //   window.location.origin
      // }/auth/login?carid=${encodeURI(carID.carID)}`;
    },
    beforeDestroy() {
      window.removeEventListener("scroll", this.handleScroll);
    },
  },
};
</script>

<style>
.cardclss {
  cursor: pointer;
}
</style>
