<template>
  <div class="p-2">
    <el-card shadow="never">
      <approvalButton
        @submitForm="submitForm"
        @approvalVerifyOpen="approvalVerifyOpen"
        @handleApprovalRecord="handleApprovalRecord"
        :buttonLoading="buttonLoading"
        :id="form.id"
        :status="form.status"
        :pageType="routeParams.type"
      />
    </el-card>
    <el-card shadow="never" style="height: 78vh; overflow-y: auto">
      <el-form ref="leaveFormRef" v-loading="loading" :disabled="routeParams.type === 'view'" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Leave Type" prop="leaveType">
          <el-select v-model="form.leaveType" placeholder="Please select leave type" style="width: 100%">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Leave Time" required>
          <el-date-picker
            v-model="leaveTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            range-separator="To"
            start-placeholder="Start Time"
            end-placeholder="End Time"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            @change="changeLeaveTime()"
          />
        </el-form-item>
        <el-form-item label="Leave Days" prop="leaveDays">
          <el-input v-model="form.leaveDays" disabled type="number" placeholder="Please enter leave days" />
        </el-form-item>
        <el-form-item label="Leave Reason" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="Please enter leave reason" />
        </el-form-item>
      </el-form>
    </el-card>
    <!-- Submit Component -->
    <submitVerify ref="submitVerifyRef" :task-variables="taskVariables" @submit-callback="submitCallback" />
    <!-- Approval Records -->
    <approvalRecord ref="approvalRecordRef" />
    <el-dialog v-model="dialogVisible.visible" :title="dialogVisible.title" :before-close="handleClose" width="500">
      <el-select v-model="flowCode" placeholder="Select" style="width: 240px">
        <el-option v-for="item in flowCodeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">Cancel</el-button>
          <el-button type="primary" @click="submitFlow()"> Confirm </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Leave" lang="ts">
import { addLeave, getLeave, updateLeave } from '@/api/workflow/leave';
import { LeaveForm, LeaveQuery, LeaveVO } from '@/api/workflow/leave/types';
import { startWorkFlow } from '@/api/workflow/task';
import SubmitVerify from '@/components/Process/submitVerify.vue';
import ApprovalRecord from '@/components/Process/approvalRecord.vue';
import ApprovalButton from '@/components/Process/approvalButton.vue';
import { AxiosResponse } from 'axios';
import { StartProcessBo } from '@/api/workflow/workflowCommon/types';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const buttonLoading = ref(false);
const loading = ref(true);
const leaveTime = ref<Array<string>>([]);
//Route parameters
const routeParams = ref<Record<string, any>>({});
const options = [
  {
    value: '1',
    label: 'Personal Leave'
  },
  {
    value: '2',
    label: 'Compensatory Leave'
  },
  {
    value: '3',
    label: 'Sick Leave'
  },
  {
    value: '4',
    label: 'Marriage Leave'
  }
];
const flowCodeOptions = [
  {
    value: 'leave1',
    label: 'Leave Application - Normal'
  },
  {
    value: 'leave2',
    label: 'Leave Request - Exclusive Gateway'
  },
  {
    value: 'leave3',
    label: 'Leave Request - Parallel Gateway'
  },
  {
    value: 'leave4',
    label: 'Leave Application - Countersign'
  },
  {
    value: 'leave5',
    label: 'Leave Application - Parallel Countersign Gateway'
  },
  {
    value: 'leave6',
    label: 'Leave Application - Exclusive Parallel Counter-sign'
  }
];

const flowCode = ref<string>('');

const dialogVisible = reactive<DialogOption>({
  visible: false,
  title: 'Process Definition'
});
//Submit component
const submitVerifyRef = ref<InstanceType<typeof SubmitVerify>>();
//Approval record component
const approvalRecordRef = ref<InstanceType<typeof ApprovalRecord>>();
//Button component
const approvalButtonRef = ref<InstanceType<typeof ApprovalButton>>();

const leaveFormRef = ref<ElFormInstance>();

const submitFormData = ref<StartProcessBo>({
  businessId: '',
  flowCode: '',
  variables: {}
});
const taskVariables = ref<Record<string, any>>({});

const initFormData: LeaveForm = {
  id: undefined,
  leaveType: undefined,
  startDate: undefined,
  endDate: undefined,
  leaveDays: undefined,
  remark: undefined,
  status: undefined
};
const data = reactive<PageData<LeaveForm, LeaveQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    startLeaveDays: undefined,
    endLeaveDays: undefined
  },
  rules: {
    id: [{ required: true, message: 'Primary key cannot be empty', trigger: 'blur' }],
    leaveType: [{ required: true, message: 'Leave type cannot be empty', trigger: 'blur' }],
    leaveTime: [{ required: true, message: 'Leave time cannot be empty', trigger: 'blur' }],
    leaveDays: [{ required: true, message: 'Leave days cannot be empty', trigger: 'blur' }]
  }
});

const handleClose = () => {
  dialogVisible.visible = false;
  flowCode.value = '';
  buttonLoading.value = false;
};
const { form, rules } = toRefs(data);

/** Form reset */
const reset = () => {
  form.value = { ...initFormData };
  leaveTime.value = [];
  leaveFormRef.value?.resetFields();
};

const changeLeaveTime = () => {
  const startDate = new Date(leaveTime.value[0]).getTime();
  const endDate = new Date(leaveTime.value[1]).getTime();
  const diffInMilliseconds = endDate - startDate;
  form.value.leaveDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24)) + 1;
};
/** Get details */
const getInfo = () => {
  loading.value = true;
  buttonLoading.value = false;
  nextTick(async () => {
    const res = await getLeave(routeParams.value.id);
    Object.assign(form.value, res.data);
    leaveTime.value = [];
    leaveTime.value.push(form.value.startDate);
    leaveTime.value.push(form.value.endDate);
    loading.value = false;
    buttonLoading.value = false;
  });
};

/** Submit button */
const submitForm = (status: string) => {
  if (leaveTime.value.length === 0) {
    proxy?.$modal.msgError('Leave time cannot be empty');
    return;
  }
  try {
    leaveFormRef.value?.validate(async (valid: boolean) => {
      form.value.startDate = leaveTime.value[0];
      form.value.endDate = leaveTime.value[1];
      if (valid) {
        buttonLoading.value = true;
        let res: AxiosResponse<LeaveVO>;
        if (form.value.id) {
          res = await updateLeave(form.value).finally(() => (buttonLoading.value = false));
        } else {
          res = await addLeave(form.value).finally(() => (buttonLoading.value = false));
        }
        form.value = res.data;
        if (status === 'draft') {
          buttonLoading.value = false;
          proxy?.$modal.msgSuccess('Saved successfully');
          proxy.$tab.closePage(proxy.$route);
          proxy.$router.go(-1);
        } else {
          if ((form.value.status === 'draft' && (flowCode.value === '' || flowCode.value === null)) || routeParams.value.type === 'add') {
            flowCode.value = flowCodeOptions[0].value;
            dialogVisible.visible = true;
            return;
          }
          // Note: pass a random parameter if it has been started
          if (flowCode.value === '' || flowCode.value === null) {
            flowCode.value = 'xx';
          }
          await handleStartWorkFlow(res.data);
        }
      }
    });
  } finally {
    buttonLoading.value = false;
  }
};

const submitFlow = async () => {
  handleStartWorkFlow(form.value);
  dialogVisible.visible = false;
};
// Submit application
const handleStartWorkFlow = async (data: LeaveForm) => {
  try {
    submitFormData.value.flowCode = flowCode.value;
    submitFormData.value.businessId = data.id;
    // Process variables
    taskVariables.value = {
      // Process variables used by leave2/6
      leaveDays: data.leaveDays,
      // Process variables used by leave4/5
      userList: ['1', '3', '4']
    };
    submitFormData.value.variables = taskVariables.value;
    const resp = await startWorkFlow(submitFormData.value);
    if (submitVerifyRef.value) {
      buttonLoading.value = false;
      submitVerifyRef.value.openDialog(resp.data.taskId);
    }
  } finally {
    buttonLoading.value = false;
  }
};
// Approval records
const handleApprovalRecord = () => {
  approvalRecordRef.value.init(form.value.id);
};
// Submit callback
const submitCallback = async () => {
  await proxy.$tab.closePage(proxy.$route);
  proxy.$router.go(-1);
};
// Approve
const approvalVerifyOpen = async () => {
  submitVerifyRef.value.openDialog(routeParams.value.taskId);
};

onMounted(() => {
  nextTick(async () => {
    routeParams.value = proxy.$route.query;
    reset();
    loading.value = false;
    if (routeParams.value.type === 'update' || routeParams.value.type === 'view' || routeParams.value.type === 'approval') {
      getInfo();
    }
  });
});
</script>
