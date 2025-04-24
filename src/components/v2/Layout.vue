<script setup>
import {onBeforeMount, onMounted} from "vue";
import {useWorkflowStore} from "@/stores/workflow.js";
import {useRoute} from "vue-router";
import {IconPlus, IconTransform} from "@tabler/icons-vue";
import Modal from "@/components/v2/Modal.vue";
import WorkflowForm from "@/components/v2/WorkflowForm.vue";
import ActionForm from "@/components/v2/ActionForm.vue";

const route = useRoute()
const workflowStore = useWorkflowStore();

onMounted(() => {
  workflowStore.fetchWorkflows();
});

onBeforeMount(() => {

});

</script>

<template>
  <div class="flex items-center justify-between bg-gray-800 p-4 shadow-md">
    <h1 class="text-white text-2xl">Workflow Management</h1>

    <router-link v-if="route.name !== 'index'" class="bg-blue-500 hover:bg-blue-600 duration-300 cursor-pointer
    text-white px-4 py-2 rounded flex items-center gap-1"
                 :to="{name:'index'}">
      <icon-transform class=" w-4 h-4"/>
      Workflows
    </router-link>
    <button v-else @click="workflowStore.openWorkflowModal()" class="bg-blue-500 hover:bg-blue-600 duration-300 cursor-pointer
    text-white px-4 py-2 rounded flex items-center gap-1">
      <icon-plus class="w-4 h-4"/>
      <span>New Workflow</span>
    </button>
  </div>
  <main class="w-full">
    <slot/>
  </main>

  <!-- Workflow Modal -->
  <Modal v-if="workflowStore.isWorkflowModalOpen" @close="workflowStore.closeWorkflowModal()">
    <template #header>
      <h3 class="text-lg font-medium">{{ workflowStore.workflow.id ? 'Edit Workflow' : 'Create Workflow' }}</h3>
    </template>
    <template #body>
      <workflow-form @close="workflowStore.closeWorkflowModal()"/>
    </template>
  </Modal>

  <!-- Action Modal -->
  <Modal v-if="workflowStore.isActionsModalOpen" @close="workflowStore.closeActionModal()">
    <template #header>
      <h3 class="text-lg font-medium">
        {{ workflowStore.selectedAction ? 'Edit Action' : 'Add New Action' }}
      </h3>
    </template>

    <template #body>
      <ActionForm
          :action="workflowStore.selectedAction"
          @save="workflowStore.saveAction"
          @cancel="workflowStore.closeActionModal()"
      />
    </template>
  </Modal>

</template>

<style scoped>

</style>