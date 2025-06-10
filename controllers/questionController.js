const db = require("../db/db");
const { evaluarRespuestaConIA } = require("../services/iaService");

// Función para enviar una pregunta específica a un estudiante
const enviarPreguntaPorId = async (bot, chatId, idpregunta) => {
  try {
    const result = await db.query("SELECT * FROM preguntas WHERE idPregunta = $1", [idpregunta]);
    const pregunta = result.rows[0];
    if (!pregunta) {
      await bot.sendMessage(chatId, "❌ No se encontró la pregunta.");
      return;
    }

    await bot.sendMessage(chatId, `📚 *Tema:* ${pregunta.tema}`, { parse_mode: "Markdown" });
    await bot.sendMessage(chatId, `🧠 *Explicación:* ${pregunta.explicacion}`, { parse_mode: "Markdown" });
    if (pregunta.link_opcional) {
      await bot.sendMessage(chatId, `🔗 Recurso adicional: ${pregunta.link_opcional}`);
    }
    await bot.sendMessage(chatId, `❓ *Pregunta:* ${pregunta.pregunta}`, { parse_mode: "Markdown" });

  } catch (error) {
    console.error("❌ Error al enviar pregunta:", error.message);
    await bot.sendMessage(chatId, "⚠️ Ocurrió un error al enviar la pregunta.");
  }
};

// ✅ NUEVA FUNCIÓN para manejar respuestas
const manejarRespuestaEstudiante = async (bot, msg) => {
  const chatId = msg.chat.id;
  const respuestaTexto = msg.text?.trim();

  try {
    // 1. Obtener el estudiante
    const estudiante = await db.query("SELECT * FROM estudiantes WHERE telegram_id = $1", [chatId]);
    if (estudiante.rows.length === 0) return;

    const codigo = estudiante.rows[0].codigoestudiante;
    const idPregunta = estudiante.rows[0].pregunta_actual - 1;

    // 2. Obtener pregunta
    const preguntaResult = await db.query("SELECT * FROM preguntas WHERE idPregunta = $1", [idPregunta]);
    const pregunta = preguntaResult.rows[0];
    if (!pregunta) return;

    let feedback, correcta, idFeedback;

    // 3. Revisar si esa misma respuesta ya fue evaluada
    const resEva = await db.query(
      `SELECT * FROM respuestasevaluadas WHERE idpregunta = $1 AND respuesta = $2`,
      [idPregunta, respuestaTexto]
    );

    if (resEva.rows.length > 0) {
      // ✅ Ya evaluada antes
      feedback = resEva.rows[0].feedback;
      correcta = resEva.rows[0].correcta;
      idFeedback = resEva.rows[0].idfeedback;
    } else {
      // 🤖 Enviar a IA
      const evaluacion = await evaluarRespuestaConIA(pregunta.pregunta, respuestaTexto);
      feedback = evaluacion.feedback;
      correcta = evaluacion.correcta;

      // Guardar en respuestasevaluadas
      const insert = await db.query(
        `INSERT INTO respuestasevaluadas (idpregunta, respuesta, correcta, feedback, fechaevaluacion)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING idfeedback`,
        [idPregunta, respuestaTexto, correcta, feedback]
      );

      idFeedback = insert.rows[0].idfeedback;
    }

    // 4. Guardar en tabla respuestas
    await db.query(
      `INSERT INTO respuestas (codigoestudiante, idpregunta, respuesta, correcta, idfeedback, fecha, telegram_id)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
      [codigo, idPregunta, respuestaTexto, correcta, idFeedback, chatId]
    );

    // 5. Enviar feedback al estudiante
    const icono = correcta ? "✅" : "❌";
    await bot.sendMessage(chatId, `${icono} *Resultado:* ${feedback}`, { parse_mode: "Markdown" });

    // 6. Mensaje adicional
    await bot.sendMessage(chatId, "📊 Respuesta registrada. Recibirás una nueva pregunta mañana a las 12:00 p.m.\n📈 Si quieres consultar tu progreso */miprogreso* 📈", { parse_mode: "Markdown" });

  } catch (error) {
    console.error("❌ Error al manejar la respuesta del estudiante:", error.message);
    await bot.sendMessage(chatId, "⚠️ Hubo un problema al evaluar tu respuesta.");
  }
    

};

module.exports = {
  enviarPreguntaPorId,
  manejarRespuestaEstudiante,
};
