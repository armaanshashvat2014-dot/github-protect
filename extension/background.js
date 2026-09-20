const RISKY=['exe','msi','bat','cmd','com','scr','ps1','vbs','vbe','js','jse','wsf','hta','jar','reg','apk','dmg','pkg'];
let threatHosts=new Set();
let protectionSettings={enabled:true,pauseRisky:true,notifications:true,strictMode:false,trustedDomains:[],blockedDomains:[]};
async function loadThreats(){const saved=await chrome.storage.local.get({urlhausHosts:[],enabled:true,pauseRisky:true,notifications:true,strictMode:false,trustedDomains:[],blockedDomains:[]});threatHosts=new Set(saved.urlhausHosts);protectionSettings={enabled:saved.enabled,pauseRisky:saved.pauseRisky,notifications:saved.notifications,strictMode:saved.strictMode,trustedDomains:saved.trustedDomains,blockedDomains:saved.blockedDomains}}
chrome.storage.onChanged.addListener((changes,area)=>{if(area!=='local')return;for(const key of Object.keys(protectionSettings))if(changes[key])protectionSettings[key]=changes[key].newValue});
async function refreshThreats(){
 try{const res=await fetch('https://urlhaus.abuse.ch/downloads/text_online/',{cache:'no-store'});if(!res.ok)throw new Error('HTTP '+res.status);
 const hosts=new Set();for(const line of (await res.text()).split(/\r?\n/)){if(!line||line.startsWith('#'))continue;try{hosts.add(new URL(line).hostname.toLowerCase())}catch{}}
 threatHosts=hosts;await chrome.storage.local.set({urlhausHosts:[...hosts],urlhausUpdated:Date.now()});
 }catch(error){console.warn('URLhaus refresh failed',error)}
}
loadThreats();chrome.runtime.onInstalled.addListener(()=>{refreshThreats();chrome.alarms.create('urlhaus-refresh',{periodInMinutes:360})});
chrome.runtime.onStartup.addListener(refreshThreats);chrome.alarms.onAlarm.addListener(a=>{if(a.name==='urlhaus-refresh')refreshThreats()});
const DECOY=/invoice|receipt|password|urgent|payment|photo|document|update|crack|free|winner|claim/i;
const BRANDS=['google.com','microsoft.com','apple.com','amazon.com','github.com','paypal.com','facebook.com','instagram.com','netflix.com','discord.com'];
const domainMatch=(host,list)=>(list||[]).some(x=>host===x||host.endsWith('.'+x));
function lev(a,b){const r=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let p=r[0];r[0]=i;for(let j=1;j<=b.length;j++){const o=r[j];r[j]=Math.min(r[j]+1,r[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=o}}return r[b.length]}
const ext=name=>(name||'').toLowerCase().split('.').pop();
const filename=item=>(item.filename||item.url||'').split(/[\\/]/).pop();
function chromeVerdict(danger){
 if(danger==='safe'||danger==='accepted')return {label:'Secure',level:'secure'};
 if(['file','url','content','host','dangerous','malicious','accountCompromise'].includes(danger))return {label:'Not safe',level:'not-safe'};
 return {label:'Warning',level:'warning'};
}
function assess(item){
 const verdict=chromeVerdict(item.danger);
 const name=filename(item),parts=name.toLowerCase().split('.'),e=ext(name),reasons=[];let score=0;try{const host=new URL(item.url).hostname.toLowerCase();if([...threatHosts].some(h=>host===h||host.endsWith('.'+h))){score=100;reasons.push('Download source is listed by URLhaus')}if(domainMatch(host,protectionSettings.blockedDomains)){score=100;reasons.push('Source is on your blocked list')}if(domainMatch(host,protectionSettings.trustedDomains)&&score<100){score=Math.max(0,score-25);reasons.push('Source is on your trusted list')}}catch{}
 if(RISKY.includes(e)){score+=protectionSettings.strictMode?60:45;reasons.push('Executable or script download')}
 if(parts.length>2&&RISKY.includes(e)){score+=30;reasons.push('Double extension')}
 if(DECOY.test(name)&&RISKY.includes(e)){score+=20;reasons.push('Misleading filename')}
 if(verdict.level==='not-safe'){score+=70;reasons.push('Chrome verdict: Not safe ('+item.danger+')')}
 else if(verdict.level==='warning'&&item.danger){score+=30;reasons.push('Chrome verdict: Warning ('+item.danger+')')}
 if(/^http:/.test(item.url||'')){score+=15;reasons.push('Unencrypted download source')}
 return {name,score:Math.min(score,100),level:score>=(protectionSettings.strictMode?45:60)?'blocked':score>=(protectionSettings.strictMode?20:35)?'warning':'safe',chromeVerdict:verdict.label,chromeDanger:item.danger||'unknown',reasons};
}
async function sendToApp(entry){const tabs=await chrome.tabs.query({url:['https://armaanshashvat2014-dot.github.io/github-protect/*']});for(const tab of tabs){try{await chrome.tabs.sendMessage(tab.id,{type:'security-alert',entry})}catch{}}}
async function save(entry){
 const {history=[]}=await chrome.storage.local.get('history');const updated=[entry,...history.filter(x=>x.id!==entry.id)];await chrome.storage.local.set({history:updated.slice(0,100)});if(entry.level!=='safe')sendToApp(entry);
 chrome.action.setBadgeText({text:entry.level==='blocked'?'!':entry.level==='warning'?'?':''});chrome.action.setBadgeBackgroundColor({color:entry.level==='blocked'?'#e5484d':'#d99b19'});
}
chrome.downloads.onCreated.addListener(async item=>{
 if(!protectionSettings.enabled)return;
 const risk=assess(item),settings=protectionSettings;let paused=false;
 if(risk.level!=='safe'&&settings.pauseRisky){try{await chrome.downloads.pause(item.id);paused=true}catch{}}
 const entry={id:item.id,name:risk.name,url:item.url,createdAt:Date.now(),...risk,paused};
 await save(entry);
 if(risk.level!=='safe'&&settings.notifications){
  chrome.notifications.create('download-'+item.id,{type:'basic',iconUrl:'icon.svg',title:paused?'Risky download paused':'Risky download detected',message:risk.name+' — '+risk.reasons.join(', '),priority:2});
 }
});
chrome.downloads.onChanged.addListener(async delta=>{
 if(!delta.danger?.current)return;const matches=await chrome.downloads.search({id:delta.id});if(!matches.length)return;
 const item=matches[0],risk=assess(item),entry={id:item.id,name:risk.name,url:item.url,createdAt:Date.now(),...risk,paused:item.paused};await save(entry);
 if(risk.chromeVerdict!=='Secure'&&protectionSettings.notifications)chrome.notifications.create('verdict-'+item.id,{type:'basic',iconUrl:'icon.svg',title:'Chrome verdict: '+risk.chromeVerdict,message:risk.name+' — '+risk.reasons.join(', '),priority:2});
});
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
 if(msg.type==='resume')chrome.downloads.resume(msg.id).then(()=>reply({ok:true})).catch(e=>reply({ok:false,error:e.message}));
 else if(msg.type==='cancel')chrome.downloads.cancel(msg.id).then(()=>chrome.downloads.erase({id:msg.id})).then(()=>reply({ok:true})).catch(e=>reply({ok:false,error:e.message}));
 else if(msg.type==='risk-url')reply(checkUrl(msg.url));
 else if(msg.type==='get-alerts')chrome.storage.local.get('history').then(x=>reply({history:(x.history||[]).filter(e=>e.level!=='safe')}));
 else if(msg.type==='get-status')chrome.storage.local.get({history:[],urlhausUpdated:0}).then(x=>reply({enabled:protectionSettings.enabled,settings:protectionSettings,feedCount:threatHosts.size,urlhausUpdated:x.urlhausUpdated,history:x.history}));
 else if(msg.type==='set-enabled'){protectionSettings.enabled=!!msg.enabled;chrome.storage.local.set({enabled:protectionSettings.enabled}).then(()=>reply({ok:true}))}
 else if(msg.type==='refresh-threats')refreshThreats().then(()=>reply({ok:true,count:threatHosts.size}));
 else if(msg.type==='clear-badge'){chrome.action.setBadgeText({text:''});reply({ok:true})}
 return true;
});
function checkUrl(raw){try{const u=new URL(raw),reasons=[];let score=0;const host=u.hostname.toLowerCase(),base=host.split('.').slice(-2).join('.');if([...threatHosts].some(h=>host===h||host.endsWith('.'+h))){score=100;reasons.push('Matched the live URLhaus malware feed')}if(u.protocol!=='https:'){score+=20;reasons.push('not HTTPS')}if(/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)){score+=35;reasons.push('raw IP address')}if(u.hostname.includes('xn--')){score+=25;reasons.push('encoded domain')}if(u.hostname.split('.').length>4){score+=15;reasons.push('many subdomains')}if(/login|verify|wallet|gift|prize|secure-update/i.test(u.hostname)){score+=25;reasons.push('pressure words in domain')}if(raw.includes('@')){score+=40;reasons.push('hidden destination pattern')}if(domainMatch(host,protectionSettings.blockedDomains)){score=100;reasons.push('on your blocked list')}if(domainMatch(host,protectionSettings.trustedDomains)&&score<100){score=Math.max(0,score-25);reasons.push('on your trusted list')}for(const brand of BRANDS)if(base!==brand&&lev(base,brand)<=2){score+=45;reasons.push('resembles '+brand);break}if(protectionSettings.strictMode&&score>0)score+=10;score=Math.min(score,100);return {score,level:score>=50?'danger':score>=20?'warning':'safe',reasons,host}}catch{return {score:100,level:'danger',reasons:['invalid URL']}}}
async function handleAntivirusTest(delta){
 if(!delta.state?.current)return;const matches=await chrome.downloads.search({id:delta.id});if(!matches.length)return;const item=matches[0];
 if(!/eicar-antivirus-test/i.test(item.filename||''))return;
 const {handledAntivirusTests=[]}=await chrome.storage.local.get('handledAntivirusTests');if(handledAntivirusTests.includes(item.id))return;
 let active=false,message='';
 if(delta.state.current==='interrupted'){active=true;message='Protection active — the harmless antivirus test was blocked.'}
 else if(delta.state.current==='complete'){try{await chrome.downloads.removeFile(item.id);message='Update antivirus — the harmless test was not blocked, so GitHub Protector auto-deleted it.'}catch{active=true;message='Protection active — the antivirus test was already blocked or removed.'}try{await chrome.downloads.erase({id:item.id})}catch{}}
 else return;
 await chrome.storage.local.set({handledAntivirusTests:[item.id,...handledAntivirusTests].slice(0,100)});
 const entry={id:'antivirus-test-'+item.id,name:'Antivirus protection test',url:item.url,createdAt:Date.now(),score:active?0:60,level:active?'warning':'blocked',chromeVerdict:active?'Protection active':'Update antivirus',chromeDanger:item.danger||'test',reasons:[message],paused:false};
 await save(entry);if(protectionSettings.notifications)chrome.notifications.create('antivirus-test-'+item.id,{type:'basic',iconUrl:'icon.svg',title:active?'Protection active':'Update antivirus',message,priority:2});
}
chrome.downloads.onChanged.addListener(handleAntivirusTest);
