<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Department ID" prop="deptId">
              <el-input v-model="queryParams.deptId" placeholder="Please enter department ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="User ID" prop="userId">
              <el-input v-model="queryParams.userId" placeholder="Enter user ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Sort No." prop="orderNum">
              <el-input v-model="queryParams.orderNum" placeholder="Please enter sort number" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Key" prop="testKey">
              <el-input v-model="queryParams.testKey" placeholder="Please enter the key" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Value" prop="value">
              <el-input v-model="queryParams.value" placeholder="Enter value" clearable @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['demo:demo:add']" type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['demo:demo:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['demo:demo:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['demo:demo:export']" type="warning" plain icon="Download" @click="handleExport">Export</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="demoList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="true" label="Primary Key" align="center" prop="id" />
        <el-table-column label="Department ID" align="center" prop="deptId" />
        <el-table-column label="User ID" align="center" prop="userId" />
        <el-table-column label="Sort No." align="center" prop="orderNum" />
        <el-table-column label="Key" align="center" prop="testKey" />
        <el-table-column label="Value" align="center" prop="value" />
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button v-hasPermi="['demo:demo:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button v-hasPermi="['demo:demo:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- Add or edit test order dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="demoFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Department ID" prop="deptId">
          <el-input v-model="form.deptId" placeholder="Please enter department ID" />
        </el-form-item>
        <el-form-item label="User ID" prop="userId">
          <el-input v-model="form.userId" placeholder="Enter user ID" />
        </el-form-item>
        <el-form-item label="Sort No." prop="orderNum">
          <el-input v-model="form.orderNum" placeholder="Please enter sort number" />
        </el-form-item>
        <el-form-item label="Key" prop="testKey">
          <el-input v-model="form.testKey" placeholder="Please enter the key" />
        </el-form-item>
        <el-form-item label="Value" prop="value">
          <el-input v-model="form.value" placeholder="Enter value" />
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

<script setup name="Demo" lang="ts">
import { listDemo, getDemo, delDemo, addDemo, updateDemo } from '@/api/demo/demo';
import { DemoVO, DemoQuery, DemoForm } from '@/api/demo/demo/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const demoList = ref<DemoVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const demoFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: DemoForm = {
  id: undefined,
  deptId: undefined,
  userId: undefined,
  orderNum: undefined,
  testKey: undefined,
  value: undefined
};
const data = reactive<PageData<DemoForm, DemoQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deptId: undefined,
    userId: undefined,
    orderNum: undefined,
    testKey: undefined,
    value: undefined
  },
  rules: {
    id: [{ required: true, message: 'Primary key cannot be empty', trigger: 'blur' }],
    deptId: [{ required: true, message: 'Department ID cannot be empty', trigger: 'blur' }],
    userId: [{ required: true, message: 'User ID cannot be empty', trigger: 'blur' }],
    orderNum: [{ required: true, message: 'Sort No. cannot be empty', trigger: 'blur' }],
    testKey: [{ required: true, message: 'Key cannot be empty', trigger: 'blur' }],
    value: [{ required: true, message: 'Value cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query test order list */
const getList = async () => {
  loading.value = true;
  const res = await listDemo(queryParams.value);
  demoList.value = res.rows;
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
  demoFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: DemoVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Test Order';
};

/** Edit button action */
const handleUpdate = async (row?: DemoVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getDemo(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Test Order';
};

/** Submit button */
const submitForm = () => {
  demoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateDemo(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addDemo(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Updated successfully');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete button action */
const handleDelete = async (row?: DemoVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the test order ID "' + _ids + '" items?').finally(() => (loading.value = false));
  await delDemo(_ids);
  proxy?.$modal.msgSuccess('Deleted successfully');
  await getList();
};

/** Export button action */
const handleExport = () => {
  proxy?.download(
    'demo/demo/export',
    {
      ...queryParams.value
    },
    `demo_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
