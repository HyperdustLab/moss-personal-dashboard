<template>
  <div>
    <SelectSourceType ref="selectSourceType"></SelectSourceType>

    <Epoch2DRender ref="epoch2DRender"></Epoch2DRender>
  </div>
</template>

<script lang="ts" setup>
import SelectSourceType from '@/views/dashboard/SelectSourceType.vue'
import Epoch2DRender from '@/views/dashboard/Epoch2DRender.vue'

import { metamaskLogin } from '@/api/login'

import { useUserStore } from '@/store/modules/user'

import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import api from '@/utils/api'
import { ElLoading } from 'element-plus'

const selectSourceType = ref(null)

const epoch2DRender = ref(null)

let gLoading = null

const { t } = useI18n()

async function openApp(sid) {
  gLoading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  const item = await getApp(sid)

  gLoading.close()

  const user = useUserStore()

  if (!user.username) {
    await metamaskLogin()
  }

  if (item.type === '1') {
    epoch2DRender.value.show(item)
  } else {
    const ip = await getTargetIP()

    if (ip) {
      location.href = `/Hyperdust/epoch/${item.sid}`
    } else {
      selectSourceType.value.show(item)
    }
  }
}

async function getTargetIP() {
  const { result } = await api.get('/mgn/order/getTargetIP', {})
  return result
}

async function getApp(sid) {
  const { result } = await api.get('/mgn/globeApp/list', { sid })

  const app = result.records[0]

  return app
}

defineExpose({
  openApp,
})
</script>

<style></style>
