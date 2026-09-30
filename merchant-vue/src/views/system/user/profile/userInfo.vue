<template>
  <el-form ref="userRef" :model="userForm" :rules="rules" label-width="80px">
    <el-form-item label="Nickname" prop="nickName">
      <el-input v-model="userForm.nickName" maxlength="30" />
    </el-form-item>
    <el-form-item label="Mobile Number" prop="phonenumber">
      <el-input v-model="userForm.phonenumber" maxlength="11" />
    </el-form-item>
    <el-form-item label="Email" prop="email">
      <el-input v-model="userForm.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="Gender">
      <el-radio-group v-model="userForm.sex">
        <el-radio value="0">Male</el-radio>
        <el-radio value="1">Female</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">Save</el-button>
      <el-button type="danger" @click="close">Close</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { updateUserProfile } from '@/api/system/user';
import { propTypes } from '@/utils/propTypes';

const props = defineProps({
  user: propTypes.any.isRequired
});
const userForm = computed(() => props.user);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const userRef = ref<ElFormInstance>();
const rule: ElFormRules = {
  nickName: [{ required: true, message: 'User nickname cannot be empty', trigger: 'blur' }],
  email: [
    { required: true, message: 'Email address cannot be empty', trigger: 'blur' },
    {
      type: 'email',
      message: 'Please enter a valid email address',
      trigger: ['blur', 'change']
    }
  ],
  phonenumber: [
    {
      required: true,
      message: 'Phone number cannot be empty',
      trigger: 'blur'
    },
    { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: 'Please enter a valid mobile number', trigger: 'blur' }
  ]
};
const rules = ref<ElFormRules>(rule);

/** Submit button */
const submit = () => {
  userRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      await updateUserProfile(props.user);
      proxy?.$modal.msgSuccess('Updated successfully');
    }
  });
};
/** Close button */
const close = () => {
  proxy?.$tab.closePage();
};
</script>
