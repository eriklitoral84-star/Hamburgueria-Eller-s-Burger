# 🍔 ELLER'S BURGUER - Cardápio Digital & Delivery

Cardápio digital moderno, responsivo e de alta performance desenvolvido especialmente para a hamburgueria **ELLER'S BURGUER** em Caraguatatuba - SP.

Permite que os clientes visualizem os produtos, escolham adicionais, façam observações, calculem a taxa de entrega e finalizem o pedido diretamente no WhatsApp oficial (**(12) 98108-9788**) sem intermediários nem comissões.

---

## 🚀 Principais Funcionalidades

- **Categorias Dinâmicas**: Combos Especiais, Smash Burgers, Burgers Artesanais, Porções & Batatas, Bebidas & Shakes, Sobremesas.
- **Busca Instantânea**: Filtro de produtos em tempo real por nome ou descrição.
- **Personalização de Produto**: Modal com escolha de adicionais com cálculo automático de preço, observações ("sem cebola", "ponto da carne", etc.) e seletor de quantidade.
- **Calculadora de Taxa de Entrega (R$ 1,50/km - Mínimo R$ 5,00 abaixo de 2 km)**:
  - Ponto de partida: **Rua Antônio Ovídeo Ferreira, 375 - Perequê Mirim, Caraguatatuba - SP**.
  - Seletor rápido de mais de 20 bairros de Caraguatatuba com distâncias pré-calculadas.
  - Cálculo de distância por geocodificação ou ajuste fino em KM.
- **Modalidade Flexível**: Escolha entre **Entrega (Delivery)** ou **Retirada no Balcão (Grátis)**.
- **Formas de Pagamento**: Pix, Cartão de Crédito, Cartão de Débito e Dinheiro (com campo de troco).
- **Checkout Inteligente no WhatsApp**: Gera uma mensagem completa, organizada e pronta para envio via link oficial `wa.me/5512981089788`.
- **Cardápio 100% Editável em JSON**: Os produtos e preços estão no arquivo local `src/data/menu.json`, facilitando qualquer alteração futura sem precisar mexer no código de componentes.

---

## 🛠️ Tecnologias Utilizadas

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide Icons**

---

## 📦 Como Rodar Localmente

1. Instalar as dependências:
```bash
npm install
```

2. Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```
O projeto estará rodando em `http://localhost:3000`.

3. Gerar a build de produção:
```bash
npm run build
```
A pasta `dist` será gerada pronta para publicação em qualquer hospedagem (Vercel, Netlify, GitHub Pages, etc.).

---

## 📝 Como Editar ou Adicionar Produtos

Basta abrir o arquivo:
`src/data/menu.json`

Você pode:
- Mudar preços, nomes e descrições dos hambúrgueres;
- Adicionar ou remover produtos;
- Atualizar adicionais e taxas;
- Alterar o horário de funcionamento ou WhatsApp.
