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
      <div class="w-[95%] md:w-150 min-h-80 md:h-120 bg-black/50 backdrop-blur-sm rounded-xl md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.001)] overflow-hidden">
        <div class="h-12 md:h-15 mt-20 md:mt-0">
          <h1 class="text-[#40E0D0] text-xl md:text-2xl font-bold text-center mb-2" style="font-family: 'Krona One', sans-serif">HyperAGI Affiliate Program</h1>
        </div>
        <div class="w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent my-2 md:my-4"></div>
        <h2 class="text-yellow-500 text-center mb-4 md:mb-8 mt-4 md:mt-30" style="font-family: 'Montserrat-Regular', sans-serif; font-size: clamp(1.5rem, 4vw, 2rem)">Congratulations!</h2>
        <div class="text-center mt-20">
          <p class="text-gray-200 text-sm md:text-base">You are a new member of Hyper Affiliate Program now</p>
        </div>

        <div class="flex justify-center">
          <img src="@/assets/image/Done.png" alt="Done" class="invite-button cursor-pointer mt-50" @click="closeWindow" style="width: 10rem; height: 3rem" />
          <img src="@/assets/image/InviteMore.png" alt="Accept" class="invite-button cursor-pointer mt-50 ml-20" @click="inviteMore" style="width: 10rem; height: 3rem" />
        </div>

        <div class="flex justify-center mt-20">
          <p class="text-yellow-500 text-sm md:text-base text-center">Continue to invite your friends</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeMount } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { useRoute, useRouter } from 'vue-router'

import backgroundImage from '@/assets/image/web1.jpg'

const route = useRoute()
const router = useRouter()
import api from '@/utils/api'

onBeforeMount(() => {
  if (typeof window.ethereum === 'undefined') {
    ElMessageBox.alert("MetaMask is not installed. Please consider installing it: https://metamask.io/download.html'", 'Warning Prompt')
  }
})

async function getPersonalSignMessage(address) {
  const { result } = await api.get('/sys/getPersonalSignMessage', { address })

  return result
}

async function accept() {
  const walletAddress = route.params.walletAddress

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

  const signMessage = await getPersonalSignMessage(accounts[0])

  const signature = await ethereum.request({
    method: 'personal_sign',
    // @ts-ignore
    params: [signMessage, accounts[0]],
  })

  await api.post('/mgn/inviteRecord/add', { address: accounts[0], signature, inviteAddress: walletAddress })

  location.href = '/inviteSuccess/' + accounts[0]
}

function closeWindow() {
  window.location.href = 'about:blank'
}

function inviteMore() {
  router.push('/goShare')
}
</script>
