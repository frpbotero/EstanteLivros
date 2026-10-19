const express = require("express");
const { toObjectId, text, LOAN_DAYS } = require("../validate");
const { listProjection, activeBookingsLookup } = require("./books");

module.exports = function publicRoutes({ users, books, bookings }) {
  const router = express.Router();

  // Capa servida como imagem para o navegador cachear (<img> não envia token).
  router.get("/capa/:id", async function (req, res) {
    const _id = toObjectId(req.params.id);
    const book =
      _id &&
      (await books.findOne({ _id }, { projection: { coverImage: 1 } }));
    const match = /^data:(image\/[a-z]+);base64,(.+)$/.exec(book?.coverImage || "");
    if (!match) return res.sendStatus(404);

    res.set("Content-Type", match[1]);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.send(Buffer.from(match[2], "base64"));
  });

  router.get("/public/:slug", async function (req, res) {
    const owner = await users.findOne({ slug: req.params.slug });
    if (!owner) return res.status(404).send({ message: "Biblioteca não encontrada" });

    // Visitante só vê se o livro está emprestado e até quando, nunca quem pegou.
    const list = await books
      .aggregate([
        { $match: { ownerId: owner._id, isPublic: { $ne: false } } },
        { $sort: { createdAt: -1 } },
        ...listProjection,
        activeBookingsLookup(bookings.collectionName),
        {
          $set: {
            loan: {
              $first: {
                $filter: {
                  input: "$activeBookings",
                  cond: { $eq: ["$$this.bookingStatus", "loan"] },
                },
              },
            },
          },
        },
        {
          $set: {
            onLoan: { $gt: ["$loan", null] },
            dueDate: "$loan.dueDate",
          },
        },
        { $project: { ownerId: 0, activeBookings: 0, loan: 0, isPublic: 0 } },
      ])
      .toArray();

    const completedLoans = await bookings.countDocuments({
      ownerId: owner._id,
      bookingStatus: "devolution",
    });

    res.send({
      owner: { name: owner.name, slug: owner.slug },
      books: list,
      stats: { completedLoans, loanDays: LOAN_DAYS },
    });
  });

  router.post("/public/:slug/reservas", async function (req, res) {
    const owner = await users.findOne({ slug: req.params.slug });
    if (!owner) return res.status(404).send({ message: "Biblioteca não encontrada" });

    const body = req.body || {};
    const bookingName = text(body.bookingName, 100);
    const telNumber = text(body.telNumber, 30);
    if (!bookingName) return res.status(400).send({ message: "Informe seu nome" });
    if (telNumber.replace(/\D/g, "").length < 9) {
      return res.status(400).send({ message: "Informe um telefone válido" });
    }

    const _id = toObjectId(body.bookId);
    const book =
      _id && (await books.findOne({ _id, ownerId: owner._id, isPublic: { $ne: false } }));
    if (!book) return res.status(404).send({ message: "Livro não encontrado" });

    const onLoan = await bookings.findOne({ bookId: book._id, bookingStatus: "loan" });
    if (book.available === false || onLoan) {
      return res.status(409).send({ message: "Livro indisponível no momento" });
    }

    const phoneDigits = telNumber.replace(/\D/g, "");
    const openRequests = await bookings
      .find({ bookId: book._id, bookingStatus: "pending" }, { projection: { telNumber: 1 } })
      .toArray();
    if (openRequests.some((r) => String(r.telNumber).replace(/\D/g, "") === phoneDigits)) {
      return res.status(409).send({ message: "Você já pediu este livro. Aguarde o contato do dono." });
    }

    const now = new Date();
    await bookings.insertOne({
      ownerId: owner._id,
      bookId: book._id,
      name: book.name,
      bookingName,
      telNumber,
      bookingDate: now,
      bookingStatus: "pending",
      createdAt: now,
    });
    res.status(201).send({ message: "Pedido enviado! O dono da estante vai entrar em contato." });
  });

  return router;
};
