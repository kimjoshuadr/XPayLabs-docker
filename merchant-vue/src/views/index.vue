<template>
  <div>
    <el-dialog v-model="googleBindingVisible" title="Bind Google Authenticator" width="500px" :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="google-auth-setup">
        <el-steps :active="step" finish-status="success" simple style="width: 100%">
          <el-step title="Download" />
          <el-step title="Scan QR Code" />
          <el-step title="Verify" />
        </el-steps>

        <div v-if="step === 0" class="step-content">
          <div class="step-title">Step 1: Download Google Authenticator app</div>
          <p>Please download and install the Google Authenticator app on your mobile device:</p>
          <div class="app-links">
            <el-link href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" type="primary">
              <el-icon><Download /></el-icon> Android - Google Play
            </el-link>
            <el-link href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank" type="primary">
              <el-icon><Download /></el-icon> Apple - App Store
            </el-link>
          </div>
          <div class="step-actions">
            <el-button type="primary" @click="step = 1">Next Step</el-button>
          </div>
        </div>

        <div v-if="step === 1" class="step-content">
          <div class="step-title">Step 2: Scan QR Code</div>
          <p>Open the Google Authenticator app and scan this QR code:</p>
          <div class="qrcode-container">
            <QrcodeVue :value="qrCodeUrl" :size="200" level="H" class="qrcode-image" />
          </div>
          <div class="secret-key">
            <p>Enter the key manually:</p>
            <el-tag size="large">{{ secretKey }}</el-tag>
            <el-button link type="primary" size="small" @click="copyText(secretKey)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
          <div class="step-actions">
            <el-button @click="step = 0">Back</el-button>
            <el-button type="primary" @click="step = 2">Next Step</el-button>
          </div>
        </div>

        <div v-if="step === 2" class="step-content">
          <div class="step-title">Step 3: Verification Code Confirmation</div>
          <p>Enter the 6-digit code from your Google Authenticator app:</p>
          <el-form ref="formRef" :model="form" :rules="rules">
            <el-form-item prop="code">
              <el-input v-model="form.code" placeholder="Please enter the 6-digit verification code" maxlength="6" />
            </el-form-item>
            <div class="step-actions">
              <el-button @click="step = 1">Back</el-button>
              <el-button type="primary" @click="handleBind">Binding Complete</el-button>
            </div>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Download, CopyDocument } from '@element-plus/icons-vue';
import QrcodeVue from 'qrcode.vue';
import { bind2fa, verify2fa, merchantInfo } from '@/api/xpay/merchant';
import { verify2faLogin } from '@/api/login';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();

const googleBindingVisible = ref(false);
const step = ref(0);
const secretKey = ref('');
const qrCodeUrl = ref('');
const formRef = ref<ElFormInstance>();
const form = ref({ code: '' });
const rules: ElFormRules = {
  code: [
    { required: true, message: 'Please enter verification code', trigger: 'blur' },
    { min: 6, max: 6, message: 'Verification code must be 6 digits', trigger: 'blur' },
    { pattern: /^[0-9]{6}$/, message: 'Verification code can only contain digits', trigger: 'blur' }
  ]
};

const copyText = (text: string) => {
  navigator.clipboard.writeText(text);
  ElMessage.success('Copied');
};

const handleBind = async () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return;
    const { data } = await verify2fa({ code: Number(form.value.code) });
    if (data.verify) {
      await verify2faLogin({ code: Number(form.value.code) });
      googleBindingVisible.value = false;
      ElMessage.success('Google Authenticator bound successfully');
    } else {
      ElMessage.error('Invalid Google verification code');
    }
  });
};

onMounted(async () => {
  const isAdmin = userStore.roles.includes('superadmin');
  if (!isAdmin) return;
  const { data } = await merchantInfo();
  if (data.googleStatus === 'UNBOUND') {
    googleBindingVisible.value = true;
    const res = await bind2fa();
    secretKey.value = res.data.secretKey;
    qrCodeUrl.value = res.data.qrCodeUrl;
  }
});
</script>

<style scoped>
.google-auth-setup {
  padding: 10px 0;
}
.step-content {
  margin-top: 20px;
}
.step-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}
.app-links {
  display: flex;
  gap: 20px;
  margin: 15px 0;
}
.qrcode-container {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}
.secret-key {
  text-align: center;
  margin: 15px 0;
}
.step-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}
</style>
