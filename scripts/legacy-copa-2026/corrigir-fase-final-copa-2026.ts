import { prisma } from "../../src/lib/prisma";

const idParaFase: Record<string, "SEMIFINAL" | "TERCEIRO_LUGAR" | "FINAL"> = {
  cmruvj7om0006q8uii88w4aqk: "SEMIFINAL", // França x Espanha
  cmruvj95m000cq8uiatj8i4j0: "SEMIFINAL", // Inglaterra x Argentina
  cmruvjal3000iq8ui5i8ez12e: "TERCEIRO_LUGAR", // França x Inglaterra
  cmruvjdh1000tq8uiuaw63emb: "FINAL", // Espanha x Argentina
};

async function main() {
  for (const [id, fase] of Object.entries(idParaFase)) {
    const atualizado = await prisma.partida.update({ where: { id }, data: { fase } });
    console.log(`Partida ${id} -> fase salva como: ${atualizado.fase}`);
  }

  const argentina = await prisma.time.findFirstOrThrow({ where: { nome: "Argentina" } });
  const paredes = await prisma.atleta.findFirstOrThrow({ where: { nome: "Leandro Paredes" } });

  const existente = await prisma.eventoPartida.findFirst({
    where: {
      partidaId: "cmruvjdh1000tq8uiuaw63emb",
      atletaId: paredes.id,
      tipo: "CARTAO_VERMELHO",
    },
  });

  if (existente) {
    console.log("Cartão vermelho do Paredes já existe, nada a fazer.");
  } else {
    const criado = await prisma.eventoPartida.create({
      data: {
        partidaId: "cmruvjdh1000tq8uiuaw63emb",
        tipo: "CARTAO_VERMELHO",
        minuto: 82,
        timeId: argentina.id,
        atletaId: paredes.id,
        descricao: "Minuto aproximado, não divulgado pela fonte",
      },
    });
    console.log(`Cartão vermelho do Paredes criado: ${criado.id}, tipo salvo como: ${criado.tipo}`);
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
