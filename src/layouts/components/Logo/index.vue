<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/store/modules/settings'
import logo from '@/assets/image/logo2.png'
import logoText1 from '@/assets/image/logo2.png'
import logoText2 from '@/assets/image/logo2.png'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

interface Props {
  collapse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapse: true,
})

const settingsStore = useSettingsStore()
const { layoutMode } = storeToRefs(settingsStore)

function goHome() {
  location.href = 'https://app.mossai.com'
}
</script>

<template>
  <div class="layout-logo-container" :class="{ collapse: props.collapse, 'layout-mode-top': layoutMode === 'top' }">
    <transition name="layout-logo-fade">
      <div v-if="props.collapse" key="collapse" @click="goHome">
        <img style="width: 47px; height: 50px" class="layout-logo" :src="logo" />
      </div>
      <div v-else key="expand" @click="goHome">
        <img :src="layoutMode !== 'left' ? logoText2 : logoText1" class="layout-logo-text" />
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.layout-logo-container {
  position: relative;
  width: 100%;
  height: var(--v3-header-height);
  line-height: var(--v3-header-height);
  background-color: transparent;
  text-align: center;
  overflow: hidden;
  margin-top: 10px;
  .layout-logo {
    display: none;
    height: 59px;
    width: 47px;
  }
  .layout-logo-text {
    height: 50px;
    margin-left: 25%;
    vertical-align: middle;
  }
}

.layout-mode-top {
  height: var(--v3-navigationbar-height);
  line-height: var(--v3-navigationbar-height);
}

.collapse {
  .layout-logo {
    width: 47px;
    height: 59px;
    vertical-align: middle;
    display: inline-block;
  }
  .layout-logo-text {
    display: none;
  }
}
</style>
