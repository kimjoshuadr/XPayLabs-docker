export type DashboardRange = 'today' | '7d' | '30d';

export interface DashboardStaleTrackerVO {
  chain: string;
  lastHeight: number;
  updateTime: string;
}

export interface DashboardSymbolStatVO {
  symbol: string;
  orderType: string;
  successCount: number;
  successAmount: number | string;
}

export interface DashboardTradeBucketVO {
  totalCount: number;
  successCount: number;
  successAmount: number | string;
  successRate: string;
}

export interface DashboardAdminOverviewVO {
  merchantTotal: number;
  activeMerchantToday: number;
  todayCollectionCount: number;
  todayCollectionAmount: number | string;
  todayPayoutCount: number;
  todayPayoutAmount: number | string;
  callbackFailCount: number;
  errorBlockCount: number;
  staleTrackers: DashboardStaleTrackerVO[];
}

export interface DashboardStatsVO {
  trade: {
    collection: DashboardTradeBucketVO;
    payout: DashboardTradeBucketVO;
    bySymbol: DashboardSymbolStatVO[];
  };
  fund: {
    recharge: DashboardTradeBucketVO;
    withdraw: DashboardTradeBucketVO;
    feeTotal: number | string;
    bySymbol: DashboardSymbolStatVO[];
  };
  health: {
    failedOrderCount: number;
    expiredOrderCount: number;
    callbackFailCount: number;
    pendingConfirmCount: number;
    errorBlockCount?: number | null;
    staleTrackers?: DashboardStaleTrackerVO[] | null;
  };
}
