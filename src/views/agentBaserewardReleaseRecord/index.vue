<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: 'BaserewardReleaseRecord',
})

import { reactive, ref, watch, onBeforeMount } from 'vue'

import { useI18n } from 'vue-i18n'

import dayjs from 'dayjs'

import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const { t } = useI18n()

const multipleSelection = ref([])

import { toAmount, toLocalTime, toServerTime } from '@/utils/index'

import { type GetTableData } from '@/api/table/types/table'
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from 'element-plus'

import { Collection, Search } from '@element-plus/icons-vue'

import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import { useRouter } from 'vue-router'

import { buildContract, exceptionHandling } from '@/utils/index.ts'

const selectCreateTime = ref(null)

const handleReleaseLoading = ref(false)

const router = useRouter()

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

paginationData.pageSizes = [10, 20, 30, 40, 50, 200, 300, 500]

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const status = ref([])

const sumData = ref({})

const sumReleased = ref(null)

const totalSecurityAmount = ref(0)

onBeforeMount(async () => {
  status.value = await api.getDictItems('basereward_release_record_status')
})

const searchData = reactive({
  column: 'releaseTime',
  order: 'desc',
  releaseTime_begin: '',
  releaseTime_end: '',
  type: 'HyperAGI_Agent_BaseReward_Release',
  selectRelease: null,
})
const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/baserewardReleaseRecord/list', searchData)
  sum()
  tableData.value = result.records
  paginationData.total = result.total

  loading.value = false
}

async function sum() {
  const { result } = await api.get('/mgn/baserewardReleaseRecord/sum', searchData)
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
  searchData.createTime_begin = null
  searchData.createTime_end = null
  if (val) {
    searchData.createTime_begin = toServerTime(val[0])
    searchData.createTime_end = toServerTime(val[1])
  }
}

async function handleRelease() {
  const releaseTimes = multipleSelection.value.map(item => item.releaseTime)

  console.info(releaseTimes)

  // const ids = result.records.map((item) => item.recordId)

  if (releaseTimes.length === 0) {
    ElMessage.warning(t('baserewardReleaseRecord.noBaserewardReleaseRecordTxt'))
    return
  }

  const blockchainId = multipleSelection.value[0].blockchainId

  const HyperAGI_Agent_BaseReward_Release = await buildContract(blockchainId, 'HyperAGI_Agent_BaseReward_Release')

  try {
    handleReleaseLoading.value = true
    await (await HyperAGI_Agent_BaseReward_Release.release(releaseTimes)).wait()
    ElMessage.success(t('baserewardReleaseRecord.releaseSuccessTxt'))
    handleSearch()
  } catch (e) {
    exceptionHandling(e, t)
  }

  handleReleaseLoading.value = false
}

function handleSelectionChange(e) {
  multipleSelection.value = e
  sumReleased.value = 0

  for (const item of e) {
    sumReleased.value += item.amount - item.releaseAmount
  }
}

function rowSelectable(row, index) {
  return row.isRelease
}

function tableRowClassName(table, rowIndex) {
  if (table.row.amount === table.row.releaseAmount) {
    return 'warning-row'
  }
  return ''
}

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item :label="t('createTime')">
          <el-date-picker v-model="selectCreateTime" @change="changeSelectCreateTime" value-format="YYYY-MM-DD" type="daterange" />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="searchData.selectRelease" :label="$t('baserewardReleaseRecord.currentlyReleasable')" size="large" />
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
          <el-button type="primary" :loading="handleReleaseLoading" @click="handleRelease" :icon="Collection">
            {{ t('baserewardReleaseRecord.release') }}
          </el-button>

          <span v-if="multipleSelection.length > 0" style="margin-left: 10px">{{ $t('baserewardReleaseRecord.sumReleased') }} :{{ toAmount(sumReleased) }}HYPT</span>
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
        <el-table @selection-change="handleSelectionChange" :row-class-name="tableRowClassName" :data="tableData">
          <el-table-column type="selection" width="55" :selectable="rowSelectable" />
          <el-table-column prop="amount" :label="t('baserewardReleaseRecord.amount')" align="center">
            <template #default="{ row }"> {{ toAmount(row.amount) }}&nbsp; HYPT </template>
          </el-table-column>
          <el-table-column prop="releaseAmount" :label="t('baserewardReleaseRecord.releaseAmount')" align="center">
            <template #default="{ row }"> {{ toAmount(row.releaseAmount) }}&nbsp; HYPT </template>
          </el-table-column>
          <el-table-column prop="releaseTime" :label="t('baserewardReleaseRecord.releaseTime')" align="center">
            <template #default="{ row }">
              {{ dayjs.unix(row.releaseTime).format('YYYY-MM-DD') }}
            </template>
          </el-table-column>

          <el-table-column prop="blockchainId_dictText" :label="t('baserewardReleaseRecord.blockchainNetwork')" align="center"> </el-table-column>

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
          <span>{{ $t('baserewardReleaseRecord.totalReward') }}: {{ toAmount(sumData.totalReward || 0) }}HYPT</span>
        </el-tag>

        <el-tag style="font-size: 15px; height: 40px; padding-top: 10px; margin-left: 20px">
          <span>{{ $t('baserewardReleaseRecord.toBeReleasedAmount') }}: {{ toAmount(sumData.toReleaseAmount || 0.0) }}HYPT</span>
        </el-tag>

        <el-tag style="font-size: 15px; height: 40px; padding-top: 10px; margin-left: 20px">
          <span>{{ $t('baserewardReleaseRecord.canReleaseAmount') }}: {{ toAmount(sumData.canReleaseAmount || 0) }}HYPT</span>
        </el-tag>

        <el-tag style="font-size: 15px; height: 40px; padding-top: 10px; margin-left: 20px">
          <span>{{ $t('baserewardReleaseRecord.releaseAmount') }}: {{ toAmount(sumData.releaseAmount || 0) }}HYPT</span>
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
