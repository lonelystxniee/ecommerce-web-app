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

  if (!data.birthday) {
    errors.birthday = "Ngày sinh không được để trống";
  } else {
    const birthDate = new Date(data.birthday);
    const today = new Date();
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(today.getFullYear() - 100);

    if (birthDate > today) {
      errors.birthday = "Ngày sinh không thể ở tương lai";
    } else if (birthDate < hundredYearsAgo) {
      errors.birthday = "Ngày sinh không hợp lệ (không quá 100 tuổi)";
    }
  }

  if (data.phone && !/^\d{10}$/.test(data.phone)) {
    errors.phone = "Số điện thoại phải là 10 số";
  } else if (data.phone && !/^0/.test(data.phone)) {
    errors.phone = "Số điện thoại phải bắt đầu với 0";
  }

  if (data.hasOwnProperty('otp')) {
    if (!data.otp) {
      errors.otp = "Vui lòng nhập mã xác nhận";
    } else if (!/^\d{6}$/.test(data.otp)) {
      errors.otp = "Mã xác nhận phải là 6 chữ số";
    }
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
