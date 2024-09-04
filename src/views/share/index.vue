<template>
  <div class="app-container">
    <el-card shadow="never" class="bg">
      <div class="qrCode">
        <QRCodeVue3 :width="100" :height="100" :value="shareUrl" />
      </div>

      <div class="shareUrl">
        <el-input v-model="shareUrl" style="width: 800px" @click="copy" class="my-input" readonly>
          <template #suffix>
            <el-icon style="color: #48e670" @click="copy" class="el-input__icon"><DocumentCopy /></el-icon>
          </template>
        </el-input>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import QRCodeVue3 from 'qrcode-vue3'

import useClipboard from 'vue-clipboard3'

const { toClipboard } = useClipboard()

import { ElMessage } from 'element-plus'

import { DocumentCopy } from '@element-plus/icons-vue'

const baseURI = window.origin

import { useUserStore } from '@/store/modules/user'
import { ref } from 'vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const userStore = useUserStore()

const dialogVisible = ref(false)

const shareUrl = `${baseURI}/invite/${userStore.username}`

async function copy() {
  await toClipboard(shareUrl)
  ElMessage.success(t('share.copySuccess'))
}
</script>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.bg {
  background-image: url('../../assets/image/web1.svg');
  background-size: cover; // 使用 cover 确保背景图片完全覆盖容器，但这可能导致图片被裁剪
  height: 90vh; // 根据视口高度调整
  width: 100%; // 根据视口宽度调整
  position: relative; // 父容器使用相对定位
  display: flex;
  justify-content: center; // 水平居中
  align-items: center; // 垂直居中
}

.qrCode {
  top: 60%; // 调整到恰当的位置
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
}

.shareUrl {
  top: 95%; // 根据实际需要调整
  left: 50%; // 水平中心
  transform: translateX(-50%); // 横向居中
  width: 50vw; // 宽度相对于视口宽度，适应不同屏幕
  max-width: 800px; // 最大宽度限制
  cursor: pointer;
}
.my-input ::v-deep .el-input__inner {
  font-size: 26px; // 字体大小可以保持不变或使用相对单位
  color: #48e670;
  font-weight: 700;
  background-color: transparent; // 去除输入框背景
  border: none; // 去除边框
}

.qrCode,
.shareUrl {
  position: absolute; // 使用绝对定位
}
</style>
