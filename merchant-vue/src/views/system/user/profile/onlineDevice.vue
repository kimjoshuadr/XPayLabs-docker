<template>
  <div>
    <el-table :data="devices" border style="width: 100%; height: 100%; font-size: 14px">
      <el-table-column label="Device Type" align="center">
        <template #default="scope">
          <dict-tag :options="sys_device_type" :value="scope.row.deviceType" />
        </template>
      </el-table-column>
      <el-table-column label="Host" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="Login Location" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="Operating System" align="center" prop="os" :show-overflow-tooltip="true" />
      <el-table-column label="Browser" align="center" prop="browser" :show-overflow-tooltip="true" />
      <el-table-column label="Login Time" align="center" prop="loginTime" width="180">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="Delete" placement="top">
            <el-button link type="primary" icon="Delete" @click="handldDelOnline(scope.row)"> </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup name="Online" lang="ts">
import { delOnline } from '@/api/monitor/online';
import { propTypes } from '@/utils/propTypes';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_device_type } = toRefs<any>(proxy?.useDict('sys_device_type'));

const props = defineProps({
  devices: propTypes.any.isRequired
});
const devices = computed(() => props.devices);

/** Delete button action */
const handldDelOnline = (row: any) => {
  ElMessageBox.confirm('After deleting the device, logging in on it will require re-verification')
    .then(() => {
      return delOnline(row.tokenId);
    })
    .then((res: any) => {
      if (res.code === 200) {
        proxy?.$modal.msgSuccess('Deleted successfully');
        proxy?.$tab.refreshPage();
      } else {
        proxy?.$modal.msgError(res.msg);
      }
    })
    .catch(() => {});
};
</script>
