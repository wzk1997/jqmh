const fs = require('node:fs');
const path = require('node:path');
const projectRoot = path.resolve(__dirname, '..');
function packageSizes() {
    const config = JSON.parse(fs.readFileSync(path.join(projectRoot, 'project.config.json')));
    const root = path.join(projectRoot, config.miniprogramRoot);
    const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json')));
    const packs = app.subpackages || [];
    const ignores = config.packOptions?.ignore || [];
    const sizes = { main: 0, ...Object.fromEntries(packs.map(pack => [pack.root, 0])) };
    const ignored = file => ignores.some(rule => {
        const value = rule.value.replace(/^\//, '').replace(/\/$/, '');
        if (rule.type === 'file') return file === value;
        if (rule.type === 'folder') return file.startsWith(value + '/');
        if (rule.type === 'suffix') return file.endsWith(value);
        if (rule.type === 'prefix') return file.startsWith(value);
        throw Error('Unsupported pack ignore rule: ' + rule.type);
    });
    function walk(dir) {
        for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
            const abs = path.join(dir, item.name);
            if (item.isDirectory()) { walk(abs); continue; }
            const file = path.relative(root, abs).split(path.sep).join('/');
            if (ignored(file)) continue;
            const owner = packs.find(pack => file.startsWith(pack.root + '/'))?.root || 'main';
            sizes[owner] += fs.statSync(abs).size;
        }
    }
    walk(root);
    return sizes;
}
module.exports = { packageSizes };
if (require.main === module) {
    console.log('本地源码和资源估算（已排除分包及打包忽略项，非微信最终编译包大小）');
    const sizes = packageSizes();
    for (const [name, bytes] of Object.entries(sizes)) console.log(`${name}: ${(bytes / 1024).toFixed(1)} KB`);
    if (Object.values(sizes).some(bytes => bytes > 2048 * 1024)) process.exitCode = 1;
}
