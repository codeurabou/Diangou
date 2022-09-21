// etab
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("etab", {
        et_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        et_nom: { type: DataTypes.STRING(200), allowNull: false },
        et_nomab: { type: DataTypes.STRING(15), allowNull: false },
        et_aca: { type: DataTypes.STRING(60), allowNull: false },
        et_cap: { type: DataTypes.STRING(60), allowNull: false },
        et_dev: { type: DataTypes.STRING(60), allowNull: false },
        et_type: { type: DataTypes.CHAR(2), allowNull: false },
        et_tel: { type: DataTypes.STRING(64), allowNull: false },
        et_adr: { type: DataTypes.STRING(200), allowNull: false },
        et_url: { type: DataTypes.STRING, allowNull: true }
    }, { createdAt: true, updatedAt: false })
}