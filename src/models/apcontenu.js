// apcontenu
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("apcontenu", {
        apc_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        apc_etat: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        el_id: { type: DataTypes.INTEGER, allowNull: false },
        ap_id: { type: DataTypes.INTEGER, allowNull: false }
    }, { createdAt: false, updatedAt: false })
}