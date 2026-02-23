<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <NuxtLink
      to="/products"
      class="text-primary-600 hover:text-primary-700 mb-6 inline-block"
    >
      ← Back to products
    </NuxtLink>

    <div v-if="pending" class="text-center py-12 text-gray-500">
      Loading product...
    </div>
    <div v-else-if="error" class="text-center py-12 text-red-500">
      Product not found
    </div>
    <div v-else-if="data" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="aspect-video bg-gray-200 flex items-center justify-center">
        <img
          v-if="data.image_url"
          :src="data.image_url"
          :alt="data.title"
          class="w-full h-full object-cover"
        />
        <span v-else class="text-gray-400">No image available</span>
      </div>
      <div class="p-8">
        <div class="flex justify-between items-start mb-4">
          <h1 class="text-3xl font-bold text-gray-900">{{ data.title }}</h1>
          <span class="text-3xl font-bold text-primary-600">
            ${{ data.price.toFixed(2) }}
          </span>
        </div>
        <div class="flex items-center space-x-4 mb-6">
          <span
            v-if="data.category"
            class="bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full"
          >
            {{ data.category.name }}
          </span>
          <span
            class="text-sm px-3 py-1 rounded-full"
            :class="{
              'bg-green-50 text-green-700': data.status === 'active',
              'bg-gray-50 text-gray-700': data.status === 'draft',
              'bg-red-50 text-red-700': data.status === 'sold',
              'bg-yellow-50 text-yellow-700': data.status === 'archived',
            }"
          >
            {{ data.status }}
          </span>
        </div>
        <p class="text-gray-700 text-lg mb-6">{{ data.description }}</p>
        <div class="border-t pt-4 text-sm text-gray-500">
          <p>Seller #{{ data.seller_id }}</p>
          <p>Listed {{ new Date(data.created_at).toLocaleDateString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { fetchProduct } = useApi()

const { data, pending, error } = await useAsyncData(
  `product-${route.params.id}`,
  () => fetchProduct(Number(route.params.id))
)
</script>
