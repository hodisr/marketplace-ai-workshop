<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">All Products</h1>

    <div v-if="pending" class="text-center py-12 text-gray-500">
      Loading products...
    </div>
    <div v-else-if="error" class="text-center py-12 text-red-500">
      Failed to load products
    </div>
    <template v-else-if="data">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <NuxtLink
          v-for="product in data.items"
          :key="product.id"
          :to="`/products/${product.id}`"
        >
          <ProductCard :product="product" />
        </NuxtLink>
      </div>

      <div
        v-if="data.meta.total_pages > 1"
        class="flex justify-center space-x-2"
      >
        <button
          v-for="p in data.meta.total_pages"
          :key="p"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            p === page
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100',
          ]"
          @click="page = p"
        >
          {{ p }}
        </button>
      </div>
    </template>
    <div v-else class="text-center py-12 text-gray-500">
      No products found
    </div>
  </div>
</template>

<script setup lang="ts">
const page = ref(1)
const { fetchProducts } = useApi()

const { data, pending, error } = await useAsyncData(
  'products',
  () => fetchProducts(page.value),
  { watch: [page] }
)
</script>
