require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const evaluarRespuestaConIA = async (preguntaTexto, respuestaTexto) => {
  const prompt = `Hice la siguiente pregunta: "${preguntaTexto}"\nY recibí esta respuesta: "${respuestaTexto}".\nDime si es Verdadero o Falso y dame un feedback. La primera palabra de tu respuesta debe ser "Verdadero" o "Falso".`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // ⬅️ cambiado aquí

    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();
    const match = content.match(/^(verdadero|falso)[\s\.,:;!?-]?/i);
    const esCorrecta = match ? match[1].toLowerCase() === "verdadero" : false;
    return {
      correcta: esCorrecta,
      feedback: content,
    };

  } catch (err) {
    console.error("❌ Error usando Gemini:", err.response?.data || err.message);
    return {
      correcta: false,
      feedback: "⚠️ No se pudo evaluar la respuesta con IA.",
    };
  }
};

module.exports = { evaluarRespuestaConIA };
