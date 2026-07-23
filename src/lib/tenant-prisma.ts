import "server-only";
import { prisma } from "@/lib/prisma";

// Nomes de model exatamente como o Prisma Client os expõe ao extension (PascalCase).
const TENANT_SCOPED_MODELS = new Set([
  "User",
  "Campeonato",
  "Categoria",
  "Grupo",
  "Time",
  "SolicitacaoTime",
  "Atleta",
  "InscricaoAtleta",
  "Partida",
  "EventoPartida",
  "Enquete",
  "EnqueteOpcao",
  "EnqueteVoto",
  "Patrocinador",
  "PushSubscription",
]);

const READ_OR_MUTATE_EXISTING_OPS = new Set([
  "findMany",
  "findFirst",
  "findUnique",
  "findFirstOrThrow",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
]);

interface WithWhere {
  where?: Record<string, unknown>;
}
interface WithData {
  data?: Record<string, unknown> | Record<string, unknown>[];
}

export function getTenantPrisma(tenantId: string) {
  if (!tenantId) throw new Error("getTenantPrisma chamado sem tenantId.");

  return prisma.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_SCOPED_MODELS.has(model)) {
            return query(args);
          }

          const typedArgs = args as WithWhere & WithData & { create?: Record<string, unknown> };

          if (READ_OR_MUTATE_EXISTING_OPS.has(operation)) {
            typedArgs.where = { ...(typedArgs.where ?? {}), tenantId };
          }

          if (operation === "create") {
            typedArgs.data = { ...(typedArgs.data as Record<string, unknown> ?? {}), tenantId };
          }

          if (operation === "createMany" && Array.isArray(typedArgs.data)) {
            typedArgs.data = typedArgs.data.map((d) => ({ ...d, tenantId }));
          }

          if (operation === "upsert") {
            typedArgs.where = { ...(typedArgs.where ?? {}), tenantId };
            typedArgs.create = { ...(typedArgs.create ?? {}), tenantId };
          }

          return query(typedArgs as typeof args);
        },
      },
    },
  });
}

export type TenantPrisma = ReturnType<typeof getTenantPrisma>;
