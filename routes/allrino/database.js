"use strict";
const mysql = require("promise-mysql");
var jwt = require("jsonwebtoken");
// TODO: проверить перед тем как выкладывать,
const test = false; //  true если запускается локальная тестовая база

var baseBD = {
  host: "localhost",
  user: "autogie1_dj1",
  password: "Bigred668483",
  database: "autogie1_dj1",
};
if (test) {
  baseBD.user = "root";
  baseBD.password = "Bigred668483";
}

/// получаем таблицу по имени таблицы и лимиту и смещению
function getTable(res, table, limit = 1000, offset = 0) {
  mysql
    .createConnection(baseBD)
    .then(function (conn) {
      var result = conn.query("SELECT * FROM ?? LIMIT ? OFFSET ?", [
        table,
        limit,
        offset,
      ]);
      conn.end();
      return result;
    })
    .then(function (result) {
      res.json({ success: true, message: "Success", base: result });
    })
    .catch(function (error) {
      console.log("для задачи чтения " + error);
      if (connection && connection.end) connection.end();
      res.send({
        success: false,
        message: "Ошибка соеденения с базой " + error,
        base: [],
      });
    });
}

/// удаляем запись из таблицы по id
function deleteColumnTable(res, table, req, id) {
  mysql
    .createConnection(baseBD)
    .then(function (conn) {
      var result = conn.query("DELETE FROM ?? where id=?", [table, id]);
      conn.end();
      return result;
    })
    .then(function (result) {
      res.json({ success: true, message: "Success" });
    })
    .catch(function (error) {
      console.log("для задачи чтения " + error);
      if (connection && connection.end) connection.end();
      res.send({
        success: false,
        message: "Ошибка соеденения с базой " + error,
        base: [],
      });
    });
}

/// получаем запись из таблицы по id
function getColumnTable(res, table, id) {
  mysql
    .createConnection(baseBD)
    .then(function (conn) {
      var result = conn.query("SELECT * FROM ?? where id=?", [table, id]);
      conn.end();
      return result;
    })
    .then(function (result) {
      if (result.length > 0) {
        res.json({ success: true, message: "Success", base: result[0] });
      } else {
        res.json({ success: false, message: "Пользователь не найден" });
      }
    })
    .catch(function (error) {
      console.log("для задачи чтения по id" + error);
      if (connection && connection.end) connection.end();
      res.send({
        success: false,
        message: "Ошибка соеденения с базой " + error,
      });
    });
}

/// проверяем токен
async function checkToken(req) {
  const authorization = req.headers;

  // Проверка наличия заголовка авторизации
  if (!authorization || !authorization["authorization"]) {
    return { success: false, message: "Отсутствует заголовок авторизации" };
  }

  const token = authorization["authorization"].replace("Bearer ", "");

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, global.secretKey);
  } catch (error) {
    return { success: false, message: "Недействительный токен" };
  }
  let result = true;
  try {
    result = await checkTokenById(req.body.id, token);
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: error.message });
  }
  if (decodedToken.role !== "Администратор" && result) {
    return {
      success: false,
      message: "У вас нет прав на выполнение этой операции",
    };
  }

  return { success: true };
}

/// проверяем токен из таблицы по id
async function checkTokenById(id, token) {
  const connection = mysql.createConnection(baseBD);

  try {
    connection.connect();

    const results = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM ?? WHERE id = ?",
        [table, id],
        function (error, results) {
          if (error) {
            reject("Ошибка при выполнении запроса к базе данных: " + error);
          } else {
            resolve(results);
          }
        }
      );
    });

    if (results.length === 0) {
      return false; // Пользователь не найден
    }

    const user = results[0];
    if (user.token === token) {
      return true; // Токены совпадают
    } else {
      return false; // Токены не совпадают
    }
  } catch (error) {
    console.log("Ошибка при проверке токена: " + error);
    throw new Error("Ошибка при проверке токена: " + error);
  } finally {
    connection.end();
  }
}

module.exports = {
  baseBD: baseBD,
  getTable: getTable,
  deleteColumnTable: deleteColumnTable,
  getColumnTable: getColumnTable,
  checkToken: checkToken,
};
