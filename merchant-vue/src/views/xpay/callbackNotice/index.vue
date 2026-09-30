<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Order ID" prop="orderId">
              <el-input v-model="queryParams.orderId" placeholder="Please enter order ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Callback Notification URL" prop="callbackUrl" label-width="100px">
              <el-input v-model="queryParams.callbackUrl" placeholder="Enter callback notification URL" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Notification Status" prop="notifyStatus">
              <el-select v-model="queryParams.notifyStatus" placeholder="Select" clearable>
                <el-option label="Success" value="SUCCESS" />
                <el-option label="Failed" value="FAIL" />
                <el-option label="Initialize" value="INIT" />
              </el-select>
            </el-form-item>
            <el-form-item label="Notification Time" style="width: 308px">
              <el-date-picker
                v-model="dateRangeNotifyTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="Start Date"
                end-placeholder="End Date"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              />
            </el-form-item>
            <el-form-item label="Created At" style="width: 308px">
              <el-date-picker
                v-model="dateRangeCreateTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="Start Date"
                end-placeholder="End Date"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
              <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['xpay:callbackNotice:remove']"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:callbackNotice:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="callbackNoticeList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" width="180" />
        <el-table-column label="Order ID" align="center" prop="orderId" width="180" />
        <el-table-column label="Callback Notification URL" align="center" prop="callbackUrl" show-overflow-tooltip min-width="200" />
        <el-table-column label="Notification Status" align="center" prop="notifyStatus" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.notifyStatus === 'SUCCESS'" type="success">Success</el-tag>
            <el-tag v-else-if="scope.row.notifyStatus === 'FAIL'" type="danger">Failed</el-tag>
            <el-tag v-else type="warning">Initialize</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Notification Time" align="center" prop="notifyTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.notifyTime, '{y}-{m}-{d} {h}:{mi}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Created At" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{mi}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width" width="80">
          <template #default="scope">
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['xpay:callbackNotice:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="CallbackNotice" lang="ts">
import { listCallbackNotice, delCallbackNotice } from '@/api/xpay/callbackNotice';
import { CallbackNoticeVO, CallbackNoticeQuery } from '@/api/xpay/callbackNotice/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const callbackNoticeList = ref<CallbackNoticeVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const dateRangeNotifyTime = ref<[DateModelType, DateModelType]>(['', '']);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();

const queryParams = reactive<CallbackNoticeQuery>({
  pageNum: 1,
  pageSize: 10,
  orderId: undefined,
  callbackUrl: undefined,
  notifyStatus: undefined,
  params: {
    createTime: undefined
  }
});

const getList = async () => {
  loading.value = true;
  queryParams.params = {};
  proxy?.addDateRange(queryParams, dateRangeNotifyTime.value, 'NotifyTime');
  proxy?.addDateRange(queryParams, dateRangeCreateTime.value, 'CreateTime');
  const res = await listCallbackNotice(queryParams);
  callbackNoticeList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  dateRangeNotifyTime.value = ['', ''];
  dateRangeCreateTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: CallbackNoticeVO[]) => {
  ids.value = selection.map((item) => item.id);
  multiple.value = !selection.length;
};

const handleDelete = async (row?: CallbackNoticeVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the callback notification ID "' + _ids + '" items?').finally(() => (loading.value = false));
  await delCallbackNotice(_ids);
  proxy?.$modal.msgSuccess('Deleted successfully');
  await getList();
};

const handleExport = () => {
  proxy?.download(
    'xpay/callbackNotice/export',
    {
      ...queryParams
    },
    `callbackNotice_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
