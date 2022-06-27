// Thank you to https://www.schemecolor.com/sky-on-fire.php for this color palette.
// const fireColors = ["#C11B1B", "#F04931", "#FE9F41", "#FBD687", "#FDEAA7"];
const fireColors = ["#000000", "#111111", "#22222", "#333333", "#444444", "#555555", "#666666", "#777777", "#888888", "#999999",
"#AAAAAA", "#BBBBBB", "#CCCCCC", "#DDDDDD", "#EEEEEE", "#FFFFFF"];
const PI3DIV2 = 3 * Math.PI / 2;
const NPIDIV2 = -Math.PI/2;


// draws the player shape, which is a combination of canvas lines and arcs.
const drawPlayer = (p, camX, camY, ctx, shouldClear = true, frame = 0) => {

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
  const legOffset = (2 + frame) * p.scale;

  ctx.moveTo(0, -p.scale);
  
  //draws line body from head
  ctx.lineTo(0, (5 * p.scale));
  ctx.lineTo(-legOffset, (8 * p.scale)); //draws left leg
  ctx.moveTo(0, (5 * p.scale)); //moving to leg beginning
  ctx.lineTo(legOffset, (8 * p.scale)); //right leg
  ctx.moveTo(-(3 * p.scale), (3 * p.scale)); //move to beginning of arms
  ctx.lineTo((3 * p.scale), (3 * p.scale)); //arms

  ctx.closePath();

  if (p.color) ctx.strokeStyle = p.color;
  ctx.stroke();

  ctx.restore();
}

const drawRectangle = (x, y, width, height, ctx, color, fill = true) => {
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();

  if (fill) { ctx.fillStyle = color; ctx.fill() }
  else { ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.restore();
}

const drawPlayerCloud = (p, ctx, camX) => {
  ctx.save();  
  ctx.translate(p.x + camX, p.y);
  ctx.rotate(p.dirRad);

  //have to fix this
  ctx.beginPath();

  // it's too big: don't include p.y, just height? or width... 
  // Top left corner, top right etc.r
  ctx.moveTo(-p.halfWidth, -p.halfHeight);
  ctx.lineTo(p.halfWidth, -p.halfHeight);
  ctx.lineTo(p.halfWidth, p.halfHeight);
  ctx.lineTo(-p.halfWidth, p.halfHeight);
  ctx.closePath();

  ctx.fillStyle = p.color; ctx.fill();
  ctx.stroke();

  ctx.restore();
}

//Maybe include a less graphically internsive fire option: just a sprite.
const drawFire = (x, y, width, height, ctx, startColor = 0) => {
  ctx.save();
  let clr = startColor;

  ctx.fillStyle = fireColors[clr];
  ctx.fillRect(x, y, width, height);

  let inc = 2;

  for (let i = 10; i >= 1; i -= 2) {
    clr += 1;
    if (clr > 15) clr = 0;

    // inc -= .4;

    ctx.fillStyle = fireColors[clr];
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
  drawFire, drawPlayerCloud
}