<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter"
      :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="User Account" prop="userName">
              <el-input v-model="queryParams.userName" placeholder="Please enter user account" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Nickname" prop="nickName">
              <el-input v-model="queryParams.nickName" placeholder="Please enter user nickname" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="User Email" prop="email">
              <el-input v-model="queryParams.email" placeholder="Please enter user email" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Mobile Area Code" prop="areacode">
              <el-input v-model="queryParams.areacode" placeholder="Enter phone country code" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Mobile Number" prop="phonenumber">
              <el-input v-model="queryParams.phonenumber" placeholder="Please enter phone number" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="VIP Level" prop="vipLevel">
              <el-input v-model="queryParams.vipLevel" placeholder="Please enter VIP level" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Invitation Code" prop="inviteCode">
              <el-input v-model="queryParams.inviteCode" placeholder="Please enter invitation code" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Referrer ID" prop="parentId">
              <el-input v-model="queryParams.parentId" placeholder="Please enter referrer ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Last Login Time" prop="loginDate">
              <el-date-picker clearable v-model="queryParams.loginDate" type="date" value-format="YYYY-MM-DD"
                placeholder="Please select last login time" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
              <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['app:user:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              v-hasPermi="['app:user:edit']">Edit</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              v-hasPermi="['app:user:remove']">Delete</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
              v-hasPermi="['app:user:export']">Export</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="userList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="User ID" align="center" prop="userId" v-if="true" />
        <el-table-column label="User No." align="center" prop="userCode" />
        <el-table-column label="User Account" align="center" prop="userName" />
        <el-table-column label="Nickname" align="center" prop="nickName" />
        <el-table-column label="User Type" align="center" prop="userType" />
        <el-table-column label="User Email" align="center" prop="email" />
        <el-table-column label="Mobile Area Code" align="center" prop="areacode" />
        <el-table-column label="Mobile Number" align="center" prop="phonenumber" />
        <el-table-column label="User Gender" align="center" prop="sex" />
        <el-table-column label="Avatar" align="center" prop="avatarUrl" >
          <template #default="scope">
            <ImagePreview
              :width="100"
              :height="100"
              :src="scope.row.avatarUrl"
              :preview-src-list="[scope.row.avatarUrl]"
            />
          </template>
        </el-table-column>

        <el-table-column label="VIP Level" align="center" prop="vipLevel" />

        <el-table-column label="Invitation Code" align="center" prop="inviteCode" />
        <el-table-column label="Referrer ID" align="center" prop="parentId" />
        <el-table-column label="Valid Referral Count" align="center" prop="validRecommend" />
        <el-table-column label="Points" align="center" prop="point" />
        <el-table-column label="Account Status" align="center" prop="status" />
        <el-table-column label="Last Login IP" align="center" prop="loginIp" />
        <el-table-column label="Created At" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Updated At" align="center" prop="updateTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                v-hasPermi="['app:user:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                v-hasPermi="['app:user:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit User Info Dialog -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="userFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="User Account" prop="userName">
          <el-input v-model="form.userName" :readonly="form.userId" placeholder="Please enter user account" />
        </el-form-item>
        <el-form-item label="Nickname" prop="nickName">
          <el-input v-model="form.nickName" placeholder="Please enter user nickname" />
        </el-form-item>
        <el-form-item label="User Email" prop="email">
          <el-input v-model="form.email" placeholder="Please enter user email" />
        </el-form-item>
        <el-form-item label="Mobile Area Code" prop="areacode">
          <el-input v-model="form.areacode" placeholder="Enter phone country code" />
        </el-form-item>
        <el-form-item label="Mobile Number" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="Please enter phone number" />
        </el-form-item>
        <el-form-item label="Avatar URL" prop="avatar">
          <image-upload v-model="form.avatar" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="form.password" type="password" placeholder="Please enter password" />
        </el-form-item>
        <el-form-item label="VIP Level" prop="vipLevel">
          <el-input v-model="form.vipLevel" placeholder="Please enter VIP level" />
        </el-form-item>
        <el-form-item label="Payment Password" prop="payPwd">
          <el-input v-model="form.payPwd" type="password" placeholder="Please enter payment password" />
        </el-form-item>
        <el-form-item label="Invitation Code" prop="inviteCode">
          <el-input v-model="form.inviteCode" placeholder="Please enter invitation code" />
        </el-form-item>
        <el-form-item label="Referrer ID" prop="parentId">
          <el-input v-model="form.parentId" placeholder="Please enter referrer ID" />
        </el-form-item>
        <el-form-item label="Points" prop="point">
          <el-input v-model="form.point" placeholder="Please enter points" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Enter content" />
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

<script setup name="User" lang="ts">
import { listUser, getUser, delUser, addUser, updateUser } from '@/api/app/user';
import { UserVO, UserQuery, UserForm } from '@/api/app/user/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const userList = ref<UserVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const userFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: UserForm = {
  userName: undefined,
  nickName: undefined,
  userType: undefined,
  email: undefined,
  areacode: undefined,
  phonenumber: undefined,
  sex: undefined,
  avatar: undefined,
  password: undefined,
  vipLevel: undefined,
  payPwd: undefined,
  inviteCode: undefined,
  parentId: undefined,
  referrerIds: undefined,
  point: undefined,
  status: undefined,
  remark: undefined
}
const data = reactive<PageData<UserForm, UserQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    nickName: undefined,
    userType: undefined,
    email: undefined,
    areacode: undefined,
    phonenumber: undefined,
    sex: undefined,
    avatar: undefined,
    password: undefined,
    vipLevel: undefined,
    payPwd: undefined,
    inviteCode: undefined,
    parentId: undefined,
    referrerIds: undefined,
    point: undefined,
    status: undefined,
    loginIp: undefined,
    loginDate: undefined,
    params: {
    }
  },
  rules: {
    userName: [
      { required: true, message: "User account cannot be empty", trigger: "blur" }
    ],
    password: [
      { required: true, message: "Password cannot be empty", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query user info list */
const getList = async () => {
  loading.value = true;
  const res = await listUser(queryParams.value);
  userList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** Cancel button */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** Form reset */
const reset = () => {
  form.value = { ...initFormData };
  userFormRef.value?.resetFields();
}

/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** Checkbox selected data */
const handleSelectionChange = (selection: UserVO[]) => {
  ids.value = selection.map(item => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** Add button action */
const handleAdd = () => {
  reset();
  data.rules.password  = [{ required: true, message: "Password cannot be empty", trigger: "blur" }]
  dialog.visible = true;
  dialog.title = "Add User Information";
}

/** Edit button action */
const handleUpdate = async (row?: UserVO) => {
  reset();
  const _userId = row?.userId || ids.value[0]

  delete data.rules.password

  const res = await getUser(_userId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "Edit User Information";
}

/** Submit button */
const submitForm = () => {
  userFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.userId) {
        await updateUser(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addUser(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Operation successful");
      dialog.visible = false;
      await getList();
    }
  });
}

/** Delete button action */
const handleDelete = async (row?: UserVO) => {
  const _userIds = row?.userId || ids.value;
  await proxy?.$modal.confirm('Confirm to delete user info with ID "' + _userIds + '" items?').finally(() => loading.value = false);
  await delUser(_userIds);
  proxy?.$modal.msgSuccess("Deleted successfully");
  await getList();
}

/** Export button action */
const handleExport = () => {
  proxy?.download('app/user/export', {
    ...queryParams.value
  }, `user_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
