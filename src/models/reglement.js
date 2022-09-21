// reglement
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("reglement", {
        re_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        re_pay: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        mois: { type: DataTypes.SMALLINT, allowNull: false },
        annee: { type: DataTypes.SMALLINT, allowNull: false },
        pr_id: { type: DataTypes.INTEGER, allowNull: false },
        et_id: { type: DataTypes.INTEGER, allowNull: false },
    }, { createdAt: true, updatedAt: false })
}