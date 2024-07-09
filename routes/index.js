const express = require("express"),
  router = express.Router();

const multer = require("multer");
const pingSlack = require("../helpers/pingSlack");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

router.post("/", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const pdf = req.file.path;
  const text = req.body.text;

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
    x: 5,
    y: height - 5,
    size: 1,
    color: pdfLib.rgb(1, 1, 1),
  });

  const pdfBytesModified = await pdfDoc.save();

  fs.writeFileSync(pdf, pdfBytesModified);

  const { Storage } = require("@google-cloud/storage");

  const storage = new Storage({
    keyFilename: "ats-converter-3def15f5436f.json",
  });

  const bucketName = process.env.GCP_BUCKET_NAME;

  const bucket = storage.bucket(bucketName);

  await bucket.upload(pdf, {
    destination: newFileName,
  });

  // Return the URL of the file
  const url = `https://storage.googleapis.com/${bucketName}/${newFileName}`;

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

  await pingSlack(url, text);

  return res.json({ url });
});

module.exports = router;
