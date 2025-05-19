<script setup>
import {onMounted, ref, watch} from 'vue'
import { IconTrash } from '@tabler/icons-vue'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps({
  value: {
    type: Array,
    default: () => []
  },
  schema: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:value'])

const operatorOptions = ref([]);

const localFilters = ref(props.value.map(item => ({ id: uuidv4(), ...item })))
// const localFilters = ref({ id: uuidv4() })

watch(localFilters, (newFilters) => {
  const filtered = newFilters.map(({ id, ...filter }) => filter)
  emit('update:value', filtered)
}, { deep: true })

const addFilter = () => {
  localFilters.value.push({
    id: uuidv4(),
    column: '',
    operator: '=',
    value: ''
  })
}

const removeFilter = (id) => {
  localFilters.value = localFilters.value.filter(f => f.id !== id)
}

const updateField = (id, key, newValue) => {
  const filter = localFilters.value.find(f => f.id === id)
  if (filter) {
    filter[key] = newValue
  }
}


const setOperators = () => {
  if (props.schema.items.properties.operator.enum){
    console.log('found enum')
    // get the enum values from the schema
    operatorOptions.value = props.schema.items.properties.operator.enum

  }
}

onMounted(() => {
  setOperators()
})


</script>

<template>
  <div class="flex flex-col gap-2">
    <div v-for="filter in localFilters" :key="filter.id" class="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-gray-50">
      <input
          class="w-1/3 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Column"
          :value="filter.column"
          @input="updateField(filter.id, 'column', $event.target.value)"
      />

      <select
          class="w-1/4 px-3 py-2 border border-gray-300 rounded-md"
          :value="filter.operator"
          @change="updateField(filter.id, 'operator', $event.target.value)"
      >
        <option v-for="op in operatorOptions" :key="op" :value="op">{{ op }}</option>
      </select>

      <input :disabled="filter.operator === 'empty' || filter.operator === 'not_empty'"
          class="w-1/3 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Value"
          :value="filter.value"
          @input="updateField(filter.id, 'value', $event.target.value)"
      />

      <button
          class="p-2 bg-gray-100 hover:bg-gray-200 duration-300 text-red-500 rounded-md"
          @click.prevent="removeFilter(filter.id)"
      >
        <icon-trash stroke-width="1.5" class="w-5 h-5" />
      </button>
    </div>

    <button
        class="px-3 py-2 bg-gray-600 hover:bg-gray-700 duration-300 text-white rounded-md text-sm"
        @click.prevent="addFilter"
    >
      Add Filter
    </button>
  </div>
</template>