import * as utilities from "./utilities.js";
import * as THREE from 'three';
import * as level from "./level.js"
import * as requests from './requests.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let w_ctx, p_ctx, bg_ctx, js3_ctx, scene, renderer, camera, characterModel = THREE.Object3D, compModel = THREE.Object3D,
    treeModel = THREE.Object3D, houseModel = THREE.Object3D, currentlyDrawnModel = false;
let vpOffset = [0, 0], shouldRotateComp = false;
let playerTracking = [], playerTrack = [];
const sq_walkers = [], arc_walkers = [];
const bgRects = []; let collisionRects = [], playerInBG = false, playerRect = null, playerCanPlaceRect = false, drawLevelFilled = true;
let movementThisSecond = {}; let otherPlayerMovement = {};
let updateMovement = true, otherPlayerMovementFrame = 0, shouldDrawOthers = false;
let cloudsShouldLoop = true, activeCheckpoint = {}, debugCheckPoints = [];
var thisWorld = undefined;

var test = "hello";

let socket, light;

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
    'yellowswitch': { collected: theCloud, draw: (o) => { drawImage(o) }, collide: (o) => { collideTopOfSwitch(o) } },
    'redswitch': { collected: stopFire, draw: (o) => { drawImage(o) }, collide: (o) => { collideTopOfSwitch(o) } },
    'greyswitch': {
        collected: () => {
            shouldRotateComp = true; 
            console.log('Hello User. Computer is ready to use in default mode.');
            console.log("Enter questions below...")
            const sound = sfxr.generate("synth");
            sfxr.play(sound);
        },
        draw: (o) => { drawImage(o) }, collide: (o) => { collideGreySwitch(o) }
    },
    'door': { draw: (o) => { drawImage(o) }, collide: (o) => { hitDoor() } },
    'door2': { draw: (o) => { drawImage(o) }, collide: (o) => { hitDoor() } },
    'pipe': { draw: (o) => { drawImage(o) }, collide: (o) => { collidePipe() } },
    'coin': { draw: (o) => { drawImage(o) }, collide: (o) => { collidePipe() } },
    'fire': {
        collected: collectMorphBall, draw: (o) => { drawFire(o) },
        collide: (o) => { collideFire(o) }
    },
    'mouse': {
        collected: collectMouse, draw: (o) => { drawImage(o) },
        collide: (o) => { collideItem(o) }
    },
    'eyes': {
        collected: collectEyes, draw: (o) => { drawImage(o) },
        collide: (o) => { collideItem(o) }
    },
    'checkpoint': { draw: (o) => { drawCheckpoint(o) }, collide: (o) => { collideCheckpoint(o) } },
    '3DPerson': { draw: (o) => { draw3D(o) } },
    '3DComp': { draw: (o) => { draw3D(o) } },
    'arrow_l': {
        draw: (o) => {
            drawImage(o);
        }, collected: (o) => rotatePlayer(o), collide: (o) => { rotatePlayer(o) }
    },
    'arrow_r': {
        draw: (o) => { drawImage(o); }, collected: (o) => rotatePlayer(o), collide: (o) => { rotatePlayer(o) }
    },
    'stop': {
        draw: (o) => { drawImage(o); }, collected: (o) => rotateDown(o), collide: (o) => { rotateDown(o) }
    },
    '3DTree': {}, '3DHouse': {}
};
//TODO: make arrow image rotate properly

why_cant_metroid_crawl = collectMorphBall;
const drawFire = (o) => {
    if (isOnScreen(player, o)) {
        utilities.drawFire(o.x + camXOffset, o.y + camYOffset, o.width, o.height, p_ctx, fireAnimColor);
    }
};
let prevCollidingWithFire, prevCollidingWithDoor;
let collidingWithFire = prevCollidingWithFire = prevCollidingWithDoor = false;
const collideFire = () => {
    // console.log(`mouse: ${hasMouse} and prevCollWithFire: ${prevCollidingWithFire}`);

    /* 
    collidingWithFire = true;
    if (hasMouse === true && prevCollidingWithFire === false) {
        prevCollidingWithFire = true;

        let p = Params.prototype.fromJSON({
            "oldParams": true,
            "wave_type": 0,
            "p_env_attack": -0.00003653593375929631,
            "p_env_sustain": 0.5159887075424194,
            "p_env_punch": 0.43771442770957947,
            "p_env_decay": -0.5177679657936096,
            "p_base_freq": 0.4211834669113159,
            "p_freq_limit": 0,
            "p_freq_ramp": 0.09771327674388885,
            "p_freq_dramp": 0.18222975730895996,
            "p_vib_strength": 0.29777976870536804,
            "p_vib_speed": 0.8540940284729004,
            "p_arp_mod": 0.3622890114784241,
            "p_arp_speed": -0.032950595021247864,
            "p_duty": -0.44415274262428284,
            "p_duty_ramp": -0.6385311484336853,
            "p_repeat_speed": 0.07904504984617233,
            "p_pha_offset": 0.050250060856342316,
            "p_pha_ramp": 0.3983093798160553,
            "p_lpf_freq": 0.5602583885192871,
            "p_lpf_ramp": -0.0018845867598429322,
            "p_lpf_resonance": -0.17684580385684967,
            "p_hpf_freq": 2.0634999486901506e-8,
            "p_hpf_ramp": 0.11631236225366592,
            "sound_vol": 0.25,
            "sample_rate": 44100,
            "sample_size": 8
        });
        p.mutate();
        const sound = sfxr.toAudio(p);
        sound.play();

        return;
    }

    if (prevCollidingWithFire === true || hasMouse === true) return;

    */
    shouldUpdateGame = false;
    explode_audio.play();
    const color = player.color;
    player.color = "red";
    rotateDown(false);

    setTimeout((e) => {
        shouldUpdateGame = true; movePlayerBackToStart(); player.color = color;
    }, 500);
};

let enteredPipe = false;
const collidePipe = (o) => {
    // If the player pushed down 'S' on the top of the pipe
    if (!enteredPipe && keysPressed[83]) {
        cloudState();
        enteredPipe = true;
    };
};

const collideTopOfSwitch = (o) => {
    if (player.g === 0 && player.flip === false && !prevOnGround) {
        level.specialObjects.splice(level.specialObjects.indexOf(o), 1);
        items[o.name].collected();
    };
};

const collideGreySwitch = (o) => {
    if (player.g === 1 && !prevOnGround) {
        level.specialObjects.splice(level.specialObjects.indexOf(o), 1);
        items["greyswitch"].collected();
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

    if (playerCanPlaceRect === false) changeAbleToPlaceRect(true);
};

const collideItem = (o) => {
    items[o.name].collected();
    level.specialObjects.splice(level.specialObjects.indexOf(o), 1);
};

const draw3D = (o) => {
    // utilities.drawRectangle(o.x + camXOffset, o.y + camYOffset, 25, 25, p_ctx, "orange", true);
    if (isOnScreen(player, o)) {
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
            utilities.drawRectangle(o.x + camXOffset, o.y + 25 + camYOffset, o.width, o.height - 25, p_ctx, color, false, true);
            break;
        case 1:
            utilities.drawRectangle(o.x + camXOffset + 25, o.y + camYOffset, o.width, o.height - 25, p_ctx, color, false, true);
            break;
        case 2:
            utilities.drawRectangle(o.x + camXOffset, o.y - 25 + camYOffset, o.width, o.height - 25, p_ctx, color, false, true);
            f = -1;
            break;
        case 3:
            utilities.drawRectangle(o.x + camXOffset - 25, o.y + camYOffset, o.width, o.height - 25, p_ctx, color, false, true);
            break;
        default:
            utilities.drawRectangle(o.x + camXOffset, o.y + 25 + camYOffset, o.width, o.height - 25, p_ctx, color, false, true);
            break;
    }

    if (o.active) {
        const lineY = o.y + camYOffset + (25 * f) + ((o.height - 25) / 2);
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

const drawImage = (o, flipped = false) => {
    p_ctx.drawImage(imgs[o.name], o.x + camXOffset, o.y - o.originY + camYOffset);
};


//usual player y is 200
const player = { x: 1038, y: 200, halfWidth: 4, halfHeight: 7, newX: 825, newY: 0, scale: 1, name: '', flip: false, g: 0, spawn: [1038, 200] };
let playerCloud;
let trueColor = 0, bgRectColor = 0;
let fireAnimColor = 0, playerWalkAnimCounter = 0, playerFallAnimCounter = 0;

let xSpeed = 3, ySpeed = 6; // 1, 2 in sky
let canFlip = true; let infiniteFlip = false, hasMouse = false, hasEyes = false, keyVisible = false, inClouds = false, shouldUpdateGame = true;
let canCrawl = false; const crawlTimerMax = 30; let hasMorphBall = false; let crawlInputTimer = 0, drawGTimer = false, GTimer = 5000;
let keysPressed = [];
let canvasWidth, canvasHeight;
let btn_audio, item_audio, bg_audio, whistle_audio, sky_audio, explode_audio;
let walker_counter = 0;
let bg_dir_rad = 0, bg_dir_rad_Inc = 0;
let bg_color = "white", bg_color_rgb = [255, 255, 255], should_change_bg_color = false;
const GAME_WIDTH = 640, GAME_HEIGHT = 480;
const BG_DIR_MULTIPLIER = 1;
let camXOffset = -738, camYOffset = 100, prevCamXOffset = 0, prevCamYOffset = 0;

// Initializes the game mainly based on data gotten in level.js getData. 
// Runs after the player has logged in (called in playerLogin.js)
const startGameLogic = (obj, immediate = false) => {
    if (obj && obj.username && obj.items && obj.color && obj.shape >= 0) {
        player.name = obj.username;
        trueColor = obj.color;
        player.shape = obj.shape;

        what_is_my_name = "uh... \"" + obj.username + "\"";
        // setupSocket();
    }
    else {
        console.error("Did not receive player data.");
    }

    const sleep = ms => new Promise(r => setTimeout(r, 200));


    movementThisSecond.name = player.name;
    movementThisSecond.color = trueColor;
    movementThisSecond.movement = [];

    // This seems unoptimal... should I just await the data.
    collisionRects = level.rects;

    let findingColor = true, rnd, color;

    rnd = Math.floor(Math.random() * level.rects.length);
    color = level.rects[rnd].values.color;
    playerTrack.push(color);

    for (let i = 0; i < 10; i++) {
        findingColor = true;
        while (findingColor) {
            rnd = Math.floor(Math.random() * level.rects.length);
            color = level.rects[rnd].values.color;
            if (color !== playerTrack[i]) {
                findingColor = false;
            }
        }
        playerTrack.push(color);
    }

    // console.log(playerTrack);
    if (obj.items) initItems(obj.items);

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
    document.getElementById('screwattack_active').onmousedown = (e) => { alterScrewAttack(true); }
    document.getElementById('screwattack_inactive').onmousedown = (e) => { alterScrewAttack(false); }

    const alterScrewAttack = (shouldActivate) => {
        if (playerShouldEnterVoid === true) {
            document.getElementById('screwattack_active').classList.remove("noDisplay");
            document.getElementById('screwattack_active').classList.add("inline");
            document.getElementById('screwattack_inactive').classList.remove("inline");
            document.getElementById('screwattack_inactive').classList.add("noDisplay");
        }
        else {
            document.getElementById('screwattack_inactive').classList.remove("noDisplay");
            document.getElementById('screwattack_inactive').classList.add("inline");
            document.getElementById('screwattack_active').classList.remove("inline");
            document.getElementById('screwattack_active').classList.add("noDisplay");
        }
    }


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

    light = new THREE.AmbientLight(0xffffff); // soft white light
    scene.add(light);

    // White directional light at half intensity shining from the top.
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(directionalLight);
    ʵ.world = {
        "blocks": level.rects,
        "specialObjects": level.specialObjects
    };

    ʈʼ.data = player;


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

    // Thanks to this guide https://codepedia.info/detect-browser-in-javascript
    // on using the user agent to sniff out the browser. This isn't very precise, but I'm only doing it to change a keyboard shortcut.
    let userAgent = navigator.userAgent;
    let compModelPath = 'assets/img/SavePc.glb';


    if (userAgent.match(/firefox|fxios/i)) {
        compModelPath = 'assets/img/SavePc_f.glb';
    }

    loader.load(compModelPath, function (gltf) {
        compModel = gltf.scene;
        compModel.scale.x = compModel.scale.y = compModel.scale.z = 9;
        compModel.rotation.y = Math.PI;
        // compModel.rotation.x = -0.25;
        gltf.scene.name = '3DComp';

        items['3DComp'].file = gltf.scene;
        compModel.position.y -= 30;
        // compModel.position.x -= 20;

    }, undefined, function (error) {
        console.error(error);
    });


    loader.load('assets/img/Tree.gltf', function (gltf) {
        treeModel = gltf.scene;
        treeModel.scale.x = treeModel.scale.y = treeModel.scale.z = 5;
        treeModel.rotation.y = Math.PI;
        // treeModel.rotation.x = -0.25;
        gltf.scene.name = '3DTree';

        // light
        const light = new THREE.PointLight(0xffffff, 1);
        treeModel.add(light);

        items['3DTree'].file = gltf.scene;
        treeModel.position.y -= 30;
        // treeModel.position.x -= 20;

    }, undefined, function (error) {
        console.error(error);
    });


    loader.load('assets/img/House.gltf', function (gltf) {
        houseModel = gltf.scene;
        houseModel.scale.x = houseModel.scale.y = houseModel.scale.z = 9;
        houseModel.rotation.y = Math.PI;
        // houseModel.rotation.x = -0.25;
        gltf.scene.name = '3DHouse';

        items['3DHouse'].file = gltf.scene;
        houseModel.position.y -= 30;
        // compModel.position.x -= 20;

    }, undefined, function (error) {
        console.error(error);
    });


    canvasWidth = w_canvas.width;
    canvasHeight = w_canvas.height;

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    p_canvas.addEventListener("contextmenu", (e) => { e.preventDefault() });
    p_canvas.addEventListener("wheel", (e) => { e.preventDefault() });

    // Prevent scrolling and right-click, use to change speed of bg/playerRect and delete playerRect.

    //If getLevel (in level.js) got back a set of clouds, add them to the bgRects/clouds that will be displayed by the client.
    if (level.clouds && level.clouds.length > 0) {
        level.clouds.forEach((c) => {
            bgRects.push(new level.bgRect(Math.random() * (GAME_WIDTH - 10) + 5, Math.random() * (GAME_HEIGHT - 10) + 5, Math.random() * 10 + 30, Math.random() * 4 + 3, c));
        })
    }

    for (let i = 0; i < 10; i++) {
        bgRects.push(new level.bgRect(Math.floor(Math.random() * GAME_WIDTH), Math.floor(Math.random() * GAME_HEIGHT), Math.floor(Math.random() * 10) + 30, Math.floor(Math.random() * 4) + 10, "rgba(0,0,0,0.3)"));
    }
    // bgRects.push(new level.bgRect(Math.floor(Math.random() * GAME_WIDTH), Math.floor(Math.random() * GAME_HEIGHT), Math.floor(Math.random() * 10) + 30, Math.floor(Math.random() * 4) + 10, "rgba(0,0,0,1)"));

    level.specialObjects.forEach((o) => {
        if (o.name === "checkpoint") {
            debugCheckPoints.push(o);
        }
    });
    debugCheckPoints.sort((a, b) => a.x - b.x);
    const checkpointSelect = document.getElementById("checkpoints");
    checkpointSelect.onchange = (o) => {
        collideCheckpoint(debugCheckPoints[checkpointSelect.selectedIndex]);
        movePlayerBackToStart();
    }
    debugCheckPoints.forEach((c, i) => {
        const newOption = document.createElement("option");
        newOption.textContent = `x: ${c.x}  y: ${c.y}`;
        newOption.value = i;
        checkpointSelect.appendChild(newOption);
    })
    drawBG();

    document.getElementById("keySubmit").onclick = evaluateKey;
    document.getElementById("theKey").onchange = () => {
        document.getElementById("keySubmit").disabled = false;
    }

    w_ctx.fillStyle = "black";

    sphereMaterial = new THREE.MeshBasicMaterial({ color: trueColor });
    sphere = new THREE.Mesh(geometry, sphereMaterial);

    requestAnimationFrame(update);
    requestAnimationFrame(drawBG);
    // setInterval(animate, 1000 / 30);

    // setInterval(sendAndReceiveMovement, 1000);
    // setInterval(drawOtherPlayerMovement, 1000 / 30);
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const geometry = new THREE.SphereGeometry(8, 8, 16);
let sphereMaterial;
let sphere;

let goingToTree = false, goingToBody = false;

const animate = (followingPlayer = true) => {
    // if (camXOffset === prevCamXOffset && camYOffset === prevCamYOffset) return;

    //js3_ctx.translate(camXOffset + 1000, GAME_HEIGHT - camYOffset - 1850);
    if (followingPlayer) {
        renderer.setViewport(vpOffset[0] + camXOffset, vpOffset[1] - camYOffset, GAME_WIDTH, GAME_HEIGHT);
    }
    else {
        renderer.setViewport(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // pointer.x = (playerCloud.x / GAME_WIDTH) * 2 - 1;
        // pointer.y = -(playerCloud.y / GAME_HEIGHT) * 2 - 1;

        pointer.x = playerCloud.x * 4 - GAME_WIDTH * 2;
        pointer.y = -playerCloud.y * 4 + GAME_HEIGHT * 2;

        const newPos = new THREE.Vector3(pointer.x, pointer.y, -1).unproject(camera)

        newPos.z = 1;
        sphere.position.set(newPos.x, newPos.y, newPos.z);

        // console.log(`${sphere.position.x}, ${sphere.position.y}, ${sphere.position.z}`);

        scene.add(sphere);

        if (goingToTree) {
            moveToTree();
        }
        else if (goingToBody) {
            moveToChar();
        }
        else {
            const treeBB = new THREE.Box3().setFromObject(treeModel);

            //const charBB = new THREE.Box3().setFromObject(characterModel);

            const sphereBB = new THREE.Box3().setFromObject(sphere);

            const treeColl = sphereBB.intersectsBox(treeBB);
            // const charColl = sphereBB.intersectsBox(charBB);

            //Transition to tree
            if (treeColl) {
                goingToTree = true;
            }
            /* Transition to character
            else if (charColl) {
                goingToBody = true;
            }
            */
        }
    }

    if (shouldRotateComp) {
        if (compModel.rotation.y >= 0) compModel.rotation.y -= 0.01;
        else shouldRotateComp = false;
    }

    // Figure out how to pass delta time bro
    // scene.rotation.x = Math.sin(playerWalkAnimCounter / 12) + Math.PI;

    renderer.render(scene, camera);
};

let trippedTree = false;
const moveToTree = () => {
    if (treeModel.scale.x >= 15 && !trippedTree) {
        trippedTree = true;
        // _ = false;
        // var _ = "what";
    }
    if (trippedTree) {
        updateTripped(treeModel);
        return;
    }
    treeModel.scale.x *= 1.01;
    treeModel.scale.y *= 1.01;
    treeModel.position.y -= 0.1;
    treeModel.scale.z *= 1.01;
}

/*
let trippedChar = false;
const moveToChar = () => {
    if (characterModel.scale.x >= 15 && !trippedChar) {
        trippedChar = true;
        _ = false;
        var _ = "what";
    }
    if (trippedChar) {
        updateTripped(characterModel);
        return;
    }

    characterModel.scale.x *= 1.01;
    characterModel.scale.y *= 1.01;
    characterModel.position.y -= 0.1;
    characterModel.scale.z *= 1.01;
}
*/

const updateInterval = 1000 / 120;
let prevUpdateTime = -1;
//Runs 60 frames per second. Serves to update game state and draw.
const update = (timeStamp) => {
    requestAnimationFrame(update);

    let deltaTime = timeStamp - prevUpdateTime;

    if (deltaTime < updateInterval) return;

    if (playerIsFallingInEnding === true) {
        endingLogic();
    }

    prevUpdateTime = timeStamp;

    if (!inClouds && shouldUpdateGame) {
        //(0.5 + Math.random(), 0.5 + Math.random());
        updatePlayer();

        p_ctx.clearRect(0, 0, 640, 480);
        drawLevel();

        // Player.color is actually not set based on data from the server- it is only set by the "explode"/collide with fire function.
        // So the player is always drawn with a black stroke.
        utilities.drawPlayer(player, camXOffset, camYOffset, p_ctx, false, playerWalkAnimCounter, playerFallAnimCounter);

        // draws the orange arrow rectangle above player's head.
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
            p_ctx.fillStyle = "black";
            p_ctx.clearRect(0, 0, 640, 480);

            p_ctx.save();
            p_ctx.scale(2, 2);
            p_ctx.drawImage(imgs['uni'], -GAME_WIDTH / 2 + camXOffset, -GAME_HEIGHT / 2 + camYOffset);
            p_ctx.restore();

            animate(false);

            updatePlayerWalkAnim(false, true);
            utilities.drawPlayerCloud(playerCloud, p_ctx, playerFallAnimCounter, playerWalkAnimCounter);
            // console.log(`playerCloud X: ${camXOffset}}  y: ${camYOffset}`);
        }
    }
};

// updates the 3D model when the player activates it
const updateTripped = (model = THREE.Object3D) => {
    //Player uses WASD to rotate model
    if (keysPressed[65]) {
        model.rotation.y += 0.01;
    }

    if (keysPressed[68]) {
        model.rotation.y -= 0.01;
    }
    if (keysPressed[87]) {
        model.rotation.x -= 0.01;
    }
    if (keysPressed[83]) {
        model.rotation.x += 0.01;
    }
    //'R' to reset model 
    if (keysPressed[82]) {
        model.rotation.x = 0;
        model.rotation.y = Math.PI;
        model.scale.x = 15;
        model.scale.y = 15;
        model.scale.z = 15;
        model.position.y = -20;
    }

    // Shift and Space to make model larger or smaller
    if (keysPressed[32]) {
        model.scale.x /= 1.01;
        model.scale.y /= 1.01;
        model.position.y += 0.05;
        model.scale.z /= 1.01;
    }

    if (keysPressed[16]) {
        model.scale.x *= 1.01;
        model.scale.y *= 1.01;
        model.position.y -= 0.05;
        model.scale.z *= 1.01;
    }
}

let uniOpac = 1;
const updateCloud = () => {

    if (keysPressed[65]) {
        playerCloud.dirRad += 0.01;
    }

    if (keysPressed[68]) {
        playerCloud.dirRad -= 0.01;
    }

    playerCloud.hSpeed = Math.cos(playerCloud.dirRad) * 3;
    playerCloud.vSpeed = Math.sin(playerCloud.dirRad) * 3;

    playerCloud.x += playerCloud.hSpeed / 2; playerCloud.y += playerCloud.vSpeed / 2;

    // makes the rectangle wrap around the screen.
    if (playerCloud.x > canvasWidth + 20) { playerCloud.x = -20 }
    else if (playerCloud.x < -20) { playerCloud.x = canvasWidth + 20 }
    if (playerCloud.y > canvasHeight + 20) { playerCloud.y = -20 }
    else if (playerCloud.y < -20) { playerCloud.y = canvasHeight + 20 }

    camXOffset -= playerCloud.hSpeed / 5;
    camYOffset -= playerCloud.vSpeed / 5;

    if (trippedTree === true && ((camXOffset < -1500 || camXOffset > 250) || (camYOffset < -1500 || camYOffset > 250))) {
        trippedTree = false;
        if (uniOpac >= 0) uniOpac -= 0.005;
        p_ctx.filter = (`opacity(${uniOpac})`);
    }
    else {
        if (uniOpac <= 1) uniOpac+= 0.005;
        p_ctx.filter = (`opacity(${uniOpac})`);
    }
};

// Updates player movement based on input and collision.
let prevOnGround = false;
const updatePlayer = () => {
    let xDif = 0, yDif = 0;
    // p_ctx.canvas.width = 1000;
    // p_ctx.canvas.height = 2000;
    // const sound = sfxr.generate("click");
    // sound.sound_vol = 0.1;
    // sfxr.play(sound);

    // const els = document.querySelectorAll("canvas");
    // els.forEach(e=>e.classList.add("noBorder"));

    let walked = false;
    if (hasEyes && keysPressed[16]) {
        // p_ctx.scale(0.999,0.999);
        if (camXOffset <= 640 - player.x)
        if (camXOffset >= player.x)
        if (camYOffset <= 480 - camYOffset)
        if (camYOffset >= player.y)
        if (keysPressed[65]) { camXOffset += 3; }
        if (keysPressed[68]) { camXOffset -= 3; }
        if (keysPressed[87]) { camYOffset += 3; }
        if (keysPressed[83]) { camYOffset -= 3; }
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

    //Reset cam offset if 'R' was pressed.
    if (hasEyes && keysPressed[82]) { camXOffset = 300 - player.x; camYOffset = 300 - player.y; }

    // If the player hasn't crawled recently (so we don't get a duplicate input)
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

    let colliding = CollisionsWithLevel(player, xDif, yDif); //returns two bools: if colliding and if player walked.
    if (!colliding[0]) {
        player.x += xDif; player.y += yDif;
        if (!playerInBG) {
            camXOffset -= xDif;
            camYOffset -= yDif;
        }
    }
    else {
        if (!playerInBG) {
            camXOffset += player.x - player.newX;
            camYOffset += player.y - player.newY;
        }
        player.x = player.newX;
        player.y = player.newY;
    }

    if (playerInBG) {
        if (player.x + camXOffset > canvasWidth + 20) { player.x -= canvasWidth + 20; }
        else if (player.x + camXOffset < -20) { player.x += canvasWidth + 20; }
        if (player.y + camYOffset > canvasHeight + 20) { player.y -= canvasHeight + 20; }
        else if (player.y + camYOffset < -20) { player.y += canvasHeight + 20; }

        if (prevOnGround === false && colliding[1] === true) {
            const sound = sfxr.generate("click");
            sound.sound_vol = 0.1;
            sfxr.play(sound);
        }
    }

    if (colliding[1] === true && playerCanPlaceRect === false) changeAbleToPlaceRect(true);

    prevOnGround = colliding[1];
    updatePlayerWalkAnim(walked, colliding[1]);

    CollisionsWithSpecialObjects(player);
}

//Draws the level (composed of rectangles and special objects) onto the player canvas.
const drawLevel = () => {
    level.rects.forEach((r) => {
        utilities.drawRectangle(r.x + camXOffset, r.y + camYOffset, r.width, r.height, p_ctx, r.values.color, drawLevelFilled, false); //can add drawLevelStroked property as last option
    });
    let shouldDraw3DObjs = false;

    level.specialObjects.forEach((o) => {
        if (o.name.substring(0, 2) === '3D') {
            // utilities.drawRectangle(o.x + camXOffset, o.y + camYOffset, o.width, o.height, p_ctx, "orange", false);
            if (isOnScreen(player, o)) {
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

    if (playerRect !== null) {
        playerRect.x += playerRect.hSpeed;
        utilities.drawRectangle(playerRect.x + camXOffset, playerRect.y + camYOffset, playerRect.width, playerRect.height, p_ctx, playerRect.values.color, false, true);
        if (playerRect.x + camXOffset > canvasWidth + 20) { playerRect.x -= canvasWidth + 80 }
    }

    if (drawTheImage) {
        p_ctx.globalAlpha = 0;
        p_ctx.drawImage(imgs['theImage'], 0, 0);

        timer = setInterval(() => {
            p_ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            const newOpac = Math.sin(drawImageOpacCounter);
            p_ctx.globalAlpha = newOpac;
            p_ctx.drawImage(imgs['theImage'], 0, 0);

            if (newOpac > 0.8) {
                shouldAnimateEyes = true;
            }
            if (shouldAnimateEyes) {
                animateEyes();
            }
            drawImageOpacCounter += piDiv100;
        }, 100);

        shouldUpdateGame = false;
        setTimeout(() => {
            shouldUpdateGame = true;
            clearInterval(timer);
            document.getElementById("keyDiv").hidden = false;
            if (keyVisible === false) {
                requests.updatePlayer(player.name, 'keyBox');
                keyVisible = true;
            }
            shouldAnimateEyes = false;
            drawTheImage = false;
            p_ctx.globalAlpha = 1;
            setTimeout(() => {
                collidedOnceWithYellowCloud = true;
            }, 2000);
        }, 10000)
    }

};

const evaluateKey = async () => {
    document.getElementById("keySubmit").disabled = true;
    const key = document.getElementById("theKey").value;
    const keyIsCorrect = await requests.sendKey(key);
    if (keyIsCorrect === true) {
        console.log("Computer unlocked- Creator mode in use.");
        const sound = sfxr.generate("synth");
        sfxr.play(sound);
        document.getElementById("keyDiv").style.opacity = .3;
        document.getElementById("theKey").disabled = true;
        document.getElementById("keyDiv").style.color = "Green";
    }
    else {
        const sound = sfxr.generate("hurt");
        sfxr.play(sound);
    }
}

let eyeAnimCounter = 0, shouldAnimateEyes = false, keyInputVisible = false, playedImageSound = false;
const animateEyes = () => {
    const newOpac = Math.sin(eyeAnimCounter);
    if (eyeAnimCounter >= 1) {
        document.getElementById("keyDiv").hidden = false;
        if (keyInputVisible && !playedImageSound) {
            const sound = sfxr.generate("powerUp");
            sfxr.play(sound);
            playedImageSound = true;
        }
        else {
            document.getElementById("keySubmit").onclick = evaluateKey;
            document.getElementById("theKey").onchange = () => {
                document.getElementById("keySubmit").disabled = false;
            }
        }
        keyInputVisible = true;
    }

    p_ctx.save();
    p_ctx.globalAlpha = newOpac;
    p_ctx.fillStyle = "Aqua";
    p_ctx.beginPath();
    p_ctx.arc(120, 100, 10, 0, 2 * Math.PI);
    p_ctx.closePath();
    p_ctx.fill();

    p_ctx.beginPath();
    p_ctx.arc(160, 100, 10, 0, 2 * Math.PI);
    p_ctx.closePath();
    p_ctx.fill();
    p_ctx.restore();

    p_ctx.save();
    p_ctx.strokeStyle = "rgba(0, 255, 255, " + newOpac - 0.4 + ")";
    p_ctx.beginPath();
    p_ctx.strokeWidth = 5;
    p_ctx.moveTo(120, 100);
    p_ctx.lineTo(350, 480);
    p_ctx.closePath();
    p_ctx.stroke();

    p_ctx.beginPath();
    p_ctx.moveTo(160, 100);
    p_ctx.lineTo(350, 480);
    p_ctx.closePath();
    p_ctx.stroke();

    p_ctx.restore();
    eyeAnimCounter += 0.05;
}

const piDiv100 = Math.PI / 100, BGInterval = 1000 / 15;
let drawImageOpacCounter = 0;
let timer = 0;
let fireAnimInc = 0.4;
let prevBGTime = -1;
//Draws background clouds onto the background canvas.
const drawBG = (timeStamp) => {
    requestAnimationFrame(drawBG);

    let deltaTime = timeStamp - prevBGTime;

    if (deltaTime < BGInterval) return;

    prevBGTime = timeStamp;

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

        utilities.drawRectangle(rect.x, rect.y, rect.width, rect.height, bg_ctx, rect.values.color, true);
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

let drawTheImage = false;
let collidedOnceWithYellowCloud = false;
let onPlayerRect = false;
//Returns true if there are collisions. It also fixes these collisions.
const CollisionsWithLevel = (_p, xDif, yDif) => {
    let p = _p;
    let colliding = [false, false]; // 0 shows whether any collisions occured. 1 shows whether a collision with the ground (based on g) occurred.
    drawTheImage = false;

    // If player is in the bg, make sure to convert their coordinates to screen space so that 
    // they can collide with the bgRects which are never affected by camOffsets.
    if (playerInBG === true) {
        p = { ..._p };
        p.x += camXOffset; p.y += camYOffset;
        p.newX += camXOffset; p.newY += camYOffset;
    };

    let lightColor = new THREE.Color();
    let shouldChangeLightColor = false;
    onPlayerRect = false;
    collisionRects.forEach((r) => {
        if (areColliding(p, r)) {
            colliding[0] = true;

            /* If the player collides with a new color
            if (r.values && r.values.color
                && r.values.color !== playerTracking[playerTracking.length - 1]) {
                // console.log(r.values.color + "new color");
                // Thanks to https://stackoverflow.com/a/43089827 for this random color idea.

                shouldChangeLightColor = true;
                if (inAirCounter >= 60) {
                    const index = Math.floor(inAirCounter / 60 - 1) % (playerTrack.length - 1);
                    lightColor.lerpColors(light.color, playerTrack[index].toLowerCase(), (inAirCounter % 120) / 120);
                } else {
                    lightColor = new THREE.Color(r.values.color.toLowerCase());
                }
                // If the player touched the correct color on the track
                if (playerTracking.length > 0 && r.values.color === playerTrack[playerTracking.length - 1]) {
                    playerTracking.push(r.values.color);

                    if (playerTracking.length === playerTrack.length) {
                        console.log("COMPLETE");
                    }
                }
            }
            */
            // Draws the image if the player collided with the yellow cloud
            if (r.values && r.values.color === "rgba(220,221,11,0.95)") {
                console.log(collidedOnceWithYellowCloud);
                if (collidedOnceWithYellowCloud == true) {
                    collideCheckpoint(debugCheckPoints[8]);
                    movePlayerBackToStart();
                    swapBG();
                }
                else drawTheImage = true;
            }
            // console.log(r.values.color);
            // The order of which directions are checked matters! It affects whether player gets stuck if they move from one rect to another on the same y coord.
            // It may be worth it to do an if then for player.g== 1 (since we should check horizontal collisions first, so the player doesn't get stuck when moving
            // across two same x-coord walls). As of now, no walls that do this exist so I do not do this check.
            if (utilities.collidedFromBottom(p, r) || utilities.collidedFromTop(p, r)) {
                _p.newY -= yDif;
                if (p.g === 0) {
                    if (!infiniteFlip) canFlip = true; //If the player doesn't have the screw attack/infinite flip, then continue updating canFlip
                    if (!r.isPlayerRect) { colliding[1] = true; }
                    else {
                        _p.newX += playerRect.hSpeed;
                        canFlip = true;
                        onPlayerRect = true;
                    }
                }
            }
            else if (utilities.collidedFromLeft(p, r) || utilities.collidedFromRight(p, r)) {
                _p.newX -= xDif;
                if (p.g === 1) {
                    if (!infiniteFlip) canFlip = true; //If the player doesn't have the screw attack/infinite flip, then continue updating canFlip
                    if (!r.isPlayerRect) { colliding[1] = true; }
                    else {
                        canFlip = true;
                        onPlayerRect = true;
                    }
                }
            }
        }
    });
    if (inAirCounter >= 60 || shouldChangeLightColor) {
        light.color = lightColor;
    }
    return colliding;
};
//Checks if two objects are colliding. (Only used by the player and rectangles/special objects currently.)
const areColliding = (p, r) => {
    return (p.newX - p.halfWidth < r.x + r.width && p.newX + p.halfWidth > r.x
        && p.newY - p.halfHeight < r.y + r.height && p.newY + p.halfHeight > r.y);
};

const isOnScreen = (p, f) => {
    return (p.newX - p.halfWidth < f.x + f.width + 400 && p.newX + p.halfWidth > f.x - 600
        && p.newY - p.halfHeight < f.y + f.height + 500 && p.newY + p.halfHeight > f.y - 500);
}

let collidingWithDoor = false;
//make array of collision and collected functions to avoid this if then statement
const CollisionsWithSpecialObjects = (p) => {
    collidingWithFire = false;
    collidingWithDoor = false;
    level.specialObjects.forEach((o) => {
        if (areColliding(p, o)) {
            if (o.name.substring(0, 2) !== '3D') {
                items[o.name].collide(o);
            }
        }
        // Handle player rect and arrow colliding
        if (playerRect && (o.name.substring(0, 5) === "arrow" || o.name === "stop")) {
            if (playerRect.x - playerRect.width < o.x + o.width / 2 && playerRect.x + playerRect.width > o.x - o.width / 2
                && playerRect.y - playerRect.height < o.y + o.height / 2 && playerRect.y + playerRect.height > o.y - o.height / 2) {
                if (o.values && o.values.dir !== null) {
                    //left, right. (Dir order is up, right, down, left)
                    if (o.values.dir === 3) {
                        if (playerRect.hSpeed !== -2) {
                            // playerRect.vSpeed = -2;
                            playerRect.hSpeed = -2;
                            const sound = sfxr.generate("click");
                            sfxr.play(sound);
                        }
                    }
                    else if (o.values.dir === 1) {
                        if (playerRect.hSpeed !== 2) {
                            playerRect.hSpeed = 2;
                            // playerRect.vSpeed = 0;
                            const sound = sfxr.generate("click");
                            sfxr.play(sound);
                        }
                    }
                    /* else if (o.values.dir === 2) {
                        if (playerRect.vSpeed !== 2) {
                            // playerRect.vSpeed = 2;
                            playerRect.hSpeed = 0;
                            const sound = sfxr.generate("click");
                            sfxr.play(sound);
                        }
                    }
                    else if (o.values.dir === 3) {
                        if (playerRect.hSpeed !== -2) {
                            playerRect.hSpeed = -2;
                            // playerRect.vSpeed = 0;
                            const sound = sfxr.generate("click");
                            sfxr.play(sound);
                        }
                    } */
                    else if (o.values.dir === 5) {
                        if (playerRect.hSpeed !== 0) {
                            playerRect.hSpeed = 0;
                            // playerRect.vSpeed = 0;
                            const sound = sfxr.generate("click");
                            sfxr.play(sound);
                        }
                    }
                }
            }
        }
    });
};

let justEnteredDoor = false;
async function hitDoor() {
    collidingWithDoor = true;

    if (keysPressed[87] && !justEnteredDoor && prevOnGround) {
        swapBG();
        justEnteredDoor = true;
        shouldUpdateGame = false;
        await new Promise(r => setTimeout(r, 1000));
        setTimeout(() => {
            shouldUpdateGame = true;
            justEnteredDoor = false;
        }, 1000);
    }
    prevCollidingWithDoor = true;
}

function swapBG() {

    let p = Params.prototype.fromJSON({
        "oldParams": true,
        "wave_type": 0,
        "p_env_attack": -0.00003653593375929631,
        "p_env_sustain": 0.5159887075424194,
        "p_env_punch": 0.43771442770957947,
        "p_env_decay": -0.5177679657936096,
        "p_base_freq": 0.4211834669113159,
        "p_freq_limit": 0,
        "p_freq_ramp": 0.09771327674388885,
        "p_freq_dramp": 0.18222975730895996,
        "p_vib_strength": 0.29777976870536804,
        "p_vib_speed": 0.8540940284729004,
        "p_arp_mod": 0.3622890114784241,
        "p_arp_speed": -0.032950595021247864,
        "p_duty": -0.44415274262428284,
        "p_duty_ramp": -0.6385311484336853,
        "p_repeat_speed": 0.07904504984617233,
        "p_pha_offset": 0.050250060856342316,
        "p_pha_ramp": 0.3983093798160553,
        "p_lpf_freq": 0.5602583885192871,
        "p_lpf_ramp": -0.0018845867598429322,
        "p_lpf_resonance": -0.17684580385684967,
        "p_hpf_freq": 2.0634999486901506e-8,
        "p_hpf_ramp": 0.11631236225366592,
        "sound_vol": 0.25,
        "sample_rate": 44100,
        "sample_size": 8
    });
    p.mutate();
    const sound = sfxr.toAudio(p);
    sound.play();

    // Trying to fix rect coll offset: thought process:
    // Is it changing the camOffsets to increment the player's coords while the player is colliding with void?
    // It should only offset the first collision, or the last? (This means the bgRects are drawn relative to the final coll offset rather than the first...)
    // It may keep swapping around... do a console.log here to see if it runs over and over
    // TODO: See if this runs over and over again.
    playerInBG = !playerInBG;

    if (playerInBG === true) {
        collisionRects = bgRects;
        drawLevelFilled = false;
        xSpeed = 1;
        ySpeed = 2;
    }
    else {
        collisionRects = level.rects;
        drawLevelFilled = true;
        xSpeed = 3;
        ySpeed = 6;
        collisionRects.push(playerRect);
    }
};

//If the player's data on the server shows they already have items, give them those items.
const initItems = (savedItems) => {
    imgs['screwattack'] = document.getElementById('screwattack_inactive');
    imgs['morphball'] = document.getElementById('morphball');
    imgs['greyswitch'] = document.getElementById('greyswitch');
    imgs['yellowswitch'] = document.getElementById('yellowswitch');
    imgs['redswitch'] = document.getElementById('redswitch');
    imgs['door'] = document.getElementById('door');
    imgs['door2'] = document.getElementById('door2');
    imgs['uni'] = document.getElementById('uni');
    imgs['mouse'] = document.getElementById('mouse');
    imgs['eyes'] = document.getElementById('eyes');
    imgs['arrow_l'] = document.getElementById('arrow_l');
    imgs['arrow_r'] = document.getElementById('arrow_r');
    imgs['stop'] = document.getElementById('stop');
    imgs['pipe'] = document.getElementById('pipe');
    imgs['coin'] = document.getElementById('pipe');
    imgs['theImage'] = document.getElementById('theImage');


    if (savedItems['morphball'] === true) {
        collectMorphBall(false);
    }
    if (savedItems['screwattack'] === true) {
        collectScrewAttack(false);
    }
    if (savedItems['mouse'] === true) {
        collectMouse(false);
    }
    if (savedItems['eyes'] === true) {
        collectEyes(false);
    }
    if (savedItems['keyBox'] === true) {
        document.getElementById("keyDiv").hidden = false;
        keyVisible = true;
    }
};
const setShape = (shape = 0) => {
    player.shape = shape;

    if (shape === 1) player.scale = 2;
    else if (shape === 2) player.scale = 0.5;
    else player.scale = 1;
}

let playerWalkAnimOut = true, playerFallAnimOut = true;
let inAirCounter = 0;
const updatePlayerWalkAnim = (walked = false, onGround = false) => {
    if (walked && onGround) {
        inAirCounter = 0;
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
        playerWalkAnimCounter = 0;
    }

    //If the player is falling, then animate their arm positioning.
    if (!onGround) {
        if (!onPlayerRect) {
            inAirCounter += 1;
            if (!infiniteFlip && inAirCounter >= 4) canFlip = false;
        }
        else inAirCounter = 0;

        if (playerFallAnimOut) {
            playerFallAnimCounter += 0.4;
            if (playerFallAnimCounter >= 2) playerFallAnimOut = false;
        }
        else {
            playerFallAnimCounter -= 0.4;
            if (playerFallAnimCounter <= -2) playerFallAnimOut = true;
        }
    }
    else if (playerFallAnimCounter !== 0) {
        playerFallAnimCounter = 0;
    }
};

let shouldPlayRotateSound = true;
function rotatePlayer(o) {
    if (o.values && o.values.dir === 1) {
        player.g = 1;
        player.flip = true;
        player.scale = Math.abs(player.scale) * -1;
    }
    else {
        player.g = 1;
        player.flip = false;
        player.scale = Math.abs(player.scale);
    }

    player.halfHeight = 4;
    player.halfWidth = 7;

    drawGTimer = true;
    GTimer = 5000;

    if (shouldPlayRotateSound) {
        const sound = sfxr.generate("powerUp");
        sfxr.play(sound);

        shouldPlayRotateSound = false;

        setTimeout(() => { shouldPlayRotateSound = true }, 100);
    }
};

function rotateDown(playSound = true) {
    if (playSound === true) {
        const sound = sfxr.generate("jump");
        sound.sound_vol = 0.05;
        sfxr.play(sound);
    }

    player.g = 0; player.halfWidth = 4; player.halfHeight = 7;
    player.flip = false; player.scale = Math.abs(player.scale);
    drawGTimer = false;
}


// I made these 'functions' so they can be accessed in the items object declaration (as they are referenced before defined).
// They handle giving the player the relevant item. They displays the relevant image next to items, updates instruction text,
// and may send a POST request to the server updating this player's items.
function collectMorphBall(shouldSendPost = true) {
    hasMorphBall = "User- you must put parentheses \"()\" after a function's name to execute it.";
    document.getElementById('morphball').classList.remove("noDisplay");
    document.getElementById('morphball').classList.add("inline");
    // document.getElementById('moveInstructions').innerHTML = `Use '<strong>A</strong>', '<strong>D</strong>', and '<strong>W</strong>' to move, `;
    canCrawl = true; hasMorphBall = true;
    if (shouldSendPost === true) {
        requests.updatePlayer(player.name, 'morphball');
        item_audio.play();
    }
}

const displayInstructions = () => {
    let s1, s2;
    if (hasEyes === true) s1 = "Use A, D, (Shift, (R))";
    // document.getElementById("instructions").textContent = `Use '<strong>A</strong>', '<strong>D</strong>', and '<strong>W</strong>' to move` 
};

let playerShouldEnterVoid = false;
function collectScrewAttack(shouldSendPost = true) {
    document.getElementById('screwattack_active').classList.remove("noDisplay");
    document.getElementById('screwattack_active').classList.add("inline");

    playerShouldEnterVoid = true;
    // document.getElementById('spaceInstructions').innerHTML = `<strong>&nbsp;SPACE</strong> to ultra flip`
    // infiniteFlip = true;
    if (shouldSendPost === true) {
        requests.updatePlayer(player.name, 'screwattack');
        item_audio.play();
    }
}

function collectEyes(shouldSendPost = true) {
    document.getElementById('eyes').classList.remove("noDisplay");
    document.getElementById('eyes').classList.add("inline");
    // document.getElementById('moveInstructions').innerHTML = `Use '<strong>A</strong>', '<strong>D</strong>', and '<strong>W</strong>' to move (hold <strong>SHIFT</strong>),`;
    hasEyes = true;

    if (shouldSendPost === true) {
        requests.updatePlayer(player.name, 'eyes');
        item_audio.play();
    }
}

function collectMouse(shouldSendPost = true) {
    document.getElementById('mouse').classList.remove("noDisplay");
    document.getElementById('mouse').classList.add("inline");
    console.log("By the way, you can mouse over an item to see a short description.");
    // document.getElementById('moveInstructions').innerHTML = `Use '<strong>A</strong>', '<strong>D</strong>', and '<strong>W</strong>' to move (hold <strong>SHIFT</strong>), click mouse`;
    hasMouse = true; playerCanPlaceRect = true;

    document.body.addEventListener("mousedown", (e) => {

        if (!playerCanPlaceRect) return;

        const coords = utilities.handleMouseClick(e);

        if (coords !== null) {
            changeAbleToPlaceRect(false);

            const sound = sfxr.generate("click");
            sound.sound_vol = 0.1;
            sfxr.play(sound);

            if (playerRect == null) {
                playerRect = new level.bgRect(coords[0] - camXOffset, coords[1] - camYOffset, 50, 20, trueColor);
                playerRect.values = { color: trueColor };
                playerRect.hSpeed = 2;
                playerRect.isPlayerRect = true;

                collisionRects.push(playerRect);
            }
            else {
                playerRect.x = coords[0] - camXOffset;
                playerRect.y = coords[1] - camYOffset;
            }
        }
    });

    if (shouldSendPost === true) {
        requests.updatePlayer(player.name, 'mouse');
        item_audio.play();
    }
}

function stopFire() {
    level.specialObjects.splice(1, 2);
    const sound = sfxr.generate("click");
    sfxr.play(sound)
}

// Ran when the 'Back To Start' button is clicked. Useful if the player shoots off into the distance without the screw attack.
const movePlayerBackToStart = () => {
    scene.remove(currentlyDrawnModel);
    currentlyDrawnModel = false;
    renderer.render(scene, camera);

    // document.getElementById("theKey").hidden = false;
    player.x = player.spawn[0]; player.y = player.spawn[1];

    if (player.g === 0) player.flip = false;

    player.scale = Math.abs(player.scale);
    player.newX = 300; player.newY = 300;
    camXOffset = 300 - player.x; camYOffset = 300 - player.y;
    requests.sendRequestForInfo(player.name);
}

// Runs every update (60 fps) once the player has clicked the yellow button.
// Displays some cool graphics/effects.
function cloudState() {
    //Runs the first frame the player turns into cloud: creates the cloud object, plays audio.
    if (!inClouds) {
        shouldUpdateGame = false;

        //create a background rectangle of the player's selected color.
        playerCloud = new level.bgRect(player.x, -20, Math.random() * 10 + 30, Math.random() * 4 + 3, trueColor);
        playerCloud.dirRad = -Math.PI / 2;
        playerCloud.halfWidth = playerCloud.width / 2;
        playerCloud.halfHeight = playerCloud.height / 2;
        playerCloud.scale = 3;

        // bgRects.push(new level.bgRect(Math.floor(Math.random() * GAME_WIDTH), Math.floor(Math.random() * GAME_HEIGHT), Math.floor(Math.random() * 10) + 30, Math.floor(Math.random() * 4) + 10, "rgba(220,221,11,0.95)"));

        scene.add(items['3DTree'].file);

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
            p_ctx.filter = "none";
            // I got this code for perfect audio looping (as the loop attribute has delay) from https://stackoverflow.com/a/22446616
            sky_audio.addEventListener('timeupdate', (e) => {
                const buffer = 0.12;
                if (sky_audio.currentTime > sky_audio.duration - buffer) {
                    sky_audio.currentTime = 0;
                    sky_audio.play();
                }
            })
        }, 6000);

        should_change_bg_color = true;
        inClouds = true;
    }

    if (shouldUpdateGame) return;

    if (bgRectColor < 254) {
        bgRectColor += 0.15;
        player.y += 0.3;
    }

    //find true player.x, where drawn


    //Makes the player's alpha decrease.
    // player.color = `#000000${(255 - bgRectColor).toString(16).substring(0, 2)}`;

    utilities.drawPlayer(player, camXOffset, camYOffset, p_ctx, true, 0, 0);

    // Prob being redrawn in another place at full capacity?
    // playerCloud.color = `${trueColor}${bgRectColor.toString(16).substring(0, 2)}`;
    bg_color_rgb = utilities.fadeBGColorToDarkBlue(bg_color_rgb);

    // let flrClr = Math.floor(bgRectColor);
    p_ctx.filter = `grayscale(${bgRectColor * 10}%) opacity(${5/bgRectColor})`;
    drawLevel();
}

function theCloud() {
    const sound = sfxr.generate("laserShoot");
    sfxr.play(sound);

    bgRects.push(new level.bgRect(Math.floor(Math.random() * GAME_WIDTH), Math.floor(Math.random() * GAME_HEIGHT), Math.floor(Math.random() * 10) + 30, Math.floor(Math.random() * 4) + 10, "rgba(220,221,11,0.95)"));
}

const changeAbleToPlaceRect = (able) => {
    if (hasMouse !== true) return;
    if (able === true) {
        document.getElementById('mouse').classList.remove("noDisplay");
        document.getElementById('mouse').classList.add("inline");
        document.getElementById('mouse_inv').classList.remove("inline");
        document.getElementById('mouse_inv').classList.add("noDisplay");
        playerCanPlaceRect = true;
    }
    else {
        document.getElementById('mouse_inv').classList.remove("noDisplay");
        document.getElementById('mouse_inv').classList.add("inline");
        document.getElementById('mouse').classList.remove("inline");
        document.getElementById('mouse').classList.add("noDisplay");
        playerCanPlaceRect = false;
    }
}

const setupSocket = () => {
    socket = io();
    socket.on('receiveMovement', (movement) => {
        otherPlayerMovement = movement;
    });
};

const rightClick = (e) => {

}

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
const canvasA = document.getElementById("canvas_above");
let a_ctx;
let playerIsFallingInEnding = false;

ʵ.end = () => {
    console.log("You must put parentheses at the end of a command to execute it... Sorry but this is just the way I am.");
    document.getElementById("canvas_js3").remove();

    shouldUpdateGame = false;
    playerCanPlaceRect = false;

    setShape(1);
    player.scale = 3;

    console.log("I remember now... my name is ʈʼ");

    canvasA.width = 1000;
    canvasA.height = 400;
    a_ctx = canvasA.getContext('2d');

    playerIsFallingInEnding = true;

    //Thanks to https://stackoverflow.com/a/48087847 for this code for disabling a bunch of buttons at once
    let btns = document.getElementsByTagName("button");
    for (let btn of btns) {
        btn.disabled = true;
    };
    document.getElementById("logoutLink").classList.add("disabled");
    document.getElementById("game").style.height = 0;
    document.getElementById("gameInfo").style.height = 0;
};

let startOpac = 1;

const canvasP = document.getElementById("canvas_player");
const canvasW = document.getElementById("canvas_walkers");
const canvasBG = document.getElementById("canvas_bg");

let PlayerIsLeaving = false;
let bodyPaddingTop = 0, exitingThroughDoor2 = false, exitAnimTimer = 300;
function endingLogic() {
    let playerWaving = false;

    //Start opacity of canvas fading out
    if (startOpac <= 0) {
        if (keysPressed[65]) { player.x -= xSpeed / 2; }
        if (keysPressed[68]) { player.x += xSpeed / 2; }

        // console.log(`player_x: ${player.x}  bodyPaddingTop: ${bodyPaddingTop}`);
        a_ctx.clearRect(0, 0, 1000, 1000);

        if (exitingThroughDoor2 === true) {
            exitAnimTimer -= 1;

            playerWaving = true;
            // If the exit timer is not done (50 rather than 0 to avoid an insanely high brightness)
            if (exitAnimTimer >= 50) {
                a_ctx.filter = `brightness(${300 / exitAnimTimer})`;
                playerFallAnimCounter = Math.sin((exitAnimTimer * Math.PI / 35)) * 1.5 + 1;
            }
            // Remove canvas after player enters door 2.
            else {
                document.getElementById("canvas_above").remove();
                exitingThroughDoor2 = false;
            }
        }

        // If the player entered the player.exitWorld command
        if (PlayerIsLeaving === true) {
            a_ctx.drawImage(imgs['door2'], 500, 150);
            player.y = 350;

            a_ctx.font = "30px Arial";
            a_ctx.fillText("Ah well, looks like I'm done for", 400, 50);

            if (keysPressed[87] && player.x >= 1305 && player.x <= 1375) {
                exitingThroughDoor2 = true;
            }
        }
        else {
            // Increase body padding top to push canvas down.
            bodyPaddingTop += 9;
            document.body.style.paddingTop = bodyPaddingTop + "px";

            //Scroll to (almost) the bottom to show the player on the canvas.
            window.scroll({
                top: bodyPaddingTop,
                left: 0,
                behavior: "instant",
            });
        }
        utilities.drawPlayer(player, camXOffset, camYOffset, a_ctx, false, 0, playerFallAnimCounter, playerWaving);
    }
    // Do inital effect after running world.stop of fading out canvases.
    else {
        startOpac -= 0.005;

        document.getElementById("falseBody").style.opacity = startOpac;
        canvasP.style.opacity = startOpac;
        canvasW.style.opacity = startOpac;
        canvasBG.style.opacity = startOpac;

        player.y += 1;

        utilities.drawPlayer(player, camXOffset, camYOffset, a_ctx, true);
    }
};

ʈʼ.exitWorld = () => {
    if (playerIsFallingInEnding !== true) {
        console.log("The player cannot leave a world that is still going.")
    }
    else {
        PlayerIsLeaving = true;
    }
}

export { startGameLogic, setShape };