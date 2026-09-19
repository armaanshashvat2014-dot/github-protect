(()=>{
function mount(){
 if(document.querySelector('.dashboard-nav'))return;
 const app=document.querySelector('.app'),header=document.querySelector('header'),hero=document.querySelector('.hero'),grid=document.querySelector('.grid');
 if(!app||!header||!grid)return;
 const nav=document.createElement('nav');nav.className='dashboard-nav';nav.setAttribute('aria-label','Dashboard navigation');
 nav.innerHTML='<div class="nav-links"><button class="nav-chip active" data-target=".hero">Overview</button><button class="nav-chip" data-target=".grid">Scan & Protect</button><button class="nav-chip" data-target="#securitySuite">Tools 1–10</button><button class="nav-chip" data-target="#securitySuite2">Tools 11–20</button><button class="nav-chip" data-target="#securitySuite3">Tools 21–28</button></div><label class="tool-search-wrap"><span class="search-icon">⌕</span><input class="tool-search" id="globalToolSearch" placeholder="Find a security tool…" aria-label="Find a security tool"><span class="search-count" id="toolSearchCount">28 tools</span></label>';
 header.after(nav);
 nav.querySelectorAll('.nav-chip').forEach(button=>button.onclick=()=>{
  nav.querySelectorAll('.nav-chip').forEach(x=>x.classList.remove('active'));button.classList.add('active');
  const target=document.querySelector(button.dataset.target);if(target){if(target.classList.contains('collapsed'))target.querySelector('.suite-toggle')?.click();target.scrollIntoView({behavior:'smooth',block:'start'})}
 });
 const suites=[...document.querySelectorAll('.security-suite')];
 suites.forEach((suite,index)=>{
  const head=suite.querySelector('.suite-head');if(!head)return;
  const body=document.createElement('div');body.className='suite-body';
  [...suite.children].filter(x=>x!==head).forEach(x=>body.append(x));suite.append(body);
  const existing=[...head.children].filter(x=>x!==head.firstElementChild),actions=document.createElement('div');actions.className='suite-actions';
  existing.forEach(x=>actions.append(x));
  const toggle=document.createElement('button');toggle.className='btn alt mini suite-toggle';toggle.type='button';toggle.setAttribute('aria-expanded',index===0?'true':'false');toggle.textContent=index===0?'Hide section':'Show section';actions.append(toggle);head.append(actions);
  if(index>0)suite.classList.add('collapsed');
  toggle.onclick=()=>{const closed=suite.classList.toggle('collapsed');toggle.textContent=closed?'Show section':'Hide section';toggle.setAttribute('aria-expanded',String(!closed))};
  const empty=document.createElement('div');empty.className='empty-tools';empty.textContent='No tools match that search. Try a shorter word.';body.append(empty);
 });
 const tools=[...document.querySelectorAll('.tool')];
 tools.forEach(tool=>{const heading=tool.querySelector('h3'),m=heading?.textContent.match(/^\s*(\d+)\./);if(m){const badge=document.createElement('span');badge.className='tool-number';badge.textContent=m[1];badge.setAttribute('aria-hidden','true');tool.append(badge)}});
 const search=document.querySelector('#globalToolSearch'),count=document.querySelector('#toolSearchCount');
 function filter(){const q=search.value.trim().toLowerCase();let shown=0;tools.forEach(tool=>{const match=!q||tool.textContent.toLowerCase().includes(q);tool.classList.toggle('hidden-by-search',!match);if(match)shown++});count.textContent=shown+' shown';suites.forEach(suite=>{const visible=suite.querySelectorAll('.tool:not(.hidden-by-search)').length;suite.querySelector('.empty-tools')?.classList.toggle('show',visible===0);if(q&&visible&&suite.classList.contains('collapsed'))suite.querySelector('.suite-toggle')?.click()})}
 search.addEventListener('input',filter);
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();search.focus();search.select()}});
 const primary=grid.querySelector('.btn:not(.alt)');if(primary)primary.setAttribute('data-primary-action','true');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();