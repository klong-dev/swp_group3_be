const { Sequelize, DataTypes } = require("sequelize");

// Khởi tạo kết nối đến cơ sở dữ liệu
const sequelize = new Sequelize({
  dialect: "mysql",
  host: "localhost",
  username: "root",
  password: "",
  database: "swp",
});

async function connect() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

module.exports = { sequelize, connect };
