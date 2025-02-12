import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Aleksey102003$",
  database: "blog",
  port: 3306,
};

const pool = mysql.createPool(dbConfig);

const connectToDatabase = async (): Promise<mysql.Connection> => {
  try {
    const connection = await pool.getConnection();
    console.log('Подключение к базе данных успешно!');
    return connection;
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
    throw error;
  }
};

export default connectToDatabase;
