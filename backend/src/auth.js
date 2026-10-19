const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error("JWT_SECRET não definido.");
  process.exit(1);
}

function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, secret, { expiresIn: "7d" });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).send({ message: "Não autenticado" });
  }
  try {
    const payload = jwt.verify(token, secret);
    req.userId = new ObjectId(payload.sub);
    next();
  } catch {
    res.status(401).send({ message: "Sessão inválida ou expirada" });
  }
}

module.exports = { signToken, requireAuth };
