# 🏆 Bolão Worlds 2026 — LoL Esports

> Uma aplicação web interativa, moderna e responsiva no estilo **Hextech** para gerenciamento e participação em bolões do **League of Legends World Championship 2026**.

![Hextech Theme Banner](https://img.shields.io/badge/Theme-Hextech%20UI-0ac8b9?style=for-the-badge&logo=leagueoflegends)
![Firebase Powered](https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 🌟 Demonstração Online

🚀 **Acesse o site ao vivo:** [lemmores.github.io/bolao-worlds](https://lemmores.github.io/bolao-worlds/)

---

## ✨ Funcionalidades

- 🔒 **Autenticação de Invocadores:** Cadastro e login seguros alimentados pelo Firebase Auth.
- ⚡ **Palpites em Tempo Real:**
  - **Partidas MD1:** Seleção simples do vencedor com clique interativo e *feedback* visual em dourado.
  - **Séries MD3 e MD5:** Seleção de placar exato (ex: `2 x 1`, `3 x 0`) com cálculo automático do time vencedor.
- ⏱️ **Cronômetro de Bloqueio Automático:** Contagem regressiva vinculada ao primeiro confronto de cada rodada. Assim que o horário do jogo é atingido, os palpites travam automaticamente.
- 🔄 **Navegação Inteligente por Rodadas:** O sistema identifica e seleciona a rodada ativa automaticamente, permitindo visualizar o histórico de qualquer fase (*Fase Suíça*, *Quartas*, *Semi*, *Final*).
- 👁️ **Palpites da Galera:** Acompanhe em tempo real o que os outros participantes apostaram para cada confronto.
- 📊 **Tabela de Classificação Geral:** Pontuação calculada e atualizada instantaneamente no banco de dados.
- 🛡️ **Painel do Administrador:**
  - Cadastro manual de confrontos (formatos MD1, MD3, MD5) com suporte a *upload* de escudos ou URLs.
  - Inserção de data/hora oficial via seletor ISO local.
  - Atualização dos resultados reais (vencedor e placares) com re-cálculo automático das pontuações dos usuários.

---

## 🎯 Regras de Pontuação

| Formato da Partida | Condição de Acerto | Pontuação |
| :--- | :--- | :---: |
| **MD1** | Acertar o time vencedor | **+3 pts** |
| **MD3 / MD5** | Acertar o placar exato da série ("Cravada") | **+3 pts** |
| **MD3 / MD5** | Errar o placar exato, mas acertar o time vencedor | **+1 pt** |

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3 Custom Properties (Tema Hextech), JavaScript Vanilla (ES Modules)
- **Backend & Database:** Firebase Firestore (Realtime DB)
- **Autenticação:** Firebase Authentication
- **Hospedagem:** GitHub Pages
- **Ícones & Tipografia:** FontAwesome v6, *Beaufort for LOL* & *Spiegel* (Google Fonts / Riot Style)

---

## 📂 Estrutura de Arquivos

```text
bolao-worlds/
├── index.html      # Estrutura principal da aplicação e abas
├── styles.css      # Sistema de design Hextech (Cores, Grids, Animações)
├── app.js          # Lógica de negócios, Firebase SDK e manipulação de DOM
└── README.md       # Documentação do repositório
```

---

## 🚀 Como Executar Localmente

1. **Clone este repositório:**
   ```bash
   git clone https://github.com/Lemmores/bolao-worlds.git
   cd bolao-worlds
   ```

2. **Servidor Local:**
   Abra a pasta no VS Code e execute o projeto utilizando a extensão **Live Server** (ou qualquer servidor estático local).

3. **Configuração do Firebase:**
   As credenciais do Firebase são inicializadas no arquivo `app.js`. Lembre-se de configurar as regras de leitura/escrita do Firestore Database e autorizar seu domínio (`localhost` ou `lemmores.github.io`) na aba **Authentication > Settings > Authorized Domains**.

---

## 👤 Autor

Desenvolvido por **Marcelo Lemes (Lemmores)**.

- **GitHub:** [@Lemmores](https://github.com/Lemmores)
- **LinkedIn:** [Marcelo Lemes](https://www.linkedin.com/)

---

<p align="center">
  <i>GG WP e bons palpites no Mundial de League of Legends! 🏆</i>
</p>