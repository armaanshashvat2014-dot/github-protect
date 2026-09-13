document.addEventListener('click',async event=>{
 const link=event.target.closest('a[href]');if(!link||!/^https?:/i.test(link.href))return;
 const risk=await chrome.runtime.sendMessage({type:'risk-url',url:link.href});
 if(risk.level==='danger'){event.preventDefault();event.stopImmediatePropagation();const ok=confirm('GitHub Protect warning\n\nThis link looks suspicious: '+risk.reasons.join(', ')+'.\n\nOpen it anyway?');if(ok)location.href=link.href}
},true);