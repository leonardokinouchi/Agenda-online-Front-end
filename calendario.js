let timerInterval;
let circleProgress = document.querySelector('.circle-progress');
let timeDisplay = document.getElementById('time');

function atualizarCronometro() {
    // Obtém o horário de Brasília
    let options = { timeZone: "America/Sao_Paulo", hour12: false };
    let now = new Date();
    let brazilTime = new Intl.DateTimeFormat('pt-BR', options).format(now);
    let [hours, minutes, seconds] = brazilTime.split(':');

    // Atualiza o display do tempo
    timeDisplay.innerHTML = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Calcula o percentual para o círculo (baseado no horário de Brasília)
    let totalSeconds = (parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseInt(seconds);
    let totalDaySeconds = 86400; // Total de segundos em um dia (24 horas)

    // Calcula o progresso do círculo
    let percentage = (totalSeconds / totalDaySeconds) * 100; // Percentual do tempo decorrido no dia

    // Atualiza o progresso do círculo
    circleProgress.style.strokeDasharray = `${percentage}, 100`;

    // Atualiza a cor do círculo com base no tempo
    let colorValue = Math.floor((percentage * 255) / 100); // Faz a cor mudar de acordo com o tempo
    circleProgress.style.stroke = `rgb(${255 - colorValue}, ${colorValue}, 255)`;
}

// Inicia o cronômetro
timerInterval = setInterval(atualizarCronometro, 1000);
