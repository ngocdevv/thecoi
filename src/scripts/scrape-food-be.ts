import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Category, Product, Restaurant } from '@/types';

// Thông tin mặc định cho client
const defaultClientInfo = {
  locale: "vi",
  app_version: "11269",
  version: "1.1.269",
  device_type: 3,
  customer_package_name: "xyz.be.food",
  device_token: "597337fe136719a0adaa83607a5d4aa7",
  operator_token: "0b28e008bc323838f5ec84f718ef11e6",
  screen_height: 640,
  screen_width: 360,
  ad_id: ""
};

// Vị trí mặc định (HCMC)
const defaultLocation = {
  latitude: 10.77253621500006,
  longitude: 106.69798153800008
};

// Định nghĩa kiểu dữ liệu cho API response
interface ApiRestaurant {
  id: number | string;
  name: string;
  description?: string;
  address?: string;
  image_url?: string;
}

interface ApiCategory {
  id: number | string;
  name: string;
  description?: string;
}

interface ApiProduct {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id: number | string;
  options?: ApiProductOption[];
}

interface ApiProductOption {
  id: number | string;
  name: string;
  price?: number;
}

/**
 * Lấy dữ liệu nhà hàng từ API BE Food
 */
async function fetchRestaurantData(restaurantId: string): Promise<Restaurant | null> {
  try {
    // Tạo API client
    const api = axios.create({
      baseURL: 'https://gw.be.com.vn/api/v1/be-marketplace/web',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJhdWQiOiJndWVzdCIsImV4cCI6MTc0MTAwODAwNiwiaWF0IjoxNzQwOTIxNjA2LCJpc3MiOiJiZS1kZWxpdmVyeS1nYXRld2F5In0.BdLp3T64n0Ix7_evEHG2pduzrIHLGt6gbqrLyjN1t5Q',
        'app_version': '11269',
        'version': '1.1.269'
      },
    });

    // Tạo payload cho request
    const payload = {
      ...defaultClientInfo,
      ...defaultLocation,
      restaurant_id: restaurantId
    };

    console.log(`Fetching data for restaurant ID: ${restaurantId}...`);

    // Gọi API
    const response = await api.post('/restaurant/detail', payload);

    if (response.data && response.data.data && response.data.data.restaurant) {
      // Chuyển đổi dữ liệu từ API sang định dạng Restaurant của chúng ta
      const apiRestaurant: ApiRestaurant = response.data.data.restaurant;
      const apiCategories: ApiCategory[] = response.data.data.categories || [];
      const apiProducts: ApiProduct[] = response.data.data.products || [];

      console.log(`Restaurant: ${apiRestaurant.name}`);
      console.log(`Categories: ${apiCategories.length}`);
      console.log(`Products: ${apiProducts.length}`);

      // Tạo đối tượng Restaurant
      const restaurant: Restaurant = {
        id: apiRestaurant.id.toString(),
        name: apiRestaurant.name,
        description: apiRestaurant.description || '',
        address: apiRestaurant.address || '',
        image: apiRestaurant.image_url || '',
        categories: []
      };

      // Xử lý categories và products
      apiCategories.forEach((apiCategory: ApiCategory) => {
        const category: Category = {
          id: apiCategory.id.toString(),
          name: apiCategory.name,
          description: apiCategory.description || '',
          products: []
        };

        // Lọc sản phẩm thuộc category này
        const categoryProducts = apiProducts.filter(
          (product: ApiProduct) => product.category_id === apiCategory.id
        );

        console.log(`Category ${apiCategory.name}: ${categoryProducts.length} products`);

        // Thêm sản phẩm vào category
        categoryProducts.forEach((apiProduct: ApiProduct) => {
          const product: Product = {
            id: apiProduct.id.toString(),
            name: apiProduct.name,
            description: apiProduct.description || '',
            price: apiProduct.price || 0,
            image: apiProduct.image_url || '',
            options: apiProduct.options?.map((opt: ApiProductOption) => ({
              id: opt.id.toString(),
              name: opt.name,
              price: opt.price || 0
            })) || []
          };

          category.products.push(product);
        });

        restaurant.categories.push(category);
      });

      return restaurant;
    } else {
      console.error('Invalid API response format:', response.data);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching restaurant data for ID ${restaurantId}:`, error);
    return null;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  // Danh sách ID nhà hàng cần lấy dữ liệu
  const restaurantIds = ['30806', '30792'];

  for (const restaurantId of restaurantIds) {
    const restaurant = await fetchRestaurantData(restaurantId);

    if (restaurant) {
      // Create the data directory if it doesn't exist
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Save the restaurant data to a JSON file
      const filePath = path.join(dataDir, `restaurant-${restaurantId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(restaurant, null, 2));

      console.log(`Restaurant data saved to: ${filePath}`);
      console.log(`Found ${restaurant.categories.length} categories and ${restaurant.categories.reduce((total, cat) => total + cat.products.length, 0)} products.`);
    } else {
      console.error(`Failed to fetch data for restaurant ID: ${restaurantId}`);
    }
  }
}

// Run the main function
main().catch(console.error); 