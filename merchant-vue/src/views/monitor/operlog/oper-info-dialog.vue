<template>
  <el-dialog v-model="open" title="Operation Log Details" width="700px" append-to-body close-on-click-modal @closed="info = null">
    <el-descriptions v-if="info" :column="1" border>
      <el-descriptions-item label="Operation Status">
        <template #default>
          <el-tag v-if="info.status === 0" type="success">Normal</el-tag>
          <el-tag v-else-if="info.status === 1" type="danger">Failed</el-tag>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="Login Info">
        <template #default> {{ info.operName }} / {{ info.deptName }} / {{ info.operIp }} / {{ info.operLocation }} </template>
      </el-descriptions-item>
      <el-descriptions-item label="Request Info">
        <template #default> {{ info.requestMethod }} {{ info.operUrl }} </template>
      </el-descriptions-item>
      <el-descriptions-item label="Operation Module">
        <template #default> {{ info.title }} / {{ typeFormat(info) }} </template>
      </el-descriptions-item>
      <el-descriptions-item label="Action Method">
        <template #default>
          {{ info.method }}
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="Request Parameters">
        <template #default>
          <div class="max-h-300px overflow-y-auto">
            <VueJsonPretty :data="formatToJsonObject(info.operParam)" />
          </div>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="Return Parameters">
        <template #default>
          <div class="max-h-300px overflow-y-auto">
            <VueJsonPretty :data="formatToJsonObject(info.jsonResult)" />
          </div>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="Time Consumed">
        <template #default>
          <span> {{ info.costTime }}ms </span>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label="Operation Time">
        <template #default> {{ proxy.parseTime(info.operTime) }}</template>
      </el-descriptions-item>
      <el-descriptions-item v-if="info.status === 1" label="Exception Info">
        <template #default>
          <span class="text-danger"> {{ info.errorMsg }}</span>
        </template>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
import type { OperLogForm } from '@/api/monitor/operlog/types';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

const open = ref(false);
const info = ref<OperLogForm | null>(null);
function openDialog(row: OperLogForm) {
  info.value = row;
  open.value = true;
}

function closeDialog() {
  open.value = false;
}

defineExpose({
  openDialog,
  closeDialog
});

/**
 * Convert JSON to object
 * @param data Raw data
 */
function formatToJsonObject(data: string) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return data;
  }
}

/**
 * Dictionary information
 */
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_oper_type } = toRefs<any>(proxy?.useDict('sys_oper_type'));
const typeFormat = (row: OperLogForm) => {
  return proxy?.selectDictLabel(sys_oper_type.value, row.businessType);
};
</script>

<style lang="scss" scoped>
/**
Fixed label width
*/
:deep(.el-descriptions__label) {
  min-width: 100px;
}
/**
Text overflow wraps to display
*/
:deep(.el-descriptions__content) {
  max-width: 300px;
}
</style>
