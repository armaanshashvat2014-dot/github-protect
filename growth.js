(()=>{
const URL='https://armaanshashvat2014-dot.github.io/github-protect/';
async function shareApp(){const data={title:'GitHub Protector',text:'Free browser-based tools for checking suspicious links, downloads, QR codes, extension permissions and scam messages.',url:URL},button=document.querySelector('#shareApp');try{if(navigator.share){await navigator.share(data);button.textContent='Shared ✓'}else{await navigator.clipboard.writeText(data.text+' '+URL);button.textContent='Link copied ✓'}}catch(error){if(error.name!=='AbortError'){try{await navigator.clipboard.writeText(URL);button.textContent='Link copied ✓'}catch{button.textContent='Copy this link: '+URL}}}setTimeout(()=>button.textContent='📤 Share',1800)}
function mount(){const button=document.querySelector('#shareApp');if(button)button.addEventListener('click',shareApp)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();