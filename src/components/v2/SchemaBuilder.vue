<script setup>
import {onMounted, onUpdated, ref, watch} from 'vue'
import SchemaField from "@/components/v2/SchemaField.vue";


const props = defineProps({
  schema: {
    type: Object,
    required: true
  },
  config: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:config'])

const localConfig = ref({...props.config})

// Watch for external config changes
watch(() => props.config, (newConfig) => {
  localConfig.value = {...newConfig}
}, {deep: true})


// // Emit config on change
watch(localConfig, (newConfig) => {
  emit('update:config', newConfig)
}, {deep: true, immediate: true})


const shouldShow = (field) => {
  if (!field || !field.show) return true;
  if (field.show) {
    if (typeof field.show === 'object') {
      return Object.entries(field.show).every(([key, value]) => localConfig.value[key] === value)
    }
  }
}


onUpdated(() => {
  // console.log(props.schema)
})

onMounted(() => {
  // console.log(props.schema)
  // console.log(props.config)
})

</script>

<template>
  <div class="space-y-4">
    <template v-for="(field, index) in schema"
              :key="field.name + '-' + field.type + '-' + index">
      <SchemaField v-if="shouldShow(field)"
                   :field="field"
                   v-model="localConfig[field.name]"
                   :errors="errors"
                   :path="'config.' + field.name"
      />
    </template>
  </div>
</template>