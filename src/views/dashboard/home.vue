<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-carousel indicator-position="none" height="600px" :interval="5000">
          <el-carousel-item v-for="(item, index) in bannerList" :key="index">
            <div style="width: 100%">
              <video @click="handleBanner(item)" loop :src="item.text.split(',')[0]" muted style="width: 100%" autoplay />
            </div>
          </el-carousel-item>
        </el-carousel>
      </el-col>
    </el-row>

    <div class="app-container">
      <el-card v-loading="loading" shadow="never" style="background-color: #010001">
        <div class="toolbar-wrapper">
          <div>
            <el-row style="margin-top: 40px">
              <el-col :span="24">
                <div style="margin-left: 13%">
                  <span style="font-size: 20px; font-weight: 100; margin-left: 30%">Hyperspce Scan</span>
                  <br />
                  <el-input v-model="searchData.searchTxt" :placeholder="$t('index.searchSpaceTxt')" clearable style="width: 1200px; height: 50px; margin-left: 10px; margin-top: 20px; background-color: #1d1e1f" size="large" class="rounded-search" @clear="handleSearch" @keyup.enter="handleSearch">
                    <template #append>
                      <el-button :icon="Search" @click="handleSearch" />
                    </template>
                  </el-input>
                </div>
              </el-col>
            </el-row>

            <el-row style="margin-top: 60px">
              <el-col :span="24">
                <AppTypeList @open="handleSelectAppType"></AppTypeList>
              </el-col>
            </el-row>

            <el-row style="margin-top: 20px">
              <el-col v-for="(item, index) in tableData" :span="8" :key="index">
                <el-card style="width: 97%; margin-top: 20px" :body-style="{ padding: '0px' }" @click="openApp(item.sid)">
                  <GlobeAppImage :value="item.coverImage" :image="item.image" :key="index"></GlobeAppImage>
                  <div style="padding: 14px">
                    <span style="font-size: 20px; font-weight: 1000"
                      >{{ item.name }}

                      <el-popover placement="right" :width="400" trigger="hover">
                        <template #reference>
                          <el-icon style="cursor: pointer; float: right"><Share /></el-icon>
                        </template>

                        <HShare :url="getHyperdustEpoch(item)" :title="item.name" :image="item.coverImage.split(',')[0]"></HShare>
                      </el-popover>
                    </span>

                    <div class="bottom">
                      <time class="time"
                        >SID：
                        <Substring :value="item.sid"></Substring>
                      </time>
                    </div>

                    <div class="bottom">
                      <time class="time"> {{ item.description }}</time>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
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
        <div class="table-wrapper"></div>
        <div class="pager-wrapper">
          <el-pagination background :layout="paginationData.layout" :page-sizes="paginationData.pageSizes" :total="paginationData.total" :page-size="paginationData.pageSize" :currentPage="paginationData.currentPage" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </el-card>
    </div>

    <GlobeApp ref="globeApp"></GlobeApp>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, reactive, ref, watch } from 'vue'

import { type GetTableData } from '@/api/table/types/table'
import { type FormInstance } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'
import api from '@/utils/api'

import { Search } from '@element-plus/icons-vue'

import AppTypeList from './appTypeList.vue'

import Substring from '@/components/substring.vue'

import GlobeAppImage from '../../../globeAppImage.vue'

import { useI18n } from 'vue-i18n'

import HShare from '@/components/Share.vue'
import GlobeApp from '@/components/GlobeApp.vue'

const searchData = reactive({
  status: 'Y',
  column: 'orderNum',
  order: 'asc',
  pageNo: 1,
  pageSize: 48,
  appTypeId: '',
  active: true,
  searchTxt: '',
})

const globeApp = ref(null)

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
paginationData.pageSizes = [12, 24, 36, 48]
paginationData.pageSize = 48

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const bannerList = ref([])

onBeforeMount(async () => {
  bannerList.value = await api.getDictItems('banner_list')
})

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
  if (searchData.searchTxt) {
    searchData.status = ''
  } else {
    searchData.status = 'Y'
  }
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

function getHyperdustEpoch(record) {
  return location.origin + `/Hyperdust/epoch/${record.sid}`
}

function handleSelectAppType(index) {
  console.info(index)
  searchData.appTypeId = index
  handleSearch()
}

async function handleBanner(item) {
  const array = item.text.split(',')

  if (array.length < 2) {
    return
  }

  await openApp(array[1])
}

function openApp(sid) {
  globeApp.value.openApp(sid)
}

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<style lang="scss" scoped>
:deep .el-input-group__append {
  border-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  box-shadow:
    0 0 0 0 var(--el-input-border-color) inset,
    0 0 0 0 var(--el-input-border-color) inset,
    0 0 0 0 var(--el-input-border-color) inset;
}

:deep .el-input__wrapper {
  display: inline-flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding: 1px 11px;
  background-color: var(--el-input-bg-color, var(--el-fill-color-blank));
  background-image: none;
  border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
  cursor: text;
  transition: var(--el-transition-box-shadow);
  transform: translate3d(0, 0, 0);
  box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
}

:deep .el-card {
  border-radius: var(--el-card-border-radius);
  border: 0px solid var(--el-card-border-color);
  background-color: var(--el-card-bg-color);
  overflow: hidden;
  color: var(--el-text-color-primary);
  transition: var(--el-transition-duration);
}

:deep .el-menu--horizontal {
  display: flex;
  flex-wrap: nowrap;
  border-bottom: solid 0px var(--el-menu-border-color);
  border-right: none;
}

.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
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

.time {
  font-size: 12px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button {
  padding: 0;
  min-height: auto;
}

.image {
  width: 400px;
  height: 200px;
  display: block;
}
</style>
