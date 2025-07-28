<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import DynamicConfig from './DynamicConfig.vue'
import {useActionStore} from "@/stores/action.js";
import {useWorkflowStore} from "@/stores/workflow.js";


const props = defineProps({
  action: [Object, null],
})


const isReady = ref(false)
const workflowStore = useWorkflowStore()
const actionStore = useActionStore()
const emit = defineEmits(['cancel'])

const selectedAppIndex = ref(null)
const selectedActionIndex = ref(null)
const form = ref({
  id: null,
  connection_id: null,
  name: '',
  config: {},
})

const errors = ref({})

const updateConfig = (newConfig) => {
  if (JSON.stringify(form.value.config) !== JSON.stringify(newConfig)) {
    form.value.config = newConfig
  }
}

const handleSubmit = () => {
  // remove empty key, values for json fields
  // for (const [key, value] of Object.entries(formData.value.config)) {
  //   if (typeof value === 'object' && value !== null) {
  //     for (const [k, v] of Object.entries(value)) {
  //       if (v === '' || v === null) {
  //         delete formData.value.config[key][k]
  //       }
  //     }
  //   }
  // }

  // if no action is selected, return
  if (selectedAppIndex.value === null || selectedActionIndex.value === null) {
    console.error('No action selected')
    return
  }

  if (isTriggerAction.value) {
    form.value.trigger_id = workflowStore.apps[selectedAppIndex.value].triggers[selectedActionIndex.value].id
    workflowStore.saveTrigger(form.value).catch(response => {
      errors.value = response.errors
    })
  } else {
    form.value.action_id = workflowStore.apps[selectedAppIndex.value].actions[selectedActionIndex.value].id
    workflowStore.saveAction(form.value).catch(response => {
      // console.log(response)
      errors.value = response.errors
    })
  }


  // emit('save', form.value)
}


const isTriggerAction = ref(false)

const schema = computed(() => {
  if (selectedAppIndex.value === null || selectedActionIndex.value === null) {
    return []
  }
  if (isTriggerAction.value) {
    return workflowStore.apps[selectedAppIndex.value].triggers[selectedActionIndex.value].form_schema
  }
  return workflowStore.apps[selectedAppIndex.value].actions[selectedActionIndex.value].form_schema
})

const initConfig = (bindValues = false) => {
  form.value.config = {}
  for (const item of schema.value) {
    switch (item.type) {
      case 'text':
        form.value.config[item.name] = bindValues ? (props.action?.config[item.name] || item.default) : item.default
        break
      case 'number':
        form.value.config[item.name] = bindValues ? (props.action?.config[item.name] || item.default) : item.default
        break
      case 'boolean':
        form.value.config[item.name] = bindValues ? (props.action?.config[item.name] || false) : false
        break
      case 'json':
        if (item.format === 'condition-builder') {
          form.value.config[item.name] = bindValues ? (props.action?.config[item.name] || []) : []
        } else if (item.format === 'filter') {
          form.value.config[item.name] = bindValues ? (props.action?.config[item.name] || []) : []
        } else if (item.format === 'transformations') {
          form.value.config[item.name] = bindValues ? (props.action?.config[item.name] || []) : []
        } else if (item.format === 'derived-columns') {
          form.value.config[item.name] = bindValues ? (props.action?.config[item.name] || []) : []
        } else {
          form.value.config[item.name] = bindValues ? (props.action?.config[item.name] || {}) : {}
        }
        break
      default:
        form.value.config[item.name] = bindValues ? (props.action?.config[item.name] || item.default) : item.default
    }
  }
}

// on selectedAppIndex change fetch actions for that app
watch(selectedAppIndex, (newIndex) => {
  if (newIndex !== null) {
    selectedActionIndex.value = null
    workflowStore.fetchActions(newIndex, isTriggerAction.value)
  } else {
    console.log('No app selected')
  }
})


watch(selectedActionIndex, (newIndex) => {
  if (newIndex !== null && selectedAppIndex.value !== null) {
    initConfig(true)
  } else {
    console.log('No action selected')
  }

  initConfig(props.action !== null && !workflowStore.isInnerAction)

})


onMounted(() => {

  isTriggerAction.value = workflowStore.isTriggerAction
  let app_id = isTriggerAction.value ? props.action?.trigger?.app_id : props.action?.action?.app_id
  let action_id = isTriggerAction.value ? props.action?.trigger?.id : props.action?.action?.id

  if (props.action !== null && !workflowStore.isInnerAction) {
    form.value = {...props.action}
    selectedAppIndex.value = workflowStore.apps.findIndex(app => app.id === app_id)

    //TODO: should replace with promise based fetch
    setTimeout(() => {
      if (isTriggerAction.value) {
        selectedActionIndex.value = workflowStore.apps[selectedAppIndex.value].triggers.findIndex(action => action.id === action_id)
      } else {
        selectedActionIndex.value = workflowStore.apps[selectedAppIndex.value].actions.findIndex(action => action.id === action_id)
      }
    }, 500)
  } else {
    initConfig()
  }

  isReady.value = true
})

</script>
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4" v-if="isReady">
    <div class="w-full space-y-3">
      <div v-if="!isTriggerAction">
        <label class="block text-sm font-medium text-gray-700 mb-1">Action Name</label>
        <input type="text" v-model="form.name" class="w-full p-2 border border-gray-300 rounded-md"
               placeholder="Enter action name"/>
        <span class="text-sm text-gray-500 ps-1">This name will be used to identify the action in the workflow.</span>
      </div>
      <div class="">
        <label class="block text-sm font-medium text-gray-700 mb-1">App</label>
        <select v-model="selectedAppIndex" class="w-full p-2 border border-gray-300 rounded-md">
          <option v-for="(action,index) in workflowStore.apps" :key="index" :value="index">
            {{ action.name }}
          </option>
        </select>
        <span v-if="selectedAppIndex !== null"
              class="text-sm text-gray-500 ps-1">{{ workflowStore.apps[selectedAppIndex].description }}</span>
      </div>
      <div v-if="selectedAppIndex !== null" class="">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ isTriggerAction ? 'Trigger' : 'Action' }}</label>
        <select v-model="selectedActionIndex" :disabled="!workflowStore.apps[selectedAppIndex]"
                class="w-full p-2 border border-gray-300 rounded-md">
          <option
              v-for="(action,index) in isTriggerAction ? workflowStore.apps[selectedAppIndex]?.triggers : workflowStore.apps[selectedAppIndex]?.actions || []"
              :key="index"
              :value="index">
            {{ action.name }}
          </option>
        </select>
        <span v-if="selectedActionIndex !== null && !isTriggerAction" class="text-sm text-gray-500 ps-1">
          {{ workflowStore.apps[selectedAppIndex].actions[selectedActionIndex].description }}
        </span>
        <span v-if="selectedActionIndex !== null && isTriggerAction" class="text-sm text-gray-500 ps-1">
          {{ workflowStore.apps[selectedAppIndex].triggers[selectedActionIndex].description }}
        </span>
      </div>
      <div v-if="selectedAppIndex !== null && workflowStore.apps[selectedAppIndex].connection_driver !== null"
           class="flex flex-col">
        <label class="block text-sm font-medium text-gray-700 mb-1">Connection</label>
        <select v-model="form.connection_id"
                class="w-full p-2 border border-gray-300 rounded-md">
          <option
              v-for="(connection,index) in workflowStore.getConnectionsByDriver(workflowStore.apps[selectedAppIndex].connection_driver) || []"
              :key="index"
              :value="connection.id">
            {{ connection.name }}
          </option>
        </select>
        <span v-if="selectedActionIndex !== null" class="text-sm text-gray-500 ps-1">
          Select a connection to use for this action.
        </span>
        <span v-if="errors['connection_id']" class="text-red-500 text-sm ps-1">{{ errors['connection_id'][0] }}</span>
      </div>
    </div>

    <!-- Dynamic config fields based on action type -->
    <dynamic-config :config="form.config" @update:config="updateConfig" :schema="schema" :errors="errors"/>

    <div class="flex justify-end gap-3 mt-6">
      <button type="button" @click="$emit('cancel')"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
        Cancel
      </button>
      <button type="submit" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
        Save
      </button>
    </div>
  </form>
</template>