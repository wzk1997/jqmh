// 后台只展示当前前台仍使用的内容模块。全景使用固定链接，无资源管理入口。
const MODULES = [
 {id:'scenic',title:'园区简介',icon:'icon-home',statTitle:'园区简介',legacyTitles:['景区介绍','园区简介']},
 {id:'album',title:'园区攻略',icon:'icon-pic',statTitle:'攻略数',legacyTitles:['攻略数']},
 {id:'product',title:'景点管理',icon:'icon-location',statTitle:'景点数',legacyTitles:['景点数']},
 {id:'merchant',title:'吃住行',icon:'icon-shop',statTitle:'商家数',legacyTitles:['商家数']},
 {id:'news',title:'活动资讯',icon:'icon-form',statTitle:'资讯数',legacyTitles:['资讯数']},
 {id:'service',hidden:true,title:'游客服务',icon:'icon-service',statTitle:'服务数',legacyTitles:['服务数']},
 {id:'feedback',title:'客户反馈',icon:'icon-edit',statTitle:'待处理反馈',legacyTitles:['待处理反馈']}
];
function visibleStats(rows, canRead) {
 if (!Array.isArray(rows)) return [];
 return MODULES.filter(item=>!item.hidden&&canRead(item.id)).flatMap(item=>{
  const row=rows.find(row=>row && (row.module===item.id || (!row.module && item.legacyTitles.includes(row.title))));
  return row ? [{module:item.id,title:item.statTitle,cnt:row.cnt}] : [];
 });
}
module.exports={MODULES,visibleStats};
