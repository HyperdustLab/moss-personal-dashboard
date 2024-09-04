<script lang="ts" setup>

    import {onBeforeMount, reactive, ref} from "vue"


    import {type GetTableData} from "@/api/table/types/table"
    import {type FormInstance} from "element-plus"


    defineOptions({
      // 命名当前组件
      name: "ServerRows"
    })


    const loading = ref<boolean>(false)


    const tableData = ref<GetTableData[]>([])
    const searchFormRef = ref<FormInstance | null>(null)

    const drawer = ref(false)


    function show(record) {

      tableData.value = record.server_rows
      drawer.value = true


    }

    defineExpose({
      show
    })
</script>

<template>
    <el-drawer v-model="drawer" size="80%" :title="$t('server_rows.title')">
        <div class="app-container">
            <el-card v-loading="loading" shadow="never" class="search-wrapper">
                <el-form ref="searchFormRef" :inline="true" :model="searchData"></el-form>
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
                        <el-table-column prop="short_peer_id" :label="$t('server_rows.short_peer_id')" align="center" />
                        <el-table-column prop="peer_id" :label="$t('server_rows.peer_id')" align="center" />
                        <el-table-column prop="state" :label="$t('server_rows.state')" align="center" />
                        <el-table-column prop="throughput" :label="$t('server_rows.throughput')" align="center">
                            <template #default="{row}"> {{ row.span.server_info.throughput }} tok/s</template>
                        </el-table-column>

                        <el-table-column :label="$t('server_rows.servedBlocks')" align="center">
                            <template #default="{row}"> {{ row.span.start }}-{{ row.span.end }}</template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-card>
        </div>
    </el-drawer>
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
