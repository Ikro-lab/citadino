import { prisma } from "../../src/lib/prisma";

const idParaDataHora: Record<string, string> = {
  cmruvj7om0006q8uii88w4aqk: "2026-07-14T17:00:00-03:00", // França x Espanha
  cmruvj95m000cq8uiatj8i4j0: "2026-07-15T17:00:00-03:00", // Inglaterra x Argentina
  cmruvjal3000iq8ui5i8ez12e: "2026-07-18T17:00:00-03:00", // França x Inglaterra
  cmruvjdh1000tq8uiuaw63emb: "2026-07-19T17:00:00-03:00", // Espanha x Argentina
};

async function main() {
  for (const [id, dataHora] of Object.entries(idParaDataHora)) {
    const atualizado = await prisma.partida.update({
      where: { id },
      data: { dataHora: new Date(dataHora) },
    });
    console.log(`Partida ${id} -> dataHora salva como: ${atualizado.dataHora.toISOString()}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
