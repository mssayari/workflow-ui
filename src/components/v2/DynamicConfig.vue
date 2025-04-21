<script setup>
import {onMounted, ref, watch} from 'vue'
import JsonItem  from "./JsonItem.vue";


const props = defineProps({
  schema: {
    type: Object,
    required: true
  },
  config: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:config'])

const localConfig = ref({ ...props.config })
const jsonFields = ref({})

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig }
  // initializeJsonFields()
}, { deep: true })


// // Emit config on change
watch(localConfig, (newConfig) => {
  emit('update:config', newConfig)
}, { deep: true, immediate: true })


// Initialize JSON field strings from config
const initializeJsonFields = () => {
  jsonFields.value = {}
  for (const [key, field] of Object.entries(schema.value)) {
    if (field.type === 'json') {
      jsonFields.value[key] = JSON.stringify(localConfig.value[key] || {}, null, 2)
    }
  }
}


onMounted(() => {
})

</script>

<template>
  <div class="space-y-4">
    <template v-for="(field, key) in schema" :key="key">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.title }}</label>

        <!-- Input field -->
        <input v-if="field.type === 'string' || field.type === 'number'"
               v-model="localConfig[key]"
                :type="field.type === 'number' ? 'number' : 'text'"
               :placeholder="field.placeholder"
               class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >

        <!-- Textarea -->
        <textarea v-else-if="field.type === 'textarea'"
                  v-model="localConfig[key]"
                  :placeholder="field.placeholder"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
        ></textarea>

        <json-item v-else-if="field.type === 'json'"
                   v-model:value="localConfig[key]"></json-item>

        <!-- Select -->
        <select v-else-if="field.type === 'select'"
                v-model="localConfig[key]"
                class="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </template>
  </div>
</template>