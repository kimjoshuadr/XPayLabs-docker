export interface setEnergyApikeyForm {
  apiKey: string;
  code: number;
}
export interface setWhitelistIpForm {
  ips: string;
  code: number;
}
export interface UpdateCallbackUrlForm {
  callbackUrl: string;
  code: number;
}
export interface updateColdAddressForm {
  address: string;
  chain: string;
  code: number;
}
export interface WithdrawalForm {
  chain: string;
  symbol: string;
  address: string;
  amount: number;
  code: number;
}
export interface ApiKeyVo {
  apiKey: string;
  webhookSecret: string;
}
export interface Google2fa {
  secretKey: string;
  qrCodeUrl: string;
}
export interface Verify2faForm {
  code: number;
}

export interface Verify2faSuccess {
  verify: boolean;
}

export interface MerchantVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * Merchant Name
   */
  name: string;

  /**
   * Merchant auth token
   */
  token: string;

  /**
   * Webhook Secret
   */
  webhookSecret: string;

  /**
   * VIP Level
   */
  vip: number;

  /**
   * Fee (Percentage)
   */
  feeRatio: number;

  /**
   * Withdrawal type
   */
  withdrawalType: string;

  /**
   * System version
   */
  merchantSysVersion: string;

  /**
   * Callback URL
   */
  callbackUrl: string;

  /**
   * Account Type
   */
  accountType: string;

  /**
   * Generated address type
   */
  generatedAddressType: string;

  /**
   * Created At
   */
  createTime: string;

  /**
   * Google 2FA Binding Status
   */
  googleStatus: string;
}

export interface MerchantForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * Merchant Name
   */
  name?: string;

  /**
   * Merchant auth token
   */
  token?: string;

  /**
   * Webhook Secret
   */
  webhookSecret?: string;

  /**
   * VIP Level
   */
  vip?: number;

  /**
   * Fee (Percentage)
   */
  feeRatio?: number;

  /**
   * Withdrawal type
   */
  withdrawalType?: string;

  /**
   * System version
   */
  merchantSysVersion?: string;

  /**
   * Callback URL
   */
  callbackUrl?: string;

  /**
   * Account Type
   */
  accountType?: string;

  /**
   * Generated address type
   */
  generatedAddressType?: string;
}

export interface MerchantQuery extends PageQuery {
  /**
   * Merchant Name
   */
  name?: string;

  /**
   * Merchant auth token
   */
  token?: string;

  /**
   * Webhook Secret
   */
  webhookSecret?: string;

  /**
   * VIP Level
   */
  vip?: number;

  /**
   * Fee (Percentage)
   */
  feeRatio?: number;

  /**
   * Withdrawal type
   */
  withdrawalType?: string;

  /**
   * Callback URL
   */
  callbackUrl?: string;

  /**
   * Created At
   */
  createTime?: string;

  /**
   * Date range parameter
   */
  params?: any;
}
