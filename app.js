const character = document.getElementById('character');
const characterMove = document.getElementById('charout');
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
let facing = 'right';
let x = window.innerWidth / 2;
let y = 0;

function setOrigin (x) {
  character.setAttribute('transform-origin', x + characterWidth / 2,250 + y + characterHeight / 2)
}

function isTouching (elem1, elem2) {
  const left1 = elem1.getBoundingClientRect().left;
  const right1 = elem1.getBoundingClientRect().right;
  const left2 = elem2.getBoundingClientRect().left;
  const right2 = elem2.getBoundingClientRect().right;
  const bottom1 = elem1.getBoundingClientRect().bottom;
  const top1 = elem1.getBoundingClientRect().top;
  const bottom2 = elem2.getBoundingClientRect().bottom;
  const top2 = elem2.getBoundingClientRect().top;
  
  if (left2 > left1 && left2 < right1 && bottom2 < bottom1 && bottom2 > top1) {
    return true;
  }
  
  else if (right2 < left1 && right2 > right1 && top2 > bottom1 && top2 < top1) {
    return true;
  }
  
  else if (left1 < left2 && left1 > right2 && bottom1 > bottom2 && bottom1 < top2) {
    return true;
  }
  
  else if (right1 > left2 && right1 < right2 && top1 < bottom2 && top1 > top2) {
    return true;
  }
  
  else {
    return false;
  }
}

function ready () {
  html.setAttribute('ready', '')
}

function flip (element) {
  setOrigin
  
  if (facing === 'left') {
    element.setAttribute('transform', 'scale(1,1)');
    facing = 'right'
  }
  
  else if (facing === 'right') {
    element.setAttribute('transform', 'scale(-1,1)');
    facing = 'left'
  }
}

function moveGuy (dx, dy) {
  x += dx;
  y += dy;
  characterMove.setAttribute('transform', `translate(${x},${y})`);
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
  character.removeAttribute('crouching');
}

function crouch () {
  body.setAttribute('d', 'M0,250 l20,-15 l20,15 l-20,-15 l0,-30 m-20,25 l20,-25 l20,25 l-20,-25 m10,-15 q-7.5,10 -15 0 m0,-15 l0,3 m15,0 l0,3');
  head.setAttribute('cy', '185');
  crouching = true;
  character.setAttribute('crouching', '');
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
  
  else if (event.keyCode === 32 && isTouching(character, dagger)) {
    character.appendChild(dagger);
    dagger.setAttribute('up', '');
    dagger.removeAttribute('down');
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
    if (facing === 'right') {
      flip(character);
    }
  }
  
  else if (event.keyCode === 39 && crouching === true) {
    moveGuy(5,0);
    if (facing === 'left') {
      flip(character);
    }
  }

  else if (event.keyCode === 39) {
    moveGuy(10,0);
    if (facing === 'left') {
      flip(character);
    }
  }
  else if (event.keyCode === 40) {
    crouch();
  }
  else if (event.keyCode === 37) {
    moveGuy(-10,0);
    if (facing === 'right') {
      flip(character);
    }
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

//space 32
//down arrow 40
//right arrow 39
//up arrow 38
//left arrow 37
