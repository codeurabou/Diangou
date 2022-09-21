const { Router } = require("express")
const etabCtrl = require("../controllers/etab.controller")
const router = Router()

router.post("/", etabCtrl.addEtab)
router.put("/:etId", etabCtrl.editEtab)
router.get("/:etId", etabCtrl.getEtab)
router.get("/", etabCtrl.getAllEtab)
router.get("/stat/:etId",etabCtrl.getEtabStats)

module.exports = router
