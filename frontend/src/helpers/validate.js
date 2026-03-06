export const validatePassword = (password) => {
  if (!password) {
    return "Mật khẩu không được để trống";
  }
  if (password.length < 6) {
    return "Mật khẩu phải có ít nhất 6 ký tự";
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)) {
    return "Mật khẩu phải có ít nhất 6 ký tự, gồm chữ hoa, chữ thường và số";
  }
  return null;
};

export const validateRegister = (data) => {
  const errors = {};

  if (!data.fullName || data.fullName.trim() === "") {
    errors.fullName = "Họ và tên không được để trống";
  } else if (/\d/.test(data.fullName)) {
    errors.fullName = "Họ tên không được là kí tự số.";
  }

  if (!data.email) {
    errors.email = "Email không được để trống";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)) {
    errors.email = "Email không hợp lệ";
  }

  const passwordError = validatePassword(data.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  if (data.phone && !/^\d{10}$/.test(data.phone)) {
    errors.phone = "Số điện thoại phải là 10 số";
  } else if (data.phone && !/^0/.test(data.phone)) {
    errors.phone = "Số điện thoại phải bắt đầu với 0";
  }

  return errors;
};

export const validateChangePassword = (data) => {
  const errors = {};

  if (!data.oldPassword) {
    errors.oldPassword = "Mật khẩu cũ không được để trống";
  }

  const passwordError = validatePassword(data.newPassword);
  if (passwordError) {
    errors.newPassword = passwordError;
  }

  if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  if (data.oldPassword === data.newPassword && data.newPassword !== "") {
    errors.newPassword = "Mật khẩu mới phải khác mật khẩu cũ";
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
