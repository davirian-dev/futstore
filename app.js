// FUTSTORE BRASIL - LÓGICA DO FRONTEND DE ALTA CONVERSÃO

let catalogo = [];
let produtoSelecionado = null;
let versaoSelecionada = 'torcedor'; // 'torcedor' (+0) ou 'jogador' (+20)
let tamanhoSelecionado = 'G';
let carrinho = [];
let cupomAplicado = null;

const META_FRETE_GRATIS = 299.00;
const CUPONS_VALIDOS = {
    "DAVI10": { descontoPct: 10, socio: "Davi" },
    "RUAN10": { descontoPct: 10, socio: "Ruan" },
    "GUILHERME10": { descontoPct: 10, socio: "Guilherme" },
    "FUT10": { descontoPct: 10, socio: "Geral" }
};

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    carregarCarrinhoStorage();
    atualizarBadgeCarrinho();
    lucide.createIcons();
    iniciarProvaSocialAoVivo();
});

// 1. CARREGAR PRODUTOS DO JSON
async function carregarProdutos() {
    try {
        const res = await fetch("produtos.json");
        catalogo = await res.json();
        renderizarProdutos(catalogo);
        document.getElementById("contador-produtos-vitrine").innerText = `${catalogo.length} mantos disponíveis para pronta entrega & encomenda`;
    } catch (e) {
        console.error("Erro ao carregar catálogo:", e);
        document.getElementById("contador-produtos-vitrine").innerText = "Erro ao carregar catálogo.";
    }
}

// 2. RENDERIZAR VITRINE
function renderizarProdutos(lista) {
    const grid = document.getElementById("grid-produtos");
    grid.innerHTML = "";

    if (lista.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">Nenhum manto encontrado com esse filtro.</div>`;
        return;
    }

    lista.forEach(p => {
        const card = document.createElement("div");
        card.className = "bg-pitch-800 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between group shadow-lg";

        const precoPix = (p.preco * 0.95).toFixed(2).replace('.', ',');
        const precoParcela = (p.preco / 12).toFixed(2).replace('.', ',');

        card.innerHTML = `
            <div class="relative overflow-hidden aspect-square bg-black/40 cursor-pointer" onclick="abrirModalProduto('${p.id}')">
                <img src="${p.imagem}" alt="${p.nome}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=700&q=80';" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-white/10">
                    ${p.tag}
                </span>
                ${p.pronta_entrega ? `
                    <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider">
                        Pronta Entrega
                    </span>
                ` : `
                    <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider">
                        Sob Encomenda
                    </span>
                `}
            </div>

            <div class="p-3.5 sm:p-4 flex flex-col justify-between flex-1 space-y-3">
                <div>
                    <span class="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">${p.time}</span>
                    <h3 class="text-xs sm:text-sm font-bold text-white line-clamp-2 hover:text-emerald-400 transition-colors cursor-pointer" onclick="abrirModalProduto('${p.id}')">
                        ${p.nome}
                    </h3>
                </div>

                <div class="pt-2 border-t border-white/5">
                    <div class="flex items-baseline gap-2">
                        <span class="text-xs line-through text-slate-500 font-mono">R$ ${p.preco_antigo.toFixed(2).replace('.', ',')}</span>
                        <span class="text-base sm:text-lg font-heading font-black text-emerald-400">R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="text-[10px] text-slate-300 font-medium">
                        R$ ${precoPix} à vista no <strong class="text-emerald-400">Pix</strong> ou 12x de R$ ${precoParcela}
                    </div>
                </div>

                <div class="flex gap-2 pt-1">
                    <button onclick="abrirModalProduto('${p.id}')" class="flex-1 py-2 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-black text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                        <i data-lucide="eye" class="w-3.5 h-3.5"></i> Ver Manto
                    </button>
                    <button onclick="adicionarDiretoRapido('${p.id}')" class="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all" title="Adicionar ao Carrinho">
                        <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    lucide.createIcons();
}

// 3. FILTRO POR CATEGORIA
function filtrarCategoria(cat) {
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("text-emerald-400"));
    const active = document.getElementById(`nav-cat-${cat}`);
    if (active) active.classList.add("text-emerald-400");

    const titulos = {
        'todos': 'Mantos Mais Vendidos',
        'brasileiros': 'Times Brasileiros (Série A & B)',
        'europeus': 'Times Europeus (Champions & Ligas)',
        'selecoes': 'Seleções Nacionais',
        'retro': 'Mantos Retrô & Históricos',
        'infantil_feminina': 'Linha Feminina & Infantil',
        'agasalhos': 'Agasalhos & Jaquetas Corta-Vento'
    };

    document.getElementById("titulo-vitrine").innerText = titulos[cat] || 'Catálogo de Mantos';

    if (cat === 'todos') {
        renderizarProdutos(catalogo);
    } else {
        const filtrados = catalogo.filter(p => p.categoria === cat);
        renderizarProdutos(filtrados);
    }

    const vitrineEl = document.getElementById("vitrine");
    if (vitrineEl) vitrineEl.scrollIntoView({ behavior: "smooth" });
}

// 4. FILTRO RÁPIDO PELO ESCUDO DO TIME
function buscarPorTime(time) {
    const filtrados = catalogo.filter(p => p.time.toLowerCase().includes(time.toLowerCase()) || p.nome.toLowerCase().includes(time.toLowerCase()));
    document.getElementById("titulo-vitrine").innerText = `Mantos do ${time}`;
    renderizarProdutos(filtrados);
    document.getElementById("vitrine").scrollIntoView({ behavior: "smooth" });
}

// 5. BARRA DE BUSCA INTELIGENTE HEADER (DROPDOWN EM TEMPO REAL)
function buscarProdutos(termo) {
    const q = termo.trim().toLowerCase();
    const dropdown = document.getElementById("dropdown-busca");
    const btnLimpar = document.getElementById("btn-limpar-busca");

    if (!q) {
        dropdown.classList.add("hidden");
        dropdown.innerHTML = "";
        if (btnLimpar) btnLimpar.classList.add("hidden");
        return;
    }

    if (btnLimpar) btnLimpar.classList.remove("hidden");

    const resultados = catalogo.filter(p => 
        p.nome.toLowerCase().includes(q) || 
        p.time.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        p.descricao.toLowerCase().includes(q)
    );

    dropdown.classList.remove("hidden");

    if (resultados.length === 0) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "p-4 text-center text-xs text-slate-400";
        emptyDiv.textContent = `Nenhum manto encontrado para "${termo}". Tente "Flamengo", "Real", "2002"...`;
        dropdown.innerHTML = "";
        dropdown.appendChild(emptyDiv);
        return;
    }

    dropdown.innerHTML = `
        <div class="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">Resultados (${resultados.length}):</div>
        ${resultados.slice(0, 5).map(p => `
            <div onclick="abrirModalProduto('${p.id}'); fecharDropdownBusca();" class="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                <img src="${p.imagem}" class="w-10 h-10 object-cover rounded-lg border border-white/10">
                <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold text-white truncate">${p.nome}</div>
                    <div class="text-[10px] text-emerald-400 font-mono">R$ ${p.preco.toFixed(2).replace('.', ',')} • ${p.time}</div>
                </div>
                <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500"></i>
            </div>
        `).join('')}
    `;
    lucide.createIcons();
}

function fecharDropdownBusca() {
    const d = document.getElementById("dropdown-busca");
    if (d) d.classList.add("hidden");
}

function limparBusca() {
    const inp = document.getElementById("input-busca-header");
    if (inp) inp.value = "";
    fecharDropdownBusca();
    const btnLimpar = document.getElementById("btn-limpar-busca");
    if (btnLimpar) btnLimpar.classList.add("hidden");
    renderizarProdutos(catalogo);
}

// 6. MODAL DO PRODUTO (ONDE A VENDA ACONTECE)
function abrirModalProduto(id) {
    const p = catalogo.find(item => item.id === id);
    if (!p) return;

    produtoSelecionado = p;
    versaoSelecionada = 'torcedor';
    tamanhoSelecionado = 'G';

    // Imagem e Tag
    document.getElementById("modal-prod-img").src = p.imagem;
    document.getElementById("modal-prod-tag").innerText = p.tag;
    document.getElementById("modal-prod-nome").innerText = p.nome;

    // Preços
    atualizarPrecoModal();

    // Prazo
    const prazoTag = document.getElementById("modal-prod-prazo-tag");
    if (p.pronta_entrega) {
        prazoTag.className = "font-bold text-emerald-400";
        prazoTag.innerText = "Pronta Entrega (Envio em 24h)";
    } else {
        prazoTag.className = "font-bold text-amber-400";
        prazoTag.innerText = "Sob Encomenda (10 a 15 dias úteis)";
    }

    // Resetar campos de personalização
    const checkPers = document.getElementById("check-personalizar");
    if (checkPers) checkPers.checked = false;
    document.getElementById("campos-personalizacao").classList.add("hidden");
    document.getElementById("input-personaliza-nome").value = "";
    document.getElementById("input-personaliza-num").value = "";
    document.getElementById("select-patch").value = "sem_patch";

    // Resetar botões de versão e tamanho
    selecionarVersao('torcedor');
    selecionarTamanho('G');

    // Limpar cálculo frete
    document.getElementById("resultado-frete-rapido").classList.add("hidden");
    document.getElementById("input-calc-cep").value = "";

    document.getElementById("modal-produto").classList.remove("hidden");
    lucide.createIcons();
}

function fecharModalProduto() {
    document.getElementById("modal-produto").classList.add("hidden");
}

function selecionarVersao(versao) {
    versaoSelecionada = versao;
    const btnTorcedor = document.getElementById("btn-versao-torcedor");
    const btnJogador = document.getElementById("btn-versao-jogador");
    const labelInfo = document.getElementById("label-versao-info");

    if (versao === 'torcedor') {
        btnTorcedor.className = "p-2.5 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-400 text-xs font-bold text-left transition-all";
        btnJogador.className = "p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-xs font-bold text-left hover:border-white/30 transition-all";
        labelInfo.innerText = "Torcedor (Escudo Bordado Tradicional)";
    } else {
        btnJogador.className = "p-2.5 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-400 text-xs font-bold text-left transition-all";
        btnTorcedor.className = "p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-xs font-bold text-left hover:border-white/30 transition-all";
        labelInfo.innerText = "Jogador (+R$ 20, Tecido Respirável Slim)";
    }
    atualizarPrecoModal();
}

function selecionarTamanho(tam) {
    tamanhoSelecionado = tam;
    document.querySelectorAll(".tam-btn").forEach(btn => {
        if (btn.innerText === tam) {
            btn.className = "tam-btn py-2.5 rounded-xl bg-emerald-500 text-black border border-emerald-400 font-black text-xs shadow-md";
        } else {
            btn.className = "tam-btn py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-xs text-slate-300";
        }
    });
}

function togglePersonalizacao() {
    const checked = document.getElementById("check-personalizar").checked;
    const campos = document.getElementById("campos-personalizacao");
    if (checked) {
        campos.classList.remove("hidden");
    } else {
        campos.classList.add("hidden");
    }
    atualizarPrecoModal();
}

function atualizarPrecoModal() {
    if (!produtoSelecionado) return;
    let base = produtoSelecionado.preco;
    if (versaoSelecionada === 'jogador') base += 20.00;

    const checkPers = document.getElementById("check-personalizar");
    if (checkPers && checkPers.checked) base += 25.00;

    const selectPatch = document.getElementById("select-patch");
    if (selectPatch && selectPatch.value !== 'sem_patch') base += 15.00;

    document.getElementById("modal-prod-preco").innerText = `R$ ${base.toFixed(2).replace('.', ',')}`;
    document.getElementById("modal-prod-preco-antigo").innerText = `R$ ${(base * 1.9).toFixed(2).replace('.', ',')}`;
}

// CÁLCULO DE FRETE RÁPIDO
function calcularFreteRapido() {
    const cep = document.getElementById("input-calc-cep").value.replace(/\D/g, '');
    const resDiv = document.getElementById("resultado-frete-rapido");

    if (cep.length !== 8) {
        resDiv.classList.remove("hidden");
        resDiv.className = "text-[11px] p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20";
        resDiv.innerText = "Digite um CEP válido com 8 dígitos.";
        return;
    }

    resDiv.classList.remove("hidden");
    resDiv.className = "text-[11px] p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 space-y-1";
    resDiv.innerHTML = `
        <div class="font-bold">✓ Opções de Entrega para o CEP ${cep.slice(0,5)}-${cep.slice(5)}:</div>
        <div>• <strong>SEDEX / Envio Expresso:</strong> 2 a 5 dias úteis (R$ 18,90)</div>
        <div>• <strong>PAC Econômico:</strong> 6 a 10 dias úteis (<span class="text-white font-bold">Grátis acima de R$ 299</span>)</div>
    `;
}

// 7. CARRINHO DE COMPRAS
function carregarCarrinhoStorage() {
    const local = localStorage.getItem("futstore_carrinho");
    if (local) {
        try {
            carrinho = JSON.parse(local);
        } catch(e) {
            carrinho = [];
        }
    }
}

function salvarCarrinhoStorage() {
    localStorage.setItem("futstore_carrinho", JSON.stringify(carrinho));
    atualizarBadgeCarrinho();
}

function atualizarBadgeCarrinho() {
    const totalItens = carrinho.reduce((acc, it) => acc + it.qtd, 0);
    const badge = document.getElementById("badge-carrinho");
    if (badge) badge.innerText = totalItens;
}

function adicionarDiretoRapido(id) {
    const p = catalogo.find(item => item.id === id);
    if (!p) return;

    carrinho.push({
        id: p.id,
        nome: p.nome,
        time: p.time,
        preco: p.preco,
        imagem: p.imagem,
        versao: 'torcedor',
        tamanho: 'G',
        personalizado: false,
        estampa: null,
        qtd: 1
    });

    salvarCarrinhoStorage();
    abrirModalCarrinho();
}

function adicionarAoCarrinhoModal() {
    if (!produtoSelecionado) return;

    let precoFinal = produtoSelecionado.preco;
    if (versaoSelecionada === 'jogador') precoFinal += 20.00;

    const checkPers = document.getElementById("check-personalizar").checked;
    let estampaObj = null;

    if (checkPers) {
        precoFinal += 25.00;
        const nome = document.getElementById("input-personaliza-nome").value.trim().toUpperCase() || "CAMISA 10";
        const numero = document.getElementById("input-personaliza-num").value.trim() || "10";
        const patchVal = document.getElementById("select-patch").value;
        let patchTxt = "Sem Patch";

        if (patchVal !== 'sem_patch') {
            precoFinal += 15.00;
            const patchesNomes = {
                'champions': 'Patch Champions League',
                'libertadores': 'Patch Libertadores',
                'brasileirao': 'Patch Brasileirão',
                'copa_mundo': 'Patch Copa do Mundo'
            };
            patchTxt = patchesNomes[patchVal] || 'Patch Oficial';
        }

        estampaObj = { nome, numero, patch: patchTxt };
    }

    carrinho.push({
        id: produtoSelecionado.id,
        nome: produtoSelecionado.nome,
        time: produtoSelecionado.time,
        preco: precoFinal,
        imagem: produtoSelecionado.imagem,
        versao: versaoSelecionada,
        tamanho: tamanhoSelecionado,
        personalizado: checkPers,
        estampa: estampaObj,
        qtd: 1
    });

    salvarCarrinhoStorage();
    fecharModalProduto();
    abrirModalCarrinho();
}

function abrirModalCarrinho() {
    renderizarCarrinhoItens();
    document.getElementById("modal-carrinho").classList.remove("hidden");
    lucide.createIcons();
}

function fecharModalCarrinho() {
    document.getElementById("modal-carrinho").classList.add("hidden");
}

function renderizarCarrinhoItens() {
    const listaDiv = document.getElementById("carrinho-itens-lista");
    listaDiv.innerHTML = "";

    if (carrinho.length === 0) {
        listaDiv.innerHTML = `
            <div class="py-12 text-center text-slate-400 space-y-2">
                <i data-lucide="shopping-bag" class="w-10 h-10 mx-auto opacity-30"></i>
                <div class="text-xs">Seu carrinho está vazio.</div>
                <button onclick="fecharModalCarrinho()" class="text-xs text-emerald-400 font-bold underline">Escolher um Manto</button>
            </div>
        `;
        atualizarTotaisCarrinho(0);
        return;
    }

    let subtotal = 0;

    carrinho.forEach((it, idx) => {
        subtotal += (it.preco * it.qtd);
        const itemEl = document.createElement("div");
        itemEl.className = "flex items-start gap-3 p-3 rounded-2xl bg-pitch-900 border border-white/5";

        const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const detalhesEstampa = it.personalizado ? `
            <div class="text-[10px] text-purple-300 font-mono mt-0.5">
                Silk: <strong>${esc(it.estampa.nome)} #${esc(it.estampa.numero)}</strong> • ${esc(it.estampa.patch)}
            </div>
        ` : `<div class="text-[10px] text-slate-500">Sem personalização (lisa)</div>`;

        itemEl.innerHTML = `
            <img src="${it.imagem}" class="w-14 h-14 object-cover rounded-xl border border-white/10 shrink-0">
            <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-white truncate">${it.nome}</div>
                <div class="text-[11px] text-slate-400">
                    Tam: <strong class="text-white">${it.tamanho}</strong> | Versão: <strong class="text-white capitalize">${it.versao}</strong>
                </div>
                ${detalhesEstampa}
                <div class="text-xs font-heading font-black text-emerald-400 mt-1">
                    R$ ${(it.preco * it.qtd).toFixed(2).replace('.', ',')}
                </div>
            </div>
            <button onclick="removerItemCarrinho(${idx})" class="p-1 text-slate-500 hover:text-red-400 transition-colors">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        `;
        listaDiv.appendChild(itemEl);
    });

    atualizarTotaisCarrinho(subtotal);
    lucide.createIcons();
}

function removerItemCarrinho(index) {
    carrinho.splice(index, 1);
    salvarCarrinhoStorage();
    renderizarCarrinhoItens();
}

function atualizarTotaisCarrinho(subtotal) {
    let desconto = 0;
    if (cupomAplicado) {
        desconto = subtotal * (cupomAplicado.descontoPct / 100);
    }
    const comDesconto = Math.max(0, subtotal - desconto);
    const descontoPixExtra = comDesconto * 0.05; // 5% de desconto no Pix
    const totalFinalPix = comDesconto - descontoPixExtra;

    document.getElementById("carrinho-subtotal").innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById("carrinho-desconto").innerText = `- R$ ${(desconto + descontoPixExtra).toFixed(2).replace('.', ',')}`;
    document.getElementById("carrinho-total").innerText = `R$ ${totalFinalPix.toFixed(2).replace('.', ',')}`;

    // Barra de Frete Grátis
    const falta = META_FRETE_GRATIS - subtotal;
    const barra = document.getElementById("barra-progresso-frete");
    const txt = document.getElementById("txt-progresso-frete");

    if (falta <= 0 && subtotal > 0) {
        barra.style.width = "100%";
        txt.innerHTML = "🎉 <strong class='text-emerald-400'>Parabéns! Você ganhou Frete Grátis!</strong>";
    } else {
        const pct = Math.min(100, Math.round((subtotal / META_FRETE_GRATIS) * 100));
        barra.style.width = `${pct}%`;
        txt.innerHTML = `Falta <strong class="text-emerald-400">R$ ${Math.max(0, falta).toFixed(2).replace('.', ',')}</strong> para Frete Grátis!`;
    }
}

// 8. CUPONS DE DESCONTO DOS SÓCIOS
function aplicarCupomCarrinho() {
    const input = document.getElementById("input-cupom-carrinho");
    const codigo = input.value.trim().toUpperCase();
    const statusDiv = document.getElementById("msg-cupom-status");

    if (CUPONS_VALIDOS[codigo]) {
        cupomAplicado = { codigo, ...CUPONS_VALIDOS[codigo] };
        statusDiv.classList.remove("hidden");
        statusDiv.className = "text-[11px] text-emerald-400 font-bold";
        statusDiv.innerText = `✓ Cupom ${codigo} aplicado (10% de desconto pelo sócio ${cupomAplicado.socio})!`;
    } else {
        cupomAplicado = null;
        statusDiv.classList.remove("hidden");
        statusDiv.className = "text-[11px] text-red-400 font-bold";
        statusDiv.innerText = "Cupom inválido. Tente DAVI10, RUAN10 ou GUILHERME10.";
    }

    renderizarCarrinhoItens();
}

// 9. CHECKOUT INTELIGENTE (COLETA DADOS ESSENCIAIS E GERA NO PAINEL)
let pedidoAtualGerado = null;

function iniciarCheckoutDireto(modo) {
    if (carrinho.length === 0) {
        alert("Adicione pelo menos um manto ao carrinho para continuar.");
        return;
    }

    const subtotal = carrinho.reduce((acc, it) => acc + (it.preco * it.qtd), 0);
    const desconto = cupomAplicado ? subtotal * (cupomAplicado.descontoPct / 100) : 0;
    const totalPix = (subtotal - desconto) * 0.95;

    if (modo === 'pix') {
        document.getElementById("btn-total-pix-dados").innerText = `R$ ${totalPix.toFixed(2).replace('.', ',')}`;
        document.getElementById("checkout-etapa-dados").classList.remove("hidden");
        document.getElementById("checkout-etapa-qrcode").classList.add("hidden");

        fecharModalCarrinho();
        document.getElementById("modal-checkout-pix").classList.remove("hidden");
        lucide.createIcons();
    } else {
        // Envio estruturado via WhatsApp
        let resumo = "🏆 *NOVO PEDIDO FUTSTORE BRASIL* 🏆\n\n";
        carrinho.forEach((it, idx) => {
            resumo += `*Manto ${idx + 1}:* ${it.nome}\n`;
            resumo += `• Tamanho: ${it.tamanho} | Versão: ${it.versao}\n`;
            if (it.personalizado) {
                resumo += `• Silk: ${it.estampa.nome} #${it.estampa.numero} (${it.estampa.patch})\n`;
            }
            resumo += `• Valor: R$ ${(it.preco * it.qtd).toFixed(2).replace('.', ',')}\n\n`;
        });

        if (cupomAplicado) {
            resumo += `🎟️ *Cupom Aplicado:* ${cupomAplicado.codigo} (${cupomAplicado.socio})\n`;
        }
        resumo += `💰 *Total com Desconto Pix:* R$ ${totalPix.toFixed(2).replace('.', ',')}\n\n`;
        resumo += `Gostaria de informar meus dados de entrega e tirar dúvidas de medidas!`;

        const zapUrl = `https://wa.me/5571988887777?text=${encodeURIComponent(resumo)}`;
        window.open(zapUrl, '_blank');
    }
}

function gerarPixComDados() {
    const nome = document.getElementById("chk-nome").value.trim();
    const whatsapp = document.getElementById("chk-whatsapp").value.trim().replace(/\D/g, '');
    const cpf = document.getElementById("chk-cpf").value.trim();
    const cep = document.getElementById("chk-cep").value.trim();
    const endereco = document.getElementById("chk-endereco").value.trim();

    if (!nome || !whatsapp || !cpf || !endereco) {
        alert("Por favor, preencha todos os campos obrigatórios para o envio.");
        return;
    }

    const subtotal = carrinho.reduce((acc, it) => acc + (it.preco * it.qtd), 0);
    const desconto = cupomAplicado ? subtotal * (cupomAplicado.descontoPct / 100) : 0;
    const totalPix = (subtotal - desconto) * 0.95;

    // Gerar código único de pedido
    const numRandom = Math.floor(1046 + Math.random() * 900);
    const idPedido = `FUT-${numRandom}`;

    // Identificar sócio do cupom
    const socioResponsavel = cupomAplicado ? cupomAplicado.socio : "Davi";
    const cupomCodigo = cupomAplicado ? cupomAplicado.codigo : "SITE_DIRETO";

    const primeiroItem = carrinho[0];
    const novoPedido = {
        id: idPedido,
        cliente: nome,
        whatsapp: whatsapp.startsWith('55') ? whatsapp : `55${whatsapp}`,
        cpf: cpf,
        cep: cep,
        endereco: endereco,
        data: new Date().toISOString().replace('T', ' ').slice(0, 16),
        periodo: "hoje",
        item: carrinho.map(c => c.nome).join(', '),
        tamanho: primeiroItem.tamanho,
        personalizado: primeiroItem.personalizado,
        estampa: primeiroItem.estampa,
        valor: totalPix,
        cmv: totalPix * 0.48, // Custo aproximado de fabricação/peça
        taxas: 3.50,
        pagamento: "Pix",
        status: "Pago (Aguardando Separação)",
        tipo_op: primeiroItem.personalizado ? "personalizacao" : "pago_separacao",
        canal: "Site",
        socio: socioResponsavel,
        cupom: cupomCodigo
    };

    pedidoAtualGerado = novoPedido;

    // Gravar diretamente no banco de pedidos dos sócios
    salvarNovoPedidoNoPainel(novoPedido);

    // Exibir QR Code
    document.getElementById("chk-codigo-gerado").innerText = `#${idPedido}`;
    document.getElementById("pix-valor-final").innerText = `R$ ${totalPix.toFixed(2).replace('.', ',')}`;

    const pixPayload = `00020126580014br.gov.bcb.pix0136futstore.brasil.financeiro@gmail.com520400005303986540${totalPix.toFixed(2)}5802BR5915FUTSTORE BRASIL6008SALVADOR62070503***6304`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`;
    document.getElementById("pix-qrcode-img").src = qrUrl;

    document.getElementById("checkout-etapa-dados").classList.add("hidden");
    document.getElementById("checkout-etapa-qrcode").classList.remove("hidden");
    lucide.createIcons();

    // Limpar carrinho
    carrinho = [];
    salvarCarrinhoStorage();
}

function salvarNovoPedidoNoPainel(pedido) {
    let pedidosAtuais = [];
    const local = localStorage.getItem("futstore_pedidos_admin");
    if (local) {
        try {
            pedidosAtuais = JSON.parse(local);
        } catch(e) {
            pedidosAtuais = [];
        }
    }
    // Adiciona no topo local
    pedidosAtuais.unshift(pedido);
    localStorage.setItem("futstore_pedidos_admin", JSON.stringify(pedidosAtuais));

    // Sincroniza em tempo real no Cloud Firestore
    if (window.futstoreDb) {
        window.futstoreDb.collection("futstore_pedidos").doc(pedido.id).set(pedido)
            .then(() => console.log("✅ [Firebase] Pedido salvo na nuvem com sucesso:", pedido.id))
            .catch(err => console.error("⚠️ [Firebase] Erro ao sincronizar pedido:", err));
    }
}

function enviarComprovanteZap() {
    if (!pedidoAtualGerado) return;
    const msg = `Olá, Davi/Ruan/Guilherme! Acabei de realizar o pagamento Pix do pedido #${pedidoAtualGerado.id} no valor de R$ ${pedidoAtualGerado.valor.toFixed(2).replace('.', ',')}!\n\nCliente: ${pedidoAtualGerado.cliente}\nWhatsApp: ${pedidoAtualGerado.whatsapp}\nEndereço: ${pedidoAtualGerado.endereco} (CEP: ${pedidoAtualGerado.cep})\n\nSegue o comprovante em anexo!`;
    window.open(`https://wa.me/5571988887777?text=${encodeURIComponent(msg)}`, '_blank');
}

function fecharModalPix() {
    document.getElementById("modal-checkout-pix").classList.add("hidden");
}

function copiarPixChave() {
    const chave = "futstore.brasil.financeiro@gmail.com";
    navigator.clipboard.writeText(chave).then(() => {
        document.getElementById("pix-copiado-sucesso").classList.remove("hidden");
        setTimeout(() => {
            const el = document.getElementById("pix-copiado-sucesso");
            if (el) el.classList.add("hidden");
        }, 4000);
    });
}

function comprarViaWhatsAppDireto() {
    if (!produtoSelecionado) return;
    const checkPers = document.getElementById("check-personalizar").checked;
    let msg = `Olá! Gostaria de comprar o seguinte manto:\n\n*${produtoSelecionado.nome}*\n• Tamanho: ${tamanhoSelecionado}\n• Versão: ${versaoSelecionada}\n`;

    if (checkPers) {
        const nome = document.getElementById("input-personaliza-nome").value.trim().toUpperCase() || "CAMISA 10";
        const num = document.getElementById("input-personaliza-num").value.trim() || "10";
        const patch = document.getElementById("select-patch").value;
        msg += `• Personalização Silk: ${nome} #${num} (${patch})\n`;
    }

    msg += `\nPode me passar o prazo para o meu CEP?`;
    window.open(`https://wa.me/5571988887777?text=${encodeURIComponent(msg)}`, '_blank');
}

// 10. TELA DE RASTREAMENTO
function abrirModalRastreio() {
    document.getElementById("modal-rastreamento").classList.remove("hidden");
    lucide.createIcons();
}

function fecharModalRastreio() {
    document.getElementById("modal-rastreamento").classList.add("hidden");
}

function rastrearEncomenda() {
    const cod = document.getElementById("input-rastreio-codigo").value.trim();
    const resDiv = document.getElementById("resultado-rastreio");

    if (!cod) {
        alert("Digite um código de rastreio ou CPF.");
        return;
    }

    resDiv.classList.remove("hidden");
    resDiv.innerHTML = `
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="font-bold text-white font-mono">${cod.toUpperCase()}</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">Em Trânsito</span>
        </div>
        <div class="space-y-1.5 pt-1 text-slate-300">
            <div>📍 <strong>Última atualização:</strong> Objeto em transferência para o Centro de Distribuição em Salvador/BA.</div>
            <div class="text-[10px] text-slate-500">Previsão estimada de entrega: 2 a 4 dias úteis.</div>
        </div>
        <a href="https://wa.me/5571988887777?text=Gostaria%20de%20informa%C3%A7%C3%B5es%20do%20rastreio%20${cod}" target="_blank" class="mt-2 block text-center py-2 rounded-xl bg-white/5 hover:bg-emerald-500/10 text-emerald-400 font-bold text-xs">
            Acompanhar pelo WhatsApp Oficial
        </a>
    `;
}

// 11. MINHA CONTA MODAL
function abrirModalMinhaConta() {
    abrirModalInstitucional('minha-conta');
}

// 12. MODAIS INSTITUCIONAIS COMPLETOS (POLÍTICAS CLARAS, TROCAS, GUIA DE MEDIDAS)
function abrirModalInstitucional(tipo) {
    const container = document.getElementById("institucional-conteudo");
    let html = "";

    if (tipo === 'guia-medidas') {
        html = `
            <div class="space-y-4">
                <div class="flex items-center gap-2 text-emerald-400 font-bold text-base font-heading">
                    <i data-lucide="ruler" class="w-5 h-5"></i> Guia Oficial de Medidas (cm)
                </div>
                <p class="text-xs text-slate-300">Confira suas medidas antes de comprar para evitar pedidos de troca:</p>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs text-left">
                        <thead>
                            <tr class="border-b border-white/10 text-emerald-400 font-bold">
                                <th class="py-2">Tamanho</th>
                                <th class="py-2">Largura (Tórax)</th>
                                <th class="py-2">Comprimento</th>
                                <th class="py-2">Peso Sugerido</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5 text-slate-300">
                            <tr><td class="py-2 font-bold text-white">P</td><td>50 - 52 cm</td><td>69 - 71 cm</td><td>55 - 65 kg</td></tr>
                            <tr><td class="py-2 font-bold text-white">M</td><td>53 - 55 cm</td><td>72 - 74 cm</td><td>65 - 75 kg</td></tr>
                            <tr><td class="py-2 font-bold text-white">G</td><td>56 - 58 cm</td><td>75 - 77 cm</td><td>75 - 85 kg</td></tr>
                            <tr><td class="py-2 font-bold text-white">GG</td><td>59 - 61 cm</td><td>78 - 80 cm</td><td>85 - 95 kg</td></tr>
                            <tr><td class="py-2 font-bold text-white">EGG</td><td>62 - 64 cm</td><td>81 - 83 cm</td><td>95 - 110 kg</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
                    💡 <strong>Dica da Diretoria:</strong> Se preferir caimento mais folgado ou se for Versão Jogador (que é mais justa no corpo), recomendamos escolher 1 tamanho acima do habitual.
                </div>
            </div>
        `;
    } else if (tipo === 'trocas') {
        html = `
            <div class="space-y-4">
                <div class="flex items-center gap-2 text-emerald-400 font-bold text-base font-heading">
                    <i data-lucide="rotate-ccw" class="w-5 h-5"></i> Política de Trocas e Devoluções
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">
                    Na FutStore a satisfação do cliente é primordial. Caso sua peça não tenha servido, você possui até <strong>7 dias corridos</strong> após o recebimento para solicitar a troca.
                </p>
                <div class="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-200 text-xs space-y-1 font-sans">
                    <div class="font-bold text-white flex items-center gap-1.5">
                        <i data-lucide="alert-triangle" class="w-4 h-4 text-red-400"></i> ATENÇÃO ÀS PEÇAS PERSONALIZADAS:
                    </div>
                    <div>
                        <strong>Camisas personalizadas com nome, número ou patchs específicos NÃO possuem troca nem devolução</strong>, exceto por defeito comprovado de fabricação, uma vez que são peças customizadas exclusivamente para você.
                    </div>
                </div>
            </div>
        `;
    } else if (tipo === 'como-comprar') {
        html = `
            <div class="space-y-4">
                <div class="flex items-center gap-2 text-emerald-400 font-bold text-base font-heading">
                    <i data-lucide="sparkles" class="w-5 h-5"></i> Como Funciona o Super Combo (Leve 3 Pague 2)
                </div>
                <ol class="space-y-3 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                    <li>Escolha o 1º Manto e adicione ao carrinho selecionando o tamanho desejado.</li>
                    <li>Escolha o 2º Manto e adicione ao carrinho normalmente.</li>
                    <li>Escolha o 3º Manto: o desconto da 3ª camisa de menor ou igual valor é aplicado automaticamente no checkout!</li>
                    <li>Se preferir pagar no Pix, você ainda ganha <strong>+ 5% OFF extra</strong> e personalização gratuita!</li>
                </ol>
            </div>
        `;
    } else if (tipo === 'faq') {
        html = `
            <div class="space-y-4">
                <div class="flex items-center gap-2 text-emerald-400 font-bold text-base font-heading">
                    <i data-lucide="help-circle" class="w-5 h-5"></i> Perguntas Frequentes (FAQ)
                </div>
                <div class="space-y-3 text-xs">
                    <div class="p-3 bg-white/5 rounded-xl border border-white/5">
                        <strong class="text-white block mb-1">Qual a qualidade das camisas?</strong>
                        <span class="text-slate-300">Nossas camisas são no padrão Tailandês 1:1, com mesmo tecido tecnológico, escudos bordados de alta definição, etiquetas e acabamento idênticos às peças vendidas nas lojas oficiais.</span>
                    </div>
                    <div class="p-3 bg-white/5 rounded-xl border border-white/5">
                        <strong class="text-white block mb-1">Qual o prazo de envio?</strong>
                        <span class="text-slate-300">Itens com selo "Pronta Entrega" são despachados em até 24 horas úteis. Itens sob encomenda chegam entre 10 e 15 dias úteis com código de rastreamento completo.</span>
                    </div>
                    <div class="p-3 bg-white/5 rounded-xl border border-white/5">
                        <strong class="text-white block mb-1">O Pix é seguro?</strong>
                        <span class="text-slate-300">Totalmente. Nosso sistema gera QR Code Pix instantâneo do Banco Central com confirmação automática em menos de 10 segundos.</span>
                    </div>
                </div>
            </div>
        `;
    } else if (tipo === 'quem-somos') {
        html = `
            <div class="space-y-4">
                <div class="flex items-center gap-2 text-emerald-400 font-bold text-base font-heading">
                    <i data-lucide="shield" class="w-5 h-5"></i> Quem Somos • FutStore Brasil
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">
                    A FutStore nasceu da paixão de três amigos de infância pelo futebol e pela cultura das camisas históricas e mantos sagrados.
                </p>
                <p class="text-xs text-slate-300 leading-relaxed">
                    Nosso propósito é democratizar o acesso aos mantos mais desejados do planeta no padrão 1:1 com preço justo, atendimento humanizado via WhatsApp e envio seguro para todo o território nacional.
                </p>
            </div>
        `;
    } else if (tipo === 'prazos') {
        html = `
            <div class="space-y-4">
                <div class="flex items-center gap-2 text-emerald-400 font-bold text-base font-heading">
                    <i data-lucide="truck" class="w-5 h-5"></i> Prazos de Entrega e Frete
                </div>
                <div class="text-xs text-slate-300 space-y-2 leading-relaxed">
                    <p>• <strong>Pronta Entrega (Salvador e Região):</strong> Entrega expressa em 1 a 2 dias úteis via motoboy ou retirada.</p>
                    <p>• <strong>Pronta Entrega (Brasil):</strong> 3 a 7 dias úteis via Correios / Jadlog.</p>
                    <p>• <strong>Encomendas Especiais / Silk:</strong> 10 a 15 dias úteis com rastreamento ponto a ponto.</p>
                    <p class="text-emerald-400 font-bold">Pedidos acima de R$ 299 possuem Frete Grátis garantido!</p>
                </div>
            </div>
        `;
    } else if (tipo === 'privacidade') {
        html = `
            <div class="space-y-4">
                <div class="flex items-center gap-2 text-emerald-400 font-bold text-base font-heading">
                    <i data-lucide="lock" class="w-5 h-5"></i> Política de Privacidade
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">
                    Seus dados pessoais, endereço e informações de contato são utilizados única e exclusivamente para a emissão do pedido e entrega da sua encomenda. Não comercializamos dados com terceiros.
                </p>
            </div>
        `;
    } else if (tipo === 'minha-conta') {
        html = `
            <div class="space-y-4 text-center">
                <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <i data-lucide="user" class="w-6 h-6"></i>
                </div>
                <h3 class="text-base font-heading font-black text-white">Acesse seus Pedidos</h3>
                <p class="text-xs text-slate-400">Digite seu WhatsApp ou CPF para consultar todos os seus mantos:</p>
                <input type="text" placeholder="Seu WhatsApp ou CPF" class="w-full px-3 py-2.5 rounded-xl bg-pitch-900 border border-white/10 text-xs text-white text-center focus:outline-none focus:border-emerald-400 font-mono">
                <button onclick="alert('Seu histórico de pedidos foi enviado com sucesso para o seu WhatsApp!'); fecharModalInstitucional();" class="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs">
                    Entrar
                </button>
            </div>
        `;
    }

    container.innerHTML = html;
    document.getElementById("modal-institucional").classList.remove("hidden");
    lucide.createIcons();
}

function fecharModalInstitucional() {
    document.getElementById("modal-institucional").classList.add("hidden");
}

// 13. PROVA SOCIAL AO VIVO (GATILHO DE URGÊNCIA E CONVERSÃO)
function iniciarProvaSocialAoVivo() {
    const comprasMock = [
        { nome: "Lucas M. de Salvador", item: "Camisa do Bahia Titular 24/25" },
        { nome: "Gabriel F. de São Paulo", item: "Camisa Real Madrid Home 24/25" },
        { nome: "Rodrigo A. de Feira de Santana", item: "Camisa do Vitória Rubro-Negra" },
        { nome: "Matheus S. do Rio de Janeiro", item: "Camisa Flamengo Rubro-Negra" },
        { nome: "Felipe C. de Belo Horizonte", item: "Camisa Brasil Retrô 2002 Penta" },
        { nome: "Tiago B. de Salvador", item: "Jaqueta Corta-Vento PSG Impermeável" }
    ];

    setInterval(() => {
        const item = comprasMock[Math.floor(Math.random() * comprasMock.length)];
        const proofEl = document.getElementById("live-social-proof");
        if (!proofEl) return;

        document.getElementById("social-proof-name").innerText = item.nome;
        document.getElementById("social-proof-action").innerText = `acabou de comprar ${item.item}`;

        proofEl.classList.remove("hidden");
        setTimeout(() => {
            proofEl.classList.add("hidden");
        }, 5000);
    }, 18000);
}
