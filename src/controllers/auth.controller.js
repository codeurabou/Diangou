const { userModel, sequelize, etabModel } = require("../db/sequelize")
const bcrypt = require('bcrypt')
const generateToken = require("../utils/generateToken")
const createError = require("../utils/error")
const checkBody = require("../utils/checkBody")
const pgError = require("../utils/pgErr")

const authCtrl = {
    createAccount: async (req, res, next) => {
        try {
            const { prenom, nom, tel, role, sexe, pass, et_id } = req.body
            const { isValid } = checkBody(prenom, nom, tel, role, sexe, pass)
            if (isValid === false) return next(createError(400, "champs invalide"))
            const cryptedPass = await bcrypt.hash(pass, 10)
            await userModel.create({
                us_prenom: prenom,
                us_nom: nom,
                us_role: role,
                us_sexe: sexe,
                us_tel: tel,
                us_pass: cryptedPass,
                et_id: et_id || null
            })
            return res.json({ message: "added" })
        } catch (err) {
            pgError(err, next,
                "users_unique1:nom et prenom pris",
                "users_unique2:telephone pris",
                "users_check1:role invalide"
            )
        }
    },
    login: async (req, res, next) => {
        try {
            const { tel, pass } = req.body
            const { isValid } = checkBody(tel, pass)
            if (isValid === false) return next(createError(400, "champs invalide"))
            let phone
            const indicatif = /^(0|00|\+)[1-9]+\s{1,1}[0-9]+$/g
            const testPhoneNumber = indicatif.test(tel)
            if (!testPhoneNumber) return next(createError(400, "veillez donner l'indicatif "))
            phone = tel.split(" ")[1]
            const query = `select * from users where us_tel like '%${phone}%'`
            const findedUser = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
            const user = findedUser[0]
            if (!user) return next(createError(400, "utilisateur introuvable"))
            const { us_role, disabled, et_id } = user
            if (disabled) return next(createError(400, "compte desactiver"))
            const decryptPass = await bcrypt.compare(pass, user.us_pass)
            if (!decryptPass) return next(createError(400, "mot de passe incorrect"))
            delete user.us_pass
            const token = generateToken({ usId: user.us_id, users: { ...user } })
            if (us_role === "admin") return res.json({ user, token })
            else {
                const findUserTab = await etabModel.findByPk(et_id)
                if (!findUserTab) return next(createError(400, "etablissement introuvable"))
                return res.json({ user, token, etab: findUserTab })
            }
        } catch (err) { return next(err) }
    },
    changePass: async (req, res, next) => {
        try {
            const { usId } = req.params
            const { oldPass, newPass } = req.body
            const { isValid } = checkBody(oldPass, newPass)
            if (isValid === false) return next(createError(400, "champs invalide"))
            if (oldPass === newPass) return next(createError(400, "les deux mots de passe ne doit pas être identiques"))
            const findUser = await userModel.findByPk(usId)
            if (!findUser) return next(createError(400, "utilisateur introuvable"))
            const { us_pass, us_id } = findUser
            const decryptPass = await bcrypt.compare(oldPass, us_pass)
            if (!decryptPass) return next(createError(400, "ancien mot de passe incorrect"))
            const cryptNewPass = await bcrypt.hash(newPass, 10)
            await userModel.update({ us_pass: cryptNewPass }, { where: { us_id } })
            return res.json({ message: "updated" })
        } catch (err) { return next(err) }
    },
}

module.exports = authCtrl