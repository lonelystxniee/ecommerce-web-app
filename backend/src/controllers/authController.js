const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const OTP = require('../models/OTP')
const activityController = require('./activityController')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

exports.login = async (req, res) => {
  const { email, password, isAdminLogin } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ email và mật khẩu',
    })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng!',
      })
    }

    // Kiểm tra mật khẩu (hỗ trợ cả mật khẩu đã hash và chưa hash cho account cũ)
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false)
    if (!isMatch && String(password) !== String(user.password)) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng!',
      })
    }

    if (user.status === 'LOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa!',
      })
    }

    // Xử lý phân quyền đăng nhập
    if (user.role === 'ADMIN') {
      if (!isAdminLogin) {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản quản trị không được phép đăng nhập tại đây!',
        })
      }

      // Admin: Token 7 ngày, không cần Refresh Token
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

      // Xóa refresh token cũ nếu có
      user.refreshToken = null
      await user.save()

      console.log('✅ Admin đăng nhập thành công:', user.fullName)
      await activityController.createLog(user._id, 'Đăng nhập Admin', 'Quản trị viên đã đăng nhập vào hệ thống', req)

      const { password: _, ...userInfo } = user.toObject()
      return res.status(200).json({
        success: true,
        message: 'Đăng nhập Quản trị thành công!',
        token,
        user: userInfo,
      })
    } else {
      // Customer
      if (isAdminLogin) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập quản trị!',
        })
      }

      // Customer: Token 15p + Refresh Token 7 ngày
      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' })

      const refreshToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

      user.refreshToken = refreshToken
      await user.save()

      console.log('✅ Đăng nhập thành công cho:', user.fullName)
      await activityController.createLog(user._id, 'Đăng nhập', 'Người dùng đã đăng nhập vào hệ thống', req)

      const { password: _, ...userInfo } = user.toObject()
      return res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công!',
        token,
        refreshToken,
        user: userInfo,
      })
    }
  } catch (error) {
    console.error('❌ LỖI ĐĂNG NHẬP:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra tại Server',
      error: error.message,
    })
  }
}

exports.register = async (req, res) => {
  const { fullName, email, password, phone, gender, birthday, otp } = req.body

  if (!fullName || !email || !password || !birthday || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ họ tên, email, mật khẩu, ngày sinh và mã xác nhận!',
    })
  }

  const otpRecord = await OTP.findOne({ email, otp })
  if (!otpRecord) {
    return res.status(400).json({
      success: false,
      message: 'Mã xác nhận không đúng hoặc đã hết hạn!',
    })
  }

  // Xóa mã sau khi kiểm tra xong
  await OTP.deleteOne({ _id: otpRecord._id })

  // Check age (100 years max)
  const birthDate = new Date(birthday)
  const today = new Date()
  const hundredYearsAgo = new Date()
  hundredYearsAgo.setFullYear(today.getFullYear() - 100)

  if (birthDate > today) {
    return res.status(400).json({
      success: false,
      message: 'Ngày sinh không hợp lệ (không thể ở tương lai)!',
    })
  }
  if (birthDate < hundredYearsAgo) {
    return res.status(400).json({
      success: false,
      message: 'Ngày sinh không hợp lệ (không quá 100 tuổi)!',
    })
  }

  try {
    console.log('--- BẮT ĐẦU ĐĂNG KÝ ---')
    console.log('Email:', email)

    const existing = await User.findOne({ email })
    if (existing) {
      console.log('❌ Lỗi: Email đã tồn tại:', email)
      return res.status(409).json({
        success: false,
        message: 'Email này đã được sử dụng!',
      })
    }

    if (phone) {
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại phải là 10 số!',
        })
      }
      if (!/^0/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại phải bắt đầu bằng số 0!',
        })
      }
      const existingPhone = await User.findOne({ phone })
      if (existingPhone) {
        console.log('❌ Lỗi: Số điện thoại đã tồn tại:', phone)
        return res.status(409).json({
          success: false,
          message: 'Số điện thoại này đã được sử dụng!',
        })
      }
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      })
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải gồm chữ hoa, chữ thường và số',
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    console.log('Đang tạo User mới...')
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      gender,
      birthday,
    })

    console.log('✅ Đăng ký thành công:', newUser._id)
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    })
  } catch (error) {
    console.error('❌ LỖI ĐĂNG KÝ:', error)
    return res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra tại Server',
      error: error.message,
    })
  }
}

exports.googleLogin = async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ success: false, message: 'Thiếu Google Token' })
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { sub: googleId, email, name: fullName, picture: avatar } = payload

    if (!email) {
      return res.status(400).json({ success: false, message: 'Không lấy được email từ Google' })
    }

    // Kiểm tra xem user có tồn tại chưa
    let user = await User.findOne({ email })

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      user = await User.create({
        fullName,
        email,
        authProvider: 'GOOGLE',
        googleId,
        avatar,
        status: 'ACTIVE',
        role: 'CUSTOMER',
      })
      console.log('✅ Đăng ký mới bằng Google thành công cho:', user.email)
    } else {
      // Cập nhật thông tin Google nếu user đã có từ trước nhưng chưa link Google
      if (user.authProvider === 'LOCAL' && !user.googleId) {
        user.googleId = googleId
        user.authProvider = 'GOOGLE' // Hoặc giữ LOCAL nhưng vẫn có googleId, tuỳ quy trình
        if (!user.avatar) user.avatar = avatar
        await user.save()
      }

      if (user.status === 'LOCKED') {
        return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa!' })
      }
      console.log('✅ Đăng nhập Google thành công cho:', user.email)
    }

    // Tạo JWT token cho session của app
    const jwtToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '5s' })

    const refreshToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

    user.refreshToken = refreshToken
    await user.save()

    const { password, resetToken, resetTokenExpiry, ...userInfo } = user.toObject()

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập Google thành công!',
      token: jwtToken,
      refreshToken,
      user: userInfo,
    })
  } catch (error) {
    console.error('❌ LỖI ĐĂNG NHẬP GOOGLE:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Xác thực Google thất bại',
      error: error.message,
    })
  }
}

exports.updateProfile = async (req, res) => {
  const userId = req.user.id
  const { fullName, phone, avatar, gender, birthday } = req.body

  if (fullName !== undefined && (!fullName || fullName.trim() === '')) {
    return res.status(400).json({
      success: false,
      message: 'Họ và tên không được để trống!',
    })
  }

  const updateData = {}
  if (fullName) updateData.fullName = fullName
  if (phone) {
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại phải là 10 số!',
      })
    }
    if (!/^0/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại phải bắt đầu bằng số 0!',
      })
    }
    // Check if phone is already taken by another user
    const existingPhone = await User.findOne({ phone, _id: { $ne: userId } })
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'Số điện thoại này đã được sử dụng bởi tài khoản khác!',
      })
    }
    updateData.phone = phone
  }
  if (avatar) updateData.avatar = avatar
  if (gender) updateData.gender = gender
  if (birthday) {
    const bDate = new Date(birthday)
    const today = new Date()
    const hundredYearsAgo = new Date()
    hundredYearsAgo.setFullYear(today.getFullYear() - 100)

    if (bDate > today) {
      return res.status(400).json({
        success: false,
        message: 'Ngày sinh không hợp lệ (không thể ở tương lai)!',
      })
    }
    if (bDate < hundredYearsAgo) {
      return res.status(400).json({
        success: false,
        message: 'Ngày sinh không hợp lệ (không quá 100 tuổi)!',
      })
    }
    updateData.birthday = birthday
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp ít nhất một thông tin cần cập nhật',
    })
  }

  try {
    const updated = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      select: '-password',
    })

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' })
    }

    await activityController.createLog(userId, 'Cập nhật hồ sơ', 'Thông tin cá nhân đã được thay đổi', req)

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công!',
      user: updated,
    })
  } catch (error) {
    console.error('❌ LỖI CẬP NHẬT:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra tại Server',
      error: error.message,
    })
  }
}

exports.getProfile = async (req, res) => {
  const userId = req.user.id

  try {
    const user = await User.findById(userId).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' })
    }

    return res.status(200).json({ success: true, user })
  } catch (error) {
    console.error('❌ LỖI XEM THÔNG TIN:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra tại Server',
      error: error.message,
    })
  }
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email' })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      // Trả về success để không lộ thông tin tài khoản
      return res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu!',
      })
    }

    // Tạo token ngẫu nhiên
    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 phút

    user.resetToken = token
    user.resetTokenExpiry = expiry
    await user.save()

    console.log('------------------------------------------')
    console.log('DEBUG: forgotPassword - Found User:', user.email)
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL)
    console.log('------------------------------------------')

    // Phản hồi link đặt lại mật khẩu
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

    try {
      await transporter.sendMail({
        from: `"ClickGo Shop" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Đặt lại mật khẩu tài khoản ClickGo của bạn',
        html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
            <tr><td align="center">
              <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:#800a0d;padding:32px 40px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">ClickGo</h1>
                    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">Cửa hàng ClickGo</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <p style="font-size:16px;color:#333;margin:0 0 8px;">Xin chào <strong>${user.fullName}</strong>,</p>
                    <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 24px;">
                      Chúng tôi nhận được yêu cầu <strong>đặt lại mật khẩu</strong> cho tài khoản của bạn tại ClickGo.
                      Nhấn vào nút bên dưới để tạo mật khẩu mới.
                    </p>
                    <div style="text-align:center;margin:32px 0;">
                      <a href="${resetUrl}"
                         style="display:inline-block;padding:14px 36px;background:#800a0d;color:#ffffff;text-decoration:none;border-radius:30px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                        🔐 Đặt lại mật khẩu
                      </a>
                    </div>
                    <div style="background:#fff8f8;border:1px solid #fecaca;border-radius:10px;padding:14px 16px;margin:0 0 24px;">
                      <p style="margin:0;font-size:13px;color:#b91c1c;">
                        ⏰ Link này sẽ hết hạn sau <strong>15 phút</strong> kể từ khi email được gửi.
                      </p>
                    </div>
                    <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0;">
                      Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                      Tài khoản của bạn vẫn an toàn.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#fafafa;border-top:1px solid #f0f0f0;padding:20px 40px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#aaa;">© 2025 ClickGo – Hồng Lam. Mọi quyền được bảo lưu.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      })
      console.log('✅ Email đặt lại mật khẩu đã gửi tới:', email)
      return res.status(200).json({
        success: true,
        message: 'Link đặt lại mật khẩu đã được gửi về email của bạn!',
      })
    } catch (mailError) {
      console.error('❌ LỖI GỬI EMAIL SMTP:', mailError.message)
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email đặt lại mật khẩu. Vui lòng kiểm tra cấu hình SMTP.',
        error: mailError.message,
      })
    }
  } catch (error) {
    console.error('❌ LỖI FORGOT PASSWORD:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra tại Server',
      error: error.message,
    })
  }
}

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu token hoặc mật khẩu mới',
    })
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu phải có ít nhất 6 ký tự, gồm chữ hoa, chữ thường và số',
    })
  }

  try {
    console.log('------------------------------------------')
    console.log('DEBUG: resetPassword')
    console.log('Received Token:', token)
    console.log('Current Time:', new Date().toISOString())

    const userByTokenOnly = await User.findOne({ resetToken: token })
    if (userByTokenOnly) {
      console.log('User found by token only. Email:', userByTokenOnly.email)
      console.log('Token in DB:', userByTokenOnly.resetToken)
      console.log('Expiry in DB:', userByTokenOnly.resetTokenExpiry ? userByTokenOnly.resetTokenExpiry.toISOString() : 'null')
      console.log('Is Expired?', userByTokenOnly.resetTokenExpiry < new Date())
    } else {
      console.log('No user found with this token.')
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }, // chưa hết hạn
    })
    console.log('Final User Discovery Result:', user ? 'FOUND' : 'NOT FOUND')
    if (!user && userByTokenOnly) {
      console.log('REASON FOR FAILURE: Token matches but expiry check failed.')
      console.log('Expiry in DB:', userByTokenOnly.resetTokenExpiry.toISOString())
      console.log('Current Time:', new Date().toISOString())
    }
    console.log('------------------------------------------')

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!',
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    user.password = hashedPassword
    user.resetToken = null
    user.resetTokenExpiry = null
    await user.save()

    console.log('✅ Đặt lại mật khẩu thành công cho:', user.email)

    return res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.',
    })
  } catch (error) {
    console.error('❌ LỖI RESET PASSWORD:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra tại Server',
      error: error.message,
    })
  }
}

exports.verifyResetToken = async (req, res) => {
  const { token } = req.params

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu token xác thực',
    })
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Token hợp lệ',
    })
  } catch (error) {
    console.error('❌ LỖI VERIFY RESET TOKEN:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra tại Server',
      error: error.message,
    })
  }
}

exports.lockAccount = async (req, res) => {
  const userId = req.user.id

  try {
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' })
    }

    if (user.status === 'LOCKED') {
      return res.status(400).json({ success: false, message: 'Tài khoản đã bị khóa trước đó!' })
    }

    user.status = 'LOCKED'
    await user.save()

    return res.status(200).json({ success: true, message: 'Tài khoản đã được khóa thành công!' })
  } catch (error) {
    console.error('❌ LỖI KHÓA TÀI KHOẢN:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra tại Server',
      error: error.message,
    })
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '', sort = '-createdAt' } = req.query
    const skip = (page - 1) * limit

    const query = {}
    if (search) {
      query.$or = [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]
    }
    if (role && role !== 'ALL') {
      query.role = role
    }
    if (status && status !== 'ALL') {
      query.status = status
    }

    const totalUsers = await User.countDocuments(query)

    // Thống kê tổng thể cho dashboard
    const customerCount = await User.countDocuments({ role: 'CUSTOMER' })
    const adminCount = await User.countDocuments({ role: 'ADMIN' })

    // Thống kê theo query hiện tại (search/status/role)
    const activeCount = await User.countDocuments({
      ...query,
      status: 'ACTIVE',
    })
    const lockedCount = await User.countDocuments({
      ...query,
      status: 'LOCKED',
    })

    // Xử lý sort
    let sortOption = {}
    if (sort === 'name_asc') sortOption = { fullName: 1 }
    else if (sort === 'name_desc') sortOption = { fullName: -1 }
    else if (sort === 'oldest') sortOption = { createdAt: 1 }
    else sortOption = { createdAt: -1 } // newest is default

    const users = await User.find(query).select('-password').sort(sortOption).skip(skip).limit(limit)

    res.status(200).json({
      success: true,
      users,
      totalUsers,
      customerCount,
      adminCount,
      activeCount,
      lockedCount,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: parseInt(page),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, message: 'Đã xóa người dùng' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Thêm người dùng từ trang Admin
exports.adminCreateUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, status } = req.body

    if (!fullName || fullName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Họ và tên không được để trống!',
      })
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại trong hệ thống!' })
    }

    if (phone) {
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại phải là 10 số!',
        })
      }
      if (!/^0/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại phải bắt đầu bằng số 0!',
        })
      }
      const phoneExists = await User.findOne({ phone })
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại đã tồn tại trong hệ thống!',
        })
      }
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role || 'CUSTOMER',
      status: status || 'ACTIVE',
    })

    res.status(201).json({ success: true, message: 'Tạo người dùng thành công!' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
// Cập nhật người dùng từ admin
exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, phone, role, status } = req.body
    const userId = req.params.id

    if (fullName !== undefined && (!fullName || fullName.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Họ và tên không được để trống!',
      })
    }

    if (phone) {
      if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại phải là 10 số!',
        })
      }
      if (!/^0/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại phải bắt đầu bằng số 0!',
        })
      }
      const phoneExists = await User.findOne({ phone, _id: { $ne: userId } })
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại đã tồn tại trong hệ thống!',
        })
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { fullName, email, phone, role, status }, { new: true })
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' })
    }
    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      user: updatedUser,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'Người dùng không tồn tại!' })
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác!',
      })
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      })
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải gồm chữ hoa, chữ thường và số',
      })
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải khác mật khẩu cũ',
      })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)

    await user.save()
    await activityController.createLog(user._id, 'Đổi mật khẩu', 'Mật khẩu tài khoản đã được thay đổi thành công', req)

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đổi mật khẩu!' })
  }
}

// Làm mới Access Token bằng Refresh Token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy refresh token!',
    })
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

    const user = await User.findById(decoded.id)
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Refresh token không hợp lệ hoặc đã bị thu hồi!',
      })
    }

    if (user.status === 'LOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa!',
      })
    }

    const newAccessToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '5s' })

    return res.status(200).json({
      success: true,
      token: newAccessToken,
    })
  } catch (error) {
    console.error('❌ LỖI REFRESH TOKEN:', error.message)
    return res.status(403).json({
      success: false,
      message: 'Refresh token không hợp lệ hoặc đã hết hạn!',
    })
  }
}

// Đăng xuất — xóa refresh token khỏi DB
exports.logout = async (req, res) => {
  const { refreshToken } = req.body

  try {
    if (refreshToken) {
      await User.findOneAndUpdate({ refreshToken }, { $set: { refreshToken: null } })
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công!',
    })
  } catch (error) {
    console.error('❌ LỖI LOGOUT:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Đã có lỗi xảy ra tại Server',
    })
  }
}

exports.sendOTP = async (req, res) => {
  const { email, phone } = req.body

  if (!email) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email!' })
  }

  try {
    // 1. Kiểm tra Email/Phone đã được dùng chưa
    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'Email này đã được sử dụng!' })
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone })
      if (existingPhone) {
        return res.status(409).json({ success: false, message: 'Số điện thoại này đã được sử dụng!' })
      }
    }

    // 2. Tạo mã OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // 3. Lưu vào DB (Upsert)
    await OTP.findOneAndUpdate({ email }, { otp, createdAt: new Date() }, { upsert: true, new: true })

    // 4. Gửi Email
    try {
      await transporter.sendMail({
        from: `"ClickGo Shop" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Mã xác nhận đăng ký tài khoản ClickGo',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #800a0d; text-align: center; margin-bottom: 30px;">XÁC NHẬN ĐĂNG KÝ</h2>
            <p>Chào bạn,</p>
            <p>Chúng tôi nhận được yêu cầu đăng ký tài khoản ClickGo bằng email này. Mã xác nhận của bạn là:</p>
            <div style="background: #fdfaf5; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0; border: 1px dashed #800a0d;">
              <span style="font-size: 36px; font-weight: bold; color: #800a0d; letter-spacing: 6px;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">Mã này sẽ hết hạn sau <strong>5 phút</strong>. Vui lòng tuyệt đối không chia sẻ mã này với bất kỳ ai để bảo mật tài khoản.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #aaa; text-align: center;">© 2025 ClickGo – Hệ thống bán hàng Clickgo. Mọi quyền được bảo lưu.</p>
          </div>
        `,
      })
      console.log('✅ OTP sent successfully to:', email)
    } catch (mailError) {
      console.error('❌ LỖI GỬI EMAIL SMTP (OTP):', mailError.message)
      throw new Error(`Không thể gửi email xác nhận: ${mailError.message}`)
    }

    return res.status(200).json({ success: true, message: 'Mã xác nhận đã được gửi đến email!' })
  } catch (error) {
    console.error('LỖI GỬI OTP:', error.message)
    return res.status(500).json({ success: false, message: 'Lỗi Server: Không thể gửi email xác nhận!', error: error.message })
  }
}
