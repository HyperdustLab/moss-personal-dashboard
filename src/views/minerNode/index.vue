<script lang="ts" setup>
defineOptions({
  // 命名当前组件
  name: 'MinerNode',
})

import { onBeforeMount, reactive, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'
import { ethers } from 'ethers'

import { toAmount, buildContract, exceptionHandling } from '@/utils/index'

import { type GetTableData } from '@/api/table/types/table'
import { ElMessage, type FormInstance, ElLoading } from 'element-plus'
import { usePagination } from '@/hooks/usePagination'

import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import SelectMinerNft from '@/views/minerNftPledge/SelectMinerNft.vue'

import MinerNftPledge from '@/views/minerNftPledge/index.vue'

import { useRouter } from 'vue-router'

const { t } = useI18n()

const router = useRouter()

const minerNftPledge = ref(null)

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)

const status = ref([])
const networkStatus = ref([])
const serviceStatus = ref([])

const user = useUserStore()

let gLoading = null

const selectNode = ref(null)

const minerNodeForm = ref(null)

const multipleSelection = ref([])

const selectMinerNftRef = ref(null)

onBeforeMount(async () => {
  status.value = await api.getDictItems('MinerNode_status')
  networkStatus.value = await api.getDictItems('network_status')
  serviceStatus.value = await api.getDictItems('serviceStatus')
})

const searchData = reactive({
  incomeAddress: useUserStore().username,
  column: 'createTime',
  order: 'desc',
  selectCountAward: true,
})
const getTableData = async () => {
  loading.value = true

  searchData.pageNo = paginationData.currentPage
  searchData.pageSize = paginationData.pageSize

  const { result } = await api.get('/mgn/minerNode/list', searchData)
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

function showMinerNodeForm(record) {
  minerNodeForm.value.show(record)
}

function handleBlockchainMonitoring(row) {
  router.push('/minerNode/monitoring?id=' + row.id)
}

async function batchUpdateServiceStatus(serviceStatus) {
  const ids = multipleSelection.value.map(item => item.id)

  if (ids.length === 0) {
    ElMessage.warning(t('selectiveRecord'))
    return
  }

  loading.value = true

  await api.post('/mgn/minerNode/batchUpdateServiceStatus?serviceStatus=' + serviceStatus, ids)

  loading.value = false

  ElMessage.success(t('operationSuccessfully'))

  handleSearch()
}

function handleSelectionChange(e) {
  multipleSelection.value = e
}

function openMinerNftPledge() {
  minerNftPledge.value.show()
}

async function active(node) {
  const HyperAGI_Node_Mgr = await buildContract(node.blockchainId, 'HyperAGI_Node_Mgr')

  await (await HyperAGI_Node_Mgr.active(node.minerNodeId, { value: BigInt(node.fee) })).wait()

  gLoading.close()
  ElMessage.success('Activated successfully')
  handleSearch()
}

async function handleActive(node) {
  try {
    gLoading = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    const HyperAGI_Miner_NFT_Pledge = await buildContract(node.blockchainId, 'HyperAGI_Miner_NFT_Pledge')

    const pledgeNumArray = await HyperAGI_Miner_NFT_Pledge.getAccountPledgeNum(user.username)

    console.info('pledgeNumArray:', pledgeNumArray)

    if (parseInt(pledgeNumArray[1]) + 1 > parseInt(pledgeNumArray[0])) {
      selectNode.value = node
      selectMinerNftRef.value.show()
    } else {
      await active(node)
    }

    gLoading.close()
  } catch (e) {
    console.log(e)
    gLoading.close()
    exceptionHandling(e, t)
  }
}

async function handleSelectNFT(row) {
  try {
    gLoading = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    const HyperAGI_Miner_NFT_Pledge = await buildContract(row.blockchainId, 'HyperAGI_Miner_NFT_Pledge')
    const HyperAGI_Miner_NFT = await buildContract(row.blockchainId, 'HyperAGI_Miner_NFT')

    const approvedAddress = await HyperAGI_Miner_NFT.getApproved(row.tokenId)

    if (approvedAddress.toLowerCase() !== HyperAGI_Miner_NFT_Pledge.target.toLowerCase()) {
      await (await HyperAGI_Miner_NFT.approve(HyperAGI_Miner_NFT_Pledge.target, parseInt(row.tokenId))).wait()
    }

    await (await HyperAGI_Miner_NFT_Pledge.pledge(row.tokenId)).wait()

    active(selectNode.value)
  } catch (e) {
    console.log(e)
    gLoading.close()
    exceptionHandling(e, t)
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
        <el-form-item :label="t('minerNode.nodeId')">
          <el-input v-model="searchData.minerNodeId" :placeholder="t('placeholderTxt')" />
        </el-form-item>
        <el-form-item :label="t('minerNode.status')">
          <el-select v-model="searchData.status" :placeholder="t('placeholderSelect')" clearable>
            <el-option v-for="item in status" :key="item.value" :label="item.text" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('minerNode.networkStatus')">
          <el-select v-model="searchData.networkStatus" :placeholder="t('placeholderSelect')" clearable>
            <el-option v-for="item in networkStatus" :key="item.value" :label="item.text" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('minerNode.serviceStatus')">
          <el-select v-model="searchData.serviceStatus" :placeholder="t('placeholderSelect')" clearable>
            <el-option v-for="item in serviceStatus" :key="item.value" :label="item.text" :value="item.value" />
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
        <div>
          <el-button type="primary" :loading="loading" @click="batchUpdateServiceStatus('Y')">
            {{ t('minerNode.batchActive') }}
          </el-button>

          <el-button type="" :loading="loading" @click="batchUpdateServiceStatus('N')">
            {{ t('minerNode.batchInactive') }}
          </el-button>

          <el-button @click="openMinerNftPledge">
            {{ t('minerNode.minerNftPledge') }}
          </el-button>
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
        <el-table @selection-change="handleSelectionChange" :data="tableData">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="minerNodeId" :label="t('minerNode.nodeId')" align="center"> </el-table-column>
          <el-table-column prop="ip" :label="t('minerNode.ip')" align="center" />
          <el-table-column prop="networkStatus_dictText" :label="t('minerNode.networkStatus')" align="center"> </el-table-column>
          <el-table-column prop="serviceStatus_dictText" label="Service Status" align="center"> </el-table-column>
          <el-table-column prop="blockchainStatus_dictText" label="Blockchain Status" align="center"> </el-table-column>
          <el-table-column prop="amount" :label="t('minerNode.incomeAmount')" align="center">
            <template #default="{ row }"> {{ toAmount(row.amount) }} HYPT </template>
          </el-table-column>

          <el-table-column prop="amount" :label="t('minerNode.totalSecurityAmount')" align="center">
            <template #default="{ row }"> {{ toAmount(row.totalSecurityAmount) }} HYPT </template>
          </el-table-column>

          <el-table-column width="200" prop="hardwareInformation" label="Hardware Information" align="center">
            <template #default="{ row }">
              <p>CPU：{{ row.cpuNum }}Core</p>
              <p>memory：{{ row.memoryNum }} MB</p>
              <p>hardDisk{{ row.diskNum }} GB</p>
              <p>CUDA：{{ row.cudaNum }}</p>
              <p>videoMemory：{{ row.videoMemory }} MB</p>
            </template>
          </el-table-column>

          <el-table-column prop="blockchainId_dictText" :label="t('minerNode.blockchainNetwork')" align="center"> </el-table-column>

          <el-table-column prop="createTime" :label="t('createTime')" align="center" />

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
                    <el-dropdown-item v-if="row.blockchainStatus === '0x00'" @click="handleActive(row)">Activated</el-dropdown-item>

                    <el-dropdown-item @click="handleBlockchainMonitoring(row)">{{ t('minerNode.monitoringBtnTxt') }}</el-dropdown-item>

                    <!-- <el-dropdown-item @click="handleBlockchainDelete(row)">{{ t("delete") }}</el-dropdown-item> -->
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

    <MinerNftPledge ref="minerNftPledge"></MinerNftPledge>

    <SelectMinerNft ref="selectMinerNftRef" @ok="handleSelectNFT"></SelectMinerNft>
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
