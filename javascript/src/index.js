const prompt = require("prompt-sync")();


function tudo(){
    let numeroInserido = Number(prompt("Insere um número: "));

    if(numeroInserido%5===0 && numeroInserido<20 && numeroInserido>1){
        console.log("PARE, o seu número é multiplo de 5 menor que 20, bueda fixe")
    }else if(numeroInserido>20 || numeroInserido<1){
        console.log("Número inválido")
    }else{
        console.log("Número válido entre 0 e 20")
    }

}

tudo()