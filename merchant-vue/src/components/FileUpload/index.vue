<template>
  <div class="upload-file">
    <el-upload
      ref="fileUploadRef"
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :limit="limit"
      :accept="fileAccept"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :headers="headers"
      class="upload-file-uploader"
      v-if="!disabled"
    >
      <!-- Upload Button -->
      <el-button type="primary">Select File</el-button>
    </el-upload>
    <!-- Upload tip -->
    <div v-if="showTip && !disabled" class="el-upload__tip">
      Please upload
      <template v-if="fileSize">
        Size must not exceed <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        Format: <b style="color: #f56c6c">{{ fileType.join('/') }}</b>
      </template>
      's file
    </div>
    <!-- File list -->
    <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li v-for="(file, index) in fileList" :key="file.uid" class="el-upload-list__item ele-upload-list__item-content">
        <el-link :href="`${file.url}`" :underline="false" target="_blank">
          <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-button type="danger" v-if="!disabled" link @click="handleDelete(index)">Delete</el-button>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';
import { delOss, listByIds } from '@/api/system/oss';
import { globalHeaders } from '@/utils/request';

const props = defineProps({
  modelValue: {
    type: [String, Object, Array],
    default: () => []
  },
  // Quantity limit
  limit: propTypes.number.def(5),
  // Size limit (MB)
  fileSize: propTypes.number.def(5),
  // File type, e.g. ['png', 'jpg', 'jpeg']
  fileType: propTypes.array.def(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf']),
  // Whether to show the tooltip
  isShowTip: propTypes.bool.def(true),
  // Disable component (view files only)
  disabled: propTypes.bool.def(false)
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits(['update:modelValue']);
const number = ref(0);
const uploadList = ref<any[]>([]);

const baseUrl = import.meta.env.VITE_APP_BASE_API;
const uploadFileUrl = ref(baseUrl + '/resource/oss/upload'); // Upload File Server Address
const headers = ref(globalHeaders());

const fileList = ref<any[]>([]);
const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize));

const fileUploadRef = ref<ElUploadInstance>();

// Watch fileType changes and update fileAccept
const fileAccept = computed(() => props.fileType.map((type) => `.${type}`).join(','));

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      let temp = 1;
      // First convert the value to an array
      let list: any[] = [];
      if (Array.isArray(val)) {
        list = val;
      } else {
        const res = await listByIds(val);
        list = res.data.map((oss) => {
          return {
            name: oss.originalName,
            url: oss.url,
            ossId: oss.ossId
          };
        });
      }
      // Then convert the array to an array of objects
      fileList.value = list.map((item) => {
        item = { name: item.name, url: item.url, ossId: item.ossId };
        item.uid = item.uid || new Date().getTime() + temp++;
        return item;
      });
    } else {
      fileList.value = [];
      return [];
    }
  },
  { deep: true, immediate: true }
);

// Validate format and size before upload
const handleBeforeUpload = (file: any) => {
  // Validate file type
  if (props.fileType.length) {
    const fileName = file.name.split('.');
    const fileExt = fileName[fileName.length - 1];
    const isTypeOk = props.fileType.indexOf(fileExt) >= 0;
    if (!isTypeOk) {
      proxy?.$modal.msgError(`Invalid file format, please upload a ${props.fileType.join('/')} file!`);
      return false;
    }
  }
  // Check whether the filename contains special characters
  if (file.name.includes(',')) {
    proxy?.$modal.msgError('Invalid file name; it cannot contain commas!');
    return false;
  }
  // Validate file size
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy?.$modal.msgError(`File size cannot exceed ${props.fileSize} MB!`);
      return false;
    }
  }
  proxy?.$modal.loading('Uploading file, please wait...');
  number.value++;
  return true;
};

// Number of files exceeded
const handleExceed = () => {
  proxy?.$modal.msgError(`Number of uploaded files cannot exceed ${props.limit}!`);
};

// Upload Failed
const handleUploadError = () => {
  proxy?.$modal.msgError('File upload failed');
};

// Upload success callback
const handleUploadSuccess = (res: any, file: UploadFile) => {
  if (res.code === 200) {
    uploadList.value.push({
      name: res.data.fileName,
      url: res.data.url,
      ossId: res.data.ossId
    });
    uploadedSuccessfully();
  } else {
    number.value--;
    proxy?.$modal.closeLoading();
    proxy?.$modal.msgError(res.msg);
    fileUploadRef.value?.handleRemove(file);
    uploadedSuccessfully();
  }
};

// Delete file
const handleDelete = (index: number) => {
  const ossId = fileList.value[index].ossId;
  delOss(ossId);
  fileList.value.splice(index, 1);
  emit('update:modelValue', listToString(fileList.value));
};

// Upload finished handling
const uploadedSuccessfully = () => {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter((f) => f.url !== undefined).concat(uploadList.value);
    uploadList.value = [];
    number.value = 0;
    emit('update:modelValue', listToString(fileList.value));
    proxy?.$modal.closeLoading();
  }
};

// Get file name
const getFileName = (name: string) => {
  // If it is a URL, take the last name; otherwise return directly
  if (name.lastIndexOf('/') > -1) {
    return name.slice(name.lastIndexOf('/') + 1);
  } else {
    return name;
  }
};

// Convert object to a specified string delimiter
const listToString = (list: any[], separator?: string) => {
  let strs = '';
  separator = separator || ',';
  list.forEach((item) => {
    if (item.ossId) {
      strs += item.ossId + separator;
    }
  });
  return strs != '' ? strs.substring(0, strs.length - 1) : '';
};
</script>

<style lang="scss" scoped>
.upload-file-uploader {
  margin-bottom: 5px;
}

.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}

.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}

.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
</style>
