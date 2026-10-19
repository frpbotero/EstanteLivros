const express = require("express");
const { requireAuth } = require("../auth");
const { toObjectId, text, dueDateFrom } = require("../validate");

async function isOnLoan(bookings, bookId, exceptId) {
  const query = { bookId, bookingStatus: "loan" };
  if (exceptId) query._id = { $ne: exceptId };
  return Boolean(await bookings.findOne(query, { projection: { _id: 1 } }));
}

module.exports = function bookingRoutes({ bookings, books }) {
  const router = express.Router();
  router.use(requireAuth);

  // Empréstimo registrado direto pelo dono (ou reserva pendente, se pedido).
  router.post("/", async function (req, res) {
    const body = req.body || {};
    const bookingName = text(body.bookingName, 100);
    const telNumber = text(body.telNumber, 30);
    const status = body.bookingStatus === "pending" ? "pending" : "loan";
    if (!bookingName) return res.status(400).send({ message: "Informe quem pegou o livro" });

    const bookId = toObjectId(body.bookId);
    const book = bookId && (await books.findOne({ _id: bookId, ownerId: req.userId }));
    if (!book) return res.status(404).send({ message: "Livro não encontrado" });

    const now = new Date();
    const booking = {
      ownerId: req.userId,
      bookId,
      name: book.name,
      bookingName,
      telNumber,
      bookingDate: now,
      bookingStatus: status,
      createdAt: now,
    };
    if (status === "loan") {
      if (await isOnLoan(bookings, bookId)) {
        return res.status(409).send({ message: "Este livro já está emprestado" });
      }
      const due = dueDateFrom(body.dueDate);
      if (due.error) return res.status(400).send({ message: due.error });
      booking.loanDate = now;
      booking.dueDate = due.value;
    }

    await bookings.insertOne(booking);
    res.status(201).send({ message: "Empréstimo registrado com sucesso!" });
  });

  router.get("/", async function (req, res) {
    const list = await bookings
      .aggregate([
        { $match: { ownerId: req.userId } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: books.collectionName,
            localField: "bookId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  author: 1,
                  updatedAt: 1,
                  hasCover: {
                    $gt: [{ $strLenCP: { $ifNull: ["$coverImage", ""] } }, 0],
                  },
                },
              },
            ],
            as: "book",
          },
        },
        { $set: { book: { $first: "$book" } } },
      ])
      .toArray();
    res.send(list);
  });

  router.get("/:id", async function (req, res) {
    const _id = toObjectId(req.params.id);
    const booking = _id && (await bookings.findOne({ _id, ownerId: req.userId }));
    if (!booking) return res.status(404).send({ message: "Reserva não encontrada!" });
    res.send(booking);
  });

  // Transições: pending -> loan (aprovar) e loan -> devolution (devolver).
  // Também permite ajustar o prazo de um empréstimo ativo.
  router.put("/:id", async function (req, res) {
    const _id = toObjectId(req.params.id);
    const booking = _id && (await bookings.findOne({ _id, ownerId: req.userId }));
    if (!booking) return res.status(404).send({ message: "Reserva não encontrada!" });

    const body = req.body || {};
    const next = body.bookingStatus ?? booking.bookingStatus;
    const changes = {};

    if (next !== booking.bookingStatus) {
      if (booking.bookingStatus === "pending" && next === "loan") {
        if (await isOnLoan(bookings, booking.bookId, _id)) {
          return res.status(409).send({ message: "Este livro já está emprestado" });
        }
        const due = dueDateFrom(body.dueDate);
        if (due.error) return res.status(400).send({ message: due.error });
        Object.assign(changes, { bookingStatus: "loan", loanDate: new Date(), dueDate: due.value });
      } else if (booking.bookingStatus === "loan" && next === "devolution") {
        Object.assign(changes, { bookingStatus: "devolution", devolutionDate: new Date() });
      } else {
        return res.status(400).send({ message: "Mudança de status inválida" });
      }
    } else if (body.dueDate !== undefined && booking.bookingStatus === "loan") {
      const due = dueDateFrom(body.dueDate);
      if (due.error) return res.status(400).send({ message: due.error });
      changes.dueDate = due.value;
    }

    if (Object.keys(changes).length) {
      await bookings.updateOne({ _id }, { $set: changes });
    }
    res.send({ message: "Reserva atualizada com sucesso!", booking: { ...booking, ...changes } });
  });

  router.delete("/:id", async function (req, res) {
    const _id = toObjectId(req.params.id);
    const result = _id && (await bookings.deleteOne({ _id, ownerId: req.userId }));
    if (!result?.deletedCount) {
      return res.status(404).send({ message: "Reserva não encontrada!" });
    }
    res.send({ message: "Reserva excluída com sucesso!" });
  });

  return router;
};
