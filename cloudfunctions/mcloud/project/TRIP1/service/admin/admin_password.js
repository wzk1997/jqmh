const crypto=require('crypto');
function hash(password){const salt=crypto.randomBytes(16).toString('hex');return 'scrypt$'+salt+'$'+crypto.scryptSync(password,salt,32).toString('hex');}
function verify(password,stored){if(typeof stored!=='string')return false;if(stored.startsWith('scrypt$')){const [_,salt,key]=stored.split('$');if(!salt||!key||!/^[a-f0-9]{64}$/.test(key))return false;return crypto.timingSafeEqual(crypto.scryptSync(password,salt,32),Buffer.from(key,'hex'));}if(!/^[a-f0-9]{32}$/.test(stored))return false;return crypto.timingSafeEqual(Buffer.from(crypto.createHash('md5').update(password).digest('hex')),Buffer.from(stored));}
module.exports={hash,verify};
