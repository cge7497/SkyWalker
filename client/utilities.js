// draws the player shape, which is a combination of canvas lines and arcs.
const drawPlayer = (x, y, p_ctx, flipPlayer, scale, color, shouldClear = true, shape = 0) => {
  if (flipPlayer) scale *= -1;
  if (shouldClear) p_ctx.clearRect(0, 0, 640, 480);

  // Circle, square, triangle, diamond
  p_ctx.save();
  p_ctx.beginPath();

  switch (shape) {
    case 0:
      p_ctx.arc(x, y - (3 * scale), 3, 0, 2 * Math.PI);
      break;
    case 1:
      scale *= 2;
      p_ctx.arc(x, y - (3 * scale), Math.abs(3 * scale), 0, 2 * Math.PI);
      break;
    case 2:
      scale *= 0.5;
      p_ctx.arc(x, y - (3 * scale), Math.abs(3 * scale), 0, 2 * Math.PI);
      break;
    case 3:
      p_ctx.rect(x, y, 5 * scale, 5 * scale);
      break;
    case 4:
      p_ctx.rect(x - (3 * scale), y - (6 * scale), 6 * scale, 6 * scale);
      break;
    default:
      p_ctx.arc(x, y - (3 * scale), 3, 0, 2 * Math.PI);
      break;
  }
  //draws line body from head
  p_ctx.moveTo(x, y);
  p_ctx.lineTo(x, y + (5 * scale));
  p_ctx.lineTo(x - (2 * scale), y + (8 * scale)); //draws left leg
  p_ctx.moveTo(x, y + (5 * scale)); //moving to leg beginning
  p_ctx.lineTo(x + (2 * scale), y + (8 * scale)); //right leg
  p_ctx.moveTo(x - (3 * scale), y + (3 * scale));
  p_ctx.lineTo(x + (3 * scale), y + (3 * scale));
  if (color) p_ctx.strokeStyle = color;
  p_ctx.stroke();
  p_ctx.closePath();
  p_ctx.restore();
}

const drawRectangle = (x, y, width, height, ctx, color, fill) => {
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

// Huge thanks to http://jsfiddle.net/ethertank/Eanf7/ for the logic/structure of this code.
const drawFire = (x, y, width, height, ctx) => {
  ctx.save();

  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    ctx.lineWidth = 10;
    var lX = parseInt(Math.random() * width, 10),
      lsY = parseInt(Math.random() * (height - 100), 10) + 50,
      leY = parseInt(Math.random() * (height - 100), 10) + 50,
      r = RandomNum(150, 255),
      g = RandomNum(0, 150),
      b = RandomNum(0, 150);
    ctx.moveTo(x + lX, y + lsY);
    var sColor = "rgb(" + r + "," + g + "," + b + ")";
    ctx.strokeStyle = sColor;
    ctx.lineTo(x + lX, y + leY);
    ctx.stroke();
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
  return (p.y + (p.halfHeight - 2)) < r.y &&
    (p.newY + (p.halfHeight + 2)) >= r.y;
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
  drawFire
}