const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

//disk storage
const storage = multer.diskStorage({
  //setting up file folder
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  //setting up file name
  filename: function (req, file, cb) {
    // Generating random name for file using crypto
    crypto.randomBytes(12, function(err, buffer) {
      if (err) {
        return cb(err); 
      }
      const filename = buffer.toString('hex') + path.extname(file.originalname); // Create filename with random hex prefix
      cb(null, filename);
    });
  }
  
});

const upload = multer({ storage: storage });

module.exports = upload;