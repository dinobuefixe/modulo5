const prompt = require("prompt-sync")();


function tudo(numeroInserido){

    numeroInserido % 5 === 0 && numeroInserido < 20 && numeroInserido > 1
        ? console.log("PARE, o seu número é múltiplo de 5 menor que 20, bueda fixe")
        : numeroInserido > 20 || numeroInserido < 1
            ? console.log("Número inválido")
            : console.log("Número válido entre 0 e 20 inclusive");
}


let numeroInserido = Number(prompt("Insere um número: "));
tudo(numeroInserido)