export interface Click {
  id: number;
  clicked_at: string;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
}

export interface LinkClickEvent extends Click {
  click_count: number;
}
