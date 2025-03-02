"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import {
  fetchOrdersFromFirestore,
  Order,
  updateOrderStatus,
  OrderItem,
  OrderOption,
} from "@/services/firebase";
import { useHydration } from "@/utils/useHydration";
import { useRouter } from "next/navigation";

// Hàm định dạng ngày tháng
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Hàm dịch trạng thái đơn hàng
const translateStatus = (status: string): string => {
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

export default function OrdersPage() {
  const router = useRouter();
  const isHydrated = useHydration();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const {
    data: orders,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrdersFromFirestore,
    enabled: isHydrated,
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleEditOrder = (orderId: string) => {
    router.push(`/orders/edit/${orderId}`);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
  };

  const changeOrderStatus = async (status: string) => {
    if (!selectedOrder) return;

    try {
      await updateOrderStatus(selectedOrder.id, status);
      closeStatusModal();
      refetch();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng");
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Only render the full content after hydration
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
            <h1 className="text-2xl font-semibold text-gray-900">
              Quản lý đơn hàng
            </h1>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Làm mới
            </button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {error && (
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
                    Lỗi khi tải dữ liệu đơn hàng. Vui lòng thử lại sau.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && (!orders || orders.length === 0) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Không tìm thấy đơn hàng nào
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && orders && orders.length > 0 && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Mã đơn hàng
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Khách hàng
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ngày đặt
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tổng tiền
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Trạng thái
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{order.customer_name}</div>
                        <div className="text-xs text-gray-400">
                          {order.customer_phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.total_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {translateStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Trạng thái
                          </button>
                          <button
                            onClick={() => handleEditOrder(order.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Sửa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal chi tiết đơn hàng */}
      {isModalOpen && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}

      {/* Modal cập nhật trạng thái */}
      {isStatusModalOpen && selectedOrder && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={closeStatusModal}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Cập nhật trạng thái đơn hàng
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Đơn hàng:{" "}
                        <span className="font-medium">{selectedOrder.id}</span>
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Trạng thái hiện tại:{" "}
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        >
                          {translateStatus(selectedOrder.status)}
                        </span>
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => changeOrderStatus("pending")}
                          className={`px-4 py-2 border rounded-md ${
                            selectedOrder.status === "pending"
                              ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                              : "border-gray-300 hover:bg-yellow-50"
                          }`}
                        >
                          Chờ xử lý
                        </button>
                        <button
                          onClick={() => changeOrderStatus("processing")}
                          className={`px-4 py-2 border rounded-md ${
                            selectedOrder.status === "processing"
                              ? "bg-blue-100 border-blue-300 text-blue-800"
                              : "border-gray-300 hover:bg-blue-50"
                          }`}
                        >
                          Đang xử lý
                        </button>
                        <button
                          onClick={() => changeOrderStatus("completed")}
                          className={`px-4 py-2 border rounded-md ${
                            selectedOrder.status === "completed"
                              ? "bg-green-100 border-green-300 text-green-800"
                              : "border-gray-300 hover:bg-green-50"
                          }`}
                        >
                          Hoàn thành
                        </button>
                        <button
                          onClick={() => changeOrderStatus("cancelled")}
                          className={`px-4 py-2 border rounded-md ${
                            selectedOrder.status === "cancelled"
                              ? "bg-red-100 border-red-300 text-red-800"
                              : "border-gray-300 hover:bg-red-50"
                          }`}
                        >
                          Đã hủy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeStatusModal}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Định nghĩa interface cho OrderDetailModalProps
interface OrderDetailModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

// Modal hiển thị chi tiết đơn hàng
const OrderDetailModal = ({
  order,
  isOpen,
  onClose,
}: OrderDetailModalProps) => {
  if (!isOpen || !order) return null;

  // Tính tổng tiền sản phẩm (không bao gồm phụ thu)
  const subtotal = order.items.reduce(
    (sum: number, item: OrderItem) => sum + item.total_price,
    0
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-xl font-medium text-gray-900">
            Chi tiết đơn hàng
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-700">Thông tin đơn hàng</h4>
              <p className="text-sm text-gray-600">
                Mã đơn hàng: <span className="font-medium">{order.id}</span>
              </p>
              <p className="text-sm text-gray-600">
                Ngày đặt:{" "}
                <span className="font-medium">
                  {formatDate(order.created_at)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Trạng thái:{" "}
                <span
                  className={`font-medium ${
                    order.status === "completed"
                      ? "text-green-600"
                      : order.status === "cancelled"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {translateStatus(order.status)}
                </span>
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">
                Thông tin khách hàng
              </h4>
              <p className="text-sm text-gray-600">
                Tên: <span className="font-medium">{order.customer_name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Số điện thoại:{" "}
                <span className="font-medium">{order.customer_phone}</span>
              </p>
              <p className="text-sm text-gray-600">
                Địa chỉ:{" "}
                <span className="font-medium">{order.customer_address}</span>
              </p>
            </div>
          </div>

          <h4 className="font-medium text-gray-700 mb-2">Sản phẩm đã đặt</h4>
          <div className="border rounded-md divide-y divide-gray-200">
            {order.items.map((item: OrderItem, index: number) => (
              <div key={index} className="p-3">
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
                    {item.options.map(
                      (option: OrderOption, optIndex: number) => (
                        <div key={optIndex} className="flex justify-between">
                          <div>
                            {option.customize_name}: {option.option_name}
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
                      )
                    )}
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
              <span className="font-medium">Tổng tiền sản phẩm:</span>
              <span>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="font-medium">
                Phụ thu{" "}
                {order.surcharge_note ? `(${order.surcharge_note})` : ""}:
              </span>
              <span>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(order.surcharge)}
              </span>
            </div>
            <div className="flex justify-between font-medium text-lg mt-2 border-t pt-2">
              <span>Tổng cộng:</span>
              <span className="text-indigo-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(order.total_price)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
