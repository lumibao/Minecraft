export class Controls{
 constructor(dom){this.keys={};this.joy={x:0,y:0};this.input={forward:false,back:false,left:false,right:false,jump:false,sprint:false,joy:null};
  addEventListener('keydown',e=>{this.keys[e.code]=true;if(e.code=='Space')e.preventDefault()});addEventListener('keyup',e=>this.keys[e.code]=false);
  this.setupJoystick();this.lookDrag(dom)}
 setupJoystick(){let joy=document.getElementById('joystick'),stick=document.getElementById('stick');if(!joy)return;let active=false;
  let handle=e=>{let r=joy.getBoundingClientRect();let t=e.touches?e.touches[0]:e;let dx=t.clientX-(r.left+r.width/2),dy=t.clientY-(r.top+r.height/2);let len=Math.min(38,Math.hypot(dx,dy));let a=Math.atan2(dy,dx);dx=Math.cos(a)*len;dy=Math.sin(a)*len;stick.style.left=(35+dx)+'px';stick.style.top=(35+dy)+'px';this.joy={x:dx/38,y:dy/38}};
  joy.addEventListener('touchstart',e=>{active=true;handle(e);e.preventDefault()},{passive:false});joy.addEventListener('touchmove',e=>{if(active)handle(e);e.preventDefault()},{passive:false});joy.addEventListener('touchend',()=>{active=false;this.joy={x:0,y:0};stick.style.left='35px';stick.style.top='35px'})}
 lookDrag(dom){this.dragging=false;this.lastX=0;this.lastY=0;this.cb=null;
  dom.addEventListener('touchstart',e=>{if(e.target.closest('button')||e.target.closest('#joystick'))return;this.dragging=true;this.lastX=e.touches[0].clientX;this.lastY=e.touches[0].clientY},{passive:true});
  dom.addEventListener('touchmove',e=>{if(!this.dragging||!this.cb)return;let dx=e.touches[0].clientX-this.lastX,dy=e.touches[0].clientY-this.lastY;this.lastX=e.touches[0].clientX;this.lastY=e.touches[0].clientY;this.cb(dx,dy)},{passive:true});
  dom.addEventListener('touchend',()=>this.dragging=false)}
 bindButtons(onInteract,onJump,onPause,onInv){let b=(id,fn)=>{let el=document.getElementById(id);if(el)el.addEventListener('click',fn)};
  b('btn-interact',onInteract);b('btn-pause',onPause);b('btn-inv',onInv);
  let j=document.getElementById('btn-jump');if(j){j.addEventListener('touchstart',e=>{this.input.jump=true;e.preventDefault()},{passive:false});j.addEventListener('touchend',()=>this.input.jump=false);j.addEventListener('click',()=>{this.input.jump=true;setTimeout(()=>this.input.jump=false,120)})}}
 read(){let k=this.keys;return{forward:!!k.KeyW||!!k.ArrowUp,back:!!k.KeyS||!!k.ArrowDown,left:!!k.KeyA||!!k.ArrowLeft,right:!!k.KeyD||!!k.ArrowRight,jump:!!k.Space||this.input.jump,sprint:!!k.ShiftLeft||!!k.ShiftRight,joy:(Math.abs(this.joy.x)>0.12||Math.abs(this.joy.y)>0.12)?this.joy:null}}
}
