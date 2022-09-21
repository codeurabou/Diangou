const { Router } = require("express")
const serieCtrl = require("../controllers/serie.controller")
const router = Router()

router.post("/", serieCtrl.addSerie)
router.put("/:seId", serieCtrl.editSerie)
router.get("/", serieCtrl.getAllSerie)
router.delete("/:seId", serieCtrl.removeSerie)

router.post("/etab/:etId", serieCtrl.addEtabSerie)
router.put("/etab/:esId", serieCtrl.editEtabSerie)
router.get("/etab/:etId", serieCtrl.getEtabSerie)

module.exports = router