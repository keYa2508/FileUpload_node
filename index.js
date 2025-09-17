const express = require('express');
const upload = require('./upload');
const path = require('path');
const fs = require('fs');

const app = express();


app.use(express.json({}));

app.get("/", (_req, res) => {
    res.send("Api is Working");
});

app.post("/upload/file", upload.single("file"), (req, res) => {
    return res.json({ message: "file uploded" })
})

app.post("/upload/files", upload.array("files"), (req, res) => {
    return res.json({ message: "files uploded" })
})

app.post("/upload/base64", (req, res) => {
    const { data, type, name } = req.body;
    if (!data || !type || !name) {
        return res.status(400).json({ message: 'Missing required fields: data, type, or name' });
    }
    const filePath = path.join(__dirname, 'uploads', name);

    const buffer = Buffer.from(data, 'base64');

    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error saving file', error: err });
        }

        return res.json({ message: 'File uploaded successfully', fileName: name });
    });
});

app.post("/upload/base64Array", (req, res) => {
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ message: 'No files provided' });
    }

    const savedFiles = [];

    for (const file of files) {
        const { data, type, name } = file;

        if (!data || !type || !name) {
            return res.status(400).json({ message: 'Each file must include data, type, and name' });
        }

        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        const filePath = path.join(uploadDir, name);

        try {
            const buffer = Buffer.from(data, 'base64');
            fs.writeFileSync(filePath, buffer);
            savedFiles.push(name);
        } catch (err) {
            return res.status(500).json({ message: `Error saving file: ${name}`, error: err });
        }
    }

    return res.json({
        message: 'All files uploaded successfully',
        files: savedFiles
    });
});

app.listen(3000, () => {
    console.log("Server start")
});

