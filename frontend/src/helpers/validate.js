export const validateRegister = (data) => {
  const errors = {};

  if (!data.fullName || data.fullName.trim() === "") {
    errors.fullName = "Họ và tên không được để trống";
  }

  if (!data.email) {
    errors.email = "Email không được để trống";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)) {
    errors.email = "Email không hợp lệ";
  }

  if (!data.password) {
    errors.password = "Mật khẩu không được để trống";
  } else if (data.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  if (data.phone && !/^\d{10}$/.test(data.phone)) {
    errors.phone = "Số điện thoại phải là 10 số";
  }

  return errors;
};

export const validateLogin = (data) => {
  const errors = {};

  if (!data.email) {
    errors.email = "Email không được để trống";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)) {
    errors.email = "Email không hợp lệ";
  }

  if (!data.password) {
    errors.password = "Mật khẩu không được để trống";
  }

  return errors;
};
