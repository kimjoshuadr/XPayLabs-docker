<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Error Height" prop="blockNumber">
              <el-input v-model="queryParams.blockNumber" placeholder="Enter error height" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['xpay:errorBlock:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['xpay:errorBlock:edit']">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['xpay:errorBlock:remove']">Delete</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:errorBlock:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="errorBlockList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Primary Key ID" align="center" prop="id" v-if="true" />
        <el-table-column label="Error Height" align="center" prop="blockNumber" />
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['xpay:errorBlock:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['xpay:errorBlock:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Error Block Dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="errorBlockFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Error Height" prop="blockNumber">
          <el-input v-model="form.blockNumber" placeholder="Enter error height" />
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

<script setup name="ErrorBlock" lang="ts">
import { listErrorBlock, getErrorBlock, delErrorBlock, addErrorBlock, updateErrorBlock } from '@/api/xpay/errorBlock';
import { ErrorBlockVO, ErrorBlockQuery, ErrorBlockForm } from '@/api/xpay/errorBlock/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const errorBlockList = ref<ErrorBlockVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const errorBlockFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ErrorBlockForm = {
  id: undefined,
  blockNumber: undefined,
}
const data = reactive<PageData<ErrorBlockForm, ErrorBlockQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    blockNumber: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "Primary key ID cannot be empty", trigger: "blur" }
    ],
    blockNumber: [
      { required: true, message: "Error height cannot be empty", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query error block list */
const getList = async () => {
  loading.value = true;
  const res = await listErrorBlock(queryParams.value);
  errorBlockList.value = res.rows;
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
  errorBlockFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ErrorBlockVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add Error Block";
}

/** Edit button action */
const handleUpdate = async (row?: ErrorBlockVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getErrorBlock(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Edit Error Block";
}

/** Submit button */
const submitForm = () => {
  errorBlockFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateErrorBlock(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addErrorBlock(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Operation successful");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: ErrorBlockVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the error block with ID "' + _ids + '" items?').finally(() => loading.value = false);
  await delErrorBlock(_ids);
  proxy?.$modal.msgSuccess("Deleted successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('xpay/errorBlock/export', {
    ...queryParams.value
  }, `errorBlock_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
