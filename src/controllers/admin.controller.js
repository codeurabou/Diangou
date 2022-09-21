const { userModel, sequelize, etabModel, inscriptionModel, ascolaireModel, classeModel, eleveModel, profModel } = require("../db/sequelize")
const bcrypt = require('bcrypt')
const { Sequelize } = require("sequelize")
const jwt = require("jsonwebtoken")
const checkBody = require("../utils/checkBody")
const createError = require("../utils/error")
const generateToken = require("../utils/generateToken")
const pgError = require("../utils/pgErr")
require("dotenv").config()

const adminCtrl = {
    createUserAccount: async (req, res, next) => {
        try {
            const { us_prenom, us_nom, us_tel, us_pass, et_nom, et_nomab, et_dev, et_aca, et_cap, et_type, et_tel, et_adr } = req.body
            const { isValid } = checkBody(us_prenom, us_nom, us_tel, us_pass, et_nom, et_nomab, et_dev, et_aca, et_cap, et_type, et_tel, et_adr)
            if (isValid === false) return next(createError(400, "champs invalide"))
            const cryptedPass = await bcrypt.hash(us_pass, 10)
            const createUserEtab = await etabModel.create({
                et_nom: et_nom,
                et_nomab: et_nomab,
                et_dev: et_dev,
                et_aca: et_aca,
                et_cap: et_cap,
                et_type: et_type,
                et_tel: et_tel,
                et_adr: et_adr
            })
            const { et_id } = createUserEtab
            if (cryptedPass) {
                try {
                    await userModel.create({ us_prenom, us_nom, us_tel, us_role: "dir", us_adr: "Auncun adresse definis", us_pass: cryptedPass, et_id })
                    return res.json({ message: "added" })
                } catch (err) {
                    await etabModel.destroy({ where: { et_id } })
                    pgError(err, next,
                        "users_unique1:nom et prenom pris",
                        "users_unique2:telephone pris",
                        "users_check1:role invalide"
                    )
                }
            }
        } catch (err) {
            pgError(err, next,
                "etabs_unique1:nom etablissement pris",
                "etabs_unique3:telephone pris",
                "etabs_check1:type etablissement invalide"
            )
        }
    },
    userAccountState: async (req, res, next) => {
        try {
            const { etId } = req.params
            const { type } = req.query
            const hasInvalidTypes = !["des", "act"].includes(type)
            if (hasInvalidTypes) return next(createError(400, "type invalide"))
            const findEtab = await etabModel.findByPk(etId)
            if (!findEtab) return next(createError(400, "etablissement introuvable"))
            const { et_id } = findEtab
            const updateObj = type === "des" ? { disabled: true } : { disabled: false }
            const message = type === "des" ? "desactiver" : "activer"
            await userModel.update({ ...updateObj }, { where: { et_id } })
            return res.json({ message })
        } catch (err) { return next(err) }
    },
    getAllUser: async (req, res, next) => {
        try {
            const query = `
                select us_id,et_nom,et_id,us_prenom,us_nom,us_role,us_sexe,us_tel,disabled,
                etabs.et_id from users
                join etabs using(et_id) 
                where us_role not in('admin','com','sur') 
            `
            const getAllUser = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
            return res.json(getAllUser)
        } catch (err) { return next(err) }
    },
    deleteAllUserData: async (req, res, next) => {
        try {
            const { usId } = req.params
            const findUser = await userModel.findByPk(usId)
            if (!findUser) return next(createError(400, "utilisateur introuvable"))
            const { et_id, us_role, us_id } = findUser
            if (us_role !== "dir") return next(createError(400, "role invalide"))
            const finUserEtab = await etabModel.findOne({ where: { et_id } })
            if (!finUserEtab) return next(createError(400, "boutique introuvable"))
            await userModel.destroy({ where: Sequelize.or({ us_id }, { et_id }) })
            await sequelize.query(`delete from inscriptions where el_id in 
            (select el_id from inscriptions join eleves using(el_id) where et_id=${et_id})`, { type: sequelize.QueryTypes.DELETE })
            await ascolaireModel.destroy({ where: { et_id } })
            await classeModel.destroy({ where: { et_id } })
            await eleveModel.destroy({ where: { et_id } })
            await profModel.destroy({ where: { et_id } })
            await etabModel.destroy({ where: { et_id } })
            return res.json({ message: "deleted" })
        } catch (err) { return next(err) }
    },
    editUserInfo: async (req, res, next) => {
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
                disabled: disabled || accountState
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
    editUserEtab: async (req, res, next) => {
        try {
            const { etId } = req.params
            const { nom, abr, aca, cap, dev, type, tel, adr } = req.body
            const findEtab = await etabModel.findByPk(etId)
            if (!findEtab) return next(createError(400, "etablissement introuvable"))
            const { et_id, et_nom, et_cap, et_aca, et_nomab, et_dev, et_type, et_tel, et_adr } = findEtab
            await etabModel.update({
                et_nom: nom || et_nom,
                et_nomab: abr || et_nomab,
                et_dev: dev || et_dev,
                et_aca: aca || et_aca,
                et_cap: cap || et_cap,
                et_type: type || et_type,
                et_tel: tel || et_tel,
                et_adr: adr || et_adr
            }, { where: { et_id } })
            return res.json(await etabModel.findByPk(et_id))
        } catch (err) {
            pgError(err, next,
                "etabs_unique1:nom etablissement pris",
                "etabs_unique3:telephone pris",
                "etabs_check1:type etablissement invalide"
            )
        }
    },
    resetPass: async (req, res, next) => {
        try {
            const { usId } = req.params
            const findUser = await userModel.findByPk(usId)
            if (!findUser) return next(createError(400, "compte introuvable"))
            const { us_role } = findUser
            if (us_role === "admin") return next(createError(400, "impossible de modifier le mot de passe"))
            const defaultPass = "12345"
            const cryptDefaulPass = await bcrypt.hash(defaultPass, 10)
            if (cryptDefaulPass) {
                await userModel.update({ us_pass: cryptDefaulPass }, { where: { us_id: usId } })
                return res.json({ message: "updated" })
            }
        } catch (err) { return next(err) }
    },
    createAdminAccount: async (req, res, next) => {
        try {
            const { token } = req.params
            const { prenom, nom, pass, tel } = req.body
            const { isValid } = checkBody(prenom, nom, pass, tel)
            if (isValid === false) return next(createError(400, "champs invalide"))
            jwt.verify(token, process.env.TOKEN_SECRET, async (err) => {
                if (err) return next(createError(400, "ce lien est expiré"))
                const findAdmin = await userModel.findAll({ where: { us_role: "admin" } })
                if (findAdmin.length >= 1) return next(createError(400, "un compte admin existe deja"))
                const cryptedPass = await bcrypt.hash(pass, 10)
                if (cryptedPass) {
                    await userModel.create({
                        us_prenom: prenom,
                        us_nom: nom,
                        us_pass: cryptedPass,
                        us_tel: tel,
                        us_role: "admin",
                        us_adr: "root admin"
                    })
                    return res.json({ message: "added" })
                }
            })
        } catch (err) {
            pgError(err, next,
                "users_unique1:nom et prenom pris",
                "users_unique2:telephone pris",
                "users_check1:role invalide"
            )
        }
    },
    recoveryPass: (req, res, next) => {
        try {
            const { rep } = req.body
            const { isValid } = checkBody(rep)
            if (isValid === false) return next(createError(400, "champs invalide"))
            if (rep !== process.env.RECOVERY_PASS) return next(createError(400, "mauvaise reponse"))
            const token = generateToken({ recovery: true }, 450)
            const generateLink = `/admin/pass/recovery/confirm/${token}`
            return res.json({ link: generateLink })
        } catch (err) { return next(err) }
    },
    confirmRecoveryPass: (req, res, next) => {
        try {
            const { token } = req.params
            const { newPass } = req.body
            const { isValid } = checkBody(newPass)
            if (isValid === false) return next(createError(400, "champ invalide"))
            jwt.verify(token, process.env.TOKEN_SECRET, async (err) => {
                if (err) return next(createError(400, "lien est expiré"))
                const findUser = await userModel.findOne({ where: { us_role: "admin" } })
                if (!findUser) return next(createError(400, "administrateur introuvable"))
                const { us_id } = findUser
                const cryptedPass = await bcrypt.hash(newPass, 10)
                if (cryptedPass) {
                    await userModel.update({ us_pass: cryptedPass }, { where: { us_id: us_id } })
                    return res.json({ message: "updated" })
                }
            })

        } catch (err) { return next(err) }
    },
}

module.exports = adminCtrl