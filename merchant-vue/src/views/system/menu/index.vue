<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Menu Name" prop="menuName">
              <el-input v-model="queryParams.menuName" placeholder="Enter menu name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Status" prop="status">
              <el-select v-model="queryParams.status" placeholder="Menu Status" clearable>
                <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
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
            <el-button v-hasPermi="['system:menu:add']" type="primary" plain icon="Plus" @click="handleAdd()">Add </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="handleToggleExpandAll">Expand/Collapse</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" @click="handleCascadeDelete" :loading="deleteLoading">Cascading Delete</el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table
        ref="menuTableRef"
        v-loading="loading"
        :data="menuList"
        row-key="menuId"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="isExpandAll"
      >
        <el-table-column prop="menuName" label="Menu Name" :show-overflow-tooltip="true" width="160"></el-table-column>
        <el-table-column prop="icon" label="Icon" align="center" width="100">
          <template #default="scope">
            <svg-icon :icon-class="scope.row.icon" />
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="Sort" width="60"></el-table-column>
        <el-table-column prop="perms" label="Permission Key" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="component" label="Component Path" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="status" label="Status" width="80">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="Created At" align="center" prop="createTime">
          <template #default="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Actions" width="180">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button v-hasPermi="['system:menu:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="Add" placement="top">
              <el-button v-hasPermi="['system:menu:add']" link type="primary" icon="Plus" @click="handleAdd(scope.row)" />
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button v-hasPermi="['system:menu:remove']" link type="primary" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" destroy-on-close append-to-bod width="750px">
      <el-form ref="menuFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="Parent Menu">
              <el-tree-select
                v-model="form.parentId"
                :data="menuOptions"
                :props="{ value: 'menuId', label: 'menuName', children: 'children' } as any"
                value-key="menuId"
                placeholder="Select parent menu"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Menu Type" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio value="M">Directory</el-radio>
                <el-radio value="C">Menu</el-radio>
                <el-radio value="F">Button</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'F'" :span="24">
            <el-form-item label="Menu Icon" prop="icon">
              <!-- Icon Picker -->
              <icon-select v-model="form.icon" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Menu Name" prop="menuName">
              <el-input v-model="form.menuName" placeholder="Enter menu name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Display Order" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'F'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="If external link is selected, the route address must start with `http(s)://`" placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon> </el-tooltip
                  >Is External Link
                </span>
              </template>
              <el-radio-group v-model="form.isFrame">
                <el-radio value="0">Yes</el-radio>
                <el-radio value="1">No</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'F'" :span="12">
            <el-form-item prop="path">
              <template #label>
                <span>
                  <el-tooltip content="Route address to access, e.g. `user`; for external addresses needing internal-link access, start with `http(s)://`" placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  Route Address
                </span>
              </template>
              <el-input v-model="form.path" placeholder="Please enter route address" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType === 'C'" :span="12">
            <el-form-item prop="component">
              <template #label>
                <span>
                  <el-tooltip content="Component path to access, e.g.: `system/user/index`, defaults under the `views` directory" placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  Component Path
                </span>
              </template>
              <el-input v-model="form.component" placeholder="Please enter component path" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'M'" :span="12">
            <el-form-item>
              <el-input v-model="form.perms" placeholder="Please enter permission identifier" maxlength="100" />
              <template #label>
                <span>
                  <el-tooltip content="Permission string defined in the controller, e.g., @SaCheckPermission('system:user:list')" placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  Permission String
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType === 'C'" :span="12">
            <el-form-item>
              <el-input v-model="form.queryParam" placeholder="Please enter route parameters" maxlength="255" />
              <template #label>
                <span>
                  <el-tooltip content='Default parameters passed when accessing the route, e.g.: `{"id": 1, "name": "ry"}`' placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  Route Parameters
                </span>
              </template>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType === 'C'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="If selected, it will be cached by `keep-alive`; the component's `name` must match the address" placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  Cache
                </span>
              </template>
              <el-radio-group v-model="form.isCache">
                <el-radio value="0">Cache</el-radio>
                <el-radio value="1">No Cache</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.menuType !== 'F'" :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="If hidden, the route will not appear in the sidebar but can still be accessed" placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  Display Status
                </span>
              </template>
              <el-radio-group v-model="form.visible">
                <el-radio v-for="dict in sys_show_hide" :key="dict.value" :value="dict.value">{{ dict.label }} </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip content="If disabled, the route will not appear in the sidebar and cannot be accessed" placement="top">
                    <el-icon>
                      <question-filled />
                    </el-icon>
                  </el-tooltip>
                  Menu Status
                </span>
              </template>
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">Confirm</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="deleteDialog.visible" :title="deleteDialog.title" destroy-on-close append-to-bod width="750px">
      <el-tree
        ref="menuTreeRef"
        class="tree-border"
        :data="menuOptions"
        show-checkbox
        node-key="menuId"
        :check-strictly="false"
        empty-text="Loading, please wait"
        :default-expanded-keys="[0]"
        :props="{ value: 'menuId', label: 'menuName', children: 'children' } as any"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitDeleteForm" :loading="deleteLoading">Confirm</el-button>
          <el-button @click="cancelCascade">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Menu" lang="ts">
import { addMenu, cascadeDelMenu, delMenu, getMenu, listMenu, updateMenu } from '@/api/system/menu';
import { MenuForm, MenuQuery, MenuVO } from '@/api/system/menu/types';
import { MenuTypeEnum } from '@/enums/MenuTypeEnum';

interface MenuOptionsType {
  menuId: number;
  menuName: string;
  children: MenuOptionsType[] | undefined;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_show_hide, sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_show_hide', 'sys_normal_disable'));

const menuList = ref<MenuVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const menuOptions = ref<MenuOptionsType[]>([]);
const isExpandAll = ref(false);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryFormRef = ref<ElFormInstance>();
const menuFormRef = ref<ElFormInstance>();
const initFormData = {
  path: '',
  menuId: undefined,
  parentId: 0,
  menuName: '',
  icon: '',
  menuType: MenuTypeEnum.M,
  orderNum: 1,
  isFrame: '1',
  isCache: '0',
  visible: '0',
  status: '0'
};
const data = reactive<PageData<MenuForm, MenuQuery>>({
  form: { ...initFormData },
  queryParams: {
    menuName: undefined,
    status: undefined
  },
  rules: {
    menuName: [{ required: true, message: 'Menu name cannot be empty', trigger: 'blur' }],
    orderNum: [{ required: true, message: 'Menu order cannot be empty', trigger: 'blur' }],
    path: [{ required: true, message: 'Route address cannot be empty', trigger: 'blur' }]
  }
});

const menuTableRef = ref<ElTableInstance>();

const { queryParams, form, rules } = toRefs<PageData<MenuForm, MenuQuery>>(data);
/** Query menu list */
const getList = async () => {
  loading.value = true;
  const res = await listMenu(queryParams.value);
  const data = proxy?.handleTree<MenuVO>(res.data, 'menuId');
  if (data) {
    menuList.value = data;
  }
  loading.value = false;
};
/** Query menu dropdown tree structure */
const getTreeselect = async () => {
  menuOptions.value = [];
  const response = await listMenu();
  const menu: MenuOptionsType = { menuId: 0, menuName: 'Main Category', children: [] };
  menu.children = proxy?.handleTree<MenuOptionsType>(response.data, 'menuId');
  menuOptions.value.push(menu);
};
/** Cancel button */
const cancel = () => {
  reset();
  dialog.visible = false;
};
/** Form reset */
const reset = () => {
  form.value = { ...initFormData };
  menuFormRef.value?.resetFields();
};

/** Search button action */
const handleQuery = () => {
  getList();
};
/** Reset button action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};
/** Add button action */
const handleAdd = (row?: MenuVO) => {
  reset();
  getTreeselect();
  row && row.menuId ? (form.value.parentId = row.menuId) : (form.value.parentId = 0);
  dialog.visible = true;
  dialog.title = 'Add Menu';
};
/** Expand/Collapse action */
const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(menuList.value, isExpandAll.value);
};
/** Expand/Collapse All */
const toggleExpandAll = (data: MenuVO[], status: boolean) => {
  data.forEach((item: MenuVO) => {
    menuTableRef.value?.toggleRowExpansion(item, status);
    if (item.children && item.children.length > 0) toggleExpandAll(item.children, status);
  });
};
/** Edit button action */
const handleUpdate = async (row: MenuVO) => {
  reset();
  await getTreeselect();
  if (row.menuId) {
    const { data } = await getMenu(row.menuId);
    form.value = data;
  }
  dialog.visible = true;
  dialog.title = 'Edit Menu';
};
/** Submit button */
const submitForm = () => {
  menuFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      form.value.menuId ? await updateMenu(form.value) : await addMenu(form.value);
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};
/** Delete button action */
const handleDelete = async (row: MenuVO) => {
  await proxy?.$modal.confirm('Are you sure you want to delete the item named "' + row.menuName + '" data item?');
  await delMenu(row.menuId);
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
};

const deleteLoading = ref<boolean>(false);
const menuTreeRef = ref<ElTreeInstance>();

const deleteDialog = reactive<DialogOption>({
  visible: false,
  title: 'Cascade Delete Menu'
});

/** Cascade delete button action */
const handleCascadeDelete = () => {
  menuTreeRef.value?.setCheckedKeys([]);
  getTreeselect();
  deleteDialog.visible = true;
};

/** Cancel button */
const cancelCascade = () => {
  menuTreeRef.value?.setCheckedKeys([]);
  deleteDialog.visible = false;
};

/** Delete submit button */
const submitDeleteForm = async () => {
  const menuIds = menuTreeRef.value?.getCheckedKeys();
  if (menuIds.length < 0) {
    proxy?.$modal.msgWarning('Please select menus to delete');
    return;
  }

  deleteLoading.value = true;
  await cascadeDelMenu(menuIds).finally(() => (deleteLoading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('Deleted successfully');
  deleteDialog.visible = false;
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.tree-border {
  height: 300px;
  overflow: auto;
}
</style>
