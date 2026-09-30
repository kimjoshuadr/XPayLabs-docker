import { MessageBoxData } from 'element-plus';
import { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
let loadingInstance: LoadingInstance;
export default {
  // Message prompt
  msg(content: any) {
    ElMessage.info(content);
  },
  // Error message
  msgError(content: any) {
    ElMessage.error(content);
  },
  // Success message
  msgSuccess(content: any) {
    ElMessage.success(content);
  },
  // Warning message
  msgWarning(content: any) {
    ElMessage.warning(content);
  },
  // Show popup prompt
  alert(content: any) {
    ElMessageBox.alert(content, 'System Prompt');
  },
  // Error message
  alertError(content: any) {
    ElMessageBox.alert(content, 'System Prompt', { type: 'error' });
  },
  // Success message
  alertSuccess(content: any) {
    ElMessageBox.alert(content, 'System Prompt', { type: 'success' });
  },
  // Warning message
  alertWarning(content: any) {
    ElMessageBox.alert(content, 'System Prompt', { type: 'warning' });
  },
  // Notification prompt
  notify(content: any) {
    ElNotification.info(content);
  },
  // Error notification
  notifyError(content: any) {
    ElNotification.error(content);
  },
  // Success notification
  notifySuccess(content: any) {
    ElNotification.success(content);
  },
  // Warning notification
  notifyWarning(content: any) {
    ElNotification.warning(content);
  },
  // Confirm window
  confirm(content: any): Promise<MessageBoxData> {
    return ElMessageBox.confirm(content, 'System Prompt', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    });
  },
  // Submit content
  prompt(content: any) {
    return ElMessageBox.prompt(content, 'System Prompt', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    });
  },
  // Open mask layer
  loading(content: string) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: content,
      background: 'rgba(0, 0, 0, 0.7)'
    });
  },
  // Close the overlay layer
  closeLoading() {
    loadingInstance.close();
  }
};
