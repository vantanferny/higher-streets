export class Input {
  constructor() {
    this.keys = {
      w: false,
      s: false,
      a: false,
      d: false,
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyW":
          this.keys.w = true;
          break;
        case "KeyS":
          this.keys.s = true;
          break;
        case "KeyA":
          this.keys.a = true;
          break;
        case "KeyD":
          this.keys.d = true;
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "KeyW":
          this.keys.w = false;
          break;
        case "KeyS":
          this.keys.s = false;
          break;
        case "KeyA":
          this.keys.a = false;
          break;
        case "KeyD":
          this.keys.d = false;
          break;
      }
    });
  }

  getMoveDirection() {
    let x = 0;
    let z = 0;

    if (this.keys.w) z -= 1;
    if (this.keys.s) z += 1;
    if (this.keys.a) x -= 1;
    if (this.keys.d) x += 1;

    // Normalize diagonal movement
    if (x !== 0 || z !== 0) {
      const length = Math.hypot(x, z);
      x /= length;
      z /= length;
    }

    return { x, z };
  }
}
