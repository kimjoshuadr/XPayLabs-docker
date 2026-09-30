<template>
  <div v-if="isMerchant" class="merchant-dashboard">
    <!-- Google Authenticator Binding Dialog -->
    <el-dialog
      v-model="googleBindingDialogVisible"
      title="Bind Google Authenticator"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="true"
    >
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
            <el-link href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" type="primary">
              <el-icon><Download /></el-icon> Android - Google Play
            </el-link>
            <el-link href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank" type="primary">
              <el-icon><Download /></el-icon> Apple - App Store
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
              <el-icon><CopyDocument /></el-icon>
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
              <el-input 
                v-model="googleBindingForm.verificationCode" 
                placeholder="Please enter the 6-digit verification code"
                maxlength="6"
                class="verification-input"
              />
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
              <h3><el-icon><Money /></el-icon> Merchant Balance</h3>
              <div class="wallet-controls">
                <el-tabs v-model="walletTab" class="wallet-tabs">
                  <el-tab-pane label="Hot Wallet" name="hot"></el-tab-pane>
                  <el-tab-pane label="Cold Wallet" name="cold"></el-tab-pane>
                </el-tabs>
                <el-switch
                  v-model="isTestnet"
                  active-text="Testnet"
                  inactive-text="Mainnet"
                  @change="handleNetworkChange"
                />
              </div>
            </div>
          </template>
          
          <!-- Hot Wallet Information -->
          <div v-if="walletTab === 'hot'">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <div class="wallet-section">
                  <div class="wallet-title">TRON chain {{ isTestnet ? '(Testnet)' : '(Mainnet)' }}</div>
                  <div class="balance-amount">
                    <span class="label">USDT Balance:</span>
                    <span class="amount">{{ truncateDecimal(balanceData.hot.usdt.tron, 2) }}</span>
                  </div>
                  <div class="balance-amount">
                    <span class="label">USDT Balance Pending Collection:</span>
                    <span class="amount">{{ isTestnet ? truncateDecimal(balanceData.hot.pendingCollection.tronTestUsdt, 2) : truncateDecimal(balanceData.hot.pendingCollection.tronUsdt, 2) }}</span>
                  </div>
                  <div class="balance-amount">
                    <span class="label">TRX Balance:</span>
                    <span class="amount">{{ truncateDecimal(balanceData.hot.trx, 4) }}</span>
                  </div>
                  <div class="wallet-address">
                    <div class="address-label">Hot Wallet Address:</div>
                    <div class="address-value">
                      <el-input :value="walletAddresses.hot.tron" size="small" readonly>
                        <template #append>
                          <el-button @click="copyText(walletAddresses.hot.tron)">
                            <el-icon><CopyDocument /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <div class="wallet-section">
                  <div class="wallet-title">ETH chain {{ isTestnet ? '(Testnet)' : '(Mainnet)' }}</div>
                  <div class="balance-amount">
                    <span class="label">USDT Balance:</span>
                    <span class="amount">{{ truncateDecimal(balanceData.hot.usdt.eth, 2) }}</span>
                  </div>
                  <div class="balance-amount">
                    <span class="label">USDT Balance Pending Collection:</span>
                    <span class="amount">{{ isTestnet ? truncateDecimal(balanceData.hot.pendingCollection.ethSepoliaUsdt, 2) : truncateDecimal(balanceData.hot.pendingCollection.ethUsdt, 2) }}</span>
                  </div>
                  <div class="balance-amount">
                    <span class="label">ETH Balance:</span>
                    <span class="amount">{{ truncateDecimal(balanceData.hot.eth, 4) }}</span>
                  </div>
                  <div class="wallet-address">
                    <div class="address-label">Hot Wallet Address:</div>
                    <div class="address-value">
                      <el-input :value="walletAddresses.hot.eth" size="small" readonly>
                        <template #append>
                          <el-button @click="copyText(walletAddresses.hot.eth)">
                            <el-icon><CopyDocument /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <div class="wallet-section">
                  <div class="wallet-title">BSC chain {{ isTestnet ? '(Testnet)' : '(Mainnet)' }}</div>
                  <div class="balance-amount">
                    <span class="label">USDT Balance:</span>
                    <span class="amount">{{ truncateDecimal(balanceData.hot.usdt.bsc, 2) }}</span>
                  </div>
                  <div class="balance-amount">
                    <span class="label">USDT Balance Pending Collection:</span>
                    <span class="amount">{{ isTestnet ? truncateDecimal(balanceData.hot.pendingCollection.bscTestUsdt, 2) : truncateDecimal(balanceData.hot.pendingCollection.bscUsdt, 2) }}</span>
                  </div>
                  <div class="balance-amount">
                    <span class="label">BNB Balance:</span>
                    <span class="amount">{{ truncateDecimal(balanceData.hot.bnb, 4) }}</span>
                  </div>
                  <div class="wallet-address">
                    <div class="address-label">Hot Wallet Address:</div>
                    <div class="address-value">
                      <el-input :value="walletAddresses.hot.bsc" size="small" readonly>
                        <template #append>
                          <el-button @click="copyText(walletAddresses.hot.bsc)">
                            <el-icon><CopyDocument /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          
          <!-- Cold wallet info -->
          <div v-if="walletTab === 'cold'">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <div class="wallet-section">
                  <div class="wallet-title">TRON chain {{ isTestnet ? '(Testnet)' : '(Mainnet)' }}</div>
                  <div class="balance-amount">
                    <span class="label">USDT Balance:</span>
                    <span class="amount">{{ truncateDecimal(balanceData.cold.usdt.tron, 2) }}</span>
                  </div>
                  <div class="balance-amount">
                    <span class="label">TRX Balance:</span>
                    <span class="amount">{{ truncateDecimal(balanceData.cold.trx, 4) }}</span>
                  </div>
                  <div class="wallet-address">
                    <div class="address-label">Cold Wallet Address:</div>
                    <div class="address-value">
                      <el-input :value="walletAddresses.cold.tron" size="small" readonly>
                        <template #append>
                          <el-button @click="copyText(walletAddresses.cold.tron)" style="margin-right: 5px;">
                            <el-icon><CopyDocument /></el-icon>
                          </el-button>
                          <el-button @click="editColdWalletAddress('tron')">
                            <el-icon><Edit /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <div class="wallet-section">
                  <div class="wallet-title">ETH chain {{ isTestnet ? '(Testnet)' : '(Mainnet)' }}</div>
                  <div class="balance-amount">
                    <span class="label">USDT Balance:</span>
                    <span class="amount">{{ truncateDecimal(balanceData.cold.usdt.eth, 2) }}</span>
                  </div>
                  <div class="balance-amount">
                    <span class="label">ETH Balance:</span>
                    <span class="amount">{{ truncateDecimal(balanceData.cold.eth, 4) }}</span>
                  </div>
                  <div class="wallet-address">
                    <div class="address-label">Cold Wallet Address:</div>
                    <div class="address-value">
                      <el-input :value="walletAddresses.cold.eth" size="small" readonly>
                        <template #append>
                          <el-button @click="copyText(walletAddresses.cold.eth)" style="margin-right: 5px;">
                            <el-icon><CopyDocument /></el-icon>
                          </el-button>
                          <el-button @click="editColdWalletAddress('eth')">
                            <el-icon><Edit /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <div class="wallet-section">
                  <div class="wallet-title">BSC chain {{ isTestnet ? '(Testnet)' : '(Mainnet)' }}</div>
                  <div class="balance-amount">
                    <span class="label">USDT Balance:</span>
                    <span class="amount">{{ truncateDecimal(balanceData.cold.usdt.bsc, 2) }}</span>
                  </div>
                  <div class="balance-amount">
                    <span class="label">BNB Balance:</span>
                    <span class="amount">{{ truncateDecimal(balanceData.cold.bnb, 4) }}</span>
                  </div>
                  <div class="wallet-address">
                    <div class="address-label">Cold Wallet Address:</div>
                    <div class="address-value">
                      <el-input :value="walletAddresses.cold.bsc" size="small" readonly>
                        <template #append>
                          <el-button @click="copyText(walletAddresses.cold.bsc)" style="margin-right: 5px;">
                            <el-icon><CopyDocument /></el-icon>
                          </el-button>
                          <el-button @click="editColdWalletAddress('bsc')">
                            <el-icon><Edit /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          
          <div class="balance-actions mt-20">
            <el-button type="primary" @click="openRechargeDialog">Recharge</el-button>
            <el-button type="warning" @click="openWithdrawDialog">Withdrawal</el-button>
            <el-button type="success" @click="openUserRechargeTestDialog">User Recharge Test</el-button>
          </div>
        </el-card>
      </el-col>

    </el-row>
    
    <!-- API Info and Data Overview -->
    <el-row :gutter="20" class="mt-20" >
      <!-- API info card -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="api-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3><el-icon><Connection /></el-icon> API Information</h3>
            </div>
          </template>
          <div class="api-info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="Token">
                <div class="api-value-container">
                  <el-tag size="small" v-if="apiInfo.tokenVisible">{{ apiInfo.token }}</el-tag>
                  <el-tag size="small" v-else>****************</el-tag>
                  <div class="api-actions">
                    <el-button link type="primary" size="small" @click="showApiValue('token')" v-if="!apiInfo.tokenVisible">
                      <el-icon><View /></el-icon>
                    </el-button>
                    <el-button link type="primary" size="small" @click="hideApiValue('token')" v-else>
                      <el-icon><Hide /></el-icon>
                    </el-button>
                    <el-button link type="primary" size="small" @click="copyText(apiInfo.token)" v-if="apiInfo.tokenVisible">
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="Secret">
                <div class="api-value-container">
                  <div v-if="apiInfo.secretVisible" style="word-break: break-all;">
                    <el-tag size="small" style="max-width: 100%; white-space: normal; height: auto; line-height: 1.5; padding: 5px;">{{ apiInfo.secret }}</el-tag>
                  </div>
                  <el-tag size="small" v-else>****************</el-tag>
                  <div class="api-actions">
                    <el-button link type="primary" size="small" @click="showApiValue('secret')" v-if="!apiInfo.secretVisible">
                      <el-icon><View /></el-icon>
                    </el-button>
                    <el-button link type="primary" size="small" @click="hideApiValue('secret')" v-else>
                      <el-icon><Hide /></el-icon>
                    </el-button>
                    <el-button link type="primary" size="small" @click="copyText(apiInfo.secret)" v-if="apiInfo.secretVisible">
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="Callback Address">
                <div class="api-value-container">
                  <el-tag size="small">{{ apiInfo.callbackUrl }}</el-tag>
                  <div class="api-actions">
                    <el-button link type="primary" size="small" @click="editCallbackUrl">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button link type="primary" size="small" @click="copyText(apiInfo.callbackUrl)">
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="IP Whitelist">
                <div class="ip-whitelist-container">
                  <div class="ip-whitelist-tags">
                    <el-tag 
                      v-for="(ip, index) in apiInfo.ipWhitelist" 
                      :key="index" 
                      class="ip-tag"
                    >
                      {{ ip }}
                    </el-tag>
                    <el-button 
                      class="add-ip-button" 
                      type="primary" 
                      size="small" 
                      @click="openAddIpDialog"
                    >
                      <el-icon><Plus /></el-icon>
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
                <el-icon><Document /></el-icon> API Integration Docs
              </el-link>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" v-show="true">
        <el-card class="data-overview-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3><el-icon><Connection /></el-icon> TRON (Mainnet) Energy Rental Binding</h3>
            </div>
          </template>
          <el-row :gutter="20">
            <!-- Bound Status -->
            <el-col :span="24" v-if="energyPlatform.isBound" class="energy-bound-info">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="TRX Balance">
                  <el-tag type="success">{{ energyPlatform.trxBalance }} TRX</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="Binding Address">
                  <div class="address-container">
                    <el-text class="address-text">{{ energyPlatform.boundAddress }}</el-text>
                    <el-button link type="primary" size="small" @click="copyText(energyPlatform.boundAddress)">
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                </el-descriptions-item>
                <el-descriptions-item label="Recharge Address">
                  <div class="address-container">
                    <el-text class="address-text">{{ energyPlatform.rechargeAddress }}</el-text>
                    <el-button link type="primary" size="small" @click="copyText(energyPlatform.rechargeAddress)">
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                </el-descriptions-item>
              </el-descriptions>
              <!-- <div class="energy-actions" style="margin-top: 16px;">
                <el-button type="primary" @click="refreshEnergyInfo">Refresh Info</el-button>
              </div> -->
            </el-col>
            
            <!-- Unbound State - Show Binding Process -->
            <el-col :span="24" v-else class="energy-binding-flow">
              <!-- Responsive Steps -->
              <div class="steps-container">
                <el-steps 
                  :active="energyBindingStep" 
                  finish-status="success" 
                  :direction="stepsDirection"
                  align-center
                  class="energy-steps"
                >
                  <el-step title="Register Account" description="Register at feee.io" />
                  <el-step title="Recharge TRX" description="Recharge TRX to Account" />
                  <el-step title="Create API" description="Create API Key" />
                  <el-step title="Binding Complete" description="Enter the key to complete binding" />
                </el-steps>
              </div>
              
              <div class="binding-content">
                <el-alert
                  title="TRON Energy Rental Binding Process"
                  type="info"
                  :closable="false"
                  show-icon
                  class="binding-alert"
                >
                  <template #default>
                    <ol class="binding-steps-list">
                      <li>Access <el-link href="https://feee.io/" target="_blank" type="primary">https://feee.io/</el-link> Register Account</li>
                      <li>Recharge TRX on the platform for energy rental</li>
                      <li>Create an API key on the platform and add it to the UA whitelist <code>xpay</code> <el-tag type="danger" size="small">⚠️ Required</el-tag></li>
                      <li>Enter the API key and Google verification code below to complete binding</li>
                    </ol>
                  </template>
                </el-alert>
                
                <el-form 
                  :model="energyBindingForm" 
                  :rules="energyBindingRules" 
                  ref="energyBindingFormRef" 
                  label-width="100px"
                  class="energy-binding-form"
                >
                  <el-form-item label="API Key" prop="apiKey">
                    <el-input 
                      v-model="energyBindingForm.apiKey" 
                      placeholder="Please enter the API key obtained from feee.io"
                      show-password
                      size="default"
                    />
                  </el-form-item>
                  <el-form-item label="Google Verification Code" prop="googleCode">
                    <el-input 
                      v-model="energyBindingForm.googleCode" 
                      placeholder="Please enter the 6-digit Google verification code"
                      maxlength="6"
                      size="default"
                    />
                  </el-form-item>
                  <el-form-item class="form-actions">
                    <el-button 
                      type="primary" 
                      @click="bindEnergyPlatform" 
                      :loading="energyBindingLoading"
                      size="default"
                    >
                      Binding Complete
                    </el-button>
                    <el-button @click="resetEnergyBindingForm" size="default">Reset</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- Statistics Cards -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" v-show="false">
        <el-card class="stats-overview-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3><el-icon><DataAnalysis /></el-icon> Data Overview</h3>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="Today's Data" name="today">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="stat-item">
                    <div class="stat-title">Today's Credits</div>
                    <div class="stat-value">{{ todayStats.incomingCount }} transactions</div>
                    <div class="stat-rate">
                      Success rate: {{ todayStats.incomingRate }}
                      <el-progress :percentage="parseFloat(todayStats.incomingRate)" />
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="stat-item">
                    <div class="stat-title">Today's Outflow</div>
                    <div class="stat-value">{{ todayStats.outgoingCount }} transactions</div>
                    <div class="stat-rate">
                      Success Rate: {{ todayStats.outgoingRate }}
                      <el-progress :percentage="parseFloat(todayStats.outgoingRate)" />
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="All Data" name="all">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="stat-item">
                    <div class="stat-title">All Credited</div>
                    <div class="stat-value">{{ allStats.incomingCount }} transactions</div>
                    <div class="stat-rate">
                      Success Rate: {{ allStats.incomingRate }}
                      <el-progress :percentage="parseFloat(allStats.incomingRate)" />
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="stat-item">
                    <div class="stat-title">Pay Out All</div>
                    <div class="stat-value">{{ allStats.outgoingCount }} transactions</div>
                    <div class="stat-rate">
                      Success rate: {{ allStats.outgoingRate }}
                      <el-progress :percentage="parseFloat(allStats.outgoingRate)" />
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- Detailed Data Table -->
    <el-row :gutter="20" class="mt-20" v-show="false">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <h3><el-icon><Histogram /></el-icon> Detailed Data</h3>
              <el-radio-group v-model="detailType" size="small">
                <el-radio-button value="incoming" label="Credit Data" />
                <el-radio-button value="outgoing" label="Disbursement Data" />
              </el-radio-group>
            </div>
          </template>
          
          <el-tabs v-model="detailPeriod">
            <el-tab-pane label="Today's Data" name="today">
              <el-table :data="getDetailData()" stripe style="width: 100%">
                <el-table-column prop="currency" label="Currency" width="180" />
                <el-table-column prop="amount" label="Quantity" width="180" />
                <el-table-column prop="chain" label="Chain" />
                <el-table-column prop="count" label="Count" />
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="All Data" name="all">
              <el-table :data="getDetailData()" stripe style="width: 100%">
                <el-table-column prop="currency" label="Currency" width="180" />
                <el-table-column prop="amount" label="Quantity" width="180" />
                <el-table-column prop="chain" label="Chain" />
                <el-table-column prop="count" label="Count" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- Recharge Dialog -->
    <el-dialog
      v-model="rechargeDialogVisible"
      :title="`Recharge ${isTestnet ? '(Testnet)' : '(Mainnet)'}`"
      width="500px"
      destroy-on-close
    >
      <el-form :model="rechargeForm" label-width="120px">
        <el-form-item label="Currency">
          <el-select v-model="rechargeForm.currency" placeholder="Please select currency">
            <el-option label="USDT" value="USDT" />
            <el-option label="ETH" value="ETH" />
            <el-option label="TRX" value="TRX" />
            <el-option label="BNB" value="BNB" />
          </el-select>
        </el-form-item>
        <el-form-item label="Chain" v-if="rechargeForm.currency === 'USDT'">
          <el-select v-model="rechargeForm.chain" placeholder="Select Chain">
            <el-option v-if="!isTestnet" label="TRON" value="TRON" />
            <el-option v-if="isTestnet" label="TRON (Testnet)" value="TRON_TEST" />
            <el-option v-if="!isTestnet" label="ETH" value="ETH" />
            <el-option v-if="isTestnet" label="ETH (Sepolia)" value="ETH_SEPOLIA" />
            <el-option v-if="!isTestnet" label="BSC" value="BSC" />
            <el-option v-if="isTestnet" label="BSC (Testnet)" value="BSC_TEST" />
          </el-select>
        </el-form-item>
        <el-divider />
        <div class="recharge-address-info">
          <p class="address-label">Recharge Address:</p>
          <div class="address-value">
            <el-input :value="getRechargeAddress()" readonly>
              <template #append>
                <el-button @click="copyText(getRechargeAddress())">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
          <div class="qrcode-container">
            <qrcode-vue :value="getRechargeAddress()" :size="200" level="H" class="qrcode-image" />
          </div>
          <el-alert
            title="Recharge Notice"
            type="warning"
            description="Please transfer via a legitimate channel. The recharge will be credited after block confirmation, which usually takes 10-30 minutes."
            show-icon
            :closable="false"
          />
        </div>
      </el-form>
    </el-dialog>

    <!-- Withdrawal Dialog -->
    <el-dialog
      v-model="withdrawDialogVisible"
      :title="`Withdrawal ${isTestnet ? '(Testnet)' : '(Mainnet)'}`"
      width="560px"
      destroy-on-close
    >
      <el-form :model="withdrawForm" :rules="withdrawRules" ref="withdrawFormRef" label-width="100px">
        <el-form-item label="Currency" prop="currency">
          <el-select v-model="withdrawForm.currency" placeholder="Please select currency">
            <el-option label="USDT" value="USDT" />
            <el-option label="ETH" value="ETH" />
            <el-option label="TRX" value="TRX" />
            <el-option label="BNB" value="BNB" />
          </el-select>
        </el-form-item>
        <el-form-item label="Chain" prop="chain" v-if="withdrawForm.currency === 'USDT'">
          <el-select v-model="withdrawForm.chain" placeholder="Select Chain">
            <el-option v-if="!isTestnet" label="TRON" value="TRON" />
            <el-option v-if="isTestnet" label="TRON (Testnet)" value="TRON_TEST" />
            <el-option v-if="!isTestnet" label="ETH" value="ETH" />
            <el-option v-if="isTestnet" label="ETH (Sepolia)" value="ETH_SEPOLIA" />
            <el-option v-if="!isTestnet" label="BSC" value="BSC" />
            <el-option v-if="isTestnet" label="BSC (Testnet)" value="BSC_TEST" />
          </el-select>
        </el-form-item>
        <el-form-item label="Withdrawal Address">
          <el-input :value="getWithdrawAddress()" readonly>
            <template #append>
              <el-button @click="copyText(getWithdrawAddress())">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </template>
          </el-input>
          <div class="form-tip">The withdrawal address is the cold wallet address of the corresponding chain</div>
        </el-form-item>
        <el-form-item label="Withdrawal Quantity" prop="amount">
          <el-input-number 
            v-model="withdrawForm.amount" 
            :min="getMinWithdrawAmount()"
            :max="maxWithdrawAmount > getMinWithdrawAmount() ? maxWithdrawAmount : getMinWithdrawAmount()"
            :precision="withdrawForm.currency === 'USDT' || withdrawForm.currency === 'TRX' ? 2 : 4"
            style="width: 100%"
          />
          <div class="form-tip">
            <div>
              Minimum withdrawal amount: {{ getMinWithdrawAmount() }} {{ withdrawForm.currency }}
            </div>
            <div>
              Max Withdrawable: <span id="maxWithdrawAmount">{{ truncateDecimal(maxWithdrawAmount, withdrawForm.currency === 'USDT' || withdrawForm.currency === 'TRX' ? 2 : 4) }}</span>
              {{ withdrawForm.currency }}
              <el-tooltip content="Gas fee and platform fee deducted" placement="top">
                <el-icon class="info-icon"><InfoFilled /></el-icon>
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
    <el-dialog
      v-model="googleVerifyDialogVisible"
      title="Google Verification"
      width="400px"
      destroy-on-close
    >
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
    <el-dialog
      v-model="editCallbackDialogVisible"
      title="Edit Callback Address"
      width="500px"
      destroy-on-close
    >
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
    <el-dialog
      v-model="userRechargeTestDialogVisible"
      title="User Recharge Test"
      width="500px"
      destroy-on-close
    >
      <el-form :model="userRechargeTestForm" label-width="120px">
        <el-form-item label="Currency">
          <el-select v-model="userRechargeTestForm.currency" placeholder="Please select currency">
            <el-option label="USDT" value="USDT" />
            <el-option label="ETH" value="ETH" />
            <el-option label="TRX" value="TRX" />
            <el-option label="BNB" value="BNB" />
          </el-select>
        </el-form-item>
        <el-form-item label="Chain" v-if="userRechargeTestForm.currency === 'USDT'">
          <el-select v-model="userRechargeTestForm.chain" placeholder="Select Chain">
            <el-option v-if="!isTestnet" label="TRON" value="TRON" />
            <el-option v-if="isTestnet" label="TRON (Testnet)" value="TRON_TEST" />
            <el-option v-if="!isTestnet" label="ETH" value="ETH" />
            <el-option v-if="isTestnet" label="ETH (Sepolia)" value="ETH_SEPOLIA" />
            <el-option v-if="!isTestnet" label="BSC" value="BSC" />
            <el-option v-if="isTestnet" label="BSC (Testnet)" value="BSC_TEST" />
          </el-select>
        </el-form-item>
        <el-form-item label="User ID" prop="uid">
          <el-input 
            v-model="userRechargeTestForm.uid" 
            placeholder="Please enter user ID"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Recharge Amount">
          <el-input-number 
            v-model="userRechargeTestForm.amount" 
            :min="0.001"
            :precision="userRechargeTestForm.currency === 'USDT' || userRechargeTestForm.currency === 'TRX' ? 2 : 4"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="goToUserRechargeTest">Confirm</el-button>
          <el-button @click="userRechargeTestDialogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    
    <!-- Edit Cold Wallet Address Dialog -->
    <el-dialog
      v-model="editColdWalletDialogVisible"
      title="Edit Cold Wallet Address"
      width="500px"
      destroy-on-close
    >
      <el-form :model="editColdWalletForm" :rules="editColdWalletRules" ref="editColdWalletFormRef" label-width="100px">
        <el-form-item label="Chain">
          <el-tag>{{ editColdWalletForm.chain === 'tron' ? 'TRON' : editColdWalletForm.chain === 'eth' ? 'ETH' : 'BSC' }}</el-tag>
        </el-form-item>
        <el-form-item label="Wallet Address" prop="address">
          <el-input v-model="editColdWalletForm.address" placeholder="Please enter the new cold wallet address" />
        </el-form-item>
        <el-form-item label="Google Verification Code" prop="googleCode">
          <el-input v-model="editColdWalletForm.googleCode" placeholder="Enter the Google verification code" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitEditColdWallet">Confirm Edit</el-button>
          <el-button @click="editColdWalletDialogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- IP Whitelist Dialog -->
    <el-dialog
      v-model="addIpDialogVisible"
      title="Add IP Whitelist"
      width="500px"
      destroy-on-close
    >
      <el-form :model="addIpForm" :rules="addIpRules" ref="addIpFormRef" label-width="100px">
        <el-form-item label="IP Address" prop="ipList">
          <el-input 
            v-model="addIpForm.ipList" 
            type="textarea" 
            :rows="5" 
            placeholder="Please enter IP addresses, one per line"
          />
          <div class="ip-input-tip">
            <small>You can add up to 10 IP addresses. Currently {{ apiInfo.ipWhitelist.length }} have been added, and you can add {{ 10 - apiInfo.ipWhitelist.length }} more</small>
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
import { bind2fa, verify2fa, merchantInfo, merchantApiKey, withdrawal, updateCallbackUrl, updateColdAddress, setWhitelistIp, setEnergyApikey, energyPlatformInfo } from '@/api/xpay/merchant';
import { myAddressList } from '@/api/xpay/merchantAddress';
import { getPendingCollectionBalances } from '@/api/xpay/userAddress';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { ethers } from 'ethers';
import {TronWeb} from 'tronweb';
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
      return Math.trunc(num  * factor) / factor;
    }
    
    // Check whether the user is a merchant
    const checkIsMerchant = async() => {
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
        loadWalletAddresses();
        loadEnergyPlatformInfo();
        
        // Set wallet address and balance to auto-refresh every minute
        refreshTimer = setInterval(() => {
          console.log('Auto-refreshing wallet address and balance...');
          loadWalletAddresses();
        }, 60000 * 5); // 60000 ms = 1 minute
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
    
    // Get balance on the ETH chain
    const getEthBalance = async (address, provider) => {
      try {
        if(!address) return 0;
        const balance = await provider.getBalance(address);
        return parseFloat(ethers.formatEther(balance));
      } catch (error) {
        console.error('Failed to get ETH balance:', error);
        return 0;
      }
    };
    
    // Get ERC20 token balance
    const getErc20Balance = async (tokenAddress, walletAddress, provider) => {
      try {
        if(!walletAddress) return 0;
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
        const decimals = await tokenContract.decimals();
        const balance = await tokenContract.balanceOf(walletAddress);
        return parseFloat(ethers.formatUnits(balance, decimals));
      } catch (error) {
        console.error('Failed to get ERC20 balance:', error);
        return 0;
      }
    };
    
    // Get balance on TRON chain
    const getTronBalance = async (address) => {
      try {
        if(!address) return 0;
        const tronWeb = new TronWeb({
          fullHost: rpcUrls.value.tron
        });
        const balance = await tronWeb.trx.getBalance(address);
        return parseFloat(ethers.formatUnits(balance.toString(), 6)); // TRX precision is 6
      } catch (error) {
        console.error('Failed to get TRX balance:', error);
        return 0;
      }
    };
    
    // Get USDT balance on the TRON chain
    const getTronUsdtBalance = async (address) => {
      try {
        if(!address) return 0;
        const tronWeb = new TronWeb({
          fullHost: rpcUrls.value.tron
        });
        const contract = await tronWeb.contract().at(usdtContracts.value.tron);
        const balance = await contract.balanceOf(address).call({
          from: address, // Must set owner_address 
        });
        return parseFloat(ethers.formatUnits(balance.toString(), 6)); // USDT precision is 6
      } catch (error) {
        console.error('Failed to get TRON USDT balance:', error);
        return 0;
      }
    };
    
    // Update wallet balance
    const updateWalletBalances = async () => {
      try {
        // Create Ethereum and BSC providers
        const ethProvider = new ethers.JsonRpcProvider(rpcUrls.value.eth);
        const bscProvider = new ethers.JsonRpcProvider(rpcUrls.value.bsc);
        // Get balance on the ETH chain
        if (walletAddresses.hot.eth) {
          getEthBalance(walletAddresses.hot.eth, ethProvider).then(balance => {
            balanceData.hot.eth = balance;
          }); 
          getErc20Balance(usdtContracts.value.eth, walletAddresses.hot.eth, ethProvider).then(balance => {
            balanceData.hot.usdt.eth = balance;
          });
          getEthBalance(walletAddresses.cold.eth, ethProvider).then(balance => {
            balanceData.cold.eth = balance;
          });
          getErc20Balance(usdtContracts.value.eth, walletAddresses.cold.eth, ethProvider).then(balance => {
            balanceData.cold.usdt.eth = balance;
          });
        }
        
        // Get balance on the BSC chain
        if (walletAddresses.hot.bsc) {
          getEthBalance(walletAddresses.hot.bsc, bscProvider).then(balance => {
            balanceData.hot.bnb = balance;
          });
          getErc20Balance(usdtContracts.value.bsc, walletAddresses.hot.bsc, bscProvider).then(balance => {
            balanceData.hot.usdt.bsc = balance;
          });
          getEthBalance(walletAddresses.cold.bsc, bscProvider).then(balance => {
            balanceData.cold.bnb = balance;
          });
          getErc20Balance(usdtContracts.value.bsc, walletAddresses.cold.bsc, bscProvider).then(balance => {
            balanceData.cold.usdt.bsc = balance;
          });
        }
        
        // Get balance on TRON chain
        if (walletAddresses.hot.tron) {
          getTronBalance(walletAddresses.hot.tron).then(balance => {
            balanceData.hot.trx = balance;
          });
          getTronUsdtBalance(walletAddresses.hot.tron).then(balance => {
            balanceData.hot.usdt.tron = balance;
          });
          getTronBalance(walletAddresses.cold.tron).then(balance => {
            balanceData.cold.trx = balance;
          });
          getTronUsdtBalance(walletAddresses.cold.tron).then(balance => {
            balanceData.cold.usdt.tron = balance;
          });
        }
        
        // Get balance pending collection
        getPendingCollectionBalances().then(res => {
          if (res && res.data) {
            // Reset balance pending collection
            balanceData.hot.pendingCollection.tronUsdt = 0;
            balanceData.hot.pendingCollection.ethUsdt = 0;
            balanceData.hot.pendingCollection.bscUsdt = 0;
            balanceData.hot.pendingCollection.tronTestUsdt = 0;
            balanceData.hot.pendingCollection.ethSepoliaUsdt = 0;
            balanceData.hot.pendingCollection.bscTestUsdt = 0;
            
            // Handle data format returned by API
            res.data.forEach(item => {
              const chainSymbol = item.chainSymbol || '';
              const amount = parseFloat(item.totalAmount || '0');
              
              // Handle mainnet and testnet chain symbols
              if (chainSymbol.includes('TRON')) {
                if (chainSymbol.includes('TESTUSDT')) {
                  balanceData.hot.pendingCollection.tronTestUsdt = amount;
                } else {
                  balanceData.hot.pendingCollection.tronUsdt = amount;
                }
              } else if (chainSymbol.includes('ETH')) {
                if (chainSymbol.includes('SEPOLIAUSDT')) {
                  balanceData.hot.pendingCollection.ethSepoliaUsdt = amount;
                } else {
                  balanceData.hot.pendingCollection.ethUsdt = amount;
                }
              } else if (chainSymbol.includes('BSC')) {
                if (chainSymbol.includes('TESTUSDT')) {
                  balanceData.hot.pendingCollection.bscTestUsdt = amount;
                } else {
                  balanceData.hot.pendingCollection.bscUsdt = amount;
                }
              }
            });
          }
        }).catch(error => {
          console.error('Failed to get pending collection balance:', error);
        });
        
      } catch (error) {
        console.error('Failed to update wallet balance:', error);
        ElMessage({
          message: 'Failed to get on-chain balance. Please refresh the page and try again',
          type: 'warning'
        });
      }
    };
    
    // Auto-refresh timer
    let refreshTimer = null;
    
    // Check whether the user is a merchant on page load
    onMounted(async() => {
      checkIsMerchant();
      // Initialize screen size detection
      checkScreenSize();
      // Listen for window resize
      window.addEventListener('resize', checkScreenSize);
    });
    
    // Clear timers and event listeners when the component unmounts
    onUnmounted(() => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
      // Remove window resize listener
      window.removeEventListener('resize', checkScreenSize);
    });
    
    // Handle network switch
    const handleNetworkChange = () => {
      // Save network selection to localStorage
      localStorage.setItem('xpay-network-mode', isTestnet.value ? 'testnet' : 'mainnet');
      
      ElMessage({
        message: `Switched to ${isTestnet.value ? 'Testnet' : 'Mainnet'}`,
        type: 'success'
      });
      
      // Update chain options for recharge and withdrawal forms
      if (isTestnet.value) {
        if (withdrawForm.chain === 'TRON') withdrawForm.chain = 'TRON_TEST';
        else if (withdrawForm.chain === 'ETH') withdrawForm.chain = 'ETH_SEPOLIA';
        else if (withdrawForm.chain === 'BSC') withdrawForm.chain = 'BSC_TEST';
        
        if (rechargeForm.chain === 'TRON') rechargeForm.chain = 'TRON_TEST';
        else if (rechargeForm.chain === 'ETH') rechargeForm.chain = 'ETH_SEPOLIA';
        else if (rechargeForm.chain === 'BSC') rechargeForm.chain = 'BSC_TEST';
      } else {
        if (withdrawForm.chain === 'TRON_TEST') withdrawForm.chain = 'TRON';
        else if (withdrawForm.chain === 'ETH_SEPOLIA') withdrawForm.chain = 'ETH';
        else if (withdrawForm.chain === 'BSC_TEST') withdrawForm.chain = 'BSC';
        
        if (rechargeForm.chain === 'TRON_TEST') rechargeForm.chain = 'TRON';
        else if (rechargeForm.chain === 'ETH_SEPOLIA') rechargeForm.chain = 'ETH';
        else if (rechargeForm.chain === 'BSC_TEST') rechargeForm.chain = 'BSC';
      }
      
      // Reload wallet addresses and balances
      loadWalletAddresses();
    };
    
    // Load wallet address
    const loadWalletAddresses = () => {
      // Reset wallet address
      walletAddresses.hot.tron = '';
      walletAddresses.hot.eth = '';
      walletAddresses.hot.bsc = '';
      walletAddresses.cold.tron = '';
      walletAddresses.cold.eth = '';
      walletAddresses.cold.bsc = '';
      
      // Get wallet address list
      myAddressList().then(res => {
        if (res.data && res.data.length > 0) {
          // Process wallet address data
          res.data.forEach(item => {
            const chain = item.chain.toLowerCase();
            const symbol = item.symbol.toLowerCase();
            
            // Filter addresses by current network type
            const isCurrentNetworkAddress = isTestnet.value ? 
              (chain.includes('test') || chain.includes('sepolia')) : 
              (!chain.includes('test') && !chain.includes('sepolia'));
            
            if (!isCurrentNetworkAddress) return;
            
            // Set address by chain type and symbol
            if (chain.includes('tron')) {
              if (symbol === 'usdt' || symbol === 'trx') {
                walletAddresses.hot.tron = item.hotAddress;
                walletAddresses.cold.tron = item.coldAddress;
              }
            } else if (chain.includes('eth')) {
              if (symbol === 'usdt' || symbol === 'eth') {
                walletAddresses.hot.eth = item.hotAddress;
                walletAddresses.cold.eth = item.coldAddress;
              }
            } else if (chain.includes('bsc')) {
              if (symbol === 'usdt' || symbol === 'bnb') {
                walletAddresses.hot.bsc = item.hotAddress;
                walletAddresses.cold.bsc = item.coldAddress;
              }
            }
          });
          
          // Get on-chain balance
          updateWalletBalances();
        }
      }).catch(error => {
        console.error('Failed to get wallet address:', error);
        ElMessage({
          message: 'Failed to get wallet address, please refresh the page and try again',
          type: 'error'
        });
      });
    };
    
    // Check whether Google Authenticator is bound
    const checkGoogleAuthBinding = async() => {
      isGoogleAuthBound.value = merchant.value.googleStatus === 'UNBOUND' ? false : true;
        
      if (!isGoogleAuthBound.value) {
        googleBindingDialogVisible.value = true;
        const {data:{secretKey, qrCodeUrl}} = await bind2fa();
        googleAuthSecretKey.value = secretKey;
        googleAuthSecret.value = qrCodeUrl;
      }

    };
    
    // Verify and bind Google Authenticator
    const verifyAndBindGoogleAuth = async() => {
      if (!googleBindingFormRef.value) return;
      
      googleBindingFormRef.value.validate(async(valid) => {
        if (valid) {
          const {data:{verify}} = await verify2fa({code:googleBindingForm.verificationCode});
          if (verify) {
            isGoogleAuthBound.value = true;
            googleBindingDialogVisible.value = false;
            
            ElMessage({
              message: 'Google Authenticator bound successfully',
              type: 'success'
            });
          }else{
            ElMessage({
              message: 'Invalid Google verification code',
              type: 'error'
            });
          }

        }
      });
    };
    // Network switch - read saved settings from localStorage, defaults to mainnet
    const isTestnet = ref(localStorage.getItem('xpay-network-mode') === 'testnet');
    
    // Wallet tab
    const walletTab = ref('hot');
    
    // Wallet address
    const walletAddresses = reactive({
      hot: {
        tron: '',
        eth: '',
        bsc: ''
      },
      cold: {
        tron: '',
        eth: '',
        bsc: ''
      }
    });
    
    // USDT contract address - mainnet
    const mainnetContracts = {
      eth: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // ETH mainnet USDT contract
      bsc: '0x55d398326f99059fF775485246999027B3197955', // BSC mainnet USDT contract
      tron: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' // TRON mainnet USDT contract
    };
    
    // USDT contract address - Testnet
    const testnetContracts = {
      eth: '0x40701a30271a68cd6f1e31304e10ccd9ab92ebbb', // Sepolia testnet USDT contract
      bsc: '0x1D136Cd361e802e4Ea5785573D076d14fDE3f6e1', // BSC Testnet USDT Contract
      tron: 'TCfHDHMB3k5Ww9tcWkJQoUFFgDx8aQq6om' // Shasta testnet USDT contract
    };
    
    // Currently used contract address
    const usdtContracts = computed(() => {
      return isTestnet.value ? testnetContracts : mainnetContracts;
    });
    
    // Blockchain RPC node - Mainnet
    const mainnetRpcUrls = {
      eth: 'https://eth.llamarpc.com',
      bsc: 'https://binance.llamarpc.com',
      tron: 'https://api.trongrid.io'
    };
    
    // Blockchain RPC node - testnet
    const testnetRpcUrls = {
      eth: 'https://eth-sepolia.public.blastapi.io', // Sepolia testnet
      bsc: 'https://data-seed-prebsc-1-s1.bnbchain.org:8545', // BSC Testnet
      tron: 'https://api.shasta.trongrid.io' // Shasta Testnet
    };
    
    // Currently used RPC node
    const rpcUrls = computed(() => {
      return isTestnet.value ? testnetRpcUrls : mainnetRpcUrls;
    });
    
    // ABI for ERC20 token (USDT)
    const erc20Abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];

    const trc20Abi = [
      {
        'outputs': [{ 'type': 'uint256' }],
        'constant': true,
        'inputs': [{ 'name': 'who', 'type': 'address' }],
        'name': 'balanceOf',
        'stateMutability': 'View',
        'type': 'Function'
      },
      {
        'outputs': [{ 'type': 'bool' }],
        'inputs': [
          { 'name': '_to', 'type': 'address' },
          { 'name': '_value', 'type': 'uint256' }
        ],
        'name': 'transfer',
        'stateMutability': 'Nonpayable',
        'type': 'Function'
      }
    ];


    
    // Balance data
    const balanceData = reactive({
      hot: {
        usdt: {
          tron: 0,
          eth: 0,
          bsc: 0
        },
        pendingCollection: {
          tronUsdt: 0,
          ethUsdt: 0,
          bscUsdt: 0,
          tronTestUsdt: 0,
          ethSepoliaUsdt: 0,
          bscTestUsdt: 0
        },
        eth: 0,
        trx: 0,
        bnb: 0
      },
      cold: {
        usdt: {
          tron: 0,
          eth: 0,
          bsc: 0
        },
        eth: 0,
        trx: 0,
        bnb: 0
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

    // Today's statistics
    const todayStats = reactive({
      incomingCount: 50,
      incomingRate: '98%',
      outgoingCount: 30,
      outgoingRate: '95%'
    });

    // All statistics
    const allStats = reactive({
      incomingCount: 1000,
      incomingRate: '97%',
      outgoingCount: 800,
      outgoingRate: '96%'
    });

    // Detailed data
    const todayIncomingData = [
      { currency: 'USDT', chain: 'TRON', amount: 500.00, count: 20 },
      { currency: 'USDT', chain: 'ETH', amount: 300.00, count: 15 },
      { currency: 'USDT', chain: 'BSC', amount: 200.00, count: 10 },
      { currency: 'ETH', chain: 'ETH', amount: 10.00, count: 3 },
      { currency: 'TRX', chain: 'TRON', amount: 1000.00, count: 2 }
    ];

    const todayOutgoingData = [
      { currency: 'USDT', chain: 'TRON', amount: 300.00, count: 12 },
      { currency: 'USDT', chain: 'ETH', amount: 200.00, count: 10 },
      { currency: 'USDT', chain: 'BSC', amount: 100.00, count: 5 },
      { currency: 'ETH', chain: 'ETH', amount: 5.00, count: 2 },
      { currency: 'TRX', chain: 'TRON', amount: 500.00, count: 1 }
    ];

    const allIncomingData = [
      { currency: 'USDT', chain: 'TRON', amount: 10000.00, count: 400 },
      { currency: 'USDT', chain: 'ETH', amount: 6000.00, count: 300 },
      { currency: 'USDT', chain: 'BSC', amount: 4000.00, count: 200 },
      { currency: 'ETH', chain: 'ETH', amount: 200.00, count: 60 },
      { currency: 'TRX', chain: 'TRON', amount: 20000.00, count: 40 }
    ];

    const allOutgoingData = [
      { currency: 'USDT', chain: 'TRON', amount: 8000.00, count: 320 },
      { currency: 'USDT', chain: 'ETH', amount: 5000.00, count: 250 },
      { currency: 'USDT', chain: 'BSC', amount: 3000.00, count: 150 },
      { currency: 'ETH', chain: 'ETH', amount: 150.00, count: 50 },
      { currency: 'TRX', chain: 'TRON', amount: 15000.00, count: 30 }
    ];

    // Tab status
    const activeTab = ref('today');
    const detailType = ref('incoming');
    const detailPeriod = ref('today');

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
    
    // Edit Cold Wallet Address Dialog
    const editColdWalletDialogVisible = ref(false);
    const editColdWalletFormRef = ref(null);
    const editColdWalletForm = reactive({
      chain: '',
      address: '',
      googleCode: ''
    });
    
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
    
    // User recharge test dialog
    const userRechargeTestDialogVisible = ref(false);
    const userRechargeTestForm = reactive({
      currency: 'USDT',
      chain: 'TRON',
      amount: 0.01
    });
    
    // Open user recharge test dialog
    const openUserRechargeTestDialog = () => {
      userRechargeTestDialogVisible.value = true;
      // Set default chain based on current network
      if (isTestnet.value) {
        userRechargeTestForm.chain = 'TRON_TEST';
      } else {
        userRechargeTestForm.chain = 'TRON';
      }
    };
    
    // Jump to the user recharge test page
    const goToUserRechargeTest = () => {
      // Check whether user ID is filled in
      if (!userRechargeTestForm.uid) {
        ElMessage({
          message: 'Please enter user ID',
          type: 'warning'
        });
        return;
      }
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('currency', userRechargeTestForm.currency);
      
      if (userRechargeTestForm.currency === 'USDT') {
        queryParams.append('chain', userRechargeTestForm.chain);
      } else {
        // For non-USDT currencies, set the corresponding chain according to the currency
        const chainMap = {
          'ETH': isTestnet.value ? 'ETH_SEPOLIA' : 'ETH',
          'TRX': isTestnet.value ? 'TRON_TEST' : 'TRON',
          'BNB': isTestnet.value ? 'BSC_TEST' : 'BSC'
        };
        queryParams.append('chain', chainMap[userRechargeTestForm.currency]);
      }
      
      queryParams.append('amount', userRechargeTestForm.amount.toString());
      queryParams.append('uid', userRechargeTestForm.uid);
      
      // Close Dialog
      userRechargeTestDialogVisible.value = false;
      
      // Open the recharge test page in a new window
      window.open(`/user-recharge?${queryParams.toString()}`, '_blank');
    };
    
    // Edit cold wallet address form validation rules
    const editColdWalletRules = {
      address: [
        { required: true, message: 'Please enter wallet address', trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            const chain = editColdWalletForm.chain;
            if (chain === 'tron' && !value.startsWith('T')) {
              callback(new Error('TRON address must start with T'));
            } else if ((chain === 'eth' || chain === 'bsc') && !value.startsWith('0x')) {
              callback(new Error('ETH/BSC address must start with 0x'));
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

    // Edit callback address form validation rules
    const editCallbackRules = {
      url: [
        { required: true, message: 'Please enter callback address', trigger: 'blur' },
        { type: 'url', message: 'Please enter a valid URL', trigger: 'blur' }
      ],
      googleCode: [
        { required: true, message: 'Enter the Google verification code', trigger: 'blur' },
        { min: 6, max: 6, message: 'Google verification code must be 6 digits', trigger: 'blur' }
      ]
    };

    // Get detailed data
    const getDetailData = () => {
      if (detailPeriod.value === 'today') {
        return detailType.value === 'incoming' ? todayIncomingData : todayOutgoingData;
      } else {
        return detailType.value === 'incoming' ? allIncomingData : allOutgoingData;
      }
    };

    // Open recharge dialog
    const openRechargeDialog = () => {
      // Set default chain based on current network
      if (isTestnet.value && rechargeForm.currency === 'USDT') {
        if (rechargeForm.chain === 'TRON') rechargeForm.chain = 'TRON_TEST';
        else if (rechargeForm.chain === 'ETH') rechargeForm.chain = 'ETH_SEPOLIA';
        else if (rechargeForm.chain === 'BSC') rechargeForm.chain = 'BSC_TEST';
      }
      
      rechargeDialogVisible.value = true;
    };

    // Open withdrawal dialog
    const openWithdrawDialog = () => {
      // Set default chain based on current network
      if (isTestnet.value && withdrawForm.currency === 'USDT') {
        if (withdrawForm.chain === 'TRON') withdrawForm.chain = 'TRON_TEST';
        else if (withdrawForm.chain === 'ETH') withdrawForm.chain = 'ETH_SEPOLIA';
        else if (withdrawForm.chain === 'BSC') withdrawForm.chain = 'BSC_TEST';
      }
      
      withdrawDialogVisible.value = true;
      // Calculate the initial maximum withdrawable amount
      calculateMaxWithdrawAmount();
    };
    
    // Get the minimum withdrawal amount
    const getMinWithdrawAmount = () => {
      const currency = withdrawForm.currency;
      
      // Return the minimum withdrawal amount based on the currency
      switch(currency) {
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
    
    // Watch withdrawal form changes and recalculate the maximum withdrawable amount
    watch(
      [() => withdrawForm.currency, () => withdrawForm.chain],
      () => {
        calculateMaxWithdrawAmount();
        // console.log(withdrawForm.amount);
        withdrawForm.amount = getMinWithdrawAmount();
        // // If the current amount is less than the minimum withdrawal amount, set it to the minimum withdrawal amount
        // if (withdrawForm.amount < getMinWithdrawAmount()) {
        //   withdrawForm.amount = getMinWithdrawAmount();
        // }
        // // If the current amount exceeds the maximum withdrawable amount, set it to the maximum withdrawable amount
        // else if (withdrawForm.amount > maxWithdrawAmount.value && maxWithdrawAmount.value > getMinWithdrawAmount()) {
        //   withdrawForm.amount = maxWithdrawAmount.value;
        // }
      }
    );

    // Get recharge address
    const getRechargeAddress = () => {
      // Use hot wallet address as recharge address
      let chain = '';
      
      if (rechargeForm.currency === 'USDT') {
        // Handle USDT chain selection; need to normalize testnet and mainnet chain names
        const chainLower = rechargeForm.chain.toLowerCase();
        if (chainLower.includes('tron')) {
          chain = 'tron';
        } else if (chainLower.includes('eth')) {
          chain = 'eth';
        } else if (chainLower.includes('bsc')) {
          chain = 'bsc';
        }
      } else {
        // Handle native token
        chain = rechargeForm.currency === 'ETH' ? 'eth' : 
                rechargeForm.currency === 'TRX' ? 'tron' : 'bsc';
      }
      
      return walletAddresses.hot[chain] || '';
    };
    
    // Get withdrawal address (cold wallet address)
    const getWithdrawAddress = () => {
      // Use cold wallet address as withdrawal address
      let chain = '';
      
      if (withdrawForm.currency === 'USDT') {
        // Handle USDT chain selection; need to normalize testnet and mainnet chain names
        const chainLower = withdrawForm.chain.toLowerCase();
        if (chainLower.includes('tron')) {
          chain = 'tron';
        } else if (chainLower.includes('eth')) {
          chain = 'eth';
        } else if (chainLower.includes('bsc')) {
          chain = 'bsc';
        }
      } else {
        // Handle native token
        chain = withdrawForm.currency === 'ETH' ? 'eth' : 
                withdrawForm.currency === 'TRX' ? 'tron' : 'bsc';
      }
      
      return walletAddresses.cold[chain] || '';
    };
    
    // Maximum withdrawable amount
    const maxWithdrawAmount = ref(0);

    // TRON energy rental related
    const energyPlatform = reactive({
      isBound: true,
      trxBalance: 0,
      boundAddress: '',
      rechargeAddress: ''
    });

    const energyBindingStep = ref(0);
    const energyBindingLoading = ref(false);
    const energyBindingFormRef = ref(null);
    const energyBindingForm = reactive({
      apiKey: '',
      googleCode: ''
    });

    const energyBindingRules = {
      apiKey: [
        { required: true, message: 'Please enter API key', trigger: 'blur' }
      ],
      googleCode: [
        { required: true, message: 'Enter the Google verification code', trigger: 'blur' },
        { min: 6, max: 6, message: 'Verification code must be 6 digits', trigger: 'blur' },
        { pattern: /^[0-9]{6}$/, message: 'Verification code can only contain digits', trigger: 'blur' }
      ]
    };

    // Responsive screen size detection
    const isMobile = ref(false);
    
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth <= 768;
    };
    
    // Computed property for stepper direction
    const stepsDirection = computed(() => {
      return isMobile.value ? 'vertical' : 'horizontal';
    });
    
    // Calculate the maximum withdrawable amount (deducting gas fees and platform fees)
    const calculateMaxWithdrawAmount = async() => {
      // Get the currently selected currency and chain
      const currency = withdrawForm.currency;
      const chain = currency === 'USDT' ? withdrawForm.chain.toLowerCase() : 
                   currency === 'ETH' ? 'eth' : 
                   currency === 'TRX' ? 'tron' : 'bsc';
      
      // Get current balance
      let balance = 0;
      if (currency === 'USDT') {
        // Process chain name: lowercase and remove testnet marker
        const normalizedChain = chain.toLowerCase().replace('_test', '').replace('_sepolia', '');
        
        // Get balance using the normalized chain name
        if (normalizedChain === 'tron') {
          balance = balanceData.hot.usdt.tron;
        } else if (normalizedChain === 'eth') {
          balance = balanceData.hot.usdt.eth;
        } else if (normalizedChain === 'bsc') {
          balance = balanceData.hot.usdt.bsc;
        }
      } else if (currency === 'ETH') {
        balance = balanceData.hot.eth;
      } else if (currency === 'TRX') {
        balance = balanceData.hot.trx;
      } else if (currency === 'BNB') {
        balance = balanceData.hot.bnb;
      }
      // Calculate gas fee (varies by chain and currency)
      let gasFee = 0;
      try {
        // Process chain name: lowercase and remove testnet marker
        const normalizedChain = chain.toLowerCase().replace('_test', '').replace('_sepolia', '');
        
        if (normalizedChain === 'tron') {
          if (currency === 'USDT') {
            gasFee = 30 * 2; // TRON chain USDT transfer gas fee is about 30 TRX; gas for the fee transfer also needs to be added
          } else {
            gasFee = 1; // TRX transfer gas fee is about 0.5 TRX, plus the gas for the transfer fee
          }
        } else if (normalizedChain === 'eth') {
          const ethProvider = new ethers.JsonRpcProvider(rpcUrls.value.eth);
          const feeData = await ethProvider.getFeeData(); 
          const gasPrice = feeData.gasPrice;  // Also returns the legacy gasPrice
          // console.log('legacyGasPrice:', legacyGasPrice);
          // const gasPrice = await ethProvider.getGasPrice();  // Get current gas price (wei)
          if (currency === 'USDT') {
            const gasLimit = 85000;
            gasFee = parseFloat(ethers.formatEther(gasPrice * BigInt(gasLimit))) * 2;
          } else {
            const gasLimit = 21000;
            gasFee = parseFloat(ethers.formatEther(gasPrice * BigInt(gasLimit))) * 2;
          }
        } else if (normalizedChain === 'bsc') {
          const bscProvider = new ethers.JsonRpcProvider(rpcUrls.value.bsc);
          const feeData = await bscProvider.getFeeData(); 
          const gasPrice = feeData.gasPrice;  // Also returns the legacy gasPrice
          // const gasPrice = await bscProvider.getGasPrice();  // Get current Gas price (wei)
          if (currency === 'USDT') {
            const gasLimit = 85000;
            gasFee = parseFloat(ethers.formatEther(gasPrice * BigInt(gasLimit))) * 2;
          } else {
            const gasLimit = 21000;
            gasFee = parseFloat(ethers.formatEther(gasPrice * BigInt(gasLimit))) * 2;
          }
        }
        // console.log('gasFee:', gasFee);
      } catch (error) {
        console.error('Failed to get gas fee: using default gas fee', error);
        // Use default gas fee
        if (chain === 'eth') {
          gasFee = currency === 'USDT' ? 0.005 : 0.003;
        } else if (chain === 'bsc') {
          gasFee = currency === 'USDT' ? 0.002 : 0.001;
        }
      }
      
      // Calculate platform fee (percentage)
      const platformFeeRate = (merchant.value?.feeRatio || 0.5) / 100;
      
      // If USDT, deduct the platform fee directly from the balance
      if (currency === 'USDT') {
        const maxAmount = Math.max(balance * (1 - platformFeeRate));
        // console.log('maxAmount:', maxAmount);
        maxWithdrawAmount.value = truncateDecimal(maxAmount, 4);
      } 
      // If it is a native token, keep enough tokens to pay the gas fee
      else {
        const maxAmount = Math.max((balance - gasFee) * (1 - platformFeeRate));
        // Then deduct the platform fee
        maxWithdrawAmount.value = truncateDecimal(maxAmount, 4);
        // console.log('maxWithdrawAmount:', maxWithdrawAmount.value);
      }
      
      // Ensure the final value is a valid number
      // if (isNaN(maxWithdrawAmount.value)) {
      //   maxWithdrawAmount.value = 0;
      // }
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

    // Get TRON energy platform information
    const loadEnergyPlatformInfo = async () => {
      try {
        const { data } = await energyPlatformInfo();
        if (data && (data.trxBalance || data.boundAddress || data.rechargeAddress)) {
          energyPlatform.isBound = true;
          energyPlatform.trxBalance = data.trxBalance || 0;
          energyPlatform.boundAddress = data.boundAddress || '';
          energyPlatform.rechargeAddress = data.rechargeAddress || '';
          energyBindingStep.value = 3; // Binding completed
        } else {
          energyPlatform.isBound = false;
          energyBindingStep.value = 0;
        }
      } catch (error) {
        console.error('Failed to get energy platform info:', error);
        energyPlatform.isBound = false;
        energyBindingStep.value = 0;
      }
    };

    // Refresh energy platform information
    const refreshEnergyInfo = async () => {
      await loadEnergyPlatformInfo();
      ElMessage({
        message: 'Information refreshed',
        type: 'success'
      });
    };

    // Bind energy platform
    const bindEnergyPlatform = async () => {
      if (!energyBindingFormRef.value) return;
      
      const valid = await energyBindingFormRef.value.validate().catch(() => false);
      if (!valid) return;

      energyBindingLoading.value = true;
      try {
        await setEnergyApikey({
          apiKey: energyBindingForm.apiKey,
          code: parseInt(energyBindingForm.googleCode)
        });
        
        ElMessage({
          message: 'TRON energy rental bound successfully',
          type: 'success'
        });
        
        // Reset form
        resetEnergyBindingForm();
        
        // Reload energy platform information
        await loadEnergyPlatformInfo();
        
      } catch (error) {
        // ElMessage({
        //   message: error.message || 'Binding failed, please check the API key and verification code',
        //   type: 'error'
        // });
      } finally {
        energyBindingLoading.value = false;
      }
    };

    // Reset energy binding form
    const resetEnergyBindingForm = () => {
      energyBindingForm.apiKey = '';
      energyBindingForm.googleCode = '';
      if (energyBindingFormRef.value) {
        energyBindingFormRef.value.resetFields();
      }
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

    // Edit cold wallet address
    const editColdWalletAddress = (chain) => {
      editColdWalletForm.chain = chain;
      editColdWalletForm.address = walletAddresses.cold[chain];
      editColdWalletForm.googleCode = '';
      editColdWalletDialogVisible.value = true;
    };
    
    // Submit cold wallet address change
    const submitEditColdWallet = async() => {
      if (!editColdWalletFormRef.value) return;
      
      editColdWalletFormRef.value.validate(async(valid) => {
        if (valid) {
          const res = await updateColdAddress({chain:editColdWalletForm.chain.toUpperCase(), coldAddress:editColdWalletForm.address, code:editColdWalletForm.googleCode});
          if (res && res.code === 200) {
            walletAddresses.cold[editColdWalletForm.chain] = editColdWalletForm.address;
            ElMessage({
              message: 'Cold wallet address updated successfully',
              type: 'success'
            });
            editColdWalletDialogVisible.value = false;
          }
          
        }
      });
    };
    
    // Open the add IP whitelist dialog
    const openAddIpDialog = () => {
      addIpForm.ipList = apiInfo.ipWhitelist.join('\n');
      addIpForm.googleCode = '';
      addIpDialogVisible.value = true;
    };
    
    // Submit to add IP whitelist
    const submitAddIp = async() => {
      if (!addIpFormRef.value) return;
      
      addIpFormRef.value.validate(async(valid) => {
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
          
          const res = await setWhitelistIp({ips:ipList, code:addIpForm.googleCode});
          if(res && res.code === 200) {
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
    
    // Submit Google verification
    const submitGoogleVerify = async() => {

      if (!googleVerifyFormRef.value) return;
      
      googleVerifyFormRef.value.validate(async(valid) => {
        if (valid) {
          if (googleVerifyForm.action === 'showToken') {
            if(!apiInfo.token){
              const res = await merchantApiKey({code:googleVerifyForm.code});
              if (res && res.data) {
                  apiInfo.token = res.data.apiKey;
                  apiInfo.secret = res.data.webhookSecret;
              }
            }
            apiInfo.tokenVisible = true;
            
          } else if (googleVerifyForm.action === 'showSecret') {
            if(!apiInfo.secret){
              const res = await merchantApiKey({code:googleVerifyForm.code});
              if (res && res.data) {
                  apiInfo.token = res.data.apiKey;
                  apiInfo.secret = res.data.webhookSecret;
              }
            }
            apiInfo.secretVisible = true;
          } else if (googleVerifyForm.action === 'editColdWallet') {
            // Open the edit cold wallet address dialog after successful verification
            const chain = googleVerifyForm.data;
            editColdWalletForm.chain = chain;
            editColdWalletForm.address = walletAddresses.cold[chain];
            editColdWalletForm.googleCode = googleVerifyForm.code;
            editColdWalletDialogVisible.value = true;
          }
          
        
          googleVerifyDialogVisible.value = false;
          googleVerifyForm.code = '';
        }
      });
    };

    // Submit modified callback address
    const submitEditCallback = async() => {
      if (!editCallbackFormRef.value) return;
      
      editCallbackFormRef.value.validate(async(valid) => {
        if (valid) {
          const res = await updateCallbackUrl({callbackUrl:editCallbackForm.url, code:editCallbackForm.googleCode});
          if(res && res.code === 200) {
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
    const submitWithdraw = async() => {
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
      
      withdrawFormRef.value.validate(async(valid) => {
        if (valid) {
          const withdrawAddress = getWithdrawAddress();
          if(!withdrawAddress) {
            ElMessage({
              message: `Please set the withdrawal address first`,
              type: 'error'
            });
            return;
          }
          
          ElMessageBox.confirm(
            `Confirm withdrawal of ${withdrawForm.amount} ${withdrawForm.currency} to address ${withdrawAddress}?`,
            'Withdrawal Confirmation',
            {
              confirmButtonText: 'Confirm',
              cancelButtonText: 'Cancel',
              type: 'warning',
            }
          ).then(async() => {
            const res = await withdrawal({chain:withdrawForm.chain, address:withdrawAddress, amount:withdrawForm.amount, symbol:withdrawForm.currency, code:withdrawForm.googleCode});
            if(res && res.code === 200) {
              ElMessage({
                message: 'Withdrawal request submitted, please wait for processing',
                type: 'success'
              });
              withdrawDialogVisible.value = false;
            }else{
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
      walletTab,
      walletAddresses,
      balanceData,
      apiInfo,
      todayStats,
      allStats,
      activeTab,
      detailType,
      detailPeriod,
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
      editColdWalletDialogVisible,
      editColdWalletForm,
      editColdWalletRules,
      editColdWalletFormRef,
      // User recharge test
      userRechargeTestDialogVisible,
      userRechargeTestForm,
      openUserRechargeTestDialog,
      goToUserRechargeTest,
      getDetailData,
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
      editColdWalletAddress,
      submitGoogleVerify,
      submitEditCallback,
      submitEditColdWallet,
      submitWithdraw,
      isTestnet,
      handleNetworkChange,
      truncateDecimal,
      // IP whitelist methods
      addIpDialogVisible,
      addIpForm,
      addIpRules,
      addIpFormRef,
      openAddIpDialog,
      submitAddIp,
      // TRON energy platform
      energyPlatform,
      energyBindingStep,
      energyBindingLoading,
      energyBindingFormRef,
      energyBindingForm,
      energyBindingRules,
      loadEnergyPlatformInfo,
      refreshEnergyInfo,
      bindEnergyPlatform,
      resetEnergyBindingForm,
      // Responsive design
      isMobile,
      stepsDirection
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

.wallet-title {
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

/* TRON energy rental styles */
.energy-bound-info {
  padding: 16px;
}

.address-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.energy-bound-info .address-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #606266;
  word-break: break-all;
  flex: 1;
  min-width: 0;
}

.energy-binding-flow {
  padding: 16px;
}

.steps-container {
  margin-bottom: 24px;
}

.energy-steps {
  width: 100%;
}

.binding-content {
  width: 100%;
}

.binding-alert {
  margin-bottom: 16px;
}

.binding-steps-list {
  margin: 8px 0;
  padding-left: 20px;
}

.binding-steps-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.energy-binding-form {
  width: 100%;
  min-width: 300px;
}

.energy-binding-form .el-form-item {
  margin-bottom: 18px;
}

.energy-binding-form .el-form-item__label {
  min-width: 100px;
}

.form-actions {
  margin-top: 16px;
}

.form-actions .el-button {
  margin-right: 12px;
}

.energy-actions {
  text-align: center;
  margin-top: 16px;
}

/* Responsive design */
@media (max-width: 768px) {
  .energy-bound-info,
  .energy-binding-flow {
    padding: 12px;
  }
  
  .energy-binding-form {
    min-width: 280px;
  }
  
  .energy-binding-form .el-form-item__label {
    min-width: 80px;
  }
  
  .address-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .energy-bound-info .address-text {
    font-size: 11px;
    width: 100%;
  }
  
  .energy-steps {
    font-size: 12px;
  }
  
  .energy-steps .el-step__title {
    font-size: 12px !important;
  }
  
  .energy-steps .el-step__description {
    font-size: 11px !important;
  }
  
  .binding-steps-list {
    padding-left: 16px;
  }
  
  .binding-steps-list li {
    font-size: 13px;
    margin-bottom: 6px;
  }
  
  .energy-binding-form .el-form-item__label {
    font-size: 13px;
  }
  
  .form-actions {
    text-align: center;
  }
  
  .form-actions .el-button {
    margin: 4px;
    width: auto;
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .energy-bound-info,
  .energy-binding-flow {
    padding: 8px;
  }
  
  .steps-container {
    margin-bottom: 16px;
  }
  
  .energy-steps {
    font-size: 11px;
  }
  
  .binding-steps-list li {
    font-size: 12px;
  }
  
  .energy-binding-form {
    min-width: 250px;
  }
  
  .energy-binding-form .el-form-item__label {
    min-width: 70px;
  }
  
  .form-actions .el-button {
    width: 100%;
    margin: 4px 0;
  }
}

/* Global form width fix */
.el-form {
  min-width: 200px;
}

.el-dialog .el-form {
  width: 100%;
}
</style>
