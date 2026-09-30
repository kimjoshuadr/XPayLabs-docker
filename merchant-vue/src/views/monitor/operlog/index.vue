<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Operation Address" prop="operIp">
              <el-input v-model="queryParams.operIp" placeholder="Please enter operation address" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="System Module" prop="title">
              <el-input v-model="queryParams.title" placeholder="Enter system module" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Operator" prop="operName">
              <el-input v-model="queryParams.operName" placeholder="Please enter operator" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Type" prop="businessType">
              <el-select v-model="queryParams.businessType" placeholder="Operation Type" clearable>
                <el-option v-for="dict in sys_oper_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Status" prop="status">
              <el-select v-model="queryParams.status" placeholder="Operation Status" clearable>
                <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Operation Time" style="width: 308px">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="Start Date"
                end-placeholder="End Date"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              ></el-date-picker>
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
            <el-button v-hasPermi="['monitor:operlog:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              Delete
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['monitor:operlog:remove']" type="danger" plain icon="WarnTriangleFilled" @click="handleClean">Clear</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['monitor:operlog:export']" type="warning" plain icon="Download" @click="handleExport">Export</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table
        ref="operLogTableRef"
        v-loading="loading"
        :data="operlogList"
        border
        :default-sort="defaultSort"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="Log ID" align="center" prop="operId" />
        <el-table-column label="System Module" align="center" prop="title" :show-overflow-tooltip="true" />
        <el-table-column label="Operation Type" align="center" prop="businessType">
          <template #default="scope">
            <dict-tag :options="sys_oper_type" :value="scope.row.businessType" />
          </template>
        </el-table-column>
        <el-table-column
          label="Operator"
          align="center"
          width="110"
          prop="operName"
          :show-overflow-tooltip="true"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        />
        <el-table-column label="Department" align="center" prop="deptName" width="130" :show-overflow-tooltip="true" />
        <el-table-column label="Operation Address" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
        <el-table-column label="Operation Status" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_common_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="Operation Date" align="center" prop="operTime" width="180" sortable="custom" :sort-orders="['descending', 'ascending']">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.operTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Time Consumed"
          align="center"
          prop="costTime"
          width="110"
          :show-overflow-tooltip="true"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        >
          <template #default="scope">
            <span>{{ scope.row.costTime }} ms</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" fixed="right" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Details" placement="top">
              <el-button v-hasPermi="['monitor:operlog:query']" link type="primary" icon="View" @click="handleView(scope.row)"> </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- Operation Log Details -->
    <OperInfoDialog ref="operInfoDialogRef" />
  </div>
</template>

<script setup name="Operlog" lang="ts">
import { list, delOperlog, cleanOperlog } from '@/api/monitor/operlog';
import { OperLogForm, OperLogQuery, OperLogVO } from '@/api/monitor/operlog/types';
import OperInfoDialog from './oper-info-dialog.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_oper_type, sys_common_status } = toRefs<any>(proxy?.useDict('sys_oper_type', 'sys_common_status'));

const operlogList = ref<OperLogVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const defaultSort = ref<any>({ prop: 'operTime', order: 'descending' });

const operLogTableRef = ref<ElTableInstance>();
const queryFormRef = ref<ElFormInstance>();

const data = reactive<PageData<OperLogForm, OperLogQuery>>({
  form: {
    operId: undefined,
    tenantId: undefined,
    title: '',
    businessType: 0,
    businessTypes: undefined,
    method: '',
    requestMethod: '',
    operatorType: 0,
    operName: '',
    deptName: '',
    operUrl: '',
    operIp: '',
    operLocation: '',
    operParam: '',
    jsonResult: '',
    status: 0,
    errorMsg: '',
    operTime: '',
    costTime: 0
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    operIp: '',
    title: '',
    operName: '',
    businessType: '',
    status: '',
    orderByColumn: defaultSort.value.prop,
    isAsc: defaultSort.value.order
  },
  rules: {}
});

const { queryParams, form } = toRefs(data);

/** Query login logs */
const getList = async () => {
  loading.value = true;
  const res = await list(proxy?.addDateRange(queryParams.value, dateRange.value));
  operlogList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};
/** Operation log type dictionary translation */
const typeFormat = (row: OperLogForm) => {
  return proxy?.selectDictLabel(sys_oper_type.value, row.businessType);
};
/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** Reset button action */
const resetQuery = () => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  operLogTableRef.value?.sort(defaultSort.value.prop, defaultSort.value.order);
};
/** Checkbox selected data */
const handleSelectionChange = (selection: OperLogVO[]) => {
  ids.value = selection.map((item) => item.operId);
  multiple.value = !selection.length;
};
/** Sort trigger event */
const handleSortChange = (column: any) => {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
};

const operInfoDialogRef = ref<InstanceType<typeof OperInfoDialog>>();
/** Details button action */
const handleView = (row: OperLogVO) => {
  operInfoDialogRef.value.openDialog(row);
};

/** Delete button action */
const handleDelete = async (row?: OperLogVO) => {
  const operIds = row?.operId || ids.value;
  await proxy?.$modal.confirm('Confirm to delete log with ID "' + operIds + '" data item?');
  await delOperlog(operIds);
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};

/** Clear button action */
const handleClean = async () => {
  await proxy?.$modal.confirm('Are you sure you want to clear all operation log entries?');
  await cleanOperlog();
  await getList();
  proxy?.$modal.msgSuccess('Cleared successfully');
};

/** Export button action */
const handleExport = () => {
  proxy?.download(
    'monitor/operlog/export',
    {
      ...queryParams.value
    },
    `config_${new Date().getTime()}.xlsx`
  );
};
onMounted(() => {
  getList();
});
</script>
