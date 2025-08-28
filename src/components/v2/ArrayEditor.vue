<script setup>
import {onMounted, ref, watch} from 'vue'
import {IconTrash} from '@tabler/icons-vue'
import {v4 as uuidv4} from 'uuid'
import SchemaField from "@/components/v2/SchemaField.vue";

const props = defineProps({
  value: {type: Array, default: () => []},
  schema: {type: Object, required: true},
  errors: {type: Object, default: () => ({})},
  path: { type: String, default: '' }
})


const emit = defineEmits(['update:value'])

const localValue = ref(props.value ?? [])

watch(localValue, (val) => emit('update:value', val), {deep: true})
watch(() => props.value, (val) => localValue.value = val ?? [], {deep: true})


function addItem() {
  if (props.schema.items.type === "object") {
    // build default object with all properties = null
    const newObj = Object.fromEntries(
        props.schema.items.properties.map(p => {
          const hasDefault = Object.prototype.hasOwnProperty.call(p, 'default')
          const value = hasDefault ? p.default : (p.type === 'boolean' ? "" : "")
          return [p.name, value]
        })
    )
    localValue.value.push(newObj)
  } else {
    // primitive default
    localValue.value.push("")
  }
}

function removeItem(index) {
  localValue.value.splice(index, 1)
}

const updateValue = (index, newValue, format) => {
  // Parse the value based on format
  let parsedValue = newValue
  switch (format) {
    case 'date':
      parsedValue = new Date(newValue)
      break
    case 'number':
      parsedValue = parseFloat(newValue) || 0
      break
    case 'boolean':
      parsedValue = !!newValue
      break
    default:
      parsedValue = newValue
  }

  // Update the value directly without replacing the object
  localValue.value[index] = parsedValue
}

const shouldShow = (field,index) => {
  if (!field || !field.show) return true;
  if (field.show) {
    if (typeof field.show === 'object') {
      return Object.entries(field.show).every(([key, value]) => localValue.value[index][key] === value)
    }
  }
}

onMounted(() => {
  // console.log(props.schema)
})

</script>

<template>
  <div class="flex flex-col gap-1">
    <div v-for="(item, index) in localValue" :key="index"
         class="flex items-start space-x-2 mb-2 border border-gray-300 rounded-md p-2">
     <div class="w-full">

    <!-- string types with format -->
    <template v-if="schema.items.type === 'string'">
      <!-- email -->
      <input v-if="schema.items.format === 'email'"
             type="email"
             :value="localValue[index]"
             @input="updateValue(index, $event.target.value, 'string')"
             class="w-full px-3 py-2 border border-gray-300 rounded-md"/>

      <!-- url -->
      <input v-else-if="schema.items.format === 'url'"
             type="url"
             :value="localValue[index]"
             @input="updateValue(index, $event.target.value, 'string')"
             class="w-full px-3 py-2 border border-gray-300 rounded-md"/>

      <!-- password -->
      <input v-else-if="schema.items.format === 'password'"
             type="password"
             :value="localValue[index]"
             @input="updateValue(index, $event.target.value, 'string')"
             class="w-full px-3 py-2 border border-gray-300 rounded-md"/>

      <!-- date -->
      <input v-else-if="schema.items.format === 'date'"
           type="date"
           :value="localValue[index] instanceof Date ? localValue[index].toISOString().split('T')[0] : localValue[index]"
           @input="updateValue(index, $event.target.value, 'date')"
             class="w-full px-3 py-2 border border-gray-300 rounded-md"/>

      <!-- textarea -->
      <textarea v-else-if="schema.items.format === 'textarea'"
                :value="localValue[index]"
                @input="updateValue(index, $event.target.value, 'string')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>

      <!-- default string -->
      <input v-else
             type="text"
             :value="localValue[index]"
             @input="updateValue(index, $event.target.value, 'string')"
             class="w-full px-3 py-2 border border-gray-300 rounded-md"/>
    </template>

    <!-- number -->
    <input v-else-if="schema.items.type === 'number'"
           type="number"
           :value="localValue[index]"
           @input="updateValue(index, $event.target.value, 'number')"
           class="w-full px-3 py-2 border border-gray-300 rounded-md"/>

    <!-- boolean -->
    <label v-else-if="schema.items.type === 'boolean'" class="flex items-center space-x-2">
      <input type="checkbox"
             :checked="localValue[index]"
             @change="updateValue(index, $event.target.checked, 'boolean')"/>
      <span>{{ schema.items.label }}</span>
    </label>

    <!-- object -->
       <div v-else-if="schema.items.type === 'object'">
         <div v-for="prop in schema.items.properties" :key="prop.name">
           <schema-field
               :field="prop"
               v-if="shouldShow(prop,index)"
               v-model="localValue[index][prop.name]"
               :errors="errors"
               :path="path+ '['+index+']' + '.' + prop.name"
           />
         </div>
       </div>

    <!-- fallback -->
    <input v-else
           v-model="localValue[index]"
           placeholder="Value"
           class="w-full px-3 py-2 border border-gray-300 rounded-md"/>

    <!-- error handling same as before -->
       <div v-if="errors[path + schema.name + '['+index+']']" class="text-red-500 text-sm">
         {{ errors[path + schema.name+ '['+index+']'][0] }}
       </div>
       <div v-if="errors[path + '['+index+']']" class="text-red-500 text-sm">
         {{ errors[path + '[' + index + ']'][0] }}
       </div>
     </div>

      <button @click.prevent="removeItem(index)"
              class="p-2 bg-gray-100 hover:bg-gray-200 duration-300 text-red-500 rounded-md">
        <icon-trash stroke-width="1.5" class="w-6 h-6"/>
      </button>
    </div>
    <button @click.prevent="addItem"
            class="px-3 py-2 bg-gray-600 hover:bg-gray-700 duration-300 text-white rounded-md text-sm">Add Item
    </button>
  </div>
</template>