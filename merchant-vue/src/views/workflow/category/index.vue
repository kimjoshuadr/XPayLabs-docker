<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="search">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="Category Name" prop="categoryName">
            <el-input v-model="queryParams.categoryName" placeholder="Please enter category name" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd()" v-hasPermi="['workflow:category:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="handleToggleExpandAll">Expand/Collapse</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>
      <el-table
        ref="categoryTableRef"
        v-loading="loading"
        :data="categoryList"
        row-key="categoryId"
        border
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column label="Category Name" prop="categoryName" width="260" />
        <el-table-column label="Display Order" align="center" prop="orderNum" width="200" />
        <el-table-column label="Created At" align="center" prop="createTime" width="180" />
        <el-table-column label="Actions" fixed="right" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['workflow:category:edit']" />
            </el-tooltip>
            <el-tooltip content="Add" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['workflow:category:add']" />
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['workflow:category:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="categoryFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Parent Category" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="categoryOptions"
            :props="{ value: 'categoryId', label: 'categoryName', children: 'children' } as any"
            value-key="categoryId"
            placeholder="Please select parent category"
            check-strictly
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Category Name" prop="categoryName">
              <el-input v-model="form.categoryName" placeholder="Please enter category name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Sort" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
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

<script setup name="Category" lang="ts">
import { listCategory, getCategory, delCategory, addCategory, updateCategory } from '@/api/workflow/category';
import { CategoryVO, CategoryQuery, CategoryForm } from '@/api/workflow/category/types';

type CategoryOption = {
  categoryId: number;
  categoryName: string;
  children?: CategoryOption[];
};

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const categoryList = ref<CategoryVO[]>([]);
const categoryOptions = ref<CategoryOption[]>([]);
const buttonLoading = ref(false);
const showSearch = ref(true);
const isExpandAll = ref(true);
const loading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const categoryFormRef = ref<ElFormInstance>();
const categoryTableRef = ref<ElTableInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: CategoryForm = {
  categoryId: undefined,
  categoryName: '',
  parentId: undefined,
  orderNum: 0
};

const data = reactive<PageData<CategoryForm, CategoryQuery>>({
  form: { ...initFormData },
  queryParams: {
    categoryName: undefined
  },
  rules: {
    categoryId: [{ required: true, message: 'Process category ID cannot be empty', trigger: 'blur' }],
    parentId: [{ required: true, message: 'Please select parent category', trigger: 'change' }],
    categoryName: [{ required: true, message: 'Please enter category name', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query process category list */
const getList = async () => {
  loading.value = true;
  const res = await listCategory(queryParams.value);
  const data = proxy?.handleTree<CategoryVO>(res.data, 'categoryId', 'parentId');
  if (data) {
    categoryList.value = data;
    loading.value = false;
  }
};

/** Query process category dropdown tree structure */
const getTreeselect = async () => {
  const res = await listCategory();
  categoryOptions.value = [];
  // Process tree data
  const data = proxy?.handleTree<CategoryOption>(res.data, 'categoryId', 'parentId');
  if (data) {
    categoryOptions.value = data; // Assign the processed tree data
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
  categoryFormRef.value?.resetFields();
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
const handleAdd = (row?: CategoryVO) => {
  reset();
  getTreeselect();
  if (row?.categoryId) {
    form.value.parentId = row.categoryId;
  } else {
    form.value.parentId = undefined;
  }
  dialog.visible = true;
  dialog.title = 'Add Process Category';
};

/** Expand/Collapse action */
const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(categoryList.value, isExpandAll.value);
};

/** Expand/Collapse action */
const toggleExpandAll = (data: CategoryVO[], status: boolean) => {
  data.forEach((item) => {
    categoryTableRef.value?.toggleRowExpansion(item, status);
    if (item.children && item.children.length > 0) toggleExpandAll(item.children, status);
  });
};

/** Edit button action */
const handleUpdate = async (row: CategoryVO) => {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  const res = await getCategory(row.categoryId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Process Category';
};

/** Submit button */
const submitForm = () => {
  categoryFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.categoryId) {
        await updateCategory(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCategory(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      getList();
    }
  });
};

/** Delete button action */
const handleDelete = async (row: CategoryVO) => {
  await proxy?.$modal.confirm('Are you sure you want to delete "' + row.categoryName + '" category?');
  loading.value = true;
  await delCategory(row.categoryId).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};

onMounted(() => {
  getList();
});
</script>
