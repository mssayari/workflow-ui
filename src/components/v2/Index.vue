<script setup>
import {onMounted} from "vue";
import {useWorkflowStore} from "@/stores/workflow.js";
import Layout from "@/components/v2/Layout.vue";
import {IconTransform, IconEdit, IconTrash} from "@tabler/icons-vue";
import {useActionStore} from "@/stores/action.js";

const workflowStore = useWorkflowStore()
const actionStore = useActionStore()

onMounted(() => {
  workflowStore.fetchConnections()
  workflowStore.fetchApps()
  workflowStore.fetchWorkflows()
  actionStore.fetchActions()

  // reset workflow store


});
</script>

<template>
  <layout>
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
      <li v-for="workflow in workflowStore.workflows" :key="workflow.id"
          class="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm duration-300">
        <div class="bg-gray-100 rounded-t-lg flex justify-between items-center gap-1 p-2.5">
          <div>
            <h2 class="text-lg font-medium text-gray-800 capitalize">{{ workflow.name }}</h2>
            <p class="text-xs text-gray-500">Created on {{ new Date(workflow.created_at).toLocaleDateString() }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button @click="workflowStore.deleteWorkflow(workflow.id)"
                    class="cursor-pointer text-red-500 hover:text-red-700 p-1 bg-white rounded-lg border border-gray-200">
              <IconTrash class="w-4 h-4"/>
            </button>
            <button @click="workflowStore.editWorkflow(workflow.id)"
                    class="text-gray-500 hover:text-gray-700 p-1 bg-white rounded-lg border border-gray-200">
              <IconEdit class="w-4 h-4"/>
            </button>
          </div>
        </div>
        <div class="p-3 text-sm text-gray-600">
          <ul class="divide-y divide-gray-200">
            <li class="p-1 py-3 flex items-center justify-between">
              <span>Trigger</span>
              <div v-if="workflow.triggers.length">
                <span>{{ workflow.triggers[0].trigger.app.name }}</span>
                <span class="text-sm">({{ workflow.triggers[0].trigger.name }})</span>
              </div>
              <span v-else class="text-gray-400">No trigger set</span>
            </li>
            <li class="p-1 py-3 flex items-center justify-between">
              <span>Number of Actions</span>
              <span>{{ workflow.actions_count }}</span>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </layout>
</template>

<style scoped>

</style>