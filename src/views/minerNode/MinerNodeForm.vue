<template>
  <div>
    <el-dialog v-model="dialogVisible" :title="$t('minerNodeForm.title')" width="50%">
      <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="200px" class="demo-ruleForm" status-icon>
        <el-form-item :label="$t('minerNode.blockchainNetwork')" prop="blockchainId">
          {{ currBlockchain.name }}
        </el-form-item>

        <el-form-item :label="$t('minerNode.ip')">
          {{ formData.ip }}
        </el-form-item>

        <template v-if="needPledge">
          <el-form-item :label="$t('minerNodeForm.minerTokenAddress')">
            <Substring v-if="minerTokenAddress" :value="minerTokenAddress" :sub="false"></Substring>
          </el-form-item>

          <el-form-item :label="$t('minerNodeForm.minerTokenId')">
            <el-input readonly :value="selectMinerNft.tokenId" style="width: 20rem" :placeholder="$t('placeholderTxt')">
              <template #append>
                <el-button @click="showSelectMinerNft">Select</el-button>
              </template>
            </el-input>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="close">Cancel</el-button>
          <el-button type="primary" :loading="confirmLoading" @click="submitForm"> Confirm </el-button>
        </span>
      </template>
    </el-dialog>

    <SelectMinerNft ref="selectMinerNftRef" @ok="handleSelectNFT"> </SelectMinerNft>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, reactive, onBeforeMount } from 'vue'

import SelectMinerNft from '@/views/minerNftPledge/SelectMinerNft.vue'

import Substring from '@/components/Substring.vue'

import api from '@/utils/api'

import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)

const confirmLoading = ref(false)

const needPledge = ref(false)

import { useUserStore } from '@/store/modules/user'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const currBlockchain = ref({})

const minerTokenAddress = ref(null)

const ruleFormRef = ref<FormInstance>(null)

import { buildContract } from '@/utils/index'
import { exceptionHandling } from '@/utils'

const user = useUserStore()

const selectMinerNft = ref({})

const selectMinerNftRef = ref(null)

const formData = reactive<Record<string, any>>({
  id: '',
  incomeAddress: '',
  ip: '',
  status: '',
  nodeType: '',
  price: undefined,
  hardwareinformation: '',
  blockchainId: '',
  minerNodeId: null,
})

async function getCurrBlockchain() {
  const curr_blockchain = await api.getDictText('sys_config', 'curr_blockchain')

  const { result } = await api.get('/mgn/blockchain/queryById', { id: curr_blockchain })

  currBlockchain.value = result

  formData.blockchainId = curr_blockchain
}

const rules = reactive<FormRules<RuleForm>>({
  blockchainId: [{ required: true, message: t('minerNodeForm.blockchainRuleTxt'), trigger: 'blur' }],
  price: [{ required: true, message: t('minerNodeForm.priceRuleTxt'), trigger: 'blur' }],
})

function close() {
  dialogVisible.value = false
}

function submitForm() {
  ruleFormRef.value.validate(async valid => {
    if (valid) {
      confirmLoading.value = true

      const HyperAGI_Node_Mgr = await buildContract(formData.blockchainId, 'HyperAGI_Node_Mgr')

      try {
        if (needPledge.value) {
          const HyperAGI_Miner_NFT_Pledge = await buildContract(formData.blockchainId, 'HyperAGI_Miner_NFT_Pledge')
          const HyperAGI_Miner_NFT = await buildContract(formData.blockchainId, 'HyperAGI_Miner_NFT')

          const approvedAddress = await HyperAGI_Miner_NFT.getApproved(selectMinerNft.value.tokenId)

          if (approvedAddress.toLowerCase() !== HyperAGI_Miner_NFT_Pledge.target.toLowerCase()) {
            await (await HyperAGI_Miner_NFT.approve(HyperAGI_Miner_NFT_Pledge.target, parseInt(selectMinerNft.value.tokenId))).wait()
          }

          await (await HyperAGI_Miner_NFT_Pledge.pledge(selectMinerNft.value.tokenId)).wait()
        }

        await (await HyperAGI_Node_Mgr.addNode(formData.incomeAddress, formData.ip, [formData.cpuNum, formData.memoryNum, formData.diskNum, formData.cudaNum, formData.videoMemory])).wait()

        confirmLoading.value = false
        dialogVisible.value = false
        ElMessage.success(t('minerNodeForm.successTxt'))
      } catch (e) {
        exceptionHandling(e, t)
        confirmLoading.value = false
      }
    } else {
      return false
    }
  })
}

function handleSelectNFT(row) {
  selectMinerNft.value = row
}

function show(record) {
  dialogVisible.value = true
  confirmLoading.value = false
  nextTick(async () => {
    //赋值
    Object.assign(formData, record)

    await getCurrBlockchain()

    const accountPledgeNum = await getAccountPledgeNum()

    const minerNodeNum = await getMinerNodeNum()

    if (minerNodeNum + 1 > accountPledgeNum) {
      needPledge.value = true
    }

    const HyperAGI_Miner_NFT = await api.getSmartContractByCode('HyperAGI_Miner_NFT', currBlockchain.value.id)

    minerTokenAddress.value = HyperAGI_Miner_NFT.address
  })
}

async function getAccountPledgeNum() {
  const { result } = await api.get('/mgn/minerNftPledge/list', { account: user.username, status: '1', pageSize: 1, blockchainId: currBlockchain.value.id })

  return result.total
}

async function getMinerNodeNum() {
  const { result } = await api.get('/mgn/minerNode/list', { incomeAddress: user.username, status: '0,1,2', pageSize: 1, blockchainId: currBlockchain.value.id })

  return result.total
}

function showSelectMinerNft() {
  selectMinerNftRef.value.show()
}

defineExpose({
  show,
})
</script>

<style></style>
