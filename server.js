const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.static("public"));

const upload = multer({ storage: multer.memoryStorage() });

// DEBUG LOG
console.log("Pastefy Key Loaded:", process.env.PASTEFY_KEY ? "YES" : "NO");

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      console.log("❌ No file received");
      return res.json({ filename: "Unknown", raw: "ERROR" });
    }

    console.log("Uploading:", req.file.originalname);

    const content = req.file.buffer.toString();

    const pasteRes = await axios.post(
      "https://pastefy.app/api/v2/paste",
      {
        title: req.file.originalname,
        content: content,
        visibility: "UNLISTED"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PASTEFY_KEY}`
        }
      }
    );

    // DEBUG: Print the entire response to understand structure
    console.log("PASTEFY RESPONSE:", pasteRes.data);

    // Extract ID safely from ANY possible location
    const id =
      pasteRes.data?.id ||
      pasteRes.data?.data?.id ||
      pasteRes.data?.paste?.id ||
      pasteRes.data?.result?.id ||
      pasteRes.data?.data?.paste?.id;

    if (!id) {
      console.log("ERROR: Pastefy did not return an ID");
      return res.json({
        filename: req.file.originalname,
        raw: "ERROR"
      });
    }

    const raw = `https://pastefy.app/${id}/raw`;


    console.log("Success:", req.file.originalname, "->", raw);

    return res.json({
      filename: req.file.originalname,
      raw
    });

  } catch (err) {
    console.log("ERROR uploading:", err.response?.data || err.message);
    return res.json({
      filename: req.file?.originalname || "Unknown",
      raw: "ERROR"
    });
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log("Server running on http://localhost:" + PORT)
);
