import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '@/store/modules/user';
import { getToken } from '@/utils/auth';
import { tansParams, blobValidate } from '@/utils/ruoyi';
import cache from '@/plugins/cache';
import { HttpStatus } from '@/enums/RespEnum';
import { errorCode } from '@/utils/errorCode';
import { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
import FileSaver from 'file-saver';
import { getLanguage } from '@/lang';
import { encryptBase64, encryptWithAes, generateAesKey, decryptWithAes, decryptBase64 } from '@/utils/crypto';
import { encrypt, decrypt } from '@/utils/jsencrypt';
import router from '@/router';

const encryptHeader = 'encrypt-key';
let downloadLoadingInstance: LoadingInstance;
// Whether to show re-login
export const isRelogin = { show: false };
export const globalHeaders = () => {
  return {
    Authorization: 'Bearer ' + getToken(),
    clientId: import.meta.env.VITE_APP_CLIENT_ID
  };
};

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers['clientId'] = import.meta.env.VITE_APP_CLIENT_ID;
// Create axios instance
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000
});

// Request interceptor
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Corresponding i18n resource file suffix
    config.headers['Content-Language'] = getLanguage();

    const isToken = config.headers?.isToken === false;
    // Whether to prevent duplicate data submission
    const isRepeatSubmit = config.headers?.repeatSubmit === false;
    // Whether encryption is required
    const isEncrypt = config.headers?.isEncrypt === 'true';

    if (getToken() && !isToken) {
      config.headers['Authorization'] = 'Bearer ' + getToken(); // Attach a custom token to each request; modify as needed
    }
    // Map the params argument for GET request
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }

    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime()
      };
      const sessionObj = cache.session.getJSON('sessionObj');
      if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
        cache.session.setJSON('sessionObj', requestObj);
      } else {
        const s_url = sessionObj.url; // Request URL
        const s_data = sessionObj.data; // Request data
        const s_time = sessionObj.time; // Request time
        const interval = 500; // Interval (ms); shorter than this is treated as a duplicate submission
        if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
          const message = 'Data is being processed, please do not submit again';
          console.warn(`[${s_url}]: ` + message);
          return Promise.reject(new Error(message));
        } else {
          cache.session.setJSON('sessionObj', requestObj);
        }
      }
    }
    if (import.meta.env.VITE_APP_ENCRYPT === 'true') {
      // When parameter encryption is enabled
      if (isEncrypt && (config.method === 'post' || config.method === 'put')) {
        // Generate an AES key
        const aesKey = generateAesKey();
        config.headers[encryptHeader] = encrypt(encryptBase64(aesKey));
        config.data = typeof config.data === 'object' ? encryptWithAes(JSON.stringify(config.data), aesKey) : encryptWithAes(config.data, aesKey);
      }
    }
    // Remove Content-Type header for FormData requests
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor
service.interceptors.response.use(
  (res: AxiosResponse) => {
    if (import.meta.env.VITE_APP_ENCRYPT === 'true') {
      // Encrypted AES key
      const keyStr = res.headers[encryptHeader];
      // Encrypt
      if (keyStr != null && keyStr != '') {
        const data = res.data;
        // Request body AES decryption
        const base64Str = decrypt(keyStr);
        // base64 decode to get the AES key of the request header
        const aesKey = decryptBase64(base64Str.toString());
        // aesKey decodes data
        const decryptData = decryptWithAes(data, aesKey);
        // Convert the result (a JSON string) to JSON
        res.data = JSON.parse(decryptData);
      }
    }
    // Default to success status if no status code is set
    const code = res.data.code || HttpStatus.SUCCESS;
    // Get error message
    const msg = errorCode[code] || res.data.msg || errorCode['default'];
    // Return binary data directly
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data;
    }
    if (code === 401) {
      // prettier-ignore
      if (!isRelogin.show) {
        isRelogin.show = true;
        ElMessageBox.confirm('Login status has expired. You can stay on this page or log in again', 'System Prompt', {
          confirmButtonText: 'Re-login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          isRelogin.show = false;
          useUserStore().logout().then(() => {
            router.replace({
              path: '/login',
              query: {
                redirect: encodeURIComponent(router.currentRoute.value.fullPath || '/')
              }
            })
          });
        }).catch(() => {
          isRelogin.show = false;
        });
      }
      return Promise.reject('Invalid session, or the session has expired. Please log in again.');
    } else if (code === HttpStatus.SERVER_ERROR) {
      ElMessage({ message: msg, type: 'error' });
      return Promise.reject(new Error(msg));
    } else if (code === HttpStatus.WARN) {
      ElMessage({ message: msg, type: 'warning' });
      return Promise.reject(new Error(msg));
    } else if (code !== HttpStatus.SUCCESS) {
      ElNotification.error({ title: msg });
      return Promise.reject('error');
    } else {
      return Promise.resolve(res.data);
    }
  },
  (error: any) => {
    let { message } = error;
    if (message == 'Network Error') {
      message = 'Backend API connection error';
    } else if (message.includes('timeout')) {
      message = 'System API request timed out';
    } else if (message.includes('Request failed with status code')) {
      message = 'System Interface' + message.substr(message.length - 3) + 'Abnormal';
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 });
    return Promise.reject(error);
  }
);
// Generic download method
export function download(url: string, params: any, fileName: string) {
  downloadLoadingInstance = ElLoading.service({ text: 'Downloading data, please wait', background: 'rgba(0, 0, 0, 0.7)' });
  // prettier-ignore
  return service.post(url, params, {
    transformRequest: [
      (params: any) => {
        return tansParams(params);
      }
    ],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob'
  }).then(async (resp: any) => {
    const isLogin = blobValidate(resp);
    if (isLogin) {
      const blob = new Blob([resp]);
      FileSaver.saveAs(blob, fileName);
    } else {
      const blob = new Blob([resp]);
      const resText = await blob.text();
      const rspObj = JSON.parse(resText);
      const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
      ElMessage.error(errMsg);
    }
    downloadLoadingInstance.close();
  }).catch((r: any) => {
    console.error(r);
    ElMessage.error('Error downloading file. Please contact the administrator!');
    downloadLoadingInstance.close();
  });
}
// Export the axios instance
export default service;
