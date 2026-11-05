/* Ported from "The Grand - Lower Parel.html" */
(function(){
if(window.__grandInit)return;window.__grandInit=true;
/* Replacements for the inline onclick handlers of the original page */
document.addEventListener('click',function(e){
 var o=e.target.closest&&e.target.closest('[data-open-dialog]');if(o){var d=document.getElementById(o.getAttribute('data-open-dialog'));if(d&&d.showModal)d.showModal();return;}
 var c=e.target.closest&&e.target.closest('[data-close-dialog]');if(c){var d2=c.closest('dialog');if(d2)d2.close();return;}
 var a=e.target.closest&&e.target.closest('[data-slide]');if(a){var t=a.parentElement.querySelector('.visual-track');if(t)t.scrollBy({left:(a.getAttribute('data-slide')==='prev'?-1:1)*t.clientWidth,behavior:'smooth'});}
});
document.querySelectorAll('dialog[data-backdrop-close]').forEach(function(d){d.addEventListener('click',function(e){if(e.target===d)d.close();});});

(function(){
  var t=document.getElementById('amenityTrack');
  if(!t)return;
  var slides=t.querySelectorAll('.amenity');
  var dotsWrap=document.getElementById('amenityDots');
  var prev=document.getElementById('amenityPrev');
  var next=document.getElementById('amenityNext');
  for(var i=0;i<slides.length;i++){
    (function(k){
      var b=document.createElement('button');
      b.type='button';
      b.setAttribute('aria-label','Go to amenity '+(k+1));
      b.addEventListener('click',function(){t.scrollTo({left:k*t.clientWidth,behavior:'smooth'});});
      dotsWrap.appendChild(b);
    })(i);
  }
  var dots=dotsWrap.querySelectorAll('button');
  function update(){
    var i=Math.round(t.scrollLeft/t.clientWidth);
    for(var k=0;k<dots.length;k++){dots[k].classList.toggle('on',k===i);}
    prev.hidden=(t.scrollLeft<=2);
    next.hidden=(t.scrollLeft>=t.scrollWidth-t.clientWidth-2);
  }
  t.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  prev.addEventListener('click',function(){t.scrollBy({left:-t.clientWidth,behavior:'smooth'});});
  next.addEventListener('click',function(){t.scrollBy({left:t.clientWidth,behavior:'smooth'});});
  update();
})();
(function(){
  document.querySelectorAll('.visual').forEach(function(v){
    var t=v.querySelector('.visual-track'),p=v.querySelector('.visual-arrow-prev'),n=v.querySelector('.visual-arrow-next');
    if(!t||!p||!n)return;
    function u(){p.hidden=(t.scrollLeft<=2);n.hidden=(t.scrollLeft>=t.scrollWidth-t.clientWidth-2);}
    t.addEventListener('scroll',u,{passive:true});window.addEventListener('resize',u);u();
  });
})();

(function(){
  var grid=document.getElementById('gGrid');if(!grid)return;
  var items=[].slice.call(grid.querySelectorAll('.g-item')),tabs=document.querySelectorAll('.g-tabs button');
  tabs.forEach(function(t){t.addEventListener('click',function(){
    tabs.forEach(function(o){o.classList.toggle('on',o===t);});
    var f=t.getAttribute('data-f');
    items.forEach(function(x){x.hidden=!(f==='all'||x.getAttribute('data-cat').split(' ').indexOf(f)>-1);});
  });});
  var $=function(id){return document.getElementById(id);};
  var lb=$('lb'),stage=$('lbStage'),track=$('lbTrack'),cap=$('lbCap'),cnt=$('lbCount'),thumbs=$('lbThumbs'),
      nc=$('lbNextCard'),ncImg=$('lbNcImg'),ncName=$('lbNcName'),ncLabel=$('lbNcLabel'),hint=$('lbHint');
  var list=[],cur=0,ncCls=null,hinted=false;
  function vis(){return items.filter(function(x){return !x.hidden;});}
  function build(){
    track.innerHTML='';thumbs.innerHTML='';
    list.forEach(function(x,i){
      var sl=document.createElement('div');sl.className='lb-slide';
      var sp=document.createElement('span');sp.className='rimg '+x.getAttribute('data-r');sl.appendChild(sp);track.appendChild(sl);
      var tb=document.createElement('button');tb.type='button';tb.setAttribute('aria-label','Show '+x.getAttribute('data-cap')+' ('+(i+1)+')');
      var ts=document.createElement('span');ts.className='rimg '+x.getAttribute('data-r');tb.appendChild(ts);
      tb.addEventListener('click',function(){go(i);});thumbs.appendChild(tb);
    });
  }
  function go(i){
    var n=list.length;cur=((i%n)+n)%n;
    track.style.transform='translateX('+(-cur*100)+'%)';
    cap.textContent=list[cur].getAttribute('data-cap');cnt.textContent=(cur+1)+' / '+n;
    var tb=thumbs.children;for(var k=0;k<tb.length;k++)tb[k].classList.toggle('on',k===cur);
    var a=tb[cur];if(a)thumbs.scrollTo({left:a.offsetLeft-thumbs.clientWidth/2+a.clientWidth/2,behavior:'smooth'});
    var nx=list[(cur+1)%n];
    if(ncCls)ncImg.classList.remove(ncCls);ncCls=nx.getAttribute('data-r');ncImg.classList.add('rimg',ncCls);
    ncName.textContent=nx.getAttribute('data-cap');ncLabel.textContent=cur===n-1?'Back to first':'Next';
    nc.style.animation='none';void nc.offsetWidth;nc.style.animation='';
    nc.hidden=n<2;
  }
  items.forEach(function(x){x.addEventListener('click',function(){
    list=vis();build();lb.showModal();
    track.classList.add('drag');go(list.indexOf(x));void track.offsetWidth;track.classList.remove('drag');
    if(!hinted){hinted=true;hint.classList.add('show');setTimeout(function(){hint.classList.remove('show');},1800);}
  });});
  $('lbPrev').onclick=function(){go(cur-1);};
  $('lbNext').onclick=function(){go(cur+1);};
  nc.onclick=function(){go(cur+1);};
  $('lbClose').onclick=function(){lb.close();};
  lb.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')go(cur-1);if(e.key==='ArrowRight')go(cur+1);});
  /* swipe / drag */
  var sx=null,sy=0,dx=0,pid=null;
  stage.addEventListener('pointerdown',function(e){if(e.button>0)return;sx=e.clientX;sy=e.clientY;dx=0;pid=e.pointerId;track.classList.add('drag');try{stage.setPointerCapture(pid);}catch(_){}});
  stage.addEventListener('pointermove',function(e){if(sx===null||e.pointerId!==pid)return;dx=e.clientX-sx;
    var edge=(cur===0&&dx>0)||(cur===list.length-1&&dx<0);var d=edge?dx/3:dx;
    track.style.transform='translateX(calc('+(-cur*100)+'% + '+d+'px))';});
  function end(){if(sx===null)return;track.classList.remove('drag');
    var th=Math.min(80,stage.clientWidth*.15);
    if(dx<-th&&cur<list.length-1)go(cur+1);else if(dx>th&&cur>0)go(cur-1);else go(cur);
    sx=null;pid=null;dx=0;}
  stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
  lb.addEventListener('click',function(e){if(e.target===lb)lb.close();});
})();

(function(){
  var h=document.querySelector('.hero');
  function u(){if(document.body.classList.contains('entered')){document.body.classList.add('scrolled');return;}var lim=h?h.offsetHeight*0.6:200;document.body.classList.toggle('scrolled',window.scrollY>lim);}
  window.addEventListener('scroll',u,{passive:true});window.addEventListener('resize',u);u();
  document.querySelectorAll('nav .links a').forEach(function(a){a.addEventListener('click',function(){var t=document.getElementById('navToggle');if(t)t.checked=false;});});
})();

(function(){
  var b=document.getElementById('enterBtn'),h=document.querySelector('.hero');if(!b||!h)return;
  var done=false;
  function enter(){
    if(done)return;done=true;
    try{var de=document.documentElement;if(document.fullscreenEnabled&&!document.fullscreenElement&&de.requestFullscreen){de.requestFullscreen().catch(function(){});}}catch(_){}
    var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    h.classList.add('leaving');
    setTimeout(function(){
      h.style.display='none';
      document.body.classList.remove('locked');document.body.classList.add('entered','scrolled');
      window.scrollTo(0,0);
    },rm?0:1000);
  }
  b.addEventListener('click',enter);
  function home(){if(!done)return;var t=document.getElementById('navToggle');if(t)t.checked=false;
    document.body.classList.add('locked');document.body.classList.remove('entered','scrolled');
    h.classList.remove('leaving');h.style.display='';window.scrollTo(0,0);setTimeout(function(){done=false;},400);}
  window.kismatHome=home;
  document.querySelectorAll('[data-home]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();home();});});
  window.addEventListener('load',function(){window.scrollTo(0,0);});
  window.addEventListener('pageshow',function(){if(!done)window.scrollTo(0,0);});
  document.addEventListener('keydown',function(e){if(!done&&e.key==='Enter'&&document.activeElement!==b)enter();});
  window.addEventListener('wheel',function(e){if(!done&&e.deltaY>8)enter();},{passive:true});
  var ty=null;
  window.addEventListener('touchstart',function(e){if(!done)ty=e.touches[0].clientY;},{passive:true});
  window.addEventListener('touchmove',function(e){if(!done&&ty!==null&&ty-e.touches[0].clientY>30){ty=null;enter();}},{passive:true});
  document.addEventListener('keydown',function(e){if(!done&&['ArrowDown','PageDown',' ','Spacebar'].indexOf(e.key)>-1){e.preventDefault();enter();}});
})();

(function(){
  var t=document.getElementById('resTrack'),dw=document.getElementById('resDots');if(!t)return;
  var n=t.children.length;
  for(var i=0;i<n;i++)(function(k){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Show image '+(k+1));b.onclick=function(){t.scrollTo({left:k*t.clientWidth,behavior:'smooth'});};dw.appendChild(b);})(i);
  function u(){var k=Math.round(t.scrollLeft/t.clientWidth);[].forEach.call(dw.children,function(b,j){b.classList.toggle('on',j===k);});}
  t.addEventListener('scroll',u,{passive:true});window.addEventListener('resize',u);u();
  var sx=null,sl=0,moved=0;
  t.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button)return;sx=e.clientX;sl=t.scrollLeft;moved=0;t.classList.add('dragging');t.setPointerCapture(e.pointerId);});
  t.addEventListener('pointermove',function(e){if(sx===null)return;moved=e.clientX-sx;t.scrollLeft=sl-moved;});
  function end(){if(sx===null)return;t.classList.remove('dragging');var k=Math.round(sl/t.clientWidth);
    if(moved<-60)k++;else if(moved>60)k--;k=Math.max(0,Math.min(n-1,k));t.scrollTo({left:k*t.clientWidth,behavior:'smooth'});sx=null;}
  t.addEventListener('pointerup',end);t.addEventListener('pointercancel',end);
})();

(function(){
  var t=document.getElementById('amTrack');if(!t)return;
  var dw=document.getElementById('amDots'),T=document.getElementById('amT'),P=document.getElementById('amP'),pv=document.getElementById('amPrev'),nx=document.getElementById('amNext');
  var sl=[].slice.call(t.children),n=sl.length,cur=-1;
  sl.forEach(function(_,k){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Show image '+(k+1));b.onclick=function(){go(k);};dw.appendChild(b);});
  function go(k){t.scrollTo({left:k*t.clientWidth,behavior:'smooth'});}
  function u(){var k=Math.round(t.scrollLeft/t.clientWidth);if(k===cur)return;cur=k;
    [].forEach.call(dw.children,function(b,j){b.classList.toggle('on',j===k);});
    T.textContent=sl[k].getAttribute('data-t');P.textContent=sl[k].getAttribute('data-p');
    pv.hidden=k===0;nx.hidden=k===n-1;}
  t.addEventListener('scroll',u,{passive:true});window.addEventListener('resize',function(){cur=-1;u();});u();
  pv.onclick=function(){go(cur-1);};nx.onclick=function(){go(cur+1);};
  var sx=null,s0=0,mv=0;
  t.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button)return;sx=e.clientX;s0=t.scrollLeft;mv=0;t.classList.add('dragging');t.setPointerCapture(e.pointerId);});
  t.addEventListener('pointermove',function(e){if(sx===null)return;mv=e.clientX-sx;t.scrollLeft=s0-mv;});
  function end(){if(sx===null)return;t.classList.remove('dragging');var k=Math.round(s0/t.clientWidth);if(mv<-60)k++;else if(mv>60)k--;go(Math.max(0,Math.min(n-1,k)));sx=null;}
  t.addEventListener('pointerup',end);t.addEventListener('pointercancel',end);
})();

(function(){var t=document.getElementById('amenityTrack');if(!t)return;var n=t.children.length,sx=null,s0=0,mv=0;
 t.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button)return;sx=e.clientX;s0=t.scrollLeft;mv=0;t.classList.add('dragging');t.setPointerCapture(e.pointerId);});
 t.addEventListener('pointermove',function(e){if(sx===null)return;mv=e.clientX-sx;t.scrollLeft=s0-mv;});
 function end(){if(sx===null)return;t.classList.remove('dragging');var k=Math.round(s0/t.clientWidth);if(mv<-60)k++;else if(mv>60)k--;k=Math.max(0,Math.min(n-1,k));t.scrollTo({left:k*t.clientWidth,behavior:'smooth'});sx=null;}
 t.addEventListener('pointerup',end);t.addEventListener('pointercancel',end);})();

document.addEventListener('click',function(e){var t=document.getElementById('navToggle');if(t&&t.checked&&!e.target.closest('nav'))t.checked=false;});







(function(){var b=document.getElementById('fsBtn');if(!b)return;var de=document.documentElement;
 if(document.fullscreenEnabled&&de.requestFullscreen)document.body.classList.add('fs-ok');
 function u(){document.body.classList.toggle('is-fs',!!document.fullscreenElement);b.title=b.ariaLabel=document.fullscreenElement?'Exit full screen':'Full screen';}
 document.addEventListener('fullscreenchange',u);
 b.addEventListener('click',function(){if(document.fullscreenElement)document.exitFullscreen();else de.requestFullscreen().catch(function(){});});})();

(function(){
 /* slider hints + counters */
 function setup(track){if(!track)return;var host=track.parentElement,h=host.querySelector('.swipe-hint'),c=host.querySelector('.sl-count');var n=track.children.length;
   if(n<2){if(h)h.remove();if(c)c.remove();return;}
   function u(){var f=track.children[0],st=f?(f.getBoundingClientRect().width+(parseFloat(getComputedStyle(track).columnGap)||0)):track.clientWidth;var k=Math.min(n-1,Math.round(track.scrollLeft/Math.max(1,st)));if(c)c.textContent=(k+1)+' / '+n;if(h&&track.scrollLeft>20)h.classList.add('gone');}
   track.addEventListener('scroll',u,{passive:true});window.addEventListener('resize',u);u();
   ['pointerdown','touchstart'].forEach(function(ev){track.addEventListener(ev,function(){if(h)h.classList.add('gone');},{passive:true});});
   host.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){if(h)h.classList.add('gone');});});}
 ['resTrack','amTrack','amenityTrack'].forEach(function(id){setup(document.getElementById(id));});setup(document.querySelector('.pf-wrap .portfolio-grid'));
 /* page dots + active menu */
 var secs=[].slice.call(document.querySelectorAll('body > section')),dw=document.getElementById('pageDots'),links=[].slice.call(document.querySelectorAll('nav .links a'));
 var names={residences:'Residences',highlights:'Highlights',gallery:'Lifestyle',amenities:'Amenities',modernization:'Modernization',location:'Location',legacy:'Legacy',portfolio:'Portfolio',legal:'Legal'};
 secs.forEach(function(sec){var b=document.createElement('button');b.type='button';var nm=sec.getAttribute('data-dot')||names[sec.id]||sec.id;b.setAttribute('aria-label',nm);b.innerHTML='<span>'+nm+'</span>';b.onclick=function(){sec.scrollIntoView({behavior:'smooth'});};dw.appendChild(b);});
 var dots=[].slice.call(dw.children),cur=-1,moves=0,toast=document.getElementById('upToast');
 function setAct(i){if(i===cur)return;if(cur>=0)moves++;cur=i;dots.forEach(function(d,j){d.classList.toggle('on',j===i);});
   var id=secs[i].id;if(id==='portfolio')id='legacy';links.forEach(function(a){a.classList.toggle('act',a.getAttribute('href')==='#'+id);});
   if(moves>0&&toast)toast.classList.remove('show');}
 function pick(){var best=-1,bv=1e9;secs.forEach(function(sec,i){var r=sec.getBoundingClientRect();var v=Math.abs(r.top);if(r.bottom>innerHeight*0.4&&v<bv){bv=v;best=i;}});if(best>=0)setAct(best);}
 window.addEventListener('scroll',function(){if(document.body.classList.contains('entered'))pick();},{passive:true});
 /* swipe-up toast after Enter */
 var shown=false;new MutationObserver(function(){if(!shown&&document.body.classList.contains('entered')){shown=true;pick();setTimeout(function(){if(moves===0)toast.classList.add('show');},700);setTimeout(function(){toast.classList.remove('show');},5200);}}).observe(document.body,{attributes:true,attributeFilter:['class']});
})();

(function(){var tb=document.querySelectorAll('.mod-tabs button'),ps=document.querySelectorAll('.mod-split .mod-panel');if(!tb.length)return;
 function show(i){tb.forEach(function(b,j){b.classList.toggle('on',j===i);});ps.forEach(function(p,j){p.classList.toggle('show',j===i);});}
 tb.forEach(function(b,i){b.addEventListener('click',function(){show(i);});});show(0);})();

/* ===== one-page-at-a-time pager (v2: no hangs) ===== */
(function(){
 var secs=[].slice.call(document.querySelectorAll('body > section')),lock=false,lockT=null,H=function(){return window.innerHeight;};
 var root=document.documentElement;
 function idx(){var y=window.scrollY,b=0,bv=1e9;secs.forEach(function(s,i){var d=Math.abs(s.offsetTop-y);if(d<bv){bv=d;b=i;}});
   for(var i=secs.length-1;i>=0;i--){if(secs[i].offsetTop<=y+2){if(y<secs[i].offsetTop+secs[i].offsetHeight-2)return i;}}return b;}
 function tall(s){return s.offsetHeight>H()+4;}
 function markTall(){secs.forEach(function(s){s.classList.toggle('pg-tall',tall(s));});}
 function unlock(){lock=false;clearTimeout(lockT);settle();}
 function settle(){/* if left between two pages, finish the move */
   if(!active())return;var i=idx(),s=secs[i],y=window.scrollY;if(tall(s)&&y>=s.offsetTop-2&&y<=s.offsetTop+s.offsetHeight-H()+2)return;
   var best=0,bv=1e9;secs.forEach(function(x,j){var d=Math.abs(x.offsetTop-y);if(d<bv){bv=d;best=j;}});
   if(bv>3){lock=true;window.scrollTo({top:secs[best].offsetTop,behavior:'smooth'});lockT=setTimeout(function(){lock=false;},900);}}
 function go(i,top){if(i<0||i>=secs.length)return;var t=top!=null?top:secs[i].offsetTop;if(Math.abs(window.scrollY-t)<2)return;
   lock=true;clearTimeout(lockT);window.scrollTo({top:t,behavior:'smooth'});lockT=setTimeout(unlock,1100);}
 if('onscrollend' in window){window.addEventListener('scrollend',function(){if(lock){lock=false;clearTimeout(lockT);}});}
 function canInner(dir){var i=idx(),s=secs[i],top=s.offsetTop,bot=top+s.offsetHeight,y=window.scrollY;
   if(!tall(s))return false;
   if(dir>0)return y+H()<bot-2; else return y>top+2;}
 function active(){return document.body.classList.contains('entered')&&!document.querySelector('dialog[open]');}
 function step(dir){var i=idx(),s=secs[i],y=window.scrollY;
   if(dir>0){if(y<s.offsetTop-2){go(i);return;}go(i+1);}
   else{if(y>s.offsetTop+2&&!tall(s)){go(i);return;}var p=secs[i-1];if(!p)return;go(i-1,tall(p)?p.offsetTop+p.offsetHeight-H():null);}}
 /* wheel / trackpad: one page per gesture, momentum ignored */
 var lastW=0;
 window.addEventListener('wheel',function(e){if(!active()||e.ctrlKey)return;
   if(e.target.closest('.visual-track,.amenity-track,.portfolio-grid')&&Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
   if(Math.abs(e.deltaY)<4)return;var dir=e.deltaY>0?1:-1,now=Date.now(),fresh=now-lastW>220;lastW=now;
   if(!lock&&canInner(dir))return;e.preventDefault();if(lock||!fresh)return;step(dir);},{passive:false});
 /* touch: vertical page swipes handled here, horizontal swipes stay native for the image sliders */
 var sx=0,sy=0,st=0,mode=null,ciU=false,ciD=false;
 window.addEventListener('touchstart',function(e){if(!active()||e.touches.length>1||window.kzZoomed){mode='skip';return;}
   sx=e.touches[0].clientX;sy=e.touches[0].clientY;st=Date.now();mode=null;ciD=canInner(1);ciU=canInner(-1);},{passive:true});
 window.addEventListener('touchmove',function(e){if(mode==='skip'||!active())return;if(e.touches.length>1){mode='skip';return;}
   if(mode===null){var dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;if(Math.abs(dx)<8&&Math.abs(dy)<8)return;mode=Math.abs(dy)>Math.abs(dx)?'v':'h';}},{passive:true});
 window.addEventListener('touchend',function(e){if(mode==='v'&&active()&&!window.kzZoomed){var dy=e.changedTouches[0].clientY-sy,dir=dy<0?1:-1;
     var inner=dir>0?ciD:ciU;
     if(inner){setTimeout(settleTall,350);}
     else if(Math.abs(dy)>35||(Math.abs(dy)>15&&Date.now()-st<250)){if(!lock)step(dir);}}
   else if(mode==='skip'||mode==='h'){}
   mode=null;},{passive:true});
 window.addEventListener('touchcancel',function(){mode=null;},{passive:true});
 function settleTall(){if(lock||!active())return;var i=idx(),s=secs[i],y=window.scrollY,top=s.offsetTop,bot=top+s.offsetHeight;
   if(y<top-2||y+H()>bot+2)settle();}
 document.addEventListener('keydown',function(e){if(!active())return;var t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;
   var k=e.key;if(k==='ArrowDown'||k==='PageDown'||(k===' '&&!e.shiftKey)){if(canInner(1))return;e.preventDefault();if(!lock)step(1);}
   else if(k==='ArrowUp'||k==='PageUp'||(k===' '&&e.shiftKey)){if(canInner(-1))return;e.preventDefault();if(!lock)step(-1);}});
 var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){markTall();if(active()){var i=idx();window.scrollTo({top:secs[i].offsetTop,behavior:'auto'});}},200);});
 markTall();window.addEventListener('load',markTall);
 new MutationObserver(function(){markTall();}).observe(document.body,{attributes:true,attributeFilter:['class']});
})();

(function(){var hs=[].slice.call(document.querySelectorAll('.swipe-hint'));if(!('IntersectionObserver' in window)){hs.forEach(function(h){h.classList.add('gone');});return;}
 var io=new IntersectionObserver(function(es){es.forEach(function(en){var h=en.target.querySelector(':scope > .swipe-hint');if(!h||!en.isIntersecting||h.dataset.done)return;
   if(getComputedStyle(h).display==='none')return;h.dataset.done='1';io.unobserve(en.target);
   if(h.classList.contains('gone'))return;h.classList.add('play');setTimeout(function(){h.classList.add('gone');},5500);});},{threshold:0.6});
 hs.forEach(function(h){io.observe(h.parentElement);});})();

(function(){var n=document.querySelector('nav');if(!n)return;function u(){document.documentElement.style.setProperty('--navh',n.offsetHeight+'px');}u();window.addEventListener('resize',u);window.addEventListener('load',u);new MutationObserver(u).observe(document.body,{attributes:true,attributeFilter:['class']});})();

/* in-place pinch / double-tap zoom on the render pictures */
(function(){
 var SEL='#resTrack .visual-slide,#amTrack .visual-slide,#amenityTrack .amenity-img',MAX=5;
 var tracks=['resTrack','amTrack','amenityTrack'].map(function(id){return document.getElementById(id);}).filter(Boolean);
 window.kzZoomed=false;
 function layer(h){var fg=h.querySelector('.ls-fg');if(fg)return fg;var l=h.querySelector(':scope>.kz-layer');if(l)return l;
   l=document.createElement('span');l.className='kz-layer';var cs=getComputedStyle(h);l.style.backgroundImage=cs.backgroundImage;l.style.backgroundPosition=cs.backgroundPosition;h.insertBefore(l,h.firstChild);return l;}
 function st(h){return h._kz||(h._kz={s:1,tx:0,ty:0});}
 function anyZoom(){window.kzZoomed=[].some.call(document.querySelectorAll(SEL),function(h){return h._kz&&h._kz.s>1;});}
 function apply(h,anim){var z=st(h),W=h.clientWidth,H=h.clientHeight;
   if(z.s<=1.02){z.s=1;z.tx=0;z.ty=0;}else{z.tx=Math.min(0,Math.max(W-W*z.s,z.tx));z.ty=Math.min(0,Math.max(H-H*z.s,z.ty));}
   h.classList.toggle('kz-anim',!!anim);var l=layer(h);l.style.transform=z.s===1?'':'translate('+z.tx+'px,'+z.ty+'px) scale('+z.s+')';
   h.classList.toggle('kz-on',z.s>1);anyZoom();}
 function zoomAt(h,ns,cx,cy,anim){var z=st(h);ns=Math.max(1,Math.min(MAX,ns));z.tx=cx-(cx-z.tx)*ns/z.s;z.ty=cy-(cy-z.ty)*ns/z.s;z.s=ns;apply(h,anim);}
 function reset(h,anim){var z=st(h);if(z.s===1)return;z.s=1;apply(h,anim);}
 function resetAll(){[].forEach.call(document.querySelectorAll(SEL),function(h){if(h._kz&&h._kz.s>1)reset(h,false);});}
 function hostAt(x,y){var els=document.elementsFromPoint?document.elementsFromPoint(x,y):[];for(var i=0;i<els.length;i++){var h=els[i].closest&&els[i].closest(SEL);if(h)return h;}return null;}
 function rel(h,x,y){var r=h.getBoundingClientRect();return {x:x-r.left,y:y-r.top};}
 tracks.forEach(function(t){
   /* ---- touch ---- */
   var h=null,mode=null,d0=0,s0=1,m0=null,lx=0,ly=0,tap=null,lastTap=0,ltx=0,lty=0;
   t.addEventListener('touchstart',function(e){var n=e.touches.length;
     if(n===2){var a=e.touches[0],b=e.touches[1];h=hostAt((a.clientX+b.clientX)/2,(a.clientY+b.clientY)/2)||h;if(!h)return;
       mode='pinch';d0=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);s0=st(h).s;var z=st(h);var m=rel(h,(a.clientX+b.clientX)/2,(a.clientY+b.clientY)/2);m0={u:(m.x-z.tx)/z.s,v:(m.y-z.ty)/z.s};tap=null;return;}
     if(n===1){var p=e.touches[0];h=hostAt(p.clientX,p.clientY);tap={x:p.clientX,y:p.clientY,t:Date.now()};lx=p.clientX;ly=p.clientY;
       mode=(h&&st(h).s>1)?'pan':null;}},{passive:true});
   t.addEventListener('touchmove',function(e){
     if(mode==='pinch'&&e.touches.length===2&&h){e.preventDefault();var a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
       var z=st(h),ns=Math.max(1,Math.min(MAX,s0*d/Math.max(1,d0))),m=rel(h,(a.clientX+b.clientX)/2,(a.clientY+b.clientY)/2);
       z.s=ns;z.tx=m.x-m0.u*ns;z.ty=m.y-m0.v*ns;apply(h,false);return;}
     if(e.touches.length===1){var p=e.touches[0];if(tap&&Math.abs(p.clientX-tap.x)+Math.abs(p.clientY-tap.y)>10)tap=null;
       if(mode==='pan'&&h){e.preventDefault();var z2=st(h);z2.tx+=p.clientX-lx;z2.ty+=p.clientY-ly;lx=p.clientX;ly=p.clientY;apply(h,false);}}},{passive:false});
   t.addEventListener('touchend',function(e){
     if(mode==='pinch'){if(e.touches.length===1){var p=e.touches[0];lx=p.clientX;ly=p.clientY;mode=(h&&st(h).s>1)?'pan':null;}else mode=null;if(h)apply(h,true);return;}
     if(tap&&h&&e.touches.length===0&&Date.now()-tap.t<300){var now=Date.now();
       if(now-lastTap<320&&Math.abs(tap.x-ltx)<35&&Math.abs(tap.y-lty)<35){lastTap=0;e.preventDefault();var r=rel(h,tap.x,tap.y);
         if(st(h).s>1)reset(h,true);else zoomAt(h,2.5,r.x,r.y,true);}
       else{lastTap=now;ltx=tap.x;lty=tap.y;}}
     if(e.touches.length===0)mode=null;},{passive:false});
   /* ---- mouse / trackpad ---- */
   var md=null;
   t.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button)return;var hh=e.target.closest(SEL);if(!hh||st(hh).s<=1)return;
     e.stopPropagation();e.preventDefault();md={h:hh,x:e.clientX,y:e.clientY};hh.classList.add('kz-drag');},true);
   window.addEventListener('pointermove',function(e){if(!md)return;var z=st(md.h);z.tx+=e.clientX-md.x;z.ty+=e.clientY-md.y;md.x=e.clientX;md.y=e.clientY;apply(md.h,false);});
   window.addEventListener('pointerup',function(){if(md){md.h.classList.remove('kz-drag');md=null;}});
   t.addEventListener('dblclick',function(e){var hh=hostAt(e.clientX,e.clientY);if(!hh)return;var r=rel(hh,e.clientX,e.clientY);
     if(st(hh).s>1)reset(hh,true);else zoomAt(hh,2.5,r.x,r.y,true);});
   t.addEventListener('wheel',function(e){if(!e.ctrlKey)return;var hh=e.target.closest(SEL);if(!hh)return;e.preventDefault();e.stopPropagation();
     var r=rel(hh,e.clientX,e.clientY);zoomAt(hh,st(hh).s*Math.exp(-e.deltaY*0.01),r.x,r.y,false);},{passive:false});
   /* another picture shown -> previous one back to normal */
   var sl0=null;t.addEventListener('scroll',function(){if(sl0===null)sl0=t.scrollLeft;if(Math.abs(t.scrollLeft-sl0)>20){sl0=t.scrollLeft;[].forEach.call(t.querySelectorAll(SEL),function(x){reset(x,false);});}},{passive:true});
 });
 /* leaving the page -> reset */
 var wy=window.scrollY;window.addEventListener('scroll',function(){if(Math.abs(window.scrollY-wy)>40){wy=window.scrollY;resetAll();}else if(!window.kzZoomed)wy=window.scrollY;},{passive:true});
 window.addEventListener('resize',resetAll);
})();

(function(){var s=document.getElementById('highlights');if(!s)return;var f=s.querySelector('.facts');
 function base(){var w=innerWidth,m=w<=760;s.style.setProperty('--hb',(m?15:Math.max(20,Math.min(28,w*0.0175)))+'px');s.style.setProperty('--hp',(m?12.5:Math.max(15,Math.min(19,w*0.0115)))+'px');s.style.setProperty('--hi',(m?28:46)+'px');}
 function over(){var fb=f.getBoundingClientRect().bottom;if(f.scrollHeight>f.clientHeight+1)return true;var c=f.querySelectorAll('.fact');for(var i=0;i<c.length;i++){var r=c[i].getBoundingClientRect(),k=c[i].lastElementChild;if(k&&k.getBoundingClientRect().bottom>Math.min(r.bottom,fb)+1)return true;}return false;}
 function fit(){base();var v=innerWidth<761?1:1.45;s.style.setProperty('--hs',v);var n=0;while(over()&&v>0.55&&n<30){v-=0.04;s.style.setProperty('--hs',v.toFixed(2));n++;}}
 var t;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(fit,80);});
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);window.addEventListener('load',fit);fit();
 new MutationObserver(function(){setTimeout(fit,50);}).observe(document.body,{attributes:true,attributeFilter:['class']});
})();

(function(){var d=document.getElementById('layoutsDlg');if(!d)return;var sc=document.getElementById('ldScroll');
 d.querySelectorAll('.ld-tab').forEach(function(t){t.addEventListener('click',function(){var k=t.getAttribute('data-d');
  d.querySelectorAll('.ld-tab').forEach(function(o){o.classList.toggle('on',o===t);});
  d.querySelectorAll('.ld-doc').forEach(function(x){x.classList.toggle('on',x.getAttribute('data-d')===k);});
  sc.classList.remove('big');sc.scrollTo(0,0);});});

 d.addEventListener('close',function(){sc.classList.remove('big');sc.scrollTo(0,0);});
 d.addEventListener('click',function(e){if(e.target===d)d.close();});
})();

/* plans: zoom (wheel/trackpad pinch, touch pinch, double-tap/click) + drag to pan */
(function(){var d=document.getElementById('layoutsDlg');if(!d)return;var sc=document.getElementById('ldScroll'),zb=document.getElementById('ldZb');
 var z=1,MAX=5,bt;
 function doc(){return sc.querySelector('.ld-doc.on');}
 function baseW(){var cs=getComputedStyle(sc);return sc.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);}
 function badge(){zb.textContent=Math.round(z*100)+'%';zb.classList.add('show');clearTimeout(bt);bt=setTimeout(function(){zb.classList.remove('show');},900);}
 function setZ(nz,cx,cy){nz=Math.max(1,Math.min(MAX,nz));if(Math.abs(nz-z)<.001)return;var sr=sc.getBoundingClientRect();
   if(cx==null){cx=sr.left+sr.width/2;cy=sr.top+sr.height/2;}
   var px=sc.scrollLeft+(cx-sr.left),py=sc.scrollTop+(cy-sr.top),k=nz/z;z=nz;
   var w=baseW()*z,hh=sc.clientHeight*z;doc().querySelectorAll('.ld-pg').forEach(function(p){p.style.width=w+'px';p.style.maxWidth='none';if(!p.querySelector('.ld-area'))p.style.height=hh+'px';});
   sc.classList.toggle('zm',z>1.01);
   sc.scrollLeft=px*k-(cx-sr.left);sc.scrollTop=py*k-(cy-sr.top);badge();}
 function reset(){z=1;sc.querySelectorAll('.ld-pg').forEach(function(p){p.style.width='';p.style.maxWidth='';p.style.height='';});sc.classList.remove('zm');}
 d.querySelectorAll('.ld-tab').forEach(function(t){t.addEventListener('click',reset);});d.addEventListener('close',reset);
 function setH(){sc.style.setProperty('--ldh',sc.clientHeight+'px');}
 window.addEventListener('resize',function(){setH();if(d.open&&z>1){var w=baseW()*z;doc().querySelectorAll('.ld-pg').forEach(function(p){p.style.width=w+'px';if(!p.querySelector('.ld-area'))p.style.height=(sc.clientHeight*z)+'px';});}});
 new MutationObserver(function(){if(d.open)requestAnimationFrame(setH);}).observe(d,{attributes:true,attributeFilter:['open']});
 d.querySelectorAll('.ld-tab').forEach(function(t){t.addEventListener('click',function(){requestAnimationFrame(setH);});});
 sc.addEventListener('wheel',function(e){if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();setZ(z*Math.exp(-Math.max(-60,Math.min(60,e.deltaY))*0.004),e.clientX,e.clientY);},{passive:false});
 sc.addEventListener('dblclick',function(e){if(!e.target.closest('.ld-pg'))return;setZ(z>1.01?1:2.5,e.clientX,e.clientY);});
 /* single click on a plan zooms in a step (mouse only) */
 var dn=false,sx,sy,sl,st,moved=false;
 sc.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button)return;dn=true;moved=false;sx=e.clientX;sy=e.clientY;sl=sc.scrollLeft;st=sc.scrollTop;});
 window.addEventListener('pointermove',function(e){if(!dn)return;var dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;if(z>1.01&&moved){sc.classList.add('drag');sc.scrollLeft=sl-dx;sc.scrollTop=st-dy;}});
 window.addEventListener('pointerup',function(){dn=false;sc.classList.remove('drag');});
 sc.addEventListener('click',function(e){if(moved||!e.target.closest('.ld-img'))return;if(e.detail>1)return;if(z<1.01)setZ(2.5,e.clientX,e.clientY);});
 /* touch: two-finger pinch, double-tap */
 var p0=null,z0=1,lastTap=0;
 sc.addEventListener('touchstart',function(e){if(e.touches.length===2){var a=e.touches[0],b=e.touches[1];p0=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);z0=z;e.preventDefault();}
   else if(e.touches.length===1){var now=Date.now(),t=e.touches[0];if(now-lastTap<300&&e.target.closest('.ld-pg')){e.preventDefault();setZ(z>1.01?1:2.5,t.clientX,t.clientY);lastTap=0;}else lastTap=now;}},{passive:false});
 sc.addEventListener('touchmove',function(e){if(e.touches.length===2&&p0){e.preventDefault();var a=e.touches[0],b=e.touches[1];var dd=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);setZ(z0*dd/p0,(a.clientX+b.clientX)/2,(a.clientY+b.clientY)/2);}},{passive:false});
 sc.addEventListener('touchend',function(e){if(e.touches.length<2)p0=null;});
 /* Safari trackpad pinch */
 var g0=1;sc.addEventListener('gesturestart',function(e){e.preventDefault();g0=z;});sc.addEventListener('gesturechange',function(e){e.preventDefault();setZ(g0*e.scale,e.clientX,e.clientY);});
})();

/* smooth tab jumps: fade out, jump straight to the page, fade in */
(function(){
 var cover=document.createElement('div');cover.className='pg-fade';cover.setAttribute('aria-hidden','true');document.body.appendChild(cover);
 var busy=false,links=[].slice.call(document.querySelectorAll('nav .links a'));
 document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
  var id=a.getAttribute('href').slice(1);if(!id)return;
  var t=document.getElementById(id);if(!t||t.tagName!=='SECTION')return;
  e.preventDefault();e.stopPropagation();
  var tg=document.getElementById('navToggle');if(tg)tg.checked=false;
  links.forEach(function(l){l.classList.toggle('act',l.getAttribute('href')==='#'+id);});
  if(busy)return;busy=true;
  cover.classList.add('on');
  setTimeout(function(){
   var r=document.documentElement,old=r.style.scrollBehavior;r.style.scrollBehavior='auto';
   window.scrollTo(0,t.offsetTop);
   r.style.scrollBehavior=old;
   requestAnimationFrame(function(){requestAnimationFrame(function(){cover.classList.remove('on');busy=false;});});
  },230);
 },true);
})();

/* hide the top menu tabs while the Experience index page is showing */
(function(){var ex=document.getElementById('experience');if(!ex)return;
 function u(){var y=window.scrollY,on=document.body.classList.contains('entered')&&Math.abs(y-ex.offsetTop)<window.innerHeight*0.5;document.body.classList.toggle('on-index',on);}
 window.addEventListener('scroll',u,{passive:true});window.addEventListener('resize',u);
 new MutationObserver(u).observe(document.body,{attributes:true,attributeFilter:['class']});u();})();

(function(){var r=document.querySelector(".experience .ex-rera:not(.ex-legal)"),l=document.querySelector(".experience .ex-legal");if(!r||!l)return;function u(){l.style.setProperty("width",r.offsetWidth+"px","important");}u();window.addEventListener("resize",u);window.addEventListener("load",u);if(document.fonts)document.fonts.ready.then(u);})();
})();
