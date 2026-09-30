<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <!-- <el-form-item label="Merchant ID" prop="merchantId">
              <el-input v-model="queryParams.merchantId" placeholder="Please enter Merchant ID" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="Order No." prop="merchantOrderId">
              <el-input v-model="queryParams.merchantOrderId" placeholder="Please enter order number" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="uid" prop="uid">
              <el-input v-model="queryParams.uid" placeholder="Please enter UID" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item label="Payment Currency ID" prop="assetTypeId">
              <el-input v-model="queryParams.assetTypeId" placeholder="Enter payment currency ID" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="Chain" prop="chain">
              <el-select v-model="queryParams.chain" clearable placeholder="Select Chain" @keyup.enter="handleQuery">
                <el-option key="TRON" label="TRON" value="TRON" />
                <el-option key="ETH" label="ETH" value="ETH" />
                <el-option key="BSC" label="BSC" value="BSC" />
              </el-select>
            </el-form-item>
            <el-form-item label="Currency" prop="symbol">
              <el-select v-model="queryParams.symbol" clearable placeholder="Please select currency" @keyup.enter="handleQuery">
                <el-option key="USDT" label="USDT" value="USDT" />
                <el-option key="TRX" label="TRX" value="TRX" />
                <el-option key="ETH" label="ETH" value="ETH" />
                <el-option key="BNB" label="BNB" value="BNB" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="Payer Address" prop="payAddress">
              <el-input v-model="queryParams.payAddress" placeholder="Please enter payout address" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Receiving Address" prop="receiveAddress">
              <el-input v-model="queryParams.receiveAddress" placeholder="Please enter the receiving address" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item label="Quantity" prop="amount">
              <el-input v-model="queryParams.amount" placeholder="Please enter quantity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Expiration Time" prop="expiredTime">
              <el-date-picker clearable
                v-model="queryParams.expiredTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select expiration time"
              />
            </el-form-item>
            <el-form-item label="Failure Reason" prop="reason">
              <el-input v-model="queryParams.reason" placeholder="Enter failure reason" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item label="txId" prop="txId">
              <el-input v-model="queryParams.txId" placeholder="Please enter txId" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item label="GAS" prop="txGas">
              <el-input v-model="queryParams.txGas" placeholder="Enter GAS" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Callback URL" prop="callbackUrl">
              <el-input v-model="queryParams.callbackUrl" placeholder="Please enter callback URL" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Callback Time" style="width: 308px">
              <el-date-picker
                v-model="dateRangeNotifyTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="Start Date"
                end-placeholder="End Date"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              />
            </el-form-item> -->
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
          <!-- <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['xpay:paymentOrder:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['xpay:paymentOrder:edit']">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['xpay:paymentOrder:remove']">Delete</el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:paymentOrder:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="paymentOrderList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="ID" align="center" prop="id" v-if="true" /> -->
        <!-- <el-table-column label="Merchant ID" align="center" prop="merchantId" /> -->
        <el-table-column label="Order No." align="center" prop="merchantOrderId" />
        <!-- <el-table-column label="txId" align="center" prop="txId" width="180" /> -->
        <!-- <el-table-column label="uid" align="center" prop="uid" /> -->
        <el-table-column label="Order Type" align="center" prop="orderType" >
          <template #default="scope">
            <el-tag v-if="scope.row.orderType === 'PAYOUT'" type="success">Payout</el-tag>
            <el-tag v-else type="info">Collection</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Chain" align="center" prop="chain" >
          <template #default="scope">
            <el-tag type="success">{{scope.row.chain}}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="Currency" align="center" prop="symbol" />
        <!-- <el-table-column label="Payer Address" align="center" prop="payAddress" /> -->
        <!-- <el-table-column label="Receiving Address" align="center" prop="receiveAddress" /> -->
        <el-table-column label="Quantity" align="center" prop="amount" >
          <template #default="scope">
            <span>{{ parseFloat(scope.row.amount).toString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Fee" align="center" prop="handingFee" />
        <el-table-column label="Fee Rate (%)" align="center" prop="handingRate" />
        <el-table-column label="GAS" align="center" prop="txGas" />
        <!-- <el-table-column label="Expiration Time" align="center" prop="expiredTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.expiredTime) }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="Status" align="center" prop="status" >
          <template #default="scope">
            <el-tag v-if="scope.row.status === 'INIT'" type="warning">Waiting</el-tag>
            <el-tag v-else-if="scope.row.status === 'PENDING'" type="warning">Waiting</el-tag>
            <el-tag v-else-if="scope.row.status === 'PENDING_CONFIRMATION'" type="warning">Confirming</el-tag>
            <el-tag v-else-if="scope.row.status === 'SUCCESS'" type="success">Success</el-tag>
            <el-tag v-else-if="scope.row.status === 'FAILED'" type="danger">Failed</el-tag>
            <el-tag v-else-if="scope.row.status === 'EXPIRED'" type="info">Expired</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Failure Reason" align="center" prop="reason" />
        <!-- <el-table-column label="Callback Status" align="center" prop="notifyStatus" />
        <el-table-column label="Callback URL" align="center" prop="callbackUrl" />
        <el-table-column label="Callback Time" align="center" prop="notifyTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.notifyTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="Created At" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['xpay:paymentOrder:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['xpay:paymentOrder:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column> -->
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Payment Order Dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="paymentOrderFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Merchant ID" prop="merchantId">
          <el-input v-model="form.merchantId" placeholder="Please enter Merchant ID" />
        </el-form-item>
        <el-form-item label="Order No." prop="merchantOrderId">
          <el-input v-model="form.merchantOrderId" placeholder="Please enter order number" />
        </el-form-item>
        <el-form-item label="uid" prop="uid">
          <el-input v-model="form.uid" placeholder="Please enter UID" />
        </el-form-item>
        <el-form-item label="Payment Currency ID" prop="assetTypeId">
          <el-input v-model="form.assetTypeId" placeholder="Enter payment currency ID" />
        </el-form-item>
        <el-form-item label="Chain" prop="chain">
          <el-input v-model="form.chain" placeholder="Please enter chain" />
        </el-form-item>
        <el-form-item label="Currency" prop="symbol">
          <el-input v-model="form.symbol" placeholder="Please enter currency" />
        </el-form-item>
        <el-form-item label="Payer Address" prop="payAddress">
          <el-input v-model="form.payAddress" placeholder="Please enter payout address" />
        </el-form-item>
        <el-form-item label="Receiving Address" prop="receiveAddress">
          <el-input v-model="form.receiveAddress" placeholder="Please enter the receiving address" />
        </el-form-item>
        <el-form-item label="Quantity" prop="amount">
          <el-input v-model="form.amount" placeholder="Please enter quantity" />
        </el-form-item>
        <el-form-item label="Fee" prop="handingFee">
          <el-input v-model="form.handingFee" placeholder="Please enter quantity" />
        </el-form-item>
        <el-form-item label="Rate" prop="handingRate">
          <el-input v-model="form.handingRate" placeholder="Please enter quantity" />
        </el-form-item>
        <el-form-item label="Expiration Time" prop="expiredTime">
          <el-date-picker clearable
            v-model="form.expiredTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select expiration time">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Failure Reason" prop="reason">
          <el-input v-model="form.reason" placeholder="Enter failure reason" />
        </el-form-item>
        <el-form-item label="txId" prop="txId">
          <el-input v-model="form.txId" placeholder="Please enter txId" />
        </el-form-item>
        <el-form-item label="GAS" prop="txGas">
          <el-input v-model="form.txGas" placeholder="Enter GAS" />
        </el-form-item>
        <el-form-item label="Callback URL" prop="callbackUrl">
          <el-input v-model="form.callbackUrl" placeholder="Please enter callback URL" />
        </el-form-item>
        <el-form-item label="Callback Time" prop="notifyTime">
          <el-date-picker clearable
            v-model="form.notifyTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select callback time">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Confirm</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PaymentOrder" lang="ts">
import { listPaymentOrder, getPaymentOrder, delPaymentOrder, addPaymentOrder, updatePaymentOrder } from '@/api/xpay/paymentOrder';
import { PaymentOrderVO, PaymentOrderQuery, PaymentOrderForm } from '@/api/xpay/paymentOrder/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const paymentOrderList = ref<PaymentOrderVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeNotifyTime = ref<[DateModelType, DateModelType]>(['', '']);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const paymentOrderFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PaymentOrderForm = {
  id: undefined,
  merchantId: undefined,
  merchantOrderId: undefined,
  uid: undefined,
  orderType: undefined,
  assetTypeId: undefined,
  chain: undefined,
  symbol: undefined,
  payAddress: undefined,
  receiveAddress: undefined,
  amount: undefined,
  expiredTime: undefined,
  status: undefined,
  reason: undefined,
  txId: undefined,
  txGas: undefined,
  notifyStatus: undefined,
  callbackUrl: undefined,
  notifyTime: undefined,
}
const data = reactive<PageData<PaymentOrderForm, PaymentOrderQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    merchantId: undefined,
    merchantOrderId: undefined,
    uid: undefined,
    orderType: undefined,
    assetTypeId: undefined,
    chain: undefined,
    symbol: undefined,
    payAddress: undefined,
    receiveAddress: undefined,
    amount: undefined,
    expiredTime: undefined,
    status: undefined,
    reason: undefined,
    txId: undefined,
    txGas: undefined,
    notifyStatus: undefined,
    callbackUrl: undefined,
    params: {
      notifyTime: undefined,
      createTime: undefined,
    }
  },
  rules: {
    id: [
      { required: true, message: "ID cannot be empty", trigger: "blur" }
    ],
    merchantId: [
      { required: true, message: "Merchant ID cannot be empty", trigger: "blur" }
    ],
    merchantOrderId: [
      { required: true, message: "Order No. cannot be empty", trigger: "blur" }
    ],
    orderType: [
      { required: true, message: "Order type cannot be empty", trigger: "change" }
    ],
    assetTypeId: [
      { required: true, message: "Payment currency ID cannot be empty", trigger: "blur" }
    ],
    receiveAddress: [
      { required: true, message: "Receiving address cannot be empty", trigger: "blur" }
    ],
    amount: [
      { required: true, message: "Quantity cannot be empty", trigger: "blur" }
    ],
    expiredTime: [
      { required: true, message: "Expiration time cannot be empty", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query payment order list */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeNotifyTime.value, 'NotifyTime');
  proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'CreateTime');
  const res = await listPaymentOrder(queryParams.value);
  paymentOrderList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** Cancel button */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** Form reset */
const reset = () => {
  form.value = {...initFormData};
  paymentOrderFormRef.value?.resetFields();
}

/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** Reset button action */
const resetQuery = () => {
  dateRangeNotifyTime.value = ['', ''];
  dateRangeCreateTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** Checkbox selected data */
const handleSelectionChange = (selection: PaymentOrderVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add Payment Order";
}

/** Edit button action */
const handleUpdate = async (row?: PaymentOrderVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getPaymentOrder(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Edit Payment Order";
}

/** Submit button */
const submitForm = () => {
  paymentOrderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updatePaymentOrder(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addPaymentOrder(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Operation successful");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: PaymentOrderVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the payment order ID "' + _ids + '" items?').finally(() => loading.value = false);
  await delPaymentOrder(_ids);
  proxy?.$modal.msgSuccess("Deleted successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('xpay/paymentOrder/export', {
    ...queryParams.value
  }, `paymentOrder_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
