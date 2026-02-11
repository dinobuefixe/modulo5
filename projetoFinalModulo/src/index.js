// ==========================================
// DESAFIO FINAL 01
// Tema: Mini-sistema de Loja + Caixa + Estoque
// ==========================================

// Objetivo
// Você vai construir um sistema completo (em memória, sem banco de dados) que:
// - mantém um catálogo de produtos e um estoque
// - cria carrinhos de compra, valida quantidades e calcula totais
// - aplica regras de preço (promoções/cupões) com prioridades e restrições
// - calcula impostos (IVA) por categoria
// - finaliza pedidos e imprime um cupom fiscal detalhado
// - gera relatórios simples de vendas

// Regras gerais
// - Não use bibliotecas externas.
// - Use apenas JavaScript (Node.js).
// - Não apague as assinaturas (nomes/params) dos métodos marcados como TODO.
// - Use estruturas de dados adequadas (Map/Array/Object).
// - Todas as validações devem lançar Error com mensagens claras.

// Como usar
// - Complete os TODOs.
// - Ao final, descomente a chamada de runDemo() no fim do arquivo.
// - O demo executa cenários que devem passar.

// ==========================================
// PARTE 0 - Dados e utilitários
// ==========================================

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
	// Evite Intl se quiser praticar manualmente.
	return `R$ ${round2(value).toFixed(2)}`.replace(".", ",");
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

// ==========================================
// PARTE 1 - Modelos principais (classes)
// ==========================================

// 1) Crie a classe Produto
// Requisitos mínimos:
// - sku (string) único
// - nome (string)
// - preco (number > 0)
// - fabricante (string)
// - categoria (deve estar em CATEGORIAS)
// - numeroMaximoParcelas (int 1..24)
// Métodos:
// - getValorDeParcela(numeroDeParcelas) => number
//   - deve validar: numeroDeParcelas int >=1 e <= numeroMaximoParcelas
//   - retorna preco / numeroDeParcelas (2 casas)

class Produto {
	constructor({ sku, nome, preco, fabricante, categoria, numeroMaximoParcelas }) {

        assertCategoriaValida(categoria);

		this.sku = sku,
        this.nome = nome,
        this.preco = preco,
        this.fabricante = fabricante,
        this.categoria = categoria,
        this.numeroMaximoParcelas = numeroMaximoParcelas
//		throw new Error("TODO: implementar Produto");
	}

	getValorDeParcela(numeroDeParcelas) {
        if(numeroDeParcelas>this.numeroMaximoParcelas || numeroDeParcelas<1){
            console.log("ERRO, Número de parcelas inválido");
            return
        }
        const precoPorParcela = this.preco/numeroDeParcelas;
        return precoPorParcela
//      throw new Error("TODO: implementar getValorDeParcela");
	}
}


const produtos = [
    new Produto({
        sku: "ELE001",
        nome: "Máquina de Lavar",
        preco: 399.99,
        fabricante: "Bosch",
        categoria: "eletrodoméstico",
        numeroMaximoParcelas: 12
    }),
    new Produto({
        sku: "DEC010",
        nome: "Candeeiro de Mesa",
        preco: 29.90,
        fabricante: "IKEA",
        categoria: "decoração",
        numeroMaximoParcelas: 6
    }),
    new Produto({
        sku: "MAT200",
        nome: "Saco de Cimento 25kg",
        preco: 4.50,
        fabricante: "Cimpor",
        categoria: "materiais de construção",
        numeroMaximoParcelas: 3
    }),
    new Produto({
        sku: "VES050",
        nome: "Camisola de Algodão",
        preco: 14.99,
        fabricante: "Zara",
        categoria: "vestuário",
        numeroMaximoParcelas: 4
    }),
    new Produto({
        sku: "ALI300",
        nome: "Arroz Agulha 1kg",
        preco: 1.20,
        fabricante: "Continente",
        categoria: "alimentos",
        numeroMaximoParcelas: 1
    })
];

// 2) Crie a classe Cliente
// Requisitos:
// - id (string)
// - nome (string)
// - tipo: "REGULAR" | "VIP"
// - saldoPontos (int >= 0)
// Métodos:
// - adicionarPontos(pontos)
// - resgatarPontos(pontos) => diminui saldo, valida

class Cliente {
	constructor({ id, nome, tipo = "REGULAR", saldoPontos = 0 }) {
        this.id = id,
        this.nome = nome,
        this.tipo = tipo,
        this.saldoPontos = saldoPontos;
//        throw new Error("TODO: implementar Cliente");
	}

	adicionarPontos(pontos) {
		this.saldoPontos += pontos;
        return this.saldoPontos;
//		throw new Error("TODO: implementar adicionarPontos");
	}

	resgatarPontos(pontos) {
        if(this.saldoPontos<pontos){
            console.log("O utilizador não tem pontos suficientes :(")
            return
        }
        this.saldoPontos -= pontos;
        return this.saldoPontos
//        throw new Error("TODO: implementar resgatarPontos");
	}
}

// 3) Crie a classe ItemCarrinho
// Requisitos:
// - sku (string)
// - quantidade (int >= 1)
// - precoUnitario (number > 0) *congelado no momento de adicionar*
// Observação: o carrinho usa precoUnitario do momento (para simular mudança de preço no catálogo).

class ItemCarrinho {
	constructor({ sku, quantidade, precoUnitario }) {
        this.sku = sku,
        this.quantidade = quantidade,
        this.precoUnitario = precoUnitario;
	}

	getTotal() {
    const precoFinal = this.quantidade * this.precoUnitario;
    return precoFinal;
        //throw new Error("TODO: implementar getTotal");
	}
}

// 4) Crie a classe Estoque
// Use Map para guardar { sku -> quantidade }
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Métodos:
// - definirQuantidade(sku, quantidade)
// - adicionar(sku, quantidade)
// - remover(sku, quantidade)
// - getQuantidade(sku)
// - garantirDisponibilidade(sku, quantidade)

class Estoque {
	constructor() {
        this.stock = new Map(); // o mapa vive DENTRO da classe
  //      throw new Error("TODO: implementar Estoque");
	}

	definirQuantidade(sku, quantidade) {
        this.stock.set(sku,quantidade);
        return;
//        throw new Error("TODO: implementar definirQuantidade");
	}

	adicionar(sku, quantidade) {
		const estoqueAtual = this.getQuantidade(sku); 
        this.stock.set(sku, estoqueAtual + quantidade);
        return;
	//	throw new Error("TODO: implementar adicionar");
	}

	remover(sku, quantidade) {
		const atual = this.getQuantidade(sku); 
        if (quantidade > atual) { 
            throw new Error(`Estoque insuficiente para remover ${quantidade} unidades de ${sku}`); 
        } 
        this.stock.set(sku, atual - quantidade);
        return;
		//throw new Error("TODO: implementar remover");
	}

	getQuantidade(sku) {
        const estoqueAtual = this.stock.get(sku) === undefined ? 0 : this.stock.get(sku);
        return estoqueAtual;
       // throw new Error("TODO: implementar getQuantidade");
	}

	garantirDisponibilidade(sku, quantidade) {
		const atual = this.getQuantidade(sku); 
        if (atual < quantidade) { 
            throw new Error(`Não há quantidade suficiente de ${sku}. Disponível: ${atual}`); 
        }
	//	throw new Error("TODO: implementar garantirDisponibilidade");
	}
}

const estoque = new Estoque();

// 5) Crie a classe Catalogo
// Use Map para guardar { sku -> Produto }
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Métodos:
// - adicionarProduto(produto)
// - getProduto(sku)
// - listarPorCategoria(categoria)
// - atualizarPreco(sku, novoPreco)

class Catalogo {
	constructor() {
		this.catalogo = new Map(); // o mapa vive DENTRO da classe
		//throw new Error("TODO: implementar Catalogo");
	}   

	adicionarProduto(produto) { 
        if (!produto || !produto.sku) { 
            throw new Error("Produto inválido"); 
        } 
        this.catalogo.set(produto.sku, produto); 
    }

	getProduto(sku) {
        return this.catalogo.get(sku);
//		throw new Error("TODO: implementar getProduto");
	}

	listarPorCategoria(categoria) {
        if (!CATEGORIAS.includes(categoria)) {
            throw new Error(`Categoria inválida: ${categoria}`);
        }

        const resultado = [];

        for (const produto of this.catalogo.values()) {
            if (produto.categoria === categoria) {
                resultado.push(produto);
            }
        }

        return resultado;
    }


	atualizarPreco(sku, novoPreco) {
        const produto = this.catalogo.get(sku);

        if (!produto) {
            throw new Error(`Produto com SKU ${sku} não encontrado`);
        }

        produto.preco = novoPreco;

        this.catalogo.set(sku, produto);
    }

}

const catalogo = new Catalogo()

for (const produtoUnico of produtos) { 
    catalogo.adicionarProduto(produtoUnico); 
}



// 6) Crie a classe CarrinhoDeCompras
// Responsabilidades:
// - adicionar itens (validando estoque)
// - remover itens
// - alterar quantidade
// - calcular subtotal
// - consolidar itens por sku (sem duplicatas)
// Sugestão: use Map sku -> ItemCarrinho
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

class CarrinhoDeCompras {
    constructor({ catalogo, estoque }) {
        this.catalogo = catalogo;  
        this.estoque = estoque;     
        this.itens = new Map();     
    }

    adicionarItem(sku, quantidade) {
        // validar se o produto existe no catálogo
        const produto = this.catalogo.getProduto(sku);
        if (!produto) {
            throw new Error(`Produto com SKU ${sku} não existe no catálogo`);
        }

        // validar estoque
        this.estoque.garantirDisponibilidade(sku, quantidade);

        // se já existe no carrinho, soma
        const itemExistente = this.itens.get(sku);

        if (itemExistente) {
            itemExistente.quantidade += quantidade;
        } else {
            this.itens.set(sku, new ItemCarrinho({
                sku,
                quantidade,
                precoUnitario: produto.preco
            }));
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

        // validar estoque
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

// ==========================================
// PARTE 2 - Regras de preço (promoções)
// ==========================================

// Você implementará um motor de preços com as regras abaixo.
// Você deve conseguir produzir um “breakdown” (quebra) do total:
// - subtotal
// - descontos (lista com nome + valor)
// - base de imposto
// - imposto total
// - frete
// - total final

// Estrutura sugerida do breakdown (objeto):
// {
//   subtotal,
//   descontos: [{ codigo, descricao, valor }],
//   totalDescontos,
//   impostoPorCategoria: { [categoria]: valor },
//   totalImpostos,
//   frete,
//   total
// }

// 7) Regras obrigatórias (todas devem existir e ser testáveis):
// R1 - Desconto VIP:
// - Se cliente.tipo === "VIP", aplica 5% no subtotal (apenas uma vez).
// - Não pode ser aplicado se existir cupom "SEM-VIP".
//
// R2 - Cupom:
// - Cupom "ETIC10" => 10% no subtotal
// - Cupom "FRETEGRATIS" => frete zerado
// - Cupom "SEM-VIP" => bloqueia R1
// - Cupom inválido deve lançar Error
//
// R3 - Leve 3 pague 2 (vestuário):
// - Para produtos da categoria "vestuário": a cada 3 unidades (somando SKUs diferentes),
//   a unidade mais barata dentre as 3 sai grátis.
// - Ex: 3 camisetas (10), 1 calça (50), 1 meia (5) => total unidades=5 => aplica 1 grátis
//   (a mais barata dentro do grupo de 3) e sobram 2 sem promo.
//
// R4 - Desconto por valor:
// - Se subtotal >= 500, aplica desconto fixo de 30.
//
// Observação de dificuldade:
// - Você precisa decidir ordem de aplicação e documentar.
// - Você precisa impedir descontos maiores que o subtotal.
// - Deve ser determinístico.

// 8) Crie uma classe MotorDePrecos
// Método principal:
// - calcular({ cliente, itens, cupomCodigo }) => breakdown
// Onde itens é o resultado de carrinho.listarItens()

class MotorDePrecos {
	constructor({ catalogo }) {
		// TODO
		throw new Error("TODO: implementar MotorDePrecos");
	}

	calcular({ cliente, itens, cupomCodigo }) {
		// TODO
		throw new Error("TODO: implementar calcular");
	}
}

// ==========================================
// PARTE 3 - Checkout / Pedido / Cupom
// ==========================================

// 9) Crie a classe Pedido
// Requisitos:
// - id (string)
// - clienteId
// - itens (array)
// - breakdown (objeto)
// - status: "ABERTO" | "PAGO" | "CANCELADO"
// - createdAt (Date)
// Métodos:
// - pagar()
// - cancelar()

class Pedido {
	constructor({ id, clienteId, itens, breakdown }) {
		// TODO
		throw new Error("TODO: implementar Pedido");
	}

	pagar() {
		// TODO
		throw new Error("TODO: implementar pagar");
	}

	cancelar() {
		// TODO
		throw new Error("TODO: implementar cancelar");
	}
}

// 10) Crie a classe CaixaRegistradora
// Responsabilidades:
// - receber (catalogo, estoque, motorDePrecos)
// - fecharCompra({ cliente, carrinho, cupomCodigo, numeroDeParcelas }) => Pedido
// Regras:
// - Ao fechar compra, deve remover do estoque as quantidades compradas
// - Se numeroDeParcelas for informado, deve validar com base no Produto (máximo permitido)
// - Deve somar parcelas por item e imprimir um resumo no cupom (opcional, mas recomendado)

class CaixaRegistradora {
	constructor({ catalogo, estoque, motorDePrecos }) {
		// TODO
		throw new Error("TODO: implementar CaixaRegistradora");
	}

	fecharCompra({ cliente, carrinho, cupomCodigo = null, numeroDeParcelas = 1 }) {
		// TODO
		throw new Error("TODO: implementar fecharCompra");
	}
}

// 11) Crie a classe CupomFiscal
// Deve gerar texto em linhas (array de strings) contendo:
// - cabeçalho
// - itens: sku, quantidade, preço unitário, total do item
// - subtotal, descontos (linha por desconto), impostos (por categoria), frete, total
// - status do pedido

class CupomFiscal {
	constructor({ pedido, catalogo }) {
		// TODO
		throw new Error("TODO: implementar CupomFiscal");
	}

	gerarLinhas() {
		// TODO
		throw new Error("TODO: implementar gerarLinhas");
	}
}

class Impressora {
	imprimirLinhas(linhas) {
		for (const linha of linhas) {
			console.log(linha);
		}
	}
}

// ==========================================
// PARTE 4 - Relatórios (estruturas de dados + loops)
// ==========================================

// 12) Crie a classe RelatorioVendas
// - Deve armazenar pedidos pagos
// - Deve gerar:
//   - totalArrecadado()
//   - totalImpostos()
//   - totalDescontos()
//   - rankingProdutosPorQuantidade(topN)
//   - arrecadadoPorCategoria()
// Sugestão: use Map para acumular por sku/categoria.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

class RelatorioVendas {
	constructor() {
		// TODO
		throw new Error("TODO: implementar RelatorioVendas");
	}

	registrarPedido(pedido) {
		// TODO
		throw new Error("TODO: implementar registrarPedido");
	}

	totalArrecadado() {
		// TODO
		throw new Error("TODO: implementar totalArrecadado");
	}

	totalImpostos() {
		// TODO
		throw new Error("TODO: implementar totalImpostos");
	}

	totalDescontos() {
		// TODO
		throw new Error("TODO: implementar totalDescontos");
	}

	rankingProdutosPorQuantidade(topN = 5) {
		// TODO
		throw new Error("TODO: implementar rankingProdutosPorQuantidade");
	}

	arrecadadoPorCategoria() {
		// TODO
		throw new Error("TODO: implementar arrecadadoPorCategoria");
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
			numeroDeParcelas: 10
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
//runDemo();