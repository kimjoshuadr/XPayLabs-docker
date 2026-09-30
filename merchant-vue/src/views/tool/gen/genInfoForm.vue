<template>
  <el-form ref="genInfoForm" :model="infoForm" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item prop="tplCategory">
          <template #label>Generate Template</template>
          <el-select v-model="infoForm.tplCategory" @change="tplSelectChange">
            <el-option label="Single Table (CRUD)" value="crud" />
            <el-option label="Tree Table (CRUD)" value="tree" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="packageName">
          <template #label>
            Generate Package Path
            <el-tooltip content="The java package to generate under, e.g. com.ruoyi.system" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="infoForm.packageName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="moduleName">
          <template #label>
            Generate Module Name
            <el-tooltip content="Can be understood as the subsystem name, e.g., system" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="infoForm.moduleName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="businessName">
          <template #label>
            Generate Business Name
            <el-tooltip content="Can be understood as the function's English name, e.g. user" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="infoForm.businessName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="functionName">
          <template #label>
            Generate Function Name
            <el-tooltip content="Used as the class description, e.g. User" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="infoForm.functionName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item>
          <template #label>
            Parent Menu
            <el-tooltip content="Assign to a specific menu, e.g. System Management" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-tree-select
            v-model="infoForm.parentMenuId"
            :data="menuOptions"
            :props="{ value: 'menuId', label: 'menuName', children: 'children' } as any"
            value-key="menuId"
            node-key="menuId"
            placeholder="Select parent menu"
            check-strictly
            filterable
            clearable
            highlight-current
          />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="genType">
          <template #label>
            Code Generation Method
            <el-tooltip content="Defaults to zip package download; a custom generation path can also be set" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-radio v-model="infoForm.genType" value="0">zip archive</el-radio>
          <el-radio v-model="infoForm.genType" value="1">Custom Path</el-radio>
        </el-form-item>
      </el-col>

      <el-col v-if="infoForm.genType == '1'" :span="24">
        <el-form-item prop="genPath">
          <template #label>
            Custom Path
            <el-tooltip content="Enter an absolute disk path; if left blank, it will be generated under the current Web project" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="infoForm.genPath">
            <template #append>
              <el-dropdown>
                <el-button type="primary">
                  Recent Paths Quick Select
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="infoForm.genPath = '/'">Restore default generation base path</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <template v-if="info.tplCategory == 'tree'">
      <h4 class="form-header">Other Information</h4>
      <el-row v-show="info.tplCategory == 'tree'">
        <el-col :span="12">
          <el-form-item>
            <template #label>
              Tree Code Field
              <el-tooltip content="Code field name displayed in the tree, e.g. dept_id" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="infoForm.treeCode" placeholder="Select">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + ': ' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              Tree Parent Code Field
              <el-tooltip content="Parent code field name displayed in the tree, e.g. parent_Id" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="infoForm.treeParentCode" placeholder="Select">
              <el-option
                v-for="(column, index) in infoForm.columns"
                :key="index"
                :label="column.columnName + ': ' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              Tree Name Field
              <el-tooltip content="Display name field of the tree node, e.g.: dept_name" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="infoForm.treeName" placeholder="Select">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + ': ' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <template v-if="info.tplCategory == 'sub'">
      <h4 class="form-header">Related Info</h4>
      <el-row>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              Associated Child Table Name
              <el-tooltip content="Name of the associated child table, e.g., sys_user" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="infoForm.subTableName" placeholder="Select" @change="subSelectChange">
              <el-option v-for="(t, index) in table" :key="index" :label="t.tableName + ': ' + t.tableComment" :value="t.tableName"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              Foreign key name associated with the child table
              <el-tooltip content="Foreign key name of the subtable, e.g. user_id" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="infoForm.subTableFkName" placeholder="Select">
              <el-option
                v-for="(column, index) in subColumns"
                :key="index"
                :label="column.columnName + ': ' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>
  </el-form>
</template>

<script setup lang="ts">
import { listMenu } from '@/api/system/menu';
import { propTypes } from '@/utils/propTypes';

interface MenuOptionsType {
  menuId: number | string;
  menuName: string;
  children?: MenuOptionsType[];
}
const { proxy } = getCurrentInstance();

const subColumns = ref<any>([]);
const menuOptions = ref<Array<MenuOptionsType>>([]);

const props = defineProps({
  info: propTypes.any.isRequired,
  tables: propTypes.any.isRequired
});

const infoForm = computed(() => props.info);

const table = computed(() => props.tables);

// Form validation
const rules = ref({
  tplCategory: [{ required: true, message: 'Please select generation template', trigger: 'blur' }],
  packageName: [{ required: true, message: 'Enter generated package path', trigger: 'blur' }],
  moduleName: [{ required: true, message: 'Please enter generated module name', trigger: 'blur' }],
  businessName: [{ required: true, message: 'Please enter generated business name', trigger: 'blur' }],
  functionName: [{ required: true, message: 'Please enter generated function name', trigger: 'blur' }]
});
const subSelectChange = () => {
  infoForm.value.subTableFkName = '';
};
const tplSelectChange = (value: string) => {
  if (value !== 'sub') {
    infoForm.value.subTableName = '';
    infoForm.value.subTableFkName = '';
  }
};
const setSubTableColumns = (value: string) => {
  table.value.forEach((item: any) => {
    const name = item.tableName;
    if (value === name) {
      subColumns.value = item.columns;
      return;
    }
  });
};

/** Query menu dropdown tree structure */
const getMenuTreeselect = async () => {
  const res = await listMenu();
  const data = proxy?.handleTree<MenuOptionsType>(res.data, 'menuId');

  if (data) {
    menuOptions.value = data;
  }
};

watch(
  () => props.info.subTableName,
  (val) => {
    setSubTableColumns(val);
  }
);

onMounted(() => {
  getMenuTreeselect();
});
</script>
