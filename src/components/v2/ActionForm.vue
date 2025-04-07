<script setup>
import {ref, watch} from 'vue'
import DynamicConfig from './DynamicConfig.vue'
import {initializeConfigFromSchema, getActionTypes, getProviders} from '@/utils/actionFormSchema.js'


const props = defineProps({
  action: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const formData = ref({
  ...props.action
})

const updateConfig = (newConfig) => {
  if (JSON.stringify(formData.value.config) !== JSON.stringify(newConfig)) {
    formData.value.config = newConfig
  }
}

const handleSubmit = () => {

  // remove empty key, values for json fields
  for (const [key, value] of Object.entries(formData.value.config)) {
    if (typeof value === 'object' && value !== null) {
      for (const [k, v] of Object.entries(value)) {
        if (v === '' || v === null) {
          delete formData.value.config[key][k]
        }
      }
    }
  }


  emit('save', {...formData.value})
}


// watch type if it changes, update provider
watch(() => formData.value.type, (newType) => {
  const newProviders = getProviders(newType)
  if (!newProviders.some(provider => provider.value === formData.value.provider)) {
    formData.value.provider = newProviders[0].value
  }
})

// watch provider if it changes, update config
watch(() => formData.value.provider, (newProvider) => {
  const newConfig = initializeConfigFromSchema(formData.value.type, newProvider)
  formData.value.config = {...newConfig}
})


</script>
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="w-full flex items-center justify-between gap-2">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
        <select v-model="formData.type" class="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option v-for="(action,index) in getActionTypes()" :key="index" :value="action.value">
            {{ action.label }}
          </option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Provider</label>
        <select v-model="formData.provider" class="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option v-for="(provider,index) in getProviders(formData.type)" :key="index" :value="provider.value">
            {{ provider.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Dynamic config fields based on action type -->
    <DynamicConfig :type="formData.type" :provider="formData.provider" :config="formData.config"
                   @update:config="updateConfig"/>

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