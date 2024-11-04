<template>
  <div>
    <el-menu active-text-color="#FFFFFF" @select="selectMenu" :default-active="index" background-color="#141414" class="el-menu-vertical-demo" text-color="#fff" mode="horizontal" style="height: 70px; border: 0px" :ellipsis="false">
      <el-menu-item index="0">
        <img @click="href('https://www.hyperdust.io')" class="w-full h-15" :src="logo" />
      </el-menu-item>

      <el-sub-menu class="h-15 pt-2.5" index="7">
        <template #title>
          <h3 class="font-bold h-15">AI Computing</h3>
        </template>

        <el-menu-item index="7-1">AI LLM</el-menu-item>
        <el-menu-item index="7-2">AI app</el-menu-item>
        <el-menu-item index="7-3">LLM Driven Agent</el-menu-item>
      </el-sub-menu>

      <el-menu-item class="h-15 pt-2.5" index="8">
        <h3 class="font-bold h-15">3D Computing</h3>
      </el-menu-item>

      <el-menu-item class="h-15 pt-2.5" index="3">
        <h3 class="font-bold h-15">dApp Hub</h3>
      </el-menu-item>

      <el-menu-item class="h-15 pt-2.5" index="5">
        <h3 class="font-bold h-15">Help</h3>
      </el-menu-item>

      <el-menu-item class="h-15 pt-2.5" index="6">
        <h3 class="font-bold h-15">Get $HYPT</h3>
      </el-menu-item>

      <div class="flex-grow" />

      <el-menu-item>
        <el-dropdown @command="handleCommand" class="custom-dropdown w-44">
          <span class="el-dropdown-link flex items-center" style="margin-top: 2px">
            <el-avatar :size="13" :src="currBlockchain.icon" />
            <span class="ml-2">{{ currBlockchain.name }}</span>
            <el-icon size="13" class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(item, index) in blockchainList" :command="item.id" :style="{ 'margin-top': index === 0 ? '5px' : '10px' }" :key="index">
                <el-avatar :size="25" :src="item.icon" />
                <span class="text-sm ml-2">{{ item.name }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown v-if="user.token" class="custom-dropdown ml-8 w-48">
          <span class="el-dropdown-link flex items-center" style="margin-top: 3px">
            <el-avatar :size="16" :src="user.avatar" />
            <span class="ml-2">
              <Substring :copys="false" color="#ffffff" fontSize="13px" :value="user.walletAddress || user.email"></Substring>
            </span>
            <el-icon size="13" class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-card class="w-48">
              <template #header>
                <div class="flex items-center">
                  <el-avatar :size="25" :src="user.avatar" />
                  <span class="ml-3">
                    <Substring color="#ffffff" fontSize="12px" :value="user.username"></Substring>
                  </span>
                </div>
              </template>

              <p class="flex items-center ml-2">
                <el-icon size="20">
                  <User />
                </el-icon>
                <el-button type="plain" @click="goHome" class="text-sm" link>{{ $t('index.dashboard') }}</el-button>
              </p>

              <p class="flex items-center ml-2 mt-8">
                <el-image :src="logout" class="w-5 h-5"></el-image>
                <el-button type="plain" @click="disconnect" class="text-sm" link>{{ $t('index.disconnect') }}</el-button>
              </p>
            </el-card>
          </template>
        </el-dropdown>

        <el-dropdown v-else class="custom-dropdown ml-8 w-40" trigger="contextmenu">
          <span class="el-dropdown-link flex items-center" @click="metamaskLogin" style="margin-top: 3px">
            <el-avatar :size="16" :src="metamask" />
            <span class="ml-2">{{ $t('index.connectWallet') }}</span>
          </span>
        </el-dropdown>
      </el-menu-item>
    </el-menu>

    <Home v-if="index === '3'"></Home>
    <buyMinner v-else-if="index === '4'"></buyMinner>
    <Help v-else-if="index === '5'"></Help>
    <doc v-else-if="index === '6'"></doc>
    <health-monitor v-else-if="index === '7-1'"></health-monitor>
    <AISpace v-else-if="index === '7-2'"></AISpace>
    <Space v-else-if="index === '8'"></Space>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, type FormInstance } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import Home from './home.vue'
import buyMinner from './buyMinner.vue'
import doc from './doc.vue'
import Help from './help.vue'
import logo from '@/assets/layouts/logo.png?url'
import metamask from '@/assets/image/metamask.png?url'
import logout from '@/assets/image/logout.png?url'
import Substring from '@/components/substring.vue'
import { metamaskLogin } from '@/api/login'
import api from '@/utils/api'
import HealthMonitor from '@/views/dashboard/healthMonitor.vue'
import AISpace from '@/views/dashboard/AISpace.vue'
import Space from '@/views/space/index.vue'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const index = ref(route.query.index || '7-1')
const blockchainList = ref([])
const currBlockchainId = ref(localStorage.getItem('currBlockchainId'))
const currBlockchain = ref({})

function selectMenu(i) {
  if (i === '1') {
    href('https://www.hyperdust.io')
  } else if (i === '7-3') {
    ElMessage.warning('Coming soon')
    return
  }

  index.value = i
}

function href(url) {
  location.href = url
}

async function getBlockchainList() {
  const { result } = await api.get('/mgn/blockchain/list', { pageSize: -1, status: 'Y' })
  blockchainList.value = result.records
}

onMounted(async () => {
  await getBlockchainList()
  currBlockchain.value = blockchainList.value.filter(item => item.id === currBlockchainId.value)[0]
})

function handleCommand(command) {
  localStorage.setItem('currBlockchainId', command)
  currBlockchainId.value = command
  currBlockchain.value = blockchainList.value.filter(item => item.id === currBlockchainId.value)[0]
}

function disconnect() {
  user.logout()
}

function goHome() {
  location.href = '/home/index'
}
</script>
