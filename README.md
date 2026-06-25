**# Avaliação Comparativa de Desempenho de LLMs Baseadas em Agentes na Geração Automática de Sistemas Web MVC**

Este repositório atua como o banco de dados oficial e repositório de Ciência Aberta (**Open Science**) para o Trabalho de Conclusão de Curso (TCC) e artigo científico intitulados: ***\*"Avaliação Comparativa de Desempenho de LLMs Baseadas em Agentes na Geração Automática de Sistemas Web MVC"\****.

O objetivo deste repositório é garantir a total reprodutibilidade do experimento empírico de orquestração multi-agente, disponibilizando todos os artefatos de entrada (prompts, requisitos e modelagens UML), as configurações do ambiente de execução, os códigos-fonte gerados autonomamente pelos modelos estudados e os relatórios brutos de análise estática e visual.

## Stack Tecnológica do Experimento

O sistema gerado pelos agentes (*Sistema de Gerenciamento de Tarefas - SGT*) foi padronizado sob a seguinte stack arquitetural:

- **Banco de Dados (Persistência):** PostgreSQL provisionado via BaaS no Supabase.
- **Servidor de Backend (Controller):** API RESTful desenvolvida em Node.js com Express.
- **Interface de Frontend (View):** Interface dinâmica e responsiva em React.js (com estilização customizada CSS).
- **Orquestrador local:** IDE integrada local e servidores operantes sob o protocolo **Model Context Protocol (MCP)** via ecossistema *Antigravity*.

------

## Arquitetura Multi-Agente em Cascata

Para mitigar a diluição de atenção e o fenômeno de *"Lost in the Middle"*, o fluxo de geração adotou uma arquitetura baseada em papéis (Role-Based) com três agentes especialistas em cascata:

1. **Agente Backend:** Interpreta os requisitos e o DER para gerar o banco de dados e endpoints. Exporta a assinatura de chamadas no contrato `API_CONTRACT.md`.
2. **Agente Frontend:** Interpreta o protótipo do Figma e o contrato `API_CONTRACT.md` para codificar as telas React.
3. **Agente QA (Quality Assurance):** Realiza testes de conformidade, revisões de segurança contra bibliotecas inválidas e audita o projeto geral.

------

## Protocolo Quadridimensional de Avaliação

O desempenho de cada modelo foi analisado de forma matemática e parametrizada segundo a equação de Nota Final ponderada:

Nota Final = 0,40 x CF + 0,30 x DA + 0,20 x QE + 0,10 x FV

- **CF (Completude Funcional - Peso 40%):** Percentual de requisitos atendidos e validados por testes unitários e de integração.
- **DA (Disciplina Arquitetural - Peso 30%):** Obediência às 7 restrições técnicas do prompt de sistema (A1--A7).
- **QE (Qualidade Estática - Peso 20%):** Escore gerado com base nos *ratings* e volume de bugs do SonarQube.
- **FV (Fidelidade Visual - Peso 10%):** Conformidade estrutural com os protótipos de alta fidelidade do Figma.
