const timerValueElement = document.querySelector(".timer-value");
const startButton = document.querySelector(".start");
const pauseButton = document.querySelector(".pause");

let countdown;
let minutes = 25; // Initial Pomodoro duration in minutes
let seconds = 0;

function updateTimerDisplay() {
  timerValueElement.textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function startTimer() {
  clearInterval(countdown);
  countdown = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(countdown);
        console.log("Pomodoro complete!");
        // Aqui você pode adicionar uma notificação, tocar música, etc.
      } else {
        minutes--;
        seconds = 59;
      }
    } else {
      seconds--;
    }
    updateTimerDisplay();
  }, 1000);
}

startButton.addEventListener("click", () => {
  startTimer();
});

pauseButton.addEventListener("click", () => {
  clearInterval(countdown);
  console.log("Timer paused");
});

updateTimerDisplay();
