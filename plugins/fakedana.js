import { createCanvas, loadImage } from 'canvas';

export const config = {
    name: "FAKEDANA",
    description: "Generate Fake Dana Balance Image by KevCodex",
    category: "Tools & Fun",
};

export default async function handler(req, res) {
    const { saldo } = req.query;

    if (!saldo) {
        return res.status(400).json({ 
            status: false, 
            message: "Parameter 'saldo' (angka) diperlukan." 
        });
    }

    try {
        // 1. Inisialisasi Canvas (Ukuran sesuai template gambar)
        const canvas = createCanvas(360, 780);
        const ctx = canvas.getContext('2d');

        // 2. Load Base Image & Eye Icon
        const baseImage = await loadImage('https://c.termai.cc/i181/zXeq.jpg');
        const eyeLogo = await loadImage('https://c.termai.cc/i109/Dfm.jpg');

        // 3. Gambar Background
        ctx.drawImage(baseImage, 0, 0, 360, 780);

        // 4. Format Saldo (IDR Style: 1.000.000)
        const formattedSaldo = Number(saldo).toLocaleString('id-ID');

        // 5. Styling Teks (Presisi UI)
        ctx.fillStyle = "#b3e5fc"; // Warna biru muda khas DANA
        ctx.font = "bold 22px Arial"; // Gunakan font sistem yang tersedia
        ctx.textBaseline = "top";

        // Posisi teks (disesuaikan dengan layout base image kamu)
        const textX = 60;
        const textY = 14;
        ctx.fillText(formattedSaldo, textX, textY);

        // 6. Gambar Icon Mata (Posisi setelah teks saldo)
        const textWidth = ctx.measureText(formattedSaldo).width;
        const eyeX = textX + textWidth + 8; // Jarak 8px dari teks
        const eyeY = textY + 4; // Penyesuaian vertikal agar sejajar tengah teks
        ctx.drawImage(eyeLogo, eyeX, eyeY, 18, 18);

        // 7. Output sebagai Buffer Gambar
        const buffer = canvas.toBuffer('image/png');
        
        // Kirim response sebagai image
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('X-Creator', 'KevCodex');
        return res.send(buffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: false, 
            message: "Gagal membuat gambar", 
            detail: error.message 
        });
    }
}
