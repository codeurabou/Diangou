const express = require("express")
const router = express.Router()
const adminCtrl = require("../controllers/admin.controller")
const auth = require("../middlewares/auth")
const checkRole = require("../middlewares/checkRole")

router.post("/create/:token", adminCtrl.createAdminAccount)
router.post("/password/recovery", adminCtrl.recoveryPass)
router.put("/password/recovery/confirm/:token", adminCtrl.confirmRecoveryPass)

router.use(auth)
router.use(checkRole(["admin"]))
router.post("/user/add", adminCtrl.createUserAccount)
router.get("/user/list", adminCtrl.getAllUser)
router.put("/user/state/:etId", adminCtrl.userAccountState)
router.put("/user/resetpass/:usId", adminCtrl.resetPass)
router.put("/user/edit/etab/:usId", adminCtrl.editUserEtab)
router.put("/user/edit/:usId", adminCtrl.editUserInfo)
router.delete("/user/:usId", adminCtrl.deleteAllUserData)

module.exports = router