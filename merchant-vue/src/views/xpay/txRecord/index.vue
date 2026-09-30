<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Order No." prop="orderId">
              <el-input v-model="queryParams.orderId" placeholder="Please enter order number" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Height" prop="blockNumber">
              <el-input v-model="queryParams.blockNumber" placeholder="Please enter height" clearable @keyup.enter="handleQuery" />
            </el-form-item>
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
            <el-form-item label="Quantity" prop="amount">
              <el-input v-model="queryParams.amount" placeholder="Please enter quantity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Hash" prop="txId">
              <el-input v-model="queryParams.txId" placeholder="Enter Hash" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Contract Address" prop="contractAddress">
              <el-input v-model="queryParams.contractAddress" placeholder="Please enter contract address" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="GAS" prop="txFee">
              <el-input v-model="queryParams.txFee" placeholder="Enter GAS" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Confirmations" prop="confirmedNum">
              <el-input v-model="queryParams.confirmedNum" placeholder="Please enter confirmation count" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Block Time" style="width: 308px">
              <el-date-picker
                v-model="dateRangeBlockTime"
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['xpay:txRecord:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['xpay:txRecord:edit']">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['xpay:txRecord:remove']">Delete</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:txRecord:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="txRecordList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" v-if="true" />
        <el-table-column label="Order No." align="center" prop="orderId" />
        <el-table-column label="Height" align="center" prop="blockNumber" />
        <el-table-column label="Payer Address" align="center" prop="fromAddress" />
        <el-table-column label="Receiving Address" align="center" prop="toAddress" />
        <el-table-column label="Chain" align="center" prop="chain" />
        <el-table-column label="Currency" align="center" prop="symbol" />
        <el-table-column label="Quantity" align="center" prop="amount" />
        <el-table-column label="Hash" align="center" prop="txId" />
        <el-table-column label="Contract Address" align="center" prop="contractAddress" />
        <el-table-column label="Transaction Type" align="center" prop="txType" />
        <el-table-column label="GAS" align="center" prop="txFee" />
        <el-table-column label="Confirmations" align="center" prop="confirmedNum" />
        <el-table-column label="Transaction Status" align="center" prop="status" />
        <el-table-column label="Block Time" align="center" prop="blockTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.blockTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['xpay:txRecord:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['xpay:txRecord:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit On-chain Transaction Record Dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="txRecordFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Order No." prop="orderId">
          <el-input v-model="form.orderId" placeholder="Please enter order number" />
        </el-form-item>
        <el-form-item label="Height" prop="blockNumber">
          <el-input v-model="form.blockNumber" placeholder="Please enter height" />
        </el-form-item>
        <el-form-item label="Payer Address" prop="fromAddress">
          <el-input v-model="form.fromAddress" placeholder="Please enter payout address" />
        </el-form-item>
        <el-form-item label="Receiving Address" prop="toAddress">
          <el-input v-model="form.toAddress" placeholder="Please enter the receiving address" />
        </el-form-item>
        <el-form-item label="Chain" prop="chain">
          <el-input v-model="form.chain" placeholder="Please enter chain" />
        </el-form-item>
        <el-form-item label="Currency" prop="symbol">
          <el-input v-model="form.symbol" placeholder="Please enter currency" />
        </el-form-item>
        <el-form-item label="Quantity" prop="amount">
          <el-input v-model="form.amount" placeholder="Please enter quantity" />
        </el-form-item>
        <el-form-item label="Hash" prop="txId">
          <el-input v-model="form.txId" placeholder="Enter Hash" />
        </el-form-item>
        <el-form-item label="Contract Address" prop="contractAddress">
          <el-input v-model="form.contractAddress" placeholder="Please enter contract address" />
        </el-form-item>
        <el-form-item label="GAS" prop="txFee">
          <el-input v-model="form.txFee" placeholder="Enter GAS" />
        </el-form-item>
        <el-form-item label="Confirmations" prop="confirmedNum">
          <el-input v-model="form.confirmedNum" placeholder="Please enter confirmation count" />
        </el-form-item>
        <el-form-item label="Block Time" prop="blockTime">
          <el-date-picker clearable
            v-model="form.blockTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select block time">
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

<script setup name="TxRecord" lang="ts">
import { listTxRecord, getTxRecord, delTxRecord, addTxRecord, updateTxRecord } from '@/api/xpay/txRecord';
import { TxRecordVO, TxRecordQuery, TxRecordForm } from '@/api/xpay/txRecord/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const txRecordList = ref<TxRecordVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeBlockTime = ref<[DateModelType, DateModelType]>(['', '']);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const txRecordFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: TxRecordForm = {
  id: undefined,
  orderId: undefined,
  blockNumber: undefined,
  fromAddress: undefined,
  toAddress: undefined,
  chain: undefined,
  symbol: undefined,
  amount: undefined,
  txId: undefined,
  contractAddress: undefined,
  txType: undefined,
  txFee: undefined,
  confirmedNum: undefined,
  status: undefined,
  blockTime: undefined,
}
const data = reactive<PageData<TxRecordForm, TxRecordQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: undefined,
    blockNumber: undefined,
    fromAddress: undefined,
    toAddress: undefined,
    chain: undefined,
    symbol: undefined,
    amount: undefined,
    txId: undefined,
    contractAddress: undefined,
    txType: undefined,
    txFee: undefined,
    confirmedNum: undefined,
    status: undefined,
    params: {
      blockTime: undefined,
      createTime: undefined,
    }
  },
  rules: {
    id: [
      { required: true, message: "ID cannot be empty", trigger: "blur" }
    ],
    orderId: [
      { required: true, message: "Order No. cannot be empty", trigger: "blur" }
    ],
    fromAddress: [
      { required: true, message: "Payer address cannot be empty", trigger: "blur" }
    ],
    toAddress: [
      { required: true, message: "Receiving address cannot be empty", trigger: "blur" }
    ],
    chain: [
      { required: true, message: "Chain cannot be empty", trigger: "blur" }
    ],
    amount: [
      { required: true, message: "Quantity cannot be empty", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query on-chain transaction record list */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeBlockTime.value, 'BlockTime');
  proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'CreateTime');
  const res = await listTxRecord(queryParams.value);
  txRecordList.value = res.rows;
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
  txRecordFormRef.value?.resetFields();
}

/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** Reset button action */
const resetQuery = () => {
  dateRangeBlockTime.value = ['', ''];
  dateRangeCreateTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** Checkbox selected data */
const handleSelectionChange = (selection: TxRecordVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add On-chain Transaction Record";
}

/** Edit button action */
const handleUpdate = async (row?: TxRecordVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getTxRecord(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Edit On-chain Transaction Record";
}

/** Submit button */
const submitForm = () => {
  txRecordFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateTxRecord(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addTxRecord(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Operation successful");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: TxRecordVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the on-chain transaction record ID "' + _ids + '" items?').finally(() => loading.value = false);
  await delTxRecord(_ids);
  proxy?.$modal.msgSuccess("Deleted successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('xpay/txRecord/export', {
    ...queryParams.value
  }, `txRecord_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
