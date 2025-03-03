"use client";

import { useState } from "react";
import { useCart, CartItem } from "@/contexts/CartContext";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHydration } from "@/utils/useHydration";

// Định nghĩa interface cho thông tin khách hàng
interface CustomerInfo {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  surcharge: number;
  surcharge_note: string;
}

export default function CartPage() {
  const router = useRouter();
  const isHydrated = useHydration();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    saveOrder,
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    surcharge: 0,
    surcharge_note: "",
  });
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Tính tổng tiền bao gồm phụ thu
  const finalTotalPrice = totalPrice + customerInfo.surcharge;

  // Xử lý thay đổi thông tin khách hàng
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Xử lý đặc biệt cho trường surcharge để đảm bảo nó là số
    if (name === "surcharge") {
      const numericValue = parseFloat(value) || 0;
      setCustomerInfo((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setCustomerInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Xóa lỗi khi người dùng nhập
    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Kiểm tra thông tin khách hàng
  const validateCustomerInfo = () => {
    const newErrors: Record<string, string | undefined> = {};

    if (!customerInfo.customer_name.trim()) {
      newErrors.customer_name = "Vui lòng nhập tên khách hàng";
    }

    if (!customerInfo.customer_phone.trim()) {
      newErrors.customer_phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(customerInfo.customer_phone.trim())) {
      newErrors.customer_phone = "Số điện thoại không hợp lệ";
    }

    if (!customerInfo.customer_address.trim()) {
      newErrors.customer_address = "Vui lòng nhập địa chỉ";
    }

    if (customerInfo.surcharge < 0) {
      newErrors.surcharge = "Phụ thu không thể là số âm";
    }

    setErrors(newErrors as Partial<CustomerInfo>);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý thanh toán
  const handleCheckout = async () => {
    if (!validateCustomerInfo()) {
      return;
    }

    setIsCheckingOut(true);

    try {
      // Lưu đơn hàng vào Firebase
      const newOrderId = await saveOrder({
        name: customerInfo.customer_name,
        phone: customerInfo.customer_phone,
        address: customerInfo.customer_address,
        surcharge: customerInfo.surcharge,
        surcharge_note: customerInfo.surcharge_note,
      });

      setOrderId(newOrderId);
      setOrderSuccess(true);

      // Hiển thị thông báo thành công
      setTimeout(() => {
        clearCart();
        router.push("/products/table");
        setIsCheckingOut(false);
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.");
      setIsCheckingOut(false);
    }
  };

  // Chỉ hiển thị nội dung đầy đủ sau khi hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng</h1>
            <Link
              href="/products/table"
              className="text-indigo-600 hover:text-indigo-900"
            >
              Tiếp tục mua sắm
            </Link>
          </div>

          {orderSuccess && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Đặt hàng thành công! Mã đơn hàng của bạn là:{" "}
                    <span className="font-bold">{orderId}</span>
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ với bạn sớm
                    nhất có thể.
                  </p>
                </div>
              </div>
            </div>
          )}

          {items.length === 0 && !orderSuccess ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Giỏ hàng trống
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Bạn chưa thêm sản phẩm nào vào giỏ hàng.
              </p>
              <div className="mt-6">
                <Link
                  href="/products/table"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Xem sản phẩm
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Danh sách sản phẩm */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow overflow-hidden rounded-lg">
                  <ul role="list" className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onRemove={removeFromCart}
                        onUpdateQuantity={updateQuantity}
                      />
                    ))}
                  </ul>
                </div>
              </div>

              {/* Thông tin đặt hàng */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow overflow-hidden rounded-lg p-4 md:p-6 sticky top-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Thông tin đặt hàng
                  </h2>

                  {/* Form thông tin khách hàng */}
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="customer_name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Tên khách hàng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="customer_name"
                        name="customer_name"
                        value={customerInfo.customer_name}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-11 px-4 ${
                          errors.customer_name
                            ? "border-red-300 text-red-900 placeholder-red-300"
                            : "border-gray-300 text-gray-900"
                        }`}
                        placeholder="Nhập tên của bạn"
                      />
                      {errors.customer_name && (
                        <p className="mt-1.5 text-sm text-red-600">
                          {errors.customer_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="customer_phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="customer_phone"
                        id="customer_phone"
                        value={customerInfo.customer_phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-11 px-4 text-gray-900"
                        placeholder="Nhập số điện thoại"
                      />
                      {errors.customer_phone && (
                        <p className="mt-1.5 text-sm text-red-600">
                          {errors.customer_phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="customer_address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Địa chỉ <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="customer_address"
                        name="customer_address"
                        rows={3}
                        value={customerInfo.customer_address}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 px-4 py-3"
                        placeholder="Nhập địa chỉ giao hàng"
                      />
                      {errors.customer_address && (
                        <p className="mt-1.5 text-sm text-red-600">
                          {errors.customer_address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="surcharge"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Phụ thu
                        </label>
                        <input
                          type="number"
                          name="surcharge"
                          id="surcharge"
                          min="0"
                          step="1000"
                          value={customerInfo.surcharge}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-11 px-4 text-gray-900"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="surcharge_note"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Ghi chú phụ thu
                        </label>
                        <input
                          type="text"
                          name="surcharge_note"
                          id="surcharge_note"
                          value={customerInfo.surcharge_note}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-11 px-4 text-gray-900"
                          placeholder="Phí giao hàng, phí đóng gói..."
                        />
                      </div>
                    </div>

                    {/* Tóm tắt đơn hàng */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center py-2"
                          >
                            <div className="flex items-center">
                              <span className="text-sm text-gray-800">
                                {item.product.item_name}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
                                x{item.quantity}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(item.totalPrice)}
                            </span>
                          </div>
                        ))}

                        <div className="pt-4 border-t border-gray-200 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Tổng tiền sản phẩm
                            </span>
                            <span className="font-medium text-gray-900">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(totalPrice)}
                            </span>
                          </div>

                          {customerInfo.surcharge > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Phụ thu{" "}
                                {customerInfo.surcharge_note && (
                                  <span className="text-gray-500">
                                    ({customerInfo.surcharge_note})
                                  </span>
                                )}
                              </span>
                              <span className="font-medium text-gray-900">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(customerInfo.surcharge)}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between text-base font-medium pt-3 border-t border-gray-200">
                            <span className="text-gray-900">Tổng cộng</span>
                            <span className="text-indigo-600">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(finalTotalPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 space-y-4">
                          <button
                            type="button"
                            className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCheckout}
                            disabled={isCheckingOut || items.length === 0}
                          >
                            {isCheckingOut ? (
                              <div className="flex items-center justify-center">
                                <svg
                                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Đang xử lý...
                              </div>
                            ) : (
                              "Đặt hàng"
                            )}
                          </button>

                          {items.length > 0 && (
                            <button
                              type="button"
                              className="w-full px-6 py-3 text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none border border-indigo-600 rounded-md hover:bg-indigo-50"
                              onClick={clearCart}
                            >
                              Xóa tất cả sản phẩm
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Component hiển thị một mục trong giỏ hàng
function CartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}) {
  const { product, quantity, selectedOptions, totalPrice } = item;

  return (
    <li className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row">
        <div className="flex items-start">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={product.item_image || "/placeholder.png"}
              alt={product.item_name}
              width={80}
              height={80}
              className="h-full w-full object-cover object-center"
            />
          </div>

          <div className="ml-4 flex-1 text-sm">
            <div className="font-medium text-gray-900">
              <h3 className="text-base">{product.item_name}</h3>
              <p className="mt-1 text-indigo-700 font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(totalPrice)}
              </p>
            </div>

            {/* Tùy chọn đã chọn */}
            {selectedOptions.length > 0 && (
              <div className="mt-2 text-gray-600">
                <h4 className="font-medium text-gray-800">Tùy chọn:</h4>
                <ul className="mt-1 list-disc list-inside">
                  {selectedOptions.map((option, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span>
                        {option.customizeName}: {option.optionName}
                      </span>
                      {option.price > 0 && (
                        <span className="text-indigo-600">
                          +
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(option.price)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end sm:ml-4">
          <div className="flex items-center">
            <div className="flex border border-gray-300 rounded">
              <button
                type="button"
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 touch-manipulation"
                onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                disabled={quantity <= 1}
                aria-label="Giảm số lượng"
              >
                -
              </button>
              <div className="px-4 py-2 text-center min-w-[40px]">
                {quantity}
              </div>
              <button
                type="button"
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 touch-manipulation"
                onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                aria-label="Tăng số lượng"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="ml-4 text-red-500 hover:text-red-700 p-2 touch-manipulation"
              onClick={() => onRemove(item.id)}
              aria-label="Xóa sản phẩm"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
