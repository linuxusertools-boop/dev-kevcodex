import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    // Ambil parameter feature, dan pastikan tidak null
    const { feature } = req.query;
    const pluginsDir = path.join(process.cwd(), 'plugins');

    try {
        // 1. Logika LIST PLUGINS (Jika feature kosong)
        if (!feature) {
            if (!fs.existsSync(pluginsDir)) return res.status(200).json([]);
            
            const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
            const data = await Promise.all(pluginFiles.map(async (file) => {
                const { config } = await import(`../plugins/${file}`);
                return { id: file.replace('.js', ''), ...config };
            }));
            return res.status(200).json(data);
        }

        // 2. Bersihkan nama feature (Cegah karakter aneh & Double Query)
        // split('?')[0] memastikan fakedana?saldo=... tetap terbaca fakedana
        const target = feature.toLowerCase().split('?')[0].replace(/[^a-z0-9]/g, '');

        // 3. PROTEKSI: Jangan biarkan index.js memanggil dirinya sendiri
        if (target === 'index') {
            return res.status(403).json({ status: false, message: "Akses dilarang." });
        }

        const filePath = path.join(pluginsDir, `${target}.js`);

        // 4. Cek Keberadaan File
        if (fs.existsSync(filePath)) {
            // Import file plugin secara dinamis
            const plugin = await import(`../plugins/${target}.js`);
            
            // Jalankan fungsi default dari plugin
            if (typeof plugin.default === 'function') {
                return await plugin.default(req, res);
            } else {
                return res.status(500).json({ status: false, message: `Plugin ${target} tidak punya export default.` });
            }
        } else {
            return res.status(404).json({ 
                status: false, 
                message: `Plugin '${target}' tidak ditemukan di folder plugins.` 
            });
        }

    } catch (error) {
        console.error("ERROR UTAMA:", error.message);
        return res.status(500).json({ 
            status: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
}
        return res.status(500).json({ 
            status: false, 
            error: error.message 
        });
    }
}
