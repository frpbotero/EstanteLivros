require("express-async-errors");
const express = require("express");
require("dotenv").config();

const { connect } = require("./src/db");
const { corsMiddleware } = require("./src/cors");

async function main() {
  const collections = await connect();

  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(corsMiddleware(process.env.FRONTEND_ORIGIN));

  app.get("/", function (req, res) {
    res.send("Hello World");
  });

  app.use("/auth", require("./src/routes/auth")(collections));
  app.use("/livros", require("./src/routes/books")(collections));
  app.use("/reservas", require("./src/routes/bookings")(collections));
  app.use(require("./src/routes/public")(collections));

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({ message: "Erro interno do servidor" });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
