// Display preference is device-local. It never changes cloud content or account data.
const KEY='WT_READING_PREFERENCES_V1';
const MODES=[{id:'standard',label:'标准',scale:1},{id:'enlarged',label:'放大',scale:1.3}];
const listeners=new Set();
let cached=null;
function normalize(value){
 value=value&&typeof value==='object'?value:{};
 // Preserve a previous larger-text choice when migrating to the display-size control.
 const mode=MODES.some(item=>item.id===value.mode)?value.mode:['large','extra'].includes(value.level)?'enlarged':'standard';
 return {mode};
}
function get(){if(!cached){try{cached=normalize(wx.getStorageSync(KEY));}catch(_){cached=normalize();}}return {...cached};}
function selected(){return MODES.find(item=>item.id===get().mode);}
function applyPages(){
 const mode=selected();
 if(typeof getCurrentPages!=='function')return;
 getCurrentPages().forEach(page=>{
  if(page.data.wtDisplayMode!==mode.id||page.data.wtFontScale!==mode.scale)page.setData({wtDisplayMode:mode.id,wtFontScale:mode.scale});
  const bar=page.getTabBar&&page.getTabBar();
  if(bar&&(bar.data.wtDisplayMode!==mode.id||bar.data.wtFontScale!==mode.scale))bar.setData({wtDisplayMode:mode.id,wtFontScale:mode.scale});
 });
}
function choose(id){
 if(!MODES.some(item=>item.id===id))return false;
 if(get().mode===id){applyPages();return true;}
 cached={mode:id};try{wx.setStorageSync(KEY,cached);}catch(_){}
 for(const listener of listeners)listener(get());
 applyPages();return true;
}
function subscribe(listener){listeners.add(listener);return ()=>listeners.delete(listener);}
module.exports={KEY,MODES,get,selected,choose,subscribe,applyPages};
