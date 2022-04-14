// I got this code from the class repo: https://github.com/IGM-RichMedia-at-RIT/nodemon-webpack-demo-done/blob/master/src/htmlResponses.js

const fs = require('fs'); // Pull in the file system module

// Read the client.html, style.css, and bundle.js files into memory on server start
const index = fs.readFileSync(`${__dirname}/../hosted/client.html`);
const css = fs.readFileSync(`${__dirname}/../hosted/style.css`);
const bundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);
const favicon = fs.readFileSync(`${__dirname}/../hosted/icon.gif`);
const screwattack = fs.readFileSync(`${__dirname}/../hosted/screwattack.png`);
const morphball = fs.readFileSync(`${__dirname}/../hosted/morphball.png`);
const yellowswitch = fs.readFileSync(`${__dirname}/../hosted/yellowswitch.png`);
const buttonClick = fs.readFileSync(`${__dirname}/../hosted/buttonClick.wav`);
const itemGet = fs.readFileSync(`${__dirname}/../hosted/itemGet.wav`);

// A simple helper function for serving up static files
const serveFile = (response, file, contentType) => {
  response.writeHead(200, { 'Content-Type': contentType });
  response.write(file);
  response.end();
};

// Serve the client.html page
const getIndex = (request, response) => {
  serveFile(response, index, 'text/html');
};

// Serve the style.css page
const getCSS = (request, response) => {
  serveFile(response, css, 'text/css');
};

// Serve the bundle.js file
const getBundle = (request, response) => {
  serveFile(response, bundle, 'application/javascript');
};

// Serve the favicon.
const getFavicon = (request, response) => {
  serveFile(response, favicon, 'image/gif');
};

// Serve the screw attack image.
const getScrewAttack = (request, response) => {
  serveFile(response, screwattack, 'image/png');
};

// Serve the morph ball image.
const getMorphBall = (request, response) => {
  serveFile(response, morphball, 'image/png');
};

// Serve the yellow switch image.
const getYellowSwitch = (request, response) => {
  serveFile(response, yellowswitch, 'image/png');
};

// Serve the sound that plays when the player pushes the yellow button.
const getButtonSound = (request, response) => {
  serveFile(response, buttonClick, 'image/png');
};

// Serve the sound that plays when the player collects an item.
const getItemSound = (request, response) => {
  serveFile(response, itemGet, 'image/png');
};

module.exports = {
  getIndex,
  getCSS,
  getBundle,
  getFavicon,
  getScrewAttack,
  getMorphBall,
  getYellowSwitch,
  getButtonSound,
  getItemSound,
};
