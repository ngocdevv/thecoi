export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image?: string;
  address?: string;
  categories: Category[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  options?: ProductOption[];
}

export interface ProductOption {
  id: string;
  name: string;
  price?: number;
}

export interface ApiResponse {
  status: number;
  data?: {
    restaurants?: Restaurant[];
  };
  message?: string;
}

// New types for the JSON data structure
export interface JsonCategory {
  category_id: number;
  category_name: string;
  category_active: number;
  items: JsonProduct[];
}

export interface JsonProduct {
  restaurant_item_id: number;
  restaurant_id: number;
  merchant_id: number;
  restaurant_name: string;
  restaurant_address: string;
  price: number;
  old_price: number;
  offer_text: string;
  offers_discount: boolean;
  item_image: string;
  item_image_compressed: string;
  item_image_compressed_web: string;
  item_image_compressed_cover: string;
  display_price: string;
  display_old_price: string;
  item_name: string;
  item_details: string;
  stock_used: number;
  order_count: number;
  calories: number;
  carbs: number;
  fats: number;
  proteins: number;
  is_active: number;
  minimum_order_amount: number;
  like_count: number;
  dislike_count: number;
  parent_item_id: number;
  customize_item: JsonCustomizeItem[];
  is_veg: number;
  show_food_type: number;
}

export interface JsonCustomizeItem {
  customize_id: number;
  customize_item_name: string;
  customize_item_limit: number;
  customize_item_lower_limit: number;
  is_required: boolean;
  is_check_box: number;
  customize_options: JsonCustomizeOption[];
  position?: number;
  customize_active?: number;
}

export interface JsonCustomizeOption {
  customize_option_id: number;
  customize_option_name: string;
  is_default: boolean;
  customize_price: number;
  customize_display_price: string;
  customize_calories: number;
  customize_fats: number;
  customize_carbs: number;
  customize_proteins: number;
  customize_option_active: number;
  customize_option_display_order: number;
}

export interface JsonData {
  categories: JsonCategory[];
} 