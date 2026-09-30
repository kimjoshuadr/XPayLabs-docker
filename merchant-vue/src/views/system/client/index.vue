<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="search">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="85px">
          <el-form-item label="Client Key" prop="clientKey">
            <el-input v-model="queryParams.clientKey" placeholder="Please enter client key" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Client Secret" prop="clientSecret">
            <el-input v-model="queryParams.clientSecret" placeholder="Please enter client secret" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="Status" prop="status">
            <el-select v-model="queryParams.status" placeholder="Status" clearable>
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
            <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:client:add']" type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:client:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">
              Edit
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:client:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              Delete
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:client:export']" type="warning" plain icon="Download" @click="handleExport">Export</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="clientList" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="true" label="id" align="center" prop="id" />
        <el-table-column label="Client ID" align="center" prop="clientId" />
        <el-table-column label="Client Key" align="center" prop="clientKey" />
        <el-table-column label="Client Secret" align="center" prop="clientSecret" />
        <el-table-column label="Grant Type" align="center">
          <template #default="scope">
            <dict-tag :options="sys_grant_type" :value="scope.row.grantTypeList" />
          </template>
        </el-table-column>
        <el-table-column label="Device Type" align="center">
          <template #default="scope">
            <dict-tag :options="sys_device_type" :value="scope.row.deviceType" />
          </template>
        </el-table-column>
        <el-table-column label="Token Active Timeout" align="center" prop="activeTimeout" />
        <el-table-column label="Fixed Token Timeout" align="center" prop="timeout" />
        <el-table-column key="status" label="Status" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button v-hasPermi="['system:client:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button v-hasPermi="['system:client:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- Add or edit client management dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="clientFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Client Key" prop="clientKey">
          <el-input v-model="form.clientKey" :disabled="form.id != null" placeholder="Please enter client key" />
        </el-form-item>
        <el-form-item label="Client Secret" prop="clientSecret">
          <el-input v-model="form.clientSecret" :disabled="form.id != null" placeholder="Please enter client secret" />
        </el-form-item>
        <el-form-item label="Grant Type" prop="grantTypeList">
          <el-select v-model="form.grantTypeList" multiple placeholder="Please enter grant type">
            <el-option v-for="dict in sys_grant_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Device Type" prop="deviceType">
          <el-select v-model="form.deviceType" placeholder="Please enter device type">
            <el-option v-for="dict in sys_device_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="activeTimeout" label-width="auto">
          <template #label>
            <span>
              <el-tooltip content="Expires after inactivity for the specified time (in seconds), default 30 minutes (1800 seconds)" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              Token Active Timeout
            </span>
          </template>
          <el-input v-model="form.activeTimeout" placeholder="Please enter token idle timeout" />
        </el-form-item>
        <el-form-item prop="timeout" label-width="auto">
          <template #label>
            <span>
              <el-tooltip content="Specified time must expire (unit: seconds), default seven days (604800 seconds)" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              Fixed Token Timeout
            </span>
          </template>
          <el-input v-model="form.timeout" placeholder="Enter the Token fixed timeout" />
        </el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
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

<script setup name="Client" lang="ts">
import { listClient, getClient, delClient, addClient, updateClient, changeStatus } from '@/api/system/client';
import { ClientVO, ClientQuery, ClientForm } from '@/api/system/client/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));
const { sys_grant_type } = toRefs<any>(proxy?.useDict('sys_grant_type'));
const { sys_device_type } = toRefs<any>(proxy?.useDict('sys_device_type'));

const clientList = ref<ClientVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const clientFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ClientForm = {
  id: undefined,
  clientId: undefined,
  clientKey: undefined,
  clientSecret: undefined,
  grantTypeList: undefined,
  deviceType: undefined,
  activeTimeout: undefined,
  timeout: undefined,
  status: undefined
};
const data = reactive<PageData<ClientForm, ClientQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    clientId: undefined,
    clientKey: undefined,
    clientSecret: undefined,
    grantType: undefined,
    deviceType: undefined,
    activeTimeout: undefined,
    timeout: undefined,
    status: undefined
  },
  rules: {
    id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
    clientId: [{ required: true, message: 'Client id cannot be empty', trigger: 'blur' }],
    clientKey: [{ required: true, message: 'Client key cannot be empty', trigger: 'blur' }],
    clientSecret: [{ required: true, message: 'Client secret cannot be empty', trigger: 'blur' }],
    grantTypeList: [{ required: true, message: 'Authorization type cannot be empty', trigger: 'change' }],
    deviceType: [{ required: true, message: 'Device type cannot be empty', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query client management list */
const getList = async () => {
  loading.value = true;
  const res = await listClient(queryParams.value);
  clientList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** Cancel button */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** Form reset */
const reset = () => {
  form.value = { ...initFormData };
  clientFormRef.value?.resetFields();
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

/** Checkbox selected data */
const handleSelectionChange = (selection: ClientVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Client Management';
};

/** Edit button action */
const handleUpdate = async (row?: ClientVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getClient(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Client Management';
};

/** Submit button */
const submitForm = () => {
  clientFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateClient(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addClient(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Updated successfully');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete button action */
const handleDelete = async (row?: ClientVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the client management with ID "' + _ids + '" items?').finally(() => (loading.value = false));
  await delClient(_ids);
  proxy?.$modal.msgSuccess('Deleted successfully');
  await getList();
};

/** Export button action */
const handleExport = () => {
  proxy?.download(
    'system/client/export',
    {
      ...queryParams.value
    },
    `client_${new Date().getTime()}.xlsx`
  );
};

/** Status modification */
const handleStatusChange = async (row: ClientVO) => {
  const text = row.status === '0' ? 'Enable' : 'Disable';
  try {
    await proxy?.$modal.confirm('Confirm to "' + text + '"?');
    await changeStatus(row.clientId, row.status);
    proxy?.$modal.msgSuccess(text + 'Success');
  } catch (err) {
    row.status = row.status === '0' ? '1' : '0';
  }
};

onMounted(() => {
  getList();
});
</script>
