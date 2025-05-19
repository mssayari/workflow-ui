<script setup>
import {onMounted, ref, watch} from 'vue'
import {IconTrash} from '@tabler/icons-vue'
import {v4 as uuidv4} from 'uuid'

const props = defineProps({
  value: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:value'])

const localTransforms = ref(props.value.map(item => ({id: uuidv4(), ...item})))

watch(localTransforms, (newTransforms) => {
  const transformed = newTransforms.map(({id, ...t}) => t)
  emit('update:value', transformed)
}, {deep: true})

const addTransform = () => {
  localTransforms.value.push({
    id: uuidv4(),
    column: '',
    operation: 'lowercase',
    search: '',
    replace: '',
    format: '',
    delimiter: '',
  })
}

const removeTransform = (id) => {
  localTransforms.value = localTransforms.value.filter(t => t.id !== id)
}

const updateField = (id, key, value) => {
  const transform = localTransforms.value.find(t => t.id === id)
  if (transform) transform[key] = value
}

const operationOptions = [
  {value: 'lowercase', label: 'Lowercase'},
  {value: 'uppercase', label: 'Uppercase'},
  {value: 'titlecase', label: 'Title Case'},
  {value: 'trim', label: 'Trim'},
  {value: 'replace', label: 'Find & Replace'},
  {value: 'regex_replace', label: 'Regex-based replace'},
  {value: 'cast_to_int', label: 'Cast to Integer'},
  {value: 'cast_to_date', label: 'Cast to Date'},
  {value: 'slug', label: 'Slugify'},
  {value: 'explode', label: 'Explode'},
]

onMounted(() => {
  // console.log(props.value)
})

</script>

<template>
  <div class="flex flex-col gap-3">
    <div
        v-for="t in localTransforms"
        :key="t.id"
        class="flex flex-col gap-2 p-2 border border-gray-200 rounded-md bg-gray-50"
    >
      <div class="flex items-center gap-2">
        <input
            class="flex-1 px-3 py-2 border rounded-md"
            placeholder="Column name"
            :value="t.column"
            @input="updateField(t.id, 'column', $event.target.value)"
        />

        <select
            class="flex-1 px-3 py-2 border rounded-md"
            :value="t.operation"
            @change="updateField(t.id, 'operation', $event.target.value)"
        >
          <option v-for="op in operationOptions" :value="op.value" :key="op.value">
            {{ op.label }}
          </option>
        </select>

        <button
            class="p-2 text-red-500 hover:text-red-600"
            @click.prevent="removeTransform(t.id)"
        >
          <icon-trash class="w-5 h-5"/>
        </button>
      </div>

      <div v-if="t.operation === 'replace'" class="flex gap-2">
        <input
            class="flex-1 px-3 py-2 border rounded-md"
            placeholder="Search"
            :value="t.search"
            @input="updateField(t.id, 'search', $event.target.value)"
        />
        <input
            class="flex-1 px-3 py-2 border rounded-md"
            placeholder="Replace"
            :value="t.replace"
            @input="updateField(t.id, 'replace', $event.target.value)"
        />
      </div>
      <div v-if="t.operation === 'regex_replace'" class="flex gap-2">
        <input
            class="flex-1 px-3 py-2 border rounded-md"
            placeholder="Regex Pattern"
            :value="t.search"
            @input="updateField(t.id, 'search', $event.target.value)"
        />
        <input
            class="flex-1 px-3 py-2 border rounded-md"
            placeholder="Replace"
            :value="t.replace"
            @input="updateField(t.id, 'replace', $event.target.value)"
        />
      </div>
      <div v-if="t.operation === 'cast_to_date'" class="flex">
        <input
            class="flex-1 px-3 py-2 border rounded-md"
            placeholder="Date Format (e.g. Y-m-d)"
            :value="t.format"
            @input="updateField(t.id, 'format', $event.target.value)"
        />
      </div>
      <div v-if="t.operation === 'explode'" class="flex">
        <input
            class="flex-1 px-3 py-2 border rounded-md"
            placeholder="delimiter (e.g. , or ;)"
            :value="t.delimiter"
            @input="updateField(t.id, 'delimiter', $event.target.value)"
        />
      </div>
    </div>
    <button
        class="px-3 py-2 text-sm text-white bg-gray-600 rounded-md hover:bg-gray-700"
        @click.prevent="addTransform"
    >
      Add Transformation
    </button>
  </div>
</template>

<style scoped>
input, select {
  min-width: 0;
}
</style>
