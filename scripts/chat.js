// Seleciona os elementos
const userInput = document.getElementById('user-input');
const sendButton = document.querySelector('.send-button');
const chatBox = document.getElementById('chat-box');
const selectedList = document.getElementById('selected-list');

// Função para verificar o estado do botão de envio
function defineUpdateButtonState() {
    if (userInput.value.trim() === '') {
        sendButton.classList.add('disabled');
        sendButton.disabled = true;
    } else {
        sendButton.classList.remove('disabled');
        sendButton.disabled = false;
    }
}

// Adiciona evento ao campo de texto
userInput.addEventListener('input', defineUpdateButtonState);
defineUpdateButtonState(); // Garante o estado correto ao carregar a página

// Função para enviar mensagem
async function sendMessage() {
    const userInputValue = userInput.value.trim();
    if (!userInputValue) return;

    addChatMessage(userInputValue, 'user');
    userInput.value = '';
    defineUpdateButtonState();

    try {
        const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto: userInputValue })
        });

        const data = await response.json();
        const botMessage = data.resposta || `Erro: ${data.erro || 'Desconhecido'}`;
        addChatMessage(botMessage, 'bot');
    } catch (error) {
        addChatMessage('Estamos com problemas no servidor. Volte mais tarde! 😊', 'bot');
    }
}

// Adiciona evento ao botão de envio
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Adiciona mensagens ao chat
function addChatMessage(content, sender) {
    const message = document.createElement('div');
    message.className = `message ${sender}`;
    message.textContent = content;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Função para alternar visibilidade das checkboxes
function toggleCheckboxes(event, containerId) {
    event.preventDefault();
    const container = document.getElementById(containerId);
    if (container) {
        container.style.display = container.style.display === 'block' ? 'none' : 'block';
    }
}

// Função para salvar o estado das checkboxes
function saveCheckboxState() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const selectedDiseases = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.id);

    localStorage.setItem('selectedDiseases', JSON.stringify(selectedDiseases));
    updateSelectedList(selectedDiseases);
}

// Função para carregar estado das checkboxes
function loadCheckboxState() {
    const savedDiseases = JSON.parse(localStorage.getItem('selectedDiseases')) || [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.checked = savedDiseases.includes(checkbox.id);
    });

    updateSelectedList(savedDiseases);
}

// Atualiza lista exibida com itens selecionados e medicamentos relacionados
function updateSelectedList(selectedDiseases) {
    selectedList.innerHTML = '';
    const medicamentosEvitar = new Set();

    selectedDiseases.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            const listItem = document.createElement('li');
            listItem.textContent = checkbox.parentElement.textContent.trim();
            selectedList.appendChild(listItem);

            // Adiciona medicamentos relacionados
            const doenca = id.replace("-", "_");
            const medicamentos = medicamentoPorDoenca[doenca];
            if (medicamentos) {
                medicamentos.forEach(medicamento => medicamentosEvitar.add(medicamento));
            }
        }
    });

    // Exibe medicamentos a evitar
    const medicamentoList = document.getElementById('medicamento-list');
    medicamentoList.innerHTML = '';
    if (medicamentosEvitar.size > 0) {
        medicamentosEvitar.forEach(medicamento => {
            const li = document.createElement('li');
            li.textContent = medicamento;
            medicamentoList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Nenhuma contraindicação encontrada.';
        medicamentoList.appendChild(li);
    }
}

// Configura eventos das checkboxes
function setupCheckboxListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', saveCheckboxState);
    });
}

// Carregar estados e configurar eventos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadCheckboxState();
    setupCheckboxListeners();
});


// Função para determinar medicamentos a evitar com base nas doenças selecionadas
const medicamentoPorDoenca = {
    hipertensao: ["Antiinflamatórios não esteroidais", "Descongestionantes nasais"],
    arritmia: ["Betabloqueadores", "Antidepressivos tricíclicos"],
    infarto: ["Anti-inflamatórios", "Estimulantes"],
    insuficiencia_cardiaca: ["Antagonistas de cálcio", "AINEs"],
    doenca_coronaria: ["Inibidores de COX-2", "Contraceptivos hormonais"],

    diabetes: ["Corticosteroides", "Betabloqueadores"],
    obesidade: ["Ansiolíticos", "Inibidores de apetite não indicados"],
    dislipidemia: ["Estrogênios", "Álcool excessivo"],
    hipertireoidismo: ["Amiodarona", "Corticosteroides"],
    gota: ["Diuréticos tiazídicos", "Álcool"],

    asma: ["Betabloqueadores", "Aspirina"],
    bronquite: ["Tabaco", "Irritantes químicos"],
    enfisema: ["Tabaco", "Poluentes do ar"],
    fibrose_pulmonar: ["Bleomicina", "Amiodarona"],
    pneumonia: ["Imunossupressores", "Corticosteroides excessivos"],

    insuficiencia_renal: ["AINEs", "Diuréticos tiazídicos"],
    litis_renal: ["Diuréticos", "Proteínas excessivas"],
    glomerulonefrite: ["Antibióticos nefrotóxicos", "AINEs"],
    nefropatia: ["AINEs", "Metformina (em disfunção avançada)"],
    infeccao_urinaria: ["Corticosteroides", "Antibióticos inapropriados"],

    cirrose: ["Paracetamol em altas doses", "Álcool"],
    hepatite: ["Antituberculosos", "Paracetamol"],
    esteatose_hepatica: ["Corticosteroides", "Álcool"],
    colestase: ["Estrogênios", "Antibióticos hepatotóxicos"],
    insuficiencia_hepatica: ["AINEs", "Benzodiazepínicos"],

    depressao: ["Álcool", "Ansiolíticos excessivos"],
    ansiedade: ["Estimulantes", "Cafeína excessiva"],
    transtorno_bipolar: ["Antidepressivos isolados", "Álcool"],
    esquizofrenia: ["Álcool", "Drogas recreativas"],
    toc: ["Estimulantes", "Ansiolíticos excessivos"],

    epilepsia: ["Antidepressivos", "Estimulantes"],
    alzheimer: ["Anticolinérgicos", "Sedativos"],
    parkinson: ["Antipsicóticos típicos", "Metoclopramida"],
    avc: ["Contraceptivos hormonais", "Tabaco"],
    esclerose_multipla: ["Imunossupressores inapropriados", "Corticosteroides excessivos"],

    lupus: ["Sulfonamidas", "Contraceptivos hormonais"],
    artrite_reumatoide: ["Corticosteroides prolongados", "Imunossupressores excessivos"],
    esclerodermia: ["Betabloqueadores", "AINEs"],
    diabetes_tipo_1: ["Corticosteroides", "Álcool"],
    psoriase: ["Betabloqueadores", "AINEs"],

    tuberculose: ["Imunossupressores", "Corticosteroides"],
    hiv: ["Imunossupressores", "Antifúngicos hepatotóxicos"],
    gripe: ["AINEs", "Antitussígenos excessivos"],
    dengue: ["AINEs", "Anticoagulantes"],
    malaria: ["Álcool", "Imunossupressores"],
};

function determinarMedicamentos() {
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    const medicamentosEvitar = new Set();
    const doencasSelecionadas = [];

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            const doenca = checkbox.id.replace("-", "_");
            doencasSelecionadas.push(doenca);
            const medicamentos = medicamentoPorDoenca[doenca];
            if (medicamentos) {
                medicamentos.forEach((medicamento) => medicamentosEvitar.add(medicamento));
            }
        }
    });

    // Exibir medicamentos a evitar com base nas doenças selecionadas
    const resultado = document.getElementById("selected-list");
    resultado.innerHTML = "";

    if (medicamentosEvitar.size > 0) {
        medicamentosEvitar.forEach((medicamento) => {
            const li = document.createElement("li");
            li.textContent = medicamento;
            resultado.appendChild(li);
        });
    } else {
        const li = document.createElement("li");
        li.textContent = "Nenhuma contraindicação encontrada.";
        resultado.appendChild(li);
    }

    // Respostas personalizadas com base nas combinações de doenças
    if (doencasSelecionadas.length > 1) {
        const interacoes = detectarInteracoes(doencasSelecionadas);
        if (interacoes.length > 0) {
            const interacoesLi = document.createElement("li");
            interacoesLi.textContent = `Combinações de doenças que exigem mais cuidado: ${interacoes.join(', ')}`;
            resultado.appendChild(interacoesLi);
        }
    }
}

function detectarInteracoes(doencas) {
    const interacoes = [];

    // Doenças Cardiovasculares
    if (doencas.includes("hipertensao") && doencas.includes("insuficiencia-cardiaca")) {
        interacoes.push("Hipertensão e insuficiência cardíaca podem exigir medicamentos específicos para o controle da pressão arterial e da função cardíaca.");
    }
    if (doencas.includes("arritmia") && doencas.includes("infarto")) {
        interacoes.push("Arritmias podem ser mais graves após um infarto, exigindo monitoramento constante da função cardíaca.");
    }
    if (doencas.includes("doenca-coronaria") && doencas.includes("hipertensao")) {
        interacoes.push("Hipertensão e doença coronária exigem um controle rigoroso da pressão arterial para evitar complicações cardíacas.");
    }

    // Doenças Metabólicas
    if (doencas.includes("diabetes") && doencas.includes("obesidade")) {
        interacoes.push("Diabetes e obesidade exigem um controle conjunto de peso e glicose para prevenir complicações a longo prazo.");
    }
    if (doencas.includes("dislipidemia") && doencas.includes("diabetes")) {
        interacoes.push("Dislipidemia e diabetes podem aumentar o risco de doenças cardiovasculares, exigindo um controle rigoroso dos lipídios e da glicose.");
    }
    if (doencas.includes("hipertireoidismo") && doencas.includes("diabetes")) {
        interacoes.push("Hipertireoidismo pode agravar os sintomas do diabetes, aumentando a resistência à insulina.");
    }
    if (doencas.includes("gota") && doencas.includes("diabetes")) {
        interacoes.push("A gota e o diabetes podem ser exacerbados por dietas inadequadas e devem ser tratadas com foco no controle alimentar.");
    }

    // Doenças Respiratórias
    if (doencas.includes("asma") && doencas.includes("bronquite")) {
        interacoes.push("Asma e bronquite podem ter sintomas sobrepostos, exigindo controle rigoroso com broncodilatadores.");
    }
    if (doencas.includes("enfisema") && doencas.includes("bronquite")) {
        interacoes.push("Enfisema e bronquite podem agravar os sintomas respiratórios, sendo necessário um plano de tratamento integrado.");
    }
    if (doencas.includes("fibrose-pulmonar") && doencas.includes("asma")) {
        interacoes.push("Fibrose pulmonar e asma podem causar dificuldades respiratórias severas, exigindo uma abordagem terapêutica especializada.");
    }

    // Doenças Renais
    if (doencas.includes("insuficiencia-renal") && doencas.includes("hipertensao")) {
        interacoes.push("Insuficiência renal e hipertensão podem agravar-se mutuamente, necessitando de medicamentos específicos para controlar a pressão arterial sem prejudicar os rins.");
    }
    if (doencas.includes("litis-renal") && doencas.includes("infeccao-urinaria")) {
        interacoes.push("Litíase renal e infecções urinárias podem ocorrer simultaneamente, aumentando o risco de complicações nos rins.");
    }
    if (doencas.includes("glomerulonefrite") && doencas.includes("nefropatia")) {
        interacoes.push("Glomerulonefrite e nefropatia podem ser formas de doença renal que exigem tratamentos específicos para evitar insuficiência renal.");
    }

    // Doenças Hepáticas
    if (doencas.includes("cirrose") && doencas.includes("hepatite")) {
        interacoes.push("A cirrose pode ser uma complicação da hepatite crônica, exigindo acompanhamento rigoroso da função hepática.");
    }
    if (doencas.includes("esteatose-hepatica") && doencas.includes("obesidade")) {
        interacoes.push("Esteatose hepática e obesidade frequentemente estão associadas, exigindo controle rigoroso da alimentação e acompanhamento médico.");
    }
    if (doencas.includes("insuficiencia-hepatica") && doencas.includes("cirrose")) {
        interacoes.push("A insuficiência hepática pode ser uma complicação da cirrose, necessitando de cuidados intensivos para prevenir falência hepática.");
    }
    // Doenças Psiquiátricas
    if (doencas.includes("depressao") && doencas.includes("ansiedade")) {
        interacoes.push("Depressão e ansiedade frequentemente ocorrem juntas, e um tratamento combinado pode ser necessário para ambas.");
    }
    if (doencas.includes("transtorno-bipolar") && doencas.includes("depressao")) {
        interacoes.push("Pacientes com transtorno bipolar e depressão devem ser monitorados de perto, pois o uso inadequado de antidepressivos pode induzir episódios maníacos.");
    }

    // Doenças Neurológicas
    if (doencas.includes("alzheimer") && doencas.includes("parkinson")) {
        interacoes.push("Alzheimer e Parkinson podem ter sintomas neurológicos semelhantes, exigindo tratamentos integrados para manejo dos sintomas.");
    }
    if (doencas.includes("esclerose-multipla") && doencas.includes("avc")) {
        interacoes.push("Esclerose múltipla e AVC podem causar perda de função neurológica, exigindo uma abordagem conjunta para reabilitação.");
    }

    // Doenças Autoimunes
    if (doencas.includes("lupus") && doencas.includes("artrite-reumatoide")) {
        interacoes.push("Lúpus e artrite reumatoide são doenças autoimunes que podem exigir tratamentos imunossupressores, o que pode aumentar o risco de infecções.");
    }
    if (doencas.includes("esclerodermia") && doencas.includes("diabetes-tipo-1")) {
        interacoes.push("Esclerodermia e diabetes tipo 1 podem coexistir, exigindo monitoramento cuidadoso do controle glicêmico e das complicações vasculares.");
    }

    // Doenças Infecciosas
    if (doencas.includes("tuberculose") && doencas.includes("hiv")) {
        interacoes.push("Tuberculose e HIV frequentemente ocorrem juntas, exigindo tratamento simultâneo com antibióticos e antirretrovirais.");
    }
    if (doencas.includes("dengue") && doencas.includes("malaria")) {
        interacoes.push("Dengue e malária podem coexistir em áreas endêmicas, e o tratamento deve ser cuidadosamente ajustado para evitar interações entre os medicamentos.");
    }
        // Doenças Cardiovasculares
        if (doencas.includes("arrítmia") && doencas.includes("insuficiencia-cardiaca")) {
            interacoes.push("Arritmias podem ser exacerbadas pela insuficiência cardíaca, necessitando de cuidados específicos para estabilizar o ritmo cardíaco.");
        }
        if (doencas.includes("infarto") && doencas.includes("doenca-coronaria")) {
            interacoes.push("O infarto pode ser uma consequência de doença coronária, exigindo monitoramento rigoroso após eventos cardíacos.");
        }
    
        // Doenças Metabólicas
        if (doencas.includes("hipertireoidismo") && doencas.includes("dislipidemia")) {
            interacoes.push("Hipertireoidismo pode interferir no controle lipídico, agravando a dislipidemia e aumentando o risco de complicações cardiovasculares.");
        }
        if (doencas.includes("gota") && doencas.includes("diabetes")) {
            interacoes.push("A gota e o diabetes podem se agravar mutuamente, com aumento do risco de complicações renais e metabólicas.");
        }
    
        // Doenças Respiratórias
        if (doencas.includes("asma") && doencas.includes("fibrose-pulmonar")) {
            interacoes.push("A combinação de asma e fibrose pulmonar pode prejudicar a função respiratória e exigir ajustes no tratamento respiratório.");
        }
        if (doencas.includes("bronquite") && doencas.includes("enfisema")) {
            interacoes.push("Bronquite crônica e enfisema são ambos tipos de DPOC (Doença Pulmonar Obstrutiva Crônica), que exigem manejo combinado para melhorar a qualidade de vida.");
        }
    
        // Doenças Renais
        if (doencas.includes("insuficiencia-renal") && doencas.includes("litis-renal")) {
            interacoes.push("Insuficiência renal pode ser exacerbada por litíase renal, causando dor intensa e complicações adicionais nos rins.");
        }
        if (doencas.includes("glomerulonefrite") && doencas.includes("nefropatia")) {
            interacoes.push("A glomerulonefrite pode resultar em nefropatia crônica, o que exige monitoramento contínuo da função renal.");
        }
    
        // Doenças Hepáticas
        if (doencas.includes("cirrose") && doencas.includes("hepatite")) {
            interacoes.push("A cirrose hepática pode ser uma complicação avançada da hepatite, exigindo tratamento específico para proteger o fígado.");
        }
        if (doencas.includes("esteatose-hepatica") && doencas.includes("dislipidemia")) {
            interacoes.push("A esteatose hepática e a dislipidemia estão frequentemente associadas, podendo agravar problemas hepáticos e cardiovasculares.");
        }
    
        // Doenças Psiquiátricas
        if (doencas.includes("depressao") && doencas.includes("ansiedade")) {
            interacoes.push("Depressão e ansiedade frequentemente coexistem e exigem um tratamento combinado para aliviar os sintomas de ambos.");
        }
        if (doencas.includes("transtorno-bipolar") && doencas.includes("esquizofrenia")) {
            interacoes.push("O transtorno bipolar e a esquizofrenia podem ter sintomas semelhantes, exigindo uma abordagem de tratamento especializada para evitar agravamentos.");
        }
    
        // Doenças Neurológicas
        if (doencas.includes("epilepsia") && doencas.includes("avc")) {
            interacoes.push("Epilepsia pode ser desencadeada após um acidente vascular cerebral (AVC), exigindo tratamento anticonvulsivante após o evento.");
        }
        if (doencas.includes("parkinson") && doencas.includes("esclerose-multipla")) {
            interacoes.push("Parkinson e esclerose múltipla podem ter sintomas neurológicos sobrepostos, exigindo um plano de manejo detalhado para cada condição.");
        }
        // Doenças Autoimunes
        if (doencas.includes("lupus") && doencas.includes("artrite-reumatoide")) {
            interacoes.push("Lúpus e artrite reumatoide são doenças autoimunes que podem causar inflamação nas articulações, exigindo monitoramento conjunto.");
        }
        if (doencas.includes("esclerodermia") && doencas.includes("psoriase")) {
            interacoes.push("A esclerodermia e a psoríase são condições autoimunes que podem afetar a pele, necessitando de cuidados dermatológicos especializados.");
        }
        // Doenças Infecciosas
        if (doencas.includes("hiv") && doencas.includes("tuberculose")) {
            interacoes.push("O HIV pode enfraquecer o sistema imunológico, tornando o tratamento da tuberculose mais desafiador e exigindo cuidados intensivos.");
        }
        if (doencas.includes("malaria") && doencas.includes("dengue")) {
            interacoes.push("Malária e dengue podem causar sintomas semelhantes, como febre e dores no corpo, complicando o diagnóstico e tratamento.");
        }
// Doenças Cardiovasculares
if (doencas.includes("hipertensao") && doencas.includes("doenca-coronaria")) {
    interacoes.push("Hipertensão pode agravar a doença coronária, aumentando o risco de infarto e complicações cardíacas.");
}
if (doencas.includes("arritmia") && doencas.includes("infarto")) {
    interacoes.push("Arritmias podem ser um efeito colateral do infarto, necessitando de tratamento para controlar o ritmo cardíaco.");
}

// Doenças Metabólicas
if (doencas.includes("diabetes") && doencas.includes("hipertireoidismo")) {
    interacoes.push("Diabetes pode ser complicado pelo hipertireoidismo, pois este último pode afetar o controle glicêmico.");
}
if (doencas.includes("obesidade") && doencas.includes("dislipidemia")) {
    interacoes.push("Obesidade pode exacerbar a dislipidemia, resultando em níveis elevados de colesterol e triglicerídeos.");
}

// Doenças Respiratórias
if (doencas.includes("asma") && doencas.includes("enfisema")) {
    interacoes.push("A combinação de asma e enfisema pode prejudicar a função pulmonar e exigir um tratamento combinado.");
}
if (doencas.includes("fibrose-pulmonar") && doencas.includes("pneumonia")) {
    interacoes.push("A fibrose pulmonar pode agravar a pneumonia, resultando em maior risco de complicações respiratórias.");
}
// Doenças Renais
if (doencas.includes("insuficiencia-renal") && doencas.includes("infeccao-urinaria")) {
    interacoes.push("Infecções urinárias podem agravar a insuficiência renal, tornando o tratamento mais complexo.");
}
if (doencas.includes("nefropatia") && doencas.includes("litis-renal")) {
    interacoes.push("Litíase renal pode agravar a nefropatia, causando dor intensa e comprometendo a função renal.");
}

// Doenças Hepáticas
if (doencas.includes("cirrose") && doencas.includes("insuficiencia-hepatica")) {
    interacoes.push("A cirrose pode levar à insuficiência hepática, necessitando de acompanhamento médico constante.");
}
if (doencas.includes("hepatite") && doencas.includes("esteatose-hepatica")) {
    interacoes.push("A hepatite pode causar esteatose hepática, prejudicando ainda mais a função do fígado.");
}
// Doenças Psiquiátricas
if (doencas.includes("depressao") && doencas.includes("transtorno-bipolar")) {
    interacoes.push("A depressão pode se manifestar como parte do transtorno bipolar, exigindo um plano de tratamento específico.");
}
if (doencas.includes("esquizofrenia") && doencas.includes("ansiedade")) {
    interacoes.push("A esquizofrenia pode ser exacerbada por sintomas de ansiedade, necessitando de abordagem terapêutica integrada.");
}
// Doenças Neurológicas
if (doencas.includes("alzheimer") && doencas.includes("parkinson")) {
    interacoes.push("A combinação de Alzheimer e Parkinson pode resultar em uma deterioração cognitiva e motora mais rápida.");
}
if (doencas.includes("esclerose-multipla") && doencas.includes("avc")) {
    interacoes.push("A esclerose múltipla pode aumentar a vulnerabilidade ao AVC, tornando o tratamento neurológico mais desafiador.");
}
// Doenças Autoimunes
if (doencas.includes("lupus") && doencas.includes("psoriase")) {
    interacoes.push("Lúpus e psoríase são doenças autoimunes que podem afetar a pele e as articulações, exigindo monitoramento conjunto.");
}
if (doencas.includes("artrite-reumatoide") && doencas.includes("esclerodermia")) {
    interacoes.push("Artrite reumatoide e esclerodermia podem ter efeitos semelhantes sobre as articulações e a pele, necessitando de tratamento especializado.");
}
// Doenças Infecciosas
if (doencas.includes("hiv") && doencas.includes("gripe")) {
    interacoes.push("O HIV pode enfraquecer o sistema imunológico, tornando o tratamento da gripe mais difícil e prolongado.");
}
if (doencas.includes("dengue") && doencas.includes("malaria")) {
    interacoes.push("Dengue e malária podem causar febres e dores no corpo semelhantes, complicando o diagnóstico e tratamento adequado.");
}
    return interacoes;

}


// Adicionar evento para atualizar a lista quando a seleção mudar
const checkboxes = document.querySelectorAll("input[type='checkbox']");
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", determinarMedicamentos);
});

// Função para reiniciar todas as seleções e limpar os dados
function resetSelections() {
    // Desmarcar todas as checkboxes
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });

    // Limpar a lista de medicamentos exibidos
    const medicamentoList = document.getElementById("medicamento-list");
    medicamentoList.innerHTML = '';

    // Limpar a lista de itens selecionados
    const selectedList = document.getElementById("selected-list");
    selectedList.innerHTML = '';

    // Remover informações armazenadas no localStorage
    localStorage.removeItem('selectedDiseases');

    // Atualizar botão de envio (se necessário)
    const userInput = document.getElementById('user-input');
    userInput.value = '';
    defineUpdateButtonState();
}

// Adicionar evento ao botão de reiniciar
const resetButton = document.querySelector('.reset-button');
resetButton.addEventListener('click', resetSelections);

function gerarRelatorioPDF() {
    // Obtém as listas
    const selectedListItems = document.querySelectorAll('#selected-list li');
    const medicamentoListItems = document.querySelectorAll('#medicamento-list li');

    // Coletar as doenças selecionadas
    const selectedDiseases = Array.from(document.querySelectorAll("input[type='checkbox']:checked"))
        .map(checkbox => checkbox.id.replace("-", "_"));

    // Chamar a função detectarInteracoes para obter interações entre doenças
    const interacoes = detectarInteracoes(selectedDiseases);

    // Cria uma nova instância do jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurações de fontes e cores
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Cor do texto
    doc.setFillColor(255, 255, 255); // Cor de fundo

    // Título do relatório
    let title = 'Relatório de Comorbidades e Medicamentos a Evitar';
    let titleFontSize = 24;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(169, 169, 169); // Cor do título

    // Verifica o comprimento do título e ajusta o tamanho da fonte se necessário
    while (doc.getTextWidth(title) > 170) { // Largura máxima da linha, ajustada para 170mm
        titleFontSize -= 2; // Diminui o tamanho da fonte
        doc.setFontSize(titleFontSize);
    }

    // Adiciona o título com tamanho ajustado
    doc.text(title, 20, 20);

    // Adiciona a data e hora
    const currentDate = new Date();
    const dateString = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

    doc.setFontSize(12); // Tamanho da fonte para a data
    doc.setTextColor(150, 150, 150); // Cor da data (cinza)
    doc.text(`Data e Hora: ${dateString}`, 20, 30);

    // Linha de separação para uma aparência mais limpa
    doc.setDrawColor(169, 169, 169); // Cor da linha
    doc.setLineWidth(0.5);
    doc.line(20, 34, 190, 34); // Linha abaixo do título e data

    // Comorbidades selecionadas
    let yPosition = 40;
    doc.setFontSize(18); // Tamanho da seção
    doc.setTextColor(169, 169, 169); // Cor da seção
    doc.text('Comorbidades Selecionadas:', 20, yPosition);
    yPosition += 10;

    selectedListItems.forEach(item => {
        doc.setFontSize(14); // Tamanho do texto
        doc.setTextColor(0, 0, 0); // Cor do texto
        // Verifica se o conteúdo ultrapassou o limite da página
        if (yPosition > 270) {
            doc.addPage(); // Adiciona uma nova página
            yPosition = 20; // Reinicia a posição Y
        }
        doc.text(`- ${item.textContent}`, 20, yPosition);
        yPosition += 10;
    });

    // Espaço entre as seções
    yPosition += 10;

    // Medicamentos a evitar
    doc.setTextColor(169, 169, 169); // Cor da seção
    doc.text('Medicamentos a Evitar:', 20, yPosition);
    yPosition += 10;

    medicamentoListItems.forEach(item => {
        doc.setFontSize(14); // Tamanho do texto
        doc.setTextColor(0, 0, 0); // Cor do texto
        // Verifica se o conteúdo ultrapassou o limite da página
        if (yPosition > 270) {
            doc.addPage(); // Adiciona uma nova página
            yPosition = 20; // Reinicia a posição Y
        }
        doc.text(`- ${item.textContent}`, 20, yPosition);
        yPosition += 10;
    });

    // Espaço para interações entre doenças
    if (interacoes.length > 0) {
        yPosition += 10;
        doc.setTextColor(169, 169, 169); // Cor da seção
        doc.text('Interações entre Doenças:', 20, yPosition);
        yPosition += 10;

        interacoes.forEach(interacao => {
            doc.setFontSize(14); // Tamanho do texto
            doc.setTextColor(0, 0, 0); // Cor do texto

            // Justificar o texto
            let text = `- ${interacao}`;
            let maxWidth = 170; // Largura máxima para o texto justificado
            let splitText = doc.splitTextToSize(text, maxWidth); // Divide o texto para caber na largura

            // Verifica se o conteúdo ultrapassou o limite da página
            if (yPosition + splitText.length * 10 > 270) {
                doc.addPage(); // Adiciona uma nova página
                yPosition = 20; // Reinicia a posição Y
            }

            // Adiciona o texto justificado
            splitText.forEach(line => {
                doc.text(line, 20, yPosition);
                yPosition += 10;
            });
        });
    }

    // Linha de separação final
    doc.line(20, yPosition + 5, 190, yPosition + 5); // Linha final

    // Salva o PDF
    doc.save('relatorio_comorbidades_medicamentos.pdf');
}
