class bgRect {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hSpeed = (height * width) / 150;
    this.vSpeed = 0;
    this.values = { color: color };
  }
}

let rects = [], specialObjects = [], clouds = [];

const getData = async () => {
  const storedLevel = localStorage.getItem("level");
  const storedObjects = localStorage.getItem("specialObjects");
  const storedClouds = localStorage.getItem("clouds");
  if (storedLevel && storedLevel.length > 0 && storedObjects && storedObjects.length > 0) {
    rects = JSON.parse(storedLevel);
    specialObjects = JSON.parse(storedObjects);
    // If I want to update clouds each time, just add clouds to the main player data request.
    return;
  }

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

    localStorage.setItem("level", JSON.stringify(rects));
    localStorage.setItem("specialObjects", JSON.stringify(specialObjects));
  }

  if (obj.level.clouds && obj.level.clouds.length > 0) {
    clouds = [...obj.level.clouds];
    localStorage.setItem("clouds", JSON.stringify(clouds));
  }

}

export { bgRect, rects, specialObjects, clouds, getData };
