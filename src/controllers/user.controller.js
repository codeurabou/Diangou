const { userModel } = require("../db/sequelize")
const createError = require("../utils/error")
const pgError = require("../utils/pgErr")
const { Sequelize } = require("sequelize")

const userCtrl = {
    getEtabUser: async (req, res, next) => {
        try {
            const { etId } = req.params
            const findEtabUser = await userModel.findAll({
                where: Sequelize.and({
                    et_id: etId,
                    us_role: ["sur", "com"]
                }), attributes: {
                    exclude: ["us_pass"]
                }
            })
            return res.json(findEtabUser)
        } catch (err) { return next(err) }
    },
    editUser: async (req, res, next) => {
        try {
            const { usId } = req.params
            const { prenom, nom, tel, role, sexe, pass, disabled } = req.body
            const findUser = await userModel.findByPk(usId)
            if (!findUser) return next(createError(400, "utilisateur introuvable"))
            const { us_id, us_prenom, us_nom, us_tel, us_role, us_sexe, us_pass, disabled: accountState } = findUser
            await userModel.update({
                us_prenom: prenom || us_prenom,
                us_nom: nom || us_nom,
                us_tel: tel || us_tel,
                us_role: role || us_role,
                us_sexe: sexe || us_sexe,
                us_pass: pass || us_pass,
                disabled : disabled || accountState
            }, { where: { us_id } })
            return res.json({ message: "updated" })
        } catch (err) {
            pgError(err, next,
                "users_unique1:nom et prenom pris",
                "users_unique2:telephone pris",
                "users_check1:role invalide"
            )
        }
    },
}

module.exports = userCtrl