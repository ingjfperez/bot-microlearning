const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Ruta: /dashboard
router.get("/", async (req, res) => {
  try {
    // 1. Obtener todos los estudiantes
    const estudiantesResult = await db.query("SELECT * FROM Estudiantes ORDER BY nombreEstudiante");
    const estudiantes = estudiantesResult.rows;

    // 2. Obtener todas las respuestas
    const respuestasResult = await db.query("SELECT * FROM respuestas");
    const respuestas = respuestasResult.rows;

    // 3. Armar datos para la tabla
    const data = estudiantes.map(est => {
      const respuestasEst = respuestas.filter(r => r.codigoestudiante === est.codigoestudiante);

      // Obtener respuestas individuales por número de pregunta
      const respuestasPorPregunta = {};
      let puntaje = 0;

      for (const r of respuestasEst) {
        respuestasPorPregunta[`P${r.idpregunta}`] = r.correcta ? "✔️" : "❌";
        if (r.correcta) puntaje++;
      }

      return {
        nombre: est.nombreestudiante,
        codigo: est.codigoestudiante,
        grupo: est.grupo,
        respuestas: respuestasPorPregunta,
        puntaje,
        total: Object.keys(respuestasPorPregunta).length,
      };
    });

    // Obtener lista única de preguntas para el encabezado
    const preguntas = [...new Set(respuestas.map(r => `P${r.idpregunta}`))].sort((a, b) => {
      return parseInt(a.slice(1)) - parseInt(b.slice(1));
    });

    res.render("dashboard", { data, preguntas });
  } catch (error) {
    console.error("❌ Error en dashboard:", error.message);
    res.send("Error al cargar el panel");
  }
});

// Ruta por código de estudiante
router.get("/estudiante/:codigo", async (req, res) => {
  const codigo = req.params.codigo;

  try {
    // 1. Obtener datos del estudiante
    const estudianteResult = await db.query("SELECT * FROM Estudiantes WHERE codigoEstudiante = $1", [codigo]);

    if (estudianteResult.rows.length === 0) {
      return res.send("Estudiante no encontrado.");
    }

    const estudiante = estudianteResult.rows[0];

    // 2. Obtener sus respuestas + feedback
    const respuestasResult = await db.query(`
      SELECT r.idpregunta, r.respuesta, r.correcta, e.feedback
      FROM respuestas r
      LEFT JOIN respuestasevaluadas e ON r.idfeedback = e.idfeedback
      WHERE r.codigoestudiante = $1
      ORDER BY r.idpregunta ASC
    `, [codigo]);

    const respuestas = respuestasResult.rows;

    res.render("estudiante", {
      estudiante,
      respuestas
    });

  } catch (error) {
    console.error("❌ Error consultando estudiante:", error.message);
    res.send("Error consultando al estudiante.");
  }
})

module.exports = router;
