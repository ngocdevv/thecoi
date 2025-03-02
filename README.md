# BE Food Manager

Ứng dụng quản lý sản phẩm và đơn hàng cho cửa hàng thức ăn.

## Tính năng

- Hiển thị danh sách sản phẩm
- Xem chi tiết sản phẩm
- Thêm sản phẩm vào giỏ hàng với các tùy chọn (topping, đường, đá...)
- Quản lý giỏ hàng (thêm, xóa, cập nhật số lượng)
- Đặt hàng với thông tin khách hàng
- Xem lịch sử đơn hàng

## Công nghệ sử dụng

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Firebase (Firestore)
- React Query

## Cài đặt

1. Clone repository:

```bash
git clone <repository-url>
cd thecoi
```

2. Cài đặt các dependencies:

```bash
npm install
```

3. Cấu hình Firebase:

Dự án đã được cấu hình với Firebase. Thông tin cấu hình Firebase đã được thiết lập trong file `src/services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC8NHW5TZZf3nA3uAs471sW2muWtpF3_0U",
  authDomain: "thekoi-fb902.firebaseapp.com",
  projectId: "thekoi-fb902",
  storageBucket: "thekoi-fb902.firebasestorage.app",
  messagingSenderId: "716256891204",
  appId: "1:716256891204:web:d4f9e6688d9eaf3000c711",
  measurementId: "G-EQBQFLMMV7",
};
```

4. Khởi tạo dữ liệu mẫu trong Firebase:

```bash
node src/scripts/init-firebase.js
```

5. Chạy ứng dụng ở môi trường development:

```bash
npm run dev
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000).

## Cấu trúc dữ liệu Firebase

### Collections

1. **categories**

   - `category_id`: number
   - `category_name`: string
   - `category_active`: number

2. **products**

   - `restaurant_item_id`: number
   - `restaurant_id`: number
   - `merchant_id`: number
   - `restaurant_name`: string
   - `restaurant_address`: string
   - `price`: number
   - `old_price`: number
   - `offer_text`: string
   - `offers_discount`: boolean
   - `item_image`: string
   - `item_image_compressed`: string
   - `item_image_compressed_web`: string
   - `item_image_compressed_cover`: string
   - `display_price`: string
   - `display_old_price`: string
   - `item_name`: string
   - `item_details`: string
   - `stock_used`: number
   - `order_count`: number
   - `calories`: number
   - `carbs`: number
   - `fats`: number
   - `proteins`: number
   - `is_active`: number
   - `minimum_order_amount`: number
   - `like_count`: number
   - `dislike_count`: number
   - `parent_item_id`: number
   - `is_veg`: number
   - `show_food_type`: number
   - `category_id`: number (reference to categories)

3. **customize_items**

   - `customize_id`: number
   - `customize_item_name`: string
   - `customize_item_limit`: number
   - `customize_item_lower_limit`: number
   - `is_required`: boolean
   - `is_check_box`: number
   - `position`: number
   - `customize_active`: number
   - `product_id`: number (reference to products)

4. **customize_options**

   - `customize_option_id`: number
   - `customize_option_name`: string
   - `is_default`: boolean
   - `customize_price`: number
   - `customize_display_price`: string
   - `customize_calories`: number
   - `customize_fats`: number
   - `customize_carbs`: number
   - `customize_proteins`: number
   - `customize_option_active`: number
   - `customize_option_display_order`: number

5. **orders**
   - `customer_name`: string
   - `customer_phone`: string
   - `customer_address`: string
   - `items`: array
     - `product_id`: number
     - `product_name`: string
     - `quantity`: number
     - `price`: number
     - `options`: array
       - `customize_id`: number
       - `customize_name`: string
       - `option_id`: number
       - `option_name`: string
       - `price`: number
     - `total_price`: number
   - `total_price`: number
   - `status`: string (pending, processing, completed, cancelled)
   - `created_at`: timestamp

## Quy trình làm việc

1. **Quản lý sản phẩm**

   - Xem danh sách sản phẩm
   - Xem chi tiết sản phẩm

2. **Giỏ hàng**

   - Thêm sản phẩm vào giỏ hàng với các tùy chọn
   - Điều chỉnh số lượng
   - Xóa sản phẩm khỏi giỏ hàng

3. **Đặt hàng**

   - Nhập thông tin khách hàng
   - Xác nhận đơn hàng
   - Lưu đơn hàng vào Firebase

4. **Quản lý đơn hàng**
   - Xem danh sách đơn hàng
   - Xem chi tiết đơn hàng

## Tác giả

- Tên tác giả

## Giấy phép

MIT
