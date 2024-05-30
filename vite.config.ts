import { fileURLToPath, URL } from 'node:url'

import type { ConfigEnv, UserConfig } from 'vite'
import { loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'

const root: string = process.cwd()

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfig => {
  const { VITE_PORT, VITE_PUBLIC_PATH } = loadEnv(mode, root)

  const config: UserConfig = {
    base: VITE_PUBLIC_PATH,
    plugins: [vue(), vueJsx(), VueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: Number(VITE_PORT),
      host: '0.0.0.0',
      proxy: {},
    },
    build: {
      minify: 'terser',
    },
  }

  if (mode === 'production') {
    config.build!.terserOptions = {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    }
  } else {
    config.build!.sourcemap = true
  }

  return config
}
