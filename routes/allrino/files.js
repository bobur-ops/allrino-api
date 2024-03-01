const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

// Создаем папку для сохранения файлов, если ее нет
const rootUploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(rootUploadDir)) {
  fs.mkdirSync(rootUploadDir);
}

// Обработка маршрута /alrino/files
/* Начальная страница */
router.get("/", function (req, res) {
  console.log("маршрут /alrino/files");
  res.json("маршрут /alrino/files Success ");
});

// Обработчик POST запроса для сохранения байтов в файл .xlsx
router.post("/upload", (req, res) => {
  if (!req.body.fileName) {
    return res.status(400).send("Не указано имя файла");
    res.json({ success: false, message: "Не указано имя файла" });
  }

  // Создаем Workbook
  const workbook = XLSX.utils.book_new();

  // Преобразуем байты в ArrayBuffer
  const arrayBuffer = new Uint8Array(req.body.file).buffer;

  // Читаем данные из ArrayBuffer
  const data = new Uint8Array(arrayBuffer);

  // Парсим данные в формате Excel
  const excelData = XLSX.read(data, { type: "array" });

  // Добавляем данные в Workbook
  XLSX.utils.book_append_sheet(
    workbook,
    excelData.Sheets[excelData.SheetNames[0]],
    "Sheet1"
  );
  const filePath = path.join(rootUploadDir, `${req.body.fileName}`);
  // Создаем новый файл и записываем в него таблицу
  try {
    XLSX.writeFile(workbook, filePath);
    console.log("Файл Excel успешно сохранен:", filePath);
    res.status(200).json({
      success: true,
      message: "Файл успешно сохранен",
      base: filePath,
    });
  } catch (err) {
    console.error("Ошибка при сохранении файла Excel:", err);
    res
      .status(500)
      .json({ success: false, message: "Ошибка при сохранении файла Excel" });
  }

  // fs.writeFile(filePath, req.body.file, (err) => {
  //   if (err) {
  //     res.json({ success: false, message: "Ошибка при сохранении файла" });
  //     // return res.status(500).send("Ошибка при сохранении файла");
  //   }
  //   res.json({ success: true, message: "success", base: filePath });
  //  res.status(200).send({ link: `/uploadDir/${req.body.fileName}.xlsx` });
  // });
});

// Обработчик GET запроса для скачивания файла по имени
router.get("/download/:filename", (req, res) => {
  const filePath = path.join(rootUploadDir, `${req.params.filename}`);

  // Проверяем существование файла
  if (fs.existsSync(filePath)) {
    // Отправляем файл клиенту
    res.download(filePath, (err) => {
      if (err) {
        console.error("Ошибка при скачивании файла:", err);
        res.status(500).send("Ошибка при скачивании файла");
      } else {
        console.log("Файл успешно отправлен клиенту:", filename);
      }
    });
  } else {
    res.status(404).send("Файл не найден");
  }
});

// Обработчик GET запроса для открытия файла в Excel
router.get("/open/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(rootUploadDir, `${filename}`);

  // Проверяем существование файла
  if (fs.existsSync(filePath)) {
    // Отправляем файл клиенту
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Ошибка при отправке файла:", err);
        res.status(500).send("Ошибка при отправке файла");
      } else {
        console.log("Файл успешно открыт клиенту:", filename);
      }
    });
  } else {
    res.status(404).send("Файл не найден");
  }
});

module.exports = router;
