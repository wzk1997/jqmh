/* Uses the real administrator API through WeChat's official automator SDK. */
const fs=require('fs'),path=require('path');
const auto=require(process.env.WETRAVEL_AUTOMATOR_PATH||'miniprogram-automator');
const specs=require('../cloudfunctions/mcloud/project/TRIP1/public/cms_demo_data.js');
const root=path.resolve(__dirname,'..');
const assets={hero:fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/images/design/portal-mountains-v3.jpg')).toString('base64'),forest:fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/images/design/ar-forest-v3.jpg')).toString('base64'),lake:fs.readFileSync(path.join(root,'miniprogram/projects/TRIP1/images/design/profile-landscape-v1.jpg')).toString('base64')};
const form=(mark,type,val)=>({mark,type,title:mark,val});
(async()=>{
 const m=await auto.connect({wsEndpoint:process.env.WETRAVEL_AUTOMATOR_ENDPOINT||'ws://127.0.0.1:9421'});
 async function call(action,params){const r=await m.evaluate(async(route,params)=>{const auth=wx.getStorageSync('ADMIN_TOKEN');if(!auth||!auth.token)throw Error('请先登录管理员');const r=await wx.cloud.callFunction({name:'mcloud',data:{PID:'TRIP1',route:'admin/cms_'+route,token:auth.token,params}});if(r.result.code!==200)throw Error(r.result.msg||'管理接口调用失败');return r.result.data;},action,params);return r;}
 const report=[];
 try{for(const spec of specs){
  const reserved=await call('demo_reserve',{key:spec.key});
  if(!reserved.created){report.push({key:spec.key,id:reserved.id,status:'existing-not-overwritten'});console.log('SKIP',spec.key);continue;}
  const photos=spec.module==='scenic'||spec.module==='product'?[spec.photo,...['hero','forest','lake'].filter(p=>p!==spec.photo)]:[spec.photo];const uploaded=[];
  for(const photo of photos){const r=await call('upload',{module:spec.module,id:reserved.id,base64:assets[photo]});uploaded.push(r.fileID);}
  const input={...spec.data,id:reserved.id,images:uploaded,content:[{type:'text',val:spec.data.body||spec.data.desc||''}],forms:[]};
  if(['album','product','news'].includes(spec.module))input.title=spec.name;
  if(spec.module==='album')input.forms=[form('cover','image',[uploaded[0]]),form('desc','textarea',spec.data.desc),form('detail','content',input.content),form('spots','select',spec.data.spots)];
  if(spec.module==='product')input.forms=[form('cover','image',[uploaded[0]]),form('album','image',uploaded),...['desc','address','hours','subtitle','duration','bestTime','other'].map(key=>form(key==='hours'?'time':key,'textarea',spec.data[key]||''))];
  await call('save',{module:spec.module,data:input});await call('state',{module:spec.module,id:reserved.id,state:'published'});
  report.push({key:spec.key,id:reserved.id,status:'published'});console.log('PUBLISHED',spec.module,spec.name);
  fs.writeFileSync(path.join(root,'artifacts/cms-demo-import-result.json'),JSON.stringify({environment:'cloud1-d7g9o14z451e97c40',records:report},null,2));
 }
 console.log('IMPORTED',report.length);
 }finally{m.disconnect();}
})().catch(e=>{console.error(e.message);process.exit(1)});
