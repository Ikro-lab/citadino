export const paths = {
  home: (t: string) => `/${t}`,
  login: (t: string) => `/${t}/login`,
  cadastro: (t: string) => `/${t}/cadastro`,
  /** Cadastro de treinador pelo link de uma categoria: o time nasce nela. */
  cadastroConvite: (t: string, token: string) => `/${t}/cadastro/${token}`,
  /** Link de nova senha que o admin gera para o treinador. */
  redefinirSenha: (t: string, token: string) => `/${t}/redefinir-senha/${token}`,
  classificacao: (t: string) => `/${t}/classificacao`,
  artilharia: (t: string) => `/${t}/artilharia`,
  enquete: (t: string) => `/${t}/enquete`,
  notificacoes: (t: string) => `/${t}/notificacoes`,
  privacidade: (t: string) => `/${t}/privacidade`,
  convite: (t: string, token: string) => `/${t}/convite/${token}`,
  atleta: (t: string, id: string) => `/${t}/atleta/${id}`,
  partida: (t: string, id: string) => `/${t}/partida/${id}`,
  /** Página de um gol (clipe e placar), o link que se compartilha. */
  gol: (t: string, id: string) => `/${t}/gol/${id}`,
  /** Documento de atleta servido pela rota autenticada (nunca a URL do arquivo). */
  documento: (t: string, tipo: "atleta" | "inscricao", id: string, campo: "documento" | "comprovante" | "foto") =>
    `/api/${t}/documentos/${tipo}/${id}/${campo}`,
  /** Planilha (CSV) com os atletas de todos os times da categoria, só para o admin. */
  exportAtletasCategoria: (t: string, id: string) => `/api/${t}/categorias/${id}/atletas`,
  admin: {
    root: (t: string) => `/${t}/admin`,
    campeonatos: (t: string) => `/${t}/admin/campeonatos`,
    categorias: (t: string) => `/${t}/admin/categorias`,
    categoria: (t: string, id: string) => `/${t}/admin/categorias/${id}`,
    times: (t: string) => `/${t}/admin/times`,
    time: (t: string, id: string) => `/${t}/admin/times/${id}`,
    partidas: (t: string) => `/${t}/admin/partidas`,
    partida: (t: string, id: string) => `/${t}/admin/partidas/${id}`,
    partidaEditar: (t: string, id: string) => `/${t}/admin/partidas/${id}/editar`,
    partidaSumula: (t: string, id: string) => `/${t}/admin/partidas/${id}/sumula`,
    /** Gol detectado na live esperando aprovação (aberto pela notificação). */
    golSugerido: (t: string, id: string) => `/${t}/admin/gols/${id}`,
    solicitacoes: (t: string) => `/${t}/admin/solicitacoes`,
    inscricoes: (t: string) => `/${t}/admin/inscricoes`,
    enquetes: (t: string) => `/${t}/admin/enquetes`,
    patrocinadores: (t: string) => `/${t}/admin/patrocinadores`,
    notificacoes: (t: string) => `/${t}/admin/notificacoes`,
    privacidade: (t: string) => `/${t}/admin/privacidade`,
  },
  treinador: {
    root: (t: string) => `/${t}/treinador`,
    partidas: (t: string) => `/${t}/treinador/partidas`,
    partidaSumula: (t: string, id: string) => `/${t}/treinador/partidas/${id}/sumula`,
  },
};
