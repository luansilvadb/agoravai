# REQ-004: Funcionalidades Avançadas

## Phase Goal
Adicionar recursos de exportação, metas, categorias personalizadas e busca.

## User Story
> Como usuário avançado, quero poder fazer backup dos meus dados, definir metas financeiras e personalizar minhas categorias, para que o sistema se adapte às minhas necessidades.

## Functional Requirements

### FR1: Exportação de Dados
- [ ] Exportar JSON completo (todas as tabelas)
- [ ] Exportar CSV (transações apenas)
- [ ] Botão de download na tela de configurações
- [ ] Nome do arquivo com timestamp
- [ ] Estrutura JSON documentada

### FR2: Importação de Backup
- [ ] Upload de arquivo JSON
- [ ] Validação de schema antes de importar
- [ ] Preview do que será importado
- [ ] Merge ou replace (escolha do usuário)
- [ ] Tratamento de erros (arquivo inválido, versão incompatível)

### FR3: Categorias Personalizadas
- [ ] CRUD de categorias próprias
- [ ] Seletor de cor (color picker)
- [ ] Seletor de ícone (grid de ícones Lucide)
- [ ] Categorias padrão não podem ser deletadas
- [ ] Validação: nome único

### FR4: Metas Financeiras
- [ ] Definir meta de economia mensal
- [ ] Barra de progresso visual
- [ ] Cálculo: receitas - despesas vs meta
- [ ] Notificação visual quando meta atingida
- [ ] Histórico de metas passadas

### FR5: Busca de Transações
- [ ] Campo de busca global
- [ ] Busca por: descrição, categoria, valor
- [ ] Resultados em tempo real (debounce 300ms)
- [ ] Highlight dos termos encontrados
- [ ] Mensagem "Nenhum resultado"

### FR6: Configurações
- [ ] Seletor de moeda (BRL, USD, EUR, etc.)
- [ ] Seletor de idioma/locale (pt-BR, en-US, es)
- [ ] Toggle tema claro/escuro
- [ ] Botão "Limpar todos os dados" (com confirmação)
- [ ] Mostrar versão do app

### FR7: Tema Escuro
- [ ] Toggle funcional tema claro/escuro
- [ ] Variáveis CSS para ambos os temas
- [ ] Persistência da preferência
- [ ] Transição suave entre temas
- [ ] Respeita preferência do sistema (prefers-color-scheme)

## Non-Functional Requirements

### NFR1: UX
- [ ] Drag & drop para upload
- [ ] Confirmações modais para ações destrutivas
- [ ] Toast de sucesso/erro

### NFR2: Segurança
- [ ] Sanitização de arquivo importado
- [ ] Tamanho máximo de arquivo (10MB)
- [ ] Validação de schema rigorosa

## Technical Decisions

| Decisão | Escolha | Rationale |
|---------|---------|-----------|
| Export | JSON.stringify + Blob | Nativo, universal |
| Import | FileReader API | Nativo, seguro |
| Color Picker | input type="color" | Simples, funcional |
| Search | Fuse.js ou manual | Se manual: regex simples |

## Edge Cases
- Arquivo JSON muito grande: mostrar progresso
- Categoria em uso: não deixar deletar
- Importação falha: rollback automático

## Definition of Done
- [ ] Exporta/importa sem perda de dados
- [ ] Categorias personalizadas funcionam igual às padrão
- [ ] Metas calculam corretamente
- [ ] Busca encontra resultados esperados
- [ ] Tema escuro consistente em todas as telas

## Estimates
- **Complexity:** Medium
- **Effort:** 2-3 dias
