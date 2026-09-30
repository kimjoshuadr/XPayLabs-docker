<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Data Source" prop="dataName">
              <el-select v-model="queryParams.dataName" filterable clearable placeholder="Please select/enter data source name">
                <el-option key="" label="All" value="" />
                <el-option v-for="item in dataNameList" :key="item" :label="item" :value="item"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Table Name" prop="tableName">
              <el-input v-model="queryParams.tableName" placeholder="Please enter the table name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Table Description" prop="tableComment">
              <el-input v-model="queryParams.tableComment" placeholder="Enter table description" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Created At" style="width: 308px">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="Start Date"
                end-placeholder="End Date"
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
            <el-button v-hasPermi="['tool:gen:code']" type="primary" plain icon="Download" @click="handleGenTable()">Generate</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['tool:gen:import']" type="info" plain icon="Upload" @click="openImportTable">Import</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['tool:gen:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleEditTable()">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['tool:gen:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              Delete
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="tableList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" width="55"></el-table-column>
        <el-table-column label="No." type="index" width="50" align="center">
          <template #default="scope">
            <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Data Source" align="center" prop="dataName" :show-overflow-tooltip="true" />
        <el-table-column label="Table Name" align="center" prop="tableName" :show-overflow-tooltip="true" />
        <el-table-column label="Table Description" align="center" prop="tableComment" :show-overflow-tooltip="true" />
        <el-table-column label="Entity" align="center" prop="className" :show-overflow-tooltip="true" />
        <el-table-column label="Created At" align="center" prop="createTime" width="160" />
        <el-table-column label="Updated At" align="center" prop="updateTime" width="160" />
        <el-table-column label="Actions" align="center" width="330" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Preview" placement="top">
              <el-button v-hasPermi="['tool:gen:preview']" link type="primary" icon="View" @click="handlePreview(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Edit" placement="top">
              <el-button v-hasPermi="['tool:gen:edit']" link type="primary" icon="Edit" @click="handleEditTable(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button v-hasPermi="['tool:gen:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Sync" placement="top">
              <el-button v-hasPermi="['tool:gen:edit']" link type="primary" icon="Refresh" @click="handleSynchDb(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Generate Code" placement="top">
              <el-button v-hasPermi="['tool:gen:code']" link type="primary" icon="Download" @click="handleGenTable(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <!-- Preview Interface -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="80%" top="5vh" append-to-body class="scrollbar">
      <el-tabs v-model="preview.activeName">
        <el-tab-pane
          v-for="(value, key) in preview.data"
          :key="value"
          :label="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
          :name="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
        >
          <el-link v-copyText="value" v-copyText:callback="copyTextSuccess" :underline="false" icon="DocumentCopy" style="float: right">
            &nbsp;Copy
          </el-link>
          <pre>{{ value }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <import-table ref="importRef" @ok="handleQuery" />
  </div>
</template>

<script setup name="Gen" lang="ts">
import { delTable, genCode, getDataNames, listTable, previewTable, synchDb } from '@/api/tool/gen';
import { TableQuery, TableVO } from '@/api/tool/gen/types';
import router from '@/router';
import ImportTable from './importTable.vue';

const route = useRoute();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableList = ref<TableVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const uniqueId = ref('');
const dataNameList = ref<Array<string>>([]);

const queryFormRef = ref<ElFormInstance>();
const importRef = ref<InstanceType<typeof ImportTable>>();

const queryParams = ref<TableQuery>({
  pageNum: 1,
  pageSize: 10,
  tableName: '',
  tableComment: '',
  dataName: ''
});

const preview = ref<{
  data: Record<string, string>;
  activeName: string;
}>({
  data: {},
  activeName: 'domain.java'
});
const dialog = reactive<DialogOption>({
  visible: false,
  title: 'Code Preview'
});

/** Query multiple data source names */
const getDataNameList = async () => {
  const res = await getDataNames();
  dataNameList.value = res.data;
};

/** Query table collection */
const getList = async () => {
  loading.value = true;
  const res = await listTable(proxy?.addDateRange(queryParams.value, dateRange.value));
  tableList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};
/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** Generate code action */
const handleGenTable = async (row?: TableVO) => {
  const tbIds = row?.tableId || ids.value;
  if (tbIds == '') {
    proxy?.$modal.msgError('Please select the data to generate');
    return;
  }
  if (row?.genType === '1') {
    await genCode(row.tableId);
    proxy?.$modal.msgSuccess('Generated successfully to custom path:' + row.genPath);
  } else {
    proxy?.$download.zip('/tool/gen/batchGenCode?tableIdStr=' + tbIds, 'ruoyi.zip');
  }
};
/** Sync database operation */
const handleSynchDb = async (row: TableVO) => {
  const tableId = row.tableId;
  await proxy?.$modal.confirm('Are you sure you want to force sync "' + row.tableName + '" table structure?');
  await synchDb(tableId);
  proxy?.$modal.msgSuccess('Synced successfully');
};
/** Open import table dialog */
const openImportTable = () => {
  importRef.value?.show(queryParams.value.dataName);
};
/** Reset button action */
const resetQuery = () => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};
/** Preview button */
const handlePreview = async (row: TableVO) => {
  const res = await previewTable(row.tableId);
  preview.value.data = res.data;
  dialog.visible = true;
  preview.value.activeName = 'domain.java';
};
/** Code copied successfully */
const copyTextSuccess = () => {
  proxy?.$modal.msgSuccess('Copied successfully');
};
// Checkbox selected data
const handleSelectionChange = (selection: TableVO[]) => {
  ids.value = selection.map((item) => item.tableId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};
/** Edit button action */
const handleEditTable = (row?: TableVO) => {
  const tableId = row?.tableId || ids.value[0];
  router.push({ path: '/tool/gen-edit/index/' + tableId, query: { pageNum: queryParams.value.pageNum } });
};
/** Delete button action */
const handleDelete = async (row?: TableVO) => {
  const tableIds = row?.tableId || ids.value;
  await proxy?.$modal.confirm('Confirm to delete table with ID "' + tableIds + '" items?');
  await delTable(tableIds);
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};

onMounted(() => {
  const time = route.query.t;
  if (time != null && time != uniqueId.value) {
    uniqueId.value = time as string;
    queryParams.value.pageNum = Number(route.query.pageNum);
    dateRange.value = ['', ''];
    queryFormRef.value?.resetFields();
  }
  getList();
  getDataNameList();
});
</script>
