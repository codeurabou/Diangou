const { Router } = require("express")
const classeCtrl = require("../controllers/classe.controller")
const router = Router()

router.post("/", classeCtrl.addClasse)
router.put("/:clId", classeCtrl.editClasse)
router.get("/etab/:etId", classeCtrl.getEtabClasse)
router.get("/eleve/:clId", classeCtrl.getEtabClasseEleve)
router.delete("/:clId", classeCtrl.removeClasse)

module.exports = router