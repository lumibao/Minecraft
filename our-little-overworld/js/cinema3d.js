// ============================================================================
//  CINEMA 3D — real WebGL voxel cinematography (Three.js)
//  A proper 3D intro film: voxel terrain, cherry trees, lantern light, and
//  two blocky players — Hatsuki & Van — who walk toward each other, meet in
//  the middle of the world, and jump together under a voxel heart.
//  A second lazy-loaded 3D scene renders the golden beacon in the finale.
//  Everything is geometry built in code. No models, no sprites, no images
//  (the only textures are tiny canvas-generated pixel patterns + nametags).
// ============================================================================
import * as THREE from 'three';

/* ---------------------------------------------------------------- helpers */
function pixelTexture(top, side, size = 16) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const g = cv.getContext('2d');
  g.fillStyle = side; g.fillRect(0, 0, size, size);
  g.fillStyle = top; g.fillRect(0, 0, size, size * 0.32);
  for (let i = 0; i < 26; i++) {
    g.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.08)';
    g.fillRect((Math.random() * size) | 0, (Math.random() * size) | 0, 2, 2);
  }
  const t = new THREE.CanvasTexture(cv); t.magFilter = THREE.NearestFilter; return t;
}
function solid(color) { return new THREE.MeshLambertMaterial({ color }); }
function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); return m;
}
function nametag(text, color = '#ffffff') {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const g = cv.getContext('2d');
  g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(28, 10, 200, 44);
  g.font = 'bold 30px Courier New, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = color; g.fillText(text, 128, 33);
  const t = new THREE.CanvasTexture(cv);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
  s.scale.set(2.4, 0.6, 1); return s;
}
function voxelHeart(scale = 0.22, mat = solid(0xff4d7e)) {
  // classic 2D heart raster, extruded one block deep
  const rows = ['01100110', '11111111', '11111111', '11111111', '01111110', '00111100', '00011000'];
  const grp = new THREE.Group();
  rows.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '1') grp.add(box(scale, scale, scale, mat, (x - 3.5) * scale, (3 - y) * scale, 0));
  }));
  return grp;
}

/* ---------------------------------------------------------------- players */
function makePlayer({ skin = 0xf2c9a4, hair = 0x3a2a1a, shirt = 0xff8fb3, pants = 0x4a6fa5, name, tag }) {
  const root = new THREE.Group();              // world position / facing
  const body = new THREE.Group(); root.add(body); // hop / bob lives here
  const skinM = solid(skin), hairM = solid(hair), shirtM = solid(shirt), pantsM = solid(pants);
  // head: cube with hair cap + face
  const head = new THREE.Group(); head.position.y = 1.62; body.add(head);
  head.add(box(0.62, 0.62, 0.62, skinM));
  head.add(box(0.66, 0.22, 0.66, hairM, 0, 0.24, 0));                 // hair top
  head.add(box(0.66, 0.5, 0.1, hairM, 0, 0.02, -0.3));                // hair back
  const eyeM = solid(0x20222b);
  head.add(box(0.09, 0.13, 0.02, eyeM, -0.15, -0.03, 0.32));
  head.add(box(0.09, 0.13, 0.02, eyeM, 0.15, -0.03, 0.32));
  head.add(box(0.16, 0.045, 0.02, solid(0x8a4b3a), 0, -0.2, 0.32));   // mouth
  head.add(box(0.1, 0.06, 0.02, solid(0xf6a5b8), -0.24, -0.14, 0.32)); // blush L
  head.add(box(0.1, 0.06, 0.02, solid(0xf6a5b8), 0.24, -0.14, 0.32));  // blush R
  // torso + arms (pivot at shoulder) + legs (pivot at hip)
  body.add(box(0.56, 0.72, 0.3, shirtM, 0, 1.0, 0));
  const limb = (mat, w, h, x, y) => {
    const pivot = new THREE.Group(); pivot.position.set(x, y, 0);
    const m = box(w, h, w, mat, 0, -h / 2 + 0.04, 0); pivot.add(m); body.add(pivot); return pivot;
  };
  const armL = limb(skinM, 0.2, 0.68, -0.4, 1.32), armR = limb(skinM, 0.2, 0.68, 0.4, 1.32);
  const legL = limb(pantsM, 0.22, 0.66, -0.15, 0.66), legR = limb(pantsM, 0.22, 0.66, 0.15, 0.66);
  armL.children[0].material = shirtM; armR.children[0].material = shirtM;
  const tag3d = nametag(name, tag); tag3d.position.y = 2.25; root.add(tag3d);
  return { root, body, head, armL, armR, legL, legR };
}
function poseWalk(p, t, speed = 11) {
  const s = Math.sin(t * speed);
  p.legL.rotation.x = s * 0.75; p.legR.rotation.x = -s * 0.75;
  p.armL.rotation.x = -s * 0.6; p.armR.rotation.x = s * 0.6;
  p.body.position.y = Math.abs(Math.cos(t * speed)) * 0.07;
}
function poseIdle(p, t, wave = false) {
  p.legL.rotation.x = p.legR.rotation.x = 0;
  p.armL.rotation.x = Math.sin(t * 2) * 0.08;
  p.armR.rotation.x = wave ? -2.6 + Math.sin(t * 7) * 0.35 : Math.cos(t * 2) * 0.08;
  p.body.position.y = Math.sin(t * 2) * 0.03;
}

/* ---------------------------------------------------------------- scenery */
function buildTerrain(scene, W = 34, D = 22) {
  const grass = new THREE.MeshLambertMaterial({ map: pixelTexture('#79c94f', '#8B5A38') });
  const dirt = solid(0x8B5A38);
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const tops = new THREE.InstancedMesh(geo, grass, W * D);
  const under = new THREE.InstancedMesh(geo, dirt, W * D);
  const m4 = new THREE.Matrix4(); let i = 0;
  for (let x = 0; x < W; x++) for (let z = 0; z < D; z++) {
    const px = x - W / 2 + 0.5, pz = z - D / 2 + 0.5;
    const lift = (Math.abs(px) < 2.2) ? 0.02 : 0; // gentle path flattening
    m4.setPosition(px, -0.5 + lift, pz); tops.setMatrixAt(i, m4);
    m4.setPosition(px, -1.5 + lift, pz); under.setMatrixAt(i, m4); i++;
  }
  scene.add(tops, under);
  // golden path down the middle
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3.4, D), new THREE.MeshLambertMaterial({ map: pixelTexture('#d9b878', '#c2a878') }));
  path.rotation.x = -Math.PI / 2; path.position.y = 0.06; scene.add(path);
}
function buildTree(x, z, cherry = false, s = 1) {
  const g = new THREE.Group();
  g.add(box(0.45 * s, 2.4 * s, 0.45 * s, solid(0x6b4423), 0, 1.2 * s, 0));
  const leafM = solid(cherry ? 0xf4a9c4 : 0x2f9e44), leafM2 = solid(cherry ? 0xfbc2d6 : 0x26823a);
  g.add(box(2.4 * s, 1.6 * s, 2.4 * s, leafM, 0, 3.0 * s, 0));
  g.add(box(1.7 * s, 1.1 * s, 1.7 * s, leafM2, 0, 4.1 * s, 0));
  g.add(box(1.0 * s, 0.8 * s, 1.0 * s, leafM, 0.5 * s, 3.4 * s, 0.4 * s));
  g.position.set(x, 0, z); return g;
}
function buildLantern(x, z, scene) {
  const g = new THREE.Group();
  g.add(box(0.14, 1.3, 0.14, solid(0x3a2a18), 0, 0.65, 0));
  const lamp = box(0.5, 0.5, 0.5, new THREE.MeshBasicMaterial({ color: 0xffd98a }), 0, 1.55, 0);
  g.add(lamp); g.position.set(x, 0, z); scene.add(g);
  const light = new THREE.PointLight(0xffc36b, 14, 9); light.position.set(x, 1.8, z); scene.add(light);
}
function buildClouds(scene, n = 9) {
  const grp = new THREE.Group(); const m = solid(0xffffff);
  for (let i = 0; i < n; i++) {
    const c = new THREE.Group();
    c.add(box(3 + Math.random() * 3, 0.7, 1.8, m));
    c.add(box(1.8, 0.6, 1.4, m, 1.2, 0.5, 0.2));
    c.position.set((Math.random() - 0.5) * 46, 9 + Math.random() * 5, -6 - Math.random() * 16);
    c.userData.speed = 0.14 + Math.random() * 0.2; grp.add(c);
  }
  scene.add(grp); return grp;
}
function buildPetals(scene, n = 240) {
  const pos = new Float32Array(n * 3), vel = [];
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 36; pos[i * 3 + 1] = Math.random() * 12; pos[i * 3 + 2] = (Math.random() - 0.5) * 22;
    vel.push({ x: -0.25 - Math.random() * 0.4, y: -0.35 - Math.random() * 0.5, p: Math.random() * Math.PI * 2 });
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffb7d1, size: 0.16, transparent: true, opacity: 0.95 }));
  scene.add(pts); return { pts, vel };
}
function buildFlowers(scene) {
  const colors = [0xff6b9d, 0xffd54a, 0xffffff, 0xc77dff, 0xff9f43];
  for (let i = 0; i < 46; i++) {
    const x = (Math.random() - 0.5) * 30, z = (Math.random() - 0.5) * 18;
    if (Math.abs(x) < 2.4) continue;
    const g = new THREE.Group();
    g.add(box(0.07, 0.4, 0.07, solid(0x2f9e44), 0, 0.2, 0));
    g.add(box(0.3, 0.18, 0.3, solid(colors[i % colors.length]), 0, 0.46, 0));
    g.position.set(x, 0, z); scene.add(g);
  }
}

/* ---------------------------------------------------------------- intro film */
export function startCinema3D(onPhase) {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return () => {};
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch (e) { canvas.style.display = 'none'; return () => {}; }
  const DPR = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2a56b);
  scene.fog = new THREE.Fog(0xf2a56b, 18, 46);
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);

  // sunset lighting rig
  scene.add(new THREE.HemisphereLight(0xffd9b0, 0x3a5f2a, 1.05));
  const sun = new THREE.DirectionalLight(0xffb37a, 2.0); sun.position.set(-8, 10, 6); scene.add(sun);
  const rim = new THREE.DirectionalLight(0x83c9e8, 0.5); rim.position.set(6, 4, -8); scene.add(rim);
  const sunBall = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe9a8 }));
  sunBall.position.set(-13, 5.5, -22); scene.add(sunBall);

  buildTerrain(scene); buildFlowers(scene);
  [[-7, -4, 1], [7, -4, 1], [-9, 3, 0], [9, 3, 0], [-5, 7, 1], [5, 7, 1]].forEach(([x, z, c]) => scene.add(buildTree(x, z, !!c, 0.95 + Math.random() * 0.3)));
  [[-2.3, -3], [2.3, -3], [-2.3, 2], [2.3, 2], [-2.3, 7], [2.3, 7]].forEach(([x, z]) => buildLantern(x, z, scene));
  const clouds = buildClouds(scene);
  const petals = buildPetals(scene);

  // the two players
  const hatsuki = makePlayer({ hair: 0x3a2a1a, shirt: 0xff8fb3, pants: 0x4a6fa5, name: '♥ Hatsuki', tag: '#ffb7d1' });
  const van = makePlayer({ hair: 0x1a1a2e, shirt: 0x7ec8e3, pants: 0x2e4057, name: 'Van ♪', tag: '#a8d8ff' });
  hatsuki.root.position.set(10.5, 0, 0.6); hatsuki.root.rotation.y = -Math.PI / 2;
  van.root.position.set(-10.5, 0, -0.6); van.root.rotation.y = Math.PI / 2;
  scene.add(hatsuki.root, van.root);

  const heart = voxelHeart(0.24); heart.position.set(0, 3.6, 0); heart.scale.setScalar(0.001); scene.add(heart);
  const heartGlow = new THREE.PointLight(0xff6b9d, 0, 12); heartGlow.position.set(0, 3.4, 1); scene.add(heartGlow);

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);

  // timeline: 0–4.2s walk-in · 4.2–5s meet/jump · 5s+ wave & hold
  const clock = new THREE.Clock(); let raf = 0, stopped = false, phase = -1;
  const ease = t => 1 - Math.pow(1 - t, 3);
  function setPhase(p) { if (p !== phase) { phase = p; onPhase?.(p); } }
  function frame() {
    if (stopped) return; raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    // --- actors
    if (t < 4.2) {
      setPhase(0); const k = ease(Math.min(1, t / 4.2));
      hatsuki.root.position.x = THREE.MathUtils.lerp(10.5, 1.05, k);
      van.root.position.x = THREE.MathUtils.lerp(-10.5, -1.05, k);
      poseWalk(hatsuki, t); poseWalk(van, t + 0.4);
      heart.scale.setScalar(0.001);
    } else if (t < 5.1) {
      setPhase(1);
      const j = Math.sin(Math.min(1, (t - 4.2) / 0.9) * Math.PI);
      hatsuki.body.position.y = j * 0.55; van.body.position.y = j * 0.55;
      hatsuki.armL.rotation.x = hatsuki.armR.rotation.x = -2.9;
      van.armL.rotation.x = van.armR.rotation.x = -2.9;
      heart.scale.setScalar(THREE.MathUtils.lerp(heart.scale.x, 1, 0.12)); heartGlow.intensity = 18;
    } else {
      setPhase(2);
      hatsuki.body.position.y = van.body.position.y = 0;
      poseIdle(hatsuki, t, false); poseIdle(van, t, true);
      hatsuki.head.rotation.y = Math.sin(t * 1.4) * 0.16; van.head.rotation.y = Math.cos(t * 1.2) * 0.16;
      heart.scale.setScalar(1 + Math.sin(t * 3) * 0.06); heart.rotation.y = Math.sin(t * 0.8) * 0.25;
    }
    hatsuki.root.rotation.y = -Math.PI / 2 + Math.min(1, Math.max(0, (t - 4.2))) * 0.5;
    van.root.rotation.y = Math.PI / 2 - Math.min(1, Math.max(0, (t - 4.2))) * 0.5;
    // --- environment life
    clouds.children.forEach(c => { c.position.x += c.userData.speed * dt; if (c.position.x > 28) c.position.x = -28; });
    const arr = petals.pts.geometry.attributes.position;
    for (let i = 0; i < petals.vel.length; i++) {
      const v = petals.vel[i];
      arr.array[i * 3] += (v.x + Math.sin(t + v.p) * 0.15) * dt;
      arr.array[i * 3 + 1] += v.y * dt;
      if (arr.array[i * 3 + 1] < 0) { arr.array[i * 3 + 1] = 11; arr.array[i * 3] = (Math.random() - 0.5) * 36; }
    }
    arr.needsUpdate = true;
    // --- cinematic camera: slow dolly-in, then a gentle arc
    const dolly = ease(Math.min(1, t / 6));
    camera.position.set(Math.sin(t * 0.11) * 1.6, 2.4 + Math.sin(t * 0.2) * 0.25, THREE.MathUtils.lerp(15.5, 10.5, dolly));
    camera.lookAt(0, 1.7, 0);
    renderer.render(scene, camera);
  }
  frame();
  return () => { stopped = true; cancelAnimationFrame(raf); removeEventListener('resize', resize); renderer.dispose(); };
}

/* ---------------------------------------------------------------- beacon 3D */
export function initBeacon3D() {
  const canvas = document.getElementById('beacon3d'); if (!canvas) return;
  let started = false;
  const io = new IntersectionObserver(es => {
    if (!es[0].isIntersecting || started) return; started = true; io.disconnect();
    let renderer; try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100); camera.position.set(7.5, 5, 10); camera.lookAt(0, 2.2, 0);
    scene.add(new THREE.HemisphereLight(0x8899ff, 0x1a1030, 0.9));
    // floating island
    const dirt = new THREE.MeshLambertMaterial({ map: pixelTexture('#6a4a8a', '#2a2140') });
    for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
      if (Math.abs(x) + Math.abs(z) > 4) continue;
      const d = Math.max(Math.abs(x), Math.abs(z));
      scene.add(box(1, 1, 1, dirt, x, -d * 0.55, z));
    }
    scene.add(buildTree(-2.4, -1.6, true, 0.8)); scene.add(buildTree(2.5, 1.4, true, 0.7));
    // golden beacon: layered base, crystal, beam
    const gold = solid(0xc9a227);
    scene.add(box(2.2, 0.5, 2.2, gold, 0, 0.55, 0));
    scene.add(box(1.5, 0.5, 1.5, gold, 0, 1.05, 0));
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.62), new THREE.MeshBasicMaterial({ color: 0xffd700 }));
    crystal.position.y = 2.1; scene.add(crystal);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 16, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffe66d, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
    beam.position.y = 10; scene.add(beam);
    const glow = new THREE.PointLight(0xffd700, 30, 20); glow.position.y = 2.4; scene.add(glow);
    const heart = voxelHeart(0.15); heart.position.set(0, 4.3, 0); scene.add(heart);
    // stars
    const n = 260, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 50; pos[i * 3 + 1] = Math.random() * 24 - 3; pos[i * 3 + 2] = (Math.random() - 0.5) * 50; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.14 })));
    function resize() { const w = canvas.clientWidth || 320, h = canvas.clientHeight || 260; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    resize(); addEventListener('resize', resize);
    const clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      const t = clock.elapsedTime;
      crystal.rotation.y = t * 1.4; crystal.position.y = 2.1 + Math.sin(t * 2) * 0.16;
      beam.material.opacity = 0.4 + Math.sin(t * 2.4) * 0.14; glow.intensity = 26 + Math.sin(t * 2.4) * 8;
      heart.rotation.y = Math.sin(t * 0.9) * 0.3; heart.position.y = 4.3 + Math.sin(t * 1.6) * 0.14;
      camera.position.x = Math.sin(t * 0.16) * 8.4; camera.position.z = Math.cos(t * 0.16) * 8.4; camera.lookAt(0, 2.2, 0);
      renderer.render(scene, camera);
    })();
  }, { threshold: 0.25 });
  io.observe(canvas);
}
