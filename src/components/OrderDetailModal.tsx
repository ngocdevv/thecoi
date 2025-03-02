<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
  <div className="sm:flex sm:items-start">
    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
      <h3
        className="text-lg leading-6 font-medium text-gray-900"
        id="modal-title"
      >
        Chi tiết đơn hàng
      </h3>
      <div className="mt-4">
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h4 className="text-base font-medium text-gray-900 mb-2">
            Thông tin đơn hàng
          </h4>
          <p className="text-sm text-gray-700">
            Mã đơn hàng: <span className="font-medium">{order.id}</span>
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
            Tên: <span className="font-medium">{order.customer_name}</span>
          </p>
          <p className="text-sm text-gray-700">
            Số điện thoại:{" "}
            <span className="font-medium">{order.customer_phone}</span>
          </p>
          <p className="text-sm text-gray-700">
            Địa chỉ:{" "}
            <span className="font-medium">{order.customer_address}</span>
          </p>
        </div>

        <div>
          <h4 className="text-base font-medium text-gray-900 mb-2">
            Sản phẩm đã đặt
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-medium text-gray-800">
                    {item.product.item_name}
                  </p>
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <p className="text-sm text-gray-700">
                      {item.selectedOptions.join(", ")}
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
                  }).format(item.price * item.quantity)}
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
                  {order.surcharge_note ? `(${order.surcharge_note})` : ""}:
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
                }).format(subtotal + order.surcharge)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>;
