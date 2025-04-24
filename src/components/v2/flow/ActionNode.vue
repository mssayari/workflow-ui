<script setup>
import {Handle, Position, useVueFlow} from '@vue-flow/core'
import {IconPlus, IconX, IconEdit, IconCirclePlus2} from '@tabler/icons-vue'
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

function onSelect(color) {
  updateNodeData(props.id, {color, isGradient: false})

  const connectedEdges = getConnectedEdges(props.id)
  for (const edge of connectedEdges) {
    edge.style = {
      stroke: color,
    }
  }
}


</script>

<template>

  <div class="workflow-node bg-white p-4 shadow-md rounded-lg border border-gray-200 w-64 relative">
    <div class="flex justify-between items-start mb-2">
      <h3 class="font-semibold">{{ data.action.name }}</h3>
      <button @click="workflowStore.removeAction(data.action.id)"
              class="text-red-600 hover:text-red-800 bg-gray-100 rounded-lg p-1">
        <icon-x class="h-5 w-5"/>
      </button>
    </div>
    <p class="text-sm text-gray-600">Provider:
      {{ actionStore.getProviderById(data.action.type_id, data.action.provider_id).name }}</p>
    <div class="flex items-center gap-2 py-2">
      <button @click="workflowStore.openActionModal(data.action)"
              class="p-1 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center gap-1">
        <icon-edit class="h-4 w-4"/>
        <span>Edit</span>
      </button>
      <button @click="workflowStore.openActionModal(data.action,null, true)"
              class="p-1 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center gap-1">
        <icon-circle-plus2 class="h-4 w-4"/>
        <span>Inner action</span>
      </button>
    </div>
    <button v-if="!data.action.on_success" @click="workflowStore.openActionModal(null,data.action.id)"
            class="absolute rounded-full p-1 left-1/2 transform -translate-x-1/2 -bottom-3 bg-white hover:bg-gray-100 border border-gray-200">
      <icon-plus class="h-5 w-5 text-gray-500 hover:text-gray-700 shrink-0"/>
    </button>
  </div>
</template>

<style scoped>

</style>