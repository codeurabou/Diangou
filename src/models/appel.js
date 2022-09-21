// appel
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("appel", {
        ap_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        ap_motif: { type: DataTypes.STRING(200), allowNull: false },
        cl_id: { type: DataTypes.INTEGER, allowNull: false }
    }, { createdAt: true, updatedAt: false })
}