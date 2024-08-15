const multer = require('multer')
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const dir = path.join(__dirname, '..', 'images');
        console.log('Saving file to:', dir);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename(req, file, cb) {
        const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

        cb(null, Date.now() + '-' + cleanFileName);
    }
})

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

module.exports = multer({
    storage, fileFilter
})