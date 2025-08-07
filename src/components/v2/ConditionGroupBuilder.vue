<script setup>
import { ref, watch, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { IconTrash } from '@tabler/icons-vue';
import ConditionGroupBuilder from './ConditionGroupBuilder.vue';

const props = defineProps({
  value: {
    type: Object,
    default: () => ({ logic: 'AND', conditions: [], groups: [] })
  },
  schema: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:value'])

// Local state to manage the group structure without referencing the prop directly

const localGroup = ref({
  logic: props.value.logic || 'AND',
  conditions: props.value.conditions || [],
  groups: props.value.groups || []
});

watch(localGroup, (val) => {

  // skip if it's empty
  if (Object.keys(val).length === 0) {
    return;
  }

  // or if it has no conditions or groups
  if ((val.conditions && val.conditions.length === 0) && (val.groups && val.groups.length === 0)) {
    return;
  }

  emit('update:value', val);
}, { deep: true });

const operatorOptions = ref([]);

const setOperators = () => {
  if (props.schema.items?.properties?.conditions.items.properties.operator.options) {
    operatorOptions.value = props.schema.items.properties.conditions.items.properties.operator.options;
  }
};

onMounted(() => {
  // console.log(props.schema.items.properties.conditions.items.properties.operator.enum)
  setOperators();
});

const addCondition = () => {
  localGroup.value.conditions.push({
    id: uuidv4(),
    column: '',
    operator: '=',
    value: '',
    not: false,
    case_sensitive: false
  });
};

const removeCondition = (id) => {
  localGroup.value.conditions = localGroup.value.conditions.filter(c => c.id !== id);
};

const updateCondition = (id, key, value) => {
  const cond = localGroup.value.conditions.find(c => c.id === id);
  if (cond) cond[key] = value;
};

const addGroup = () => {
  localGroup.value.groups.push({
    logic: 'AND',
    conditions: [],
    groups: []
  });
};

const removeGroup = (index) => {
  localGroup.value.groups.splice(index, 1);
};

const operatorRequiresValue = (operator) => {
  return !['empty', 'not_empty', 'is_array', 'is_object'].includes(operator);
};
</script>

<template>
  <div class="space-y-4 border border-gray-300 p-4 rounded-md">
    <div class="flex justify-between items-center">
      <label class="font-semibold">Logic</label>
      <select v-model="localGroup.logic" class="px-2 py-1 border rounded-md">
        <option v-for="logic in schema.items.properties.logic.options" :key="logic" :value="logic">{{ logic }}</option>
      </select>
    </div>

    <div class="space-y-3">
      <div
          v-for="cond in localGroup.conditions"
          :key="cond.id"
          class="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-50 p-3 rounded border"
      >
        <input v-model="cond.column" placeholder="Column" class="px-2 py-1 border rounded w-full sm:w-1/4" />

        <select v-model="cond.operator" class="px-2 py-1 border rounded w-full sm:w-1/5">
          <option v-for="op in operatorOptions" :key="op" :value="op">{{ op }}</option>
        </select>

        <input
            v-if="operatorRequiresValue(cond.operator)"
            v-model="cond.value"
            placeholder="Value"
            class="px-2 py-1 border rounded w-full sm:w-1/4"
        />

        <label class="text-sm flex items-center gap-1">
          <input type="checkbox" v-model="cond.not" /> NOT
        </label>
        <label class="text-sm flex items-center gap-1">
          <input type="checkbox" v-model="cond.case_sensitive" /> Case Sensitive
        </label>

        <button @click.prevent="removeCondition(cond.id)" class="text-red-500">
          <IconTrash class="w-5 h-5" />
        </button>
      </div>
    </div>

    <button @click.prevent="addCondition" class="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
      Add Condition
    </button>

    <div class="mt-4">
      <h4 class="font-medium mb-2">Nested Groups</h4>
      <div v-for="(group, index) in localGroup.groups" :key="index" class="relative">
        <ConditionGroupBuilder
            v-model:value="localGroup.groups[index]"
            :schema="props.schema"
            class="ml-4 border-l-2 pl-4 mt-2"
        />
        <button @click.prevent="removeGroup(index)" class="text-xs text-red-500 mt-1">Remove Group</button>
      </div>

      <button @click.prevent="addGroup" class="mt-2 text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
        Add Nested Group
      </button>
    </div>
  </div>
</template>