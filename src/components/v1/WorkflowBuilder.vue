<script setup>
import {ref, computed} from 'vue'
import ActionConfig from './ActionConfig.vue'

const workflow = ref({
  name: '',
  trigger: {
    type: 'schedule',
    config: {
      cron: '0 6 * * *'
    }
  },
  actions: []
})

const prettyWorkflow = computed(() => {
  return JSON.stringify(workflow.value, null, 2)
})

const addAction = () => {
  workflow.value.actions.push({
    id: `action_${workflow.value.actions.length + 1}`,
    type: 'fetch_data',
    config: {
      provider: 'default'
    },
    onSuccess: null
  })
}

const removeAction = (index) => {
  workflow.value.actions.splice(index, 1)
  // Update onSuccess chains
  workflow.value.actions.forEach((action, i) => {
    if (i < workflow.value.actions.length - 1) {
      action.onSuccess = `action_${i + 2}`
    } else {
      action.onSuccess = null
    }
  })
}

const updateActionConfig = (index, config) => {
  workflow.value.actions[index].config = {
    ...workflow.value.actions[index].config,
    ...config
  }
}

const copyJson = () => {
  navigator.clipboard.writeText(prettyWorkflow.value)
}
</script>
<template>
  <div class="w-full flex h-screen">
    <!-- Left side: JSON Preview -->
    <div class="w-1/2 bg-gray-900 p-4">
      <div class="bg-gray-800 rounded-lg h-full">
        <div class="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 class="text-white text-lg font-semibold">Workflow JSON</h2>
          <button
              @click="copyJson"
              class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Copy JSON
          </button>
        </div>
        <pre class="p-4 text-green-400 overflow-auto h-[calc(100%-4rem)]">{{ prettyWorkflow }}</pre>
      </div>
    </div>

    <!-- Right side: Workflow Builder -->
    <div class="w-1/2 bg-white p-4">
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
        <input
            v-model="workflow.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter workflow name"
        >
      </div>

      <!-- Trigger Section -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-4">Trigger</h3>
        <select
            v-model="workflow.trigger.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="schedule">Schedule (Cron)</option>
          <option value="webhook">Webhook</option>
          <option value="event">Internal Event</option>
        </select>

        <!-- Dynamic trigger config based on type -->
        <div class="mt-4" v-if="workflow.trigger.type === 'schedule'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Cron Expression</label>
          <input
              v-model="workflow.trigger.config.cron"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="0 6 * * *"
          >
        </div>
      </div>

      <!-- Actions Section -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Actions</h3>
          <button
              @click="addAction"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Action
          </button>
        </div>

        <!-- Action Cards -->
        <div class="space-y-4">
          <div
              v-for="(action, index) in workflow.actions"
              :key="index"
              class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-medium">Action {{ index + 1 }}</h4>
              <button
                  @click="removeAction(index)"
                  class="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                    v-model="action.type"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="fetch_data">Fetch Data</option>
                  <option value="export_csv">Export CSV</option>
                  <option value="ftp_upload">FTP Upload</option>
                  <option value="send_email">Send Email</option>
                  <option value="api_request">API Request</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select
                    v-model="action.config.provider"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="default">Default</option>
                  <option value="custom">Custom</option>
                  <option v-if="action.type === 'send_email'" value="mailjet">Mailjet</option>
                  <option v-if="action.type === 'ftp_upload'" value="filezilla">Filezilla</option>
                </select>
              </div>

              <!-- Dynamic config fields based on action type -->
              <ActionConfig
                  :action="action"
                  @update:config="updateActionConfig(index, $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>