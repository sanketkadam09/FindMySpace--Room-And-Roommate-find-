// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
    uploadProfileImage,
    getUsersByRole,
    getUserCapabilities,
    deactivateAccount,
    getCurrentUser,
    getUserById
} = require("../controllers/userController");


const { jsonwebtoken } = require("../middleware/JwtAuth"); 

const { profileImage, images, handleUploadError } = require("../middleware/Upload");


router.post("/upload-profile-image", jsonwebtoken, profileImage, uploadProfileImage);

router.get("/by-role", jsonwebtoken, getUsersByRole);
router.get("/capabilities", jsonwebtoken, getUserCapabilities);


router.get("/", jsonwebtoken, getCurrentUser);
router.get("/:id", jsonwebtoken, getUserById);

router.post("/deactivate", jsonwebtoken, deactivateAccount);


router.use(handleUploadError);

module.exports = router;