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
                <el-form-item label="Process Definition Key" prop="flowCode">
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

          <el-table v-loading="loading" border :data="processInstanceList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column align="center" type="index" label="No." width="60"></el-table-column>
            <el-table-column v-if="false" align="center" prop="id" label="id"></el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="flowName" align="center" label="Process Definition Name"> </el-table-column>
            <el-table-column align="center" prop="flowCode" label="Process Definition Key"></el-table-column>
            <el-table-column align="center" prop="categoryName" label="Process Category"></el-table-column>
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
            <el-table-column label="Actions" align="center" width="162">
              <template #default="scope">
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5" v-if="scope.row.flowStatus === 'draft' || scope.row.flowStatus === 'cancel' || scope.row.flowStatus === 'back'">
                    <el-button type="primary" size="small" icon="Edit" @click="handleOpen(scope.row, 'update')">Edit</el-button>
                  </el-col>
                  <el-col :span="1.5" v-if="scope.row.flowStatus === 'draft' || scope.row.flowStatus === 'cancel' || scope.row.flowStatus === 'back'">
                    <el-button type="primary" size="small" icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
                  </el-col>
                </el-row>
                <el-row :gutter="10" class="mb8">
                  <el-col :span="1.5">
                    <el-button type="primary" size="small" icon="View" @click="handleOpen(scope.row, 'view')">View</el-button>
                  </el-col>
                  <el-col :span="1.5" v-if="scope.row.flowStatus === 'waiting'">
                    <el-button type="primary" size="small" icon="Notification" @click="handleCancelProcessApply(scope.row.businessId)"
                      >Revoke</el-button
                    >
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
            @pagination="getList"
          />
        </el-card>
      </el-col>
    </el-row>
    <!-- Submit Component -->
    <submitVerify ref="submitVerifyRef" @submit-callback="getList" />
  </div>
</template>

<script setup lang="ts">
import { pageByCurrent, deleteByInstanceIds, cancelProcessApply } from '@/api/workflow/instance';
import { categoryTree } from '@/api/workflow/category';
import { CategoryTreeVO } from '@/api/workflow/category/types';
import { FlowInstanceQuery, FlowInstanceVO } from '@/api/workflow/instance/types';
import workflowCommon from '@/api/workflow/workflowCommon';
import { RouterJumpVo } from '@/api/workflow/workflowCommon/types';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { wf_business_status } = toRefs<any>(proxy?.useDict('wf_business_status'));
const queryFormRef = ref<ElFormInstance>();
const categoryTreeRef = ref<ElTreeInstance>();

// Mask layer
const loading = ref(true);
// Selected array
const businessIds = ref<Array<number | string>>([]);
const instanceIds = ref<Array<number | string>>([]);
// Disable when not a single item
const single = ref(true);
// Disable when not multiple
const multiple = ref(true);
// Show search criteria
const showSearch = ref(true);
// Total count
const total = ref(0);
// Model definition table data
const processInstanceList = ref<FlowInstanceVO[]>([]);

const categoryOptions = ref<CategoryTreeVO[]>([]);
const categoryName = ref('');

const tab = ref('running');
// Query parameters
const queryParams = ref<FlowInstanceQuery>({
  pageNum: 1,
  pageSize: 10,
  flowCode: undefined,
  category: undefined
});

onMounted(() => {
  getList();
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

/** Search button action */
const handleQuery = () => {
  getList();
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
const handleSelectionChange = (selection: FlowInstanceVO[]) => {
  businessIds.value = selection.map((item: any) => item.businessId);
  instanceIds.value = selection.map((item: FlowInstanceVO) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};
//Pagination
const getList = () => {
  loading.value = true;
  pageByCurrent(queryParams.value).then((resp) => {
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
    getList();
  }
  proxy?.$modal.msgSuccess('Deleted successfully');
};

/** Revoke button action */
const handleCancelProcessApply = async (businessId: string) => {
  await proxy?.$modal.confirm('Confirm to revoke the current document?');
  loading.value = true;
  if ('running' === tab.value) {
    const data = {
      businessId: businessId,
      message: 'The applicant revoked the process!'
    };
    await cancelProcessApply(data).finally(() => (loading.value = false));
    getList();
  }
  proxy?.$modal.msgSuccess('Cancelled successfully');
};

//Handle
const handleOpen = async (row, type) => {
  const routerJumpVo = reactive<RouterJumpVo>({
    businessId: row.businessId,
    taskId: row.id,
    type: type,
    formCustom: row.formCustom,
    formPath: row.formPath
  });
  workflowCommon.routerJump(routerJumpVo, proxy);
};
</script>
