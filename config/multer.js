// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(__dirname, '../../front-end/client/public/project_images'));
//     },
//     filename: (req, file, cb) => {
//         const name = Date.now() + '-' + file.originalname;
//         cb(null, name);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     if (
//         file.mimetype == "image/png" ||
//         file.mimetype == "image/jpg" ||
//         file.mimetype == "image/jpeg" ||
//         file.mimetype == "image/webp"
//     ) {
//         cb(null, true);
//     } else {
//         cb(null, false);
//         return cb(new Error("Only .png, .jpg, .jpeg, and .webp formats allowed!"));
//     }
// };


// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter
// });


// const uploadFields = upload.fields([
//     { name: 'license', maxCount: 1 },
//     { name: 'certifications', maxCount: 5 }
// ]);



// module.exports ={

//   upload,
//   uploadFields,
//   fileFilter,

// }




const multer = require('multer')
const path = require('path')
const fs = require("fs")


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'))

    },
    filename: function (req, file, cb) {

        const name = Date.now() + '-' + file.originalname
        cb(null, name)

    }
})
const imageFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter })
module.exports = {
    upload


}