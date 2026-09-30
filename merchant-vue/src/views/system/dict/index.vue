<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Dictionary Name" prop="dictName">
              <el-input v-model="queryParams.dictName" placeholder="Please enter dictionary name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Dictionary Type" prop="dictType">
              <el-input v-model="queryParams.dictType" placeholder="Enter dictionary type" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Created At" style="width: 308px">
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
            <el-button v-hasPermi="['system:dict:add']" type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              Delete
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:export']" type="warning" plain icon="Download" @click="handleExport">Export</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:remove']" type="danger" plain icon="Refresh" @click="handleRefreshCache">Refresh Cache</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="typeList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="Dictionary ID" align="center" prop="dictId" />
        <el-table-column label="Dictionary Name" align="center" prop="dictName" :show-overflow-tooltip="true" />
        <el-table-column label="Dictionary Type" align="center" :show-overflow-tooltip="true">
          <template #default="scope">
            <router-link :to="'/system/dict-data/index/' + scope.row.dictId" class="link-type">
              <span>{{ scope.row.dictType }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="Remark" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="Created At" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button v-hasPermi="['system:dict:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button v-hasPermi="['system:dict:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- Add or edit parameter configuration dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="dictFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Dictionary Name" prop="dictName">
          <el-input v-model="form.dictName" placeholder="Please enter dictionary name" />
        </el-form-item>
        <el-form-item label="Dictionary Type" prop="dictType">
          <el-input v-model="form.dictType" placeholder="Enter dictionary type" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Enter content"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">Confirm</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Dict" lang="ts">
import { useDictStore } from '@/store/modules/dict';
import { listType, getType, delType, addType, updateType, refreshCache } from '@/api/system/dict/type';
import { DictTypeForm, DictTypeQuery, DictTypeVO } from '@/api/system/dict/type/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const typeList = ref<DictTypeVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

const dictFormRef = ref<ElFormInstance>();
const queryFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: DictTypeForm = {
  dictId: undefined,
  dictName: '',
  dictType: '',
  remark: ''
};
const data = reactive<PageData<DictTypeForm, DictTypeQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictName: '',
    dictType: ''
  },
  rules: {
    dictName: [{ required: true, message: 'Dictionary name cannot be empty', trigger: 'blur' }],
    dictType: [{ required: true, message: 'Dictionary type cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query dictionary type list */
const getList = () => {
  loading.value = true;
  listType(proxy?.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    typeList.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
};
/** Cancel button */
const cancel = () => {
  reset();
  dialog.visible = false;
};
/** Form reset */
const reset = () => {
  form.value = { ...initFormData };
  dictFormRef.value?.resetFields();
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
  handleQuery();
};
/** Add button action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Dictionary Type';
};
/** Checkbox selected data */
const handleSelectionChange = (selection: DictTypeVO[]) => {
  ids.value = selection.map((item) => item.dictId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};
/** Edit button action */
const handleUpdate = async (row?: DictTypeVO) => {
  reset();
  const dictId = row?.dictId || ids.value[0];
  const res = await getType(dictId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Dictionary Type';
};
/** Submit button */
const submitForm = () => {
  dictFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.dictId ? await updateType(form.value) : await addType(form.value);
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      getList();
    }
  });
};
/** Delete button action */
const handleDelete = async (row?: DictTypeVO) => {
  const dictIds = row?.dictId || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the dictionary with ID "' + dictIds + '" items?');
  await delType(dictIds);
  getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};
/** Export button action */
const handleExport = () => {
  proxy?.download(
    'system/dict/type/export',
    {
      ...queryParams.value
    },
    `dict_${new Date().getTime()}.xlsx`
  );
};
/** Refresh cache button action */
const handleRefreshCache = async () => {
  await refreshCache();
  proxy?.$modal.msgSuccess('Refreshed successfully');
  useDictStore().cleanDict();
};

onMounted(() => {
  getList();
});
</script>
