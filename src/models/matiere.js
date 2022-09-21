// matiere
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("matiere", {
        ma_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        ma_nom: { type: DataTypes.STRING(180), allowNull: false },
        ma_nomab: { type: DataTypes.STRING(15), allowNull: false },
    }, { createdAt: false, updatedAt: false })
}