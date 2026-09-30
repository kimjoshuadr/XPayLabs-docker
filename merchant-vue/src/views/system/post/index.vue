<template>
  <div class="p-2">
    <el-row :gutter="20">
      <!-- Department Tree -->
      <el-col :lg="4" :xs="24" style="">
        <el-card shadow="hover">
          <el-input v-model="deptName" placeholder="Enter department name" prefix-icon="Search" clearable />
          <el-tree
            ref="deptTreeRef"
            class="mt-2"
            node-key="id"
            :data="deptOptions"
            :props="{ label: 'label', children: 'children' } as any"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>
      <el-col :lg="20" :xs="24">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div v-show="showSearch" class="mb-[10px]">
            <el-card shadow="hover">
              <el-form ref="queryFormRef" :model="queryParams" :inline="true">
                <el-form-item label="Post Code" prop="postCode">
                  <el-input v-model="queryParams.postCode" placeholder="Enter post code" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="Category Code" prop="postCategory">
                  <el-input
                    v-model="queryParams.postCategory"
                    placeholder="Please enter category code"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                  />
                </el-form-item>
                <el-form-item label="Post Name" prop="postName">
                  <el-input v-model="queryParams.postName" placeholder="Please enter post name" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="Department" prop="deptId">
                  <el-tree-select
                    v-model="queryParams.deptId"
                    :data="deptOptions"
                    :props="{ value: 'id', label: 'label', children: 'children' } as any"
                    value-key="id"
                    placeholder="Select department"
                    check-strictly
                  />
                </el-form-item>
                <el-form-item label="Status" prop="status">
                  <el-select v-model="queryParams.status" placeholder="Post Status" clearable>
                    <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
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
                <el-button v-hasPermi="['system:post:add']" type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button v-hasPermi="['system:post:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
                  >Edit</el-button
                >
              </el-col>
              <el-col :span="1.5">
                <el-button v-hasPermi="['system:post:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
                  Delete
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button v-hasPermi="['system:post:export']" type="warning" plain icon="Download" @click="handleExport">Export</el-button>
              </el-col>
              <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
            </el-row>
          </template>
          <el-table v-loading="loading" border :data="postList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column v-if="false" label="Post No." align="center" prop="postId" />
            <el-table-column label="Post Code" align="center" prop="postCode" />
            <el-table-column label="Category Code" align="center" prop="postCategory" />
            <el-table-column label="Post Name" align="center" prop="postName" />
            <el-table-column label="Department" align="center" prop="deptName" />
            <el-table-column label="Sort" align="center" prop="postSort" />
            <el-table-column label="Status" align="center" prop="status">
              <template #default="scope">
                <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
              </template>
            </el-table-column>
            <el-table-column label="Created At" align="center" prop="createTime" width="180">
              <template #default="scope">
                <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Actions" width="180" align="center" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-tooltip content="Edit" placement="top">
                  <el-button v-hasPermi="['system:post:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip content="Delete" placement="top">
                  <el-button v-hasPermi="['system:post:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="total > 0"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            :total="total"
            @pagination="getList"
          />
        </el-card>

        <!-- Add or Edit Post Dialog -->
        <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
          <el-form ref="postFormRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="Post Name" prop="postName">
              <el-input v-model="form.postName" placeholder="Please enter post name" />
            </el-form-item>
            <el-form-item label="Department" prop="deptId">
              <el-tree-select
                v-model="form.deptId"
                :data="deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' } as any"
                value-key="id"
                placeholder="Select department"
                check-strictly
              />
            </el-form-item>
            <el-form-item label="Post Code" prop="postCode">
              <el-input v-model="form.postCode" placeholder="Please enter code name" />
            </el-form-item>
            <el-form-item label="Category Code" prop="postCategory">
              <el-input v-model="form.postCategory" placeholder="Please enter category code" />
            </el-form-item>
            <el-form-item label="Post Order" prop="postSort">
              <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item label="Post Status" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
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
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Post" lang="ts">
import { listPost, addPost, delPost, getPost, updatePost } from '@/api/system/post';
import { PostForm, PostQuery, PostVO } from '@/api/system/post/types';
import { DeptVO } from '@/api/system/dept/types';
import api from '@/api/system/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const postList = ref<PostVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const deptName = ref('');
const deptOptions = ref<DeptVO[]>([]);
const deptTreeRef = ref<ElTreeInstance>();
const postFormRef = ref<ElFormInstance>();
const queryFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PostForm = {
  postId: undefined,
  deptId: undefined,
  postCode: '',
  postName: '',
  postCategory: '',
  postSort: 0,
  status: '0',
  remark: ''
};

const data = reactive<PageData<PostForm, PostQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    postCode: '',
    postName: '',
    postCategory: '',
    status: ''
  },
  rules: {
    postName: [{ required: true, message: 'Post name cannot be empty', trigger: 'blur' }],
    postCode: [{ required: true, message: 'Post code cannot be empty', trigger: 'blur' }],
    deptId: [{ required: true, message: 'Department cannot be empty', trigger: 'blur' }],
    postSort: [{ required: true, message: 'Post order cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs<PageData<PostForm, PostQuery>>(data);

/** Filter nodes by condition  */
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};

/** Filter department tree by name */
watchEffect(
  () => {
    deptTreeRef.value?.filter(deptName.value);
  },
  {
    flush: 'post' // watchEffect triggers before DOM mount or update; this property makes it run after the DOM element is updated
  }
);

/** Query department dropdown tree structure */
const getTreeSelect = async () => {
  const res = await api.deptTreeSelect();
  deptOptions.value = res.data;
};

/** Node click event */
const handleNodeClick = (data: DeptVO) => {
  queryParams.value.belongDeptId = data.id;
  queryParams.value.deptId = undefined;
  handleQuery();
};

/** Query post list */
const getList = async () => {
  loading.value = true;
  const res = await listPost(queryParams.value);
  postList.value = res.rows;
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
  postFormRef.value?.resetFields();
};

/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  if (queryParams.value.deptId) {
    queryParams.value.belongDeptId = undefined;
  }
  getList();
};

/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  queryParams.value.deptId = undefined;
  deptTreeRef.value?.setCurrentKey(undefined);
  /** Clear the selected value of the left department tree */
  queryParams.value.belongDeptId = undefined;
  handleQuery();
};

/** Checkbox selected data */
const handleSelectionChange = (selection: PostVO[]) => {
  ids.value = selection.map((item) => item.postId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Post';
};

/** Edit button action */
const handleUpdate = async (row?: PostVO) => {
  reset();
  const postId = row?.postId || ids.value[0];
  const res = await getPost(postId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Post';
};

/** Submit button */
const submitForm = () => {
  postFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.postId ? await updatePost(form.value) : await addPost(form.value);
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete button action */
const handleDelete = async (row?: PostVO) => {
  const postIds = row?.postId || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the post with ID "' + postIds + '" items?');
  await delPost(postIds);
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};

/** Export button action */
const handleExport = () => {
  proxy?.download(
    'system/post/export',
    {
      ...queryParams.value
    },
    `post_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getTreeSelect(); // Initialize department data
  getList();
});
</script>
