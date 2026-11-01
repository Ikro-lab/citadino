/**
 * Testa os tokens do Vercel Blob sem mexer no banco: grava, lê e apaga um
 * arquivo pequeno em cada store. Mostra só o ID do store, nunca o segredo.
 *
 * Uso: coloque BLOB_READ_WRITE_TOKEN e BLOB_PRIVATE_READ_WRITE_TOKEN (os
 * mesmos valores da Vercel) em .env.production.local e rode
 *   npx tsx scripts/testar-blob.mts
 */
import { config } from "dotenv";
import { del, get, put } from "@vercel/blob";

config({ path: ".env.production.local", quiet: true });

async function testar(nome: string, access: "public" | "private") {
  const bruto = process.env[nome];
  if (!bruto) return console.log(`${nome}: não definido.`);
  const token = bruto.trim();
  const partes = token.split("_");
  console.log(`\n${nome}: store ${partes[3] ?? "?"}, ${token.length} caracteres${bruto !== token ? " (tinha espaço/quebra de linha nas pontas)" : ""}`);
  if (!token.startsWith("vercel_blob_rw_") || partes.length < 5) {
    console.log("  formato inesperado: deveria começar com vercel_blob_rw_<store>_<segredo>.");
  }
  try {
    const blob = await put(`teste/${Date.now()}.txt`, "teste", { access, token, addRandomSuffix: true });
    console.log(`  gravou (${access}): ok`);
    if (access === "private") {
      const lido = await get(blob.pathname, { access: "private", token });
      console.log(`  leu: ${lido?.statusCode === 200 ? "ok" : `falhou (${lido?.statusCode})`}`);
    }
    await del(blob.url, { token });
    console.log("  apagou: ok");
  } catch (e) {
    console.log(`  ERRO: ${e instanceof Error ? `${e.name}: ${e.message}` : e}`);
  }
}

await testar("BLOB_READ_WRITE_TOKEN", "public");
await testar("BLOB_PRIVATE_READ_WRITE_TOKEN", "private");
