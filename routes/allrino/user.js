const {
  baseBD,
  getTable,
  deleteColumnTable,
  getColumnTable,
} = require("./database");

const mysql = require("promise-mysql");
const express = require("express");
const router = express.Router();
var jwt = require("jsonwebtoken");

// Обработка маршрута /alrino/user
/* Начальная страница */
router.get("/", function (req, res) {
  console.log("маршрут /alrino/user");
  res.json("маршрут /alrino/user ");
});

/// авторизация пользователя
router.post("/auth", function (req, res) {
  mysql
    .createConnection(baseBD)
    .then(function (conn) {
      var result = conn.query("SELECT * FROM  ?? WHERE login=?", [
        "user",
        req.body.login,
      ]);
      conn.end();
      return result;
    })
    .then(function (result) {
      console.log("result.length " + result.length);
      console.log("passwor " + req.body.password);

      if (result.length > 0) {
        const base = result[0];
        console.log("passwor2 " + base.password);
        if (req.body.role !== "Исполнитель" && base.role === "Исполнитель") {
          res.json({
            success: false,
            message: "Этому пользователю нельзя войти",
          });
          return;
        }
        if (base.password === req.body.password) {
          res.json({ success: true, message: "success", base });
        } else {
          res.json({ success: false, message: "Неправильный пароль" });
        }
      } else {
        res.json({ success: false, message: "Пользователь не найден" });
      }
    })
    .catch(function (error) {
      console.log("Ошибка при аутентификации: " + error);
      res.send({ success: false, message: "Ошибка соединения с базой данных" });
    });
});

/// Читаем таблицу пользователей
router.get("/load_users", function (req, res) {
  getTable(res, "user", req.body.limit, req.body.offset);
});

/// получаем пользователя из таблицы по id
router.get("/get_user/:id", (req, res) => {
  console.log("get_user :id = " + req.params.id);
  const userId = parseInt(req.params.id);
  getColumnTable(res, "user", userId);
});

/// удаляем пользователя из таблицы по id
router.delete("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  deleteColumnTable(res, "user", req, userId);
});

/// апдейт пользователя по id
router.put("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const newUser = req.body;
  mysql
    .createConnection(baseBD)
    .then(function (conn) {
      const employmentDate = new Date(req.body.employment_date)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      var result = conn.query(
        "UPDATE user SET full_name=?, post=?, snils=?, inn=?, role=?, employment_date=?, project=?, status=?, position=? WHERE id = ?",
        [
          req.body.full_name,
          req.body.post,
          req.body.snils,
          req.body.inn,
          req.body.role,
          employmentDate,
          req.body.project,
          req.body.status,
          req.body.position,
          userId,
        ]
      );
      conn.end();
      return result;
    })
    .then(function (result) {
      console.log("base = " + baseBD.database + "   table = " + result);
      res.json({ success: true, message: "Success" });
    })
    .catch(function (error) {
      console.log("Ошибка соеденения с базой " + error);
      res.send({
        success: false,
        message: "Ошибка соеденения с базой " + error,
        base: [],
      });
      console.log("для задачи update " + error);
    });
});

/// добавление пользователя в таблицу
router.post("/add_user", function (req, res) {
  let token;
  mysql
    .createConnection(baseBD)
    .then(function (connection) {
      const employmentDate = new Date(req.body.employment_date)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      token = createToken(req.body.role, employmentDate);
      var result = connection.query(
        "INSERT INTO user (token, full_name, post, snils, inn, login, password, role, department, employment_date, project, status, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          token,
          req.body.full_name,
          req.body.post,
          req.body.snils,
          req.body.inn,
          req.body.login,
          req.body.password,
          req.body.role,
          req.body.department,
          employmentDate,
          req.body.project,
          req.body.status,
          req.body.position,
        ]
      );
      connection.end();
      return result;
    })
    .then(function (result) {
      console.log("base = " + baseBD.database + "   table = " + result);
      res.json({
        success: true,
        message: "Success",
        base: {
          id: result.insertId,
          token: token,
        },
      });
    })
    .catch(function (error) {
      console.log("Ошибка соеденения с базой " + error);
      res.send({
        success: false,
        message: "Ошибка соеденения с базой " + error,
        base: {},
      });
      console.log("для задачи добавления юзера " + error);
    });
});

// Функция для создания нового токена
function createToken(role, date) {
  const min = 100000000;
  const max = 200000000;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  // Генерация нового токена с помощью функции jwt.sign
  const token = jwt.sign({ date: date, role: role }, global.secretKey);
  return token;
}

module.exports = router;
