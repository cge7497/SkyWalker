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
const getPlayer = (request, response) => {
  // default json message
  let responseJSON = {
    message: 'A name parameter is required.',
  };

  if (!request.body.name) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 200;

  if (!players[request.body.name]) {
    responseCode = 400;
    responseJSON.id = 'invalidParams';
    responseJSON.message = `A player of the name ${request.body.name} does not exist.`;
  } else {
    responseJSON = {
      player: players[request.body.name],
    };
  }
  // console.log(interval.ref);
  return respondJSON(request, response, responseCode, responseJSON);
};

// adds to the global movement array for this second.
const addMovement = (movement) => {
  if (!movement) return false;

  if (!movement.name || !movement.color || !movement.movement) {
    return false;
  }

  playerMovementThisSecond[movement.name] = {
    name: movement.name,
    color: movement.color,
    movement: movement.movement,
  };

  return true;
};

// Add a cloud to the level data JSON object.
const addCloud = (request, response) => {
  const responseJSON = {
    message: 'A color is required.',
  };

  if (!request.body.color) {
    responseJSON.id = 'missingParam';
    return respondJSON(request, response, 400, responseJSON);
  }

  level.addCloud(request.body.color);

  // This returns if the cloud was added.
  return respondJSONMeta(request, response, 204);
};

// returns global player movement. Currently not used by front-end, but helpful for testing.
const getMovement = () => playerMovementThisSecond;

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
