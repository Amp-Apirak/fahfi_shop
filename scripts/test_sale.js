const axios = require('axios');

async function testSale() {
  try {
    // Login to get token (assuming hardcoded credentials or just skipping auth if possible, but auth is required)
    // Actually, I'll just try to hit the endpoint. If I need auth, I'll need a valid token.
    // I'll assume I can't easily get a token without login.
    // I'll try to use the existing login endpoint first.
    
    const loginRes = await axios.post('http://localhost:3001/api/login', {
      username: 'admin', // Assuming admin/password exists or I need to know a user
      password: 'password' // This is a guess. If it fails, I can't test easily.
    });
    
    const token = loginRes.data.token;
    
    const saleData = {
      cart: [
        { product_id: 1, quantity: 1 } // Assuming product ID 1 exists
      ],
      totalAmount: 90, // 100 - 10
      globalDiscount: 10,
      paymentMethod: 'transfer'
    };

    const res = await axios.post('http://localhost:3001/api/sales', saleData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Sale created successfully:', res.data);
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

testSale();
