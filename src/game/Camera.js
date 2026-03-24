import * as THREE from "three";

export class GameCamera {
  constructor(camera, player) {
    this.camera = camera;
    this.player = player;
    this.offset = new THREE.Vector3(-6, 5, 8);
  }

  update() {
    const playerPos = this.player.getPosition();
    const desiredPos = new THREE.Vector3(
      playerPos.x + this.offset.x,
      playerPos.y + this.offset.y + 0.8,
      playerPos.z + this.offset.z,
    );

    // Smooth follow
    this.camera.position.lerp(desiredPos, 0.1);
    this.camera.lookAt(playerPos);
  }
}
