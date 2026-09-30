<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <!-- <el-form-item label="Merchant ID" prop="merchantId">
              <el-input v-model="queryParams.merchantId" placeholder="Please enter Merchant ID" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="Payer Address" prop="fromAddress">
              <el-input v-model="queryParams.fromAddress" placeholder="Please enter payout address" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Receiving Address" prop="toAddress">
              <el-input v-model="queryParams.toAddress" placeholder="Please enter the receiving address" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Chain" prop="chain">
              <el-input v-model="queryParams.chain" placeholder="Please enter chain" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Currency" prop="symbol">
              <el-input v-model="queryParams.symbol" placeholder="Please enter currency" clearable @keyup.enter="handleQuery" />
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:collectRecord:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="collectRecordList">
        <el-table-column label="ID" align="center" prop="id" width="180" />
        <!-- <el-table-column label="Merchant ID" align="center" prop="merchantId" width="100" /> -->
        <el-table-column label="Block Height" align="center" prop="blockNumber" width="120" />
        <el-table-column label="Payer Address" align="center" prop="fromAddress" show-overflow-tooltip min-width="160" />
        <el-table-column label="Receiving Address" align="center" prop="toAddress" show-overflow-tooltip min-width="160" />
        <el-table-column label="Chain" align="center" prop="chain" width="100" />
        <el-table-column label="Currency" align="center" prop="symbol" width="80" />
        <el-table-column label="Quantity" align="center" prop="amount" width="140">
          <template #default="scope">
            <span>{{ Number(scope.row.amount).toFixed(6) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Hash" align="center" prop="txId" show-overflow-tooltip min-width="160" />
        <el-table-column label="Contract" align="center" prop="contractAddress" show-overflow-tooltip min-width="160" />
        <el-table-column label="GAS Fee" align="center" prop="txFee" width="120" />
        <el-table-column label="Confirmations" align="center" prop="confirmedNum" width="80" />
        <el-table-column label="Transaction Status" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 'SUCCESS'" type="success">Success</el-tag>
            <el-tag v-else-if="scope.row.status === 'FAILED'" type="danger">Failed</el-tag>
            <el-tag v-else type="warning">Waiting</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Confirmation Time" align="center" prop="blockTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.blockTime, '{y}-{m}-{d} {h}:{mi}:{s}') }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="Estimated Transfer Amount" align="center" prop="collectAmount" width="140">
          <template #default="scope">
            <span>{{ Number(scope.row.collectAmount).toFixed(6) }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="Platform Fee" align="center" prop="fee" width="120">
          <template #default="scope">
            <span>{{ Number(scope.row.fee).toFixed(6) }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="Fee Rate" align="center" prop="feeRatio" width="100">
          <template #default="scope">
            <span>{{ scope.row.feeRatio }}%</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="Created At" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{mi}:{s}') }}</span>
          </template>
        </el-table-column> -->
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="CollectRecord" lang="ts">
import { listCollectRecord } from '@/api/xpay/collectRecord';
import { CollectRecordVO, CollectRecordQuery } from '@/api/xpay/collectRecord/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const collectRecordList = ref<CollectRecordVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();

const queryParams = reactive<CollectRecordQuery>({
  pageNum: 1,
  pageSize: 10,
  merchantId: undefined,
  fromAddress: undefined,
  toAddress: undefined,
  chain: undefined,
  symbol: undefined,
  params: {
    createTime: undefined
  }
});

const getList = async () => {
  loading.value = true;
  queryParams.params = {};
  proxy?.addDateRange(queryParams, dateRangeCreateTime.value, 'CreateTime');
  const res = await listCollectRecord(queryParams);
  collectRecordList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  dateRangeCreateTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleExport = () => {
  proxy?.download(
    'xpay/collectRecord/export',
    {
      ...queryParams
    },
    `collectRecord_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
