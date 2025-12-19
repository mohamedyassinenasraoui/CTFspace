import axios from 'axios';

async function testRegister(origin) {
    console.log(`Testing with Origin: ${origin}`);
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            username: `testuser_${Date.now()}`,
            email: `testuser_${Date.now()}@example.com`,
            password: 'password123'
        }, {
            headers: {
                'Origin': origin
            }
        });
        console.log('Success (200/201)');
    } catch (error) {
        console.log(`Failed: ${error.response ? error.response.status : error.message}`);
        if (error.response && error.response.data) {
            console.log('Response data:', error.response.data);
        }
    }
}

async function run() {
    await testRegister('http://localhost:5173');
    await testRegister('http://127.0.0.1:5173');
    await testRegister('http://bad-origin.com');
}

run();
