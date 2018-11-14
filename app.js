const character = document.getElementById('character');
const grass = document.getElementById('grass');
const soil = document.getElementById('soil');
const body = document.getElementById('body');
const head = document.getElementById('head');
const heart1 = document.getElementById('health1');
const heart2 = document.getElementById('health2');
const heart3 = document.getElementById('health3');
const heartBbox = heart1.getBBox();
const characterWidth = character.getBBox().width;
const characterHeight = character.getBBox().height;
let crouching = false;
let x = window.innerWidth / 2;
let y = 0;

function ready () {
  html.setAttribute('ready', '')
}

function moveGuy (dx, dy) {
  x += dx;
  y += dy;
  character.setAttribute("style", `transform: translate(${x}px,${y}px);`);
  //console.log(x)
}

function makeObjectInvisible (object) {
  object.setAttribute('opacity', '0');
}

function makeObjectVisible (object) {
  object.setAttribute('opacity', '1');
}

moveGuy(0,0);
makeObjectVisible(character);

function placeHearts (callback) {
  heart1.setAttribute("d",`M${window.innerWidth + 80},20 ${callback}`);
  heart2.setAttribute("d",`M${window.innerWidth},20 ${callback}`);
  heart3.setAttribute("d",`M${window.innerWidth - 80},20 ${callback}`);
} 

function placeGround () {
  soil.setAttribute('width', window.innerWidth);
  soil.setAttribute('height', window.innerHeight);
  grass.setAttribute('x2', window.innerWidth);
}

placeGround();

//l-15,-35 q7.5,-17.5 15,2.5 q7.5,-17.5 15,0 z
placeHearts(`a 20,20 0,0,1 40,0
      a 20,20 0,0,1 40,0
      q 0,30 -40,60
      q -40,-30 -40,-60 z`);

function stand () {
  body.setAttribute('d', 'M0,250 l20,-25 l20,25 l-20,-25 l0,-50 m-20,25 l20,-25 l20,25 l-20,-25 m10,-15 q-7.5,10 -15 0 m0,-15 l0,3 m15,0 l0,3');
  head.setAttribute('cy', '155');
  crouching = false;
}

function crouch () {
  body.setAttribute('d', 'M0,250 l20,-15 l20,15 l-20,-15 l0,-30 m-20,25 l20,-25 l20,25 l-20,-25 m10,-15 q-7.5,10 -15 0 m0,-15 l0,3 m15,0 l0,3');
  head.setAttribute('cy', '185');
  crouching = true;
}

window.addEventListener('keydown', function (event) {
  if (event.keyCode === 39 && x >= window.innerWidth - characterWidth) {
    return;
  }
  
  else if (event.keyCode === 38 && y <= -50) {
    return;
  }
  
  else if (event.keyCode === 37 && x <= 0) {
    return;
  }
  
  else if (event.keyCode === 32 && x > 319 && x < 336) {
    character.appendChild(dagger);
    dagger.setAttribute('up', '');
    dagger.removeAttribute('down')
  }
  
  else if (event.keyCode === 38 && crouching === true) {    
    moveGuy(0,-90);
    setTimeout(function () {
      stand();
      moveGuy(0,90);
    },200);
  }
  
  else if (event.keyCode === 38) {    
    moveGuy(0,-50);
    setTimeout(function () {moveGuy(0,50);
      },200);
  }
  
  else if (event.keyCode === 37 && crouching === true) {
    moveGuy(-5,0);
  }
  
  else if (event.keyCode === 39 && crouching === true) {
    moveGuy(5,0);
  }

  else if (event.keyCode === 39) {
    moveGuy(10,0);
  }
  else if (event.keyCode === 40) {
    crouch();
  }
  else if (event.keyCode === 37) {
    moveGuy(-10,0);
  }
  else {
    return;
  }
  
});

window.addEventListener('keyup', function (event) {
  if (event.keyCode === 40) {
    stand()
  }
});

//space 0
//down arrow 40
//right arrow 39
//up arrow 38
//left arrow 37
