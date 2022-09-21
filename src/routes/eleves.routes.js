const { Router } = require("express")
const router = Router()
const eleveCtrl = require("../controllers/eleves.controller")
const { upload } = require("../middlewares/multer")

router.post("/", upload, eleveCtrl.addEleve)
router.put("/:elId", upload, eleveCtrl.editEleve)
router.get("/:elId", eleveCtrl.getEleve)
router.get("/etab/:etId", eleveCtrl.getEtabEleve)
router.get("/etab/adapt/:etId", eleveCtrl.getEtabEleveAdapt)
router.delete("/:elId", eleveCtrl.removeEleve)

module.exports = router