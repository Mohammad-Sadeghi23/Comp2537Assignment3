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

// Event listeners for buttons and theme change
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

// Function to start the game
// This function initializes the game based on the selected difficulty level
// It sets the number of pairs, resets the game state, and starts the timer
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

// Function to generate Pokemon cards
// This function creates a set of unique Pokemon cards based on the count provided
// It uses the PokeAPI to fetch the images and returns an array of card objects
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

// Function to render the cards on the game grid
// This function creates the card elements and appends them to the grid
// It also sets the grid layout based on the selected difficulty level
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

// Function to handle card click events
// This function checks if the clicked card is valid, flips it, and checks for matches
// If a match is found, it disables the cards; otherwise, it flips them back after a delay
// It also updates the game status and checks for win conditions
// If the player has used the power-up, it will not be available again
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

// Function to reset the flipped cards
function resetFlipped() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

// Function to start the timer
// This function initializes the timer and updates the status every second
// If the time runs out, it disables all cards and shows a game over message
// It also updates the status with the remaining time and elapsed time
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

// Function to update the game status
// This function updates the status display with the current game state
// It shows the total pairs, matches, pairs left, clicks, and time remaining
function updateStatus() {
  const status = document.getElementById("status");
  const left = totalPairs - matches;
  status.textContent = `Total pairs: ${totalPairs} | Matches: ${matches} | Pairs left: ${left} 
  | Clicks: ${clicks} | You got ${secondsLeft} seconds left | ${secondsPassed} seconds have passed`;
}

// Function to disable all cards
// This function replaces all card elements with clones to disable events
// It prevents any further interaction with the cards after the game ends
function disableAllCards() {
  document.querySelectorAll(".card").forEach(card => {
    card.replaceWith(card.cloneNode(true)); // disables all events
  });
}

// Function to trigger the power-up
// This function activates the power-up, giving the player bonus time
// It sets the powerUsed flag to true and updates the status display
function triggerPowerUp() {
  powerUsed = true;
  secondsLeft += 3; // give bonus time
  updateStatus();
  alert("Power-Up Activated! +3 seconds");
}
