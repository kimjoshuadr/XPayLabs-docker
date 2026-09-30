<template>
  <div class="user-recharge-page">
    <div class="header">
      <h1>User Recharge <el-tag :type="isTestnet ? 'warning' : 'success'" size="small">{{ isTestnet ? 'Testnet' : 'Mainnet' }}</el-tag>
      </h1>
      <el-button type="primary" size="small" @click="goBack">Back</el-button>
    </div>

    <!-- Recharge Amount Display -->
    <div class="amount-display">
      <span class="amount-value">{{ amount }} {{ currency }}</span>
    </div>

    <!-- Recharge Address and QR Code -->
    <el-card shadow="hover" class="card-container">
      <template #header>
        <div class="card-header">
          <span>Recharge Address</span>
        </div>
      </template>
      <div class="address-value">
        <el-input :value="address" size="small" readonly>
          <template #append>
            <el-button @click="copyText(address)">
              <el-icon>
                <CopyDocument />
              </el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
      <div class="qrcode-container">
        <qrcode-vue :value="address" :size="180" level="H" class="qrcode-image" />
      </div>
    </el-card>

    <!-- Order Information -->
    <el-card shadow="hover" class="card-container">
      <template #header>
        <div class="card-header">
          <span>Order Info</span>
        </div>
      </template>
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="Currency">{{ currency }}</el-descriptions-item>
        <el-descriptions-item label="Chain">{{ getChainDisplayName(chain) }}</el-descriptions-item>
        <!-- <el-descriptions-item label="User ID">{{ uid }}</el-descriptions-item> -->
        <el-descriptions-item label="Order ID">
          {{ orderId }}
          <el-button link type="primary" size="small" @click="copyText(orderId)">
            <el-icon>
              <CopyDocument />
            </el-icon>
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="Status">
          <el-tag :type="getStatusType(orderStatus)">{{ getStatusText(orderStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Expiration Time" v-if="expiryTimeRemaining > 0">
          <span class="countdown">{{ formatCountdown(expiryTimeRemaining) }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-alert title="Recharge Notice" type="warning" description="Please transfer only through official channels. Your recharge will be credited after block confirmation. Do not send any assets other than the specified currency to the address above, or the assets may be unrecoverable." show-icon
      :closable="false" class="recharge-alert" />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { CopyDocument } from '@element-plus/icons-vue';
import QrcodeVue from 'qrcode.vue';
import { testUserRecharge, testUserGetOrderStatus } from '@/api/xpay/merchant';

export default {
  components: {
    CopyDocument,
    QrcodeVue
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    // Get data from URL parameters
    const currency = ref('');
    const chain = ref('');
    const amount = ref(0);
    const uid = ref('');
    const address = ref('');
    const isTestnet = ref(false);
    const orderId = ref('');
    const orderStatus = ref('PENDING');
    const expiryTime = ref(null);
    const expiryTimeRemaining = ref(0);
    let statusCheckInterval = null;
    let countdownInterval = null;

    onMounted(async () => {
      // Get data from URL query parameters
      currency.value = route.query.currency || 'USDT';
      chain.value = route.query.chain || 'TRON';
      amount.value = parseFloat(route.query.amount || '100');
      uid.value = route.query.uid || '';
      // Check whether it is a testnet
      isTestnet.value = route.query.network === 'TEST';

      // Check local storage for unfinished orders
      const savedOrderData = localStorage.getItem(`recharge_order_${uid.value}_${currency.value}_${chain.value}_${amount.value}`);
      // console.log('Saved order data:', savedOrderData);
      if (savedOrderData) {
        try {
          const orderData = JSON.parse(savedOrderData);

          // Check whether the order has expired
          const now = new Date();
          const expiryDate = new Date(orderData.expiryTime);
          const isExpired = !expiryDate || now > expiryDate;
          // console.log('Order is expired:', isExpired)
          // If the order is not expired or the status is not PENDING, query the order status first
          if (!isExpired) {
            // Restore order data
            address.value = orderData.address;
            orderId.value = orderData.orderId;
            orderStatus.value = orderData.status;
            expiryTime.value = orderData.expiryTime ? new Date(orderData.expiryTime) : null;
            amount.value = orderData.amount;

            // Query latest order status
            await getOrderStatus(orderData.orderId);

            // If the order is still valid, set up countdown and status check
            if (!['SUCCESS', 'FAILED', 'EXPIRED'].includes(orderStatus.value)) {
              // Set countdown
              updateExpiryTimeRemaining();

              // Set a timer to update the countdown every second
              countdownInterval = setInterval(updateExpiryTimeRemaining, 1000);

              // Set a timer to query order status every 10 seconds
              statusCheckInterval = setInterval(() => {
                getOrderStatus(orderId.value);
              }, 5000);

              // console.log('Restored existing order:', orderData);
              return; // Do not create a new order
            }
          }
        } catch (err) {
          console.error('Error parsing saved order data:', err);
        }
      }

      // If there is no valid incomplete order, create a new order
      createCollectionOrder();
    });

    onUnmounted(() => {
      // Clear timer
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    });

    const generateOrderId = () => {
      return `test-payin-${Date.now()}`;
    }

    const createCollectionOrder = async () => {
      try {

        const response = await testUserRecharge({
          amount: amount.value,
          symbol: currency.value,
          chain: chain.value,
          uid: uid.value || 'test-user',
          orderId: generateOrderId()
        });

        console.log(response);

        // Create payment data for QR code
        if (response && response.code === 200 && response.data && response.data.address) {
          const paymentData = {
            amount: response.data.amount || amount.value,
            symbol: response.data.symbol || currency.value,
            chain: response.data.chain || chain.value,
            address: response.data.address,
            status: response.data.status || 'PENDING', // Use uppercase status to match the API format
            expiryTime: response.data.expiredTime ? new Date(response.data.expiredTime * 1000) : new Date(Date.now() + 30 * 60 * 1000), // Default 30 min expiry if not provided
            orderId: response.data.orderId,
            orderType: response.data.orderType || 'COLLECTION'
          };

          address.value = paymentData.address;
          orderId.value = paymentData.orderId;
          orderStatus.value = paymentData.status;
          expiryTime.value = paymentData.expiryTime;

          // Save order data to local storage
          saveOrderToLocalStorage(paymentData);

          // Set countdown
          updateExpiryTimeRemaining();

          // Set a timer to update the countdown every second
          countdownInterval = setInterval(updateExpiryTimeRemaining, 1000);

          // Set a timer to query order status every 10 seconds
          statusCheckInterval = setInterval(() => {
            getOrderStatus(orderId.value);
          }, 10000);

          console.log('Payment data created:', paymentData);
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Update countdown remaining time
    const updateExpiryTimeRemaining = () => {
      if (!expiryTime.value) return;

      const now = new Date();
      const remaining = expiryTime.value.getTime() - now.getTime();
      expiryTimeRemaining.value = Math.max(0, Math.floor(remaining / 1000));

      // If expired and status is still PENDING, update status to EXPIRED
      if (expiryTimeRemaining.value <= 0 && orderStatus.value === 'PENDING') {
        orderStatus.value = 'EXPIRED';
        // Clear status query timer
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
        }
      }
    };

    // Format countdown display
    const formatCountdown = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Get tag type corresponding to status
    const getStatusType = (status) => {
      const statusMap = {
        'INIT': 'warning',
        'PENDING': 'warning',
        'PENDING_CONFIRMATION': 'info',
        'SUCCESS': 'success',
        'FAILED': 'danger',
        'EXPIRED': 'info'
      };
      return statusMap[status] || 'info';
    };

    // Get the Chinese text corresponding to the status
    const getStatusText = (status) => {
      const statusMap = {
        'INIT': 'Waiting',
        'PENDING': 'Waiting',
        'PENDING_CONFIRMATION': 'Confirming',
        'SUCCESS': 'Completed',
        'FAILED': 'Failed',
        'EXPIRED': 'Expired'
      };
      return statusMap[status] || status;
    };

    // Save order data to local storage
    const saveOrderToLocalStorage = (orderData) => {
      try {
        const storageKey = `recharge_order_${uid.value}_${currency.value}_${chain.value}_${amount.value}`;
        localStorage.setItem(storageKey, JSON.stringify({
          address: orderData.address,
          orderId: orderData.orderId,
          status: orderData.status,
          expiryTime: orderData.expiryTime,
          amount: orderData.amount,
          symbol: orderData.symbol,
          chain: orderData.chain,
          createdAt: new Date().toISOString()
        }));
      } catch (err) {
        console.error('Error saving order to local storage:', err);
      }
    };

    // Clear order data from local storage
    const clearOrderFromLocalStorage = () => {
      try {
        const storageKey = `recharge_order_${uid.value}_${currency.value}_${chain.value}`;
        localStorage.removeItem(storageKey);
      } catch (err) {
        console.error('Error clearing order from local storage:', err);
      }
    };

    const getOrderStatus = async (orderId) => {
      try {

        const response = await testUserGetOrderStatus(orderId);
        console.log('Get order status:', response);

        // Update order status
        if (response && response.code === 200 && response.data) {
          orderStatus.value = response.data.status || orderStatus.value;

          // Update order status in local storage
          const storageKey = `recharge_order_${uid.value}_${currency.value}_${chain.value}`;
          const savedOrderData = localStorage.getItem(storageKey);
          if (savedOrderData) {
            try {
              const orderData = JSON.parse(savedOrderData);
              orderData.status = orderStatus.value;
              localStorage.setItem(storageKey, JSON.stringify(orderData));
            } catch (err) {
              console.error('Error updating order status in local storage:', err);
            }
          }

          // If the order is completed or failed, clear the timer and local storage
          if (['SUCCESS', 'FAILED', 'EXPIRED'].includes(orderStatus.value)) {
            if (statusCheckInterval) {
              clearInterval(statusCheckInterval);
            }

            // Clear local storage after a delay so the user has time to see the final state
            setTimeout(() => {
              clearOrderFromLocalStorage();
            }, 60000); // Clear after 1 minute
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Get chain display name
    const getChainDisplayName = (chainCode) => {
      const chainMap = {
        'TRON': 'TRON (Mainnet)',
        'TRON_TEST': 'TRON (Testnet)',
        'ETH': 'ETH (Mainnet)',
        'ETH_SEPOLIA': 'ETH (Sepolia Testnet)',
        'BSC': 'BSC (Mainnet)',
        'BSC_TEST': 'BSC (Testnet)'
      };

      return chainMap[chainCode] || chainCode;
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

    // Return to previous page
    const goBack = () => {
      router.push('/');
    };

    // Simulate successful recharge
    const simulateRecharge = () => {
      // Update order status to completed
      orderStatus.value = 'COMPLETED';

      // Update order status in local storage
      const storageKey = `recharge_order_${uid.value}_${currency.value}_${chain.value}`;
      const savedOrderData = localStorage.getItem(storageKey);
      if (savedOrderData) {
        try {
          const orderData = JSON.parse(savedOrderData);
          orderData.status = 'COMPLETED';
          localStorage.setItem(storageKey, JSON.stringify(orderData));
        } catch (err) {
          console.error('Error updating order status in local storage:', err);
        }
      }

      // Clear timer
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }

      ElMessage({
        message: `Simulated recharge of ${amount.value} ${currency.value} successful!`,
        type: 'success'
      });

      setTimeout(() => {
        // Clear order data from local storage
        clearOrderFromLocalStorage();
        goBack();
      }, 2000);
    };

    return {
      currency,
      chain,
      amount,
      uid,
      address,
      isTestnet,
      orderId,
      orderStatus,
      expiryTime,
      expiryTimeRemaining,
      getChainDisplayName,
      getStatusType,
      getStatusText,
      formatCountdown,
      copyText,
      goBack,
      simulateRecharge
    };
  }
};
</script>

<style scoped>
.user-recharge-page {
  padding: 15px;
  max-width: 500px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount-display {
  text-align: center;
  margin: 15px 0;
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 4px;
}

.amount-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.card-container {
  margin-bottom: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-value {
  margin-bottom: 15px;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.qrcode-image {
  width: 180px;
  height: 180px;
}

.recharge-alert {
  margin: 15px 0;
  font-size: 12px;
}

.countdown {
  font-family: monospace;
  font-weight: bold;
  font-size: 14px;
  color: #E6A23C;
}

/* Responsive layout */
@media screen and (max-width: 768px) {
  .user-recharge-page {
    padding: 10px;
  }

  .qrcode-image {
    width: 150px;
    height: 150px;
  }

  .amount-value {
    font-size: 20px;
  }
}
</style>
