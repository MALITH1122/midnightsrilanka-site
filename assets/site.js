/* Midnight Sri Lanka shared effects: card glow, particle background, live NIGHT price in the top bar */
(function(){
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine=window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var mx=-999,my=-999;
  window.addEventListener("mousemove",function(e){mx=e.clientX;my=e.clientY},{passive:true});
  document.addEventListener("mouseleave",function(){mx=my=-999});

  // top bar price (pages that don't load their own price feed)
  if(!document.getElementById("pstatus")){
    var set=function(k,t,c){document.querySelectorAll('[data-p="'+k+'"]').forEach(function(el){el.textContent=t;if(c)el.className="chg "+c})};
    var load=function(){
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=midnight-3&vs_currencies=usd,lkr&include_24hr_change=true").then(function(r){return r.json()}).then(function(j){
        var d=j["midnight-3"];if(!d||typeof d.usd!=="number")return;
        set("usd","$"+(d.usd<1?d.usd.toFixed(5):d.usd.toFixed(2)));
        if(typeof d.lkr==="number")set("lkr","Rs. "+d.lkr.toFixed(2));
        if(typeof d.usd_24h_change==="number"){var c=d.usd_24h_change;set("chg",(c>=0?"+":"")+c.toFixed(2)+"%",c>=0?"up":"down")}
      }).catch(function(){});
    };
    if(document.querySelector("[data-p]")){load();setInterval(load,60000)}
  }

  if(reduce)return;

  // card glow that follows the pointer (+ a slight tilt on small cards)
  if(fine){
    var cur=null;
    var clear=function(c){c.classList.remove("spot");c.style.transform=""};
    document.addEventListener("mousemove",function(e){
      var c=e.target.closest&&e.target.closest(".card,.upd,.glowbox");
      if(cur&&cur!==c)clear(cur);
      cur=c;if(!c)return;
      var r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      c.style.setProperty("--mx",x+"px");c.style.setProperty("--my",y+"px");
      c.classList.add("spot");
      if(!c.classList.contains("glowbox")&&window.innerWidth>960&&r.width<640){
        c.classList.add("tilt");
        var rx=((y-r.height/2)/(r.height/2))*-3.2,ry=((x-r.width/2)/(r.width/2))*3.2;
        c.style.transform="perspective(900px) rotateX("+rx.toFixed(2)+"deg) rotateY("+ry.toFixed(2)+"deg) translateY(-4px)";
      }
    });
    document.addEventListener("mouseleave",function(){if(cur){clear(cur);cur=null}});
  }

  // particle network background
  var cv=document.getElementById("zk-canvas");if(!cv||!cv.getContext)return;
  var ctx=cv.getContext("2d"),W,H,pts=[],dpr=Math.min(window.devicePixelRatio||1,2),running=true;
  function init(){
    W=window.innerWidth;H=window.innerHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    var n=W<768?20:42;pts=[];
    for(var i=0;i<n;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*1.6+.8});
  }
  window.addEventListener("resize",init);init();
  document.addEventListener("visibilitychange",function(){running=!document.hidden;if(running)requestAnimationFrame(draw)});
  function draw(){
    if(!running)return;
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<pts.length;i++){
      var p=pts[i];p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      var md=Math.hypot(p.x-mx,p.y-my);
      if(md<150){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mx,my);ctx.strokeStyle="rgba(75,75,255,"+(1-md/150)*.45+")";ctx.stroke()}
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,.75)";ctx.fill();
      for(var j=i+1;j<pts.length;j++){var q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);
        if(d<130){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle="rgba(0,0,254,"+(1-d/130)*.38+")";ctx.stroke()}}
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
