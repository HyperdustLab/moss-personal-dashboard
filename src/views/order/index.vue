<script lang="ts" setup>
import { Search } from '@element-plus/icons-vue'

defineOptions({
  // 命名当前组件
  name: 'MinerOrder',
})

import { onBeforeMount, reactive, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import ChargeHistory from './ChargeHistory.vue'
import { toAmount, toLocalTime, toServerTime } from '@/utils/index'
import { type GetTableData } from '@/api/table/types/table'
import { type FormInstance } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import Substring from '@/components/Substring.vue'

const chargeHistory = ref(null)

const { t } = useI18n()

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const orderStatus = ref([])

const blockchainList = ref([])

onBeforeMount(async () => {
  orderStatus.value = await api.getDictItems('order_status')
  await getBlockchainList()
})

const searchData = reactive({
  account: useUserStore().username,
  column: 'createTime',
  order: 'desc',
  blockNumber: '',
})
const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/order/list', searchData)
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

function openChargeHistory(row) {
  chargeHistory.value.show(row)
}

async function getBlockchainList() {
  const { result } = await api.get('/mgn/blockchain/list', { status: 'Y', pageSize: -1 })

  blockchainList.value = result.records
}

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item :label="t('order.orderId')">
          <el-input v-model="searchData.orderId" :placeholder="t('placeholderTxt')" />
        </el-form-item>

        <el-form-item :label="t('order.transactionHash')">
          <el-input v-model="searchData.transactionHash" :placeholder="t('placeholderTxt')"></el-input>
        </el-form-item>

        <el-form-item :label="t('order.orderStatus')">
          <el-select v-model="searchData.status" :placeholder="t('placeholderSelect')" clearable>
            <el-option v-for="item in orderStatus" :key="item.value" :label="item.text" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('order.blockchainNetwork')">
          <el-select v-model="searchData.blockchainId" :placeholder="t('placeholderSelect')" clearable>
            <el-option v-for="item in blockchainList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">{{ t('searchBtnTxt') }}</el-button>
          <!-- <el-button :icon="Refresh" @click="resetSearch">重置</el-button> -->
        </el-form-item>
      </el-form>
    </el-card>
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
          <el-table-column width="100" prop="orderId" :label="t('order.orderId')" align="center" />
          <el-table-column prop="coordinate" :label="t('order.time')" align="center">
            <template #default="{ row }"> {{ row.useEpoch }}/{{ row.epoch }}Epoch</template>
          </el-table-column>
          <el-table-column prop="amount" :label="t('order.orderAmount')" align="center">
            <template #default="{ row }"> {{ toAmount(row.amount) }}HYPT</template>
          </el-table-column>

          <el-table-column prop="endTime" :label="t('order.endTime')" align="center">
            <template #default="{ row }"> {{ toLocalTime(row.endTime) }}</template>
          </el-table-column>

          <el-table-column prop="minerNodeId" :label="t('order.nodeId')" align="center"></el-table-column>
          <el-table-column prop="blockchain.name" :label="t('order.blockchainNetwork')" align="center"> </el-table-column>

          <el-table-column prop="status_dictText" :label="t('order.orderStatus')" align="center"></el-table-column>

          <el-table-column prop="transactionHash" :label="t('order.transactionHash')" align="center">
            <template #default="{ row }">
              <Substring :value="row.transactionHash"></Substring>
            </template>
          </el-table-column>

          <el-table-column prop="createTime" :label="t('createTime')" align="center">
            <template #default="{ row }"> {{ toLocalTime(row.createTime) }}</template>
          </el-table-column>

          <el-table-column fixed="right" :label="t('actionBtnTxt')" width="150" align="center">
            <template #default="{ row }">
              <el-button @click="openChargeHistory(row)" type="primary" link>{{ t('order.chargeHistory') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes" :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <ChargeHistory ref="chargeHistory"></ChargeHistory>
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
