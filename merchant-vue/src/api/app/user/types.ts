export interface UserVO {
  /**
   * User ID
   */
  userId: string | number;

  /**
   * User ID
   */
  userCode: string;

  /**
   * User Account
   */
  userName: string;

  /**
   * User Nickname
   */
  nickName: string;

  /**
   * User Type
   */
  userType: string;

  /**
   * User email
   */
  email: string;

  /**
   * Mobile area code
   */
  areacode: string;

  /**
   * Mobile number
   */
  phonenumber: string;

  /**
   * User gender (0 male, 1 female, 2 unknown)
   */
  sex: string;

  /**
   * Avatar URL
   */
  avatar: number;

  /**
   * Password
   */
  password: string;

  /**
   * VIP Level
   */
  vipLevel: number;

  /**
   * Payment password
   */
  payPwd: string;

  /**
   * Invitation Code
   */
  inviteCode: string;

  /**
   * Referrer ID
   */
  parentId: string | number;

  /**
   * Number of valid referrals
   */
  validRecommend: string | number;

  /**
   * Points
   */
  point: number;

  /**
   * Account status (0 Normal, 1 Disabled)
   */
  status: string;

  /**
   * Last Login IP
   */
  loginIp: string;

  /**
   * Created At
   */
  createTime: string;

  /**
   * Updated At
   */
  updateTime: string;

}

export interface UserForm extends BaseEntity {
  /**
   * User Account
   */
  userName?: string;

  /**
   * User Nickname
   */
  nickName?: string;

  /**
   * User Type
   */
  userType?: string;

  /**
   * User email
   */
  email?: string;

  /**
   * Mobile area code
   */
  areacode?: string;

  /**
   * Mobile number
   */
  phonenumber?: string;

  /**
   * User gender (0 male, 1 female, 2 unknown)
   */
  sex?: string;

  /**
   * Avatar URL
   */
  avatar?: number;

  /**
   * Password
   */
  password?: string;

  /**
   * VIP Level
   */
  vipLevel?: number;

  /**
   * Payment password
   */
  payPwd?: string;

  /**
   * Invitation Code
   */
  inviteCode?: string;

  /**
   * Referrer ID
   */
  parentId?: string | number;

  /**
   * Referrer IDs
   */
  referrerIds?: string | number;

  /**
   * Points
   */
  point?: number;

  /**
   * Account status (0 Normal, 1 Disabled)
   */
  status?: string;

  /**
   * Remark
   */
  remark?: string;

}

export interface UserQuery extends PageQuery {

  /**
   * User Account
   */
  userName?: string;

  /**
   * User Nickname
   */
  nickName?: string;

  /**
   * User Type
   */
  userType?: string;

  /**
   * User email
   */
  email?: string;

  /**
   * Mobile area code
   */
  areacode?: string;

  /**
   * Mobile number
   */
  phonenumber?: string;

  /**
   * User gender (0 male, 1 female, 2 unknown)
   */
  sex?: string;

  /**
   * Avatar URL
   */
  avatar?: number;

  /**
   * Password
   */
  password?: string;

  /**
   * VIP Level
   */
  vipLevel?: number;

  /**
   * Payment password
   */
  payPwd?: string;

  /**
   * Invitation Code
   */
  inviteCode?: string;

  /**
   * Referrer ID
   */
  parentId?: string | number;

  /**
   * Referrer IDs
   */
  referrerIds?: string | number;

  /**
   * Points
   */
  point?: number;

  /**
   * Account status (0 Normal, 1 Disabled)
   */
  status?: string;

  /**
   * Last Login IP
   */
  loginIp?: string;

  /**
   * Last Login Time
   */
  loginDate?: string;

    /**
     * Date range parameter
     */
    params?: any;
}



