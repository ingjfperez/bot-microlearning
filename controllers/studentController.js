const db = require("../db/db");
const estadosUsuarios = require("../utils/estadosUsuarios");
const { enviarPreguntaPorId } = require("./questionController");

const CLAVE_ACCESO = "123456";  // clave del sistema

// Cuando se envía /start
async function manejarInicio(bot, msg) {
  const chatId = msg.chat.id;

  // Verificamos si ya está registrado
  const existe = await db.query("SELECT * FROM Estudiantes WHERE telegram_id = $1", [chatId]);

  if (existe.rows.length > 0) {
    await bot.sendMessage(chatId, "👋 ¡Hola de nuevo! Ya estás registrado. Espera tu próxima pregunta.");
    return;
  }

  // Si no está registrado, pedimos la clave
  await bot.sendMessage(chatId, "👋 ¡Hola, bienvenido al chatbot de la clase de Diseño y Programación Orientada a Objetos! 🔑 Por favor, ingresa tu clave de acceso para continuar: ");
  estadosUsuarios[chatId] = { estado: "esperando_clave" };
}

// Cuando el usuario envía cualquier texto
async function manejarTexto(bot, msg) {
  const chatId = msg.chat.id;
  const texto = msg.text?.trim();
  const estado = estadosUsuarios[chatId];

  if (!estado) return;

  switch (estado.estado) {
    case "esperando_clave":
      if (texto === CLAVE_ACCESO) {
        estadosUsuarios[chatId] = { estado: "esperando_nombre" };
        await bot.sendMessage(chatId, "✅ Clave correcta. ¿Cuál es tu *nombre completo*?", { parse_mode: "Markdown" });
      } else {
        await bot.sendMessage(chatId, "❌ Clave incorrecta. Intenta nuevamente.");
      }
      break;

    case "esperando_nombre":
      estadosUsuarios[chatId].nombre = texto;
      estadosUsuarios[chatId].estado = "esperando_codigo";
      await bot.sendMessage(chatId, "📛 Por favor, escribe tu *código estudiantil*:", { parse_mode: "Markdown" });
      break;

    case "esperando_codigo":
      estadosUsuarios[chatId].codigo = texto;
      estadosUsuarios[chatId].estado = "esperando_grupo";
      await bot.sendMessage(chatId, "👥 ¿A qué *grupo* perteneces?", { parse_mode: "Markdown" });
      break;

    case "esperando_grupo":
      estadosUsuarios[chatId].grupo = texto;

    
      try {
  const { nombre, codigo, grupo } = estadosUsuarios[chatId];

  // ✅ VALIDAR si el código ya fue registrado por otro usuario
  const existente = await db.query(
    "SELECT * FROM Estudiantes WHERE codigoEstudiante = $1 AND telegram_id != $2",
    [codigo, chatId]
  );

  if (existente.rows.length > 0) {
    await bot.sendMessage(chatId, "⚠️ Ya existe un estudiante registrado con este código. Verifica que sea correcto el *código estudiantil* y ejecuta nuevamente el comando */start*", { parse_mode: "Markdown" });
    return;
  }

  // ✅ Guardamos el estudiante si todo está bien
  await db.query(
    `INSERT INTO Estudiantes (telegram_id, nombreEstudiante, codigoEstudiante, grupo, fecha_ingreso, pregunta_actual)
     VALUES ($1, $2, $3, $4, NOW(), 2)
     ON CONFLICT (telegram_id) DO UPDATE
     SET nombreEstudiante = $2, codigoEstudiante = $3, grupo = $4, fecha_ingreso = NOW()`,
    [chatId, nombre, codigo, grupo]
  );

  await bot.sendMessage(chatId, "✅ Registro completado con éxito ✅. Aquí tienes tu primera pregunta:");

  // Enviar la primera pregunta (ID 1)
  await enviarPreguntaPorId(bot, chatId, 1);

  estadosUsuarios[chatId] = null;

} catch (err) {
  console.error("❌ Error al guardar estudiante ❌", err);
  await bot.sendMessage(chatId, "⚠️ Ocurrió un error al guardar tus datos. Porfavor intenta más tarde ⚠️");
}
  }
}

async function verProgreso(bot, msg) {
  const chatId = msg.chat.id;

  try {
    // Obtener código del estudiante
    const estudiante = await db.query("SELECT codigoEstudiante, pregunta_actual FROM Estudiantes WHERE telegram_id = $1", [chatId]);
    if (estudiante.rows.length === 0) {
      await bot.sendMessage(chatId, "❌ No estás registrado. Usa /start para comenzar.");
      return;
    }

    const codigo = estudiante.rows[0].codigoestudiante;
    const totalRespondidas = estudiante.rows[0].pregunta_actual - 1;

    // Contar aciertos
    const aciertos = await db.query(
      `SELECT COUNT(*) FROM respuestas WHERE codigoestudiante = $1 AND correcta = true`,
      [codigo]
    );

    const cantidadCorrectas = aciertos.rows[0].count;

    await bot.sendMessage(
      chatId,
      `📈 Has respondido *${totalRespondidas}* preguntas.\n✅ Has acertado *${cantidadCorrectas}*.\n🕐 Tu próxima pregunta llegará mañana a las 8:00 a.m. 🕐`,
      { parse_mode: "Markdown" }
    );

  } catch (error) {
    console.error("❌ Error al consultar progreso ❌", error.message);
    await bot.sendMessage(chatId, "⚠️ Ocurrió un error al obtener tu progreso ⚠️");
  }
}

module.exports = {
  manejarInicio,
  manejarTexto,
  verProgreso
};
