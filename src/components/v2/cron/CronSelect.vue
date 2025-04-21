<script lang="ts">
import {selectProps, setupSelect} from '@vue-js-cron/core'
import {defineComponent, ref} from 'vue'
import {IconX} from '@tabler/icons-vue'

export default defineComponent({
  name: 'CustomSelect',
  props: {
    ...selectProps(),
  },
  emits: ['update:model-value'],
  components: {
    IconX,
  },

  setup(props, ctx) {
    const s = setupSelect<any, any>(props, () => props.modelValue, ctx)
    const menu = ref(false)

    const menuEvtListener = () => {
      menu.value = false
      document.removeEventListener('click', menuEvtListener)
    }
    const toggleMenu = () => {
      menu.value = !menu.value

      if (menu.value) {
        setTimeout(() => {
          document.addEventListener('click', menuEvtListener)
        }, 1)
      } else {
        document.removeEventListener('click', menuEvtListener)
      }
    }

    return {
      ...s,
      menu,
      toggleMenu,
    }
  },
})
</script>
<template>
  <div class="vcron-select-container">
    <span
        class="vcron-select-input"
        :class="{ 'vcron-select-disabled': disabled }"
        @click="
        () => {
          if (!disabled) toggleMenu()
        }
      ">
      {{ selection ?? selectedStr }}

      <span class=" bg-gray-200 hover:bg-gray-300 text-red-500 p-0.5 rounded-sm duration-300"
            v-if="clearable && !isEmpty" @click="clear">
        <icon-x class="w-4 h-4"/>
      </span>
    </span>

    <div class="vcron-select-list" v-if="menu">
      <div class="flex" v-for="(row, i) in itemRows" :key="i">
        <div
            v-for="(item, j) in row"
            :key="i + '-' + j"
            class="vcron-select-col"
            :class="{ 'vcron-select-selected': has(item) }"
            @click="select(item)"
            @click.stop="multiple ? () => {} : toggleMenu()">
          <div v-if="item">{{ item.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@reference "tailwindcss";

.vcron-select-container {
  @apply inline-block relative mx-1;
}

.vcron-select-input {
  @apply inline-flex gap-1.5 items-center rounded-sm border border-gray-200 select-none p-1 px-2 text-gray-950;
}

.vcron-select-disabled {
  background-color: #ccc;
  color: #444;
}

:not(.vcron-select-disabled).vcron-select-input {
  @apply bg-gray-100;
}

:not(.vcron-select-disabled).vcron-select-input:hover {
  @apply bg-gray-200 border-gray-300;
}

.vcron-select-list {
  @apply absolute rounded-sm bg-gray-100 left-0 m-0 p-0 shadow-md border border-gray-400 list-none z-20 top-7;
}

.vcron-select-col {
  flex-grow: 1;
  flex-basis: 0%;
  display: inline-block;
  box-sizing: border-box;
  user-select: none;
  padding: 0.2em 0.5em;
  text-align: center;
  color: black;
}

.vcron-select-col:hover {
  @apply bg-gray-600 text-white;
}

.vcron-select-selected {
  @apply bg-gray-700 text-white;
}

.vcron-select-selected:hover {
  @apply bg-gray-800 text-white;
}
</style>
