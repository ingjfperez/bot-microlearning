require('dotenv').config();
const bot = require('./bot/bot'); // Importamos la configuración del bot
require("./scheduler");

const express = require("express");
const app = express();

// Middlewares necesarios para formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ⬅️ Esta línea es clave

// Configuración de motor de vistas y archivos estáticos
app.set("view engine", "ejs");
app.use(express.static("public"));

// Rutas
const dashboardRoute = require("./routes/dashboard");
const preguntasRoutes = require('./routes/preguntas');

app.use('/dashboard', dashboardRoute);
app.use('/preguntas', preguntasRoutes);

// Iniciar servidor
app.listen(3000, () => {
  console.log("🚀 Dashboard corriendo en http://localhost:3000/dashboard, y preguntas en http://localhost:3000/preguntas para localhost\n Para servidor en https://bot-microlearning.onrender.com/dashboard");
});
