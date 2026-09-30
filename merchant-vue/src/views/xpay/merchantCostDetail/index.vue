<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <!-- <el-form-item label="Merchant ID" prop="merchantId">
              <el-input v-model="queryParams.merchantId" placeholder="Please enter Merchant ID" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="Currency" prop="symbol">
              <el-input v-model="queryParams.symbol" placeholder="Please enter currency" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="Quantity" prop="amount">
              <el-input v-model="queryParams.amount" placeholder="Please enter quantity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Business ID" prop="businessId">
              <el-input v-model="queryParams.businessId" placeholder="Please enter business ID" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['xpay:merchantCostDetail:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['xpay:merchantCostDetail:edit']">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['xpay:merchantCostDetail:remove']">Delete</el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:merchantCostDetail:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="merchantCostDetailList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="Primary Key ID" align="center" prop="id" v-if="true" /> -->
        <!-- <el-table-column label="Merchant ID" align="center" prop="merchantId" /> -->
        <el-table-column label="Fee Type" align="center" prop="costType" />
        <el-table-column label="Chain" align="center" prop="chain" />
        <el-table-column label="Currency" align="center" prop="symbol" />
        <el-table-column label="Quantity" align="center" prop="amount" />
        <el-table-column label="Business ID" align="center" prop="businessId" />
        <el-table-column label="Created At" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['xpay:merchantCostDetail:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['xpay:merchantCostDetail:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column> -->
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Merchant Fee Details Dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="merchantCostDetailFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Merchant ID" prop="merchantId">
          <el-input v-model="form.merchantId" placeholder="Please enter Merchant ID" />
        </el-form-item>
        <el-form-item label="Currency" prop="symbol">
          <el-input v-model="form.symbol" placeholder="Please enter currency" />
        </el-form-item>
        <el-form-item label="Quantity" prop="amount">
          <el-input v-model="form.amount" placeholder="Please enter quantity" />
        </el-form-item>
        <el-form-item label="Business ID" prop="businessId">
          <el-input v-model="form.businessId" placeholder="Please enter business ID" />
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

<script setup name="MerchantCostDetail" lang="ts">
import { listMerchantCostDetail, getMerchantCostDetail, delMerchantCostDetail, addMerchantCostDetail, updateMerchantCostDetail } from '@/api/xpay/merchantCostDetail';
import { MerchantCostDetailVO, MerchantCostDetailQuery, MerchantCostDetailForm } from '@/api/xpay/merchantCostDetail/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const merchantCostDetailList = ref<MerchantCostDetailVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const merchantCostDetailFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: MerchantCostDetailForm = {
  id: undefined,
  merchantId: undefined,
  costType: undefined,
  chain: undefined,
  symbol: undefined,
  amount: undefined,
  businessId: undefined,
}
const data = reactive<PageData<MerchantCostDetailForm, MerchantCostDetailQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    merchantId: undefined,
    costType: undefined,
    chain: undefined,
    symbol: undefined,
    amount: undefined,
    businessId: undefined,
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
    costType: [
      { required: true, message: "Fee type cannot be empty", trigger: "change" }
    ],
    chain: [
      { required: true, message: "Chain cannot be empty", trigger: "change" }
    ],
    symbol: [
      { required: true, message: "Currency cannot be empty", trigger: "blur" }
    ],
    amount: [
      { required: true, message: "Quantity cannot be empty", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query merchant fee detail list */
const getList = async () => {
  loading.value = true;
  queryParams.value.params = {};
  proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'CreateTime');
  const res = await listMerchantCostDetail(queryParams.value);
  merchantCostDetailList.value = res.rows;
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
  merchantCostDetailFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: MerchantCostDetailVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add Merchant Fee Details";
}

/** Edit button action */
const handleUpdate = async (row?: MerchantCostDetailVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getMerchantCostDetail(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Edit Merchant Fee Details";
}

/** Submit button */
const submitForm = () => {
  merchantCostDetailFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateMerchantCostDetail(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addMerchantCostDetail(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Operation successful");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: MerchantCostDetailVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the merchant fee detail with ID "' + _ids + '" items?').finally(() => loading.value = false);
  await delMerchantCostDetail(_ids);
  proxy?.$modal.msgSuccess("Deleted successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('xpay/merchantCostDetail/export', {
    ...queryParams.value
  }, `merchantCostDetail_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
