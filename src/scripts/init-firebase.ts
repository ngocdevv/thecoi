import { saveProductsToFirestore } from '../services/firebase';
import jsonData from '../../data.json';

/**
 * Script để khởi tạo dữ liệu mẫu trong Firebase
 * 
 * Cách sử dụng:
 * 1. Cập nhật thông tin cấu hình Firebase trong src/services/firebase.ts
 * 2. Chạy lệnh: npx ts-node --project tsconfig.json -r tsconfig-paths/register src/scripts/init-firebase.ts
 */

async function initializeFirebase() {
  try {
    console.log('Bắt đầu khởi tạo dữ liệu trong Firebase...');

    // Lưu dữ liệu sản phẩm vào Firebase
    await saveProductsToFirestore(jsonData);

    console.log('Khởi tạo dữ liệu thành công!');
  } catch (error) {
    console.error('Lỗi khi khởi tạo dữ liệu:', error);
  }
}

// Chạy hàm khởi tạo
initializeFirebase(); 