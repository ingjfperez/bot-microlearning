// scheduler.js
const schedule = require("node-schedule");
const db = require("./db/db");
const bot = require("./bot/bot");

const enviarPreguntaDiaria = async () => {
  try {
    const estudiantes = await db.query("SELECT telegram_id, pregunta_actual FROM estudiantes");

    for (let row of estudiantes.rows) {
      const chatId = row.telegram_id;
      let numeroPregunta = row.pregunta_actual;

      // 1. Obtener la pregunta secuencial por ID
      const result = await db.query(
        "SELECT * FROM preguntas WHERE idPregunta = $1",
        [numeroPregunta]
      );

      const pregunta = result.rows[0];

      if (!pregunta) {
        await bot.sendMessage(chatId, "🎉 Ya completaste todas las preguntas. Se te enviara nuevas preguntas cuando hayan disponibles. 🎉");
        continue;
      }

      // 2. Enviar tema
      await bot.sendMessage(chatId, `📚 *Tema:* ${pregunta.tema}`, { parse_mode: "Markdown" });

      // 3. Enviar explicación
      await bot.sendMessage(chatId, `🧠 *Explicación:* ${pregunta.explicacion}`, { parse_mode: "Markdown" });

      // 4. Enviar link si hay
      if (pregunta.link_opcional) {
        await bot.sendMessage(chatId, `🔗 Recurso adicional: ${pregunta.link_opcional}`);
      }

      // 5. Enviar pregunta
      await bot.sendMessage(chatId, `❓ *Pregunta:* ${pregunta.pregunta}`, { parse_mode: "Markdown" });

      // 6. Actualizar pregunta_actual (+1)
      await db.query(
        `UPDATE estudiantes SET pregunta_actual = $1 WHERE telegram_id = $2`,
        [numeroPregunta + 1, chatId]
      );
    }
  } catch (err) {
    console.error("❌ Error en el envío diario:", err);
  }
};

// Programar envío todos los días a las 8:00 AM
schedule.scheduleJob("35 1 * * *", () => {
  console.log("⏰ Ejecutando envío diario de preguntas...");
  enviarPreguntaDiaria();
});

module.exports = enviarPreguntaDiaria;
