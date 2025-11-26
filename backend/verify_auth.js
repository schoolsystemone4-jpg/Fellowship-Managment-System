const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function verifyAuth() {
    try {
        console.log('1. Logging in as Manager...');
        const managerLogin = await axios.post(`${API_URL}/auth/login`, {
            email: 'manager@fellowship.com',
            password: 'password123'
        });
        console.log('Manager Login Success:', managerLogin.data.token ? 'Yes' : 'No');
        const managerToken = managerLogin.data.token;

        console.log('\n2. Registering new Member...');
        const newMember = {
            fullName: 'Test Member',
            email: `test${Date.now()}@example.com`,
            phoneNumber: '0700000001',
            gender: 'MALE'
        };

        const registerResponse = await axios.post(`${API_URL}/members`, newMember, {
            headers: { Authorization: `Bearer ${managerToken}` }
        });
        console.log('Registration Success:', registerResponse.data.id ? 'Yes' : 'No');
        console.log('Fellowship Number:', registerResponse.data.fellowshipNumber);
        console.log('Default Password:', registerResponse.data.defaultPassword);

        const fellowshipNumber = registerResponse.data.fellowshipNumber;
        const memberEmail = newMember.email;

        console.log('\n3. Logging in as new Member...');
        const memberLogin = await axios.post(`${API_URL}/auth/login`, {
            email: memberEmail,
            password: fellowshipNumber
        });
        console.log('Member Login Success:', memberLogin.data.token ? 'Yes' : 'No');
        console.log('Member Role:', memberLogin.data.role);

        console.log('\nVerification Complete!');
    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifyAuth();
