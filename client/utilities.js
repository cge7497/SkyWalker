// Thank you to https://www.schemecolor.com/sky-on-fire.php for this color palette.
// const fireColors = ["#C11B1B", "#F04931", "#FE9F41", "#FBD687", "#FDEAA7"];
const fireColors = [["#000000", "#111111", "#222222", "#333333", "#444444", "#555555", "#666666", "#777777", "#888888", "#999999",
  "#aaaaaa", "#bbbbbb", "#cccccc", "#dddddd", "#eeeeee", "#ffffff"].reverse(), ["rgb(247,100,29)", "rgb(235,110,29)", "rgb(223,120,39)", "rgb(211,130,49)", "rgb(199,140,59)", "rgb(187,150,69)",
  "rgb(175,160,79)", "rgb(163,170,89)", "rgb(151,180,99)", "rgb(139,190,109)",
  "rgb(127,200,119)", "rgb(115,210,129)", "rgb(102,220,139)", "rgb(90,230,149)", "rgb(78,240,159)", "rgb(66, 250, 169)"],
["rgb(160,80,0)", "rgb(150,75,10)", "rgb(140,70,20)", "rgb(130,65,30)", "rgb(120,60,40)", "rgb(110,55,50)",
  "rgb(100,50,60)", "rgb(90,45,70)", "rgb(80,40,80)", "rgb(70,35,90)",
  "rgb(60,30,100)", "rgb(50,25,110)", "rgb(40,20,120)", "rgb(30,15,130)", "rgb(20,10,140)", "rgb(10, 5, 150)"]];


const PI3DIV2 = 3 * Math.PI / 2;
const NPIDIV2 = -Math.PI / 2;


// draws the player shape, which is a combination of canvas lines and arcs.
const drawPlayer = (p, camX, camY, ctx, shouldClear = true, walkFrame = 0, fallFrame = 0) => {

  const x = p.x + camX;
  const y = p.y + camY;

  if (shouldClear) ctx.clearRect(0, 0, 640, 480);

  // Circle, square, triangle, diamond
  ctx.save();

  ctx.translate(x, y);
  ctx.beginPath();

  if (p.g === 1) {
    ctx.rotate(Math.PI / 2);
  }

  switch (p.shape) {
    case 0:
      ctx.arc(0, -(3 * p.scale), 3, NPIDIV2, PI3DIV2);
      break;
    case 1:
      ctx.arc(0, -(3 * p.scale), Math.abs(3 * p.scale), NPIDIV2, PI3DIV2);
      break;
    case 2:
      ctx.arc(0, -(3 * p.scale), Math.abs(3 * p.scale), NPIDIV2, PI3DIV2);
      break;
    case 3:
      ctx.rect(0, 0, 5 * p.scale, 5 * p.scale);//
      break;
    case 4:
      ctx.rect(-(3 * p.scale), -(6 * p.scale), 6 * p.scale, 6 * p.scale);
      break;
    default:
      ctx.arc(0, -(3 * p.scale), 3, NPIDIV2, PI3DIV2);
      break;
  }
  const legOffset = (2 + walkFrame) * p.scale;
  const armOffset = (3 - fallFrame) * p.scale;


  ctx.moveTo(0, -p.scale);

  //draws line body from head
  ctx.lineTo(0, (5 * p.scale));
  ctx.lineTo(-legOffset, (8 * p.scale)); //draws left leg
  ctx.moveTo(0, (5 * p.scale)); //moving to leg beginning
  ctx.lineTo(legOffset, (8 * p.scale)); //right leg

  ctx.moveTo(-(3 * p.scale), armOffset); //move to beginning of arms
  ctx.lineTo(0, (3 * p.scale)); //left arm to center
  ctx.lineTo((3 * p.scale), armOffset); //center to right arm
  ctx.moveTo(0, (3 * p.scale)); //left arm to center


  ctx.closePath();

  if (p.color) ctx.strokeStyle = p.color;
  ctx.stroke();

  ctx.restore();
}

const drawRectangle = (x, y, width, height, ctx, color, fill = true, fillAndStroke = false, strokeColor = "black") => {
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();

  if (fillAndStroke) { ctx.fillStyle = color; ctx.strokeStyle = strokeColor; ctx.fill(); ctx.stroke(); }
  else if (fill) { ctx.fillStyle = color; ctx.fill() }
  else { ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.restore();
}

const drawPlayerCloud = (p, ctx, camX, fallFrame, walkFrame) => {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.dirRad);



  //have to fix this
  ctx.beginPath();
  ctx.arc(0, -(3 * p.scale), Math.abs(3 * p.scale), NPIDIV2, PI3DIV2);


  const armOffset = (3 - fallFrame) * p.scale;
  const legOffset = (2 + walkFrame) * p.scale;

  ctx.moveTo(0, -p.scale);

  //draws line body from head
  ctx.lineTo(0, (5 * p.scale));
  ctx.lineTo(-legOffset, (8 * p.scale)); //draws left leg
  ctx.moveTo(0, (5 * p.scale)); //moving to leg beginning
  ctx.lineTo(legOffset, (8 * p.scale)); //right leg

  ctx.moveTo(-(3 * p.scale), armOffset); //move to beginning of arms
  ctx.lineTo(0, (3 * p.scale)); //left arm to center
  ctx.lineTo((3 * p.scale), armOffset); //center to right arm
  ctx.moveTo(0, (3 * p.scale)); //left arm to center


  ctx.closePath();

  if (p.color) ctx.strokeStyle = p.color;
  ctx.lineWidth=5;

  ctx.setLineDash([1, 5]);
  ctx.lineDashOffset = Math.random() * 10;
  ctx.stroke();

  ctx.restore();
}

//Maybe include a less graphically internsive fire option: just a sprite.
const drawFire = (x, y, width, height, ctx, startColor = 0) => {
  ctx.save();
  let clr = Math.floor(startColor);
  let clrInc = 1;

  const f = 2;

  ctx.fillStyle = fireColors[f][clr];
  ctx.fillRect(x, y, width, height);

  let inc = 2;

  for (let i = 6; i >= 3; i -= 1) {
    clr += clrInc;
    if (clr > 14) clrInc = -1;
    else if (clr < 1) clrInc = 1;

    // inc -= .4;

    ctx.fillStyle = fireColors[f][Math.floor(clr)];
    const factor = 1 - (2 / i);
    ctx.fillRect(x + width / i, y + height / i, width * factor, height * factor);
  }

  ctx.restore();
}

const handlePlayerCrawl = (p, flip) => {
  let dif = 4; let totalDif = 0;
  if (flip) dif = -4;
  if (p.scale === 1) {
    p.scale = 0.1; p.halfWidth = 1; p.halfHeight = 1; totalDif = -dif;
  }
  else {
    p.scale = 1; p.halfWidth = 4; p.halfHeight = 7; totalDif = -3 * dif;
  }
  p.y += totalDif;
  return totalDif;
}

const handleMouseClick = (e) => {
  let x, y, type;

  //If the click is not in the canvas, then return.
  if (e.target.localName != "canvas") { console.log("not on canvas (utilities 160)"); return null; }
  type = Math.floor(Math.random() * 2);


  //gets where the mouse is clicked on the canvas. If it is clicked in a valid position, then it creates a platform at that spot.
  x = e.layerX - 25;
  y = e.layerY - 10;

  return [x, y];
};

//not used.
const fadeBGColorToDarkBlue = (color_rgb) => {
  if (color_rgb[0] > 15) color_rgb[0] -= 0.1;
  if (color_rgb[1] > 31) color_rgb[1] -= 0.1;
  if (color_rgb[2] > 56) color_rgb[2] -= 0.1;
  return color_rgb;
}

const drawDebugPlayer = (p, p_ctx, xCam, yCam) => {
  p_ctx.fillRect(p.x + xCam - p.width / 2, p.y + yCam - p.height / 2, p.width, p.height, 'blue');
}

//I followed/copied much of the following collision code from https://gamedev.stackexchange.com/questions/13774/how-do-i-detect-the-direction-of-2d-rectangular-object-collisions
// These functions test which direction two objects (usually the player and a rectangle) collided.
// It compares the player's old coordinates and new ones with the rectangles, to figure out which coordinate change triggered the collision.
const collidedFromRight = (p, r) => {
  return (p.x + (p.halfWidth - 2)) <= r.x && // If the new coordinates were not overlapping...
    (p.newX + (p.halfWidth + 2)) >= r.x; // and the new ones are.
};

const collidedFromLeft = (p, r) => {
  return (p.x - (p.halfWidth - 2)) >= (r.x + r.width) &&
    (p.newX - (p.halfWidth + 2)) < (r.x + r.width);
};

const collidedFromBottom = (p, r) => {
  return (p.y + (p.halfHeight - 1)) < r.y &&
    (p.newY + (p.halfHeight + 1)) >= r.y;
};

const collidedFromTop = (p, r) => {
  return (p.y - (p.halfHeight - 2)) >= (r.y + r.height) && // was not colliding
    (p.newY - (p.halfHeight + 2)) < (r.y + r.height);
};

const RandomNum = (min, max) => {
  return Math.random() * (max - min) + min;
};

export {
  drawPlayer, drawRectangle, fadeBGColorToDarkBlue, drawDebugPlayer, handlePlayerCrawl,
  collidedFromBottom, collidedFromLeft, collidedFromTop, collidedFromRight,
  drawFire, drawPlayerCloud, handleMouseClick
}