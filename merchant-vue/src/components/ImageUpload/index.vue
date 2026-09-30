<template>
  <div class="component-upload-image">
    <el-upload
      ref="imageUploadRef"
      multiple
      :action="uploadImgUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :accept="fileAccept"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :before-remove="handleDelete"
      :show-file-list="true"
      :headers="headers"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{ hide: fileList.length >= limit }"
    >
      <el-icon class="avatar-uploader-icon">
        <plus />
      </el-icon>
    </el-upload>
    <!-- Upload tip -->
    <div v-if="showTip" class="el-upload__tip">
      Please upload
      <template v-if="fileSize">
        Size must not exceed <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        Format: <b style="color: #f56c6c">{{ fileType.join('/') }}</b>
      </template>
      's file
    </div>

    <el-dialog v-model="dialogVisible" title="Preview" width="800px" append-to-body>
      <img :src="dialogImageUrl" style="display: block; max-width: 100%; margin: 0 auto" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { listByIds, delOss } from '@/api/system/oss';
import { OssVO } from '@/api/system/oss/types';
import { propTypes } from '@/utils/propTypes';
import { globalHeaders } from '@/utils/request';
import { compressAccurately } from 'image-conversion';

const props = defineProps({
  modelValue: {
    type: [String, Object, Array],
    default: () => []
  },
  // Image count limit
  limit: propTypes.number.def(5),
  // Size limit (MB)
  fileSize: propTypes.number.def(5),
  // File type, e.g. ['png', 'jpg', 'jpeg']
  fileType: propTypes.array.def(['png', 'jpg', 'jpeg']),
  // Whether to show the tooltip
  isShowTip: {
    type: Boolean,
    default: true
  },
  // Whether compression is supported, default no
  compressSupport: {
    type: Boolean,
    default: false
  },
  // Compression target size in KB. By default only files above 300KB are compressed, down to within 300KB
  compressTargetSize: propTypes.number.def(300)
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits(['update:modelValue']);
const number = ref(0);
const uploadList = ref<any[]>([]);
const dialogImageUrl = ref('');
const dialogVisible = ref(false);

const baseUrl = import.meta.env.VITE_APP_BASE_API;
const uploadImgUrl = ref(baseUrl + '/resource/oss/upload'); // Uploaded image server address
const headers = ref(globalHeaders());

const fileList = ref<any[]>([]);
const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize));

const imageUploadRef = ref<ElUploadInstance>();

// Watch fileType changes and update fileAccept
const fileAccept = computed(() => props.fileType.map((type) => `.${type}`).join(','));

watch(
  () => props.modelValue,
  async (val: string) => {
    if (val) {
      // First convert the value to an array
      let list: OssVO[] = [];
      if (Array.isArray(val)) {
        list = val as OssVO[];
      } else {
        const res = await listByIds(val);
        list = res.data;
      }
      // Then convert the array to an array of objects
      fileList.value = list.map((item) => {
        // String echo handling: if a url is stored here it can be echoed directly; if an id is stored it needs to be fetched via an API call
        let itemData;
        if (typeof item === 'string') {
          itemData = { name: item, url: item };
        } else {
          // Use ossId for name here to prevent duplicate names on delete
          itemData = { name: item.ossId, url: item.url, ossId: item.ossId };
        }
        return itemData;
      });
    } else {
      fileList.value = [];
      return [];
    }
  },
  { deep: true, immediate: true }
);

/** Loading before upload */
const handleBeforeUpload = (file: any) => {
  let isImg = false;
  if (props.fileType.length) {
    let fileExtension = '';
    if (file.name.lastIndexOf('.') > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1);
    }
    isImg = props.fileType.some((type: any) => {
      if (file.type.indexOf(type) > -1) return true;
      if (fileExtension && fileExtension.indexOf(type) > -1) return true;
      return false;
    });
  } else {
    isImg = file.type.indexOf('image') > -1;
  }
  if (!isImg) {
    proxy?.$modal.msgError(`Incorrect file format, please upload a ${props.fileType.join('/')} image file!`);
    return false;
  }
  if (file.name.includes(',')) {
    proxy?.$modal.msgError('Invalid file name; it cannot contain commas!');
    return false;
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy?.$modal.msgError(`Avatar image size cannot exceed ${props.fileSize} MB!`);
      return false;
    }
  }

  //Compress the image; only compress when compression is enabled and the size exceeds the specified compression size
  if (props.compressSupport && file.size / 1024 > props.compressTargetSize) {
    proxy?.$modal.loading('Uploading image, please wait...');
    number.value++;
    return compressAccurately(file, props.compressTargetSize);
  } else {
    proxy?.$modal.loading('Uploading image, please wait...');
    number.value++;
  }
};

// Number of files exceeded
const handleExceed = () => {
  proxy?.$modal.msgError(`Number of uploaded files cannot exceed ${props.limit}!`);
};

// Upload success callback
const handleUploadSuccess = (res: any, file: UploadFile) => {
  if (res.code === 200) {
    uploadList.value.push({ name: res.data.fileName, url: res.data.url, ossId: res.data.ossId });
    uploadedSuccessfully();
  } else {
    number.value--;
    proxy?.$modal.closeLoading();
    proxy?.$modal.msgError(res.msg);
    imageUploadRef.value?.handleRemove(file);
    uploadedSuccessfully();
  }
};

// Delete image
const handleDelete = (file: UploadFile): boolean => {
  const findex = fileList.value.map((f) => f.name).indexOf(file.name);
  if (findex > -1 && uploadList.value.length === number.value) {
    const ossId = fileList.value[findex].ossId;
    delOss(ossId);
    fileList.value.splice(findex, 1);
    emit('update:modelValue', listToString(fileList.value));
    return false;
  }
  return true;
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

// Upload Failed
const handleUploadError = () => {
  proxy?.$modal.msgError('Image upload failed');
  proxy?.$modal.closeLoading();
};

// Preview
const handlePictureCardPreview = (file: any) => {
  dialogImageUrl.value = file.url;
  dialogVisible.value = true;
};

// Convert object to a specified string delimiter
const listToString = (list: any[], separator?: string) => {
  let strs = '';
  separator = separator || ',';
  for (const i in list) {
    if (undefined !== list[i].ossId && list[i].url.indexOf('blob:') !== 0) {
      strs += list[i].ossId + separator;
    }
  }
  return strs != '' ? strs.substring(0, strs.length - 1) : '';
};
</script>

<style lang="scss" scoped>
// .el-upload--picture-card controls the plus sign part
:deep(.hide .el-upload--picture-card) {
  display: none;
}
</style>
