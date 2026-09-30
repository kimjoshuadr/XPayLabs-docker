<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Chain" prop="chain">
              <el-input v-model="queryParams.chain" placeholder="Please enter chain" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Current Height" prop="lastHeight">
              <el-input v-model="queryParams.lastHeight" placeholder="Please enter current height" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['xpay:blockHeightTracker:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['xpay:blockHeightTracker:edit']">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['xpay:blockHeightTracker:remove']">Delete</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['xpay:blockHeightTracker:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="blockHeightTrackerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" v-if="true" />
        <el-table-column label="Chain" align="center" prop="chain" />
        <el-table-column label="Current Height" align="center" prop="lastHeight" />
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['xpay:blockHeightTracker:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['xpay:blockHeightTracker:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Block Listener Height Tracking Dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="blockHeightTrackerFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Chain" prop="chain">
          <el-input v-model="form.chain" placeholder="Please enter chain" />
        </el-form-item>
        <el-form-item label="Current Height" prop="lastHeight">
          <el-input v-model="form.lastHeight" placeholder="Please enter current height" />
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

<script setup name="BlockHeightTracker" lang="ts">
import { listBlockHeightTracker, getBlockHeightTracker, delBlockHeightTracker, addBlockHeightTracker, updateBlockHeightTracker } from '@/api/xpay/blockHeightTracker';
import { BlockHeightTrackerVO, BlockHeightTrackerQuery, BlockHeightTrackerForm } from '@/api/xpay/blockHeightTracker/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const blockHeightTrackerList = ref<BlockHeightTrackerVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const blockHeightTrackerFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: BlockHeightTrackerForm = {
  id: undefined,
  chain: undefined,
  lastHeight: undefined,
}
const data = reactive<PageData<BlockHeightTrackerForm, BlockHeightTrackerQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    chain: undefined,
    lastHeight: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "ID cannot be empty", trigger: "blur" }
    ],
    chain: [
      { required: true, message: "Chain cannot be empty", trigger: "blur" }
    ],
    lastHeight: [
      { required: true, message: "Current height cannot be empty", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query block listening height tracking list */
const getList = async () => {
  loading.value = true;
  const res = await listBlockHeightTracker(queryParams.value);
  blockHeightTrackerList.value = res.rows;
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
  blockHeightTrackerFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: BlockHeightTrackerVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "Add Block Monitoring Height Tracker";
}

/** Edit button action */
const handleUpdate = async (row?: BlockHeightTrackerVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getBlockHeightTracker(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Edit Block Monitoring Height Tracker";
}

/** Submit button */
const submitForm = () => {
  blockHeightTrackerFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateBlockHeightTracker(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addBlockHeightTracker(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Operation successful");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: BlockHeightTrackerVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the block monitoring height tracking with ID "' + _ids + '" items?').finally(() => loading.value = false);
  await delBlockHeightTracker(_ids);
  proxy?.$modal.msgSuccess("Deleted successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('xpay/blockHeightTracker/export', {
    ...queryParams.value
  }, `blockHeightTracker_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
