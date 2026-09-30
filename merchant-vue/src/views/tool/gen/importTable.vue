<template>
  <!-- Import Table -->
  <el-dialog v-model="visible" title="Import Table" width="1100px" top="5vh" append-to-body>
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <el-form-item label="Data Source" prop="dataName">
        <el-select v-model="queryParams.dataName" filterable placeholder="Please select/enter data source name">
          <el-option v-for="item in dataNameList" :key="item" :label="item" :value="item"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Table Name" prop="tableName">
        <el-input v-model="queryParams.tableName" placeholder="Please enter the table name" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="Table Description" prop="tableComment">
        <el-input v-model="queryParams.tableComment" placeholder="Enter table description" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
        <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table ref="tableRef" border :data="dbTableList" height="260px" @row-click="clickRow" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="tableName" label="Table Name" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="tableComment" label="Table Description" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="createTime" label="Created At"></el-table-column>
        <el-table-column prop="updateTime" label="Updated At"></el-table-column>
      </el-table>
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleImportTable">Confirm</el-button>
        <el-button @click="visible = false">Cancel</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { listDbTable, importTable, getDataNames } from '@/api/tool/gen';
import { DbTableQuery, DbTableVO } from '@/api/tool/gen/types';

const total = ref(0);
const visible = ref(false);
const tables = ref<Array<string>>([]);
const dbTableList = ref<Array<DbTableVO>>([]);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableRef = ref<ElTableInstance>();
const queryFormRef = ref<ElFormInstance>();

const queryParams = reactive<DbTableQuery>({
  pageNum: 1,
  pageSize: 10,
  dataName: '',
  tableName: '',
  tableComment: ''
});
const dataNameList = ref<Array<string>>([]);

const emit = defineEmits(['ok']);

/** Query parameter list */
const show = (dataName: string) => {
  getDataNames().then((res) => {
    if (res.code == 200) {
      dataNameList.value = res.data;
      if (dataName) {
        queryParams.dataName = dataName;
      } else {
        queryParams.dataName = dataNameList.value[0];
      }
      getList();
      visible.value = true;
    }
  });
};
/** Click to select row */
const clickRow = (row: DbTableVO) => {
  // ele bug
  tableRef.value?.toggleRowSelection(row, false);
};
/** Checkbox selected data */
const handleSelectionChange = (selection: DbTableVO[]) => {
  tables.value = selection.map((item) => item.tableName);
};
/** Query table data */
const getList = async () => {
  const res = await listDbTable(queryParams);
  dbTableList.value = res.rows;
  total.value = res.total;
};
/** Search button action */
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};
/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};
/** Import button action */
const handleImportTable = async () => {
  const tableNames = tables.value.join(',');
  if (tableNames == '') {
    proxy?.$modal.msgError('Please select the table to import');
    return;
  }
  const res = await importTable({ tables: tableNames, dataName: queryParams.dataName });
  proxy?.$modal.msgSuccess(res.msg);
  if (res.code === 200) {
    visible.value = false;
    emit('ok');
  }
};

defineExpose({
  show
});
</script>
