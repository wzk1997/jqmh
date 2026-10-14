const v=require('./cms_validation.js');
module.exports=function(info,images){
 if(!info||typeof info!=='object'||Array.isArray(info))v.fail('景区扩展信息不正确');
 if(JSON.stringify(info).length>150000)v.fail('景区扩展内容过长');
 const out={};
 for(const key of ['tagline','rating','altitude','history','selfDrive','transit','parking','services','centerService','toiletService','restService','foodService','tips'])out[key]=v.text(info[key],key, key==='tips'||key==='services'?2000:['rating','altitude','history'].includes(key)?40:500);
 out.video=v.text(info.video,'宣传片链接',1000);
 out.visitDuration=v.text(info.visitDuration,'建议游玩时长',100);
 if(out.video&&!/^https:\/\/[^\s]+$/.test(out.video))v.fail('宣传片须使用HTTPS链接');
 for(const key of ['highlights']){
  const rows=info[key]===undefined?[]:info[key];if(!Array.isArray(rows)||rows.length>12)v.fail('景区内容卡片数量不正确');
  out[key]=rows.map(row=>{if(!row||typeof row!=='object')v.fail('内容卡片不正确');const index=v.integer(row.imageIndex,'图片序号',0,10,0);if(index>images.length)v.fail('图片序号超出展示图片范围');return {title:v.text(row.title,'卡片标题',80,true),desc:v.text(row.desc,'卡片描述',2000),imageIndex:index};});
 }
 const tags=info.galleryTags===undefined?[]:info.galleryTags;if(!Array.isArray(tags)||tags.length>10)v.fail('相册分类不正确');out.galleryTags=tags.map(tag=>v.text(tag,'图片分类',30));
 const lat=info.latitude, lng=info.longitude;
 if(lat!==undefined&&lat!==''&&lat!==null||lng!==undefined&&lng!==''&&lng!==null){
  if(lat===undefined||lng===undefined||lat===''||lng===''||lat===null||lng===null||!['string','number'].includes(typeof lat)||!['string','number'].includes(typeof lng))v.fail('请填写完整坐标');
  if(typeof lat==='string'&&!/^-?\d+(\.\d+)?$/.test(lat.trim())||typeof lng==='string'&&!/^-?\d+(\.\d+)?$/.test(lng.trim()))v.fail('景区坐标格式不正确');
  out.latitude=Number(lat);out.longitude=Number(lng);if(!Number.isFinite(out.latitude)||!Number.isFinite(out.longitude)||Math.abs(out.latitude)>90||Math.abs(out.longitude)>180)v.fail('景区坐标不正确');
 }
 return out;
};
