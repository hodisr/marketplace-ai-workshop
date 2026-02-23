<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Welcome to Marketplace
      </h1>
      <p class="text-lg text-gray-600">
        Discover amazing products from sellers around the world
      </p>
    </div>

    <div class="mb-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Featured Products</h2>
        <NuxtLink
          to="/products"
          class="text-primary-600 hover:text-primary-700 font-medium"
        >
          View all →
        </NuxtLink>
      </div>

      <div v-if="pending" class="text-center py-12 text-gray-500">
        Loading products...
      </div>
      <div v-else-if="error" class="text-center py-12 text-red-500">
        Failed to load products
      </div>
      <div
        v-else-if="data?.items.length"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <NuxtLink
          v-for="product in data.items"
          :key="product.id"
          :to="`/products/${product.id}`"
        >
          <ProductCard :product="product" />
        </NuxtLink>
      </div>
      <div v-else class="text-center py-12 text-gray-500">
        No products yet. Be the first to sell something!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchProducts } = useApi()

const { data, pending, error } = await useAsyncData('featured-products', () =>
  fetchProducts(1, 6)
)
</script>
