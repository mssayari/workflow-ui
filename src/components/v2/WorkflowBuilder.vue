<script setup>
import {ref, onMounted, onBeforeMount, onUnmounted} from 'vue'
import {IconPlus, IconX} from '@tabler/icons-vue'
import Modal from './Modal.vue'
import ActionForm from '@/components/v2/ActionForm.vue'
import {useActionStore} from "@/stores/action.js";
import {useWorkflowStore} from "@/stores/workflow.js";
import Layout from "@/components/v2/Layout.vue";
import router from "@/router/router.js";


const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const workflowStore = useWorkflowStore()
const actionStore = useActionStore()

const showActionModal = ref(false)
const editingAction = ref(null)
const selectedAction = ref(null)
const afterActionId = ref(null)


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
    const index = workflowStore.workflow.actions.findIndex(a => a.id === editingAction.value.id)
    workflowStore.workflow.actions[index] = {...actionData}
    workflowStore.updateAction(actionData)
  } else {
    const newAction = {...actionData}

    workflowStore.addAction(newAction)


    // if (afterActionId.value === null) {
    //   workflowStore.workflow.actions.unshift(newAction)
    // } else {
    //   const index = workflowStore.workflow.actions.findIndex(a => a.id === afterActionId.value)
    //   workflowStore.workflow.actions.splice(index + 1, 0, newAction)
    // }
  }
  // updateActionChaining()
  closeActionModal()
}

const updateActionChaining = () => {
  workflowStore.workflow.actions.forEach((action, i) => {
    if (i < workflowStore.workflow.actions.length - 1) {
      action.onSuccess = workflowStore.workflow.actions[i + 1].id
    } else {
      action.onSuccess = null
    }
  })
}


onMounted(() => {
  if (!workflowStore.workflow) {
    router.push({name: 'index'})
  }
})

onBeforeMount(() => {
  // read available actions from server
  // actionStore.fetchActions()
})

onUnmounted(() => {
  workflowStore.resetWorkflow()
})

</script>
<template>
  <layout>
    <div class="flex min-h-screen bg-gray-900" v-if="workflowStore.workflow">
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
          <pre class="p-4 text-green-400 overflow-auto h-[calc(100%-4rem)]">{{ workflowStore.prettyWorkflow }}</pre>
        </div>
      </div>

      <!-- Right side: Workflow Graph -->
      <div class="w-2/3 p-4">
        <div class="h-full bg-gray-50 rounded-lg py-2">
          <!-- Workflow Graph -->
          <div class="workflow-graph flex flex-col items-center gap-4">
            <!-- Trigger Node -->
            <div class="workflow-node flex flex-col items-center gap-2 trigger-node">
              <div class="bg-gray-700 text-white p-4 rounded-lg shadow-lg w-64">
                <h3 class="font-semibold mb-2">Trigger</h3>
                <p class="text-sm">{{ workflowStore.triggers[workflowStore.workflow.trigger.type] || '' }}</p>
                <button @click="workflowStore.openWorkflowModal()" class="mt-2 px-3 py-1 bg-gray-400 hover:bg-gray-500 rounded text-sm">
                  Configure
                </button>
              </div>
              <div class="workflow-connector h-8 border-l-2 border-gray-300 border-dashed relative">
                <button v-if="!workflowStore.workflow.length" @click="openActionModal(null)"
                        class="add-action-btn absolute left-1/2 transform -translate-x-1/2 bottom-[-12px] bg-white
                    border-2 border-gray-300 rounded-full w-6 h-6 flex items-center justify-center
                    text-gray-600 hover:bg-gray-200 duration-300">
                  <icon-plus class="h-6 w-6"/>
                </button>
              </div>
            </div>

            <!-- Action Nodes -->
            <div v-for="(action, index) in workflowStore.workflow.actions" :key="action.id"
                 class="workflow-node flex flex-col items-center gap-2">
              <div class="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200 w-64"
                   :class="{ 'border-blue-500': selectedAction === action.id }">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-semibold">{{ action.name }}</h3>
                  <button @click="workflowStore.removeAction(index)"
                          class="text-red-600 hover:text-red-800 bg-gray-100 rounded-lg p-1">
                    <icon-x class="h-5 w-5"/>
                  </button>
                </div>
                <p class="text-sm text-gray-600">Provider:
                  {{ actionStore.getProviderById(action.type_id, action.provider_id).name }}</p>
                <button @click="editAction(action)"
                        class="mt-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
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
              :action="editingAction"
              @save="saveAction"
              @cancel="closeActionModal"
          />
        </template>
      </Modal>
    </div>
  </layout>
</template>
<style scoped>

</style>