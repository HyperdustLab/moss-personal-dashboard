<template>
  <div class="more-text">
    <span v-if="!isExpanded && text.length > maxLength">
      {{ text.substring(0, maxLength) }}...
      <el-button type="primary" link @click="showMore"> More </el-button>
    </span>
    <span v-else>{{ text }}</span>

    <el-dialog v-model="dialogVisible" :title="title" width="30%" align-center>
      <div class="dialog-content">
        <span style="white-space: pre-wrap">{{ text }}</span>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  // 显示的文本内容
  text: {
    type: String,
    required: true,
  },
  // 最大显示长度
  maxLength: {
    type: Number,
    default: 100,
  },
  // 弹窗标题
  title: {
    type: String,
    default: 'More',
  },
})

const isExpanded = ref(false)
const dialogVisible = ref(false)

const showMore = () => {
  dialogVisible.value = true
}
</script>

<style lang="scss" scoped>
:deep(.el-dialog) {
  background: #1a1a1a;

  .el-dialog__header {
    margin: 0;
    padding: 15px 20px;

    .el-dialog__title {
      color: #fff;
    }
  }

  .el-dialog__body {
    color: #fff;
    padding: 0;
  }
}

.more-text {
  display: inline;
  word-break: break-all;
}

.dialog-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #4a4a4a; // 更深色的滚动条
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #2a2a2a; // 更深色的滚动条轨道
  }
}
</style>
