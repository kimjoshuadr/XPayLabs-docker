<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Merchant Name" prop="name">
              <el-input v-model="queryParams.name" placeholder="Please enter merchant name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="Merchant Auth Token" prop="token">
              <el-input v-model="queryParams.token" placeholder="Enter merchant auth token" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Webhook Secret" prop="webhookSecret">
              <el-input v-model="queryParams.webhookSecret" placeholder="Enter webhook secret" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="VIP Level" prop="vip">
              <el-input v-model="queryParams.vip" placeholder="Please enter VIP level" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Fee (Percentage)" prop="feeRatio">
              <el-input v-model="queryParams.feeRatio" placeholder="Please enter fee (percentage)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Callback URL" prop="callbackUrl">
              <el-input v-model="queryParams.callbackUrl" placeholder="Please enter callback URL" clearable @keyup.enter="handleQuery" />
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
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['xpay:merchant:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['xpay:merchant:edit']">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['xpay:merchant:remove']">Delete</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:merchant:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="merchantList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="ID" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="Merchant Name" align="center" prop="name" />
        <!-- <el-table-column label="Merchant Auth Token" align="center" prop="token" />
        <el-table-column label="Webhook Secret" align="center" prop="webhookSecret" /> -->
        <!-- <el-table-column label="VIP Level" align="center" prop="vip" /> -->
        <el-table-column label="Fee (Percentage)" align="center" prop="feeRatio" />
        <!-- <el-table-column label="Withdrawal Type" align="center" prop="withdrawalType" >
          <template #default="scope">
            <el-tag v-if="scope.row.withdrawalType === 'AUTO'" type="success">Auto</el-tag>
            <el-tag v-else type="info">Manual</el-tag>
          </template>
        </el-table-column> -->
        <el-table-column label="Callback URL" align="center" prop="callbackUrl" />
        <el-table-column label="Created At" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['xpay:merchant:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['xpay:merchant:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Merchant Information Dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="merchantFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="Merchant Name" prop="name">
          <el-input v-model="form.name" placeholder="Please enter merchant name" />
        </el-form-item>
        <!-- <el-form-item label="Merchant Auth Token" prop="token">
          <el-input v-model="form.token" placeholder="Enter merchant auth token" />
        </el-form-item>
        <el-form-item label="Webhook Secret" prop="webhookSecret">
          <el-input v-model="form.webhookSecret" placeholder="Enter webhook secret" />
        </el-form-item> -->
        <el-form-item label="System Version" prop="merchantSysVersion">
          <el-select v-model="form.merchantSysVersion" clearable placeholder="Please select withdrawal method">
            <el-option key="V3" label="V3" value="V3" />
            <!-- <el-option key="V2" label="V2" value="V2" /> -->
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="Withdrawal Method" prop="withdrawalType">
          <el-select v-model="form.withdrawalType" clearable placeholder="Please select system version">
              <el-option key="AUTO" label="Auto" value="AUTO" />
              <el-option key="MANUAL" label="Manual" value="MANUAL" />
          </el-select>
        </el-form-item> -->
        <!-- <el-form-item label="VIP Level" prop="vip">
          <el-input v-model="form.vip" placeholder="Please enter VIP level" />
        </el-form-item> -->
        <el-form-item label="Fee (Percentage)" prop="feeRatio">
          <el-input v-model="form.feeRatio" placeholder="Please enter fee (percentage)" oninput="this.value = this.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')" />
        </el-form-item>
        <el-form-item label="Callback URL" prop="callbackUrl">
          <el-input v-model="form.callbackUrl" placeholder="Please enter callback URL" type="url" />
        </el-form-item>
        <el-form-item label="Account Type" prop="accountType">
          <el-select v-model="form.accountType" clearable placeholder="Please select account type">
            <el-option key="TEST" label="TEST" value="TEST" />
            <el-option key="MAIN" label="MAIN" value="MAIN" />
          </el-select>
        </el-form-item>
        <el-form-item label="Generated Address Type" prop="generatedAddressType">
          <el-select v-model="form.generatedAddressType" clearable placeholder="Please select address type to generate">
            <el-option key="ORDER" label="ORDER - Address repeatedly used" value="ORDER" />
            <el-option key="USER" label="USER - one address per user" value="USER" />
          </el-select>
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

<script setup name="Merchant" lang="ts">
import { listMerchant, getMerchant, delMerchant, addMerchant, updateMerchant } from '@/api/xpay/merchant';
import { MerchantVO, MerchantQuery, MerchantForm } from '@/api/xpay/merchant/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const merchantList = ref<MerchantVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const merchantFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: MerchantForm = {
  id: undefined,
  name: undefined,
  token: undefined,
  webhookSecret: undefined,
  vip: undefined,
  feeRatio: 0,
  withdrawalType: undefined,
  callbackUrl: undefined,
  accountType: undefined,
  generatedAddressType: undefined,
}
const data = reactive<PageData<MerchantForm, MerchantQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    token: undefined,
    webhookSecret: undefined,
    vip: undefined,
    feeRatio: undefined,
    withdrawalType: undefined,
    callbackUrl: undefined,
    accountType: undefined,
    generatedAddressType: undefined,
    params: {
      createTime: undefined
    }
  },
  rules: {
    id: [
      { required: true, message: "ID cannot be empty", trigger: "blur" }
    ],
    name: [
      { required: true, message: "Merchant name cannot be empty", trigger: "blur" }
    ],
    merchantSysVersion: [
      { required: true, message: "System version cannot be empty", trigger: "change" }
    ],
    token: [
      { required: true, message: "Merchant auth token cannot be empty", trigger: "blur" }
    ],
    webhookSecret: [
      { required: true, message: "webhook secret cannot be empty", trigger: "blur" }
    ],
    feeRatio: [
      { required: true, message: "Fee cannot be empty", trigger: "blur" },
      { pattern: /^\d+(\.\d+)?$/, message: "Fee can only contain numbers (including decimals)", trigger: "blur" }
    ],
    callbackUrl: [
      { required: true, message: "Callback URL cannot be empty", trigger: "blur" },
      { type: "url", message: "Enter a valid URL", trigger: "blur" }
    ],
    accountType: [
      { required: true, message: "Account type cannot be empty", trigger: "change" }
    ],
    generatedAddressType: [
      { required: true, message: "Address generation type cannot be empty", trigger: "change" }
    ],
    // withdrawalType: [
    //   { required: true, message: "Withdrawal type cannot be empty", trigger: "change" }
    // ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query merchant information list */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'CreateTime');
  const res = await listMerchant(queryParams.value);
  merchantList.value = res.rows;
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
  merchantFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: MerchantVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add Merchant Information";
}

/** Edit button action */
const handleUpdate = async (row?: MerchantVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getMerchant(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Edit Merchant Information";
}

/** Submit button */
const submitForm = () => {
  merchantFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateMerchant(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addMerchant(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Operation successful");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: MerchantVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the merchant info with ID "' + _ids + '" items?').finally(() => loading.value = false);
  await delMerchant(_ids);
  proxy?.$modal.msgSuccess("Deleted successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('xpay/merchant/export', {
    ...queryParams.value
  }, `merchant_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
