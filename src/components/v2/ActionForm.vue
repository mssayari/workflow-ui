<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import DynamicConfig from './DynamicConfig.vue'
import {useActionStore} from "@/stores/action.js";


const props = defineProps({
  action: [Object, null],
})


const isReady = ref(false)
const actionStore = useActionStore()
const emit = defineEmits(['save', 'cancel'])

const selectedActionIndex = ref(0)
const selectedProviderIndex = ref(0)
const form  = ref({
  id: null,
  name: '',
  type_id: 0,
  provider_id: 0,
  config: {}
})

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

  form.value.type_id = actionStore.actions[selectedActionIndex.value].id
  form.value.provider_id = actionStore.actions[selectedActionIndex.value].providers[selectedProviderIndex.value].id

  emit('save', form.value)
}


const schema = computed(() => {
  return actionStore.actions[selectedActionIndex.value].providers[selectedProviderIndex.value].form_schema.properties
})

const initConfig = () => {
  console.log('init called!')
  form.value.config = {}

  for (const [key, value] of Object.entries(schema.value)) {
    switch (value.type) {
      case 'string':
        form.value.config[key] = props.action?.config[key] || ''
        break
      case 'number':
        form.value.config[key] = props.action?.config[key] || 0
        break
      case 'boolean':
        form.value.config[key] = props.action?.config[key] || false
        break
      case 'json':
        form.value.config[key] = props.action?.config[key] || {}
        break
      default:
        form.value.config[key] = props.action?.config[key] || null
    }
  }
}

// watch selectedActionIndex and selectedProviderIndex if they change, update config
watch([selectedActionIndex, selectedProviderIndex], ([newActionIndex, newProviderIndex]) => {
  initConfig()
})


onMounted(() => {

  if (props.action !== null){
    form.value = {...props.action}
    selectedActionIndex.value = actionStore.actions.findIndex(action => action.id === form.value.type_id)
    selectedProviderIndex.value = actionStore.actions[selectedActionIndex.value].providers.findIndex(provider => provider.id === form.value.provider_id)
  }else{
    initConfig()
  }

  isReady.value = true
})

</script>
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4" v-if="isReady">
    <div class="w-full space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Action Name</label>
        <input type="text" v-model="form.name" class="w-full p-2 border border-gray-300 rounded-md"
               placeholder="Enter action name"/>
        <span class="text-sm text-gray-500 ps-1">This name will be used to identify the action in the workflow.</span>
      </div>
      <div class="">
        <label class="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
        <select v-model="selectedActionIndex" class="w-full p-2 border border-gray-300 rounded-md">
          <option v-for="(action,index) in actionStore.actions" :key="index" :value="index">
            {{ action.name }}
          </option>
        </select>
        <span class="text-sm text-gray-500 ps-1">{{ actionStore.actions[selectedActionIndex].description }}</span>
      </div>
      <div class="">
        <label class="block text-sm font-medium text-gray-700 mb-1">Provider</label>
        <select v-model="selectedProviderIndex" :disabled="!actionStore.actions[selectedActionIndex]"
                class="w-full p-2 border border-gray-300 rounded-md">
          <option v-for="(provider,index) in actionStore.actions[selectedActionIndex]?.providers || []" :key="index"
                  :value="index">
            {{ provider.name }}
          </option>
        </select>
        <span
            class="text-sm text-gray-500 ps-1">{{
            actionStore.actions[selectedActionIndex].providers[selectedProviderIndex].description
          }}</span>
      </div>
    </div>

    <!-- Dynamic config fields based on action type -->
    <dynamic-config :config="form.config" @update:config="updateConfig" :schema="schema"/>

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