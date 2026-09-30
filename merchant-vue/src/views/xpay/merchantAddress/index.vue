<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Merchant ID" prop="merchantId">
              <el-input v-model="queryParams.merchantId" placeholder="Please enter Merchant ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Chain" prop="chain">
              <el-input v-model="queryParams.chain" placeholder="Please enter chain" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Currency" prop="symbol">
              <el-input v-model="queryParams.symbol" placeholder="Please enter currency" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Cold Wallet Address" prop="coldAddress">
              <el-input v-model="queryParams.coldAddress" placeholder="Please enter cold wallet address" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Collection Trigger Quantity" prop="collectAmount">
              <el-input v-model="queryParams.collectAmount" placeholder="Enter collection trigger amount" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Hot Wallet Address" prop="hotAddress">
              <el-input v-model="queryParams.hotAddress" placeholder="Please enter the hot wallet address" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['xpay:merchantAddress:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['xpay:merchantAddress:edit']">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['xpay:merchantAddress:remove']">Delete</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:merchantAddress:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="merchantAddressList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Primary Key ID" align="center" prop="id" v-if="true" />
        <el-table-column label="Merchant ID" align="center" prop="merchantId" />
        <el-table-column label="Chain" align="center" prop="chain" />
        <el-table-column label="Currency" align="center" prop="symbol" />
        <el-table-column label="Cold Wallet Address" align="center" prop="coldAddress" />
        <el-table-column label="Collection Trigger Quantity" align="center" prop="collectAmount" />
        <el-table-column label="Hot Wallet Address" align="center" prop="hotAddress" />
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['xpay:merchantAddress:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['xpay:merchantAddress:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Merchant Wallet Address Dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="merchantAddressFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Merchant ID" prop="merchantId">
          <el-input v-model="form.merchantId" placeholder="Please enter Merchant ID" />
        </el-form-item>
        <el-form-item label="Chain" prop="chain">
          <el-input v-model="form.chain" placeholder="Please enter chain" />
        </el-form-item>
        <el-form-item label="Currency" prop="symbol">
          <el-input v-model="form.symbol" placeholder="Please enter currency" />
        </el-form-item>
        <el-form-item label="Cold Wallet Address" prop="coldAddress">
          <el-input v-model="form.coldAddress" placeholder="Please enter cold wallet address" />
        </el-form-item>
        <el-form-item label="Collection Trigger Quantity" prop="collectAmount">
          <el-input v-model="form.collectAmount" placeholder="Enter collection trigger amount" />
        </el-form-item>
        <el-form-item label="Hot Wallet Address" prop="hotAddress">
          <el-input v-model="form.hotAddress" placeholder="Please enter the hot wallet address" />
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

<script setup name="MerchantAddress" lang="ts">
import { listMerchantAddress, getMerchantAddress, delMerchantAddress, addMerchantAddress, updateMerchantAddress } from '@/api/xpay/merchantAddress';
import { MerchantAddressVO, MerchantAddressQuery, MerchantAddressForm } from '@/api/xpay/merchantAddress/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const merchantAddressList = ref<MerchantAddressVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const merchantAddressFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: MerchantAddressForm = {
  id: undefined,
  merchantId: undefined,
  chain: undefined,
  symbol: undefined,
  coldAddress: undefined,
  collectAmount: undefined,
  hotAddress: undefined
}
const data = reactive<PageData<MerchantAddressForm, MerchantAddressQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    merchantId: undefined,
    chain: undefined,
    symbol: undefined,
    coldAddress: undefined,
    collectAmount: undefined,
    hotAddress: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "Primary key ID cannot be empty", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query merchant wallet address list */
const getList = async () => {
  loading.value = true;
  const res = await listMerchantAddress(queryParams.value);
  merchantAddressList.value = res.rows;
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
  merchantAddressFormRef.value?.resetFields();
}

/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** Checkbox selected data */
const handleSelectionChange = (selection: MerchantAddressVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add Merchant Wallet Address";
}

/** Edit button action */
const handleUpdate = async (row?: MerchantAddressVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getMerchantAddress(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Edit Merchant Wallet Address";
}

/** Submit button */
const submitForm = () => {
  merchantAddressFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateMerchantAddress(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addMerchantAddress(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Operation successful");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: MerchantAddressVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the merchant wallet address with ID "' + _ids + '" items?').finally(() => loading.value = false);
  await delMerchantAddress(_ids);
  proxy?.$modal.msgSuccess("Deleted successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('xpay/merchantAddress/export', {
    ...queryParams.value
  }, `merchantAddress_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
