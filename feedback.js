+(()=>{
  const LOCAL_KEY='githubProtectorFeedbackV1';
  const FIREBASE_SDK='https://www.gstatic.com/firebasejs/12.19.0';
  const firebaseConfig={
    apiKey:'AIzaSyCJDRBQzdRS8oq82e7c3kUPp7yMyusri7g',
    authDomain:'github-protector-27dbd.firebaseapp.com',
    databaseURL:'https://github-protector-27dbd-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId:'github-protector-27dbd',
    storageBucket:'github-protector-27dbd.firebasestorage.app',
    messagingSenderId:'323870724592',
    appId:'1:323870724592:web:516c2155cb3915cff9cd35',
    measurementId:'G-L0D1SY2T83'
  };
  const $=(selector,root=document)=>root.querySelector(selector);
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const readLocal=()=>{try{const data=JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]');return Array.isArray(data)?data:[]}catch{return[]}};
  const writeLocal=data=>{try{localStorage.setItem(LOCAL_KEY,JSON.stringify(data.slice(-30)))}catch{}};
  let cloud=null;
  let liveRatings=[];
  let cloudState='connecting';

  function addStyles(){
    if($('#gp-feedback-styles'))return;
    const style=document.createElement('style');
    style.id='gp-feedback-styles';
    style.textContent=`
      .gp-review-zone{max-width:1050px;margin:30px auto;padding:0 22px;overflow:hidden}
      .gp-review-head{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:12px}
      .gp-review-head h2{margin:0}.gp-review-head p{margin:0;color:#97a9c2;font-size:13px}
      .gp-review-track{position:relative;min-height:112px;border:1px solid #2b4160;border-radius:20px;background:linear-gradient(135deg,#0a1220,#111d31);overflow:hidden}
      .gp-review-card{position:absolute;left:-340px;top:15px;width:min(310px,calc(100vw - 80px));padding:15px 17px;border:1px solid #41628e;border-radius:15px;background:linear-gradient(145deg,#182941,#101a2b);box-shadow:0 14px 38px #0008;animation:gp-review-right var(--duration,14s) linear infinite;animation-delay:var(--delay,0s)}
      .gp-review-stars{color:#ffd166;letter-spacing:2px;font-size:17px}.gp-review-card p{margin:5px 0 0;color:#d9e6f7}.gp-review-card small{color:#8fa6c4}
      .gp-review-empty{position:absolute;inset:0;display:grid;place-items:center;padding:20px;text-align:center;color:#9eb1ca}
      @keyframes gp-review-right{from{transform:translateX(0)}to{transform:translateX(calc(100vw + 720px))}}
      .gp-feedback-overlay{position:fixed;inset:0;z-index:2147482500;display:none;place-items:center;padding:18px;background:#030711d9;backdrop-filter:blur(12px)}
      .gp-feedback-overlay.open{display:grid}.gp-feedback-panel{width:min(560px,100%);background:linear-gradient(150deg,#14233a,#0b1322);border:1px solid #3f5e87;border-radius:24px;padding:22px;box-shadow:0 28px 90px #000b;color:#eef6ff}
      .gp-feedback-top{display:flex;justify-content:space-between;gap:16px;align-items:center}.gp-feedback-top h2{margin:0}.gp-feedback-close{width:42px;height:42px;border-radius:13px!important;padding:0!important}
      .gp-stars{display:flex;gap:8px;margin:17px 0}.gp-star{width:50px;height:50px;padding:0!important;border-radius:14px!important;background:#111d30!important;color:#6f819c!important;font-size:24px!important;border:1px solid #334b6d!important}.gp-star.selected,.gp-star:hover{color:#ffd166!important;border-color:#ffd166!important;transform:translateY(-3px)}
      .gp-feedback-panel textarea{box-sizing:border-box;width:100%;min-height:105px;resize:vertical;border:1px solid #385274;border-radius:14px;background:#08111f;color:#edf5ff;padding:13px;font:inherit}.gp-feedback-panel label{display:block;font-weight:800;margin-bottom:7px}.gp-feedback-note{color:#9fb2cc;font-size:13px}.gp-feedback-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:14px}.gp-feedback-status{color:#78e3b0;font-weight:800}.gp-cloud-state{display:inline-flex;align-items:center;gap:7px;margin-top:6px;font-size:12px;color:#9fb2cc}.gp-cloud-state:before{content:'';width:8px;height:8px;border-radius:50%;background:#ffd166}.gp-cloud-state.ready:before{background:#38d996}.gp-cloud-state.local:before{background:#ff9bab}
      @media(prefers-reduced-motion:reduce){.gp-review-card{animation:none;position:relative;left:auto;top:auto;margin:14px}.gp-review-track{display:flex;overflow:auto}.gp-star{transition:none!important}}
    `;
    document.head.append(style);
  }

  function displayRatings(){
    if(cloudState==='ready')return liveRatings;
    return readLocal().filter(item=>Number(item.rating)>=4).slice(-8);
  }

  function renderReviews(){
    addStyles();
    const existing=$('#gpReviews');
    if(existing)existing.remove();
    const section=document.createElement('section');
    section.id='gpReviews';
    section.className='gp-review-zone';
    const source=cloudState==='ready'?'Shared ratings update live from Firebase.':'Connecting to shared ratings; device-saved ratings are shown meanwhile.';
    section.innerHTML=`<div class="gp-review-head"><div><h2>Recent positive ratings</h2><p>${source} Only honest 4–5-star reviews appear here.</p></div></div><div class="gp-review-track" aria-live="polite"></div>`;
    const track=$('.gp-review-track',section);
    const positive=displayRatings().filter(item=>Number(item.rating)>=4&&Number(item.rating)<=5).slice(-12);
    if(!positive.length){
      track.innerHTML='<div class="gp-review-empty">No positive ratings yet. Use “Rate & feedback” to leave an honest review.</div>';
    }else{
      positive.forEach((item,index)=>{
        const rating=Math.round(Number(item.rating));
        const card=document.createElement('article');
        card.className='gp-review-card';
        card.style.setProperty('--delay',`${index*2.2}s`);
        card.style.setProperty('--duration',`${Math.max(13,15+positive.length)}s`);
        card.innerHTML=`<div class="gp-review-stars" aria-label="${rating} out of 5 stars">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div><p>${escapeHtml(item.message||'Positive rating')}</p><small>${cloudState==='ready'?'Community review':'Saved on this device'}</small>`;
        track.append(card);
      });
    }
    const anchor=document.querySelector('.app')||document.querySelector('main')||document.body;
    anchor.append(section);
  }

  function updateCloudLabels(){
    const state=$('.gp-cloud-state');
    if(!state)return;
    state.className='gp-cloud-state '+(cloudState==='ready'?'ready':'local');
    state.textContent=cloudState==='ready'?'Connected to shared ratings':'Firebase unavailable — device fallback active';
  }

  async function connectFirebase(){
    try{
      const [{initializeApp},{getAuth,signInAnonymously},{getDatabase,ref,set,onValue,query,orderByChild,startAt,limitToLast}]=await Promise.all([
        import(`${FIREBASE_SDK}/firebase-app.js`),
        import(`${FIREBASE_SDK}/firebase-auth.js`),
        import(`${FIREBASE_SDK}/firebase-database.js`)
      ]);
      const app=initializeApp(firebaseConfig);
      const auth=getAuth(app);
      const credential=auth.currentUser?{user:auth.currentUser}:await signInAnonymously(auth);
      const db=getDatabase(app);
      cloud={db,user:credential.user,ref,set};
      const recent=query(ref(db,'ratings'),orderByChild('rating'),startAt(4),limitToLast(20));
      onValue(recent,snapshot=>{
        const raw=snapshot.val()||{};
        liveRatings=Object.values(raw)
          .filter(item=>item&&Number(item.rating)>=4&&Number(item.rating)<=5&&typeof item.message==='string')
          .sort((a,b)=>Number(a.updatedAt||0)-Number(b.updatedAt||0));
        cloudState='ready';
        updateCloudLabels();
        renderReviews();
      },error=>{
        console.warn('GitHub Protector ratings read failed:',error.code||error.message);
        cloudState='local';
        updateCloudLabels();
        renderReviews();
      });
    }catch(error){
      console.warn('GitHub Protector Firebase fallback:',error.code||error.message);
      cloudState='local';
      updateCloudLabels();
      renderReviews();
    }
  }

  function modal(){
    if($('#gpFeedback'))return;
    const overlay=document.createElement('div');
    overlay.id='gpFeedback';
    overlay.className='gp-feedback-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','gpFeedbackTitle');
    overlay.innerHTML=`<section class="gp-feedback-panel"><div class="gp-feedback-top"><div><div class="eyebrow">Anonymous community feedback</div><h2 id="gpFeedbackTitle">Rate GitHub Protector</h2><span class="gp-cloud-state">Connecting to shared ratings…</span></div><button class="gp-feedback-close" type="button" aria-label="Close feedback">×</button></div><p class="gp-feedback-note">Firebase anonymous sign-in is used; no name or email is requested. Your latest rating can be updated. Only 4–5-star reviews may appear publicly.</p><div class="gp-stars" role="radiogroup" aria-label="Rating"><button class="gp-star" type="button" data-rating="1" aria-label="1 star">★</button><button class="gp-star" type="button" data-rating="2" aria-label="2 stars">★</button><button class="gp-star" type="button" data-rating="3" aria-label="3 stars">★</button><button class="gp-star" type="button" data-rating="4" aria-label="4 stars">★</button><button class="gp-star" type="button" data-rating="5" aria-label="5 stars">★</button></div><label for="gpFeedbackText">Short review <span class="gp-feedback-note">(optional, 180 characters)</span></label><textarea id="gpFeedbackText" maxlength="180" placeholder="What worked well, or what should improve?"></textarea><div class="gp-feedback-actions"><button class="btn" id="gpSaveFeedback" type="button">Save or update rating</button><span class="gp-feedback-status" role="status"></span></div></section>`;
    document.body.append(overlay);
    let selected=0;
    const close=()=>{overlay.classList.remove('open');document.body.style.overflow=''};
    $('.gp-feedback-close',overlay).onclick=close;
    overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
    overlay.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
    overlay.querySelectorAll('.gp-star').forEach(button=>button.onclick=()=>{
      selected=Number(button.dataset.rating);
      overlay.querySelectorAll('.gp-star').forEach(star=>{
        const on=Number(star.dataset.rating)<=selected;
        star.classList.toggle('selected',on);
        star.setAttribute('aria-checked',String(Number(star.dataset.rating)===selected));
      });
    });
    $('#gpSaveFeedback',overlay).onclick=async event=>{
      const status=$('.gp-feedback-status',overlay);
      if(!selected){status.textContent='Choose 1–5 stars first.';return}
      const message=$('#gpFeedbackText',overlay).value.trim().slice(0,180);
      const now=Date.now();
      const item={rating:selected,message,createdAt:now,updatedAt:now};
      const local=readLocal();
      local.push(item);
      writeLocal(local);
      event.currentTarget.disabled=true;
      status.textContent='Saving…';
      if(cloud?.user){
        try{
          await cloud.set(cloud.ref(cloud.db,`ratings/${cloud.user.uid}`),item);
          status.textContent=selected>=4?'Saved — your community review can now appear.':'Saved — lower ratings remain private.';
        }catch(error){
          console.warn('GitHub Protector rating write failed:',error.code||error.message);
          status.textContent='Saved on this device. Firebase rejected the update.';
        }
      }else{
        status.textContent='Saved on this device. Shared ratings are not connected yet.';
      }
      event.currentTarget.disabled=false;
      renderReviews();
      setTimeout(close,1500);
    };
  }

  function open(){
    modal();
    const overlay=$('#gpFeedback');
    overlay.classList.add('open');
    document.body.style.overflow='hidden';
    updateCloudLabels();
    $('.gp-star',overlay).focus();
  }

  function init(){
    addStyles();
    modal();
    renderReviews();
    connectFirebase();
    const button=$('#feedbackButton');
    if(button)button.onclick=open;
    if(new URLSearchParams(location.search).get('feedback')==='1')open();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

