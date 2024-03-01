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

// Обработка маршрута /alrino/project
/* Начальная страница */
router.get("/", function (req, res) {
  console.log("маршрут /alrino/project");
  res.json("маршрут /alrino/project Success ");
});

/// Читаем таблицу организаций
router.get("/load_projects", function (req, res) {
  getTable(res, "org", req.body.limit, req.body.offset);
});

/// получаем организацию из таблицы по id
router.get("/get_project/:id", function (req, res) {
  const id = parseInt(req.params.id);
  getColumnTable(res, "org", id);
});

/// удаляем организацию из таблицы по id
router.delete("/projects/:id", function (req, res) {
  const id = parseInt(req.params.id);
  deleteColumnTable(res, "org", req, id);
});

/// апдейт организации по id
router.put("/projects/:id", function (req, res) {
  const id = parseInt(req.params.id);
  const end_date = new Date(req.body.end_date)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  mysql
    .createConnection(baseBD)
    .then(function (conn) {
      var result = conn.query(
        "UPDATE org SET name=?, service=?, contract=?, end_date=?, project_manager=?, status=?, in_office=?, on_road=?, department=? WHERE id = ?",
        [
          req.body.name,
          req.body.service,
          req.body.contract,
          end_date,
          req.body.project_manager,
          req.body.status,
          req.body.in_office,
          req.body.on_road,
          req.body.department,
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

/// добавление организации в таблицу
router.post("/add_project", function (req, res) {
  const end_date = new Date(req.body.end_date)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  mysql
    .createConnection(baseBD)
    .then(function (connection) {
      var result = connection.query(
        "INSERT INTO org (name, service, contract, end_date, project_manager, status, in_office, on_road, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          req.body.name,
          req.body.service,
          req.body.contract,
          end_date,
          req.body.project_manager,
          req.body.status,
          req.body.in_office,
          req.body.on_road,
          req.body.department,
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
