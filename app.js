const character = document.getElementById('character');
const characterMove = document.getElementById('charout');
const grass = document.getElementById('grass');
const soil = document.getElementById('soil');
const body = document.getElementById('body');
const head = document.getElementById('head');
const heart1 = document.getElementById('health1');
const heart2 = document.getElementById('health2');
const heart3 = document.getElementById('health3');
const slime = document.getElementById('slime');
const heartBbox = heart1.getBBox();
const characterWidth = character.getBBox().width;
const characterHeight = character.getBBox().height;
const world = document.getElementById('world');
const RETURN = 13;
const ESCAPE = 27;
const SPACE = 32;
const ARROW_DOWN = 40;
const ARROW_RIGHT = 39;
const ARROW_UP = 38;
const ARROW_LEFT = 37;
const state = {};
const DATA_NORMAL = 'M0,0 l20,-25 l20,25 l-20,-25 l0,-50 m-20,25 l20,-25 l20,25 l-20,-25 m9,-15 q-7.5,10 -15 0 m0,-15 h3 m15,0 h-3';
const DATA_ATTACK = 'M0,0 l20,-25 l20,25 l-20,-25 l0,-50 m-20,25 l20,-25 l30,0 l-30,0 m10,-15 q-7.5,10 -15 0 m0,-15 h3 m15,0 h-3';
const DATA_CROUCH_ATTACK = 'M0,0 l20,-15 l20,15 l-20,-15 l0,-30 m-20,25 l20,-25 l30,0 l-30,0 m10,-15 q-7.5,10 -15 0 m0,-15 h3 m15,0 h-3';
const DATA_CROUCH = 'M0,0 l20,-15 l20,15 l-20,-15 l0,-30 m-20,25 l20,-25 l20,25 l-20,-25 m10,-15 q-7.5,10 -15 0 m0,-15 h3 m15,0 h-3';
const plants = document.querySelectorAll('[data-plant]');
const svg = document.querySelector('svg');
let crouching = false;
let facing = 'right';
let worldX = 0;
let x = window.innerWidth / 2;
let y = 250;
let slimeX = 0;
let plantColour;
let skyColour;
let soilColour;
let current;

fetch('scenes.json', {
    headers: {
      'Accept': 'application/json'
    },
    method: 'GET',
  })
  .then(function (response) {
    return response.json();
  })
  .then(onSuccess)
  .catch(onError);

function onSuccess (areas) {
  console.log('areas', areas);
  current = areas.normal;
  plantColour = current.plants;
  skyColour = current.sky;
  soilColour = current.soil;
  setState();
}//590

function onError (err) {
  console.error(err);
  throw err;
}

function setOrigin (x) {
  character.setAttribute('transform-origin', x + characterWidth / 2 + ',' + y + characterHeight / 2)
}

function setCharacterState (newState) {
  Object.keys(newState).forEach(key => state[key] = newState[key]);
  render();
}

function render () {
  let pathData;

  if (state.jump) {
    moveGuy(0,-50);
    setTimeout(function () {moveGuy(0,50);
      },200
    );
    setCharacterState({jump:false});
  }
  
  else if (state.highJump) {
    moveGuy(0,-90);
    setTimeout(function () {
      stand();
      moveGuy(0,90);
    },200);
  }
  
  else if (state.left) {
    const x = state.crouch ? -5 : -10;
    moveGuy(x, 0);
    setCharacterState({left: false});
  }
  
  else if (state.right) {
    const x = state.crouch ? 5 : 10;
    moveGuy(x, 0);
    setCharacterState({right: false});
  }
  
  else if (state.moveSlime) {
    moveSlime();
    setCharacterState({moveSlime: false});
  }
  
  else if (state.pickUpDagger) {
    character.appendChild(dagger);
    dagger.setAttribute('up', '');
    dagger.removeAttribute('down');
    setCharacterState({pickUpDagger: false});
  }
  
  else if (state.crouch) {
    pathData = DATA_CROUCH;
    head.setAttribute('cy', -65);
    character.setAttribute('crouching', '');
    character.removeAttribute('attacking');
  }
  
  else if (state.attack) {
    pathData = DATA_ATTACK;
    character.removeAttribute('crouching');
    character.setAttribute('attacking', '');
  }

  else {
    pathData = DATA_NORMAL;
  }

  if (pathData) {
    body.setAttribute('d', pathData);
    //console.log({x,y,...state});
  }
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
  if (dx > 0 && x >= window.innerWidth - 100 || dx < 0 && x <= 100) {
    worldX -= dx;
    world.setAttribute('transform', `translate(${worldX},0)`);
    //console.log('move world', {dx});
    return;
  }
  
  x += dx;
  y += dy;
  if (facing === 'right' && dx < 0) {
    flip(character);
  }
  
  if (facing === 'left' && dx > 0) {
    flip(character);
  }
  
  characterMove.setAttribute('transform', `translate(${x},${y})`);
  //console.log(x)
}

function keyDown (event) {
  if (event.keyCode === ARROW_RIGHT && x >= window.innerWidth - characterWidth) {
    return;
  }
  
  else if (event.keyCode === ARROW_UP && y <= 200) {
    return;
  }
  
  else if (event.keyCode === ARROW_LEFT && x <= 0) {
    return;
  }
  
  else if (event.keyCode === SPACE && isTouching(character, dagger)) {
    setCharacterState({pickUpDagger: true});
  }
  
  else if (event.keyCode === ARROW_UP && state.crouch) {
    setCharacterState({highJump: true});
  }
  
  else if (event.keyCode === ARROW_UP) {
    setCharacterState({jump: true});
  }

  else if (event.keyCode === ARROW_RIGHT) {
    setCharacterState({left: false, right: true});
  }
  else if (event.keyCode === ARROW_DOWN) {
    setCharacterState({crouch: true, jump: false});
    //console.log('crouch', state.crouch);
  }
  else if (event.keyCode === ARROW_LEFT) {
    setCharacterState({left: true, right: false});
  }
  
  else if (event.keyCode === RETURN) {
    setCharacterState({attack: true});
  }
  
  else if (event.keyCode === ESCAPE) {
    setCharacterState({moveSlime: true});
  }
  
  else {
    return;
  }
}

function keyUp (event) {
  if (event.keyCode === ARROW_DOWN || event.keyCode === RETURN) {
    stand();
   // console.log('sucess', character.getAttribute('d'))
  }
}

function makeObjectInvisible (object) {
  object.setAttribute('opacity', '0');
}

function makeObjectVisible (object) {
  object.setAttribute('opacity', '1');
}

function moveSlime () {
  let movePosition = Math.round(Math.random() * 200);
  slimeX += movePosition
  slime.setAttribute('transform', `translate(${slimeX},0)`);
}

moveGuy(0,0);
makeObjectVisible(character);

function placeHearts (callback) {
  heart1.setAttribute("d",`M${window.innerWidth + 80},20 ${callback}`);
  heart2.setAttribute("d",`M${window.innerWidth},20 ${callback}`);
  heart3.setAttribute("d",`M${window.innerWidth - 80},20 ${callback}`);
} 

function setState () {
  console.log(plants.length);
  for (let i = 0; i < plants.length; i++) {
    console.log(plantColour);
    plants[i].setAttribute('stroke', plantColour);
  }
  soil.setAttribute('width', window.innerWidth * 3);
  soil.setAttribute('height', window.innerHeight);
  soil.setAttribute('x', -window.innerWidth);
  soil.setAttribute('fill', soilColour);
  grass.setAttribute('x2', window.innerWidth * 2);
  grass.setAttribute('x1', -window.innerWidth);
  svg.style.backgroundColor = skyColour;
}

//l-15,-35 q7.5,-17.5 15,2.5 q7.5,-17.5 15,0 z
placeHearts(`a 20,20 0,0,1 40,0
      a 20,20 0,0,1 40,0
      q 0,30 -40,60
      q -40,-30 -40,-60 z`);

function stand () {
  body.setAttribute('d', 'M0,0 l20,-25 l20,25 l-20,-25 l0,-50 m-20,25 l20,-25 l20,25 l-20,-25 m9,-15 q-7.5,10 -15 0 m0,-15 h3 m15,0 h-3');
  head.setAttribute('cy', '-95');
  character.removeAttribute('crouching');
  character.removeAttribute('attacking');
  setCharacterState({crouch: false, attack: false});
}

window.addEventListener('keydown', keyDown);

window.addEventListener('keyup', keyUp);
