<script setup>
import {onMounted, onUpdated, ref, watch} from 'vue'
import JsonKeyValueEditor from "@/components/v2/JsonKeyValueEditor.vue";
import JsonFilterEditor from "@/components/v2/JsonFilterEditor.vue";
import JsonTransformEditor from "@/components/v2/JsonTransformEditor.vue";
import JsonDerivedColumnsEditor from "@/components/v2/JsonDerivedColumnsEditor.vue";
import ConditionGroupBuilder from "@/components/v2/ConditionGroupBuilder.vue";


const props = defineProps({
  schema: {
    type: Object,
    required: true
  },
  config: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
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

onUpdated(()=>{
  // console.log(props.schema)
})

onMounted(() => {
  // console.log(props.schema)
})

</script>

<template>
  <div class="space-y-4">
    <template v-for="(field, key) in schema" :key="key">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.title }}</label>

        <!-- Selectable String -->
        <select v-if="field.type === 'string' && field.enum"
                v-model="localConfig[key]"
                class="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option v-for="opt in field.enum" :key="opt" :value="opt">{{ opt }}</option>
        </select>


        <!-- Input field -->
        <input v-else-if="field.type === 'string' || field.type === 'number'"
               v-model="localConfig[key]"
                :type="field.type === 'number' ? 'number' : 'text'"
               :placeholder="field.placeholder"
               class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >

        <!-- Textarea -->
        <textarea v-else-if="field.type === 'textarea' || field.type === 'text'"
                  v-model="localConfig[key]"
                  :placeholder="field.placeholder"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
        ></textarea>

        <!-- JSON Key-Value -->
        <json-key-value-editor v-else-if="field.type === 'json' && field.format === 'key-value'"
                               v-model:value="localConfig[key]" />


        <!-- JSON Condition Builder -->
        <condition-group-builder v-else-if="field.type === 'json' && field.format === 'condition-builder'"
                                v-model:value="localConfig[key]" :schema="field" />

        <!-- JSON Filter -->
        <json-filter-editor v-else-if="field.type === 'json' && field.format === 'filter'"
                            v-model:value="localConfig[key]" :schema="field" />

        <!-- JSON Transform -->
        <json-transform-editor v-else-if="field.type === 'json' && field.format === 'transform'"
                               v-model:value="localConfig[key]" />

        <!-- JSON Derived Columns -->
        <json-derived-columns-editor v-else-if="field.type === 'json' && field.format === 'derived-columns'"
                                     v-model:value="localConfig[key]" />


        <!-- Select -->
        <select v-else-if="field.type === 'select'"
                v-model="localConfig[key]"
                class="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
        </select>

        <!-- Boolean -->
        <div v-else-if="field.type === 'boolean'" class="flex items-center">
          <input type="checkbox" v-model="localConfig[key]" class="mr-2">
          <span>{{ field.title }}</span>
        </div>

        <span class="text-sm text-gray-500 ps-1">{{ field.description }}</span>
        <span v-if="errors['config.'+ key]" class="text-red-500 text-sm">{{ errors['config.'+ key][0] }}</span>
      </div>
    </template>
  </div>
</template>