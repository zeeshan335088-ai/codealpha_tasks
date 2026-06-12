const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/download/:filename', fileController.downloadFile);

module.exports = router;
