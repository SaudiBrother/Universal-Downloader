const express = require("express");
const cors = require("cors");
const ytdl = require("@distube/ytdl-core");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

// Root route for testing
app.get("/", (req, res) => {
    res.send("Universal Downloader Backend is running!");
});

// Main API route
app.post("/api/fetch", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }

    try {
        // Simple platform detection
        if (ytdl.validateURL(url)) {
            const info = await ytdl.getInfo(url);

            return res.json({
                platform: "youtube",
                title: info.videoDetails.title,
                thumbnail: info.videoDetails.thumbnails.pop().url,
                formats: info.formats
                    .filter(f => f.hasAudio)
                    .map(f => ({
                        quality: f.qualityLabel,
                        mime: f.mimeType,
                        url: f.url
                    }))
            });
        }

        // Other platforms (TikTok, IG, FB, X)
        exec(`yt-dlp -J "${url}"`, (err, stdout) => {
            if (err) {
                return res.json({ error: "yt-dlp failed to fetch" });
            }

            try {
                const data = JSON.parse(stdout);
                res.json({
                    title: data.title,
                    thumbnail: data.thumbnail,
                    formats: data.formats.map(f => ({
                        quality: f.format_note,
                        ext: f.ext,
                        url: f.url
                    }))
                });
            } catch (parseError) {
                res.json({ error: "Parsing failed" });
            }
        });

    } catch (err) {
        res.status(500).json({ error: "Unknown server error" });
    }
});

// Railway port handler
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("Backend berjalan di port " + PORT);
});
