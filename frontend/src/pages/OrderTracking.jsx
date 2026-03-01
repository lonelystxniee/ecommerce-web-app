import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const OrderTracking = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/orders/${id}`).then(r => r.json()).then(d => { if (d.success) setOrder(d.order); }).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-6">Đang tải...</div>;
    if (!order) return <div className="p-6">Đơn hàng không tìm thấy.</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Chi tiết đơn hàng #{order._id}</h2>
            <div className="mb-4">
                <strong>Người nhận:</strong> {order.customerInfo.fullName} - {order.customerInfo.phone}
            </div>
            <div className="mb-4">
                <strong>Địa chỉ:</strong> {order.shipping && order.shipping.shippingAddressStructured ? (
                    `${order.shipping.shippingAddressStructured.detail}, ${order.shipping.shippingAddressStructured.ward?.name || ''}, ${order.shipping.shippingAddressStructured.district?.name || ''}, ${order.shipping.shippingAddressStructured.province?.name || ''}`
                ) : order.customerInfo.address}
            </div>
            <div className="mb-4">
                <strong>Trạng thái vận chuyển:</strong> {order.shipping?.shippingStatus || order.status}
            </div>
            <div className="mb-4">
                <strong>Mã GHN:</strong> {order.shipping?.ghnOrderCode || 'Chưa tạo'}
            </div>
            <div className="mb-4">
                <strong>Sản phẩm:</strong>
                <ul className="list-disc pl-6">
                    {order.items.map(it => <li key={it.id}>{it.name} x {it.quantity}</li>)}
                </ul>
            </div>
            <div className="mb-4">
                <strong>Phí vận chuyển:</strong> {order.shipping?.shippingFee ? `${order.shipping.shippingFee.toLocaleString()}đ` : 'Chưa tính'}
            </div>
            <div className="mb-4">
                <strong>Lịch sử sự kiện:</strong>
                <ul className="list-disc pl-6">
                    {(order.shipping?.shippingEvents || []).map((e, i) => <li key={i}>{new Date(e.time).toLocaleString()} - {e.status} - {e.note}</li>)}
                </ul>
            </div>
        </div>
    );
};

export default OrderTracking;
