<template>
  <div class="p-2">
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
          <right-toolbar v-model:show-search="showSearch" @query-table="handleQuery"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="taskList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column align="center" type="index" label="No." width="60"></el-table-column>
        <el-table-column align="center" prop="flowName" label="Process Definition Name"></el-table-column>
        <el-table-column align="center" prop="flowCode" label="Process Definition Key"></el-table-column>
        <el-table-column align="center" prop="categoryName" label="Process Category"></el-table-column>
        <el-table-column align="center" prop="version" label="Version" width="90">
          <template #default="scope"> v{{ scope.row.version }}.0</template>
        </el-table-column>
        <el-table-column align="center" prop="nodeName" label="Task Name"></el-table-column>
        <el-table-column align="center" prop="createByName" label="Applicant"></el-table-column>
        <el-table-column align="center" prop="approverName" label="Assignee">
          <template #default="scope">
            <el-tag type="success">
              {{ scope.row.approveName || 'None' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="Process Status" prop="flowStatus" min-width="70">
          <template #default="scope">
            <dict-tag :options="wf_business_status" :value="scope.row.flowStatus"></dict-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="Task Status" prop="flowTaskStatus" min-width="70">
          <template #default="scope">
            <dict-tag :options="wf_task_status" :value="scope.row.flowTaskStatus"></dict-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="createTime" label="Created At" width="160"></el-table-column>
        <el-table-column label="Actions" align="center" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" icon="View" @click="handleView(scope.row)">View</el-button>
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
    </el-card>
    <!-- Applicant -->
    <UserSelect ref="userSelectRef" :multiple="true" :data="selectUserIds" @confirm-call-back="userSelectCallBack"></UserSelect>
  </div>
</template>

<script setup lang="ts">
import { pageByTaskFinish } from '@/api/workflow/task';
import { TaskQuery, FlowTaskVO } from '@/api/workflow/task/types';
import workflowCommon from '@/api/workflow/workflowCommon';
import { RouterJumpVo } from '@/api/workflow/workflowCommon/types';
//Approval record component
const queryFormRef = ref<ElFormInstance>();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { wf_business_status } = toRefs<any>(proxy?.useDict('wf_business_status'));
const { wf_task_status } = toRefs<any>(proxy?.useDict('wf_task_status'));
import UserSelect from '@/components/UserSelect';
import { ref } from 'vue';
import { UserVO } from '@/api/system/user/types';

const userSelectRef = ref<InstanceType<typeof UserSelect>>();
// Mask layer
const loading = ref(true);
// Selected array
const ids = ref<Array<any>>([]);
// Disable when not a single item
const single = ref(true);
// Disable when not multiple
const multiple = ref(true);
// Show search criteria
const showSearch = ref(true);
// Total count
const total = ref(0);
// Model definition table data
const taskList = ref([]);
// Query parameters
const queryParams = ref<TaskQuery>({
  pageNum: 1,
  pageSize: 10,
  nodeName: undefined,
  flowName: undefined,
  flowCode: undefined,
  createByIds: []
});
// Applicant ID
const selectUserIds = ref<Array<number | string>>([]);
//Applicant selection count
const userSelectCount = ref(0);
/** Search button action */
const handleQuery = () => {
  getFinishList();
};
/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  queryParams.value.createByIds = [];
  userSelectCount.value = 0;
  selectUserIds.value = [];
  handleQuery();
};
// Checkbox selected data
const handleSelectionChange = (selection: any) => {
  ids.value = selection.map((item: any) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};
const getFinishList = () => {
  loading.value = true;
  pageByTaskFinish(queryParams.value).then((resp) => {
    taskList.value = resp.rows;
    total.value = resp.total;
    loading.value = false;
  });
};
/** View button action */
const handleView = (row: FlowTaskVO) => {
  const routerJumpVo = reactive<RouterJumpVo>({
    businessId: row.businessId,
    taskId: row.id,
    type: 'view',
    formCustom: row.formCustom,
    formPath: row.formPath
  });
  workflowCommon.routerJump(routerJumpVo, proxy);
};
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
  getFinishList();
});
</script>
