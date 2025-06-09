-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS Estudiantes (
  codigoEstudiante VARCHAR PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  nombreEstudiante TEXT NOT NULL,
  grupo TEXT,
  fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de preguntas
CREATE TABLE IF NOT EXISTS Preguntas (
  idPregunta SERIAL PRIMARY KEY,
  tema TEXT NOT NULL,
  pregunta TEXT NOT NULL,
  explicacion TEXT,
  link_opcional TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de respuestas evaluadas (DeepSeek)
CREATE TABLE IF NOT EXISTS RespuestasEvaluadas (
  idFeedback SERIAL PRIMARY KEY,
  idPregunta INT REFERENCES Preguntas(idPregunta),
  respuesta TEXT NOT NULL,
  correcta BOOLEAN,
  feedback TEXT,
  fechaEvaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de respuestas de estudiantes
CREATE TABLE IF NOT EXISTS Respuestas (
  idRespuesta SERIAL PRIMARY KEY,
  codigoEstudiante VARCHAR REFERENCES Estudiantes(codigoEstudiante),
  idPregunta INT REFERENCES Preguntas(idPregunta),
  respuesta TEXT NOT NULL,
  correcta BOOLEAN,
  idFeedback INT REFERENCES RespuestasEvaluadas(idFeedback),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE respuestas ADD COLUMN telegram_id BIGINT;


-- Insertar múltiples preguntas en la tabla Preguntas
INSERT INTO Preguntas (tema, pregunta, explicacion, link_opcional)
VALUES
  ('SQL', '¿Qué es una clave primaria?', 'Una clave primaria es un campo que identifica de manera única cada registro en una tabla.', 'https://www.tutorialesprogramacionya.com/mysqlya/temarios/descripcion.php?cod=11&punto=11&inicio='),
  ('Programación', '¿Qué es un bucle for?', 'Un bucle for repite un bloque de código un número específico de veces.', NULL),
  ('Bases de datos', '¿Qué es una relación muchos a muchos?', 'Ocurre cuando múltiples registros en una tabla se relacionan con múltiples registros en otra tabla.', 'https://bdigital.uvhm.edu.mx/wp-content/uploads/2020/05/Bases-de-Datos.pdf'),
  ('SQL', '¿Para qué sirve el comando JOIN?', 'JOIN combina filas de dos o más tablas basándose en una columna relacionada entre ellas.', 'https://www.youtube.com/watch?v=Atpj2UsF65M');


DELETE FROM estudiantes WHERE codigoestudiante = '67000765';
DELETE FROM respuestas WHERE idfeedback = '7';
DELETE FROM respuestasevaluadas WHERE idfeedback = '7';

ALTER TABLE Estudiantes ADD CONSTRAINT codigo_unico UNIQUE (codigoEstudiante);


TRUNCATE TABLE respuestasevaluadas RESTART IDENTITY CASCADE;
TRUNCATE TABLE estudiantes RESTART IDENTITY;
TRUNCATE TABLE Estudiantes RESTART IDENTITY CASCADE;