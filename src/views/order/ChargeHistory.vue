<template>
    <el-drawer v-model="drawer" :title="$t('order.chargeHistory')">
        <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="epochTime" align="center" :label="$t('chargeHistory.epochTime')" />
            <el-table-column prop="num" align="center" :label="$t('chargeHistory.num')" />
            <el-table-column prop="epochAmount" align="center" :label="$t('chargeHistory.epochAmount')">
                <template #default="{ text, row }">{{ toAmount(row.epochAmount) }}HYPT</template>
            </el-table-column>
        </el-table>
    </el-drawer>
</template>

<script lang="ts" setup>
    import { ref } from "vue"

    import dayjs from "dayjs"

    import { toAmount } from "@/utils/index"

    const tableData = ref([])

    const drawer = ref(false)

    function show(record) {
      drawer.value = true

      tableData.value = []

      const epochAmounts = record.epochAmounts.split(",")

      const epochTimes = record.epochTimes.split(",")

      for (let i = 0; i < epochAmounts.length; i++) {
        if (epochTimes[i] > 0) {
          console.info(epochAmounts[i])
          tableData.value.push({
            epochTime: dayjs.unix(parseInt(epochTimes[i])).format("YYYY-MM-DD HH:mm:ss"),
            epochAmount: epochAmounts[i],
            num: i + 1
          })
        }
      }
    }

    defineExpose({
      show
    })
</script>

<style></style>
