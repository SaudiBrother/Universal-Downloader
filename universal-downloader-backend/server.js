const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { spawn } = require("child_process");
const https = require("https");
const http = require("http");
const urlModule = require("url");

const app = express();

app.use(cors());
app.use(morgan("dev"));

function runYtDlp(url) {
    return new Promise((resolve, reject) => {
        const proc = spawn("yt-dlp", ["-j", url]);

        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (d) => (stdout += d.toString()));
        proc.stderr.on("data", (d) => (stderr += d.toString()));

        proc.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`yt-dlp exited ${code}: ${stderr}`));
            }
            try {
                resolve(JSON.parse(stdout));
            } catch (e) {
                reject(new Error("Failed to parse JSON: " + e));
            }
        });
    });
}

app.get("/api/fetch", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.json({ error: "Missing url" });

    try {
        const info = await runYtDlp(url);

        const formats = (info.formats || [])
            .filter((f) => f.url && f.url.startsWith("http"))
            .map((f) => ({
                id: f.format_id,
                ext: f.ext,
                note: f.format_note || f.format,
                width: f.width,
                height: f.height,
                size: f.filesize || f.filesize_approx || null,
                url: f.url,
            }));

        res.json({
            title: info.title,
            thumbnail: info.thumbnail,
            duration: info.duration,
            formats,
            raw: info,
        });
    } catch (e) {
        res.json({ error: e.toString() });
    }
});

app.get("/api/proxy", (req, res) => {
    const target = req.query.url;
    if (!target) return res.json({ error: "Missing url" });

    const client = target.startsWith("https") ? https : http;

    client
        .get(target, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        })
        .on("error", (err) => {
            res.status(500).json({ error: err.toString() });
        });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log("Backend running at http://localhost:" + PORT);
});
