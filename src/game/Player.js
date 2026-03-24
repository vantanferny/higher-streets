import * as THREE from "three";

export class Player {
  constructor(scene, startX = 0, startZ = 0) {
    this.scene = scene;
    this.speed = 5.5;
    this.radius = 0.5;

    // Create player mesh (red cube with marker)
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.2, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xff3366 }),
    );
    this.mesh.castShadow = true;
    this.mesh.position.set(startX, 0.6, startZ);
    scene.add(this.mesh);

    // Add marker so player is easy to see
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffaa44, emissive: 0xff4400 }),
    );
    marker.position.y = 1.3;
    this.mesh.add(marker);
  }

  move(delta, moveX, moveZ, collisionSystem) {
    let newX = this.mesh.position.x + moveX * this.speed * delta;
    let newZ = this.mesh.position.z + moveZ * this.speed * delta;

    // Check collision for X movement
    if (collisionSystem.canMoveTo(newX, this.mesh.position.z, this.radius)) {
      this.mesh.position.x = newX;
    }

    // Check collision for Z movement
    if (collisionSystem.canMoveTo(this.mesh.position.x, newZ, this.radius)) {
      this.mesh.position.z = newZ;
    }

    // Rotate to face movement direction
    if (moveX !== 0 || moveZ !== 0) {
      this.mesh.rotation.y = Math.atan2(moveX, moveZ);
    }
  }

  getPosition() {
    return this.mesh.position.clone();
  }
}
