<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import { useSettingsStore } from '@/store/modules/settings'
import { useUserStore } from '@/store/modules/user'
import { UserFilled } from '@element-plus/icons-vue'
import Hamburger from '../Hamburger/index.vue'
import Share from '../Share/index.vue'
import Breadcrumb from '../Breadcrumb/index.vue'
import Sidebar from '../Sidebar/index.vue'
import ThemeSwitch from '@/components/ThemeSwitch/index.vue'
import Screenfull from '@/components/Screenfull/index.vue'
import Notify from '@/components/Notify/index.vue'
import { DeviceEnum } from '@/constants/app-key'
import UploadAvatar from './uploadAvatar.vue'

import Substring from '@/components/substring.vue'

import logoutPng from '@/assets/image/logout.png?url'

import BindEmail from './BindEmail.vue'

const router = useRouter()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const bindEmail = ref(null)

const uploadAvatar = ref(null)

const { sidebar, device } = storeToRefs(appStore)
const { layoutMode, showNotify, showThemeSwitch, showScreenfull } = storeToRefs(settingsStore)

const isTop = computed(() => layoutMode.value === 'top')
const isMobile = computed(() => device.value === DeviceEnum.Mobile)

/** 切换侧边栏 */
const toggleSidebar = () => {
  appStore.toggleSidebar(false)
}

function disconnect() {
  userStore.logout()
  location.href = '/login'
}

function goHome() {
  console.info(import.meta.env.VITE_HOME)

  location.href = import.meta.env.VITE_HOME + '/login?token=' + userStore.token
}

function showUploadAvatar() {
  uploadAvatar.value.show()
}

function showBindEmail() {
  bindEmail.value.show()
}
</script>

<template>
  <div class="navigation-bar">
    <Hamburger v-if="!isTop || isMobile" :is-active="sidebar.opened" class="hamburger" @toggle-click="toggleSidebar" />
    <Breadcrumb v-if="!isTop || isMobile" class="breadcrumb" />
    <Sidebar v-if="isTop && !isMobile" class="sidebar" />
    <div class="right-menu">
      <!-- <Screenfull v-if="showScreenfull" class="right-menu-item" /> -->
      <!-- <ThemeSwitch v-if="showThemeSwitch" class="right-menu-item" /> -->
      <!-- <Notify v-if="showNotify" class="right-menu-item" /> -->

      <el-dropdown style="width: 200px" class="custom-dropdown">
        <span class="el-dropdown-link" style="margin-top: -5px; display: flex; align-items: center; margin-left: 20px">
          <el-avatar :size="16" :src="userStore.avatar" />

          <span style="margin-left: 5px">
            <Substring :copys="false" color="#ffffff" fontSize="13px" :value="userStore.username"></Substring>
          </span>

          <el-icon size="13" class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-card style="width: 200px">
            <template #header>
              <div class="card-header" style="display: flex; align-items: center">
                <el-avatar :size="25" :src="userStore.avatar" />

                <span style="margin-left: 15px">
                  <Substring color="#ffffff" fontSize="12px" :value="userStore.username"></Substring>
                </span>
              </div>
            </template>

            <p style="margin-left: 5px; display: flex; align-items: center">
              <el-icon size="20">
                <HomeFilled />
              </el-icon>

              <el-button type="plain" @click="goHome" style="font-size: 12px" link>{{ $t('index.home') }}</el-button>
            </p>

            <p style="margin-left: 5px; display: flex; align-items: center; margin-top: 30px">
              <SvgIcon width="1.5em" height="1.5em" name="email" />

              <el-button type="plain" @click="showBindEmail" style="font-size: 12px" link>
                {{ userStore.email || 'Bind Email' }}
              </el-button>
            </p>

            <p style="margin-left: 5px; display: flex; align-items: center; margin-top: 30px">
              <el-icon size="20">
                <Edit />
              </el-icon>

              <el-button type="plain" @click="showUploadAvatar" style="font-size: 12px" link>{{ $t('index.uploadAvatar') }}</el-button>
            </p>

            <p style="margin-left: 5px; display: flex; align-items: center; margin-top: 30px">
              <el-image :src="logoutPng" style="width: 20px; height: 20px"></el-image>

              <el-button type="plain" @click="disconnect" style="font-size: 12px" link>{{ $t('index.disconnect') }}</el-button>
            </p>
          </el-card>
        </template>
      </el-dropdown>
    </div>

    <UploadAvatar ref="uploadAvatar"></UploadAvatar>

    <BindEmail ref="bindEmail"></BindEmail>
  </div>
</template>

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

.el-dropdown-link {
  font-size: 14px;
  padding-top: 2%;
  padding-left: 3%;
  cursor: pointer;
}

.custom-dropdown {
  background-color: #303133;
  border-radius: 9999px;
  width: 260px;
  height: 30px;
}

.navigation-bar {
  height: var(--v3-navigationbar-height);
  overflow: hidden;
  background: var(--v3-header-bg-color);
  display: flex;
  justify-content: space-between;

  .hamburger {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 15px;
    cursor: pointer;
  }

  .breadcrumb {
    flex: 1;
    // 参考 Bootstrap 的响应式设计将宽度设置为 576
    @media screen and (max-width: 576px) {
      display: none;
    }
  }

  .sidebar {
    flex: 1;
    // 设置 min-width 是为了让 Sidebar 里的 el-menu 宽度自适应
    min-width: 0px;

    :deep(.el-menu) {
      background-color: transparent;
    }

    :deep(.el-sub-menu) {
      &.is-active {
        .el-sub-menu__title {
          color: var(--el-menu-active-color) !important;
        }
      }
    }
  }

  .right-menu {
    margin-right: 10px;
    height: 100%;
    display: flex;
    align-items: center;
    color: #606266;

    .right-menu-item {
      padding: 0 10px;
      cursor: pointer;

      .right-menu-avatar {
        display: flex;
        align-items: center;

        .el-avatar {
          margin-right: 10px;
        }

        span {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
