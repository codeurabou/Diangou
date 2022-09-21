// matserie
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("matserie", {
        ms_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        ms_coef: { type: DataTypes.REAL, allowNull: false },
        se_id: { type: DataTypes.INTEGER, allowNull: false },
        ma_id: { type: DataTypes.INTEGER, allowNull: false },
        et_id: { type: DataTypes.INTEGER, allowNull: false }
    }, { createdAt: false, updatedAt: false })
}