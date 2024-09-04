<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: 'securityDepositRecord',
})

import { reactive, ref, watch, onBeforeMount } from 'vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

import { toAmount, toLocalTime, toServerTime } from '@/utils/index'

import { type GetTableData } from '@/api/table/types/table'
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from 'element-plus'

import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import { useRouter } from 'vue-router'

import Substring from '@/components/Substring.vue'

const selectCreateTime = ref(null)

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

paginationData.pageSizes = [10, 20, 30, 40, 50, 200, 300, 500]

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const sumData = ref({})

const searchData = reactive({
  nodeOwner: useUserStore().username,
  column: 'createTime',
  order: 'desc',
  createTime_begin: '',
  createTime_end: '',
  blockNumber: '',
})
const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/securityDepositRecord/list', searchData)
  sum()
  tableData.value = result.records
  paginationData.total = result.total

  loading.value = false
}

async function sum() {
  const { result } = await api.get('/mgn/securityDepositRecord/sum', searchData)
  sumData.value = result
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

function changeSelectCreateTime(val) {
  searchData.createTime_begin = ''
  searchData.createTime_end = ''
  if (val) {
    searchData.createTime_begin = toServerTime(val[0])
    searchData.createTime_end = toServerTime(val[1])
  }
}

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item :label="t('securityDepositRecord.nodeId')">
          <el-input v-model="searchData.nodeId" :placeholder="t('placeholderTxt')"></el-input>
        </el-form-item>

        <el-form-item :label="t('securityDepositRecord.blockNumber')">
          <el-input v-model="searchData.blockNumber" :placeholder="t('placeholderTxt')"></el-input>
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
          <el-table-column prop="nodeId" :label="t('securityDepositRecord.nodeId')" align="center"> </el-table-column>

          <el-table-column prop="totalSecurityAmount" :label="t('securityDepositRecord.totalSecurityAmount')" align="center">
            <template #default="{ row }"> {{ toAmount(row.totalSecurityAmount) }}&nbsp; HYPT </template>
          </el-table-column>

          <el-table-column prop="amount" :label="t('securityDepositRecord.amount')" align="center">
            <template #default="{ row }"> {{ toAmount(row.amount) }}&nbsp; HYPT </template>
          </el-table-column>

          <el-table-column prop="transactionHash" label="Transaction Hash" align="center">
            <template #default="{ row }">
              <Substring :value="row.transactionHash"></Substring>
            </template>
          </el-table-column>

          <el-table-column prop="blockchainId_dictText" :label="t('securityDepositRecord.blockchainNetwork')" align="center"> </el-table-column>

          <el-table-column prop="createTime" :label="t('createTime')" align="center">
            <template #default="{ row }"> {{ toLocalTime(row.createTime) }}</template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes" :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <div style="height: 60px; text-align: center; margin-top: 20px">
        <el-tag style="font-size: 15px; height: 40px; padding-top: 10px">
          <span>{{ $t('securityDepositRecord.amount') }}: {{ toAmount(sumData.amount || 0) }}HYPT</span>
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
</style>
