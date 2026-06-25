# Relatórios de Auditoria Estática (SonarQube)

Esta pasta contém os artefatos brutos da auditoria estática de código realizada nos sistemas gerados.

## Estrutura dos Arquivos

* **`api-response-*.json`**: Payloads brutos extraídos diretamente da API do SonarQube (`/api/measures/component`). Estes arquivos são a prova material e inalterada do volume absoluto de falhas (Bugs, Vulnerabilities, Code Smells) e da Complexidade Ciclomática.
* **`sonarqube_*.png`**: Capturas de tela da interface gráfica do SonarQube.

## Notas Metodológicas e Reprodutibilidade

Para replicar a extração dos dados contidos nos JSONs localmente, utilize a seguinte chamada à API, substituindo `[PROJECT_KEY]` pela chave do respectivo modelo:

```bash
curl -X GET "http://localhost:9000/api/measures/component?component=[PROJECT_KEY]&metricKeys=bugs,vulnerabilities,code_smells,complexity,sqale_index,reliability_rating,security_rating,sqale_rating"