<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: "myBuyNftTransaction"
})

import { reactive, ref, watch, onBeforeMount } from "vue"

import { useI18n } from "vue-i18n"

const { t } = useI18n()

import { type GetTableData } from "@/api/table/types/table"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import api from "@/utils/api"
import { useUserStore } from "@/store/modules/user"
import Substring from "@/components/Substring.vue"

import { toAmount, toLocalTime, toServerTime } from "@/utils/index"

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const createTimes = ref([])
const sumData = ref(null)
const blockchainList = ref([])

const searchData = reactive({
  column: "createTime",
  order: "desc",
  buyer: useUserStore().username,
  blockNumber: "",
  createTime_begin: "",
  createTime_end: ""
})

onBeforeMount(async () => {
  await getBlockchainList()
})

const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get("/mgn/nftTransactionRecord/list", searchData)

  sum()
  tableData.value = result.records
  paginationData.total = result.total
  loading.value = false
}
const handleSearch = () => {
  console.info(searchData)

  searchData.createTime_begin = ""
  searchData.createTime_end = ""

  if (createTimes.value) {
    searchData.createTime_begin = toServerTime(createTimes.value[0])
    searchData.createTime_end = toServerTime(createTimes.value[1])
  }

  console.info(searchData)
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

async function sum() {
  const { result } = await api.get("/mgn/nftTransactionRecord/sum", searchData)
  sumData.value = result
}

async function getBlockchainList() {
  const { result } = await api.get("/mgn/blockchain/list", { status: "Y", pageSize: -1 })

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
        <el-form-item :label="t('NftTransactionRecord.transactionRecordId')">
          <el-input v-model="searchData.transactionRecordId" :placeholder="t('placeholderTxt')" />
        </el-form-item>

        <el-form-item :label="t('NftTransactionRecord.seller')">
          <el-input v-model="searchData.seller" :placeholder="t('placeholderTxt')"></el-input>
        </el-form-item>

        <el-form-item :label="t('NftTransactionRecord.transactionHash')">
          <el-input v-model="searchData.transactionHash" :placeholder="t('placeholderTxt')"></el-input>
        </el-form-item>

        <el-form-item :label="t('order.blockchainNetwork')">
          <el-select v-model="searchData.blockchainId" :placeholder="t('placeholderSelect')" clearable>
            <el-option v-for="item in blockchainList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('NftTransactionRecord.createTime')">
          <el-date-picker v-model="createTimes" type="daterange" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">{{ t("searchBtnTxt") }}</el-button>
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
          <el-table-column width="100" prop="transactionRecordId" :label="t('NftTransactionRecord.transactionRecordId')" align="center" />
          <el-table-column width="140" prop="coverImage" :label="t('NftTransactionRecord.nftCoverImage')" align="center">
            <template #default="{ row }">
              <el-image style="width: 100px; height: 100px" :src="row.coverImage" fit="cover" />
            </template>
          </el-table-column>
          <el-table-column prop="name" :label="t('NftTransactionRecord.nftName')" align="center">
            <template #default="{ row }">
              {{ row.name }}
            </template>
          </el-table-column>

          <el-table-column prop="tokenId" :label="t('NftTransactionRecord.tokenId')" align="center">
          </el-table-column>

          <el-table-column width="160" :label="t('NftTransactionRecord.contractAddress')" align="center">
            <template #default="{ row }">
              <Substring :value="row.contractAddress"></Substring>
            </template>
          </el-table-column>

          <el-table-column width="160" :label="t('NftTransactionRecord.seller')" align="center">
            <template #default="{ row }">
              <Substring :value="row.seller"></Substring>
            </template>
          </el-table-column>

          <el-table-column prop="amount" :label="t('NftTransactionRecord.amount')" align="center">
            <template #default="{ row }"> {{ toAmount(row.amount) }}HYPT </template>
          </el-table-column>
          <el-table-column prop="price" :label="t('NftTransactionRecord.price')" align="center">
            <template #default="{ row }"> {{ toAmount(row.price) }}HYPT </template>
          </el-table-column>
          <el-table-column prop="num" :label="t('NftTransactionRecord.num')" align="center"> </el-table-column>
          <el-table-column prop="commission" :label="t('NftTransactionRecord.commission')" align="center">
            <template #default="{ row }"> {{ toAmount(row.commission) }}HYPT </template>
          </el-table-column>

          <el-table-column prop="blockchainId_dictText" :label="t('NftTransactionRecord.blockchain')" align="center">
          </el-table-column>
          <el-table-column prop="transactionHash" :label="t('NftTransactionRecord.transactionHash')" align="center">

            <template #default="{ row }">

              <Substring :value="row.transactionHash"></Substring>

            </template>

          </el-table-column>

          <el-table-column width="180" prop="createTime" :label="t('NftTransactionRecord.createTime')" align="center">
            <template #default="{ row }"> {{ toLocalTime(row.createTime) }}</template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes" :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <div style="height: 60px; text-align: center; margin-top: 20px">
      <el-tag style="font-size: 15px; height: 40px; padding-top: 10px">
        <span>{{ $t("NftTransactionRecord.payAmount") }}: {{ toAmount(sumData || 0) }}HYPT</span>
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
