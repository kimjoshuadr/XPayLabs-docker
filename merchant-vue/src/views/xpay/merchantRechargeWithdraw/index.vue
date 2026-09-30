<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <!-- <el-form-item label="Merchant ID" prop="merchantId">
              <el-input v-model="queryParams.merchantId" placeholder="Please enter Merchant ID" clearable @keyup.enter="handleQuery" />
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
            <!-- <el-form-item label="Payment Address" prop="payAddress">
              <el-input v-model="queryParams.payAddress" placeholder="Please enter payment address" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Receiving Address" prop="receiveAddress">
              <el-input v-model="queryParams.receiveAddress" placeholder="Enter receiving address" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Quantity" prop="amount">
              <el-input v-model="queryParams.amount" placeholder="Please enter quantity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Failure Reason" prop="reason">
              <el-input v-model="queryParams.reason" placeholder="Enter failure reason" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item label="txId" prop="txId">
              <el-input v-model="queryParams.txId" placeholder="Please enter txId" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item label="GAS Fee" prop="txGas">
              <el-input v-model="queryParams.txGas" placeholder="Please enter GAS fee" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Fee" prop="fee">
              <el-input v-model="queryParams.fee" placeholder="Please enter fee" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['xpay:merchantRechargeWithdraw:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['xpay:merchantRechargeWithdraw:edit']">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['xpay:merchantRechargeWithdraw:remove']">Delete</el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:merchantRechargeWithdraw:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="merchantRechargeWithdrawList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="Primary Key ID" align="center" prop="id" v-if="true" /> -->
        <!-- <el-table-column label="txId" align="center" prop="txId" /> -->
        <!-- <el-table-column label="Merchant ID" align="center" prop="merchantId" /> -->
        <el-table-column label="Order No." align="center" prop="transactionNo" width="180" />
        <el-table-column label="Type" align="center" prop="type" >
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'RECHARGE'" type="success">Recharge</el-tag>
            <el-tag v-else type="info">Withdrawal</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Chain" align="center" prop="chain" />
        <el-table-column label="Currency" align="center" prop="symbol" />
        <!-- <el-table-column label="Payment Address" align="center" prop="payAddress" />
        <el-table-column label="Receiving Address" align="center" prop="receiveAddress" /> -->
        <el-table-column label="Quantity" align="center" prop="amount" />
        <el-table-column label="Status" align="center" prop="status" >
          <template #default="scope">
            <el-tag v-if="scope.row.status === 'INIT'" type="warning">Pending Review</el-tag>
            <el-tag v-if="scope.row.status === 'APPROVED'" type="warning">Approved</el-tag>
            <el-tag v-if="scope.row.status === 'REJECTED'" type="warning">Reject</el-tag>
            <el-tag v-if="scope.row.status === 'SUBMITTED'" type="warning">Submitted</el-tag>
            <el-tag v-else-if="scope.row.status === 'PENDING'" type="warning">Waiting</el-tag>
            <el-tag v-else-if="scope.row.status === 'SUCCESS'" type="success">Success</el-tag>
            <el-tag v-else-if="scope.row.status === 'FAILED'" type="danger">Failed</el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column label="GAS Fee" align="center" prop="txGas" /> -->
        <el-table-column label="Fee" align="center" prop="fee" />
        <el-table-column label="Fee Rate (%)" align="center" prop="rate" />
        <el-table-column label="Created At" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Failure Reason" align="center" prop="reason" />
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip v-if="scope.row.type === 'WITHDRAW' && scope.row.status === 'INIT'" content="Review" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleApproval(scope.row)" v-hasPermi="['xpay:merchantRechargeWithdraw:approve']"></el-button>
            </el-tooltip>
            <!-- <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['xpay:merchantRechargeWithdraw:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['xpay:merchantRechargeWithdraw:remove']"></el-button>
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Merchant Recharge/Withdrawal Dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="merchantRechargeWithdrawFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Merchant ID" prop="merchantId">
          <el-input v-model="form.merchantId" placeholder="Please enter Merchant ID" />
        </el-form-item>
        <el-form-item label="Currency" prop="symbol">
          <el-input v-model="form.symbol" placeholder="Please enter currency" />
        </el-form-item>
        <el-form-item label="Payment Address" prop="payAddress">
          <el-input v-model="form.payAddress" placeholder="Please enter payment address" />
        </el-form-item>
        <el-form-item label="Receiving Address" prop="receiveAddress">
          <el-input v-model="form.receiveAddress" placeholder="Enter receiving address" />
        </el-form-item>
        <el-form-item label="Quantity" prop="amount">
          <el-input v-model="form.amount" placeholder="Please enter quantity" />
        </el-form-item>
        <el-form-item label="Failure Reason" prop="reason">
          <el-input v-model="form.reason" placeholder="Enter failure reason" />
        </el-form-item>
        <el-form-item label="txId" prop="txId">
          <el-input v-model="form.txId" placeholder="Please enter txId" />
        </el-form-item>
        <el-form-item label="GAS Fee" prop="txGas">
          <el-input v-model="form.txGas" placeholder="Please enter GAS fee" />
        </el-form-item>
        <el-form-item label="Fee" prop="fee">
          <el-input v-model="form.fee" placeholder="Please enter fee" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Confirm</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Review Dialog -->
    <el-dialog title="Review" v-model="approveDialogVisible" width="500px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="Order No.">{{ approveRow.transactionNo }}</el-form-item>
        <el-form-item label="Type">{{ approveRow.type === 'RECHARGE' ? 'Recharge' : 'Withdrawal' }}</el-form-item>
        <el-form-item label="Quantity">{{ approveRow.amount }}</el-form-item>
        <el-form-item label="Rejection Reason" v-if="showRejectInput">
          <el-input v-model="rejectReason" type="textarea" placeholder="Please enter rejection reason" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelApprove">Cancel</el-button>
          <el-button v-if="!showRejectInput" type="danger" @click="showRejectInput = true">Reject</el-button>
          <el-button v-if="showRejectInput" type="danger" @click="submitReject" :loading="approveLoading">Confirm Rejection</el-button>
          <el-button type="primary" @click="onApprove" :loading="approveLoading">Approve</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MerchantRechargeWithdraw" lang="ts">
import { listMerchantRechargeWithdraw, getMerchantRechargeWithdraw, delMerchantRechargeWithdraw, addMerchantRechargeWithdraw, updateMerchantRechargeWithdraw, approveMerchantRechargeWithdraw, unapproveMerchantRechargeWithdraw } from '@/api/xpay/merchantRechargeWithdraw';
import { MerchantRechargeWithdrawVO, MerchantRechargeWithdrawQuery, MerchantRechargeWithdrawForm } from '@/api/xpay/merchantRechargeWithdraw/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const merchantRechargeWithdrawList = ref<MerchantRechargeWithdrawVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);
const approveDialogVisible = ref(false);
const approveRow = ref<MerchantRechargeWithdrawVO>({} as MerchantRechargeWithdrawVO);
const showRejectInput = ref(false);
const rejectReason = ref('');
const approveLoading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const merchantRechargeWithdrawFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: MerchantRechargeWithdrawForm = {
  id: undefined,
  merchantId: undefined,
  type: undefined,
  chain: undefined,
  symbol: undefined,
  payAddress: undefined,
  receiveAddress: undefined,
  amount: undefined,
  status: undefined,
  reason: undefined,
  txId: undefined,
  txGas: undefined,
  fee: undefined,
}
const data = reactive<PageData<MerchantRechargeWithdrawForm, MerchantRechargeWithdrawQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    merchantId: undefined,
    type: undefined,
    chain: undefined,
    symbol: undefined,
    payAddress: undefined,
    receiveAddress: undefined,
    amount: undefined,
    status: undefined,
    reason: undefined,
    txId: undefined,
    txGas: undefined,
    fee: undefined,
    params: {
      createTime: undefined
    }
  },
  rules: {
    id: [
      { required: true, message: "Primary key ID cannot be empty", trigger: "blur" }
    ],
    merchantId: [
      { required: true, message: "Merchant ID cannot be empty", trigger: "blur" }
    ],
    type: [
      { required: true, message: "Record type: recharge, withdrawal cannot be empty", trigger: "change" }
    ],
    chain: [
      { required: true, message: "Chain cannot be empty", trigger: "change" }
    ],
    symbol: [
      { required: true, message: "Currency cannot be empty", trigger: "blur" }
    ],
    payAddress: [
      { required: true, message: "Payment address cannot be empty", trigger: "blur" }
    ],
    receiveAddress: [
      { required: true, message: "Receiving address cannot be empty", trigger: "blur" }
    ],
    amount: [
      { required: true, message: "Quantity cannot be empty", trigger: "blur" }
    ],
    status: [
      { required: true, message: "Status: PENDING,SUCCESS,FAILED; cannot be empty", trigger: "change" }
    ],
    reason: [
      { required: true, message: "Failure reason cannot be empty", trigger: "blur" }
    ],
    txId: [
      { required: true, message: "txId cannot be empty", trigger: "blur" }
    ],
    txGas: [
      { required: true, message: "GAS fee cannot be empty", trigger: "blur" }
    ],
    fee: [
      { required: true, message: "Fee cannot be empty", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query merchant recharge/withdrawal list */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'CreateTime');
  const res = await listMerchantRechargeWithdraw(queryParams.value);
  merchantRechargeWithdrawList.value = res.rows;
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
  merchantRechargeWithdrawFormRef.value?.resetFields();
}

/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** Reset button action */
const resetQuery = () => {
  dateRangeCreateTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** Checkbox selected data */
const handleSelectionChange = (selection: MerchantRechargeWithdrawVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add Merchant Recharge/Withdrawal";
}

/** Edit button action */
const handleUpdate = async (row?: MerchantRechargeWithdrawVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getMerchantRechargeWithdraw(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Edit Merchant Recharge/Withdrawal";
}

/** Submit button */
const submitForm = () => {
  merchantRechargeWithdrawFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateMerchantRechargeWithdraw(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addMerchantRechargeWithdraw(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Operation successful");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: MerchantRechargeWithdrawVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the merchant recharge/withdrawal ID "' + _ids + '" items?').finally(() => loading.value = false);
  await delMerchantRechargeWithdraw(_ids);
  proxy?.$modal.msgSuccess("Deleted successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('xpay/merchantRechargeWithdraw/export', {
    ...queryParams.value
  }, `merchantRechargeWithdraw_${new Date().getTime()}.xlsx`)
}

/** Open review dialog */
const handleApproval = (row: MerchantRechargeWithdrawVO) => {
  approveRow.value = row;
  showRejectInput.value = false;
  rejectReason.value = '';
  approveDialogVisible.value = true;
}

/** Approve */
const onApprove = async () => {
  await proxy?.$modal.confirm('Confirm approval?').finally(() => approveLoading.value = false);
  approveLoading.value = true;
  try {
    await approveMerchantRechargeWithdraw(approveRow.value.id);
    proxy?.$modal.msgSuccess('Approved');
    approveDialogVisible.value = false;
    await getList();
  } finally {
    approveLoading.value = false;
  }
}

/** Submit rejection */
const submitReject = async () => {
  if (!rejectReason.value) {
    proxy?.$modal.msgWarning('Please enter rejection reason');
    return;
  }
  approveLoading.value = true;
  try {
    await unapproveMerchantRechargeWithdraw(approveRow.value.id, rejectReason.value);
    proxy?.$modal.msgSuccess('Rejected');
    approveDialogVisible.value = false;
    await getList();
  } finally {
    approveLoading.value = false;
  }
}

/** Cancel review */
const cancelApprove = () => {
  approveDialogVisible.value = false;
  rejectReason.value = '';
  showRejectInput.value = false;
}

onMounted(() => {
  getList();
});
</script>
