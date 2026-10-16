# LACC | Monitor de Vendas V2

Primeira entrega: **protótipo visual**, construído com React, Vite e Tailwind CSS, com a identidade preto/dourado da LACC.

## Executar no computador

Pré-requisito: Node.js 20.19+ ou 22.12+.

```bash
npm install
npm run dev
```

Acesse a URL local exibida no terminal (geralmente http://localhost:5173).

## Compilar

```bash
npm run build
```

O conteúdo final fica em `dist/`. Para publicar, configure um serviço de hospedagem estática com **build command** `npm run build` e **output directory** `dist`.

## O que está pronto

- Tela de entrada **apenas demonstrativa** (sem credenciais reais)
- Layout responsivo com menu lateral, identidade LACC e logotipo original
- Dashboard de exemplo com KPIs, gráfico e tabela
- Estrutura visual dos demais módulos

## O que ainda não está implementado

- Login real e gestão de sessões
- Comunicação com Google Sheets / Apps Script
- Permissões por perfil e loja
- Cadastro/edição de vendas, metas e produtos

**Não use a tela demonstrativa como autenticação de produção.** O botão “Visualizar demonstração” abre dados de exemplo sem consultar a planilha. Não configure chaves, PINs ou tokens em arquivos enviados ao GitHub.

## Próxima etapa

Projetar API autenticada no servidor (sem expor credenciais ou permissões no frontend), depois integrar o Dashboard e os módulos progressivamente, mantendo a V1 intacta.
