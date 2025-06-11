const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Mostrar todas las preguntas
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Preguntas ORDER BY idPregunta ASC");
    res.render("preguntas", { preguntas: result.rows });
  } catch (error) {
    console.error("❌ Error al cargar preguntas:", error.message);
    res.send("Error al mostrar preguntas");
  }
});

// Agregar nueva pregunta
router.post("/agregar", async (req, res) => {
  const { tema, pregunta, explicacion, link_opcional } = req.body;
  try {
    await db.query(
      `INSERT INTO Preguntas (tema, pregunta, explicacion, link_opcional) VALUES ($1, $2, $3, $4)`,
      [tema, pregunta, explicacion, link_opcional]
    );
    res.redirect("/preguntas");
  } catch (err) {
    console.error("❌ Error al agregar pregunta:", err.message);
    res.send("Error al agregar pregunta");
  }
});

// Eliminar pregunta
router.post("/eliminar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM Preguntas WHERE idPregunta = $1", [id]);
    res.redirect("/preguntas");
  } catch (err) {
    console.error("❌ Error al eliminar pregunta:", err.message);
    res.send("Error al eliminar");
  }
});

// Editar pregunta
router.post("/editar/:id", async (req, res) => {
  const { id } = req.params;
  const { tema, pregunta, explicacion, link_opcional } = req.body;
  try {
    await db.query(
      `UPDATE Preguntas SET tema = $1, pregunta = $2, explicacion = $3, link_opcional = $4 WHERE idPregunta = $5`,
      [tema, pregunta, explicacion, link_opcional, id]
    );
    res.redirect("/preguntas");
  } catch (err) {
    console.error("❌ Error al editar pregunta:", err.message);
    res.send("Error al editar");
  }
});

module.exports = router;
