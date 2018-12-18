const dgram = require("dgram");

const handleError = err => console.error(`Uh oh, Error!\n${err.stacktrace}`);

function isPositiveInteger(subject) {
  return Number.isInteger(subject) && subject > 0;
}

function isValidMoveDirection(direction) {
  const validDirections = ["up", "down", "left", "right"];
  return validDirections.includes(direction.toLowercase());
}

function isValidTurnDirection(direction) {
  const validDirections = ["cw", "ccw", "left", "right"];
  return validDirections.includes(direction.toLowercase());
}

class Tello {
  constructor(options = {}) {
    const { host = "192.168.10.1", port = 8889 } = options;
    this._port = port;
    this._host = host;
    this._connection = dgram.createSocket("udp4");
    this._connection.bind(this._port, this._host, () => (this._isReady = true));
  }
}

Tello.prototype._sendCommand = function(command) {
  if (command !== "command") {
    this._connection.send(
      "command",
      0,
      "command".length,
      this._port,
      this._host,
      handleError
    );
  }
  this._connection.send(
    command,
    0,
    command.length,
    this._port,
    this._host,
    handleError
  );
};

Tello.prototype.takeOff = function() {
  if (!this._isReady) {
    throw Error("Tello not ready");
  }
  if (this._isAirborn) {
    throw Error("Tello cannot take off, already airborn.");
  }
  this._sendCommand("takeoff");
  this._isAirborn = true;
  return this;
};

Tello.prototype.land = function() {
  if (!this._isReady) {
    throw Error("Tello not ready");
  }
  if (!this._isAirborn) {
    throw Error("Tello cannot land, currently grounded.");
  }
  this._sendCommand("land");
  this._isAirborn = false;
  return this;
};

Tello.prototype.move = function(direction, distance) {
  if (!this._isReady) {
    throw Error("Tello not ready");
  }
  if (!this._isAirborn) {
    throw Error("Tello cannot move, currently grounded.");
  }
  if (!isValidMoveDirection(direction)) {
    throw Error(`Cannot move in ${direction}, direction is invalid`);
  }
  if (!isPositiveInteger(distance)) {
    throw Error(`Cannot move ${distance}cm. Enter an integer greater than 0.`);
  }

  this._sendCommand(`${direction} ${distance}`);
  return this;
};

Tello.prototype.up = function(distance) {
  this.move("up", distance);
  return this;
};

Tello.prototype.down = function(distance) {
  this.move("down", distance);
  return this;
};

Tello.prototype.left = function(distance) {
  this.move("left", distance);
  return this;
};

Tello.prototype.right = function(distance) {
  this.move("right", distance);
  return this;
};

Tello.prototype.turn = function(direction, degrees = 90) {
  if (!this._isReady) {
    throw Error("Tello not ready");
  }
  if (!this._isAirborn) {
    throw Error("Tello cannot turn, currently grounded.");
  }
  if (!isValidTurnDirection(direction)) {
    throw Error(`Cannot turn ${direction}, direction is invalid`);
  }
  if (!isPositiveInteger(degrees)) {
    throw Error(
      `Cannot move ${degrees} degrees. Enter an integer greater than 0.`
    );
  }

  this._sendCommand(`${direction} ${degrees}`);
  return this;
};

Tello.prototype.turnLeft = function(degrees) {
  return this.turn("left", degrees);
};

Tello.prototype.turnRight = function(degrees) {
  return this.turn("right", degrees);
};

Tello.prototype.emergency = function() {
  this._connection.send(
    command,
    0,
    command.length,
    this._port,
    this._host,
    handleError
  );
  this._isAirborn = false;
  return this;
};

module.exports = Tello;
