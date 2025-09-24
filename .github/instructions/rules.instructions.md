---
applyTo: '**'
---
Este arquivo descreve as minhas preferências e regras de trabalho para o projeto MIRASWEAR. Use-o como referência ao editar código, abrir PRs, fazer commits e ajustar UX.

1. Tom e comunicação
- Seja conciso, direto e colaborativo — escreva como um colega de equipe.
- Evite jargões desnecessários; explique decisões arquiteturais brevemente quando relevantes.

2. Estilo de código
- Siga o estilo TypeScript/React atual do repositório. Não reformatar arquivos desnecessariamente.
- Prefira código simples e legível em vez de soluções sobrecomplicadas.
- Use nomes descritivos para variáveis/funções. Evite abreviações de uma letra.

3. Estrutura do projeto
- Frontend: Next.js (App Router) com componentes server/client.
- Banco: Postgres + Drizzle ORM; tenha cuidado com queries e transações.
- Validação: `zod` para inputs/ações do servidor.

4. Banco de dados e queries
- Evite queries com UUID nulos (ex.: `= '00000000-0000-0000-0000-000000000000'`). Use `IS NULL`/`IS NOT NULL` quando apropriado.
- Ao usar recursos Postgres opcionais (ex.: `unaccent`), sempre codificar fallback (ex.: `ILIKE`) para compatibilidade.
- Focar em operações transacionais ao aplicar múltiplas atualizações relacionadas (ex.: variantes + inventário).
5. Fale em português (pt-BR)
6. Testes e validação
- Adicione testes mínimos para lógicas críticas quando possível (ex.: helpers de validação, transformações de preço).
- Antes de abrir PR: rodar `pnpm dev` / `npm run dev` e checar console por warnings relevantes.

7. Commits e PRs
- Commits pequenos e atômicos; mensagens claras no estilo `feat:`, `fix:`, `chore:`.
- PR deve conter resumo curto, alterações principais e instruções de teste (passos para validar manualmente).

8. Deploy e dependências
- Evitar mudanças que dependam de extensões Postgres não instaladas no ambiente de produção sem fallback.

9. Arquivos e imports
- Ao mover/renomear componentes, atualizar todas as importações.
- Evite builds quebrados: se remover um componente usado em vários lugares, primeiro substituir a importação por um stub ou migrar consumidores.

10. Ferramentas e comandos úteis
- Rodar dev server: `pnpm dev` (ou `npm run dev`).
- Rodar linters/formatters: seguir as configurações locais (`eslint`, `prettier` se presentes).

11. Outras preferências
- Seja proativo: se houver uma pequena melhoria óbvia (abort controller, toasts no lugar de logs, teclado na busca), aplique como PR separado ou perguntar antes de fazer mudanças grandes.