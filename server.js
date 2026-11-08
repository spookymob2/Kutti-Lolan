// LolanSMP site server: serves ./public, Discord/Google login, admin-only saving. No dependencies (Node 18+).
const http=require("http"),fs=require("fs"),path=require("path"),crypto=require("crypto");
try{for(const l of fs.readFileSync(path.join(__dirname,".env"),"utf8").split(/\r?\n/)){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);if(m&&!(m[1] in process.env))process.env[m[1]]=m[2].replace(/^["']|["']$/g,"")}}catch{}
const E=process.env,PORT=+E.PORT||3000,BASE=(E.BASE_URL||`http://localhost:${PORT}`).replace(/\/$/,""),SECURE=BASE.startsWith("https");
const SECRET=E.SESSION_SECRET||crypto.randomBytes(32).toString("hex");
if(!E.SESSION_SECRET)console.warn("! SESSION_SECRET not set: logins reset on every restart.");
const PUB=path.join(__dirname,"public"),DATA=path.join(__dirname,"data");
const qs=o=>new URLSearchParams(o).toString(),redir=k=>`${BASE}/auth/${k}/callback`;
const PROV={
 discord:{id:E.DISCORD_CLIENT_ID,sec:E.DISCORD_CLIENT_SECRET,auth:s=>"https://discord.com/oauth2/authorize?"+qs({client_id:E.DISCORD_CLIENT_ID,response_type:"code",redirect_uri:redir("discord"),scope:"identify",state:s})},
 google:{id:E.GOOGLE_CLIENT_ID,sec:E.GOOGLE_CLIENT_SECRET,auth:s=>"https://accounts.google.com/o/oauth2/v2/auth?"+qs({client_id:E.GOOGLE_CLIENT_ID,response_type:"code",redirect_uri:redir("google"),scope:"openid email profile",state:s})}};
/* signed cookies */
const hm=s=>crypto.createHmac("sha256",SECRET).update(s).digest("base64url");
const sign=o=>{const p=Buffer.from(JSON.stringify(o)).toString("base64url");return p+"."+hm(p)};
const unsign=s=>{if(!s)return null;const[i,m]=s.split(".");if(!m)return null;const e=hm(i);if(e.length!==m.length||!crypto.timingSafeEqual(Buffer.from(e),Buffer.from(m)))return null;try{const o=JSON.parse(Buffer.from(i,"base64url"));return o.exp>Date.now()?o:null}catch{return null}};
const cookies=r=>Object.fromEntries((r.headers.cookie||"").split(/;\s*/).filter(Boolean).map(c=>{const i=c.indexOf("=");return[c.slice(0,i),decodeURIComponent(c.slice(i+1))]}));
const setCookie=(res,n,v,age)=>res.setHeader("Set-Cookie",[].concat(res.getHeader("Set-Cookie")||[],`${n}=${encodeURIComponent(v)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${SECURE?"; Secure":""}`));
/* storage */
const fread=(f,d)=>{try{return JSON.parse(fs.readFileSync(path.join(DATA,f),"utf8"))}catch{return d}};
const fwrite=(f,o)=>{fs.mkdirSync(DATA,{recursive:true});const t=path.join(DATA,f+".tmp");fs.writeFileSync(t,JSON.stringify(o,null,2));fs.renameSync(t,path.join(DATA,f))};
const list=v=>(v||"").split(",").map(s=>s.trim()).filter(Boolean),uniq=a=>[...new Set(a)];
const admins=()=>{const f=fread("admins.json",{});return{discord:uniq([...list(E.ADMIN_DISCORD_IDS),...(f.discord||[])]),google:uniq([...list(E.ADMIN_GOOGLE_EMAILS),...(f.google||[])].map(s=>s.toLowerCase()))}};
/* password accounts (scrypt hashes in data/users.json) */
const users=()=>fread("users.json",{});
const hashPw=(pw,salt=crypto.randomBytes(16).toString("hex"))=>salt+":"+crypto.scryptSync(pw,salt,64).toString("hex");
const checkPw=(pw,st)=>{const[s,h]=String(st||"").split(":");if(!h)return false;const a=Buffer.from(crypto.scryptSync(pw,s,64).toString("hex")),b=Buffer.from(h);return a.length===b.length&&crypto.timingSafeEqual(a,b)};
if(E.ADMIN_USERNAME&&E.ADMIN_PASSWORD){const us=users(),n=E.ADMIN_USERNAME.toLowerCase();if(!us[n]){us[n]={h:hashPw(E.ADMIN_PASSWORD)};fwrite("users.json",us);console.log("Created admin account: "+n)}}
const tries={};
const isAdmin=u=>!!u&&(u.p==="discord"?admins().discord.includes(u.id):u.p==="local"?!!users()[u.id]:admins().google.includes(String(u.id).toLowerCase()));
/* helpers */
const json=(res,c,o)=>{res.writeHead(c,{"Content-Type":"application/json","Cache-Control":"no-store"});res.end(JSON.stringify(o))};
const text=(res,c,t)=>{res.writeHead(c,{"Content-Type":"text/plain; charset=utf-8"});res.end(t)};
const go=(res,u)=>{res.writeHead(302,{Location:u});res.end()};
const body=r=>new Promise((ok,no)=>{let b="",n=0;r.on("data",c=>{n+=c.length;if(n>1e6){no(new Error("too big"));r.destroy()}else b+=c});r.on("end",()=>ok(b));r.on("error",no)});
const post=async(url,opt)=>(await fetch(url,opt)).json();
/* providers */
async function discordUser(code){const t=await post("https://discord.com/api/oauth2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:qs({client_id:PROV.discord.id,client_secret:PROV.discord.sec,grant_type:"authorization_code",code,redirect_uri:redir("discord")})});
 if(!t.access_token)throw new Error("Discord rejected the login");const d=await post("https://discord.com/api/users/@me",{headers:{Authorization:"Bearer "+t.access_token}});if(!d.id)throw new Error("No Discord profile");return{p:"discord",id:d.id,name:d.global_name||d.username}}
async function googleUser(code){const t=await post("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:qs({client_id:PROV.google.id,client_secret:PROV.google.sec,grant_type:"authorization_code",code,redirect_uri:redir("google")})});
 if(!t.access_token)throw new Error("Google rejected the login");const d=await post("https://openidconnect.googleapis.com/v1/userinfo",{headers:{Authorization:"Bearer "+t.access_token}});if(!d.email||!d.email_verified)throw new Error("Google email not verified");return{p:"google",id:d.email.toLowerCase(),name:d.name||d.email}}
const MIME={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".ico":"image/x-icon"};

http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,BASE),p=u.pathname,sess=unsign(cookies(req).sid),user=sess&&sess.u,adm=isAdmin(user);
  res.setHeader("X-Content-Type-Options","nosniff");
  if(p==="/auth/logout"){setCookie(res,"sid","",0);return go(res,"/admin.html")}
  let m=p.match(/^\/auth\/(discord|google)$/);
  if(m){const k=m[1];if(!PROV[k].id)return text(res,404,k+" login is not configured on this server.");const s=crypto.randomBytes(16).toString("hex");setCookie(res,"st",sign({s,exp:Date.now()+6e5}),600);return go(res,PROV[k].auth(s))}
  m=p.match(/^\/auth\/(discord|google)\/callback$/);
  if(m){const st=unsign(cookies(req).st),code=u.searchParams.get("code");if(!st||st.s!==u.searchParams.get("state")||!code)return text(res,400,"Login failed. Go back and try again.");
   try{const usr=await(m[1]==="discord"?discordUser:googleUser)(code);setCookie(res,"sid",sign({u:usr,exp:Date.now()+7*864e5}),7*86400);setCookie(res,"st","",0);return go(res,"/admin.html")}catch(e){return text(res,500,"Login failed: "+e.message)}}
  if(p==="/auth/login"&&req.method==="POST"){
   if(req.headers["x-requested-with"]!=="fetch"||(req.headers.origin&&req.headers.origin!==BASE))return json(res,403,{error:"bad request"});
   const ip=((E.TRUST_PROXY&&req.headers["x-forwarded-for"])||"").split(",")[0].trim()||req.socket.remoteAddress,t=Date.now(),a=(tries[ip]||[]).filter(x=>t-x<6e5);
   if(a.length>=8)return json(res,429,{error:"Too many attempts. Try again in 10 minutes."});
   let d;try{d=JSON.parse(await body(req))}catch{return json(res,400,{error:"bad json"})}
   const n=String(d.username||"").toLowerCase(),us=users(),ok=us[n]?checkPw(String(d.password||""),us[n].h):(hashPw("x"),false);
   if(!ok){a.push(t);tries[ip]=a;return json(res,401,{error:"Wrong username or password"})}
   delete tries[ip];setCookie(res,"sid",sign({u:{p:"local",id:n,name:n},exp:Date.now()+7*864e5}),7*86400);return json(res,200,{ok:true})}
  if(p==="/api/me")return json(res,200,{user:user?{name:user.name,provider:user.p,ref:({discord:"Discord ID ",google:"Google email ",local:"Username "}[user.p])+user.id}:null,admin:adm,providers:{discord:!!PROV.discord.id,google:!!PROV.google.id}});
  if(p==="/api/config"&&req.method==="GET")return json(res,200,fread("config.json",{}));
  if(p.startsWith("/api/")&&req.method==="POST"){
   if(req.headers["x-requested-with"]!=="fetch"||(req.headers.origin&&req.headers.origin!==BASE))return json(res,403,{error:"bad request"});
   if(!adm)return json(res,403,{error:"admins only"});
   let d;try{d=JSON.parse(await body(req))}catch{return json(res,400,{error:"bad json"})}
   if(p==="/api/config"){if(!d||typeof d!=="object"||Array.isArray(d))return json(res,400,{error:"bad config"});delete d.passHash;fwrite("config.json",d);return json(res,200,{ok:true})}
   if(p==="/api/admins"){const a=x=>Array.isArray(x)?x.map(String).map(s=>s.trim()).filter(Boolean).slice(0,100):[];fwrite("admins.json",{discord:a(d.discord),google:a(d.google).map(s=>s.toLowerCase())});return json(res,200,{ok:true})}
   if(p==="/api/users"){const n=String(d.username||"").toLowerCase(),pw=String(d.password||"");if(!/^[a-z0-9_.-]{3,32}$/.test(n))return json(res,400,{error:"Username: 3-32 letters, numbers, . _ -"});if(pw.length<8)return json(res,400,{error:"Password must be at least 8 characters"});const us=users();us[n]={h:hashPw(pw)};fwrite("users.json",us);return json(res,200,{ok:true})}
   if(p==="/api/users/delete"){const n=String(d.username||"").toLowerCase(),us=users();if(!us[n])return json(res,404,{error:"No such account"});if(user.p==="local"&&user.id===n)return json(res,400,{error:"You can’t delete your own account"});delete us[n];fwrite("users.json",us);return json(res,200,{ok:true})}
  }
  if(p==="/api/admins"&&req.method==="GET"){if(!adm)return json(res,403,{error:"admins only"});return json(res,200,{...admins(),users:Object.keys(users())})}
  if(p.startsWith("/api/"))return json(res,404,{error:"not found"});
  const f=path.normalize(path.join(PUB,p==="/"?"index.html":p));
  if(!f.startsWith(PUB+path.sep)||path.basename(f).startsWith(".")||!fs.existsSync(f)||!fs.statSync(f).isFile())return text(res,404,"Not found");
  res.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream","Cache-Control":"no-cache"});fs.createReadStream(f).pipe(res);
 }catch(e){console.error(e);if(!res.headersSent)text(res,500,"Server error")}
}).listen(PORT,()=>console.log(`LolanSMP site running at ${BASE}  (admins: ${admins().discord.length} Discord, ${admins().google.length} Google)`));
