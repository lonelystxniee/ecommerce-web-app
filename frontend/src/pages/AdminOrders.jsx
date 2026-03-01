import React, { useEffect, useState } from 'react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders').then(r => r.json()).then(d => { if (d.success) setOrders(d.orders || []); }).finally(() => setLoading(false));
    }, []);

    const pushToGHN = async (orderId) => {
        // prepare ghnBody from order and call backend
        try {
            const res = await fetch('/api/shipping/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) });
            const data = await res.json();
            if (data.success) alert('Đã gửi lên GHN');
            else alert('Lỗi: ' + (data.message || ''));
        } catch (e) { alert('Network error'); }
    };

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Danh sách đơn (Admin)</h2>
            <table className="w-full text-sm border">
                <thead>
                    <tr className="bg-gray-100"><th className="p-2">ID</th><th>Người nhận</th><th>Trạng thái</th><th>GHN</th><th>Hành động</th></tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o._id} className="border-t"><td className="p-2">{o._id}</td><td>{o.customerInfo.fullName}<br />{o.customerInfo.phone}</td><td>{o.shipping?.shippingStatus || o.status}</td><td>{o.shipping?.ghnOrderCode || 'Chưa'}</td><td><button onClick={() => pushToGHN(o._id)} className="px-2 py-1 bg-blue-600 text-white rounded">Gửi GHN</button></td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminOrders;
