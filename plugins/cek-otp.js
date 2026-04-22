import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

// Masukkan App ID dan Hash dari my.telegram.org
const apiId = 24190855; 
const apiHash = "68c983d548b899a6138997a3a9925232";
const sessionString = ""; // Isi jika kamu sudah punya string session agar tidak login ulang

const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 5,
});

export const config = {
    name: "OTP Checker",
    description: "Cek OTP dari channel Telegram berdasarkan 4 digit ekor nomor"
};

export default async function handler(req, res) {
    const { ekor } = req.query;

    if (!ekor) {
        return res.status(400).json({ status: false, message: "Parameter 'ekor' diperlukan." });
    }

    try {
        if (!client.connected) await client.connect();

        // ID Channel atau Username (berdasarkan link yang kamu beri)
        const channelId = "-1001859664539"; // Ganti dengan ID asli channel tersebut

        // Mengambil 50 pesan terakhir
        const messages = await client.getMessages(channelId, { limit: 50 });

        for (const msg of messages) {
            const text = msg.message || "";
            
            // Regex untuk mendeteksi format: │ {platform}┊{flags} XXXX{ekor} #{bahasa}
            // Contoh: │ WP┊🇿🇼 XXXX9032 #Indonesian
            const pattern = /│\s*(?<platform>.+?)┊(?<flags>.+?)\s*XXXX(?<targetEkor>\d{4})\s*#(?<bahasa>\w+)/;
            const match = text.match(pattern);

            if (match && match.groups.targetEkor === ekor) {
                // Mengambil OTP dari tombol (reply_markup)
                let otp = "Tidak ditemukan";
                if (msg.replyMarkup && msg.replyMarkup.rows) {
                    // Mengasumsikan OTP ada di text tombol pertama
                    otp = msg.replyMarkup.rows[0].buttons[0].text;
                }

                return res.status(200).json({
                    status: true,
                    data: {
                        platform: match.groups.platform.trim(),
                        bahasa: match.groups.bahasa,
                        flags: match.groups.flags.trim(),
                        otp: otp,
                        ekor: ekor
                    }
                });
            }
        }

        return res.status(404).json({
            status: false,
            message: `OTP untuk ekor ${ekor} tidak ditemukan di channel.`
        });

    } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
    }
}
