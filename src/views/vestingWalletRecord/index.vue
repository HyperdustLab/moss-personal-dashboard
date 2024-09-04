<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: 'vestingWalletRecord',
})

import { reactive, ref, watch, onBeforeMount } from 'vue'

import { useI18n } from 'vue-i18n'

import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from 'element-plus'

import Substring from '@/components/Substring.vue'

const { t } = useI18n()

import { type GetTableData } from '@/api/table/types/table'

import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import { buildContract } from '@/utils/index.ts'

import { exceptionHandling, toAmount } from '@/utils/index'

import { ethers } from 'ethers'

const user = useUserStore()

const loading = ref<boolean>(false)

const tableData = ref<GetTableData[]>([])

onBeforeMount(async () => {
  getTableData()
})

const getTableData = async () => {
  loading.value = true

  tableData.value = []

  const vestingWalletList = await getVestingWalletList()

  for (const item of vestingWalletList) {
    const contract = await buildContract(item.blockchainId, item.code)

    const totalAllocation = await contract.totalAllocation(user.username)

    const released = await contract.released(user.username)
    const releasable = await contract.releasable(user.username)
    let releasableTime = await contract.releasableTime(user.username)

    releasableTime = parseInt(releasableTime)

    let releasableTimeStr = '-'

    if (releasableTime !== 0) {
      releasableTimeStr = new Date(releasableTime * 1000).toLocaleString()
    }

    tableData.value.push({
      totalAllocation: ethers.formatEther(totalAllocation),
      released: ethers.formatEther(released),
      releasable: ethers.formatEther(releasable),
      account: user.username,
      contractAddress: item.address,
      businessName: item.name,
      blockchainNetwork: item.blockchainId_dictText,
      blockchainId: item.blockchainId,
      contractCode: item.code,
      allowableReleaseTime: releasableTimeStr,
    })
  }

  loading.value = false
}

async function release(blockchainId, contractCode) {
  const contract = await buildContract(blockchainId, contractCode)

  loading.value = true

  try {
    await (await contract.release()).wait()
    getTableData()
  } catch (e) {
    exceptionHandling(e, t)
  }

  loading.value = false
}

async function getVestingWalletList() {
  const { result } = await api.get('/mgn/smartContract/list', {
    code: 'Hyperdust_Airdrop,Hyperdust_PublicSale,Hyperdust_PrivateSale,Hyperdust_Seed',
  })

  return result.records
}
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div />
        <div>
          <el-tooltip content="下载">
            <!-- <el-button type="primary" :icon="Download" circle /> -->
          </el-tooltip>
          <el-tooltip content="刷新当前页">
            <!-- <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" /> -->
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column prop="account" :label="t('vestingWalletRecord.account')" align="center">
            <template #default="{ row }">
              <Substring :value="row.account"></Substring>
            </template>
          </el-table-column>
          <el-table-column prop="businessName" :label="t('vestingWalletRecord.businessName')" align="center"> </el-table-column>
          <el-table-column prop="totalAllocation" :label="t('vestingWalletRecord.totalAllocation')" align="center">
            <template #default="{ row }"> {{ toAmount(row.totalAllocation) }} HYPT </template>
          </el-table-column>

          <el-table-column prop="released" :label="t('vestingWalletRecord.released')" align="center">
            <template #default="{ row }"> {{ toAmount(row.released) }} HYPT </template>
          </el-table-column>

          <el-table-column prop="allowableReleaseTime" :label="t('vestingWalletRecord.allowableReleaseTime')" align="center"> </el-table-column>

          <el-table-column prop="releasable" :label="t('vestingWalletRecord.releasable')" align="center">
            <template #default="{ row }"> {{ toAmount(row.releasable) }} HYPT </template>
          </el-table-column>

          <el-table-column prop="contractAddress" :label="t('vestingWalletRecord.contractAddress')" align="center">
            <template #default="{ row }">
              <Substring :value="row.contractAddress"></Substring>
            </template>
          </el-table-column>

          <el-table-column prop="blockchainNetwork" :label="t('vestingWalletRecord.blockchainNetwork')" align="center"> </el-table-column>

          <el-table-column fixed="right" :label="t('actionBtnTxt')" width="150" align="center">
            <template #default="{ row }">
              <el-button @click="release(row.blockchainId, row.contractCode)" type="primary" link>{{ t('vestingWalletRecord.release') }} </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

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
</style>
