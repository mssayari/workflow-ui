<script setup>
import {onMounted, ref, watch} from 'vue'
import { IconTrash } from '@tabler/icons-vue'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps({
  value: {
    type: Array,
    default: () => []
  },
  schema: {type: Object, default: () => ({})}
})

const emit = defineEmits(['update:value'])

const localValue = ref(props.value.map(value => ({ id: uuidv4(), value })))

watch(localValue, (newValue) => {
  emit('update:value', newValue.map(item => item.value))
}, { deep: true })

const addItem = () => {
  localValue.value.push({ id: uuidv4(), value: '' })
}

const removeItem = (id) => {
  localValue.value = localValue.value.filter(item => item.id !== id)
}

const updateValue = (id, newValue) => {
  const item = localValue.value.find(item => item.id === id)
  if (item) {
    item.value = newValue
  }
}

onMounted(() => {
  console.log(props.schema)
})

</script>

<template>
  <div class="flex flex-col gap-1">
    <div v-for="item in localValue" :key="item.id" class="flex items-center space-x-2 mb-2">

      <!-- if format is date "yyy-mm-dd"-->
      <input v-if="schema.format === 'date'" type="date" :value="item.value"
             @input="updateValue(item.id, new Date($event.target.value))" class="w-full px-3 py-2 border border-gray-300 rounded-md"/>

      <!-- if format is number -->
      <input v-else-if="schema.format === 'number'" type="number" :value="item.value"
             @input="updateValue(item.id, parseFloat($event.target.value))" class="w-full px-3 py-2 border border-gray-300 rounded-md"/>

      <!-- else treat as string -->
      <input v-else :value="item.value" @input="updateValue(item.id, $event.target.value)" placeholder="Value"
             class="w-full px-3 py-2 border border-gray-300 rounded-md"/>
      <button @click.prevent="removeItem(item.id)"
              class="p-2 bg-gray-100 hover:bg-gray-200 duration-300 text-red-500 rounded-md">
        <icon-trash stroke-width="1.5" class="w-6 h-6"/>
      </button>
    </div>
    <button @click.prevent="addItem"
            class="px-3 py-2 bg-gray-600 hover:bg-gray-700 duration-300 text-white rounded-md text-sm">Add Item
    </button>
  </div>
</template>