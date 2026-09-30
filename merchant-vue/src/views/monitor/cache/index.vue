<template>
  <div class="p-2">
    <el-row :gutter="10">
      <el-col :span="24" class="card-box">
        <el-card shadow="hover">
          <template #header>
            <Monitor style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">Basic Information</span>
          </template>

          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table style="width: 100%">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Redis Version</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.redis_version }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Run Mode</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.redis_mode === 'standalone' ? 'Standalone' : 'Cluster' }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Port</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.tcp_port }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Client Count</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.connected_clients }}</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Uptime (days)</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.uptime_in_days }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Used Memory</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.used_memory_human }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">CPU Usage</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ parseFloat(cache.info.used_cpu_user_children).toFixed(2) }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Memory Configuration</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.maxmemory_human }}</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">AOF Enabled</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.aof_enabled === '0' ? 'No' : 'Yes' }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">RDB Success</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.rdb_last_bgsave_status }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Key Count</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.dbSize" class="cell">{{ cache.dbSize }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Network Ingress/Egress</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">
                      {{ cache.info.instantaneous_input_kbps }}kps/{{ cache.info.instantaneous_output_kbps }}kps
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card shadow="hover">
          <template #header>
            <PieChart style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">Command Statistics</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="commandstats" style="height: 420px" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card shadow="hover">
          <template #header>
            <Odometer style="width: 1em; height: 1em; vertical-align: middle" /> <span style="vertical-align: middle">Memory Info</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="usedmemory" style="height: 420px" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Cache" lang="ts">
import { getCache } from '@/api/monitor/cache';
import * as echarts from 'echarts';
import { CacheVO } from '@/api/monitor/cache/types';

const cache = ref<Partial<CacheVO>>({});
const commandstats = ref();
const usedmemory = ref();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const getList = async () => {
  proxy?.$modal.loading('Loading cache monitoring data, please wait!');
  const res = await getCache();
  proxy?.$modal.closeLoading();
  cache.value = res.data;
  const commandstatsIntance = echarts.init(commandstats.value, 'macarons');
  commandstatsIntance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    series: [
      {
        name: 'Command',
        type: 'pie',
        roseType: 'radius',
        radius: [15, 95],
        center: ['50%', '38%'],
        data: res.data.commandStats,
        animationEasing: 'cubicInOut',
        animationDuration: 1000
      }
    ]
  });
  const usedmemoryInstance = echarts.init(usedmemory.value, 'macarons');
  usedmemoryInstance.setOption({
    tooltip: {
      formatter: '{b} <br/>{a} : ' + cache.value.info.used_memory_human
    },
    series: [
      {
        name: 'Peak',
        type: 'gauge',
        min: 0,
        max: 1000,
        detail: {
          formatter: cache.value.info.used_memory_human
        },
        data: [
          {
            value: parseFloat(cache.value.info.used_memory_human),
            name: 'Memory Usage'
          }
        ]
      }
    ]
  });
  window.addEventListener('resize', () => {
    commandstatsIntance.resize();
    usedmemoryInstance.resize();
  });
};

onMounted(() => {
  getList();
});
</script>
