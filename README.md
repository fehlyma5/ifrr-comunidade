# Memorial IFRR — Nossa história, todos os dias

Landing page responsiva para um memorial fotográfico colaborativo. O projeto usa HTML, CSS e JavaScript no front-end e pode ser conectado ao Supabase para armazenar imagens e metadados.

## Arquivos
- `index.html`: estrutura da página, galeria, filtros, modal de foto e formulário.
- `styles.css`: identidade visual inspirada no verde e amarelo institucional, layout responsivo.
- `script.js`: filtros, modal, validação e integração opcional com Supabase.
- `supabase.sql`: estrutura inicial da tabela e políticas de acesso.

## Prévia local
Abra `index.html` no navegador. Sem credenciais, o site mostra cartões ilustrativos e o formulário informa que o armazenamento ainda não está configurado. As imagens demonstrativas não são fotografias oficiais do IFRR.

## Para receber e armazenar fotos de verdade
1. Crie um projeto no Supabase.
2. No SQL Editor, execute `supabase.sql`.
3. No Storage, crie um bucket chamado `memorial-fotos`, configure limite de 8 MB e aceite somente JPEG, PNG e WebP. Para esta versão, o bucket precisa estar público para que as URLs das fotos sejam exibidas.
4. Em `script.js`, substitua `COLE_AQUI_A_URL_DO_PROJETO` e `COLE_AQUI_A_CHAVE_PUBLICA_ANON` pelos dados públicos do projeto Supabase.
5. Publique a pasta em um host estático (GitHub Pages, por exemplo). Para testar localmente com mais previsibilidade, use uma extensão de servidor local ou `python -m http.server`.

**Nunca coloque a chave `service_role` no front-end.** Use somente a chave pública/anon.

## Fluxo de contribuição
- O aluno escolhe uma foto, curso, legenda e, opcionalmente, ano e nome.
- O arquivo vai para o Storage e os dados vão para `memories` com `status = 'pending'`.
- A galeria pública carrega apenas registros com `status = 'approved'`.
- A aprovação deve ser feita por uma equipe autorizada, por meio de uma interface administrativa segura ou do painel do Supabase. Não aprove contribuições automaticamente.

## Antes de publicar institucionalmente
A configuração SQL é um ponto de partida. As políticas de upload anônimo precisam de reforço para produção. Recomenda-se adicionar autenticação administrativa, CAPTCHA/rate limiting, validação de arquivos no servidor, canal para solicitação de remoção, política de privacidade e autorização de uso de imagem adequada ao contexto institucional, incluindo atenção especial a menores de idade. Defina também quem fará a moderação e por quanto tempo os arquivos serão mantidos.

## Identidade visual
Paleta de interface usada nesta proposta: verde `#006B3F`, verde escuro `#064B31`, amarelo `#F5C842` e fundo claro `#FBF8EF`. Ajuste as cores para corresponder exatamente ao manual de identidade visual vigente do IFRR antes da publicação oficial.
