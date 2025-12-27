const http = require('http');

const API_URL = 'http://localhost:5000/api';

async function request(method, endpoint, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: `/api${endpoint}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.log("Response not JSON:", data);
                    resolve(data);
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runVerification() {
    try {
        console.log("1. Creating User...");
        const userFn = `User_${Math.floor(Math.random() * 1000)}`;
        const user = await request('POST', '/users', { username: userFn });
        console.log("User Created:", user);

        if (!user._id) throw new Error("User creation failed");

        console.log("\n2. Creating Room...");
        const roomId = `room_${Math.floor(Math.random() * 1000)}`;
        const room = await request('POST', '/rooms', { name: "General", roomId: roomId });
        console.log("Room Created:", room);

        if (!room._id) throw new Error("Room creation failed");

        console.log("\n3. Sending Message...");
        const msg = await request('POST', '/messages', {
            roomId: roomId,
            senderId: user._id,
            content: "Hello World from Verification Script"
        });
        console.log("Message Sent:", msg);

        if (!msg._id) throw new Error("Message sending failed");

        console.log("\n4. Fetching Messages...");
        const messages = await request('GET', `/messages/${roomId}`);
        console.log("Messages Fetched:", messages.length);
        console.log(messages);

        console.log("\n✅ Verification Successful!");
    } catch (error) {
        console.error("\n❌ Verification Failed:", error);
    }
}

runVerification();
