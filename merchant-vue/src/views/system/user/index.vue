<template>
  <div class="p-2">
    <el-row :gutter="20">
      <!-- Department Tree -->
      <el-col :lg="4" :xs="24" style="">
        <el-card shadow="hover">
          <el-input v-model="deptName" placeholder="Enter department name" prefix-icon="Search" clearable />
          <el-tree
            ref="deptTreeRef"
            class="mt-2"
            node-key="id"
            :data="deptOptions"
            :props="{ label: 'label', children: 'children' } as any"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>
      <el-col :lg="20" :xs="24">
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
          <div v-show="showSearch" class="mb-[10px]">
            <el-card shadow="hover">
              <el-form ref="queryFormRef" :model="queryParams" :inline="true">
                <el-form-item label="Username" prop="userName">
                  <el-input v-model="queryParams.userName" placeholder="Please enter username" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="Nickname" prop="nickName">
                  <el-input v-model="queryParams.nickName" placeholder="Please enter user nickname" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="Mobile Number" prop="phonenumber">
                  <el-input v-model="queryParams.phonenumber" placeholder="Please enter phone number" clearable @keyup.enter="handleQuery" />
                </el-form-item>

                <el-form-item label="Status" prop="status">
                  <el-select v-model="queryParams.status" placeholder="User Status" clearable>
                    <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
                <el-form-item label="Created At" style="width: 308px">
                  <el-date-picker
                    v-model="dateRange"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="Start Date"
                    end-placeholder="End Date"
                    :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
                  <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </transition>

        <el-card shadow="hover">
          <template #header>
            <el-row :gutter="10">
              <el-col :span="1.5">
                <el-button v-has-permi="['system:user:add']" type="primary" plain icon="Plus" @click="handleAdd()">Add</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button v-has-permi="['system:user:edit']" type="success" plain :disabled="single" icon="Edit" @click="handleUpdate()">
                  Edit
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button v-has-permi="['system:user:remove']" type="danger" plain :disabled="multiple" icon="Delete" @click="handleDelete()">
                  Delete
                </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-dropdown class="mt-[1px]">
                  <el-button plain type="info">
                    More
                    <el-icon class="el-icon--right"><arrow-down /></el-icon
                  ></el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item icon="Download" @click="importTemplate">Download Template</el-dropdown-item>
                      <!-- Note: Since the el-dropdown-item tag is lazy-loaded, the v-has-permi custom directive does not take effect; you need to use v-if to call a method to execute it -->
                      <el-dropdown-item v-if="checkPermi(['system:user:import'])" icon="Top" @click="handleImport">Import Data</el-dropdown-item>
                      <el-dropdown-item v-if="checkPermi(['system:user:export'])" icon="Download" @click="handleExport">Export Data</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-col>
              <right-toolbar v-model:show-search="showSearch" :columns="columns" :search="true" @query-table="getList"></right-toolbar>
            </el-row>
          </template>

          <el-table v-loading="loading" border :data="userList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column v-if="columns[0].visible" key="userId" label="User No." align="center" prop="userId" />
            <el-table-column v-if="columns[1].visible" key="userName" label="Username" align="center" prop="userName" :show-overflow-tooltip="true" />
            <el-table-column v-if="columns[2].visible" key="nickName" label="Nickname" align="center" prop="nickName" :show-overflow-tooltip="true" />
            <el-table-column v-if="columns[3].visible" key="deptName" label="Department" align="center" prop="deptName" :show-overflow-tooltip="true" />
            <el-table-column v-if="columns[4].visible" key="phonenumber" label="Mobile Number" align="center" prop="phonenumber" width="120" />
            <el-table-column v-if="columns[5].visible" key="status" label="Status" align="center">
              <template #default="scope">
                <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
              </template>
            </el-table-column>

            <el-table-column v-if="columns[6].visible" label="Created At" align="center" prop="createTime" width="160">
              <template #default="scope">
                <span>{{ scope.row.createTime }}</span>
              </template>
            </el-table-column>

            <el-table-column label="Actions" fixed="right" width="180" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-tooltip v-if="scope.row.userId !== 1" content="Edit" placement="top">
                  <el-button v-hasPermi="['system:user:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip v-if="scope.row.userId !== 1" content="Delete" placement="top">
                  <el-button v-hasPermi="['system:user:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
                </el-tooltip>

                <el-tooltip v-if="scope.row.userId !== 1" content="Reset Password" placement="top">
                  <el-button v-hasPermi="['system:user:resetPwd']" link type="primary" icon="Key" @click="handleResetPwd(scope.row)"></el-button>
                </el-tooltip>

                <el-tooltip v-if="scope.row.userId !== 1" content="Assign Roles" placement="top">
                  <el-button v-hasPermi="['system:user:edit']" link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="total > 0"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            :total="total"
            @pagination="getList"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Add or Edit User Configuration Dialog -->
    <el-dialog ref="formDialogRef" v-model="dialog.visible" :title="dialog.title" width="600px" append-to-body @close="closeDialog">
      <el-form ref="userFormRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="Nickname" prop="nickName">
              <el-input v-model="form.nickName" placeholder="Please enter user nickname" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Department" prop="deptId">
              <el-tree-select
                v-model="form.deptId"
                :data="enabledDeptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' } as any"
                value-key="id"
                placeholder="Please select owning department"
                check-strictly
                @change="handleDeptChange"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Mobile Number" prop="phonenumber">
              <el-input v-model="form.phonenumber" placeholder="Please enter phone number" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" placeholder="Please enter email" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="Username" prop="userName">
              <el-input v-model="form.userName" placeholder="Please enter username" maxlength="30" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="User Password" prop="password">
              <el-input v-model="form.password" placeholder="Please enter user password" type="password" maxlength="20" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="User Gender">
              <el-select v-model="form.sex" placeholder="Select">
                <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Post">
              <el-select v-model="form.postIds" multiple placeholder="Select">
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status == '1'"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Role" prop="roleIds">
              <el-select v-model="form.roleIds" filterable multiple placeholder="Select">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status == '1'"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="Remark">
              <el-input v-model="form.remark" type="textarea" placeholder="Enter content"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">Confirm</el-button>
          <el-button @click="cancel()">Cancel</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- User Import Dialog -->
    <el-dialog v-model="upload.open" :title="upload.title" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload">
          <i-ep-upload-filled />
        </el-icon>
        <div class="el-upload__text">Drag the file here, or<em>Click to Upload</em></div>
        <template #tip>
          <div class="text-center el-upload__tip">
            <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />Whether to update existing user data</div>
            <span>Only xls and xlsx files can be imported.</span>
            <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">Download Template</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">Confirm</el-button>
          <el-button @click="upload.open = false">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="User" lang="ts">
import api from '@/api/system/user';
import { UserForm, UserQuery, UserVO } from '@/api/system/user/types';
import { DeptTreeVO, DeptVO } from '@/api/system/dept/types';
import { RoleVO } from '@/api/system/role/types';
import { PostQuery, PostVO } from '@/api/system/post/types';
import { treeselect } from '@/api/system/dept';
import { globalHeaders } from '@/utils/request';
import { to } from 'await-to-js';
import { optionselect } from '@/api/system/post';
import { hasPermi } from '@/directive/permission';
import { checkPermi } from '@/utils/permission';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable, sys_user_sex } = toRefs<any>(proxy?.useDict('sys_normal_disable', 'sys_user_sex'));
const userList = ref<UserVO[]>();
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);
const deptName = ref('');
const deptOptions = ref<DeptTreeVO[]>([]);
const enabledDeptOptions = ref<DeptTreeVO[]>([]);
const initPassword = ref<string>('');
const postOptions = ref<PostVO[]>([]);
const roleOptions = ref<RoleVO[]>([]);
/*** User import parameter */
const upload = reactive<ImportOption>({
  // Whether to display the popup layer (user import)
  open: false,
  // Popup title (user import)
  title: '',
  // Whether upload is disabled
  isUploading: false,
  // Whether to update existing user data
  updateSupport: 0,
  // Set request headers for upload
  headers: globalHeaders(),
  // Upload URL
  url: import.meta.env.VITE_APP_BASE_API + '/system/user/importData'
});
// Column visibility info
const columns = ref<FieldOption[]>([
  { key: 0, label: `User No.`, visible: false, children: [] },
  { key: 1, label: `Username`, visible: true, children: [] },
  { key: 2, label: `Nickname`, visible: true, children: [] },
  { key: 3, label: `Department`, visible: true, children: [] },
  { key: 4, label: `Mobile Number`, visible: true, children: [] },
  { key: 5, label: `Status`, visible: true, children: [] },
  { key: 6, label: `Created At`, visible: true, children: [] }
]);

const deptTreeRef = ref<ElTreeInstance>();
const queryFormRef = ref<ElFormInstance>();
const userFormRef = ref<ElFormInstance>();
const uploadRef = ref<ElUploadInstance>();
const formDialogRef = ref<ElDialogInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: UserForm = {
  userId: undefined,
  deptId: undefined,
  userName: '',
  nickName: undefined,
  password: '',
  phonenumber: undefined,
  email: undefined,
  sex: undefined,
  status: '0',
  remark: '',
  postIds: [],
  roleIds: []
};

const initData: PageData<UserForm, UserQuery> = {
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: '',
    phonenumber: '',
    status: '',
    deptId: '',
    roleId: ''
  },
  rules: {
    userName: [
      { required: true, message: 'User name cannot be empty', trigger: 'blur' },
      {
        min: 2,
        max: 20,
        message: 'Username length must be between 2 and 20',
        trigger: 'blur'
      }
    ],
    nickName: [{ required: true, message: 'User nickname cannot be empty', trigger: 'blur' }],
    password: [
      { required: true, message: 'User password cannot be empty', trigger: 'blur' },
      {
        min: 5,
        max: 20,
        message: 'User password length must be between 5 and 20',
        trigger: 'blur'
      },
      { pattern: /^[^<>"'|\\]+$/, message: 'cannot contain illegal characters: < > " \' \\ |', trigger: 'blur' }
    ],
    email: [
      {
        type: 'email',
        message: 'Please enter a valid email address',
        trigger: ['blur', 'change']
      }
    ],
    phonenumber: [
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: 'Please enter a valid mobile number',
        trigger: 'blur'
      }
    ],
    roleIds: [{ required: true, message: 'User role cannot be empty', trigger: 'blur' }]
  }
};
const data = reactive<PageData<UserForm, UserQuery>>(initData);

const { queryParams, form, rules } = toRefs<PageData<UserForm, UserQuery>>(data);

/** Filter nodes by condition  */
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};
/** Filter department tree by name */
watchEffect(
  () => {
    deptTreeRef.value?.filter(deptName.value);
  },
  {
    flush: 'post' // watchEffect triggers before DOM mount or update; this property makes it run after the DOM element is updated
  }
);

/** Query user list */
const getList = async () => {
  loading.value = true;
  const res = await api.listUser(proxy?.addDateRange(queryParams.value, dateRange.value));
  loading.value = false;
  userList.value = res.rows;
  total.value = res.total;
};

/** Query department dropdown tree structure */
const getDeptTree = async () => {
  const res = await api.deptTreeSelect();
  deptOptions.value = res.data;
  enabledDeptOptions.value = filterDisabledDept(res.data);
};

/** Filter disabled departments */
const filterDisabledDept = (deptList: DeptTreeVO[]) => {
  return deptList.filter((dept) => {
    if (dept.disabled) {
      return false;
    }
    if (dept.children && dept.children.length) {
      dept.children = filterDisabledDept(dept.children);
    }
    return true;
  });
};

/** Node click event */
const handleNodeClick = (data: DeptVO) => {
  queryParams.value.deptId = data.id;
  handleQuery();
};

/** Search button action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** Reset button action */
const resetQuery = () => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  queryParams.value.deptId = undefined;
  deptTreeRef.value?.setCurrentKey(undefined);
  handleQuery();
};

/** Delete button action */
const handleDelete = async (row?: UserVO) => {
  const userIds = row?.userId || ids.value;
  const [err] = await to(proxy?.$modal.confirm('Are you sure you want to delete the user with ID "' + userIds + '" items?') as any);
  if (!err) {
    await api.delUser(userIds);
    await getList();
    proxy?.$modal.msgSuccess('Deleted successfully');
  }
};

/** User status modification  */
const handleStatusChange = async (row: UserVO) => {
  const text = row.status === '0' ? 'Enable' : 'Disable';
  try {
    await proxy?.$modal.confirm('Confirm to "' + text + '""' + row.userName + '"User?');
    await api.changeUserStatus(row.userId, row.status);
    proxy?.$modal.msgSuccess(text + 'Success');
  } catch (err) {
    row.status = row.status === '0' ? '1' : '0';
  }
};
/** Go to role assignment */
const handleAuthRole = (row: UserVO) => {
  const userId = row.userId;
  router.push('/system/user-auth/role/' + userId);
};

/** Reset password button action */
const handleResetPwd = async (row: UserVO) => {
  const [err, res] = await to(
    ElMessageBox.prompt('Please enter "' + row.userName + '" new password', 'Notice', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      closeOnClickModal: false,
      inputPattern: /^.{5,20}$/,
      inputErrorMessage: 'User password length must be between 5 and 20',
      inputValidator: (value) => {
        if (/<|>|"|'|\||\\/.test(value)) {
          return 'cannot contain illegal characters: < > " \\\' \\\\ |';
        }
      }
    })
  );
  if (!err && res) {
    await api.resetUserPwd(row.userId, res.value);
    proxy?.$modal.msgSuccess('Modified successfully, the new password is:' + res.value);
  }
};

/** Number of selections */
const handleSelectionChange = (selection: UserVO[]) => {
  ids.value = selection.map((item) => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Import button action */
const handleImport = () => {
  upload.title = 'User Import';
  upload.open = true;
};
/** Export button action */
const handleExport = () => {
  proxy?.download(
    'system/user/export',
    {
      ...queryParams.value
    },
    `user_${new Date().getTime()}.xlsx`
  );
};
/** Download template action */
const importTemplate = () => {
  proxy?.download('system/user/importTemplate', {}, `user_template_${new Date().getTime()}.xlsx`);
};

/** Handling during file upload */
const handleFileUploadProgress = () => {
  upload.isUploading = true;
};
/** File upload success handler */
const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.open = false;
  upload.isUploading = false;
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>', 'Import Result', {
    dangerouslyUseHTMLString: true
  });
  getList();
};

/** Submit uploaded file */
function submitFileForm() {
  uploadRef.value?.submit();
}

/** Reset operation form */
const reset = () => {
  form.value = { ...initFormData };
  userFormRef.value?.resetFields();
};
/** Cancel button */
const cancel = () => {
  dialog.visible = false;
  reset();
};

/** Add button action */
const handleAdd = async () => {
  reset();
  const { data } = await api.getUser();
  dialog.visible = true;
  dialog.title = 'Add User';
  postOptions.value = data.posts;
  roleOptions.value = data.roles;
  form.value.password = initPassword.value.toString();
};

/** Edit button action */
const handleUpdate = async (row?: UserForm) => {
  reset();
  const userId = row?.userId || ids.value[0];
  const { data } = await api.getUser(userId);
  dialog.visible = true;
  dialog.title = 'Edit User';
  Object.assign(form.value, data.user);
  postOptions.value = data.posts;
  roleOptions.value = data.roles;
  form.value.postIds = data.postIds;
  form.value.roleIds = data.roleIds;
  form.value.password = '';
};

/** Submit button */
const submitForm = () => {
  userFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.userId ? await api.updateUser(form.value) : await api.addUser(form.value);
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/**
 * Close User Dialog
 */
const closeDialog = () => {
  dialog.visible = false;
  resetForm();
};

/**
 * Reset Form
 */
const resetForm = () => {
  userFormRef.value?.resetFields();
  userFormRef.value?.clearValidate();

  form.value.id = undefined;
  form.value.status = '1';
};
onMounted(() => {
  getDeptTree(); // Initialize department data
  getList(); // Initialize list data
  proxy?.getConfigKey('sys.user.initPassword').then((response) => {
    initPassword.value = response.data;
  });
});

async function handleDeptChange(value: number | string) {
  const response = await optionselect(value);
  postOptions.value = response.data;
  form.value.postIds = [];
}
</script>
