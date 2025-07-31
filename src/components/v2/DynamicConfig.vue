<script setup>
import {onMounted, onUpdated, ref, watch} from 'vue'
import JsonKeyValueEditor from "@/components/v2/JsonKeyValueEditor.vue";
import JsonFilterEditor from "@/components/v2/JsonFilterEditor.vue";
import JsonTransformEditor from "@/components/v2/JsonTransformEditor.vue";
import JsonDerivedColumnsEditor from "@/components/v2/JsonDerivedColumnsEditor.vue";
import ConditionGroupBuilder from "@/components/v2/ConditionGroupBuilder.vue";
import ArrayEditor from "@/components/v2/ArrayEditor.vue";
import { IconEye, IconEyeClosed } from '@tabler/icons-vue'
import AISchemaBuilder from "@/components/v2/AISchemaBuilder.vue";


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

const showPassword = ref({})

const togglePassword = (fieldName) => {
  showPassword.value[fieldName] = !showPassword.value[fieldName]
}


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
  // console.log(props.config)
})

</script>

<template>
  <div class="space-y-4">
    <template v-for="(field, index) in schema" :key="index">
      <div>
        <label v-if="field.type !== 'boolean'" class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}</label>

        <!-- Selectable String -->
        <select v-if="field.type === 'string' && field.enum"
                v-model="localConfig[field.name]"
                class="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option v-for="opt in field.enum" :key="opt" :value="opt">{{ opt }}</option>
        </select>


        <!-- Input field -->
        <input v-else-if="field.type === 'string' || field.type === 'number'"
               v-model="localConfig[field.name]"
                :type="field.type === 'number' ? 'number' : 'text'"
               :placeholder="field.placeholder"
               class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >

        <!-- Textarea -->
        <textarea v-else-if="field.type === 'textarea' || field.type === 'text'"
                  v-model="localConfig[field.name]"
                  :placeholder="field.placeholder"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
        ></textarea>

        <!-- JSON Key-Value -->
        <array-editor v-else-if="field.type === 'array'" v-model:value="localConfig[field.name]" :schema="field" />

        <!-- JSON Key-Value -->
        <json-key-value-editor v-else-if="field.type === 'json' && field.format === 'key-value'"
                               v-model:value="localConfig[field.name]" />


        <!-- JSON Condition Builder -->
        <condition-group-builder v-else-if="field.type === 'json' && field.format === 'condition-builder'"
                                v-model:value="localConfig[field.name]" :schema="field" />

        <!-- AI Schema Builder -->
        <a-i-schema-builder v-else-if="field.type === 'json' && field.format === 'ai-schema-builder'"
                               v-model:value="localConfig[field.name]" :schema="field" :is-nested-object="true" />

        <!-- JSON Filter -->
        <json-filter-editor v-else-if="field.type === 'json' && field.format === 'filter'"
                            v-model:value="localConfig[field.name]" :schema="field" />

        <!-- JSON Transform -->
        <json-transform-editor v-else-if="field.type === 'json' && field.format === 'transformations'"
                               v-model:value="localConfig[field.name]" :schema="field"/>

        <!-- JSON Derived Columns -->
        <json-derived-columns-editor v-else-if="field.type === 'json' && field.format === 'derived-columns'"
                                     v-model:value="localConfig[field.name]" />

        <!-- Select -->
        <select v-else-if="field.type === 'select'"
                v-model="localConfig[field.name]"
                class="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option v-for="opt in field.options" :key="typeof opt === 'object' ? opt.value : opt" :value="typeof opt === 'object' ? opt.value : opt">
            {{ typeof opt === 'object' ? opt.label : opt }}
          </option>
        </select>

        <!-- Boolean -->
        <div v-else-if="field.type === 'boolean'" class="flex items-center">
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" v-model="localConfig[field.name]" class="mr-2"/>
            <span>{{ field.label }}</span>
          </label>
        </div>

        <!-- Password -->
        <div v-else-if="field.type === 'password'" class="relative">
          <input
              v-model="localConfig[field.name]"
              :type="showPassword[field.name] ? 'text' : 'password'"
              :placeholder="field.placeholder"
              class="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
          />
          <button
              type="button"
              @click="togglePassword(field.name)"
              class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
              tabindex="-1"
          >
            <icon-eye v-if="showPassword[field.name]" class="h-5 w-5" />
            <icon-eye-closed v-else class="h-5 w-5" />
          </button>
        </div>
        <div><span v-if="errors['config.'+ field.name]" class="text-red-500 text-sm">{{ errors['config.'+ field.name][0] }}</span></div>
        <span class="text-sm text-gray-500 ps-1">{{ field.description }}</span>

      </div>
    </template>
  </div>
</template>