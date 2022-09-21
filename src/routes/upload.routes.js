const { Router } = require("express")
const router = Router()
const uploadCtrl = require("../controllers/upload.controller")
const { upload } = require("../middlewares/multer")

router.post("/:etId", upload, uploadCtrl.addEtabLogo)
router.delete("/:etId", uploadCtrl.removeEtabLogo)

module.exports = router