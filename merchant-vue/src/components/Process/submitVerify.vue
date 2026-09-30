<template>
  <el-dialog v-model="dialog.visible" :title="dialog.title" width="50%" draggable :before-close="cancel" center :close-on-click-modal="false">
    <el-form v-loading="loading" :model="form" label-width="120px">
      <el-form-item label="Notifications">
        <el-checkbox-group v-model="form.messageType">
          <el-checkbox value="1" name="type" disabled>Internal Message</el-checkbox>
          <el-checkbox value="2" name="type">Email</el-checkbox>
          <el-checkbox value="3" name="type">SMS</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="Attachment">
        <fileUpload v-model="form.fileId" :file-type="['png', 'jpg', 'jpeg', 'doc', 'docx', 'xlsx', 'xls', 'ppt', 'txt', 'pdf']" :file-size="20" />
      </el-form-item>
      <el-form-item label="CC" v-if="buttonObj.copy">
        <el-button type="primary" icon="Plus" circle @click="openUserSelectCopy" />
        <el-tag v-for="user in selectCopyUserList" :key="user.userId" closable style="margin: 2px" @close="handleCopyCloseTag(user)">
          {{ user.nickName }}
        </el-tag>
      </el-form-item>
      <el-form-item v-if="buttonObj.pop && nestNodeList && nestNodeList.length > 0" label="Next Approver" prop="assigneeMap">
        <div v-for="(item, index) in nestNodeList" :key="index" style="margin-bottom: 5px; width: 500px">
          <span>[{{ item.nodeName }}]:</span>
          <el-input v-if="false" v-model="form.assigneeMap[item.nodeCode]" />
          <el-input placeholder="Please select an approver" readonly v-model="nickName[item.nodeCode]">
            <template v-slot:append>
              <el-button @click="choosePeople(item)" icon="search">Select</el-button>
            </template>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item v-if="task.flowStatus === 'waiting'" label="Approval Comment">
        <el-input v-model="form.message" type="textarea" resize="none" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="buttonDisabled" type="primary" @click="handleCompleteTask"> Submit </el-button>
        <el-button v-if="task.flowStatus === 'waiting' && buttonObj.trust" :disabled="buttonDisabled" type="primary" @click="openDelegateTask">
          Entrust
        </el-button>
        <el-button v-if="task.flowStatus === 'waiting' && buttonObj.transfer" :disabled="buttonDisabled" type="primary" @click="openTransferTask">
          Transfer
        </el-button>
        <el-button
          v-if="task.flowStatus === 'waiting' && Number(task.nodeRatio) > 0 && buttonObj.addSign"
          :disabled="buttonDisabled"
          type="primary"
          @click="openMultiInstanceUser"
        >
          Add Approver
        </el-button>
        <el-button
          v-if="task.flowStatus === 'waiting' && Number(task.nodeRatio) > 0 && buttonObj.subSign"
          :disabled="buttonDisabled"
          type="primary"
          @click="handleTaskUser"
        >
          Remove Signer
        </el-button>
        <el-button
          v-if="task.flowStatus === 'waiting' && buttonObj.termination"
          :disabled="buttonDisabled"
          type="danger"
          @click="handleTerminationTask"
        >
          Terminate
        </el-button>
        <el-button v-if="task.flowStatus === 'waiting' && buttonObj.back" :disabled="buttonDisabled" type="danger" @click="handleBackProcessOpen">
          Return
        </el-button>
        <el-button :disabled="buttonDisabled" @click="cancel">Cancel</el-button>
      </span>
    </template>
    <!-- CC -->
    <UserSelect ref="userSelectCopyRef" :multiple="true" :data="selectCopyUserIds" @confirm-call-back="userSelectCopyCallBack"></UserSelect>
    <!-- Transfer -->
    <UserSelect ref="transferTaskRef" :multiple="false" @confirm-call-back="handleTransferTask"></UserSelect>
    <!-- Delegation -->
    <UserSelect ref="delegateTaskRef" :multiple="false" @confirm-call-back="handleDelegateTask"></UserSelect>
    <!-- Signature Component -->
    <UserSelect ref="multiInstanceUserRef" :multiple="true" @confirm-call-back="addMultiInstanceUser"></UserSelect>
    <!-- User selection dialog -->
    <UserSelect ref="porUserRef" :multiple="true" :userIds="popUserIds" @confirm-call-back="handlePopUser"></UserSelect>

    <!-- Reject Start -->
    <el-dialog v-model="backVisible" draggable title="Reject" width="40%" :close-on-click-modal="false">
      <el-form v-if="task.flowStatus === 'waiting'" v-loading="backLoading" :model="backForm" label-width="120px">
        <el-form-item label="Reject Node">
          <el-select v-model="backForm.nodeCode" clearable placeholder="Select" style="width: 300px">
            <el-option v-for="item in taskNodeList" :key="item.nodeCode" :label="item.nodeName" :value="item.nodeCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="Notifications">
          <el-checkbox-group v-model="backForm.messageType">
            <el-checkbox label="1" name="type" disabled>Internal Message</el-checkbox>
            <el-checkbox label="2" name="type">Email</el-checkbox>
            <el-checkbox label="3" name="type">SMS</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-if="task.flowStatus === 'waiting'" label="Attachment">
          <fileUpload
            v-model="backForm.fileId"
            :file-type="['png', 'jpg', 'jpeg', 'doc', 'docx', 'xlsx', 'xls', 'ppt', 'txt', 'pdf']"
            :file-size="20"
          />
        </el-form-item>
        <el-form-item label="Approval Comment">
          <el-input v-model="backForm.message" type="textarea" resize="none" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="float: right; padding-bottom: 20px">
          <el-button :disabled="backButtonDisabled" type="primary" @click="handleBackProcess">Confirm</el-button>
          <el-button :disabled="backButtonDisabled" @click="backVisible = false">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Rejection End -->
    <el-dialog v-model="deleteSignatureVisible" draggable title="Remove Approvers" width="700px" height="400px" append-to-body :close-on-click-modal="false">
      <div>
        <el-table :data="deleteUserList" border>
          <el-table-column prop="nodeName" label="Task Name" />
          <el-table-column prop="nickName" label="Assignee" />
          <el-table-column label="Actions" align="center" width="160">
            <template #default="scope">
              <el-button type="danger" size="small" icon="Delete" @click="deleteMultiInstanceUser(scope.row)">Delete </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ComponentInternalInstance } from 'vue';
import { ElForm } from 'element-plus';
import {
  completeTask,
  backProcess,
  getTask,
  taskOperation,
  terminationTask,
  getBackTaskNode,
  currentTaskAllUser,
  getNextNodeList
} from '@/api/workflow/task';
import UserSelect from '@/components/UserSelect';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import { UserVO } from '@/api/system/user/types';
import { FlowTaskVO, TaskOperationBo } from '@/api/workflow/task/types';

const userSelectCopyRef = ref<InstanceType<typeof UserSelect>>();
const transferTaskRef = ref<InstanceType<typeof UserSelect>>();
const delegateTaskRef = ref<InstanceType<typeof UserSelect>>();
const multiInstanceUserRef = ref<InstanceType<typeof UserSelect>>();
const porUserRef = ref<InstanceType<typeof UserSelect>>();

const props = defineProps({
  taskVariables: {
    type: Object as () => Record<string, any>,
    default: () => {}
  }
});
// Mask layer
const loading = ref(true);
//Button
const buttonDisabled = ref(true);
// Task ID
const taskId = ref<string>('');
// CC recipients
const selectCopyUserList = ref<UserVO[]>([]);
// CC user ID
const selectCopyUserIds = ref<string>(undefined);
// Personnel eligible for sign-off removal
const deleteUserList = ref<any>([]);
// Selectable personnel ID in the dialog
const popUserIds = ref<any>([]);
//Whether to show reject
const backVisible = ref(false);
const backLoading = ref(true);
const backButtonDisabled = ref(true);
// Rejectable task nodes
const taskNodeList = ref([]);
const nickName = ref({});
// Node code
const nodeCode = ref<string>('');
const buttonObj = ref<any>({
  pop: false,
  trust: false,
  transfer: false,
  addSign: false,
  subSign: false,
  termination: false,
  back: false
});
// Next node list
const nestNodeList = ref([]);
//Task
const task = ref<FlowTaskVO>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  tenantId: undefined,
  definitionId: undefined,
  instanceId: undefined,
  flowName: undefined,
  businessId: undefined,
  nodeCode: undefined,
  nodeName: undefined,
  flowCode: undefined,
  flowStatus: undefined,
  formCustom: undefined,
  formPath: undefined,
  nodeType: undefined,
  nodeRatio: undefined,
  applyNode: false,
  buttonList: []
});
const dialog = reactive<DialogOption>({
  visible: false,
  title: 'Notice'
});
// Remove-signer dialog
const deleteSignatureVisible = ref(false);
const form = ref<Record<string, any>>({
  taskId: undefined,
  message: undefined,
  assigneeMap: {},
  variables: {},
  messageType: ['1'],
  flowCopyList: []
});
const backForm = ref<Record<string, any>>({
  taskId: undefined,
  nodeCode: undefined,
  message: undefined,
  variables: {},
  messageType: ['1']
});

//Open dialog
const openDialog = async (id?: string) => {
  selectCopyUserIds.value = undefined;
  selectCopyUserList.value = [];
  form.value.fileId = undefined;
  taskId.value = id;
  form.value.message = undefined;
  dialog.visible = true;
  loading.value = true;
  buttonDisabled.value = true;
  const response = await getTask(taskId.value);
  task.value = response.data;
  buttonObj.value = {};
  task.value.buttonList.forEach((e) => {
    buttonObj.value[e.code] = e.show;
  });
  buttonDisabled.value = false;
  const data = {
    taskId: taskId.value,
    variables: props.taskVariables
  };
  const nextData = await getNextNodeList(data);
  nestNodeList.value = nextData.data;
  loading.value = false;
};

onMounted(() => {});
const emits = defineEmits(['submitCallback', 'cancelCallback']);

/** Process handling */
const handleCompleteTask = async () => {
  form.value.taskId = taskId.value;
  form.value.taskVariables = props.taskVariables;
  let verify = false;
  if (buttonObj.value.pop && nestNodeList.value && nestNodeList.value.length > 0) {
    nestNodeList.value.forEach((e) => {
      if (
        Object.keys(form.value.assigneeMap).length === 0 ||
        form.value.assigneeMap[e.nodeCode] === '' ||
        form.value.assigneeMap[e.nodeCode] === null ||
        form.value.assigneeMap[e.nodeCode] === undefined
      ) {
        verify = true;
      }
    });
    if (verify) {
      proxy?.$modal.msgWarning('Please select an approver!');
      return false;
    }
  } else {
    form.value.assigneeMap = {};
  }
  if (selectCopyUserList.value && selectCopyUserList.value.length > 0) {
    const flowCopyList = [];
    selectCopyUserList.value.forEach((e) => {
      const copyUser = {
        userId: e.userId,
        userName: e.nickName
      };
      flowCopyList.push(copyUser);
    });
    form.value.flowCopyList = flowCopyList;
  }
  await proxy?.$modal.confirm('Confirm submit?');
  loading.value = true;
  buttonDisabled.value = true;
  try {
    await completeTask(form.value);
    dialog.visible = false;
    emits('submitCallback');
    proxy?.$modal.msgSuccess('Operation successful');
  } finally {
    loading.value = false;
    buttonDisabled.value = false;
  }
};

/** Rejection dialog opened */
const handleBackProcessOpen = async () => {
  backForm.value = {};
  backForm.value.messageType = ['1'];
  backVisible.value = true;
  backLoading.value = true;
  backButtonDisabled.value = true;
  const data = await getBackTaskNode(task.value.definitionId, task.value.nodeCode);
  taskNodeList.value = data.data;
  backLoading.value = false;
  backButtonDisabled.value = false;
  backForm.value.nodeCode = taskNodeList.value[0].nodeCode;
};
/** Reject process */
const handleBackProcess = async () => {
  backForm.value.taskId = taskId.value;
  await proxy?.$modal.confirm('Confirm to reject back to the applicant?');
  loading.value = true;
  backLoading.value = true;
  backButtonDisabled.value = true;
  await backProcess(backForm.value).finally(() => {
    loading.value = false;
    buttonDisabled.value = false;
  });
  dialog.visible = false;
  backLoading.value = false;
  backButtonDisabled.value = false;
  emits('submitCallback');
  proxy?.$modal.msgSuccess('Operation successful');
};
//Cancel
const cancel = async () => {
  dialog.visible = false;
  buttonDisabled.value = false;
  nickName.value = {};
  form.value.assigneeMap = {};
  emits('cancelCallback');
};
//Open CC recipients
const openUserSelectCopy = () => {
  userSelectCopyRef.value.open();
};
// Confirm CC recipients
const userSelectCopyCallBack = (data: UserVO[]) => {
  if (data && data.length > 0) {
    selectCopyUserList.value = data;
    selectCopyUserIds.value = selectCopyUserList.value.map((item) => item.userId).join(',');
  }
};
// Delete CC personnel
const handleCopyCloseTag = (user: UserVO) => {
  const userId = user.userId;
  // Delete user using split
  const index = selectCopyUserList.value.findIndex((item) => item.userId === userId);
  selectCopyUserList.value.splice(index, 1);
  selectCopyUserIds.value = selectCopyUserList.value.map((item) => item.userId).join(',');
};
// Add approver
const openMultiInstanceUser = async () => {
  multiInstanceUserRef.value.open();
};
// Add approver
const addMultiInstanceUser = async (data) => {
  if (data && data.length > 0) {
    const taskOperationBo = reactive<TaskOperationBo>({
      userIds: data.map((e) => e.userId),
      taskId: taskId.value,
      message: form.value.message
    });
    await proxy?.$modal.confirm('Confirm submit?');
    loading.value = true;
    buttonDisabled.value = true;
    await taskOperation(taskOperationBo, 'addSignature').finally(() => {
      loading.value = false;
      buttonDisabled.value = false;
    });
    dialog.visible = false;
    emits('submitCallback');
    proxy?.$modal.msgSuccess('Operation successful');
  } else {
    proxy?.$modal.msgWarning('Please select a user!');
  }
};
// Remove approver
const deleteMultiInstanceUser = async (row) => {
  await proxy?.$modal.confirm('Confirm submit?');
  loading.value = true;
  buttonDisabled.value = true;
  const taskOperationBo = reactive<TaskOperationBo>({
    userIds: [row.userId],
    taskId: taskId.value,
    message: form.value.message
  });
  await taskOperation(taskOperationBo, 'reductionSignature').finally(() => {
    loading.value = false;
    buttonDisabled.value = false;
  });
  dialog.visible = false;
  emits('submitCallback');
  proxy?.$modal.msgSuccess('Operation successful');
};
//Open reassign
const openTransferTask = () => {
  transferTaskRef.value.open();
};
//Reassign
const handleTransferTask = async (data) => {
  if (data && data.length > 0) {
    const taskOperationBo = reactive<TaskOperationBo>({
      userId: data[0].userId,
      taskId: taskId.value,
      message: form.value.message
    });
    await proxy?.$modal.confirm('Confirm submit?');
    loading.value = true;
    buttonDisabled.value = true;
    await taskOperation(taskOperationBo, 'transferTask').finally(() => {
      loading.value = false;
      buttonDisabled.value = false;
    });
    dialog.visible = false;
    emits('submitCallback');
    proxy?.$modal.msgSuccess('Operation successful');
  } else {
    proxy?.$modal.msgWarning('Please select a user!');
  }
};

// Open delegation
const openDelegateTask = () => {
  delegateTaskRef.value.open();
};
//Delegate
const handleDelegateTask = async (data) => {
  if (data && data.length > 0) {
    const taskOperationBo = reactive<TaskOperationBo>({
      userId: data[0].userId,
      taskId: taskId.value,
      message: form.value.message
    });
    await proxy?.$modal.confirm('Confirm submit?');
    loading.value = true;
    buttonDisabled.value = true;
    await taskOperation(taskOperationBo, 'delegateTask').finally(() => {
      loading.value = false;
      buttonDisabled.value = false;
    });
    dialog.visible = false;
    emits('submitCallback');
    proxy?.$modal.msgSuccess('Operation successful');
  } else {
    proxy?.$modal.msgWarning('Please select a user!');
  }
};
//Terminate task
const handleTerminationTask = async () => {
  const params = {
    taskId: taskId.value,
    comment: form.value.message
  };
  await proxy?.$modal.confirm('Are you sure you want to terminate?');
  loading.value = true;
  buttonDisabled.value = true;
  await terminationTask(params).finally(() => {
    loading.value = false;
    buttonDisabled.value = false;
  });
  dialog.visible = false;
  emits('submitCallback');
  proxy?.$modal.msgSuccess('Operation successful');
};
const handleTaskUser = async () => {
  const data = await currentTaskAllUser(taskId.value);
  deleteUserList.value = data.data;
  if (deleteUserList.value && deleteUserList.value.length > 0) {
    deleteUserList.value.forEach((e) => {
      e.nodeName = task.value.nodeName;
    });
  }
  deleteSignatureVisible.value = true;
};
// Select personnel
const choosePeople = async (data) => {
  if (!data.permissionFlag) {
    proxy?.$modal.msgError('No selectable personnel, please contact the administrator!');
  }
  popUserIds.value = data.permissionFlag;
  nodeCode.value = data.nodeCode;
  porUserRef.value.open();
};
// Confirm selection
const handlePopUser = async (userList) => {
  const userIds = userList.map((item) => {
    return item.userId;
  });
  const nickNames = userList.map((item) => {
    return item.nickName;
  });
  form.value.assigneeMap[nodeCode.value] = userIds.join(',');
  nickName.value[nodeCode.value] = nickNames.join(',');
};

/**
 * Expose Child Component Methods
 */
defineExpose({
  openDialog
});
</script>
