const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Mostrar TODOS los estudiantes (ruta principal)
router.get("/", async (req, res) => {
  try {
    const estudiantesResult = await db.query("SELECT * FROM Estudiantes ORDER BY nombreEstudiante");
    const estudiantes = estudiantesResult.rows;

    const respuestasResult = await db.query("SELECT * FROM respuestas");
    const respuestas = respuestasResult.rows;

    const gruposResult = await db.query("SELECT DISTINCT grupo FROM Estudiantes ORDER BY grupo");
    const grupos = gruposResult.rows.map(g => g.grupo);

    const data = estudiantes.map(est => {
      const respuestasEst = respuestas.filter(r => r.codigoestudiante === est.codigoestudiante);

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

    const preguntas = [...new Set(respuestas.map(r => `P${r.idpregunta}`))].sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

    res.render("dashboard", { data, preguntas, grupos });
  } catch (error) {
    console.error("❌ Error en dashboard:", error.message);
    res.send("Error al cargar el panel");
  }
});

// Mostrar solo estudiantes de un GRUPO específico
router.get("/grupo/:grupo", async (req, res) => {
  const grupo = req.params.grupo;

  try {
    const estudiantesResult = await db.query("SELECT * FROM Estudiantes WHERE grupo = $1 ORDER BY nombreEstudiante", [grupo]);
    const estudiantes = estudiantesResult.rows;

    const respuestasResult = await db.query("SELECT * FROM respuestas");
    const respuestas = respuestasResult.rows;

    const gruposResult = await db.query("SELECT DISTINCT grupo FROM Estudiantes ORDER BY grupo");
    const grupos = gruposResult.rows.map(g => g.grupo);

    const data = estudiantes.map(est => {
      const respuestasEst = respuestas.filter(r => r.codigoestudiante === est.codigoestudiante);
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

    const preguntas = [...new Set(respuestas.map(r => `P${r.idpregunta}`))].sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

    res.render("dashboard", { data, preguntas, grupos });
  } catch (error) {
    console.error("❌ Error filtrando por grupo:", error.message);
    res.send("Error al cargar estudiantes por grupo");
  }
});

// Ruta para consultar estudiante individual (sin cambios)
router.get("/estudiante/:codigo", async (req, res) => {
  const codigo = req.params.codigo;

  try {
    const estudianteResult = await db.query("SELECT * FROM Estudiantes WHERE codigoEstudiante = $1", [codigo]);
    if (estudianteResult.rows.length === 0) {
      return res.send("Estudiante no encontrado.");
    }

    const estudiante = estudianteResult.rows[0];

    const respuestasResult = await db.query(`
      SELECT r.idpregunta, r.respuesta, r.correcta, e.feedback
      FROM respuestas r
      LEFT JOIN respuestasevaluadas e ON r.idfeedback = e.idfeedback
      WHERE r.codigoestudiante = $1
      ORDER BY r.idpregunta ASC
    `, [codigo]);

    const respuestas = respuestasResult.rows;

    res.render("estudiante", { estudiante, respuestas });
  } catch (error) {
    console.error("❌ Error consultando estudiante:", error.message);
    res.send("Error consultando al estudiante.");
  }
});

module.exports = router;

