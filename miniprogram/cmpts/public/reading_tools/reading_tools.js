const reading=require('../../../helper/reading_helper.js');
Component({
 options:{styleIsolation:'isolated'},
 properties:{inline:{type:Boolean,value:false}},
 data:{mode:'standard',modes:reading.MODES},
 lifetimes:{attached(){this.unsubscribe=reading.subscribe(()=>this.sync());this.sync();},detached(){if(this.unsubscribe)this.unsubscribe();}},
 pageLifetimes:{show(){this.sync();}},
 methods:{
  sync(){this.setData({mode:reading.get().mode});reading.applyPages();},
  choose(e){
   const id=e.currentTarget.dataset.id;
   if(this.applying||id===reading.get().mode)return;
   const apply=()=>reading.choose(id);
   if(!this.data.inline||!wx.createSelectorQuery||!wx.pageScrollTo){apply();return;}
   this.applying=true;
   // Keep the inline switch in place as taller cards above it reflow.
   try{
    const query=wx.createSelectorQuery().in(this);
    query.select('.display-preference').boundingClientRect();query.selectViewport().scrollOffset();
    query.exec(results=>{
     const before=results[0],scroll=results[1];apply();
     const finish=()=>wx.createSelectorQuery().in(this).select('.display-preference').boundingClientRect(after=>{
      if(before&&after&&scroll&&Math.abs(after.top-before.top)>1)wx.pageScrollTo({scrollTop:Math.max(0,scroll.scrollTop+after.top-before.top),duration:0});
      this.applying=false;
     }).exec();
     if(wx.nextTick)wx.nextTick(finish);else finish();
    });
   }catch(_){this.applying=false;apply();}
  }
 }
});
