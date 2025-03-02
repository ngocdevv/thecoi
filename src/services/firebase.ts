import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, getDoc, serverTimestamp, DocumentData, QueryDocumentSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { JsonData, JsonCategory, JsonProduct } from '@/types';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8NHW5TZZf3nA3uAs471sW2muWtpF3_0U",
  authDomain: "thekoi-fb902.firebaseapp.com",
  projectId: "thekoi-fb902",
  storageBucket: "thekoi-fb902.firebasestorage.app",
  messagingSenderId: "716256891204",
  appId: "1:716256891204:web:d4f9e6688d9eaf3000c711",
  measurementId: "G-EQBQFLMMV7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Định nghĩa kiểu dữ liệu cho Order
export interface OrderOption {
  customize_id: number;
  customize_name: string;
  option_id: number;
  option_name: string;
  price: number;
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  options: OrderOption[];
  total_price: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  total_price: number;
  surcharge: number; // Phụ thu
  surcharge_note: string; // Ghi chú phụ thu
  status: string;
  created_at: Date;
}

// Lưu dữ liệu sản phẩm vào Firestore
export const saveProductsToFirestore = async (data: JsonData): Promise<void> => {
  try {
    // Lưu categories
    const categoriesCollection = collection(db, 'categories');
    for (const category of data.categories) {
      // Tạo một bản sao của category mà không có trường items
      const { items, ...categoryData } = category;
      await addDoc(categoriesCollection, categoryData);

      // Lưu products của category
      const productsCollection = collection(db, 'products');
      for (const product of items) {
        await addDoc(productsCollection, {
          ...product,
          category_id: category.category_id
        });
      }
    }

    console.log('Data saved to Firestore successfully');
  } catch (error) {
    console.error('Error saving data to Firestore:', error);
    throw error;
  }
};

// Lấy dữ liệu sản phẩm từ Firestore
export const fetchProductsFromFirestore = async (): Promise<JsonData> => {
  try {
    // Lấy categories
    const categoriesCollection = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesCollection);
    const categoriesData = categoriesSnapshot.docs.map(doc => doc.data() as Omit<JsonCategory, 'items'>);

    // Lấy products
    const productsCollection = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCollection);
    const productsData = productsSnapshot.docs.map(doc => doc.data() as JsonProduct & { category_id?: number });

    // Gộp products vào categories tương ứng
    const categories: JsonCategory[] = categoriesData.map(category => {
      const categoryProducts = productsData.filter(
        product => product.category_id === category.category_id
      );

      return {
        ...category,
        items: categoryProducts || []
      } as JsonCategory;
    });

    return {
      categories
    };
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    throw error;
  }
};

// Lưu đơn hàng vào Firestore
export const saveOrderToFirestore = async (order: Omit<Order, 'id' | 'created_at'>): Promise<string> => {
  try {
    const ordersCollection = collection(db, 'orders');
    const orderWithTimestamp = {
      ...order,
      surcharge: order.surcharge || 0, // Đảm bảo surcharge có giá trị mặc định là 0
      surcharge_note: order.surcharge_note || '', // Đảm bảo surcharge_note có giá trị mặc định là chuỗi rỗng
      created_at: serverTimestamp()
    };

    const docRef = await addDoc(ordersCollection, orderWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
    throw error;
  }
};

// Lấy danh sách đơn hàng từ Firestore
export const fetchOrdersFromFirestore = async (): Promise<Order[]> => {
  try {
    const ordersCollection = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersCollection);

    const orders = ordersSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_address: data.customer_address,
        items: data.items,
        total_price: data.total_price,
        surcharge: data.surcharge || 0, // Đảm bảo surcharge có giá trị mặc định là 0
        surcharge_note: data.surcharge_note || '', // Đảm bảo surcharge_note có giá trị mặc định là chuỗi rỗng
        status: data.status,
        created_at: data.created_at?.toDate() || new Date(),
      } as Order;
    });

    return orders;
  } catch (error) {
    console.error('Error fetching orders from Firestore:', error);
    throw error;
  }
};

// Lấy chi tiết đơn hàng từ Firestore
export const fetchOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = doc(db, 'orders', orderId);
    const orderSnapshot = await getDoc(orderDoc);

    if (!orderSnapshot.exists()) {
      return null;
    }

    const data = orderSnapshot.data();
    return {
      id: orderSnapshot.id,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_address: data.customer_address,
      items: data.items,
      total_price: data.total_price,
      surcharge: data.surcharge || 0, // Đảm bảo surcharge có giá trị mặc định là 0
      surcharge_note: data.surcharge_note || '', // Đảm bảo surcharge_note có giá trị mặc định là chuỗi rỗng
      status: data.status,
      created_at: data.created_at?.toDate() || new Date(),
    } as Order;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  try {
    const orderDoc = doc(db, 'orders', orderId);
    await updateDoc(orderDoc, { status });
    console.log(`Order ${orderId} status updated to ${status}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Cập nhật thông tin đơn hàng
export const updateOrder = async (orderId: string, orderData: Partial<Omit<Order, 'id' | 'created_at'>>): Promise<void> => {
  try {
    const orderDoc = doc(db, 'orders', orderId);
    await updateDoc(orderDoc, orderData);
    console.log(`Order ${orderId} updated successfully`);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// Thêm sản phẩm vào đơn hàng
export const addProductToOrder = async (
  orderId: string,
  newItem: OrderItem,
  newTotalPrice: number
): Promise<void> => {
  try {
    const orderDoc = doc(db, 'orders', orderId);

    // Thêm sản phẩm vào mảng items và cập nhật tổng tiền
    await updateDoc(orderDoc, {
      items: arrayUnion(newItem),
      total_price: newTotalPrice
    });

    console.log(`Product added to order ${orderId} successfully`);
  } catch (error) {
    console.error('Error adding product to order:', error);
    throw error;
  }
}; 