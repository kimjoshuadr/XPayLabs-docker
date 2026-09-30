<template>
  <div>
    <el-upload
      v-if="type === 'url'"
      :action="upload.url"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      class="editor-img-uploader"
      name="file"
      :show-file-list="false"
      :headers="upload.headers"
    >
      <i ref="uploadRef"></i>
    </el-upload>
  </div>
  <div class="editor">
    <quill-editor
      ref="quillEditorRef"
      v-model:content="content"
      content-type="html"
      :options="options"
      :style="styles"
      @text-change="(e: any) => $emit('update:modelValue', content)"
    />
  </div>
</template>

<script setup lang="ts">
import '@vueup/vue-quill/dist/vue-quill.snow.css';

import { QuillEditor, Quill } from '@vueup/vue-quill';
import { propTypes } from '@/utils/propTypes';
import { globalHeaders } from '@/utils/request';

defineEmits(['update:modelValue']);

const props = defineProps({
  /* Editor content */
  modelValue: propTypes.string,
  /* Height */
  height: propTypes.number.def(400),
  /* Minimum height */
  minHeight: propTypes.number.def(400),
  /* Read-only */
  readOnly: propTypes.bool.def(false),
  /* Upload file size limit (MB) */
  fileSize: propTypes.number.def(5),
  /* Type (base64 format, url format) */
  type: propTypes.string.def('url')
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const upload = reactive<UploadOption>({
  headers: globalHeaders(),
  url: import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload'
});
const quillEditorRef = ref();
const uploadRef = ref<HTMLDivElement>();

const options = ref<any>({
  theme: 'snow',
  bounds: document.body,
  debug: 'warn',
  modules: {
    // Toolbar configuration
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'], // Bold italic underline strikethrough
        ['blockquote', 'code-block'], // Reference  code block
        [{ list: 'ordered' }, { list: 'bullet' }], // Ordered, unordered lists
        [{ indent: '-1' }, { indent: '+1' }], // Indent
        [{ size: ['small', false, 'large', 'huge'] }], // Font size
        [{ header: [1, 2, 3, 4, 5, 6, false] }], // Title
        [{ color: [] }, { background: [] }], // Font color, font background color
        [{ align: [] }], // Alignment
        ['clean'], // Clear text formatting
        ['link', 'image', 'video'] // Links, images, videos
      ],
      handlers: {
        image: (value: boolean) => {
          if (value) {
            // Call Element image upload
            uploadRef.value.click();
          } else {
            Quill.format('image', true);
          }
        }
      }
    }
  },
  placeholder: 'Enter content',
  readOnly: props.readOnly
});

const styles = computed(() => {
  const style: any = {};
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`;
  }
  if (props.height) {
    style.height = `${props.height}px`;
  }
  return style;
});

const content = ref('');
watch(
  () => props.modelValue,
  (v: string) => {
    if (v !== content.value) {
      content.value = v || '<p></p>';
    }
  },
  { immediate: true }
);

// Return image URL on successful image upload
const handleUploadSuccess = (res: any) => {
  // If upload succeeds
  if (res.code === 200) {
    // Get rich text instance
    const quill = toRaw(quillEditorRef.value).getQuill();
    // Get cursor position
    const length = quill.selection.savedRange.index;
    // Insert image, res is the image URL returned by the server
    quill.insertEmbed(length, 'image', res.data.url);
    // Move cursor to the end
    quill.setSelection(length + 1);
    proxy?.$modal.closeLoading();
  } else {
    proxy?.$modal.msgError('Failed to insert image');
    proxy?.$modal.closeLoading();
  }
};

// Intercept before image upload
const handleBeforeUpload = (file: any) => {
  const type = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg'];
  const isJPG = type.includes(file.type);
  //Validate file format
  if (!isJPG) {
    proxy?.$modal.msgError(`Invalid image format!`);
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
  return true;
};

// Image failure interception
const handleUploadError = (err: any) => {
  proxy?.$modal.msgError('File upload failed');
};
</script>

<style>
.editor-img-uploader {
  display: none;
}
.editor,
.ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.quill-img {
  display: none;
}
.ql-snow .ql-tooltip[data-mode='link']::before {
  content: 'Enter link address:';
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0;
  content: 'Save';
  padding-right: 0;
}
.ql-snow .ql-tooltip[data-mode='video']::before {
  content: 'Please enter video address:';
}
.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: '14px';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='small']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='small']::before {
  content: '10px';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='large']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='large']::before {
  content: '18px';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='huge']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='huge']::before {
  content: '32px';
}
.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: 'Text';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='1']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before {
  content: 'Title 1';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='2']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before {
  content: 'Title 2';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='3']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before {
  content: 'Heading 3';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='4']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before {
  content: 'Title 4';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='5']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before {
  content: 'Title 5';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='6']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before {
  content: 'Title 6';
}
.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: 'Standard Font';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value='serif']::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value='serif']::before {
  content: 'Serif Font';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value='monospace']::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value='monospace']::before {
  content: 'Monospace Font';
}
</style>
