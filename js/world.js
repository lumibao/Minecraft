import * as THREE from 'three';
import {CONFIG} from '../data/config.js';
import {CHESTS} from '../data/locations.js';
function tex(c1,c2){let cv=document.createElement('canvas');cv.width=cv.height=16;let g=cv.getContext('2d');for(let y=0;y<16;y++)for(let x=0;x<16;x++){g.fillStyle=((x+y)%3==0)?c2:c1;g.fillRect(x,y,1,1)}let t=new THREE.CanvasTexture(cv);t.magFilter=THREE.NearestFilter;return t}
export class World{
 constructor(scene,save){this.scene=scene;this.save=save;this.colliders=[];this.interactables=[];this.flowers=new Map();this.books=new Map();this.chests=new Map();this.trees=[];this.water=null;this.beacon=null;this.particles=null;this.van=null;this.build()}
 mat(c1,c2){return new THREE.MeshLambertMaterial({map:tex(c1,c2)})}
 box(x,y,z,w,h,d,material,collide=true){let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;this.scene.add(m);if(collide)this.colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:y-h/2,maxY:y+h/2});return m}
 addInteract(o){this.interactables.push(o)}
 getHeight(x,z){let d=Math.hypot(x-0,z+88);if(d<22)return Math.max(0,9*(1-d/22));let d2=Math.hypot(x+54,z-50);return 0}
 build(){
  let S=CONFIG.worldSize;
  let ground=new THREE.Mesh(new THREE.PlaneGeometry(S,S,48,48),this.mat('#6abe30','#5aa828'));
  // displace mountain vertices
  let pos=ground.geometry.attributes.position;for(let i=0;i<pos.count;i++){let x=pos.getX(i),y=pos.getY(i);let wz=-y;let h=this.getHeight(x,wz);pos.setZ(i,h)}ground.geometry.computeVertexNormals();
  ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;this.scene.add(ground);
  // paths
  let pathMat=this.mat('#c2a878','#b09468');[[0,0,4,180],[ -30,-30,70,4],[30,-25,60,4],[30,25,60,4],[-30,25,70,4]].forEach(p=>{let m=new THREE.Mesh(new THREE.PlaneGeometry(p[2],p[3]),pathMat);m.rotation.x=-Math.PI/2;m.rotation.z=0;m.position.set(p[0],0.02,p[1]);this.scene.add(m)});
  this.buildSpawn();this.buildGarden();this.buildHome();this.buildOcean();this.buildLibrary();this.buildObservatory();this.buildForever();this.buildNature();this.buildSkyExtras();
 }
 wallHouse(cx,cz,w,d,h,mat,doorSide){ // perimeter with door gap on south
  let t=0.6,y=h/2;
  this.box(cx-w/2+t/2,y,cz-d/2,w, h,t,mat); // placeholder overwritten below - kept simple solid back
 }
 buildSpawn(){
  let wood=this.mat('#8b5a2b','#754c24'),plank=this.mat('#b07d42','#9a6a36'),stone=this.mat('#8a8a8a','#767676');
  let cx=0,cz=-2;
  // small house walls (leave front open)
  this.box(cx-5,2,cz-4,0.6,4,8,wood);this.box(cx+5,2,cz-4,0.6,4,8,wood);this.box(cx,2,cz-8,10.6,4,0.6,wood);this.box(cx-3.5,2,cz,3,4,0.6,wood);this.box(cx+3.5,2,cz,3,4,0.6,wood);this.box(cx,3.2,cz,2.2,1.6,0.6,wood);
  let roof=this.box(cx,5.2,cz-4,12,0.6,10,this.mat('#a0522d','#8b451f'),false);roof.rotation.z=0;
  this.box(cx,0.3,cz-4,10,0.6,8,plank,false);
  for(let i=0;i<5;i++)this.box(cx-4+i*2,0.5,cz+2,0.4,1,0.4,stone,false);
  this.sign(cx+3,1.2,cz+3,'spawn-sign','📖 Read: Our First Spawn');
  this.addInteract({id:'intro',type:'intro',pos:new THREE.Vector3(cx+3,1,cz+3),label:'Read the First Spawn sign'});
  // lanterns
  [[-6,4],[6,4],[-6,-6],[6,-6]].forEach(p=>this.lantern(p[0],p[1]));
 }
 sign(x,y,z,id,label){let m=this.box(x,y,z,1.6,1,0.2,this.mat('#b07d42','#8b5a2b'),false);this.box(x,0.5,z,0.2,1,0.2,this.mat('#6b4423','#5a351a'),false)}
 lantern(x,z){this.box(x,0.6,z,0.18,1.2,0.18,this.mat('#3a2a18','#2a1e12'),false);let l=new THREE.Mesh(new THREE.BoxGeometry(.55,.55,.55),new THREE.MeshBasicMaterial({color:0xffd98a}));l.position.set(x,1.4,z);this.scene.add(l);let pt=new THREE.PointLight(0xffc36b,12,10);pt.position.set(x,1.6,z);this.scene.add(pt)}
 tree(x,z,cherry=false,big=false){let h=big?7:4.5;let trunk=this.box(x,h/2,z,0.7,h,0.7,this.mat('#6b4423','#57371c'));let col=cherry?['#ffb7d1','#ff9ec4']:['#2f9e44','#26823a'];let s=big?5:3.4;let leaf=new THREE.Mesh(new THREE.BoxGeometry(s,s,s),this.mat(col[0],col[1]));leaf.position.set(x,h+s/2-0.5,z);leaf.castShadow=true;this.scene.add(leaf);if(cherry)this.trees.push(leaf)}
 buildNature(){
  let spots=[[-20,-20],[20,-18],[-18,20],[18,18],[-80,0],[80,0],[0,30],[-35,-70],[35,-70],[-80,-80],[80,-80],[-80,70],[80,70]];
  spots.forEach((p,i)=>this.tree(p[0],p[1],i%3==0));
  // scattered flowers decor + grass tufts (non-collide)
  for(let i=0;i<80;i++){let x=(Math.random()-0.5)*200,z=(Math.random()-0.5)*200;if(Math.hypot(x,z)<12)continue;let m=new THREE.Mesh(new THREE.BoxGeometry(.25,.5,.25),new THREE.MeshLambertMaterial({color:[0xff6b9d,0xffd54a,0xffffff,0xc77dff][i%4]}));m.position.set(x,0.25,z);this.scene.add(m)}
 }
 buildGarden(){
  let cx=-62,cz=-58;
  // heart pond approx: blue circle
  let pond=new THREE.Mesh(new THREE.CircleGeometry(9,24),new THREE.MeshPhongMaterial({color:0x4db8e8,transparent:true,opacity:.85,shininess:120}));pond.rotation.x=-Math.PI/2;pond.position.set(cx,0.06,cz);this.scene.add(pond);this.water=pond;
  // bridge
  this.box(cx,0.4,cz,14,0.3,2.2,this.mat('#b07d42','#9a6a36'),false);
  for(let i=0;i<8;i++)this.tree(cx-14+(i%4)*9,cz-12+Math.floor(i/4)*24,true);
  for(let i=0;i<6;i++)this.lantern(cx-10+i*4,cz+(i%2?6:-6));
  // 33 collectible flowers in spiral
  for(let n=1;n<=33;n++){let a=n*0.62,r=4+ n*0.32;let x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(this.save.flowers.includes(n))continue;
   let g=new THREE.Group();let stem=new THREE.Mesh(new THREE.BoxGeometry(.12,.6,.12),new THREE.MeshLambertMaterial({color:0x2f9e44}));stem.position.y=.3;let head=new THREE.Mesh(new THREE.BoxGeometry(.55,.35,.55),new THREE.MeshBasicMaterial({color:n==33?0xffd700:0xff8fb3}));head.position.y=.75;g.add(stem,head);g.position.set(x,0,z);this.scene.add(g);this.flowers.set(n,g);
   this.addInteract({id:'flower-'+n,type:'flower',month:n,pos:new THREE.Vector3(x,0.8,z),label:`Collect Flower ${n} / 33 ${n==33?'★ GOLDEN':''}`})}
 }
 buildHome(){
  let cx=52,cz=-42,wood=this.mat('#8b5a2b','#754c24'),plank=this.mat('#c9a06a','#b8915a');
  // floor & walls with front doorway
  this.box(cx,0.25,cz,20,0.5,16,plank,false);
  this.box(cx-10,3,cz,0.6,6,16,wood);this.box(cx+10,3,cz,0.6,6,16,wood);this.box(cx,3,cz-8,20.6,6,0.6,wood);
  this.box(cx-7,3,cz+8,6,6,0.6,wood);this.box(cx+7,3,cz+8,6,6,0.6,wood);this.box(cx,5,cz+8,8,2,0.6,wood); // lintel
  this.box(cx,6.6,cz,22,0.6,18,this.mat('#7a3f1f','#663416'),false); // roof
  // interior dividers (gaps)
  this.box(cx,2.5,cz-0,0.4,5,10,plank); // partial
  // furniture: fireplace, table, bed, kitchen counters
  this.box(cx-8,1,cz-6,3,2,2,this.mat('#8a8a8a','#767676'),false);let fire=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xff8c42}));fire.position.set(cx-8,1,cz-4.8);this.scene.add(fire);
  this.box(cx,0.8,cz-3,4,0.3,2,plank,false);this.box(cx+6,1,cz+4,3,2,1,plank,false);this.box(cx-6,0.8,cz+4,4,1.6,2,this.mat('#c94f7c','#b23e68'),false);
  // picture frames (placeholders)
  [[cx-9.6,3,cz-2],[cx,3,cz-7.6],[cx+9.6,3,cz+2]].forEach((p,i)=>{let f=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.6),new THREE.MeshBasicMaterial({color:[0xffb7d1,0xffe9a8,0xa8d8ff][i]}));f.position.set(p[0],p[1],p[2]);f.rotation.y=p[0]<cx-5?Math.PI/2:(p[0]>cx+5?-Math.PI/2:0);this.scene.add(f);this.addInteract({id:'photo-'+i,type:'photo',pos:new THREE.Vector3(p[0],1,p[2]),label:'Look at photo frame [add your photo in assets/images/]'})});
  // room signs
  let rooms=[['Kitchen',cx+6,cz-5],['Bedroom',cx-6,cz+4],['Living Room',cx,cz-3],['Balcony',cx+8,cz+6]];
  rooms.forEach((r,i)=>{this.addInteract({id:'room-'+i,type:'room',room:r[0],pos:new THREE.Vector3(r[1],1,r[2]),label:`Enter: ${r[0]}`})});
  this.addInteract({id:'home-letter',type:'homeLetter',pos:new THREE.Vector3(cx,1,cz-3),label:'Read letter on the table'});
  this.lantern(cx-12,cz+10);this.lantern(cx+12,cz+10);
 }
 buildOcean(){
  let cx=62,cz=48;
  let water=new THREE.Mesh(new THREE.BoxGeometry(36,3,28),new THREE.MeshPhongMaterial({color:0x1a7fbf,transparent:true,opacity:.55}));water.position.set(cx,1.2,cz);this.scene.add(water);
  // glass tunnel
  for(let i=0;i<6;i++){let x=cx-15+i*6;this.box(x,0.2,cz,5,0.4,6,this.mat('#d9f4ff','#bfe9ff'),false)}
  // coral
  for(let i=0;i<20;i++){let m=new THREE.Mesh(new THREE.BoxGeometry(.6,1+Math.random(),.6),new THREE.MeshLambertMaterial({color:[0xff6b9d,0xff9f43,0xc77dff,0x2ed573][i%4]}));m.position.set(cx-16+Math.random()*32,0.6,cz-12+Math.random()*24);this.scene.add(m)}
  // chests
  CHESTS.forEach((c,i)=>{let x=cx-14+i*7,z=cz+(i%2?8:-8);let chest=this.box(x,0.5,z,1.4,1,1,this.mat('#b07d42','#8b5a2b'),false);chest.name=c.id;if(!this.save.chests.includes(c.id)){this.chests.set(c.id,chest);this.addInteract({id:'chest-'+c.id,type:'chest',chest:c,pos:new THREE.Vector3(x,1,z),label:`Open Treasure Chest — ${c.title}`})} });
  // bubbles particles
  let geo=new THREE.BufferGeometry();let pts=[];for(let i=0;i<120;i++)pts.push(cx-17+Math.random()*34,Math.random()*4,cz-13+Math.random()*26);geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));let bubbles=new THREE.Points(geo,new THREE.PointsMaterial({color:0xbfefff,size:.25,transparent:true,opacity:.8}));this.scene.add(bubbles);this.bubbles=bubbles;
 }
 buildLibrary(){
  let cx=-54,cz=50,wood=this.mat('#5a3a1a','#4a2f14'),gold=this.mat('#c9a227','#a8861d');
  this.box(cx,0.25,cz,24,0.5,18,this.mat('#6b4a2a','#573a20'),false);
  this.box(cx-12,4,cz,0.6,8,18,wood);this.box(cx+12,4,cz,0.6,8,18,wood);this.box(cx,4,cz-9,24.6,8,0.6,wood);this.box(cx-8,4,cz+9,8,8,0.6,wood);this.box(cx+8,4,cz+9,8,8,0.6,wood);this.box(cx,7,cz+9,8,2,0.6,wood);
  this.box(cx,8.4,cz,26,0.6,20,this.mat('#3a2a4a','#2e2140'),false);
  // shelves rows
  for(let r=0;r<3;r++){for(let s=0;s<6;s++){let x=cx-10+s*4,z=cz-7+r*5;this.box(x,1.8,z,3,3.6,0.8,wood,false)}}
  // 33 books on pedestals/shelves front
  for(let n=1;n<=33;n++){let col=n%11,row=Math.floor((n-1)/11);let x=cx-10+col*2, z=cz-6+row*5.2;let b=new THREE.Mesh(new THREE.BoxGeometry(.55,.8,.25),new THREE.MeshLambertMaterial({color:new THREE.Color().setHSL((n*0.07)%1,0.65,0.55)}));b.position.set(x,1.1,z+0.6);this.scene.add(b);if(!this.save.books.includes(n)){this.books.set(n,b)}this.addInteract({id:'book-'+n,type:'book',month:n,pos:new THREE.Vector3(x,1,z+0.6),label:`Read Book ${n} — Chapter ${n}/33`})}
  // candles / floating particles
  let geo=new THREE.BufferGeometry();let pts=[];for(let i=0;i<150;i++)pts.push(cx-11+Math.random()*22,1+Math.random()*6,cz-8+Math.random()*16);geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));this.scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xc9a0ff,size:.18})));
 }
 buildObservatory(){
  let cx=0,cz=-88;
  // cabin + observatory dome on mountain top (height ~9)
  let topY=this.getHeight(cx,cz);
  this.box(cx,topY+1.5,cz,8,3,6,this.mat('#8b5a2b','#754c24'));
  let dome=new THREE.Mesh(new THREE.SphereGeometry(3,16,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0xb8c4d8}));dome.position.set(cx,topY+3,cz);this.scene.add(dome);
  let scope=this.box(cx+2,topY+3.5,cz,0.4,0.4,3,this.mat('#d9d9d9','#bfbfbf'),false);scope.rotation.x=0.6;
  // campfire
  let fire=new THREE.Mesh(new THREE.ConeGeometry(.7,1.4,8),new THREE.MeshBasicMaterial({color:0xff9f43}));fire.position.set(cx+6,topY+0.7,cz+4);this.scene.add(fire);let l=new THREE.PointLight(0xff9f43,20,18);l.position.set(cx+6,topY+2,cz+4);this.scene.add(l);
  this.addInteract({id:'love-letter',type:'letter',pos:new THREE.Vector3(cx,topY+1,cz),label:'📜 Read the Love Letter (Book & Quill)'});
  this.lantern(cx-5,cz+6);
 }
 buildForever(){
  let cx=0,cz=88;
  for(let i=0;i<10;i++)this.tree(cx-16+(i%5)*8,cz-8+Math.floor(i/5)*16,true,i>7);
  // fountain
  let basin=new THREE.Mesh(new THREE.CylinderGeometry(4,4,1,20),this.mat('#b8c4d8','#9aa8c0'));basin.position.set(cx,0.5,cz-8);this.scene.add(basin);
  let fw=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,0.3,20),new THREE.MeshPhongMaterial({color:0x4db8e8}));fw.position.set(cx,1.05,cz-8);this.scene.add(fw);
  // golden beacon
  this.box(cx,0.5,cz+4,3,1,3,this.mat('#c9a227','#a8861d'),false);
  let beamMat=new THREE.MeshBasicMaterial({color:0xffe66d,transparent:true,opacity:.55});
  let beam=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,40,12,1,true),beamMat);beam.position.set(cx,21,cz+4);this.scene.add(beam);this.beacon=beam;
  let crystal=new THREE.Mesh(new THREE.OctahedronGeometry(1),new THREE.MeshBasicMaterial({color:0xffd700}));crystal.position.set(cx,2.2,cz+4);this.scene.add(crystal);this.crystal=crystal;
  let l=new THREE.PointLight(0xffd700,30,25);l.position.set(cx,3,cz+4);this.scene.add(l);
  this.addInteract({id:'beacon',type:'beacon',pos:new THREE.Vector3(cx,1.5,cz+4),label:'✨ Activate the Final Beacon'});
  // Van NPC
  this.van=this.makeAvatar(CONFIG.partnerHair,CONFIG.partnerShirt,CONFIG.partnerPants,cx-2.5,cz+4);
  this.makeAvatar(CONFIG.playerHair,0xff6b9d,CONFIG.playerPants,cx+2.5,cz+4); // Hatsuki statue beside Van
  // heart garden: pink blocks heart-ish
  for(let i=0;i<12;i++){let a=i/12*Math.PI*2;let x=cx+Math.cos(a)*7,z=cz+10+Math.sin(a)*4;let m=new THREE.Mesh(new THREE.BoxGeometry(.6,.6,.6),new THREE.MeshBasicMaterial({color:0xff6b9d}));m.position.set(x,0.3,z);this.scene.add(m)}
 }
 makeAvatar(hair,shirt,pants,x,z){let g=new THREE.Group();let skin=new THREE.MeshLambertMaterial({color:CONFIG.playerSkin});let add=(w,h,d,cx,cy,cz,mat)=>{let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(cx,cy,cz);g.add(m);return m};
  add(.6,.6,.6,0,1.55,0,skin);add(.65,.2,.65,0,1.9,0,new THREE.MeshLambertMaterial({color:hair}));add(.7,.7,.4,0,1.0,0,new THREE.MeshLambertMaterial({color:shirt}));add(.28,.6,.3,-.18,.3,0,new THREE.MeshLambertMaterial({color:pants}));add(.28,.6,.3,.18,.3,0,new THREE.MeshLambertMaterial({color:pants}));g.position.set(x,this.getHeight(x,z),z);this.scene.add(g);return g}
 buildSkyExtras(){
  // clouds
  this.clouds=new THREE.Group();for(let i=0;i<14;i++){let c=new THREE.Mesh(new THREE.BoxGeometry(8+Math.random()*8,1.2,4+Math.random()*3),new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.9}));c.position.set((Math.random()-0.5)*200,28+Math.random()*8,(Math.random()-0.5)*200);this.clouds.add(c)}this.scene.add(this.clouds);
  // cherry particles
  let geo=new THREE.BufferGeometry();let pts=[];for(let i=0;i<300;i++)pts.push((Math.random()-0.5)*180,Math.random()*18,(Math.random()-0.5)*180);geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));this.particles=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffb7d1,size:.3,transparent:true,opacity:.85}));this.scene.add(this.particles);
  // stars
  let sg=new THREE.BufferGeometry();let sp=[];for(let i=0;i<600;i++){let a=Math.random()*Math.PI*2,e=Math.random()*Math.PI/2.5+0.15,r=280;sp.push(Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r,Math.sin(a)*Math.cos(e)*r)}sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));this.stars=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.2,sizeAttenuation:false}));this.scene.add(this.stars);
 }
 update(t,dt){if(this.clouds)this.clouds.children.forEach((c,i)=>{c.position.x+=dt*(0.4+i*0.02);if(c.position.x>120)c.position.x=-120});if(this.particles){this.particles.rotation.y=t*0.01;this.particles.position.y=Math.sin(t*0.5)*0.4}if(this.crystal){this.crystal.rotation.y=t*1.2;this.crystal.position.y=2.2+Math.sin(t*2)*0.25}if(this.bubbles)this.bubbles.position.y=Math.sin(t)*0.3;if(this.van)this.van.rotation.y=Math.sin(t*0.6)*0.4;this.flowers.forEach(f=>{f.rotation.y=t*1.5})}
 collide(pos,r=0.45){for(let c of this.colliders){if(pos.y+1.6>c.minY&&pos.y<c.maxY){if(pos.x+r>c.minX&&pos.x-r<c.maxX&&pos.z+r>c.minZ&&pos.z-r<c.maxZ)return c}}return null}
}