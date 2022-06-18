import * as utilities from "./utilities.js";
import * as THREE from 'three';
import * as level from "./level.js"
import * as requests from './requests.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


let w_ctx, p_ctx, bg_ctx, js3_ctx, scene, renderer, camera, characterModel = THREE.Object3D, compModel = THREE.Object3D, currentlyDrawnModel = false;
let vpOffset = [0, 0], shouldRotateComp = false;
const sq_walkers = [], arc_walkers = [];
const bgRects = [];
let movementThisSecond = {}; let otherPlayerMovement = {};
let updateMovement = true, otherPlayerMovementFrame = 0, shouldDrawOthers = false;
let cloudsShouldLoop = true;

var test = "hello";

import { io } from "socket.io-client";
import { Scene } from "three";
let socket;


// Stores images that are used as sprites.
// It is initialized later because this runs before the react component containing the images.
const imgs = {};

// Stores items that the player holds and their relevant properties.
const items = {
    'screwattack': { obtained: false, collected: collectScrewAttack },
    'morphball': { obtained: false, collected: collectMorphBall },
    'yellowswitch': { collected: cloudState },
    'redswitch': { collected: stopFire },
    'greyswitch': { collected: ()=>{shouldRotateComp=true} },
    'fire': { collected: collectMorphBall },
    'hflip': { collected: rotateRight },
    '3DPerson': {},
    '3DComp': {},
};

const player = { x: 838, y: 200, halfWidth: 4, halfHeight: 7, newX: 825, newY: 200, scale: 1, ame: '', flip: false, g: 0, spawn: [825, 200] };
let playerCloud;
let trueColor = 0, bgRectColor = 0;
let fireAnimColor = 0, playerWalkAnimCounter = 0, playerWalkAnimOut = true;

let xSpeed = 3, ySpeed = 5;
let canFlip = true; let infiniteFlip = false, inClouds = false, shouldUpdateGame = true;;
let canCrawl = false; const crawlTimerMax = 30; let hasMorphBall = false; let crawlInputTimer = 0;
let keysPressed = [];
let canvasWidth, canvasHeight;
let btn_audio, item_audio, bg_audio, whistle_audio, sky_audio, explode_audio;
let walker_counter = 0;
let bg_dir_rad = 0, bg_dir_rad_Inc = 0;
let bg_color = "white", bg_color_rgb = [255, 255, 255], should_change_bg_color = false;
const GAME_WIDTH = 640, GAME_HEIGHT = 480;
const BG_DIR_MULTIPLIER = 1;
let camXOffset = -538, camYOffset = 100, prevCamXOffset = 0, prevCamYOffset = 0;

// Initializes the game mainly based on data gotten in level.js getData. 
// Runs after the player has logged in (called in playerLogin.js)
const startGameLogic = (obj, immediate = false) => {
    if (obj && obj.username && obj.items && obj.color && obj.shape >= 0) {
        player.name = obj.username;
        trueColor = obj.color;
        player.shape = obj.shape;
        if (obj.items) initItems(obj.items);

        what_is_my_name = "uh... " + obj.username;
        //setupSocket();
    }
    else {
    }

    movementThisSecond.name = player.name;
    movementThisSecond.color = trueColor;
    movementThisSecond.movement = [];

    //I created these sounds with SFXR (http://sfxr.me/)
    btn_audio = new Audio("assets/sound/buttonClick.wav");
    item_audio = new Audio("assets/sound/itemGet.wav");
    item_audio = new Audio("assets/sound/itemGet.wav");
    explode_audio = new Audio("assets/sound/explosion.wav");

    // This is the song "The Earth" by J.S. Bach. It is the version from the film "Solaris"
    bg_audio = new Audio("assets/sound/the-earth.mp3");
    bg_audio.volume = 0.25;
    // This is the Warp Whistle theme from Super Mario Adnvance 4: Super Mario Bros. 3
    whistle_audio = new Audio("assets/sound/warp-whistle.mp3");
    whistle_audio.volume = 0.3;
    // This is the World 9 theme from Super Mario Advance 4: Super Mario Bros. 3
    sky_audio = new Audio("assets/sound/world-sky.mp3");
    sky_audio.volume = 0.25;

    // We must wait for them to interact with the page (click event listener has to fire) in order to play audio successfully.
    // If the user was not automatically logged in, meaning they have had to interact with the page, just play the audio.
    if (immediate) {
        document.addEventListener('click', (e) => {
            //bg_audio.play();
            bg_audio.loop = true;
        }, { once: true });
    }
    else {
        //bg_audio.play();
        bg_audio.loop = true;
    }

    let p_canvas = document.querySelector("#canvas_player");
    let w_canvas = document.querySelector("#canvas_walkers");
    let bg_canvas = document.querySelector("#canvas_bg");
    let js3_canvas = document.querySelector("#canvas_js3");
    document.getElementById('resetBtn').onclick = movePlayerBackToStart;


    w_ctx = w_canvas.getContext('2d');
    p_ctx = p_canvas.getContext('2d');
    bg_ctx = bg_canvas.getContext('2d');
    //js3_ctx = js3_canvas.getContext('webgl');

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, GAME_WIDTH / GAME_HEIGHT, 0.1, 1000);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // camera = new THREE.OrthographicCamera(0, GAME_WIDTH, GAME_HEIGHT, 0, 0, 10);

    // Thanks to https://stackoverflow.com/a/20496296 for describing how to have a clear background in three.js.
    renderer = new THREE.WebGLRenderer({ canvas: js3_canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);

    const light = new THREE.AmbientLight(0xffffff); // soft white light
    scene.add(light);

    // White directional light at half intensity shining from the top.
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(directionalLight);



    camera.position.z = 100;

    const loader = new GLTFLoader();

    loader.load('assets/img/character.glb', function (gltf) {
        characterModel = gltf.scene;
        //scene.add(characterModel);
        characterModel.scale.x = characterModel.scale.y = characterModel.scale.z  = 1;

        items['3DPerson'].file = gltf.scene;

        // console.log(characterModel.position);

        // renderer.render(scene, camera);
    }, undefined, function (error) {
        console.error(error);
    });

    loader.load('assets/img/SavePc.glb', function (gltf) {
        compModel = gltf.scene;
        compModel.scale.x = compModel.scale.y = compModel.scale.z = 9;
        compModel.rotation.y = -Math.PI;
        compModel.rotation.x = -0.25;
        
        items['3DComp'].file = gltf.scene;
        compModel.position.y -= 30;
        // compModel.position.x -= 20;

    }, undefined, function (error) {
        console.error(error);
    });


    canvasWidth = w_canvas.width;
    canvasHeight = w_canvas.height;

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    //If getLevel (in level.js) got back a set of clouds, add them to the bgRects/clouds that will be displayed by the client.
    if (level.clouds && level.clouds.length > 0) {
        level.clouds.forEach((c) => {
            bgRects.push(new level.bgRect(Math.random() * (GAME_WIDTH - 10) + 5, Math.random() * (GAME_HEIGHT - 10) + 5, Math.random() * 10 + 30, Math.random() * 4 + 3, c));
        })
    }

    for (let i = 0; i < 10; i++) {
        bgRects.push(new level.bgRect(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.random() * 10 + 30, Math.random() * 4 + 3, "rgba(0,0,0,0.3)"));
    }
    drawBG();

    w_ctx.fillStyle = "black";


    setInterval(update, 1000 / 60);
    setInterval(drawBG, 1000 / 15);
    // setInterval(animate, 1000 / 30);

    // setInterval(sendAndReceiveMovement, 1000);
    // setInterval(drawOtherPlayerMovement, 1000 / 30);
}

const animate = () => {
    // if (camXOffset === prevCamXOffset && camYOffset === prevCamYOffset) return;

    //js3_ctx.translate(camXOffset + 1000, GAME_HEIGHT - camYOffset - 1850);
    renderer.setViewport(vpOffset[0] + camXOffset, vpOffset[1] - camYOffset, GAME_WIDTH, GAME_HEIGHT);

    if (shouldRotateComp){
        if (compModel.rotation.y <= 0 ) compModel.rotation.y += 0.01;
        else shouldRotateComp = false;
    }

    // scene.rotation.y += 0.01;


    renderer.render(scene, camera);
};

//Runs 60 frames per second. Serves to update game state and draw.
const update = () => {
    if (!inClouds && shouldUpdateGame) {
        updatePlayer();

        // Player.color is actually not set based on data from the server- it is only set by the "explode"/collide with fire function.
        // So the player is always drawn with a black stroke.
        utilities.drawPlayer(player, camXOffset, camYOffset, p_ctx, undefined, playerWalkAnimCounter);

        //utilities.drawDebugPlayer(player, p_ctx, camXOffset, camYOffset);
    }
    else if (inClouds) {
        cloudState();
        if (shouldUpdateGame) {
            updateCloud();
            utilities.drawPlayerCloud(playerCloud, p_ctx, camXOffset);
        }
    }

    drawLevel();
};

const updateCloud = () => {

    if (keysPressed[65]) {
        playerCloud.dirRad += 0.01;
    }

    if (keysPressed[68]) {
        playerCloud.dirRad -= 0.01;
    }

    playerCloud.hSpeed = Math.cos(playerCloud.dirRad);
    playerCloud.vSpeed = Math.sin(playerCloud.dirRad);

    playerCloud.x += playerCloud.hSpeed / 2; playerCloud.y += playerCloud.vSpeed / 2;

    // makes the rectangle wrap around the screen.
    // if (playerCloud.x > canvasWidth + 20) { playerCloud.x = -20 }
    // else if (playerCloud.x < -20) { playerCloud.x = canvasWidth + 20 }
    if (playerCloud.y > canvasHeight + 20) { playerCloud.y = -20 }
    else if (playerCloud.y < -20) { playerCloud.y = canvasHeight + 20 }

    camXOffset -= playerCloud.hSpeed / 2.5;
};

// Updates player movement based on input and collision.
const updatePlayer = () => {
    let xDif = 0, yDif = 0;
    let walked = false;
    if (player.g === 0) {
        if (keysPressed[65]) { xDif = -xSpeed; walked = true; }
        if (keysPressed[68]) { xDif = xSpeed; walked = true; }
        //else if (crawlInc<crawlIncMax) 

        if (player.flip) yDif = -ySpeed;
        else yDif = ySpeed;
    }
    else if (player.g === 1) {
        if (keysPressed[87]) { yDif = -xSpeed; walked = true; }
        if (keysPressed[83]) { yDif = xSpeed; walked = true; }
        //else if (crawlInc<crawlIncMax) 

        if (player.flip) xDif = ySpeed;
        else xDif = -ySpeed;
    }

    //If the player hasn't crawled recently (so we don't get a duplicate input)
    if (canCrawl) {
        if (player.g === 0 && keysPressed[87] || player.g === 1 && keysPressed[68]) {

            //make sure the camera stays centered on player despite edits to their y coordinates caused by crawling.
            camYOffset -= utilities.handlePlayerCrawl(player, player.flip);

            canCrawl = false;
            crawlInputTimer = crawlTimerMax;
            xDif = 0; yDif = 0;//making the player not move horizontally when changing to/from ball prevents some collision errors.
        }
    }
    else if (hasMorphBall) {
        crawlInputTimer -= 1;
        if (crawlInputTimer <= 0) canCrawl = true;
    }

    player.newX = player.x + xDif;
    player.newY = player.y + yDif;

    let colliding = CollisionsWithLevel(player, xDif, yDif); //returns a bool if not colliding, otherwise returns an array of collisions.
    if (!colliding[0]) {
        player.x += xDif; player.y += yDif;
        camXOffset -= xDif;
        camYOffset -= yDif;
    }
    else {
        camXOffset += player.x - player.newX;
        camYOffset += player.y - player.newY;
        player.x = player.newX;
        player.y = player.newY;
    }

    updatePlayerWalkAnim(walked, colliding[1]);

    CollisionsWithSpecialObjects(player);
}

//Draws the level (composed of rectangles and special objects) onto the player canvas.
const drawLevel = () => {
    level.rects.forEach((r) => {
        utilities.drawRectangle(r.x + camXOffset, r.y + camYOffset, r.width, r.height, p_ctx, r.values.color, true);
    });
    let shouldDraw3DObjs = false;
    //An optimization would be making an array of functions tied to each special object, rather than doing this if then statement.
    level.specialObjects.forEach((o) => {
        if (o.name === "fire") {
            if (fireIsOnScreen(player, o)) {
                utilities.drawFire(o.x + camXOffset, o.y + camYOffset, o.width, o.height, p_ctx, fireAnimColor);
            }
        }
        else if (o.name.substring(0, 2) === '3D') {
            utilities.drawRectangle(o.x + camXOffset, o.y + camYOffset, 25, 25, p_ctx, "orange", true);
            if (fireIsOnScreen(player, o)) {
                shouldDraw3DObjs = true;
                if (!currentlyDrawnModel) {
                    scene.add(items[o.name].file);
                    currentlyDrawnModel = items[o.name].file;
                    vpOffset = [o.x - 320, -o.y + 240];
                }
            };
        }
        else if (o.name === "checkpoint") {
            utilities.drawRectangle(o.x + camXOffset, o.y + 25 + camYOffset, o.width, o.height, p_ctx, "gray", false);
        }
        else {
            p_ctx.drawImage(imgs[o.name], o.x + camXOffset, o.y - o.originY + camYOffset); //I should make these const references.
        }
    });

    if (shouldDraw3DObjs) animate();
    else if (currentlyDrawnModel!==false) {
        scene.remove(currentlyDrawnModel);
        currentlyDrawnModel = false;
    }
};

//Draws background clouds onto the background canvas.
const drawBG = () => {
    bg_ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    fireAnimColor += 1;
    if (fireAnimColor >= 5) fireAnimColor = 0;

    if (should_change_bg_color) {
        bg_color_rgb = utilities.fadeBGColorToDarkBlue(bg_color_rgb);
        bg_color = "rgb(" + bg_color_rgb[0] + "," + bg_color_rgb[1] + "," + bg_color_rgb[2] + ")";
    }
    utilities.drawRectangle(0, 0, canvasWidth, canvasHeight, bg_ctx, bg_color, true);
    bg_dir_rad += bg_dir_rad_Inc;
    bgRects.forEach(function (rect) {
        //bg_dir_rad is 0 at the start and changes value when the green diamond is collected.
        //When that happens, the rectangles's speeds will change slightly every time they are drawn.

        //rect.hSpeed = Math.cos(bg_dir_rad) * BG_DIR_MULTIPLIER;
        //rect.vSpeed = Math.sin(bg_dir_rad) * BG_DIR_MULTIPLIER;

        rect.x += rect.hSpeed;
        rect.y += rect.vSpeed;

        //makes the rectangle wrap around the screen.
        if (cloudsShouldLoop) {
            if (rect.x > canvasWidth + 20) { rect.x = -20 }
            else if (rect.x < -20) { rect.x = canvasWidth + 20 }
            if (rect.y > canvasHeight + 20) { rect.y = -20 }
            else if (rect.y < -20) { rect.y = canvasHeight + 20 }
        }

        utilities.drawRectangle(rect.x, rect.y, rect.width, rect.height, bg_ctx, rect.color, true)
    });
};

// Sends the player's movement in the last second.
const sendAndReceiveMovement = async () => {
    if (movementThisSecond && !inClouds) {
        //socket.emit("sendMovement", movementThisSecond);
        otherPlayerMovementFrame = 0;
        movementThisSecond.movement = [];
    }
};
// Draws the movement of other players onto the walkers canvas, which is above the bg and behind the player.
const drawOtherPlayerMovement = () => {
    if (inClouds) return;

    //store this player's coordinate
    movementThisSecond.movement.push({ x: player.x + player.halfWidth, y: player.y + player.halfHeight, flip: player.flip });

    let keys;
    if (otherPlayerMovement) {
        // I got this Object.keys() function from https://stackoverflow.com/questions/37673454/javascript-iterate-key-value-from-json
        // It gets the property names (meaning the player names) of the movementJSONObject.
        keys = Object.keys(otherPlayerMovement);
    }
    else return;
    keys.splice(keys.indexOf(player.name), 1); //remove this player's movement from the array, so it is not needlessly drawin them.
    if (keys.length < 1) return;

    w_ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    keys.forEach((m) => {
        const f = otherPlayerMovement[m].movement[otherPlayerMovementFrame];
        if (f) {
            f.color = `${otherPlayerMovement[m].color}55`;
            utilities.drawPlayer(f, camXOffset, camYOffset, w_ctx, false, 0);
        }
    });
    otherPlayerMovementFrame += 1;
};

//Returns true if there are collisions. It also fixes these collisions.
const CollisionsWithLevel = (p, xDif, yDif) => {
    //
    let colliding = [false, false]; // 0 shows whether any collisions occured. 1 shows whether a collision with the ground (based on g) occurred.
    level.rects.forEach((r) => {
        if (areColliding(p, r)) {
            colliding[0] = true;
            //have to adjust the X that is used in the next equation...
            if (utilities.collidedFromBottom(p, r) || utilities.collidedFromTop(p, r)) {
                p.newY -= yDif;
                if (p.g === 0) {
                    if (!infiniteFlip) canFlip = true; //If the player doesn't have the screw attack/infinite flip, then continue updating canFlip
                    colliding[1] = true;
                }
            }
            if (utilities.collidedFromLeft(p, r) || utilities.collidedFromRight(p, r)) {
                p.newX -= xDif;
                if (p.g === 1) {
                    if (!infiniteFlip) canFlip = true; //If the player doesn't have the screw attack/infinite flip, then continue updating canFlip
                    colliding[1] = true;
                }
            }
        }
    });
    return colliding;
};
//Checks if two objects are colliding. (Only used by the player and rectangles/special objects currently.)
const areColliding = (p, r) => {
    return (p.newX - p.halfWidth < r.x + r.width && p.newX + p.halfWidth > r.x
        && p.newY - p.halfHeight < r.y + r.height && p.newY + p.halfHeight > r.y);
};

const fireIsOnScreen = (p, f) => {
    return (p.newX - p.halfWidth < f.x + 800 && p.newX + p.halfWidth > f.x - 800
        && p.newY - p.halfHeight < f.y + 500 && p.newY + p.halfHeight > f.y - 500);
}


//make array of collision and collected functions to avoid this if then statement
const CollisionsWithSpecialObjects = (p) => {
    level.specialObjects.forEach((o) => {
        if (areColliding(p, o)) {
            if (o.name !== "fire" && o.name !== "checkpoint" && o.name !== "yellowswitch") {
                if (o.name.substring(0,2)!='3D') level.specialObjects.splice(level.specialObjects.indexOf(o), 1);
                items[o.name].collected();
            }
            else if (o.name === "checkpoint") {
                o.color = "yellow";

                player.spawn = [o.x + o.width / 2, o.y - 8];

                const sound = sfxr.generate("explosion");

                sfxr.play(sound);
            }
            else if (o.name === "yellowswitch") {
                if (p.g === 0 && p.flip === false) {
                    level.specialObjects.splice(level.specialObjects.indexOf(o), 1);
                    items[o.name].collected();
                }
            }
            else if (o.name === "fire") {
                shouldUpdateGame = false;
                explode_audio.play();
                const color = player.color;
                player.color = "red";
                setTimeout((e) => { shouldUpdateGame = true; movePlayerBackToStart(); player.color = color; }, 500);
            }
        }
    })
};

//If the player's data on the server shows they already have items, give them those items.
const initItems = (savedItems) => {
    imgs['screwattack'] = document.getElementById('screwattack');
    imgs['morphball'] = document.getElementById('morphball');
    imgs['greyswitch'] = document.getElementById('greyswitch');
    imgs['yellowswitch'] = document.getElementById('yellowswitch');
    imgs['redswitch'] = document.getElementById('redswitch');
    imgs['hflip'] = document.getElementById('hflip');

    if (savedItems['morphball'] === true) {
        collectMorphBall(false);
    }
    if (savedItems['screwattack'] === true) {
        collectScrewAttack(false);
    }
};

const setShape = (shape = 0) => {
    player.shape = shape;

    if (shape === 1) player.scale = 2;
    else if (shape === 2) player.scale = 0.5;
    else player.scale = 1;
}

const updatePlayerWalkAnim = (walked = false, onGround = false) => {
    if (walked && onGround) {
        if (playerWalkAnimOut) {
            playerWalkAnimCounter += 0.25;
            if (playerWalkAnimCounter >= 2) playerWalkAnimOut = false;
        }
        else {
            playerWalkAnimCounter -= 0.25;
            if (playerWalkAnimCounter <= -2) playerWalkAnimOut = true;
        }
    }
    //Revert back to 2
    else if (playerWalkAnimCounter !== 0) {
        playerWalkAnimCounter += 0 - playerWalkAnimCounter;
    }
};

function rotateRight() {
    player.g = 1;
    player.flip = true;

    const sound = sfxr.generate("powerUp");

    sfxr.play(sound);
};



// I made these 'functions' so they can be accessed in the items object declaration (as they are referenced before defined).
// They handle giving the player the relevant item. They displays the relevant image next to items, updates instruction text,
// and may send a POST request to the server updating this player's items.
function collectMorphBall(shouldSendPost = true) {
    document.getElementById('morphball').classList.remove("noDisplay");
    document.getElementById('morphball').classList.add("inline");
    document.getElementById('moveInstructions').innerHTML = `Use '<strong>A</strong>', '<strong>D</strong>', and '<strong>W</strong>' to move, `;
    canCrawl = true; hasMorphBall = true;
    if (shouldSendPost === true) {
        requests.updatePlayer(player.name, 'morphball');
        item_audio.play();
    }
}
function collectScrewAttack(shouldSendPost = true) {
    document.getElementById('screwattack').classList.remove("noDisplay");
    document.getElementById('screwattack').classList.add("inline");
    document.getElementById('spaceInstructions').innerHTML = `<strong>&nbsp;SPACE</strong> to ultra flip`
    infiniteFlip = true;
    if (shouldSendPost === true) {
        requests.updatePlayer(player.name, 'screwattack');
        item_audio.play();
    }
}

function stopFire() {
    for (let i = level.specialObjects.length - 1; i >= 0; i--) {
        if (level.specialObjects[i].id === "fire") level.specialObjects.splice(i, 1);
    }
}

// Ran when the 'Back To Start' button is clicked. Useful if the player shoots off into the distance without the screw attack.
const movePlayerBackToStart = () => {
    player.x = player.spawn[0]; player.y = player.spawn[1]; player.flip = false;
    player.newX = 300; player.newY = 300;
    camXOffset = 300 - player.x; camYOffset = 300 - player.y;
}

// Runs every update (60 fps) once the player has clicked the yellow button.
// Displays some cool graphics/effects.
function cloudState() {
    //Runs the first frame the player turns into cloud: creates the cloud object, plays audio.
    if (!inClouds) {
        shouldUpdateGame = false;

        //create a background rectangle of the player's selected color.
        playerCloud = new level.bgRect(player.x, -20, Math.random() * 10 + 30, Math.random() * 4 + 3, trueColor);
        playerCloud.dirRad = Math.PI / 2;
        playerCloud.halfWidth = playerCloud.width / 2;
        playerCloud.halfHeight = playerCloud.height / 2;

        //requests.sendCloud(trueColor);

        bg_audio.pause();
        whistle_audio.play();

        // Kind of fun to glitch around... I may comment this.
        document.getElementById('resetBtn').disabled = true;

        //Play the sky theme after the whistle audio is over. Could use an event listener instead.
        setTimeout(() => {
            sky_audio.play();
            shouldUpdateGame = true;
            cloudsShouldLoop = false;
            // I got this code for perfect audio looping (as the loop attribute has delay) from https://stackoverflow.com/a/22446616
            sky_audio.addEventListener('timeupdate', (e) => {
                const buffer = 0.12;
                if (sky_audio.currentTime > sky_audio.duration - buffer) {
                    sky_audio.currentTime = 0;
                    sky_audio.play();
                }
            })
        }, 4000);

        inClouds = true;
    }

    if (bgRectColor < 254) {
        bgRectColor += 0.2;
        player.y += 0.85;
    }

    //Makes the player's alpha decrease.
    player.color = `#000000${(255 - bgRectColor).toString(16).substring(0, 2)}`;

    // console.log(player.color);

    utilities.drawPlayer(player, camXOffset, camYOffset, p_ctx, false, 0);

    bgRects.forEach((r) => {
        r.color = `rgba(${bgRectColor}, ${bgRectColor}, ${bgRectColor}, 0.1)`;
    });

    playerCloud.color = `${trueColor}${bgRectColor.toString(16).substring(0, 2)}`;

    level.rects.forEach((r) => {
        r.color = `rgba(${bgRectColor}, ${bgRectColor}, ${bgRectColor}, 0.5)`;
    });
}

/*
const setupSocket = () => {
    socket = io();
    socket.on('receiveMovement', (movement) => {
        otherPlayerMovement = movement;
    });
};
*/
const keyDown = (e) => {
    // If the target is not the body for a keyClick- meaning the target is an input form- return and don't move player based on this input.
    if (e.target != document.body) return;
    switch (e.keyCode) {
        //'A' press
        case 65:
            keysPressed[e.keyCode] = true;
            break;

        //'D' press
        case 68:
            keysPressed[e.keyCode] = true;
            break;

        //'S' press
        case 83:
            keysPressed[e.keyCode] = true;
            break;

        //'W' press, which should only do something after the player collects the morph ball
        case 87:
            keysPressed[e.keyCode] = true;
            break;

        //Space is pressed.
        case 32:
            e.preventDefault();
            //Only flip the player if space was not pressed the previous frame, and the player can flip based on landing on grounds/items.
            if (!keysPressed[e.keyCode]) {
                if (canFlip || infiniteFlip) {
                    player.flip = !player.flip;
                    player.scale *= -1;
                    canFlip = false;

                    const sound = sfxr.generate("jump");
                    sfxr.play(sound);
                }
            }
            keysPressed[e.keyCode] = true;
            break;
    }
};

const keyUp = (e) => {
    if (e.target != document.body) return;
    switch (e.keyCode) {
        case 65:
            keysPressed[e.keyCode] = false;
            break;

        case 68:
            keysPressed[e.keyCode] = false;
            break;

        case 83:
            keysPressed[e.keyCode] = false;
            break;
        case 87:
            keysPressed[e.keyCode] = false;
            break;

        case 32:
            keysPressed[e.keyCode] = false;
            break;
    }
};

export { startGameLogic, setShape };