// shared/src/types.ts
export interface Recipient {
  id?: number;
  name: string;
  relationship?: string;
  budget_allocation?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GiftItem {
  id?: number;
  recipient_id: number;
  name: string;
  description?: string;
  priority: 1 | 2 | 3 | 4 | 5;
  status: 'needed' | 'researching' | 'ready_to_buy' | 'purchased';
  target_price?: number;
  current_best_price?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  recipient?: Recipient;
}

export interface PriceHistory {
  id?: number;
  item_id: number;
  store_name: string;
  price: number;
  product_url?: string;
  scraped_at?: string;
}

export interface Purchase {
  id?: number;
  item_id: number;
  store_name?: string;
  purchase_price: number;
  purchase_date: string;
  payment_method?: string;
  receipt_photo?: string;
  was_on_sale?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  item?: GiftItem;
}

export interface Budget {
  id?: number;
  total_budget: number;
  year: number;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetAnalytics {
  total_budget: number;
  total_spent: number;
  remaining_budget: number;
  recipients_breakdown: {
    recipient_id: number;
    recipient_name: string;
    allocated: number;
    spent: number;
    remaining: number;
  }[];
}
