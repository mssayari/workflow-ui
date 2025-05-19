<script setup>
import {onMounted, ref, watch} from 'vue'
import {IconTrash} from '@tabler/icons-vue'
import {v4 as uuidv4} from 'uuid'

const props = defineProps({
  value: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:value'])

const localValue = ref(Object.entries(props.value).map(([key, value]) => ({id: uuidv4(), key, value})))

watch(localValue, (newValue) => {
  const updatedValue = newValue.reduce((acc, {key, value}) => {
    acc[key] = value
    return acc
  }, {})

  emit('update:value', updatedValue)
}, {deep: true})

const addField = () => {
  localValue.value.push({id: uuidv4(), key: '', value: ''})
}

const removeField = (id) => {
  localValue.value = localValue.value.filter(field => field.id !== id)
}

const updateKey = (id, newKey) => {
  const field = localValue.value.find(field => field.id === id)
  if (field) {
    field.key = newKey
  }
}

const updateValue = (id, newValue) => {
  const field = localValue.value.find(field => field.id === id)
  if (field) {
    field.value = newValue
  }
}

onMounted(() => {
  console.log(props.value)
})

</script>

<template>
  <div class="flex flex-col gap-1">
    <div v-for="field in localValue" :key="field.id" class="flex items-center space-x-2 mb-2">
      <input :value="field.key" @input="updateKey(field.id, $event.target.value)" placeholder="Key"
             class="w-1/2 px-3 py-2 border border-gray-300 rounded-md"/>
      <input :value="field.value" @input="updateValue(field.id, $event.target.value)" placeholder="Value"
             class="w-1/2 px-3 py-2 border border-gray-300 rounded-md"/>
      <button @click.prevent="removeField(field.id)"
              class="p-2 bg-gray-100 hover:bg-gray-200 duration-300 text-red-500 rounded-md">
        <icon-trash stroke-width="1.5" class="w-6 h-6"/>
      </button>
    </div>
    <button @click.prevent="addField"
            class="px-3 py-2 bg-gray-600 hover:bg-gray-700 duration-300 text-white rounded-md text-sm">Add Field
    </button>
  </div>
</template>