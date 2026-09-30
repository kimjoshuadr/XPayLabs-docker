<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Transaction No." prop="transactionNo" label-width="100px">
              <el-input v-model="queryParams.transactionNo" placeholder="Please enter transaction serial number" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Merchant ID" prop="merchantId">
              <el-input v-model="queryParams.merchantId" placeholder="Please enter Merchant ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Currency" prop="symbol">
              <el-input v-model="queryParams.symbol" placeholder="Please enter currency" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Type" prop="type">
              <el-select v-model="queryParams.type" placeholder="Select" clearable>
                <el-option label="Recharge" value="RECHARGE" />
                <el-option label="Withdrawal" value="WITHDRAW" />
                <el-option label="Withdrawal Request" value="WITHDRAW_REQUEST" />
                <el-option label="Collection" value="PAYIN" />
                <el-option label="Payout" value="PAYOUT" />
                <el-option label="Payout Request" value="PAYOUT_REQUEST" />
                <el-option label="Withdrawal Refund" value="WITHDRAW_REFUND" />
                <el-option label="Payout Refund" value="PAYOUT_REFUND" />
                <el-option label="Fiat Collection" value="FIAT_CURRENCY_PAYIN" />
                <el-option label="Fiat Payout" value="FIAT_CURRENCY_PAYOUT" />
                <el-option label="Fiat Payout Request" value="FIAT_CURRENCY_PAYOUT_REQUEST" />
                <el-option label="Fiat Payout Refund" value="FIAT_CURRENCY_PAYOUT_REFUND" />
              </el-select>
            </el-form-item>
            <el-form-item label="Income/Expense" prop="inOut">
              <el-select v-model="queryParams.inOut" placeholder="Select" clearable>
                <el-option label="Income" value="IN" />
                <el-option label="Expense" value="OUT" />
                <el-option label="Transfer to Frozen" value="TO_FROZEN" />
                <el-option label="Unfreeze" value="TO_UNFROZEN" />
              </el-select>
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:merchantAssetDetails:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="merchantAssetDetailsList">
        <el-table-column label="ID" align="center" prop="id" width="180" />
        <el-table-column label="Transaction No." align="center" prop="transactionNo" min-width="160" />
        <el-table-column label="Merchant ID" align="center" prop="merchantId" width="100" />
        <el-table-column label="Currency" align="center" prop="symbol" width="80" />
        <el-table-column label="Type" align="center" prop="type" width="120">
          <template #default="scope">
            <el-tag :type="typeTagType(scope.row.type)">{{ typeLabel(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Income/Expense" align="center" prop="inOut" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.inOut === 'IN'" type="success">Income</el-tag>
            <el-tag v-else-if="scope.row.inOut === 'OUT'" type="danger">Expense</el-tag>
            <el-tag v-else-if="scope.row.inOut === 'TO_FROZEN'" type="warning">Transfer to Frozen</el-tag>
            <el-tag v-else type="info">Unfreeze</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Change Amount" align="center" prop="amount" width="140">
          <template #default="scope">
            <span>{{ Number(scope.row.amount).toFixed(6) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Available Before Change" align="center" prop="oldBalance" width="140">
          <template #default="scope">
            <span>{{ Number(scope.row.oldBalance).toFixed(6) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Available After Change" align="center" prop="newBalance" width="140">
          <template #default="scope">
            <span>{{ Number(scope.row.newBalance).toFixed(6) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Frozen Before Change" align="center" prop="oldFrozen" width="140">
          <template #default="scope">
            <span>{{ Number(scope.row.oldFrozen).toFixed(6) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Frozen After Change" align="center" prop="newFrozen" width="140">
          <template #default="scope">
            <span>{{ Number(scope.row.newFrozen).toFixed(6) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Fee" align="center" prop="fee" width="120">
          <template #default="scope">
            <span>{{ Number(scope.row.fee).toFixed(6) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Fee Currency" align="center" prop="feeSymbol" width="100" />
        <el-table-column label="Exchange Rate" align="center" prop="rate" width="100">
          <template #default="scope">
            <span>{{ scope.row.rate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Remark" align="center" prop="remark" show-overflow-tooltip min-width="120" />
        <el-table-column label="Created At" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{mi}:{s}') }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="MerchantAssetDetails" lang="ts">
import { listMerchantAssetDetails } from '@/api/xpay/merchantAssetDetails';
import { MerchantAssetDetailsVO, MerchantAssetDetailsQuery } from '@/api/xpay/merchantAssetDetails/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const merchantAssetDetailsList = ref<MerchantAssetDetailsVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();

const queryParams = reactive<MerchantAssetDetailsQuery>({
  pageNum: 1,
  pageSize: 10,
  transactionNo: undefined,
  merchantId: undefined,
  symbol: undefined,
  type: undefined,
  inOut: undefined,
  params: {
    createTime: undefined
  }
});

const typeLabelMap: Record<string, string> = {
  RECHARGE: 'Recharge',
  WITHDRAW: 'Withdrawal',
  WITHDRAW_REQUEST: 'Withdrawal Request',
  PAYIN: 'Collection',
  PAYOUT: 'Payout',
  PAYOUT_REQUEST: 'Payout Request',
  WITHDRAW_REFUND: 'Withdrawal Refund',
  PAYOUT_REFUND: 'Payout Refund',
  FIAT_CURRENCY_PAYIN: 'Fiat Collection',
  FIAT_CURRENCY_PAYOUT: 'Fiat Payout',
  FIAT_CURRENCY_PAYOUT_REQUEST: 'Fiat Payout Request',
  FIAT_CURRENCY_PAYOUT_REFUND: 'Fiat Payout Refund'
};

const typeTagMap: Record<string, string> = {
  RECHARGE: 'success',
  WITHDRAW: 'danger',
  WITHDRAW_REQUEST: 'warning',
  PAYIN: 'success',
  PAYOUT: 'danger',
  PAYOUT_REQUEST: 'warning',
  WITHDRAW_REFUND: 'info',
  PAYOUT_REFUND: 'info',
  FIAT_CURRENCY_PAYIN: 'success',
  FIAT_CURRENCY_PAYOUT: 'danger',
  FIAT_CURRENCY_PAYOUT_REQUEST: 'warning',
  FIAT_CURRENCY_PAYOUT_REFUND: 'info'
};

const typeLabel = (type: string) => typeLabelMap[type] || type;
const typeTagType = (type: string) => typeTagMap[type] || 'info';

const getList = async () => {
  loading.value = true;
  queryParams.params = {};
  proxy?.addDateRange(queryParams, dateRangeCreateTime.value, 'CreateTime');
  const res = await listMerchantAssetDetails(queryParams);
  merchantAssetDetailsList.value = res.rows;
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
    'xpay/merchantAssetDetails/export',
    {
      ...queryParams
    },
    `merchantAssetDetails_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
