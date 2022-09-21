// serie
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("serie", {
        se_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        se_nom: { type: DataTypes.STRING(100), allowNull: false },
        se_nomab: { type: DataTypes.STRING(15), allowNull: false },
        se_niveau: { type: DataTypes.SMALLINT, allowNull: false }
    }, { createdAt: false, updatedAt: false })
}