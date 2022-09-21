const { Router } = require("express");
const router = Router()
const ascolaireCtrl = require("../controllers/ascolaire.controller")

/**
 * gestion des annee scolaires
 * creation
 * modification
 * suppression
 * rechercher par an
 */

router.post("/", ascolaireCtrl.addAscoalraie)
router.put("/:asId", ascolaireCtrl.editAscolaire)
router.get("/etab/:etId", ascolaireCtrl.getEtabAscolaire)
router.delete("/:asId", ascolaireCtrl.removeAscolaire)

module.exports = router