<script setup>
import { ref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { IconTrash } from '@tabler/icons-vue'

const props = defineProps({
  value: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:value'])

const localColumns = ref(props.value.map(item => ({ id: uuidv4(), ...item })))

watch(localColumns, (newVal) => {
  const output = newVal.map(({ id, ...col }) => col)
  emit('update:value', output)
}, { deep: true })

const addColumn = () => {
  localColumns.value.push({
    id: uuidv4(),
    name: '',
    value: '',
    slugify: false
  })
}

const removeColumn = (id) => {
  localColumns.value = localColumns.value.filter(c => c.id !== id)
}

const updateField = (id, key, newValue) => {
  const column = localColumns.value.find(c => c.id === id)
  if (column) {
    column[key] = newValue
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
        v-for="col in localColumns"
        :key="col.id"
        class="flex flex-col gap-2 p-2 border border-gray-200 rounded-md bg-gray-50"
    >
      <div class="flex items-center gap-2">
        <div class="w-full flex flex-col gap-1">
          <input
              class="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Column Name"
              :value="col.name"
              @input="updateField(col.id, 'name', $event.target.value)"
          />

          <input
              class="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Static Value"
              :value="col.value"
              @input="updateField(col.id, 'value', $event.target.value)"
          />

          <label class="flex items-center space-x-1 text-sm">
            <input
                type="checkbox"
                :checked="col.slugify"
                @change="updateField(col.id, 'slugify', $event.target.checked)"
            />
            <span>Slugify</span>
          </label>
        </div>
        <button
            class="p-2 bg-gray-100 hover:bg-gray-200 duration-300 text-red-500 rounded-md"
            @click.prevent="removeColumn(col.id)"
        >
          <icon-trash stroke-width="1.5" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <button
        class="px-3 py-2 bg-gray-600 hover:bg-gray-700 duration-300 text-white rounded-md text-sm"
        @click.prevent="addColumn"
    >
      Add Derived Column
    </button>
  </div>
</template>