import React, { useEffect } from 'react';
import { getSocket } from '../utils/socket';
import { toast } from 'react-hot-toast';

export default function NotificationListener() {
  useEffect(() => {
    const socket = getSocket();

    const normalizeLink = (link) => {
      if (!link) return "";
      if (link.includes("highlight=")) {
        const id = link.split("highlight=")[1];
        return `/order-tracking/${id}`;
      }
      return link;
    };

    const handleNewOrder = (data) => {
      try {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && user.role === "ADMIN") {
          const targetLink = normalizeLink(
            data.link || `/order-tracking/${data.orderId}`,
          );
          toast.success(
            <div
              className="cursor-pointer"
              onClick={() => (window.location.href = targetLink)}
            >
              {data.message || `Đơn hàng mới: ${data.orderId}`}
            </div>,
            { duration: 6000 },
          );
        }
      } catch (err) {
        console.error("Lỗi khi xử lý thông báo đơn hàng mới:", err);
      }
    };

    const handleOrderStatusUpdated = (data) => {
      try {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && String(user._id) === String(data.userId)) {
          const targetLink = normalizeLink(
            data.link || `/order-tracking/${data.orderId}`,
          );
          toast.success(
            <div
              className="cursor-pointer"
              onClick={() => (window.location.href = targetLink)}
            >
              {data.message || `Trạng thái đơn hàng của bạn đã được cập nhật`}
            </div>,
            { duration: 5000 },
          );
        }
      } catch (err) {
        console.error("Lỗi khi xử lý thông báo cập nhật đơn hàng:", err);
      }
    };

    socket.on("new_order", handleNewOrder);
    socket.on("order_status_updated", handleOrderStatusUpdated);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleOrderStatusUpdated);
    };
  }, []);

  return null;
}
