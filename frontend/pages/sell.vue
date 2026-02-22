<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Sell a Product</h1>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="What are you selling?"
        />
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          v-model="form.description"
          rows="4"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Describe your product..."
        />
      </div>

      <div>
        <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
          Price ($)
        </label>
        <input
          id="price"
          v-model.number="form.price"
          type="number"
          min="0"
          step="0.01"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="0.00"
        />
      </div>

      <div>
        <label for="image_url" class="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          id="image_url"
          v-model="form.image_url"
          type="url"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          v-model.number="form.category_id"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option :value="undefined">Select a category</option>
          <option :value="1">Electronics</option>
          <option :value="2">Clothing</option>
          <option :value="3">Home & Garden</option>
          <option :value="4">Sports</option>
          <option :value="5">Books</option>
        </select>
      </div>

      <div v-if="successMessage" class="bg-green-50 text-green-700 p-4 rounded-lg">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="bg-red-50 text-red-700 p-4 rounded-lg">
        {{ errorMessage }}
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {{ submitting ? 'Listing...' : 'List Product' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const { createProduct } = useApi()

const form = ref({
  title: '',
  description: '',
  price: 0,
  image_url: '',
  category_id: undefined as number | undefined,
})

const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function handleSubmit() {
  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    await createProduct({
      ...form.value,
      seller_id: 1,
      image_url: form.value.image_url || undefined,
      category_id: form.value.category_id || undefined,
    })
    successMessage.value = 'Product listed successfully!'
    form.value = { title: '', description: '', price: 0, image_url: '', category_id: undefined }
  } catch {
    errorMessage.value = 'Failed to list product. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>
