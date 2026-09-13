const RISKY=['exe','msi','bat','cmd','com','scr','ps1','vbs','vbe','js','jse','wsf','hta','jar','reg','apk','dmg','pkg'];
const DECOY=/invoice|receipt|password|urgent|payment|photo|document|update|crack|free|winner|claim/i;
const ext=name=>(name||'').toLowerCase().split('.').pop();
const filename=item=>(item.filename||item.url||'').split(/[\\/]/).pop();
function assess(item){
 const name=filename(item),parts=name.toLowerCase().split('.'),e=ext(name),reasons=[];let score=0;
 if(RISKY.includes(e)){score+=45;reasons.push('Executable or script download')}
 if(parts.length>2&&RISKY.includes(e)){score+=30;reasons.push('Double extension')}
 if(DECOY.test(name)&&RISKY.includes(e)){score+=20;reasons.push('Misleading filename')}
 if(item.danger&&item.danger!=='safe'&&item.danger!=='accepted'){score+=60;reasons.push('Chrome warning: '+item.danger)}
 if(/^http:/.test(item.url||'')){score+=15;reasons.push('Unencrypted download source')}
 return {name,score:Math.min(score,100),level:score>=60?'blocked':score>=35?'warning':'safe',reasons};
}
async function save(entry){
 const {history=[]}=await chrome.storage.local.get('history');history.unshift(entry);await chrome.storage.local.set({history:history.slice(0,100)});
 chrome.action.setBadgeText({text:entry.level==='blocked'?'!':entry.level==='warning'?'?':''});chrome.action.setBadgeBackgroundColor({color:entry.level==='blocked'?'#e5484d':'#d99b19'});
}
chrome.downloads.onCreated.addListener(async item=>{
 const risk=assess(item),settings=(await chrome.storage.local.get({pauseRisky:true}));let paused=false;
 if(risk.level!=='safe'&&settings.pauseRisky){try{await chrome.downloads.pause(item.id);paused=true}catch{}}
 const entry={id:item.id,name:risk.name,url:item.url,createdAt:Date.now(),...risk,paused};
 await save(entry);
 if(risk.level!=='safe'){
  chrome.notifications.create('download-'+item.id,{type:'basic',iconUrl:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="%2358a6ff"/><text x="64" y="88" text-anchor="middle" font-size="76">!</text></svg>',title:paused?'Risky download paused':'Risky download detected',message:risk.name+' — '+risk.reasons.join(', '),priority:2});
 }
});
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
 if(msg.type==='resume')chrome.downloads.resume(msg.id).then(()=>reply({ok:true})).catch(e=>reply({ok:false,error:e.message}));
 else if(msg.type==='cancel')chrome.downloads.cancel(msg.id).then(()=>chrome.downloads.erase({id:msg.id})).then(()=>reply({ok:true})).catch(e=>reply({ok:false,error:e.message}));
 else if(msg.type==='risk-url')reply(checkUrl(msg.url));
 return true;
});
function checkUrl(raw){try{const u=new URL(raw),reasons=[];let score=0;if(u.protocol!=='https:'){score+=20;reasons.push('not HTTPS')}if(/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)){score+=35;reasons.push('raw IP address')}if(u.hostname.includes('xn--')){score+=25;reasons.push('encoded domain')}if(u.hostname.split('.').length>4){score+=15;reasons.push('many subdomains')}if(/login|verify|wallet|gift|prize|secure-update/i.test(u.hostname)){score+=25;reasons.push('pressure words in domain')}if(raw.includes('@')){score+=40;reasons.push('hidden destination pattern')}return {score,level:score>=50?'danger':score>=20?'warning':'safe',reasons}}catch{return {score:100,level:'danger',reasons:['invalid URL']}}}