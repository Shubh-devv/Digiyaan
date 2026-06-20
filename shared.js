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
    document.querySelectorAll('[data-cart-id="'+id+'"]').forEach(function(btn){
      btn.classList.add('added');
      btn.innerHTML = '✓ ADDED TO CART';
      setTimeout(function(){ btn.classList.remove('added'); btn.innerHTML = '🛒 ADD TO CART'; }, 1800);
    });
    this.showCartPopup();
  },

  showCartPopup: function() {
    var popup = document.getElementById('cartSnackbar');
    if(!popup) return;

    // Render items
    var itemsHtml = this.items.map(function(item){
      return '<div class="csp-item">'+
        '<span class="csp-icon">'+(item.icon||'📦')+'</span>'+
        '<div class="csp-info">'+
          '<span class="csp-name">'+item.name+'</span>'+
          '<span class="csp-plan">'+item.plan+(item.qty>1?' ×'+item.qty:'')+'</span>'+
        '</div>'+
        '<span class="csp-price">₹'+(item.price*(item.qty||1)).toLocaleString('en-IN')+'</span>'+
      '</div>';
    }).join('');

    document.getElementById('cspItems').innerHTML = itemsHtml;
    document.getElementById('cspTotal').textContent = '₹'+this.total().toLocaleString('en-IN');
    document.getElementById('cspCount').textContent = this.count() + (this.count()===1?' item':' items');

    // Show
    popup.classList.add('show');

    // Reset auto-hide timer
    if(this._cspTimer) clearTimeout(this._cspTimer);
    this._cspTimer = setTimeout(function(){
      popup.classList.remove('show');
    }, 4500);
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

// ══════════════════════════════════════════
// WHATSAPP POPUP
// ══════════════════════════════════════════
(function(){
  var WA_NUMBER = '917084861080';

  function injectWA() {
    var html = [
      // Floating button
      '<button class="wa-float" id="waFloat" aria-label="Chat on WhatsApp">',
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
          '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.532 5.849L.057 23.716a.5.5 0 00.609.637l5.99-1.573A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.955 9.955 0 01-5.127-1.414l-.367-.218-3.797.996.999-3.698-.239-.38A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>',
        '</svg>',
      '</button>',
      // Overlay
      '<div class="wa-overlay" id="waOverlay"></div>',
      // Modal
      '<div class="wa-modal" id="waModal" role="dialog" aria-modal="true" aria-label="Contact us on WhatsApp">',
        '<div class="wa-modal-head">',
          '<div class="wa-modal-avatar">💬</div>',
          '<div class="wa-modal-info">',
            '<h4>Digiyaan360</h4>',
            '<p>🟢 Typically replies within minutes</p>',
          '</div>',
          '<button class="wa-modal-close" id="waClose" aria-label="Close">✕</button>',
        '</div>',
        '<div class="wa-modal-body">',
          '<div class="wa-bubble">👋 Hi! Tell us your name, number & what you need — we\'ll get back on WhatsApp instantly!</div>',
          '<form id="waForm" autocomplete="off">',
            '<label class="wa-field-label" for="wa-name">Your Name *</label>',
            '<input class="wa-input" id="wa-name" type="text" placeholder="e.g. Rahul Sharma" required />',
            '<label class="wa-field-label" for="wa-phone">WhatsApp Number *</label>',
            '<input class="wa-input" id="wa-phone" type="tel" placeholder="+91 98765 43210" required />',
            '<label class="wa-field-label" for="wa-req">Your Requirement</label>',
            '<textarea class="wa-input wa-textarea" id="wa-req" placeholder="e.g. I need social media management for my clothing brand..."></textarea>',
            '<button type="submit" class="wa-send-btn">',
              '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.532 5.849L.057 23.716a.5.5 0 00.609.637l5.99-1.573A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.955 9.955 0 01-5.127-1.414l-.367-.218-3.797.996.999-3.698-.239-.38A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>',
              'Chat on WhatsApp',
            '</button>',
          '</form>',
        '</div>',
      '</div>'
    ].join('');

    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    while(wrap.firstChild) document.body.appendChild(wrap.firstChild);

    // Events
    var floatBtn = document.getElementById('waFloat');
    var overlay  = document.getElementById('waOverlay');
    var modal    = document.getElementById('waModal');
    var closeBtn = document.getElementById('waClose');
    var form     = document.getElementById('waForm');

    function openWA() { modal.classList.add('open'); overlay.classList.add('open'); }
    function closeWA() { modal.classList.remove('open'); overlay.classList.remove('open'); }

    floatBtn.addEventListener('click', function(){ modal.classList.contains('open') ? closeWA() : openWA(); });
    closeBtn.addEventListener('click', closeWA);
    overlay.addEventListener('click', closeWA);

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name  = document.getElementById('wa-name').value.trim();
      var phone = document.getElementById('wa-phone').value.trim();
      var req   = document.getElementById('wa-req').value.trim();

      if(!name || !phone) { alert('Please enter your name and WhatsApp number.'); return; }

      var lines = [
        '👋 *New Enquiry – DIGIYAAN360*', '',
        '👤 *Name:* ' + name,
        '📞 *Phone:* ' + phone
      ];
      if(req) { lines.push(''); lines.push('📝 *Requirement:*'); lines.push(req); }
      lines.push(''); lines.push('_(Sent via digiyaan360.com)_');

      var waURL = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(waURL, '_blank');
      closeWA();
      form.reset();
    });
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWA);
  } else {
    injectWA();
  }
})();

// ── INIT ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  DG_CART.load();
  DG_CART.updateUI();

  // Inject cart snackbar popup
  var snack = document.createElement('div');
  snack.id = 'cartSnackbar';
  snack.className = 'cart-snackbar';
  snack.innerHTML =
    '<div class="csp-head">'+
      '<span class="csp-title">🛒 Your Cart &nbsp;<span id="cspCount" class="csp-count"></span></span>'+
      '<button class="csp-close" onclick="document.getElementById(\'cartSnackbar\').classList.remove(\'show\')" aria-label="Close">✕</button>'+
    '</div>'+
    '<div class="csp-body" id="cspItems"></div>'+
    '<div class="csp-foot">'+
      '<div class="csp-total-row"><span>Total</span><strong id="cspTotal">₹0</strong></div>'+
      '<button class="csp-view-btn" onclick="document.getElementById(\'cartSnackbar\').classList.remove(\'show\');openCart();">View Cart &amp; Checkout →</button>'+
    '</div>';
  document.body.appendChild(snack);

  // Cart overlay click to close
  var ov = document.getElementById('cartOverlay');
  if(ov) ov.addEventListener('click', function(e){ if(e.target===ov) closeCart(); });
  var co = document.getElementById('checkoutOverlay');
  if(co) co.addEventListener('click', function(e){ if(e.target===co) closeCheckout(); });
});