const API_BASE_URL = 'http://localhost:5000';

let despesas = [];
let editandoId = null;
let campoOrdenacao = 'titulo';
let direcaoOrdenacao = 'asc';

const despesaForm = document.getElementById('despesaForm');
const despesaId = document.getElementById('despesaId');
const tipoDespesa = document.getElementById('tipoDespesa');
const tituloDespesa = document.getElementById('tituloDespesa');
const valorDespesa = document.getElementById('valorDespesa');
const parcelasDespesa = document.getElementById('parcelasDespesa');
const diaVencimento = document.getElementById('diaVencimento');
const despesaPaga = document.getElementById('despesaPaga');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const despesasTableBody = document.getElementById('despesasTableBody');
const loadingMessage = document.getElementById('loadingMessage');
const emptyMessage = document.getElementById('emptyMessage');
const despesasList = document.getElementById('despesasList');
const filtrosOrdenacao = document.getElementById('filtrosOrdenacao');
const campoOrdenacaoSelect = document.getElementById('campoOrdenacao');
const btnCrescente = document.getElementById('btnCrescente');
const btnDecrescente = document.getElementById('btnDecrescente');
const btnLimparFiltros = document.getElementById('btnLimparFiltros');

document.addEventListener('DOMContentLoaded', function () {
  carregarDespesas();
  setupEventListeners();
  setupValorFormatting();
  
  btnCrescente.classList.add('active');
});

function setupEventListeners() {
  despesaForm.addEventListener('submit', handleFormSubmit);

  tipoDespesa.addEventListener('change', handleTipoChange);

  cancelBtn.addEventListener('click', cancelarEdicao);

  document.getElementById('confirmDeleteBtn').addEventListener('click', confirmarExclusao);

  diaVencimento.addEventListener('input', validarDiaVencimento);

  campoOrdenacaoSelect.addEventListener('change', handleCampoOrdenacaoChange);
  btnCrescente.addEventListener('click', () => setDirecaoOrdenacao('asc'));
  btnDecrescente.addEventListener('click', () => setDirecaoOrdenacao('desc'));
  btnLimparFiltros.addEventListener('click', limparFiltrosOrdenacao);
}

function setupValorFormatting() {
  valorDespesa.addEventListener('input', formatarValor);
  valorDespesa.addEventListener('blur', finalizarFormatacao);
}

function validarDiaVencimento(event) {
  let valor = event.target.value;

  valor = valor.replace(/\D/g, '');

  if (valor.length > 2) {
    valor = valor.substring(0, 2);
  }

  event.target.value = valor;

  event.target.classList.remove('is-invalid', 'is-valid');

  if (valor === '') {
    event.target.classList.remove('is-valid');
  } else {
    const dia = parseInt(valor);
    if (dia >= 1 && dia <= 31) {
      event.target.classList.add('is-valid');
      event.target.classList.remove('is-invalid');
    } else {
      event.target.classList.add('is-invalid');
      event.target.classList.remove('is-valid');
    }
  }
}

function formatarValor(event) {
  let valor = event.target.value;

  valor = valor.replace(/\D/g, '');

  if (valor === '') {
    event.target.value = '';
    return;
  }

  const valorNumerico = parseInt(valor) / 100;

  const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  event.target.value = valorFormatado;
}

function finalizarFormatacao(event) {
  let valor = event.target.value;

  if (valor === '') {
    return;
  }

  const valorNumerico = parseFloat(valor.replace(/\./g, '').replace(',', '.'));

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    event.target.value = '';
    return;
  }

  const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  event.target.value = valorFormatado;
}

function handleTipoChange() {
  const parcelasField = document.getElementById('parcelasDespesa');
  if (tipoDespesa.value === 'CRÉDITO PARCELADO') {
    parcelasField.disabled = false;
    parcelasField.required = true;
  } else {
    parcelasField.disabled = true;
    parcelasField.required = false;
    parcelasField.value = '';
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  if (!validarFormulario()) {
    return;
  }

  const formData = coletarDadosFormulario();

  try {
    if (editandoId) {
      await atualizarDespesa(editandoId, formData);
    } else {
      await adicionarDespesa(formData);
    }
  } catch (error) {
    mostrarNotificacao('Erro ao processar despesa', 'error');
    console.error('Erro:', error);
  }
}

function validarFormulario() {
  let valido = true;

  document.querySelectorAll('.form-control, .form-select').forEach((field) => {
    field.classList.remove('is-invalid');
  });

  if (!tipoDespesa.value) {
    tipoDespesa.classList.add('is-invalid');
    valido = false;
  }

  if (!tituloDespesa.value.trim()) {
    tituloDespesa.classList.add('is-invalid');
    valido = false;
  }

  const valorNumerico = parseFloat(valorDespesa.value.replace(/\./g, '').replace(',', '.'));
  if (!valorDespesa.value || isNaN(valorNumerico) || valorNumerico <= 0) {
    valorDespesa.classList.add('is-invalid');
    valido = false;
  }

  const diaVencimentoValor = parseInt(diaVencimento.value);
  if (
    !diaVencimento.value ||
    isNaN(diaVencimentoValor) ||
    diaVencimentoValor < 1 ||
    diaVencimentoValor > 31
  ) {
    diaVencimento.classList.add('is-invalid');
    valido = false;
  }

  if (
    tipoDespesa.value === 'CRÉDITO PARCELADO' &&
    (!parcelasDespesa.value || parseInt(parcelasDespesa.value) < 1)
  ) {
    parcelasDespesa.classList.add('is-invalid');
    valido = false;
  }

  return valido;
}

function coletarDadosFormulario() {
  const valorNumerico = parseFloat(valorDespesa.value.replace(/\./g, '').replace(',', '.'));

  return {
    tipo: tipoDespesa.value,
    titulo: tituloDespesa.value.trim(),
    valor: valorNumerico,
    dia_vencimento: parseInt(diaVencimento.value),
    parcelas: tipoDespesa.value === 'CRÉDITO PARCELADO' ? parseInt(parcelasDespesa.value) : null,
    paga: despesaPaga.checked,
  };
}

function limparFormulario() {
  despesaForm.reset();
  despesaId.value = '';
  editandoId = null;
  parcelasDespesa.disabled = true;
  parcelasDespesa.required = false;

  submitText.textContent = 'Adicionar Despesa';
  formTitle.innerHTML =
    '<i class="bi bi-plus-circle-fill me-2 text-primary"></i>Adicionar Despesa';
  cancelBtn.style.display = 'none';

  document.querySelectorAll('.form-control, .form-select').forEach((field) => {
    field.classList.remove('is-invalid', 'is-valid');
  });
}

function cancelarEdicao() {
  limparFormulario();
}

// ==================== OPERAÇÕES CRUD ====================

async function adicionarDespesa(dados) {
  try {
    const formData = new FormData();
    formData.append('tipo', dados.tipo);
    formData.append('titulo', dados.titulo);
    formData.append('valor', dados.valor);
    formData.append('dia_vencimento', dados.dia_vencimento);
    if (dados.parcelas !== null) {
      formData.append('parcelas', dados.parcelas);
    }
    formData.append('paga', dados.paga);

    const response = await fetch(`${API_BASE_URL}/despesa`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resultado = await response.json();
    mostrarNotificacao('Despesa adicionada com sucesso!', 'success');
    limparFormulario();
    await carregarDespesas();
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    throw error;
  }
}

async function carregarDespesas() {
  mostrarLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/despesas`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resultado = await response.json();
    despesas = resultado.despesas || [];
    renderizarDespesas();
  } catch (error) {
    console.error('Erro ao carregar despesas:', error);
    mostrarNotificacao('Erro ao carregar despesas', 'error');
  } finally {
    mostrarLoading(false);
  }
}

async function buscarDespesa(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/despesa?id=${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resultado = await response.json();
    return resultado;
  } catch (error) {
    console.error('Erro ao buscar despesa:', error);
    throw error;
  }
}

async function atualizarDespesa(id, dados) {
  try {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('tipo', dados.tipo);
    formData.append('titulo', dados.titulo);
    formData.append('valor', dados.valor);
    formData.append('dia_vencimento', dados.dia_vencimento);
    if (dados.parcelas !== null) {
      formData.append('parcelas', dados.parcelas);
    }
    formData.append('paga', dados.paga);

    const response = await fetch(`${API_BASE_URL}/despesa`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resultado = await response.json();
    mostrarNotificacao('Despesa atualizada com sucesso!', 'success');
    limparFormulario();
    await carregarDespesas();
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    throw error;
  }
}

async function excluirDespesa(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/despesa?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resultado = await response.json();
    mostrarNotificacao('Despesa excluída com sucesso!', 'success');
    await carregarDespesas();
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    mostrarNotificacao('Erro ao excluir despesa', 'error');
  }
}

// ==================== FUNÇÕES DE RENDERIZAÇÃO ====================

function renderizarDespesas() {
  if (despesas.length === 0) {
    mostrarListaVazia();
    return;
  }

  mostrarLista();
  despesasTableBody.innerHTML = '';

  const despesasOrdenadas = ordenarDespesas(despesas);

  despesasOrdenadas.forEach((despesa) => {
    const row = criarLinhaDespesa(despesa);
    despesasTableBody.appendChild(row);
  });

  calcularEExibirTotal();
}

function criarLinhaDespesa(despesa) {
  const row = document.createElement('tr');
  row.className = 'fade-in';

  const hoje = new Date();
  const diaHoje = hoje.getDate();
  const isVencimentoVencido = despesa.dia_vencimento < diaHoje && !despesa.paga;
  const isVencimentoHoje = despesa.dia_vencimento === diaHoje && !despesa.paga;

  let vencimentoHTML;
  if (isVencimentoVencido) {
    vencimentoHTML = `<span class="vencimento-vencido">Dia ${despesa.dia_vencimento} <i class="bi bi-exclamation-triangle-fill text-danger ms-1" title="Despesa vencida!"></i></span>`;
  } else if (isVencimentoHoje) {
    vencimentoHTML = `<span class="vencimento-hoje">Dia ${despesa.dia_vencimento} <i class="bi bi-exclamation-triangle-fill text-warning ms-1" title="Vence hoje!"></i></span>`;
  } else {
    vencimentoHTML = `Dia ${despesa.dia_vencimento}`;
  }

  row.innerHTML = `
        <td>${despesa.titulo}</td>
        <td>
            <span class="tipo-badge ${getTipoClass(despesa.tipo)}">
                ${despesa.tipo}
            </span>
        </td>
        <td>R$ ${parseFloat(despesa.valor).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</td>
        <td>${despesa.parcelas || '-'}</td>
        <td>${vencimentoHTML}</td>
        <td>
            <span class="status-badge ${despesa.paga ? 'status-paga' : 'status-pendente'}">
                ${despesa.paga ? 'PAGA' : 'PENDENTE'}
            </span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-outline-primary btn-sm action-btn edit" 
                        onclick="editarDespesa(${despesa.id})" 
                        title="Editar">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm action-btn delete" 
                        onclick="abrirModalExclusao(${despesa.id})" 
                        title="Excluir">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </div>
        </td>
    `;

  return row;
}

function getTipoClass(tipo) {
  const classes = {
    'CRÉDITO FIXO': 'tipo-credito-fixo',
    'CRÉDITO PARCELADO': 'tipo-credito-parcelado',
    PIX: 'tipo-pix',
    BOLETO: 'tipo-boleto',
  };
  return classes[tipo] || '';
}

// ==================== FUNÇÕES DE EDIÇÃO ====================

async function editarDespesa(id) {
  try {
    const despesa = await buscarDespesa(id);
    preencherFormularioEdicao(despesa);
  } catch (error) {
    console.error('Erro ao buscar despesa para edição:', error);
    mostrarNotificacao('Erro ao carregar dados da despesa', 'error');
  }
}

function preencherFormularioEdicao(despesa) {
  editandoId = despesa.id;
  despesaId.value = despesa.id;

  tipoDespesa.value = despesa.tipo;
  tituloDespesa.value = despesa.titulo;

  const valorFormatado = parseFloat(despesa.valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  valorDespesa.value = valorFormatado;

  diaVencimento.value = despesa.dia_vencimento;
  despesaPaga.checked = despesa.paga;

  if (despesa.tipo === 'CRÉDITO PARCELADO') {
    parcelasDespesa.disabled = false;
    parcelasDespesa.required = true;
    parcelasDespesa.value = despesa.parcelas || '';
  } else {
    parcelasDespesa.disabled = true;
    parcelasDespesa.required = false;
    parcelasDespesa.value = '';
  }

  submitText.textContent = 'Atualizar Despesa';
  formTitle.innerHTML =
    '<i class="bi bi-pencil-square me-2 text-primary"></i><span>Editar Despesa</span>';
  cancelBtn.style.display = 'inline-block';

  document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
}

// ==================== FUNÇÕES DE EXCLUSÃO ====================

function abrirModalExclusao(id) {
  const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
  document.getElementById('confirmDeleteBtn').onclick = () => {
    excluirDespesa(id);
    modal.hide();
  };
  modal.show();
}

// Confirmar exclusão (chamado pelo modal)
function confirmarExclusao() {
  // Esta função é chamada pelo modal
  // A lógica real está em abrirModalExclusao
}

// ==================== FUNÇÕES AUXILIARES ====================

function mostrarLoading(mostrar) {
  if (mostrar) {
    loadingMessage.style.display = 'block';
    despesasList.style.display = 'none';
    emptyMessage.style.display = 'none';
  } else {
    loadingMessage.style.display = 'none';
  }
}

function mostrarListaVazia() {
  despesasList.style.display = 'none';
  emptyMessage.style.display = 'block';
  document.getElementById('totalDespesas').style.display = 'none';
  filtrosOrdenacao.style.display = 'none';
}

function mostrarLista() {
  despesasList.style.display = 'block';
  emptyMessage.style.display = 'none';
  mostrarFiltrosOrdenacao();
}

function calcularEExibirTotal() {
  const totalDespesasElement = document.getElementById('totalDespesas');
  const totalValorElement = document.querySelector('.total-valor');

  if (despesas.length === 0) {
    totalDespesasElement.style.display = 'none';
    return;
  }

  const total = despesas.reduce((soma, despesa) => {
    return soma + parseFloat(despesa.valor);
  }, 0);

  const totalFormatado = total.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  totalValorElement.textContent = `R$ ${totalFormatado}`;
  totalDespesasElement.style.display = 'block';
}

function mostrarNotificacao(mensagem, tipo = 'info') {
  const toast = document.getElementById('notificationToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  toastTitle.textContent =
    tipo === 'success' ? 'Sucesso' : tipo === 'error' ? 'Erro' : 'Informação';
  toastMessage.textContent = mensagem;

  if (tipo === 'success') {
    toastIcon.className = 'bi bi-check-circle-fill me-2 text-success';
  } else if (tipo === 'error') {
    toastIcon.className = 'bi bi-x-circle-fill me-2 text-danger';
  } else {
    toastIcon.className = 'bi bi-info-circle-fill me-2 text-info';
  }

  toast.className = `toast ${
    tipo === 'success'
      ? 'bg-success text-white'
      : tipo === 'error'
      ? 'bg-danger text-white'
      : 'bg-info text-white'
  }`;

  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
}

// ==================== FUNÇÕES DE UTILIDADE ====================

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

async function verificarAPI() {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

function recarregarDados() {
  carregarDespesas();
}

// ==================== FUNÇÕES DE ORDENAÇÃO ====================

function handleCampoOrdenacaoChange() {
  campoOrdenacao = campoOrdenacaoSelect.value;
  renderizarDespesas();
}

function setDirecaoOrdenacao(direcao) {
  direcaoOrdenacao = direcao;
  
  btnCrescente.classList.toggle('active', direcao === 'asc');
  btnDecrescente.classList.toggle('active', direcao === 'desc');
  
  renderizarDespesas();
}

function limparFiltrosOrdenacao() {
  campoOrdenacao = 'titulo';
  direcaoOrdenacao = 'asc';
  
  campoOrdenacaoSelect.value = 'titulo';
  btnCrescente.classList.remove('active');
  btnDecrescente.classList.remove('active');
  
  renderizarDespesas();
}

function ordenarDespesas(despesasArray) {
  return [...despesasArray].sort((a, b) => {
    let valorA, valorB;
    
    switch (campoOrdenacao) {
      case 'titulo':
        valorA = a.titulo.toLowerCase();
        valorB = b.titulo.toLowerCase();
        break;
      case 'tipo':
        valorA = a.tipo.toLowerCase();
        valorB = b.tipo.toLowerCase();
        break;
      case 'valor':
        valorA = parseFloat(a.valor);
        valorB = parseFloat(b.valor);
        break;
      case 'parcelas':
        valorA = a.parcelas || 0;
        valorB = b.parcelas || 0;
        break;
      case 'dia_vencimento':
        valorA = parseInt(a.dia_vencimento);
        valorB = parseInt(b.dia_vencimento);
        break;
      case 'paga':
        valorA = a.paga ? 1 : 0;
        valorB = b.paga ? 1 : 0;
        break;
      default:
        valorA = a.titulo.toLowerCase();
        valorB = b.titulo.toLowerCase();
    }
    
    if (direcaoOrdenacao === 'asc') {
      return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
    } else {
      return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
    }
  });
}

function mostrarFiltrosOrdenacao() {
  if (despesas.length > 0) {
    filtrosOrdenacao.style.display = 'block';
  } else {
    filtrosOrdenacao.style.display = 'none';
  }
}
