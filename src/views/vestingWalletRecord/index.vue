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

import { usePagination } from '@/hooks/usePagination'

import { type GetTableData } from '@/api/table/types/table'

import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import { buildContract, toServerTime } from '@/utils/index.ts'

import { exceptionHandling, toAmount } from '@/utils/index'

import { ethers } from 'ethers'

import { Collection, Search } from '@element-plus/icons-vue'

const user = useUserStore()

const loading = ref<boolean>(false)

const userStore = useUserStore()

const selectDate = ref<string[]>([])

const handleReleaseLoading = ref<boolean>(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const sumReleased = ref<number>(0)

const multipleSelection = ref<GetTableData[]>([])

const tableData = ref<GetTableData[]>([])

const searchFormRef = ref<FormInstance>()

const sumData = ref<{
  totalAllocation: number
  released: number
  pendingReleaseAmount: number
}>({})

onBeforeMount(async () => {
  getTableData()
})

const searchData = reactive({
  account: userStore.walletAddress || userStore.username,
  column: 'date',
  order: 'asc',
})

const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/vestingWalletRecord/list', searchData)

  sum()

  tableData.value = result.records
  paginationData.total = result.total
  loading.value = false
}

async function release(rows) {
  if (rows.length === 0) {
    ElMessage.warning('Please select a row')
    return
  }

  const blockchainId = rows[0].blockchainId

  const HyperAGI_VestingWallet = await buildContract(blockchainId, 'HyperAGI_VestingWallet')

  const dates = rows.map(item => item.date)

  loading.value = true

  try {
    await (await HyperAGI_VestingWallet.withdraw(dates)).wait()
    getTableData()
  } catch (e) {
    exceptionHandling(e, t)
  }

  loading.value = false
}

async function sum() {
  const { result } = await api.get('/mgn/vestingWalletRecord/sum', searchData)
  sumData.value = result
}

function changeSelectDate(val) {
  searchData.date_begin = null
  searchData.date_end = null
  if (val) {
    searchData.date_begin = toServerTime(val[0])
    searchData.date_end = toServerTime(val[1])
  }
}

function rowSelectable(row, index) {
  return row.isRelease
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

function handleSelectionChange(e) {
  multipleSelection.value = e
  sumReleased.value = 0

  for (const item of e) {
    sumReleased.value += item.pendingReleaseAmount
  }
}

function tableRowClassName(table, rowIndex) {
  if (!table.row.isRelease) {
    return 'warning-row'
  }
  return ''
}

watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item label="Date">
          <el-date-picker v-model="selectDate" @change="changeSelectDate" value-format="YYYY-MM-DD" type="daterange" />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="searchData.selectRelease" label="Currently Releasable" size="large" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">{{ t('searchBtnTxt') }}</el-button>

          <!-- <el-button :icon="Refresh" @click="resetSearch">重置</el-button> -->
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :loading="handleReleaseLoading" @click="release(multipleSelection)" :icon="Collection">
            {{ t('baserewardReleaseRecord.release') }}
          </el-button>

          <span v-if="multipleSelection.length > 0" style="margin-left: 10px">Sum Released :{{ toAmount(sumReleased) }}HYPT</span>
        </div>

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
        <el-table :data="tableData" :row-class-name="tableRowClassName" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" :selectable="rowSelectable" />

          <el-table-column prop="account" :label="t('vestingWalletRecord.account')" align="center">
            <template #default="{ row }">
              <Substring :value="row.account"></Substring>
            </template>
          </el-table-column>
          <el-table-column prop="totalAllocation" :label="t('vestingWalletRecord.totalAllocation')" align="center">
            <template #default="{ row }"> {{ toAmount(row.totalReleasedAmount) }} HYPT </template>
          </el-table-column>

          <el-table-column prop="released" :label="t('vestingWalletRecord.released')" align="center">
            <template #default="{ row }"> {{ toAmount(row.releaseAmount) }} HYPT </template>
          </el-table-column>

          <el-table-column prop="released" label="Pending Release Amount" align="center">
            <template #default="{ row }"> {{ toAmount(row.pendingReleaseAmount) }} HYPT </template>
          </el-table-column>

          <el-table-column prop="date" :label="t('vestingWalletRecord.allowableReleaseTime')" align="center"> </el-table-column>

          <el-table-column label="Status" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.pendingReleaseAmount > 0" type="success">Released</el-tag>
              <el-tag v-else type="danger">Not Released</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="blockchainId_dictText" :label="t('vestingWalletRecord.blockchainNetwork')" align="center"> </el-table-column>

          <el-table-column fixed="right" :label="t('actionBtnTxt')" width="150" align="center">
            <template #default="{ row }">
              <el-button @click="release([row])" :disabled="!row.isRelease" type="primary" link>{{ t('vestingWalletRecord.release') }} </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes" :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <div class="h-80 text-center mt-20">
        <el-tag class="text-xl h-10 pt-2" style="font-size: 1rem">
          <span>Total Allocation: {{ toAmount(sumData.totalAllocation || 0) }}HYPT</span>
        </el-tag>

        <el-tag class="text-xl h-10 pt-2 ml-5" style="font-size: 1rem">
          <span>Released: {{ toAmount(sumData.released || 0.0) }}HYPT</span>
        </el-tag>

        <el-tag class="text-xl h-10 pt-2 ml-5" style="font-size: 1rem">
          <span>Pending Release Amount: {{ toAmount(sumData.pendingReleaseAmount || 0) }}HYPT</span>
        </el-tag>
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

:deep .warning-row {
  --el-table-tr-bg-color: #606266;
}
</style>
