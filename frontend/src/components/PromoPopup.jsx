import React, { useState, useEffect } from 'react';

const PromoPopup = () => {
    const [promos, setPromos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [show, setShow] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175';

    useEffect(() => {
        const hasSeenPopup = sessionStorage.getItem('hasSeenPromoPopup');
        if (!hasSeenPopup) {
            const fetchPromos = async () => {
                try {
                    const res = await fetch(`${API_URL}/api/promotions/active-banner`);
                    const data = await res.json();
                    if (data.success && data.promos && data.promos.length > 0) {
                        const popupPromos = data.promos.filter(p => p.isPopupActive);
                        if (popupPromos.length > 0) {
                            setPromos(popupPromos);
                            const timer = setTimeout(() => {
                                setShow(true);
                            }, 2000);
                            return () => clearTimeout(timer);
                        }
                    }
                } catch (error) {
                    console.error("Lỗi lấy popup khuyến mãi:", error);
                }
            };
            fetchPromos();
        }
    }, [API_URL]);

    useEffect(() => {
        if (show && promos.length > 1) {
            const cycleTimer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % promos.length);
            }, 6000); // Tự động chuyển sau 6 giây
            return () => clearInterval(cycleTimer);
        }
    }, [show, promos.length]);

    const closePopup = () => {
        setShow(false);
        sessionStorage.setItem('hasSeenPromoPopup', 'true');
    };

    if (!show || promos.length === 0) return null;

    const promo = promos[currentIndex];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '0',
                width: '400px',
                maxWidth: '90%',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div
                    key={promo._id} // Lực render lại khi đổi promo để chạy animation
                    style={{ animation: 'fadeIn 0.5s ease' }}
                >
                    <div style={{
                        background: promo.bannerColor || 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        height: '150px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        padding: '0 20px',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', textTransform: 'uppercase' }}>
                            {promo.discountType === 'PERCENT' ? `GIẢM ${promo.discountValue}%` : 'SIÊU ƯU ĐÃI!'}
                        </h2>
                        <p style={{ opacity: 0.9, marginTop: '5px', fontWeight: '600' }}>Ưu đãi có giới hạn thời gian</p>
                    </div>

                    <div style={{ padding: '30px', textAlign: 'center' }}>
                        <p style={{ fontSize: '1rem', color: '#444', lineHeight: '1.6', minHeight: '3em' }}>
                            {promo.description || `Sử dụng mã ưu đãi để nhận ngay giảm giá cho đơn hàng từ ${promo.minOrderValue.toLocaleString()}đ.`}
                        </p>

                        <div style={{
                            background: '#f8f9fa',
                            border: '2px dashed #f5576c',
                            padding: '15px',
                            borderRadius: '10px',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#f5576c',
                            margin: '20px 0',
                            letterSpacing: '2px'
                        }}>
                            {promo.code}
                        </div>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(promo.code);
                                alert('Đã sao chép mã giảm giá!');
                            }}
                            style={{
                                background: '#333',
                                color: 'white',
                                border: 'none',
                                padding: '12px 30px',
                                borderRadius: '30px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            SAO CHÉP MÃ & MUA NGAY
                        </button>
                    </div>
                </div>

                {/* Indicators */}
                {promos.length > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                        paddingBottom: '20px'
                    }}>
                        {promos.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: currentIndex === idx ? '#f5576c' : '#ddd',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            />
                        ))}
                    </div>
                )}

                <button
                    onClick={closePopup}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>

            <style>{`
                @keyframes popIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PromoPopup;
