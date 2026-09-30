<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="File Name" prop="fileName">
              <el-input v-model="queryParams.fileName" placeholder="Please enter file name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Original Name" prop="originalName">
              <el-input v-model="queryParams.originalName" placeholder="Please enter original name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="File Extension" prop="fileSuffix">
              <el-input v-model="queryParams.fileSuffix" placeholder="Please enter file extension" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Created At" style="width: 308px">
              <el-date-picker
                v-model="dateRangeCreateTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="Start Date"
                end-placeholder="End Date"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="Service Provider" prop="service">
              <el-input v-model="queryParams.service" placeholder="Please enter service provider" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="handleQuery">Search</el-button>
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
            <el-button v-hasPermi="['system:oss:upload']" type="primary" plain icon="Upload" @click="handleFile">Upload File</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:oss:upload']" type="primary" plain icon="Upload" @click="handleImage">Upload Image</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:oss:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              Delete
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['system:oss:edit']"
              :type="previewListResource ? 'danger' : 'warning'"
              plain
              @click="handlePreviewListResource(!previewListResource)"
              >Preview toggle : {{ previewListResource ? 'Disable' : 'Enable' }}</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:ossConfig:list']" type="info" plain icon="Operation" @click="handleOssConfig">Configuration Management</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table
        v-if="showTable"
        v-loading="loading"
        :data="ossList"
        border
        :header-cell-class-name="handleHeaderClass"
        @selection-change="handleSelectionChange"
        @header-click="handleHeaderCLick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="Object Storage Key" align="center" prop="ossId" />
        <el-table-column label="File Name" align="center" prop="fileName" />
        <el-table-column label="Original Name" align="center" prop="originalName" />
        <el-table-column label="File Extension" align="center" prop="fileSuffix" />
        <el-table-column label="File Display" align="center" prop="url">
          <template #default="scope">
            <ImagePreview
              v-if="previewListResource && checkFileSuffix(scope.row.fileSuffix)"
              :width="100"
              :height="100"
              :src="scope.row.url"
              :preview-src-list="[scope.row.url]"
            />
            <span v-if="!checkFileSuffix(scope.row.fileSuffix) || !previewListResource" v-text="scope.row.url" />
          </template>
        </el-table-column>
        <el-table-column label="Created At" align="center" prop="createTime" width="180" sortable="custom">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Uploaded By" align="center" prop="createByName" />
        <el-table-column label="Service Provider" align="center" prop="service" sortable="custom" />
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Download" placement="top">
              <el-button v-hasPermi="['system:oss:download']" link type="primary" icon="Download" @click="handleDownload(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button v-hasPermi="['system:oss:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
    <!-- Add or Edit OSS Object Storage Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="ossFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="File Name">
          <fileUpload v-if="type === 0" v-model="form.file" />
          <imageUpload v-if="type === 1" v-model="form.file" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Confirm</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Oss" lang="ts">
import { listOss, delOss } from '@/api/system/oss';
import ImagePreview from '@/components/ImagePreview/index.vue';
import { OssForm, OssQuery, OssVO } from '@/api/system/oss/types';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const ossList = ref<OssVO[]>([]);
const showTable = ref(true);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const type = ref(0);
const previewListResource = ref(true);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// Default sorting
const defaultSort = ref({ prop: 'createTime', order: 'ascending' });

const ossFormRef = ref<ElFormInstance>();
const queryFormRef = ref<ElFormInstance>();

const initFormData = {
  file: undefined
};
const data = reactive<PageData<OssForm, OssQuery>>({
  form: { ...initFormData },
  // Query parameters
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fileName: '',
    originalName: '',
    fileSuffix: '',
    createTime: '',
    service: '',
    orderByColumn: defaultSort.value.prop,
    isAsc: defaultSort.value.order
  },
  rules: {
    file: [{ required: true, message: 'File cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query OSS object storage list */
const getList = async () => {
  loading.value = true;
  const res = await proxy?.getConfigKey('sys.oss.previewListResource');
  previewListResource.value = res?.data === undefined ? true : res.data === 'true';
  const response = await listOss(proxy?.addDateRange(queryParams.value, dateRangeCreateTime.value, 'CreateTime'));
  ossList.value = response.rows;
  total.value = response.total;
  loading.value = false;
  showTable.value = true;
};
function checkFileSuffix(fileSuffix: string | string[]) {
  const arr = ['.png', '.jpg', '.jpeg'];
  const suffixArray = Array.isArray(fileSuffix) ? fileSuffix : [fileSuffix];
  return suffixArray.some((suffix) => arr.includes(suffix.toLowerCase()));
}
/** Cancel button */
function cancel() {
  dialog.visible = false;
  reset();
}
/** Form reset */
function reset() {
  form.value = { ...initFormData };
  ossFormRef.value?.resetFields();
}
/** Search button action */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** Reset button action */
function resetQuery() {
  showTable.value = false;
  dateRangeCreateTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  queryParams.value.orderByColumn = defaultSort.value.prop;
  queryParams.value.isAsc = defaultSort.value.order;
  handleQuery();
}
/** Number of selections */
function handleSelectionChange(selection: OssVO[]) {
  ids.value = selection.map((item) => item.ossId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** Set the column sorting to our custom sorting */
const handleHeaderClass = ({ column }: any): any => {
  column.order = column.multiOrder;
};
/** Click header to sort */
const handleHeaderCLick = (column: any) => {
  if (column.sortable !== 'custom') {
    return;
  }
  switch (column.multiOrder) {
    case 'descending':
      column.multiOrder = 'ascending';
      break;
    case 'ascending':
      column.multiOrder = '';
      break;
    default:
      column.multiOrder = 'descending';
      break;
  }
  handleOrderChange(column.property, column.multiOrder);
};
const handleOrderChange = (prop: string, order: string) => {
  const orderByArr = queryParams.value.orderByColumn ? queryParams.value.orderByColumn.split(',') : [];
  const isAscArr = queryParams.value.isAsc ? queryParams.value.isAsc.split(',') : [];
  const propIndex = orderByArr.indexOf(prop);
  if (propIndex !== -1) {
    if (order) {
      //Already exists in sort order; only update sort
      isAscArr[propIndex] = order;
    } else {
      //If order is null, delete the sort field and attribute
      isAscArr.splice(propIndex, 1); // Delete sorting
      orderByArr.splice(propIndex, 1); //Delete property
    }
  } else {
    // If not present in the sorting, add a new sort
    orderByArr.push(prop);
    isAscArr.push(order);
  }
  //Merge sort
  queryParams.value.orderByColumn = orderByArr.join(',');
  queryParams.value.isAsc = isAscArr.join(',');
  getList();
};
/** Task log list query */
const handleOssConfig = () => {
  router.push('/system/oss-config/index');
};
/** File button action */
const handleFile = () => {
  reset();
  type.value = 0;
  dialog.visible = true;
  dialog.title = 'Upload File';
};
/** Image button action */
const handleImage = () => {
  reset();
  type.value = 1;
  dialog.visible = true;
  dialog.title = 'Upload Image';
};
/** Submit button */
const submitForm = () => {
  dialog.visible = false;
  getList();
};
/** Download button action */
const handleDownload = (row: OssVO) => {
  proxy?.$download.oss(row.ossId);
};
/** Preview toggle button  */
const handlePreviewListResource = async (preview: boolean) => {
  const text = preview ? 'Enable' : 'Disable';
  try {
    await proxy?.$modal.confirm('Confirm to "' + text + '"preview list image" configuration?');
    await proxy?.updateConfigByKey('sys.oss.previewListResource', preview);
    await getList();
    proxy?.$modal.msgSuccess(text + 'Success');
  } catch {
    return;
  }
};
/** Delete button action */
const handleDelete = async (row?: OssVO) => {
  const ossIds = row?.ossId || ids.value;
  await proxy?.$modal.confirm('Are you sure you want to delete the OSS object storage ID "' + ossIds + '" data item?');
  loading.value = true;
  await delOss(ossIds).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};

onMounted(() => {
  getList();
});
</script>
