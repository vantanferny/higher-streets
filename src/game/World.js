import * as THREE from "three";

export class World {
  constructor(scene) {
    this.scene = scene;
    this.buildings = [];

    this.setupLighting();
    this.setupGround();
    this.createBuildings();
    this.createRoads();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.0);
    mainLight.position.set(15, 25, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    this.scene.add(mainLight);

    const fillLight = new THREE.PointLight(0x88aaff, 0.3);
    fillLight.position.set(0, -2, 0);
    this.scene.add(fillLight);

    // Grid helper for reference
    const gridHelper = new THREE.GridHelper(50, 20, 0x88aaff, 0x335588);
    gridHelper.position.y = -0.05;
    this.scene.add(gridHelper);
  }

  setupGround() {
    const groundGeometry = new THREE.PlaneGeometry(60, 60);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.7,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  addBuilding(x, z, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.3,
    });
    const building = new THREE.Mesh(geometry, material);
    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;
    this.scene.add(building);

    // Store for collision
    this.buildings.push({
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2,
    });
  }

  createBuildings() {
    // Ring of buildings around center
    this.addBuilding(-5, -4, 2.5, 4, 2.5, 0x4a7db4);
    this.addBuilding(5, -4, 2.5, 5, 2.5, 0x5c9c8c);
    this.addBuilding(-5, 4, 2.5, 6, 2.5, 0xc9b6a0);
    this.addBuilding(5, 4, 2.5, 4, 2.5, 0xb87c4f);
    this.addBuilding(0, -6, 3, 7, 3, 0x7c8a9e);
    this.addBuilding(0, 6, 3, 8, 3, 0xc9a03d);
    this.addBuilding(-6, 0, 3, 5, 3, 0x4a7db4);
    this.addBuilding(6, 0, 3, 6, 3, 0x5c9c8c);
    this.addBuilding(-3, -3, 2, 3, 2, 0xaa8866);
    this.addBuilding(3, -3, 2, 4, 2, 0xaa8866);
    this.addBuilding(-3, 3, 2, 5, 2, 0xaa8866);
    this.addBuilding(3, 3, 2, 3, 2, 0xaa8866);
  }

  createRoads() {
    function addRoad(scene, x, z, width, length, rot = 0) {
      const roadGeo = new THREE.PlaneGeometry(width, length);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, -0.08, z);
      road.rotation.z = rot;
      road.receiveShadow = true;
      scene.add(road);
    }

    addRoad(this.scene, 0, -2, 20, 2);
    addRoad(this.scene, 0, 2, 20, 2);
    addRoad(this.scene, -2, 0, 2, 20);
    addRoad(this.scene, 2, 0, 2, 20);
  }

  canMoveTo(x, z, radius) {
    // World bounds
    if (x < -12 || x > 12 || z < -12 || z > 12) return false;

    // Building collisions
    for (let b of this.buildings) {
      if (
        x + radius > b.minX &&
        x - radius < b.maxX &&
        z + radius > b.minZ &&
        z - radius < b.maxZ
      ) {
        return false;
      }
    }
    return true;
  }
}
