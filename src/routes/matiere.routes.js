const { Router } = require("express")
const matCtrl = require("../controllers/matiere.controller")
const router = Router()

router.post("/", matCtrl.addMatiere)
router.put("/:maId", matCtrl.editMatiere)
router.get("/", matCtrl.getMatiere)
router.delete("/:maId", matCtrl.removeMatiere)

router.post("/serie", matCtrl.addMatSerie)
router.get("/serie/:etId", matCtrl.getMatSerieEtab)
router.get("/serie/adapt/:etId", matCtrl.getMatSerieEtabAdapt)
router.put("/serie/:msId", matCtrl.editMatSerie)
router.delete("/serie/:msId", matCtrl.removeMatSerie)

module.exports = router