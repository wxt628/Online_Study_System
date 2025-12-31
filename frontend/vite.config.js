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