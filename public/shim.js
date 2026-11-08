// Connects the site to server.js (replaces the claude.ai storage and user APIs).
(()=>{
const j=async(u,o)=>{const r=await fetch(u,o);if(!r.ok)throw new Error(r.status);return r.json()};
const send=(m,u,b)=>j(u,{method:m,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined});
const snap=rows=>({docs:rows.map(r=>{const{id,...d}=r;return{id,data:()=>d}}),size:rows.length,empty:!rows.length});
function watch(url,map,next){let last='';const tick=async()=>{try{const r=await j(url);const s=JSON.stringify(r);if(s!==last){last=s;next(map(r))}}catch{}};tick();setInterval(tick,5000)}
const db={
 collection:k=>({onSnapshot:next=>watch('/api/'+k,snap,next),add:async d=>({id:(await send('POST','/api/'+k,d)).id})}),
 doc:p=>{const[k,id]=p.split('/');return{
  onSnapshot:next=>watch('/api/'+k,rs=>{const r=rs.find(x=>x.id==id);return{exists:!!r,data:()=>{if(!r)return;const{id:_,...d}=r;return d}}},next),
  set:d=>send('PUT',`/api/${k}/${id}`,d),update:d=>send('PATCH',`/api/${k}/${id}`,d),delete:()=>send('DELETE',`/api/${k}/${id}`)}}
};
let me;
window.adminLogin=async(u,p)=>{try{await send('POST','/auth/admin',{u,p});return true}catch{return false}};
window.claude={use:async n=>{
 if(n=='db')return db;
 if(n=='user'){if(me===undefined){try{me=await j('/auth/me')}catch{me=null}window.__me=me}
  return{canEdit:async()=>!!(me&&me.admin),isOwner:async()=>false,id:async()=>me?me.id:null}}
 return null}};
})();
