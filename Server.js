const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 10000;

const upload = multer({ dest: "uploads/" });

app.use(express.static("frontend"));
app.use("/uploads", express.static("uploads"));
app.use("/site", express.static("sites"));
app.use(express.json());

app.post("/publish", upload.single("image"), (req, res) => {
  const name = req.body.name.trim();
  const text = req.body.text;
  const image = req.file;

  const siteDir = path.join(__dirname, "sites", name);
  if (!fs.existsSync(siteDir)) fs.mkdirSync(siteDir, { recursive: true });

  const parsedText = text
    .replace(/\*([^*]+)\*/g, "<b>$1</b>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/g, "<br>");

  const imageTag = image ? `<img src="/uploads/${image.filename}" width="300"><br>` : "";

  const finalHTML = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>${name}</title></head>
    <body style="font-family:sans-serif;padding:20px;">
      <h1>${name}</h1>
      ${imageTag}
      <p>${parsedText}</p>
    </body>
    </html>
  `;

  fs.writeFileSync(path.join(siteDir, "index.html"), finalHTML);
  res.json({ url: `/site/${name}/index.html` });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
