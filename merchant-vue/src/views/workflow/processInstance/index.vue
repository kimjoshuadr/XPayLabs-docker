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
        <!--        <div class="mb-[10px]">
                  <el-card shadow="hover" class="text-center">
                    <el-radio-group v-model="tab" @change="changeTab(tab)">
                      <el-radio-button value="running">Running</el-radio-button>
                      <el-radio-button value="finish">Completed</el-radio-button>
                    </el-radio-group>
                  </el-card>
                </div>-->
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div v-show="showSearch" class="mb-[10px]">
            <el-card shadow="hover">
              <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" :inline="true">
                <el-form-item>
                  <el-badge :value="userSelectCount" :max="10" class="item">
                    <el-button type="primary" @click="openUserSelect">Select Applicant</el-button>
                  </el-badge>
                </el-form-item>
                <el-form-item label="Task Name" prop="nodeName">
                  <el-input v-model="queryParams.nodeName" placeholder="Please enter task name" @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="Process Definition Name" label-width="100" prop="flowName">
                  <el-input v-model="queryParams.flowName" placeholder="Enter process definition name" @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="Process Definition Key" label-width="100" prop="flowCode">
                  <el-input v-model="queryParams.flowCode" placeholder="Please enter process definition key" @keyup.enter="handleQuery" />
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
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">Delete</el-button>
              </el-col>
              <right-toolbar v-model:show-search="showSearch" @query-table="handleQuery"></right-toolbar>
            </el-row>
          </template>
          <el-tabs v-model="tab" @tab-click="changeTab">
            <el-tab-pane name="running" label="Running"></el-tab-pane>
            <el-tab-pane name="finish" label="Completed"></el-tab-pane>
            <el-table v-loading="loading" border :data="processInstanceList" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column align="center" type="index" label="No." width="60"></el-table-column>
              <el-table-column :show-overflow-tooltip="true" align="center" label="Process Definition Name">
                <template #default="scope">
                  <span>{{ scope.row.flowName }}v{{ scope.row.version }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="nodeName" label="Task Name"></el-table-column>
              <el-table-column align="center" prop="flowCode" label="Process Definition Key"></el-table-column>
              <el-table-column align="center" prop="categoryName" label="Process Category"></el-table-column>
              <el-table-column align="center" prop="createByName" label="Applicant"></el-table-column>
              <el-table-column align="center" prop="version" label="Version" width="90">
                <template #default="scope"> v{{ scope.row.version }}.0</template>
              </el-table-column>
              <el-table-column v-if="tab === 'running'" align="center" prop="isSuspended" label="Status" min-width="70">
                <template #default="scope">
                  <el-tag v-if="!scope.row.isSuspended" type="success">Activate</el-tag>
                  <el-tag v-else type="danger">Suspend</el-tag>
                </template>
              </el-table-column>
              <el-table-column align="center" label="Process Status" min-width="70">
                <template #default="scope">
                  <dict-tag :options="wf_business_status" :value="scope.row.flowStatus"></dict-tag>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="createTime" label="Start Time" width="160"></el-table-column>
              <el-table-column v-if="tab === 'finish'" align="center" prop="updateTime" label="End Time" width="160"></el-table-column>
              <el-table-column label="Actions" align="center" :width="165">
                <template #default="scope">
                  <el-row v-if="tab === 'running'" :gutter="10" class="mb8">
                    <el-col :span="1.5">
                      <el-popover :ref="`popoverRef${scope.$index}`" trigger="click" placement="left" :width="300">
                        <el-input v-model="deleteReason" resize="none" :rows="3" type="textarea" placeholder="Please enter void reason" />
                        <div style="text-align: right; margin: 5px 0px 0px 0px">
                          <el-button size="small" text @click="cancelPopover(scope.$index)">Cancel</el-button>
                          <el-button size="small" type="primary" @click="handleInvalid(scope.row)">Confirm</el-button>
                        </div>
                        <template #reference>
                          <el-button type="danger" size="small" icon="CircleClose">Void</el-button>
                        </template>
                      </el-popover>
                    </el-col>
                    <el-col :span="1.5">
                      <el-button type="danger" size="small" icon="Delete" @click="handleDelete(scope.row)">Delete </el-button>
                    </el-col>
                  </el-row>
                  <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                      <el-button type="primary" size="small" icon="View" @click="handleView(scope.row)">View</el-button>
                    </el-col>
                    <el-col :span="1.5">
                      <el-button type="primary" size="small" icon="Document" @click="handleInstanceVariable(scope.row)"> Variable </el-button>
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
              @pagination="handleQuery"
            />
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog v-if="processDefinitionDialog.visible" v-model="processDefinitionDialog.visible" :title="processDefinitionDialog.title" width="70%">
      <el-table v-loading="loading" :data="processDefinitionHistoryList">
        <el-table-column fixed align="center" type="index" label="No." width="60"></el-table-column>
        <el-table-column fixed align="center" prop="name" label="Process Definition Name"></el-table-column>
        <el-table-column fixed align="center" prop="nodeName" label="Task Name"></el-table-column>
        <el-table-column align="center" prop="key" label="Identifier Key"></el-table-column>
        <el-table-column align="center" prop="version" label="Version" width="90">
          <template #default="scope"> v{{ scope.row.version }}.0</template>
        </el-table-column>
        <el-table-column align="center" prop="suspensionState" label="Status" min-width="70">
          <template #default="scope">
            <el-tag v-if="scope.row.suspensionState == 1" type="success">Activate</el-tag>
            <el-tag v-else type="danger">Suspend</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="deploymentTime" label="Deployment Time" :show-overflow-tooltip="true"></el-table-column>
      </el-table>
    </el-dialog>
    <!-- Process Variables Start -->
    <el-dialog v-model="variableVisible" draggable title="Process Variables" width="60%" :close-on-click-modal="false">
      <el-card v-loading="variableLoading" class="box-card">
        <template #header>
          <div class="clearfix">
            <span
              >Process Definition Name:<el-tag>{{ processDefinitionName }}</el-tag></span
            >
          </div>
        </template>
        <div class="max-h-500px overflow-y-auto">
          <VueJsonPretty :data="formatToJsonObject(variables)" />
        </div>
      </el-card>
    </el-dialog>
    <!-- Process variables end -->

    <!-- Applicant -->
    <UserSelect ref="userSelectRef" :multiple="true" :data="selectUserIds" @confirm-call-back="userSelectCallBack"></UserSelect>
  </div>
</template>

<script setup lang="ts">
import { pageByRunning, pageByFinish, deleteByInstanceIds, instanceVariable, invalid } from '@/api/workflow/instance';
import { categoryTree } from '@/api/workflow/category';
import { CategoryTreeVO } from '@/api/workflow/category/types';
import { FlowInstanceQuery, FlowInstanceVO } from '@/api/workflow/instance/types';
import workflowCommon from '@/api/workflow/workflowCommon';
import { RouterJumpVo } from '@/api/workflow/workflowCommon/types';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import UserSelect from '@/components/UserSelect/index.vue';
//Approval record component
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { wf_business_status } = toRefs<any>(proxy?.useDict('wf_business_status'));
const queryFormRef = ref<ElFormInstance>();
const categoryTreeRef = ref<ElTreeInstance>();
import { ref } from 'vue';
import { UserVO } from '@/api/system/user/types';

const userSelectRef = ref<InstanceType<typeof UserSelect>>();
// Mask layer
const loading = ref(true);
// Selected array
const ids = ref<Array<any>>([]);
// Selected instance id array
const instanceIds = ref<Array<number | string>>([]);
// Disable when not a single item
const single = ref(true);
// Disable when not multiple
const multiple = ref(true);
// Show search criteria
const showSearch = ref(true);
// Total count
const total = ref(0);

// Whether process variables are displayed
const variableVisible = ref(false);
const variableLoading = ref(true);
const variables = ref<string>('');
// Process definition name
const processDefinitionName = ref();
// Model definition table data
const processInstanceList = ref<FlowInstanceVO[]>([]);
const processDefinitionHistoryList = ref<Array<any>>([]);
const categoryOptions = ref<CategoryOption[]>([]);
const categoryName = ref('');

const processDefinitionDialog = reactive<DialogOption>({
  visible: false,
  title: 'Process Definition'
});

type CategoryOption = {
  id: string;
  categoryName: string;
  children?: CategoryOption[];
};

const tab = ref('running');
// Void reason
const deleteReason = ref('');

// Applicant ID
const selectUserIds = ref<Array<number | string>>([]);
//Applicant selection count
const userSelectCount = ref(0);
// Query parameters
const queryParams = ref<FlowInstanceQuery>({
  pageNum: 1,
  pageSize: 10,
  nodeName: undefined,
  flowName: undefined,
  flowCode: undefined,
  createByIds: [],
  category: undefined
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

/** Search button action */
const handleQuery = () => {
  if ('running' === tab.value) {
    getProcessInstanceRunningList();
  } else {
    getProcessInstanceFinishList();
  }
};
/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.category = '';
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  queryParams.value.createByIds = [];
  userSelectCount.value = 0;
  handleQuery();
};
// Checkbox selected data
const handleSelectionChange = (selection: FlowInstanceVO[]) => {
  ids.value = selection.map((item: any) => item.id);
  instanceIds.value = selection.map((item: FlowInstanceVO) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};
//Pagination
const getProcessInstanceRunningList = () => {
  loading.value = true;
  pageByRunning(queryParams.value).then((resp) => {
    processInstanceList.value = resp.rows;
    total.value = resp.total;
    loading.value = false;
  });
};
//Pagination
const getProcessInstanceFinishList = () => {
  loading.value = true;
  pageByFinish(queryParams.value).then((resp) => {
    processInstanceList.value = resp.rows;
    total.value = resp.total;
    loading.value = false;
  });
};

/** Delete button action */
const handleDelete = async (row: FlowInstanceVO) => {
  const instanceIdList = row.id || instanceIds.value;
  await proxy?.$modal.confirm('Are you sure you want to delete?');
  loading.value = true;
  if ('running' === tab.value) {
    await deleteByInstanceIds(instanceIdList).finally(() => (loading.value = false));
    getProcessInstanceRunningList();
  } else {
    await deleteByInstanceIds(instanceIdList).finally(() => (loading.value = false));
    getProcessInstanceFinishList();
  }
  proxy?.$modal.msgSuccess('Deleted successfully');
};
const changeTab = async (data: string) => {
  processInstanceList.value = [];
  queryParams.value.pageNum = 1;
  if ('running' === data.paneName) {
    getProcessInstanceRunningList();
  } else {
    getProcessInstanceFinishList();
  }
};
/** Void button action */
const handleInvalid = async (row: FlowInstanceVO) => {
  await proxy?.$modal.confirm('Are you sure you want to void it?');
  loading.value = true;
  if ('running' === tab.value) {
    const param = {
      id: row.id,
      comment: deleteReason.value
    };
    await invalid(param).finally(() => (loading.value = false));
    getProcessInstanceRunningList();
    proxy?.$modal.msgSuccess('Operation successful');
  }
};
const cancelPopover = async (index: any) => {
  (proxy?.$refs[`popoverRef${index}`] as any).hide(); // Close dialog
};
/** View button action */
const handleView = (row) => {
  const routerJumpVo = reactive<RouterJumpVo>({
    businessId: row.businessId,
    taskId: row.id,
    type: 'view',
    formCustom: row.formCustom,
    formPath: row.formPath
  });
  workflowCommon.routerJump(routerJumpVo, proxy);
};

// Query process variables
const handleInstanceVariable = async (row: FlowInstanceVO) => {
  variableLoading.value = true;
  variableVisible.value = true;
  processDefinitionName.value = row.flowName;
  const data = await instanceVariable(row.id);
  variables.value = data.data.variable;
  variableLoading.value = false;
};

/**
 * Convert JSON to object
 * @param data Raw data
 */
function formatToJsonObject(data: string) {
  try {
    return JSON.parse(data);
  } catch (error) {
    return data;
  }
}

// Open applicant selection
const openUserSelect = () => {
  userSelectRef.value.open();
};
//Confirm selected applicant
const userSelectCallBack = (data: UserVO[]) => {
  userSelectCount.value = 0;
  if (data && data.length > 0) {
    userSelectCount.value = data.length;
    selectUserIds.value = data.map((item) => item.userId);
    queryParams.value.createByIds = selectUserIds.value;
  }
};
onMounted(() => {
  getProcessInstanceRunningList();
  getTreeselect();
});
</script>
