// Firebase initialization script
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8NHW5TZZf3nA3uAs471sW2muWtpF3_0U",
  authDomain: "thekoi-fb902.firebaseapp.com",
  projectId: "thekoi-fb902",
  storageBucket: "thekoi-fb902.firebasestorage.app",
  messagingSenderId: "716256891204",
  appId: "1:716256891204:web:d4f9e6688d9eaf3000c711",
  measurementId: "G-EQBQFLMMV7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load JSON data
const dataPath = path.join(__dirname, "../../data.json");
const jsonData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

async function initializeFirebase() {
  try {
    console.log("Bắt đầu khởi tạo dữ liệu trong Firebase...");

    // Lưu categories
    const categoriesCollection = collection(db, "categories");
    for (const category of jsonData.categories) {
      // Tạo một bản sao của category mà không có trường items
      const { items, ...categoryData } = category;
      await addDoc(categoriesCollection, categoryData);

      // Lưu products của category
      const productsCollection = collection(db, "products");
      for (const product of items) {
        await addDoc(productsCollection, {
          ...product,
          category_id: category.category_id,
        });
      }
    }

    console.log("Khởi tạo dữ liệu thành công!");
  } catch (error) {
    console.error("Lỗi khi khởi tạo dữ liệu:", error);
  }
}

// Chạy hàm khởi tạo
initializeFirebase();
