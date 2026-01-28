const prompt = require("prompt-sync")();

let numeroInserido = Number(prompt("Insere um número: "));

if(numeroInserido%5===0 && numeroInserido<20 && numeroInserido>1){
    console.log("O número é multiplo de 5 entre 5 e 15")
}else if(numeroInserido>20 || numeroInserido<1){
    console.log("Número inválido")
}else{
    console.log("Número válido entre 0 e 20 sem ser multiplo de 5")
}

