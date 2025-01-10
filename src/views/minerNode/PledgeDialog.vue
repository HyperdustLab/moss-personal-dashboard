<template>
  <el-dialog title="Pledge" v-model="dialogVisible" width="30%">
    <el-form ref="pledgeFormRef" :model="pledgeForm" :rules="rules">
      <el-form-item label="Pledge Amount" prop="amount" :label-width="formLabelWidth">
        <el-input type="number" v-model="pledgeForm.amount" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="Pledge KEY Quantity" prop="keyAmount" :label-width="formLabelWidth">
        <el-input type="number" v-model="pledgeForm.keyAmount" auto-complete="off"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="submitPledgeForm"> {{ $t('confirm') }} </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
const dialogVisible = ref(false)

import api from '@/utils/api'
import { useUserStore } from '@/store/modules/user'

import { ethers } from 'ethers'

import { useI18n } from 'vue-i18n'

import { toAmount, buildContract, exceptionHandling, getSmartContractByCode } from '@/utils/index'

import { ElMessage, type FormInstance, ElLoading } from 'element-plus'

const pledgeFormRef = ref()

let gLoading = null

const { t } = useI18n()

const user = useUserStore()

const formLabelWidth = '200px'

let node

const pledgeForm = reactive({
  amount: '',
  keyAmount: '',
})

const rules = reactive({
  amount: [{ required: true, message: 'Please enter the pledge amount', trigger: 'blur' }],
  keyAmount: [{ required: true, message: 'Please enter the pledge KEY quantity', trigger: 'blur' }],
})

const submitPledgeForm = async () => {
  pledgeFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        gLoading = ElLoading.service({
          lock: true,
          text: 'Loading',
          background: 'rgba(0, 0, 0, 0.7)',
        })

        const HyperAGI_Node_Pool = await getSmartContractByCode('HyperAGI_Node_Pool', node.blockchainId)

        const HyperAGI_KEY_Token = await buildContract(node.blockchainId, 'HyperAGI_KEY_Token')

        const isApprovedForAll = await HyperAGI_KEY_Token.isApprovedForAll(user.walletAddress, HyperAGI_Node_Pool.address)

        if (!isApprovedForAll) {
          await (await HyperAGI_KEY_Token.setApprovalForAll(HyperAGI_Node_Pool.address, true)).wait()
        }

        const HyperAGI_Node_Mgr = await buildContract(node.blockchainId, 'HyperAGI_Node_Mgr')

        const amount = BigInt(ethers.parseEther(pledgeForm.amount).toString()) + BigInt(node.fee)

        await (await HyperAGI_Node_Mgr.active(node.minerNodeId, ethers.parseEther(pledgeForm.amount), pledgeForm.keyAmount, { value: amount })).wait()

        gLoading.close()
        dialogVisible.value = false

        ElMessage.success('Pledge successful')
      } catch (e) {
        console.log(e)
        gLoading.close()
        exceptionHandling(e, t)
      }
    }
  })
}

function show(_node) {
  dialogVisible.value = true
  node = _node
}

defineExpose({
  show,
})
</script>

<style></style>
