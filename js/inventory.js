export class Inventory{
 constructor(save){this.save=save}
 counts(){return{flowers:this.save.flowers.length,books:this.save.books.length,chests:this.save.chests.length,fragments:this.save.chests.length,hearts:this.save.beacon?1:0,keys:(this.save.flowers.length>=33?1:0)}}
 render(el){let c=this.counts();el.innerHTML=[['🌸',c.flowers+'/33'],['📚',c.books+'/33'],['🧰',c.chests+'/5'],['💛',c.hearts],['🗝️',c.keys]].map(x=>`<div class="slot"><span>${x[0]}</span><small>${x[1]}</small></div>`).join('')}
}
