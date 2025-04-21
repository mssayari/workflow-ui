<script setup>
import {onMounted, ref} from 'vue'
import {useWorkflowStore} from '@/stores/workflow.js'
import Cron from './cron/cron.vue'
import router from "@/router/router.js";


const workflowStore = useWorkflowStore()
const formData = ref({
  name: '',
  trigger: {
    type: '4',
    config: {}
  }
})

const cronError = ref('')


const handleSubmit = () => {
  // Remove extra properties based on the trigger type
  if (formData.value.trigger.type === '1') {
    formData.value.trigger.config = {
      cron: formData.value.trigger.config.cron || '* * * * *',
    }
  } else if (formData.value.trigger.type === '2') {
    formData.value.trigger.config = {
      url: formData.value.trigger.config.url
    }
  } else if (formData.value.trigger.type === '3') {
    formData.value.trigger.config = {
      event: formData.value.trigger.config.event
    }
  } else {
    formData.value.trigger.config = {}
  }

  // Update the workflow store with the new trigger data
  workflowStore.workflow.name = formData.value.name
  workflowStore.workflow.trigger = {...formData.value.trigger}

  if (workflowStore.workflow.id) {
    workflowStore.updateWorkflow().then(() => {
      // Close the modal after successful update
      workflowStore.closeWorkflowModal()
    })
  }else{
    workflowStore.createWorkflow().then(() => {
      router.push({
        name: 'workflow-builder',
        params: {id: workflowStore.workflow.id}
      })
      workflowStore.closeWorkflowModal()
    })
  }
}

// Initialize formData with the current trigger from the store
onMounted(() => {
  // copy the trigger name and trigger object to formData
  formData.value.name = JSON.parse(JSON.stringify(workflowStore.workflow.name || ''))
  formData.value.trigger = JSON.parse(JSON.stringify(workflowStore.workflow.trigger))
})


</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
      <input v-model="formData.name" type="text" @change="console.log(workflowStore.workflow.name)"
             class="w-full px-3 py-2 border border-gray-300 rounded-md"
             placeholder="Enter workflow name">
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Trigger Type</label>
      <select v-model="formData.trigger.type" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        <option v-for="(trigger,index) in workflowStore.triggers" :value="index">{{ trigger }}</option>
      </select>
    </div>

    <!-- Schedule Config -->
    <div v-if="formData.trigger.type === '1' || formData.trigger.type === 1">
      <label class="block text-sm font-medium text-gray-700 mb-2">Schedule Rule</label>
      <cron v-model="formData.trigger.config.cron" @error="cronError=$event"></cron>
      <p v-if="cronError" class="text-red-500 text-sm mt-1">{{ cronError }}</p>
    </div>

    <!-- Webhook Config -->
    <div v-if="formData.trigger.type === '2' || formData.trigger.type === 2">
      <label class="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
      <input v-model="formData.trigger.config.url" type="text"
             class="w-full px-3 py-2 border border-gray-300 rounded-md"
             placeholder="/api/workflow/trigger">
    </div>

    <!-- Event Config -->
    <div v-if="formData.trigger.type === '3' || formData.trigger.type === 3">
      <label class="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
      <input v-model="formData.trigger.config.event" type="text"
             class="w-full px-3 py-2 border border-gray-300 rounded-md"
             placeholder="user.created">
    </div>

    <div class="flex justify-end gap-3 mt-6">
      <button type="button" @click="workflowStore.closeWorkflowModal()"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
        Cancel
      </button>
      <button type="submit" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
        Save
      </button>
    </div>
  </form>
</template>