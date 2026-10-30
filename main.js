
(() => {
  const game = document.getElementById("game");
  const startScreen = document.getElementById("start-screen");
  const startButton = document.getElementById("start-button");
  const hud = document.getElementById("hud");
  const locationDisplay = document.getElementById("location");
  const messageDisplay = document.getElementById("message");
  const errorMessage = document.getElementById("error-message");

  if (!window.THREE) {
    errorMessage.textContent =
      "Three.js could not load. Check your internet connection or CDN access.";
    startButton.disabled = true;
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x170c16);
  scene.fog = new THREE.Fog(0x170c16, 18, 65);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    150
  );

  camera.position.set(0, 1.7, 7);

  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  game.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffc6d5, 0x321b35, 1.8));

  const mainLight = new THREE.PointLight(0xffb0c4, 2.5, 45);
  mainLight.position.set(0, 7, -10);
  scene.add(mainLight);

  const stomachLight = new THREE.PointLight(0xff8b69, 3, 35);
  stomachLight.position.set(0, 6, -30);
  scene.add(stomachLight);

  const tissueMaterial = new THREE.MeshStandardMaterial({
    color: 0x914052,
    roughness: 0.9,
    side: THREE.DoubleSide
  });

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x71364b,
    roughness: 0.95
  });

  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x502033,
    roughness: 0.9
  });

  const stomachMaterial = new THREE.MeshStandardMaterial({
    color: 0xb64c5d,
    roughness: 0.75
  });

  const heartMaterial = new THREE.MeshStandardMaterial({
    color: 0xc92e48,
    roughness: 0.55
  });

  const lungMaterial = new THREE.MeshStandardMaterial({
    color: 0xa75b78,
    roughness: 0.8
  });

  const liverMaterial = new THREE.MeshStandardMaterial({
    color: 0x8f382f,
    roughness: 0.7
  });

  function box(x, y, z, width, height, depth, material) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );

    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  function sphere(x, y, z, sx, sy, sz, material) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 24),
      material
    );

    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    scene.add(mesh);
    return mesh;
  }

  function sign(text, x, y, z) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;

    const context = canvas.getContext("2d");
    context.fillStyle = "#29121f";
    context.fillRect(0, 0, 512, 128);

    context.strokeStyle = "#e88ba7";
    context.lineWidth = 5;
    context.strokeRect(4, 4, 504, 120);

    context.fillStyle = "#ffffff";
    context.font = "bold 42px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 1),
      new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      })
    );

    mesh.position.set(x, y, z);
    scene.add(mesh);
  }

  function buildMouthAndThroat() {
  
  // LOAD REAL MOUTH MODEL
  const mouthLoader = new THREE.GLTFLoader();

  mouthLoader.load(
    "./mouth.glb",

    function (gltf) {
      const mouthModel = gltf.scene;

      // Measure the original model
      const originalBounds =
        new THREE.Box3().setFromObject(mouthModel);

      const originalSize =
        new THREE.Vector3();

      originalBounds.getSize(originalSize);

      // Resize model to approximately 4.2 units wide
      const targetWidth = 4.2;

      const scale =
        targetWidth / originalSize.x;

      mouthModel.scale.setScalar(scale);

      // Measure again after resizing
      mouthModel.updateMatrixWorld(true);

      const resizedBounds =
        new THREE.Box3().setFromObject(mouthModel);

      const center =
        new THREE.Vector3();

      resizedBounds.getCenter(center);

      // Place the model at the mouth entrance
      mouthModel.position.set(
        -center.x,
        2.8 - center.y,
        1.1 - center.z
      );

      scene.add(mouthModel);

      console.log("Mouth model loaded successfully!");
    },

    undefined,

    function (error) {
      console.error("Could not load mouth.glb:", error);

      errorMessage.textContent =
        "The mouth model could not load. Check mouth.glb.";
    }
  );

  }

  function buildStomach() {
    box(0, -0.15, -29, 16, 0.3, 23, floorMaterial);
    box(0, 8.5, -29, 16, 0.3, 23, tissueMaterial);

    box(-8.1, 4, -29, 0.3, 8, 23, tissueMaterial);
    box(8.1, 4, -29, 0.3, 8, 23, tissueMaterial);

    sphere(-2, 2.5, -29, 2.2, 1.8, 3, stomachMaterial);
    sphere(2.1, 2.2, -31, 2.1, 1.5, 2.5, darkMaterial);
    sphere(0, 3.1, -37, 2.8, 1.1, 1.8, stomachMaterial);

    sign("STOMACH CHAMBER", 0, 6.5, -20);
  }

  function buildOrgans() {
    sphere(-3.1, 5, -26, 1.1, 1.8, 0.8, lungMaterial);
    sphere(-1.1, 5, -26, 1.1, 1.8, 0.8, lungMaterial);
    sphere(0, 3.7, -26, 0.85, 1.05, 0.75, heartMaterial);
    sphere(4.2, 3.2, -25, 2.1, 1.1, 1.5, liverMaterial);

    const vessel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 3, 16),
      heartMaterial
    );

    vessel.position.set(0, 6.3, -26);
    scene.add(vessel);

    sign("LUNGS", -2.1, 7.2, -25);
    sign("HEART", 1.5, 5.7, -25);
    sign("LIVER", 4.2, 5.2, -24);
  }

  function buildDetails() {
    for (let i = 0; i < 35; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        new THREE.MeshBasicMaterial({
          color: 0xffb5c8
        })
      );

      particle.position.set(
        (Math.random() - 0.5) * 13,
        1 + Math.random() * 5,
        -18 - Math.random() * 21
      );

      scene.add(particle);
    }
  }

  buildMouthAndThroat();
  buildStomach();
  buildOrgans();
  buildDetails();

  let started = false;
  let pointerLocked = false;

  const keys = new Set();

  let yaw = 0;
  let pitch = 0;

  const moveSpeed = 5;
  const lookSensitivity = 0.002;

  function updateCameraRotation() {
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  }

  startButton.addEventListener("click", () => {
    started = true;
    startScreen.classList.add("hidden");
    hud.classList.add("visible");
    messageDisplay.textContent = "WASD to move · Mouse to look";

    if (matchMedia("(pointer: fine)").matches) {
      renderer.domElement.requestPointerLock();
    }
  });

  document.addEventListener("pointerlockchange", () => {
    pointerLocked =
      document.pointerLockElement === renderer.domElement;

    if (started && !pointerLocked) {
      messageDisplay.textContent = "Click the game to capture your mouse";
    }
  });

  renderer.domElement.addEventListener("click", () => {
    if (started && matchMedia("(pointer: fine)").matches && !pointerLocked) {
      renderer.domElement.requestPointerLock();
    }
  });

  document.addEventListener("mousemove", (event) => {
    if (!started || !pointerLocked) return;

    yaw -= event.movementX * lookSensitivity;
    pitch -= event.movementY * lookSensitivity;

    pitch = THREE.MathUtils.clamp(
      pitch,
      -Math.PI / 2 + 0.05,
      Math.PI / 2 - 0.05
    );

    updateCameraRotation();
  });

  document.addEventListener("keydown", (event) => {
    keys.add(event.code);
  });

  document.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });

  window.addEventListener("blur", () => {
    keys.clear();
  });

  function updateMovement(delta) {
    if (!started) return;

    const forward = new THREE.Vector3(
      -Math.sin(yaw),
      0,
      -Math.cos(yaw)
    );

    const right = new THREE.Vector3(
      Math.cos(yaw),
      0,
      -Math.sin(yaw)
    );

    const direction = new THREE.Vector3();

    if (keys.has("KeyW") || keys.has("ArrowUp")) {
      direction.add(forward);
    }

    if (keys.has("KeyS") || keys.has("ArrowDown")) {
      direction.sub(forward);
    }

    if (keys.has("KeyD") || keys.has("ArrowRight")) {
      direction.add(right);
    }

    if (keys.has("KeyA") || keys.has("ArrowLeft")) {
      direction.sub(right);
    }

    if (direction.lengthSq() > 0) {
      direction.normalize();

      const nextPosition = camera.position.clone().addScaledVector(
        direction,
        moveSpeed * delta
      );

      nextPosition.y = 1.7;

      const horizontalLimit =
        nextPosition.z > -18 ? 2.05 : 7.4;

      nextPosition.x = THREE.MathUtils.clamp(
        nextPosition.x,
        -horizontalLimit,
        horizontalLimit
      );

      nextPosition.z = THREE.MathUtils.clamp(
        nextPosition.z,
        -40,
        9
      );

      camera.position.copy(nextPosition);
    }

    locationDisplay.textContent =
      camera.position.z > -18
        ? "THROAT"
        : "STOMACH CHAMBER";
  }

  let previousTime = 0;

  function animate(time) {
    requestAnimationFrame(animate);

    const delta = Math.min(
      (time - previousTime) / 1000,
      0.05
    );

    previousTime = time;

    updateMovement(delta);
    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 1.75)
    );
  });
})();
