var box = document.getElementById('box'),
    boxPos = 10,
    boxVelocity = 2,
    limit = 300,
    lastFrameTimeMs = 0,
    maxFPS = 120;

var output = document.getElementById('output');

var play = true;

var x = 0;
var y = 0;

var speedX = 0;
var speedY = 0;

var width = 354;
var height = 500;

var level = 1;
var score = 0;

var frozenSquares = [];
var food = [];

var maxId = 70;
var blinkingToLightSeconds = 4;
var LightToDeleteSeconds = 10;

var squareWidth = 51;
var squareHeight = 50;

var frameNr = 0;

function init() {
    window.addEventListener('deviceorientation', handleOrientation);

	// var div = document.createElement("div");
	// div.style.width = "100px";
	// div.style.height = "100px";
	// div.style.background = "red";
	// div.style.color = "white";
	// div.innerHTML = "Hello";

	for (var i = 0; i < maxId; i++) {
		var div = document.createElement("div");
		div.style.width = squareWidth + "px";
		div.style.height = squareHeight + "px";
		document.getElementById("squares").appendChild(div);
	}

	box.style.top = (height / 2 - 10) + "px";
	box.style.left = (width / 2 - 10) + "px";

	determineStartFood();
	determineStartFrozens();
}

function getMs() {
	return window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
}

function reset() {
	frozenSquares = [];
}

function showShortMessage(text) {
	document.getElementById("short_message").style.display = "block";
	document.getElementById("short_message").innerHTML = text;

	setTimeout(function(){
		document.getElementById("short_message").innerHTML = "";
		document.getElementById("short_message").style.display = "none";
	}, 1000);
}

function retry() {
	score = 0;
	document.getElementById("message").innerHTML = "";
	document.getElementById("message").style.display = "none";
	determineStartFrozens();
	play = true;
}

function gameOver() {
	window.navigator.vibrate(200);
	play = false;
	reset();
	document.getElementById("message").style.display = "block";
	document.getElementById("message").innerHTML = "Game Over<br>Click to retry";
	document.getElementById("message").addEventListener("click", retry);
}

function determineStartFood() {
	food = [];

	for (var i = 0; i < 3; i++) {
		var div = document.createElement("div");
		div.style.width = squareWidth + "px";
		div.style.height = squareHeight + "px";
		document.getElementById("food").appendChild(div);

		determineNewFood();
	}
}

function determineNewFood() {
	var id = Math.floor(Math.random() * maxId);

	var toContinue = false;
    for (var i = 0; i < food.length; i++) {
    	if (food[i] == id) {
    		determineNewFood();
    		return;
    	}
    }

	food.push(id);
}

function determineStartFrozens() {
	frozenSquares = [];

	for (var i = 0; i < maxId; i++) {
		document.getElementById("squares").getElementsByTagName('div')[i].classList.remove("light");
		document.getElementById("squares").getElementsByTagName('div')[i].classList.remove("blinking");
	}

	for (var i = 0; i < 7 + level; i++) {
		var id = Math.floor(Math.random() * maxId);
		var time = getMs() + Math.floor(Math.random() * 4000);

		var toContinue = false;
	    for (var i = 0; i < frozenSquares.length; i++) {
	    	if (frozenSquares[i][0] == id) {
	    		toContinue = true;
	    		break;
	    	}
	    }
	    if (toContinue) {
	    	i--;
	    	continue;
	    }

		frozenSquares.push([id, time]);
	}
}

function determineNewFrozen() {
	var id = Math.floor(Math.random() * maxId);
	var time = getMs();

    for (var i = 0; i < frozenSquares.length; i++) {
    	if (frozenSquares[i][1] < getMs() - 1000 * LightToDeleteSeconds && frozenSquares[i][0] == id) {
    		determineNewFrozen();
    		return;
    	}
    }

	frozenSquares.push([id, time]);
}

function handleOrientation() {
	if (!play) {
		return;
	}

    x = event.gamma;
    y = event.beta;
}

function update() {
    var speedStep = 0.1;
    var stopStep = 0.01;
    var maxSpeed = 2;
    var reactionVal = 1;

	if (!play) {
		speedX = 0;
		speedY = 0;
		return;
	}

    if (x > reactionVal && speedX < maxSpeed && speedX < x / 10) {
        speedX += speedStep;
    }

    if (y > reactionVal && speedY < maxSpeed && speedY < y / 10) {
        speedY += speedStep;
    }

    if (x < -reactionVal && speedX > -maxSpeed && speedX > x / 10) {
        speedX -= speedStep;
    }

    if (y < -reactionVal && speedY > -maxSpeed && speedY > y / 10) {
        speedY -= speedStep;
    }

    if (speedX > 0) {
        if (speedX >= stopStep) {
            speedX -= stopStep;
        } else {
            //speedX = speedX/2;
        }
    }

    if (speedX < 0) {
        if (speedX <= stopStep) {
            speedX += stopStep;
        } else {
            //speedX = -speedX/2;
        }
    }

    if (speedY > 0) {
        if (speedY >= stopStep) {
            speedY -= stopStep;
        } else {
            //speedY = speedX/2;
        }
    }

    if (speedY < 0) {
        if (speedY <= stopStep) {
            speedY += stopStep;
        } else {
            //speedY = -speedX/2;
        }
    }

    var correctX = 0;
    var correctY = 0;

    // frameNr++;

    // if (speedX < 1 && frameNr % parseInt(1 / speedX) == 0) {
    // 	correctX = 1;
    // }

    // if (speedY < 1 && frameNr % parseInt(1 / speedY) == 0) {
    // 	correctY = 1;
    // }

    box.style.top  = (parseInt(box.style.top) + speedY + correctY).toFixed(2) + "px";
    box.style.left = (parseInt(box.style.left) + speedX + correctX).toFixed(2) + "px";

    for (var i = 0; i < frozenSquares.length; i++) {
    	var frozenInfo = frozenSquares[i];

    	if (frozenInfo[1] < getMs() - 1000 * LightToDeleteSeconds) {
    		document.getElementById("squares").getElementsByTagName('div')[frozenInfo[0]].classList.remove("light");
    		frozenSquares.splice(i, 1);
    		determineNewFrozen();
    	} else if (frozenInfo[1] < getMs() - 1000 * blinkingToLightSeconds) {
    		document.getElementById("squares").getElementsByTagName('div')[frozenInfo[0]].classList.remove("blinking");
    		document.getElementById("squares").getElementsByTagName('div')[frozenInfo[0]].classList.add("light");
    	} else {
    		document.getElementById("squares").getElementsByTagName('div')[frozenInfo[0]].classList.add("blinking");
    	}
    }

    detectBallColission();
    detectEatFood();
}

function nextLevel() {
	showShortMessage("Next level!");
	level += 1;
	determineNewFrozen();
}

function eat(i) {
	food.splice(i, 1);
	determineNewFood();
	score += 10;
	if (score % 50 == 0) {
		nextLevel();
	}
}

function detectEatFood() {
    for (var i = 0; i < food.length; i++) {
		var id = food[i];
		var posX = id % 7;
		var posY = Math.floor(id / 7);
		var pxStartX = posX * squareWidth;
		var pxStartY = posY * squareHeight;
		var pxEndX = posX * squareWidth + squareWidth;
		var pxEndY = posY * squareHeight + squareHeight;

		var ballCenterX = parseInt(box.style.left) + 10;
		var ballCenterY = parseInt(box.style.top) + 10;

		if (ballCenterY > pxStartY + 10 && ballCenterY < pxEndY - 10 && ballCenterX > pxStartX + 10 && ballCenterX < pxEndX - 10) {
			eat(i);
		}
    }
}

function detectBallColission() {
	var top = parseInt(box.style.top);
	var left = parseInt(box.style.left);

	var ballSize = 20;

	if (top < 0 || top + ballSize > height) {
		speedY = -speedY;
		if (top < 0) {
			box.style.top = (parseInt(box.style.top) + 1) + "px";
		} else {
			box.style.top = (parseInt(box.style.top) - 1) + "px";
		}
	}

	if (left < 0 || left + ballSize > width) {
		speedX = -speedX;
		if (left < 0) {
			box.style.left = (parseInt(box.style.left) + 1) + "px";
		} else {
			box.style.left = (parseInt(box.style.left) - 1) + "px";
		}
	}

    for (var i = 0; i < frozenSquares.length; i++) {
    	var frozenInfo = frozenSquares[i];

    	if (frozenInfo[1] < getMs() - 1000 * blinkingToLightSeconds) {
    		var id = frozenInfo[0];
    		var posX = id % 7;
    		var posY = Math.floor(id / 7);
    		var pxStartX = posX * squareWidth;
    		var pxStartY = posY * squareHeight;
    		var pxEndX = posX * squareWidth + squareWidth;
    		var pxEndY = posY * squareHeight + squareHeight;

    		var ballCenterX = parseInt(box.style.left) + 10;
    		var ballCenterY = parseInt(box.style.top) + 10;

    		if (ballCenterY > pxStartY - 10 && ballCenterY < pxEndY + 10 && ballCenterX > pxStartX - 10 && ballCenterX < pxEndX + 10) {
    			gameOver();
    		}
    	}
    }
}

function draw() {
	for (var i = 0; i < food.length; i++) {
		var id = food[i];
		var posX = id % 7;
		var posY = Math.floor(id / 7);
		var pxStartX = posX * squareWidth;
		var pxStartY = posY * squareHeight;

		document.getElementById("food").getElementsByTagName('div')[i].style.top = pxStartY + "px";
		document.getElementById("food").getElementsByTagName('div')[i].style.left = pxStartX + "px";
    }

    output.innerHTML  = "Level : " + level + "<br>";
    output.innerHTML  += "Score : " + score;
}

function mainLoop(ms) {
    if (ms < lastFrameTimeMs + (1000 / maxFPS)) {
        window.requestAnimationFrame(mainLoop);
        return;
    }
    lastFrameTimeMs = ms;

    update();
    draw();
    window.requestAnimationFrame(mainLoop);
}

init();
window.requestAnimationFrame(mainLoop);