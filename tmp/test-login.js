const axios = require('axios');

const API_URL = 'http://localhost:5175'; // Adjust if needed

async function testLogin() {
  console.log('--- Testing Login Logic ---');

  const adminEmail = 'admin@honglam.vn'; // Replace with a real admin email if possible
  const password = 'password123'; // Replace with real password

  // 1. Admin login with isAdminLogin: true
  try {
    console.log('\n1. Testing Admin login (Admin Panel):');
    const res = await axios.post(`${API_URL}/api/auth/login`, {
      email: adminEmail,
      password: password,
      isAdminLogin: true
    });
    console.log('Success:', res.data.message);
    console.log('Token exists:', !!res.data.token);
    console.log('Refresh Token exists:', !!res.data.refreshToken);
    if (res.data.refreshToken) console.error('FAIL: Refresh token should NOT exist for admin!');
  } catch (err) {
    console.error('Error:', err.response?.data?.message || err.message);
  }

  // 2. Admin login without isAdminLogin
  try {
    console.log('\n2. Testing Admin login (Frontend - expected to fail):');
    await axios.post(`${API_URL}/api/auth/login`, {
      email: adminEmail,
      password: password
    });
    console.error('FAIL: Admin should NOT be able to login on frontend!');
  } catch (err) {
    console.log('Success (Expected Failure):', err.response?.data?.message);
  }

  // 3. Customer login (should work as before)
  const customerEmail = 'customer@gmail.com'; // Replace with a real customer email
  try {
    console.log('\n3. Testing Customer login (Frontend):');
    const res = await axios.post(`${API_URL}/api/auth/login`, {
      email: customerEmail,
      password: password
    });
    console.log('Success:', res.data.message);
    console.log('Token exists:', !!res.data.token);
    console.log('Refresh Token exists:', !!res.data.refreshToken);
  } catch (err) {
    console.error('Error:', err.response?.data?.message || err.message);
  }

  // 4. Customer login with isAdminLogin: true
  try {
    console.log('\n4. Testing Customer login (Admin Panel - expected to fail):');
    await axios.post(`${API_URL}/api/auth/login`, {
      email: customerEmail,
      password: password,
      isAdminLogin: true
    });
    console.error('FAIL: Customer should NOT be able to use isAdminLogin flag!');
  } catch (err) {
    console.log('Success (Expected Failure):', err.response?.data?.message);
  }
}

// Note: Running this requires the server to be running and valid credentials.
// testLogin();
