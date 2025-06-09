const TelegramBot = require("node-telegram-bot-api");
const studentController = require("../controllers/studentController");
const { manejarRespuestaEstudiante } = require("../controllers/questionController");
const estadosUsuarios = require("../utils/estadosUsuarios");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Escucha /start para iniciar registro
bot.onText(/\/start/, (msg) => {
  studentController.manejarInicio(bot, msg);
});

bot.onText(/\/miprogreso/, (msg) => {
  studentController.verProgreso(bot, msg);
});

// Escucha cualquier otro mensaje (texto)
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  // Ignora comandos distintos a /start
  if (msg.text.startsWith("/")) return;

  // Si está en proceso de registro
  if (estadosUsuarios[chatId]) {
    await studentController.manejarTexto(bot, msg);
  } else {
    // Ya está registrado → respuesta a una pregunta
    await manejarRespuestaEstudiante(bot, msg);
  }
});

module.exports = bot;

