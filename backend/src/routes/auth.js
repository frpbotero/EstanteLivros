const express = require("express");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const { signToken, requireAuth } = require("../auth");
const { slugify } = require("../validate");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return { _id: user._id, name: user.name, email: user.email, slug: user.slug };
}

module.exports = function authRoutes({ users }) {
  const router = express.Router();
  const googleClient = process.env.GOOGLE_CLIENT_ID
    ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    : null;

  async function uniqueSlug(name) {
    const base = slugify(name);
    let slug = base;
    while (await users.findOne({ slug }, { projection: { _id: 1 } })) {
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    return slug;
  }

  async function createUser(fields) {
    const user = {
      ...fields,
      slug: await uniqueSlug(fields.name),
      createdAt: new Date(),
    };
    const { insertedId } = await users.insertOne(user);
    return { ...user, _id: insertedId };
  }

  router.post("/register", async function (req, res) {
    const { name, email, password } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!name || !String(name).trim()) {
      return res.status(400).send({ message: "Informe seu nome" });
    }
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      return res.status(400).send({ message: "Email inválido" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .send({ message: "A senha deve ter ao menos 6 caracteres" });
    }
    if (await users.findOne({ email: cleanEmail })) {
      return res.status(409).send({ message: "Email já cadastrado" });
    }

    const user = await createUser({
      name: String(name).trim(),
      email: cleanEmail,
      passwordHash: await bcrypt.hash(password, 10),
    });
    res.status(201).send({ token: signToken(user._id), user: publicUser(user) });
  });

  router.post("/login", async function (req, res) {
    const { email, password } = req.body || {};
    const user = await users.findOne({
      email: String(email || "").trim().toLowerCase(),
    });
    const valid =
      user?.passwordHash &&
      typeof password === "string" &&
      (await bcrypt.compare(password, user.passwordHash));

    if (!valid) {
      return res.status(401).send({ message: "Email ou senha incorretos" });
    }
    res.send({ token: signToken(user._id), user: publicUser(user) });
  });

  router.post("/google", async function (req, res) {
    if (!googleClient) {
      return res.status(501).send({ message: "Login com Google não configurado" });
    }
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: req.body?.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).send({ message: "Token do Google inválido" });
    }
    if (!payload?.email || !payload.email_verified) {
      return res.status(401).send({ message: "Email do Google não verificado" });
    }

    const email = payload.email.toLowerCase();
    let user = await users.findOne({ $or: [{ googleId: payload.sub }, { email }] });
    if (!user) {
      user = await createUser({
        name: payload.name || email.split("@")[0],
        email,
        googleId: payload.sub,
      });
    } else if (!user.googleId) {
      await users.updateOne({ _id: user._id }, { $set: { googleId: payload.sub } });
    }
    res.send({ token: signToken(user._id), user: publicUser(user) });
  });

  router.get("/me", requireAuth, async function (req, res) {
    const user = await users.findOne({ _id: req.userId });
    if (!user) return res.status(401).send({ message: "Usuário não encontrado" });
    res.send({ user: publicUser(user) });
  });

  return router;
};
