class bgRect {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.hSpeed = (height * width) / 150;
    this.vSpeed = 0;
  }
}

let rects = [], specialObjects = [], clouds = [];

const getData = async () => {
  let response = await fetch('/getLevel', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const obj = await response.json();

  if (obj.level) {
    rects = obj.level.layers[0].entities;
    specialObjects = obj.level.layers[1].entities;
  }

  if (obj.level.clouds && obj.level.clouds.length > 0) {
    clouds = [...obj.level.clouds];
  }

}

export { bgRect, rects, specialObjects, clouds, getData };
