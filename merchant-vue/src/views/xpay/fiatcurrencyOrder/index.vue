<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Merchant Order No." prop="orderNo">
              <el-input v-model="queryParams.orderNo" placeholder="Please enter merchant order number" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Merchant ID" prop="merchantId">
              <el-input v-model="queryParams.merchantId" placeholder="Please enter merchant ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Amount" prop="amount">
              <el-input v-model="queryParams.amount" placeholder="Please enter amount" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Currency" prop="currency">
              <el-input v-model="queryParams.currency" placeholder="Please enter currency" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Payer Name" prop="payerName">
              <el-input v-model="queryParams.payerName" placeholder="Please enter payer name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Payer Account" prop="payerAccount">
              <el-input v-model="queryParams.payerAccount" placeholder="Please enter payer account" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Payer Phone Number" prop="payerPhone">
              <el-input v-model="queryParams.payerPhone" placeholder="Please enter payer's phone number" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Payer Email" prop="payerEmail">
              <el-input v-model="queryParams.payerEmail" placeholder="Enter payer email" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Payment Code" prop="payerCode">
              <el-input v-model="queryParams.payerCode" placeholder="Please enter payment code" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Payee Name" prop="payeeName">
              <el-input v-model="queryParams.payeeName" placeholder="Please enter payee name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Payee Account" prop="payeeAccount">
              <el-input v-model="queryParams.payeeAccount" placeholder="Please enter payee account" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Payee Phone Number" prop="payeePhone">
              <el-input v-model="queryParams.payeePhone" placeholder="Please enter payee's phone number" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Payee Email" prop="payeeEmail">
              <el-input v-model="queryParams.payeeEmail" placeholder="Enter payee email" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Collection Code" prop="payeeCode">
              <el-input v-model="queryParams.payeeCode" placeholder="Please enter collection code" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Payment Channel Code" prop="channelCode">
              <el-input v-model="queryParams.channelCode" placeholder="Please enter payment channel code" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Merchant Notification URL" prop="notifyUrl">
              <el-input v-model="queryParams.notifyUrl" placeholder="Please enter merchant notification URL" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Third-Party Response" prop="thirdPartyResponse">
              <el-input v-model="queryParams.thirdPartyResponse" placeholder="Please enter third-party response content" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['xpay:fiatcurrencyOrder:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['xpay:fiatcurrencyOrder:edit']">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['xpay:fiatcurrencyOrder:remove']">Delete</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:fiatcurrencyOrder:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="fiatcurrencyOrderList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="" align="center" prop="id" v-if="true" />
        <el-table-column label="Merchant Order No." align="center" prop="orderNo" />
        <el-table-column label="Merchant ID" align="center" prop="merchantId" />
        <el-table-column label="Order Type" align="center" prop="orderType" />
        <el-table-column label="Amount" align="center" prop="amount" />
        <el-table-column label="Currency" align="center" prop="currency" />
        <el-table-column label="Payer Name" align="center" prop="payerName" />
        <el-table-column label="Payer Account" align="center" prop="payerAccount" />
        <el-table-column label="Payer Phone Number" align="center" prop="payerPhone" />
        <el-table-column label="Payer Email" align="center" prop="payerEmail" />
        <el-table-column label="Payment Code" align="center" prop="payerCode" />
        <el-table-column label="Extended field, JSON format" align="center" prop="extra" />
        <el-table-column label="Payee Name" align="center" prop="payeeName" />
        <el-table-column label="Payee Account" align="center" prop="payeeAccount" />
        <el-table-column label="Payee Phone Number" align="center" prop="payeePhone" />
        <el-table-column label="Payee Email" align="center" prop="payeeEmail" />
        <el-table-column label="Collection Code" align="center" prop="payeeCode" />
        <el-table-column label="Order Status: INIT,WAIT, PADDING, SUCCESS, FAIL" align="center" prop="status" />
        <el-table-column label="Payment Channel Code" align="center" prop="channelCode" />
        <el-table-column label="Merchant Notification URL" align="center" prop="notifyUrl" />
        <el-table-column label="Remark" align="center" prop="remark" />
        <el-table-column label="Third-Party Response" align="center" prop="thirdPartyResponse" />
        <el-table-column label="Third-Party Callback" align="center" prop="callbackContent" />
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['xpay:fiatcurrencyOrder:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['xpay:fiatcurrencyOrder:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Fiat Order Dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="fiatcurrencyOrderFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Merchant Order No." prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="Please enter merchant order number" />
        </el-form-item>
        <el-form-item label="Merchant ID" prop="merchantId">
          <el-input v-model="form.merchantId" placeholder="Please enter merchant ID" />
        </el-form-item>
        <el-form-item label="Amount" prop="amount">
          <el-input v-model="form.amount" placeholder="Please enter amount" />
        </el-form-item>
        <el-form-item label="Currency" prop="currency">
          <el-input v-model="form.currency" placeholder="Please enter currency" />
        </el-form-item>
        <el-form-item label="Payer Name" prop="payerName">
          <el-input v-model="form.payerName" placeholder="Please enter payer name" />
        </el-form-item>
        <el-form-item label="Payer Account" prop="payerAccount">
          <el-input v-model="form.payerAccount" placeholder="Please enter payer account" />
        </el-form-item>
        <el-form-item label="Payer Phone Number" prop="payerPhone">
          <el-input v-model="form.payerPhone" placeholder="Please enter payer's phone number" />
        </el-form-item>
        <el-form-item label="Payer Email" prop="payerEmail">
          <el-input v-model="form.payerEmail" placeholder="Enter payer email" />
        </el-form-item>
        <el-form-item label="Payment Code" prop="payerCode">
          <el-input v-model="form.payerCode" placeholder="Please enter payment code" />
        </el-form-item>
        <el-form-item label="Payee Name" prop="payeeName">
          <el-input v-model="form.payeeName" placeholder="Please enter payee name" />
        </el-form-item>
        <el-form-item label="Payee Account" prop="payeeAccount">
          <el-input v-model="form.payeeAccount" placeholder="Please enter payee account" />
        </el-form-item>
        <el-form-item label="Payee Phone Number" prop="payeePhone">
          <el-input v-model="form.payeePhone" placeholder="Please enter payee's phone number" />
        </el-form-item>
        <el-form-item label="Payee Email" prop="payeeEmail">
          <el-input v-model="form.payeeEmail" placeholder="Enter payee email" />
        </el-form-item>
        <el-form-item label="Collection Code" prop="payeeCode">
          <el-input v-model="form.payeeCode" placeholder="Please enter collection code" />
        </el-form-item>
        <el-form-item label="Payment Channel Code" prop="channelCode">
          <el-input v-model="form.channelCode" placeholder="Please enter payment channel code" />
        </el-form-item>
        <el-form-item label="Merchant Notification URL" prop="notifyUrl">
          <el-input v-model="form.notifyUrl" placeholder="Please enter merchant notification URL" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" placeholder="Please enter remark" />
        </el-form-item>
        <el-form-item label="Third-Party Response" prop="thirdPartyResponse">
            <el-input v-model="form.thirdPartyResponse" type="textarea" placeholder="Enter content" />
        </el-form-item>
        <el-form-item label="Third-Party Callback">
          <editor v-model="form.callbackContent" :min-height="192"/>
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

<script setup name="FiatcurrencyOrder" lang="ts">
import { listFiatcurrencyOrder, getFiatcurrencyOrder, delFiatcurrencyOrder, addFiatcurrencyOrder, updateFiatcurrencyOrder } from '@/api/xpay/fiatcurrencyOrder';
import { FiatcurrencyOrderVO, FiatcurrencyOrderQuery, FiatcurrencyOrderForm } from '@/api/xpay/fiatcurrencyOrder/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const fiatcurrencyOrderList = ref<FiatcurrencyOrderVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);
const dateRangeUpdateTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const fiatcurrencyOrderFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FiatcurrencyOrderForm = {
  id: undefined,
  orderNo: undefined,
  merchantId: undefined,
  orderType: undefined,
  amount: undefined,
  currency: undefined,
  payerName: undefined,
  payerAccount: undefined,
  payerPhone: undefined,
  payerEmail: undefined,
  payerCode: undefined,
  extra: undefined,
  payeeName: undefined,
  payeeAccount: undefined,
  payeePhone: undefined,
  payeeEmail: undefined,
  payeeCode: undefined,
  status: undefined,
  channelCode: undefined,
  notifyUrl: undefined,
  remark: undefined,
  thirdPartyResponse: undefined,
  callbackContent: undefined
}
const data = reactive<PageData<FiatcurrencyOrderForm, FiatcurrencyOrderQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    merchantId: undefined,
    orderType: undefined,
    amount: undefined,
    currency: undefined,
    payerName: undefined,
    payerAccount: undefined,
    payerPhone: undefined,
    payerEmail: undefined,
    payerCode: undefined,
    extra: undefined,
    payeeName: undefined,
    payeeAccount: undefined,
    payeePhone: undefined,
    payeeEmail: undefined,
    payeeCode: undefined,
    status: undefined,
    channelCode: undefined,
    notifyUrl: undefined,
    thirdPartyResponse: undefined,
    callbackContent: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "cannot be empty", trigger: "blur" }
    ],
    orderNo: [
      { required: true, message: "Merchant order no. cannot be empty", trigger: "blur" }
    ],
    merchantId: [
      { required: true, message: "Merchant ID cannot be empty", trigger: "blur" }
    ],
    orderType: [
      { required: true, message: "Order type cannot be empty", trigger: "change" }
    ],
    amount: [
      { required: true, message: "Amount cannot be empty", trigger: "blur" }
    ],
    currency: [
      { required: true, message: "Currency cannot be empty", trigger: "blur" }
    ],
    payerName: [
      { required: true, message: "Payer name cannot be empty", trigger: "blur" }
    ],
    payerAccount: [
      { required: true, message: "Payer account cannot be empty", trigger: "blur" }
    ],
    payerPhone: [
      { required: true, message: "Payer's phone number cannot be empty", trigger: "blur" }
    ],
    payerEmail: [
      { required: true, message: "Payer email cannot be empty", trigger: "blur" }
    ],
    payerCode: [
      { required: true, message: "Payment code cannot be empty", trigger: "blur" }
    ],
    extra: [
      { required: true, message: "Extended field, JSON format cannot be empty", trigger: "blur" }
    ],
    payeeName: [
      { required: true, message: "Payee name cannot be empty", trigger: "blur" }
    ],
    payeeAccount: [
      { required: true, message: "Payee account cannot be empty", trigger: "blur" }
    ],
    payeePhone: [
      { required: true, message: "Payee phone number cannot be empty", trigger: "blur" }
    ],
    payeeEmail: [
      { required: true, message: "Payee email cannot be empty", trigger: "blur" }
    ],
    payeeCode: [
      { required: true, message: "Collection code cannot be empty", trigger: "blur" }
    ],
    status: [
      { required: true, message: "Order status: INIT,WAIT, PADDING, SUCCESS, FAIL cannot be empty", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query fiat order list */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'CreateTime');
  proxy?.addDateRange(queryParams.value, dateRangeUpdateTime.value, 'UpdateTime');
  const res = await listFiatcurrencyOrder(queryParams.value);
  fiatcurrencyOrderList.value = res.rows;
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
  fiatcurrencyOrderFormRef.value?.resetFields();
}

/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** Reset button action */
const resetQuery = () => {
  dateRangeCreateTime.value = ['', ''];
  dateRangeUpdateTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** Checkbox selected data */
const handleSelectionChange = (selection: FiatcurrencyOrderVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add Fiat Order";
}

/** Edit button action */
const handleUpdate = async (row?: FiatcurrencyOrderVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getFiatcurrencyOrder(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Edit Fiat Order";
}

/** Submit button */
const submitForm = () => {
  fiatcurrencyOrderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateFiatcurrencyOrder(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addFiatcurrencyOrder(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Operation successful");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: FiatcurrencyOrderVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the fiat order with ID "' + _ids + '" items?').finally(() => loading.value = false);
  await delFiatcurrencyOrder(_ids);
  proxy?.$modal.msgSuccess("Deleted successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('xpay/fiatcurrencyOrder/export', {
    ...queryParams.value
  }, `fiatcurrencyOrder_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
