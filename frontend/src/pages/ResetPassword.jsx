import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [status, setStatus] = useState("idle"); // idle | loading | success | error | invalid
    const [message, setMessage] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get("token");
        if (!t) {
            setStatus("invalid");
        } else {
            setToken(t);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus("error");
            setMessage("Mật khẩu xác nhận không khớp!");
            return;
        }
        if (newPassword.length < 6) {
            setStatus("error");
            setMessage("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();
            if (data.success) {
                setStatus("success");
                setMessage(data.message);
                setTimeout(() => navigate("/"), 3000);
            } else {
                setStatus("error");
                setMessage(data.message || "Đã có lỗi xảy ra!");
            }
        } catch {
            setStatus("error");
            setMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại!");
        }
    };

    // Không có token → hiển thị lỗi
    if (status === "invalid") {
        return (
            <div style={styles.wrapper}>
                <div style={styles.card}>
                    <div style={{ ...styles.iconWrapper, background: "#fef2f2", color: "#ef4444" }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </div>
                    <h1 style={styles.title}>Link không hợp lệ</h1>
                    <p style={styles.subtitle}>Link đặt lại mật khẩu không đúng hoặc đã hết hạn (15 phút).</p>
                    <a href="/forgot-password" style={styles.primaryLink}>Yêu cầu link mới</a>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>
                {/* Icon */}
                <div style={styles.iconWrapper}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                </div>

                {status === "success" ? (
                    <>
                        <h1 style={styles.title}>Thành công! 🎉</h1>
                        <div style={styles.successBox}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <div>
                                <p style={styles.successText}>{message}</p>
                                <p style={{ ...styles.successText, opacity: 0.7, marginTop: 4 }}>
                                    Đang chuyển về trang chủ sau 3 giây...
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 style={styles.title}>Đặt lại mật khẩu</h1>
                        <p style={styles.subtitle}>Nhập mật khẩu mới cho tài khoản của bạn.</p>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label} htmlFor="new-password">Mật khẩu mới</label>
                                <div style={styles.passwordWrapper}>
                                    <input
                                        id="new-password"
                                        type={showPass ? "text" : "password"}
                                        required
                                        placeholder="Ít nhất 6 ký tự"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={styles.input}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        style={styles.eyeButton}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPass ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label} htmlFor="confirm-password">Xác nhận mật khẩu</label>
                                <input
                                    id="confirm-password"
                                    type={showPass ? "text" : "password"}
                                    required
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={styles.input}
                                />
                            </div>

                            {/* Password strength bar */}
                            {newPassword && (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, color: "#9ca3af" }}>Độ mạnh:</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: getStrengthColor(newPassword) }}>
                                            {getStrengthLabel(newPassword)}
                                        </span>
                                    </div>
                                    <div style={{ height: 4, borderRadius: 4, background: "#e5e7eb", overflow: "hidden" }}>
                                        <div style={{
                                            height: "100%",
                                            width: `${getStrengthWidth(newPassword)}%`,
                                            background: getStrengthColor(newPassword),
                                            borderRadius: 4,
                                            transition: "width 0.3s",
                                        }} />
                                    </div>
                                </div>
                            )}

                            {status === "error" && (
                                <p style={styles.errorText}>{message}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                style={{
                                    ...styles.button,
                                    opacity: status === "loading" ? 0.7 : 1,
                                    cursor: status === "loading" ? "not-allowed" : "pointer",
                                }}
                            >
                                {status === "loading" ? (
                                    <span style={styles.spinner}></span>
                                ) : (
                                    "Đặt lại mật khẩu"
                                )}
                            </button>
                        </form>
                    </>
                )}

                <a href="/" style={styles.backLink}>← Quay lại trang chủ</a>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

// ─── Helpers độ mạnh mật khẩu ────────────────────────────────────────────────
function getStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}
function getStrengthWidth(p) { return [20, 40, 70, 100][getStrength(p)] || 20; }
function getStrengthColor(p) { return ["#ef4444", "#f97316", "#eab308", "#16a34a"][getStrength(p)] || "#ef4444"; }
function getStrengthLabel(p) { return ["Rất yếu", "Yếu", "Trung bình", "Mạnh"][getStrength(p)] || "Rất yếu"; }

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
    wrapper: {
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        fontFamily: "'Inter', sans-serif",
    },
    card: {
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 40px rgba(0,0,0,0.10)",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "420px",
        textAlign: "center",
        border: "1px solid #f0f0f0",
    },
    iconWrapper: {
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        background: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px",
        color: "#111",
    },
    title: {
        fontSize: "26px",
        fontWeight: 700,
        color: "#111",
        margin: "0 0 10px",
    },
    subtitle: {
        fontSize: "15px",
        color: "#6b7280",
        margin: "0 0 28px",
        lineHeight: 1.6,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        textAlign: "left",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    label: {
        fontSize: "14px",
        fontWeight: 600,
        color: "#374151",
    },
    input: {
        width: "100%",
        padding: "12px 16px",
        borderRadius: "10px",
        border: "1.5px solid #e5e7eb",
        fontSize: "15px",
        outline: "none",
        fontFamily: "inherit",
        boxSizing: "border-box",
    },
    passwordWrapper: {
        position: "relative",
    },
    eyeButton: {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        display: "flex",
        alignItems: "center",
    },
    button: {
        padding: "13px",
        borderRadius: "10px",
        border: "none",
        background: "#111",
        color: "#fff",
        fontSize: "15px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontFamily: "inherit",
        marginTop: "4px",
        transition: "background 0.2s",
    },
    spinner: {
        width: "18px",
        height: "18px",
        border: "2.5px solid rgba(255,255,255,0.35)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.7s linear infinite",
    },
    errorText: {
        color: "#ef4444",
        fontSize: "14px",
        margin: "0",
        textAlign: "center",
    },
    successBox: {
        background: "#f0fdf4",
        border: "1.5px solid #bbf7d0",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        textAlign: "left",
        margin: "8px 0 16px",
    },
    successText: {
        color: "#15803d",
        fontSize: "14px",
        margin: 0,
        lineHeight: 1.6,
    },
    backLink: {
        display: "inline-block",
        marginTop: "24px",
        fontSize: "14px",
        color: "#6b7280",
        textDecoration: "none",
        fontWeight: 500,
    },
    primaryLink: {
        display: "inline-block",
        marginTop: "20px",
        padding: "12px 28px",
        borderRadius: "10px",
        background: "#111",
        color: "#fff",
        fontWeight: 600,
        fontSize: "15px",
        textDecoration: "none",
        fontFamily: "inherit",
    },
};
