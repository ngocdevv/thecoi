import { Order, OrderItem } from "@/types";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface OrderDetailModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

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

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
}: OrderDetailModalProps) {
  const subtotal = order.items.reduce(
    (sum: number, item: OrderItem) => sum + item.total_price,
    0
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg leading-6 font-medium text-gray-900"
                    >
                      Chi tiết đơn hàng
                    </Dialog.Title>
                    <div className="mt-4">
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <h4 className="text-base font-medium text-gray-900 mb-2">
                          Thông tin đơn hàng
                        </h4>
                        <p className="text-sm text-gray-700">
                          Mã đơn hàng:{" "}
                          <span className="font-medium">{order.id}</span>
                        </p>
                        <p className="text-sm text-gray-700">
                          Ngày đặt:{" "}
                          <span className="font-medium">
                            {new Intl.DateTimeFormat("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(order.created_at)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-700">
                          Trạng thái:{" "}
                          <span
                            className={`font-medium ${
                              order.status === "completed"
                                ? "text-green-600"
                                : order.status === "cancelled"
                                ? "text-red-600"
                                : order.status === "processing"
                                ? "text-blue-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {translateStatus(order.status)}
                          </span>
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-base font-medium text-gray-900 mb-2">
                          Thông tin khách hàng
                        </h4>
                        <p className="text-sm text-gray-700">
                          Tên:{" "}
                          <span className="font-medium">
                            {order.customer_name}
                          </span>
                        </p>
                        <p className="text-sm text-gray-700">
                          Số điện thoại:{" "}
                          <span className="font-medium">
                            {order.customer_phone}
                          </span>
                        </p>
                        <p className="text-sm text-gray-700">
                          Địa chỉ:{" "}
                          <span className="font-medium">
                            {order.customer_address}
                          </span>
                        </p>
                      </div>

                      <div>
                        <h4 className="text-base font-medium text-gray-900 mb-2">
                          Sản phẩm đã đặt
                        </h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between border-b pb-2"
                            >
                              <div>
                                <p className="font-medium text-gray-800">
                                  {item.product_name}
                                </p>
                                {item.options && item.options.length > 0 && (
                                  <p className="text-sm text-gray-700">
                                    {item.options
                                      .map(
                                        (opt) =>
                                          `${opt.customize_name}: ${opt.option_name}`
                                      )
                                      .join(", ")}
                                  </p>
                                )}
                                <p className="text-sm text-gray-700">
                                  SL: {item.quantity} x{" "}
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(item.price)}
                                </p>
                              </div>
                              <p className="font-medium">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(item.total_price)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-3 border-t">
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
                          {order.surcharge > 0 && (
                            <div className="flex justify-between text-sm mt-2">
                              <span className="font-medium text-gray-800">
                                Phụ thu{" "}
                                {order.surcharge_note
                                  ? `(${order.surcharge_note})`
                                  : ""}
                                :
                              </span>
                              <span className="font-medium">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(order.surcharge)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between font-medium text-lg mt-2 pt-2 border-t">
                            <span className="text-gray-900">Tổng cộng:</span>
                            <span className="text-indigo-700">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(subtotal + (order.surcharge || 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Đóng
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
