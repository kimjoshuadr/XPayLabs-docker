export interface ClientVO {
  /**
   * id
   */
  id: string | number;

  /**
   * Client ID
   */
  clientId: string;

  /**
   * Client Key
   */
  clientKey: string;

  /**
   * Client secret
   */
  clientSecret: string;

  /**
   * Grant type
   */
  grantTypeList: string[];

  /**
   * Device Type
   */
  deviceType: string;

  /**
   * Token activity timeout
   */
  activeTimeout: number;

  /**
   * Fixed token timeout
   */
  timeout: number;

  /**
   * Status (0 Normal, 1 Disabled)
   */
  status: string;
}

export interface ClientForm extends BaseEntity {
  /**
   * id
   */
  id?: string | number;

  /**
   * Client ID
   */
  clientId?: string | number;

  /**
   * Client Key
   */
  clientKey?: string;

  /**
   * Client secret
   */
  clientSecret?: string;

  /**
   * Grant type
   */
  grantTypeList?: string[];

  /**
   * Device Type
   */
  deviceType?: string;

  /**
   * Token activity timeout
   */
  activeTimeout?: number;

  /**
   * Fixed token timeout
   */
  timeout?: number;

  /**
   * Status (0 Normal, 1 Disabled)
   */
  status?: string;
}

export interface ClientQuery extends PageQuery {
  /**
   * Client ID
   */
  clientId?: string | number;

  /**
   * Client Key
   */
  clientKey?: string;

  /**
   * Client secret
   */
  clientSecret?: string;

  /**
   * Grant type
   */
  grantType?: string;

  /**
   * Device Type
   */
  deviceType?: string;

  /**
   * Token activity timeout
   */
  activeTimeout?: number;

  /**
   * Fixed token timeout
   */
  timeout?: number;

  /**
   * Status (0 Normal, 1 Disabled)
   */
  status?: string;
}
