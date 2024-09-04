<template>
  <el-dialog v-model="visible" style="pointer-events: auto" width="35%" :title="$t('selectreSourceType.title')">
    <div style="height: 400px">
      <el-image style="width: 100%; height: 100px" :src="logo" fit="contain" />

      <el-form :model="form" label-width="180px" style="margin-top: 12%; margin-left: 10%">
        <el-form-item style="margin-left: 5%" label="Epoch">
          <template #label>
            <el-tooltip class="box-item" effect="dark" :content="$t('selectreSourceType.epochTxt')" placement="top-start">
              <span
                >{{ $t('selectreSourceType.durationUnit') }}
                <el-icon>
                  <QuestionFilled />
                </el-icon>
              </span>
            </el-tooltip>
          </template>
          <el-input-number v-model="form.epoch" @change="calculateCommission" :min="1" :max="10" />
        </el-form-item>

        <el-form-item style="margin-left: 19%; margin-top: 5%" label="Est HyperGas Fee："> {{ toAmount(totalPrice) }}HYPT </el-form-item>

        <el-form-item label-width="0px" style="margin-right: 6%; margin-top: 10%">
          <div style="cursor: pointer" @click="handleOK" class="btn flex-center ma">
            {{ $t('selectreSourceType.browseMap') }}
          </div>
        </el-form-item>

        <el-form-item label-width="0px" style="margin-left: 20%">
          <div style="text-align: center">
            {{ $t('selectreSourceType.title1') }}

            <a style="margin-left: 5px; color: #409eff" :href="toGetHYPT()" target="_blank">{{ $t('selectreSourceType.title2') }}</a>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import api from '@/utils/api'
import { ElLoading, ElMessage } from 'element-plus'
import { buildContract, exceptionHandling, handleAuthorized, toAmount } from '@/utils/index'

import logo from '@/assets/layouts/logo-text-3.png?url'

import { useI18n } from 'vue-i18n'

const visible = ref(false)
const resourceTypes = reactive([])

const { t } = useI18n()

const app = ref(null)

const currBlockchainId = ref(localStorage.getItem('currBlockchainId'))

let gLoading = null

let commission = null

const form = reactive({
  epoch: 1,
})

const totalPrice = ref(null)

async function show(item) {
  currBlockchainId.value = localStorage.getItem('currBlockchainId')

  const { result } = await api.get('/mgn/transactionCfg/getTransactionFee', {
    key: 'epoch',
    blockchainId: currBlockchainId.value,
  })

  commission = result

  calculateCommission(1)

  app.value = item

  visible.value = true
}

async function getMinerNode() {
  // @ts-ignore
  const { result } = await api.get('/mgn/minerNode/preemption', {})

  return result
}

async function handleOK() {
  try {
    gLoading = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    await createOrder(form)
  } catch (e) {
    gLoading.close()
    exceptionHandling(e, t)
  }
}

function toGetHYPT() {
  return location.origin + '?index=6'
}

async function createOrder(item) {
  if (!item.epoch) {
    ElMessage.warning(t('selectreSourceType.durationRuleTxt'))
    return
  }
  const minerNode = await getMinerNode()

  if (!minerNode) {
    ElMessage.warning(t('minerNode.noResourcesTxt'))
    return
  }

  const Hyperdust_Epoch_Transcition = await buildContract(currBlockchainId.value, 'Hyperdust_Epoch_Transcition')

  await handleAuthorized(currBlockchainId.value, Hyperdust_Epoch_Transcition.target, totalPrice.value)

  console.info(minerNode.id, item.epoch)

  await (await Hyperdust_Epoch_Transcition.createEpochTranscition(minerNode.id, item.epoch)).wait()

  setTimeout(() => {
    gLoading.close()

    location.href = `/Hyperdust/epoch/${app.value.sid}`
  }, 3000)
}

async function calculateCommission(epoch) {
  totalPrice.value = commission * epoch
}

defineExpose({
  show,
})
</script>

<style scoped lang="scss">
.btn {
  width: 198px;
  height: 42px;
  background: url('../../assets/image/btnBg.png') no-repeat center center;
  background-size: 100% 100%;
  font-size: 22px;
  font-family: Cabin, Cabin-SemiBold;
  font-weight: normal;
  text-align: LEFT;
  color: #ffffff;
}

.package {
  width: 1302px;

  .packageBox {
    .packageItem {
      background: url('../../assets/image/packageSelect.png') no-repeat center center;
      background-size: 100% 100%;
      width: 600px;

      &.active {
        background-image: url('../../assets/image/packageSelected.png');
      }

      .el-input-number {
        width: 100px;
      }

      p {
        font-size: 14px;
        font-family: Cabin, Cabin-Regular;
        font-weight: 400;
        text-align: LEFT;
        color: #ffffff;
        line-height: 16px;
      }

      h4 {
        font-size: 18px;
        font-family: Cabin, Cabin-Bold;
        font-weight: 700;
        text-align: LEFT;
        color: #ffffff;
        line-height: 21px;
      }

      .imageInfo {
        width: 312px;
        height: 242px;
        display: block;
      }
    }
  }

  .packageTitle {
    font-size: 32px;
    font-family: Cabin, Cabin-Bold;
    font-weight: 700;
    text-align: center;
    color: #ffffff;
    line-height: 38px;
  }
}
</style>
