import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'


export default defineConfig({
    transpileDependencies: true,
    //打包后不生成.map文件
    productionSourceMap: false,
    base: "/list",
    devServer: {
        proxy: {
            "/carpage": {
                target: "http://127.0.0.1:8300",
                changeOrigin: true,
                ws: true,
                autoRewrite: true,
                cookieDomainRewrite: true,
            },
        },
    },
    plugins: [
        vue(),
        AutoImport({
            imports: [
                'vue',
                {
                    'naive-ui': [
                        'useDialog',
                        'useMessage',
                        'useNotification',
                        'useLoadingBar'
                    ]
                }
            ]
        }),
        Components({
            resolvers: [NaiveUiResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: '../gpt-share-server/backend/resource/public/list',
        emptyOutDir: true
    }
})
