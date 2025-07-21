<script setup>
import {onMounted, ref, watch} from 'vue'
import {IconTrash} from '@tabler/icons-vue'
import {v4 as uuidv4} from 'uuid'

const props = defineProps({
  value: {type: Array, default: () => []},
  schema: {type: Object, default: () => ({})}
})

const emit = defineEmits(['update:value'])

const operatorOptions = ref([])

const localFilters = ref(props.value.map(item => ({id: uuidv4(), not: false, case_sensitive: false, ...item})))

watch(localFilters, (newFilters) => {
  const filtered = newFilters.map(({id, ...filter}) => filter)
  emit('update:value', filtered)
}, {deep: true})

const addFilter = () => {
  localFilters.value.push({
    id: uuidv4(),
    column: '',
    operator: '=',
    value: '',
    not: false,
    case_sensitive: false,
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
  if (props.schema.items.properties.operator.enum) {
    operatorOptions.value = props.schema.items.properties.operator.enum
  }
}

const operatorRequiresValue = (operator) => {
  return !['empty', 'not_empty', 'is_array', 'is_object'].includes(operator)
}

onMounted(() => {
  setOperators()
  // console.log(props.schema)
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
        v-for="filter in localFilters"
        :key="filter.id"
        class="flex justify-between gap-2 p-2 border border-gray-200 rounded-md bg-gray-50"
    >
      <div class="flex flex-col gap-1">
        <input
            class="px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Column"
            :value="filter.column"
            @input="updateField(filter.id, 'column', $event.target.value)"
        />

        <select
            class="px-3 py-2 border border-gray-300 rounded-md"
            :value="filter.operator"
            @change="updateField(filter.id, 'operator', $event.target.value)"
        >
          <option v-for="op in operatorOptions" :key="op" :value="op">{{ op }}</option>
        </select>

        <input
            v-if="operatorRequiresValue(filter.operator)"
            class="px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Value"
            :value="filter.value"
            @input="updateField(filter.id, 'value', $event.target.value)"
        />

        <label class="flex items-center text-sm space-x-1">
          <input
              type="checkbox"
              :checked="filter.not"
              @change="updateField(filter.id, 'not', $event.target.checked)"
          />
          <span>NOT</span>
        </label>

        <label
            class="flex items-center text-sm space-x-1"
            v-if="['contains', 'starts_with', 'ends_with', '=', '!=', 'in', 'not_in'].includes(filter.operator)"
        >
          <input
              type="checkbox"
              :checked="filter.case_sensitive"
              @change="updateField(filter.id, 'case_sensitive', $event.target.checked)"
          />
          <span>Case Sensitive</span>
        </label>
      </div>

      <button
          class="p-2 bg-gray-100 hover:bg-gray-200 duration-300 text-red-500 rounded-md"
          @click.prevent="removeFilter(filter.id)"
      >
        <icon-trash stroke-width="1.5" class="w-5 h-5"/>
      </button>
    </div>
    <button
        class="px-3 py-2 bg-gray-600 hover:bg-gray-700 duration-300 text-white rounded-md text-sm"
        @click.prevent="addFilter"
    >
      Add Condition
    </button>
  </div>

</template>