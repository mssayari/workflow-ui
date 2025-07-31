<script setup>
import { ref, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import AISchemaBuilder from './AISchemaBuilder.vue';
import { IconTrash } from '@tabler/icons-vue'

const props = defineProps({
  value: {
    type: Array,
    default: () => []
  },
  isNestedObject: Boolean, // optional flag for UI rendering
});

const emit = defineEmits(['update:value']);
const localFields = ref([...props.value]);

watch(localFields, (val) => {
  emit('update:value', val);
}, { deep: true });

const typeOptions = ['string', 'number', 'boolean', 'array', 'object'];

const addField = () => {
  localFields.value.push({
    id: uuidv4(),
    key: '',
    type: 'string',
    description: ''
  });
};

const removeField = (index) => {
  localFields.value.splice(index, 1);
};

const addNestedProperty = (field) => {
  if (!field.properties) field.properties = [];
  field.properties.push({
    id: uuidv4(),
    key: '',
    type: 'string',
    description: ''
  });
};

const removeNestedProperty = (field, index) => {
  field.properties.splice(index, 1);
};

const setArrayItem = (field) => {

  field.items = [];

  // allow only one item
  if (field.items.length > 0) {
    console.warn('Array item already defined');
    return;
  }

  field.items.push({
    id: uuidv4(),
    key: '',
    type: 'string',
    description: ''
  });
};
</script>

<template>
  <div class="space-y-4 border border-gray-300 p-4 rounded-md bg-white">
    <div
        v-for="(field, index) in localFields"
        :key="field.id"
        class="border p-3 rounded bg-gray-50 space-y-2"
    >
      <div class="w-full flex flex-col sm:flex-row gap-2 items-start sm:items-center">

        <div class="flex-1 flex flex-col gap-2">
          <div class="flex gap-1">
            <input v-model="field.key" placeholder="Key" class="px-2 py-1 border rounded w-full" />
            <select v-model="field.type" class="px-2 py-1 border rounded w-full">
              <option v-for="type in typeOptions" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
          <input v-model="field.description" placeholder="Description" class="px-2 py-1 border rounded w-full" />
        </div>
        <button @click.prevent="removeField(index)" class="text-red-500 text-sm">
          <icon-trash class="w-5 h-5" />
        </button>
      </div>

      <!-- object -->
      <div v-if="field.type === 'object'" class="ml-4 space-y-2">
        <a-i-schema-builder
            v-model:value="field.properties"
            :isNestedObject="true"
        />
<!--        <button-->
<!--            @click.prevent="addNestedProperty(field)"-->
<!--            class="text-sm mt-1 px-2 py-1 bg-gray-600 text-white rounded"-->
<!--        >Add Property</button>-->
      </div>

      <!-- array -->
      <div v-if="field.type === 'array'" class="ml-4">
        <div v-if="field.items">
          <a-i-schema-builder
              v-model:value="field.items"
              :isNestedObject="false"
          />
        </div>
        <div v-else>
          <button
              @click.prevent="setArrayItem(field)"
              class="text-sm px-2 py-1 bg-gray-600 text-white rounded"
          >Define Array Type</button>
        </div>
      </div>
    </div>

    <button @click.prevent="addField" v-if="isNestedObject" class="text-sm px-4 py-2 bg-blue-500 text-white rounded">
      Add Field
    </button>
  </div>
</template>