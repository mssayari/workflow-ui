<script lang="ts">
import CustomSelect from '@/components/v2/cron/CronSelect.vue'
import { cronCoreProps, setupCron } from '@vue-js-cron/core'
import { defineComponent, type ExtractPropTypes } from 'vue'

export const cronLightProps = () => ({
  ...cronCoreProps(),
})

/**
 * Props of {@link CronLight}
 *
 * See {@link @vue-js-cron/core!CronCoreProps | CronCoreProps} for a detailed description of each prop
 *
 * @interface
 */
export type CronLightProps = Partial<ExtractPropTypes<ReturnType<typeof cronLightProps>>>

export default defineComponent({
  name: 'CronLight',
  components: {
    CustomSelect,
  },
  emits: ['update:model-value', 'update:period', 'error'],
  props: cronLightProps(),
  setup(props, ctx) {
    return setupCron(props, ctx)
  },
})
</script>

<template>
  <span class="vcron-editor">
    <div>
      <span>{{ period.prefix.value }}</span>
    <div class="vcron-l-spacer">
      <custom-select
          :model-value="period.selected.value.id"
          item-value="id"
          :items="period.items"
          @update:model-value="period.select($event)"
          :cols="cols['period'] || 1"
          :disabled="disabled"
      />
    </div>
    <span>{{ period.suffix.value }}</span>
    </div>

    <template v-for="f in selected" :key="f.id">
      <div>
        <span>{{ f.prefix.value }}</span>
      <div class="vcron-l-spacer">
        <custom-select
            :model-value="f.selected.value"
            @update:model-value="f.select($event)"
            :items="f.items"
            :cols="cols[f.id] || 1"
            :selection="f.text.value"
            multiple
            clearable
            :disabled="disabled"
        ></custom-select>
      </div>
      <span>{{ f.suffix.value }}</span>
      </div>
    </template>
  </span>
</template>
<style>
.vcron-l-spacer {
  display: inline-block;
  padding: 3px;
}
</style>
