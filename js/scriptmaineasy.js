let grid = [
  [0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0],
  [0, 0, 0, 1, 2]
];

// ตัวแปรเกม
let robot = { x: 0, y: 0, dir: 'right' };
let initialRobot = { ...robot };
let tileSize = 80; // ขนาดใหญ่ขึ้นสำหรับ 5x5
let isRunning = false;
let commandList = [];
let timeLimit = 30; // เวลามากขึ้นสำหรับผู้เริ่มต้น
let timeLeft = timeLimit;
let timerInterval = null;
let timerRunning = false;

function setup() {
  let canvas = createCanvas(5 * tileSize, 5 * tileSize);
  canvas.parent('canvasContainer');
  canvas.mouseClicked(canvasClicked);
  frameRate(30);
}

function draw() {
  background(0);
  drawGrid();
  drawRobot();
  updateStatus();
}

function drawGrid() {
  stroke(70);
  strokeWeight(1);
  
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      let px = x * tileSize, py = y * tileSize;
      
      if (grid[y][x] === 0) { 
        fill(50); 
        rect(px, py, tileSize, tileSize); 
      }
      else if (grid[y][x] === 1) { 
        fill(120, 120, 150); 
        rect(px, py, tileSize, tileSize); 
      }
      else { 
        fill(100, 255, 100); // สีเขียวสำหรับเป้าหมาย
        ellipse(px + tileSize/2, py + tileSize/2, tileSize*0.8); 
      }
    }
  }
}

function drawRobot() {
  let rx = robot.x * tileSize + tileSize/2;
  let ry = robot.y * tileSize + tileSize/2;
  
  fill(100, 200, 255); // สีฟ้าอ่อนสำหรับหุ่นยนต์
  stroke(255);
  strokeWeight(2);
  ellipse(rx, ry, tileSize*0.7);
  
  stroke(255, 255, 0);
  strokeWeight(4);
  
  if (robot.dir === 'right') line(rx, ry, rx + tileSize/2, ry);
  if (robot.dir === 'left') line(rx, ry, rx - tileSize/2, ry);
  if (robot.dir === 'up') line(rx, ry, rx, ry - tileSize/2);
  if (robot.dir === 'down') line(rx, ry, rx, ry + tileSize/2);
}

function canvasClicked() {
  if (isRunning || timerRunning) return;
  
  let x = Math.floor(mouseX / tileSize);
  let y = Math.floor(mouseY / tileSize);
  
  if (x >= 0 && x < 5 && y >= 0 && y < 5 && grid[y][x] !== 1) {
    calculatePathTo(x, y);
  }
}

function calculatePathTo(tx, ty) {
  if (tx === robot.x && ty === robot.y) {
    setOutput('คุณอยู่ที่นี่แล้ว!', 'yellow');
    return;
  }

  const desiredDir = calculateDesiredDirection(tx, ty);
  addRotationCommands(desiredDir);
  
  // แสดงคำแนะนำแบบง่าย
  const steps = Math.abs(tx - robot.x) + Math.abs(ty - robot.y);
  setOutput(`เดินประมาณ ${steps} ก้าว`, 'yellow');
}

function calculateDesiredDirection(tx, ty) {
  const dx = tx - robot.x;
  const dy = ty - robot.y;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'down' : 'up';
  }
}

function addRotationCommands(desiredDir) {
  if (robot.dir === desiredDir) return;

  const rotations = getRequiredRotations(robot.dir, desiredDir);
  rotations.forEach(rot => {
    addCommandWithTimer(rot);
    robot.dir = updateDirection(robot.dir, rot);
  });
}

function getRequiredRotations(currentDir, targetDir) {
  const rotationMap = {
    right: { up: ['rotateLeft'], down: ['rotateRight'], left: ['rotateLeft', 'rotateLeft'] },
    left: { up: ['rotateRight'], down: ['rotateLeft'], right: ['rotateRight', 'rotateRight'] },
    up: { right: ['rotateRight'], left: ['rotateLeft'], down: ['rotateRight', 'rotateRight'] },
    down: { right: ['rotateLeft'], left: ['rotateRight'], up: ['rotateLeft', 'rotateLeft'] }
  };
  
  return rotationMap[currentDir][targetDir] || [];
}

function updateDirection(currentDir, rotation) {
  const dirChanges = {
    rotateLeft: { right: 'up', up: 'left', left: 'down', down: 'right' },
    rotateRight: { right: 'down', down: 'left', left: 'up', up: 'right' }
  };
  return dirChanges[rotation][currentDir];
}

function move() {
  let nx = robot.x, ny = robot.y;
  
  if (robot.dir === 'right') nx++;
  if (robot.dir === 'left') nx--;
  if (robot.dir === 'up') ny--;
  if (robot.dir === 'down') ny++;
  
  if (nx >= 0 && nx < 5 && ny >= 0 && ny < 5 && grid[ny][nx] !== 1) {
    robot.x = nx; 
    robot.y = ny;
    
    if (grid[robot.y][robot.x] === 2) {
      handleWin();
      return false;
    }
    return true;
  }
  
  setOutput('โอ๊ย! ชนกำแพง!', 'red');
  resetRobotPosition();
  return false;
}

function rotateLeft() {
  robot.dir = updateDirection(robot.dir, 'rotateLeft');
}

function rotateRight() {
  robot.dir = updateDirection(robot.dir, 'rotateRight');
}

function updateStatus() {
  document.getElementById('direction').textContent = 'ทิศทาง: ' + getDirectionText(robot.dir);
  document.getElementById('position').textContent = `ตำแหน่ง: (${robot.x},${robot.y})`;
  document.getElementById('steps').textContent = 'จำนวนคำสั่ง: ' + commandList.length;
}

function getDirectionText(dir) {
  const dirMap = { right: 'ขวา', left: 'ซ้าย', up: 'บน', down: 'ลง' };
  return dirMap[dir];
}

async function executeCommands() {
  if (isRunning) return;
  
  isRunning = true;
  setOutput('กำลังทำงาน...', 'yellow');
  
  robot = { ...initialRobot };
  updateStatus();
  
  for (let i = 0; i < commandList.length; i++) {
    if (!timerRunning) break;
    
    highlightCommand(i);
    
    const cmd = commandList[i];
    let success = true;
    
    if (cmd === 'move') {
      success = move();
    } else if (cmd === 'rotateLeft') {
      rotateLeft();
    } else if (cmd === 'rotateRight') {
      rotateRight();
    }
    
    updateStatus();
    await sleep(600); // ช้าลงเพื่อให้ผู้เริ่มต้นเข้าใจ
    
    if (!success) break;
  }
  
  isRunning = false;
  removeCommandHighlights();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function highlightCommand(index) {
  const commands = document.querySelectorAll('.command-item');
  commands.forEach((cmd, i) => {
    cmd.classList.toggle('highlight', i === index);
  });
}

function removeCommandHighlights() {
  document.querySelectorAll('.command-item').forEach(cmd => {
    cmd.classList.remove('highlight');
  });
}

function handleWin() {
  clearInterval(timerInterval);
  timerRunning = false;
  
  const score = calculateScore();
  showWinMessage(score);
}

function calculateScore() {
  const timeScore = Math.floor(timeLeft * 2);
  const stepScore = Math.max(0, 100 - commandList.length);
  const bonus = 50; // โบนัสคงที่สำหรับระดับง่าย
  
  return {
    total: timeScore + stepScore + bonus,
    time: timeScore,
    steps: stepScore,
    bonus: bonus
  };
}

function showWinMessage(score) {
  const message = `
    ยินดีด้วย! คุณชนะ! 🎉<br/><br/>
    🕒 เวลาที่เหลือ: ${timeLeft} วินาที (${score.time} คะแนน)<br/>
    📋 จำนวนคำสั่ง: ${commandList.length} (${score.steps} คะแนน)<br/>
    🏆 คะแนนรวม: ${score.total} คะแนน
  `;
  
  setOutput('สำเร็จ!', 'green');
  showAlert(message);
}

function addCommand(cmd) {
  if (isRunning) return;
  
  commandList.push(cmd);
  renderCommandList();
  
  const cmdNames = {
    move: 'เดินหน้า',
    rotateLeft: 'หมุนซ้าย', 
    rotateRight: 'หมุนขวา'
  };
  setOutput(`เพิ่มคำสั่ง: ${cmdNames[cmd]}`, 'yellow');
}

// Event Listeners
document.getElementById('moveBtn').onclick = () => {
  if (isRunning) return;
  addCommandWithTimer('move');
};

document.getElementById('rotateLeftBtn').onclick = () => {
  if (isRunning) return;
  addCommandWithTimer('rotateLeft');
};

document.getElementById('rotateRightBtn').onclick = () => {
  if (isRunning) return;
  addCommandWithTimer('rotateRight');
};

function addCommandWithTimer(cmd) {
  if (!timerRunning) startTimer();
  addCommand(cmd);
}

function renderCommandList() {
  const listElement = document.getElementById('commandList');
  listElement.innerHTML = '';
  
  if (commandList.length === 0) {
    listElement.innerHTML = '<p class="text-gray-400 italic">คลิกปุ่มเพื่อเพิ่มคำสั่ง</p>';
    return;
  }
  
  commandList.forEach((cmd, index) => {
    const item = document.createElement('div');
    item.className = 'command-item';
    
    const numberSpan = document.createElement('span');
    numberSpan.className = 'command-number';
    numberSpan.textContent = (index + 1) + '.';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'command-text';
    textSpan.textContent = getCommandText(cmd);
    
    item.appendChild(numberSpan);
    item.appendChild(textSpan);
    item.onclick = () => removeCommand(index);
    
    listElement.appendChild(item);
  });
}

function getCommandText(cmd) {
  const commandNames = {
    move: 'เดินหน้า',
    rotateLeft: 'หมุนซ้าย',
    rotateRight: 'หมุนขวา'
  };
  return commandNames[cmd];
}

function removeCommand(index) {
  if (isRunning) return;
  commandList.splice(index, 1);
  renderCommandList();
}

function startTimer() {
  if (timerRunning) return;
  
  timerRunning = true;
  timeLeft = timeLimit;
  updateTimerDisplay();
  
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
      handleTimeOut();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerElement = document.getElementById('timer') || createTimerElement();
  timerElement.textContent = `⏱️ เวลาเหลือ: ${timeLeft} วินาที`;
  timerElement.style.color = timeLeft <= 20 ? '#ff6b6b' : '#4df0ff';
}

function createTimerElement() {
  const timer = document.createElement('p');
  timer.id = 'timer';
  timer.style.marginTop = '0.5rem';
  timer.style.fontWeight = 'bold';
  document.querySelector('.status').appendChild(timer);
  return timer;
}

function handleTimeOut() {
  clearInterval(timerInterval);
  timerRunning = false;
  
  setOutput('เวลาเหลือศูนย์!', 'red');
  showAlert('หมดเวลาแล้ว! ลองใหม่นะ');
  resetRobotPosition();
}

function resetGame() {
  clearInterval(timerInterval);
  timerRunning = false;
  
  robot = { ...initialRobot };
  commandList = [];
  timeLeft = timeLimit;
  
  updateStatus();
  updateTimerDisplay();
  renderCommandList();
  setOutput('พร้อมเริ่มแล้ว!', 'blue');
  
  isRunning = false;
  removeCommandHighlights();
  hideAlert();
}

function resetRobotPosition() {
  robot = { ...initialRobot };
  updateStatus();
}

function setOutput(msg, type) {
  const output = document.getElementById('output');
  output.textContent = msg;
  output.className = `status-output ${type || ''}`;
}

function showAlert(msg) {
  const overlay = document.getElementById('alertOverlay');
  const message = document.getElementById('alertMessage');
  
  message.innerHTML = msg;
  overlay.classList.add('show');
  
  const homeBtn = document.getElementById('homeBtn');
  homeBtn.style.display = 'inline-block';
}

function hideAlert() {
  document.getElementById('alertOverlay').classList.remove('show');
}

// Main Event Listeners
document.getElementById('runBtn').onclick = executeCommands;
document.getElementById('resetBtn').onclick = resetGame;
document.getElementById('clearBtn').onclick = () => {
  commandList = [];
  renderCommandList();
  setOutput('ล้างคำสั่งแล้ว', 'yellow');
};

document.getElementById('alertBtn').onclick = () => {
  hideAlert();
  resetGame();
};

function goHome() {
  window.location.href = "/index.html";
}

// เริ่มเกม
resetGame();