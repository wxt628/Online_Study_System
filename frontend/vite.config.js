import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '/api/v1') // 后端已有 /api/v1 前缀，不需要 rewrite 或者根据实际情况调整
      },
      // 代理后端静态上传文件，确保开发环境下 /uploads/* 能从后端读取
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
	css: {
		postcss: {
			plugins: [
				autoprefixer({
					overrideBrowserslist: [
						'last 2 versions',
						'> 1%',
						'not dead'
					]
				})
			]
		}
	}
})

// export default defineConfig({
//   plugins: [vue()],
// })
