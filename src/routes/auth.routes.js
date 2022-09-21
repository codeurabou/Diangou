const { Router } = require("express")
const router = Router()
const authCtrl = require("../controllers/auth.controller")
const auth = require("../middlewares/auth")

router.post("/login", authCtrl.login)
router.use(auth)
router.post("/signup", authCtrl.createAccount)
router.put("/changepass/:usId", authCtrl.changePass)

module.exports = router