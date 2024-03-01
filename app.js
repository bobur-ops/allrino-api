"use strict";
// <reference path="All/credentials.js" />
global.secretKey =
  "Ci23fWtahDYE3dfirAHrJhzrUEoslIxqwcDN9VNhRJCWf8Tyc1F1mqYrjGYF";
var debug = require("debug");
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const jwt = require("jsonwebtoken"); // аутентификация по JWT для hhtp

// Создаем папку для сохранения файлов, если ее нет
global.uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

var index = require("./routes/index");
var enter = require("./routes/enter");
var allrino = require("./routes/allrino/allrino")(uploadDir);
var app = express();

//увеличиваем лимит загрузки
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
//Отключить запрос данных о сервере
app.disable("x-powered-by");
//Ссылка на статичный каталог, где храняться пользовательские файлы
app.use(express.static(__dirname + "/public"));
// uncomment after placing your favicon in /public
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "views")));
// доступ к серверу
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Authorization"
  );
  next();
});

app.use("/", index);
app.use("/enter", enter);
app.use("/allrino/api", allrino);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    var message =
      "ошибка сервера, статус: " + err.status + "  сообщение: " + err.message;
    res.json(message);
    // res.sendFile("error.html", {
    //   message: err.message,
    //   error: err,
    // });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  var message =
    "ошибка сервера, статус: " + err.status + "  сообщение: " + err.message;
  res.json(message);

  // res.sendFile("error.html", {
  //   message: err.message,
  //   error: err,
  // });
});

app.set("port", process.env.PORT || 3000);

var server = app.listen(app.get("port"), function () {
  debug("Express server listening on port " + server.address().port);
});
