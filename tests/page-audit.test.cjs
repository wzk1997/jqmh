const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..'),mini=path.join(root,'miniprogram');
const app=JSON.parse(fs.readFileSync(path.join(mini,'app.json')));
const routes=app.pages.concat((app.subpackages||[]).flatMap(pack=>pack.pages.map(page=>pack.root+'/'+page)));

function resolveSource(from,value,extensions=['']){
  const base=value.startsWith('/')?path.join(mini,value):path.resolve(path.dirname(from),value);
  return extensions.map(ext=>base+ext).find(fs.existsSync);
}

test('every registered frontend and admin page has a complete, parseable four-file source set',()=>{
  assert(!routes.includes('pages/test1/test1'),'空白调试页不能进入正式页面清单');
  for(const route of routes){
    const base=path.join(mini,route);
    for(const ext of ['.js','.json','.wxml','.wxss'])assert(fs.existsSync(base+ext),`${route}${ext}`);
    assert.doesNotThrow(()=>JSON.parse(fs.readFileSync(base+'.json')),`${route}.json`);
  }
});

test('all page relative requires, WXML imports and component declarations resolve to real files',()=>{
  const configs=[path.join(mini,'app.json')];
  for(const route of routes){
    const js=path.join(mini,route+'.js'),wxml=path.join(mini,route+'.wxml'),json=path.join(mini,route+'.json');configs.push(json);
    const source=fs.readFileSync(js,'utf8');
    for(const match of source.matchAll(/require\(['"]([^'"]+)['"]\)/g))if(match[1].startsWith('.'))assert(resolveSource(js,match[1],['','.js','/index.js']),`${route}: ${match[1]}`);
    const markup=fs.readFileSync(wxml,'utf8');
    for(const match of markup.matchAll(/<(?:import|include)\b[^>]*\bsrc=["']([^"']+)["']/g))assert(resolveSource(wxml,match[1],['','.wxml']),`${route}: ${match[1]}`);
  }
  for(const config of configs){const parsed=JSON.parse(fs.readFileSync(config));for(const [name,value] of Object.entries(parsed.usingComponents||{})){if(!value||value.startsWith('plugin://'))continue;assert(resolveSource(config,value,['.js','/index.js']),`${path.relative(root,config)} component ${name}: ${value}`);}}
});

test('page-declared backend routes exist in both cloud routing and the local SQLite adapter',()=>{
  const cloudRoutes=require('../cloudfunctions/mcloud/project/TRIP1/public/route.js'),used=new Set();
  for(const route of routes){for(const ext of ['.js','.wxml']){const source=fs.readFileSync(path.join(mini,route+ext),'utf8');for(const match of source.matchAll(/(?:callCloud(?:Sumbit|Data)?|trans(?:Forms|Cover|RichEditor)TempPics)\(['"][^'"]*['"](?:\s*,[^,)]*)*?\s*,\s*['"]([^'"]+\/[^'"]+)['"]/g))used.add(match[1]);for(const match of source.matchAll(/\broute=["']([^"']+\/[^"]+)["']/g))used.add(match[1]);for(const match of source.matchAll(/callCloud(?:Sumbit|Data)?\(['"]([^'"]+\/[^'"]+)['"]/g))used.add(match[1]);}}
  const local=fs.readFileSync(path.join(root,'local/server/app.js'),'utf8');
  for(const route of used){if(route.endsWith('_'))continue;assert(cloudRoutes[route],`云函数缺少页面接口 ${route}`);const generated=/^admin\/(spot|guide|news)_(list|detail|insert|edit|sort|vouch|status|del)$/.test(route);assert(generated||local.includes(`'${route}'`),`本地 SQLite 缺少页面接口 ${route}`);}
});
