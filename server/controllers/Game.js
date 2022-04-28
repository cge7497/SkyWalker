const level = require('../models/levelData.js');

const players = [];
const playerMovementThisSecond = {};

// writes a status header and a JSON object to the response.
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// writes a status header to the response.
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// return user object as JSON
const getPlayers = (request, response) => response.json(players);

// get an existing player/user.
const getPlayer = (request, response, body) => {
  // default json message
  let responseJSON = {
    message: 'A name parameter is required.',
  };

  if (!body.name) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 200;

  if (!players[body.name]) {
    responseCode = 400;
    responseJSON.id = 'invalidParams';
    responseJSON.message = `A player of the name ${body.name} does not exist.`;
  } else {
    responseJSON = {
      player: players[body.name],
    };
  }
  // console.log(interval.ref);
  return respondJSON(request, response, responseCode, responseJSON);
};

// adds to the global movement array for this second.
const addMovement = (request, response, body) => {
  let responseJSON = {
    message: 'This endpoint requires a player JSON object with a name, color, and array of >=30 JSON objects with an X, Y, and flipped variable. They were not present in the request.',
    id: 'missingParams',
  };

  if (!body.movement) return respondJSON(request, response, 400, responseJSON);

  const movement = JSON.parse(body.movement);

  if (!movement.name || !movement.color || !movement.movement) {
    return respondJSON(request, response, 400, responseJSON);
  }

  if (!players[movement.name]) {
    responseJSON.id = 'invalidPlayer';
    responseJSON.message = `The player '${body.name}' does not exist on the server.`;
    return respondJSON(request, response, 400, responseJSON);
  }

  responseJSON = { movement: playerMovementThisSecond };
  respondJSON(request, response, 200, responseJSON);

  playerMovementThisSecond[movement.name] = {
    name: movement.name,
    color: movement.color,
    movement: movement.movement,
  };

  return 0;
};

// Add a cloud to the level data JSON object.
const addCloud = (request, response, body) => {
  const responseJSON = {
    message: 'A color is required.',
  };

  if (!request.body.color) {
    responseJSON.id = 'missingParam';
    return respondJSON(request, response, 400, responseJSON);
  }

  level.addCloud(body.color);

  // This returns if the cloud was added.
  return respondJSONMeta(request, response, 204);
};

// returns global player movement. Currently not used by front-end, but helpful for testing.
const getMovement = (request, response) => {
  const responseJSON = { movement: playerMovementThisSecond };
  respondJSON(request, response, 200, responseJSON);
};

// Returns the level data.
const getLevel = (request, response) => {
  const responseJSON = {
    level: level.data,
  };
  return respondJSON(request, response, 200, responseJSON);
};

const getLevelMeta = (request, response) => respondJSONMeta(request, response, 200);

// Responds with status code 304 (Not Modified)
// if there has been 1 or less player movement stats in the last second,
// or status 100 (Continue) if there was other player movement recently.

// Currently not used by client, but could work to prevent unnecessary sendMovement POST requests.
const getMovementMeta = (request, response) => {
  /* const keys = Object.keys(playerMovementThisSecond);
  if (keys && keys.length > 0) {
    return respondJSONMeta(request, response, 304);
  } else return respondJSONMeta(request, response, 100);
 */
  respondJSONMeta(request, response, 200);
};

const getPlayerMeta = (request, response) => respondJSONMeta(request, response, 200);

const getPlayersMeta = (request, response) => respondJSONMeta(request, response, 200);

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

// public exports
module.exports = {
  getPlayers,
  getPlayersMeta,
  getPlayer,
  getPlayerMeta,
  getLevel,
  getLevelMeta,
  getMovement,
  getMovementMeta,
  addMovement,
  addCloud,
  notFound,
  players,
};
