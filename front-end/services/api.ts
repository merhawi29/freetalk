import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const createUser = async (username: string) => {
    const response = await api.post('/users', { username });
    return response.data;
};

export const createRoom = async (name: string, roomId: string, isPublic: boolean = true) => {
    const response = await api.post('/rooms', { name, roomId, isPublic });
    return response.data;
};

export const getRooms = async () => {
    const response = await api.get('/rooms');
    return response.data;
};

export const getRoom = async (roomId: string) => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
}

export const inviteUser = async (roomId: string, userId: string) => {
    const response = await api.post(`/rooms/${roomId}/invite`, { userId });
    return response.data;
};

export const sendMessage = async (roomId: string, senderId: string, content: string) => {
    const response = await api.post('/messages', { roomId, senderId, content });
    return response.data;
};

export const getMessages = async (roomId: string) => {
    const response = await api.get(`/messages/${roomId}`);
    return response.data;
};

// Auth and User
export const register = async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
}

export const login = async (userData: any) => {
    const response = await api.post('/auth/login', userData);
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
}

export const logout = () => {
    localStorage.removeItem('user');
}

export const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('user') || 'null');
    }
    return null;
}

export const getProfile = async (token: string) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    const response = await api.get('/auth/me', config);
    return response.data;
}

export const updateProfile = async (userData: any, token: string) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    const response = await api.put('/auth/profile', userData, config);
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
}

export default api;
