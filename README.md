# MeuPet Seguro: Aplicativo (Frontend)

Aplicativo mobile do **MeuPet Seguro**, um sistema de Smart Home para acompanhar pets à distância. O app mostra em tempo quase real a atividade do pet e o nível dos potes de comida e de água, avisa o tutor por notificação quando algo foge do normal e guarda a carteira de vacinação.

Projeto da ExpoTech 2026.2. Feito com **React Native + Expo**.

> **Backend:** [techgradus/MeuPetSeguro-Backend](https://github.com/techgradus/MeuPetSeguro-Backend)
>
> Este app conversa com o **backend** (`MeuPetSeguro-Backend`) por HTTP. Os dispositivos (coleira e estação de potes) falam com o backend por MQTT; o app **não fala MQTT**.

---

## Sumário

1. [Funcionalidades](#1-funcionalidades)
2. [Stack](#2-stack)
3. [Como rodar](#3-como-rodar)
4. [Estrutura de pastas](#4-estrutura-de-pastas)
5. [Telas](#5-telas)
6. [Cadastrar um dispositivo: real ou simulado](#6-cadastrar-um-dispositivo-real-ou-simulado)
7. [Comunicação com o backend](#7-comunicação-com-o-backend)
8. [Sessão e autenticação](#8-sessão-e-autenticação)
9. [Notificações push](#9-notificações-push)
10. [Dados em tempo real](#10-dados-em-tempo-real)
11. [Tema, modo escuro e responsividade](#11-tema-modo-escuro-e-responsividade)
12. [Build e distribuição](#12-build-e-distribuição)
13. [Problemas comuns](#13-problemas-comuns)

---

## 1. Funcionalidades

- Cadastro, login e recuperação de senha por código enviado por e-mail.
- Vários pets por conta, com foto, espécie, raça, idade, peso e observações.
- **Início:** estado atual do pet, atividade, nível de comida e de água, mini gráfico de 7 dias e cartão de insight da IA.
- **Atividade** (hoje ou 7 dias) e **Alimentação** (consumo de comida e de água).
- **Relatórios** com atividade, consumo e a seção *O que notamos* (insights da IA).
- **Alertas** (comida baixa, água baixa, pouca atividade, mudança de padrão, dispositivo desconectado e vacina) com marcação de lido.
- **Notificações push** quando um alerta é criado.
- **Carteira de vacinação** com status (Em dia, Próxima do vencimento, Atrasada).
- **Dispositivos:** cadastro de coleira e estação de potes, **real ou simulado**.
- Remoção de pet, edição de perfil, foto da conta, troca de senha e modo escuro.

## 2. Stack

| Item | Tecnologia |
|---|---|
| Base | React Native 0.81, React 19, Expo SDK 54, TypeScript |
| Navegação | `expo-router` (rotas por arquivo, `typedRoutes` ligado) |
| Otimização | Nova arquitetura do React Native e React Compiler (`app.json`) |
| Sessão | `expo-secure-store` |
| Notificações | `expo-notifications` com Firebase Cloud Messaging |
| Fotos | `expo-image-picker` |
| Fontes e ícones | Plus Jakarta Sans (`@expo-google-fonts`) e Ionicons |
| Build | EAS Build e `expo-dev-client` |

O app não usa Redux, Zustand nem React Query. O estado é resolvido com um contexto de autenticação, hooks com cache em memória e pequenos *stores* simples.

## 3. Como rodar

**Pré-requisitos**

- Node.js 18 ou superior
- Android Studio (emulador) ou um celular Android com depuração USB
- O **backend rodando** (veja o README do backend)

**Passo a passo**

1. Instale as dependências:
   ```
   npm install
   ```
2. Crie o arquivo `.env` na raiz do app com o endereço da API:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
   ```
   O app acrescenta `/api` sozinho. Veja qual endereço usar:

   | Onde o app roda | `EXPO_PUBLIC_API_URL` |
   |---|---|
   | Emulador Android | `http://10.0.2.2:3000` |
   | Celular na mesma rede Wi-Fi | `http://<IP do seu computador>:3000` |
   | Navegador (web) | `http://localhost:3000` |
   | Produção | `https://seu-dominio` (use HTTPS) |

   > `localhost` **não funciona** no celular nem no emulador: dentro deles, `localhost` é o próprio aparelho.
3. Coloque o arquivo `google-services.json` do seu projeto Firebase em `firebase/` (o `app.json` já aponta para ele). Ele é necessário para o build Android e para o push.
4. Rode o app:
   ```
   npx expo run:android      # compila e instala o app de desenvolvimento no Android
   npm start                 # depois, para só abrir o servidor de desenvolvimento
   npm run web               # versão no navegador, dentro de uma moldura de celular
   ```

O projeto usa `expo-dev-client` e push nativo (FCM), então o caminho normal é um **build de desenvolvimento** (`npx expo run:android` ou EAS), e não o Expo Go.

**Scripts**

| Comando | O que faz |
|---|---|
| `npm start` | Servidor de desenvolvimento do Expo |
| `npm run android` | Compila e roda no Android |
| `npm run ios` | Compila e roda no iOS |
| `npm run web` | Roda no navegador |
| `npm run lint` | Verifica o código com ESLint |

## 4. Estrutura de pastas

```
meu-pet-seguro/
├── src/app/                 TELAS. Cada arquivo vira uma rota (expo-router)
│   ├── _layout.tsx          raiz: fontes, AuthProvider, proteção de rotas e push
│   ├── index.tsx            logado vai para /splash, deslogado vai para /login
│   ├── novo-pet/            cadastro de pet em etapas
│   └── novo-dispositivo/    index → preparar → rede → conectando → concluido
├── components/              peças reutilizáveis (ui/, pets/, devices/, BottomNav, PhoneFrame)
├── hooks/                   lógica reaproveitada (useAuth, usePets, useAlerts, useLiveData...)
├── services/                comunicação com o backend (api.ts + um service por assunto) e sessão
├── constants/               tema (cores, fontes), modo escuro, tipos de dispositivo
├── types/                   tipos do domínio (Pet, Device, Vaccine)
├── utils/                   funções puras: validações, datas, agrupamento de dispositivos
├── data/                    tipos e conversores usados pelas telas
├── firebase/                google-services.json (configuração do FCM no Android)
└── app.json, eas.json       configuração do Expo e do build
```

**Regra de ouro:** a **tela** só mostra e reage. Quem busca os dados é o **hook**, quem fala com o backend é o **service**, e quem faz o HTTP é o `api.ts`.

## 5. Telas

| Rota | Para que serve |
|---|---|
| `login`, `cadastro` | Entrar e criar conta |
| `forgot-password` | Recuperar senha em 3 passos: e-mail, código com nova senha, concluído |
| `splash` | Animação de abertura; espera os pets carregarem (até 5 s) e segue para a Home |
| `home` | Pet em destaque, atividade, comida, água, mini gráfico e insight |
| `activity` | Atividade do pet (hoje ou 7 dias) |
| `alimentacao` | Consumo de comida e de água, com histórico recente |
| `relatorios` | Atividade, consumo e insights da IA |
| `alertas` | Lista de alertas e marcação de lido |
| `meus-pets` | Editar o pet, foto, vacinas, dispositivos e **remover o pet** |
| `carteira-vacinacao`, `adicionar-vacina`, `detalhe-vacina` | Carteira de vacinação |
| `novo-pet` | Cadastro em 4 etapas: Perfil, Casa conectada, Vínculo e Cadastrado |
| `novo-dispositivo` | Cadastro de dispositivo (real ou simulado) |
| `config`, `minha-conta`, `alterar-senha` | Preferências, dados da conta, foto e troca de senha |

Rotas públicas (sem login): `login`, `cadastro` e `forgot-password`. Qualquer outra rota, sem usuário logado, leva ao login.

## 6. Cadastrar um dispositivo: real ou simulado

Na tela **Novo dispositivo** a pessoa escolhe:

1. **O tipo:** *Coleira* (atividade e rotina) ou *Estação de potes* (comida e água, dois potes em um equipamento só).
2. **O pet** que vai receber o dispositivo.
3. **Como o dispositivo vai enviar os dados:** *Dispositivo real* ou *Simulado*.

### 6.1 Diferenças

| | Dispositivo real | Dispositivo simulado |
|---|---|---|
| O que é | Placa ESP32 de verdade | Dispositivo virtual, sem hardware |
| Quem envia os dados | A própria placa | O simulador do backend (`npm run mqtt:simulate`) |
| Código | O da etiqueta (ex.: `COLAR-1A2B3C`, `ESTACAO-1A2B3C`) | Criado pelo app (ex.: `COLAR-SIM4F9K`) |
| Wi-Fi | A pessoa configura pelo portal da placa | Não precisa |
| Etapas | 5 | 3 |
| Aparece como | Dispositivo comum | Marcado com **· simulado** na lista de dispositivos |
| Quando usar | Uso de verdade e demonstração com hardware | Desenvolvimento, testes e demonstração sem hardware |
| Pré-requisito | Placa com o firmware gravado e ligada | Simulador rodando no servidor |

Para o resto do app (Início, Atividade, Alimentação, Alertas, Relatórios e IA), **não há diferença**: os dados chegam da mesma forma e as telas se comportam igual.

### 6.2 Fluxo do dispositivo real (5 etapas)

1. **Escolha:** tipo, pet e modo *Dispositivo real*, depois **Continuar**.
2. **Preparar:** ligue o dispositivo e digite o **código da etiqueta**. Ele aparece no Serial Monitor da placa e na página de configuração do Wi-Fi (e na etiqueta, se a placa tiver uma). Ao continuar, o app **já cadastra** o dispositivo no backend. Se você voltar e digitar o mesmo código, o cadastro é reaproveitado.
3. **Wi-Fi:** a placa abre uma rede chamada `MEUPET-<ID>`. Conecte nela pelo celular e escolha o Wi-Fi da sua casa na página que abrir. A placa reinicia sozinha.
4. **Conectando:** o app consulta o backend a cada 2 segundos, por até 60 segundos, esperando o dispositivo ficar **online**.
5. **Concluído.**

Se a placa não ficar online no tempo esperado, o app avisa e deixa **Rever as instruções do Wi-Fi**. O dispositivo já está cadastrado e vai ficar online assim que a placa conectar.

### 6.3 Fluxo do dispositivo simulado (3 etapas)

1. **Escolha:** tipo, pet e modo *Simulado*, depois **Criar dispositivo simulado**. O app gera o código sozinho e cadastra o dispositivo como simulado.
2. **Conectando:** o app espera o simulador colocar o dispositivo online (até 60 segundos). O simulador verifica novos dispositivos a cada 10 segundos.
3. **Concluído.**

Se o simulador **não estiver rodando**, o app avisa que o dispositivo foi criado mas não ficou online, e pede para conferir o `npm run mqtt:simulate` no servidor.

### 6.4 Detalhes úteis

- Um pet só pode ter **um dispositivo de cada tipo** (uma coleira, um pote de comida e um pote de água). A estação conta como os dois potes.
- Um código não pode estar em dois pets.
- A estação aparece como **um equipamento só** para o tutor, mesmo sendo dois dispositivos no servidor.
- **Não dá para converter** um dispositivo de simulado para real (ou o contrário). Remova o dispositivo em *Meus Pets* e cadastre de novo escolhendo o outro modo.
- Se você voltar da tela *Conectando* e trocar de pet, de tipo ou de modo, o app remove o cadastro anterior antes de criar o novo.

## 7. Comunicação com o backend

Todo HTTP passa por `services/api.ts`:

- Monta a URL com `EXPO_PUBLIC_API_URL` + `/api`.
- Com `auth: true`, lê o token da sessão e envia `Authorization: Bearer <token>`.
- Envia JSON, ou `FormData` nos uploads de foto.
- Aplica **timeout** (10 s; 30 s nos uploads).
- Separa os erros: `NetworkError` (sem conexão ou timeout) e `ApiError` (o servidor respondeu com erro, com status e mensagem).
- Em **401** numa chamada autenticada, limpa a sessão e leva o usuário ao login.

Um service por assunto, cada um convertendo o formato do backend para o das telas:

| Service | Assunto |
|---|---|
| `authService` | Login, cadastro, perfil, foto, troca e recuperação de senha |
| `petService` | CRUD de pets, com foto |
| `deviceService` | Vincular e remover dispositivos (real ou simulado) e esperar ficar online |
| `vaccineService` | Vacinas e cálculo do status |
| `alertService` | Alertas e marcação de lido |
| `readingService` | Estado atual, atividade e consumo |
| `insightService` | Insights da IA (devolve `null` se a IA estiver indisponível) |
| `pushService` | Registro do aparelho para notificações |
| `session` | Token e usuário guardados no aparelho |

## 8. Sessão e autenticação

- No login, o token (JWT) e os dados do usuário são guardados em `expo-secure-store` (Keystore no Android, Keychain no iOS), que é armazenamento **criptografado**. Na web usa `localStorage`.
- **Ao abrir o app:** lê o que está salvo, mostra o app logado na hora (funciona sem internet) e confirma em segundo plano com `GET /auth/me`. Se o servidor responder 401, a sessão é limpa e o app volta ao login. Sem internet, a sessão é mantida.
- **Proteção de rotas:** o `_layout.tsx` leva ao login quem não está logado e tenta abrir uma tela privada.
- **Logout:** primeiro avisa o backend para este aparelho parar de receber os alertas da conta, depois apaga a sessão e limpa os dados em cache.
- O token vale 7 dias; ao expirar, a pessoa entra de novo.

## 9. Notificações push

- Funcionam no **Android**, por Firebase Cloud Messaging.
- Depois do login, o app cria o canal de notificação `alerts`, pede a permissão e envia o token do aparelho para o backend (`POST /push-tokens`). Se o FCM trocar o token, o app reenvia.
- Quando um alerta é criado, o backend manda o push ao tutor. Com o app aberto, a notificação aparece como banner; **tocar nela abre a tela de Alertas**, com o app aberto, em segundo plano ou fechado.
- No logout o token é removido do backend.
- Para testar: `POST /api/push-tokens/test` (com o token de login) manda uma notificação de teste para os aparelhos da conta.

> O botão **Notificações** em *Configurações* ainda é apenas visual e não liga nem desliga o push.

## 10. Dados em tempo real

O app não usa MQTT nem WebSocket. Os dados se atualizam por **consulta periódica**, só enquanto a tela está em foco:

| Dado | Atualiza a cada |
|---|---|
| Estado atual do pet (atividade e potes) | 30 s |
| Relatórios de atividade e de consumo | 1 min |
| Insights da IA | 5 min |

Pets e alertas ficam em cache em memória: a tela abre com o que já tem e atualiza por cima. A marcação de alerta como lido é **otimista** (aparece na hora e volta atrás se o servidor falhar).

## 11. Tema, modo escuro e responsividade

- Cores, fontes, espaçamentos e raios ficam em `constants/petTheme.ts`.
- **Modo escuro:** `themed()` converte automaticamente as cores dos estilos (fundos claros viram escuros, textos escuros viram claros, cores vivas ficam). O estado é global (`useAppTheme`), sem Provider. A escolha é salva só na **web**; no celular vale enquanto o app está aberto.
- **Responsividade:** o layout é desenhado para 390 px e escalado pela largura real (`useLayout` e `useResponsive`), respeitando as áreas seguras do Android. No navegador, o app aparece dentro de uma moldura de celular.
- A barra de navegação (`BottomNav`) é a mesma em todas as telas.

## 12. Build e distribuição

Os perfis ficam em `eas.json`:

| Perfil | Uso |
|---|---|
| `development` | Build de desenvolvimento com `expo-dev-client` (distribuição interna) |
| `preview` | APK para testes |
| `production` | Versão de produção, com versão incrementada automaticamente |

```
npx eas build --profile preview --platform android
```

O `app.json` libera tráfego HTTP no Android (`usesCleartextTraffic`) para facilitar o desenvolvimento local. **Em produção, use HTTPS e desligue essa opção.**

## 13. Problemas comuns

**"Não foi possível conectar ao servidor."**

- Confira o `EXPO_PUBLIC_API_URL` (veja a tabela da seção 3) e se o backend está rodando.
- No celular, o computador e o aparelho precisam estar na mesma rede, e o firewall deve permitir a porta 3000.
- Depois de mudar o `.env`, reinicie o servidor do Expo (`npm start`).

**O app volta para o login sozinho**

O token expirou (7 dias) ou foi recusado pelo servidor. Entre de novo.

**O dispositivo simulado não fica online**

Confira se o simulador está rodando no servidor (`npm run mqtt:simulate`) e se o dispositivo foi cadastrado como **Simulado**.

**O dispositivo real não fica online**

Confira se o código digitado é exatamente o da etiqueta, se a placa conectou no Wi-Fi e se está ligada. Se precisar reconfigurar o Wi-Fi, segure o botão BOOT da placa por 5 segundos.

**O push não chega**

Confira se a permissão de notificações foi concedida, se o `google-services.json` é do mesmo projeto Firebase do backend e se o backend tem a credencial do Firebase configurada. Teste com `POST /api/push-tokens/test`.

**Erro de módulo ou cache estranho depois de atualizar dependências**

```
npx expo start -c
```