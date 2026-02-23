<template>
  <header class="bg-white shadow-sm">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center space-x-8">
          <NuxtLink to="/" class="text-xl font-bold text-primary-600">
            Marketplace
          </NuxtLink>
          <NuxtLink
            to="/products"
            class="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Browse
          </NuxtLink>
          <NuxtLink
            to="/sell"
            class="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sell
          </NuxtLink>
        </div>
        <button
          class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    </nav>
  </header>
</template>
