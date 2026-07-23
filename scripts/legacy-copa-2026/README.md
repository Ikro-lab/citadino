# Scripts legados (pré multi-tenant)

Os scripts nesta pasta foram escritos como correções pontuais para um evento
específico ("Copa 2026") **antes** da conversão do Citadino para multi-tenant.

Eles fazem lookup de `Time`/`Categoria`/`Atleta`/`Partida` por **nome**, sem
desambiguar por `campeonatoId`/`tenantId` (ex: `prisma.time.findFirstOrThrow({
where: { nome: "Argentina" } })`), e cada um instancia seu próprio
`PrismaClient` direto, sem passar pela extensão de escopo por tenant
(`getTenantPrisma`).

Num banco com múltiplos tenants, um nome de time repetido em campeonatos de
clientes diferentes faria esses scripts pegarem a linha errada. **Não rode
nenhum destes sem antes reescrever os lookups para incluir o tenant/campeonato
certo.**
