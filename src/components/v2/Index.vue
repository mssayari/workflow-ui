<script setup>
import {onMounted} from "vue";
import {useWorkflowStore} from "@/stores/workflow.js";
import Layout from "@/components/v2/Layout.vue";
import { IconTransform, IconEdit, IconTrash } from "@tabler/icons-vue";
import {useActionStore} from "@/stores/action.js";

const workflowStore = useWorkflowStore()
const actionStore = useActionStore()

onMounted(() => {
  workflowStore.fetchWorkflowTriggers()
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
        <div class="bg-gray-100 rounded-t-lg flex justify-between items-center gap-1 p-4">
          <div class="flex items-center gap-2">
            <span class="p-1 bg-white border border-gray-200 rounded-lg">
              <icon-transform class="text-gray-500 w-5 h-5"/>
            </span>
            <div>
              <h2 class="text-lg font-medium text-gray-800 capitalize">{{ workflow.name }}</h2>
              <p class="text-xs text-gray-500">Created on {{ new Date(workflow.created_at).toLocaleDateString() }}</p>
            </div>
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
        <div class="p-4 text-sm text-gray-600">
          <ul class="divide-y divide-gray-200">
            <li class="p-1 py-3 flex items-center justify-between">
              <span>Trigger type</span>
              <span> {{ workflowStore.triggers[workflow.trigger.type]}}</span>
            </li>
            <li class="p-1 py-3 flex items-center justify-between">
              <span>Number of Actions</span>
              <span>{{ workflow.actions.length }}</span>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </layout>
</template>

<style scoped>

</style>