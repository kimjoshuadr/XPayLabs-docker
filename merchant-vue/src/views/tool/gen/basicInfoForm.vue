<template>
  <el-form ref="basicInfoForm" :model="infoForm" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="Table Name" prop="tableName">
          <el-input v-model="infoForm.tableName" placeholder="Enter repository name" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Table Description" prop="tableComment">
          <el-input v-model="infoForm.tableComment" placeholder="Please enter " />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Entity Class Name" prop="className">
          <el-input v-model="infoForm.className" placeholder="Please enter " />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Author" prop="functionAuthor">
          <el-input v-model="infoForm.functionAuthor" placeholder="Please enter " />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="infoForm.remark" type="textarea" :rows="3"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';

const prop = defineProps({
  info: propTypes.any.def({})
});

const infoForm = computed(() => prop.info);

// Form validation
const rules = ref({
  tableName: [{ required: true, message: 'Please enter the table name', trigger: 'blur' }],
  tableComment: [{ required: true, message: 'Enter table description', trigger: 'blur' }],
  className: [{ required: true, message: 'Please enter entity class name', trigger: 'blur' }],
  functionAuthor: [{ required: true, message: 'Please enter author', trigger: 'blur' }]
});
</script>
