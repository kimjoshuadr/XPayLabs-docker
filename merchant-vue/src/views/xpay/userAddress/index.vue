<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Merchant ID" prop="merchantId">
              <el-input v-model="queryParams.merchantId" placeholder="Please enter Merchant ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="User ID" prop="userId">
              <el-input v-model="queryParams.userId" placeholder="Please enter user ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Chain" prop="chain">
              <el-input v-model="queryParams.chain" placeholder="Please enter chain" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Address" prop="address">
              <el-input v-model="queryParams.address" placeholder="Please enter address" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Collectible" prop="collectible">
              <el-input v-model="queryParams.collectible" placeholder="Please enter whether it can be collected" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['xpay:userAddress:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['xpay:userAddress:edit']">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['xpay:userAddress:remove']">Delete</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:userAddress:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="userAddressList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Primary Key ID" align="center" prop="id" v-if="true" />
        <el-table-column label="Merchant ID" align="center" prop="merchantId" />
        <el-table-column label="User ID" align="center" prop="userId" />
        <el-table-column label="Chain" align="center" prop="chain" />
        <el-table-column label="Address" align="center" prop="address" />
        <el-table-column label="Collectible" align="center" prop="collectible" />
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['xpay:userAddress:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['xpay:userAddress:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit User Address Dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="userAddressFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Merchant ID" prop="merchantId">
          <el-input v-model="form.merchantId" placeholder="Please enter Merchant ID" />
        </el-form-item>
        <el-form-item label="User ID" prop="userId">
          <el-input v-model="form.userId" placeholder="Please enter user ID" />
        </el-form-item>
        <el-form-item label="Chain" prop="chain">
          <el-input v-model="form.chain" placeholder="Please enter chain" />
        </el-form-item>
        <el-form-item label="Address" prop="address">
          <el-input v-model="form.address" placeholder="Please enter address" />
        </el-form-item>
        <el-form-item label="Collectible" prop="collectible">
          <el-input v-model="form.collectible" placeholder="Please enter whether it can be collected" />
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

<script setup name="UserAddress" lang="ts">
import { listUserAddress, getUserAddress, delUserAddress, addUserAddress, updateUserAddress } from '@/api/xpay/userAddress';
import { UserAddressVO, UserAddressQuery, UserAddressForm } from '@/api/xpay/userAddress/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const userAddressList = ref<UserAddressVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const userAddressFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: UserAddressForm = {
  id: undefined,
  merchantId: undefined,
  userId: undefined,
  chain: undefined,
  address: undefined,
  collectible: undefined
}
const data = reactive<PageData<UserAddressForm, UserAddressQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    merchantId: undefined,
    userId: undefined,
    chain: undefined,
    address: undefined,
    collectible: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "Primary key ID cannot be empty", trigger: "blur" }
    ],
    merchantId: [
      { required: true, message: "Merchant ID cannot be empty", trigger: "blur" }
    ],
    userId: [
      { required: true, message: "User ID cannot be empty", trigger: "blur" }
    ],
    chain: [
      { required: true, message: "Chain cannot be empty", trigger: "blur" }
    ],
    address: [
      { required: true, message: "Address cannot be empty", trigger: "blur" }
    ],
    collectible: [
      { required: true, message: "Collectible cannot be empty", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query user address list */
const getList = async () => {
  loading.value = true;
  const res = await listUserAddress(queryParams.value);
  userAddressList.value = res.rows;
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
  userAddressFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: UserAddressVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add User Address";
}

/** Edit button action */
const handleUpdate = async (row?: UserAddressVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getUserAddress(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Edit User Address";
}

/** Submit button */
const submitForm = () => {
  userAddressFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateUserAddress(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addUserAddress(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Operation successful");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: UserAddressVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the user address with ID "' + _ids + '" items?').finally(() => loading.value = false);
  await delUserAddress(_ids);
  proxy?.$modal.msgSuccess("Deleted successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('xpay/userAddress/export', {
    ...queryParams.value
  }, `userAddress_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
