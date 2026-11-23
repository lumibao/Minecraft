import * as THREE from 'three';
export class Player{
 constructor(scene,world){this.world=world;this.pos=new THREE.Vector3(0,0,14);this.vel=new THREE.Vector3();this.yaw=Math.PI;this.pitch=-0.15;this.onGround=false;
  // visible avatar (Hatsuki) — hidden in first person, shown in finale cinematic
  this.avatar=world.makeAvatar(0x3a2a1a,0xff8fb3,0x4a6fa5,0,14);this.avatar.visible=false}
 update(dt,input){let sp=input.sprint?9:5.2;let f=new THREE.Vector3(-Math.sin(this.yaw),0,-Math.cos(this.yaw));let r=new THREE.Vector3(-f.z,0,f.x);
  let move=new THREE.Vector3();if(input.forward)move.add(f);if(input.back)move.sub(f);if(input.right)move.add(r);if(input.left)move.sub(r);if(input.joy){move.addScaledVector(f,-input.joy.y);move.addScaledVector(r,input.joy.x)}
  if(move.lengthSq()>0)move.normalize().multiplyScalar(sp);
  let old=this.pos.clone();this.pos.x+=move.x*dt;this.pos.z+=move.z*dt;
  if(this.world.collide(this.pos)){this.pos.x=old.x;this.pos.z=old.z; /* slide */ this.pos.x+=move.x*dt;if(this.world.collide(this.pos))this.pos.x=old.x;else{this.pos.z+=move.z*dt;if(this.world.collide(this.pos))this.pos.z=old.z}}
  let limit=105;this.pos.x=THREE.MathUtils.clamp(this.pos.x,-limit,limit);this.pos.z=THREE.MathUtils.clamp(this.pos.z,-limit,limit);
  let ground=this.world.getHeight(this.pos.x,this.pos.z);
  this.vel.y-=22*dt;this.pos.y+=this.vel.y*dt;
  if(this.pos.y<=ground){this.pos.y=ground;this.vel.y=0;this.onGround=true}else this.onGround=false;
  if(input.jump&&this.onGround){this.vel.y=8.5;this.onGround=false}
  this.avatar.position.set(this.pos.x,this.pos.y,this.pos.z);this.avatar.rotation.y=this.yaw}
 camera(cam){let eye=this.pos.clone().add(new THREE.Vector3(0,1.65,0));cam.position.copy(eye);let dir=new THREE.Vector3(-Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),-Math.cos(this.yaw)*Math.cos(this.pitch));cam.lookAt(eye.clone().add(dir))}
}
