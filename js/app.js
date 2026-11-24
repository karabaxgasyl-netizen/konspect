(()=>{'use strict';
const $=s=>document.querySelector(s),app=$('#app');
const ICONS={globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',flask:'<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/>',calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>',quill:'<path d="M20 4C10 4 6 10 5 20"/><path d="M5 20c6-1 12-5 15-16"/>',atom:'<circle cx="12" cy="12" r="1.5"/><ellipse cx="12" cy="12" rx="9" ry="4"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)"/>'};
const ic=n=>`<svg viewBox="0 0 24 24">${ICONS[n]||ICONS.book}</svg>`;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// storage
const LS={get(k,d){try{return JSON.parse(localStorage.getItem('k_'+k))??d}catch{return d}},set(k,v){localStorage.setItem('k_'+k,JSON.stringify(v))}};
const st={fav:LS.get('fav',[]),hist:LS.get('hist',[]),done:LS.get('done',[]),level:LS.get('level','medium'),theme:LS.get('theme',null),font:LS.get('font',18),last:LS.get('last',null)};
const save=k=>LS.set(k,st[k]);
// theme
function applyTheme(){const t=st.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;document.documentElement.style.setProperty('--read',st.font+'px')}
applyTheme();
$('#themeBtn').onclick=()=>{st.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';save('theme');applyTheme()};
$('#backBtn').onclick=()=>history.length>1?history.back():location.hash='#/';
addEventListener('scroll',()=>$('.topbar').classList.toggle('scrolled',scrollY>4),{passive:true});
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1800)};
// data
let SUBJ=[];const BOOKS={};
async function loadSubjects(){if(!SUBJ.length)SUBJ=await (await fetch('data/subjects.json')).json();return SUBJ}
async function loadBook(id){if(BOOKS[id])return BOOKS[id];const s=SUBJ.find(x=>x.id===id);if(!s||!s.file)return null;BOOKS[id]=await (await fetch(s.file)).json();return BOOKS[id]}
async function loadAll(){await loadSubjects();await Promise.all(SUBJ.filter(s=>s.ready).map(s=>loadBook(s.id)));}
const key=(b,p)=>b+':'+p;
const findP=(b,p)=>BOOKS[b]?.paragraphs.find(x=>String(x.id)===String(p));
function pRow(b,p,extra=''){const s=SUBJ.find(x=>x.id===b);const done=st.done.includes(key(b,p.id));
 return `<a class="row" href="#/p/${b}/${p.id}"><span class="num">${esc(p.num)}</span><span class="ttl">${esc(p.title)}<span class="sub">${esc(extra||(s?s.name+' · ':'')+'с. '+p.page)}</span></span>${done?'<svg class="done" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>':''}</a>`}
// views
async function home(){await loadAll();
 const recent=st.hist.slice(0,4).map(k=>{const [b,p]=k.split(':');const P=findP(b,p);return P?pRow(b,P):''}).join('');
 const favs=st.fav.slice(0,4).map(k=>{const [b,p]=k.split(':');const P=findP(b,p);return P?pRow(b,P):''}).join('');
 let last='';if(st.last){const [b,p]=st.last.split(':');const P=findP(b,p);if(P)last=`<h2>Продолжить чтение</h2><div class="list">${pRow(b,P,'Вы остановились здесь')}</div>`}
 app.innerHTML=`<h1>Учись быстрее.</h1><p class="lead">Параграфы учебников в трёх уровнях: кратко, средне, подробно.</p>
 <form class="search" id="hs"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input name="q" type="search" placeholder="Поиск по всем учебникам" enterkeyhint="search" autocomplete="off"></form>
 ${last}<h2>Предметы</h2><div class="grid">${SUBJ.map(s=>{const B=BOOKS[s.id];const n=B?B.paragraphs.length:0;const d=B?B.paragraphs.filter(p=>st.done.includes(key(s.id,p.id))).length:0;
  return `<a class="card ${s.ready?'':'disabled'}" href="${s.ready?'#/s/'+s.id:'javascript:void 0'}" ${s.ready?'':'aria-disabled="true"'}><span class="ic" style="background:${s.color}">${ic(s.icon)}</span>${s.ready?'':'<span class="badge">Скоро</span>'}<span class="name">${esc(s.name)}</span><span class="meta">${s.ready?esc(s.grade)+' · '+n+' параграфов':esc(s.book)}</span>${s.ready?`<div class="progress"><i style="width:${n?d/n*100:0}%"></i></div>`:''}</a>`}).join('')}</div>
 <h2>Недавние</h2>${recent?`<div class="list">${recent}</div>`:'<div class="empty">Здесь появятся открытые параграфы</div>'}
 <h2>Избранное</h2>${favs?`<div class="list">${favs}</div>`:'<div class="empty">Добавляйте параграфы в избранное кнопкой «Сохранить»</div>'}`;
 $('#hs').onsubmit=e=>{e.preventDefault();location.hash='#/search?q='+encodeURIComponent(e.target.q.value)};}
async function subject(id){await loadSubjects();const s=SUBJ.find(x=>x.id===id);const B=await loadBook(id);if(!B){app.innerHTML='<div class="empty">Учебник ещё не добавлен</div>';return}
 const d=B.paragraphs.filter(p=>st.done.includes(key(id,p.id))).length;
 const draw=q=>{const ql=q.trim().toLowerCase();let html='',ch='';
  B.paragraphs.filter(p=>!ql||(p.num+' '+p.title+' '+p.keywords.join(' ')).toLowerCase().includes(ql)).forEach(p=>{if(p.chapter!==ch){if(ch)html+='</div>';ch=p.chapter;html+=`<div class="chapter">${esc(ch)}</div><div class="list">`}html+=pRow(id,p,'Стр. '+p.page)});
  $('#plist').innerHTML=html?html+'</div>':'<div class="empty">Ничего не найдено</div>'};
 app.innerHTML=`<div class="hero"><span class="ic" style="background:${s.color}">${ic(s.icon)}</span><div><h1>${esc(s.name)}</h1><div class="book">${esc(s.grade)}</div></div></div>
 <div class="box"><div class="lbl">Учебник</div><div>${esc(B.title)}</div><div class="book">${esc(B.authors)} · ${esc(B.publisher)}</div><div class="progress"><i style="width:${d/B.paragraphs.length*100}%"></i></div><div class="book">Изучено ${d} из ${B.paragraphs.length}</div></div>
 <div class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="sq" type="search" placeholder="Найти параграф или термин" autocomplete="off"></div><div id="plist"></div>`;
 draw('');$('#sq').oninput=e=>draw(e.target.value);}
const LV={short:['Кратко','главное'],medium:['Средне','основное'],detailed:['Подробно','развёрнуто']};
function renderLevel(P,lv){
 if(P.prose&&typeof P.prose[lv]==='string')return `<p>${esc(P.prose[lv])}</p>`;
 if(lv==='short'){const S=P.short;let h='';
  if(S.concl.length)h+=`<div class="box"><div class="lbl">Главное</div><ul>${S.concl.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
  const T=S.terms.filter(t=>t.def);if(T.length)h+=`<div class="box"><div class="lbl">Термины</div>${T.map(t=>`<div class="term">${esc(t.term)}</div><div>${esc(t.def)}</div>`).join('')}</div>`;
  if(S.facts.length)h+=`<div class="box"><div class="lbl">Ключевые факты</div><ul>${S.facts.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
  if(P.keywords.length)h+=`<div class="box"><div class="lbl">Ключевые слова</div><div class="kw">${P.keywords.map(k=>`<span>${esc(k)}</span>`).join('')}</div></div>`;
  return h}
 let h=P[lv].map(s=>`${s.h?`<h3>${esc(s.h)}</h3>`:''}${(lv==='medium'?[s.p.join(' ')]:chunk(s.p)).map(x=>`<p>${esc(x)}</p>`).join('')}`).join('');
 if(P.conclusions.length)h+=`<div class="box" style="margin-top:20px"><div class="lbl">Выводы</div>${P.conclusions.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`;
 if(lv==='detailed'&&P.keywords.length)h+=`<div class="box"><div class="lbl">Ключевые слова</div><div class="kw">${P.keywords.map(k=>`<span>${esc(k)}</span>`).join('')}</div></div>`;
 return h}
const chunk=a=>{const o=[];for(let i=0;i<a.length;i+=3)o.push(a.slice(i,i+3).join(' '));return o};
function plain(P,lv){const el=document.createElement('div');el.innerHTML=renderLevel(P,lv);return P.num+'. '+P.title+'\n\n'+el.innerText.trim()}
async function para(b,id){await loadSubjects();const B=await loadBook(b);const P=findP(b,id);if(!P){app.innerHTML='<div class="empty">Параграф не найден</div>';return}
 const k=key(b,P.id);st.hist=[k,...st.hist.filter(x=>x!==k)].slice(0,40);save('hist');st.last=k;save('last');
 const i=B.paragraphs.indexOf(P),prev=B.paragraphs[i-1],next=B.paragraphs[i+1];const s=SUBJ.find(x=>x.id===b);
 app.innerHTML=`<div class="crumb"><a href="#/s/${b}">${esc(s.name)}</a> · ${esc(P.chapter)}</div><h1 class="ptitle">${esc(P.num)}. ${esc(P.title)}</h1><div class="book">Учебник, с. ${P.page}</div>
 <div class="seg" role="tablist">${Object.entries(LV).map(([k,v])=>`<button role="tab" data-lv="${k}" class="${st.level===k?'on':''}">${v[0]}<small>${v[1]}</small></button>`).join('')}</div>
 <div class="font-ctl"><button data-f="-1" aria-label="Меньше шрифт">A−</button><button data-f="1" aria-label="Больше шрифт">A+</button></div>
 <article class="reader" id="rd">${renderLevel(P,st.level)}</article>
 ${P.questions.length?`<details class="q"><summary>Вопросы и задания из учебника (${P.questions.length})</summary><ol>${P.questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ol></details>`:''}
 <div class="actions"><button id="aFav">${'<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg>'}<span>Сохранить</span></button><button id="aDone"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg><span>Изучено</span></button><button id="aCopy"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg><span>Копировать</span></button><button id="aShare"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg><span>Поделиться</span></button></div>
 <div class="pager">${prev?`<a href="#/p/${b}/${prev.id}">← Назад<b>${esc(prev.num)}. ${esc(prev.title)}</b></a>`:'<span></span>'}${next?`<a class="next" href="#/p/${b}/${next.id}">Далее →<b>${esc(next.num)}. ${esc(next.title)}</b></a>`:''}</div>
 <p class="note">Пересказы подготовлены по материалам учебника. Для иллюстраций, карт, таблиц и полного контекста обращайтесь к оригинальному изданию.</p>`;
 const upd=()=>{$('#aFav').classList.toggle('on',st.fav.includes(k));$('#aDone').classList.toggle('on',st.done.includes(k))};upd();
 app.querySelectorAll('.seg button').forEach(bt=>bt.onclick=()=>{st.level=bt.dataset.lv;save('level');app.querySelectorAll('.seg button').forEach(x=>x.classList.toggle('on',x===bt));$('#rd').innerHTML=renderLevel(P,st.level);$('#rd').style.animation='none';$('#rd').offsetHeight;$('#rd').style.animation=''});
 app.querySelectorAll('.font-ctl button').forEach(bt=>bt.onclick=()=>{st.font=Math.min(24,Math.max(15,st.font+ +bt.dataset.f));save('font');applyTheme()});
 $('#aFav').onclick=()=>{st.fav=st.fav.includes(k)?st.fav.filter(x=>x!==k):[k,...st.fav];save('fav');upd();toast(st.fav.includes(k)?'Добавлено в избранное':'Удалено из избранного')};
 $('#aDone').onclick=()=>{st.done=st.done.includes(k)?st.done.filter(x=>x!==k):[...st.done,k];save('done');upd();toast(st.done.includes(k)?'Отмечено как изученное':'Отметка снята')};
 $('#aCopy').onclick=async()=>{const t=plain(P,st.level);try{await navigator.clipboard.writeText(t)}catch{const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}toast('Текст скопирован')};
 $('#aShare').onclick=async()=>{const d={title:P.num+'. '+P.title,url:location.href};if(navigator.share){try{await navigator.share(d)}catch{}}else{await navigator.clipboard?.writeText(location.href);toast('Ссылка скопирована')}};}
function hl(t,q){const i=t.toLowerCase().indexOf(q);if(i<0)return esc(t.slice(0,140));const a=Math.max(0,i-60);return (a?'…':'')+esc(t.slice(a,i))+'<mark>'+esc(t.slice(i,i+q.length))+'</mark>'+esc(t.slice(i+q.length,i+q.length+90))+'…'}
async function search(q){await loadAll();
 app.innerHTML=`<h1>Поиск</h1><form class="search" id="sf"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="gq" type="search" value="${esc(q)}" placeholder="Термин, тема, город, река…" enterkeyhint="search" autocomplete="off"></form><div id="res"></div>`;
 const run=v=>{const ql=v.trim().toLowerCase();if(ql.length<2){$('#res').innerHTML='<h2>Подсказки</h2><div class="chips">'+['нефть','Байкал','электростанции','Урал','машиностроение','чернозём','Крым','транспорт'].map(x=>`<button>${x}</button>`).join('')+'</div>';$('#res').querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{$('#gq').value=b.textContent;run(b.textContent)});return}
  const out=[];for(const s of SUBJ){const B=BOOKS[s.id];if(!B)continue;for(const P of B.paragraphs){const head=(P.num+' '+P.title+' '+P.keywords.join(' ')).toLowerCase();let sc=head.includes(ql)?10:0,snip='';
   if(!snip&&P.prose?.detailed){const t=P.prose.detailed;if(t.toLowerCase().includes(ql)){sc+=1;snip=t}}else if(!snip)for(const sec of P.detailed||[]){for(const t of sec.p||[]){if(t.toLowerCase().includes(ql)){sc+=1;if(!snip)snip=t}}}
   if(sc)out.push({s,P,sc,snip})}}
  out.sort((a,b)=>b.sc-a.sc);
  $('#res').innerHTML=out.length?`<h2>Найдено: ${out.length}</h2><div class="list">${out.slice(0,60).map(o=>`<a class="row hit" href="#/p/${o.s.id}/${o.P.id}"><span class="num">${esc(o.P.num)}</span><span class="ttl">${esc(o.P.title)}<span class="sub">${o.snip?hl(o.snip,ql):esc(o.s.name)}</span></span></a>`).join('')}</div>`:'<div class="empty">Ничего не найдено</div>'};
 run(q);let t;$('#gq').oninput=e=>{clearTimeout(t);t=setTimeout(()=>{history.replaceState(null,'','#/search?q='+encodeURIComponent(e.target.value));run(e.target.value)},180)};$('#sf').onsubmit=e=>{e.preventDefault();$('#gq').blur()};if(!q)$('#gq').focus();}
async function listView(kind){await loadAll();const arr=kind==='saved'?st.fav:st.hist;
 const rows=arr.map(k=>{const [b,p]=k.split(':');const P=findP(b,p);return P?pRow(b,P):''}).join('');
 app.innerHTML=`<h1>${kind==='saved'?'Избранное':'История'}</h1>${rows?`<div class="list">${rows}</div>`:`<div class="empty">${kind==='saved'?'Пока пусто':'Вы ещё ничего не открывали'}</div>`}${kind==='history'&&rows?'<p style="text-align:center"><button id="clr" class="chips" style="color:var(--muted);padding:14px">Очистить историю</button></p>':''}`;
 const c=$('#clr');if(c)c.onclick=()=>{st.hist=[];save('hist');listView(kind)};}
// router
async function route(){const h=location.hash.slice(1)||'/';const [path,qs]=h.split('?');const parts=path.split('/').filter(Boolean);
 $('#backBtn').hidden=!parts.length;
 const tab=parts[0]==='search'?'search':parts[0]==='saved'?'saved':parts[0]==='history'?'history':parts.length?'':'home';
 document.querySelectorAll('.tabbar a').forEach(a=>a.classList.toggle('on',a.dataset.tab===tab));
 app.style.animation='none';app.offsetHeight;app.style.animation='';
 try{if(!parts.length)await home();else if(parts[0]==='s')await subject(parts[1]);else if(parts[0]==='p')await para(parts[1],parts[2]);else if(parts[0]==='search')await search(new URLSearchParams(qs||'').get('q')||'');else if(parts[0]==='saved'||parts[0]==='history')await listView(parts[0]);else await home()}
 catch(e){console.error(e);app.innerHTML='<div class="empty">Не удалось загрузить данные. Проверьте подключение.</div>'}
 if(!(parts[0]==='p'))scrollTo(0,0);else scrollTo(0,0);}
addEventListener('hashchange',route);route();
if('serviceWorker' in navigator&&location.protocol!=='file:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
