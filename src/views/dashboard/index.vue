<template>
  <div>
    <el-menu active-text-color="#FFFFFF" @select="selectMenu" :default-active="index" background-color="#141414" class="el-menu-vertical-demo" text-color="#fff" mode="horizontal" style="height: 70px; border: 0px" :ellipsis="false">
      <el-menu-item index="0">
        <img @click="href('https://www.hyperdust.io')" style="width: 100%; height: 60px" :src="logo" />
      </el-menu-item>

      <el-sub-menu style="height: 60px; padding-top: 10px" index="7">
        <template #title><h3 style="font-weight: 1000; height: 60px">AI Computing</h3></template>

        <el-menu-item index="7-1">AI LLM</el-menu-item>
        <el-menu-item index="7-2">AI app</el-menu-item>
        <el-menu-item index="7-3">LLM Driven Agent</el-menu-item>
      </el-sub-menu>

      <el-menu-item style="height: 60px; padding-top: 10px" index="8">
        <h3 style="font-weight: 1000">3D Computing</h3>
      </el-menu-item>

      <el-menu-item style="height: 60px; padding-top: 10px" index="3">
        <h3 style="font-weight: 1000">dApp Hub</h3>
      </el-menu-item>
      <!--
<el-menu-item style="height: 60px; padding-top: 10px" index="4">
<h3 style="font-weight: 1000">Buy Minner</h3>
</el-menu-item> -->

      <el-menu-item style="height: 60px; padding-top: 10px" index="5">
        <h3 style="font-weight: 1000; height: 60px">Help</h3>
      </el-menu-item>

      <el-menu-item style="height: 60px; padding-top: 10px" index="6">
        <h3 style="font-weight: 1000; height: 60px">Get $HYPT</h3>
      </el-menu-item>

      <div class="flex-grow" />

      <el-menu-item>
        <el-dropdown @command="handleCommand" class="custom-dropdown" style="width: 180px">
          <span class="el-dropdown-link" style="margin-top: 2px">
            <el-avatar :size="13" :src="currBlockchain.icon" />

            <span style="margin-left: 10px">{{ currBlockchain.name }}</span>

            <el-icon size="13" class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(item, index) in blockchainList" :command="item.id" :style="{ 'margin-top': index === 0 ? '5px' : '10px' }" :key="index">
                <el-avatar :size="25" :src="item.icon" />

                <span style="font-size: 13px; margin-left: 10px"> {{ item.name }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown v-if="user.token" style="margin-left: 30px; width: 200px" class="custom-dropdown">
          <span class="el-dropdown-link" style="margin-top: 3px; margin-left: 20px">
            <el-avatar :size="16" :src="user.avatar" />

            <span style="margin-left: 5px">
              <Substring :copys="false" color="#ffffff" fontSize="13px" :value="user.username"></Substring>
            </span>

            <el-icon size="13" class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-card style="width: 200px">
              <template #header>
                <div class="card-header" style="display: flex; align-items: center">
                  <el-avatar :size="25" :src="user.avatar" />

                  <span style="margin-left: 15px">
                    <Substring color="#ffffff" fontSize="12px" :value="user.username"></Substring>
                  </span>
                </div>
              </template>

              <p style="margin-left: 5px; display: flex; align-items: center">
                <el-icon size="20">
                  <User />
                </el-icon>

                <el-button type="plain" @click="goHome" style="font-size: 12px" link>{{ $t('index.dashboard') }} </el-button>
              </p>

              <p style="margin-left: 5px; display: flex; align-items: center; margin-top: 30px">
                <el-image :src="logout" style="width: 20px; height: 20px"></el-image>

                <el-button type="plain" @click="disconnect" style="font-size: 12px" link>{{ $t('index.disconnect') }} </el-button>
              </p>
            </el-card>
          </template>
        </el-dropdown>

        <el-dropdown v-else style="margin-left: 30px; width: 160px" trigger="contextmenu" class="custom-dropdown">
          <span class="el-dropdown-link" @click="metamaskLogin" style="margin-top: 3px; margin-left: 10px">
            <el-avatar :size="16" :src="metamask" />

            <span style="margin-left: 6px">{{ $t('index.connectWallet') }}</span>
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

<style lang="scss" scoped>
::v-deep .el-dropdown-link--active,
::v-deep .el-dropdown-link:active,
::v-deep .el-dropdown-link:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

.el-dropdown-link {
  font-size: 14px;
  padding-top: 2%;
  padding-left: 6%;
}

.custom-dropdown {
  background-color: #303133;
  border-radius: 9999px;
  width: 260px;
  height: 30px;
}
</style>
