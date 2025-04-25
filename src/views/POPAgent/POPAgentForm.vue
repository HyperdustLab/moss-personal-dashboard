<template>
  <el-dialog v-model="dialogVisible" title="Edit POPAgent NFT" width="50%">
    <el-form v-if="dialogVisible" ref="ruleFormRef" :model="formData" :rules="rules" label-width="200px" class="demo-ruleForm" status-icon>
      <el-form-item label="Avatar" prop="avatar">
        <UploadImage v-model="formData.avatar" :limit="1" action="/sys/common/ipfsUpload"></UploadImage>
      </el-form-item>

      <el-form-item label="Nick Name" prop="nickName">
        <el-input v-model="formData.nickName" :placeholder="$t('placeholderTxt')" />
      </el-form-item>

      <el-form-item label="Welcome Message" prop="welcomeMessage">
        <el-input v-model="welcomeMessage" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" :placeholder="$t('placeholderTxt')" />
      </el-form-item>

      <el-form-item label="Personalization" prop="personalization">
        <el-input v-model="formData.personalization" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" :placeholder="$t('placeholderTxt')" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">Cancel</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="submitForm"> Confirm </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, nextTick, reactive, onBeforeMount, computed } from 'vue'
import api from '@/utils/api'

import { ElMessage } from 'element-plus'

import UploadImage from '@/components/UploadImage/index.vue'

const dialogVisible = ref(false)

const confirmLoading = ref(false)

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const ruleFormRef = ref<FormInstance>(null)

const defaultWelcomeMessage = ref(null)

import { exceptionHandling, buildContract } from '@/utils'

const emit = defineEmits(['ok'])

const isAdd = ref(false)

const blockchainId = ref(null)

const formData = reactive<Record<string, any>>({
  tokenId: '',
  avatar: '',
  nickName: '',
  personalization: '',
  welcomeMessage: '',
  sid: '',
})

const welcomeMessage = computed({
  get: () => {
    if (formData.welcomeMessage) {
      return formData.welcomeMessage
    } else {
      return defaultWelcomeMessage.value?.replace('[agentName]', formData.nickName) || ''
    }
  },
  set: value => {
    formData.welcomeMessage = value
  },
})

const rules = reactive<FormRules<RuleForm>>({
  avatar: [{ required: true, message: 'Please upload avatar', trigger: 'blur' }],
  nickName: [{ required: true, message: 'Please input nick name', trigger: 'blur' }],
  personalization: [{ required: true, message: 'Please input personalization', trigger: 'blur' }],
  erc721Name: [{ required: true, message: 'Please input ERC721 name', trigger: 'blur' }],
  erc721Symbol: [{ required: true, message: 'Please input ERC721 symbol', trigger: 'blur' }],
  erc1155Name: [{ required: true, message: 'Please input ERC1155 name', trigger: 'blur' }],
  erc1155Symbol: [{ required: true, message: 'Please input ERC1155 symbol', trigger: 'blur' }],
})

function close() {
  dialogVisible.value = false
}

function submitForm() {
  ruleFormRef.value.validate(async valid => {
    if (valid) {
      confirmLoading.value = true

      const HyperAGI_Agent = await buildContract(blockchainId.value, 'HyperAGI_Agent')

      try {
        if (isAdd.value) {
          console.info(formData.tokenId, formData.avatar, formData.nickName, formData.personalization)
          await (await HyperAGI_Agent.mintV3(formData.tokenId, [formData.avatar, formData.nickName, formData.personalization, welcomeMessage.value])).wait()
        } else {
          debugger
          await (await HyperAGI_Agent.updateV3(formData.sid, [formData.avatar, formData.nickName, formData.personalization, welcomeMessage.value])).wait()
        }

        emit('ok')

        dialogVisible.value = false
        confirmLoading.value = false
      } catch (e) {
        exceptionHandling(e, t)
        confirmLoading.value = false
      }
    } else {
      return false
    }
  })
}

function show(row) {
  blockchainId.value = row.blockchainId

  confirmLoading.value = false

  if (row.agent) {
    isAdd.value = false
    Object.assign(formData, row.agent)
  } else {
    Object.assign(formData, {
      tokenId: row.tokenId,
      avatar: '',
      nickName: '',
      personalization: '',
      welcomeMessage: '',
    })

    isAdd.value = true
  }

  dialogVisible.value = true

  nextTick(() => {
    ruleFormRef.value.resetFields()
  })
}

onBeforeMount(async () => {
  defaultWelcomeMessage.value = await api.getDictText('sys_config', 'welcomeMessage')
})

defineExpose({
  show,
})
</script>

<style></style>
