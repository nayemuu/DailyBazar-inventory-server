import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// File upload folder
// const UPLOADS_FOLDER = '/public/'; //if you don't use `__dirname`
const UPLOADS_FOLDER = './public/images';
// যে fileটি upload variable কে import করে ব্যবহার করবে অর্থাৎ যেই file এ run হবে সেই fileটি যে folder এ অবস্থিত, সেই folder এ upload folder তৈরি হবে

// define the storage
const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   console.log('checking');
  //   console.log('__dirname = ', __dirname);
  //   console.log('__dirname + UPLOADS_FOLDER = ', __dirname + UPLOADS_FOLDER);
  //   if (!fs.existsSync(__dirname + UPLOADS_FOLDER)) {
  //     console.log('inside condition');
  //     fs.mkdirSync(__dirname + UPLOADS_FOLDER, { recursive: true });
  //   }
  //   cb(null, __dirname + UPLOADS_FOLDER);
  // },

  destination: (req, file, cb) => {
    // console.log('__dirname = ', __dirname);
    if (!fs.existsSync(UPLOADS_FOLDER)) {
      fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
    }
    cb(null, UPLOADS_FOLDER);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname); // path.extname() ব্যবহার প্রয়োজন আমাদেরকে nodejs এর core একটি module, path module import করতে হবে
    const filename = `${file.originalname
      .replace(fileExt, '')
      .toLowerCase()
      .split(' ')
      .join('-')}-${Date.now()}`;

    cb(null, filename + fileExt);
  },
});
// preapre the final multer upload object
export const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 1mb- (fileSize byte ae input  নেয়)
  },

  fileFilter: (req, file, cb) => {
    // এখানে file.fieldname দিয়ে check করে নেওয়ার কারণ হচ্ছে upload ব্যবহার করে যতগুলো ফাইল আপলোড করবো সবগুলোই এই object এর সবগুলো statement execute করবে

    if (
      file.fieldname === 'icon' ||
      file.fieldname === 'logo' ||
      file.fieldname === 'thumbnail'
    ) {
      // eslint-disable-next-line prettier/prettier
      // console.log("file.mimetype = ", file.mimetype );
      if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/svg+xml' ||
        file.mimetype === 'image/webp'
      ) {
        cb(null, true);
      } else {
        cb(new Error('only jpg, png, jpeg, svg, webp formats are allowed!'));
      }
    } else {
      cb(new Error('this field is not defined in multer')); // যদি কোন field match না করে
    }
  },
});
