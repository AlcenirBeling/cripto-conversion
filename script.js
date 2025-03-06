const dadosDeConversao = {
    cotacoes: [],
    entrada: {
        valor: undefined,
        moeda: undefined
    },
    saida: {
        moeda: undefined
    }
}


async function dataloading() {
        try {
        const url = "https://api2.binance.com/api/v3/ticker/24hr"
        const netAnswer = await fetch (url)
        const json = await netAnswer.json()
        return json
    } catch(erro) {
        return window.cotacaodasMoedasPadrao
    }
}


async function ReceivingParameters () {
    dadosDeConversao.entrada.valor = document.querySelector(".entrada .valor").value
    dadosDeConversao.entrada.moeda = document.querySelector(".entrada .moeda").value
    dadosDeConversao.saida.moeda = document.querySelector(".saida .moeda").value
}

async function dataReceiving() {  
    if (dadosDeConversao.cotacoes.length > 0) {
        return
    }  
    const moedas = await dataloading()

    const finalBTC = moedas
        .filter(cotacao => cotacao.symbol.endsWith("BTC"))
        .map(cotacao => ({
            moeda: cotacao.symbol.substring(0, cotacao.symbol.indexOf("BTC")),
            valor: parseFloat(cotacao.lastPrice)
        }))


    const startBTC = moedas
        .filter(cotacao => cotacao.symbol.startsWith("BTC"))
        .map(cotacao => ({
            moeda: cotacao.symbol.substring(3),
            valor: 1/parseFloat(cotacao.lastPrice)
        }))

    dadosDeConversao.cotacoes = [
        ...finalBTC,
        ...startBTC,
    ]
}

async function calculateResult() {
    

    const valorDeEntrada = parseFloat(dadosDeConversao.entrada.valor)
    const moedaDeEntrada = (dadosDeConversao.entrada.moeda || "BTC").toUpperCase()
    const moedaDeSaida = (dadosDeConversao.saida.moeda || "USDT").toUpperCase()
    if (isNaN(valorDeEntrada)){
        console.error(`Erro: Valor de entrada deve ser numérico`)
        return
    }
    
    const cotacaoMoedaDeEntradaParaBTC = moedaDeEntrada === "BTC"
    ? 1
    : dadosDeConversao.cotacoes.find(cotacao => cotacao.moeda === moedaDeEntrada)?.valor
    if (cotacaoMoedaDeEntradaParaBTC === undefined) {
        console.error(`ERRO: Moeda não existe ${moedaDeEntrada}`)
    }
    
    const cotacaoMoedaDeSaidaParaBTC = moedaDeSaida === "BTC"
    ? 1
    : dadosDeConversao.cotacoes.find(cotacao => cotacao.moeda === moedaDeSaida)?.valor
    if (cotacaoMoedaDeSaidaParaBTC === undefined) {
        console.error(`ERRO: Moeda não existe ${moedaDeEntrada}`)
    }

    if (cotacaoMoedaDeSaidaParaBTC === undefined || cotacaoMoedaDeEntradaParaBTC === undefined) {
        return
    }

    const razao = cotacaoMoedaDeEntradaParaBTC/cotacaoMoedaDeSaidaParaBTC
    const valorDeSaida = valorDeEntrada * razao

    const valorDeEntradaDecimal = moedaDeEntrada.includes("USD") || moedaDeEntrada.includes("BRL") ? 2 : 8
    const valorDeSaidaDecimal = moedaDeSaida.includes("USD") || moedaDeSaida.includes("BRL") ? 2 : 8

    document.querySelector(".saida .valor").value = valorDeSaida

}

function fillincoinlist(select, moedas) {
    const selecao = select.value
    select.innerHTML = ""
    moedas.forEach(moeda => {
        const option = document.createElement("option")
        option.value = moeda
        option.innerHTML = moeda
        select.appendChild(option)
    })
    select.value = selecao

}

function fillincoin() {
    let moedas = dadosDeConversao.cotacoes.map(cotacao => cotacao.moeda)
    moedas.push("BTC")
    moedas = moedas.filter(moeda => moeda).sort()

    fillincoinlist(document.querySelector(".entrada .moeda", moedas), moedas)
    fillincoinlist(document.querySelector(".saida .moeda", moedas), moedas)
}

async function Converter() {
    await dataReceiving()
    fillincoin ()
    await ReceivingParameters()
    await calculateResult()
}

Converter()