<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: 'Space',
})

import { reactive, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

import { type GetTableData } from '@/api/table/types/table'
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'
import SpaceForm from './SpaceForm.vue'
import Substring from '@/components/Substring.vue'

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

import { buildContract, toLocalTime } from '@/utils/index.ts'

import { CirclePlus, Search } from '@element-plus/icons-vue'

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const name = ref(null)

const spaceForm = ref(null)

const searchData = reactive({
  account: useUserStore().username,
  sid: '',
  searchTxt: '',
})

const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/globeApp/list', searchData)
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

function showSpaceForm(record) {
  spaceForm.value.show(record)
}

async function delSpace(record) {
  const Hyperdust_Space = await buildContract(record.blockchainId, 'Hyperdust_Space')

  try {
    await (await Hyperdust_Space.del(record.sid)).wait()
    resetSearch()
  } catch (e) {
    console.log(e)
    ElMessage.error(e.reason || e.message || e)
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
        <el-form-item>
          <el-input v-model="searchData.searchTxt" :placeholder="$t('index.searchSpaceTxt')" clearable style="width: 500px; margin-top: 20px; background-color: #1d1e1f" size="large" class="rounded-search" @clear="handleSearch" @keyup.enter="handleSearch">
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="showSpaceForm(null)">{{ t('addBtnTitle') }}</el-button>
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
        <el-table :data="tableData">
          <el-table-column :label="t('space.coverImage')" align="center">
            <template #default="{ row }">
              <el-image style="width: 100px; height: 100px" :src="row.coverImage.split(',')[0]" fit="contain" />
            </template>
          </el-table-column>

          <el-table-column :label="t('space.image')" align="center">
            <template #default="{ row }">
              <el-image v-if="row.image" style="width: 100px; height: 100px" :src="row.image" fit="contain" />
            </template>
          </el-table-column>

          <el-table-column prop="appTypeId_dictText" :label="t('space.appType')" align="center" />

          <el-table-column prop="sid" :label="t('space.sid')" align="center">
            <template #default="{ row }">
              <Substring :value="row.sid" />
            </template>
          </el-table-column>

          <el-table-column prop="name" :label="t('space.name')" align="center" />

          <el-table-column prop="transactionHash" :label="t('space.transactionHash')" align="center">
            <template #default="{ row }">
              <Substring :value="row.transactionHash"></Substring>
            </template>
          </el-table-column>

          <el-table-column prop="blockchainId_dictText" :label="t('space.blockchainNetwork')" align="center" />

          <el-table-column prop="createTime" :label="t('createTime')" align="center">
            <template #default="{ row }"> {{ toLocalTime(row.createTime) }}</template>
          </el-table-column>
          <el-table-column fixed="right" :label="t('actionBtnTxt')" width="150" align="center">
            <template #default="{ row }">
              <el-dropdown>
                <span class="el-dropdown-link">
                  {{ t('actionBtnTxt') }}
                  <el-icon class="el-icon--right">
                    <arrow-down />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="showSpaceForm(row)">{{ t('space.updateSpace') }}</el-dropdown-item>

                    <el-dropdown-item @click="delSpace(row)">{{ t('space.delSpace') }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes" :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <SpaceForm @ok="resetSearch" ref="spaceForm"> </SpaceForm>
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
