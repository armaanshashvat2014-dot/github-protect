const RISKY=['exe','msi','bat','cmd','com','scr','ps1','vbs','vbe','js','jse','wsf','hta','jar','reg','apk','dmg','pkg'];
let threatHosts=new Set();
async function loadThreats(){const {urlhausHosts=[]}=await chrome.storage.local.get('urlhausHosts');threatHosts=new Set(urlhausHosts)}
async function refreshThreats(){
 try{const res=await fetch('https://urlhaus.abuse.ch/downloads/text_online/',{cache:'no-store'});if(!res.ok)throw new Error('HTTP '+res.status);
 const hosts=new Set();for(const line of (await res.text()).split(/\r?\n/)){if(!line||line.startsWith('#'))continue;try{hosts.add(new URL(line).hostname.toLowerCase())}catch{}}
 threatHosts=hosts;await chrome.storage.local.set({urlhausHosts:[...hosts],urlhausUpdated:Date.now()});
 }catch(error){console.warn('URLhaus refresh failed',error)}
}
loadThreats();chrome.runtime.onInstalled.addListener(()=>{refreshThreats();chrome.alarms.create('urlhaus-refresh',{periodInMinutes:360})});
chrome.runtime.onStartup.addListener(refreshThreats);chrome.alarms.onAlarm.addListener(a=>{if(a.name==='urlhaus-refresh')refreshThreats()});
const DECOY=/invoice|receipt|password|urgent|payment|photo|document|update|crack|free|winner|claim/i;
const ext=name=>(name||'').toLowerCase().split('.').pop();
const filename=item=>(item.filename||item.url||'').split(/[\\/]/).pop();
function assess(item){
 const name=filename(item),parts=name.toLowerCase().split('.'),e=ext(name),reasons=[];let score=0;try{const host=new URL(item.url).hostname.toLowerCase();if([...threatHosts].some(h=>host===h||host.endsWith('.'+h))){score=100;reasons.push('Download source is listed by URLhaus')}}catch{}
 if(RISKY.includes(e)){score+=45;reasons.push('Executable or script download')}
 if(parts.length>2&&RISKY.includes(e)){score+=30;reasons.push('Double extension')}
 if(DECOY.test(name)&&RISKY.includes(e)){score+=20;reasons.push('Misleading filename')}
 if(item.danger&&item.danger!=='safe'&&item.danger!=='accepted'){score+=60;reasons.push('Chrome warning: '+item.danger)}
 if(/^http:/.test(item.url||'')){score+=15;reasons.push('Unencrypted download source')}
 return {name,score:Math.min(score,100),level:score>=60?'blocked':score>=35?'warning':'safe',reasons};
}
async function sendToApp(entry){const tabs=await chrome.tabs.query({url:['https://armaanshashvat2014-dot.github.io/github-protect/*']});for(const tab of tabs){try{await chrome.tabs.sendMessage(tab.id,{type:'security-alert',entry})}catch{}}}
async function save(entry){
 const {history=[]}=await chrome.storage.local.get('history');history.unshift(entry);await chrome.storage.local.set({history:history.slice(0,100)});if(entry.level!=='safe')sendToApp(entry);
 chrome.action.setBadgeText({text:entry.level==='blocked'?'!':entry.level==='warning'?'?':''});chrome.action.setBadgeBackgroundColor({color:entry.level==='blocked'?'#e5484d':'#d99b19'});
}
chrome.downloads.onCreated.addListener(async item=>{
 const risk=assess(item),settings=(await chrome.storage.local.get({pauseRisky:true}));let paused=false;
 if(risk.level!=='safe'&&settings.pauseRisky){try{await chrome.downloads.pause(item.id);paused=true}catch{}}
 const entry={id:item.id,name:risk.name,url:item.url,createdAt:Date.now(),...risk,paused};
 await save(entry);
 if(risk.level!=='safe'){
  chrome.notifications.create('download-'+item.id,{type:'basic',iconUrl:'icon.svg',title:paused?'Risky download paused':'Risky download detected',message:risk.name+' — '+risk.reasons.join(', '),priority:2});
 }
});
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
 if(msg.type==='resume')chrome.downloads.resume(msg.id).then(()=>reply({ok:true})).catch(e=>reply({ok:false,error:e.message}));
 else if(msg.type==='cancel')chrome.downloads.cancel(msg.id).then(()=>chrome.downloads.erase({id:msg.id})).then(()=>reply({ok:true})).catch(e=>reply({ok:false,error:e.message}));
 else if(msg.type==='risk-url')reply(checkUrl(msg.url));
 else if(msg.type==='get-alerts')chrome.storage.local.get('history').then(x=>reply({history:(x.history||[]).filter(e=>e.level!=='safe')}));
 return true;
});
function checkUrl(raw){try{const u=new URL(raw),reasons=[];let score=0;const host=u.hostname.toLowerCase();if([...threatHosts].some(h=>host===h||host.endsWith('.'+h))){score=100;reasons.push('Matched the live URLhaus malware feed')}if(u.protocol!=='https:'){score+=20;reasons.push('not HTTPS')}if(/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)){score+=35;reasons.push('raw IP address')}if(u.hostname.includes('xn--')){score+=25;reasons.push('encoded domain')}if(u.hostname.split('.').length>4){score+=15;reasons.push('many subdomains')}if(/login|verify|wallet|gift|prize|secure-update/i.test(u.hostname)){score+=25;reasons.push('pressure words in domain')}if(raw.includes('@')){score+=40;reasons.push('hidden destination pattern')}return {score,level:score>=50?'danger':score>=20?'warning':'safe',reasons}}catch{return {score:100,level:'danger',reasons:['invalid URL']}}}