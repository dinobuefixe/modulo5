const CATEGORIAS = [
	"eletrodoméstico",
	"decoração",
	"materiais de construção",
	"vestuário",
	"alimentos"
];

const IVA_POR_CATEGORIA = {
	"eletrodoméstico": 0.23,
	"decoração": 0.23,
	"materiais de construção": 0.23,
	"vestuário": 0.23,
	"alimentos": 0.06
};


function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatBRL(value) {
    return `$ ${round2(value).toFixed(2)}`.replace(".", ",");
}

function assertPositiveNumber(value, label) {
    if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
        throw new Error(`${label} deve ser um número positivo.`);
    }
}

function assertNonNegativeInt(value, label) {
    if (!Number.isInteger(value) || value < 0) {
        throw new Error(`${label} deve ser um inteiro >= 0.`);
    }
}

function assertCategoriaValida(categoria) {
    if (!CATEGORIAS.includes(categoria)) {
        throw new Error(`Categoria inválida: ${categoria}. Aceitas: ${CATEGORIAS.join(", ")}`);
    }
}


let breakdown =  {
    subtotal : 0,
    descontos: [],
    totalDescontos : 0,
    impostoPorCategoria: {},
    totalImpostos : 0,
    frete: 0,
    total : 0
};

function regra1(cliente) {
    return cliente.tipo === "VIP" ? 5 : 0;
}

function regra2(cupom, frete, descontoVIP) {
    let descontoCupom = 0;

    if (cupom === "ETIC10") descontoCupom = 10;
    if (cupom === "FRETEGRATIS") frete = 0;
    if (cupom === "SEM-VIP") descontoVIP = 0;

    return { descontoCupom, frete, descontoVIP };
}

function regra3(carrinhoDeCompras) {
    let contador = 0;
    let precoMaisBaixo = 100000;
    const artigosGratis = [];
    let nomeProdutoGratis = "";

    for (const produto of carrinhoDeCompras) {
        if (produto.categoria === "vestuário") {
            if (produto.preco < precoMaisBaixo) {
                precoMaisBaixo = produto.preco;
                nomeProdutoGratis = produto.sku;
            }
            contador += 1;
            if (contador % 3 === 0) {
                artigosGratis.push(nomeProdutoGratis);
                precoMaisBaixo = 100000;
            }
        }
    }
    return artigosGratis;
}

function regra4(precoTotal) {
    return precoTotal >= 500 ? precoTotal - 30 : precoTotal;
}

function usarDescontos(preco, descontoPercentual) {
    if (!descontoPercentual || descontoPercentual <= 0) return 0;
    return preco * (descontoPercentual / 100);
}

// ================== MODELOS ==================

class Produto {
    constructor({ sku, nome, preco, fabricante, categoria, numeroMaximoParcelas }) {
        assertCategoriaValida(categoria);
        assertPositiveNumber(preco, "Preço");
        assertNonNegativeInt(numeroMaximoParcelas, "Número máximo de parcelas");

        this.sku = sku;
        this.nome = nome;
        this.preco = preco;
        this.fabricante = fabricante;
        this.categoria = categoria;
        this.numeroMaximoParcelas = numeroMaximoParcelas;
    }

    getValorDeParcela(numeroDeParcelas) {
        if (numeroDeParcelas > this.numeroMaximoParcelas || numeroDeParcelas < 1) {
            console.log("ERRO, Número de parcelas inválido");
            return;
        }
        return this.preco / numeroDeParcelas;
    }
}

class Cliente {
    constructor({ id, nome, tipo = "REGULAR", saldoPontos = 0 }) {
        this.id = id;
        this.nome = nome;
        this.tipo = tipo;
        this.saldoPontos = saldoPontos;
    }

    adicionarPontos(pontos) {
        this.saldoPontos += pontos;
        return this.saldoPontos;
    }

    resgatarPontos(pontos) {
        if (this.saldoPontos < pontos) {
            console.log("O utilizador não tem pontos suficientes :(");
            return;
        }
        this.saldoPontos -= pontos;
        return this.saldoPontos;
    }
}

class ItemCarrinho {
    constructor({ sku, quantidade, precoUnitario }) {
        assertNonNegativeInt(quantidade, "Quantidade");
        assertPositiveNumber(precoUnitario, "Preço unitário");

        this.sku = sku;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

    getTotal() {
        return this.quantidade * this.precoUnitario;
    }
}

class Estoque {
    constructor() {
        this.stock = new Map();
    }

    definirQuantidade(sku, quantidade) {
        assertNonNegativeInt(quantidade, "Quantidade em estoque");
        this.stock.set(sku, quantidade);
    }

    adicionar(sku, quantidade) {
        assertNonNegativeInt(quantidade, "Quantidade a adicionar");
        const atual = this.getQuantidade(sku);
        this.stock.set(sku, atual + quantidade);
    }

    remover(sku, quantidade) {
        assertNonNegativeInt(quantidade, "Quantidade a remover");
        const atual = this.getQuantidade(sku);
        if (quantidade > atual) {
            throw new Error(`Estoque insuficiente para remover ${quantidade} unidades de ${sku}`);
        }
        this.stock.set(sku, atual - quantidade);
    }

    getQuantidade(sku) {
        const valor = this.stock.get(sku);
        return valor === undefined ? 0 : valor;
    }

    garantirDisponibilidade(sku, quantidade) {
        const atual = this.getQuantidade(sku);
        if (atual < quantidade) {
            throw new Error(`Não há quantidade suficiente de ${sku}. Disponível: ${atual}`);
        }
    }
}

class Catalogo {
    constructor() {
        this.catalogo = new Map();
    }

    adicionarProduto(produto) {
        if (!produto || !produto.sku) {
            throw new Error("Produto inválido");
        }
        // guarda o Produto completo
        this.catalogo.set(produto.sku, produto);
    }

    getProduto(sku) {
        return this.catalogo.get(sku);
    }

    buscar(sku) {
        return this.catalogo.get(sku);
    }

    listarPorCategoria(categoria) {
        assertCategoriaValida(categoria);

        const resultado = [];
        for (const produto of this.catalogo.values()) {
            if (produto.categoria === categoria) {
                resultado.push(produto);
            }
        }
        return resultado;
    }

    atualizarPreco(sku, novoPreco) {
        assertPositiveNumber(novoPreco, "Novo preço");
        const produto = this.catalogo.get(sku);
        if (!produto) {
            throw new Error(`Produto com SKU ${sku} não encontrado`);
        }
        produto.preco = novoPreco;
    }
}

class CarrinhoDeCompras {
    constructor({ catalogo, estoque }) {
        this.catalogo = catalogo;
        this.estoque = estoque;
        this.itens = new Map(); // sku -> ItemCarrinho
    }

    adicionarItem(sku, quantidade) {
        const produto = this.catalogo.getProduto(sku);
        if (!produto) {
            throw new Error(`Produto ${sku} não existe no catálogo`);
        }

        this.estoque.garantirDisponibilidade(sku, quantidade);

        const itemExistente = this.itens.get(sku);

        if (itemExistente) {
            itemExistente.quantidade += quantidade;
        } else {
            this.itens.set(
                sku,
                new ItemCarrinho({
                    sku,
                    quantidade,
                    precoUnitario: produto.preco
                })
            );
        }
    }

    removerItem(sku) {
        if (!this.itens.has(sku)) {
            throw new Error(`Item ${sku} não está no carrinho`);
        }
        this.itens.delete(sku);
    }

    alterarQuantidade(sku, novaQuantidade) {
        const item = this.itens.get(sku);

        if (!item) {
            throw new Error(`Item ${sku} não está no carrinho`);
        }

        if (novaQuantidade <= 0) {
            this.itens.delete(sku);
            return;
        }

        this.estoque.garantirDisponibilidade(sku, novaQuantidade);
        item.quantidade = novaQuantidade;
    }

    listarItens() {
        for (const item of this.itens.values()) {
            console.log(item);
        }
    }

    getSubtotal() {
        let total = 0;
        for (const item of this.itens.values()) {
            total += item.getTotal();
        }
        return total;
    }
}

class MotorDePrecos {
    constructor({ catalogo }) {
        this.catalogo = catalogo;
    }

    calcular({ cliente, itens, cupomCodigo }) {
        let frete = 20;

        // Regra 1 — VIP
        let descontoVIP = regra1(cliente);

        // Regra 2 — cupom
        const r2 = regra2(cupomCodigo, frete, descontoVIP);
        frete = r2.frete;
        descontoVIP = r2.descontoVIP;
        const descontoCupom = r2.descontoCupom;

        let subtotal = 0;
        let categoriasTalao = {};
        let impostos = 0;

        for (const item of itens) {
            const produto = this.catalogo.buscar(item.sku);
            if (!produto) {
                throw new Error(`Produto ${item.sku} não encontrado no catálogo`);
            }

            const preco = produto.preco * item.quantidade;
            subtotal += preco;

            const impostoCategoria = IVA_POR_CATEGORIA[item.categoria];
            const valorImposto = preco * impostoCategoria;
            impostos += valorImposto;

            categoriasTalao[item.categoria] =
                (categoriasTalao[item.categoria] || 0) + valorImposto;
        }

        let total = subtotal + impostos;

        const descontoVIPValor = usarDescontos(total, descontoVIP);
        const descontoCupomValor = usarDescontos(total, descontoCupom);

        const totalDescontos = descontoVIPValor + descontoCupomValor;

        total = regra4(total);
        total = total + frete - totalDescontos;

        return {
            subtotal,
            descontos: {
                vip: descontoVIPValor,
                cupom: descontoCupomValor
            },
            totalDescontos,
            impostoPorCategoria: categoriasTalao,
            totalImpostos: impostos,
            frete,
            total
        };
    }
}

class Pedido {
    constructor({ id, clienteId, itens, breakdown }) {
        this.id = id;
        this.clienteId = clienteId;
        this.itens = itens;
        this.breakdown = breakdown;
        this.status = "ABERTO"; 
        this.createdAt = new Date();
    }

    pagar() {
        if (this.status !== "ABERTO") {
            throw new Error("Só é possível pagar pedidos ABERTOS");
        }
        this.status = "PAGO";
    }

    cancelar() {
        if (this.status === "PAGO") {
            throw new Error("Não é possível cancelar um pedido já pago");
        }
        this.status = "CANCELADO";
    }
}

class CaixaRegistradora {
    constructor({ catalogo, estoque, motorDePrecos, relatorio, impressora }) {
        this.catalogo = catalogo;
        this.estoque = estoque;
        this.motorDePrecos = motorDePrecos;
        this.relatorio = relatorio;
        this.impressora = impressora;
    }

    fecharCompra({
        cliente,
        carrinho,
        cupomCodigo = null,
        numeroDeParcelas = 1
    } = {}) {

        const itensProcessados = [];
        const itensParaPreco = [];

        for (const [sku, itemCarrinho] of carrinho.itens) {
            if (!sku || !itemCarrinho) {
                throw new Error("Item do carrinho inválido");
            }

            const produto = this.catalogo.buscar(sku);
            const quantidade = itemCarrinho.quantidade;

            if (!produto) {
                throw new Error(`Produto ${sku} não encontrado no catálogo`);
            }

            const maxParcelas = produto.numeroMaximoParcelas ?? 1;
            if (numeroDeParcelas > maxParcelas) {
                throw new Error(
                    `Produto ${produto.nome} permite no máximo ${maxParcelas} parcelas`
                );
            }

            this.estoque.garantirDisponibilidade(sku, quantidade);
            this.estoque.remover(sku, quantidade);

            itensProcessados.push({
                produtoId: sku,
                nome: produto.nome,
                quantidade,
                precoUnitario: produto.preco,
                categoria: produto.categoria
            });

            itensParaPreco.push({
                sku,
                quantidade,
                categoria: produto.categoria
            });
        }

        const breakdown = this.motorDePrecos.calcular({
            itens: itensParaPreco,
            cupomCodigo,
            cliente
        });

        const pedido = new Pedido({
            id: crypto.randomUUID(),
            clienteId: cliente.id,
            itens: itensProcessados,
            breakdown
        });

        if (typeof this.relatorio?.registrarPedido === "function") {
            this.relatorio.registrarPedido(pedido);
        }

        if (typeof this.impressora?.imprimir === "function") {
            this.impressora.imprimir(pedido, this.catalogo);
        }

        return pedido;
    }
}

class CupomFiscal {
    constructor({ pedido, catalogo }) {
        this.pedido = pedido;
        this.catalogo = catalogo;
    }

    gerarLinhas() {
        const linhas = [];

        linhas.push("=== CUPOM FISCAL ===");
        linhas.push(`Pedido: ${this.pedido.id}`);
        linhas.push("");

        linhas.push("Itens:");
        for (const item of this.pedido.itens) {
            const prod = this.catalogo.buscar(item.produtoId);

            if (!prod) {
                linhas.push(`${item.produtoId} - PRODUTO NÃO ENCONTRADO`);
                continue;
            }

            const totalItem = item.precoUnitario * item.quantidade;

            linhas.push(
                `${item.produtoId} - ${prod.nome} | qtd: ${item.quantidade} | ` +
                `${formatBRL(item.precoUnitario)} | total: ${formatBRL(totalItem)}`
            );
        }

        linhas.push("");

        const subtotal = this.pedido.itens.reduce(
            (s, item) => s + item.precoUnitario * item.quantidade,
            0
        );
        linhas.push(`Subtotal: ${formatBRL(subtotal)}`);

        if (this.pedido.breakdown.totalDescontos) {
            linhas.push(`Descontos: -${formatBRL(this.pedido.breakdown.totalDescontos)}`);
        }

        if (this.pedido.breakdown.totalImpostos) {
            linhas.push(`Impostos: ${formatBRL(this.pedido.breakdown.totalImpostos)}`);
        }

        if (this.pedido.breakdown.frete !== undefined) {
            linhas.push(`Frete: ${formatBRL(this.pedido.breakdown.frete)}`);
        }

        linhas.push(`TOTAL: ${formatBRL(this.pedido.breakdown.total)}`);

        linhas.push("");
        linhas.push(`Status: ${this.pedido.status?.toUpperCase?.() || "PAGO"}`);

        return linhas;
    }
}

class Impressora {
    imprimir(pedido, catalogo) {
        const cupom = new CupomFiscal({ pedido, catalogo });
        const linhas = cupom.gerarLinhas();
        this.imprimirLinhas(linhas);
    }

    imprimirLinhas(linhas) {
        for (const linha of linhas) {
            console.log(linha);
        }
    }
}

class RelatorioVendas {
    constructor() {
        this.pedidosPagos = [];
    }

    registrarPedido(pedido) {
        if (pedido.status !== "PAGO") return;
        this.pedidosPagos.push(pedido);
    }

    totalArrecadado() {
        return this.pedidosPagos.reduce((total, pedido) => {
            return total + (pedido.breakdown?.total || 0);
        }, 0);
    }

    totalImpostos() {
        return this.pedidosPagos.reduce((total, pedido) => {
            return total + (pedido.breakdown?.totalImpostos || 0);
        }, 0);
    }

    totalDescontos() {
        return this.pedidosPagos.reduce((total, pedido) => {
            return total + (pedido.breakdown?.totalDescontos || 0);
        }, 0);
    }

    rankingProdutosPorQuantidade(topN = 5) {
        const mapa = new Map();

        for (const pedido of this.pedidosPagos) {
            for (const item of pedido.itens) {
                const atual = mapa.get(item.produtoId) || 0;
                mapa.set(item.produtoId, atual + item.quantidade);
            }
        }

        const lista = [];
        for (const [produtoId, quantidade] of mapa.entries()) {
            lista.push({ produtoId, quantidade });
        }

        lista.sort((a, b) => b.quantidade - a.quantidade);

        return lista.slice(0, topN);
    }

    arrecadadoPorCategoria() {
        const mapa = new Map();

        for (const pedido of this.pedidosPagos) {
            for (const item of pedido.itens) {
                const subtotal = item.precoUnitario * item.quantidade;
                const categoria = item.categoria || "SEM_CATEGORIA";
                const atual = mapa.get(categoria) || 0;
                mapa.set(categoria, atual + subtotal);
            }
        }

        return Object.fromEntries(mapa);
    }
}



// ==========================================
// DADOS DE TESTE (para o demo)
// ==========================================

function seedCatalogoEEstoque() {
	const catalogo = new Catalogo();
	const estoque = new Estoque();

	const produtos = [
		// alimentos
		{ sku: "ARROZ", nome: "Arroz 1kg", preco: 6.0, fabricante: "Marca A", categoria: "alimentos", numeroMaximoParcelas: 1 },
		{ sku: "FEIJAO", nome: "Feijão 1kg", preco: 7.5, fabricante: "Marca B", categoria: "alimentos", numeroMaximoParcelas: 1 },
		{ sku: "OLEO", nome: "Óleo 900ml", preco: 8.0, fabricante: "Marca C", categoria: "alimentos", numeroMaximoParcelas: 1 },
		// vestuário
		{ sku: "CAMISETA", nome: "Camiseta", preco: 30.0, fabricante: "Hering", categoria: "vestuário", numeroMaximoParcelas: 6 },
		{ sku: "CALCA", nome: "Calça Jeans", preco: 120.0, fabricante: "Levis", categoria: "vestuário", numeroMaximoParcelas: 6 },
		{ sku: "MEIA", nome: "Meia", preco: 10.0, fabricante: "Puket", categoria: "vestuário", numeroMaximoParcelas: 6 },
		// eletrodoméstico
		{ sku: "MICRO", nome: "Micro-ondas", preco: 499.9, fabricante: "LG", categoria: "eletrodoméstico", numeroMaximoParcelas: 12 },
		{ sku: "LIQUID", nome: "Liquidificador", preco: 199.9, fabricante: "Philco", categoria: "eletrodoméstico", numeroMaximoParcelas: 10 },
		// decoração
		{ sku: "VASO", nome: "Vaso Decorativo", preco: 89.9, fabricante: "Tok&Stok", categoria: "decoração", numeroMaximoParcelas: 5 },
		// materiais de construção
		{ sku: "CIMENTO", nome: "Cimento 25kg", preco: 35.0, fabricante: "Holcim", categoria: "materiais de construção", numeroMaximoParcelas: 3 }
	];

	for (const p of produtos) {
		const produto = new Produto(p);
		catalogo.adicionarProduto(produto);
	}

	// Estoque inicial
	estoque.definirQuantidade("ARROZ", 50);
	estoque.definirQuantidade("FEIJAO", 50);
	estoque.definirQuantidade("OLEO", 50);
	estoque.definirQuantidade("CAMISETA", 20);
	estoque.definirQuantidade("CALCA", 10);
	estoque.definirQuantidade("MEIA", 30);
	estoque.definirQuantidade("MICRO", 5);
	estoque.definirQuantidade("LIQUID", 8);
	estoque.definirQuantidade("VASO", 10);
	estoque.definirQuantidade("CIMENTO", 100);

	return { catalogo, estoque };
}


// ==========================================
// DEMO (cenários obrigatórios)
// ==========================================

// Critérios de aceite (quando você terminar):
// - Cenário A: cliente VIP, sem cupom, compra vestuário com regra leve-3-pague-2
// - Cenário B: cliente REGULAR com cupom ETIC10
// - Cenário C: cupom inválido deve gerar erro
// - Cenário D: tentar comprar acima do estoque deve gerar erro
// - Cenário E: relatório deve refletir pedidos pagos

function runDemo() {
	const { catalogo, estoque } = seedCatalogoEEstoque();
	const motor = new MotorDePrecos({ catalogo });
	const caixa = new CaixaRegistradora({ catalogo, estoque, motorDePrecos: motor });
	const relatorio = new RelatorioVendas();
	const impressora = new Impressora();

	const clienteVip = new Cliente({ id: "C1", nome: "Ana", tipo: "VIP", saldoPontos: 0 });
	const clienteRegular = new Cliente({ id: "C2", nome: "Bruno", tipo: "REGULAR", saldoPontos: 0 });

	// Cenário A
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("CAMISETA", 2);
		carrinho.adicionarItem("MEIA", 1);
		carrinho.adicionarItem("CALCA", 1);
		const pedido = caixa.fecharCompra({
			cliente: clienteVip,
			carrinho,
			cupomCodigo: null,
			numeroDeParcelas: 3
		});

		pedido.pagar();
		relatorio.registrarPedido(pedido);

		const cupom = new CupomFiscal({ pedido, catalogo });
		impressora.imprimirLinhas(cupom.gerarLinhas());
	}

	// Cenário B
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("MICRO", 1);
		carrinho.adicionarItem("VASO", 1);

		const pedido = caixa.fecharCompra({
			cliente: clienteRegular,
			carrinho,
			cupomCodigo: "ETIC10",
			numeroDeParcelas: 1
		});

		pedido.pagar();
		relatorio.registrarPedido(pedido);

		const cupom = new CupomFiscal({ pedido, catalogo });
		impressora.imprimirLinhas(cupom.gerarLinhas());
	}

	// Cenário C (cupom inválido)
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("ARROZ", 1);

		try {
			caixa.fecharCompra({ cliente: clienteRegular, carrinho, cupomCodigo: "INVALIDO" });
		} catch (err) {
			console.log("(OK) Cupom inválido gerou erro:");
			console.log(String(err.message || err));
		}
	}

	// Cenário D (estoque insuficiente)
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		try {
			carrinho.adicionarItem("MICRO", 999);
		} catch (err) {
			console.log("(OK) Estoque insuficiente gerou erro:");
			console.log(String(err.message || err));
		}
	}

	// Cenário E (relatório)
	{
		console.log("==============================");
		console.log("Relatório");
		console.log("==============================");
		console.log("Total arrecadado:", formatBRL(relatorio.totalArrecadado()));
		console.log("Total impostos:", formatBRL(relatorio.totalImpostos()));
		console.log("Total descontos:", formatBRL(relatorio.totalDescontos()));
		console.log("Top produtos:", relatorio.rankingProdutosPorQuantidade(3));
		console.log("Por categoria:", relatorio.arrecadadoPorCategoria());
	}
}

// Quando terminar tudo, descomente:
runDemo();