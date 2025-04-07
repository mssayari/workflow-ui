<script setup>
import {ref, watch} from 'vue'

const props = defineProps({
  action: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:config'])

const config = ref({...props.action.config})

watch(config, (newConfig) => {
  emit('update:config', newConfig)
}, {deep: true})
</script>
<template>
  <div class="space-y-4">
    <!-- Fetch Data Config -->
    <template v-if="props.action.type === 'fetch_data'">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Collection</label>
        <input
            v-model="config.collection"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
      </div>
    </template>

    <!-- Export CSV Config -->
    <template v-if="props.action.type === 'export_csv'">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Export Path</label>
        <input
            v-model="config.path"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
      </div>
    </template>

    <!-- Email Config -->
    <template v-if="props.action.type === 'send_email'">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">To</label>
        <input
            v-model="config.to"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
        <input
            v-model="config.subject"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Body</label>
        <textarea
            v-model="config.body"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="3"
        ></textarea>
      </div>
    </template>

    <!-- API Request Config -->
    <template v-if="props.action.type === 'api_request'">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">URL</label>
        <input
            v-model="config.url"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Method</label>
        <select
            v-model="config.method"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
    </template>
  </div>
</template>