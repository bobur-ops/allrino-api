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

// Обработка маршрута /alrino/document
/* Начальная страница */
router.get("/", function (req, res) {
  console.log("маршрут /alrino/document");
  res.json("маршрут /alrino/document Success ");
});

/// Читаем таблицу document
router.get("/load_documents", function (req, res) {
  getTable(res, "documents", req.body.limit, req.body.offset);
});

/// получаем document из таблицы по id
router.get("/get_document/:id", function (req, res) {
  const id = parseInt(req.params.id);
  getColumnTable(res, "documents", id);
});

/// удаляем document из таблицы по id
router.delete("/document/:id", function (req, res) {
  const id = parseInt(req.params.id);
  deleteColumnTable(res, "documents", req, id);
});

/// апдейт document по id
router.put("/document/:id", function (req, res) {
  const id = parseInt(req.params.id);
  const data = new Date(req.body.data)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  mysql
    .createConnection(baseBD)
    .then(function (conn) {
      var result = conn.query(
        "UPDATE documents SET year=?, data=?,	service=?,	contract=?,	project=?,	fio=?, type=?, description=?, url=?, begin=?, end=?, place=?, intensity=?  WHERE id = ?",
        [
          req.body.year,
          data,
          req.body.service,
          req.body.contract,
          req.body.project,
          req.body.fio,
          req.body.type,
          req.body.description,
          req.body.url,
          req.body.begin,
          req.body.end,
          req.body.place,
          req.body.intensity,
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

/// добавление document в таблицу
router.post("/add_document", function (req, res) {
  const data = new Date(req.body.data)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  mysql
    .createConnection(baseBD)
    .then(function (connection) {
      var result = connection.query(
        "INSERT INTO documents (year, data, service, contract, project, fio, type, description, url, begin, end, place, intensity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          req.body.year,
          data,
          req.body.service,
          req.body.contract,
          req.body.project,
          req.body.fio,
          req.body.type,
          req.body.description,
          req.body.url,
          req.body.begin,
          req.body.end,
          req.body.place,
          req.body.intensity,
        ]
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
