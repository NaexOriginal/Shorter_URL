export interface DailyClicksPoint {
  date: string;
  count: number;
}

export interface TopLinkStat {
  short_code: string;
  target_url: string;
  clicks: number;
}

export interface TopCountryStat {
  country: string;
  clicks: number;
}

export interface RecentClickItem {
  id: number;
  short_code: string;
  clicked_at: string;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
}

export interface AnalyticsOverview {
  clicks_by_day: DailyClicksPoint[];
  top_link: TopLinkStat | null;
  top_country: TopCountryStat | null;
  recent_clicks: RecentClickItem[];
}
