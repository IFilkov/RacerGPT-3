document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const startButton = document.getElementById("startButton");
    const sliders = document.querySelectorAll(".slider");
    const betSliders = document.querySelectorAll(".bet-slider");
    const balanceDisplay = document.getElementById("balanceValue");
    const endMessage = document.getElementById("endMessage");
    
    const carWidth = 40;
    const carHeight = 20;
    
    // Массив с параметрами каждой машинки
    const carParams = [
        { speed: 5, speedMin: 2, speedMax: 8 },
        { speed: 5, speedMin: 3, speedMax: 7 },
        { speed: 5, speedMin: 4, speedMax: 6 },
        { speed: 5, speedMin: 1, speedMax: 9 }
    ];
    
    let cars = [];
    let animationFrameId;
    let balance = 1000; // Начальный баланс игрока
    let maxBalance = 1000; // Максимальный баланс за игру
    
    // Отображение машинок на canvas при загрузке страницы
    draw();
    
    startButton.addEventListener("click", startGame);

    // Обработчик изменения положения ползунка
    sliders.forEach((slider, index) => {
        slider.addEventListener("input", function() {
            carParams[index].speed = parseFloat(this.value);
        });
    });

    // Обработчик изменения положения ползунка ставки
    betSliders.forEach((slider, index) => {
        slider.addEventListener("input", function() {
            updateBet(index, parseFloat(this.value));
        });
    });

    function startGame() {
        resizeCanvas();
        balance = 1000; // Сброс баланса при начале новой игры
        maxBalance = 1000; // Сброс максимального баланса за игру
        updateBalanceDisplay();
        endMessage.classList.add("hidden"); // Скрыть сообщение об окончании игры
        cars = [];
        for (let i = 0; i < 4; i++) {
            const params = carParams[i];
            const car = {
                x: 0,
                y: i * (canvas.height / 4) + 100, // Сдвигаем машинки на 20px вниз
                color: getRandomColor(),
                speed: getRandomSpeed(params.speedMin, params.speedMax) + params.speed
            };
            cars.push(car);
        }
        draw(); // Отобразить машинки на исходной позиции
        animate();
    }
    

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 200; // высота контролов и сообщения об окончании игры
    }

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function getRandomSpeed(min, max) {
        return Math.random() * (max - min) + min;
    }

    function drawCar(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, carWidth, carHeight);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let car of cars) {
            drawCar(car.x, car.y, car.color);
        }
    }

    function moveCars() {
        for (let car of cars) {
            car.x += car.speed;
            if (car.x > canvas.width) {
                car.x = 0 - carWidth;
                handleWinner(car);
            }
        }
    }

    function handleWinner(winningCar) {
        const winningIndex = cars.indexOf(winningCar);
        const betAmount = parseFloat(betSliders[winningIndex].value);
        const lowestBetIndex = getLowestBetIndex();
        if (winningIndex === lowestBetIndex) {
            balance -= 500; // Уменьшаем баланс на 500, если машинка с наименьшей ставкой выиграла
        } else {
            if (winningIndex === getHighestBetIndex()) {
                balance += betAmount; // Плюсуем ставку к балансу, если машинка с максимальной ставкой выиграла
            } else {
                balance -= betAmount; // Вычитаем ставку из баланса, если другая машинка выиграла
            }
        }
        if (balance > maxBalance) {
            maxBalance = balance; // Обновить максимальный баланс за игру
        }
        updateBalanceDisplay();
        stopGame();
    }

    function getLowestBetIndex() {
        let lowestBetIndex = 0;
        let lowestBetAmount = parseFloat(betSliders[0].value);
        for (let i = 1; i < betSliders.length; i++) {
            const betAmount = parseFloat(betSliders[i].value);
            if (betAmount < lowestBetAmount) {
                lowestBetAmount = betAmount;
                lowestBetIndex = i;
            }
        }
        return lowestBetIndex;
    }

    function getHighestBetIndex() {
        let highestBetIndex = 0;
        let highestBetAmount = parseFloat(betSliders[0].value);
        for (let i = 1; i < betSliders.length; i++) {
            const betAmount = parseFloat(betSliders[i].value);
            if (betAmount > highestBetAmount) {
                highestBetAmount = betAmount;
                highestBetIndex = i;
            }
        }
        return highestBetIndex;
    }

    function stopGame() {
        cancelAnimationFrame(animationFrameId);
        startButton.disabled = true; // Отключить кнопку "Start" после окончания игры
        let endMessageText;
        if (balance <= 0) {
            endMessageText = `Game Over! Your maximum balance: ${maxBalance}`;
        } else {
            endMessageText = `You won! Your maximum balance: ${maxBalance}`;
        }
        endMessage.textContent = endMessageText;
        endMessage.classList.remove("hidden"); // Показать сообщение об окончании игры
    }

    function animate() {
        moveCars();
        draw();
        if (balance > 0) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            stopGame();
        }
    }

    // Обновить размеры Canvas при изменении размера окна
    window.addEventListener("resize", function() {
        resizeCanvas();
        draw(); // Обновить отображение машинок при изменении размеров
    });

    function updateBalanceDisplay() {
        balanceDisplay.textContent = balance;
    }

    function updateBet(index, value) {
        if (value > balance) {
            betSliders[index].value = balance; // Ограничить ставку максимальным балансом игрока
        }
        updateBalanceDisplay(); // Обновить отображение баланса при изменении ставки
    }
});
