import { Redis } from "@upstash/redis";

const CODE_RE = /^[A-Z0-9-]{4,24}$/;

export default async function handler(req, res) {
  const code = String(req.query.code || "").trim().toUpperCase();
  if (!CODE_RE.test(code)) {
    return res.status(400).json({ error: "Código de sincronización inválido." });
  }
  // La integración "Upstash for Redis" del marketplace de Vercel expone estas
  // variables con el prefijo KV_ (heredado de @vercel/kv), no el UPSTASH_ nativo.
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return res.status(500).json({ error: "Falta conectar el almacenamiento (Upstash Redis) en Vercel." });
  }

  const redis = new Redis({ url, token });
  const key = `habitual:${code}`;

  if (req.method === "GET") {
    const data = await redis.get(key);
    return res.status(200).json({ data: data ?? null });
  }

  if (req.method === "PUT" || req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    await redis.set(key, body);
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, PUT");
  return res.status(405).json({ error: "Método no soportado." });
}
