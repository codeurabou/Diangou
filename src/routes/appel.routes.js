const { Router } = require("express")
const router = Router()
const apCtrl = require("../controllers/appel.controller")

router.post("/", apCtrl.addAp)
router.get("/classe/:clId", apCtrl.getClasseAp)
router.put("/:apId",apCtrl.editApEtat)
router.delete("/:apId", apCtrl.removeAp)

router.get("/contenu/:apId", apCtrl.getApContenu)
router.put("/contenu/:apcId", apCtrl.editApContenu)

module.exports = router