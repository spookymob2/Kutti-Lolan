// Lolan SMP server: static site + JSON API + Discord login. No dependencies, Node 18+.
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
try{for(const l of fs.readFileSync(path.join(__dirname,'.env'),'utf8').split(/\r?\n/)){const m=l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);if(m&&!(m[1] in process.env))process.env[m[1]]=m[2].replace(/^["']|["']$/g,'')}}catch{}
const E=process.env,PORT=+E.PORT||3000,BASE=(E.BASE_URL||'http://localhost:'+PORT).replace(/\/$/,''),SECURE=BASE.startsWith('https');
const SECRET=E.SESSION_SECRET||(console.warn('SESSION_SECRET is not set: logins reset on every restart'),crypto.randomBytes(32).toString('hex'));
const ADMINS=(E.ADMIN_DISCORD_IDS||'').split(',').map(s=>s.trim()).filter(Boolean);
const COLS=['updates','events','rules','staff','creators','board','reviews','config'];
const DATA_DIR=E.DATA_DIR||__dirname;try{fs.mkdirSync(DATA_DIR,{recursive:true})}catch{}
const FILE=path.join(DATA_DIR,'data.json');
let DB={};try{DB=JSON.parse(fs.readFileSync(FILE,'utf8'))}catch{}
const save=()=>fs.writeFileSync(FILE,JSON.stringify(DB));

const sign=o=>{const p=Buffer.from(JSON.stringify(o)).toString('base64url');return p+'.'+crypto.createHmac('sha256',SECRET).update(p).digest('base64url')};
const unsign=t=>{if(!t)return null;const[p,s]=t.split('.');if(!p||!s)return null;const e=crypto.createHmac('sha256',SECRET).update(p).digest('base64url');if(s.length!==e.length||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(e)))return null;try{const o=JSON.parse(Buffer.from(p,'base64url'));return o.exp>Date.now()?o:null}catch{return null}};
const cookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(c=>c.trim().split(/=(.*)/s).slice(0,2)).filter(a=>a[0]));
const setCookie=(res,n,v,age)=>res.setHeader('Set-Cookie',[].concat(res.getHeader('Set-Cookie')||[],`${n}=${v}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${SECURE?'; Secure':''}`));
const session=req=>unsign(cookies(req).sid);
const isAdmin=s=>!!s&&(s.admin===true||ADMINS.includes(s.id));
const send=(res,code,obj)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(obj===undefined?'':JSON.stringify(obj))};
const redirect=(res,to)=>{res.writeHead(302,{Location:to});res.end()};
const body=req=>new Promise((ok,no)=>{let d='';req.on('data',c=>{d+=c;if(d.length>5e4){no(new Error('too big'));req.destroy()}});req.on('end',()=>{try{ok(d?JSON.parse(d):{})}catch(e){no(e)}})});
const clean=d=>{const o={};for(const[k,v]of Object.entries(d||{})){if(k==='id'||k==='__proto__')continue;if(typeof v==='string')o[k]=v.slice(0,5000);else if(typeof v==='number'&&isFinite(v))o[k]=v}return o};
const tries={};const tooMany=ip=>{const n=Date.now(),a=(tries[ip]||[]).filter(t=>n-t<6e5);a.push(n);tries[ip]=a;return a.length>10};
const eq=(a,c)=>crypto.timingSafeEqual(crypto.createHash('sha256').update(String(a)).digest(),crypto.createHash('sha256').update(String(c)).digest());
const newSession=(res,o)=>setCookie(res,'sid',sign({...o,exp:Date.now()+6048e5}),604800);

async function discordCallback(req,res,url){
  const st=url.searchParams.get('state'),code=url.searchParams.get('code');
  setCookie(res,'st','',0);
  if(!code||!st||st!==cookies(req).st)return redirect(res,'/?login=failed');
  try{
    const t=await(await fetch('https://discord.com/api/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:E.DISCORD_CLIENT_ID,client_secret:E.DISCORD_CLIENT_SECRET,grant_type:'authorization_code',code,redirect_uri:BASE+'/auth/callback'})})).json();
    if(!t.access_token)throw new Error('no token');
    const u=await(await fetch('https://discord.com/api/users/@me',{headers:{Authorization:'Bearer '+t.access_token}})).json();
    if(!u.id)throw new Error('no user');
    const old=session(req);
    newSession(res,{id:u.id,username:u.global_name||u.username,admin:!!(old&&old.admin)});
    redirect(res,'/#reviews');
  }catch(e){console.error('Discord login failed:',e.message);redirect(res,'/?login=failed')}
}

async function api(req,res,col,id){
  if(!COLS.includes(col))return send(res,404,{});
  if(id&&!/^[\w-]{1,64}$/.test(id))return send(res,400,{});
  const s=session(req),adm=isAdmin(s),M=req.method;
  if(M==='GET'&&!id)return send(res,200,Object.entries(DB[col]||{}).map(([i,d])=>({id:i,...d})));
  let b={};
  if(M==='POST'||M==='PUT'||M==='PATCH'){try{b=clean(await body(req))}catch{return send(res,400,{})}}
  const own=col==='reviews'&&!!s&&id===s.id;
  if(!(adm||own))return send(res,s?403:401,{});
  DB[col]=DB[col]||{};
  if(M==='POST'&&!id){const n=crypto.randomUUID();DB[col][n]=b;save();return send(res,200,{id:n})}
  if(!id)return send(res,405,{});
  if(M==='DELETE'){delete DB[col][id];save();return send(res,200,{ok:true})}
  if(own&&!adm){ // players can only write their own valid review
    const r=Number(b.rating);
    if(!b.name||!b.body||!(r>=1&&r<=5))return send(res,400,{});
    b={name:b.name,body:b.body,rating:String(Math.round(r)),ts:(DB[col][id]||{}).ts||Date.now()};
  }
  if(M==='PUT')DB[col][id]=b;
  else if(M==='PATCH')DB[col][id]={...(DB[col][id]||{}),...b};
  else return send(res,405,{});
  save();send(res,200,{ok:true});
}

const MIME={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.webp':'image/webp'};
function serve(res,p){
  const root=path.join(__dirname,'public');let f;
  try{f=path.normalize(path.join(root,p==='/'?'index.html':decodeURIComponent(p)))}catch{res.writeHead(400);return res.end()}
  if(!f.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});res.end(d)});
}

http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,BASE),p=url.pathname;
    if(p==='/auth/discord'){
      if(!E.DISCORD_CLIENT_ID||!E.DISCORD_CLIENT_SECRET){res.writeHead(500);return res.end('Discord login is not configured. See README.md')}
      const st=crypto.randomBytes(16).toString('hex');setCookie(res,'st',st,600);
      return redirect(res,'https://discord.com/api/oauth2/authorize?'+new URLSearchParams({client_id:E.DISCORD_CLIENT_ID,redirect_uri:BASE+'/auth/callback',response_type:'code',scope:'identify',state:st}));
    }
    if(p==='/auth/callback')return discordCallback(req,res,url);
    if(p==='/auth/me'){const s=session(req);return send(res,200,s?{id:s.id,username:s.username,admin:isAdmin(s)}:null)}
    if(p==='/auth/logout'&&req.method==='POST'){setCookie(res,'sid','',0);return send(res,200,{ok:true})}
    if(p==='/auth/admin'&&req.method==='POST'){
      if(!E.ADMIN_USER||!E.ADMIN_PASS)return send(res,403,{});
      if(tooMany(req.socket.remoteAddress))return send(res,429,{});
      let b;try{b=await body(req)}catch{return send(res,400,{})}
      if(!(eq(b.u,E.ADMIN_USER)&eq(b.p,E.ADMIN_PASS)))return send(res,401,{});
      newSession(res,{...(session(req)||{id:'admin',username:'admin'}),admin:true});
      return send(res,200,{ok:true});
    }
    if(p.startsWith('/api/')){const[col,id]=p.slice(5).split('/');return api(req,res,col,id)}
    serve(res,p);
  }catch(e){console.error(e);if(!res.headersSent)res.writeHead(500);res.end()}
}).listen(PORT,()=>console.log('Lolan SMP running at '+BASE));
