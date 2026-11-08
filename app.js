/* shared layout: nav, footer, modals, admin shell */
(function(){
const P=document.body.dataset.page||"";
const L=[["index.html","home","Home"],["modes.html","modes","Gamemodes"],["shop.html","shop","Shop"],["leaderboard.html","board","Leaderboard"],["join.html","join","How to join"]];
document.body.insertAdjacentHTML("afterbegin",`<div class="aurora"><i></i><i></i><i></i></div>
<nav><div class="pill"><a class="brand" href="index.html"><img id="nlogo" alt="" src=""><span id="nname"></span></a>
<div class="nl">${L.map(l=>`<a href="${l[0]}" class="${l[1]===P?"act":""}">${l[2]}</a>`).join("")}</div>
<button class="btn sm" data-copy>Copy IP</button></div></nav>`);
document.body.insertAdjacentHTML("beforeend",`<footer><div class="wrap">© <span id="fn"></span> · Not affiliated with Mojang or Microsoft. <a href="admin.html" style="opacity:.5">Admin</a></div></footer>
<div class="modal" id="bm"><div class="box"><h3 id="bT"></h3><p id="bI"></p><input id="bU" placeholder="Your Minecraft username" maxlength="16" autocomplete="off"><div class="row"><button class="btn" id="bGo">Continue to payment</button><button class="btn g" data-close>Cancel</button></div></div></div>
<aside id="adm" aria-label="Admin panel"><header><b>Admin panel</b><span id="aU" class="note" style="margin:0"></span><button class="btn g sm" id="aX">Close</button></header><div class="tabs" id="tabs"></div><div id="ab"></div>
<div id="af"><button class="btn sm" id="aSv">Save changes</button><button class="btn g sm" id="aEd">Edit page text</button><button class="btn g sm" id="aRs">Discard</button><span id="aSt" class="note" style="width:100%;margin:0"></span></div></aside><div id="toast"></div>`);
})();
const DEF={name:"LolanSMP",host:"play.lolansmp.fun",port:19166,bedrock:"",currency:"₹",discord:"https://discord.gg/YOUR-INVITE",store:"",
 title:"Build, fight and rise on LolanSMP",lead:"Seven gamemodes, one server. Start on a single block, duel your friends, or survive in anarchy.",
 announce:"Welcome to LolanSMP! Join our Discord for events and giveaways.",
 buy:false,logo:"",theme:{},text:{},faq:[{q:"Which version should I use?",a:"The live status on the home page shows the current version. Newer versions usually work too."}],
 board:[{name:"Player1",val:"1,240 kills"},{name:"Player2",val:"980 kills"},{name:"Player3",val:"860 kills"},{name:"Player4",val:"640 kills"}],
 modes:[{n:"OneBlock",e:"🟩",c:"#4ff0b7",g:"Solo or team",t:"Start on a single block that grows into endless resources. Break it, expand your island and unlock new phases."},
 {n:"Skyblock",e:"☁️",c:"#6fd6ff",g:"Co-op",t:"Survive on a floating island. Farm, trade and upgrade your island to climb the leaderboard."},
 {n:"Duels",e:"⚔️",c:"#ff5470",g:"PvP",t:"1v1 fights with ranked kits. Test your PvP skill and move up the ladder."},
 {n:"TNT Tag",e:"💣",c:"#ff8a5f",g:"Minigame",t:"One player carries the TNT. Pass it on before it blows. Last one standing wins."},
 {n:"TNT Run",e:"🧨",c:"#ffc857",g:"Minigame",t:"Keep running! The floor vanishes under your feet. Don’t fall into the void."},
 {n:"Anarchy",e:"💀",c:"#b48cff",g:"Hardcore",t:"No rules and no protection. Raid, trap and survive in a lawless world."},
 {n:"Survival",e:"🌲",c:"#7bdc8a",g:"Classic",t:"Classic survival with claims, a player economy and friendly neighbours."}],
 ranks:[{n:"VIP",p:99,c:"#4ff0b7",f:["Colored VIP tag in chat","Daily VIP kit","2 extra homes","Join when full"]},
 {n:"MVP",p:199,c:"#6fd6ff",f:["Everything in VIP","Colored nickname","Lobby fly","5 extra homes"]},
 {n:"Elite",p:299,c:"#ffc857",hot:1,f:["Everything in MVP","Exclusive Elite kit","Custom join message","Priority support"]},
 {n:"Legend",p:399,c:"#ff5fa2",f:["Everything in Elite","Particle trails","/nick and /hat","Monthly crate keys"]}]};
let C=JSON.parse(JSON.stringify(DEF)),admin=false,cur;
const $=s=>(document.querySelector(s)||document.createElement("div")),esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const addr=()=>C.host+":"+C.port,toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("s");setTimeout(()=>t.classList.remove("s"),2200)};

const FALLBACK="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#1c1e55"/><path d="M10 22l22-10 22 10-22 10z" fill="#7bdc8a"/><path d="M10 22v22l22 10V32z" fill="#8b5a2b"/><path d="M54 22v22L32 54V32z" fill="#6b4421"/></svg>');
let SRV_ICON="";
function render(){render0();post()}
function render0(){
 document.title=(document.body.dataset.t?document.body.dataset.t+" – ":"")+C.name;
 $("#nname").textContent=C.name;$("#fn").textContent=C.name;$("#hT").textContent=C.title;$("#hL").textContent=C.lead;
 ["#nlogo","#logo"].forEach(s=>{const i=$(s);i.onerror=()=>{i.onerror=null;i.src=FALLBACK};i.src=C.logo||SRV_ICON||"https://api.mcsrvstat.us/icon/"+addr()});$("#ip").textContent=addr();$("#dc").href=C.discord;$("#ann").textContent=C.announce;
 const b=$("#bed");b.style.display=C.bedrock?"block":"none";b.textContent=C.bedrock?"Bedrock port: "+C.bedrock:"";
 $("#lb").innerHTML=C.board.map((r,i)=>`<li><span><span class="rk">${i+1}</span>${esc(r.name)}</span><b>${esc(r.val)}</b></li>`).join("");
 $("#rail").innerHTML=C.modes.map(m=>`<article class="tile mode" style="--c:${esc(m.c)}"><div class="art${m.i?" im":""}"${m.i?` style="--img:url(${esc(encodeURI(m.i).replace(/["'()]/g,""))})"`:""}><span>${m.i?"":esc(m.e)}</span></div><div class="tx"><h3>${esc(m.n)}</h3><p>${esc(m.t)}</p><span class="chip">${esc(m.g)}</span></div></article>`).join("");
 $("#shopG").innerHTML=C.ranks.map((r,i)=>`<div class="tile rank${r.hot?" hot":""}" style="--c:${esc(r.c)}"><span class="tag">${esc(r.n)}${r.hot?" · best value":""}</span><div class="price">${esc(C.currency)}${esc(r.p)} <small>one time</small></div><ul>${r.f.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>${C.buy?`<button class="btn${r.hot?" p":""}" data-rank="${i}">Buy ${esc(r.n)}</button>`:""}</div>`).join("");
}
async function load(){
 try{const r=await fetch("config.json?v="+Date.now(),{cache:"no-store"});if(r.ok){const d=await r.json();Object.keys(d).forEach(k=>C[k]=d[k])}}catch(e){}
 C.theme=C.theme||{};C.text=C.text||{};render();status();
}
async function status(){
 try{const d=await (await fetch("https://api.mcsrvstat.us/3/"+addr())).json(),on=!!d.online;
  $("#st").className="st "+(on?"on":"off");$("#stT").textContent=on?"Online":"Offline";
  $("#motd").textContent=on&&d.motd?d.motd.clean.map(s=>s.trim()).join("\n"):"Server is offline right now.";
  const o=on?d.players.online:0,m=on?d.players.max:0;$("#pc").textContent=m?o+" / "+m:o;$("#fill").style.width=m?Math.min(100,o/m*100)+"%":"0";
  $("#ver").textContent=on&&d.version?"Version "+d.version:"";SRV_ICON=(on&&d.icon)||"";if(!C.logo&&SRV_ICON)$("#nlogo").src=$("#logo").src=SRV_ICON;
  $("#heads").innerHTML=((on&&d.players.list)||[]).slice(0,14).map(p=>`<img title="${esc(p.name)}" alt="${esc(p.name)}" src="https://mc-heads.net/avatar/${encodeURIComponent(p.name)}/26">`).join("");
  $("#note").textContent="Live status, refreshes every 30 s.";
 }catch(e){$("#stT").textContent="Status unavailable";$("#note").textContent="Live status works once the page is hosted online."}
}
setInterval(status,30000);

document.addEventListener("click",async e=>{
 if(e.target.closest("[data-copy]")){try{await navigator.clipboard.writeText(addr())}catch(_){}toast("Copied "+addr())}
 if(e.target.closest("[data-close]")||e.target.classList.contains("modal"))document.querySelectorAll(".modal").forEach(m=>m.classList.remove("o"));
 const b=e.target.closest("[data-rank]");if(b){cur=C.ranks[+b.dataset.rank];$("#bT").textContent="Buy "+cur.n;$("#bI").textContent=`${cur.n} costs ${C.currency}${cur.p} (one time). Enter your exact Minecraft username.`;$("#bm").classList.add("o");$("#bU").focus()}});
$("#bGo").onclick=()=>{const u=$("#bU").value.trim();if(!/^[A-Za-z0-9_.]{3,16}$/.test(u))return toast("Enter a valid username");
 const S=cur.u||C.store;if(S)location.href=S+(S.includes("?")?"&":"?")+"rank="+encodeURIComponent(cur.n)+"&user="+encodeURIComponent(u);
 else{navigator.clipboard&&navigator.clipboard.writeText(`I want ${cur.n} (${C.currency}${cur.p}). Username: ${u}`).catch(()=>{});toast("Order copied. Paste it in a Discord ticket.");window.open(C.discord,"_blank","noopener")}
 $("#bm").classList.remove("o")};

/* mouse effects: spotlight + tilt on tiles, aurora parallax */
const blobs=[...document.querySelectorAll(".aurora i")];
addEventListener("mousemove",e=>{const nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;
 blobs.forEach((b,i)=>b.style.transform=`translate(${nx*(i+1)*60}px,${ny*(i+1)*60}px)`);
 document.querySelectorAll(".tile").forEach(t=>{const r=t.getBoundingClientRect();
  if(e.clientX>r.left&&e.clientX<r.right&&e.clientY>r.top&&e.clientY<r.bottom){const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
   t.style.setProperty("--x",x*100+"%");t.style.setProperty("--y",y*100+"%");
   if(!t.classList.contains("t-hero"))t.style.transform=`perspective(800px) rotateY(${(x-.5)*8}deg) rotateX(${(.5-y)*8}deg)`}
  else if(t.style.transform)t.style.transform=""})});

/* ===== extra rendering: theme, FAQ, editable texts ===== */
function cands(){const P=document.body.dataset.page||"";return [...document.querySelectorAll("main h1,main h2,main h3,main p,main summary,main .lab,main .btn,main .sub")].filter(e=>!e.id&&!e.children.length&&!e.closest("#rail,#shopG,#lb,#heads,#faqList,.big")).map((e,i)=>[P+":"+i,e])}
function post(){
 ["bg","mint","pink","sun"].forEach(k=>C.theme&&C.theme[k]?document.documentElement.style.setProperty("--"+k,C.theme[k]):document.documentElement.style.removeProperty("--"+k));
 $("#faqList").innerHTML=(C.faq||[]).map(f=>`<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
 cands().forEach(([k,e])=>{if(C.text&&C.text[k]!=null)e.textContent=C.text[k];if(editMode){e.contentEditable="true";e.classList.add("ed")}});
}
/* ===== ADMIN: real login (Discord / Google) + save to server ===== */
let ME={user:null,admin:false},dirty=false,editMode=false,tab="general";
/* GitHub Pages mode: no server. Login = a GitHub token with write access to the repo. Saving commits config.json. */
const GH={get t(){try{return localStorage.getItem("ghtok")||""}catch(e){return ""}},get repo(){try{return localStorage.getItem("ghrepo")||""}catch(e){return ""}}};
const ghH=()=>({Authorization:"Bearer "+GH.t,Accept:"application/vnd.github+json"});
const rsp=(o,st=200)=>({ok:st<300,status:st,json:async()=>o});
async function api(p,o={}){
 if(p==="/api/me"){const no=rsp({user:null,admin:false,providers:{}});if(!GH.t||!GH.repo)return no;
  try{const r=await fetch("https://api.github.com/repos/"+GH.repo,{headers:ghH()}),d=await r.json();
   if(!r.ok||!d.permissions||!d.permissions.push)return no;return rsp({user:{name:GH.repo,provider:"github",ref:GH.repo},admin:true,providers:{}})}catch(e){return no}}
 if(p==="/api/config"&&o.method==="POST"){
  const u="https://api.github.com/repos/"+GH.repo+"/contents/config.json";let sha;
  try{const g=await fetch(u,{headers:ghH(),cache:"no-store"});if(g.ok)sha=(await g.json()).sha}catch(e){}
  const content=btoa(unescape(encodeURIComponent(JSON.stringify(JSON.parse(o.body),null,2))));
  try{const r=await fetch(u,{method:"PUT",headers:{...ghH(),"Content-Type":"application/json"},body:JSON.stringify({message:"Update site config from admin panel",content,sha})});return rsp({},r.ok?200:r.status)}catch(e){return rsp({},500)}}
 return rsp({error:"not available on GitHub Pages"},404)}
const SCHEMA={
 general:[["name","Server name"],["host","Server IP / domain"],["port","Port","num"],["bedrock","Bedrock port (optional)"],["logo","Logo image URL (optional)"],["currency","Currency symbol"],["buy","Show Buy buttons (turns the payment flow on)","bool"],["discord","Discord invite URL"],["store","Store / payment URL (optional)"],["title","Hero title"],["lead","Hero text","area"]],
 theme:{obj:"theme",f:[["bg","Background color","color"],["mint","Main accent","color"],["pink","Second accent","color"],["sun","Highlight","color"]]},
 announce:[["announce","Announcement text","area"]],
 modes:{key:"modes",blank:{n:"New mode",e:"🎮",c:"#4ff0b7",g:"Tag",t:"Description",i:""},f:[["n","Name"],["e","Emoji"],["i","Image URL (optional)"],["c","Color (hex)"],["g","Tag"],["t","Description","area"]]},
 ranks:{key:"ranks",blank:{n:"New",p:0,c:"#4ff0b7",f:["Perk"],u:""},f:[["n","Name"],["p","Price","num"],["c","Color (hex)"],["f","Perks (one per line)","lines"],["u","Buy link (optional, overrides store URL)"],["hot","Highlight as best value","bool"]]},
 board:{key:"board",blank:{name:"Player",val:"0"},f:[["name","Player"],["val","Score"]]},
 faq:{key:"faq",blank:{q:"Question",a:"Answer"},f:[["q","Question"],["a","Answer","area"]]},
};
const markDirty=()=>{dirty=true;$("#aSt").textContent="Unsaved changes. Click Save changes."};
const save=()=>{markDirty();render()};
function field(o,[k,l,t],path){let v=o[k];if(k==="logo"&&String(v).startsWith("data:"))v="";if(t==="lines")v=(v||[]).join("\n");
 const a=`data-p="${path}" data-k="${k}" data-t="${t||""}"`;
 if(t==="bool")return `<label><input type="checkbox" ${a} ${v?"checked":""} style="width:auto;display:inline;margin-right:6px">${l}</label>`;
 if(t==="color"){const d=getComputedStyle(document.documentElement).getPropertyValue("--"+k).trim();return `<label>${l}</label><input type="color" ${a} value="${esc(v||d)}" style="height:42px;padding:3px">`}
 return `<label>${l}</label>`+((t==="area"||t==="lines")?`<textarea rows="${t==="lines"?4:3}" ${a}>${esc(v)}</textarea>`:`<input ${a} type="text" value="${esc(v)}">`)}
async function drawAdmin(){
 $("#tabs").innerHTML=Object.keys(SCHEMA).map(t=>`<button class="${t===tab?"a":""}" data-tab="${t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join("");
 $("#aU").textContent=ME.user?ME.user.name:"";
 const s=SCHEMA[tab];let h="";
 if(tab==="admins"){$("#ab").textContent="Loading…";const r=await api("/api/admins"),d=r.ok?await r.json():{discord:[],google:[]};
  h=`<p class="note" style="margin:0 0 12px">Only people listed here can log in and edit. Use Discord user IDs and Google email addresses. Admins set in the server .env file always stay.</p><label>Discord user IDs (one per line)</label><textarea id="ad1" rows="4">${esc(d.discord.join("\n"))}</textarea><label>Google emails (one per line)</label><textarea id="ad2" rows="4">${esc(d.google.join("\n"))}</textarea><button class="btn sm" id="adSave">Save admins</button><hr style="border:0;border-top:1px solid var(--bd);margin:20px 0"><label>Password accounts</label>${(d.users||[]).map(n=>`<div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px"><span>${esc(n)}</span><button class="btn g sm" data-udel="${esc(n)}">Delete</button></div>`).join("")||`<p class="note" style="margin:0 0 8px">None yet.</p>`}<label style="margin-top:12px">Add an account, or enter an existing username to reset its password</label><input id="un" placeholder="Username" autocomplete="off"><input id="up" type="password" placeholder="Password (8+ characters)" autocomplete="new-password"><button class="btn sm" id="uAdd">Save account</button>`}
 else if(Array.isArray(s))h=s.map(f=>field(C,f,"")).join("")+(tab==="general"?`<label>Or upload a logo (PNG or JPG, under 300 KB)</label><input type="file" id="logoF" accept="image/*"><button class="btn g sm" id="logoX">Use the server icon instead</button>`:"");
 else if(s.obj)h=s.f.map(f=>field(C[s.obj],f,s.obj+".")).join("")+`<button class="btn g sm" id="thX">Reset to default colors</button>`;
 else h=C[s.key].map((o,i)=>`<div class="it"><div class="row" style="justify-content:space-between;margin-bottom:10px"><b>#${i+1}</b><span class="row"><button class="btn g sm" data-mv="${i}">Move up</button><button class="btn g sm" data-del="${i}">Delete</button></span></div>${s.f.map(f=>field(o,f,s.key+"."+i+".")).join("")}</div>`).join("")+`<button class="btn sm" data-add="1">Add new</button>`;
 $("#ab").innerHTML=h}
$("#ab").addEventListener("input",e=>{const el=e.target,p=el.dataset.p;if(p===undefined)return;let o=C;p.split(".").filter(Boolean).forEach(x=>o=o[x]);const k=el.dataset.k,t=el.dataset.t;
 o[k]=t==="bool"?el.checked:t==="num"?Number(el.value)||0:t==="lines"?el.value.split("\n").filter(Boolean):el.value;save();if(k==="host"||k==="port")status()});
$("#ab").addEventListener("click",async e=>{const s=SCHEMA[tab],b=e.target;
 if(b.id==="adSave"){const L=id=>$("#"+id).value.split("\n").map(x=>x.trim()).filter(Boolean);const r=await api("/api/admins",{method:"POST",body:JSON.stringify({discord:L("ad1"),google:L("ad2")})});toast(r.ok?"Admins saved":"Could not save admins");return}
 if(b.id==="thX"){C.theme={};save();drawAdmin();toast("Default colors restored. Click Save changes.");return}
 if(b.id==="logoX"){C.logo="";save();drawAdmin();toast("Using the server icon. Click Save changes.");return}
 if(b.id==="uAdd"){const r=await api("/api/users",{method:"POST",body:JSON.stringify({username:$("#un").value,password:$("#up").value})});let m="";try{m=(await r.json()).error||""}catch(e){}toast(r.ok?"Account saved":m||"Could not save account");if(r.ok)drawAdmin();return}
 if(b.dataset.udel){if(!confirm("Delete account "+b.dataset.udel+"?"))return;const r=await api("/api/users/delete",{method:"POST",body:JSON.stringify({username:b.dataset.udel})});let m="";try{m=(await r.json()).error||""}catch(e){}toast(r.ok?"Account deleted":m||"Could not delete");if(r.ok)drawAdmin();return}
 if(!s||!s.key)return;
 if(b.dataset.add){C[s.key].push(JSON.parse(JSON.stringify(s.blank)));save();drawAdmin()}
 if(b.dataset.del!==undefined){C[s.key].splice(+b.dataset.del,1);save();drawAdmin()}
 if(b.dataset.mv!==undefined){const i=+b.dataset.mv;if(i>0){[C[s.key][i-1],C[s.key][i]]=[C[s.key][i],C[s.key][i-1]];save();drawAdmin()}}});
$("#ab").addEventListener("change",e=>{if(e.target.id!=="logoF")return;const f=e.target.files[0];if(!f)return;if(f.size>300*1024){toast("Image is too big. Use one under 300 KB.");return}const r=new FileReader();r.onload=()=>{C.logo=r.result;save();toast("Logo updated. Click Save changes.")};r.readAsDataURL(f)});
$("#tabs").onclick=e=>{if(e.target.dataset.tab){tab=e.target.dataset.tab;drawAdmin()}};
$("#aSv").onclick=async()=>{$("#aSt").textContent="Saving…";const r=await api("/api/config",{method:"POST",body:JSON.stringify(C)});
 if(r.ok){dirty=false;$("#aSt").textContent="Saved to GitHub. The site updates in about a minute.";toast("Saved")}else $("#aSt").textContent=r.status===403?"Not allowed. Log in again.":"Save failed ("+r.status+")"};
$("#aRs").onclick=()=>{dirty=false;location.reload()};
function setEdit(on){editMode=on;cands().forEach(([k,e])=>{e.contentEditable=on?"true":"inherit";e.classList.toggle("ed",on)});$("#aEd").textContent=on?"Stop editing text":"Edit page text";if(on)toast("Click any text on the page to edit it")}
$("#aEd").onclick=()=>setEdit(!editMode);
addEventListener("input",e=>{if(!editMode||!e.target.classList||!e.target.classList.contains("ed"))return;const c=cands().find(([k,el])=>el===e.target);if(c){(C.text=C.text||{})[c[0]]=e.target.textContent;markDirty()}});
addEventListener("click",e=>{if(editMode&&e.target.closest(".ed")){e.preventDefault();e.stopPropagation()}},true);
addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue=""}});
$("#aX").onclick=()=>{$("#adm").classList.remove("o");if(editMode)setEdit(false)};
function openAdmin(){drawAdmin();$("#adm").classList.add("o")}
async function initAdmin(){
 try{ME=await (await api("/api/me")).json()}catch(e){}
 const box=document.getElementById("loginBox"),pv=ME.providers||{};
 if(box){let h="";
  if(!ME.user)h=`<h3 style="font:800 20px var(--h)">Log in</h3><p class="sub" style="margin:6px 0 14px">Sign in with a GitHub token that can write to this site’s repository. Only people with write access to the repo can edit.</p><input id="ghrepo" placeholder="owner/repo" value="${esc(GH.repo||(location.hostname.endsWith(".github.io")?location.hostname.split(".")[0]+"/"+((x=>x&&!x.includes(".")?x:location.hostname)(location.pathname.split("/")[1])):""))}"><input id="ghtok" type="password" placeholder="GitHub token" autocomplete="off"><div class="row"><button class="btn" id="lgo">Log in</button></div><p class="note" id="lerr"></p>`;
  else if(!ME.admin)h=`<h3 style="font:800 20px var(--h)">Signed in as ${esc(ME.user.name)}</h3><p class="sub" style="margin:6px 0 16px">This account is not an admin yet. Send this to the owner so they can approve you: <b>${esc(ME.user.ref)}</b></p><a class="btn g" href="#" data-out>Log out</a>`;
  else h=`<h3 style="font:800 20px var(--h)">Welcome, ${esc(ME.user.name)}</h3><p class="sub" style="margin:6px 0 16px">Edit gamemodes, ranks, colors, FAQ and page text. Saves go to your GitHub repo, and the site updates about a minute later.</p><div class="row"><button class="btn" id="openAd">Open admin panel</button><a class="btn g" href="#" data-out>Log out</a></div>`;
  box.innerHTML=h;$("#openAd").onclick=openAdmin;const go=$("#lgo");go.onclick=async()=>{const repo=$("#ghrepo").value.trim(),t=$("#ghtok").value.trim();if(!/^[\w.-]+\/[\w.-]+$/.test(repo)||!t){$("#lerr").textContent="Enter the repo as owner/repo and paste your token.";return}
 try{localStorage.setItem("ghrepo",repo);localStorage.setItem("ghtok",t)}catch(e){}
 const r=await (await api("/api/me")).json();if(r.admin)location.reload();else{try{localStorage.removeItem("ghtok")}catch(e){}$("#lerr").textContent="That token can’t write to this repo. Check the repo name and that the token has Contents: Read and write."}};$("#ghtok").onkeydown=e=>{if(e.key==="Enter")go.click()}}
 else if(ME.admin){const f=document.createElement("button");f.className="btn sm";f.textContent="Edit site";f.style.cssText="position:fixed;right:16px;bottom:16px;z-index:60";f.onclick=openAdmin;document.body.append(f)}
}
document.addEventListener("click",e=>{if(e.target.closest("[data-out]")){e.preventDefault();try{localStorage.removeItem("ghtok")}catch(_){}location.reload()}});
load().then(initAdmin);
