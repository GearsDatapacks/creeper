const character = document.getElementById('character');
const characterMove = document.getElementById('charout');
const body = document.getElementById('body');
const head = document.getElementById('head');
const heart1 = document.getElementById('health1');
const heart2 = document.getElementById('health2');
const heart3 = document.getElementById('health3');
const characterWidth = character.getBBox().width;
const characterHeight = character.getBBox().height;
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
const svg = document.querySelector('svg');
const world = document.getElementById('world');
const defs = svg.querySelector('defs');
const sceneTemplate = document.getElementById('scene');
const clipRect = document.getElementById('clipRect');
//const slimeHealthBar = document.getElementById('slimeHealth');
const shadowHealth1 = document.getElementById('shadowHealth1');
const shadowHealth2 = document.getElementById('shadowHealth2');
const shadowHealth3 = document.getElementById('shadowHealth3');
const gameOver = document.getElementById('gameOver');
let crouching = false;
let facing = 'right';
let worldX = 0;
let x = window.innerWidth / 2;
let y = 250;
let slimeX = 200;
let currentScene;
let sceneElem;
let slimeHealthBar;
let slime;
let dagger;
let health = 6;
let slimeHealth = 5;
let isReady = false;
let healing = true;


fetch('scenes.json', {
    headers: {
      'Accept': 'application/json'
    },
    method: 'GET',
  })
  .then(function (response) {
    return response.json();
  })
  .then(onScenesLoaded)
  .catch(onError);

function onScenesLoaded (scenes) {
  currentScene = scenes.normal;
  
  setupScene(currentScene);
}

function setupScene (scene) {
  const plantColour = scene.plants;
  const skyColour = scene.sky;
  const soilColour = scene.soil;
  gameOver.setAttribute('width', window.innerWidth);
  
  sceneElem = sceneTemplate.cloneNode(true);
  // Change ids
  
  slime = sceneElem.querySelector('#slime');
  dagger = sceneElem.querySelector('#dagger');
  slimeHealthBar = sceneElem.querySelector('#slimeHealth');
  isReady = true;
  placeHearts(`a 20,20 0,0,1 40,0
      a 20,20 0,0,1 40,0
      q 0,30 -40,60
      q -40,-30 -40,-60 z`);
  
  const plants = sceneElem.querySelectorAll('[data-plant]');
  const grass = sceneElem.querySelector('#grass');
  const soil = sceneElem.querySelector('#soil');
  
  world.appendChild(sceneElem);
  
  
  for (let i = 0; i < plants.length; i++) {
   // console.log(plantColour);
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

function onError (err) {
  console.error(err);
  throw err;
}

/*function setOrigin (x) {
  character.setAttribute('transform-origin', x + characterWidth / 2 + ',' + y + characterHeight / 2)
}*/

function setCharacterState (newState) {
  Object.keys(newState).forEach(key => state[key] = newState[key]);
  
  // TODO: use requestAnimationFrame(render) when move functions use time difference to calculate movement
  render();
}

function render () {
  let pathData;

  if (state.jump) {
    moveGuy(0,-50);
    setTimeout(function () {moveGuy(0,50);
      },500
    );
    setCharacterState({jump:false});
  }
  
  else if (state.highJump) {
    moveGuy(0,-90);
    setTimeout(function () {
      moveGuy(0,90);
    },1000);
    setCharacterState({highJump:false});
  }
  
  
  if (state.left) {
    const x = state.crouch ? -5 : -10;
    moveGuy(x, 0);
    setCharacterState({left: false, right: false});
  }
  
  else if (state.right) {
   // console.log('right', state);
  
    const x = state.crouch ? 5 : 10;
    moveGuy(x, 0);
    setCharacterState({left: false, right: false});
  }
  
  if (state.pickUpDagger) {
    character.appendChild(dagger);
    dagger.setAttribute('data-position', 'hold');
    setCharacterState({pickUpDagger: false});
  }
  
  
  if (state.attack && state.crouch) {
    pathData = DATA_CROUCH_ATTACK;
    character.removeAttribute('data-crouching');
    character.removeAttribute('data-attacking');
    character.setAttribute('data-crouch-attacking', '');
    head.setAttribute('cy', -65);
  }
  
  else if (state.crouch) {
    pathData = DATA_CROUCH;
    head.setAttribute('cy', -65);
    character.setAttribute('data-crouching', '');
    character.removeAttribute('data-attacking');
    character.removeAttribute('data-crouch-attacking');
  }
  
  else if (state.attack) {
    pathData = DATA_ATTACK;
    character.removeAttribute('data-crouching');
    character.setAttribute('data-attacking', '');
    character.removeAttribute('data-crouch-attacking');
    head.setAttribute('cy', -95);
  }

  else {
    // TODO: only set attributes that have changed since the last render
    pathData = DATA_NORMAL;
    head.setAttribute('cy', -95);
  }

  if (pathData) {
    body.setAttribute('d', pathData);
    //console.log({x,y,...state});
  }
}

function isTouching (elem1, elem2) {
  const bbox1 = elem1.getBoundingClientRect();
  const bbox2 = elem2.getBoundingClientRect();

 // console.log(elem1.getBoundingClientRect(), elem2.getBoundingClientRect());
  
  if (bbox2.left >= bbox1.left && bbox2.left <= bbox1.right && bbox2.bottom <= bbox1.bottom && bbox2.bottom >= bbox1.top) {
   // console.log('true');
    return true;
  }
  
  else if (bbox2.right >= bbox1.left && bbox2.right <= bbox1.right && bbox2.top <= bbox1.bottom && bbox2.top >= bbox1.top) {
    //console.log('true');
    return true;
  }
  
  else if (bbox1.left <= bbox2.left && bbox1.left >= bbox2.right && bbox1.bottom >= bbox2.bottom && bbox1.bottom <= bbox2.top) {
  // console.log('true');
    return true;
  }
  
  else if (bbox1.right >= bbox2.left && bbox1.right <= bbox2.right && bbox1.top <= bbox2.bottom && bbox1.top >= bbox2.top) {
    //console.log('true');
    return true;
  }
  
  else {
    //console.log('false');
    return false;
  }
}

function heal () {
  
  if (health < 6 && healing === false) {  
    health += 1;
    healing = true;
    changeHealth();
  }
  
  else {
    return;
  }
}

function stopHealing () {
  healing = false;
  setTimeout(heal, 2000);
}

function changeHealth () {
  const gameover = document.querySelector('text');
  clipRect.setAttribute('width', 20 * health * 2);
  if (health <= 0) {
    gameOver.setAttribute('height', window.innerHeight);
    gameover.setAttribute('y', 200);
  }
  if (health < 6 && healing === true) {
    stopHealing();
  }
}

function changeSlimeHealth () {
  const x1 = Number(slimeHealthBar.getAttribute('x1'));
  const x2 = Math.max(0, x1 + slimeHealth * 16);
  
//  console.log('changeSlimeHealth', { x1, x2, slimeHealth });
  
  if (slimeHealth <= 0) {
    //console.log('slime dead');
    sceneElem.removeChild(slime);
  }
  
  else {  
    slimeHealthBar.setAttribute('x2', x2);
  }
}

/*
const thing = {
  x: 0,
  y: 0,
  health: 100,
  elemId: 'slime',
  elem: ...
}
*/

function detectCollision () {
  if (isTouching(dagger, slime)) {
   // console.log('dagger touches slime');
    slimeHealth = Math.max(0, slimeHealth - 1);
    changeSlimeHealth();
    
    if (slimeHealth === 0) {
      return;
    }
    
    const slimeIsLeft = x > (slimeX + worldX);
    
    moveSlime(slimeIsLeft ? 50 : -50);
  }
  
  else if (isTouching(character,slime)) {
    health = Math.max(0, health - 1);
    if (x > (slimeX + worldX)) {
      moveGuy(50,0);
    }
    
    else if (x < (slimeX + worldX)) {
      moveGuy(-100,0);
    }
    
    changeHealth();
  }
 // console.log({health, slimeHealth});
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
  
  if (isReady === true && slimeHealth > 0) {
    detectCollision();
  }
}

function keyDown (event) {
  //console.log('keydown', event.keyCode);

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
    setCharacterState({crouch: true});
    //console.log('crouch', state.crouch);
  }
  else if (event.keyCode === ARROW_LEFT) {
    setCharacterState({left: true, right: false});
  }
  
  else if (event.keyCode === RETURN) {
    setCharacterState({attack: true});
  }
  
/*  else if (event.keyCode === ESCAPE) {
    setCharacterState({moveSlime: true});
  }*/
  
  else {
    return;
  }
}

function keyUp (event) {
  if (event.keyCode === ARROW_DOWN || event.keyCode === RETURN) {
    setCharacterState({crouch: false, attack: false});
    character.removeAttribute('data-crouching');
    character.removeAttribute('data-attacking');
    character.removeAttribute('data-crouch-attacking');
   // console.log('sucess', character.getAttribute('d'))
  }
}

function makeObjectInvisible (object) {
  object.setAttribute('opacity', '0');
}

function makeObjectVisible (object) {
  object.setAttribute('opacity', '1');
}

function moveSlime (setSpeed) {
  const distance = x - (slimeX + worldX);
  let speed = setSpeed;
  
  if (speed === 10 && distance < 0) {
    speed -= (speed * 2);
  }
  
  if (Math.abs(speed) === 10 && Math.abs(speed) > distance) {
    speed = distance;
  }
  
  // console.log({slimeX,x,movePosition});
  slimeX += speed;
  slime.setAttribute('transform', `translate(${slimeX},0)`);
  detectCollision();
}

moveGuy(0,0);
makeObjectVisible(character);

function placeHearts (callback) {
  heart1.setAttribute("d",`M${window.innerWidth + 80},20 ${callback}`);
  heart2.setAttribute("d",`M${window.innerWidth},20 ${callback}`);
  heart3.setAttribute("d",`M${window.innerWidth - 80},20 ${callback}`);
  shadowHealth1.setAttribute("d",`M${window.innerWidth + 80},20 ${callback}`);
  shadowHealth2.setAttribute("d",`M${window.innerWidth},20 ${callback}`);
  shadowHealth3.setAttribute("d",`M${window.innerWidth - 80},20 ${callback}`);
  clipRect.setAttribute('x', window.innerWidth - 80);
  changeHealth();
  changeSlimeHealth();
}

//l-15,-35 q7.5,-17.5 15,2.5 q7.5,-17.5 15,0 z

/*function stand () {
  body.setAttribute('d', 'M0,0 l20,-25 l20,25 l-20,-25 l0,-50 m-20,25 l20,-25 l20,25 l-20,-25 m9,-15 q-7.5,10 -15 0 m0,-15 h3 m15,0 h-3');
  head.setAttribute('cy', '-95');
  character.removeAttribute('crouching');
  character.removeAttribute('attacking');
  setCharacterState({crouch: false, attack: false});
}*/

window.addEventListener('keydown', keyDown);

window.addEventListener('keyup', keyUp);
