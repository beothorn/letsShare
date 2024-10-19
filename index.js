const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8000;

// Use /tmp/letsShare as the temp folder
const tempFolder = path.join('/tmp', 'letsShare');
const textFilePath = path.join(tempFolder, 'shared.txt');

// Ensure temp folder exists
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempFolder);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Serve static files from the temp folder
app.use('/files', express.static(tempFolder));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Home route to display files and shared text
app.get('/', (req, res) => {
  fs.readdir(tempFolder, (err, files) => {
    if (err) {
      return res.send('Unable to scan files!');
    }
    let sharedText = '';
    if (fs.existsSync(textFilePath)) {
      sharedText = fs.readFileSync(textFilePath, 'utf8');
    }
    res.render('index', { files: files, sharedText: sharedText });
  });
});

// Handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  res.redirect('/');
});

// Handle text sharing
app.post('/text', (req, res) => {
  const text = req.body.sharedText || '';
  fs.writeFileSync(textFilePath, text);
  res.redirect('/');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});