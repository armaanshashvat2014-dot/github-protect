(()=>{
  const KEY='githubProtectorFeedbackV1';
  const $=(selector,root=document)=>root.querySelector(selector);
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const read=()=>{try{const data=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(data)?data:[]}catch{return[]}};
  const write=data=>localStorage.setItem(KEY,JSON.stringify(data.slice(-30)));

  function addStyles(){
    if($('#gp-feedback-styles'))return;
    const style=document.createElement('style');
    style.id='gp-feedback-styles';
    style.textContent=`
      .gp-review-zone{max-width:1050px;margin:30px auto;padding:0 22px;overflow:hidden}
      .gp-review-head{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:12px}
      .gp-review-head h2{margin:0}.gp-review-head p{margin:0;color:#97a9c2;font-size:13px}
      .gp-review-track{position:relative;min-height:112px;border:1px solid #2b4160;border-radius:20px;background:linear-gradient(135deg,#0a1220,#111d31);overflow:hidden}
      .gp-review-card{position:absolute;left:-340px;top:15px;width:min(310px,calc(100vw - 80px));padding:15px 17px;border:1px solid #41628e;border-radius:15px;background:linear-gradient(145deg,#182941,#101a2b);box-shadow:0 14px 38px #0008;animation:gp-review-right var(--duration,12s) linear infinite;animation-delay:var(--delay,0s)}
      .gp-review-stars{color:#ffd166;letter-spacing:2px;font-size:17px}.gp-review-card p{margin:5px 0 0;color:#d9e6f7}.gp-review-card small{color:#8fa6c4}
      .gp-review-empty{position:absolute;inset:0;display:grid;place-items:center;padding:20px;text-align:center;color:#9eb1ca}
      @keyframes gp-review-right{from{transform:translateX(0)}to{transform:translateX(calc(100vw + 720px))}}
      .gp-feedback-overlay{position:fixed;inset:0;z-index:2147482500;display:none;place-items:center;padding:18px;background:#030711d9;backdrop-filter:blur(12px)}
      .gp-feedback-overlay.open{display:grid}.gp-feedback-panel{width:min(560px,100%);background:linear-gradient(150deg,#14233a,#0b1322);border:1px solid #3f5e87;border-radius:24px;padding:22px;box-shadow:0 28px 90px #000b;color:#eef6ff}
      .gp-feedback-top{display:flex;justify-content:space-between;gap:16px;align-items:center}.gp-feedback-top h2{margin:0}.gp-feedback-close{width:42px;height:42px;border-radius:13px!important;padding:0!important}
      .gp-stars{display:flex;gap:8px;margin:17px 0}.gp-star{width:50px;height:50px;padding:0!important;border-radius:14px!important;background:#111d30!important;color:#6f819c!important;font-size:24px!important;border:1px solid #334b6d!important}.gp-star.selected,.gp-star:hover{color:#ffd166!important;border-color:#ffd166!important;transform:translateY(-3px)}
      .gp-feedback-panel textarea{width:100%;min-height:105px;resize:vertical;border:1px solid #385274;border-radius:14px;background:#08111f;color:#edf5ff;padding:13px;font:inherit}.gp-feedback-panel label{display:block;font-weight:800;margin-bottom:7px}.gp-feedback-note{color:#9fb2cc;font-size:13px}.gp-feedback-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:14px}.gp-feedback-status{color:#78e3b0;font-weight:800}
      @media(prefers-reduced-motion:reduce){.gp-review-card{animation:none;position:relative;left:auto;top:auto;margin:14px}.gp-review-track{display:flex;overflow:auto}.gp-star{transition:none!important}}
    `;
    document.head.append(style);
  }

  function reviews(){
    addStyles();
    const existing=$('#gpReviews');
    if(existing)existing.remove();
    const section=document.createElement('section');
    section.id='gpReviews';section.className='gp-review-zone';
    section.innerHTML='<div class="gp-review-head"><div><h2>Recent positive ratings</h2><p>Only genuine 4–5-star feedback saved on this device is shown.</p></div></div><div class="gp-review-track" aria-live="polite"></div>';
    const track=$('.gp-review-track',section);
    const positive=read().filter(item=>item.rating>=4).slice(-8);
    if(!positive.length){track.innerHTML='<div class="gp-review-empty">No positive ratings saved on this device yet. Use “Rate & feedback” to add an honest review.</div>'}
    else positive.forEach((item,index)=>{
      const card=document.createElement('article');card.className='gp-review-card';
      card.style.setProperty('--delay',`${index*2.2}s`);card.style.setProperty('--duration',`${Math.max(11,14+positive.length)}s`);
      card.innerHTML=`<div class="gp-review-stars" aria-label="${item.rating} out of 5 stars">${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</div><p>${escapeHtml(item.message||'Positive rating')}</p><small>Saved on this device</small>`;
      track.append(card);
    });
    const anchor=document.querySelector('.app')||document.querySelector('main')||document.body;
    anchor.append(section);
  }

  function modal(){
    if($('#gpFeedback'))return;
    const overlay=document.createElement('div');overlay.id='gpFeedback';overlay.className='gp-feedback-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','gpFeedbackTitle');
    overlay.innerHTML=`<section class="gp-feedback-panel"><div class="gp-feedback-top"><div><div class="eyebrow">Private, device-local feedback</div><h2 id="gpFeedbackTitle">Rate GitHub Protector</h2></div><button class="gp-feedback-close" type="button" aria-label="Close feedback">×</button></div><p class="gp-feedback-note">Your rating stays in this browser. Nothing is sent to GitHub or another server.</p><div class="gp-stars" role="radiogroup" aria-label="Rating"><button class="gp-star" type="button" data-rating="1" aria-label="1 star">★</button><button class="gp-star" type="button" data-rating="2" aria-label="2 stars">★</button><button class="gp-star" type="button" data-rating="3" aria-label="3 stars">★</button><button class="gp-star" type="button" data-rating="4" aria-label="4 stars">★</button><button class="gp-star" type="button" data-rating="5" aria-label="5 stars">★</button></div><label for="gpFeedbackText">Short review <span class="gp-feedback-note">(optional, 180 characters)</span></label><textarea id="gpFeedbackText" maxlength="180" placeholder="What worked well, or what should improve?"></textarea><div class="gp-feedback-actions"><button class="btn" id="gpSaveFeedback" type="button">Save feedback</button><span class="gp-feedback-status" role="status"></span></div></section>`;
    document.body.append(overlay);
    let selected=0;
    const close=()=>{overlay.classList.remove('open');document.body.style.overflow=''};
    $('.gp-feedback-close',overlay).onclick=close;
    overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
    overlay.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
    overlay.querySelectorAll('.gp-star').forEach(button=>button.onclick=()=>{selected=Number(button.dataset.rating);overlay.querySelectorAll('.gp-star').forEach(star=>{const on=Number(star.dataset.rating)<=selected;star.classList.toggle('selected',on);star.setAttribute('aria-checked',String(Number(star.dataset.rating)===selected))})});
    $('#gpSaveFeedback',overlay).onclick=()=>{
      const status=$('.gp-feedback-status',overlay);
      if(!selected){status.textContent='Choose 1–5 stars first.';return}
      const data=read();data.push({rating:selected,message:$('#gpFeedbackText',overlay).value.trim(),created:new Date().toISOString()});write(data);
      status.textContent=selected>=4?'Saved — added to this device’s positive-review animation.':'Saved privately on this device.';
      reviews();setTimeout(close,1250);
    };
  }

  function open(){modal();const overlay=$('#gpFeedback');overlay.classList.add('open');document.body.style.overflow='hidden';$('.gp-star',overlay).focus()}
  function init(){addStyles();modal();reviews();const button=$('#feedbackButton');if(button)button.onclick=open;if(new URLSearchParams(location.search).get('feedback')==='1')open()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
