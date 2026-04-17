import axios from 'axios';

export const config = {
    name: "KEVOTP",
    description: "Premium SMS/OTP Forwarder Engine by KevCodex",
    category: "Tools & OTP",
};

// Konfigurasi Server Jahangir (Updated)
const BASE_URL = "http://145.239.69.111:20030/api"; 
const API_KEY = "6c228322d05c21db0a70128eef89f710d8671d743752c3cd1d4a04b2177ea8ce";

export default async function handler(req, res) {
    const { action, number, country, limit } = req.query;
    
    // Header untuk Auth
    const headers = { 
        "X-API-Key": API_KEY,
        "Accept": "application/json"
    };

    try {
        switch (action) {
            case 'numbers':
                const getNums = await axios.get(`${BASE_URL}/my_numbers`, { headers });
                return res.json({ status: true, creator: "KevCodex", ...getNums.data });

            case 'latest':
                const getLatest = await axios.get(`${BASE_URL}/latest_otp`, { 
                    headers, 
                    params: { number } 
                });
                return res.json({ status: true, creator: "KevCodex", ...getLatest.data });

            case 'history':
                const getHistory = await axios.get(`${BASE_URL}/my_otps`, { 
                    headers, 
                    params: { limit: limit || 50 } 
                });
                return res.json({ status: true, creator: "KevCodex", ...getHistory.data });

            case 'request':
                const reqNew = await axios.post(`${BASE_URL}/request_number`, 
                    { country: country || "random" }, 
                    { headers }
                );
                return res.json({ status: true, creator: "KevCodex", ...reqNew.data });

            case 'release':
                const relNum = await axios.post(`${BASE_URL}/release_number`, 
                    { number }, 
                    { headers }
                );
                return res.json({ status: true, creator: "KevCodex", ...relNum.data });

            default:
                return res.json({
                    status: false,
                    message: "KEVOTP Engine Active",
                    available_actions: ["numbers", "latest", "history", "request", "release"]
                });
        }
    } catch (error) {
        // Log detail error jika koneksi gagal
        const errorData = error.response?.data || error.message;
        res.status(500).json({ 
            status: false, 
            message: "KEVOTP Connection Error", 
            detail: errorData 
        });
    }
}
