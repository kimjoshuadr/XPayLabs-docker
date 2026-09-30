<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Tenant ID" prop="tenantId">
              <el-input v-model="queryParams.tenantId" placeholder="Please enter tenant ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Contact Person" prop="contactUserName">
              <el-input v-model="queryParams.contactUserName" placeholder="Please enter contact person" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Contact Phone" prop="contactPhone">
              <el-input v-model="queryParams.contactPhone" placeholder="Please enter contact phone" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Company Name" prop="companyName">
              <el-input v-model="queryParams.companyName" placeholder="Please enter company name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
              <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:tenant:add']" type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:tenant:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >Edit</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:tenant:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              Delete
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:tenant:export']" type="warning" plain icon="Download" @click="handleExport">Export</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-if="userId === 1" type="success" plain icon="Refresh" @click="handleSyncTenantDict">Sync Tenant Dictionary</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="tenantList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="id" align="center" prop="id" />
        <el-table-column label="Tenant ID" align="center" prop="tenantId" />
        <el-table-column label="Contact Person" align="center" prop="contactUserName" />
        <el-table-column label="Contact Phone" align="center" prop="contactPhone" />
        <el-table-column label="Company Name" align="center" prop="companyName" />
        <el-table-column label="Unified Social Credit Code" align="center" prop="licenseNumber" />
        <el-table-column label="Expiration Time" align="center" prop="expireTime" width="180">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.expireTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Tenant Status" align="center" prop="status">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column width="150" label="Actions" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button v-hasPermi="['system:tenant:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Sync Plan" placement="top">
              <el-button v-hasPermi="['system:tenant:edit']" link type="primary" icon="Refresh" @click="handleSyncTenantPackage(scope.row)">
              </el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button v-hasPermi="['system:tenant:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- Add or edit tenant dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="tenantFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Company Name" prop="companyName">
          <el-input v-model="form.companyName" placeholder="Please enter company name" />
        </el-form-item>
        <el-form-item label="Contact Person" prop="contactUserName">
          <el-input v-model="form.contactUserName" placeholder="Please enter contact person" />
        </el-form-item>
        <el-form-item label="Contact Phone" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="Please enter contact phone" />
        </el-form-item>
        <el-form-item v-if="!form.id" label="Username" prop="username">
          <el-input v-model="form.username" placeholder="Please enter system username" maxlength="30" />
        </el-form-item>
        <el-form-item v-if="!form.id" label="User Password" prop="password">
          <el-input v-model="form.password" type="password" placeholder="Please enter system user password" maxlength="20" />
        </el-form-item>
        <el-form-item label="Tenant Package" prop="packageId">
          <el-select v-model="form.packageId" :disabled="!!form.tenantId" placeholder="Please select tenant package" clearable style="width: 100%">
            <el-option v-for="item in packageList" :key="item.packageId" :label="item.packageName" :value="item.packageId" />
          </el-select>
        </el-form-item>
        <el-form-item label="Expiration Time" prop="expireTime">
          <el-date-picker v-model="form.expireTime" clearable type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select expiration time">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="User Count" prop="accountCount">
          <el-input v-model="form.accountCount" placeholder="Please enter number of users" />
        </el-form-item>
        <el-form-item label="Bind Domain" prop="domain">
          <el-input v-model="form.domain" placeholder="Please enter bound domain" />
        </el-form-item>
        <el-form-item label="Company Address" prop="address">
          <el-input v-model="form.address" placeholder="Please enter company address" />
        </el-form-item>
        <el-form-item label="Company Code" prop="licenseNumber">
          <el-input v-model="form.licenseNumber" placeholder="Enter unified social credit code" />
        </el-form-item>
        <el-form-item label="Company Profile" prop="intro">
          <el-input v-model="form.intro" type="textarea" placeholder="Please enter company profile" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" placeholder="Please enter remark" />
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

<script setup name="Tenant" lang="ts">
import {
  listTenant,
  getTenant,
  delTenant,
  addTenant,
  updateTenant,
  changeTenantStatus,
  syncTenantPackage,
  syncTenantDict
} from '@/api/system/tenant';
import { selectTenantPackage } from '@/api/system/tenantPackage';
import { useUserStore } from '@/store/modules/user';
import { TenantForm, TenantQuery, TenantVO } from '@/api/system/tenant/types';
import { TenantPkgVO } from '@/api/system/tenantPackage/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const userStore = useUserStore();
const userId = ref(userStore.userId);
const tenantList = ref<TenantVO[]>([]);
const packageList = ref<TenantPkgVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tenantFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: TenantForm = {
  id: undefined,
  tenantId: undefined,
  contactUserName: '',
  contactPhone: '',
  username: '',
  password: '',
  companyName: '',
  licenseNumber: '',
  domain: '',
  address: '',
  intro: '',
  remark: '',
  packageId: '',
  expireTime: '',
  accountCount: 0,
  status: '0'
};
const data = reactive<PageData<TenantForm, TenantQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tenantId: '',
    contactUserName: '',
    contactPhone: '',
    companyName: ''
  },
  rules: {
    id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
    tenantId: [{ required: true, message: 'Tenant ID cannot be empty', trigger: 'blur' }],
    contactUserName: [{ required: true, message: 'Contact cannot be empty', trigger: 'blur' }],
    contactPhone: [{ required: true, message: 'Contact phone cannot be empty', trigger: 'blur' }],
    companyName: [{ required: true, message: 'Company name cannot be empty', trigger: 'blur' }],
    username: [
      { required: true, message: 'Username cannot be empty', trigger: 'blur' },
      { min: 2, max: 20, message: 'Username length must be between 2 and 20', trigger: 'blur' }
    ],
    password: [
      { required: true, message: 'Password cannot be empty', trigger: 'blur' },
      { min: 5, max: 20, message: 'User password length must be between 5 and 20', trigger: 'blur' }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query all tenant packages */
const getTenantPackage = async () => {
  const res = await selectTenantPackage();
  packageList.value = res.data;
};

/** Query tenant list */
const getList = async () => {
  loading.value = true;
  const res = await listTenant(queryParams.value);
  tenantList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

// Tenant package status modification
const handleStatusChange = async (row: TenantVO) => {
  const text = row.status === '0' ? 'Enable' : 'Disable';
  try {
    await proxy?.$modal.confirm('Confirm to "' + text + '""' + row.companyName + '"Tenant?');
    await changeTenantStatus(row.id, row.tenantId, row.status);
    proxy?.$modal.msgSuccess(text + 'Success');
  } catch {
    row.status = row.status === '0' ? '1' : '0';
  }
};

// Cancel button
const cancel = () => {
  reset();
  dialog.visible = false;
};

// Reset form
const reset = () => {
  form.value = { ...initFormData };
  tenantFormRef.value?.resetFields();
};

/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

// Checkbox selected data
const handleSelectionChange = (selection: TenantVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add button action */
const handleAdd = () => {
  reset();
  getTenantPackage();
  dialog.visible = true;
  dialog.title = 'Add Tenant';
};

/** Edit button action */
const handleUpdate = async (row?: TenantVO) => {
  reset();
  await getTenantPackage();
  const _id = row?.id || ids.value[0];
  const res = await getTenant(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Tenant';
};

/** Submit button */
const submitForm = () => {
  tenantFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateTenant(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTenant(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete button action */
const handleDelete = async (row?: TenantVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the tenant with ID "' + _ids + '" items?');
  loading.value = true;
  await delTenant(_ids).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};

/** Sync tenant package button action */
const handleSyncTenantPackage = async (row: TenantVO) => {
  try {
    await proxy?.$modal.confirm('Are you sure you want to sync the tenant plan for tenant ID "' + row.tenantId + '" items?');
    loading.value = true;
    await syncTenantPackage(row.tenantId, row.packageId);
    await getList();
    proxy?.$modal.msgSuccess('Synced successfully');
  } catch {
    return;
  } finally {
    loading.value = false;
  }
};

/** Export button action */
const handleExport = () => {
  proxy?.download(
    'system/tenant/export',
    {
      ...queryParams.value
    },
    `tenant_${new Date().getTime()}.xlsx`
  );
};

/** Sync tenant dictionary */
const handleSyncTenantDict = async () => {
  await proxy?.$modal.confirm('Are you sure you want to sync all tenant dictionaries?');
  const res = await syncTenantDict();
  proxy?.$modal.msgSuccess(res.msg);
};

onMounted(() => {
  getList();
});
</script>
