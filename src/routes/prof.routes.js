const { Router } = require("express")
const profCtrl = require("../controllers/prof.controller")
const router = Router()

router.post("/", profCtrl.addProf)
router.get("/etab/:etId", profCtrl.getEtabProf)
router.get("/etab/adapt/:etId", profCtrl.getEtabProfAdapt)
router.put("/:prId", profCtrl.editProf)
router.delete("/:prId", profCtrl.removeProf)

router.post("/reglement/:etId", profCtrl.addEtabReglement)
router.get("/reglement/:etId/payed", profCtrl.getEtabPayedReglement)
router.get("/reglement/:etId", profCtrl.getEtabReglement)
router.put("/reglement/:reId", profCtrl.editReglement)


module.exports = router