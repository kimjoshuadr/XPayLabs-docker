<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Dictionary Name" prop="dictType">
              <el-select v-model="queryParams.dictType">
                <el-option v-for="item in typeOptions" :key="item.dictId" :label="item.dictName" :value="item.dictType" />
              </el-select>
            </el-form-item>
            <el-form-item label="Dictionary Label" prop="dictLabel">
              <el-input v-model="queryParams.dictLabel" placeholder="Please enter dictionary label" clearable @keyup.enter="handleQuery" />
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
            <el-button type="warning" plain icon="Close" @click="handleClose">Close</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="dataList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="Dictionary Code" align="center" prop="dictCode" />
        <el-table-column label="Dictionary Label" align="center" prop="dictLabel">
          <template #default="scope">
            <span
              v-if="(scope.row.listClass === '' || scope.row.listClass === 'default') && (scope.row.cssClass === '' || scope.row.cssClass == null)"
              >{{ scope.row.dictLabel }}</span
            >
            <el-tag
              v-else
              :type="scope.row.listClass === 'primary' || scope.row.listClass === 'default' ? 'primary' : scope.row.listClass"
              :class="scope.row.cssClass"
              >{{ scope.row.dictLabel }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="Dictionary Key Value" align="center" prop="dictValue" />
        <el-table-column label="Dictionary Order" align="center" prop="dictSort" />
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
      <el-form ref="dataFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Dictionary Type">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="Data Label" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="Enter data label" />
        </el-form-item>
        <el-form-item label="Data Key/Value" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="Please enter data key value" />
        </el-form-item>
        <el-form-item label="Style Attribute" prop="cssClass">
          <el-input v-model="form.cssClass" placeholder="Enter style attribute" />
        </el-form-item>
        <el-form-item label="Display Order" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="Display Style" prop="listClass">
          <el-select v-model="form.listClass">
            <el-option
              v-for="item in listClassOptions"
              :key="item.value"
              :label="item.label + '(' + item.value + ')'"
              :value="item.value"
            ></el-option>
          </el-select>
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

<script setup name="Data" lang="ts">
import { useDictStore } from '@/store/modules/dict';
import { optionselect as getDictOptionselect, getType } from '@/api/system/dict/type';
import { listData, getData, delData, addData, updateData } from '@/api/system/dict/data';
import { DictTypeVO } from '@/api/system/dict/type/types';
import { DictDataForm, DictDataQuery, DictDataVO } from '@/api/system/dict/data/types';
import { RouteLocationNormalized } from 'vue-router';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

const dataList = ref<DictDataVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const defaultDictType = ref('');
const typeOptions = ref<DictTypeVO[]>([]);

const dataFormRef = ref<ElFormInstance>();
const queryFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// Data tag echo style
const listClassOptions = ref<Array<{ value: string; label: string }>>([
  { value: 'default', label: 'Default' },
  { value: 'primary', label: 'Primary' },
  { value: 'success', label: 'Success' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'danger', label: 'Danger' }
]);

const initFormData: DictDataForm = {
  dictCode: undefined,
  dictLabel: '',
  dictValue: '',
  cssClass: '',
  listClass: 'primary',
  dictSort: 0,
  remark: ''
};
const data = reactive<PageData<DictDataForm, DictDataQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictName: '',
    dictType: '',
    dictLabel: ''
  },
  rules: {
    dictLabel: [{ required: true, message: 'Data label cannot be empty', trigger: 'blur' }],
    dictValue: [{ required: true, message: 'Data key-value cannot be empty', trigger: 'blur' }],
    dictSort: [{ required: true, message: 'Data order cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query dictionary type details */
const getTypes = async (dictId: string | number) => {
  const { data } = await getType(dictId);
  queryParams.value.dictType = data.dictType;
  defaultDictType.value = data.dictType;
  getList();
};

/** Query dictionary type list */
const getTypeList = async () => {
  const res = await getDictOptionselect();
  typeOptions.value = res.data;
};
/** Query dictionary data list */
const getList = async () => {
  loading.value = true;
  const res = await listData(queryParams.value);
  dataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};
/** Cancel button */
const cancel = () => {
  dialog.visible = false;
  reset();
};
/** Form reset */
const reset = () => {
  form.value = { ...initFormData };
  dataFormRef.value?.resetFields();
};
/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** Back button action */
const handleClose = () => {
  const obj: RouteLocationNormalized = {
    fullPath: '',
    hash: '',
    matched: [],
    meta: undefined,
    name: undefined,
    params: undefined,
    query: undefined,
    redirectedFrom: undefined,
    path: '/system/dict'
  };
  proxy?.$tab.closeOpenPage(obj);
};
/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.dictType = defaultDictType.value;
  handleQuery();
};
/** Add button action */
const handleAdd = () => {
  reset();
  form.value.dictType = queryParams.value.dictType;
  dialog.visible = true;
  dialog.title = 'Add Dictionary Data';
};
/** Checkbox selected data */
const handleSelectionChange = (selection: DictDataVO[]) => {
  ids.value = selection.map((item) => item.dictCode);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};
/** Edit button action */
const handleUpdate = async (row?: DictDataVO) => {
  reset();
  const dictCode = row?.dictCode || ids.value[0];
  const res = await getData(dictCode);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Dictionary Data';
};
/** Submit button */
const submitForm = () => {
  dataFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.dictCode ? await updateData(form.value) : await addData(form.value);
      useDictStore().removeDict(queryParams.value.dictType);
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};
/** Delete button action */
const handleDelete = async (row?: DictDataVO) => {
  const dictCodes = row?.dictCode || ids.value;
  await proxy?.$modal.confirm('Confirm to delete dictionary code "' + dictCodes + '" items?');
  await delData(dictCodes);
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
  useDictStore().removeDict(queryParams.value.dictType);
};
/** Export button action */
const handleExport = () => {
  proxy?.download(
    'system/dict/data/export',
    {
      ...queryParams.value
    },
    `dict_data_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getTypes(route.params && (route.params.dictId as string));
  getTypeList();
});
</script>
