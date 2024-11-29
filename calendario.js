let timerInterval;
let circleProgress = document.querySelector('.circle-progress');
let timeDisplay = document.getElementById('time');

function atualizarCronometro() {
    let options = { timeZone: "America/Sao_Paulo", hour12: false };
    let now = new Date();
    let brazilTime = new Intl.DateTimeFormat('pt-BR', options).format(now);
    let [hours, minutes, seconds] = brazilTime.split(':');

    timeDisplay.innerHTML = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    let totalSeconds = (parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseInt(seconds);
    let totalDaySeconds = 86400; 

    let percentage = (totalSeconds / totalDaySeconds) * 100;

    circleProgress.style.strokeDasharray = `${percentage}, 100`;

    let colorValue = Math.floor((percentage * 255) / 100); 
    circleProgress.style.stroke = `rgb(${255 - colorValue}, ${colorValue}, 255)`;
}

timerInterval = setInterval(atualizarCronometro, 1000);
