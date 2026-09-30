<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="search">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="Leave Days" prop="startLeaveDays">
            <el-input v-model="queryParams.startLeaveDays" placeholder="Please enter leave days" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item prop="endLeaveDays"> To </el-form-item>
          <el-form-item prop="endLeaveDays">
            <el-input v-model="queryParams.endLeaveDays" placeholder="Please enter leave days" clearable @keyup.enter="handleQuery" />
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
            <el-button v-hasPermi="['workflow:leave:add']" type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['workflow:leave:export']" type="warning" plain icon="Download" @click="handleExport">Export</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="leaveList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="Primary Key" align="center" prop="id" />
        <el-table-column label="Leave Type" align="center">
          <template #default="scope">
            <el-tag>{{ options.find((e) => e.value === scope.row.leaveType)?.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Start Time" align="center" prop="startDate">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="End Time" align="center" prop="endDate">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Leave Days" align="center" prop="leaveDays" />
        <el-table-column label="Leave Reason" align="center" prop="remark" />
        <el-table-column align="center" label="Process Status" min-width="70">
          <template #default="scope">
            <dict-tag :options="wf_business_status" :value="scope.row.status"></dict-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" width="162">
          <template #default="scope">
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5" v-if="scope.row.status === 'draft' || scope.row.status === 'cancel' || scope.row.status === 'back'">
                <el-button v-hasPermi="['workflow:leave:edit']" size="small" type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                  >Edit</el-button
                >
              </el-col>
              <el-col :span="1.5" v-if="scope.row.status === 'draft' || scope.row.status === 'cancel' || scope.row.status === 'back'">
                <el-button v-hasPermi="['workflow:leave:remove']" size="small" type="primary" icon="Delete" @click="handleDelete(scope.row)"
                  >Delete</el-button
                >
              </el-col>
            </el-row>
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="primary" size="small" icon="View" @click="handleView(scope.row)">View</el-button>
              </el-col>
              <el-col :span="1.5" v-if="scope.row.status === 'waiting'">
                <el-button size="small" type="primary" icon="Notification" @click="handleCancelProcessApply(scope.row.id)">Revoke</el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="Leave" lang="ts">
import { delLeave, listLeave } from '@/api/workflow/leave';
import { cancelProcessApply } from '@/api/workflow/instance';
import { LeaveForm, LeaveQuery, LeaveVO } from '@/api/workflow/leave/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { wf_business_status } = toRefs<any>(proxy?.useDict('wf_business_status'));
const leaveList = ref<LeaveVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const options = [
  {
    value: '1',
    label: 'Personal Leave'
  },
  {
    value: '2',
    label: 'Compensatory Leave'
  },
  {
    value: '3',
    label: 'Sick Leave'
  },
  {
    value: '4',
    label: 'Marriage Leave'
  }
];

const queryFormRef = ref<ElFormInstance>();

const data = reactive<PageData<LeaveForm, LeaveQuery>>({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    startLeaveDays: undefined,
    endLeaveDays: undefined
  },
  rules: {}
});

const { queryParams } = toRefs(data);

/** Query leave request list */
const getList = async () => {
  loading.value = true;
  const res = await listLeave(queryParams.value);
  leaveList.value = res.rows;
  total.value = res.total;
  loading.value = false;
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
const handleSelectionChange = (selection: LeaveVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add button action */
const handleAdd = () => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/workflow/leaveEdit/index`,
    query: {
      type: 'add'
    }
  });
};

/** Edit button action */
const handleUpdate = (row?: LeaveVO) => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/workflow/leaveEdit/index`,
    query: {
      id: row.id,
      type: 'update'
    }
  });
};

/** View button action */
const handleView = (row?: LeaveVO) => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `/workflow/leaveEdit/index`,
    query: {
      id: row.id,
      type: 'view'
    }
  });
};

/** Delete button action */
const handleDelete = async (row?: LeaveVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the leave with ID "' + _ids + '" items?').finally(() => (loading.value = false));
  await delLeave(_ids);
  proxy?.$modal.msgSuccess('Deleted successfully');
  await getList();
};

/** Export button action */
const handleExport = () => {
  proxy?.download(
    'workflow/leave/export',
    {
      ...queryParams.value
    },
    `leave_${new Date().getTime()}.xlsx`
  );
};

/** Revoke button action */
const handleCancelProcessApply = async (id: string) => {
  await proxy?.$modal.confirm('Confirm to revoke the current document?');
  loading.value = true;
  const data = {
    businessId: id,
    message: 'The applicant revoked the process!'
  };
  await cancelProcessApply(data).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('Cancelled successfully');
};
onMounted(() => {
  getList();
});
</script>
