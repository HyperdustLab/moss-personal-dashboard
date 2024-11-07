<template>
  <div class="fixed inset-0">
    <div
      class="bg bg-cover h-full w-full flex flex-col items-center pt-24 md:pt-24 pt-12 overflow-hidden"
      :style="{
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundColor: 'transparent',
        '@media (max-width: 768px)': {
          backgroundPosition: 'center',
        },
      }"
    >
      <div class="title-section text-center text-white mb-10 mt-55 px-4">
        <h1 class="text-[#31ebff] md:text-6xl mb-3 md:mb-5" style="font-family: 'Krona One', sans-serif">HyperAGI Affiliate Program</h1>
        <p class="text-lg md:text-2xl opacity-80" style="font-family: 'Montserrat-Regular', sans-serif">Invite your friends to unlock rewards for you and your friends</p>
      </div>
      <img src="@/assets/image/Invite.png" alt="Invite" class="invite-button cursor-pointer mt-50 w-32 md:w-40" @click="goInvite" style="height: 3rem" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import backgroundImage from '@/assets/image/web1.jpg'

function goInvite() {
  window.open('/goInvite')
}
</script>
