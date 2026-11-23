import * as THREE from 'three';
import {CONFIG} from '../data/config.js';
import {MEMORIES} from '../data/memories.js';
import {LOCATIONS} from '../data/locations.js';
import {World} from './world.js';
import {Player} from './player.js';
import {Controls} from './controls.js';
import {Interactions} from './interactions.js';
import {Achievements} from './achievements.js';
import {Inventory} from './inventory.js';
import {AudioSys} from './audio.js';
import {loadSave,storeSave,clearSave,hasSave,defaultSave} from './save-system.js';
import {showPanel,toast,showMessage} from './dialogue.js';

let save=loadSave();
const $=id=>document.getElementById(id);
let scene,camera,renderer,world,player,controls,interactions,achieve,inventory,audio=new AudioSys(),clock=new THREE.Clock();
let started=false,paused=false,timeOfDay=CONFIG.startTimeOfDay,sun,moonLight,hemi,skyMat,finaleDone=false,cinematic=false,cineT=0;
audio.enabled=save.settings.sfx;audio.musicOn=save.settings.music;

function setBar(p,t){$('bar').style.width=p+'%';if(t)$('load-text').textContent=t}
async function init(){
 setBar(15,'Planting cherry blossoms… 🌸');
 scene=new THREE.Scene();scene.fog=new THREE.Fog(0x87bfe8,40,160);
 camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,0.1,600);
 renderer=new THREE.WebGLRenderer({canvas:$('game-canvas'),antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,save.settings.quality=='low'?1:2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=save.settings.quality=='high';renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 hemi=new THREE.HemisphereLight(0xbfe3ff,0x3a5f2a,0.9);scene.add(hemi);
 sun=new THREE.DirectionalLight(0xffe3a3,1.6);sun.position.set(40,60,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-60;sun.shadow.camera.right=60;sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;scene.add(sun);
 moonLight=new THREE.PointLight(0x8899ff,0,200);scene.add(moonLight);
 skyMat=new THREE.MeshBasicMaterial({color:0x87bfe8,side:THREE.BackSide});scene.add(new THREE.Mesh(new THREE.SphereGeometry(290,16,12),skyMat));
 setBar(40,'Building 7 locations… 🏠');
 world=new World(scene,save);player=new Player(scene,world);
 if(save.pos){player.pos.set(save.pos.x,save.pos.y,save.pos.z)}
 controls=new Controls(document.body);
 controls.cb=(dx,dy)=>{player.yaw-=dx*0.005;player.pitch=THREE.MathUtils.clamp(player.pitch-dy*0.005,-1.3,1.3)};
 controls.bindButtons(()=>interact(),()=>{},()=>togglePause(),()=>showInventory());
 achieve=new Achievements(save,a=>{toast(a.title,a.desc,a.icon);audio.achieve();persist()});
 inventory=new Inventory(save);inventory.render($('hotbar'));
 interactions=new Interactions(world,player,handleInteract);
 setBar(70,'Placing 33 flowers & 33 books…');
 setupUI();updateQuest();checkLocation(true);
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
 addEventListener('keydown',e=>{if(!started||paused)return;if(e.code=='KeyE')interact();if(e.code=='KeyI')showInventory();if(e.code=='Escape')togglePause()});
 // pointer lock desktop look
 $('game-canvas').addEventListener('click',()=>{if(started&&!paused&&matchMedia('(pointer:fine)').matches)document.body.requestPointerLock()});
 document.addEventListener('mousemove',e=>{if(document.pointerLockElement&&started&&!paused){player.yaw-=e.movementX*0.0024;player.pitch=THREE.MathUtils.clamp(player.pitch-e.movementY*0.0024,-1.3,1.3)}});
 setBar(100,'World ready! 💛');setTimeout(()=>{$('loading').classList.add('hidden');$('menu').classList.remove('hidden');if(!hasSave())$('btn-continue').style.display='none'},400);
 renderer.setAnimationLoop(loop);
}
function persist(){save.pos={x:player.pos.x,y:player.pos.y,z:player.pos.z};storeSave(save);inventory.render($('hotbar'));updateQuest()}
function start(newGame){audio.init();audio.startMusic();if(newGame){let settings=save.settings;clearSave();save=defaultSave();save.settings=settings;location.reload();return}started=true;$('menu').classList.add('hidden');$('hud').classList.remove('hidden');if(innerWidth<=820)$('mobile').classList.remove('hidden');achieve.unlock('first-spawn');showMessage(`<b class="pixel">Welcome to Our Little World, Baby. 💛</b><br>${CONFIG.mainQuote}<br><small>Follow the quest tracker (top-left). Press <b>E</b> to interact.</small>`,9000);persist()}
function togglePause(){if(!started)return;paused=!paused;$('pause').classList.toggle('hidden',!paused);if(document.pointerLockElement)document.exitPointerLock()}
function interact(){if(interactions)interactions.trigger()}
function handleInteract(it){
 if(it.type=='intro'){save.intro=true;achieve.unlock('beginning');audio.book();showPanel('🌱 OUR FIRST SPAWN',`<p>${CONFIG.introText}</p><p style="margin-top:10px">${CONFIG.mainQuote}</p><p style="margin-top:10px">Your quest: explore all 7 locations. Collect <b>33 flowers</b> 🌸, read <b>33 books</b> 📚, open <b>5 chests</b> 🧰.</p>`);persist()}
 else if(it.type=='flower'){let m=MEMORIES[it.month-1];if(!save.flowers.includes(it.month))save.flowers.push(it.month);let g=world.flowers.get(it.month);if(g)g.visible=false;interactions.removeById(it.id);audio.collect();showMessage(`🌸 <b>Flower ${it.month}/33 — ${m.title}</b><br>${m.message}`,7000);if(save.flowers.length>=33){achieve.unlock('flowers33');showPanel('🌸 33 FLOWERS COMPLETE!',`<p>${MEMORIES[32].message}</p><p>Golden Flower added to your inventory 🗝️. The Final Beacon is closer than ever.</p>`)}persist()}
 else if(it.type=='book'){let m=MEMORIES[it.month-1];if(!save.books.includes(it.month))save.books.push(it.month);audio.book();showPanel(`📖 Chapter ${it.month} / 33 — ${m.title}`,escapeHtml(m.message)+`<p style="margin-top:12px;opacity:.7"><i>Date: ${m.date} — edit in data/memories.js</i></p>`,true);if(save.books.length>=33)achieve.unlock('storyteller');persist()}
 else if(it.type=='chest'){if(!save.chests.includes(it.chest.id))save.chests.push(it.chest.id);audio.chest();let m=world.chests.get(it.chest.id);if(m)m.material=world.mat('#6b4423','#57371c');interactions.removeById(it.id);showPanel('🧰 '+it.chest.title,`<p>${it.chest.body}</p>`);if(save.chests.length>=5)achieve.unlock('keeper');persist()}
 else if(it.type=='photo'){showPanel('🖼️ Photo Frame',`<p>[YOUR PHOTO HERE]</p><p>Put a photo in <code>assets/images/</code> and edit this caption in <code>js/world.js</code> (search "photo-"). Never fake a memory — use your real pictures together. 💛</p>`)}
 else if(it.type=='room'){if(!save.homeZones.includes(it.room))save.homeZones.push(it.room);showMessage(`🏠 <b>${it.room}</b> — ${roomText(it.room)}<br><small>Zones visited: ${save.homeZones.length}/4</small>`);if(save.homeZones.length>=4)achieve.unlock('home-is-you');persist()}
 else if(it.type=='homeLetter'){audio.book();showPanel('💌 A Letter at Home',`<p>[EDIT ME in js/main.js] Home was never a place. It was always a person — and that person is you.</p>`,true)}
 else if(it.type=='letter'){save.letter=true;achieve.unlock('stars');audio.book();showPanel('📜 BOOK & QUILL — For You, Baby',escapeHtml(CONFIG.loveLetter),true);persist()}
 else if(it.type=='beacon'){tryBeacon()}
 updateQuest();
}
function roomText(r){return{Kitchen:'Where we’d cook, laugh, and steal bites. [EDIT ME]','Bedroom':'Our safe place to rest after every adventure. [EDIT ME]','Living Room':'Movie nights, kwentuhan, and quiet moments. [EDIT ME]','Balcony':'Coffee, sunsets, and future plans. [EDIT ME]'}[r]||''}
function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br>')}
function visitedCount(){return save.visited.length}
function tryBeacon(){
 let missing=[];if(!save.intro)missing.push('Read the First Spawn sign');if(save.visited.length<6)missing.push(`Visit all locations (${save.visited.length}/7 — check Quest Tracker)`);if(!save.letter)missing.push('Read the Love Letter at the Observatory');
 if(missing.length){showPanel('🔒 The Beacon Is Not Ready Yet',`<p>The golden beacon hums softly… it will light when your adventure is complete:</p><ul style="margin:12px 0 0 20px;line-height:1.8">${missing.map(m=>`<li>${m}</li>`).join('')}</ul><p style="margin-top:10px">Flowers: ${save.flowers.length}/33 🌸 · Books: ${save.books.length}/33 📚 · Chests: ${save.chests.length}/5 🧰 (bonus achievements!)</p>`);return}
 save.beacon=true;achieve.unlock('forever');audio.beacon();audio.startMusic();cinematic=true;cineT=0;player.avatar.visible=true;persist();
 setTimeout(()=>{$('finale').classList.remove('hidden');finaleDone=true},2600);
}
let lastLoc='';
function checkLocation(first=false){let best=null,bd=1e9;for(let l of LOCATIONS){let d=Math.hypot(player.pos.x-l.pos.x,player.pos.z-l.pos.z);if(d<bd){bd=d;best=l}}if(best&&bd<26&&!save.visited.includes(best.id)){save.visited.push(best.id);showMessage(`📍 <b>${best.num}. ${best.name}</b><br>${best.desc}<br><small>Locations visited: ${save.visited.length}/7</small>`,5000);if(!first)persist()}return best}
function updateQuest(){let q=$('quest');if(!q)return;let next=LOCATIONS.find(l=>!save.visited.includes(l.id));let obj=save.beacon?'✨ Adventure complete — Happy 33rd, Baby!':(!save.intro?'Read the sign at Our First Spawn 📖':(next?`Explore: ${next.name} 📍`:'Activate the Final Beacon ✨'));
 q.innerHTML=`<b>⭐ QUEST</b><br>${obj}<hr style="opacity:.3;margin:6px 0">🌸 Flowers ${save.flowers.length}/33 · 📚 Books ${save.books.length}/33<br>🧰 Chests ${save.chests.length}/5 · 🏆 ${save.achievements.length}/8 · 📍 ${save.visited.length}/7`}
function showInventory(){let c=inventory.counts();showPanel('🎒 INVENTORY',`<div class="grid">${[['🌸 Cherry Blossom',c.flowers+' / 33'],['📖 Memory Book',c.books+' / 33'],['💎 Memory Fragment',c.fragments+' / 5'],['🗝️ Golden Key',c.keys?'Unlocked after 33 flowers':'Locked — collect 33 flowers'],['💛 Special Heart',c.hearts?'You Are My Home':'Locked — final beacon'],['📜 Love Letter',save.letter?'Read at the Observatory':'Find it Beyond the Stars']].map(x=>`<div class="card"><div style="font-size:28px">${x[0].split(' ')[0]}</div><b>${x[0].slice(2)}</b><br><small>${x[1]}</small></div>`).join('')}</div>`)}
function showAchievements(){showPanel('🏆 ACHIEVEMENTS',`<div class="grid">${achieve.list().map(a=>`<div class="card ${save.achievements.includes(a.id)?'':'locked'}"><div style="font-size:30px">${a.icon}</div><b>${a.title}</b><br><small>${a.desc}</small><br><small>${save.achievements.includes(a.id)?'✅ Unlocked':'🔒 Locked'}</small></div>`).join('')}</div>`)}
function setupUI(){
 $('btn-start').onclick=()=>start(false);$('btn-continue').onclick=()=>start(false);$('btn-how').onclick=()=>showPanel('🎮 HOW TO PLAY',`<p><b>Desktop:</b> WASD move · Mouse look (click world to lock) · <b>E</b> interact · Shift sprint · Space jump · I inventory · Esc pause</p><p style="margin-top:8px"><b>Mobile:</b> Left joystick move · Drag right side to look · ✋ interact · ⬆ jump</p><p style="margin-top:8px">Goal: visit 7 locations, read the letter, then light the Final Beacon. Flowers/books/chests unlock bonus achievements. Progress auto-saves 💾</p>`);
 $('btn-settings').onclick=()=>showSettings();$('btn-credits').onclick=()=>showPanel('💛 CREDITS',`<p><b>${CONFIG.gameTitle}</b><br>${CONFIG.subtitle}<br><br>Built with love by Van, for Hatsuki.<br>Engine: Three.js · Original voxel assets (no Minecraft copyrighted assets).<br><br><i>“You are my favorite world.”</i></p>`);
 $('btn-resume').onclick=togglePause;$('btn-pause-settings').onclick=()=>showSettings();$('btn-quit').onclick=()=>{paused=false;$('pause').classList.add('hidden');started=false;$('hud').classList.add('hidden');$('menu').classList.remove('hidden')};
 $('btn-ach').onclick=showAchievements;$('btn-inv-top').onclick=showInventory;$('btn-music').onclick=function(){save.settings.music=!save.settings.music;audio.musicOn=save.settings.music;this.textContent=save.settings.music?'🎵':'🔇';if(save.settings.music)audio.startMusic();else audio.stopMusic();persist()};
 let fin=$('finale');fin.querySelector('[data-close]')?.addEventListener('click',()=>fin.classList.add('hidden'));
}
function showSettings(){let s=save.settings;showPanel('⚙️ SETTINGS',`<div class="settings-row"><span>🎵 Music</span><button class="mc-btn" id="s-music">${s.music?'ON':'OFF'}</button></div><div class="settings-row"><span>🔊 Sound FX</span><button class="mc-btn" id="s-sfx">${s.sfx?'ON':'OFF'}</button></div><div class="settings-row"><span>🌗 Day/Night Cycle</span><button class="mc-btn" id="s-day">${s.day?'ON':'OFF'}</button></div><div class="settings-row"><span>🎨 Graphics</span><button class="mc-btn" id="s-q">${s.quality}</button></div><div class="settings-row"><span>💾 Saved Progress</span><button class="mc-btn" id="s-reset" style="background:#a33">🗑 RESET</button></div><p style="margin-top:10px;opacity:.8">Graphics/reset apply after reload. Edit names, letter & 33 memories in <code>data/config.js</code> + <code>data/memories.js</code>.</p>`);
 $('s-music').onclick=e=>{s.music=!s.music;audio.musicOn=s.music;e.target.textContent=s.music?'ON':'OFF';persist()};$('s-sfx').onclick=e=>{s.sfx=!s.sfx;audio.enabled=s.sfx;e.target.textContent=s.sfx?'ON':'OFF';persist()};$('s-day').onclick=e=>{s.day=!s.day;e.target.textContent=s.day?'ON':'OFF';persist()};$('s-q').onclick=e=>{s.quality=s.quality=='high'?'low':'high';e.target.textContent=s.quality;persist()};$('s-reset').onclick=()=>{if(confirm('Reset ALL progress? This cannot be undone.')){clearSave();location.reload()}}}
function loop(){let dt=Math.min(clock.getDelta(),0.05);let t=clock.elapsedTime;
 if(started&&!paused){
   if(cinematic){cineT+=dt;let a=cineT*0.5;camera.position.set(player.pos.x+Math.sin(a)*10,player.pos.y+5,player.pos.z+Math.cos(a)*10);camera.lookAt(0,3,92);if(cineT>2.6)cinematic=false}
   else{player.update(dt,controls.read());player.camera(camera);interactions.update();checkLocation()}
   if(save.settings.day)timeOfDay=(timeOfDay+dt/CONFIG.dayLengthSeconds)%1;
   // day/night
   let ang=timeOfDay*Math.PI*2-Math.PI/2;let elev=Math.sin(ang);let day=THREE.MathUtils.clamp(elev*1.4+0.35,0.06,1);
   sun.position.set(Math.cos(ang)*80,Math.max(8,elev*80),30);sun.intensity=1.7*day;hemi.intensity=0.25+0.7*day;
   let sky=new THREE.Color().setHSL(0.58,0.65,0.12+0.55*day);if(elev> -0.1&&elev<0.35)sky.lerp(new THREE.Color(0xff9e7a),0.45);skyMat.color.copy(sky);scene.fog.color.copy(sky);
   world.stars.material.opacity=1-day;world.stars.material.transparent=true;moonLight.intensity=(1-day)*20;
   world.update(t,dt);
   sun.position.x+=player.pos.x;sun.position.z+=player.pos.z;sun.target.position.copy(player.pos);sun.target.updateMatrixWorld();
 }
 renderer.render(scene,camera);
}
init().catch(e=>{console.error(e);$('load-text').textContent='⚠️ Error loading world: '+e.message+' — try refreshing (needs internet for Three.js CDN).'});
