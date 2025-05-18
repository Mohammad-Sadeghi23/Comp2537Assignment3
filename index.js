let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matches = 0;
let clicks = 0;
let totalPairs = 0;
let timerInterval = null;
let secondsLeft = 0;
let secondsPassed = 0;
let streak = 0;
let powerUsed = false;


document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("start-btn").addEventListener("click", () => {
    const level = document.getElementById("difficulty").value;
    startGame(level);
  });

  document.getElementById("reset-btn").addEventListener("click", () => location.reload());

  document.getElementById("theme").addEventListener("change", (e) => {
    document.body.className = e.target.value;
  });
});


function startGame(difficulty) {
  const pairCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 6 : 12;
  totalPairs = pairCount;
  matches = 0;
  clicks = 0;
  secondsPassed = 0;
  secondsLeft = difficulty === "easy" ? 10 : difficulty === "medium" ? 30 : 45;
  streak = 0;
  powerUsed = false;

  updateStatus();
  const cards = generatePokemonCards(pairCount);
  renderCards(cards);
  startTimer();
}

function generatePokemonCards(count) {
  const used = new Set();
  const cards = [];

  while (used.size < count) {
    const id = Math.floor(Math.random() * 898) + 1;
    if (!used.has(id)) {
      used.add(id);
      const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
      cards.push({ img: url });
    }
  }

  const fullSet = [...cards, ...cards];
  return fullSet.sort(() => Math.random() - 0.5); // shuffle
}

function renderCards(cards) {
  const grid = document.getElementById("game_grid");
  grid.innerHTML = "";

  const difficulty = document.getElementById("difficulty").value;

  if (difficulty === "easy") {
    grid.style.width = "340px";
    grid.style.gridTemplateColumns = "repeat(3, 100px)";
  } else if (difficulty === "medium") {
    grid.style.width = "440px";
    grid.style.gridTemplateColumns = "repeat(4, 100px)";
  } else if (difficulty === "hard") {
    grid.style.width = "640px";
    grid.style.gridTemplateColumns = "repeat(6, 100px)";
  }

  cards.forEach((card) => {
    const div = document.createElement("div");
    div.className = "card";
    div.dataset.img = card.img;

    div.innerHTML = `
      <div class="card-inner">
        <img class="front_face" src="${card.img}" alt="front">
        <img class="back_face" src="assets/back.webp" alt="back">
      </div>
    `;

    div.addEventListener("click", () => handleCardClick(div));
    grid.appendChild(div);
  });
}

function handleCardClick(card) {
  if (lockBoard || card.querySelector(".card-inner").classList.contains("flip")) return;

  card.querySelector(".card-inner").classList.add("flip");

  if (!firstCard) {
    firstCard = card;
  } else {
    secondCard = card;
    lockBoard = true;
    clicks++;

    const match = firstCard.dataset.img === secondCard.dataset.img;

    if (match) {
      matches++;
      streak++;

      firstCard.removeEventListener("click", handleCardClick);
      secondCard.removeEventListener("click", handleCardClick);
      resetFlipped();

      if (!powerUsed && streak === 2) {
        triggerPowerUp();
      }

      if (matches === totalPairs) {
        clearInterval(timerInterval);
        updateStatus();
        alert("You Win!");
        disableAllCards();
      }
    } else {
      streak = 0;
      setTimeout(() => {
        firstCard.querySelector(".card-inner").classList.remove("flip");
        secondCard.querySelector(".card-inner").classList.remove("flip");
        resetFlipped();
      }, 1000);
    }

    updateStatus();
  }
}

function resetFlipped() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secondsLeft--;
    secondsPassed++;
    updateStatus();

    if (secondsLeft <= 0) {
      clearInterval(timerInterval);
      alert("Time's up! Game Over.");
      disableAllCards();
    }
  }, 1000);
}

function updateStatus() {
  const status = document.getElementById("status");
  const left = totalPairs - matches;
  status.textContent = `Total pairs: ${totalPairs} | Matches: ${matches} | Pairs left: ${left} 
  | Clicks: ${clicks} | You got ${secondsLeft} seconds left | ${secondsPassed} seconds have passed`;
}

function disableAllCards() {
  document.querySelectorAll(".card").forEach(card => {
    card.replaceWith(card.cloneNode(true)); // disables all events
  });
}

function triggerPowerUp() {
  powerUsed = true;
  secondsLeft += 3; // give bonus time
  updateStatus();
  alert("Power-Up Activated! +3 seconds");
}
