// paiement
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("paiement", {
        pa_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        pa_motif: { type: DataTypes.STRING(200), allowNull: false },
        pa_mte: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        in_id: { type: DataTypes.INTEGER, allowNull: false }
    }, { createdAt: false, updatedAt: false })
}