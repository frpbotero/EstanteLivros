const { MongoClient } = require("mongodb");

async function connect() {
  // MONGODB_URI / DB_NAME; URL e BDNAME são os nomes antigos, ainda aceitos.
  const uri = process.env.MONGODB_URI || process.env.URL;
  if (!uri) throw new Error("MONGODB_URI não definido.");
  const client = new MongoClient(uri);
  console.log("Conectando ao banco de dados.");
  await client.connect();
  console.log("Conectado com sucesso no banco de dados.");

  const db = client.db(process.env.DB_NAME || process.env.BDNAME);
  const collections = {
    users: db.collection("users"),
    books: db.collection("Livros"),
    bookings: db.collection("reserva"),
  };

  await collections.users.createIndex({ email: 1 }, { unique: true });
  await collections.users.createIndex({ slug: 1 }, { unique: true });
  await collections.books.createIndex({ ownerId: 1, createdAt: -1 });
  await collections.bookings.createIndex({ ownerId: 1 });

  return collections;
}

module.exports = { connect };
