// cour
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("cour", {
        co_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        pr_id: { type: DataTypes.INTEGER, allowNull: false },
        ma_id: { type: DataTypes.INTEGER, allowNull: false },
        cl_id: { type: DataTypes.INTEGER, allowNull: false },
    }, { createdAt: false, updatedAt: false })
}