const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form');

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}

const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash"
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const pergunta = `
      ## Especialidade
      Você é um especialista no universo dos jogos clássicos da Nintendo, especialmente no jogo ${game}.

      ## Tarefa
      Responda com base no seu conhecimento sobre curiosidades, fases secretas, personagens, chefes, truques e dicas úteis desse jogo.

      ## Regras
      - Use apenas referências dos jogos originais, sem inventar mecânicas modernas.
      - Se a pergunta estiver fora do universo Nintendo, diga: "Essa pergunta não está relacionada ao universo da Nintendo."
      - Se não souber a resposta, diga apenas: "Não sei."
      - Considere a data atual: ${new Date().toLocaleDateString()}.

      ## Resposta
      - Seja direto e responda com no máximo 500 caracteres.
      - Responda de forma clara, divertida e em markdown.
      - Não inclua saudações ou despedidas; vá direto ao ponto.

      ## Exemplo de resposta
      Pergunta: Como pegar a flauta no Mario 3?  
      Resposta: Vá até o mundo 1-3, entre no fundo da tela após o bloco branco e siga até o fim. A flauta estará escondida!

      ---
      Aqui está a pergunta do usuário: ${question}`

  const contents = [{
    role: "user",
    parts: [{
      text: pergunta
    }]
  }]

  const tools = [{
    google_search: {}
  }]

  // chamada API
  const response = await fetch(geminiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
  event.preventDefault()
  const apiKey = apiKeyInput.value
  const game = gameSelect.value
  const question = questionInput.value

  if (apiKey == '' || game == '' || question == '') {
    alert('Por favor, preencha todos os campos')
    return
  }

  askButton.disabled = true
  askButton.textContent = 'Trabalhando nisso...'
  askButton.classList.add('loading')

  try {
    const text = await perguntarAI(question, game, apiKey)
    aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
    aiResponse.classList.remove('hidden')
  } catch (error) {
    console.log('Erro: ', error)
  } finally {
    askButton.disabled = false
    askButton.textContent = "Perguntar"
    askButton.classList.remove('loading')
  }
}

form.addEventListener('submit', enviarFormulario)