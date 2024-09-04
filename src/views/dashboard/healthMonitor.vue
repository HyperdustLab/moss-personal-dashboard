<script lang="ts" setup>
import { onBeforeMount, reactive, ref } from 'vue'

import { useI18n } from 'vue-i18n'

import { type GetTableData } from '@/api/table/types/table'
import { ElMessage, type FormInstance } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'
import ServerRows from '@/views/dashboard/serverRows.vue'
import Epoch2DRender from './Epoch2DRender.vue'

import GlobeApp from '@/components/GlobeApp.vue'

const globeApp = ref(null)

defineOptions({
  // 命名当前组件
  name: 'HealthMonitor',
})

const { t } = useI18n()

const serverRows = ref(null)

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const epoch2DRender = ref(null)

onBeforeMount(async () => {
  getTableData()
})

const searchData = reactive({
  type: '',
})
const getTableData = async () => {
  loading.value = true
  const { result } = await api.get('/mgn/petals/getHealthMonitor', searchData)
  const data = JSON.parse(result)

  console.info(data)

  tableData.value = data.model_reports
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

function openServerRows(row) {
  serverRows.value.show(row)
}

function openEpoch2DRender() {
  globeApp.value.openApp('0xc3198fb8162f61b95bde3e1a08e56ae57a35aa086e98ea551712b33d58e067d2')
}

function openMiningByGenerate() {
  window.open('https://hyperdust-foundation.gitbook.io/run-a-hyperdust-node/')
}
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item>
          <el-radio-group v-model="searchData.type">
            <el-radio-button label="Public" value="1" />
            <el-radio-button label="Private" style="margin-left: 20px" value="2" />
          </el-radio-group>
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
          <el-table-column prop="name" :label="$t('model_reports.name')" align="center" />
          <el-table-column prop="short_name" :label="$t('model_reports.short_name')" align="center" />
          <el-table-column prop="repository" :label="$t('model_reports.repository')" align="center" />
          <el-table-column :label="$t('model_reports.userAI')" align="center">
            <template #default="{ row }">
              <el-link :disabled="row.state !== 'healthy'" type="primary" @click="openEpoch2DRender">
                {{ $t('model_reports.startAI') }}
              </el-link>
            </template>
          </el-table-column>

          <el-table-column prop="miningByGenerate" :label="$t('model_reports.miningByGenerate')" align="center">
            <template #default="{ row }">
              <el-link type="primary" @click="openMiningByGenerate">
                {{ $t('model_reports.miningByPurchaseTxt') }}
              </el-link>
            </template>
          </el-table-column>

          <el-table-column prop="dht_prefix" :label="$t('model_reports.dht_prefix')" align="center" />
          <el-table-column prop="state" :label="$t('model_reports.state')" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.state === 'healthy'" type="success">{{ row.state }}</el-tag>
              <el-tag v-else type="danger">{{ row.state }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="num_blocks" :label="$t('model_reports.num_blocks')" align="center" />

          <el-table-column fixed="right" :label="t('actionBtnTxt')" width="150" align="center">
            <template #default="{ row }">
              <el-button type="primary" @click="openServerRows(row)" link>{{ t('model_reports.server_rows') }} </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <ServerRows ref="serverRows"></ServerRows>

    <GlobeApp ref="globeApp"></GlobeApp>
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

::v-deep .el-card {
  border-radius: var(--el-card-border-radius);
  border: 0px solid var(--el-card-border-color);
  background-color: black;
  overflow: hidden;
  color: var(--el-text-color-primary);
  transition: var(--el-transition-duration);
}
</style>
