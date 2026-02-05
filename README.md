
# ZENITH WMS ANDROID APP

Aplicativo móvel de Warehouse Management System (WMS) desenvolvido com React Native e Expo. O projeto foca em alta performance, operação offline-first (onde possível) e uma arquitetura limpa separando UI, Contexto e Serviços de API.

---

## 📋 Índice
1. [Estrutura do Projeto](#-estrutura-do-projeto)
2. [Desenvolvimento e Arquitetura](#-desenvolvimento-e-arquitetura)
    - [Consumindo a API](#consumindo-a-api)
    - [Gerenciamento de Estado (Contexts)](#gerenciamento-de-estado-contexts)
    - [Temas e UI](#temas-e-ui)
3. [Guia de Compilação (Build)](#-guia-de-compilação-build)
    - [1. Configuração de Assinatura](#1-configuração-de-assinatura-keystore)
    - [2. Personalizar Nome do APK](#2-personalizar-nome-do-apk-automático)
    - [3. Comandos de Build](#3-gerando-o-apk-release)
4. [Execução em Debug](#-execução-em-debug)

---

## 📂 Estrutura do Projeto

* **`/api`**: Centraliza a comunicação com o Backend. Não use `fetch` direto nos componentes.
* **`/components`**: Componentes visuais reutilizáveis (Botões, Cards, Modais).
* **`/contexts`**: Lógica global (Autenticação, Sessão, Permissões, Tema).
* **`/screens`**: Telas da aplicação.
* **`/utils`**: Formatadores de data, texto e auxiliares.
* **`/android`**: Código nativo gerado (Não edite manualmente a menos que saiba o que está fazendo no Gradle).

---

## 🛠 Desenvolvimento e Arquitetura

### Consumindo a API
Toda a comunicação externa deve passar pelo arquivo `api/index.js`. Ele gerencia automaticamente o **Token de Sessão**, **Timeouts** e **URL Base**.

**Como criar uma nova chamada:**
1. Abra `api/index.js`.
2. Exporte uma nova função utilizando o helper `authenticatedFetch`.

```javascript
// Exemplo em api/index.js
export const buscarProduto = (codigo) => {
    // O endpoint /apiv1 já é prefixado automaticamente
    return authenticatedFetch('/produtos/consulta', { codigo });
};
```

**Como usar na tela:**

```javascript
import * as api from '../api';

const handleBusca = async () => {
    try {
        const dados = await api.buscarProduto('12345');
        console.log(dados);
    } catch (error) {
        alert(error.message);
    }
};
```

### Gerenciamento de Estado (Contexts)

#### AuthContext (`useAuth`)

Gerencia o usuário logado, permissões e armazéns.

```javascript
import { useAuth } from '../contexts/AuthContext';

const { 
    userSession,   // Objeto do usuário logado
    warehouses,    // Lista de armazéns permitidos
    login,         // Função de login (user, pass)
    logout,        // Função de logout
    authStatus     // 'loggedIn', 'loggedOut', 'authenticating'
} = useAuth();
```

#### ThemeContext (`useTheme`)

Gerencia as cores (Light/Dark mode).

```javascript
import { useTheme } from '../contexts/ThemeContext';

const { colors, theme } = useTheme();

// Uso no estilo
<View style={{ backgroundColor: colors.background }}>
    <Text style={{ color: colors.text }}>Olá</Text>
</View>
```

---

## 🚀 Guia de Compilação (Build)

Siga este guia estritamente para gerar um **APK Assinado (Release)** pronto para instalação.

### 1. Configuração de Assinatura (Keystore)

Se você **ainda não tem** uma keystore, gere uma com o comando abaixo. Guarde as senhas!

```bash
keytool -genkey -v -keystore android/app/zenith-wms-app.keystore -alias zenith-wms-alias -keyalg RSA -keysize 2048 -validity 10000 -storepass "sua_senha_aqui" -keypass "sua_senha_aqui"
```

**Configurando o Gradle:**

1. Coloque o arquivo `.keystore` gerado dentro de `android/app/`.
2. Abra `android/gradle.properties` (crie se não existir) e adicione:

```properties
ZENITH_RELEASE_STORE_FILE=zenith-wms-app.keystore
ZENITH_RELEASE_KEY_ALIAS=zenith-wms-alias
ZENITH_RELEASE_STORE_PASSWORD=sua_senha_aqui
ZENITH_RELEASE_KEY_PASSWORD=sua_senha_aqui
```

### 2. Personalizar Nome do APK (Automático)

Para que o arquivo final saia como `ZENITH-BASE-APP-1.0.16.apk` ao invés de `app-release.apk`, adicione o seguinte bloco no final da seção `android { ... }` dentro do arquivo **`android/app/build.gradle`**:

```groovy
android {
    // ... configurações existentes ...

    // ADICIONE ESTE BLOCO NO FINAL DE "android {}"
    applicationVariants.all { variant ->
        variant.outputs.all {
            // Define o nome: NomeDoProjeto-Versao.apk
            outputFileName = "ZENITH-BASE-APP-${variant.versionName}.apk"
        }
    }
}
```

### 3. Gerando o APK Release

Para garantir uma build limpa e atualizada, execute a sequência exata abaixo no terminal (na raiz do projeto):

1. **Limpar builds anteriores (dentro da pasta android):**
```bash
cd android
./gradlew clean
cd ..
```


2. **Regerar código nativo (Prebuild):**
Isso sincroniza as versões do `package.json` e `app.json` com o Android nativo.
```bash
npx expo prebuild --platform android

```


3. **Compilar o APK Release:**
```bash
cd android
.\gradlew assembleRelease
```



✅ **Onde está o APK?**
O arquivo estará em: `android/app/build/outputs/apk/release/ZENITH-BASE-APP-1.0.16.apk`

---

## 📱 Execução em Debug

Para testar o aplicativo em tempo real no emulador ou dispositivo físico conectado via USB (com hot-reload):

```bash
npx expo run:android
```

Se precisar limpar o cache do Metro Bundler:

```bash
npx expo start -c
```