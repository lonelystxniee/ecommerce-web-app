import React, { createContext, useState, useContext, useEffect } from "react";
import { API_URL } from "../config/apiConfig";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistIds, setWishlistIds] = useState([]);

    const fetchWishlist = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/api/wishlist`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setWishlistItems(data.wishlist);
                setWishlistIds(data.wishlist.map((item) => item._id));
            }
        } catch (error) {
            console.error("Fetch wishlist error:", error);
        }
    };

    const toggleWishlist = async (productId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để sử dụng tính năng này!");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/wishlist/toggle`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId }),
            });
            const data = await res.json();
            if (data.success) {
                if (data.isFavorite) {
                    toast.success("Đã thêm vào yêu thích!");
                } else {
                    toast.success("Đã xóa khỏi yêu thích!");
                }
                fetchWishlist();
            } else {
                toast.error(data.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Toggle wishlist error:", error);
            toast.error("Lỗi kết nối server");
        }
    };

    const isInWishlist = (productId) => {
        return wishlistIds.includes(productId);
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                wishlistIds,
                toggleWishlist,
                isInWishlist,
                fetchWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
