const { Router } = require("express")
const router = Router()
const userCtrl = require("../controllers/user.controller")

router.get("/etab/:etId", userCtrl.getEtabUser)
router.put("/:usId", userCtrl.editUser)

module.exports = router