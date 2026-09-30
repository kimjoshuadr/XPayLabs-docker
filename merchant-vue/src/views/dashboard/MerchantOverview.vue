<template>
  <div v-if="isMerchant" class="merchant-dashboard">
    <!-- Google Authenticator Binding Dialog -->
    <el-dialog v-model="googleBindingDialogVisible" title="Bind Google Authenticator" width="500px" :close-on-click-modal="false"
      :close-on-press-escape="false" :show-close="true">
      <div class="google-auth-setup">
        <el-steps :active="googleBindingStep" finish-status="success" simple style="width: 100%">
          <el-step title="Download" />
          <el-step title="Scan QR Code" />
          <el-step title="Verify" />
        </el-steps>

        <div v-if="googleBindingStep === 0" class="step-content">
          <div class="step-title">Step 1: Download Google Authenticator app</div>
          <p>Please download and install the Google Authenticator app on your mobile device:</p>
          <div class="app-links">
            <el-link href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
              target="_blank" type="primary">
              <el-icon>
                <Download />
              </el-icon> Android - Google Play
            </el-link>
            <el-link href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank"
              type="primary">
              <el-icon>
                <Download />
              </el-icon> Apple - App Store
            </el-link>
          </div>
          <div class="step-actions">
            <el-button type="primary" @click="googleBindingStep = 1">Next Step</el-button>
          </div>
        </div>

        <div v-if="googleBindingStep === 1" class="step-content">
          <div class="step-title">Step 2: Scan QR Code</div>
          <p>Open the Google Authenticator app and scan this QR code:</p>
          <div class="qrcode-container">
            <qrcode-vue :value="googleAuthSecret" :size="200" level="H" class="qrcode-image" />
          </div>
          <div class="secret-key">
            <p>Enter the key manually:</p>
            <el-tag size="large">{{ googleAuthSecretKey }}</el-tag>
            <el-button link type="primary" size="small" @click="copyText(googleAuthSecretKey)">
              <el-icon>
                <CopyDocument />
              </el-icon>
            </el-button>
          </div>
          <div class="step-actions">
            <el-button @click="googleBindingStep = 0">Back</el-button>
            <el-button type="primary" @click="googleBindingStep = 2">Next Step</el-button>
          </div>
        </div>

        <div v-if="googleBindingStep === 2" class="step-content">
          <div class="step-title">Step 3: Verification Code Confirmation</div>
          <p>Enter the 6-digit code from your Google Authenticator app:</p>
          <el-form :model="googleBindingForm" :rules="googleBindingRules" ref="googleBindingFormRef">
            <el-form-item prop="verificationCode">
              <el-input v-model="googleBindingForm.verificationCode" placeholder="Please enter the 6-digit verification code" maxlength="6"
                class="verification-input" />
            </el-form-item>
            <div class="step-actions">
              <el-button @click="googleBindingStep = 1">Back</el-button>
              <el-button type="primary" @click="verifyAndBindGoogleAuth">Binding Complete</el-button>
            </div>
          </el-form>
        </div>
      </div>
    </el-dialog>
    <!-- Merchant Balance Card -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="balance-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3><el-icon>
                  <Money />
                </el-icon> Merchant Balance</h3>
            </div>
          </template>

          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="asset in assetsData" :key="asset.symbol">
              <div class="asset-section">
                <div class="asset-title">{{ asset.symbol }}</div>
                <div class="balance-amount">
                  <span class="label">Valid Balance:</span>
                  <span class="amount">{{ asset.balance }}</span>
                </div>
                <div class="balance-amount">
                  <span class="label">Frozen Balance:</span>
                  <span class="amount">{{ asset.frozenBalance }}</span>
                </div>
                <div class="balance-amount">
                  <span class="label">Total Balance:</span>
                  <span class="amount">{{ asset.totalBalance }}</span>
                </div>
              </div>
            </el-col>
          </el-row>

          <div class="balance-actions mt-20">
            <el-button type="info" @click="openEditColdWalletDialog">Edit Cold Wallet Address</el-button>
            <el-button type="primary" @click="openRechargeDialog">Recharge</el-button>
            <el-button type="warning" @click="openWithdrawDialog">Withdrawal</el-button>
            <el-button type="success" @click="openUserRechargeTestDialog">User Recharge Test</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- API Info and Data Overview -->
    <el-row :gutter="20" class="mt-20">
      <!-- API info card -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="api-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3><el-icon>
                  <Connection />
                </el-icon> API Information</h3>
            </div>
          </template>
          <div class="api-info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="Token">
                <div class="api-value-container">
                  <el-tag size="small" v-if="apiInfo.tokenVisible">{{ apiInfo.token }}</el-tag>
                  <el-tag size="small" v-else>****************</el-tag>
                  <div class="api-actions">
                    <el-button link type="primary" size="small" @click="showApiValue('token')"
                      v-if="!apiInfo.tokenVisible">
                      <el-icon>
                        <View />
                      </el-icon>
                    </el-button>
                    <el-button link type="primary" size="small" @click="hideApiValue('token')" v-else>
                      <el-icon>
                        <Hide />
                      </el-icon>
                    </el-button>
                    <el-button link type="primary" size="small" @click="copyText(apiInfo.token)"
                      v-if="apiInfo.tokenVisible">
                      <el-icon>
                        <CopyDocument />
                      </el-icon>
                    </el-button>
                  </div>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="Secret">
                <div class="api-value-container">
                  <div v-if="apiInfo.secretVisible" style="word-break: break-all;">
                    <el-tag size="small"
                      style="max-width: 100%; white-space: normal; height: auto; line-height: 1.5; padding: 5px;">{{
                        apiInfo.secret }}</el-tag>
                  </div>
                  <el-tag size="small" v-else>****************</el-tag>
                  <div class="api-actions">
                    <el-button link type="primary" size="small" @click="showApiValue('secret')"
                      v-if="!apiInfo.secretVisible">
                      <el-icon>
                        <View />
                      </el-icon>
                    </el-button>
                    <el-button link type="primary" size="small" @click="hideApiValue('secret')" v-else>
                      <el-icon>
                        <Hide />
                      </el-icon>
                    </el-button>
                    <el-button link type="primary" size="small" @click="copyText(apiInfo.secret)"
                      v-if="apiInfo.secretVisible">
                      <el-icon>
                        <CopyDocument />
                      </el-icon>
                    </el-button>
                  </div>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="Callback Address">
                <div class="api-value-container">
                  <el-tag size="small">{{ apiInfo.callbackUrl }}</el-tag>
                  <div class="api-actions">
                    <el-button link type="primary" size="small" @click="editCallbackUrl">
                      <el-icon>
                        <Edit />
                      </el-icon>
                    </el-button>
                    <el-button link type="primary" size="small" @click="copyText(apiInfo.callbackUrl)">
                      <el-icon>
                        <CopyDocument />
                      </el-icon>
                    </el-button>
                  </div>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="IP Whitelist">
                <div class="ip-whitelist-container">
                  <div class="ip-whitelist-tags">
                    <el-tag v-for="(ip, index) in apiInfo.ipWhitelist" :key="index" class="ip-tag">
                      {{ ip }}
                    </el-tag>
                    <el-button class="add-ip-button" type="primary" size="small" @click="openAddIpDialog">
                      <el-icon>
                        <Plus />
                      </el-icon>
                    </el-button>
                  </div>
                  <div class="ip-whitelist-info">
                    <small>Up to 10 IP addresses can be added; currently {{ apiInfo.ipWhitelist.length }} added</small>
                    <small>(For multiple IP addresses, enter one per line)</small>
                  </div>
                </div>
              </el-descriptions-item>
            </el-descriptions>
            <div class="api-doc-link">
              <!-- <el-link type="primary" href="https://vtqvpkz5zj.apifox.cn" target="_blank"> -->
              <el-link type="primary" href="https://docs.xpaylabs.com" target="_blank">
                <el-icon>
                  <Document />
                </el-icon> API Integration Docs
              </el-link>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>



    <!-- Recharge Dialog -->
    <el-dialog v-model="rechargeDialogVisible" title="Recharge" width="500px" destroy-on-close>
      <el-form :model="rechargeForm" label-width="120px">
        <el-form-item label="Currency">
          <el-select v-model="rechargeForm.currency" placeholder="Please select currency">
            <el-option v-for="currency in getCurrencyOptions()" :key="currency.value" :label="currency.label"
              :value="currency.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Chain" v-if="getChainOptionsBySymbol(rechargeForm.currency).length >= 1">
          <el-select v-model="rechargeForm.chain" placeholder="Select Chain">
            <el-option v-for="chain in getChainOptionsBySymbol(rechargeForm.currency)" :key="chain.value"
              :label="chain.label" :value="chain.value" />
          </el-select>
        </el-form-item>
        <el-divider />
        <div class="recharge-address-info">
          <p class="address-label">Recharge Address:</p>
          <div class="address-value">
            <el-input :value="getRechargeAddress()" readonly>
              <template #append>
                <el-button @click="copyText(getRechargeAddress())">
                  <el-icon>
                    <CopyDocument />
                  </el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
          <div class="qrcode-container">
            <qrcode-vue :value="getRechargeAddress()" :size="200" level="H" class="qrcode-image" />
          </div>
          <el-alert title="Recharge Notice" type="warning" description="Please transfer via a legitimate channel. The recharge will be credited after block confirmation, which usually takes 10-30 minutes." show-icon
            :closable="false" />
        </div>
      </el-form>
    </el-dialog>

    <!-- Withdrawal Dialog -->
    <el-dialog v-model="withdrawDialogVisible" title="Withdrawal" width="560px" destroy-on-close>
      <el-form :model="withdrawForm" :rules="withdrawRules" ref="withdrawFormRef" label-width="100px">
        <el-form-item label="Currency" prop="currency">
          <el-select v-model="withdrawForm.currency" placeholder="Please select currency">
            <el-option v-for="currency in getCurrencyOptions()" :key="currency.value" :label="currency.label"
              :value="currency.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Chain" prop="chain" v-if="getChainOptionsBySymbol(withdrawForm.currency).length >= 1">
          <el-select v-model="withdrawForm.chain" placeholder="Select Chain">
            <el-option v-for="chain in getChainOptionsBySymbol(withdrawForm.currency)" :key="chain.value"
              :label="chain.label" :value="chain.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Withdrawal Address" prop="address">
          <el-input v-model="withdrawForm.address" placeholder="Cold wallet address is used by default and can be modified">
            <template #append>
              <el-button @click="copyText(withdrawForm.address)">
                <el-icon>
                  <CopyDocument />
                </el-icon>
              </el-button>
            </template>
          </el-input>
          <div class="form-tip">Uses the cold wallet address of the corresponding chain by default; you may modify it</div>
        </el-form-item>
        <el-form-item label="Withdrawal Quantity" prop="amount">
          <el-input-number v-model="withdrawForm.amount" :min="getMinWithdrawAmount()"
            :max="maxWithdrawAmount > getMinWithdrawAmount() ? maxWithdrawAmount : getMinWithdrawAmount()"
            :precision="withdrawForm.currency === 'USDT' || withdrawForm.currency === 'TRX' ? 2 : 4"
            style="width: 100%" />
          <div class="form-tip">
            <div>
              Minimum withdrawal amount: {{ getMinWithdrawAmount() }} {{ withdrawForm.currency }}
            </div>
            <div>
              Max Withdrawable: <span id="maxWithdrawAmount">{{ truncateDecimal(maxWithdrawAmount, withdrawForm.currency === 'USDT'
                ||
                withdrawForm.currency === 'TRX' ? 2 : 4) }}</span>
              {{ withdrawForm.currency }}
              <el-tooltip content="Gas fee and platform fee deducted" placement="top">
                <el-icon class="info-icon">
                  <InfoFilled />
                </el-icon>
              </el-tooltip>
            </div>
            <div>
              Withdrawal fee: {{ merchant?.feeRatio || 0.5 }}%
            </div>
          </div>
        </el-form-item>
        <el-form-item label="Google Verification Code" prop="googleCode">
          <el-input v-model="withdrawForm.googleCode" placeholder="Enter the Google verification code" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitWithdraw">Submit</el-button>
          <el-button @click="withdrawDialogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- Google Verification Code Dialog -->
    <el-dialog v-model="googleVerifyDialogVisible" title="Google Verification" width="400px" destroy-on-close>
      <el-form :model="googleVerifyForm" :rules="googleVerifyRules" ref="googleVerifyFormRef" label-width="100px">
        <el-form-item label="Google Verification Code" prop="code">
          <el-input v-model="googleVerifyForm.code" placeholder="Enter the Google verification code" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitGoogleVerify">Confirm</el-button>
          <el-button @click="googleVerifyDialogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- Edit Callback Address Dialog -->
    <el-dialog v-model="editCallbackDialogVisible" title="Edit Callback Address" width="500px" destroy-on-close>
      <el-form :model="editCallbackForm" :rules="editCallbackRules" ref="editCallbackFormRef" label-width="100px">
        <el-form-item label="Callback Address" prop="url">
          <el-input v-model="editCallbackForm.url" placeholder="Please enter new callback address" />
        </el-form-item>
        <el-form-item label="Google Verification Code" prop="googleCode">
          <el-input v-model="editCallbackForm.googleCode" placeholder="Enter the Google verification code" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitEditCallback">Confirm Edit</el-button>
          <el-button @click="editCallbackDialogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- User Recharge Test Dialog -->
    <el-dialog v-model="userRechargeTestDialogVisible" title="User Recharge Test" width="500px" destroy-on-close>
      <el-form :model="userRechargeTestForm" label-width="120px">
        <el-form-item label="Currency">
          <el-select v-model="userRechargeTestForm.currency" placeholder="Please select currency">
            <el-option v-for="currency in getCurrencyOptions()" :key="currency.value" :label="currency.label"
              :value="currency.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Chain" v-if="getChainOptionsBySymbol(userRechargeTestForm.currency).length >= 1">
          <el-select v-model="userRechargeTestForm.chain" placeholder="Select Chain">
            <el-option v-for="chain in getChainOptionsBySymbol(userRechargeTestForm.currency)" :key="chain.value"
              :label="chain.label" :value="chain.value" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="User ID" prop="uid">
          <el-input 
            v-model="userRechargeTestForm.uid" 
            placeholder="Please enter user ID (optional)"
            style="width: 100%"
          />
        </el-form-item> -->
        <el-form-item label="Recharge Amount">
          <el-input-number v-model="userRechargeTestForm.amount" :min="0.001"
            :precision="userRechargeTestForm.currency === 'USDT' || userRechargeTestForm.currency === 'TRX' ? 2 : 4"
            style="width: 100%" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="goToUserRechargeTest">Confirm</el-button>
          <el-button @click="userRechargeTestDialogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- Edit Cold Wallet Address Dialog -->
    <el-dialog v-model="editColdWalletDialogVisible" title="Edit Cold Wallet Address" width="500px" destroy-on-close>
      <el-form :model="editColdWalletForm" :rules="editColdWalletRules" ref="editColdWalletFormRef" label-width="100px">
        <el-form-item label="Chain" prop="chain">
          <el-select v-model="editColdWalletForm.chain" placeholder="Select Chain">
            <el-option v-for="chain in getChainOptions()" :key="chain.value" :label="chain.label"
              :value="chain.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Current Address">
          <el-input :value="getCurrentColdAddress()" readonly />
        </el-form-item>
        <el-form-item label="New Address" prop="address">
          <el-input v-model="editColdWalletForm.address" placeholder="Please enter the new cold wallet address" />
        </el-form-item>
        <el-form-item label="Google Verification Code" prop="code">
          <el-input v-model="editColdWalletForm.code" placeholder="Enter the Google verification code" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitEditColdWallet">Confirm Edit</el-button>
          <el-button @click="editColdWalletDialogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>


    <!-- IP Whitelist Dialog -->
    <el-dialog v-model="addIpDialogVisible" title="Add IP Whitelist" width="500px" destroy-on-close>
      <el-form :model="addIpForm" :rules="addIpRules" ref="addIpFormRef" label-width="100px">
        <el-form-item label="IP Address" prop="ipList">
          <el-input v-model="addIpForm.ipList" type="textarea" :rows="5" placeholder="Please enter IP addresses, one per line" />
          <div class="ip-input-tip">
            <small>You can add up to 10 IP addresses; currently {{ apiInfo.ipWhitelist.length }} added, {{ 10 - apiInfo.ipWhitelist.length }} more can be added
              items</small>
          </div>
        </el-form-item>
        <el-form-item label="Google Verification Code" prop="googleCode">
          <el-input v-model="addIpForm.googleCode" placeholder="Enter the Google verification code" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitAddIp">Confirm Add</el-button>
          <el-button @click="addIpDialogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Money, Connection, Document, CopyDocument, DataAnalysis, Histogram, View, Hide, Edit, Download, InfoFilled, Plus } from '@element-plus/icons-vue';
import QrcodeVue from 'qrcode.vue';
import { bind2fa, verify2fa, merchantInfo, merchantApiKey, withdrawal, updateCallbackUrl, setWhitelistIp, updateColdAddress, assetTypeList } from '@/api/xpay/merchant';
import { merchantAssets } from '@/api/xpay/merchantAssets';
import { myAddressList } from '@/api/xpay/merchantAddress';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
// import { Google2fa, Verify2faForm, Verify2faSuccess } from '@/api/xpay/merchant/types';

export default {
  components: {
    Money,
    Connection,
    Document,
    CopyDocument,
    DataAnalysis,
    Histogram,
    View,
    Hide,
    Edit,
    Download,
    InfoFilled,
    QrcodeVue
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const isMerchant = ref(false);
    const merchant = ref({});

    const truncateDecimal = (num, digits) => {
      const factor = 10 ** digits;
      return Math.trunc(num * factor) / factor;
    }

    // Asset data
    const assetsData = ref([{ symbol: 'USDT', balance: 0, frozenBalance: 0, totalBalance: 0 }]);

    // Address data
    const addressData = ref([]);
    // Asset type data
    const assetTypeData = ref([]);

    // Load merchant assets
    const loadMerchantAssets = async () => {
      try {
        const { data } = await merchantAssets();
        assetsData.value = data || [];
      } catch (error) {
        console.error('Failed to get merchant assets:', error);
        ElMessage({
          message: 'Failed to get merchant assets. Please refresh the page and try again',
          type: 'error'
        });
      }
    };

    // Load merchant addresses
    const loadMerchantAddress = async () => {
      try {
        const { data } = await myAddressList();
        addressData.value = data || [];
      } catch (error) {
        console.error('Failed to get merchant address:', error);
        ElMessage({
          message: 'Failed to get merchant address, please refresh the page and try again',
          type: 'error'
        });
      }
    };

    // Load asset type list
    const loadAssetTypeList = async () => {
      const { data } = await assetTypeList();
      assetTypeData.value = data || [];

    };

    // Check whether the user is a merchant
    const checkIsMerchant = async () => {
      // Check whether the user role includes the merchant role
      const userRoles = userStore.roles;
      if (userRoles.includes('merchant')) {
        isMerchant.value = true;

        const { data } = await merchantInfo();
        merchant.value = data
        apiInfo.callbackUrl = data.callbackUrl;
        apiInfo.ipWhitelist = data.whiteListIp.split(',');

        // Only execute these methods when the user is a merchant
        checkGoogleAuthBinding();
        loadMerchantAssets();
        loadMerchantAddress();
        loadAssetTypeList();

        // Set assets to auto-refresh once per minute
        // refreshTimer = setInterval(() => {
        //   console.log('Automatically refreshing merchant assets and addresses...');
        //   loadMerchantAssets();
        //   loadMerchantAddress();
        // }, 60000 * 5); // 60000 ms = 1 minute
      } else {
        // If not a merchant, redirect to another page
        // ElMessage({
        //   message: 'You are not a merchant and cannot access the merchant portal',
        //   type: 'warning'
        // });
        // router.push('/dashboard');
      }
    };

    // Google Authenticator binding status
    const isGoogleAuthBound = ref(false);
    const googleBindingDialogVisible = ref(false);
    const googleBindingStep = ref(0);
    const googleBindingFormRef = ref(null);
    const googleAuthSecretKey = ref(''); // Example secret key, should be generated on server
    const googleAuthSecret = ref('');

    const googleBindingForm = reactive({
      verificationCode: ''
    });

    const googleBindingRules = {
      verificationCode: [
        { required: true, message: 'Please enter verification code', trigger: 'blur' },
        { min: 6, max: 6, message: 'Verification code must be 6 digits', trigger: 'blur' },
        { pattern: /^[0-9]{6}$/, message: 'Verification code can only contain digits', trigger: 'blur' }
      ]
    };


    // Auto-refresh timer
    let refreshTimer = null;





    // Check whether Google Authenticator is bound
    const checkGoogleAuthBinding = async () => {
      isGoogleAuthBound.value = merchant.value.googleStatus === 'UNBOUND' ? false : true;

      if (!isGoogleAuthBound.value) {
        googleBindingDialogVisible.value = true;
        const { data: { secretKey, qrCodeUrl } } = await bind2fa();
        googleAuthSecretKey.value = secretKey;
        googleAuthSecret.value = qrCodeUrl;
      }

    };

    // Verify and bind Google Authenticator
    const verifyAndBindGoogleAuth = async () => {
      if (!googleBindingFormRef.value) return;

      googleBindingFormRef.value.validate(async (valid) => {
        if (valid) {
          const { data: { verify } } = await verify2fa({ code: googleBindingForm.verificationCode });
          if (verify) {
            isGoogleAuthBound.value = true;
            googleBindingDialogVisible.value = false;

            ElMessage({
              message: 'Google Authenticator bound successfully',
              type: 'success'
            });
          } else {
            ElMessage({
              message: 'Invalid Google verification code',
              type: 'error'
            });
          }

        }
      });
    };
    // Check whether the user is a merchant on page load
    onMounted(async () => {
      checkIsMerchant();
    });

    // Clear timer when component is unmounted
    onUnmounted(() => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
    });

    // API Information
    const apiInfo = reactive({
      token: '',
      secret: '',
      callbackUrl: 'https://your-callback-url.com',
      tokenVisible: false,
      secretVisible: false,
      ipWhitelist: []
    });

    // Get currency options from assetTypeData
    const getCurrencyOptions = () => {
      if (!assetTypeData.value || assetTypeData.value.length === 0) {
        return [];
      }

      // Get all currencies with duplicates removed
      const symbols = [...new Set(assetTypeData.value.map(item => item.symbol))];
      return symbols.map(symbol => ({ label: symbol, value: symbol }));
    };

    // Get all unique chain options from assetTypeData
    const getChainOptions = () => {
      if (!assetTypeData.value || assetTypeData.value.length === 0) {
        return [];
      }

      // Deduplicate to get all chains
      const chains = [...new Set(assetTypeData.value.map(item => item.chain))];
      return chains.map(chain => ({ label: chain, value: chain }));
    };

    // Get the corresponding chain options based on the selected currency
    const getChainOptionsBySymbol = (symbol) => {
      if (!assetTypeData.value || assetTypeData.value.length === 0 || !symbol) {
        return [];
      }

      // Get all chains corresponding to this currency
      const chains = assetTypeData.value
        .filter(item => item.symbol === symbol)
        .map(item => item.chain);

      // Deduplicate and convert to option format
      const uniqueChains = [...new Set(chains)];
      return uniqueChains.map(chain => ({ label: chain, value: chain }));
    };

    // Determine network type (mainnet or testnet) by chain name
    const getNetworkType = (chain) => {
      if (!chain) return 'MAIN'; // Defaults to mainnet

      // Find the chain network type from assetTypeData
      const chainData = assetTypeData.value.find(item => item.chain === chain);
      if (chainData) {
        return chainData.network || 'MAIN';
      }

      // If not found in data, determine by chain name
      const testNetKeywords = ['TEST', 'SEPOLIA', 'AMOY', 'FUJI'];
      const isTestNet = testNetKeywords.some(keyword =>
        chain.toUpperCase().includes(keyword)
      );

      return isTestNet ? 'TEST' : 'MAIN';
    };

    // Recharge dialog
    const rechargeDialogVisible = ref(false);
    const rechargeForm = reactive({
      currency: 'USDT',
      chain: 'TRON'
    });

    // Withdrawal dialog
    const withdrawDialogVisible = ref(false);
    const withdrawFormRef = ref(null);
    const withdrawForm = reactive({
      currency: 'USDT',
      chain: 'TRON',
      address: '',
      amount: 0,
      googleCode: ''
    });

    // Withdrawal form validation rules
    const withdrawRules = {
      currency: [{ required: true, message: 'Please select currency', trigger: 'change' }],
      chain: [{ required: true, message: 'Select Chain', trigger: 'change' }],
      address: [{ required: true, message: 'Please enter withdrawal address', trigger: 'blur' }],
      amount: [
        { required: true, message: 'Please enter withdrawal amount', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            const minAmount = getMinWithdrawAmount();
            if (value < minAmount) {
              callback(new Error(`Withdrawal amount cannot be less than ${minAmount}`));
            } else if (value > maxWithdrawAmount.value) {
              callback(new Error(`Withdrawal amount cannot exceed ${maxWithdrawAmount.value}`));
            } else {
              callback();
            }
          },
          trigger: 'blur'
        }
      ],
      googleCode: [
        { required: true, message: 'Enter the Google verification code', trigger: 'blur' },
        { min: 6, max: 6, message: 'Google verification code must be 6 digits', trigger: 'blur' }
      ]
    };

    // Google verification dialog
    const googleVerifyDialogVisible = ref(false);
    const googleVerifyFormRef = ref(null);
    const googleVerifyForm = reactive({
      code: '',
      action: '', // 'showToken', 'showSecret', 'editColdWallet'
      data: null // Used to store extra data, such as the chain type when editing the cold wallet
    });

    // Google verification form validation rules
    const googleVerifyRules = {
      code: [
        { required: true, message: 'Enter the Google verification code', trigger: 'blur' },
        { min: 6, max: 6, message: 'Google verification code must be 6 digits', trigger: 'blur' }
      ]
    };

    // Edit callback address dialog
    const editCallbackDialogVisible = ref(false);
    const editCallbackFormRef = ref(null);
    const editCallbackForm = reactive({
      url: '',
      googleCode: ''
    });

    // Edit callback address form validation rules
    const editCallbackRules = {
      url: [
        { required: true, message: 'Please enter callback address', trigger: 'blur' },
        {
          pattern: /^https?:\/\/.+/,
          message: 'Enter a valid URL',
          trigger: 'blur'
        }
      ],
      googleCode: [
        { required: true, message: 'Enter the Google verification code', trigger: 'blur' },
        { min: 6, max: 6, message: 'Google verification code must be 6 digits', trigger: 'blur' }
      ]
    };



    // IP whitelist dialog
    const addIpDialogVisible = ref(false);
    const addIpFormRef = ref(null);
    const addIpForm = reactive({
      ipList: '',
      googleCode: ''
    });

    // IP whitelist form validation rules
    const addIpRules = {
      ipList: [
        { required: true, message: 'Please enter IP address', trigger: 'blur' }
      ],
      googleCode: [
        { required: true, message: 'Enter the Google verification code', trigger: 'blur' },
        { min: 6, max: 6, message: 'Google verification code must be 6 digits', trigger: 'blur' }
      ]
    };

    // Edit Cold Wallet Address Dialog
    const editColdWalletDialogVisible = ref(false);
    const editColdWalletFormRef = ref(null);
    const editColdWalletForm = reactive({
      chain: '',
      address: '',
      code: ''
    });

    // Edit cold wallet address form validation rules
    const editColdWalletRules = {
      chain: [
        { required: true, message: 'Select Chain', trigger: 'change' }
      ],
      address: [
        { required: true, message: 'Please enter the new cold wallet address', trigger: 'blur' }
      ],
      code: [
        { required: true, message: 'Enter the Google verification code', trigger: 'blur' },
        { min: 6, max: 6, message: 'Google verification code must be 6 digits', trigger: 'blur' }
      ]
    };



    // User recharge test dialog
    const userRechargeTestDialogVisible = ref(false);
    const userRechargeTestForm = reactive({
      currency: 'USDT',
      chain: 'TRON',
      amount: 0.01,
      uid: ''
    });

    // Open user recharge test dialog
    const openUserRechargeTestDialog = () => {
      // Initialize default currency and chain
      const currencies = getCurrencyOptions();
      if (currencies.length > 0) {
        userRechargeTestForm.currency = currencies[0].value;
        const chains = getChainOptionsBySymbol(userRechargeTestForm.currency);
        if (chains.length > 0) {
          userRechargeTestForm.chain = chains[0].value;
        }
      }
      userRechargeTestDialogVisible.value = true;
    };

    // Jump to the user recharge test page
    const goToUserRechargeTest = () => {
      // Check whether user ID is filled in
      // if (!userRechargeTestForm.uid) {
      //   ElMessage({
      //     message: 'Please enter user ID',
      //     type: 'warning'
      //   });
      //   return;
      // }

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('currency', userRechargeTestForm.currency);
      queryParams.append('chain', userRechargeTestForm.chain);
      queryParams.append('amount', userRechargeTestForm.amount.toString());
      queryParams.append('uid', userRechargeTestForm.uid);

      // Add network type information
      const networkType = getNetworkType(userRechargeTestForm.chain);
      queryParams.append('network', networkType);

      // Close Dialog
      userRechargeTestDialogVisible.value = false;

      // Open the recharge test page in a new window
      window.open(`/user-recharge?${queryParams.toString()}`, '_blank');
    };





    // Open recharge dialog
    const openRechargeDialog = () => {
      // Initialize default currency and chain
      const currencies = getCurrencyOptions();
      if (currencies.length > 0) {
        rechargeForm.currency = currencies[0].value;
        const chains = getChainOptionsBySymbol(rechargeForm.currency);
        if (chains.length > 0) {
          rechargeForm.chain = chains[0].value;
        }
      }
      rechargeDialogVisible.value = true;
    };

    // Get the minimum withdrawal amount
    const getMinWithdrawAmount = () => {
      const currency = withdrawForm.currency;

      // Return the minimum withdrawal amount based on the currency
      switch (currency) {
        case 'USDT':
          return 10;
        case 'TRX':
          return 50;
        case 'ETH':
          return 0.002;
        case 'BNB':
          return 0.01;
        default:
          return 0.01;
      }
    };

    // Open withdrawal dialog
    const openWithdrawDialog = () => {
      // Initialize default currency and chain
      const currencies = getCurrencyOptions();
      if (currencies.length > 0) {
        withdrawForm.currency = currencies[0].value;
        const chains = getChainOptionsBySymbol(withdrawForm.currency);
        if (chains.length > 0) {
          withdrawForm.chain = chains[0].value;
        }
      }
      // Fill in the cold wallet address by default
      withdrawForm.address = getWithdrawAddress();
      withdrawDialogVisible.value = true;
      // Calculate the initial maximum withdrawable amount
      calculateMaxWithdrawAmount();
    };

    // Watch withdrawal form changes and recalculate the maximum withdrawable amount
    watch(
      () => withdrawForm.currency,
      () => {
        calculateMaxWithdrawAmount();
        withdrawForm.amount = getMinWithdrawAmount();
        // Automatically select the first available chain
        const chains = getChainOptionsBySymbol(withdrawForm.currency);
        if (chains.length > 0) {
          withdrawForm.chain = chains[0].value;
        }
      }
    );

    // Watch chain changes and automatically update the default withdrawal address
    watch(
      () => withdrawForm.chain,
      () => {
        withdrawForm.address = getWithdrawAddress();
      }
    );

    // Watch for currency changes in the recharge form
    watch(
      () => rechargeForm.currency,
      () => {
        // Automatically select the first available chain
        const chains = getChainOptionsBySymbol(rechargeForm.currency);
        if (chains.length > 0) {
          rechargeForm.chain = chains[0].value;
        }
      }
    );

    // Watch currency changes in the user recharge test form
    watch(
      () => userRechargeTestForm.currency,
      () => {
        // Automatically select the first available chain
        const chains = getChainOptionsBySymbol(userRechargeTestForm.currency);
        if (chains.length > 0) {
          userRechargeTestForm.chain = chains[0].value;
        }
      }
    );

    // Get recharge address
    const getRechargeAddress = () => {
      // Get the corresponding hot wallet address from address data
      if (!addressData.value || addressData.value.length === 0) {
        return '';
      }

      // Find the corresponding address by currency and chain
      const address = addressData.value.find(item => {
        return item.symbol === rechargeForm.currency && item.chain === rechargeForm.chain;
      });

      return address ? address.hotAddress || '' : '';
    };

    // Get withdrawal address (cold wallet address)
    const getWithdrawAddress = () => {
      // Get the corresponding cold wallet address from the address data
      if (!addressData.value || addressData.value.length === 0) {
        return '';
      }

      // Find the corresponding address by currency and chain
      const address = addressData.value.find(item => {
        return item.symbol === withdrawForm.currency && item.chain === withdrawForm.chain;
      });

      return address ? address.coldAddress || '' : '';
    };



    // Maximum withdrawable amount
    const maxWithdrawAmount = ref(0);

    // Calculate the maximum withdrawable amount (deducting gas fees and platform fees)
    const calculateMaxWithdrawAmount = async () => {
      // Get the currently selected currency
      const currency = withdrawForm.currency;

      // Get the corresponding balance from asset data
      let balance = 0;
      if (assetsData.value && assetsData.value.length > 0) {
        const asset = assetsData.value.find(item => item.symbol === currency);
        balance = asset ? parseFloat(asset.balance) || 0 : 0;
      }

      // Calculate platform fee (percentage)
      const platformFeeRate = (merchant.value?.feeRatio || 0.5) / 100;

      // Calculate maximum withdrawable amount (after deducting platform fee)
      const maxAmount = Math.max(balance * (1 - platformFeeRate), 0);
      maxWithdrawAmount.value = truncateDecimal(maxAmount, 4);
    };



    // Copy text
    const copyText = (text) => {
      navigator.clipboard.writeText(text).then(() => {
        ElMessage({
          message: 'Copied successfully',
          type: 'success'
        });
      }).catch(() => {
        ElMessage({
          message: 'Copy failed, please copy manually',
          type: 'error'
        });
      });
    };

    // Show API value (Google verification required only the first time)
    const showApiValue = (type) => {
      // If it is a token and has already been fetched
      if (type === 'token') {
        if (apiInfo.token) {
          apiInfo.tokenVisible = true;
          return;
        }
      }

      // If it is a secret and has already been obtained
      if (type === 'secret') {
        if (apiInfo.secret) {
          apiInfo.secretVisible = true;
          return;
        }
      }

      // If API info has not been fetched yet, Google verification is required
      googleVerifyForm.action = type === 'token' ? 'showToken' : 'showSecret';
      googleVerifyDialogVisible.value = true;
    };

    // Hide API value
    const hideApiValue = (type) => {
      if (type === 'token') {
        apiInfo.tokenVisible = false;
      } else {
        apiInfo.secretVisible = false;
      }
    };

    // Edit callback URL
    const editCallbackUrl = () => {
      editCallbackForm.url = apiInfo.callbackUrl;
      editCallbackDialogVisible.value = true;
    };

    // Submit Google verification
    const submitGoogleVerify = async () => {
      if (!googleVerifyFormRef.value) return;

      googleVerifyFormRef.value.validate(async (valid) => {
        if (valid) {
          if (googleVerifyForm.action === 'showToken') {
            if (!apiInfo.token) {
              const res = await merchantApiKey({ code: googleVerifyForm.code });
              if (res && res.data) {
                apiInfo.token = res.data.apiKey;
                apiInfo.secret = res.data.webhookSecret;
              }
            }
            apiInfo.tokenVisible = true;

          } else if (googleVerifyForm.action === 'showSecret') {
            if (!apiInfo.secret) {
              const res = await merchantApiKey({ code: googleVerifyForm.code });
              if (res && res.data) {
                apiInfo.token = res.data.apiKey;
                apiInfo.secret = res.data.webhookSecret;
              }
            }
            apiInfo.secretVisible = true;
          }

          googleVerifyDialogVisible.value = false;
          googleVerifyForm.code = '';
        }
      });
    };



    // Open the add IP whitelist dialog
    const openAddIpDialog = () => {
      addIpForm.ipList = apiInfo.ipWhitelist.join('\n');
      addIpForm.googleCode = '';
      addIpDialogVisible.value = true;
    };

    // Open the edit cold wallet address dialog
    const openEditColdWalletDialog = () => {
      if (!addressData.value || addressData.value.length === 0) {
        ElMessage({
          message: 'No available address information',
          type: 'warning'
        });
        return;
      }
      editColdWalletForm.chain = addressData.value[0]?.chain || '';
      editColdWalletForm.address = '';
      editColdWalletForm.code = '';
      editColdWalletDialogVisible.value = true;
    };

    // Get current cold wallet address
    const getCurrentColdAddress = () => {
      if (!addressData.value || addressData.value.length === 0 || !editColdWalletForm.chain) {
        return '';
      }
      const address = addressData.value.find(item => item.chain === editColdWalletForm.chain);
      return address ? address.coldAddress || '' : '';
    };

    // Submit to add IP whitelist
    const submitAddIp = async () => {
      if (!addIpFormRef.value) return;

      addIpFormRef.value.validate(async (valid) => {
        if (valid) {
          // Split the input IP addresses by line
          const ipList = addIpForm.ipList.split('\n').filter(ip => ip.trim() !== '');

          // Validate IP format (supports IPv4 and IPv6)
          const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
          const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1}:([0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){2}:([0-9a-fA-F]{1,4}:){0,4}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){3}:([0-9a-fA-F]{1,4}:){0,3}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){4}:([0-9a-fA-F]{1,4}:){0,2}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4}:){0,1}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){6}:[0-9a-fA-F]{1,4})$/;
          const invalidIps = ipList.filter(ip => !ipv4Regex.test(ip.trim()) && !ipv6Regex.test(ip.trim()));

          if (invalidIps.length > 0) {
            ElMessage({
              message: `The following IP addresses are invalid: ${invalidIps.join(', ')}`,
              type: 'error'
            });
            return;
          }

          // Check whether the maximum quantity limit is exceeded
          if (ipList.length > 10) {
            ElMessage({
              message: `IP whitelist can contain at most 10 IP addresses`,
              type: 'error'
            });
            return;
          }

          // // Check for duplicate IPs
          // const duplicateIps = ipList.filter(ip => apiInfo.ipWhitelist.includes(ip.trim()));
          // if (duplicateIps.length > 0) {
          //   ElMessage({
          //     message: `The following IP addresses already exist: ${duplicateIps.join(', ')}, remove duplicate IPs`,
          //     type: 'warning'
          //   });
          //   return;
          // }

          const res = await setWhitelistIp({ ips: ipList, code: addIpForm.googleCode });
          if (res && res.code === 200) {
            ElMessage({
              message: `Successfully added ${ipList.length} IP addresses to the whitelist`,
              type: 'success'
            });
            apiInfo.ipWhitelist = ipList;
            addIpDialogVisible.value = false;
            return;
          }
        }
      });
    };



    // Submit cold wallet address change
    const submitEditColdWallet = async () => {
      if (!editColdWalletFormRef.value) return;

      editColdWalletFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const res = await updateColdAddress({
              chain: editColdWalletForm.chain,
              coldAddress: editColdWalletForm.address,
              code: parseInt(editColdWalletForm.code)
            });

            if (res && res.code === 200) {
              ElMessage({
                message: 'Cold wallet address updated successfully',
                type: 'success'
              });

              // Update local address data
              const addressIndex = addressData.value.findIndex(item => item.chain === editColdWalletForm.chain);
              if (addressIndex !== -1) {
                addressData.value[addressIndex].coldAddress = editColdWalletForm.address;
              }

              editColdWalletDialogVisible.value = false;

              // Reload address data to ensure synchronization
              loadMerchantAddress();
            } else {
              ElMessage({
                message: res?.msg || 'Update failed, please try again',
                type: 'error'
              });
            }
          } catch (error) {
            // console.error('Failed to update cold wallet address:', error);
            // ElMessage({
            //   message: 'Update failed, please check your network connection',
            //   type: 'error'
            // });
          }
        }
      });
    };


    // Submit modified callback address
    const submitEditCallback = async () => {
      if (!editCallbackFormRef.value) return;

      editCallbackFormRef.value.validate(async (valid) => {
        if (valid) {
          const res = await updateCallbackUrl({ callbackUrl: editCallbackForm.url, code: editCallbackForm.googleCode });
          if (res && res.code === 200) {
            apiInfo.callbackUrl = editCallbackForm.url;
            ElMessage({
              message: 'Callback address updated successfully',
              type: 'success'
            });
            editCallbackDialogVisible.value = false;
            editCallbackForm.googleCode = '';
          }

        }
      });
    };

    // Submit Withdrawal
    const submitWithdraw = async () => {
      if (!withdrawFormRef.value) return;

      // First check whether the withdrawal amount is within the valid range
      const minAmount = getMinWithdrawAmount();
      if (withdrawForm.amount < minAmount) {
        ElMessage({
          message: `Withdrawal amount cannot be less than ${minAmount}`,
          type: 'error'
        });
        return;
      }

      if (withdrawForm.amount > maxWithdrawAmount.value || maxWithdrawAmount.value < minAmount) {
        ElMessage({
          message: `Withdrawal amount cannot exceed ${maxWithdrawAmount.value}`,
          type: 'error'
        });
        return;
      }

      withdrawFormRef.value.validate(async (valid) => {
        if (valid) {
          ElMessageBox.confirm(
            `Confirm withdrawal of ${withdrawForm.amount} ${withdrawForm.currency} to address ${withdrawForm.address}?`,
            'Withdrawal Confirmation',
            {
              confirmButtonText: 'Confirm',
              cancelButtonText: 'Cancel',
              type: 'warning',
            }
          ).then(async () => {
            const res = await withdrawal({ chain: withdrawForm.chain, address: withdrawForm.address, amount: withdrawForm.amount, symbol: withdrawForm.currency, code: withdrawForm.googleCode });
            if (res && res.code === 200) {
              ElMessage({
                message: 'Withdrawal request submitted, please wait for processing',
                type: 'success'
              });
              withdrawDialogVisible.value = false;
            } else {
              ElMessage({
                message: 'Withdrawal request failed',
                type: 'error'
              });
            }
          }).catch(() => {
            // User cancels withdrawal
          });
        }
      });
    };

    return {
      isMerchant,
      merchant, // Added merchant ref to the return statement
      assetsData,
      addressData,
      loadMerchantAssets,
      loadMerchantAddress,
      // Google Authenticator binding
      isGoogleAuthBound,
      googleBindingDialogVisible,
      googleBindingStep,
      googleBindingFormRef,
      googleAuthSecret,
      googleAuthSecretKey,
      googleBindingForm,
      googleBindingRules,
      verifyAndBindGoogleAuth,

      apiInfo,
      getCurrencyOptions,
      getChainOptions,
      getChainOptionsBySymbol,
      getNetworkType,

      rechargeDialogVisible,
      rechargeForm,
      withdrawDialogVisible,
      withdrawForm,
      withdrawRules,
      withdrawFormRef,
      googleVerifyDialogVisible,
      googleVerifyForm,
      googleVerifyRules,
      googleVerifyFormRef,
      editCallbackDialogVisible,
      editCallbackForm,
      editCallbackRules,
      editCallbackFormRef,

      // User recharge test
      userRechargeTestDialogVisible,
      userRechargeTestForm,
      openUserRechargeTestDialog,
      goToUserRechargeTest,

      openRechargeDialog,
      openWithdrawDialog,
      getRechargeAddress,
      getWithdrawAddress,
      maxWithdrawAmount,
      calculateMaxWithdrawAmount,
      getMinWithdrawAmount,
      copyText,
      showApiValue,
      hideApiValue,
      editCallbackUrl,
      submitGoogleVerify,
      submitEditCallback,
      submitWithdraw,

      truncateDecimal,
      // IP whitelist methods
      addIpDialogVisible,
      addIpForm,
      addIpRules,
      addIpFormRef,
      openAddIpDialog,
      submitAddIp,

      // Related to editing the cold wallet address
      editColdWalletDialogVisible,
      editColdWalletForm,
      editColdWalletRules,
      editColdWalletFormRef,
      openEditColdWalletDialog,
      getCurrentColdAddress,
      submitEditColdWallet,

    };
  }
};
</script>

<style scoped>
.merchant-dashboard {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.wallet-tabs {
  margin-left: 20px;
}

.balance-card {
  height: 100%;
}

.wallet-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f9fafc;
}

.asset-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f9fafc;
}

.asset-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #409EFF;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.balance-amount {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.balance-amount .label {
  color: #606266;
}

.balance-amount .amount {
  font-weight: bold;
  font-size: 16px;
}

.wallet-address {
  margin-top: 15px;
}

.address-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 5px;
}

.address-value {
  margin-bottom: 10px;
}

.balance-actions {
  display: flex;
  justify-content: space-around;
}

.api-info {
  margin-bottom: 20px;
}

.api-value-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.api-actions {
  display: flex;
  gap: 5px;
}

.api-doc-link {
  margin-top: 15px;
  text-align: center;
}

.stats-overview-card {
  height: 100%;
}

.stat-item {
  padding: 10px;
  margin-bottom: 15px;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-rate {
  font-size: 12px;
  color: #606266;
}

.recharge-address-info {
  padding: 10px;
}

.address-label {
  font-weight: bold;
  margin-bottom: 10px;
}

.address-value {
  margin-bottom: 20px;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qrcode-image {
  width: 200px;
  height: 200px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

/* Google Authenticator binding styles */
.google-auth-setup {
  padding: 20px 0;
}

.step-content {
  margin-top: 30px;
}

.step-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #409EFF;
}

.app-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}

.step-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.secret-key {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.verification-input {
  width: 200px;
  margin: 0 auto;
  display: block;
}

/* IP whitelist styles */
.ip-whitelist-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ip-whitelist-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.ip-tag {
  margin-right: 5px;
}

.add-ip-button {
  padding: 5px;
  height: 28px;
}

.ip-whitelist-info {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.ip-input-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
