import jwt from "jsonwebtoken";

export function verifyToken(req) {

  const token =
    req.cookies.get?.("token")?.value ||
    req.headers.get("authorization")?.split?.(" ")[1];

  if (!token) throw new Error("Unauthorized: missing token");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) throw new Error("Unauthorized: invalid token");

  return decoded; 
}

export function ensureAdmin(req) {
  const decoded = verifyToken(req);
  if (decoded.role !== "admin") throw new Error("Forbidden");
  return decoded;
}

export function ensureDoctor(req) {
  const decoded = verifyToken(req);
  if (decoded.role !== "doctor") throw new Error("Forbidden");
  return decoded;
}