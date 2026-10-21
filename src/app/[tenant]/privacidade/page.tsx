import type { Metadata } from "next";
import { getTenantBySlug } from "@/lib/tenant";
import { PRIVACIDADE_ATUALIZADA_EM, operadora } from "@/lib/privacidade";

export async function generateMetadata({ params }: PageProps<"/[tenant]/privacidade">): Promise<Metadata> {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  return { title: `Política de privacidade · ${tenant.nome}` };
}

function Tabela({ cabecalho, linhas }: { cabecalho: string[]; linhas: string[][] }) {
  return (
    <div className="my-3 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-field">
          <tr>
            {cabecalho.map((c) => (
              <th key={c} className="px-3 py-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l[0]} className="border-t border-border align-top">
              {l.map((c, i) => (
                <td key={i} className="px-3 py-2">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-lg font-semibold">{titulo}</h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default async function PrivacidadePage({ params }: PageProps<"/[tenant]/privacidade">) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const op = operadora();
  const orgao = tenant.privacidadeOrgao?.trim() || `a organização do ${tenant.nome}`;
  const contato = tenant.privacidadeEmail?.trim();
  const linkContato = contato ? (
      <a href={`mailto:${contato}`} className="font-medium text-accent underline">
        {contato}
      </a>
    ) : (
      <span>o contato da organização do campeonato</span>
  );

  return (
    <article className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Política de privacidade</h1>
      <p className="mt-1 text-sm text-muted">{tenant.nome}</p>

      <Secao titulo="Quem decide sobre os seus dados">
        <p>
          Este site é o campeonato organizado por <strong>{orgao}</strong>. A organização decide quais dados são
          pedidos e para quê: ela é a <strong>controladora</strong> dos dados.
        </p>
        <p>
          O site funciona na plataforma <strong>Citadino</strong>, fornecida por {op.nome}
          {op.cnpj ? `, CNPJ ${op.cnpj},` : ","} que trata os dados só em nome da organização e segundo as instruções
          dela: é a <strong>operadora</strong>.
          {op.email && (
            <>
              {" "}
              Contato da operadora:{" "}
              <a href={`mailto:${op.email}`} className="text-accent underline">
                {op.email}
              </a>
              .
            </>
          )}
        </p>
        <p>
          Dúvidas ou pedidos sobre seus dados: {linkContato}.
        </p>
      </Secao>

      <Secao titulo="Que dados coletamos">
        <Tabela
          cabecalho={["Você é", "O que coletamos", "Como chega até nós"]}
          linhas={[
            [
              "Torcedor",
              "Nada que identifique você. Se ativar as notificações: o endereço técnico que o navegador cria para elas e o time ou categoria escolhidos. Se votar na enquete: um identificador anônimo do aparelho.",
              "Quando você ativa as notificações ou vota",
            ],
            [
              "Atleta",
              "Nome, data de nascimento, foto, número, posição, Instagram (opcional), foto do documento de identidade e comprovante de residência. Se for menor de idade e houver autorização de imagem, o nome do responsável que autorizou.",
              "Pelo formulário de inscrição do time ou cadastrado pelo treinador ou pela organização",
            ],
            [
              "Atleta, durante o campeonato",
              "Gols, cartões, jogos disputados e vídeos dos gols",
              "Lançados na súmula pela organização",
            ],
            ["Treinador ou organizador", "Nome, e-mail e senha", "No seu cadastro para acessar o painel"],
          ]}
        />
        <p>Não pedimos dados de saúde, religião, biometria ou outros dados sensíveis. Não pedimos CPF no site.</p>
      </Secao>

      <Secao titulo="Para que usamos e o que fica público">
        <p>
          Usamos os dados só para organizar e divulgar o campeonato: inscrever times e atletas, conferir quem pode
          jogar em cada categoria, registrar as partidas, calcular classificação, artilharia e suspensões, e avisar a
          torcida que pediu notificações. Não vendemos dados e não os usamos para publicidade.
        </p>
        <p>
          <strong>Base legal:</strong> a inscrição e o registro esportivo são execução de política pública de esporte
          pela organização (LGPD, art. 7º, III, e art. 23), inclusive para atletas menores de idade, sempre no melhor
          interesse deles (Enunciado CD/ANPD nº 1/2023). Por isso a inscrição não depende de consentimento. O
          consentimento é pedido só para o uso de imagem e para as notificações.
        </p>
        <Tabela
          cabecalho={["Fica público no site", "Fica restrito"]}
          linhas={[
            ["Nome, idade, time, número e posição do atleta", "Data completa de nascimento"],
            ["Foto do atleta, só com autorização de imagem", "Foto de quem não autorizou: o site mostra as iniciais"],
            [
              "Instagram do atleta maior de idade, se ele informou",
              "Documento de identidade e comprovante de residência: só a organização e o treinador do time veem, com login",
            ],
            ["Gols, cartões, suspensões e vídeos dos gols", "E-mail e senha de treinadores e organizadores"],
            ["Votos totais da enquete", "Quem votou em quem (o voto é anônimo)"],
          ]}
        />
      </Secao>

      <Secao titulo="Crianças e adolescentes">
        <p>O campeonato pode ter categorias de base, com atletas menores de 18 anos. Para eles:</p>
        <ul className="list-disc pl-5">
          <li>
            A foto e os vídeos só aparecem no site com a autorização específica de um dos pais ou do responsável legal,
            dada num campo separado da inscrição.
          </li>
          <li>Sem essa autorização, o atleta joga normalmente; o site só deixa de mostrar a foto.</li>
          <li>O Instagram de atleta menor de idade nunca aparece no site.</li>
          <li>Os dados são usados no melhor interesse do atleta e só para o campeonato.</li>
          <li>
            O responsável pode revogar a autorização de imagem ou pedir que os dados sejam apagados a qualquer momento,
            pelo contato no início desta política.
          </li>
          <li>Documento e comprovante de residência nunca ficam públicos.</li>
        </ul>
      </Secao>

      <Secao titulo="Onde ficam, com quem compartilhamos e por quanto tempo">
        <p>
          <strong>Onde ficam:</strong> em servidores da Vercel (site e arquivos) e do Turso (banco de dados), nos{" "}
          <strong>Estados Unidos</strong>. Essas empresas só guardam e processam os dados para o site funcionar e estão
          obrigadas por contrato a protegê-los. A cópia de segurança do banco de dados fica fora desses servidores,
          guardada pela operadora no Brasil.
        </p>
        <p>
          <strong>Vídeos de gol:</strong> a transmissão dos jogos é feita pela organização no canal dela no YouTube. O
          site só incorpora trechos dessa transmissão, pelo player sem cookies do YouTube (youtube-nocookie.com), que
          carrega apenas quando você toca para ver o lance e segue a{" "}
          <a href="https://policies.google.com/privacy" className="text-accent underline" rel="noreferrer">
            política de privacidade do Google
          </a>
          .
        </p>
        <p>
          <strong>Com quem mais compartilhamos:</strong> com ninguém, salvo ordem judicial ou obrigação legal.
        </p>
        <p>
          <strong>Cookies e dados no seu aparelho:</strong>
        </p>
        <Tabela
          cabecalho={["Item", "Para quê", "Duração"]}
          linhas={[
            ["Cookie de sessão (só para quem faz login)", "Manter treinador ou organizador conectado", "Até sair ou a sessão expirar"],
            ["Cookie anônimo de aparelho", "Permitir um voto por aparelho na enquete", "1 ano"],
            ["Preferências salvas no navegador", "Tema claro ou escuro e times favoritos", "Até você limpar o navegador"],
          ]}
        />
        <p>
          Medimos visitas de forma agregada e sem cookies (Vercel Web Analytics), só para saber quais páginas são usadas.
          Não usamos cookies de publicidade.
        </p>
        <p>
          <strong>Por quanto tempo:</strong> documento e comprovante de residência servem só para conferir a inscrição:
          são apagados quando a inscrição é recusada e, das demais, ao fim da temporada. Os outros dados do campeonato
          ficam guardados enquanto durar o contrato da organização com o Citadino. Ao fim, a organização recebe uma
          cópia e os dados são apagados em até 30 dias, salvo se ela pedir para mantê-los para a próxima temporada.
          Quando um atleta é excluído do elenco, a foto, o documento e o comprovante dele são apagados junto. A
          inscrição para notificações fica guardada até você desativá-las.
        </p>
      </Secao>

      <Secao titulo="Seus direitos, segurança e contato">
        <p>
          Pela{" "}
          <a
            href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
            className="text-accent underline"
            rel="noreferrer"
          >
            LGPD
          </a>
          , você pode pedir, a qualquer momento:
        </p>
        <ul className="list-disc pl-5">
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados errados ou desatualizados;</li>
          <li>exclusão, ou que a foto saia do perfil público;</li>
          <li>informação sobre com quem os dados são compartilhados;</li>
          <li>revogação da autorização dada, quando o tratamento depender dela.</li>
        </ul>
        <p>
          Para pedir, escreva para {linkContato}. A resposta vem em até 15 dias. Você também pode reclamar à Autoridade
          Nacional de Proteção de Dados (ANPD).
        </p>
        <p>
          <strong>Segurança:</strong> o site usa conexão cifrada; documentos ficam em armazenamento privado e só abrem
          com login; senhas são guardadas de forma cifrada; há cópia de segurança periódica. Se houver um incidente que
          possa trazer risco a você, a organização avisa você e a ANPD em até 3 dias úteis (Resolução CD/ANPD nº
          15/2024).
        </p>
        <p>
          <strong>Alterações:</strong> quando esta política mudar, a data abaixo é atualizada e mudanças importantes são
          avisadas no site.
        </p>
        <p className="text-muted">Última atualização: {PRIVACIDADE_ATUALIZADA_EM}.</p>
      </Secao>
    </article>
  );
}
