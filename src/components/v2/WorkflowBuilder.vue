<script setup>
import {ref, onMounted, onBeforeMount, onUnmounted, nextTick, watch} from 'vue'
import {IconPlus, IconX} from '@tabler/icons-vue'
import Modal from './Modal.vue'
import ActionForm from '@/components/v2/ActionForm.vue'
import {useActionStore} from "@/stores/action.js";
import {useWorkflowStore} from "@/stores/workflow.js";
import Layout from "@/components/v2/Layout.vue";
import router from "@/router/router.js";
import {VueFlow, useVueFlow,MarkerType} from '@vue-flow/core'
import {useLayout} from '@/utils/useLayout.js'
import ActionNode from "@/components/v2/flow/ActionNode.vue";
import TriggerNode from "@/components/v2/flow/TriggerNode.vue";


const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const isReady = ref(false)
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


const updateActionChaining = () => {
  workflowStore.workflow.actions.forEach((action, i) => {
    if (i < workflowStore.workflow.actions.length - 1) {
      action.onSuccess = workflowStore.workflow.actions[i + 1].id
    } else {
      action.onSuccess = null
    }
  })
}


// VueFlow
const {layout} = useLayout()
const {fitView} = useVueFlow()


// create nodes from workflowStore.workflow.actions

const generateNodesAndEdges = () => {
  nodes.value = workflowStore.workflow.actions.map((action, index) => ({
    id: action.id,
    type: 'action',
    position: {x: 0, y: 0},
    data: {
      label: action.name,
      action: action
    },
  }))

  // add a trigger node at the beginning
  nodes.value.unshift({
    id: 'trigger',
    type: 'trigger',
    position: {x: 0, y: 0},
    data: {
      label: workflowStore.triggers[workflowStore.workflow.trigger.type] || '',
      node: workflowStore.workflow.trigger
    },
  })

  // action's on_success property is the id of the next action. so we can use it to create edges
  edges.value = workflowStore.workflow.actions.map((action, index) => {
    if (action.on_success) {
      return {
        id: `${action.id}->${action.on_success}`,
        source: action.id,
        target: action.on_success,
        data: {
          hello: 'world',
        },
        style: { stroke: '#4a5565' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#4a5565',
        },
      }
    } else {
      return undefined
    }
  }).filter(edge => edge !== undefined)

  // add edges from trigger to the action that it's id is in any on_success
  if (workflowStore.workflow.actions.length) {
    const chain_ids = workflowStore.workflow.actions.map(action => action.on_success).filter(id => id !== null)
    const firstAction = workflowStore.workflow.actions.find(action => !chain_ids.includes(action.id))

    if (firstAction && firstAction.id) {
      edges.value.unshift({
        id: `trigger->${firstAction.id}`,
        source: 'trigger',
        target: firstAction.id,
        data: {
          hello: 'world',
        },
        style: { stroke: '#4a5565' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#4a5565',
        },
      })
    }
  }
}


const nodes = ref([
  // an input node, specified by using `type: 'input'`
  {
    id: '1',
    position: {x: 0, y: 0},
    // all nodes can have a data object containing any data you want to pass to the node
    // a label can property can be used for default nodes
    data: {label: 'Node 1'},
  }
])

// these are our edges
const edges = ref([
  // default bezier edge
  // consists of an edge id, source node id and target node id
  {
    id: 'e1->2',
    source: '1',
    target: '2',

  },
  // a custom edge, specified by using a custom type name
  // we choose `type: 'special'` for this example
  {
    id: 'e2->3',
    source: '2',
    target: '3',

    // all edges can have a data object containing any data you want to pass to the edge
    data: {
      hello: 'world',
    }
  },
])


// watch for changes in the workflowStore.workflow and update the nodes and edges
watch(() => workflowStore.workflow, (newWorkflow) => {
  if (newWorkflow) {
    generateNodesAndEdges()
    setTimeout(() => {
      layoutGraph('TB')
    }, 100)
  }
}, {deep: true})

async function layoutGraph(direction) {
  nodes.value = layout(nodes.value, edges.value, direction)

  nextTick(() => {
    fitView({maxZoom: 1, offset: {x: 0, y: -250}})
  })
}

onMounted(() => {
  if (!workflowStore.workflow) {
    router.push({name: 'index'})
  } else {
    generateNodesAndEdges();
    isReady.value = true
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
            <button @click="workflowStore.openWorkflowModal()"
                    class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Config
            </button>
          </div>
          <pre class="p-4 text-green-400 overflow-auto h-[calc(100%-4rem)]">{{ workflowStore.prettyWorkflow }}</pre>
        </div>
      </div>

      <!-- Right side: Workflow Graph -->
      <div class="w-2/3 p-4">
        <div class="h-full bg-gray-50 rounded-lg py-2">

          <VueFlow v-if="isReady" :nodes="nodes" :edges="edges" @nodes-initialized="layoutGraph('TB')">

            <template #node-action="props">
              <action-node :id="props.id" :data="props.data"/>
            </template>
            <template #node-trigger="props">
              <trigger-node :id="props.id" :data="props.data"/>
            </template>
          </VueFlow>
        </div>
      </div>
    </div>
  </layout>
</template>
<style>
@reference "tailwindcss";

@import '@vue-flow/core/dist/style.css';

.vue-flow__node-action.selected .workflow-node {
  @apply border-gray-400
}
</style>