const reading=require('../../../helper/reading_helper.js');
Component({
 options:{styleIsolation:'isolated'},
 data:{mode:'standard',modes:reading.MODES,expanded:false},
 lifetimes:{attached(){this.unsubscribe=reading.subscribe(()=>this.sync());this.sync();},detached(){if(this.unsubscribe)this.unsubscribe();}},
 pageLifetimes:{show(){this.close();this.sync();},hide(){this.close();}},
 methods:{
  sync(){this.setData({mode:reading.get().mode});reading.applyPages();},
  toggle(){this.setData({expanded:!this.data.expanded});},
  close(){this.setData({expanded:false});},
  choose(e){reading.choose(e.currentTarget.dataset.id);}
 }
});
