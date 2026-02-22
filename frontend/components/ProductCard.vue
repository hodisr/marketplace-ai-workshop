<template>
  <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div class="aspect-video bg-gray-200 flex items-center justify-center">
      <img
        v-if="product.image_url"
        :src="product.image_url"
        :alt="product.title"
        class="w-full h-full object-cover"
      />
      <span v-else class="text-gray-400 text-sm">No image</span>
    </div>
    <div class="p-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-semibold text-gray-900 line-clamp-1">
          {{ product.title }}
        </h3>
        <span class="text-lg font-bold text-primary-600">
          ${{ product.price.toFixed(2) }}
        </span>
      </div>
      <p class="text-gray-600 text-sm line-clamp-2 mb-3">
        {{ product.description }}
      </p>
      <div class="flex items-center justify-between">
        <span
          v-if="product.category"
          class="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full"
        >
          {{ product.category.name }}
        </span>
        <span class="text-xs text-gray-500">
          {{ product.seller_name || 'Unknown seller' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  product: Product
}>()
</script>
