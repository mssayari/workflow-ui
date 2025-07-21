<template>
  <div class="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-modal overflow-y-auto">
      <div class="px-6 py-3 border-b border-gray-200">
        <slot name="header"></slot>
      </div>

      <div class="px-6 py-4">
        <slot name="body"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.max-h-modal{
  max-height: 80vh;
}
</style>