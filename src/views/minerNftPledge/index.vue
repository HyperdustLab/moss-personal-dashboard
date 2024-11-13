<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: 'minerNftPledge',
})

import { onBeforeMount, reactive, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import { type GetTableData } from '@/api/table/types/table'
import { ElMessage, type FormInstance } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import { buildContract, exceptionHandling } from '@/utils/index'

import { toAmount, toLocalTime, toServerTime } from '@/utils/index'

import Substring from '@/components/Substring.vue'

const confirmLoading = ref(false)

const { t } = useI18n()

const drawer = ref(false)

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const searchData = reactive({
  account: useUserStore().walletAddress || useUserStore().username,
  column: 'createTime',
  order: 'desc',
})
const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/minerNftPledge/list', searchData)
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

async function redemption(row) {
  const Hyperdust_Miner_NFT_Pledge = await buildContract(row.blockchainId, 'Hyperdust_Miner_NFT_Pledge')

  try {
    await (await Hyperdust_Miner_NFT_Pledge.redemption(parseInt(row.tokenId))).wait()

    confirmLoading.value = false
    ElMessage.success(t('minerNftPledge.redemptionSuccess'))
  } catch (e) {
    exceptionHandling(e, t)
    confirmLoading.value = false
  }
}

function show() {
  drawer.value = true
  getTableData()
}

defineExpose({
  show,
})

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: false })
</script>

<template>
  <el-drawer v-model="drawer" size="80%" :title="$t('minerNode.minerNftPledge')">
    <div class="app-container">
      <el-card v-loading="loading" shadow="never" class="search-wrapper">
        <el-form ref="searchFormRef" :inline="true" :model="searchData"> </el-form>
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
            <el-table-column prop="tokenCoverImage" :label="t('minerNftPledge.tokenCoverImage')" align="center">
              <template #default="{ row }">
                <el-image class="w-full h-[100px] object-cover" :src="row.tokenCoverImage"></el-image>
              </template>
            </el-table-column>

            <el-table-column width="160" :label="t('minerNftPledge.tokenAddress')" align="center">
              <template #default="{ row }">
                <Substring :value="row.tokenAddress"></Substring>
              </template>
            </el-table-column>

            <el-table-column prop="tokenName" :label="t('minerNftPledge.tokenName')" align="center"> </el-table-column>

            <el-table-column prop="tokenId" :label="t('minerNftPledge.tokenId')" align="center"> </el-table-column>
            <el-table-column prop="allowedRedemptionTime" :label="t('minerNftPledge.allowedRedemptionTime')" align="center">
              <template #default="{ row }"> {{ toLocalTime(row.allowedRedemptionTime) }}</template>
            </el-table-column>

            <el-table-column prop="status_dictText" :label="t('minerNftPledge.status')" align="center"> </el-table-column>

            <el-table-column prop="blockchainId_dictText" :label="t('minerNftPledge.blockchainNetwork')" align="center"> </el-table-column>
            <el-table-column prop="createTime" :label="t('createTime')" align="center">
              <template #default="{ row }"> {{ toLocalTime(row.createTime) }}</template>
            </el-table-column>

            <el-table-column fixed="right" :label="t('actionBtnTxt')" width="150" align="center">
              <template #default="{ row }">
                <el-button :disabled="!row.allowedRedemption" :loading="confirmLoading" @click="redemption(row)" type="primary" link>{{ t('minerNftPledge.redemption') }} </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="pager-wrapper">
          <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes" :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </el-card>
    </div>
  </el-drawer>
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
