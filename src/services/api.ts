import axios from 'axios';
import { ApiResponse, Restaurant, Category, Product, ProductOption, JsonData } from '@/types';
import { fetchProductsFromFirestore, saveProductsToFirestore } from './firebase';

const API_BASE_URL = 'https://gw.be.com.vn/api/v1/be-marketplace/web';

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

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJhdWQiOiJndWVzdCIsImV4cCI6MTc0MTAwODAwNiwiaWF0IjoxNzQwOTIxNjA2LCJpc3MiOiJiZS1kZWxpdmVyeS1nYXRld2F5In0.BdLp3T64n0Ix7_evEHG2pduzrIHLGt6gbqrLyjN1t5Q',
    'app_version': '11269',
    'version': '1.1.269'
  },
});

export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  try {
    // Trong thực tế, chúng ta cần gọi API để lấy danh sách nhà hàng
    // Nhưng vì không có thông tin chi tiết về API này, chúng ta sẽ sử dụng mock data
    return getMockRestaurantData();
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return [];
  }
};

export const fetchRestaurantById = async (id: string): Promise<Restaurant | null> => {
  try {
    // Sử dụng API chính thức để lấy thông tin chi tiết nhà hàng
    const payload = {
      ...defaultClientInfo,
      ...defaultLocation,
      restaurant_id: id
    };

    const response = await api.post('/restaurant/detail', payload);

    if (response.data && response.data.data && response.data.data.restaurant) {
      // Chuyển đổi dữ liệu từ API sang định dạng Restaurant của chúng ta
      const apiRestaurant: ApiRestaurant = response.data.data.restaurant;
      const apiCategories: ApiCategory[] = response.data.data.categories || [];
      const apiProducts: ApiProduct[] = response.data.data.products || [];

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
    }

    // Nếu không lấy được dữ liệu từ API, sử dụng mock data
    const mockRestaurants = getMockRestaurantData();
    return mockRestaurants.find(r => r.id === id) || null;
  } catch (error) {
    console.error(`Error fetching restaurant with ID ${id}:`, error);
    // Fallback to mock data
    const mockRestaurants = getMockRestaurantData();
    return mockRestaurants.find(r => r.id === id) || null;
  }
};

// Mock data for development (in case the API is not available)
export const getMockRestaurantData = (): Restaurant[] => {
  return [
    {
      id: '30806',
      name: 'BE Food Restaurant',
      description: 'Delicious Vietnamese cuisine',
      address: '123 Nguyen Hue, District 1, Ho Chi Minh City',
      image: 'https://via.placeholder.com/400x300',
      categories: [
        {
          id: 'cat1',
          name: 'Main Dishes',
          products: [
            {
              id: 'prod1',
              name: 'Phở Bò',
              description: 'Traditional Vietnamese beef noodle soup',
              price: 75000,
              image: 'https://via.placeholder.com/300x200',
            },
            {
              id: 'prod2',
              name: 'Bún Chả',
              description: 'Grilled pork with rice noodles',
              price: 65000,
              image: 'https://via.placeholder.com/300x200',
            },
          ],
        },
        {
          id: 'cat2',
          name: 'Beverages',
          products: [
            {
              id: 'prod3',
              name: 'Vietnamese Coffee',
              description: 'Strong coffee with condensed milk',
              price: 35000,
              image: 'https://via.placeholder.com/300x200',
            },
            {
              id: 'prod4',
              name: 'Fresh Coconut',
              description: 'Refreshing coconut water',
              price: 40000,
              image: 'https://via.placeholder.com/300x200',
            },
          ],
        },
      ],
    },
    {
      id: '30792',
      name: 'Saigon Delights',
      description: 'Authentic Southern Vietnamese cuisine',
      address: '45 Le Loi, District 1, Ho Chi Minh City',
      image: 'https://via.placeholder.com/400x300',
      categories: [
        {
          id: 'cat1',
          name: 'Appetizers',
          products: [
            {
              id: 'prod1',
              name: 'Gỏi Cuốn',
              description: 'Fresh spring rolls with shrimp and herbs',
              price: 45000,
              image: 'https://via.placeholder.com/300x200',
            },
            {
              id: 'prod2',
              name: 'Chả Giò',
              description: 'Crispy fried spring rolls',
              price: 55000,
              image: 'https://via.placeholder.com/300x200',
            },
          ],
        },
        {
          id: 'cat2',
          name: 'Main Courses',
          products: [
            {
              id: 'prod3',
              name: 'Cơm Tấm',
              description: 'Broken rice with grilled pork',
              price: 65000,
              image: 'https://via.placeholder.com/300x200',
            },
            {
              id: 'prod4',
              name: 'Hủ Tiếu Nam Vang',
              description: 'Cambodian-style noodle soup',
              price: 70000,
              image: 'https://via.placeholder.com/300x200',
            },
          ],
        },
      ],
    }
  ];
};

export const loadJsonData = async (): Promise<JsonData> => {
  try {
    // Thử lấy dữ liệu từ Firestore trước
    try {
      const firestoreData = await fetchProductsFromFirestore();
      if (firestoreData && firestoreData.categories && firestoreData.categories.length > 0) {
        console.log('Loaded data from Firestore');
        return firestoreData;
      }
    } catch (firestoreError) {
      console.warn('Failed to load data from Firestore, falling back to local data:', firestoreError);
    }

    // Nếu không có dữ liệu từ Firestore, sử dụng dữ liệu local
    const data = await import('../../data.json');
    const jsonData = data as JsonData;

    // Lưu dữ liệu vào Firestore để sử dụng lần sau
    try {
      await saveProductsToFirestore(jsonData);
      console.log('Saved data to Firestore');
    } catch (saveError) {
      console.warn('Failed to save data to Firestore:', saveError);
    }

    return jsonData;
  } catch (error) {
    console.error('Error loading JSON data:', error);
    throw new Error('Failed to load JSON data');
  }
}; 