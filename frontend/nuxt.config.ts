export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  devServer: {
    port: 3000,
  },
  runtimeConfig: {
    productServiceUrl: 'http://product-service:8001',
    userServiceUrl: 'http://user-service:8002',
    public: {
      productServiceUrl: 'http://localhost:8011',
      userServiceUrl: 'http://localhost:8012',
    },
  },
  nitro: {
    routeRules: {
      '/api/products': { proxy: 'http://product-service:8001/api/products' },
      '/api/products/**': { proxy: 'http://product-service:8001/api/products/**' },
      '/api/users/**': { proxy: 'http://user-service:8002/api/users/**' },
      '/api/sellers/**': { proxy: 'http://user-service:8002/api/sellers/**' },
    },
  },
})
