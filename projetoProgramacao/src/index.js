const prompt = require("prompt-sync")();

function alteracaoDeNome(aluno){
    let nome = aluno["name"] === "???" ? ("Anónimo") : (aluno["name"])
    nome = nome === "" ? ("Sem Nome") : (nome)
    return nome
}

function alteracaoDeTexto(aluno){
    let textoUsado = aluno["role"] === "Admin" ? "Acesso Total" : "Indefenido"
    textoUsado = aluno["role"] === "Editor" ? "Pode Editar" : textoUsado
    textoUsado = aluno["role"] === "Default" ? "Acesso Limitado" : textoUsado
    return textoUsado
}


function criarAluno(alunos){
    const nome = prompt("Insira o nome do Aluno : ")
    const numeroDeNotas = Number(prompt("Insira quantas notas tem : "))
    const notas = []
    for(let contador=1; contador<= numeroDeNotas;contador++){
        const nota = Number(prompt("Insira a sua " + contador + " nota : "))
        contador = nota <= 20 && nota >= 0 ? contador : contador-1
        notas.push(nota)
    }
    let ultimoAluno = alunos[alunos. length - 1]
    let idUltimoAluno = ultimoAluno["id"]
    const aluno = {
        name : nome,
        grades : notas,
        id : (idUltimoAluno+1),
        role : ""
    }
    return aluno
}
function adicionarAluno(alunoNovo,aluno){
    aluno.push(alunoNovo)    
    return aluno
}

function alterarRoles(aluno){
    let alunoSelecionado = 0
    for( const alunoNome of aluno){
        let nome = alteracaoDeNome(alunoNome)
        console.log(alunoNome["id"] + ") " + nome)
    }
    const ultimoAluno = aluno[aluno. length - 1]
    const idUltimoAluno = ultimoAluno["id"]
    do{
        alunoSelecionado = Number(prompt("Insira o aluno que pretende editar : "))
        textoApresentado = alunoSelecionado>=1 && alunoSelecionado<=idUltimoAluno ? ("Aluno Válido") : ("Inválido, Tente Novamente")
        console.log(textoApresentado)
    }while(alunoSelecionado>idUltimoAluno || alunoSelecionado<0)
    for (const alunoCompleto of aluno){
        let nome = alteracaoDeNome(alunoCompleto)
        if(alunoSelecionado===alunoCompleto["id"]){
            do{
            console.log("1 - Admin \n2 - Editor \n3 - Default ")
            escolha = Number(prompt("Insira um número correspondente role de " + nome + " : "))
            textoApresentado = escolha < 4 && escolha > 0 ? ("Role Válido") : ("Role Inválido, Tente Novamente")
            console.log(textoApresentado)
            }while(escolha>3 || escolha<1)
            switch(escolha){
                case 1:
                    return alunoCompleto["role"] = "Admin"
                    break
                case 2: 
                    return alunoCompleto["role"] = "Editor"
                    break
                case 3: 
                    return alunoCompleto["role"] = "Default"
                    break
            }
        }  
    }
}

function notas(aluno){
    const lista = []
    for (const alunoCompleto of aluno){
        let notaFinal = 0
        let quantidadeDeNotas = 0
        let media = 0
        let escolha = 0
        let role = alteracaoDeTexto(alunoCompleto)
        let nome = alteracaoDeNome(alunoCompleto)
        for(const alunoNota of alunoCompleto["grades"] ){
            alunoNota <= 20 && alunoNota >= 0 ? notaFinal=notaFinal+alunoNota : quantidadeDeNotas=quantidadeDeNotas-1
            quantidadeDeNotas += 1
        }
        media = notaFinal === 0 ? (0) : notaFinal / quantidadeDeNotas
        media = media.toFixed(1)
        let status = media >= 10 ? ("Aprovado") : ("Reprovado")
        lista.push((alunoCompleto["id"]) + ") " + nome + " - Média : " + media + " -  Status : " + status + " - Role [" + role + "]")
    }
    return lista
}


function listarTudo(lista){
    for(let dadosAluno of lista){
        console.log(dadosAluno)
    }
}

function alunosModelo(){
    const aluno = [
    {
        name : "???",
        id : 1,
        grades : [],
        role : ""
    },
    {
        name : "João",
        id : 2,
        grades : [18.3,13.5,16.7,11.1,9.4,12.5],
        role : ""
    },
    {
        name : "Catarina",
        id : 3,
        grades : [19.5,7.3,16.3,12.3],
        role : ""
    },
    {
        name : "Afonso",
        id : 4,
        grades : [12.3,13.2,15,16.4,9.3],
        role : ""
    },
    {
        name : "",
        id : 5,
        grades : [3.6,6.5,8.3,1.2,6.4,15.2,1.3],
        role : ""
    }
    ]
return aluno
}


aluno = alunosModelo()
let escolhaMenu = 0
do{
    console.log("1 - Inserir Aluno \n2 - Listar Alunos \n3 - Alterar roles \n4 - Sair")
    escolhaMenu = Number(prompt("Insira a sua opção : "))
    switch(escolhaMenu){
        case 1:
            alunoNovo = criarAluno(aluno)
            aluno = adicionarAluno(alunoNovo,aluno)
            break
        case 2:
            let lista = notas(aluno)
            listarTudo(lista)
            break
        case 3:
            aluno["role"] = alterarRoles(aluno)
            break
        case 4:
            break
    }
}while(escolhaMenu!==4)






// funcA() -> Array<Object>
// Retorna um array de objetos “aluno”.
// Cada objeto deve ter, no mínimo: id (number), name (string), grades (array de numbers) e role (string).
// Pode ser “dados mockados” (hard-coded). Pelo menos .
// Inclua casos “chatos” de propósito:
// um aluno com grades: []
// um aluno com nota 0
// um aluno com name: "" (string vazia)  name ausente (para testar ??/condições)

//notas(aluno)

// funcB(a: Array<Object>) -> Array<string>
// Recebe o array de alunos.
// Para cada aluno, gera uma string no formato:
// "NOME - média: X - status: Y"
// Regras:
// Média é a soma das notas / quantidade de notas.
// Se grades estiver vazio, a média deve ser 0.
// NOME deve virar "Anónimo" se name for null/undefined (use ??) e deve virar "Sem nome" se name === "" (use condição/ternário).
// status:
// "Aprovado" se média >= 10
// "Reprovado" caso contrário

//  aqui: for clássico  for...of.funcC(a: Array<string>) -> string
// Recebe o array de strings gerado pela funcB.
// Devolve  com todas as linhas, separadas por \n, numeradas:
// 1) ...
// 2) ...


//  aqui: while  do...while.Bónus (opcional, mas recomendado)
// Use switch em funcB para tratar o role:
// "admin" → adicionar "[Acesso total]" no fim da linha
// "editor" → adicionar "[Pode editar]"
// default → "[Acesso limitado]"

// Exemplo de uso esperado

// const alunos = funcA();
// const linhas = funcB(alunos);
// const relatorio = funcC(linhas);
// console.log(relatorio);
// Saída esperada (formato): Algo deste género (valores dependem dos teus dados):

// 1) Anónimo - média: 12 - status: Aprovado [Acesso limitado]
// 2) Bruno - média: 9 - status: Reprovado [Pode editar]
// 3) Sem nome - média: 0 - status: Reprovado [Acesso total]
// ...

// Critérios de aceitação
// Tem  com as assinaturas pedidas.
// Usa  (um em funcB e outro em funcC).
// Trata corretamente grades: [], nota 0, name ausente e name === "".
// Gera o relatório final como  com linhas numeradas.
