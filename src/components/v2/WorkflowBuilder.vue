<script setup>
import {ref, onMounted, onBeforeMount, onUnmounted, nextTick, watch} from 'vue'
import {useWorkflowStore} from "@/stores/workflow.js";
import Layout from "@/components/v2/Layout.vue";
import router from "@/router/router.js";
import {VueFlow, useVueFlow, MarkerType} from '@vue-flow/core'
import {useLayout} from '@/utils/useLayout.js'
import GroupActionNode from "@/components/v2/flow/GroupActionNode.vue";
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


// VueFlow
const {layout} = useLayout()
const {fitView} = useVueFlow()

const nodes = ref([])
const edges = ref([])

// create nodes from workflowStore.workflow.actions

const generateNodesAndEdges = () => {
  nodes.value = []
  edges.value = []
  // add a trigger nodes at the beginning
  workflowStore.workflow.triggers.map((trigger) => {
    nodes.value.push({
      id: trigger.id,
      type: 'trigger',
      position: {x: 0, y: 0},
      data: {
        label: trigger.trigger.app.name + ' - ' + trigger.trigger.name,
        trigger: trigger
      },
    })
  })


  workflowStore.workflow.actions.map((action) => {
    nodes.value.push({
      id: action.id,
      type: action.actions_count > 0 ? 'group-action' : 'action',
      expandParent: action.actions_count === 0,
      parentNode: action.parent_id,
      position: {x: 0, y: 0},
      data: {
        label: action.name,
        action: action
      },
    })
  })


  // action's on_success property is the id of the next action. so we can use it to create edges
  workflowStore.workflow.actions.map((action) => {
    if (action.on_success) {
      edges.value.push({
        id: `${action.id}->${action.on_success}`,
        source: action.id,
        target: action.on_success,
        data: {
          hello: 'world',
        },
        style: {stroke: '#4a5565'},
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#4a5565',
        },
      })
    }
  })

  // add edges from trigger to the action that it's id is not in any on_success
  if (workflowStore.workflow.actions.length) {
    const chain_ids = workflowStore.workflow.actions.map(action => action.on_success).filter(id => id !== null)
    const firstAction = workflowStore.workflow.actions.find(action => !chain_ids.includes(action.id))

    if (firstAction && firstAction.id) {
      // find the trigger node
      const triggerNodes = nodes.value.filter(node => node.type === 'trigger');
      // console.log(triggerNodes)
      triggerNodes.map(triggerNode => {
        edges.value.unshift({
          id: `${triggerNode.id}->${firstAction.id}`,
          source: triggerNode.id,
          target: firstAction.id,
          data: {
            hello: 'world',
          },
          style: {stroke: '#4a5565'},
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#4a5565',
          },
        })

      });
    }
  }

}


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
    <div class="flex h-full bg-gray-900" v-if="workflowStore.workflow">
      <!-- Left side: JSON Preview -->
      <div class="w-1/3 p-4 h-full">
        <div class="bg-gray-800 rounded-lg h-full">
          <div class="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 class="text-white text-lg font-semibold">Workflow JSON</h2>
            <button @click="workflowStore.openWorkflowModal()"
                    class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Edit Workflow
            </button>
          </div>
          <pre class="p-4 text-sm text-green-400 overflow-auto h-[calc(100%-4rem)]">{{
              workflowStore.prettyWorkflow
            }}</pre>
        </div>
      </div>

      <!-- Right side: Workflow Graph -->
      <div class="w-2/3 p-4">
        <div class="h-full bg-gray-50 rounded-lg py-2">
          <VueFlow v-if="isReady && workflowStore.workflow.triggers.length" :nodes="nodes" :edges="edges"
                   @nodes-initialized="layoutGraph('TB')">

            <template #node-group-action="props">
              <group-action-node :id="props.id" :data="props.data"/>
            </template>

            <template #node-action="props">
              <action-node :id="props.id" :data="props.data"/>
            </template>
            <template #node-trigger="props">
              <trigger-node :id="props.id" :data="props.data"/>
            </template>
          </VueFlow>
          <div v-else class="flex items-center justify-center h-full">
            <p class="text-gray-500">No workflow trigger found. Please add a trigger to start building your
              workflow.</p>
          </div>
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