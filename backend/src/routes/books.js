const express = require("express");
const { requireAuth } = require("../auth");
const { toObjectId, bookPayload } = require("../validate");

// Lista leve: a capa em base64 sai do JSON e é servida por /capa/:id.
const listProjection = [
  {
    $addFields: {
      hasCover: {
        $gt: [{ $strLenCP: { $ifNull: ["$coverImage", ""] } }, 0],
      },
    },
  },
  { $project: { coverImage: 0 } },
];

// Anexa as reservas em aberto (pendentes ou emprestadas) de cada livro.
function activeBookingsLookup(bookingsCollection) {
  return {
    $lookup: {
      from: bookingsCollection,
      let: { bookId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$bookId", "$$bookId"] },
            bookingStatus: { $in: ["pending", "loan"] },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            bookingName: 1,
            telNumber: 1,
            bookingStatus: 1,
            bookingDate: 1,
            loanDate: 1,
            dueDate: 1,
          },
        },
      ],
      as: "activeBookings",
    },
  };
}

module.exports = function bookRoutes({ books, bookings }) {
  const router = express.Router();
  router.use(requireAuth);

  router.post("/", async function (req, res) {
    const { data, error } = bookPayload(req.body);
    if (error) return res.status(400).send({ message: error });

    const now = new Date();
    const { insertedId } = await books.insertOne({
      ...data,
      ownerId: req.userId,
      createdAt: now,
      updatedAt: now,
    });
    res.status(201).send({ message: "Livro cadastrado com sucesso", _id: insertedId });
  });

  router.get("/", async function (req, res) {
    const list = await books
      .aggregate([
        { $match: { ownerId: req.userId } },
        { $sort: { createdAt: -1 } },
        ...listProjection,
        activeBookingsLookup(bookings.collectionName),
      ])
      .toArray();
    res.send(list);
  });

  router.get("/:id", async function (req, res) {
    const _id = toObjectId(req.params.id);
    const book = _id && (await books.findOne({ _id, ownerId: req.userId }));
    if (!book) return res.status(404).send({ message: "Livro não encontrado" });
    res.send(book);
  });

  router.put("/:id", async function (req, res) {
    const _id = toObjectId(req.params.id);
    const { data, error } = bookPayload(req.body, { partial: true });
    if (error) return res.status(400).send({ message: error });

    const result =
      _id &&
      (await books.updateOne(
        { _id, ownerId: req.userId },
        { $set: { ...data, updatedAt: new Date() } }
      ));
    if (!result?.matchedCount) {
      return res.status(404).send({ message: "Livro não encontrado" });
    }
    res.send({ message: "Livro atualizado com sucesso!" });
  });

  router.delete("/:id", async function (req, res) {
    const _id = toObjectId(req.params.id);
    const result = _id && (await books.deleteOne({ _id, ownerId: req.userId }));
    if (!result?.deletedCount) {
      return res.status(404).send({ message: "Livro não encontrado" });
    }
    await bookings.deleteMany({ bookId: _id, ownerId: req.userId, bookingStatus: "pending" });
    res.send({ message: "Livro excluído com sucesso!" });
  });

  return router;
};

module.exports.listProjection = listProjection;
module.exports.activeBookingsLookup = activeBookingsLookup;
