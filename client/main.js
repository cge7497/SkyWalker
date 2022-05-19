import * as utilities from "./utilities.js";
import * as level from "./level.js"
import * as requests from './requests.js';

let w_ctx, p_ctx, bg_ctx;
const sq_walkers = [], arc_walkers = [];
const bgRects = [];
let movementThisSecond = {}; let otherPlayerMovement = {};
let updateMovement = true, otherPlayerMovementFrame = 0, shouldDrawOthers = false;

// Stores images that are used as sprites.
// It is initialized later because this runs before the react component containing the images.
const imgs = {};

// Stores items that the player holds and their relevant properties.
const items = {
    'screwattack': { obtained: false, collected: collectScrewAttack },
    'morphball': { obtained: false, collected: collectMorphBall },
    'yellowswitch': { collected: endGame },
    'fire': { collected: collectMorphBall },
};

const player = { x: -450, y: 690, halfWidth: 4, halfHeight: 7, newX: 300, newY: 300, scale: 1, name: '', flip: false };
let trueColor = 0, bgRectColor = 0;

let xSpeed = 3, ySpeed = 5;
let canFlip = true; let infiniteFlip = false, inEndGame = false, shouldUpdateGame = true;;
let canCrawl = false; const crawlTimerMax = 30; let hasMorphBall = false; let crawlInputTimer = 0;
let keysPressed = [];
let canvasWidth, canvasHeight;
let btn_audio, item_audio, bg_audio, whistle_audio, sky_audio, explode_audio;
let walker_counter = 0;
let bg_dir_rad = 0, bg_dir_rad_Inc = 0;
let bg_color = "white", bg_color_rgb = [255, 255, 255], should_change_bg_color = false;
const GAME_WIDTH = 640, GAME_HEIGHT = 480;
const BG_DIR_MULTIPLIER = 1;
let camXOffset = 0, camYOffset = 0;


// Initializes the game mainly based on data gotten in level.js getData. 
// Runs after the player has logged in (called in playerLogin.js)
const init = (obj, immediate = false) => {
    if (obj && obj.username && obj.items && obj.color && obj.shape >= 0) {
        player.name = obj.username;
        trueColor = obj.color;
        player.shape = obj.shape;
        if (obj.items) initItems(obj.items);

        setupSocket();
    }
    else {
    }

    movementThisSecond.name = player.name;
    movementThisSecond.color = trueColor;
    movementThisSecond.movement = [];

    //I created these sounds with SFXR (http://sfxr.me/)
    btn_audio = new Audio("assets/sound/buttonClick.wav");
    btn_audio.volume = 0.25;
    item_audio = new Audio("assets/sound/itemGet.wav");
    item_audio.volume = 0.25;
    item_audio = new Audio("assets/sound/itemGet.wav");
    item_audio.volume = 0.25;
    explode_audio = new Audio("assets/sound/explosion.wav");
    explode_audio.volume = 0.25;

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
            bg_audio.play();
            bg_audio.loop = true;
        }, { once: true });
    }
    else {
        bg_audio.play();
        bg_audio.loop = true;
    }

    let p_canvas = document.querySelector("#canvas_player");
    let w_canvas = document.querySelector("#canvas_walkers");
    let bg_canvas = document.querySelector("#canvas_bg");
    document.getElementById('resetBtn').onclick = movePlayerBackToStart;

    w_ctx = w_canvas.getContext('2d');
    p_ctx = p_canvas.getContext('2d');
    bg_ctx = bg_canvas.getContext('2d');

    canvasWidth = w_canvas.width;
    canvasHeight = w_canvas.height;

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    utilities.drawPlayer(300, 300, p_ctx, false);

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
    player.x = player.y = 300;

    setInterval(update, 1000 / 60);
    setInterval(drawBG, 1000 / 15);
    setInterval(sendAndReceiveMovement, 1000);
    setInterval(drawOtherPlayerMovement, 1000/30);
}
//Runs 60 frames per second. Serves to update game state and draw.
const update = () => {
    if (!inEndGame && shouldUpdateGame) {
        updatePlayer();
        // Player.color is actually not set based on data from the server- it is only set by the "explode"/collide with fire function.
        // So the player is always drawn with a black stroke.
        utilities.drawPlayer(player.x + camXOffset, player.y + camYOffset, p_ctx, player.flip, player.scale, player.color, undefined, player.shape);
        //utilities.drawDebugPlayer(player, p_ctx, camXOffset, camYOffset);
    }
    else if (inEndGame) endGame();
    drawLevel();
}

// Updates player movement based on input and collision.
const updatePlayer = () => {
    let xDif = 0, yDif = 0;
    if (keysPressed[65]) xDif = -xSpeed;
    if (keysPressed[68]) xDif = xSpeed;
    //else if (crawlInc<crawlIncMax) 

    if (player.flip) yDif = -ySpeed;
    else yDif = ySpeed;

    //If the player hasn't crawled recently (so we don;t get a duplicate input)
    if (canCrawl) {
        if (keysPressed[87]) {
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
    if (!colliding) {
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
    CollisionsWithSpecialObjects(player);
}

//Draws the level (composed of rectangles and special objects) onto the player canvas.
const drawLevel = () => {
    level.rects.forEach((r) => {
        utilities.drawRectangle(r.x + camXOffset, r.y + camYOffset, r.width, r.height, p_ctx, r.color, true);
    });
    level.specialObjects.forEach((o) => {
        if (o.id != "fire") {
            p_ctx.drawImage(imgs[o.id], o.x + camXOffset, o.y + camYOffset); //I should make these const references.
        }
    });
};

//Draws background clouds onto the background canvas.
const drawBG = () => {
    bg_ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    if (should_change_bg_color) {
        bg_color_rgb = utilities.fadeBGColorToDarkBlue(bg_color_rgb);
        bg_color = "rgb(" + bg_color_rgb[0] + "," + bg_color_rgb[1] + "," + bg_color_rgb[2] + ")";
    }
    utilities.drawRectangle(0, 0, canvasWidth, canvasHeight, bg_ctx, bg_color, true);
    bg_dir_rad += bg_dir_rad_Inc;
    bgRects.forEach(function (rect) {
        //bg_dir_rad is 0 at the start and changes value when the green diamond is collected.
        //When that happens, the rectangles's speeds will change slightly every time they are drawn.
        rect.hSpeed = Math.cos(bg_dir_rad) * BG_DIR_MULTIPLIER;
        rect.vSpeed = Math.sin(bg_dir_rad) * BG_DIR_MULTIPLIER;

        rect.x += rect.hSpeed;
        rect.y += rect.vSpeed;

        //makes the rectangle wrap around the screen.
        if (rect.x > canvasWidth + 20) { rect.x = -20 }
        else if (rect.x < -20) { rect.x = canvasWidth + 20 }
        if (rect.y > canvasHeight + 20) { rect.y = -20 }
        else if (rect.y < -20) { rect.y = canvasHeight + 20 }

        utilities.drawRectangle(rect.x, rect.y, rect.width, rect.height, bg_ctx, rect.color, true)
    });
    level.specialObjects.forEach((o) => {
        if (o.id == "fire") {
            utilities.drawFire(o.x + camXOffset, o.y + camYOffset, o.width, o.height, bg_ctx);
        }
    });
};

// Sends the player's movement in the last second.
const sendAndReceiveMovement = async () => {
    if (movementThisSecond && !inEndGame) {
        console.log(socket);
        socket.emit("sendMovement", movementThisSecond);
        otherPlayerMovementFrame = 0;
        movementThisSecond.movement = [];
    }
};
// Draws the movement of other players onto the walkers canvas, which is above the bg and behind the player.
const drawOtherPlayerMovement = () => {
    if (inEndGame) return;

    //store this player's coordinate
    movementThisSecond.movement.push({ x: player.x + player.halfWidth, y: player.y + player.halfHeight, flipped: player.flip });

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
        if (f) utilities.drawPlayer(f.x + camXOffset - 1.5, f.y + camYOffset - 7, w_ctx, f.flipped, 1, `${otherPlayerMovement[m].color}55`, false);
    });
    otherPlayerMovementFrame += 1;
};

//Returns true if there are collisions. It also fixes these collisions.
const CollisionsWithLevel = (p, xDif, yDif) => {
    let colliding = false;
    level.rects.forEach((r) => {
        if (areColliding(p, r)) {
            colliding = true;
            if (utilities.collidedFromBottom(p, r) || utilities.collidedFromTop(p, r)) {
                p.newY -= yDif;
                if (!infiniteFlip) canFlip = true; //If the player doesn't have the screw attack/infinite flip, then continue updating canFlip
            }
            if (utilities.collidedFromLeft(p, r) || utilities.collidedFromRight(p, r)) {
                p.newX -= xDif;
            }
        }
    });
    return colliding;
};
//Checks if two objects are colliding. (Only used by the player and rectangles/special objects currently.)
const areColliding = (p, r) => {
    return (p.newX - p.halfWidth < r.x + r.width && p.newX + p.halfWidth > r.x
        && p.newY - p.halfHeight < r.y + r.height && p.newY + p.halfHeight > r.y);
}

const CollisionsWithSpecialObjects = (p) => {
    level.specialObjects.forEach((o) => {
        if (areColliding(p, o)) {
            if (o.id !== "fire") {
                level.specialObjects.splice(level.specialObjects.indexOf(o), 1);
                items[o.id].collected();
            }
            else {
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
    imgs['yellowswitch'] = document.getElementById('yellowswitch');

    if (savedItems['morphball'] === true) {
        collectMorphBall(false);
    }
    if (savedItems['screwattack'] === true) {
        collectScrewAttack(false);
    }
};

const setShape = (shape = 0) => {
    player.shape = shape;
}

// I made these 'functions' so they can be accessed in the items object declaration (as they are referenced before defined).
// They handle giving the player the relevant item. They displays the relevant image next to items, updates instruction text,
// and may send a POST request to the server updating this player's items.
function collectMorphBall(shouldSendPost = true) {
    document.getElementById('morphball').style.display = 'inline';
    document.getElementById('moveInstructions').innerHTML = `Use '<strong>A</strong>', '<strong>D</strong>', and '<strong>W</strong>' to move, `;
    canCrawl = true; hasMorphBall = true;
    if (shouldSendPost === true) {
        requests.updatePlayer(player.name, 'morphball');
        item_audio.play();
    }
}
function collectScrewAttack(shouldSendPost = true) {
    document.getElementById('screwattack').style.display = 'inline';
    document.getElementById('spaceInstructions').innerHTML = `<strong>&nbsp;SPACE</strong> to ultra flip`
    infiniteFlip = true;
    if (shouldSendPost === true) {
        requests.updatePlayer(player.name, 'screwattack');
        item_audio.play();
    }
}

// Ran when the 'Back To Start' button is clicked. Useful if the player shoots off into the distance without the screw attack.
const movePlayerBackToStart = () => {
    player.x = 300; player.y = 300; player.flip = false;
    player.newX = 300; player.newY = 300;
    camXOffset = 0; camYOffset = 0;
}

// Runs every update (60 fps) once the player has clicked the yellow button.
// Displays some cool graphics/effects.
function endGame() {
    if (!inEndGame) {
        //create a background rectangle of the player's selected color.
        bgRects.push(new level.bgRect(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.random() * 10 + 30, Math.random() * 4 + 3, trueColor));
        requests.sendCloud(trueColor);

        bg_audio.pause();
        whistle_audio.play();

        // Kind of fun to glitch around... I may comment this.
        document.getElementById('resetBtn').disabled = true;

        //Play the sky theme after the whistle audio is over. Could use an event listener instead.
        setTimeout(() => {
            sky_audio.play();
            // I got this code for perfect audio looping (as the loop attribute has delay) from https://stackoverflow.com/a/22446616
            sky_audio.addEventListener('timeupdate', (e) => {
                const buffer = 0.12;
                if (sky_audio.currentTime > sky_audio.duration - buffer) {
                    sky_audio.currentTime = 0;
                    sky_audio.play();
                }
            })
        }, 4000);
        inEndGame = true;
    }
    if (bgRectColor < 254) {
        bgRectColor += 0.2; player.y += 0.5;
    }

    utilities.drawPlayer(player.x + camXOffset, player.y + camYOffset, p_ctx, player.flip, player.scale, `#000000${(255 - bgRectColor).toString(16).substring(0, 2)}`, undefined, player.shape);

    bgRects.forEach((r) => {
        if (bgRects.indexOf(r) != bgRects.length - 1) {
            r.color = `rgba(${bgRectColor}, ${bgRectColor}, ${bgRectColor}, 0.1)`;
        }
        else {
            //toString(16) converts the number to hexadecimal. I got it from https://www.w3docs.com/snippets/javascript/how-to-convert-decimal-to-hexadecimal-in-javascript.html
            r.color = `${trueColor}${bgRectColor.toString(16).substring(0, 2)}`;
        }
    });
    level.rects.forEach((r) => {
        r.color = `rgba(${bgRectColor}, ${bgRectColor}, ${bgRectColor}, 0.5)`;
    });
}

const setupSocket = () => {
    socket.on('receiveMovement', (movement) => {
        console.log(movement);
        otherPlayerMovement = movement;
    });
};

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

        //'W' press, which should only do something after the player collects the morph ball
        case 87:
            if (canCrawl) {
                keysPressed[e.keyCode] = true;
            }
            break;

        //Space is pressed.
        case 32:
            e.preventDefault();
            //Only flip the player if space was not pressed the previous frame, and the player can flip based on landing on grounds/items.
            if (!keysPressed[e.keyCode]) {
                if (canFlip || infiniteFlip) {
                    player.flip = !player.flip;
                    canFlip = false;
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

        case 87:
            keysPressed[e.keyCode] = false;
            break;

        case 32:
            keysPressed[e.keyCode] = false;
            break;
    }
};

export { init, setShape };