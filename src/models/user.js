// user
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("user", {
        us_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        us_prenom: { type: DataTypes.STRING(60), allowNull: false },
        us_nom: { type: DataTypes.STRING(30), allowNull: false },
        us_role: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "admin" },
        us_sexe: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: "h" },
        us_tel: { type: DataTypes.STRING(21), allowNull: false },
        us_pass: { type: DataTypes.STRING(100), allowNull: false },
        disabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        et_id: { type: DataTypes.INTEGER, allowNull: true }
    }, { createdAt: false, updatedAt: false })
}