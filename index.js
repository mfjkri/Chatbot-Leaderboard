let rank = 0;
let lastScore = -1;
let lastLeaderboardString = null;

const body = document.querySelector(".body");
const dataFileInput = document.getElementById("datafile");
const rankList = document.querySelector(".rank-list");
const loaderSVG = document.querySelector(".loader");
const pausedLabel = document.querySelector(".pausedText");

function safelyParseJSON(json) {
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (err) {}
  return parsed;
}

function clearLeaderboard() {
  rank = 0;
  lastScore = -1;

  while (rankList.firstChild) {
    rankList.firstChild.remove();
  }
}

function showLeaderboard() {
  loaderSVG.classList.remove("hide");
  pausedLabel.classList.add("hide");
}

function hideLeaderboard() {
  loaderSVG.classList.add("hide");
  pausedLabel.classList.remove("hide");
  clearLeaderboard();
}

function loadLeaderboard(placings) {
  clearLeaderboard();
  placings.forEach(function (placing, idx) {
    let username = placing.username;
    let points = placing.score;

    if (lastScore !== points) {
      lastScore = points;
      rank++;
    }

    let rankClass = "";
    let rankTitle = rank;
    switch (rank) {
      case 1:
        rankTitle = `<div class = "medal">🥇</div>`;
        rankClass = "first";
        break;
      case 2:
        rankTitle = `<div class = "medal">🥈</div>`;
        rankClass = "second";
        break;
      case 3:
        rankTitle = `<div class = "medal">🥉</div>`;
        rankClass = "third";
        break;

      default:
        rankTitle = rank;
        rankClass = "";
    }

    let new_placing = document.createElement("li");
    new_placing.setAttribute("class", `user ${rankClass} zoom`);
    new_placing.innerHTML = `
        <div class="rank">${rankTitle}</div>
        <div class="username"><p>${username}</p></div>
        <div class="points">${points} pts</div>`;

    rankList.appendChild(new_placing);
  });
}

function updateLeaderboard() {
  let leaderboardFile = new XMLHttpRequest();
  let url = window.location.origin; //"http://localhost:5500/";
  leaderboardFile.open("GET", `${url}/leaderboard.json`, true);
  leaderboardFile.send();
  leaderboardFile.onreadystatechange = function () {
    if (leaderboardFile.readyState == 4) {
      if (leaderboardFile.status == 200) {
        let currentDate = new Date();
        let time =
          currentDate.getHours() +
          ":" +
          currentDate.getMinutes() +
          ":" +
          currentDate.getSeconds();
        // console.log(time, `loaded ${url}/leaderboard.txt`);
        const leaderboardString = leaderboardFile.responseText;

        if (lastLeaderboardString != leaderboardString) {
          lastLeaderboardString = leaderboardString;

          const json = safelyParseJSON(leaderboardFile.responseText);

          if (json) {
            if (json.hasOwnProperty("paused")) {
              hideLeaderboard();
            } else {
              showLeaderboard();

              let leaderboardList = [];
              for (const [key, value] of Object.entries(json)) {
                leaderboardList.push(value);
              }

              loadLeaderboard(leaderboardList);
            }
          } else {
            loadLeaderboard([]);
          }
        }
      }
    }
  };
}

function startTimer(timerDuration, timerLabel) {
  var timerInterval = setInterval(function () {
    timerDuration -= 1000;

    var minutes = Math.floor((timerDuration % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timerDuration % (1000 * 60)) / 1000);

    minutes = minutes > 9 ? minutes : `0${minutes}`;
    seconds = seconds > 9 ? seconds : `0${seconds}`;

    timerLabel.innerHTML = `Time left: <label class ="timerDigits">${minutes}:${seconds}</label>`;
    updateLeaderboard();

    if (timerDuration < 0) {
      clearInterval(timerInterval);
      timerLabel.innerHTML = "Time's up!";

      let fireworksParticles = document.getElementById("tsparticles");
      fireworksParticles.classList.remove("hide");
    }
  }, 1000);
}

function main() {
  let startButton = document.getElementById("start-button");
  let timerLabel = document.getElementById("timerLabel");

  startButton.addEventListener("click", function () {
    startButton.classList.add("hide");
    timerLabel.classList.remove("hide");

    startTimer(1.5 * 60 * 1000, timerLabel);
  });
}

main();
