<template>
  <div class="app-container">
    <div
      class="bg bg-cover w-full flex flex-col items-center justify-center fixed inset-0 bg-black"
      :style="{
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        '@media (max-width: 768px)': {
          backgroundPosition: 'center center',
        },
      }"
    >
      <div class="w-[95%] md:w-180 min-h-130 md:h-160 bg-black/50 backdrop-blur-sm rounded-xl md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.001)] overflow-hidden">
        <div class="h-12 md:h-15 mt-20 md:mt-0">
          <h1 class="text-[#40E0D0] text-xl md:text-2xl font-bold text-center mb-2" style="font-family: 'Krona One', sans-serif">HyperAGI Affiliate Program</h1>
        </div>
        <div class="w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent my-2 md:my-4"></div>
        <h2 class="text-yellow-500 text-center mb-4 md:mb-8 mt-4 md:mt-30" style="font-family: 'Montserrat-Regular', sans-serif; font-size: clamp(1.5rem, 4vw, 2rem)">Unlock rewards for you and your friends</h2>

        <div class="space-y-4 md:space-y-8 mt-8 md:mt-20">
          <div class="flex items-center gap-4 md:gap-8">
            <div class="flex-1 ml-4 md:ml-50 text-center">
              <h3 class="text-white text-base md:text-lg mb-2">Method 1</h3>
              <p class="text-gray-100 text-sm md:text-base">Take a screenshot and ask your friend to scan the barcode with MetaMask</p>
            </div>
          </div>

          <div class="w-32 h-32 flex justify-center items-center mx-auto">
            <QRCodeVue3 :value="shareUrl" :size="128" level="H" />
          </div>

          <div class="space-y-2 md:space-y-4 ml-4 md:ml-50 text-center">
            <h3 class="text-white text-base md:text-lg">Method 2</h3>
            <p class="text-gray-100 text-sm md:text-base">Copy the invitation link below and share it with your friends</p>
            <div class="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <input type="text" :value="shareUrl" readonly class="w-full md:w-100 bg-gray-800 text-white px-4 py-2 rounded text-sm md:text-base" />
              <button @click="copy" class="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded flex items-center justify-center gap-2">
                <el-icon><DocumentCopy /></el-icon>
                {{ t('share.copy') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import QRCodeVue3 from 'qrcode-vue3'

import useClipboard from 'vue-clipboard3'

import backgroundImage from '@/assets/image/web1.jpg'

const { toClipboard } = useClipboard()

import { ElMessage } from 'element-plus'

import { DocumentCopy } from '@element-plus/icons-vue'

const baseURI = window.origin

import { useUserStore } from '@/store/modules/user'
import { ref } from 'vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const userStore = useUserStore()

const shareUrl = `${baseURI}/invite/${userStore.walletAddress}`

async function copy() {
  await toClipboard(shareUrl)
  ElMessage.success(t('share.copySuccess'))
}
</script>
