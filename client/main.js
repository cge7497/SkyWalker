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
let cloudsShouldLoop = true, activeCheckpoint = {};

var test = "hello";

import { io } from "socket.io-client";
let socket;


// Stores images that are used as sprites.
// It is initialized later because this runs before the react component containing the images.
const imgs = {};

// Stores items that the player holds and their relevant properties.
const items = {
    'screwattack': {
        obtained: false, collected: collectScrewAttack,
        draw: (o) => { drawImage(o) }, collide: (o) => { collideItem(o) }
    },
    'morphball': {
        obtained: false, collected: collectMorphBall,
        draw: (o) => { drawImage(o) }, collide: (o) => { collideItem(o) }
    },
    'yellowswitch': { collected: cloudState, draw: (o) => { drawImage(o) }, collide: (o) => { collideYellowSwitch(o) } },
    'redswitch': { collected: stopFire, draw: (o) => { drawImage(o) } },
    'greyswitch': {
        collected: () => { shouldRotateComp = true; console.log('Hello') },
        draw: (o) => { drawImage(o) }, collide: (o) => { collideItem(o) }
    },
    'fire': {
        collected: collectMorphBall, draw: (o) => { drawFire(o) },
        collide: (o) => { collideFire(o) }
    },
    'hflip': {
        collected: rotateRight, draw: (o) => { drawImage(o) },
        collide: (o) => { collideItem(o) }
    },
    'mouse': {
        collected: collectMouse, draw: (o) => { drawImage(o) },
        collide: (o) => { collideItem(o) }
    },
    'checkpoint': { draw: (o) => { drawCheckpoint(o) }, collide: (o) => { collideCheckpoint(o) } },
    '3DPerson': { draw: (o) => { draw3D(o) } },
    '3DComp': { draw: (o) => { draw3D(o) } },
    '3DArrow': { draw: (o) => { draw3D(o) }, collected: rotateRight, collide: (o) => { rotateRight() } }
};

const drawFire = (o) => {
    if (fireIsOnScreen(player, o)) {
        utilities.drawFire(o.x + camXOffset, o.y + camYOffset, o.width, o.height, p_ctx, fireAnimColor);
    }
};

const collideFire = () => {
    shouldUpdateGame = false;
    explode_audio.play();
    const color = player.color;
    player.color = "red";
    setTimeout((e) => { shouldUpdateGame = true; movePlayerBackToStart(); player.color = color; }, 500);
};

const collideYellowSwitch = (o) => {
    if (player.g === 0 && player.flip === false) {
        level.specialObjects.splice(level.specialObjects.indexOf(o), 1);
        items["yellowswitch"].collected();
    };
};

const collideCheckpoint = (o) => {
    if (!o.active) {
        o.color = "yellow";

        //Set previously active checkpoint to false/grey color.
        activeCheckpoint.active = false;
        activeCheckpoint.color = "";

        player.spawn = [o.x + o.width / 2, o.y - 8];
        activeCheckpoint = o;
        const sound = sfxr.generate("explosion");
        sfxr.play(sound);
    }
    o.active = true;
};

const collideItem = (o) => {
    items[o.name].collected();
    level.specialObjects.splice(level.specialObjects.indexOf(o), 1);
};

const draw3D = (o) => {
    utilities.drawRectangle(o.x + camXOffset, o.y + camYOffset, 25, 25, p_ctx, "orange", true);
    if (fireIsOnScreen(player, o)) {
        shouldDraw3DObjs = true;
        if (!currentlyDrawnModel) {
            scene.add(items[o.name].file);
            currentlyDrawnModel = items[o.name].file;
            vpOffset = [o.x - 320, -o.y + 240];
        }
    }
};

const drawCheckpoint = (o) => {
    let color = "gray";
    if (o.color) { color = o.color; }
    let f = 1;

    switch (o.values.dir) {
        case 0:
            utilities.drawRectangle(o.x + camXOffset, o.y + 25 + camYOffset, o.width, o.height, p_ctx, color, false, true);
            break;
        case 1:
            utilities.drawRectangle(o.x + camXOffset + 25, o.y + camYOffset, o.width, o.height, p_ctx, color, false, true);
            break;
        case 2:
            utilities.drawRectangle(o.x + camXOffset, o.y - 25 + camYOffset, o.width, o.height, p_ctx, color, false, true);
            f = -1;
            break;
        case 3:
            utilities.drawRectangle(o.x + camXOffset - 25, o.y + camYOffset, o.width, o.height, p_ctx, color, false, true);
            break;
        default:
            utilities.drawRectangle(o.x + camXOffset, o.y + 25 + camYOffset, o.width, o.height, p_ctx, color, false, true);
            break;
    }

    if (o.active) {
        const lineY = o.y + camYOffset + (25 * f) + (o.height / 2);
        p_ctx.beginPath();
        p_ctx.setLineDash([3]);
        p_ctx.moveTo(o.x + camXOffset, lineY);
        p_ctx.lineTo(o.x + camXOffset + o.width, lineY);
        p_ctx.strokeStyle = "black";
        p_ctx.closePath();
        p_ctx.stroke();
        p_ctx.setLineDash([]);
    }
};

const drawImage = (o) => {
    p_ctx.drawImage(imgs[o.name], o.x + camXOffset, o.y - o.originY + camYOffset); //I should make these const references.
};



const player = { x: 838, y: 200, halfWidth: 4, halfHeight: 7, newX: 825, newY: 200, scale: 1, name: '', flip: false, g: 0, spawn: [838, 200] };
let playerCloud;
let trueColor = 0, bgRectColor = 0;
let fireAnimColor = 0, playerWalkAnimCounter = 0, playerWalkAnimOut = true;

let xSpeed = 3, ySpeed = 5;
let canFlip = true; let infiniteFlip = false, hasMouse = false, inClouds = false, shouldUpdateGame = true;
let canCrawl = false; const crawlTimerMax = 30; let hasMorphBall = false; let crawlInputTimer = 0, drawGTimer = false, GTimer = 5000;
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
        // setupSocket();
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
    document.getElementById('resetBtn').onmousedown = (e) => { e.preventDefault(); movePlayerBackToStart(); }


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
        characterModel.scale.x = characterModel.scale.y = characterModel.scale.z = 1;
        gltf.scene.name = '3DPerson';

        items['3DPerson'].file = gltf.scene;
    }, undefined, function (error) {
        console.error(error);
    });


    loader.load('assets/img/arrowright.glb', function (gltf) {
        gltf.scene.scale.set(0.25, 0.25, 1);
        gltf.scene.position.x += 2;
        gltf.scene.position.y += 2;
        gltf.scene.name = '3DArrow';

        items['3DArrow'].file = gltf.scene;

    }, undefined, function (error) {
        console.error(error);
    });

    loader.load('assets/img/SavePc.glb', function (gltf) {
        compModel = gltf.scene;
        compModel.scale.x = compModel.scale.y = compModel.scale.z = 9;
        compModel.rotation.y = -Math.PI;
        compModel.rotation.x = -0.25;
        gltf.scene.name = '3DComp';

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

    if (shouldRotateComp) {
        if (compModel.rotation.y <= 0) compModel.rotation.y += 0.01;
        else shouldRotateComp = false;
    }

    // Figure out how to pass delta time bro
    scene.rotation.x = Math.sin(playerWalkAnimCounter / 12) + Math.PI;

    renderer.render(scene, camera);
};

//Runs 60 frames per second. Serves to update game state and draw.
const update = () => {
    if (!inClouds && shouldUpdateGame) {
        updatePlayer();

        // Player.color is actually not set based on data from the server- it is only set by the "explode"/collide with fire function.
        // So the player is always drawn with a black stroke.
        utilities.drawPlayer(player, camXOffset, camYOffset, p_ctx, undefined, playerWalkAnimCounter);

        if (drawGTimer) {
            GTimer -= 17;
            if (GTimer > 0) {
                if (player.flip) {
                    utilities.drawRectangle(player.x - 16 + camXOffset, player.y - 12 + camYOffset, 8, GTimer / 200, p_ctx, "orange", false, true);
                }
                else utilities.drawRectangle(player.x + 10 + camXOffset, player.y - 12 + camYOffset, 8, GTimer / 200, p_ctx, "orange", false, true);
            }
            else rotateDown();
        }

        //utilities.drawDebugPlayer(player, p_ctx, camXOffset, camYOffset);
    }
    else if (inClouds) {
        cloudState();
        if (shouldUpdateGame) {
            updateCloud();
            p_ctx.clearRect(0, 0, 640, 480);

            p_ctx.save();
            p_ctx.scale(2, 2);
            p_ctx.drawImage(imgs['uni'], -GAME_WIDTH / 2 + camXOffset, -GAME_HEIGHT / 2 + camYOffset);
            p_ctx.restore();

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

    camXOffset -= playerCloud.hSpeed / 5;
    camYOffset -= playerCloud.vSpeed / 5;
};

// Updates player movement based on input and collision.
const updatePlayer = () => {
    let xDif = 0, yDif = 0;
    let walked = false;
    if (hasMouse) {
        if (keysPressed[16]) {
            if (keysPressed[65]) { camXOffset += 2; }
            if (keysPressed[68]) { camXOffset -= 2; }
            if (keysPressed[87]) { camYOffset += 2; }
            if (keysPressed[83]) { camYOffset -= 2; }
        }
        if (keysPressed[82]) { camXOffset = 300 - player.x; camYOffset = 300 - player.y; }
    }
    else if (player.g === 0) {
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

    /* If the player hasn't crawled recently (so we don't get a duplicate input)
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
    */

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
        utilities.drawRectangle(r.x + camXOffset, r.y + camYOffset, r.width, r.height, p_ctx, r.values.color, true, false); //can add drawLevelStroked property as last option
    });
    let shouldDraw3DObjs = false;

    //An optimization would be making an array of functions tied to each special object, rather than doing this if then statement.
    level.specialObjects.forEach((o) => {
        if (o.name.substring(0, 2) === '3D') {
            utilities.drawRectangle(o.x + camXOffset, o.y + camYOffset, o.width, o.height, p_ctx, "orange", false);
            if (fireIsOnScreen(player, o)) {
                shouldDraw3DObjs = true;
                // console.log(`current model: ${currentlyDrawnModel}, o.name: ${o.name}`);
                if (currentlyDrawnModel !== o.name) {
                    scene.remove(currentlyDrawnModel);
                    currentlyDrawnModel = false;
                }
                if (!currentlyDrawnModel && items[o.name].file) {
                    scene.add(items[o.name].file);
                    currentlyDrawnModel = items[o.name].file;
                    vpOffset = [o.x - 320, -o.y + 240];
                }
            }
        } else items[o.name].draw(o);
    });

    if (shouldDraw3DObjs) animate();
    else if (currentlyDrawnModel !== false) {
        scene.remove(currentlyDrawnModel);
        currentlyDrawnModel = false;
    }
};

let fireAnimInc = 0.4;
//Draws background clouds onto the background canvas.
const drawBG = () => {
    bg_ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    fireAnimColor += fireAnimInc;
    if (fireAnimColor > 14.5) fireAnimInc = -2;
    else if (fireAnimColor < 0.5) fireAnimInc = 2;

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
        socket.emit("sendMovement", movementThisSecond);
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
            // The order of which directions are checked matters! It affects whether player gets stuck if they move from one rect to another on the same y coord.
            // It may be worth it to do an if then for player.g== 1 (since we should check horizontal collisions first, so the player doesn't get stuck when moving
            // across two same x-coord walls). As of now, no walls that do this exist so I do not do this check.
            if (utilities.collidedFromBottom(p, r) || utilities.collidedFromTop(p, r)) {
                p.newY -= yDif;
                if (p.g === 0) {
                    if (!infiniteFlip) canFlip = true; //If the player doesn't have the screw attack/infinite flip, then continue updating canFlip
                    colliding[1] = true;
                }
            }
            else if (utilities.collidedFromLeft(p, r) || utilities.collidedFromRight(p, r)) {
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
    return (p.newX - p.halfWidth < f.x + 550 && p.newX + p.halfWidth > f.x - 550
        && p.newY - p.halfHeight < f.y + 500 && p.newY + p.halfHeight > f.y - 500);
}


//make array of collision and collected functions to avoid this if then statement
const CollisionsWithSpecialObjects = (p) => {
    level.specialObjects.forEach((o) => {
        if (areColliding(p, o)) {
            if (o.name.substring(0, 2) !== '3D' || o.name === '3DArrow') {
                items[o.name].collide(o);
            }
        }
    });
};

//If the player's data on the server shows they already have items, give them those items.
const initItems = (savedItems) => {
    imgs['screwattack'] = document.getElementById('screwattack');
    imgs['morphball'] = document.getElementById('morphball');
    imgs['greyswitch'] = document.getElementById('greyswitch');
    imgs['yellowswitch'] = document.getElementById('yellowswitch');
    imgs['redswitch'] = document.getElementById('redswitch');
    imgs['hflip'] = document.getElementById('hflip');
    imgs['uni'] = document.getElementById('uni');
    imgs['mouse'] = document.getElementById('mouse');

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

let shouldPlayRotateSound = true;
function rotateRight() {
    player.g = 1;
    player.halfHeight = 4;
    player.halfWidth = 7;
    player.flip = true;
    player.scale = Math.abs(player.scale) * -1;

    drawGTimer = true;
    GTimer = 5000;

    if (shouldPlayRotateSound) {
        const sound = sfxr.generate("powerUp");
        sfxr.play(sound);

        shouldPlayRotateSound = false;

        setTimeout(() => { shouldPlayRotateSound = true }, 100);
    }
};

function rotateDown() {
    const sound = sfxr.generate("jump");
    sound.sound_vol = 0.1;
    sfxr.play(sound);

    player.g = 0; player.halfWidth = 4; player.halfHeight = 7;
    player.flip = false; player.scale = Math.abs(player.scale);
    drawGTimer = false;
}


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
function collectMouse(shouldSendPost = true) {
    document.getElementById('mouse').classList.remove("noDisplay");
    document.getElementById('mouse').classList.add("inline");
    document.getElementById('moveInstructions').innerHTML = `Use '<strong>A</strong>', '<strong>D</strong>', and '<strong>W</strong>' to move (hold <strong>SHIFT</strong>),`;
    hasMouse = true;

    if (shouldSendPost === true) {
        requests.updatePlayer(player.name, 'mouse');
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
    player.x = player.spawn[0]; player.y = player.spawn[1];
    player.flip = false; player.scale = Math.abs(player.scale);
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

    utilities.drawPlayer(player, camXOffset, camYOffset, p_ctx, true, 0);

    bgRects.forEach((r) => {
        r.color = `rgba(${bgRectColor}, ${bgRectColor}, ${bgRectColor}, 0.1)`;
    });

    playerCloud.color = `${trueColor}${bgRectColor.toString(16).substring(0, 2)}`;

    level.rects.forEach((r) => {
        r.color = `rgba(${bgRectColor}, ${bgRectColor}, ${bgRectColor}, 0.5)`;
    });
}


const setupSocket = () => {
    socket = io();
    socket.on('receiveMovement', (movement) => {
        otherPlayerMovement = movement;
    });
};

const keyDown = (e) => {
    // If the target is not the body for a keyClick- meaning the target is an input form- return and don't move player based on this input.
    if (e.target != document.body) return;
    switch (e.keyCode) {
        //Shift press
        case 16:
            keysPressed[e.keyCode] = true;
            break;
        //'A' press
        case 65:
            keysPressed[e.keyCode] = true;
            break;

        //'D' press
        case 68:
            keysPressed[e.keyCode] = true;
            break;
        // 'R' press
        case 82:
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
                    sound.sound_vol = 0.1;
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
        case 16:
            keysPressed[e.keyCode] = false;
            break;
        case 65:
            keysPressed[e.keyCode] = false;
            break;

        case 68:
            keysPressed[e.keyCode] = false;
            break;
        case 82:
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