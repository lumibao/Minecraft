import{ACHIEVEMENTS}from'../data/achievements.js';
export class Achievements{
 constructor(save,onUnlock){this.save=save;this.onUnlock=onUnlock}
 unlock(id){if(this.save.achievements.includes(id))return false;this.save.achievements.push(id);let a=ACHIEVEMENTS.find(x=>x.id===id);if(a)this.onUnlock(a);return true}
 has(id){return this.save.achievements.includes(id)}
 list(){return ACHIEVEMENTS}
}
