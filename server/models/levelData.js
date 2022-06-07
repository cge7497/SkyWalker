// Stores the data of the level.
const data = require('../../SkyWalker Ogmo/1.json');
// I could swap it out on the server, and the player will get the new one upon refresh.
/*
const data = {
  rects: [
    // Main middle room
    {
      x: 284, y: 315, width: 31, height: 30, color: 'blue',
    },
    {
      x: 0, y: 2, width: 30, height: 600, color: 'red',
    },
    {
      x: 0, y: 750, width: 30, height: 650, color: 'blue',
    },
    {
      x: 1000, y: 40, width: 30, height: 1490, color: 'green',
    },
    {
      x: -600, y: 1500, width: 1630, height: 30, color: 'black',
    },
    {
      x: 60, y: 0, width: 1030, height: 30, color: 'orange', // should be 0 x
    },

    // Screw Attack room
    {
      x: -200, y: 601, width: 30, height: 30, color: 'red',
    },
    {
      x: -200, y: 500, width: 200, height: 50, color: 'blue',
    },
    {
      x: -650, y: 500, width: 200, height: 50, color: 'blue',
    },
    {
      x: -200, y: 798, width: 200, height: 50, color: 'blue',
    },
    {
      x: -650, y: 798, width: 200, height: 50, color: 'blue',
    },
    {
      x: -650, y: 550, width: 50, height: 250, color: 'blue',
    },

    // Bottom left maze

    // Near Entrance
    { // Short orange vertical wall to the left of entrance
      x: -50, y: 1250, width: 50, height: 150, color: 'orange',
    },
    { // pink wall extending from orange wall
      x: -200, y: 1250, width: 150, height: 50, color: 'pink',
    },
    { // blue wall going down from pink
      x: -200, y: 1300, width: 50, height: 150, color: 'blue',
    },
    {
      x: -150, y: 1350, width: 50, height: 100, color: 'MidnightBlue',
    },
    // Bottom Left Half
    { // light pink wall extending left
      x: -400, y: 1400, width: 200, height: 50, color: 'MistyRose',
    },
    { // gray square
      x: -250, y: 1300, width: 50, height: 50, color: 'Olive',
    },
    { // white floor in lower middle
      x: -450, y: 1300, width: 150, height: 50, color: 'PapayaWhip',
    },
    { // brown two floor toward bottom left
      x: -550, y: 1400, width: 100, height: 50, color: 'Peru',
    },
    { // Three vertical toward bottom left
      x: -550, y: 1200, width: 50, height: 150, color: 'Violet',
    },

    { // Three going right in middle
      x: -500, y: 1200, width: 150, height: 50, color: 'RebeccaPurple',
    },
    { // 5 wide towards top
      x: -550, y: 1100, width: 250, height: 50, color: 'PeachPuff',
    },

    { // top left 4 wide
      x: -650, y: 1000, width: 200, height: 50, color: 'MediumSlateBlue',
    },
    { // top left 2 down
      x: -700, y: 1000, width: 50, height: 100, color: 'MediumSeaGreen',
    },

    // Top middle and right
    { // middle 2 down
      x: -350, y: 950, width: 50, height: 100, color: 'Maroon',
    },
    { // top middle right 3 down
      x: -200, y: 950, width: 50, height: 150, color: 'Magenta',
    },
    { // middle top right 2 left
      x: -250, y: 1100, width: 100, height: 50, color: 'Indigo',
    },
    { // middletop right bottom square
      x: -200, y: 1150, width: 50, height: 50, color: 'Fuchsia',
    },
    { // top right top square
      x: -100, y: 1100, width: 50, height: 50, color: 'FireBrick',
    },
    { // top right bottom square
      x: -100, y: 1200, width: 50, height: 50, color: 'DarkOrchid',
    },

    { // Three vertical at leftmost middle
      x: -650, y: 1150, width: 50, height: 150, color: 'DarkKhaki',
    },

    // Adds clear boxes for collision with switch
    {
      x: 296, y: -6, width: 4, height: 6, color: '#FFFFFF00',
    },
    {
      x: 308, y: -6, width: 4, height: 6, color: '#FFFFFF00',
    },
  ],
  specialObjects: [
    {
      x: -540, y: 782, width: 16, height: 16, id: 'screwattack',
    },
    {
      x: -600, y: 884, width: 16, height: 16, id: 'morphball',
    },
    {
      x: 296, y: -16, width: 16, height: 16, id: 'yellowswitch',
    },
    {
      x: 296, y: 500, width: 16, height: 16, id: 'redswitch',
    },
    // There should be fire here. Maybe just give it a huge width and height to check for collision?
    {
      x: -450, y: 798, width: 250, height: 50, col_width: 800, col_height: 500, id: 'fire',
    },
    // There should be fire here.
    {
      x: -450, y: 500, width: 250, height: 50, col_width: 500, col_height: 500, id: 'fire',
    },
  ],
  clouds: [],
};
*/

const addCloud = (color = '#000000') => {
  data.clouds.push(color);
};

module.exports = {
  data,
  addCloud,
};
