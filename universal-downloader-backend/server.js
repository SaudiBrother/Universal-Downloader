const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const ytdlp = require("yt-dlp-exec");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/**
 * MAIN API — FETCH VIDEO INFO
 */
app.post("/api/fetch", async (req, res) => {
    const url = req.body.url;
    if (!url) return res.json({ error: "Missing URL" });

    try {
        console.log("Fetching:", url);

        // Query yt-dlp JSON info
        const info = await ytdlp(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true
        });

        const formats = (info.formats || [])
            .filter(f => f.url && f.url.startsWith("http"))
            .map(f => ({
                id: f.format_id,
                ext: f.ext,
                note: f.format_note || f.format,
                width: f.width,
                height: f.height,
                size: f.filesize || f.filesize_approx || null,
                url: f.url
            }));

        res.json({
            title: info.title,
            thumbnail: info.thumbnail,
            duration: info.duration,
            formats,
            raw: info
        });

    } catch (err) {
        console.error("yt-dlp error:", err);
        res.json({ error: err.toString() });
    }
});

/**
 * PROXY — DOWNLOAD FILES SAFELY
 */
app.get("/api/proxy", async (req, res) => {
    const target = req.query.url;
    if (!target) return res.json({ error: "Missing url" });

    try {
        const https = target.startsWith("https")
            ? require("https")
            : require("http");

        https.get(target, proxyRes => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        }).on("error", err => {
            res.status(500).json({ error: err.toString() });
        });

    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

/**
 * HEALTH CHECK
 */
app.get("/", (_, res) => {
    res.send("Universal Downloader Backend is running.");
});

/**
 * PORT AUTO-DETECT (RAILWAY REQUIRED)
 */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("Backend running on port:", PORT);
});
