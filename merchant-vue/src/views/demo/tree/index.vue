<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Tree Node Name" prop="treeName">
              <el-input v-model="queryParams.treeName" placeholder="Please enter tree node name" clearable @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['demo:tree:add']" type="primary" plain icon="Plus" @click="handleAdd()">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="handleToggleExpandAll">Expand/Collapse</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>
      <el-table
        ref="treeTableRef"
        v-loading="loading"
        :data="treeList"
        row-key="id"
        border
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column label="Parent ID" align="center" prop="parentId" />
        <el-table-column label="Department ID" align="center" prop="deptId" />
        <el-table-column label="User ID" align="center" prop="userId" />
        <el-table-column label="Tree Node Name" align="center" prop="treeName" />
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button v-hasPermi="['demo:tree:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="Add" placement="top">
              <el-button v-hasPermi="['demo:tree:add']" link type="primary" icon="Plus" @click="handleAdd(scope.row)" />
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button v-hasPermi="['demo:tree:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- Add or Edit Test Tree Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="treeFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Parent ID" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="treeOptions"
            :props="{ value: 'id', label: 'treeName', children: 'children' } as any"
            value-key="id"
            placeholder="Please select parent ID"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="Department ID" prop="deptId">
          <el-input v-model="form.deptId" placeholder="Please enter department ID" />
        </el-form-item>
        <el-form-item label="User ID" prop="userId">
          <el-input v-model="form.userId" placeholder="Enter user ID" />
        </el-form-item>
        <el-form-item label="Value" prop="treeName">
          <el-input v-model="form.treeName" placeholder="Enter value" />
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

<script setup name="Tree" lang="ts">
import { listTree, getTree, delTree, addTree, updateTree } from '@/api/demo/tree';
import { TreeVO, TreeQuery, TreeForm } from '@/api/demo/tree/types';

type TreeOption = {
  id: number;
  treeName: string;
  children?: TreeOption[];
};

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const treeList = ref<TreeVO[]>([]);
const treeOptions = ref<TreeOption[]>([]);
const buttonLoading = ref(false);
const showSearch = ref(true);
const isExpandAll = ref(true);
const loading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const treeFormRef = ref<ElFormInstance>();
const treeTableRef = ref<ElTableInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: TreeForm = {
  id: undefined,
  parentId: undefined,
  deptId: undefined,
  userId: undefined,
  treeName: undefined
};

const data = reactive<PageData<TreeForm, TreeQuery>>({
  form: { ...initFormData },
  queryParams: {
    parentId: undefined,
    deptId: undefined,
    userId: undefined,
    treeName: undefined
  },
  rules: {
    id: [{ required: true, message: 'Primary key cannot be empty', trigger: 'blur' }],
    parentId: [{ required: true, message: 'Parent ID cannot be empty', trigger: 'blur' }],
    deptId: [{ required: true, message: 'Department ID cannot be empty', trigger: 'blur' }],
    userId: [{ required: true, message: 'User ID cannot be empty', trigger: 'blur' }],
    treeName: [{ required: true, message: 'Value cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query test tree list */
const getList = async () => {
  loading.value = true;
  const res = await listTree(queryParams.value);
  const data = proxy?.handleTree<TreeVO>(res.data, 'id', 'parentId');
  if (data) {
    treeList.value = data;
    loading.value = false;
  }
};

/** Query test tree dropdown tree structure */
const getTreeselect = async () => {
  const res = await listTree();
  treeOptions.value = [];
  const data: TreeOption = { id: 0, treeName: 'Top-level Node', children: [] };
  data.children = proxy?.handleTree<TreeOption>(res.data, 'id', 'parentId');
  treeOptions.value.push(data);
};

// Cancel button
const cancel = () => {
  reset();
  dialog.visible = false;
};

// Reset form
const reset = () => {
  form.value = { ...initFormData };
  treeFormRef.value?.resetFields();
};

/** Search button action */
const handleQuery = () => {
  getList();
};

/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** Add button action */
const handleAdd = (row?: TreeVO) => {
  reset();
  getTreeselect();
  if (row && row.id) {
    form.value.parentId = row.id;
  } else {
    form.value.parentId = 0;
  }
  dialog.visible = true;
  dialog.title = 'Add Test Tree';
};

/** Expand/Collapse action */
const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(treeList.value, isExpandAll.value);
};

/** Expand/Collapse action */
const toggleExpandAll = (data: TreeVO[], status: boolean) => {
  data.forEach((item) => {
    treeTableRef.value?.toggleRowExpansion(item, status);
    if (item.children && item.children.length > 0) toggleExpandAll(item.children, status);
  });
};

/** Edit button action */
const handleUpdate = async (row: TreeVO) => {
  reset();
  await getTreeselect();
  if (row) {
    form.value.parentId = row.id;
  }
  const res = await getTree(row.id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Test Tree';
};

/** Submit button */
const submitForm = () => {
  treeFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateTree(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTree(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete button action */
const handleDelete = async (row: TreeVO) => {
  await proxy?.$modal.confirm('Are you sure you want to delete the test tree with ID "' + row.id + '" items?');
  loading.value = true;
  await delTree(row.id).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};

onMounted(() => {
  getList();
});
</script>
