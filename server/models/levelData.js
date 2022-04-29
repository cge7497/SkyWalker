// Stores the data of the level.
// I could swap it out on the server, and the player will get the new one upon refresh.
const data = {
  rects: [
    // Main middle room
    {
      x: 284, y: 315, width: 31, height: 30, color: 'blue',
    },
    {
      x: 0, y: 0, width: 30, height: 800, color: 'red',
    },
    {
      x: 0, y: 950, width: 30, height: 502, color: 'blue',
    },
    {
      x: 1000, y: 36, width: 30, height: 1494, color: 'green',
    },
    {
      x: 0, y: 1500, width: 1030, height: 30, color: 'black',
    },
    {
      x: -700, y: 1500, width: 700, height: 29, color: 'yellow',
    },
    {
      x: 0, y: 0, width: 1030, height: 30, color: 'orange',
    },

    // Screw Attack room
    {
      x: -200, y: 801, width: 30, height: 30, color: 'red',
    },
    {
      x: -200, y: 700, width: 200, height: 50, color: 'blue',
    },
    {
      x: -650, y: 700, width: 200, height: 50, color: 'blue',
    },
    {
      x: -200, y: 998, width: 200, height: 50, color: 'blue',
    },
    {
      x: -650, y: 998, width: 200, height: 50, color: 'blue',
    },
    {
      x: -650, y: 750, width: 50, height: 250, color: 'blue',
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
      x: -540, y: 982, width: 16, height: 16, id: 'screwattack',
    },
    {
      x: -600, y: 1484, width: 16, height: 16, id: 'morphball',
    },
    {
      x: 296, y: -16, width: 16, height: 16, id: 'yellowswitch',
    },
    // There should be fire here. Maybe just give it a huge width and height to check for collision?
    {
      x: -450, y: 998, width: 250, height: 50, id: 'fire',
    },
    // There should be fire here.
    {
      x: -450, y: 700, width: 250, height: 50, id: 'fire',
    },
  ],
  clouds: [],
};

const addCloud = (color = '#000000') => {
  data.clouds.push(color);
};

module.exports = {
  data,
  addCloud,
};
