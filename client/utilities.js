// draws the player shape, which is a combination of canvas lines and arcs.
const drawPlayer = (x, y, p_ctx, flipPlayer, scale, color, shouldClear = true) => {
  if (flipPlayer) scale *= -1;
  if (shouldClear) p_ctx.clearRect(0, 0, 640, 480);

  p_ctx.save();
  p_ctx.beginPath();
  p_ctx.arc(x, y - (3 * scale), 3, 0, 2 * Math.PI);
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

export {
  drawPlayer, drawRectangle, fadeBGColorToDarkBlue, drawDebugPlayer, handlePlayerCrawl,
  collidedFromBottom, collidedFromLeft, collidedFromTop, collidedFromRight
}