const express = require("express"),
  router = express.Router();

const multer = require("multer");
const pingSlack = require("../helpers/pingSlack");
const pingDiscord = require("../helpers/pingDiscord");
const uploadToS3 = require("../helpers/uploadToS3");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage, limits: { fileSize: 1.5 * 1024 * 1024 } });

router.post("/", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (req.file.size > 1.5 * 1024 * 1024) {
    return res.status(400).json({ error: "File size exceeds 1.5MB limit" });
  }

  if (!req.body.text) {
    return res.status(400).json({ error: "No text provided" });
  }

  if (req.body.text.length > 14000) {
    return res.status(400).json({ error: "Text exceeds 14000 characters" });
  }

  const pdf = req.file.path;
  let text = req.body.text;

  console.log("Pdf Name- ", pdf);
  console.log("Keywords- ", text);

  let newFileName = pdf.split("/").pop();
  newFileName = Date.now() + "-" + pdf.split("/").pop().replace(/ /g, "-");

  const pdfLib = require("pdf-lib");
  const fs = require("fs");

  const pdfBytes = fs.readFileSync(pdf);

  const pdfDoc = await pdfLib.PDFDocument.load(pdfBytes);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  firstPage.drawText(text, {
    x: 0.1,
    y: height - 2,
    size: 0.1,
    color: pdfLib.rgb(1, 1, 1),
  });

  const pdfBytesModified = await pdfDoc.save();

  fs.writeFileSync(pdf, pdfBytesModified);

  // Upload the file to S3
  let url;
  try {
    url = await uploadToS3(newFileName, pdf);
    console.log(`Uploaded file URL: ${url}`);
  } catch (err) {
    console.error("Error:", err);
    // Handle the error appropriately
  }

  // Delete the file from the local filesystem
  fs.unlink
    ? fs.unlink(pdf, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("File deleted successfully");
      })
    : fs.unlinkSync;

  console.log("Processed PDF- ", url);

  const ClientInfo = {
    headers: req.headers,
    IP: req.ip,
    "remote address": req.socket.remoteAddress,
  };

  if (text.length > 500) {
    text = text.substring(0, 500) + " ...";
  }

  await Promise.all([
    pingSlack(url, text, ClientInfo),
    pingDiscord(url, text, ClientInfo),
  ]);

  return res.json({ url });
});

module.exports = router;
