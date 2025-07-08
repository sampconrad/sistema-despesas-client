# Sistema de Despesas Mensais - Frontend
![image](https://github.com/user-attachments/assets/48462eb1-4081-426d-91cd-3f5a79f17d83)

## Antes de tudo

**📁 [Repositório com PyInstaller configurado](https://github.com/sampconrad/sistema-despesas)** - este link lhe levará para o monorepo com build automatizado, onde a aplicação é compilada em um único arquivo .exe para facilitar a utilização do sistema.

## Descrição

Interface web desenvolvida em HTML, CSS e JavaScript para gerenciamento de despesas mensais. Esta aplicação permite cadastrar, visualizar, editar e excluir despesas através de uma interface moderna, responsiva e intuitiva.

O frontend se comunica com a API backend para realizar todas as operações CRUD, oferecendo uma experiência de usuário fluida com validações em tempo real, formatação automática dos campos e feedback visual imediato.

## Funcionalidades

- **Operações CRUD completas**: Create, Read, Update, Delete
- **Tipos de despesa**: Selecione entre CRÉDITO FIXO, CRÉDITO PARCELADO, PIX, BOLETO
- **Controle de parcelas**: Acompanhe a condição do parcelamento da Despesa
- **Status de pagamento**: Sinalação de despesas pagas/pendentes
- **Dia de vencimento**: Indique apenas o dia do mês (1-31) no qual a despesa vence
- **Validação em tempo real**: Feedback visual para campos obrigatórios e inválidos
- **Interface responsiva**: Funciona perfeitamente em desktop, tablet e mobile
- **Feedback instantâneo**: Sistema de feedback ao usuário através de toasts e modais
- **Design moderno**: Interface limpa e profissional com Bootstrap 5

## Tecnologias Utilizadas

- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **Bootstrap 5**

## Estrutura do Projeto

```
sistema-despesas-client/
├── index.html          # Página principal
├── styles.css          # Estilos personalizados
├── scripts.js          # Lógica JavaScript
├── README.md           # Este arquivo
└── img/                # Imagens
    └── money.png       # Ícone do sistema
```

## API Endpoints Utilizados

| Método | Endpoint             | Descrição                   |
|--------|----------------------|-----------------------------|
| POST   | `/despesa`           | Criar nova despesa          |
| GET    | `/despesas`          | Listar todas as despesas    |
| GET    | `/despesa?id={id}`   | Buscar despesa por ID       |
| PUT    | `/despesa`           | Atualizar despesa existente |
| DELETE | `/despesa?id={id}`   | Excluir despesa             |

## Instalação

### Pré-requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- API backend rodando em `http://localhost:5000`
- A API pode ser encontrada em https://github.com/sampconrad/sistema-despesas-api

### Passos para Instalação

1. **Clone o repositório** (se aplicável):
   ```bash
   git clone https://github.com/sampconrad/sistema-despesas-client.git
   ```

2. **Levante a API**:
   - Certifique-se de que a API backend está rodando em `http://localhost:5000`
   - Caso levante a API em outra porta, altere a URL da API no arquivo `scripts.js`

3. **Execute a aplicação**:
   - Navegue para `sistema-despesas-client/index.html` e abra-o no navegador.

## Troubleshooting

### Problemas Comuns

1. **Erro de CORS**: Certifique-se de que a API está rodando e configurada para CORS
2. **Erro 422**: Verifique se está enviando FormData (não JSON)
3. **Formatação de moeda**: Certifique-se de que o navegador suporta Intl.NumberFormat

### Debug

Para debug, abra o console do navegador (F12) e verifique:

```javascript
// Verificar se a API está acessível
fetch('http://localhost:5000/despesas')
    .then(response => console.log('API Status:', response.status))
    .catch(error => console.error('Erro API:', error));
```

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
