<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="24" style="margin-top: 10px">
        <div style="float: right; margin-right: 10px">
          <el-button v-for="(item, index) in dates" @click="handleSelectDate(item.value)" size="large" :key="index"
            style="font-size: 17px" :type="item.value === currDate ? 'primary' : 'info'" link>{{ item.title }}</el-button>
        </div>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px" :gutter="20">
      <el-col :span="8">
        <v-chart style="height: 500px" :option="cpuUseOption" autoresize />
      </el-col>

      <el-col :span="8">
        <v-chart style="height: 500px" :option="memoryUseOption" autoresize />
      </el-col>

      <el-col :span="8">
        <v-chart style="height: 500px" :option="hardDiskUseOption" autoresize />
      </el-col>

      <el-col :span="8">
        <v-chart style="height: 500px" :option="gpuUseOption" autoresize />
      </el-col>

      <el-col :span="8">
        <v-chart style="height: 500px" :option="uplinkNetworkOption" autoresize />
      </el-col>

      <el-col :span="8">
        <v-chart style="height: 500px" :option="downlinkNetworkOption" autoresize />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch, onBeforeMount, provide } from "vue"

import { default as dayjs } from "dayjs"

import { useI18n } from "vue-i18n"

const { t } = useI18n()

import { useRoute } from "vue-router"

const route = useRoute()

const id = route.query.id

const dates = [
  { title: t("monitoring.1h"), value: "1h" },
  { title: t("monitoring.3h"), value: "3h" },
  { title: t("monitoring.12h"), value: "12h" },
  { title: t("monitoring.1d"), value: "1d" },
  { title: t("monitoring.3d"), value: "3d" },
  { title: t("monitoring.1w"), value: "1w" }
]
const currDate = ref(dates[0].value)

import api from "@/utils/api"

import "echarts"

import VChart, { THEME_KEY } from "vue-echarts"

provide(THEME_KEY, "dark")

const cpuUseOption = ref({})
const memoryUseOption = ref({})
const hardDiskUseOption = ref({})
const gpuUseOption = ref({})
const uplinkNetworkOption = ref({})
const downlinkNetworkOption = ref({})

onBeforeMount(() => {
  listMonitorInfo(currDate.value)
})

function handleSelectDate(date) {
  currDate.value = date

  listMonitorInfo(date)
}

async function listMonitorInfo(date) {
  console.info(date)

  const dateUnit = date.substring(date.length - 1, date.length)
  const value = parseInt(currDate.value.substring(0, currDate.value.length))

  console.info(dateUnit)

  let endTimeStr = dayjs().format("YYYY-MM-DD HH:mm:ss")
  console.info(value)
  let startTimeStr = dayjs().subtract(value, dateUnit).format("YYYY-MM-DD HH:mm:ss")

  console.info(startTimeStr, endTimeStr)

  const { result } = await api.get("/mgn/nodeMonitor/list", {
    startTimeStr, endTimeStr, minerNodeId: id, pageSize: -1, column: "createTime",
    order: "asc"
  })

  const xAxis = []

  const cpuSeriesData = []
  const memorySeriesData = []
  const hardDiskSeriesData = []
  const gpuSeriesData = []
  const uplinkNetworkSeriesData = []
  const downlinkNetworkSeriesData = []

  for (const item of result.records) {
    xAxis.push(item.createTime)
    cpuSeriesData.push(item.cpuUse)
    memorySeriesData.push(item.memoryUse)
    hardDiskSeriesData.push(item.hardDiskUse)
    gpuSeriesData.push(item.gpuUse)
    uplinkNetworkSeriesData.push(item.uplinkNetwork)
    downlinkNetworkSeriesData.push(item.downlinkNetwork)
  }

  cpuUseOption.value = initCPUUseOption(xAxis, cpuSeriesData)
  memoryUseOption.value = initMemoryUseOption(xAxis, memorySeriesData)
  hardDiskUseOption.value = initHardDiskUseOption(xAxis, hardDiskSeriesData)
  gpuUseOption.value = initGPUUseUseOption(xAxis, gpuSeriesData)
  uplinkNetworkOption.value = initUplinkNetworkOption(xAxis, uplinkNetworkSeriesData)
  downlinkNetworkOption.value = initDownlinkNetworkOption(xAxis, downlinkNetworkSeriesData)
}

function initCPUUseOption(xAxis, seriesData) {
  const option = {
    title: {
      text: t("monitoring.gpuUSETxt")
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: [t("monitoring.cpuName")]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxis
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        name: t("monitoring.cpuName"),
        type: "line",
        data: seriesData
      }
    ]
  }

  console.info(option)

  return option
}

function initMemoryUseOption(xAxis, seriesData) {
  const option = {
    title: {
      text: t("monitoring.memoryUSETxt")
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: [t("monitoring.memoryName")]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxis
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        name: t("monitoring.memoryName"),
        type: "line",
        data: seriesData
      }
    ]
  }

  return option
}

function initHardDiskUseOption(xAxis, seriesData) {
  const option = {
    title: {
      text: t("monitoring.hardDiskUSETxt")
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: [t("monitoring.hardDiskName")]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxis
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        name: t("monitoring.hardDiskName"),
        type: "line",
        data: seriesData
      }
    ]
  }

  return option
}

function initGPUUseUseOption(xAxis, seriesData) {
  const option = {
    title: {
      text: t("monitoring.GPUUSETxt")
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: [t("monitoring.gpuName")]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxis
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        name: t("monitoring.gpuName"),
        type: "line",
        data: seriesData
      }
    ]
  }

  return option
}

function initUplinkNetworkOption(xAxis, seriesData) {
  const option = {
    title: {
      text: t("monitoring.uplinkNetworkTxt")
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: [t("monitoring.uplinkNetworkName")]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxis
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        name: t("monitoring.uplinkNetworkName"),
        type: "line",
        data: seriesData
      }
    ]
  }

  return option
}

function initDownlinkNetworkOption(xAxis, seriesData) {
  const option = {
    title: {
      text: t("monitoring.downlinkNetworkTxt")
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: [t("monitoring.downlinkNetworkName")]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxis
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        name: t("monitoring.downlinkNetworkName"),
        type: "line",
        data: seriesData
      }
    ]
  }

  return option
}
</script>

<style scoped lang="scss">
.el-button--info.is-link,
.el-button--info.is-plain,
:deep() .el-button--info.is-text {
  --el-button-text-color: #ffffff;
  --el-button-bg-color: var(--el-color-info-light-9);
  --el-button-border-color: var(--el-color-info-light-5);
  --el-button-hover-text-color: var(--el-color-white);
  --el-button-hover-bg-color: var(--el-color-info);
  --el-button-hover-border-color: var(--el-color-info);
  --el-button-active-text-color: var(--el-color-white);
}
</style>
