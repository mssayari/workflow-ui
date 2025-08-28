<script setup>
import {ref, watch} from "vue"
import ArrayEditor from "@/components/v2/ArrayEditor.vue"
import SchemaField from "./SchemaField.vue"
import {IconEye, IconEyeClosed} from '@tabler/icons-vue'
import JsonKeyValueEditor from "@/components/v2/JsonKeyValueEditor.vue";
import ConditionGroupBuilder from "@/components/v2/ConditionGroupBuilder.vue";
import AISchemaBuilder from "@/components/v2/AISchemaBuilder.vue";
import JsonFilterEditor from "@/components/v2/JsonFilterEditor.vue";
import JsonTransformEditor from "@/components/v2/JsonTransformEditor.vue";
import JsonDerivedColumnsEditor from "@/components/v2/JsonDerivedColumnsEditor.vue";

const props = defineProps({
  field: {type: Object, required: true},
  modelValue: {type: [Object, Array, String, Number, Boolean], default: null},
  errors: {type: Object, default: () => ({})},
  path: {type: String, default: ''}
})

const emit = defineEmits(['update:modelValue'])

const defaultByType = {
  object: {},
  array: [],
  boolean: false,
  number: 0,
  string: "",
  email: "",
  url: "",
  password: "",
  text: "",
  textarea: "",
}

function getDefaultValue(field, modelValue) {
  if (modelValue !== undefined && modelValue !== null) return modelValue
  return defaultByType[field.type] ?? null
}

// Add this in your <script setup> section
function onFileChange(event) {
  const files = event.target.files;
  localValue.value = files[0];
}

const localValue = ref(getDefaultValue(props.field, props.modelValue))

const showPassword = ref(false)

watch(localValue, (val) => emit("update:modelValue", val), {deep: true})
watch(() => props.modelValue, (val) => localValue.value = val, {deep: true})
</script>

<template>
  <div class="mb-4">
    <label v-if="field.type !== 'boolean'" class="block text-sm font-medium mb-1">{{ field.label }}</label>

    <!-- string -->
    <template v-if="field.type === 'string'">
      <!-- email -->
      <input v-if="field.format === 'email'"
             v-model="localValue"
             type="email"
             :placeholder="field.placeholder || 'example@email.test'"
             class="border border-gray-300 rounded px-2 py-1 w-full"/>

      <!-- url -->
      <input v-else-if="field.format === 'url'"
             v-model="localValue"
             type="url"
             :placeholder="field.placeholder || 'https://example.com'"
             spellcheck="false"
             pattern="https?://.*"
             class="border border-gray-300 rounded px-2 py-1 w-full"/>

      <!-- password -->
      <div v-else-if="field.format === 'password'" class="relative">
        <input v-model="localValue"
               :type="showPassword ? 'text' : 'password'"
               :placeholder="field.placeholder"
               class="border border-gray-300 rounded px-2 py-1 w-full pr-8"/>
        <button type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"
                tabindex="-1">
          <icon-eye v-if="showPassword" class="h-5 w-5"/>
          <icon-eye-closed v-else class="h-5 w-5"/>
        </button>
      </div>

      <!-- textarea -->
      <textarea v-else-if="field.format === 'textarea' "
                v-model="localValue"
                :placeholder="field.placeholder"
                class="border border-gray-300 rounded px-2 py-1 w-full"></textarea>

      <!-- plain string (default) -->
      <input v-else
             v-model="localValue"
             type="text"
             :placeholder="field.placeholder"
             class="border border-gray-300 rounded px-2 py-1 w-full"/>
    </template>

    <!-- number -->
    <input v-else-if="field.type === 'number'"
           v-model="localValue"
           type="number"
           :placeholder="field.placeholder"
           class="border border-gray-300 rounded px-2 py-1 w-full"/>

    <!-- select -->
    <select v-else-if="field.type === 'select'"
            v-model="localValue"
            class="border border-gray-300 rounded px-2 py-2 w-full">
      <option v-for="opt in field.options"
              :key="typeof opt === 'object' ? opt.value : opt"
              :value="typeof opt === 'object' ? opt.value : opt">
        {{ typeof opt === 'object' ? opt.label : opt }}
      </option>
    </select>

    <!-- boolean -->
    <label v-else-if="field.type === 'boolean'" class="flex items-center">
      <input type="checkbox" v-model="localValue" class="mr-2"/>
      {{ field.label }}
    </label>

    <!-- Add this in your template where other field types are handled -->
    <template v-else-if="field.type === 'file'">
      <input
          type="file"
          @change="onFileChange"
          class="border border-gray-300 rounded px-2 py-1 w-full"
      />
      <div v-if="localValue && localValue.path" class="mt-2">
        Selected File:
        <a :href="localValue.path" target="_blank" class="text-blue-500 hover:underline">
          {{ localValue.name }}
        </a>
      </div>

    </template>

    <!-- array -->
    <array-editor v-else-if="field.type === 'array'" v-model:value="localValue" :schema="field"
                  :key="field.name +'-'+Math.random()" :errors="errors" :path="path"/>

    <!-- JSON Key-Value -->
    <json-key-value-editor v-else-if="field.type === 'json' && field.format === 'key-value'"
                           v-model:value="localValue"/>

    <!-- JSON Condition Builder -->
    <condition-group-builder v-else-if="field.type === 'json' && field.format === 'condition-builder'"
                             v-model:value="localValue" :schema="field"/>

    <!-- AI Schema Builder -->
    <a-i-schema-builder v-else-if="field.type === 'json' && field.format === 'ai-schema-builder'"
                        v-model:value="localValue" :schema="field" :is-nested-object="true"/>

    <!-- JSON Filter -->
    <json-filter-editor v-else-if="field.type === 'json' && field.format === 'filter'"
                        v-model:value="localValue" :schema="field"/>

    <!-- JSON Transform -->
    <json-transform-editor v-else-if="field.type === 'json' && field.format === 'transformations'"
                           v-model:value="localValue" :schema="field"/>

    <!-- JSON Derived Columns -->
    <json-derived-columns-editor v-else-if="field.type === 'json' && field.format === 'derived-columns'"
                                 v-model:value="localValue"/>

    <!-- object (recursive rendering) -->
    <div v-else-if="field.type === 'object'" class="border border-gray-500 rounded p-3 space-y-2">
      <div v-for="prop in field.properties" :key="prop.name">
        <schema-field
            :field="prop"
            v-model="localValue[prop.name]"
            :errors="errors?.[prop.name] ?? {}"/>
      </div>
    </div>

    <!-- error -->
    <div v-if="errors[path]" class="text-red-500 text-sm">
      {{ errors[path] }}
    </div>
    <span class="text-sm text-gray-500">{{ field.description }}</span>
  </div>
</template>