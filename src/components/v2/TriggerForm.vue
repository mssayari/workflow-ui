<script setup>
import {ref} from 'vue'

const props = defineProps({
  trigger: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const formData = ref({
  trigger: props.trigger
})



const handleSubmit = () => {
  // remove extra properties by checking type
  if (formData.value.trigger.type === 'schedule') {
    formData.value.trigger.config = {
      cron: formData.value.trigger.config.cron
    }
  } else if (formData.value.trigger.type === 'webhook') {
    formData.value.trigger.config = {
      url: formData.value.trigger.config.url
    }
  } else if (formData.value.trigger.type === 'event') {
    formData.value.trigger.config = {
      event: formData.value.trigger.config.event
    }
  }

  emit('save', {...formData.value})
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Trigger Type</label>
      <select v-model="formData.trigger.type" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        <option value="schedule">Schedule (Cron)</option>
        <option value="webhook">Webhook</option>
        <option value="event">Internal Event</option>
      </select>
    </div>

    <!-- Schedule Config -->
    <div v-if="formData.trigger.type === 'schedule'">
      <label class="block text-sm font-medium text-gray-700 mb-2">Cron Expression</label>
      <input v-model="formData.trigger.config.cron" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md"
             placeholder="0 6 * * *">
    </div>

    <!-- Webhook Config -->
    <div v-if="formData.trigger.type === 'webhook'">
      <label class="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
      <input v-model="formData.trigger.config.url" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md"
             placeholder="/api/workflow/trigger">
    </div>

    <!-- Event Config -->
    <div v-if="formData.trigger.type === 'event'">
      <label class="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
      <input v-model="formData.trigger.config.event" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md"
             placeholder="user.created">
    </div>

    <div class="flex justify-end gap-3 mt-6">
      <button type="button" @click="$emit('cancel')"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
        Cancel
      </button>
      <button type="submit" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
        Save
      </button>
    </div>
  </form>
</template>