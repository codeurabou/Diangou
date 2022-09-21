const { Router } = require("express")
const courCtrl = require("../controllers/cours.controller")
const router = Router()

router.post("/", courCtrl.addCours)
router.get("/classe/:clId", courCtrl.getClasseCours)
router.put("/:coId", courCtrl.editCours)
router.delete("/:coId", courCtrl.removeCours)

module.exports = router