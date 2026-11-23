export class AudioSys{
 constructor(){this.ctx=null;this.enabled=true;this.musicOn=true;this.master=null;this.musicTimer=null}
 init(){if(this.ctx)return;try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.5;this.master.connect(this.ctx.destination)}catch(e){}}
 tone(f,d=.15,type='sine',v=.15,when=0){if(!this.ctx||!this.enabled)return;let o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,this.ctx.currentTime+when);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+when+d);o.connect(g);g.connect(this.master);o.start(this.ctx.currentTime+when);o.stop(this.ctx.currentTime+when+d)}
 collect(){this.tone(880,.12,'sine',.2);this.tone(1320,.2,'sine',.15,.08)}
 chest(){this.tone(392,.15,'triangle',.2);this.tone(523,.15,'triangle',.2,.12);this.tone(659,.25,'triangle',.2,.24)}
 achieve(){[523,659,784,1046].forEach((f,i)=>this.tone(f,.22,'triangle',.18,i*.1))}
 book(){this.tone(440,.08,'sine',.08);this.tone(550,.1,'sine',.06,.06)}
 beacon(){[262,392,523,659,784,1046].forEach((f,i)=>this.tone(f,.6,'sine',.12,i*.12))}
 startMusic(){if(!this.ctx||this.musicTimer||!this.musicOn)return;const notes=[262,330,392,523,392,330,294,392];let i=0;this.musicTimer=setInterval(()=>{if(this.musicOn)this.tone(notes[i++%notes.length],1.4,'sine',.035)},900)}
 stopMusic(){clearInterval(this.musicTimer);this.musicTimer=null}
}
