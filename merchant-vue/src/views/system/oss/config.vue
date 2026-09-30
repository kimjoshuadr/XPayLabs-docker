<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Config Key" prop="configKey">
              <el-input v-model="queryParams.configKey" placeholder="Config Key" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Bucket Name" prop="bucketName">
              <el-input v-model="queryParams.bucketName" placeholder="Please enter bucket name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Is Default" prop="status">
              <el-select v-model="queryParams.status" placeholder="Select status" clearable>
                <el-option key="0" label="Yes" value="0" />
                <el-option key="1" label="No" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="handleQuery">Search</el-button>
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
            <el-button v-hasPermi="['system:ossConfig:add']" type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:ossConfig:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >Edit</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:ossConfig:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              Delete
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="ossConfigList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="columns[0].visible" label="Primary Key" align="center" prop="ossConfigId" />
        <el-table-column v-if="columns[1].visible" label="Config Key" align="center" prop="configKey" />
        <el-table-column v-if="columns[2].visible" label="Access Site" align="center" prop="endpoint" width="200" />
        <el-table-column v-if="columns[3].visible" label="Custom Domain" align="center" prop="domain" width="200" />
        <el-table-column v-if="columns[4].visible" label="Bucket Name" align="center" prop="bucketName" />
        <el-table-column v-if="columns[5].visible" label="Prefix" align="center" prop="prefix" />
        <el-table-column v-if="columns[6].visible" label="Domain" align="center" prop="region" />
        <el-table-column v-if="columns[7].visible" label="Bucket Permission Type" align="center" prop="accessPolicy">
          <template #default="scope">
            <el-tag v-if="scope.row.accessPolicy === '0'" type="warning">private</el-tag>
            <el-tag v-if="scope.row.accessPolicy === '1'" type="success">public</el-tag>
            <el-tag v-if="scope.row.accessPolicy === '2'" type="info">custom</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[8].visible" label="Is Default" align="center" prop="status">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="Actions" fixed="right" align="center" width="150" class-name="small-padding">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button v-hasPermi="['system:ossConfig:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button v-hasPermi="['system:ossConfig:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Object Storage Configuration Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="800px" append-to-body>
      <el-form ref="ossConfigFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="Config Key" prop="configKey">
          <el-input v-model="form.configKey" placeholder="Please enter config key" />
        </el-form-item>
        <el-form-item label="Access Site" prop="endpoint">
          <el-input v-model="form.endpoint" placeholder="Please enter access site">
            <template #prefix>
              <span style="color: #999">{{ protocol }}</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="Custom Domain" prop="domain">
          <el-input v-model="form.domain" placeholder="Please enter custom domain">
            <template #prefix>
              <span style="color: #999">{{ protocol }}</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="accessKey" prop="accessKey">
          <el-input v-model="form.accessKey" placeholder="Please enter accessKey" />
        </el-form-item>
        <el-form-item label="secretKey" prop="secretKey">
          <el-input v-model="form.secretKey" placeholder="Enter secret key" show-password />
        </el-form-item>
        <el-form-item label="Bucket Name" prop="bucketName">
          <el-input v-model="form.bucketName" placeholder="Please enter bucket name" />
        </el-form-item>
        <el-form-item label="Prefix" prop="prefix">
          <el-input v-model="form.prefix" placeholder="Please enter prefix" />
        </el-form-item>
        <el-form-item label="Is HTTPS">
          <el-radio-group v-model="form.isHttps">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Bucket Permission Type">
          <el-radio-group v-model="form.accessPolicy">
            <el-radio value="0">private</el-radio>
            <el-radio value="1">public</el-radio>
            <el-radio value="2">custom</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Domain" prop="region">
          <el-input v-model="form.region" placeholder="Please enter domain" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Enter content" />
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

<script setup name="OssConfig" lang="ts">
import { listOssConfig, getOssConfig, delOssConfig, addOssConfig, updateOssConfig, changeOssConfigStatus } from '@/api/system/ossConfig';
import { OssConfigForm, OssConfigQuery, OssConfigVO } from '@/api/system/ossConfig/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_yes_no } = toRefs<any>(proxy?.useDict('sys_yes_no'));

const ossConfigList = ref<OssConfigVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const ossConfigFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// Column visibility info
const columns = ref<FieldOption[]>([
  { key: 0, label: `Primary Key`, visible: false },
  { key: 1, label: `Config Key`, visible: true },
  { key: 2, label: `Access Site`, visible: true },
  { key: 3, label: `Custom Domain`, visible: true },
  { key: 4, label: `Bucket Name`, visible: true },
  { key: 5, label: `Prefix`, visible: true },
  { key: 6, label: `Domain`, visible: true },
  { key: 7, label: `Bucket Permission Type`, visible: true },
  { key: 8, label: `Status`, visible: true }
]);

const initFormData: OssConfigForm = {
  ossConfigId: undefined,
  configKey: '',
  accessKey: '',
  secretKey: '',
  bucketName: '',
  prefix: '',
  endpoint: '',
  domain: '',
  isHttps: 'N',
  accessPolicy: '1',
  region: '',
  status: '1',
  remark: ''
};
const data = reactive<PageData<OssConfigForm, OssConfigQuery>>({
  form: { ...initFormData },
  // Query parameters
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configKey: '',
    bucketName: '',
    status: ''
  },
  rules: {
    configKey: [{ required: true, message: 'configKey cannot be empty', trigger: 'blur' }],
    accessKey: [
      { required: true, message: 'accessKey cannot be empty', trigger: 'blur' },
      {
        min: 2,
        max: 200,
        message: 'accessKey length must be between 2 and 100',
        trigger: 'blur'
      }
    ],
    secretKey: [
      { required: true, message: 'secretKey cannot be empty', trigger: 'blur' },
      {
        min: 2,
        max: 100,
        message: 'secretKey length must be between 2 and 100',
        trigger: 'blur'
      }
    ],
    bucketName: [
      { required: true, message: 'bucketName cannot be empty', trigger: 'blur' },
      {
        min: 2,
        max: 100,
        message: 'bucketName length must be between 2 and 100',
        trigger: 'blur'
      }
    ],
    endpoint: [
      { required: true, message: 'endpoint cannot be empty', trigger: 'blur' },
      {
        min: 2,
        max: 100,
        message: 'endpoint name length must be between 2 and 100',
        trigger: 'blur'
      }
    ],
    accessPolicy: [{ required: true, message: 'accessPolicy cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const protocol = computed(() => (form.value.isHttps === 'Y' ? 'https://' : 'http://'));

/** Query object storage configuration list */
const getList = async () => {
  loading.value = true;
  const res = await listOssConfig(queryParams.value);
  ossConfigList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};
/** Cancel button */
const cancel = () => {
  dialog.visible = false;
  reset();
};
/** Form reset */
const reset = () => {
  form.value = { ...initFormData };
  ossConfigFormRef.value?.resetFields();
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
/** Number of selections */
const handleSelectionChange = (selection: OssConfigVO[]) => {
  ids.value = selection.map((item) => item.ossConfigId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};
/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Object Storage Configuration';
};
/** Edit button action */
const handleUpdate = async (row?: OssConfigVO) => {
  reset();
  const ossConfigId = row?.ossConfigId || ids.value[0];
  const res = await getOssConfig(ossConfigId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Object Storage Configuration';
};
/** Submit button */
const submitForm = () => {
  ossConfigFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.ossConfigId) {
        await updateOssConfig(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addOssConfig(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Added successfully');
      dialog.visible = false;
      await getList();
    }
  });
};
/** Status modification */
const handleStatusChange = async (row: OssConfigVO) => {
  const text = row.status === '0' ? 'Enable' : 'Disable';
  try {
    await proxy?.$modal.confirm('Confirm to "' + text + '""' + row.configKey + '" configured?');
    await changeOssConfigStatus(row.ossConfigId, row.status, row.configKey);
    await getList();
    proxy?.$modal.msgSuccess(text + 'Success');
  } catch {
    return;
  } finally {
    row.status = row.status === '0' ? '1' : '0';
  }
};
/** Delete button action */
const handleDelete = async (row?: OssConfigVO) => {
  const ossConfigIds = row?.ossConfigId || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the OSS configuration with ID "' + ossConfigIds + '" data item?');
  loading.value = true;
  await delOssConfig(ossConfigIds).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};

onMounted(() => {
  getList();
});
</script>
