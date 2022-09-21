const { Router } = require("express")
const noteCtrl = require("../controllers/note.controller")
const router = Router()

router.post("/eleve/:elId", noteCtrl.addEleveNote)
router.get("/eleve/:elId/an", noteCtrl.getEleveNoteAnnuel)
router.get("/classe/:clId/an", noteCtrl.getClasseNote)
router.get("/eleve/:elId", noteCtrl.getEleveNote)
router.put("/:noId", noteCtrl.editEleveNote)

module.exports = router