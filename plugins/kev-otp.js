import axios from 'axios';

export const config = {
    name: "KEVOTP",
    description: "High-performance SMS/OTP Forwarder Engine",
    category: "Tools & OTP",
};

// Konfigurasi Server
const BASE_URL = "http://YOUR_SERVER/api"; 
const API_KEY = "6c228322d05c21db0a70128eef89f710d8671d743752c3cd1d4a04b2177ea8ce";

export default async function handler(req, res) {
    const { action, number, country, limit } = req.query;
    const headers = { "X-API-Key": API_KEY };

    try {
        switch (action) {
            case 'numbers': // Ambil daftar nomor aktif
                const getNums = await axios.get(`${BASE_URL}/my_numbers`, { headers });
                return res.json({ status: true, creator: "KevCodex", ...getNums.data });

            case 'latest': // Ambil OTP terbaru
                const getLatest = await axios.get(`${BASE_URL}/latest_otp`, { 
                    headers, 
                    params: { number } 
                });
                return res.json({ status: true, creator: "KevCodex", ...getLatest.data });

            case 'history': // Cek riwayat OTP
                const getHistory = await axios.get(`${BASE_URL}/my_otps`, { 
                    headers, 
                    params: { limit: limit || 10 } 
                });
                return res.json({ status: true, creator: "KevCodex", ...getHistory.data });

            case 'request': // Request nomor baru
                const reqNew = await axios.post(`${BASE_URL}/request_number`, 
                    { country: country || "random" }, 
                    { headers }
                );
                return res.json({ status: true, creator: "KevCodex", ...reqNew.data });

            case 'release': // Hapus/Lepas nomor
                const relNum = await axios.post(`${BASE_URL}/release_number`, 
                    { number }, 
                    { headers }
                );
                return res.json({ status: true, creator: "KevCodex", ...relNum.data });

            default:
                return res.json({
                    status: false,
                    message: "Welcome to KEVOTP Engine",
                    available_actions: ["numbers", "latest", "history", "request", "release"],
                    example: "/api?feature=kev-otp&action=request&country=USA"
                });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: false, 
            message: "KEVOTP Connection Error", 
            error: error.response?.data || error.message 
        });
    }
}
