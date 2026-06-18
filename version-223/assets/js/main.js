
(function(){
  var btn=document.querySelector('[data-menu-button]');
  var menu=document.querySelector('[data-mobile-nav]');
  if(btn&&menu){btn.addEventListener('click',function(){menu.classList.toggle('open')})}
  var slides=[].slice.call(document.querySelectorAll('.hero-slide'));
  var dots=[].slice.call(document.querySelectorAll('.hero-dot'));
  if(slides.length){
    var active=0;
    function show(i){active=(i+slides.length)%slides.length;slides.forEach(function(s,k){s.classList.toggle('active',k===active)});dots.forEach(function(d,k){d.classList.toggle('active',k===active)})}
    dots.forEach(function(d,k){d.addEventListener('click',function(){show(k)})});
    setInterval(function(){show(active+1)},5200);
  }
  function applyFilters(scope){
    var cards=[].slice.call(scope.querySelectorAll('.movie-card'));
    var q=(scope.querySelector('[data-local-search]')||{}).value||'';
    var type=(scope.querySelector('[data-type-filter]')||{}).value||'';
    var year=(scope.querySelector('[data-year-filter]')||{}).value||'';
    q=q.trim().toLowerCase();
    var shown=0;
    cards.forEach(function(card){
      var hay=(card.getAttribute('data-search')||'').toLowerCase();
      var ok=(!q||hay.indexOf(q)>-1)&&(!type||card.getAttribute('data-type')===type)&&(!year||card.getAttribute('data-year')===year);
      card.classList.toggle('hidden-card',!ok);
      if(ok)shown++;
    });
    var empty=scope.querySelector('.empty-state');
    if(empty){empty.style.display=shown?'none':'block'}
  }
  document.querySelectorAll('[data-filter-scope]').forEach(function(scope){
    ['input','change'].forEach(function(evt){scope.addEventListener(evt,function(e){if(e.target.matches('[data-local-search],[data-type-filter],[data-year-filter]'))applyFilters(scope)})});
    applyFilters(scope);
  });
  var params=new URLSearchParams(location.search);
  var query=params.get('q');
  var searchInput=document.querySelector('[data-global-query]');
  if(query&&searchInput){searchInput.value=query;var scope=document.querySelector('[data-filter-scope]');if(scope)applyFilters(scope)}
})();
