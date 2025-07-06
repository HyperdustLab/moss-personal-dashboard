<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: 'POPAgent',
})

import { reactive, ref, watch, onMounted } from 'vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

import { type GetTableData } from '@/api/table/types/table'
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import Substring from '@/components/Substring.vue'
import Moretext from '@/components/Moretext.vue'
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

import { buildContract, toLocalTime } from '@/utils/index.ts'

import { CirclePlus, Search } from '@element-plus/icons-vue'

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const refPOPAgentForm = ref(null)

const searchData = reactive({
  owner: useUserStore().walletAddress || useUserStore().username,
  smartContractCode: 'HyperAGI_KEY_Token',
})

const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/nft/list', searchData)
  tableData.value = result.records
  paginationData.total = result.total
  loading.value = false
}
const handleSearch = () => {
  if (name.value) {
    searchData.name = `*${name.value}*`
  } else {
    delete searchData.name
  }
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item>
          <el-form-item label="Token ID">
            <el-input v-model="searchData.tokenId" />
          </el-form-item>

          <el-form-item label="ContractAddress">
            <el-input v-model="searchData.contractAddress" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">{{ t('searchBtnTxt') }}</el-button>

            <!-- <el-button :icon="Refresh" @click="resetSearch">重置</el-button> -->
          </el-form-item>
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
          <el-table-column label="Cover Image" align="center">
            <template #default="{ row }">
              <el-image style="width: 100px; height: 100px" :src="row.coverImage" fit="contain" />
            </template>
          </el-table-column>

          <el-table-column prop="contractAddress" label="Agent Pop Nft Address" align="center">
            <template #default="{ row }">
              <Substring :value="row.contractAddress" />
            </template>
          </el-table-column>

          <el-table-column prop="tokenId" label="Token ID" align="center" />

          <el-table-column prop="blockchainId_dictText" :label="t('space.blockchainNetwork')" align="center" />

          <el-table-column prop="createTime" :label="t('createTime')" align="center">
            <template #default="{ row }"> {{ toLocalTime(row.createTime) }}</template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes" :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
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
