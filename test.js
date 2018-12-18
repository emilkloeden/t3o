const tello = require("./index");

const tello = new tello();

tello
  .takeoff()
  .turnRight(90) // or turnClockwise(90)
  .turnLeft() // defaults to 90
  .land();

tello.takeoff().emergency();
