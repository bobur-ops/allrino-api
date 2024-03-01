const {
  baseBD,
  getTable,
  deleteColumnTable,
  getColumnTable,
  checkToken,
} = require("./database");

const mysql = require("promise-mysql");
const express = require("express");
const router = express.Router();

// Обработка маршрута /alrino/departament
/* Начальная страница */
router.get("/", function (req, res) {
  console.log("маршрут /alrino/departament");
  res.json("маршрут /alrino/departament Success ");
});

/// Читаем таблицу departament
router.get("/load_departaments", function (req, res) {
  getTable(res, "division", req.body.limit, req.body.offset);
});

/// получаем departament из таблицы по id
router.get("/get_departament/:id", function (req, res) {
  const id = parseInt(req.params.id);
  getColumnTable(res, "division", id);
});

/// удаляем departament из таблицы по id
router.delete("/departaments/:id", function (req, res) {
  const id = parseInt(req.params.id);
  deleteColumnTable(res, "division", req, id);
});

/// апдейт departament по id
router.put("/departaments/:id", function (req, res) {
  const id = parseInt(req.params.id);
  mysql
    .createConnection(baseBD)
    .then(function (conn) {
      var result = conn.query(
        "UPDATE division SET name=?, positions=?, city=? ancestor=? WHERE id = ?",
        [
          req.body.name,
          req.body.positions,
          req.body.city,
          req.body.ancestor,
          id,
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
      res.send({
        success: false,
        message: "Ошибка соеденения с базой " + error,
        base: [],
      });
      console.log("для задачи update " + error);
    });
});

/// добавление departament в таблицу
router.post("/add_departament", function (req, res) {
  mysql
    .createConnection(baseBD)
    .then(function (connection) {
      var result = connection.query(
        "INSERT INTO division (name, positions, city, ancestor) VALUES (?, ?, ?, ?)",
        [req.body.name, req.body.positions, req.body.city, req.body.ancestor]
      );
      connection.end();
      return result;
    })
    .then(function (result) {
      res.json({
        success: true,
        message: "Success",
        base: {
          id: result.insertId,
        },
      });
    })
    .catch(function (error) {
      res.send({
        success: false,
        message: "Ошибка соеденения с базой " + error,
        base: {},
      });
      console.log("для задачи добавления div " + error);
    });
});

module.exports = router;
