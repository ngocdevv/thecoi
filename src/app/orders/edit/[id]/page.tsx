"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import { useHydration } from "@/utils/useHydration";
import {
  fetchOrderById,
  updateOrder,
  addProductToOrder,
  OrderItem,
  Order,
} from "@/services/firebase";
import Link from "next/link";
import ProductSelectionModal from "@/components/ProductSelectionModal";
import { JsonProduct } from "@/types";

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isHydrated = useHydration();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    status: "",
    surcharge: 0,
    surcharge_note: "",
  });
  const [formErrors, setFormErrors] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    surcharge: "",
  });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [subtotal, setSubtotal] = useState(0);

  // Lấy thông tin đơn hàng
  useEffect(() => {
    if (!isHydrated) return;

    const loadOrder = async () => {
      try {
        setIsLoading(true);
        const orderData = await fetchOrderById(id);

        if (!orderData) {
          setError("Không tìm thấy đơn hàng");
          setIsLoading(false);
          return;
        }

        setOrder(orderData);
        setFormData({
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          customer_address: orderData.customer_address,
          status: orderData.status,
          surcharge: orderData.surcharge || 0,
          surcharge_note: orderData.surcharge_note || "",
        });

        // Tính tổng tiền sản phẩm
        const itemsTotal = orderData.items.reduce(
          (sum, item) => sum + item.total_price,
          0
        );
        setSubtotal(itemsTotal);

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Có lỗi xảy ra khi tải thông tin đơn hàng");
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [isHydrated, id]);

  // Xử lý thay đổi form
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Xử lý đặc biệt cho trường phụ thu (surcharge)
    if (name === "surcharge") {
      const numericValue = parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Xóa lỗi khi người dùng nhập
    if (name in formErrors) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Kiểm tra form
  const validateForm = (): boolean => {
    const errors = {
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      surcharge: "",
    };
    let isValid = true;

    if (!formData.customer_name.trim()) {
      errors.customer_name = "Vui lòng nhập tên khách hàng";
      isValid = false;
    }

    if (!formData.customer_phone.trim()) {
      errors.customer_phone = "Vui lòng nhập số điện thoại";
      isValid = false;
    } else if (!/^[0-9]{10,11}$/.test(formData.customer_phone.trim())) {
      errors.customer_phone = "Số điện thoại không hợp lệ";
      isValid = false;
    }

    if (!formData.customer_address.trim()) {
      errors.customer_address = "Vui lòng nhập địa chỉ";
      isValid = false;
    }

    if (formData.surcharge < 0) {
      errors.surcharge = "Phụ thu không thể là số âm";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Xử lý lưu đơn hàng
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      // Tính tổng tiền mới (subtotal + surcharge)
      const newTotalPrice = subtotal + formData.surcharge;

      await updateOrder(id, {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        status: formData.status,
        surcharge: formData.surcharge,
        surcharge_note: formData.surcharge_note,
        total_price: newTotalPrice,
      });

      // Chuyển hướng về trang danh sách đơn hàng
      router.push("/orders");
    } catch (err) {
      console.error("Error updating order:", err);
      setError("Có lỗi xảy ra khi cập nhật đơn hàng");
      setIsSaving(false);
    }
  };

  // Xử lý thêm sản phẩm vào đơn hàng
  const handleAddProduct = async (
    product: JsonProduct,
    quantity: number,
    selectedOptions: Record<number, number>
  ) => {
    if (!order) return;

    try {
      // Chuyển đổi từ selectedOptions sang OrderOption[]
      const orderOptions = Object.entries(selectedOptions).map(
        ([customizeIdStr, optionId]) => {
          const customizeId = parseInt(customizeIdStr);
          const customizeItem = product.customize_item.find(
            (item) => item.customize_id === customizeId
          );

          const option = customizeItem?.customize_options.find(
            (opt) => opt.customize_option_id === optionId
          );

          return {
            customize_id: customizeId,
            customize_name: customizeItem?.customize_item_name || "",
            option_id: optionId,
            option_name: option?.customize_option_name || "",
            price: option?.customize_price || 0,
          };
        }
      );

      // Tính tổng giá của sản phẩm
      const basePrice = product.price;
      const optionsPrice = orderOptions.reduce(
        (total, option) => total + option.price,
        0
      );
      const itemTotalPrice = (basePrice + optionsPrice) * quantity;

      // Tạo OrderItem mới
      const newItem: OrderItem = {
        product_id: product.restaurant_item_id,
        product_name: product.item_name,
        quantity: quantity,
        price: product.price,
        options: orderOptions,
        total_price: itemTotalPrice,
      };

      // Cập nhật subtotal
      const newSubtotal = subtotal + itemTotalPrice;
      setSubtotal(newSubtotal);

      // Tính tổng giá mới của đơn hàng (bao gồm phụ thu)
      const newTotalPrice = newSubtotal + formData.surcharge;

      // Thêm sản phẩm vào đơn hàng
      await addProductToOrder(id, newItem, newTotalPrice);

      // Cập nhật lại state
      setOrder({
        ...order,
        items: [...order.items, newItem],
        total_price: newTotalPrice,
      });

      // Hiển thị thông báo thành công
      alert("Đã thêm sản phẩm vào đơn hàng");
    } catch (error) {
      console.error("Error adding product to order:", error);
      alert("Có lỗi xảy ra khi thêm sản phẩm vào đơn hàng");
    }
  };

  // Translate status
  const translateStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang xử lý";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Hiển thị loading
  if (!isHydrated || isLoading) {
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

  // Hiển thị lỗi
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error || "Không tìm thấy đơn hàng"}
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/orders"
                      className="text-sm font-medium text-red-700 hover:text-red-600"
                    >
                      ← Quay lại danh sách đơn hàng
                    </Link>
                  </div>
                </div>
              </div>
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
            <h1 className="text-2xl font-semibold text-gray-900">
              Chỉnh sửa đơn hàng
            </h1>
            <Link
              href="/orders"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ← Quay lại
            </Link>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Thông tin đơn hàng */}
                  <div className="sm:col-span-6">
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-2">
                        Thông tin đơn hàng
                      </h2>
                      <p className="text-sm text-gray-700">
                        Mã đơn hàng:{" "}
                        <span className="font-medium">{order?.id}</span>
                      </p>
                      <p className="text-sm text-gray-700">
                        Ngày đặt:{" "}
                        <span className="font-medium">
                          {order &&
                            new Intl.DateTimeFormat("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(order.created_at)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Thông tin khách hàng */}
                  <div className="sm:col-span-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      Thông tin khách hàng
                    </h2>
                  </div>

                  {/* Tên khách hàng */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="customer_name"
                      className="block text-sm font-medium text-gray-800"
                    >
                      Tên khách hàng <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="customer_name"
                        id="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800 ${
                          formErrors.customer_name ? "border-red-300" : ""
                        }`}
                      />
                      {formErrors.customer_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.customer_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Số điện thoại */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="customer_phone"
                      className="block text-sm font-medium text-gray-800"
                    >
                      Số điện thoại <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="customer_phone"
                        id="customer_phone"
                        value={formData.customer_phone}
                        onChange={handleChange}
                        className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800 ${
                          formErrors.customer_phone ? "border-red-300" : ""
                        }`}
                      />
                      {formErrors.customer_phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.customer_phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="customer_address"
                      className="block text-sm font-medium text-gray-800"
                    >
                      Địa chỉ <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="customer_address"
                        name="customer_address"
                        rows={3}
                        value={formData.customer_address}
                        onChange={handleChange}
                        className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800 ${
                          formErrors.customer_address ? "border-red-300" : ""
                        }`}
                      />
                      {formErrors.customer_address && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.customer_address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Trạng thái đơn hàng */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-800"
                    >
                      Trạng thái đơn hàng
                    </label>
                    <div className="mt-1">
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800"
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </div>
                  </div>

                  {/* Phụ thu */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="surcharge"
                      className="block text-sm font-medium text-gray-800"
                    >
                      Phụ thu (VNĐ)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="surcharge"
                        id="surcharge"
                        min="0"
                        step="1000"
                        value={formData.surcharge}
                        onChange={handleChange}
                        className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800 ${
                          formErrors.surcharge ? "border-red-300" : ""
                        }`}
                      />
                      {formErrors.surcharge && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.surcharge}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ghi chú phụ thu */}
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="surcharge_note"
                      className="block text-sm font-medium text-gray-800"
                    >
                      Ghi chú phụ thu
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="surcharge_note"
                        id="surcharge_note"
                        value={formData.surcharge_note}
                        onChange={handleChange}
                        placeholder="Ví dụ: Phí giao hàng, phí đóng gói..."
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-800"
                      />
                    </div>
                  </div>

                  {/* Danh sách sản phẩm */}
                  <div className="sm:col-span-6 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900">
                        Sản phẩm đã đặt
                      </h2>
                      <button
                        type="button"
                        onClick={() => setIsProductModalOpen(true)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg
                          className="-ml-0.5 mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Thêm sản phẩm
                      </button>
                    </div>
                    <div className="border rounded-md divide-y divide-gray-200">
                      {order?.items.map((item, index) => (
                        <div key={index} className="p-4">
                          <div className="flex justify-between">
                            <div className="font-medium">
                              {item.quantity} x {item.product_name}
                            </div>
                            <div>
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(item.price)}
                            </div>
                          </div>
                          {item.options.length > 0 && (
                            <div className="mt-1 pl-4 text-sm text-gray-500">
                              {item.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className="flex justify-between"
                                >
                                  <div>
                                    {option.customize_name}:{" "}
                                    {option.option_name}
                                  </div>
                                  {option.price > 0 && (
                                    <div>
                                      +
                                      {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      }).format(option.price)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-1 text-right text-sm font-medium">
                            Tổng:{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.total_price)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tổng tiền và phụ thu */}
                    <div className="mt-4 border-t pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-800">
                          Tổng tiền sản phẩm:
                        </span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="font-medium text-gray-800">
                          Phụ thu{" "}
                          {formData.surcharge_note
                            ? `(${formData.surcharge_note})`
                            : ""}
                          :
                        </span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(formData.surcharge)}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium text-lg mt-2 border-t pt-2">
                        <span className="text-gray-900">Tổng cộng:</span>
                        <span className="text-indigo-700">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(subtotal + formData.surcharge)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Link
                    href="/orders"
                    className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Hủy
                  </Link>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      isSaving
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}
