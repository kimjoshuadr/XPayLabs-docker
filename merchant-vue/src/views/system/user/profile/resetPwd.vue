<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="Old Password" prop="oldPassword">
      <el-input v-model="user.oldPassword" placeholder="Enter old password" type="password" show-password />
    </el-form-item>
    <el-form-item label="New Password" prop="newPassword">
      <el-input v-model="user.newPassword" placeholder="Please enter new password" type="password" show-password />
    </el-form-item>
    <el-form-item label="Confirm Password" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="Please confirm the new password" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">Save</el-button>
      <el-button type="danger" @click="close">Close</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { updateUserPwd } from '@/api/system/user';
import type { ResetPwdForm } from '@/api/system/user/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const pwdRef = ref<ElFormInstance>();
const user = ref<ResetPwdForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const equalToPassword = (rule: any, value: string, callback: any) => {
  if (user.value.newPassword !== value) {
    callback(new Error('The two passwords do not match'));
  } else {
    callback();
  }
};
const rules = ref({
  oldPassword: [{ required: true, message: 'Old password cannot be empty', trigger: 'blur' }],
  newPassword: [
    { required: true, message: 'New password cannot be empty', trigger: 'blur' },
    {
      min: 6,
      max: 20,
      message: 'Length must be 6 to 20 characters',
      trigger: 'blur'
    },
    { pattern: /^[^<>"'|\\]+$/, message: 'cannot contain illegal characters: < > " \' \\ |', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Confirm password cannot be empty', trigger: 'blur' },
    {
      required: true,
      validator: equalToPassword,
      trigger: 'blur'
    }
  ]
});

/** Submit button */
const submit = () => {
  pwdRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      await updateUserPwd(user.value.oldPassword, user.value.newPassword);
      proxy?.$modal.msgSuccess('Updated successfully');
    }
  });
};
/** Close button */
const close = () => {
  proxy?.$tab.closePage();
};
</script>
