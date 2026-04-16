---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - D:\agora-vai\_bmad-output\planning-artifacts\prd.md
---

# UX Design Specification agora-vai

**Author:** Luan
**Date:** 2026-04-14

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Sumário Executivo

### Visão do Projeto
O agora-vai busca ser a ferramenta de gestão financeira mais simples do mercado para micro e pequenas empresas. O foco é a visibilidade imediata do fluxo de caixa e a redução da ansiedade do empreendedor através de uma interface limpa, rápida e sem jargões contábeis.

### Usuários-Alvo
*   **O Proprietário (Marcos):** Precisa de respostas rápidas ("Tenho dinheiro para a semana que vem?"). Valoriza dashboards claros e mobilidade.
*   **O Operacional (Ana):** Precisa de eficiência no lançamento de dados. Valoriza interfaces que minimizem cliques e erros de digitação.
*   **O Contador (Roberto):** Precisa de dados limpos e organizados. Valoriza exportações sem ruído.

### Principais Desafios de Design
*   **Simplicidade Radical:** Manter a interface minimalista enquanto oferece segurança (multitenancy e RBAC).
*   **Eficiência de Entrada:** Criar fluxos de lançamento que respeitem a meta de 30 segundos sem sacrificar a integridade dos dados.
*   **Hierarquia de Informação:** Destacar o saldo e vencimentos críticos de forma que a leitura de "5 segundos" seja real.

### Oportunidades de Design
*   **Micro-interações de Alívio:** Usar feedbacks visuais que reforcem a sensação de controle quando uma conta é paga ou o saldo é atualizado.
*   **Onboarding "Aha!":** Transformar a primeira configuração em um momento de valor imediato, não apenas um formulário de cadastro.

## Experiência Principal

### Definição da Experiência
A experiência do agora-vai é centrada na **redução da carga cognitiva**. O usuário não deve "aprender" a usar o sistema; ele deve se sentir guiado por uma interface que antecipa sua próxima necessidade financeira. O foco total está no fluxo de entrada de dados e na visualização imediata do impacto no caixa.

### Estratégia de Plataforma
O sistema será uma Web App responsiva com abordagem **Mobile-First**. 
*   **Mobile:** Prioridade para leitura rápida do dashboard e lançamentos únicos via touch.
*   **Desktop:** Otimizado para entrada de dados em lote, com suporte total a navegação por teclado e atalhos.

### Interações Sem Esforço
*   **Entrada de Dados Preditiva:** Sugestão de categorias e preenchimento automático de datas recorrentes.
*   **Navegação Zero-Click:** Informações cruciais (saldo e alertas) expostas no topo de todas as telas principais, sem necessidade de navegar para o dashboard.

### Momentos Críticos de Sucesso
*   **Visibilidade Pós-Onboarding:** O momento em que o usuário vê seu primeiro fluxo de caixa projetado após o cadastro inicial.
*   **Confirmação de Pagamento:** A satisfação visual de "dar baixa" em uma conta e ver a barra de progresso ou saldo reagir positivamente.

### Princípios de Experiência
*   **Clareza Imediata:** Se não pode ser entendido em 5 segundos, precisa ser simplificado.
*   **Fricção Mínima:** Reduzir ao máximo o número de campos obrigatórios no MVP.
*   **Segurança Perceptível:** Feedback visual constante de que os dados estão salvos e isolados.

## Resposta Emocional Desejada

### Objetivos Emocionais Principais
O agora-vai deve atuar como um "ansiolítico financeiro". O objetivo principal é transformar a angústia da incerteza em **calma e clareza**. O usuário deve se sentir empoderado pela informação, não sobrecarregado por ela.

### Mapeamento da Jornada Emocional
*   **Descoberta:** "Finalmente algo que eu entendo." (Surpresa positiva com a simplicidade).
*   **Lançamento:** "Nossa, já acabou?" (Sensação de eficiência e rapidez).
*   **Visualização:** "Agora eu sei onde estou." (Alívio e controle).
*   **Recorrência:** "Não vivo mais sem isso." (Confiança e hábito).

### Micro-emoções
*   **Confiança vs. Medo:** Substituir o medo de errar por uma interface que perdoa e guia.
*   **Ordem vs. Caos:** A organização visual deve refletir a organização financeira que o usuário busca.

### Implicações de Design
*   **Feedback de Sucesso:** Animações sutis e mensagens positivas ao completar tarefas (ex: "Tudo em dia!").
*   **Tom de Voz:** Amigável, direto e encorajador. Evitar termos técnicos frios.
*   **Espaço em Branco:** Usar o design para criar uma sensação de "respiro", combatendo a poluição visual comum em sistemas financeiros.

### Princípios de Design Emocional
*   **Design que Perdoa:** Facilidade em desfazer ações e editar dados.
*   **Recompensa Visual:** O dashboard deve ser "bonito de ver", tornando a gestão financeira uma tarefa prazerosa.
*   **Transparência Total:** Nunca deixar o usuário na dúvida sobre o que aconteceu com seu dado.
