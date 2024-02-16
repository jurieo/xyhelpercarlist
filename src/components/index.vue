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

<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
const isIframe = window.top !== window.self

const itemslist = ref([])
const notice = ref("")

const fetchData = () => {
  axios
    .post("http://localhost:8001/carpage", {
      page: 1,
      size: 999,
    })
    .then((response) => {
      notice.value = response.data.notice;
      let baseUrl = window.location.origin;
      itemslist.value = response.data.data.list.map((item) => {
        let carname = encodeURIComponent(`${item.carID}`);
        let iconUrl = `${baseUrl}/endpoint?carid=${carname}`;
        return { ...item, iconurl: encodeURIComponent(iconUrl) };
      });
      if (!isIframe) {
        // 当前页面在顶级窗口中
        if (itemslist.value.length === 1 && itemslist.value[0].status === 1) {
          redirectTo(itemslist[0]);
        }
      }
    })
    .catch((error) => {
      console.error("请求错误:", error);
    })
}

const redirectTo = (carID) => {
  if (carID.status === 0) {
    return alert("翻车啦，换一个吧！");
  }
  // 尝试获取父页面的路径
  const targetPath = !isIframe ? '/auth/login' : '/auth/loginSession';
  const redirectUrl = `${window.location.origin}${targetPath}?carid=${encodeURI(carID.carID)}`;


  if (isIframe) {
    axios.get(redirectUrl).then(({ data }) => {
      if (data.code === 1) {
        window.parent.location.href = "/";
      }
      else {
        alert(data.msg);
      }
    })
  }
  else {
    // 在iframe中执行重定向可能不会按预期工作
    // 可能需要在父页面上设置location或通过其他机制通知父页面进行重定向
    window.parent.location.href = redirectUrl;
  }




  // window.location.href = `${
  //   window.location.origin
  // }/auth/login?carid=${encodeURI(carID.carID)}`;
}

fetchData();
</script>

<style>
.cardclss {
  cursor: pointer;
}
</style>
