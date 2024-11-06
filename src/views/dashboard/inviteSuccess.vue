<template>
  <div>
    <div v-if="isPC" class="pcBG">
      <img sizes="(max-width: 20rem) 100vw, 20rem" class="image" @click="toShare" src="../../assets/image/ToShare.png" />
    </div>

    <div v-else class="mobileBG">
      <img sizes="(max-width: 20rem) 100vw, 20rem" class="mobileImage" @click="toShare" src="../../assets/image/ToShare.png" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import XEUtils from 'xe-utils'

import { useRoute } from 'vue-router'

const route = useRoute()
console.info('route.params.walletAddress', route.params.walletAddress)

const isPC = ref(false)

isPC.value = !XEUtils.browse().isMobile

function toShare() {
  location.href = '/share/' + route.params.walletAddress
}
</script>

<style lang="scss" scoped>
.pcBG {
  background-image: url('../../assets/image/web3.svg');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
}

.mobileBG {
  background-image: url('../../assets/image/Mobile3.svg');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
}

.image {
  width: 20rem;
  height: 5rem;
  top: 68%;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  position: absolute;
  image-rendering: -webkit-optimize-contrast;
}

.mobileImage {
  width: 13rem;
  height: 3rem;
  top: 58%;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  position: absolute;
  image-rendering: -webkit-optimize-contrast;
}
</style>
