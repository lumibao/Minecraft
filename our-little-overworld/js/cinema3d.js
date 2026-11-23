// ============================================================================
//  CINEMA 3D — real WebGL voxel cinematography (Three.js), mobile-first.
//  ----------------------------------------------------------------------------
//  WHAT THIS FILE DOES
//  A complete little film engine, hand-written end to end:
//    · an adaptive quality system (the film re-tunes itself for phones)
//    · a voxel world builder (terrain, path, river, cottage, fences, trees)
//    · two articulated voxel actors (Hatsuki & Van) with a walk cycle,
//      a meet-and-jump beat, an idle/wave beat and facial details
//    · a directed camera (three shots: establishing, tracking, two-shot)
//    · atmosphere systems (box clouds, cherry petals, fireflies, lanterns)
//    · an FPS governor that sheds load before the phone ever stutters
//    · a second lazy 3D scene: the golden beacon finale on a floating isle
//  No models, no sprites, no image files. The only textures are tiny
//  canvas-generated pixel patterns and the actors' floating nametags.
// ============================================================================
import * as THREE from 'three';

/* ============================ QUALITY SYSTEM ============================ */
// The single most important mobile decision: never ask a phone to render
// a desktop scene. We detect the device once, pick a tier, and every
// builder below reads its budgets from here — nothing is hard-coded twice.
const Quality = (() => {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const smallScreen = Math.min(innerWidth, innerHeight) < 520;
  const lowMemory = (navigator.deviceMemory || 4) <= 2;
  const fewCores = (navigator.hardwareConcurrency || 4) <= 4;
  const mobile = coarse || smallScreen || lowMemory || fewCores;
  return {
    mobile,
    tier: mobile ? 'mobile' : 'desktop',
    dprCap: mobile ? 1.5 : 2,          // pixel ratio ceiling
    antialias: !mobile,                // MSAA is expensive on mobile GPUs
    terrainW: mobile ? 26 : 34,        // voxel ground dimensions
    terrainD: mobile ? 16 : 22,
    petalCount: mobile ? 110 : 240,
    fireflyCount: mobile ? 26 : 60,
    flowerCount: mobile ? 26 : 46,
    cloudCount: mobile ? 6 : 9,
    shadow: false,                     // real-time shadows off: lanterns fake it
    governor: { sampleEvery: 30, lowFps: 27, step: 0, minDpr: 1 },
  };
})();

/* ============================ TINY UTILITIES ============================ */
function pixelTexture(top, side, size = 16) {
  // A 16×16 Minecraft-flavoured pixel pattern, painted at runtime.
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
const solid = color => new THREE.MeshLambertMaterial({ color });
function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m;
}
function nametag(text, color = '#ffffff') {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  const g = cv.getContext('2d');
  g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(28, 10, 200, 44);
  g.font = 'bold 30px Courier New, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = color; g.fillText(text, 128, 33);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
  s.scale.set(2.4, 0.6, 1); return s;
}
function voxelHeart(scale = 0.22, color = 0xff4d7e) {
  const rows = ['01100110', '11111111', '11111111', '11111111', '01111110', '00111100', '00011000'];
  const grp = new THREE.Group(); const mat = solid(color);
  rows.forEach((row, y) => [...row].forEach((c, x) => { if (c === '1') grp.add(box(scale, scale, scale, mat, (x - 3.5) * scale, (3 - y) * scale, 0)); }));
  return grp;
}
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = v => Math.min(1, Math.max(0, v));

/* ============================ THE TWO ACTORS ============================ */
// A player is a hierarchy of pivots so the limbs can swing like a real
// Minecraft walk cycle: shoulder pivots for arms, hip pivots for legs,
// a body group for hops/bobs, a head group for looking around.
function makePlayer(opt) {
  const { skin = 0xf2c9a4, hair = 0x3a2a1a, shirt = 0xff8fb3, pants = 0x4a6fa5, name, tag, accessory } = opt;
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const skinM = solid(skin), hairM = solid(hair), shirtM = solid(shirt), pantsM = solid(pants);
  // head + face
  const head = new THREE.Group(); head.position.y = 1.62; body.add(head);
  head.add(box(0.62, 0.62, 0.62, skinM));
  head.add(box(0.66, 0.22, 0.66, hairM, 0, 0.24, 0));
  head.add(box(0.66, 0.5, 0.1, hairM, 0, 0.02, -0.3));
  const eyeM = solid(0x20222b);
  head.add(box(0.09, 0.13, 0.02, eyeM, -0.15, -0.03, 0.32));
  head.add(box(0.09, 0.13, 0.02, eyeM, 0.15, -0.03, 0.32));
  head.add(box(0.16, 0.045, 0.02, solid(0x8a4b3a), 0, -0.2, 0.32));
  head.add(box(0.1, 0.06, 0.02, solid(0xf6a5b8), -0.24, -0.14, 0.32));
  head.add(box(0.1, 0.06, 0.02, solid(0xf6a5b8), 0.24, -0.14, 0.32));
  if (accessory === 'flower') {          // a cherry blossom tucked in her hair
    head.add(box(0.2, 0.08, 0.2, solid(0xff8fb3), 0.3, 0.3, 0.12));
    head.add(box(0.08, 0.05, 0.08, solid(0xffd54a), 0.3, 0.35, 0.12));
  }
  if (accessory === 'cap') {             // his little backwards cap brim
    head.add(box(0.5, 0.08, 0.3, solid(0x2e4057), 0, 0.38, -0.3));
  }
  // torso, arms, legs
  body.add(box(0.56, 0.72, 0.3, shirtM, 0, 1.0, 0));
  body.add(box(0.58, 0.12, 0.32, pantsM, 0, 0.66, 0)); // belt line
  const limb = (mat, w, h, x, y) => {
    const pivot = new THREE.Group(); pivot.position.set(x, y, 0);
    pivot.add(box(w, h, w, mat, 0, -h / 2 + 0.04, 0)); body.add(pivot); return pivot;
  };
  const armL = limb(shirtM, 0.2, 0.68, -0.4, 1.32), armR = limb(shirtM, 0.2, 0.68, 0.4, 1.32);
  const legL = limb(pantsM, 0.22, 0.66, -0.15, 0.66), legR = limb(pantsM, 0.22, 0.66, 0.15, 0.66);
  const tag3d = nametag(name, tag); tag3d.position.y = 2.25; root.add(tag3d);
  return { root, body, head, armL, armR, legL, legR };
}
function poseWalk(p, t, speed = 11) {
  const s = Math.sin(t * speed);
  p.legL.rotation.x = s * 0.75; p.legR.rotation.x = -s * 0.75;
  p.armL.rotation.x = -s * 0.6; p.armR.rotation.x = s * 0.6;
  p.body.position.y = Math.abs(Math.cos(t * speed)) * 0.07;
  p.head.rotation.y = Math.sin(t * 1.8) * 0.08;
}
function poseJump(p) {
  p.armL.rotation.x = p.armR.rotation.x = -2.9;
  p.legL.rotation.x = 0.25; p.legR.rotation.x = -0.2;
}
function poseIdle(p, t, wave = false) {
  p.legL.rotation.x = p.legR.rotation.x = 0;
  p.armL.rotation.x = Math.sin(t * 2) * 0.08;
  p.armR.rotation.x = wave ? -2.6 + Math.sin(t * 7) * 0.35 : Math.cos(t * 2) * 0.08;
  p.body.position.y = Math.sin(t * 2) * 0.03;
}

/* ============================ WORLD BUILDERS ============================ */
function buildTerrain(scene) {
  const W = Quality.terrainW, D = Quality.terrainD;
  const grass = new THREE.MeshLambertMaterial({ map: pixelTexture('#79c94f', '#8B5A38') });
  const dirt = solid(0x8B5A38);
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const tops = new THREE.InstancedMesh(geo, grass, W * D);
  const under = new THREE.InstancedMesh(geo, dirt, W * D);
  const m4 = new THREE.Matrix4(); let i = 0;
  for (let x = 0; x < W; x++) for (let z = 0; z < D; z++) {
    const px = x - W / 2 + 0.5, pz = z - D / 2 + 0.5;
    m4.setPosition(px, -0.5, pz); tops.setMatrixAt(i, m4);
    m4.setPosition(px, -1.5, pz); under.setMatrixAt(i, m4); i++;
  }
  scene.add(tops, under);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(3.4, D), new THREE.MeshLambertMaterial({ map: pixelTexture('#d9b878', '#c2a878') }));
  path.rotation.x = -Math.PI / 2; path.position.y = 0.06; scene.add(path);
  // a little river along the back edge, gently shimmering via opacity in the loop
  const river = new THREE.Mesh(new THREE.PlaneGeometry(W, 2.6), new THREE.MeshPhongMaterial({ color: 0x3aa7d9, transparent: true, opacity: 0.85, shininess: 90 }));
  river.rotation.x = -Math.PI / 2; river.position.set(0, 0.04, -D / 2 + 1.6); scene.add(river);
  return river;
}
function buildTree(x, z, cherry = false, s = 1) {
  const g = new THREE.Group();
  g.add(box(0.45 * s, 2.4 * s, 0.45 * s, solid(0x6b4423), 0, 1.2 * s, 0));
  const a = solid(cherry ? 0xf4a9c4 : 0x2f9e44), b = solid(cherry ? 0xfbc2d6 : 0x26823a);
  g.add(box(2.4 * s, 1.6 * s, 2.4 * s, a, 0, 3.0 * s, 0));
  g.add(box(1.7 * s, 1.1 * s, 1.7 * s, b, 0, 4.1 * s, 0));
  g.add(box(1.0 * s, 0.8 * s, 1.0 * s, a, 0.5 * s, 3.4 * s, 0.4 * s));
  if (cherry) for (let i = 0; i < 5; i++) g.add(box(0.16, 0.16, 0.16, solid(0xfff0f5), (Math.random() - 0.5) * 2.2, 2.6 + Math.random() * 1.6, (Math.random() - 0.5) * 2.2));
  g.position.set(x, 0, z); return g;
}
function buildLantern(x, z, scene) {
  const g = new THREE.Group();
  g.add(box(0.14, 1.3, 0.14, solid(0x3a2a18), 0, 0.65, 0));
  g.add(box(0.5, 0.5, 0.5, new THREE.MeshBasicMaterial({ color: 0xffd98a }), 0, 1.55, 0));
  g.position.set(x, 0, z); scene.add(g);
  const light = new THREE.PointLight(0xffc36b, Quality.mobile ? 9 : 14, 9); light.position.set(x, 1.8, z); scene.add(light);
}
function buildFence(scene) {
  const mat = solid(0xa77849);
  for (let x = -8; x <= 8; x += 2) {
    if (Math.abs(x) < 2) continue;
    [-3.6, 3.6].forEach(z => { const f = new THREE.Group(); f.add(box(0.16, 0.9, 0.16, mat, -0.8, 0.45, 0)); f.add(box(0.16, 0.9, 0.16, mat, 0.8, 0.45, 0)); f.add(box(1.9, 0.14, 0.1, mat, 0, 0.72, 0)); f.position.set(x, 0, z); scene.add(f); });
  }
}
function buildCottage(scene) {
  const g = new THREE.Group(); const wood = solid(0xa77849);
  g.add(box(4.6, 2.6, 3.6, wood, 0, 1.3, 0));
  const roof = box(5.4, 0.35, 4.4, solid(0x7a3f1f), 0, 3.0, 0); roof.rotation.z = 0.0; g.add(roof);
  g.add(box(1.9, 1.4, 0.2, solid(0xffe9a8), -1.2, 1.5, 1.85));
  g.add(box(1.1, 2.0, 0.2, solid(0x6b4423), 1.3, 1.0, 1.85));
  g.add(box(0.7, 1.4, 0.7, solid(0x8a8a8a), 1.6, 3.6, -0.8));
  const glow = new THREE.PointLight(0xffc36b, 12, 11); glow.position.set(0, 1.8, 3); g.add(glow);
  g.position.set(-11.5, 0, -7.5); g.rotation.y = 0.5; scene.add(g);
}
function buildClouds(scene) {
  const grp = new THREE.Group(); const m = solid(0xffffff);
  for (let i = 0; i < Quality.cloudCount; i++) {
    const c = new THREE.Group();
    c.add(box(3 + Math.random() * 3, 0.7, 1.8, m)); c.add(box(1.8, 0.6, 1.4, m, 1.2, 0.5, 0.2));
    c.position.set((Math.random() - 0.5) * 46, 9 + Math.random() * 5, -6 - Math.random() * 16);
    c.userData.speed = 0.14 + Math.random() * 0.2; grp.add(c);
  }
  scene.add(grp); return grp;
}
function buildParticles(scene, count, color, size, area, rise = false) {
  const pos = new Float32Array(count * 3), vel = [];
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * area.x; pos[i * 3 + 1] = Math.random() * area.y; pos[i * 3 + 2] = (Math.random() - 0.5) * area.z;
    vel.push({ x: -0.25 - Math.random() * 0.4, y: rise ? 0.25 + Math.random() * 0.35 : -0.35 - Math.random() * 0.5, p: Math.random() * Math.PI * 2 });
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.95 }));
  scene.add(pts); return { pts, vel, rise, area };
}
function stepParticles(sys, t, dt) {
  const a = sys.pts.geometry.attributes.position;
  for (let i = 0; i < sys.vel.length; i++) {
    const v = sys.vel[i];
    a.array[i * 3] += (v.x + Math.sin(t + v.p) * 0.15) * dt;
    a.array[i * 3 + 1] += v.y * dt;
    if (!sys.rise && a.array[i * 3 + 1] < 0) { a.array[i * 3 + 1] = sys.area.y; a.array[i * 3] = (Math.random() - 0.5) * sys.area.x; }
    if (sys.rise && a.array[i * 3 + 1] > sys.area.y) { a.array[i * 3 + 1] = 0.3; }
  }
  a.needsUpdate = true;
}
function buildFlowers(scene) {
  const colors = [0xff6b9d, 0xffd54a, 0xffffff, 0xc77dff, 0xff9f43];
  for (let i = 0; i < Quality.flowerCount; i++) {
    const x = (Math.random() - 0.5) * 28, z = (Math.random() - 0.5) * 16;
    if (Math.abs(x) < 2.4) continue;
    const g = new THREE.Group();
    g.add(box(0.07, 0.4, 0.07, solid(0x2f9e44), 0, 0.2, 0));
    g.add(box(0.3, 0.18, 0.3, solid(colors[i % colors.length]), 0, 0.46, 0));
    g.position.set(x, 0, z); scene.add(g);
  }
}

/* ============================ CAMERA DIRECTION ============================ */
// Three shots, cross-blended by the film clock:
//   SHOT A (0–2.2s)   wide establishing — the empty world, breathing room
//   SHOT B (2.2–4.2s) tracking — glides sideways as the two players enter
//   SHOT C (4.2s+)    two-shot — settles in front of them for the heart beat
const SHOTS = [
  { pos: new THREE.Vector3(0, 3.4, 17.5), look: new THREE.Vector3(0, 1.8, 0) },
  { pos: new THREE.Vector3(4.5, 2.4, 12.5), look: new THREE.Vector3(0, 1.6, 0) },
  { pos: new THREE.Vector3(0, 2.1, 9.2), look: new THREE.Vector3(0, 1.9, 0) },
];
function directCamera(camera, t) {
  const a = SHOTS[0], b = SHOTS[1], c = SHOTS[2];
  const mix = (s, e, k, from, to) => { const f = new THREE.Vector3(), l = new THREE.Vector3(); f.lerpVectors(from.pos, to.pos, k); l.lerpVectors(from.look, to.look, k); camera.position.copy(f); camera.lookAt(l); };
  if (t < 2.2) { mix(0, 2.2, easeInOut(t / 2.2) * 0.25, a, b); }
  else if (t < 4.2) { const k = easeInOut((t - 2.2) / 2); const f = new THREE.Vector3().lerpVectors(new THREE.Vector3().lerpVectors(a.pos, b.pos, 0.25), b.pos, k); camera.position.copy(f); camera.lookAt(new THREE.Vector3().lerpVectors(new THREE.Vector3().lerpVectors(a.look, b.look, 0.25), b.look, k)); }
  else { const k = easeInOut(clamp01((t - 4.2) / 1.6)); const f = new THREE.Vector3().lerpVectors(b.pos, c.pos, k); f.x += Math.sin(t * 0.4) * 0.25; f.y += Math.sin(t * 0.55) * 0.1; camera.position.copy(f); camera.lookAt(new THREE.Vector3().lerpVectors(b.look, c.look, k)); }
}

/* ============================ FPS GOVERNOR ============================ */
// If the phone cannot hold ~27fps, we quietly step the pixel ratio down
// (and finally thin the petals) instead of letting the film stutter.
function makeGovernor(renderer, petalSys) {
  let frames = 0, acc = 0, level = 0;
  return function govern(dt) {
    if (level >= 3 || dt <= 0) return;
    frames++; acc += dt;
    if (frames >= Quality.governor.sampleEvery) {
      const fps = frames / acc; frames = 0; acc = 0;
      if (fps < Quality.governor.lowFps) {
        level++;
        if (level === 1) renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.15));
        if (level === 2) renderer.setPixelRatio(1);
        if (level === 3 && petalSys) petalSys.pts.visible = false;
      }
    }
  };
}

/* ============================ THE INTRO FILM ============================ */
export function startCinema3D(onPhase) {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return () => {};
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: Quality.antialias, alpha: false, powerPreference: Quality.mobile ? 'low-power' : 'high-performance' });
  } catch (e) { canvas.style.display = 'none'; return () => {}; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, Quality.dprCap));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2a56b);
  scene.fog = new THREE.Fog(0xf2a56b, 18, 46);
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);

  // sunset lighting rig — warm key, cool rim, soft ambient hemisphere
  scene.add(new THREE.HemisphereLight(0xffd9b0, 0x3a5f2a, 1.05));
  const sun = new THREE.DirectionalLight(0xffb37a, 2.0); sun.position.set(-8, 10, 6); scene.add(sun);
  const rim = new THREE.DirectionalLight(0x83c9e8, 0.5); rim.position.set(6, 4, -8); scene.add(rim);
  const sunBall = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe9a8 }));
  sunBall.position.set(-13, 5.5, -22); scene.add(sunBall);

  const river = buildTerrain(scene);
  buildFlowers(scene); buildFence(scene); buildCottage(scene);
  [[-7, -4, 1], [7, -4, 1], [-9, 3, 0], [9, 3, 0], [-5, 7, 1], [5, 7, 1], [-12, 1, 1], [12, -2, 0]]
    .forEach(([x, z, c]) => scene.add(buildTree(x, z, !!c, 0.9 + Math.random() * 0.35)));
  [[-2.3, -3], [2.3, -3], [-2.3, 2], [2.3, 2], [-2.3, 7], [2.3, 7]].forEach(([x, z]) => buildLantern(x, z, scene));
  const clouds = buildClouds(scene);
  const petals = buildParticles(scene, Quality.petalCount, 0xffb7d1, 0.16, { x: 34, y: 11, z: 20 });
  const fireflies = buildParticles(scene, Quality.fireflyCount, 0xffe98a, 0.13, { x: 24, y: 5, z: 14 }, true);
  fireflies.pts.material.opacity = 0; // they fade in for the heart beat

  const hatsuki = makePlayer({ hair: 0x3a2a1a, shirt: 0xff8fb3, pants: 0x4a6fa5, name: '♥ Hatsuki', tag: '#ffb7d1', accessory: 'flower' });
  const van = makePlayer({ hair: 0x1a1a2e, shirt: 0x7ec8e3, pants: 0x2e4057, name: 'Van ♪', tag: '#a8d8ff', accessory: 'cap' });
  hatsuki.root.position.set(10.5, 0, 0.6); hatsuki.root.rotation.y = -Math.PI / 2;
  van.root.position.set(-10.5, 0, -0.6); van.root.rotation.y = Math.PI / 2;
  scene.add(hatsuki.root, van.root);

  const heart = voxelHeart(0.24); heart.position.set(0, 3.6, 0); heart.scale.setScalar(0.001); scene.add(heart);
  const heartGlow = new THREE.PointLight(0xff6b9d, 0, 12); heartGlow.position.set(0, 3.4, 1); scene.add(heartGlow);

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);
  addEventListener('orientationchange', () => setTimeout(resize, 250));

  // Film timeline — 0–4.2s walk-in · 4.2–5.1s meet & jump · 5.1s+ wave/hold
  const clock = new THREE.Clock();
  const govern = makeGovernor(renderer, petals);
  let raf = 0, stopped = false, phase = -1;
  const setPhase = p => { if (p !== phase) { phase = p; onPhase?.(p); } };
  function frame() {
    if (stopped) return; raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    govern(dt);
    if (t < 4.2) {
      setPhase(0); const k = easeOut(clamp01(t / 4.2));
      hatsuki.root.position.x = THREE.MathUtils.lerp(10.5, 1.05, k);
      van.root.position.x = THREE.MathUtils.lerp(-10.5, -1.05, k);
      poseWalk(hatsuki, t); poseWalk(van, t + 0.4);
    } else if (t < 5.1) {
      setPhase(1);
      const j = Math.sin(clamp01((t - 4.2) / 0.9) * Math.PI);
      hatsuki.body.position.y = j * 0.55; van.body.position.y = j * 0.55;
      poseJump(hatsuki); poseJump(van);
      heart.scale.setScalar(THREE.MathUtils.lerp(heart.scale.x, 1, 0.12)); heartGlow.intensity = 18;
      fireflies.pts.material.opacity = Math.min(0.9, fireflies.pts.material.opacity + dt);
    } else {
      setPhase(2);
      hatsuki.body.position.y = van.body.position.y = 0;
      poseIdle(hatsuki, t, false); poseIdle(van, t, true);
      hatsuki.head.rotation.y = Math.sin(t * 1.4) * 0.16; van.head.rotation.y = Math.cos(t * 1.2) * 0.16;
      heart.scale.setScalar(1 + Math.sin(t * 3) * 0.06); heart.rotation.y = Math.sin(t * 0.8) * 0.25;
    }
    const turn = clamp01((t - 4.2) / 0.9);
    hatsuki.root.rotation.y = -Math.PI / 2 + turn * 0.5;
    van.root.rotation.y = Math.PI / 2 - turn * 0.5;
    clouds.children.forEach(c => { c.position.x += c.userData.speed * dt; if (c.position.x > 28) c.position.x = -28; });
    stepParticles(petals, t, dt); stepParticles(fireflies, t, dt);
    river.material.opacity = 0.78 + Math.sin(t * 1.7) * 0.1;
    directCamera(camera, t);
    renderer.render(scene, camera);
  }
  frame();
  return () => { stopped = true; cancelAnimationFrame(raf); removeEventListener('resize', resize); renderer.dispose(); };
}

/* ============================ BEACON FINALE (3D) ============================ */
// Lazy by design: this scene does not exist until her scroll reaches it.
export function initBeacon3D() {
  const canvas = document.getElementById('beacon3d'); if (!canvas) return;
  let started = false;
  const io = new IntersectionObserver(es => {
    if (!es[0].isIntersecting || started) return; started = true; io.disconnect();
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !Quality.mobile, alpha: true, powerPreference: 'low-power' }); }
    catch (e) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, Quality.dprCap));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100); camera.position.set(7.5, 5, 10); camera.lookAt(0, 2.2, 0);
    scene.add(new THREE.HemisphereLight(0x8899ff, 0x1a1030, 0.95));
    const moon = new THREE.DirectionalLight(0xaFC4ff, 0.7); moon.position.set(5, 9, 4); scene.add(moon);
    // floating island, wider in the middle, tapering underneath
    const dirt = new THREE.MeshLambertMaterial({ map: pixelTexture('#6a4a8a', '#2a2140') });
    for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
      if (Math.abs(x) + Math.abs(z) > 4) continue;
      scene.add(box(1, 1, 1, dirt, x, -Math.max(Math.abs(x), Math.abs(z)) * 0.55, z));
    }
    scene.add(buildTree(-2.4, -1.6, true, 0.8)); scene.add(buildTree(2.5, 1.4, true, 0.7));
    buildLantern(-1.8, 2.2, scene); buildLantern(1.9, -2.1, scene);
    // the golden beacon itself — layered plinth, spinning crystal, beam
    const gold = solid(0xc9a227), goldDark = solid(0x8a6d1f);
    scene.add(box(2.2, 0.5, 2.2, gold, 0, 0.55, 0));
    scene.add(box(1.5, 0.5, 1.5, goldDark, 0, 1.05, 0));
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.62), new THREE.MeshBasicMaterial({ color: 0xffd700 }));
    crystal.position.y = 2.1; scene.add(crystal);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 16, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffe66d, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
    beam.position.y = 10; scene.add(beam);
    const glow = new THREE.PointLight(0xffd700, 30, 20); glow.position.y = 2.4; scene.add(glow);
    const heart = voxelHeart(0.15); heart.position.set(0, 4.3, 0); scene.add(heart);
    // starfield + rising gold motes
    const stars = buildParticles(scene, Quality.mobile ? 140 : 260, 0xffffff, 0.13, { x: 48, y: 22, z: 48 }, true);
    stars.vel.forEach(v => { v.y = 0.02; v.x = 0; });
    const motes = buildParticles(scene, Quality.mobile ? 30 : 70, 0xffd97a, 0.12, { x: 5, y: 9, z: 5 }, true);
    function resize() { const w = canvas.clientWidth || 320, h = canvas.clientHeight || 260; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    resize(); addEventListener('resize', resize);
    const clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
      crystal.rotation.y = t * 1.4; crystal.position.y = 2.1 + Math.sin(t * 2) * 0.16;
      beam.material.opacity = 0.4 + Math.sin(t * 2.4) * 0.14; glow.intensity = 26 + Math.sin(t * 2.4) * 8;
      heart.rotation.y = Math.sin(t * 0.9) * 0.3; heart.position.y = 4.3 + Math.sin(t * 1.6) * 0.14;
      stepParticles(motes, t, dt);
      camera.position.x = Math.sin(t * 0.16) * 8.4; camera.position.z = Math.cos(t * 0.16) * 8.4;
      camera.position.y = 5 + Math.sin(t * 0.3) * 0.5; camera.lookAt(0, 2.2, 0);
      renderer.render(scene, camera);
    })();
  }, { threshold: 0.25 });
  io.observe(canvas);
}
