<script setup>
import {ref, computed} from 'vue'
import {IconPlus, IconX} from '@tabler/icons-vue'
import Modal from './Modal.vue'
import ActionForm from './ActionForm.vue'
import TriggerForm from './TriggerForm.vue'
import {getActionTypes, getProviders, getActionByKey, getProviderByKey} from '@/utils/actionFormSchema.js'


const workflow = ref({
  name: 'My Workflow',
  trigger: {
    type: 'schedule',
    config: {
      cron: '0 6 * * *'
    }
  },
  actions: []
})

const showActionModal = ref(false)
const showTriggerModal = ref(false)
const editingAction = ref(null)
const selectedAction = ref(null)
const afterActionId = ref(null)


const actionTypes = getActionTypes()
const providers = getProviders(actionTypes[0].value)


const defaultAction = {
  type: actionTypes[0].value,
  provider: providers[0].value,
  config: {
    // ...initializeConfigFromSchema(actionTypes[0].value, providers[0].value)
  }
}

const prettyWorkflow = computed(() => {
  return JSON.stringify(workflow.value, null, 2)
})

const openActionModal = (actionId) => {
  afterActionId.value = actionId
  showActionModal.value = true
}

const closeActionModal = () => {
  showActionModal.value = false
  editingAction.value = null
  afterActionId.value = null
}

const editAction = (action) => {
  editingAction.value = {...action}
  showActionModal.value = true
}

const saveAction = (actionData) => {
  if (editingAction.value) {
    const index = workflow.value.actions.findIndex(a => a.id === editingAction.value.id)
    workflow.value.actions[index] = {...actionData}
  } else {
    const newAction = {
      ...actionData,
      id: `action_${workflow.value.actions.length + 1}`,
    }

    if (afterActionId.value === null) {
      workflow.value.actions.unshift(newAction)
    } else {
      const index = workflow.value.actions.findIndex(a => a.id === afterActionId.value)
      workflow.value.actions.splice(index + 1, 0, newAction)
    }
  }
  updateActionChaining()
  closeActionModal()
}

const removeAction = (index) => {
  workflow.value.actions.splice(index, 1)
  updateActionChaining()
}

const updateActionChaining = () => {
  workflow.value.actions.forEach((action, i) => {
    if (i < workflow.value.actions.length - 1) {
      action.onSuccess = workflow.value.actions[i + 1].id
    } else {
      action.onSuccess = null
    }
  })
}

const editTrigger = () => {
  showTriggerModal.value = true
}

const closeTriggerModal = () => {
  showTriggerModal.value = false
}

const saveTrigger = (triggerData) => {
  workflow.value.trigger = triggerData.trigger
  closeTriggerModal()
}

const copyJson = () => {
  navigator.clipboard.writeText(prettyWorkflow.value)
}

</script>
<template>
  <div class="flex min-h-screen bg-gray-900">
    <!-- Left side: JSON Preview -->
    <div class="w-1/3 p-4">
      <div class="bg-gray-800 rounded-lg h-full">
        <div class="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 class="text-white text-lg font-semibold">Workflow JSON</h2>
<!--          <button-->
<!--              @click="copyJson"-->
<!--              class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">-->
<!--            Copy JSON-->
<!--          </button>-->
          <a href="https://gist.github.com/mssayari/6ec4bc419e8225015ca5922174c9b970" target="_blank"
             class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Documentation</a>
        </div>
        <pre class="p-4 text-green-400 overflow-auto h-[calc(100%-4rem)]">{{ prettyWorkflow }}</pre>
      </div>
    </div>

    <!-- Right side: Workflow Graph -->
    <div class="w-2/3 p-4">
      <div class="h-full bg-gray-50 rounded-lg py-2">
        <div class="mb-6 px-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
          <input
              v-model="workflow.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter workflow name"
          >
        </div>
        <!-- Workflow Graph -->
        <div class="workflow-graph flex flex-col items-center gap-4">
          <!-- Trigger Node -->
          <div class="workflow-node flex flex-col items-center gap-2 trigger-node">
            <div class="bg-gray-700 text-white p-4 rounded-lg shadow-lg w-64">
              <h3 class="font-semibold mb-2">Trigger</h3>
              <p class="text-sm">{{ workflow.trigger.type }}</p>
              <button @click="editTrigger" class="mt-2 px-3 py-1 bg-gray-400 hover:bg-gray-500 rounded text-sm">
                Configure
              </button>
            </div>
            <div class="workflow-connector h-8 border-l-2 border-gray-300 border-dashed relative">
              <button v-if="!workflow.actions.length" @click="openActionModal(null)"
                      class="add-action-btn absolute left-1/2 transform -translate-x-1/2 bottom-[-12px] bg-white
                    border-2 border-gray-300 rounded-full w-6 h-6 flex items-center justify-center
                    text-gray-600 hover:bg-gray-200 duration-300">
                <icon-plus class="h-6 w-6"/>
              </button>
            </div>
          </div>

          <!-- Action Nodes -->
          <div v-for="(action, index) in workflow.actions" :key="action.id"
               class="workflow-node flex flex-col items-center gap-2">
            <div class="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200 w-64"
                 :class="{ 'border-blue-500': selectedAction === action.id }">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold">{{ getActionByKey(action.type).label }}</h3>
                <button @click="removeAction(index)" class="text-red-600 hover:text-red-800">
                  <icon-x class="h-5 w-5"/>
                </button>
              </div>
              <p class="text-sm text-gray-600">Provider: {{ getProviderByKey(action.type,action.provider).label }}</p>
              <button @click="editAction(action)" class="mt-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
                Edit
              </button>
            </div>
            <div class="workflow-connector h-8 border-l-2 border-gray-300 border-dashed relative">
              <button @click="openActionModal(action.id)"
                      class="add-action-btn absolute left-1/2 transform -translate-x-1/2 bottom-[-12px] bg-white
                    border-2 border-gray-300 rounded-full w-6 h-6 flex items-center justify-center
                    text-gray-600 hover:bg-gray-200 duration-300">
                <icon-plus class="h-6 w-6"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Modal -->
    <Modal v-if="showActionModal" @close="closeActionModal">
      <template #header>
        <h3 class="text-lg font-medium">
          {{ editingAction ? 'Edit Action' : 'Add New Action' }}
        </h3>
      </template>

      <template #body>
        <ActionForm
            :action="editingAction || defaultAction"
            @save="saveAction"
            @cancel="closeActionModal"
        />
      </template>
    </Modal>

    <!-- Trigger Modal -->
    <Modal v-if="showTriggerModal" @close="closeTriggerModal">
      <template #header>
        <h3 class="text-lg font-medium">Configure Trigger</h3>
      </template>

      <template #body>
        <TriggerForm
            :name="workflow.name"
            :trigger="workflow.trigger"
            @save="saveTrigger"
            @cancel="closeTriggerModal"
        />
      </template>
    </Modal>
  </div>
</template>
<style scoped>

</style>