/* ════════════════════════════════════════
   DIGIYAAN360 – Shared JS v2
   Theme · Cursor · Splash · Nav · Cart · Checkout → WhatsApp
   ════════════════════════════════════════ */

// ── THEME ──────────────────────────────────────────────────────
(function () {
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  const btn  = document.getElementById('themeToggle');
  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    if (icon) icon.textContent = t === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('dg360-theme', t);
  }
  const saved  = localStorage.getItem('dg360-theme');
  const system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  applyTheme(saved || system);
  if (btn) btn.addEventListener('click', function () {
    applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('dg360-theme')) applyTheme(e.matches ? 'dark' : 'light');
  });
})();

// ── CURSOR ─────────────────────────────────────────────────────
(function () {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', function(e){ mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px'; });
  (function anim(){ rx+=(mx-rx)*.14;ry+=(my-ry)*.14;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(anim); })();
  document.addEventListener('mousedown',function(){ dot.style.transform='translate(-50%,-50%) scale(.6)';ring.style.transform='translate(-50%,-50%) scale(1.4)'; });
  document.addEventListener('mouseup',function(){ dot.style.transform='translate(-50%,-50%) scale(1)';ring.style.transform='translate(-50%,-50%) scale(1)'; });
})();

// ── SPLASH ─────────────────────────────────────────────────────
window.closeSplash = function () { var s=document.getElementById('splash'); if(s) s.classList.add('hide'); };
(function () {
  var s=document.getElementById('splash'); if(!s) return;
  if(sessionStorage.getItem('dg360-visited')){ s.classList.add('hide'); return; }
  sessionStorage.setItem('dg360-visited','1');
  setTimeout(function(){ s.classList.add('hide'); },4200);
})();

// ── HAMBURGER ──────────────────────────────────────────────────
(function () {
  var btn=document.getElementById('hamburger'), links=document.getElementById('navLinks');
  if(!btn||!links) return;
  btn.addEventListener('click',function(){ links.classList.toggle('open'); btn.textContent=links.classList.contains('open')?'✕':'☰'; });
  links.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ links.classList.remove('open');btn.textContent='☰'; }); });
})();

// ══════════════════════════════════════════
// CART SYSTEM
// ══════════════════════════════════════════
var DG_CART = {
  items: [],

  load: function() {
    try { this.items = JSON.parse(localStorage.getItem('dg360-cart') || '[]'); } catch(e){ this.items=[]; }
  },

  save: function() {
    localStorage.setItem('dg360-cart', JSON.stringify(this.items));
    this.updateUI();
  },

  add: function(item) {
    // item: { id, name, plan, price, icon }
    var exists = this.items.find(function(i){ return i.id === item.id; });
    if(exists){ exists.qty = (exists.qty||1)+1; }
    else { item.qty=1; this.items.push(item); }
    this.save();
    this.showAddedFeedback(item.id);
  },

  remove: function(id) {
    this.items = this.items.filter(function(i){ return i.id !== id; });
    this.save();
    this.renderItems();
  },

  total: function() {
    return this.items.reduce(function(s,i){ return s + i.price*(i.qty||1); }, 0);
  },

  count: function() {
    return this.items.reduce(function(s,i){ return s + (i.qty||1); }, 0);
  },

  clear: function() { this.items=[]; this.save(); this.renderItems(); },

  updateUI: function() {
    var cnt = this.count();
    var badge = document.getElementById('cartCount');
    var badgeM = document.getElementById('cartCountM');
    if(badge){ badge.textContent=cnt; badge.classList.toggle('show', cnt>0); }
    if(badgeM){ badgeM.textContent=cnt; badgeM.classList.toggle('show', cnt>0); }
  },

  showAddedFeedback: function(id) {
    // pulse all add-to-cart buttons with this id
    document.querySelectorAll('[data-cart-id="'+id+'"]').forEach(function(btn){
      btn.classList.add('added');
      btn.innerHTML = '✓ ADDED TO CART';
      setTimeout(function(){ btn.classList.remove('added'); btn.innerHTML = '🛒 ADD TO CART'; }, 1800);
    });
  },

  renderItems: function() {
    var container = document.getElementById('cartItems');
    if(!container) return;
    if(this.items.length===0){
      container.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Your cart is empty.<br>Browse our services and add plans to get started.</p><a href="pricing.html" class="btn-primary" style="margin-top:20px;display:inline-block;font-size:14px;padding:10px 28px;" onclick="closeCart()">Browse Plans</a></div>';
    } else {
      container.innerHTML = this.items.map(function(item){
        return '<div class="cart-item"><div class="ci-icon">'+item.icon+'</div><div class="ci-info"><div class="ci-name">'+item.name+'</div><div class="ci-plan">'+item.plan+'</div><div class="ci-price">₹'+item.price.toLocaleString('en-IN')+'<span style="font-size:11px;color:var(--muted-text);font-family:Manrope,sans-serif;font-weight:400;"> '+item.period+'</span></div></div><button class="ci-remove" onclick="DG_CART.remove(\''+item.id+'\')" title="Remove">✕</button></div>';
      }).join('');
    }
    // Update total
    var totalEl = document.getElementById('cartTotal');
    if(totalEl) totalEl.textContent = '₹'+this.total().toLocaleString('en-IN');
    // Sync checkout summary
    this.renderCheckoutSummary();
  },

  renderCheckoutSummary: function() {
    var list = document.getElementById('checkoutItemList');
    if(!list) return;
    list.innerHTML = this.items.map(function(i){
      return '<div class="cil"><span>'+i.name+' ('+i.plan+')</span><span>₹'+i.price.toLocaleString('en-IN')+' '+i.period+'</span></div>';
    }).join('');
    var tot = document.getElementById('checkoutTotal');
    if(tot) tot.textContent = '₹'+this.total().toLocaleString('en-IN');
  }
};

// Open/close cart
window.openCart = function() {
  DG_CART.renderItems();
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartSidebar').classList.add('open');
  document.body.style.overflow='hidden';
};
window.closeCart = function() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartSidebar').classList.remove('open');
  document.body.style.overflow='';
};

// Open/close checkout
window.openCheckout = function() {
  if(DG_CART.items.length===0){ alert('Add at least one service to your cart first.'); return; }
  DG_CART.renderCheckoutSummary();
  closeCart();
  document.getElementById('checkoutOverlay').classList.add('open');
  document.body.style.overflow='hidden';
};
window.closeCheckout = function() {
  document.getElementById('checkoutOverlay').classList.remove('open');
  document.body.style.overflow='';
};

// Submit → WhatsApp
window.submitCheckout = function(e) {
  e.preventDefault();
  var name  = document.getElementById('co-name').value.trim();
  var phone = document.getElementById('co-phone').value.trim();
  var biz   = document.getElementById('co-biz').value.trim();
  var msg   = document.getElementById('co-msg').value.trim();

  if(!name||!phone){ alert('Please fill your name and phone number.'); return; }

  var lines = ['🛒 *NEW ORDER — DIGIYAAN360*', ''];
  lines.push('👤 *Name:* '+name);
  lines.push('📞 *Phone:* '+phone);
  if(biz) lines.push('🏢 *Business:* '+biz);
  lines.push('');
  lines.push('📋 *Selected Services:*');
  DG_CART.items.forEach(function(i){ lines.push('• '+i.name+' ('+i.plan+') — ₹'+i.price.toLocaleString('en-IN')+' '+i.period); });
  lines.push('');
  lines.push('💰 *Total: ₹'+DG_CART.total().toLocaleString('en-IN')+'*');
  if(msg){ lines.push(''); lines.push('💬 *Message:* '+msg); }

  var waText = encodeURIComponent(lines.join('\n'));
  var waURL = 'https://wa.me/917084861080?text='+waText;

  // Show success
  document.getElementById('checkoutForm').style.display='none';
  document.getElementById('checkoutSuccess').style.display='block';

  DG_CART.clear();

  setTimeout(function(){ window.open(waURL,'_blank'); }, 800);
};

// ── INIT ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  DG_CART.load();
  DG_CART.updateUI();

  // Cart overlay click to close
  var ov = document.getElementById('cartOverlay');
  if(ov) ov.addEventListener('click', function(e){ if(e.target===ov) closeCart(); });
  var co = document.getElementById('checkoutOverlay');
  if(co) co.addEventListener('click', function(e){ if(e.target===co) closeCheckout(); });
});