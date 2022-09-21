const { Router } = require("express")
const inscriptionCtrl = require("../controllers/inscriptions.controller")
const router = Router()

router.post("/", inscriptionCtrl.addInscription)
router.get("/etab/:etId", inscriptionCtrl.getEtabInscription)
router.get("/:inId", inscriptionCtrl.getInscription)
router.put("/:inId", inscriptionCtrl.editInscription)
router.delete("/:inId", inscriptionCtrl.removeInscription)

router.post("/paiement/:inId", inscriptionCtrl.addInscriptionPaiement)
router.get("/paiement/:inId", inscriptionCtrl.getInscriptionPaiement)
router.put("/paiement/:paId", inscriptionCtrl.editInscriptionPaiement)
router.delete("/paiement/:paId", inscriptionCtrl.removeInscriptionPaiement)

module.exports = router