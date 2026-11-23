export class Interactions{
 constructor(world,player,onInteract){this.world=world;this.player=player;this.onInteract=onInteract;this.current=null}
 update(){let best=null,bd=5;for(let it of this.world.interactables){let d=it.pos.distanceTo(this.player.pos.clone().setY(it.pos.y));if(d<bd){bd=d;best=it}}this.current=best;let p=document.getElementById('prompt');if(best){p.classList.remove('hidden');p.innerHTML=`⌨️ <b>E</b> / Tap ✋ — ${best.label}`}else p.classList.add('hidden')}
 trigger(){if(this.current)this.onInteract(this.current)}
 removeById(id){this.world.interactables=this.world.interactables.filter(i=>i.id!==id);if(this.current&&this.current.id===id)this.current=null}
}
