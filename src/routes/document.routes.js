const { Router } = require("express")
const router = Router()
const docCtrl = require("../controllers/document.controller")

router.get("/classe/:clId/note", docCtrl.getClasseNoteAn)
router.get("/classe/:clId/liste", docCtrl.getClasseList)
router.get("/classe/:clId/carte", docCtrl.getMultipleEleveCard)
router.get("/classe/:clId/bulletins", docCtrl.getMultipleBulletin)

module.exports = router