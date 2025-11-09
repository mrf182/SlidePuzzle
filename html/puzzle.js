var rows = 4;                 
var columns = 4;              
var imageOrder = [];          
var clickCount = 0;           
var mixExecuted = false;     
var gameOver = false;         
var isGameFinished = false;  
var canClick = false;         
var progressIntervalId = null;

function getCurrentUser() {
  return localStorage.getItem('slidePuzzleUser');
}
function getScores() {
  try {
    return JSON.parse(localStorage.getItem('slidePuzzleScores') || '{}');
  } catch (e) {
    return {};
  }
}
function getUserScore(username) {
  const scores = getScores();
  return scores[username] || 0;
}
function addScoreToUser(username, points) {
  if (!username) return;
  const scores = getScores();
  scores[username] = (scores[username] || 0) + points;
  localStorage.setItem('slidePuzzleScores', JSON.stringify(scores));
}


function buildSolvedBoard() {
  imageOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "-1"];
  var board = document.querySelector('#board');
  if (!board) return;
  board.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let tile = document.createElement('img');
      tile.id = r.toString() + c.toString();
      let value = imageOrder.shift();
      tile.src = value + '.jpg';
      tile.addEventListener('click', () => handleTileClick(tile.id));
      board.appendChild(tile);
    }
  }
}


window.addEventListener('load', function () {
  buildSolvedBoard();
  var btnS = document.getElementById('shuffle');
  if (btnS) btnS.addEventListener('click', mix);
});


function playAudio() {
  try {
    var music = document.getElementById('audio1');
    if (!music) return;
    try { music.currentTime = 0; } catch (e) { }
    var p = music.play();
    if (p && typeof p.then === 'function') {
      p.catch(function (err) { console.warn('Audio play prevented', err); });
    }
  } catch (e) {
    console.warn('playAudio error', e);
  }
}


function mix() {
  if (mixExecuted) return;
  var board = document.getElementById('board');
  if (!board) return;
  board.innerHTML = '';

  var shuffleArray = [
    ["8", "3", "2", "10", "12", "6", "1", "15", "7", "11", "9", "13", "14", "-1", "4", "5"],
    ["4", "10", "-1", "14", "5", "11", "6", "1", "2", "13", "7", "8", "15", "12", "3", "9"],
    ["4", "15", "7", "6", "3", "5", "9", "14", "12", "11", "1", "8", "10", "2", "13", "-1"],
    ["7", "1", "4", "12", "11", "-1", "3", "9", "13", "10", "15", "6", "5", "8", "2", "14"],
    ["-1", "15", "8", "7", "14", "13", "11", "1", "12", "10", "9", "2", "5", "6", "4", "3"],
    ["13", "5", "-1", "2", "11", "4", "10", "12", "8", "7", "1", "9", "6", "3", "14", "15"],
    ["1", "9", "11", "6", "7", "10", "8", "15", "4", "5", "-1", "2", "13", "14", "3", "12"],
    ["1", "7", "2", "9", "13", "4", "15", "-1", "3", "5", "6", "10", "8", "14", "11", "12"],
    ["11", "15", "12", "4", "14", "-1", "13", "1", "6", "10", "3", "5", "2", "9", "7", "8"],
    ["3", "1", "14", "10", "12", "7", "11", "-1", "5", "15", "9", "6", "2", "4", "8", "13"]
  ];

  var arrayRandom = shuffleArray[Math.floor(Math.random() * shuffleArray.length)].slice();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let tile = document.createElement('img');
      tile.id = r.toString() + c.toString();
      let value = arrayRandom.shift();
      tile.src = value + '.jpg';
      tile.addEventListener('click', () => handleTileClick(tile.id));
      board.appendChild(tile);
    }
  }


  playAudio();


  var progressBar = document.querySelector('.progress-bar');
  var duration = 300; 
  if (progressBar) {
    var existing = progressBar.querySelector('.progress-bar-filled');
    if (existing) existing.remove();

    var progressBarFilled = document.createElement('div');
    progressBarFilled.className = 'progress-bar-filled';
    progressBarFilled.style.width = '0%';
    progressBarFilled.style.height = '100%';
    progressBarFilled.style.background = 'linear-gradient(90deg,#1976d2,#42a5f5)';
    progressBar.appendChild(progressBarFilled);

    var startTime = Date.now();
    progressIntervalId = setInterval(function () {
      var elapsed = Date.now() - startTime;
      var pct = Math.min(100, (elapsed / (duration * 1000)) * 100);
      progressBarFilled.style.width = pct + '%';
      if (pct >= 100) {
        clearInterval(progressIntervalId);
        progressIntervalId = null;
      }
    }, 200);
  }

  gameTimerId = setTimeout(function () {
    if (!isGameFinished) {
      showGameOver();
    }
  }, duration * 1000);

  canClick = true;
  mixExecuted = true;
}


function handleTileClick(id) {
  if (gameOver || !canClick) return;
  const row = parseInt(id[0], 10);
  const col = parseInt(id[1], 10);

  const neighbors = [];
  if (row > 0) neighbors.push(`${row - 1}${col}`);
  if (row < rows - 1) neighbors.push(`${row + 1}${col}`);
  if (col > 0) neighbors.push(`${row}${col - 1}`);
  if (col < columns - 1) neighbors.push(`${row}${col + 1}`);

  for (let neighborId of neighbors) {
    changeNeighbor(neighborId, id);
  }

  clickCount++;
  checkWin();
}


function changeNeighbor(id, idOriginal) {
  const img = document.getElementById(id);
  if (!img) return;
  const segments = img.src.split('/');
  const filename = segments[segments.length - 1];
  if (filename === '-1.jpg') {
    const imgOriginal = document.getElementById(idOriginal);
    const imgToChange = img;
    imgToChange.src = imgOriginal.src;
    imgOriginal.src = '-1.jpg';
  }
}

function showGameOver() {
  if (document.getElementById('game-over-overlay')) return;

  if (gameTimerId) {
    clearTimeout(gameTimerId);
    gameTimerId = null;
  }
  if (progressIntervalId) {
    clearInterval(progressIntervalId);
    progressIntervalId = null;
  }

  var progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    var filled = progressBar.querySelector('.progress-bar-filled');
    if (filled && filled.parentNode) {
      filled.parentNode.removeChild(filled);
    }
  }

  try {
    var music = document.getElementById('audio1');
    if (music && !music.paused) music.pause();
  } catch (e) { }

  canClick = false;
  gameOver = true;

  const overlay = document.createElement('div');
  overlay.id = 'game-over-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: '10000', opacity: '0', transition: 'opacity 240ms ease'
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    width: 'min(92%, 540px)', background: '#fff', borderRadius: '12px',
    padding: '22px', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', textAlign: 'center',
    fontFamily: 'Segoe UI, Roboto, Arial, sans-serif'
  });

  const title = document.createElement('h2');
  title.textContent = "Time's up!";
  Object.assign(title.style, { margin: '0 0 8px', fontSize: 'clamp(18px,3vw,24px)', color: '#111' });

  const msg = document.createElement('p');
  msg.textContent = 'Your time has expired. Would you like to try again?';
  Object.assign(msg.style, { margin: '0 0 18px', color: '#444', fontSize: '15px' });

  const actions = document.createElement('div');
  Object.assign(actions.style, { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' });

  const retryBtn = document.createElement('button');
  retryBtn.textContent = 'Try Again';
  Object.assign(retryBtn.style, {
    background: 'linear-gradient(90deg,#1976d2,#42a5f5)',
    color: '#fff', border: 'none', padding: '10px 18px',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '700'
  });
  retryBtn.addEventListener('click', function () {
    overlay.style.opacity = '0';
    setTimeout(function () { location.reload(); }, 180);
  });

  const homeBtn = document.createElement('button');
  homeBtn.textContent = 'Go to Homepage';
  Object.assign(homeBtn.style, {
    background: 'transparent', color: '#1976d2', border: '1px solid #1976d2',
    padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700'
  });
  homeBtn.addEventListener('click', function () {
    overlay.style.opacity = '0';
    setTimeout(function () {
      window.location.href = '/html/homepage.html';

    }, 200);
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  Object.assign(closeBtn.style, {
    background: '#e0e0e0', color: '#222', border: 'none',
    padding: '10px 14px', borderRadius: '8px', cursor: 'pointer'
  });
  closeBtn.addEventListener('click', function () {
    overlay.style.opacity = '0';
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 160);
  });

  actions.appendChild(retryBtn);
  actions.appendChild(homeBtn);
  actions.appendChild(closeBtn);

  card.appendChild(title);
  card.appendChild(msg);
  card.appendChild(actions);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  setTimeout(function () { overlay.style.opacity = '1'; }, 20);
}


function showWinMessage(moves) {
  if (document.getElementById('win-overlay')) return;
  var points = 0;
  if (moves > 300) points = 15;
  else if (moves > 200) points = 25;
  else points = 40;

  var username = getCurrentUser();
  if (username) addScoreToUser(username, points);

  const totalScore = username ? getUserScore(username) : null;

  const overlay = document.createElement('div');
  overlay.id = 'win-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: '9999', opacity: '0', transition: 'opacity 300ms ease'
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    width: 'min(95%,520px)', background: '#fff', borderRadius: '12px',
    padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', textAlign: 'center',
    fontFamily: "Segoe UI, Roboto, Arial, sans-serif"
  });

  const title = document.createElement('h2');
  title.textContent = 'You win!';
  Object.assign(title.style, { margin: '0 0 8px', fontSize: 'clamp(20px,3vw,28px)', color: '#222' });

  const info = document.createElement('p');
  info.style = 'margin:0 0 12px;color:#444;font-size:16px';
  var infoText = 'Great job — moves: ' + (typeof moves === 'number' ? moves : clickCount) + '.';
  infoText += ' You earned ' + points + ' points.';
  if (username) infoText += ' Total score (' + username + '): ' + totalScore + ' pts.';
  else infoText += ' Connect to save your score.';
  info.textContent = infoText;

  const actions = document.createElement('div');
  Object.assign(actions.style, { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' });

  const playBtn = document.createElement('button');
  playBtn.textContent = 'Play Again';
  Object.assign(playBtn.style, {
    background: 'linear-gradient(90deg,#1976d2,#42a5f5)', color: '#fff', border: 'none',
    padding: '10px 18px', borderRadius: '6px', cursor: 'pointer',
    fontWeight: '700', fontSize: '16px'
  });
  playBtn.addEventListener('click', function () { location.reload(); });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Go to homepage';
  Object.assign(closeBtn.style, {
    background: 'transparent', color: '#1976d2', border: '1px solid #1976d2',
    padding: '10px 18px', borderRadius: '6px', cursor: 'pointer',
    fontWeight: '700', fontSize: '16px'
  });
  closeBtn.addEventListener('click', function () {
    overlay.style.opacity = '0';
    setTimeout(function () {
      window.location.href = '/html/homepage.html';

    }, 200);
  });

  actions.appendChild(playBtn);
  actions.appendChild(closeBtn);

  if (!username) {
    const connectBtn = document.createElement('button');
    connectBtn.textContent = 'Connect';
    Object.assign(connectBtn.style, {
      background: '#6b6b6b', color: '#fff', border: 'none',
      padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700'
    });
    connectBtn.addEventListener('click', function () {
      overlay.style.opacity = '0';
      setTimeout(function () { window.location.href = '/html/nameuser.html'; }, 200);
    });
    actions.appendChild(connectBtn);
  }

  card.appendChild(title);
  card.appendChild(info);
  card.appendChild(actions);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  setTimeout(function () { overlay.style.opacity = '1'; }, 20);
  setTimeout(function () {
    if (document.getElementById('win-overlay')) {
      overlay.style.opacity = '0';
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
    }
  }, 30000);
}

function checkWin() {
  const targetOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "-1"];
  let isWin = true;
  const board = document.getElementById('board');
  if (!board) return;

  for (let i = 0; i < targetOrder.length; i++) {
    const tile = board.children[i];
    if (!tile) { isWin = false; break; }
    const segments = tile.src.split('/');
    const filename = segments[segments.length - 1];
    const expectedImage = targetOrder[i] + '.jpg';
    if (filename !== expectedImage) {
      isWin = false;
      break;
    }
  }

  if (isWin && clickCount >= 16) {
    if (gameTimerId) { clearTimeout(gameTimerId); gameTimerId = null; }
    if (progressIntervalId) { clearInterval(progressIntervalId); progressIntervalId = null; }
    var progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      var filled = progressBar.querySelector('.progress-bar-filled');
      if (filled && filled.parentNode) filled.parentNode.removeChild(filled);
    }
    try {
      var music = document.getElementById('audio1');
      if (music && !music.paused) music.pause();
    } catch (e) { }

    canClick = false;
    isGameFinished = true;

    setTimeout(function () {
      showWinMessage(clickCount);
    }, 700);
  }
}