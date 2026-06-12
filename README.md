# 🏆 Bolão de Futebol & Simulador - Guia do Repositório

Este é um aplicativo completo construído em **React**, **Vite** e **Tailwind CSS**. Ele permite gerenciar participantes, criar palpites de futebol, simular resultados ao vivo em tempo real e acompanhar a tabela de classificação automática.

Criamos este guia útil em Português para você compreender exatamente como rodar, compilar e publicar seu código a partir do seu repositório do **GitHub**.

---

## 🚀 Por que meu projeto "não funcionava" no GitHub?

Os projetos modernos em JavaScript/React não podem ser executados simplesmente dando dois cliques no arquivo `index.html`. Eles precisam ser compilados ou servidos através de um servidor local.

Além do mais, ao publicar no **GitHub Pages** (por exemplo: `https://seu-usuario.github.io/seu-repositorio/`), o navegador procura os arquivos de estilo e scripts na raiz do servidor (`/assets/`) em vez do subdiretório do seu repositório.

### O que nós ajustamos para você:
1. **Caminhos Relativos (`base: './'`)**: Adicionamos `base: './'` no seu arquivo `vite.config.ts`. Isso garante que, independente de onde o site for hospedado (na raiz ou em uma subpasta/repositório no GitHub Pages), os arquivos de estilo (CSS) e os scripts serão carregados perfeitamente.
2. **Suporte de Login Híbrido**: O sistema permite que o login seja feito rapidamente com **qualquer e-mail** (para facilitar os testes) ou usando o login oficial do Google caso fornecido um Client ID seguro.

---

## 🛠️ Como rodar o projeto no seu computador (Local)

Para executar o projeto localmente no seu computador, siga estes passos simples:

### Pré-requisitos
Certifique-se de ter o **Node.js** instalado na sua máquina. Você pode baixá-lo em [nodejs.org](https://nodejs.org/).

### Passo a Passo:

1. **Baixar ou clonar o código**:
   ```bash
   git clone <link-do-seu-repositorio-do-github>
   cd <nome-do-repositorio>
   ```

2. **Instalar as dependências**:
   Abra o terminal na pasta do projeto e digite o comando abaixo para baixar as pastas necessárias (`node_modules`):
   ```bash
   npm install
   ```

3. **Executar o servidor de desenvolvimento**:
   Inicie o servidor local para programar ou visualizar e brincar no navegador:
   ```bash
   npm run dev
   ```
   *Após rodar, o terminal indicará o endereço para abrir, geralmente `http://localhost:3000` ou `http://localhost:5173`.*

---

## 📦 Como gerar a versão final para publicar (Production Build)

Para publicar em serviços de hospedagem como GitHub Pages, Vercel, Netlify ou outros:

1. **Compilar os arquivos**:
   Execute o comando de build para converter o código em HTML, CSS e JS otimizados:
   ```bash
   npm run build
   ```
   *Isso criará uma pasta chamada **`dist`** no seu diretório raiz contendo todos os arquivos finais estáticos com caminhos perfeitamente relativos.*

2. **Publicar no GitHub Pages facilmente**:
   A forma mais comum de publicar hoje a pasta `dist` no GitHub Pages é instalando uma ferramenta chamada `gh-pages`:
   
   - No terminal, instale-a como dependência de teste:
     ```bash
     npm install -D gh-pages
     ```
   - No seu `package.json`, adicione estes scripts para facilitar:
     ```json
     "scripts": {
       ...
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
     ```
   - Agora, basta rodar uma única vez para compilar e enviar ao link público:
     ```bash
     npm run deploy
     ```

---

## 🔑 Login Oficial do Google (Opcional)

Se quiser ativar o botão de login oficial com conta Google real no seu domínio pessoal ou local:
1. Vá ao [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um projeto, defina a tela de permissão OAuth e crie uma credencial de **ID do cliente Web OAuth**.
3. Em "Origens JavaScript autorizadas", adicione `http://localhost:3000` (e sua URL oficial do GitHub).
4. Crie um arquivo chamado `.env` no seu computador e inclua a variável obtida:
   ```env
   VITE_GOOGLE_CLIENT_ID="SEU_CLIENT_ID_DO_GOOGLE"
   ```
5. Quando o código ler esta variável, o botão oficial seguro do Google será carregado no formulário! Caso contrário, o aplicativo continuará utilizando o sistema de **login instantâneo por e-mail** amigável que construímos.

---

Boas simulações e palpites! Qualquer dúvida, estamos aqui para ajudar. ⚽🏆
