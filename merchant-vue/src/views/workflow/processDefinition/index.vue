<template>
  <div class="p-2">
    <el-row :gutter="20">
      <!-- Process Category Tree -->
      <el-col :lg="4" :xs="24" style="">
        <el-card shadow="hover">
          <el-input v-model="categoryName" placeholder="Please enter process category name" prefix-icon="Search" clearable />
          <el-tree
            ref="categoryTreeRef"
            class="mt-2"
            node-key="id"
            :data="categoryOptions"
            :props="{ label: 'label', children: 'children' } as any"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          ></el-tree>
        </el-card>
      </el-col>
      <el-col :lg="20" :xs="24">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div v-show="showSearch" class="mb-[10px]">
            <el-card shadow="hover">
              <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" :inline="true" label-width="120px">
                <el-form-item label="Process Definition Name" prop="flowName">
                  <el-input v-model="queryParams.flowName" placeholder="Enter process definition name" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="Process Definition Key" prop="flowCode">
                  <el-input v-model="queryParams.flowCode" placeholder="Please enter process definition key" clearable @keyup.enter="handleQuery" />
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
                <el-button type="primary" icon="Plus" @click="handleAdd()">Add</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="success" icon="Edit" :disabled="single" @click="handleUpdate()">Edit</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="danger" icon="Delete" :disabled="multiple" @click="handleDelete()">Delete</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="primary" icon="UploadFilled" @click="uploadDialog.visible = true">Deploy Process File</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="warning" icon="Download" :disabled="single" @click="handleExportDef">Export</el-button>
              </el-col>
              <right-toolbar v-model:show-search="showSearch" @query-table="handleQuery"></right-toolbar>
            </el-row>
          </template>
          <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane label="Published" name="0"></el-tab-pane>
            <el-tab-pane label="Unpublished" name="1"></el-tab-pane>
            <el-table v-loading="loading" border :data="processDefinitionList" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column align="center" prop="id" label="Primary Key" v-if="false"></el-table-column>
              <el-table-column align="center" prop="flowName" label="Process Definition Name" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column align="center" prop="flowCode" label="Key" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column align="center" prop="categoryName" label="Process Category" :show-overflow-tooltip="true"></el-table-column>
              <el-table-column align="center" prop="version" label="Version" width="80">
                <template #default="scope"> v{{ scope.row.version }}.0</template>
              </el-table-column>
              <el-table-column align="center" prop="activityStatus" label="Activation Status" width="130">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.activityStatus"
                    :active-value="1"
                    :inactive-value="0"
                    @change="(status) => handleProcessDefState(scope.row, status)"
                  />
                </template>
              </el-table-column>
              <el-table-column align="center" prop="isPublish" label="Publish Status" width="100">
                <template #default="scope">
                  <el-tag v-if="scope.row.isPublish == 0" type="danger">Unpublished</el-tag>
                  <el-tag v-else-if="scope.row.isPublish == 1" type="success">Published</el-tag>
                  <el-tag v-else type="danger">Invalid</el-tag>
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="Actions" align="center" width="170" class-name="small-padding fixed-width">
                <template #default="scope">
                  <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                      <el-button link type="primary" size="small" icon="Delete" @click="handleDelete(scope.row)">Delete Process</el-button>
                    </el-col>
                    <el-col :span="1.5">
                      <el-button link type="primary" size="small" icon="CopyDocument" @click="handleCopyDef(scope.row)">Copy Process</el-button>
                    </el-col>
                  </el-row>
                  <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                      <el-button link type="primary" v-if="scope.row.isPublish === 0" icon="Pointer" size="small" @click="design(scope.row)"
                        >Process Design</el-button
                      >
                      <el-button link type="primary" v-else icon="View" size="small" @click="designView(scope.row)">View Process</el-button>
                    </el-col>
                    <el-col v-if="scope.row.isPublish !== 1" :span="1.5">
                      <el-button link type="primary" size="small" icon="CircleCheck" @click="handlePublish(scope.row)">Publish Process</el-button>
                    </el-col>
                  </el-row>
                </template>
              </el-table-column>
            </el-table>
            <pagination
              v-show="total > 0"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              :total="total"
              @pagination="getPageList"
            />
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- Deployment files -->
    <el-dialog v-if="uploadDialog.visible" v-model="uploadDialog.visible" :title="uploadDialog.title" width="30%">
      <div v-loading="uploadDialogLoading">
        <div class="mb5">
          <el-text class="mx-1" size="large"><span class="text-danger">*</span>Please select the deployment process category:</el-text>
          <el-tree-select
            v-model="selectCategory"
            :data="categoryOptions"
            :props="{ value: 'id', label: 'label', children: 'children' } as any"
            filterable
            value-key="id"
            :render-after-expand="false"
            check-strictly
            style="width: 240px"
          />
        </div>
        <el-upload
          class="upload-demo"
          drag
          multiple
          accept="application/json,application/text"
          :before-upload="handlerBeforeUpload"
          :http-request="handlerImportDefinition"
        >
          <el-icon class="UploadFilled"><upload-filled /></el-icon>
          <div class="el-upload__text"><em>Click to upload and select a JSON process file</em></div>
          <div class="el-upload__text">Only JSON format files are supported</div>
          <div class="el-upload__text">PS: If deploying, please deploy the data exported from this project's Model Management</div>
        </el-upload>
      </div>
    </el-dialog>

    <!-- Add/Edit Process Definition -->
    <el-dialog v-model="modelDialog.visible" :title="modelDialog.title" width="650px" append-to-body :close-on-click-modal="false">
      <template #footer>
        <el-form ref="defFormRef" :model="form" :rules="rules" label-width="110px">
          <el-form-item label="Process Category" prop="category">
            <el-tree-select
              v-model="form.category"
              :data="categoryOptions"
              :props="{ value: 'id', label: 'label', children: 'children' } as any"
              filterable
              value-key="id"
              :render-after-expand="false"
              check-strictly
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="Process Code" prop="flowCode">
            <el-input v-model="form.flowCode" placeholder="Please enter process key" maxlength="40" show-word-limit />
          </el-form-item>
          <el-form-item label="Process Name" prop="flowName">
            <el-input v-model="form.flowName" placeholder="Please enter process name" maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="Form Path" prop="formPath">
            <el-input v-model="form.formPath" placeholder="Please enter form path" maxlength="100" show-word-limit />
          </el-form-item>
        </el-form>
        <div class="dialog-footer">
          <el-button @click="modelDialog.visible = false">Cancel</el-button>
          <el-button type="primary" @click="handleSubmit">Save</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="processDefinition" lang="ts">
import { listDefinition, deleteDefinition, active, importDef, unPublishList, publish, add, edit, getInfo, copy } from '@/api/workflow/definition';
import { categoryTree } from '@/api/workflow/category';
import { CategoryTreeVO } from '@/api/workflow/category/types';
import { FlowDefinitionQuery, FlowDefinitionVo, FlowDefinitionForm } from '@/api/workflow/definition/types';
import { UploadRequestOptions, TabsPaneContext } from 'element-plus';
import { ElMessageBoxOptions } from 'element-plus/es/components/message-box/src/message-box.type';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const queryFormRef = ref<ElFormInstance>();
const categoryTreeRef = ref<ElTreeInstance>();

const loading = ref(true);
const ids = ref<Array<any>>([]);
const flowCodeList = ref<Array<any>>([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const uploadDialogLoading = ref(false);
const processDefinitionList = ref<FlowDefinitionVo[]>([]);
const categoryOptions = ref<CategoryTreeVO[]>([]);
const categoryName = ref('');
/** Deployment file category selection */
const selectCategory = ref();
const defFormRef = ref<ElFormInstance>();
const activeName = ref('0');
const uploadDialog = reactive<DialogOption>({
  visible: false,
  title: 'Deploy Process File'
});

const processDefinitionDialog = reactive<DialogOption>({
  visible: false,
  title: 'Historical Version'
});

const modelDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// Query parameters
const queryParams = ref<FlowDefinitionQuery>({
  pageNum: 1,
  pageSize: 10,
  flowName: undefined,
  flowCode: undefined,
  category: undefined
});
const rules = {
  category: [{ required: true, message: 'Category name cannot be empty', trigger: 'blur' }],
  flowName: [{ required: true, message: 'Process definition name cannot be empty', trigger: 'blur' }],
  flowCode: [{ required: true, message: 'Process definition key cannot be empty', trigger: 'blur' }]
};
const initFormData: FlowDefinitionForm = {
  id: '',
  flowName: '',
  flowCode: '',
  category: '',
  formPath: ''
};
//Process definition parameters
const form = ref<FlowDefinitionForm>({
  id: '',
  flowName: '',
  flowCode: '',
  category: '',
  formPath: ''
});
onMounted(() => {
  getPageList();
  getTreeselect();
});

/** Node click event */
const handleNodeClick = (data: CategoryTreeVO) => {
  queryParams.value.category = data.id;
  if (data.id === '0') {
    queryParams.value.category = '';
  }
  handleQuery();
};
/** Filter nodes by condition  */
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.categoryName.indexOf(value) !== -1;
};
/** Filter department tree by name */
watchEffect(
  () => {
    categoryTreeRef.value.filter(categoryName.value);
  },
  {
    flush: 'post' // watchEffect triggers before DOM mount or update; this property makes it run after the DOM element is updated
  }
);

/** Query process category dropdown tree structure */
const getTreeselect = async () => {
  const res = await categoryTree();
  categoryOptions.value = res.data;
};
const handleClick = (tab: TabsPaneContext, event: Event) => {
  // v-model handling has a delay; manual handling is required
  activeName.value = tab.index;
  handleQuery();
};
/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  if (activeName.value === '0') {
    getList();
  } else {
    getUnPublishList();
  }
};
/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.category = '';
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  handleQuery();
};
// Checkbox selected data
const handleSelectionChange = (selection: any) => {
  ids.value = selection.map((item: any) => item.id);
  flowCodeList.value = selection.map((item: any) => item.flowCode);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};
//Pagination
const getPageList = async () => {
  const query = proxy.$route.query;
  if (query.activeName) {
    activeName.value = query.activeName;
  }
  if (activeName.value === '0') {
    getList();
  } else {
    getUnPublishList();
  }
};
//Pagination
const getList = async () => {
  loading.value = true;
  const resp = await listDefinition(queryParams.value);
  processDefinitionList.value = resp.rows;
  total.value = resp.total;
  loading.value = false;
};
//Query unpublished process definition list
const getUnPublishList = async () => {
  loading.value = true;
  const resp = await unPublishList(queryParams.value);
  processDefinitionList.value = resp.rows;
  total.value = resp.total;
  loading.value = false;
};

/** Delete button action */
const handleDelete = async (row?: FlowDefinitionVo) => {
  const id = row?.id || ids.value;
  const defList = processDefinitionList.value.filter((x) => id.indexOf(x.id) != -1).map((x) => x.flowCode);
  await proxy?.$modal.confirm('Are you sure you want to delete the process definition with code [' + defList + '] items?');
  loading.value = true;
  await deleteDefinition(id).finally(() => (loading.value = false));
  await handleQuery();
  proxy?.$modal.msgSuccess('Deleted successfully');
};

/** Publish process definition */
const handlePublish = async (row?: FlowDefinitionVo) => {
  await proxy?.$modal.confirm(
    'Confirm to publish process definition with key [' + row.flowCode + '] version is [' + row.version + '] data item? Published process definitions will be set to invalid after publishing!'
  );
  loading.value = true;
  await publish(row.id).finally(() => (loading.value = false));
  processDefinitionDialog.visible = false;
  activeName.value = '0';
  await handleQuery();
  proxy?.$modal.msgSuccess('Published successfully');
};
/** Suspend/Activate */
const handleProcessDefState = async (row: FlowDefinitionVo, status: number | string | boolean) => {
  let msg: string;
  if (status === 0) {
    msg = `After suspension, all tasks under this process are not allowed to proceed. Are you sure you want to suspend [${row.flowName || row.flowCode}]?`;
  } else {
    msg = `After activation, all tasks in this process will be allowed to proceed. Are you sure you want to activate [${row.flowName || row.flowCode}]?`;
  }
  try {
    loading.value = true;
    await proxy?.$modal.confirm(msg);
    await active(row.id, !!status);
    await handleQuery();
    proxy?.$modal.msgSuccess('Operation successful');
  } catch (error) {
    row.activityStatus = status === 0 ? 1 : 0;
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// Hook before file upload
const handlerBeforeUpload = () => {
  if (selectCategory.value === 'ALL') {
    proxy?.$modal.msgError('Top-level node cannot be used as a category!');
    return false;
  }
  if (!selectCategory.value) {
    proxy?.$modal.msgError('Please select a category on the left to upload!');
    return false;
  }
};
// Deploy file
const handlerImportDefinition = (data: UploadRequestOptions): XMLHttpRequest => {
  const formData = new FormData();
  uploadDialogLoading.value = true;
  formData.append('file', data.file);
  formData.append('category', selectCategory.value);
  importDef(formData)
    .then(() => {
      uploadDialog.visible = false;
      proxy?.$modal.msgSuccess('Deployed successfully');
      activeName.value = '1';
      handleQuery();
    })
    .finally(() => {
      uploadDialogLoading.value = false;
    });
  return;
};
/**
 * Design process
 * @param row
 */
const design = async (row: FlowDefinitionVo) => {
  proxy.$router.push({
    path: `/workflow/design/index`,
    query: {
      definitionId: row.id,
      disabled: false,
      activeName: activeName.value
    }
  });
};

/**
 * View process
 * @param row
 */
const designView = async (row: FlowDefinitionVo) => {
  proxy.$router.push({
    path: `/workflow/design/index`,
    query: {
      definitionId: row.id,
      disabled: true,
      activeName: activeName.value
    }
  });
};
/** Form reset */
const reset = () => {
  form.value = { ...initFormData };
  defFormRef.value?.resetFields();
};
/**
 * Add
 */
const handleAdd = async () => {
  reset();
  if (queryParams.value.category != '') {
    form.value.category = queryParams.value.category;
  }
  modelDialog.visible = true;
  modelDialog.title = 'Add Process';
};
/** Edit button action */
const handleUpdate = async (row?: FlowDefinitionVo) => {
  reset();
  const id = row?.id || ids.value[0];
  const res = await getInfo(id);
  Object.assign(form.value, res.data);
  modelDialog.visible = true;
  modelDialog.title = 'Edit Process';
};

const handleSubmit = async () => {
  defFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      if (form.value.id) {
        await edit(form.value).finally(() => (loading.value = false));
      } else {
        await add(form.value).finally(() => (loading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      modelDialog.visible = false;
      handleQuery();
    }
  });
};
// Copy
const handleCopyDef = async (row: FlowDefinitionVo) => {
  ElMessageBox.confirm(`Are you sure you want to copy the process definition with code [${row.flowCode}] and version [${row.version}]!`, 'Notice', {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    type: 'warning'
  } as ElMessageBoxOptions).then(() => {
    loading.value = true;
    copy(row.id)
      .then((resp) => {
        if (resp.code === 200) {
          proxy?.$modal.msgSuccess('Operation successful');
          activeName.value = '1';
          handleQuery();
        }
      })
      .finally(() => (loading.value = false));
  });
};

/** Export button action */
const handleExportDef = () => {
  proxy?.download(`/workflow/definition/exportDef/${ids.value[0]}`, {}, `${flowCodeList.value[0]}.json`);
};
</script>
