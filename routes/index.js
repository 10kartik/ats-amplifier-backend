const express = require("express"),
  router = express.Router();

const multer = require("multer");

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
  console.log(req.file);
  const pdf_info = {
    name: req.file.originalname,
    size: req.file.size,
  };
  return res.send(pdf_info);
});

module.exports = router;
