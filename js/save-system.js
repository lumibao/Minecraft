const KEY='our-little-world-save-v1';
export const defaultSave=()=>({pos:null,flowers:[],books:[],chests:[],achievements:[],visited:[],homeZones:[],intro:false,letter:false,beacon:false,settings:{music:true,sfx:true,quality:'high',day:true}});
export function loadSave(){try{let s=JSON.parse(localStorage.getItem(KEY));if(s&&s.flowers)return Object.assign(defaultSave(),s)}catch(e){}return defaultSave()}
export function storeSave(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
export function clearSave(){localStorage.removeItem(KEY)}
export function hasSave(){return !!localStorage.getItem(KEY)}
