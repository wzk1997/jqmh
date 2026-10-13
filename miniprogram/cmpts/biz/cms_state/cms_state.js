Component({properties:{loading:Boolean,error:Boolean,empty:Boolean,emptyText:{type:String,value:'暂无内容，点击下方按钮新增'}},methods:{retry(){this.triggerEvent('retry');}}});
