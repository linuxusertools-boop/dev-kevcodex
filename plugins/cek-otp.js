import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const apiId = 24190855; 
const apiHash = "68c983d548b899a6138997a3a9925232";
// Masukkan session string hasil login di sini agar tidak minta kode terus
const sessionString = ""; 

const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 5,
});

export const config = {
    name: "OTP Checker",
    description: "Cek OTP Telegram berdasarkan 4 digit ekor nomor",
    category: "Tools & OTP" // Tambahkan kategori agar muncul di index.html
};

export default async function handler(req, res) {
    const { ekor } = req.query;

    if (!ekor || ekor.length !== 4) {
        return res.status(400).json({ status: false, message: "Parameter 'ekor' (4 digit) diperlukan." });
    }

    try {
        if (!client.connected) await client.connect();

        const channelId = "-1001859664539"; 
        const messages = await client.getMessages(channelId, { limit: 30 });

        for (const msg of messages) {
            const text = msg.message || "";
            
            // Regex disesuaikan dengan format channel kamu
            const pattern = /│\s*(?<platform>.+?)┊(?<flags>.+?)\s*XXXX(?<targetEkor>\d{4})\s*#(?<bahasa>\w+)/;
            const match = text.match(pattern);

            if (match && match.groups.targetEkor === ekor) {
                let otp = "N/A";
                // Mengambil OTP dari tombol inline
                if (msg.replyMarkup && msg.replyMarkup.rows) {
                    otp = msg.replyMarkup.rows[0].buttons[0].text;
                }

                return res.status(200).json({
                    status: true,
                    creator: "KevCodex",
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
            message: `OTP untuk ekor ${ekor} tidak ditemukan.`
        });

    } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
    }
}
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
