<template>
  <div style="display: flex; justify-content: space-between">
    <div>
      <el-button v-if="submitButtonShow" :loading="props.buttonLoading" type="info" @click="submitForm('draft')">Save Draft</el-button>
      <el-button v-if="submitButtonShow" :loading="props.buttonLoading" type="primary" @click="submitForm('submit')">Submit</el-button>
      <el-button v-if="approvalButtonShow" :loading="props.buttonLoading" type="primary" @click="approvalVerifyOpen">Approval</el-button>
      <el-button v-if="props.id && props.status !== 'draft'" type="primary" @click="handleApprovalRecord">Process Progress</el-button>
      <slot />
    </div>
    <div>
      <el-button style="float: right" @click="goBack()">Back</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const props = defineProps({
  status: propTypes.string.def(''),
  pageType: propTypes.string.def(''),
  buttonLoading: propTypes.bool.def(false),
  id: propTypes.string.def('') || propTypes.number.def()
});
const emits = defineEmits(['submitForm', 'approvalVerifyOpen', 'handleApprovalRecord']);
//Save draft, submit
const submitForm = async (type) => {
  emits('submitForm', type);
};
// Approve
const approvalVerifyOpen = async () => {
  emits('approvalVerifyOpen');
};
// Approval records
const handleApprovalRecord = () => {
  emits('handleApprovalRecord');
};

//Validate whether the submit button is displayed
const submitButtonShow = computed(() => {
  return (
    props.pageType === 'add' ||
    (props.pageType === 'update' && props.status && (props.status === 'draft' || props.status === 'cancel' || props.status === 'back'))
  );
});

// Validate whether the approval button is displayed
const approvalButtonShow = computed(() => {
  return props.pageType === 'approval' && props.status && props.status === 'waiting';
});

// Return
const goBack = () => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.go(-1);
};
</script>
