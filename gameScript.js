document.addEventListener("DOMContentLoaded", function () {
    const tg = window.Telegram.WebApp;
    const gameContainer = document.querySelector(".game-container");
    const grid = document.getElementById("grid");
    const timerDisplay = document.getElementById("timer");
    const scoreDisplay = document.getElementById("score");
    const timerText = document.getElementById("timer-text");
    const progressCircle = document.querySelector(".circle-progress");
    const scoreText = document.getElementById("button-text");
    const FULL_DASH_ARRAY = 2 * Math.PI * 30; // Длина окружности
const TIME_LIMIT = 60; // Время таймера (в секундах)
let timeLeft = TIME_LIMIT;
    let score=0;
    let totalScore=0;
    const backImage = "./src/back.png";
    const frontImage = "./src/front.png";

    // Ensure the WebApp is ready
    tg.ready();
     // Load user data from server
     async function loadUserData() {
        try {
           const user = tg.initDataUnsafe?.user || {};
            const userId = user.id;

            const response = await fetch(`https://servertg.onrender.com/api/getUserData?userId=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const userData = await response.json();
                
                totalScore = userData.points;
             scoreText.textContent = totalScore; 
                alert("User data loaded:", userData);
            } else {
                alert("Failed to load user data:", await response.text());
            }
        } catch (error) {
            alert("Error loading user data:", error);
        }
    }
    async function sendUserDataToServer() {
        try {
            const user = tg.initDataUnsafe?.user || {};
             const updatedTotalScore = totalScore + score; // Обновляем общий счет
            const userData = {
                userId: user.id,
                username: user.username || "0",
                firstName: user.first_name || "0",
                lastName: user.last_name || "0",
                sessionStarts: parseInt(0) || 0,
                sessionEnds: parseInt(0) || 0,
                points: updatedTotalScore,
                boostsUsed: parseInt(0) || 0,
            };

            const response = await fetch("https://servertg.onrender.com/api/saveUserData", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                alert("User data successfully sent to the server!");
            } else {
                const errorText = await response.text();
                console.error("Error saving user data:", errorText);
                alert("Failed to send user data to the server.");
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("An error occurred while sending data to the server.");
        }
    }

    function startGame() {
        loadUserData();
        generateGrid();
        startTimer();
    }

    function generateGrid() {
        grid.innerHTML = "";
        for (let i = 0; i < 9; i++) {
            const gridItem = document.createElement("div");
            gridItem.classList.add("grid-item");

            const img = document.createElement("img");
            img.src = backImage;
            gridItem.appendChild(img);

            let isFront = false;
            let clickedOnce = false;

            gridItem.addEventListener("click", () => {
                if (!isFront) {
                    img.src = frontImage;
                    score++;
                    isFront = true;
                    clickedOnce = true;
                } else if (clickedOnce) {
                    score++;
                    clickedOnce = false;
                }

                setTimeout(() => {
                    img.src = backImage;
                    isFront = false;
                    clickedOnce = false;
                }, 1000);
            });

            grid.appendChild(gridItem);
        }
    }

    function startTimer() {
        const timerInterval = setInterval(() => {
            timeLeft -= 0.5; // Уменьшение на 0.5 для обновления каждые 500 мс
            updateTimer();
    
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame();
            }
        }, 500); // Интервал уменьшен до 500 мс
    }
    
    function updateTimer() {
        timerText.textContent = Math.ceil(timeLeft); // Округление вверх для отображения целых чисел
        const offset = -(FULL_DASH_ARRAY / TIME_LIMIT) * (TIME_LIMIT - timeLeft);
        progressCircle.style.strokeDashoffset = offset;
    }
    

    function endGame() {
        alert(`Game Over! Your score is ${score}`);
        sendUserDataToServer();
    }

    startGame();
});
