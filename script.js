const S={
 updates:{l:'Updates',f:[['title','Title','text'],['author','Posted by','text'],['body','Changes (one per line)','area']]},
 events:{l:'Events',f:[['title','Event name','text'],['when','Date and time','text'],['status','Status','select',['Upcoming','Live','Ended']],['body','Details','area']]},
 rules:{l:'Rules',asc:1,f:[['title','Rule','text'],['body','Explanation','area']]},
 staff:{l:'Staff',asc:1,f:[['name','Name','text'],['role','Role','select',['Owner','Admin','Mod','Helper']]]},
 creators:{l:'Creators',f:[['name','Creator','text'],['platform','Platform','select',['YouTube','Twitch','Instagram','Other']],['url','Link (https://…)','text']]},
 reviews:{l:'Reviews',f:[['name','Player name','text'],['rating','Rating','select',['5','4','3','2','1']],['body','Review','area']]},
 board:{l:'Leaderboard',asc:1,f:[['category','Category','select',['Kills','Deaths','Playtime','Blocks mined','Balance','Shards']],['player','Player','text'],['value','Value','text']]}
};
const CFG=[['name','Server name'],['tagline','Tagline'],['status','Server status','select',['Online','Offline']],['online','Players online'],['max','Max players'],['java','Java IP'],['bedrock','Bedrock IP and port'],['discord','Discord link (https://…)']];
const PAGES=[['home','Home'],['updates','Updates'],['events','Events'],['rules','Rules'],['board','Leaderboards'],['staff','Staff'],['creators','Creators'],['reviews','Reviews']];
const ADMIN_USER='admin',ADMIN_PASS='admin';
let uid=null,live=null,db=null,admin=false,cfg={},data={},route='home',tab='updates',edit=null,cat=null;
(function(){const sw=b=>{let r='';const R=(x,y,c)=>{r+=`<rect x='${x}' y='${y}' width='1' height='1' fill='${c}'/>`};
for(let i=0;i<9;i++){R(i+1,i,'#0b2e33');R(i,i+1,'#0b2e33')}
for(let i=0;i<9;i++)R(i,i,b);
[[6,12],[7,11],[8,10],[9,9],[10,8],[11,7],[12,6]].forEach(([x,y])=>R(x,y,'#9a6a35'));
[[10,10],[11,11],[12,12]].forEach(([x,y])=>R(x,y,'#6b4423'));R(13,13,'#f5c542');
return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 16 16' shape-rendering='crispEdges'>${r}</svg>`)}")`};
const s=document.documentElement.style;s.setProperty('--cur',sw('#5eead4'));s.setProperty('--cur2',sw('#ffd23f'))})();

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const C=k=>cfg[k]||({name:'Lolan SMP',tagline:'Survival multiplayer for Java and Bedrock',java:'play.lolansmp.fun',bedrock:'play.lolansmp.fun:19166'}[k]??'');
const rows=k=>{const r=[...(data[k]||[])].sort((a,b)=>(a.ts||0)-(b.ts||0));return S[k].asc?r:r.reverse()};
const ago=t=>{const d=(Date.now()-t)/864e5;return d<1?'Today':d<2?'Yesterday':Math.floor(d)+' days ago'};
const safeUrl=u=>/^https?:\/\//i.test(u||'')?esc(u):'#';
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),1800)}

function navHtml(){return `<div class="brand"><i></i>${esc(C('name'))}</div>`+PAGES.map(([r,l])=>`<a href="#${r}" class="${route==r?'on':''}">${l}</a>`).join('')+`<a href="#admin" class="adm ${route=='admin'?'on':''}">${admin?'Admin panel':'Admin login'}</a>`+'<div class="sp"></div>'}

const views={
 home(){const L=live,up=L?L.online:C('status')!=='Offline',o=L?L.players:C('online'),m=L?L.max:C('max');
  return `<h1>${esc(C('name'))}</h1><p class="sub">${esc(C('tagline'))}</p>
  <span class="pill"><span class="dot" style="background:${up?'#2fb344':'#e03131'}"></span>${up?'Online':'Offline'}${up&&o!==''?', '+esc(o)+(m?' / '+esc(m):'')+' players':''}</span> <small style="color:var(--mute)">${L?'Live, refreshes every minute':cfg.statusAt?'Set by staff '+ago(cfg.statusAt).toLowerCase():'Set by staff'}</small>
  <h2 style="margin:28px 0 8px;font-size:16px">Join the server</h2>
  <div class="ip"><small>Java</small><b>${esc(C('java'))}</b><button data-copy="${esc(C('java'))}">Copy</button></div>
  <div class="ip"><small>Bedrock</small><b>${esc(C('bedrock'))}</b><button data-copy="${esc(C('bedrock'))}">Copy</button></div>
  <p class="sub">Bedrock players: add the address and port under the Servers tab.</p>
  <div class="grid">${PAGES.slice(1).map(([r,l])=>`<a class="tile" href="#${r}"><b>${l}</b><span>${(data[r]||[]).length} entries</span></a>`).join('')}
  ${C('discord')?`<a class="tile" href="${safeUrl(C('discord'))}" target="_blank" rel="noopener"><b>Discord</b><span>Join the community</span></a>`:''}</div>`},
 updates(){const r=rows('updates');return head('Updates','News and changes from the team.')+(r.length?r.map(u=>`<div class="card"><div class="meta"><b>${esc(u.author)}</b><span>${ago(u.ts)}</span></div><h3>${esc(u.title)}</h3><ul>${String(u.body||'').split('\n').filter(x=>x.trim()).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`).join(''):empty('No updates yet.'))},
 events(){const r=rows('events');return head('Events','Tournaments and competitions.')+(r.length?r.map(e=>`<div class="card"><div class="meta"><span>${esc(e.when)}</span><span class="tag ${esc(e.status)}">${esc(e.status)}</span></div><h3>${esc(e.title)}</h3><p>${esc(e.body)}</p></div>`).join(''):empty('No events yet. Check back soon.'))},
 rules(){const r=rows('rules');return head('Rules','Read these before you play.')+(r.length?r.map((x,i)=>`<div class="card"><h3>${i+1}. ${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`).join(''):empty('Rules have not been added yet.'))},
 board(){const all=rows('board'),cs=S.board.f[0][3].filter(c=>all.some(x=>x.category==c));if(!cs.includes(cat))cat=cs[0];
  const l=all.filter(x=>x.category==cat);return head('Leaderboards','Top players by category.')+(cs.length?`<div class="tabs">${cs.map(c=>`<button data-cat="${c}" class="${c==cat?'on':''}">${c}</button>`).join('')}</div>`+l.map((x,i)=>`<div class="rank"><i>${i+1}</i><b>${esc(x.player)}</b><span>${esc(x.value)}</span></div>`).join(''):empty('No rankings yet.'))},
 staff(){const r=rows('staff');return head('Staff','The people running the server.')+(r.length?S.staff.f[1][3].map(role=>{const g=r.filter(x=>x.role==role);return g.length?`<h3 style="margin:22px 0 10px">${role}</h3>`+g.map(x=>`<div class="rank"><b>${esc(x.name)}</b></div>`).join(''):''}).join(''):empty('Staff list is empty.'))},
 creators(){const r=rows('creators');return head('Creators','Streams and videos from the community.')+(r.length?r.map(x=>`<a class="rank" style="text-decoration:none" href="${safeUrl(x.url)}" target="_blank" rel="noopener"><b>${esc(x.name)}</b><span>${esc(x.platform)}</span></a>`).join(''):empty('No creators listed yet.'))},
 reviews(){const r=rows('reviews'),avg=r.length?(r.reduce((a,x)=>a+Number(x.rating||0),0)/r.length):0,mine=r.find(x=>x.id==uid)||{};
  return head('Reviews','What players say about the server.')+(r.length?`<div class="pill" style="margin-bottom:22px">${stars(Math.round(avg))} ${avg.toFixed(1)} / 5 from ${r.length} review${r.length>1?'s':''}</div>`:'')
  +(uid?`<form data-k="myreview"><b>${mine.id?'Edit your review':'Write a review'}</b>${field(['name','Minecraft name','text'],mine.name)}${field(['rating','Rating (5 is best)','select',['5','4','3','2','1']],mine.rating)}${field(['body','Your review','area'],mine.body)}<div><button>${mine.id?'Save review':'Post review'}</button> ${mine.id?'<button type="button" class="ghost del" data-delmine>Delete mine</button>':''}</div></form>`:`<div class="empty" style="margin-bottom:22px">Sign in to claude.ai to write a review.</div>`)
  +(r.length?r.map(x=>`<div class="card"><div class="meta"><b>${esc(x.name)}</b><span>${ago(x.ts)}</span></div><h3>${stars(x.rating)}</h3><p>${esc(x.body)}</p>${admin?`<p><button class="ghost del" data-delrev="${x.id}">Delete</button></p>`:''}</div>`).join(''):empty('No reviews yet. Be the first.'))},
 admin(){if(!admin)return head('Admin login','Sign in to manage the site.')+`<form data-k="login" style="max-width:420px"><label>Username<input name="u" autocomplete="username"></label><label>Password<input name="p" type="password" autocomplete="current-password"></label><div><button>Log in</button></div></form>`;
  return head('Admin panel','Changes appear on the site immediately.')+`<div class="tabs">${Object.keys(S).map(k=>`<button data-tab="${k}" class="${tab==k?'on':''}">${S[k].l}</button>`).join('')}<button data-tab="cfg" class="${tab=='cfg'?'on':''}">Settings</button><button class="ghost" data-logout>Log out</button></div><div id="aform"></div><div id="alist"></div>`}
};
const head=(t,s)=>`<h1>${t}</h1><p class="sub">${s}</p>`;
const stars=n=>{n=Math.max(0,Math.min(5,Number(n)||0));return `<span style="font-family:system-ui,sans-serif;color:var(--acc);letter-spacing:2px">${'★'.repeat(n)}${'☆'.repeat(5-n)}</span>`};
const empty=t=>`<div class="empty">${t}</div>`;

function field([n,l,t,o],v){v=v??'';return `<label>${l}`+(t=='area'?`<textarea name="${n}">${esc(v)}</textarea>`:t=='select'?`<select name="${n}">${o.map(x=>`<option${x==v?' selected':''}>${x}</option>`).join('')}</select>`:`<input name="${n}" value="${esc(v)}">`)+'</label>'}
function adminForm(){
 if(tab=='cfg'){$('#aform').innerHTML=`<form data-k="cfg">${CFG.map(c=>field([c[0],c[1],c[2]||'text',c[3]],cfg[c[0]])).join('')}<button>Save settings</button></form>`;return}
 const s=S[tab],e=edit&&edit.k==tab?edit.row:{};
 $('#aform').innerHTML=`<form data-k="${tab}"><b>${edit&&edit.k==tab?'Edit entry':'Add to '+s.l}</b>${s.f.map(f=>field(f,e[f[0]])).join('')}<div><button>${edit&&edit.k==tab?'Save changes':'Publish'}</button> ${edit?'<button type="button" class="ghost" data-cancel>Cancel</button>':''}</div></form>`}
function adminList(){const el=$('#alist');if(!el)return;if(tab=='cfg'){el.innerHTML='';return}
 const r=rows(tab);el.innerHTML=r.length?r.map(x=>`<div class="row"><span>${esc(x.title||x.name||x.player)}${x.category?' ('+esc(x.category)+')':''}</span><button class="ghost" data-edit="${x.id}">Edit</button><button class="ghost del" data-del="${x.id}">Delete</button></div>`).join(''):empty('Nothing here yet. Add the first entry above.')}

function render(){
 $('#nav').innerHTML=navHtml();
 if(route=='admin'&&$('#aform')&&$('#alist')){adminList();return}
 $('#main').innerHTML=(views[route]||views.home)();
 if(route=='admin'&&admin){adminForm();adminList()}
}
async function poll(){try{const r=await fetch('https://api.mcsrvstat.us/3/'+encodeURIComponent(C('java')),{signal:AbortSignal.timeout(6000)});const j=await r.json();live=j&&typeof j.online=='boolean'?{online:j.online,players:j.players?j.players.online:0,max:j.players?j.players.max:0}:null}catch{live=null}if(route=='home')render()}
setInterval(poll,6e4);setTimeout(poll,1500);
const go=()=>{const h=location.hash.slice(1);route=views[h]?h:'home';render()};
addEventListener('hashchange',go);

document.addEventListener('click',async ev=>{
 const t=ev.target.closest('button');if(!t)return;const d=t.dataset;
 if(d.copy){try{await navigator.clipboard.writeText(d.copy);toast('Copied')}catch{toast('Select and copy manually')}}
 if(d.cat){cat=d.cat;render()}
 if('logout' in d){admin=false;try{sessionStorage.removeItem('adm')}catch{}render()}
 if('delmine' in d){try{await db.doc('reviews/'+uid).delete();toast('Review deleted')}catch{toast('Could not delete')}}
 if(d.delrev){if(!t.classList.contains('arm')){t.classList.add('arm');t.textContent='Confirm delete';return}try{await db.doc('reviews/'+d.delrev).delete();toast('Deleted')}catch{toast('Could not delete')}}
 if(d.tab){tab=d.tab;edit=null;render()}
 if(d.edit){edit={k:tab,row:(data[tab]||[]).find(x=>x.id==d.edit)};adminForm();scrollTo(0,0)}
 if(d.cancel){edit=null;adminForm()}
 if(d.del){if(!t.classList.contains('arm')){t.classList.add('arm');t.textContent='Confirm delete';return}
  try{await db.doc(tab+'/'+d.del).delete();toast('Deleted')}catch{toast('Could not delete')}}
});
document.addEventListener('submit',async ev=>{
 ev.preventDefault();const f=ev.target,k=f.dataset.k,v=Object.fromEntries(new FormData(f));
 if(k=='login'){if(v.u===ADMIN_USER&&v.p===ADMIN_PASS){admin=true;try{sessionStorage.setItem('adm','1')}catch{}render();toast('Logged in')}else toast('Wrong username or password');return}
 try{
  if(k=='cfg')await db.doc('config/main').set({...cfg,...v,statusAt:Date.now()});
  else if(k=='myreview')await db.doc('reviews/'+uid).set({...v,ts:((data.reviews||[]).find(x=>x.id==uid)||{}).ts||Date.now()});
  else if(edit&&edit.k==k)await db.doc(k+'/'+edit.row.id).update(v);
  else await db.collection(k).add({...v,ts:Date.now()});
  edit=null;toast(k=='cfg'?'Settings saved':'Published');if(k!='cfg'&&k!='myreview')adminForm()
 }catch{toast('Save failed. Check your permissions.')}
});

(async()=>{
 render();
 try{const u=await window.claude?.use('user');admin=u?await u.canEdit():false;if(!admin){try{admin=sessionStorage.getItem('adm')=='1'}catch{}}uid=u&&u.id?await u.id():null}catch{}
 try{db=await window.claude?.use('db')}catch{}
 if(db){Object.keys(S).forEach(k=>db.collection(k).onSnapshot(s=>{data[k]=s.docs.map(d=>({id:d.id,...d.data()}));render()},()=>{}));
  db.doc('config/main').onSnapshot(s=>{cfg=s.exists?s.data():{};render()},()=>{})}
 go();
})();
