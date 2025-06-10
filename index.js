require('dotenv').config();
const bot = require('./bot/bot'); // Importamos la configuración del bot
require("./scheduler");

const express = require("express");
const app = express();
const dashboardRoute = require("./routes/dashboard");

app.set("view engine", "ejs");
app.use(express.static("public")); // si tienes CSS u otros archivos
app.use("/dashboard", dashboardRoute);

app.listen(3000, () => {
  console.log("🚀 Dashboard corriendo en http://localhost:3000/dashboard para localhost\n Para servidor en https://bot-microlearning.onrender.com/dashboard");
});
