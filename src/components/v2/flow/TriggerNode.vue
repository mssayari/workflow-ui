<script setup>
import {Handle, Position, useVueFlow} from '@vue-flow/core'
import {IconPlus, IconEdit} from '@tabler/icons-vue'
import {useWorkflowStore} from "@/stores/workflow.js";
import {useActionStore} from "@/stores/action.js";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
})

const {updateNodeData, getConnectedEdges} = useVueFlow()

const workflowStore = useWorkflowStore()
const actionStore = useActionStore()


</script>

<template>
  <div class="workflow-node flex flex-col items-center gap-2 trigger-node relative">
    <div class="bg-gray-700 text-white p-3 rounded-lg shadow-lg w-64">
      <h3 class="font-semibold mb-2">Trigger</h3>
      <p class="text-sm">{{ workflowStore.triggers[workflowStore.workflow.trigger.type] || '' }}</p>
      <div class="flex items-center gap-1 pt-2">
        <button @click="workflowStore.openWorkflowModal()"
                class="px-3 py-1 bg-gray-800 hover:bg-gray-900 rounded text-sm flex items-center gap-1">
          <icon-edit class="h-4 w-4"/>
          Edit
        </button>
      </div>
    </div>
    <button v-if="!workflowStore.workflow.actions.length" @click="workflowStore.openActionModal()"
            class="absolute rounded-full p-1 left-1/2 transform -translate-x-1/2 -bottom-3 bg-white hover:bg-gray-100 border border-gray-200">
      <icon-plus class="h-5 w-5 text-gray-500 hover:text-gray-700 shrink-0"/>
    </button>
  </div>
</template>

<style scoped>

</style>