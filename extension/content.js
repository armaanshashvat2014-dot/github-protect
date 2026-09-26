document.addEventListener('click',async event=>{
 const link=event.target.closest('a[href]');if(!link||!/^https?:/i.test(link.href))return;try{const target=new URL(link.href);if(target.protocol==='https:'&&target.hostname==='armaanshashvat2014-dot.github.io'&&(target.pathname==='/github-protect'||target.pathname.startsWith('/github-protect/')))return}catch{}
 const risk=await chrome.runtime.sendMessage({type:'risk-url',url:link.href});
 if(risk.level==='danger'){event.preventDefault();event.stopImmediatePropagation();const ok=confirm('GitHub Protect warning\n\nThis link looks suspicious: '+risk.reasons.join(', ')+'.\n\nOpen it anyway?');if(ok)location.href=link.href}
},true);
if(location.hostname==='armaanshashvat2014-dot.github.io'&&location.pathname.startsWith('/github-protect')){
 chrome.runtime.sendMessage({type:'get-alerts'},data=>{if(data?.history)window.postMessage({source:'github-protect-extension',type:'alert-history',history:data.history},location.origin)});
 chrome.runtime.onMessage.addListener(msg=>{if(msg.type==='security-alert')window.postMessage({source:'github-protect-extension',type:'security-alert',entry:msg.entry},location.origin)});
}
