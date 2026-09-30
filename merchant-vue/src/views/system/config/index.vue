<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Parameter Name" prop="configName">
              <el-input v-model="queryParams.configName" placeholder="Please enter parameter name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Parameter Key" prop="configKey">
              <el-input v-model="queryParams.configKey" placeholder="Enter parameter key" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="System Built-in" prop="configType">
              <el-select v-model="queryParams.configType" placeholder="System Built-in" clearable>
                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Created At" style="width: 308px">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="Start Date"
                end-placeholder="End Date"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              ></el-date-picker>
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
            <el-button v-hasPermi="['system:config:add']" type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:config:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">
              Edit
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:config:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              Delete
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:config:export']" type="warning" plain icon="Download" @click="handleExport">Export</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:config:remove']" type="danger" plain icon="Refresh" @click="handleRefreshCache">Refresh Cache</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="configList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="Parameter ID" align="center" prop="configId" />
        <el-table-column label="Parameter Name" align="center" prop="configName" :show-overflow-tooltip="true" />
        <el-table-column label="Parameter Key" align="center" prop="configKey" :show-overflow-tooltip="true" />
        <el-table-column label="Parameter Value" align="center" prop="configValue" :show-overflow-tooltip="true" />
        <el-table-column label="System Built-in" align="center" prop="configType">
          <template #default="scope">
            <dict-tag :options="sys_yes_no" :value="scope.row.configType" />
          </template>
        </el-table-column>
        <el-table-column label="Remark" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="Created At" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" width="150" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button v-hasPermi="['system:config:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button v-hasPermi="['system:config:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- Add or edit parameter configuration dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="configFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Parameter Name" prop="configName">
          <el-input v-model="form.configName" placeholder="Please enter parameter name" />
        </el-form-item>
        <el-form-item label="Parameter Key" prop="configKey">
          <el-input v-model="form.configKey" placeholder="Enter parameter key" />
        </el-form-item>
        <el-form-item label="Parameter Value" prop="configValue">
          <el-input v-model="form.configValue" type="textarea" placeholder="Please enter parameter key-value" />
        </el-form-item>
        <el-form-item label="System Built-in" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Enter content" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">Confirm</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Config" lang="ts">
import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from '@/api/system/config';
import { ConfigForm, ConfigQuery, ConfigVO } from '@/api/system/config/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_yes_no } = toRefs<any>(proxy?.useDict('sys_yes_no'));

const configList = ref<ConfigVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const configFormRef = ref<ElFormInstance>();
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const initFormData: ConfigForm = {
  configId: undefined,
  configName: '',
  configKey: '',
  configValue: '',
  configType: 'Y',
  remark: ''
};
const data = reactive<PageData<ConfigForm, ConfigQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configName: '',
    configKey: '',
    configType: ''
  },
  rules: {
    configName: [{ required: true, message: 'Parameter name cannot be empty', trigger: 'blur' }],
    configKey: [{ required: true, message: 'Parameter key name cannot be empty', trigger: 'blur' }],
    configValue: [{ required: true, message: 'Parameter value cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query parameter list */
const getList = async () => {
  loading.value = true;
  const res = await listConfig(proxy?.addDateRange(queryParams.value, dateRange.value));
  configList.value = res.rows;
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
  configFormRef.value?.resetFields();
};
/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** Reset button action */
const resetQuery = () => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};
/** Checkbox selected data */
const handleSelectionChange = (selection: ConfigVO[]) => {
  ids.value = selection.map((item) => item.configId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};
/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Parameter';
};
/** Edit button action */
const handleUpdate = async (row?: ConfigVO) => {
  reset();
  const configId = row?.configId || ids.value[0];
  const res = await getConfig(configId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Parameters';
};
/** Submit button */
const submitForm = () => {
  configFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.configId ? await updateConfig(form.value) : await addConfig(form.value);
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};
/** Delete button action */
const handleDelete = async (row?: ConfigVO) => {
  const configIds = row?.configId || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the parameter with ID "' + configIds + '" items?');
  await delConfig(configIds);
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};
/** Export button action */
const handleExport = () => {
  proxy?.download(
    'system/config/export',
    {
      ...queryParams.value
    },
    `config_${new Date().getTime()}.xlsx`
  );
};
/** Refresh cache button action */
const handleRefreshCache = async () => {
  await refreshCache();
  proxy?.$modal.msgSuccess('Cache refreshed successfully');
};

onMounted(() => {
  getList();
});
</script>
