<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: 'AgentReward',
})

import { reactive, ref, watch, onBeforeMount } from 'vue'

import { toAmount, toLocalTime, toServerTime } from '@/utils/index'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const sumData = ref(null)

import { type GetTableData } from '@/api/table/types/table'
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import { useRouter } from 'vue-router'

const router = useRouter()

const selectCreateTime = ref(null)

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

import Substring from '@/components/Substring.vue'

onBeforeMount(async () => {})

const searchData = reactive({
  account: useUserStore().walletAddress || useUserStore().username,
  column: 'createTime',
  order: 'desc',
  transactionHash: '',
})
const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/agentBasicRewardRecord/list', searchData)

  sum()

  tableData.value = result.records
  paginationData.total = result.total
  loading.value = false
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

function changeSelectCreateTime(val) {
  searchData.createTime_begin = null
  searchData.createTime_end = null
  if (val) {
    searchData.createTime_begin = toServerTime(val[0])
    searchData.createTime_end = toServerTime(val[1])
  }
}

async function sum() {
  const { result } = await api.get('/mgn/agentBasicRewardRecord/sum', searchData)
  sumData.value = result
}

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item label="Transaction Hash">
          <el-input v-model="searchData.transactionHash" :placeholder="t('placeholderTxt')" />
        </el-form-item>

        <el-form-item :label="t('createTime')">
          <el-date-picker v-model="selectCreateTime" @change="changeSelectCreateTime" value-format="YYYY-MM-DD" type="daterange" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">{{ t('searchBtnTxt') }}</el-button>
          <!-- <el-button :icon="Refresh" @click="resetSearch">重置</el-button> -->
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div></div>
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
          <el-table-column prop="amount" label="Amount" align="center">
            <template #default="{ row }"> {{ toAmount(row.amount) }} HYPT </template>
          </el-table-column>

          <el-table-column prop="transactionHash" label="Transaction Hash" align="center">
            <template #default="{ row }">
              <Substring :value="row.transactionHash"></Substring>
            </template>
          </el-table-column>

          <el-table-column prop="blockchainId_dictText" label="Blockchain Network" align="center" /> >

          <el-table-column prop="createTime" :label="t('createTime')" align="center">
            <template #default="{ row }"> {{ toLocalTime(row.createTime) }} </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes" :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <div style="height: 60px; text-align: center; margin-top: 20px">
      <el-tag v-if="sumData" style="font-size: 15px; height: 40px; padding-top: 10px">
        <span>SumAmount: {{ toAmount(sumData.amount) }}HYPT</span>
      </el-tag>
    </div>
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
