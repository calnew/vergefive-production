(function(){
  var header=document.querySelector('.site-header');
  var toggle=document.querySelector('[data-menu-toggle]');
  if(toggle&&header){toggle.addEventListener('click',function(){header.classList.toggle('open')})}

  function removeLegacyLessonNav(){
    document.querySelectorAll('.lesson-nav-bottom').forEach(function(nav){
      nav.remove();
    });
  }
  removeLegacyLessonNav();

  function restoreTopLessonNav(){
    if(document.querySelector('.lesson-nav-strip'))return;
    var target=document.querySelector('.member-main .module-section-overview');
    if(!target)return;
    var lessons=[
      {path:'/nap-overview/',module:'Module 1',section:'Section 1',title:'NAP consistency overview'},
      {path:'/phones-and-411/',module:'Module 1',section:'Section 2',title:'Business phone number and 411 listing'},
      {path:'/business-address/',module:'Module 1',section:'Section 3',title:'Business address'},
      {path:'/website-domain-email/',module:'Module 1',section:'Section 4',title:'Website and domain email'},
      {path:'/llc-vs-corporation/',module:'Module 2',section:'Section 1',title:'LLC vs Corporation'},
      {path:'/contact-list/',module:'Module 2',section:'Section 2',title:'Secretary of State contact list'},
      {path:'/ein/',module:'Module 2',section:'Section 3',title:'EIN from IRS'},
      {path:'/bank-account/',module:'Module 3',section:'Section 1',title:'Business bank account'},
      {path:'/bank-rating/',module:'Module 3',section:'Section 2',title:'Business bank rating'},
      {path:'/business-plan/',module:'Module 4',section:'Section 1',title:'Business plan'},
      {path:'/business-plan-report/',module:'Module 4',section:'Section 2',title:'Progress report'},
      {path:'/equifax-business/',module:'Module 5',section:'Section 1',title:'Business credit bureaus'},
      {path:'/comparable-credit/',module:'Module 5',section:'Section 2',title:'Comparable credit'},
      {path:'/business-credit-criteria/',module:'Module 5',section:'Section 3',title:'12-point business credit criteria'},
      {path:'/about-net-30/',module:'Module 6',section:'Section 1',title:'Starter vendor credit readiness'},
      {path:'/revolving-business-credit-cards/',module:'Module 6',section:'Section 2',title:'Revolving business credit cards'},
      {path:'/nav-ecredable/',module:'Module 6',section:'Section 3',title:'NAV.com and eCredable fast track'},
      {path:'/cd-business-loans/',module:'Module 7',section:'Section 1',title:'CD-secured business loans'}
    ];
    var index=lessons.findIndex(function(item){return location.pathname===item.path});
    if(index<0)return;
    var current=lessons[index];
    var previous=index>0?lessons[index-1]:{path:'/homeefe757a6/',title:'Dashboard',module:'Dashboard'};
    var next=index<lessons.length-1?lessons[index+1]:{path:'/final-readiness-summary/',title:'Final readiness summary',module:'Final summary'};
    var previousLabel=index>0&&previous.module!==current.module?'Previous module':(index>0?'Previous section':'Back to dashboard');
    var nextLabel=index<lessons.length-1&&next.module!==current.module?'Next module':(index<lessons.length-1?'Next section':'Final summary');
    var pct=Math.round(((index+1)/lessons.length)*100);
    var nav=document.createElement('nav');
    nav.className='lesson-nav-strip';
    nav.setAttribute('aria-label','Lesson navigation');
    nav.innerHTML="<a class='btn dark lesson-nav-btn' href='"+previous.path+"'>"+escapeHtml(previousLabel)+"</a><div class='lesson-progress-meter'><div class='lesson-progress-copy'><strong>"+escapeHtml(current.module+' - '+current.section)+"</strong><span class='lesson-progress-context'>"+escapeHtml(current.title)+"</span></div><div class='readiness-bar'><span style='width:"+pct+"%'></span></div></div><a class='btn secondary lesson-nav-btn' href='"+next.path+"'>"+escapeHtml(nextLabel)+"</a>";
    target.parentNode.insertBefore(nav,target);
  }
  restoreTopLessonNav();

  function ensureLegalFooter(){
    if(location.pathname==='/admin/')return;
    var footer=document.querySelector('.footer');
    if(!footer){
      footer=document.createElement('footer');
      footer.className='footer';
      footer.innerHTML='<div class="footer-inner"><div><a class="brand" href="/"><span class="brand-logo-shell mark"><img src="/Resources/images/verge5-logo-mark.png" alt="Verge Five logo"></span><span>Verge Five</span></a><p class="legal">From vision to venture.</p></div><div class="legal"><a href="/privacy-policy/">Privacy Policy</a> &nbsp; <a href="/terms/">Terms &amp; Conditions</a> &nbsp; <a href="/contact/">Contact</a><br>Copyright 2026 Verge Five LLC. Henderson, NC 27536</div></div>';
      document.body.appendChild(footer);
      return;
    }
    var legal=footer.querySelector('.footer-inner > .legal')||footer.querySelector('.footer-inner .legal:last-child');
    if(legal){
      legal.innerHTML='<a href="/privacy-policy/">Privacy Policy</a> &nbsp; <a href="/terms/">Terms &amp; Conditions</a> &nbsp; <a href="/contact/">Contact</a><br>Copyright 2026 Verge Five LLC. Henderson, NC 27536';
    }
  }
  ensureLegalFooter();

  function addAffiliateFooterLink(){
    if(location.pathname==='/affiliate-signup/'||document.querySelector('[data-affiliate-footer-link]'))return;
    var html="<a href='/affiliate-signup/' data-affiliate-footer-link>Become an affiliate</a>";
    var footers=document.querySelectorAll('.footer .legal');
    if(footers.length){
      var target=footers[footers.length-1];
      target.insertAdjacentHTML('afterbegin',html+" &nbsp; ");
      return;
    }
    if(document.body){
      var bar=document.createElement('div');
      bar.className='affiliate-footer-link';
      bar.innerHTML=html;
      document.body.appendChild(bar);
    }
  }
  addAffiliateFooterLink();
  function refineBrandWordmark(){
    document.querySelectorAll('.brand').forEach(function(brand){
      var word=[].slice.call(brand.children).find(function(node){
        return node.tagName==='SPAN'&&!node.classList.contains('brand-logo-shell')&&!node.classList.contains('brand-mark');
      });
      if(word)word.textContent='Verge Five';
    });
  }
  refineBrandWordmark();

  function addVisibilityScanNavLink(){
    var href='/#home-visibility-scan';
    document.querySelectorAll('.nav-links').forEach(function(nav){
      if(nav.querySelector('[data-visibility-scan-link]'))return;
      var blog=nav.querySelector("a[href='/blog/']");
      var link=document.createElement('a');
      link.href=href;
      link.setAttribute('data-visibility-scan-link','');
      link.textContent='Visibility scan';
      if(blog)nav.insertBefore(link,blog);
      else nav.appendChild(link);
    });
    document.querySelectorAll('.mobile-panel').forEach(function(panel){
      if(panel.querySelector('[data-visibility-scan-link]'))return;
      var blog=panel.querySelector("a[href='/blog/']");
      var link=document.createElement('a');
      link.href=href;
      link.setAttribute('data-visibility-scan-link','');
      link.textContent='Visibility scan';
      if(blog)panel.insertBefore(link,blog);
      else panel.appendChild(link);
    });
  }
  addVisibilityScanNavLink();
  function addPricingNavLink(){
    var href='/#pricing';
    var hasPublicLogin=!!document.querySelector(".nav-actions a[href='/login/'], .mobile-panel a[href='/login/']");
    if(!hasPublicLogin)return;
    document.querySelectorAll('.nav-links').forEach(function(nav){
      if(nav.querySelector('[data-pricing-link]'))return;
      var visibility=nav.querySelector('[data-visibility-scan-link]');
      var blog=nav.querySelector("a[href='/blog/']");
      var link=document.createElement('a');
      link.href=href;
      link.setAttribute('data-pricing-link','');
      link.textContent='Price';
      if(visibility)nav.insertBefore(link,visibility);
      else if(blog)nav.insertBefore(link,blog);
      else nav.appendChild(link);
    });
    document.querySelectorAll('.mobile-panel').forEach(function(panel){
      if(panel.querySelector('[data-pricing-link]'))return;
      var visibility=panel.querySelector('[data-visibility-scan-link]');
      var blog=panel.querySelector("a[href='/blog/']");
      var link=document.createElement('a');
      link.href=href;
      link.setAttribute('data-pricing-link','');
      link.textContent='Price';
      if(visibility)panel.insertBefore(link,visibility);
      else if(blog)panel.insertBefore(link,blog);
      else panel.appendChild(link);
    });
  }
  addPricingNavLink();
  function addAnswerHubNavLink(){
    var href='/business-credit-answers/';
    var hasPublicLogin=!!document.querySelector(".nav-actions a[href='/login/'], .mobile-panel a[href='/login/']");
    if(!hasPublicLogin)return;
    document.querySelectorAll('.nav-links').forEach(function(nav){
      if(nav.querySelector("a[href='/business-credit-answers/']"))return;
      var blog=nav.querySelector("a[href='/blog/']");
      var link=document.createElement('a');
      link.href=href;
      link.textContent='Answers';
      if(blog)nav.insertBefore(link,blog);
      else nav.appendChild(link);
    });
    document.querySelectorAll('.mobile-panel').forEach(function(panel){
      if(panel.querySelector("a[href='/business-credit-answers/']"))return;
      var blog=panel.querySelector("a[href='/blog/']");
      var link=document.createElement('a');
      link.href=href;
      link.textContent='Answers';
      if(blog)panel.insertBefore(link,blog);
      else panel.appendChild(link);
    });
  }
  addAnswerHubNavLink();
  function addLoggedOutTestDriveLinks(){
    var signup='/signup/?trial=start';
    var hasPublicLogin=!!document.querySelector(".nav-actions a[href='/login/'], .mobile-panel a[href='/login/']");
    if(!hasPublicLogin)return;
    document.querySelectorAll('.nav-links').forEach(function(nav){
      if(nav.querySelector('[data-test-drive-link]'))return;
      var visibility=nav.querySelector('[data-visibility-scan-link]');
      var link=document.createElement('a');
      link.href=signup;
      link.setAttribute('data-test-drive-link','');
      link.textContent='Test Drive';
      if(visibility&&visibility.nextSibling)nav.insertBefore(link,visibility.nextSibling);
      else nav.appendChild(link);
    });
    document.querySelectorAll('.nav-actions').forEach(function(actions){
      if(actions.querySelector('[data-test-drive-action]'))return;
      var getAccess=actions.querySelector("a[href='/membership/']");
      var link=document.createElement('a');
      link.href=signup;
      link.className='btn secondary test-drive-nav-cta';
      link.setAttribute('data-test-drive-action','');
      link.textContent='Test Drive';
      if(getAccess)actions.insertBefore(link,getAccess);
      else actions.appendChild(link);
    });
    document.querySelectorAll('.mobile-panel').forEach(function(panel){
      if(panel.querySelector('[data-test-drive-link]'))return;
      var getAccess=panel.querySelector("a[href='/membership/']");
      var link=document.createElement('a');
      link.href=signup;
      link.setAttribute('data-test-drive-link','');
      link.textContent='Take a Test Drive';
      if(getAccess)panel.insertBefore(link,getAccess);
      else panel.appendChild(link);
    });
  }
  addLoggedOutTestDriveLinks();
  function normalizePublicNavigation(){
    var hasPublicLogin=!!document.querySelector(".nav-actions a[href='/login/'], .mobile-panel a[href='/login/']");
    if(!hasPublicLogin)return;
    function makeLink(href,text,attr){
      var link=document.createElement('a');
      link.href=href;
      link.textContent=text;
      if(attr)link.setAttribute(attr,'');
      return link;
    }
    function findOrCreate(container,selector,href,text,attr){
      var link=container.querySelector(selector);
      if(!link)link=makeLink(href,text,attr);
      link.href=href;
      link.textContent=text;
      if(attr)link.setAttribute(attr,'');
      return link;
    }
    function removeDuplicateHref(container,href){
      var links=[].slice.call(container.querySelectorAll("a[href='"+href+"']"));
      while(links.length>1){links.shift().remove()}
    }
    document.querySelectorAll('.nav-links').forEach(function(nav){
      nav.querySelectorAll('[data-visibility-scan-link],[data-test-drive-link]').forEach(function(link){link.remove()});
      var home=findOrCreate(nav,"a[href='/']",'/', 'Home');
      var inside=findOrCreate(nav,"a[href='/whats-inside/']",'/whats-inside/', "What's Inside");
      var price=findOrCreate(nav,"[data-pricing-link],a[href='/#pricing']", '/#pricing', 'Price','data-pricing-link');
      var answers=findOrCreate(nav,"a[href='/business-credit-answers/']",'/business-credit-answers/', 'Answers');
      var blog=findOrCreate(nav,"a[href='/blog/']",'/blog/', 'Blog');
      var contact=findOrCreate(nav,"a[href='/contact/']",'/contact/', 'Contact');
      var dropdown=nav.querySelector('[data-answer-menu]')||document.createElement('span');
      dropdown.className='nav-dropdown';
      dropdown.setAttribute('data-answer-menu','');
      var menu=dropdown.querySelector('.nav-dropdown-menu')||document.createElement('span');
      menu.className='nav-dropdown-menu';
      menu.appendChild(blog);
      dropdown.appendChild(answers);
      dropdown.appendChild(menu);
      [home,inside,price,dropdown,contact].forEach(function(item){nav.appendChild(item)});
      ['/','#pricing','/#pricing','/whats-inside/','/business-credit-answers/','/blog/','/contact/'].forEach(function(href){removeDuplicateHref(nav,href)});
      nav.querySelectorAll("a[href='/membership/']").forEach(function(link){if(link.textContent.trim()==='Price')link.remove()});
    });
    document.querySelectorAll('.nav-actions').forEach(function(actions){
      var getAccess=actions.querySelector("a[href='/membership/']");
      var testLinks=[].slice.call(actions.querySelectorAll("a[href='/signup/?trial=start'],a[href*='trial=start']"));
      var keep=testLinks.shift();
      testLinks.forEach(function(link){link.remove()});
      if(!keep){
        keep=makeLink('/signup/?trial=start','Test Drive','data-test-drive-action');
      }
      keep.href='/signup/?trial=start';
      keep.textContent='Test Drive';
      keep.className='btn secondary test-drive-nav-cta';
      keep.setAttribute('data-test-drive-action','');
      if(getAccess)actions.insertBefore(keep,getAccess);
      else actions.appendChild(keep);
    });
    document.querySelectorAll('.mobile-panel').forEach(function(panel){
      panel.querySelectorAll('[data-visibility-scan-link],[data-test-drive-link]').forEach(function(link){link.remove()});
      var login=panel.querySelector("a[href='/login/']")||makeLink('/login/','Login');
      var getAccess=panel.querySelector("a[href='/membership/']")||makeLink('/membership/','Get access');
      var test=panel.querySelector("a[href='/signup/?trial=start'],a[href*='trial=start']")||makeLink('/signup/?trial=start','Take a Test Drive','data-test-drive-link');
      test.href='/signup/?trial=start';
      test.textContent='Take a Test Drive';
      test.setAttribute('data-test-drive-link','');
      [
        findOrCreate(panel,"a[href='/']",'/', 'Home'),
        findOrCreate(panel,"a[href='/whats-inside/']",'/whats-inside/', "What's Inside"),
        findOrCreate(panel,"[data-pricing-link],a[href='/#pricing']", '/#pricing', 'Price','data-pricing-link'),
        findOrCreate(panel,"a[href='/business-credit-answers/']",'/business-credit-answers/', 'Answers'),
        findOrCreate(panel,"a[href='/blog/']",'/blog/', 'Blog'),
        findOrCreate(panel,"a[href='/contact/']",'/contact/', 'Contact'),
        login,
        test,
        getAccess
      ].forEach(function(link){panel.appendChild(link)});
      ['/','#pricing','/#pricing','/whats-inside/','/business-credit-answers/','/blog/','/contact/','/login/','/membership/','/signup/?trial=start'].forEach(function(href){removeDuplicateHref(panel,href)});
    });
  }
  normalizePublicNavigation();

  function normalizeMemberNavigation(){
    if(location.pathname==='/admin/')return;
    var hasMemberHeader=!!document.querySelector(".nav-actions a[href='/account/'], .mobile-panel a[href='/account/']");
    if(!hasMemberHeader)return;
    function makeLink(href,text){
      var link=document.createElement('a');
      link.href=href;
      link.textContent=text;
      return link;
    }
    function resetLinks(container,items){
      if(!container)return;
      container.innerHTML='';
      items.forEach(function(item){container.appendChild(makeLink(item.href,item.text))});
    }
    var memberLinks=[
      {href:'/homeefe757a6/',text:'Dashboard'},
      {href:'/start-here/',text:'Start Here'},
      {href:'/homeefe757a6/#modules',text:'Modules'},
      {href:'/about-net-30/',text:'Vendors'},
      {href:'/business-plan-report/',text:'Report'},
      {href:'/business-visibility-audit/',text:'Visibility scan'}
    ];
    var mobileLinks=memberLinks.concat([
      {href:'/account/',text:'Account'},
      {href:'/homeefe757a6/',text:'Continue Buildout'}
    ]);
    document.querySelectorAll('.nav-links').forEach(function(nav){resetLinks(nav,memberLinks)});
    document.querySelectorAll('.nav-actions').forEach(function(actions){
      actions.innerHTML='';
      var account=makeLink('/account/','Account');
      account.className='btn ghost';
      var buildout=makeLink('/homeefe757a6/','Continue Buildout');
      buildout.className='btn';
      actions.appendChild(account);
      actions.appendChild(buildout);
    });
    document.querySelectorAll('.mobile-panel').forEach(function(panel){resetLinks(panel,mobileLinks)});
  }
  normalizeMemberNavigation();

  function upgradeHomepageConversion(){
    if(location.pathname!=='/')return;
    if(document.body&&document.body.classList.contains('homepage-system-demo'))return;
    var hero=document.querySelector('.hero');
    if(hero)hero.classList.add('home-combined-hero');
    var heroTitle=document.querySelector('.hero h1');
    var heroCopy=document.querySelector('.hero h1+p');
    var heroText=document.querySelector('.hero .hero-inner > div:first-child');
    if(heroText&&!heroText.querySelector('.home-hero-pill'))heroText.insertAdjacentHTML('afterbegin',"<div class='home-hero-pill'>APPROVAL SYSTEM CHECK</div>");
    if(heroTitle)heroTitle.textContent='See what approval systems check before you apply.';
    if(heroCopy)heroCopy.textContent='Run the free visibility scan, then use Verge Five to fix the phone, address, website, legal, banking, and readiness signals automated lenders and vendors look for before they say yes.';
    var heroButtons=document.querySelectorAll('.hero-actions .btn');
    if(heroButtons[0]){heroButtons[0].textContent='Run the free scan';heroButtons[0].setAttribute('href','#home-visibility-scan')}
    if(heroButtons[1]){heroButtons[1].textContent='Take the free test drive';heroButtons[1].setAttribute('href','/signup/?trial=start')}
    var heroTrust=document.querySelector('.hero .trust-row');
    if(heroTrust)heroTrust.innerHTML="<span><i class='dot'></i>Free visibility scan first</span><span><i class='dot'></i>7-module buildout</span><span><i class='dot'></i>Apply only when ready</span>";
    if(heroText&&!heroText.querySelector('.home-hero-explainers')){
      heroText.insertAdjacentHTML('beforeend',"<div class='home-hero-explainers'><article class='home-hero-note light'><p class='kicker'>Step 1</p><h2>Run the visibility scan.</h2><p>See whether the public-facing business signals are strong enough before applications start.</p></article><article class='home-hero-note dark'><p class='kicker'>Step 2</p><h2>Fix the profile in order.</h2><p>The Hidden Gatekeepers explains the problem. Verge Five turns that approval framework into a guided buildout.</p></article></div>");
    }
    var heroVisual=document.querySelector('.hero-visual');
    if(heroVisual){
      heroVisual.classList.remove('hero-scan-wrap');
      heroVisual.innerHTML="<div class='home-hero-dashboard-stack'><img class='hero-photo' src='/Resources/images/business-credit-advisor.png' alt='Business owner reviewing credit readiness with an advisor'><div class='dashboard-preview floating'><div class='preview-top'><div><div class='preview-title'>Readiness dashboard</div><div class='legal'>Before your first application</div></div><div class='score-ring'><span>58%</span></div></div><div class='preview-body'><div class='progress-step'><div class='step-num done'>1</div><div class='step-copy'><strong>Business Identity</strong><span>Phone, address, domain, 411</span></div><span class='status ready'>Ready</span></div><div class='progress-step'><div class='step-num done'>2</div><div class='step-copy'><strong>Legal Setup</strong><span>Entity, EIN, licenses</span></div><span class='status ready'>Ready</span></div><div class='progress-step'><div class='step-num'>3</div><div class='step-copy'><strong>Banking Foundation</strong><span>Low 5 rating, 90 days</span></div><span class='status'>In progress</span></div><div class='progress-step'><div class='step-num'>4</div><div class='step-copy'><strong>Approval Readiness</strong><span>Locked until criteria pass</span></div><span class='status'>Locked</span></div><div class='progress-step'><div class='step-num'>5</div><div class='step-copy'><strong>Vendors and Credit</strong><span>Apply in the correct order</span></div><span class='status'>Locked</span></div></div></div></div>";
    }
    if(hero&&!document.querySelector('.home-scan-video-section')){
      var scanVideo=document.createElement('section');
      scanVideo.className='home-scan-video-section home-visibility-section';
      scanVideo.innerHTML="<div class='section home-scan-video-grid'><div class='home-scan-video-copy'><p class='kicker'>Free business visibility scan</p><h2>Run the scan first. Then decide what to fix.</h2><p>The scan gives the owner a starting baseline: business name, state, phone, address, website, and public visibility. If the foundation is weak, Verge Five shows the order to clean it up before vendors, cards, or funding are touched.</p><div class='hero-actions'><a class='btn' href='#home-visibility-scan'>Run the free scan</a><a class='btn secondary' href='/signup/?trial=start'>Take the free test drive</a><a class='btn secondary' href='/whats-inside/'>See what unlocks</a></div><div class='trust-row'><span><i class='dot'></i>Phone and NAP visibility</span><span><i class='dot'></i>Website and address signals</span><span><i class='dot'></i>Readiness before applications</span></div></div><aside class='hero-visual hero-scan-wrap'><form id='home-visibility-scan' class='public-scan-form hero-scan-card' data-public-scan novalidate><div class='scan-card-head'><p class='kicker'>Step 1: visibility baseline</p><h2>Check how the business looks before you build.</h2><p>Get a 1-10 public visibility score after entering the core identifiers lenders and vendors expect to see.</p></div><div class='scan-mode-row'><label><input type='radio' name='scanMode' value='before' checked> Before buildout</label><label><input type='radio' name='scanMode' value='after'> After buildout</label></div><label data-required-field='businessName'>Business name<input class='input' name='businessName' required placeholder='Exact or planned legal business name'></label><label data-required-field='state'>State<input class='input' name='state' required placeholder='State where the business is filed or will operate'></label><div class='scan-two'><label data-required-field='website'>Website<input class='input' name='website' required placeholder='Business website URL'></label><label data-required-field='phone'>Business phone<input class='input' name='phone' required placeholder='Business phone number, not personal mobile'></label></div><label data-required-field='address'>Business address<input class='input' name='address' required placeholder='Commercial-style business address'></label><button class='btn' type='submit'>Get my visibility score</button><div class='scan-helper-note'><strong>Missing a business phone, website, or address?</strong><span>That is the point of the buildout. The scan shows what needs to be created or corrected first.</span></div><div class='scan-result' data-scan-result><strong>Enter the business name to see a score.</strong><span>State, business phone, website, and address are required. Missing one is a signal to build the profile before applying.</span></div></form></aside></div>";
      var auditSection=document.querySelector('.home-ai-audit');
      if(auditSection)auditSection.insertAdjacentElement('afterend',scanVideo);
      else hero.insertAdjacentElement('afterend',scanVideo);
    }
    var scanSection=document.querySelector('.home-scan-video-section');
    if(hero&&!document.querySelector('.home-ai-audit')){
      var auditTop=document.createElement('section');
      auditTop.className='home-ai-audit';
      auditTop.innerHTML="<div class='section'><div class='ai-audit-card'><div><p class='kicker'>Start with the outside view</p><h2>Before you apply, see what the approval system can verify.</h2><p>Most owners jump straight to vendors, cards, or funding. Verge Five starts one step earlier: can the business be found, matched, and trusted from the outside?</p><div class='mini-list'><span>Business name visibility</span><span>Phone, address, website, and record gaps</span><span>Before-and-after buildout comparison</span></div></div><a class='btn dark' href='#home-visibility-scan'>Run the free scan</a></div></div>";
      hero.insertAdjacentElement('afterend',auditTop);
    }
    if(hero&&!document.querySelector('.burned-buyer-section')){
      var pain=document.createElement('section');
      pain.className='burned-buyer-section';
      pain.innerHTML="<div class='section'><div class='burned-buyer-head'><h2>The hidden gatekeepers are not emotional. They read signals.</h2><p>The book explains why approvals now happen through data matching, automation, and risk checks. Verge Five turns that into a practical path: clean the profile before the application ever reaches a decision system.</p></div><div class='pain-grid'><article><strong>Wrong phone signal</strong><span>Mobile numbers, weak VoIP providers, missing Business 411 listings, or numbers that do not look commercial can create flags.</span></article><article><strong>Address problems</strong><span>Mailbox-only addresses, virtual addresses that cannot be worked from, or inconsistent records can slow down banking and vendor approvals.</span></article><article><strong>Website and email quality</strong><span>A basic website and domain email help establish legitimacy. Free emails and unfinished websites can make the company look temporary.</span></article><article><strong>Applications too early</strong><span>Some vendors, cards, and funding paths should wait until the business has the right age, bank history, and readiness signals.</span></article></div></div>";
      var aiTop=document.querySelector('.home-ai-audit');
      scanSection=document.querySelector('.home-scan-video-section');
      if(scanSection)scanSection.insertAdjacentElement('afterend',pain);
      else if(aiTop)aiTop.insertAdjacentElement('afterend',pain);
      else hero.insertAdjacentElement('afterend',pain);
    }
    if(hero&&!document.querySelector('.setup-path-section')){
      var setupPaths=document.createElement('section');
      setupPaths.className='section setup-path-section';
      setupPaths.innerHTML="<div class='setup-path-head'><p class='kicker'>Business-safe setup paths</p><h2>The setup choices matter before the credit applications do.</h2><p class='lead'>Verge Five does not just tell owners to get a phone, address, website, bank account, or vendor account. It helps them understand which setup paths are safer, what shortcuts can weaken the profile, and what should verify before they move forward.</p></div><div class='setup-path-grid'><article><span>01</span><strong>Choose the right foundation vendors</strong><p>Use business-safe setup paths for phone, 411, address, website, domain email, legal records, and banking.</p></article><article><span>02</span><strong>Avoid weak signals</strong><p>See why personal-looking phone numbers, mailbox-style addresses, unfinished websites, and mismatched records can create problems later.</p></article><article><span>03</span><strong>Save proof</strong><p>Keep confirmations, screenshots, filings, statements, listings, and records tied to each buildout step.</p></article><article><span>04</span><strong>Verify before applying</strong><p>Return to the scan, checklist, and readiness gates before moving into vendor credit, cards, or funding.</p></article></div><div class='setup-path-cta'><a class='btn dark' href='/whats-inside/'>See how it works inside</a><a class='btn secondary' href='/signup/?trial=start'>Take the free test drive</a></div>";
      var painSection=document.querySelector('.burned-buyer-section');
      if(painSection)painSection.insertAdjacentElement('afterend',setupPaths);
      else if(scanSection)scanSection.insertAdjacentElement('afterend',setupPaths);
      else hero.insertAdjacentElement('afterend',setupPaths);
    }
    var pricingAnchor=document.querySelector('#pricing');
    if(pricingAnchor&&!document.querySelector('.home-start-path')){
      var startPath=document.createElement('section');
      startPath.className='section home-start-path';
      startPath.innerHTML="<div class='home-start-head'><p class='kicker'>The buying path</p><h2>Check the gap for free. Upgrade when you want the full buildout.</h2><p class='lead'>The scan gives the first signal. The test drive shows the first locked path. Membership unlocks the full 7-module system, reports, matchers, and readiness tools.</p></div><div class='home-start-grid'><article><span>01</span><strong>Run the scan</strong><p>Get the baseline visibility score before you spend money or submit applications.</p></article><article><span>02</span><strong>Take the test drive</strong><p>Experience the first identity path and see why the platform keeps the order tight.</p></article><article><span>03</span><strong>Fix the foundation</strong><p>Work through phone, address, website, legal, banking, and readiness signals.</p></article><article><span>04</span><strong>Apply in order</strong><p>Use matchers, reports, and readiness gates before moving into vendors, cards, or funding.</p></article></div><div class='home-start-cta'><a class='btn dark' href='/signup/?trial=start'>Take the free test drive</a><a class='btn secondary' href='/whats-inside/'>Preview what is inside</a></div>";
      pricingAnchor.parentNode.insertBefore(startPath,pricingAnchor);
    }
    if(pricingAnchor&&!document.querySelector('.test-drive-explain-section')){
      var testDrive=document.createElement('section');
      testDrive.className='section test-drive-explain-section';
      testDrive.innerHTML="<div class='test-drive-explain-card'><div class='test-drive-copy'><p class='kicker'>Free platform test drive</p><h2>Preview the buildout without unlocking the whole system.</h2><p class='lead'>The test drive is a controlled preview of Verge Five. It lets owners run the Business Visibility Scan, save the first profile baseline, complete the first identity setup preview, and see why the rest of the platform stays locked until membership.</p><p>It is not a discount and it is not meant to give away every vendor, card, funding path, report, or matcher. It shows how the decision system works before someone joins.</p><div class='intro-offer-inline'><strong>Ready to unlock after the preview?</strong><span>Start the full monthly platform for $7 for the first month, then $49/month after that.</span></div><div class='proof-actions'><a class='btn dark' href='/signup/?trial=start'>Take the free test drive</a><a class='btn secondary' href='/membership/?plan=monthly'>Start full access for $7</a></div></div><div class='test-drive-steps'><article><span>01</span><strong>Run the scan</strong><small>See the starting visibility baseline.</small></article><article><span>02</span><strong>Start identity setup</strong><small>Preview the first guided buildout step.</small></article><article><span>03</span><strong>See what is locked</strong><small>Reports, matchers, vendors, cards, and funding stay protected.</small></article><article><span>04</span><strong>Decide with context</strong><small>Upgrade only after the system makes sense.</small></article></div></div>";
      pricingAnchor.parentNode.insertBefore(testDrive,pricingAnchor);
    }    var promo=document.querySelector('.homepage-promo-video');
    if(promo)promo.remove();
    var preview=document.querySelector('.platform-preview');
    if(preview)preview.remove();
    [].slice.call(document.querySelectorAll('section')).forEach(function(section){
      var h2=section.querySelector('h2');
      if(h2&&h2.textContent.trim()==='Most denials happen before a human reviews the application.')section.remove();
    });
    var pricing=document.querySelector('#pricing');
    if(pricing&&!pricing.querySelector('[data-access-updated]')){
      pricing.setAttribute('data-access-updated','');
      var h2=pricing.querySelector('h2');
      var lead=pricing.querySelector('.lead');
      if(h2)h2.textContent='Access the full decision system.';
      if(lead)lead.textContent='The scan and test drive show the gap. Membership unlocks the guided buildout, readiness tools, vendor and credit card matching, business visibility audits, reports, and support resources.';
      var cards=pricing.querySelectorAll('.pricing .card');
      if(cards[0]){cards[0].classList.add('membership-plan','intro-monthly-plan');cards[0].innerHTML="<span class='plan-eyebrow'>Intro monthly offer</span><h3>Monthly access</h3><div class='price'>$7<small>first month</small></div><p><strong>Then $49/month.</strong> Use the 7-module buildout, readiness checklist, vendor matcher, credit card matcher, funding readiness, and member reports.</p><ul><li>Unlock the full platform after the free preview</li><li>Save profile progress and reports</li><li>Use member-only readiness tools</li></ul><a class='btn secondary' href='/membership/?plan=monthly'>Start for $7</a>";}
      if(cards[1]){cards[1].classList.add('membership-plan','featured-plan');cards[1].innerHTML="<span class='plan-eyebrow'>Full-year buildout</span><h3>Annual access</h3><div class='price'>$597<small>/yr</small></div><p>Full-year buildout access for owners who want time to clean records, build banking history, and move through vendors, cards, and funding in order.</p><ul><li>Full-year access to the platform</li><li>Better fit for 90-day readiness timing</li><li>Same tools with more room to execute</li></ul><a class='btn' href='/membership/?plan=annual'>Choose annual</a>";}
    }
    if(hero&&!document.querySelector('.mobile-home-conversion')){
      document.body.classList.add('home-mobile-optimized');
      var mobileFlow=document.createElement('section');
      mobileFlow.className='mobile-home-conversion';
      mobileFlow.innerHTML="<div class='mobile-home-card mobile-home-priority'><p class='kicker'>Start here</p><h2>Run the scan before you apply.</h2><p>Verge Five checks the public-facing business signals automated approval systems look at first: name, phone, address, website, records, banking, timing, and consistency.</p><div class='mobile-home-actions'><a class='btn' href='#home-visibility-scan'>Run free scan</a><a class='btn secondary' href='/signup/?trial=start'>Test drive</a></div></div><div class='mobile-home-steps' aria-label='Mobile path'><article><span>1</span><strong>Get the baseline</strong><small>See what the outside world can verify.</small></article><article><span>2</span><strong>Fix the gaps</strong><small>Build phone, address, website, legal, banking, and readiness in order.</small></article><article><span>3</span><strong>Apply when ready</strong><small>Use matchers and reports before vendors, cards, or funding.</small></article></div><div class='mobile-home-card mobile-home-why'><h2>Why this matters now</h2><p>If the business identifiers do not match, the application can look weak before a person reviews it. The platform is built from The Hidden Gatekeepers framework: clean the signals first, then move.</p></div><div class='mobile-home-accordions'><details open><summary>What do I get?</summary><p>A guided 7-module buildout, business visibility scans, readiness checks, reports, vendor/card matching, and protected application order.</p></details><details><summary>What is the test drive?</summary><p>A free preview where you create an account, run the starting scan, and experience the first identity path before unlocking the full platform.</p></details><details><summary>What does membership cost?</summary><p>Monthly starts at $7 for the first month, then $49/month. Annual access is $597/year for the full buildout.</p></details></div><div class='mobile-home-final'><a class='btn dark' href='#pricing'>See pricing</a><a class='btn secondary' href='/whats-inside/'>What's inside</a></div>";
      hero.insertAdjacentElement('afterend',mobileFlow);
    }
    if(hero&&!document.querySelector('.mobile-home-sticky')){
      var mobileBar=document.createElement('nav');
      mobileBar.className='mobile-home-sticky';
      mobileBar.setAttribute('aria-label','Mobile homepage actions');
      mobileBar.innerHTML="<a class='btn' href='#home-visibility-scan'>Run Scan</a><a class='btn secondary' href='/signup/?trial=start'>Test Drive</a>";
      document.body.appendChild(mobileBar);
    }
  }
  upgradeHomepageConversion();

  function applyHiddenGatekeepersFraming(){
    var path=location.pathname;
    function setText(selector,text){
      var el=document.querySelector(selector);
      if(el)el.textContent=text;
    }
    if(path==='/whats-inside/'){
      var heroSection=document.querySelector('.whats-inside-hero .section');
      if(heroSection&&!heroSection.querySelector('.whats-inside-book-cover')){
        heroSection.classList.add('whats-inside-book-hero-grid');
        var heroContent=document.createElement('div');
        heroContent.className='whats-inside-book-copy';
        while(heroSection.firstChild)heroContent.appendChild(heroSection.firstChild);
        var cover=document.createElement('figure');
        cover.className='whats-inside-book-cover';
        cover.innerHTML="<img src='/Resources/images/Hidden.png' alt='The Hidden Gatekeepers of Business Approval book cover'><figcaption>The framework behind Verge Five.</figcaption><a class='btn secondary whats-inside-amazon-link' href='https://a.co/d/02zSATaH' target='_blank' rel='noopener'>Get the book on Amazon</a>";
        heroSection.appendChild(heroContent);
        heroSection.appendChild(cover);
      }
      setText('.whats-inside-hero .kicker','The Hidden Gatekeepers framework');
      setText('.whats-inside-hero .page-title','The book explains the approval problem. Verge Five shows the buildout.');
      setText('.whats-inside-hero .page-sub','The Hidden Gatekeepers of Business Approval explains how automated systems read business identity, consistency, timing, and risk signals before a human ever reviews the file. This page shows how Verge Five turns that framework into a platform: scan the outside signals, fix the foundation in order, then move toward vendors, credit cards, and funding when the business is ready.');
      var insideActions=document.querySelectorAll('.whats-inside-hero .hero-actions .btn');
      if(insideActions[0]){insideActions[0].textContent='Run the free scan';insideActions[0].setAttribute('href','/#home-visibility-scan')}
      if(insideActions[1]){insideActions[1].textContent='Take the free test drive';insideActions[1].setAttribute('href','/signup/?trial=start')}
      if(insideActions[2]){insideActions[2].textContent='Watch the walkthrough';insideActions[2].setAttribute('href','#platform-video')}
      var amazonLink=document.querySelector('.whats-inside-book-cover .whats-inside-amazon-link');
      if(amazonLink)amazonLink.textContent='Get the book on Amazon';
      var timelineLead=document.querySelector('.victory-timeline-head .lead');
      if(timelineLead)timelineLead.textContent='This is the order members follow inside Verge Five. It starts with visibility, builds the business foundation, proves the cleanup, then moves into vendors, cards, and funding only when the profile looks consistent enough for the hidden approval checks.';
      if(heroSection&&!document.querySelector('.inside-setup-path-section')){
        var insideSetup=document.createElement('section');
        insideSetup.className='section setup-path-section inside-setup-path-section';
        insideSetup.innerHTML="<div class='setup-path-head'><p class='kicker'>Business-safe setup paths</p><h2>Inside Verge Five, members are not left to guess what to use.</h2><p class='lead'>Each foundation section points members toward safer setup paths, shows what to avoid, explains what proof to save, and makes the next move depend on readiness instead of rushing applications.</p></div><div class='setup-path-grid'><article><span>01</span><strong>Choose the setup path</strong><p>Use business-safe options for phone, address, website, domain email, legal setup, and banking.</p></article><article><span>02</span><strong>Avoid weak provider choices</strong><p>Understand the shortcuts that can make a business look personal, temporary, unverifiable, or inconsistent.</p></article><article><span>03</span><strong>Save the proof</strong><p>Keep the records that show each step was actually created, filed, listed, or verified.</p></article><article><span>04</span><strong>Unlock smarter moves</strong><p>Move into vendors, cards, and funding paths after the foundation signals are stronger.</p></article></div>";
        var timeline=document.querySelector('.victory-timeline-section');
        if(timeline)timeline.parentNode.insertBefore(insideSetup,timeline);
        else heroSection.closest('.page-hero').insertAdjacentElement('afterend',insideSetup);
      }
      setText('.victory-timeline-head h2','The path is simple: scan, fix, prove, then apply.');
      var videoHead=document.querySelector('.whats-inside-video .promo-video-head h2');
      if(videoHead)videoHead.textContent='See why the platform keeps members from rushing applications.';
      var videoCopy=document.querySelector('.whats-inside-video .promo-video-head p');
      if(videoCopy)videoCopy.textContent='The walkthrough shows how Verge Five moves members from guessing to a readiness path, then uses matchers and progress reports to decide whether to apply now or build first.';
      var demoHead=document.querySelector('.whats-inside-demo .home-demo-head h2');
      if(demoHead)demoHead.textContent='Try the sample readiness logic before joining.';
      var demoCopy=document.querySelector('.whats-inside-demo .home-demo-head p');
      if(demoCopy)demoCopy.textContent='Click a sample profile and watch how the platform separates too early, partially ready, and looks ready. This is the same idea members use before touching vendors or cards.';
      var demoCta=document.querySelector('.whats-inside-demo .home-demo-cta');
      if(demoCta&&!demoCta.querySelector('.test-drive-clarifier')){
        demoCta.insertAdjacentHTML('afterbegin',"<div class='test-drive-clarifier'><strong>Quick demo vs. free test drive</strong><span>This sample shows the logic. The free platform test drive lets you create an account, run the real starting scan, and complete the first identity preview before deciding whether to unlock the full system.</span></div>");
      }
      var reportLead=document.querySelector('.report-section-copy .lead');
      if(reportLead)reportLead.textContent='Inside Verge Five, members can generate a clean progress snapshot that turns the checklist into a simple action plan: what is complete, what is missing, what should wait, and which hidden approval signals need attention next.';
      var cards=document.querySelectorAll('.whats-inside-grid .card');
      if(cards[0]&&cards[0].querySelector('p'))cards[0].querySelector('p').textContent='Business identity, legal setup, banking, business plan and report, approval readiness, the vendor + credit path, and funding path organized around the book framework.';
      if(cards[1]&&cards[1].querySelector('p'))cards[1].querySelector('p').textContent='Compare the business profile against the consistency, visibility, and timing signals vendors, cards, and funding paths expect before applying.';
    }
    if(path==='/start-here/'){
      setText('.start-here-hero .page-sub','Capture the identifiers the hidden approval systems will read first. After this profile is saved, continue into Module 1.');
      setText('.start-scan-context p:not(.kicker)','The Hidden Gatekeepers framework starts with how the business looks from the outside. This scan saves the business identifiers inside the member account and creates the baseline before the buildout starts.');
      setText('.start-member-scan-card .scan-card-head p:not(.kicker)','Enter the same core identifiers lenders, vendors, banks, directories, and public records use to recognize the business.');
    }
    if(path==='/nap-overview/'){
      setText('.lesson-hero .page-sub','Understand the first hidden gatekeeper: the business name, address, and phone must match before the rest of the buildout can be trusted.');
      setText('.module-section-overview > div > p:not(.kicker)','The identity signals the hidden approval systems read first: NAP, phone, 411, address, website, and domain email.');
      var napCopy=document.querySelector('.nap-overview-copy p:not(.kicker)');
      if(napCopy)napCopy.textContent='NAP means the business Name, Address, and Phone. In The Hidden Gatekeepers framework, this is the first identity rule: the business has to tell one consistent story everywhere it appears. Before vendors, banks, credit cards, or funding review the business, public-facing records should point to the same company, same commercial address, and same business phone number.';
      var gated=document.querySelector('[data-gated] p');
      if(gated)gated.textContent='You understand the first hidden gatekeeper: one business identity has to match everywhere. Continue to the business phone and 411 listing lesson.';
    }
    if(path==='/business-credit-answers/'){
      setText('.answer-hero .crumbs','Verge Five Answers');
      setText('.answer-hero .page-title','Plain-English answers before you apply for business credit.');
      setText('.answer-hero .page-sub','Use these answers to understand what approval systems check first: business identity, NAP consistency, public visibility, banking signals, timing, and readiness before vendor credit, cards, or funding.');
      var answerActions=document.querySelectorAll('.answer-hero-actions .btn');
      if(answerActions[0]){answerActions[0].textContent='Run the free scan';answerActions[0].setAttribute('href','/#home-visibility-scan')}
      if(answerActions[1]){answerActions[1].textContent='See what is inside';answerActions[1].setAttribute('href','/whats-inside/')}
      setText('.answer-section-head h2','The questions that stop wasted applications.');
      var summary=document.querySelector('.answer-summary-pro h2');
      if(summary)summary.textContent='Start with visibility, then build the profile.';
      var summaryCta=document.querySelector('.answer-summary-pro .proof-actions .btn.secondary');
      if(summaryCta){summaryCta.textContent='Run the free scan';summaryCta.setAttribute('href','/#home-visibility-scan')}
    }
  }
  applyHiddenGatekeepersFraming();

  function initMembershipAccess(){
    var INTRO_MONTHLY_CODE='INTRO7';
    function affiliateCode(){
      var params=new URL(location.href).searchParams;
      var ref=(params.get('ref')||params.get('affiliate')||'').replace(/[^a-zA-Z0-9_-]/g,'').toLowerCase();
      if(ref){
        var maxAge=60*60*24*60;
        document.cookie='vf_affiliate='+encodeURIComponent(ref)+'; Path=/; Max-Age='+maxAge+'; SameSite=Lax';
        try{localStorage.setItem('vf-affiliate',ref)}catch(e){}
        return ref;
      }
      var match=document.cookie.match(/(?:^|; )vf_affiliate=([^;]+)/);
      if(match)return decodeURIComponent(match[1]);
      try{return localStorage.getItem('vf-affiliate')||''}catch(e){return ''}
    }
    function legacyLeadToken(){
      var params=new URL(location.href).searchParams;
      var token=(params.get('legacy')||params.get('lead')||'').replace(/[^a-zA-Z0-9_-]/g,'');
      if(token){
        var maxAge=60*60*24*45;
        document.cookie='vf_legacy_lead='+encodeURIComponent(token)+'; Path=/; Max-Age='+maxAge+'; SameSite=Lax';
        try{localStorage.setItem('vf-legacy-lead',token)}catch(e){}
        return token;
      }
      var match=document.cookie.match(/(?:^|; )vf_legacy_lead=([^;]+)/);
      if(match)return decodeURIComponent(match[1]);
      try{return localStorage.getItem('vf-legacy-lead')||''}catch(e){return ''}
    }
    affiliateCode();
    var legacyContactLinks=document.querySelectorAll("a[href='/contact-usb3806186/']");
    legacyContactLinks.forEach(function(link){
      link.setAttribute('href','/contact/');
    });
    document.querySelectorAll("a[href='/#pricing']:not([data-pricing-link])").forEach(function(link){link.setAttribute('href','/membership/')});
    function message(text, danger){
      document.querySelectorAll('[data-auth-message]').forEach(function(el){
        el.textContent=text||'';
        el.classList.toggle('danger',!!danger);
      });
    }
    function checkoutAffiliateCode(){
      var input=document.querySelector('[data-affiliate-code-input]');
      var typed=input?input.value.replace(/[^a-zA-Z0-9_-]/g,'').toLowerCase():'';
      return typed||affiliateCode();
    }
    function checkoutCouponCode(){
      var input=document.querySelector('[data-coupon-code-input]');
      return input?input.value.replace(/[^a-zA-Z0-9_-]/g,'').toUpperCase():'';
    }
    function checkoutCustomerName(){
      var input=document.querySelector('[data-checkout-name]');
      return input?input.value.trim().replace(/\s+/g,' ').slice(0,120):'';
    }
    function checkoutCustomerEmail(){
      var input=document.querySelector('[data-checkout-email]');
      return input?input.value.trim().toLowerCase().slice(0,254):'';
    }
    function checkoutPayload(plan){
      return {plan:plan,affiliateCode:checkoutAffiliateCode(),couponCode:checkoutCouponCode(),name:checkoutCustomerName(),email:checkoutCustomerEmail()};
    }
    function syncCouponInput(){
      var input=document.querySelector('[data-coupon-code-input]');
      var note=document.querySelector('[data-coupon-code-note]');
      if(!input)return;
      if(selectedMembershipPlan()==='monthly'&&!input.value){
        input.value=INTRO_MONTHLY_CODE;
        input.setAttribute('data-intro-code-applied','true');
        if(note){
          note.hidden=false;
          note.textContent='Intro offer applied: first month $7, then $49/month.';
        }
      }
      input.addEventListener('input',function(){
        input.value=input.value.replace(/[^a-zA-Z0-9_-]/g,'').toUpperCase();
        input.setAttribute('data-intro-code-applied','false');
        if(note){
          note.hidden=!input.value;
          note.textContent=input.value?'Coupon code will be applied at checkout: '+input.value:'';
        }
      });
    }
    function syncAffiliateInput(){
      var input=document.querySelector('[data-affiliate-code-input]');
      var note=document.querySelector('[data-affiliate-code-note]');
      if(!input)return;
      var code=affiliateCode();
      if(code&&!input.value)input.value=code;
      if(note&&code){
        note.hidden=false;
        note.textContent='Affiliate code applied: '+code;
      }
      input.addEventListener('input',function(){
        input.value=input.value.replace(/[^a-zA-Z0-9_-]/g,'').toLowerCase();
        if(note){
          note.hidden=!input.value;
          note.textContent=input.value?'Affiliate code applied: '+input.value:'';
        }
        if(input.value){
          var maxAge=60*60*24*60;
          document.cookie='vf_affiliate='+encodeURIComponent(input.value)+'; Path=/; Max-Age='+maxAge+'; SameSite=Lax';
          try{localStorage.setItem('vf-affiliate',input.value)}catch(e){}
        }
      });
    }
    function nextPath(fallback){
      var url=new URL(location.href);
      return url.searchParams.get('next')||fallback||'/homeefe757a6/';
    }
    function selectedMembershipPlan(){
      var plan=new URL(location.href).searchParams.get('plan')||sessionStorage.getItem('vf-selected-plan')||'annual';
      return plan==='monthly'?'monthly':'annual';
    }
    function setSelectedPlan(plan){
      plan=plan==='monthly'?'monthly':'annual';
      try{sessionStorage.setItem('vf-selected-plan',plan)}catch(e){}
      document.querySelectorAll('[data-plan-card]').forEach(function(el){
        var cardPlan=el.getAttribute('data-plan-card')==='monthly'?'monthly':'annual';
        var selected=cardPlan===plan;
        el.classList.toggle('selected-plan',selected);
        var btn=el.querySelector('[data-select-plan]');
        if(btn)btn.textContent=selected?(cardPlan==='monthly'?'Monthly selected':'Annual selected'):(cardPlan==='monthly'?'Select monthly':'Select annual');
      });
      var signup=document.querySelector('.checkout-panel a[href="/signup/"]');
      if(signup)signup.href='/signup/?trial=start&plan='+plan;
      document.querySelectorAll('[data-checkout-plan-label]').forEach(function(el){
        el.textContent=plan==='monthly'?'Continue with $7 first month':'Continue to annual checkout';
      });
      document.querySelectorAll('[data-checkout-selected-title],[data-checkout-summary-title]').forEach(function(el){el.textContent=plan==='monthly'?'Monthly access':'Annual access';});
      document.querySelectorAll('[data-checkout-selected-copy]').forEach(function(el){el.textContent=plan==='monthly'?'First month $7, then month-to-month access at $49/month.':'Full-year access to the Verge Five buildout.';});
      document.querySelectorAll('[data-checkout-order-name]').forEach(function(el){el.textContent=plan==='monthly'?'Verge Five Monthly':'Verge Five Annual';});
      document.querySelectorAll('[data-checkout-order-price]').forEach(function(el){el.textContent=plan==='monthly'?'$49.00/mo':'$597.00';});
      document.querySelectorAll('[data-checkout-total]').forEach(function(el){el.textContent=plan==='monthly'?'$7.00':'$597.00';});
      document.querySelectorAll('[data-checkout-renewal-note]').forEach(function(el){el.textContent=plan==='monthly'?'Renews at $49/month after the first month.':'Renews annually at $597/year.';});
      document.querySelectorAll('[data-checkout-intro-line]').forEach(function(el){el.hidden=plan!=='monthly';});
      var couponInput=document.querySelector('[data-coupon-code-input]');
      var couponNote=document.querySelector('[data-coupon-code-note]');
      if(couponInput){
        var autoApplied=couponInput.getAttribute('data-intro-code-applied')!=='false';
        if(plan==='monthly'&&(!couponInput.value||autoApplied)){
          couponInput.value=INTRO_MONTHLY_CODE;
          couponInput.setAttribute('data-intro-code-applied','true');
          if(couponNote){
            couponNote.hidden=false;
            couponNote.textContent='Intro offer applied: first month $7, then $49/month.';
          }
        }
        if(plan==='annual'&&couponInput.value===INTRO_MONTHLY_CODE&&autoApplied){
          couponInput.value='';
          couponInput.setAttribute('data-intro-code-applied','true');
          if(couponNote){
            couponNote.hidden=true;
            couponNote.textContent='';
          }
        }
      }
      if(location.pathname==='/membership/')message(plan==='monthly'?'Monthly selected: $7 first month, then $49/month.':'Annual selected: $597/year.');
    }
    function postJson(url, payload){
      return fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload||{})})
        .then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Request failed');return data})});
    }
    var appConfig={turnstileSiteKey:'',emailVerificationRequired:false};
    function loadTurnstile(siteKey){
      if(!siteKey||!document.querySelector('[data-turnstile]'))return;
      if(!document.querySelector('script[src*="turnstile"]')){
        var script=document.createElement('script');
        script.src='https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async=true;
        script.defer=true;
        document.head.appendChild(script);
      }
      document.querySelectorAll('[data-turnstile]').forEach(function(el){
        el.className='cf-turnstile';
        el.setAttribute('data-sitekey',siteKey);
      });
    }
    fetch('/api/config').then(function(res){return res.json()}).then(function(config){
      appConfig=config||appConfig;
      loadTurnstile(appConfig.turnstileSiteKey);
    }).catch(function(){});
    if(location.pathname==='/membership/'){
      setSelectedPlan(selectedMembershipPlan());
      syncAffiliateInput();
      syncCouponInput();
      var params=new URL(location.href).searchParams;
      if(params.get('trial')==='expired')message('Your free test drive has expired. Choose monthly or annual access to continue.');
      if(params.get('trial')==='locked')message('That section is part of the paid platform. Upgrade to unlock the full buildout.');
      if(params.get('checkout')==='continue'){
        var continuePlan=selectedMembershipPlan();
        message('Opening secure Stripe checkout...');
        postJson('/api/billing/create-checkout-session',checkoutPayload(continuePlan))
          .then(function(data){if(data.url)location.href=data.url;else throw new Error('Checkout URL was not returned.')})
          .catch(function(err){message(err.message,true)});
      }
    }
    if(location.pathname==='/checkout-success/'){
      var accessStatus=document.querySelector('[data-checkout-access-status]');
      var sessionId=new URL(location.href).searchParams.get('session_id')||'';
      if(accessStatus&&sessionId){
        accessStatus.textContent='Verifying payment and sending your access email...';
        postJson('/api/billing/checkout-success',{sessionId:sessionId})
          .then(function(data){accessStatus.textContent=data.message||'Access email sent. Check the inbox used at checkout.';})
          .catch(function(err){accessStatus.textContent=err.message||'If the email does not arrive, use the resend form on this page.';accessStatus.classList.add('danger');});
      }else if(accessStatus){
        accessStatus.textContent='If your access email does not arrive, use the resend form on this page.';
      }
    }
    document.querySelectorAll('[data-auth-form]').forEach(function(form){
      form.addEventListener('submit',function(e){
        e.preventDefault();
        var mode=form.getAttribute('data-auth-form');
        var payload={};
        Array.prototype.forEach.call(form.elements,function(el){if(el.name)payload[el.name]=el.value});
        var turnstile=form.querySelector('[name="cf-turnstile-response"]');
        if(turnstile)payload.turnstileToken=turnstile.value;
        if(mode==='register'){payload.affiliateCode=affiliateCode();payload.legacyToken=legacyLeadToken();}
        message(mode==='register'?'Creating account...':'Logging in...');
        postJson(mode==='register'?'/api/auth/register':'/api/auth/login',payload)
          .then(function(data){
            if(mode==='register'&&data.emailVerification&&data.emailVerification.required&&!data.emailVerification.emailProviderConfigured&&data.emailVerification.verificationUrl){
              message('Account created. Email service is not configured yet, so use the verification link shown below.',false);
              var msg=document.querySelector('[data-auth-message]');
              if(msg)msg.innerHTML='Account created. Verification email provider is not configured yet.<br><a href="'+data.emailVerification.verificationUrl+'">Verify this test account</a>';
              return;
            }
            location.href=nextPath(mode==='register'?'/start-here/?trial=started':(data.isAdmin?'/admin/':'/homeefe757a6/'));
          })
          .catch(function(err){message(err.message,true)});
      });
    });
    document.querySelectorAll('[data-password-reset-request]').forEach(function(form){
      form.addEventListener('submit',function(e){
        e.preventDefault();
        var payload={};
        Array.prototype.forEach.call(form.elements,function(el){if(el.name)payload[el.name]=el.value});
        var turnstile=form.querySelector('[name="cf-turnstile-response"]');
        if(turnstile)payload.turnstileToken=turnstile.value;
        message('Sending reset link...');
        postJson(location.pathname==='/checkout-success/'?'/api/billing/send-access-email':'/api/auth/request-password-reset',payload)
          .then(function(data){
            var msg=document.querySelector('[data-auth-message]');
            message(data.message||'If that email is in our system, a password reset link has been sent.');
            if(data.resetUrl&&msg)msg.innerHTML='Debug reset link:<br><a href="'+data.resetUrl+'">Reset password</a>';
          })
          .catch(function(err){message(err.message,true)});
      });
    });
    document.querySelectorAll('[data-password-reset-confirm]').forEach(function(form){
      var tokenField=form.querySelector('[data-reset-token]');
      if(tokenField)tokenField.value=new URL(location.href).searchParams.get('token')||'';
      form.addEventListener('submit',function(e){
        e.preventDefault();
        if(form.getAttribute('data-reset-submitting')==='true')return;
        form.setAttribute('data-reset-submitting','true');
        var submit=form.querySelector('button[type="submit"],input[type="submit"]');
        if(submit)submit.disabled=true;
        var payload={};
        Array.prototype.forEach.call(form.elements,function(el){if(el.name)payload[el.name]=el.value});
        if(!payload.token){form.removeAttribute('data-reset-submitting');if(submit)submit.disabled=false;message('Password reset token is missing. Request another reset link.',true);return;}
        var turnstile=form.querySelector('[name="cf-turnstile-response"]');
        if(turnstile)payload.turnstileToken=turnstile.value;
        message('Updating password...');

        postJson('/api/auth/reset-password',payload)
          .then(function(data){
            message((data.message||'Password updated.')+' Redirecting to login...');
            setTimeout(function(){location.href='/login/?reset=success'},900);
          })
          .catch(function(err){
            form.removeAttribute('data-reset-submitting');
            if(submit)submit.disabled=false;
            message(err.message||'Unable to reset password. Request another reset link.',true);
          });
      });
    });    document.querySelectorAll('[data-select-plan]').forEach(function(btn){
      btn.addEventListener('click',function(){
        setSelectedPlan(btn.getAttribute('data-plan')||'annual');
      });
    });
    document.querySelectorAll('[data-apply-coupon]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var code=checkoutCouponCode();
        var note=document.querySelector('[data-coupon-code-note]');
        if(note){note.hidden=false;note.textContent=code?'Coupon '+code+' will be checked at Stripe checkout.':'Enter a coupon code first.';}
      });
    });
    document.querySelectorAll('[data-start-checkout]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var plan=btn.getAttribute('data-plan')||selectedMembershipPlan();
        setSelectedPlan(plan);
        message('Opening secure Stripe checkout...');
        postJson('/api/billing/create-checkout-session',checkoutPayload(plan))
          .then(function(data){if(data.url)location.href=data.url;else throw new Error('Checkout URL was not returned.')})
          .catch(function(err){
            message(err.message,true);
          });
      });
    });
    document.querySelectorAll('[data-customer-portal]').forEach(function(btn){
      btn.addEventListener('click',function(){
        message('Opening billing portal...');
        postJson('/api/billing/create-portal-session',{})
          .then(function(data){if(data.url)location.href=data.url;else throw new Error('Portal URL was not returned.')})
          .catch(function(err){message(err.message,true)});
      });
    });
    document.querySelectorAll('[data-logout]').forEach(function(btn){
      btn.addEventListener('click',function(){
        postJson('/api/auth/logout',{}).then(function(){location.href='/'});
      });
    });
    function renderReportHistory(isTrial,active){
      var list=document.querySelector('[data-report-history-list]');
      if(!list)return;
      if(isTrial){
        list.innerHTML='<p class="legal">Report history unlocks with the full platform after the free test drive.</p>';
        return;
      }
      if(!active){
        list.innerHTML='<p class="legal">Activate membership access to save and view report snapshots.</p>';
        return;
      }
      memberApi('GET','/api/member/reports').then(function(data){
        var reports=data.reports||[];
        if(!reports.length){
          list.innerHTML='<p class="legal">No report snapshots yet. Print or download a member report to save one here.</p>';
          return;
        }
        list.innerHTML=reports.slice(0,5).map(function(report){
          var summary=report.summary||{};
          var when=report.createdAt?new Date(report.createdAt).toLocaleString():'Saved report';
          var type=report.reportType==='final-readiness'?'Final readiness':'Progress';
          var details=[];
          if(summary.profileDone!==undefined&&summary.profileTotal!==undefined)details.push(summary.profileDone+' / '+summary.profileTotal+' profile items');
          if(summary.completedPages!==undefined&&summary.totalPages!==undefined)details.push(summary.completedPages+' / '+summary.totalPages+' sections started');
          return '<article class="report-history-item"><strong>'+escapeHtml(type)+' report</strong><span>'+escapeHtml(report.readinessStage||'Readiness snapshot')+'</span><small>'+escapeHtml(when)+(details.length?' - '+escapeHtml(details.join(', ')):'')+'</small></article>';
        }).join('');
      }).catch(function(){
        list.innerHTML='<p class="legal">Report history is unavailable right now.</p>';
      });
    }
    if(location.pathname==='/account/'){
      fetch('/api/auth/me',{headers:{accept:'application/json'}}).then(function(res){return res.json()}).then(function(data){
        if(!data.user){location.href='/login/?next=/account/';return}
        var status=(data.membership&&data.membership.status)||'none';
        var active=!!data.active;
        var period=(data.membership&&data.membership.currentPeriodEnd)?new Date(data.membership.currentPeriodEnd).toLocaleDateString():'Not available';
        var email=document.querySelector('[data-account-email]');
        var statusEl=document.querySelector('[data-account-status]');
        var periodEl=document.querySelector('[data-account-period]');
        var copy=document.querySelector('[data-account-copy]');
        if(email)email.textContent=data.user.email;
        var isTrial=/^trial$/i.test(status);
        if(statusEl)statusEl.textContent=isTrial?'Free test drive':active?'Active':status;
        if(periodEl)periodEl.textContent=isTrial?'Test drive ends '+period:period;
        if(copy)copy.textContent=isTrial?'Your free test drive is active. Start with the roadmap, run the Business Visibility Audit, and preview Module 1 before upgrading.':active?'Your membership is active. Continue the guided buildout from the dashboard.':'Your account exists, but membership access is not active yet.';
        renderReportHistory(isTrial,active);
      }).catch(function(){location.href='/login/?next=/account/'});
    }
    if(location.pathname==='/verify-email/'){
      var token=new URL(location.href).searchParams.get('token')||'';
      var copy=document.querySelector('[data-verify-copy]');
      if(!token){
        if(copy)copy.textContent='This verification link is missing a token.';
        message('Invalid verification link.',true);
      }else{
        postJson('/api/auth/verify-email',{token:token}).then(function(){
          if(copy)copy.textContent='Your email has been verified. You can log in and continue.';
          message('Email verified.');
        }).catch(function(err){
          if(copy)copy.textContent='We could not verify this link.';
          message(err.message,true);
        });
      }
    }
  }
  initMembershipAccess();

  function initTrialAccessBanner(){
    if(document.querySelector('[data-trial-banner]'))return;
    fetch('/api/auth/me',{headers:{accept:'application/json'}}).then(function(res){return res.json()}).then(function(data){
      var status=data&&data.membership&&data.membership.status;
      if(!/^trial$/i.test(status||''))return;
      var end=data.membership.currentPeriodEnd?new Date(data.membership.currentPeriodEnd).toLocaleDateString():'soon';
      var header=document.querySelector('.site-header');
      var banner=document.createElement('div');
      banner.className='trial-access-banner';
      banner.setAttribute('data-trial-banner','');
      banner.innerHTML="<strong>Free test drive active</strong><span>Limited preview access ends "+escapeHtml(end)+". Full modules, reports, vendor library, cards, and funding tools unlock after upgrade.</span><a class='btn small' href='/membership/'>Upgrade</a>";
      if(header)header.insertAdjacentElement('afterend',banner);
      else document.body.insertAdjacentElement('afterbegin',banner);
    }).catch(function(){});
  }
  initTrialAccessBanner();

  function initTrialPreviewLocks(){
    fetch('/api/auth/me',{headers:{accept:'application/json'}}).then(function(res){return res.json()}).then(function(data){
      var status=data&&data.membership&&data.membership.status;
      if(!/^trial$/i.test(status||''))return;
      var fullAccess=['/account/','/start-here/','/homeefe757a6/','/business-visibility-audit/','/ai-visibility-audit/','/nap-overview/','/phones-and-411/'];
      var path=location.pathname;
      var isFullAccess=fullAccess.some(function(prefix){return path===prefix||path.indexOf(prefix)===0});
      if(isFullAccess)return;
      var layout=document.querySelector('.member-layout');
      if(!layout)return;
      document.body.classList.add('trial-preview-locked');
      var hero=document.querySelector('.lesson-hero')||document.querySelector('.page-hero');
      var lock=document.createElement('section');
      lock.className='trial-preview-lock-callout';
      lock.innerHTML="<div><p class='kicker'>Preview locked</p><h2>You are seeing the next step in the buildout.</h2><p>Your free test drive includes the full phone and Business 411 setup. The deeper modules stay locked because the goal is to reach vendor credit, credit cards, and funding only after the business identity, legal setup, banking, and readiness checks are clean.</p></div><div class='trial-lock-actions'><a class='btn secondary' href='/whats-inside/#quick-test-drive'>See example matchers</a><a class='btn dark' href='/membership/'>Unlock full access</a></div>";
      if(hero)hero.insertAdjacentElement('afterend',lock);
      else layout.insertAdjacentElement('beforebegin',lock);
      document.querySelectorAll('.member-main .content-block,.member-main .lesson-video,.member-main .vendor-match-tool').forEach(function(el){
        if(el.classList.contains('module-section-overview'))return;
        el.classList.add('trial-preview-blur');
      });
      document.querySelectorAll('.member-main video').forEach(function(video){
        video.pause();
        video.removeAttribute('controls');
        video.setAttribute('preload','none');
        video.setAttribute('aria-label','Video unlocks with full access');
        var frame=video.closest('.lesson-video');
        if(frame&&!frame.querySelector('.trial-video-lock')){
          frame.insertAdjacentHTML('beforeend',"<div class='trial-video-lock'><strong>Video locked</strong><span>Unlock full access to play this lesson.</span></div>");
        }
      });
      var allowedLinks=['/membership/','/account/','/homeefe757a6/','/nap-overview/','/phones-and-411/','/whats-inside/'];
      document.querySelectorAll('.member-main a,.member-main button,.member-main input,.member-main select,.member-main textarea').forEach(function(el){
        if(el.matches('a')){
          var href=el.getAttribute('href')||'';
          var allowed=allowedLinks.some(function(prefix){return href===prefix||href.indexOf(prefix)===0});
          if(!allowed){el.setAttribute('aria-disabled','true');el.setAttribute('tabindex','-1');el.classList.add('trial-disabled-control')}
          return;
        }
        el.disabled=true;
        el.classList.add('trial-disabled-control');
      });
      document.addEventListener('click',function(e){
        if(!document.body.classList.contains('trial-preview-locked'))return;
        var target=e.target.closest('.member-main a,.member-main button,.member-main input,.member-main select,.member-main textarea,.member-main video');
        if(!target)return;
        if(target.matches('a')){
          var href=target.getAttribute('href')||'';
          if(allowedLinks.some(function(prefix){return href===prefix||href.indexOf(prefix)===0}))return;
        }
        e.preventDefault();
        e.stopPropagation();
      },true);
    }).catch(function(){});
  }  initTrialPreviewLocks();

  function initTrialModuleOneOutcomeModal(){
    if(location.pathname!=='/phones-and-411/')return;
    if(document.querySelector('[data-trial-outcome-modal]'))return;
    fetch('/api/auth/me',{headers:{accept:'application/json'}}).then(function(res){return res.json()}).then(function(data){
      var status=data&&data.membership&&data.membership.status;
      if(!/^trial$/i.test(status||''))return;
      var shownKey='vf-trial-module-one-outcome-shown';
      function showModal(force){
        if(!force&&sessionStorage.getItem(shownKey))return;
        sessionStorage.setItem(shownKey,'1');
        var modal=document.querySelector('[data-trial-outcome-modal]');
        if(!modal){
          modal=document.createElement('div');
          modal.className='trial-outcome-modal';
          modal.setAttribute('data-trial-outcome-modal','');
          modal.innerHTML="<div class='trial-outcome-backdrop' data-trial-outcome-close></div><article class='trial-outcome-card'><button type='button' class='vendor-detail-close' data-trial-outcome-close>Close</button><p class='kicker'>Test drive checkpoint</p><h2>You have seen how Verge Five starts.</h2><p>The rest of the buildout is locked in the test drive. The goal is to get your business to the point where vendor credit, credit cards, and funding paths open only when the business identity, legal setup, banking, and readiness criteria are clean.</p><div class='trial-outcome-grid'><span><strong>Vendor credit</strong><small>Starter and category vendors unlock when the profile matches their requirements.</small></span><span><strong>Credit cards</strong><small>Card paths open after identity, banking, and readiness signals are strong enough.</small></span><span><strong>Funding</strong><small>Funding options stay gated until the business has the profile and timing to support the next move.</small></span></div><p class='trial-outcome-note'>Inside the full platform there are 110+ vendor, credit-card, and funding options organized by readiness so members do not waste applications.</p><div class='proof-actions'><a class='btn dark' href='/whats-inside/#quick-test-drive'>See example matchers</a><a class='btn secondary' href='/membership/'>Unlock full access</a></div></article>";
          document.body.appendChild(modal);
          modal.addEventListener('click',function(e){
            if(e.target.closest('[data-trial-outcome-close]')){
              modal.classList.remove('active');
              document.body.classList.remove('modal-open');
            }
          });
        }
        modal.classList.add('active');
        document.body.classList.add('modal-open');
      }
      var checks=document.querySelectorAll('[data-check]');
      function allDone(){return checks.length&&Array.prototype.every.call(checks,function(el){return el.classList.contains('checked')})}
      document.addEventListener('click',function(e){
        var link=e.target.closest('a[href="/business-address/"]');
        if(link){
          e.preventDefault();
          showModal(true);
          return;
        }
        var check=e.target.closest('[data-check]');
        if(check){setTimeout(function(){if(allDone())showModal(false)},80)}
      },true);
      if(allDone())setTimeout(function(){showModal(false)},500);
    }).catch(function(){});
  }
  initTrialModuleOneOutcomeModal();
  function initMemberGuideWalkthrough(){
    if(!isMemberExperiencePath())return;
    if(location.pathname==='/login/'||location.pathname==='/signup/'||document.querySelector('[data-member-guide-modal]'))return;
    fetch('/api/auth/me',{headers:{accept:'application/json'}}).then(function(res){return res.json()}).then(function(data){
      if(!data||!data.user)return;
      if(data.isAdmin)return;
      var status=(data.membership&&data.membership.status)||'none';
      var isTrial=/^trial$/i.test(status);
      var active=!!data.active||isTrial;
      if(!active)return;
      var email=(data.user.email||'member').toLowerCase();
      var key='vf-member-guide-seen:'+email+':v1';
      var accountGuideSeen=false;
      var shouldAutoOpenGuide=false;
      var steps=[
        ['Start with the profile','Capture the legal name, state, EIN, phone, address, website, email, and banking signals before applications.'],
        ['Verify NAP consistency','Name, address, and phone should match across state records, bank records, directory listings, website, and applications.'],
        ['Move module by module','Check off each lesson only after the proof is saved. The next step opens when the foundation item is complete.'],
        ['Use the report','Print or download the progress report to see what is complete, what is missing, and what should happen next.']
      ];
      var modal=document.createElement('div');
      modal.className='member-guide-modal';
      modal.setAttribute('data-member-guide-modal','');
      modal.innerHTML="<div class='member-guide-backdrop' data-member-guide-close></div><article class='member-guide-card'><button type='button' class='vendor-detail-close' data-member-guide-close>Close</button><p class='kicker'>Platform guide</p><h2>"+(isTrial?'How your free test drive works.':'How to use Verge Five.')+"</h2><p>"+(isTrial?'Your test drive lets you start the foundation and see how the rest of the system unlocks. The deeper vendor, card, and funding areas stay preview-locked until full access is active.':'Verge Five is built to move in order: foundation first, then vendor credit, credit cards, and funding only when the business profile is ready.')+"</p><div class='member-guide-steps'>"+steps.map(function(step,index){return "<span><b>"+(index+1)+"</b><strong>"+escapeHtml(step[0])+"</strong><small>"+escapeHtml(step[1])+"</small></span>"}).join('')+"</div><div class='member-guide-note'><strong>The goal:</strong> build the business identifiers lenders and vendors expect, then use the matchers and report to avoid rushed applications.</div><div class='proof-actions'><a class='btn dark' href='/start-here/' data-member-guide-start>Start Here</a><a class='btn secondary' href='/business-visibility-audit/' data-member-guide-start>Run visibility audit</a><button class='btn ghost' type='button' data-member-guide-close>Keep working</button></div></article>";
      document.body.appendChild(modal);
      function markGuideSeen(){
        accountGuideSeen=true;
        try{localStorage.setItem(key,'1')}catch(e){}
        fetch('/api/member/guide',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({seen:true}),keepalive:true}).catch(function(){});
      }
      function close(){
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        markGuideSeen();
      }
      function open(force){
        if(!force){
          if(accountGuideSeen)return;
          try{if(localStorage.getItem(key))return}catch(e){}
        }
        modal.classList.add('active');
        document.body.classList.add('modal-open');
      }
      modal.addEventListener('click',function(e){if(e.target.closest('[data-member-guide-start]')){markGuideSeen(); document.body.classList.remove('modal-open');return} if(e.target.closest('[data-member-guide-close]'))close()});
      document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('active'))close()});
      var trigger=document.createElement('button');
      trigger.type='button';
      trigger.className='member-guide-trigger';
      trigger.setAttribute('data-member-guide-trigger','');
      trigger.textContent='Guide';
      trigger.addEventListener('click',function(){open(true)});
      document.body.appendChild(trigger);
      fetch('/api/member/guide',{headers:{accept:'application/json'}})
        .then(function(res){return res.ok?res.json():{seen:false}})
        .then(function(guide){
          accountGuideSeen=!!(guide&&guide.seen);
          // Guide remains available from the floating button; do not auto-open.
        })
        .catch(function(){});
    }).catch(function(){});
  }
  initMemberGuideWalkthrough();

  function initContactForm(){
    var form=document.querySelector('[data-contact-form]');
    if(!form)return;
    var status=document.querySelector('[data-contact-status]');
    form.addEventListener('submit',function(event){
      event.preventDefault();
      if(status){status.textContent='Sending your message...';status.classList.remove('danger')}
      var payload={
        name:(form.elements.name||{}).value||'',
        email:(form.elements.email||{}).value||'',
        topic:(form.elements.topic||{}).value||'',
        message:(form.elements.message||{}).value||'',
        company:(form.elements.company||{}).value||''
      };
      fetch('/api/contact',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})
        .then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Message could not be sent.');return data})})
        .then(function(){
          form.reset();
          if(status)status.textContent='Message sent. We will review it and follow up from the Verge Five team.';
        })
        .catch(function(err){
          if(status){status.textContent=err.message||'Message could not be sent. Please try again.';status.classList.add('danger')}
        });
    });
  }
  initContactForm();
  function initFeedbackForm(){
    var form=document.querySelector('[data-feedback-form]');
    if(!form)return;
    var status=document.querySelector('[data-feedback-status]');
    var pageUrl=form.querySelector('[data-feedback-page-url]');
    if(pageUrl&&!pageUrl.value)pageUrl.value=new URLSearchParams(location.search).get('from')||location.href;
    fetch('/api/auth/me',{headers:{accept:'application/json'}}).then(function(res){return res.ok?res.json():null}).then(function(data){
      if(!data||!data.user)return;
      if(form.elements.email&&!form.elements.email.value)form.elements.email.value=data.user.email||'';
      if(form.elements.name&&!form.elements.name.value)form.elements.name.value=data.user.name||'';
    }).catch(function(){});
    form.addEventListener('submit',function(event){
      event.preventDefault();
      if(status){status.textContent='Sending report...';status.classList.remove('danger')}
      var payload={name:(form.elements.name||{}).value||'',email:(form.elements.email||{}).value||'',type:(form.elements.type||{}).value||'Report a problem',severity:(form.elements.severity||{}).value||'Normal',pageUrl:(form.elements.pageUrl||{}).value||location.href,message:(form.elements.message||{}).value||'',steps:(form.elements.steps||{}).value||'',company:(form.elements.company||{}).value||'',browser:navigator.userAgent||''};
      fetch('/api/feedback',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Report could not be sent.');return data})}).then(function(){form.reset();if(pageUrl)pageUrl.value=location.href;if(status)status.textContent='Report sent. Thank you - we will review it.'}).catch(function(err){if(status){status.textContent=err.message||'Report could not be sent. Please try again.';status.classList.add('danger')}});
    });
  }
  initFeedbackForm();

  function initFeedbackBugButton(){
    if(!isMemberExperiencePath()||location.pathname==='/feedback/'||location.pathname==='/admin/'||location.pathname==='/start-here/')return;
    if(document.querySelector('[data-feedback-trigger]'))return;
    var style=document.createElement('style');
    style.textContent='.feedback-trigger{position:fixed;right:18px;bottom:72px;z-index:1000;border:1px solid #7dd9e7;background:#071733;color:#fff;border-radius:999px;padding:11px 15px;font-size:13px;font-weight:900;text-decoration:none;box-shadow:0 14px 36px rgba(7,23,51,.24)}.feedback-trigger:hover{background:#0b3558}.feedback-inline-link{display:inline-flex;align-items:center;justify-content:center;margin:0 0 12px auto}@media(max-width:760px){.feedback-trigger{right:12px;bottom:18px;padding:10px 12px;font-size:12px}.feedback-inline-link{width:100%;margin:0 0 12px 0}}';
    document.head.appendChild(style);
    var href='/feedback/?from='+encodeURIComponent(location.pathname+location.search);
    var a=document.createElement('a');
    a.className='feedback-trigger';
    a.href=href;
    a.setAttribute('data-feedback-trigger','');
    a.textContent='Report a problem';
    document.body.appendChild(a);
    var target=document.querySelector('.member-main')||document.querySelector('.section.member-layout')||document.querySelector('main');
    if(target&&!document.querySelector('[data-feedback-inline]')){
      var inline=document.createElement('a');
      inline.className='btn secondary feedback-inline-link';
      inline.href=href;
      inline.setAttribute('data-feedback-inline','');
      inline.textContent='Report a problem';
      target.insertBefore(inline,target.firstChild);
    }
  }
  initFeedbackBugButton();

  function initAdminBackend(){
    if(location.pathname!=='/admin/')return;
    var tbody=document.querySelector('[data-admin-members]');
    var totals=document.querySelector('[data-admin-totals]');
    var search=document.querySelector('[data-admin-search]');
    var affiliateBody=document.querySelector('[data-admin-affiliates]');
    var commissionBody=document.querySelector('[data-admin-commissions]');
    var affiliateForm=document.querySelector('[data-affiliate-create]');
    var affiliateMessage=document.querySelector('[data-affiliate-message]');
    var envList=document.querySelector('[data-admin-env-list]');
    var detailBody=document.querySelector('[data-admin-member-detail-body]');
    var members=[];
    var currentMemberId='';
    function fmtDate(value){return value?new Date(value).toLocaleDateString():'-'}
    function fmtDateTime(value){return value?new Date(value).toLocaleString():'-'}
    function money(cents){return '$'+(Number(cents||0)/100).toFixed(2)}
    function affiliateMsg(text,danger){if(affiliateMessage){affiliateMessage.textContent=text||'';affiliateMessage.classList.toggle('danger',!!danger)}}
    function adminMessage(text,danger){
      var msg=document.querySelector('[data-auth-message]');
      if(msg){msg.textContent=text||'';msg.classList.toggle('danger',!!danger)}
    }
    function postAdminAction(payload){
      return fetch('/api/admin/actions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})
        .then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Unable to update member');return data})});
    }    function testDriveWelcomeTemplate(member){
      var firstName=(member.name||'').split(/\s+/)[0]||'there';
      return {
        subject:'Your Verge Five test drive is ready',
        message:'Hi '+firstName+',\n\nWelcome to Verge Five. The platform is built from the same framework behind The Hidden Gatekeepers of Business Approval: approval systems look for consistency, visibility, and readiness before a human ever reviews the file.\n\nStart here:\nhttps://www.vergefive.com/start-here/\n\nThe first thing to do is run the Business Visibility Audit so you have a baseline before Module 1. After that, move through the first business identity step and see how the system opens the next parts of the buildout in order.\n\nInside the platform, you will be able to:\n- Capture the business profile\n- Check name, address, and phone consistency\n- Complete the first business identity step\n- Preview how vendor, credit card, and funding paths unlock when the business is ready\n\nThe goal is simple: do not rush applications. Build the profile first, then use the platform to decide what should happen next.\n\nYou can log in here:\nhttps://www.vergefive.com/login/\n\nIf you have questions, reply to this email and we can help you get started.\n\nVerge Five team'
      };
    }
    function stalledBusinessCreditTemplate(member){
      var firstName=(member.name||'').split(/\s+/)[0]||'there';
      return {
        subject:'See what may have stopped your business credit buildout',
        message:'Hi '+firstName+',\n\nIf you have tried to build business credit before and felt like you were getting nowhere, you are not alone. A lot of business owners were told to apply for vendor accounts, credit cards, or funding before the business profile was actually ready.\n\nThe Hidden Gatekeepers of Business Approval explains the problem: automated systems can read a business as inconsistent, invisible, or risky before anyone manually reviews it. Verge Five was built to help you see what may have been missing: the business name, address, phone, website, email, banking, public records, and timing signals lenders and vendors often review before they say yes.\n\nWe are inviting you to take a free test drive of the platform so you can see the process for yourself. Do not take our word for it. Log in, run the Business Visibility Audit, start the first business identity step, and see whether this is the missing structure you needed.\n\nStart your test drive here:\nhttps://www.vergefive.com/signup/?trial=start\n\nAlready have an account? Log in here:\nhttps://www.vergefive.com/login/\n\nInside the test drive, you can:\n- Run a Business Visibility Audit\n- See what identifiers may be weak or missing\n- Preview the order the platform uses before vendor credit, cards, or funding\n- Decide whether the full platform is the right fit before moving forward\n\nThe goal is simple: stop guessing, stop rushing applications, and see what needs to be fixed first.\n\nVerge Five team'
      };
    }
    function businessCreditGameChangedTemplate(member){
      var firstName=(member.name||'').split(/\s+/)[0]||'there';
      return {
        subject:'The business credit game changed - come take the new Verge Five for a test drive',
        message:'Hi '+firstName+',\n\nThe business credit game changed, so we rebuilt Verge Five around the framework behind The Hidden Gatekeepers of Business Approval.\n\nHere is what shifted: AI and automation now influence more of the underwriting process. The days of depending on a human reviewer to give your file the benefit of the doubt are fading. Lenders, vendors, and bureaus can run your business through automated checks in seconds. If the foundation is inconsistent, invisible, or out of order, you can get declined without ever understanding why.\n\nThe book explains the hidden checks. Verge Five turns that idea into a guided buildout: build the business profile so cleanly that the business identifiers match, verify, and appear in the right order before applications go out.\n\nThe new Verge Five is a 7-module system that walks through every piece: business identity, legal setup, banking foundation, business plan and report, approval readiness, vendor and credit paths, and funding readiness. No skipping ahead. No guesswork. No wasted applications.\n\nI would rather show you than tell you. Take a free test drive and see the new platform for yourself:\n\nhttps://www.vergefive.com/signup/?trial=start\n\nAlready have an account? Log in here:\nhttps://www.vergefive.com/login/\n\nHonestly, what do you have to lose? Even if you are not ready to jump back in today, at least you will know there is an updated, automation-aware resource waiting for you when you decide to go back down this road. Most of what is out there is still teaching the old way. Verge Five is not.\n\nLooking forward to having you back inside.\n\nVerge Five team'
      };
    }
    function potentialAffiliateFullAccessTemplate(member){
      var firstName=(member.name||'').split(/\s+/)[0]||'there';
      return {
        subject:'Your full access to the new Verge Five platform',
        message:'Hey '+firstName+',\n\nThe new Verge Five platform is live, and I am giving you full access so you can walk through the entire scope of what has been built.\n\nThis is the resource we are using going forward, and the one I want you using when you are talking to people about building business credit the right way. It has been rebuilt from the ground up around how AI and automated underwriting actually work today, so the people you send here are not getting the old guru playbook that gets businesses declined. They are getting a real, step-by-step buildout that gets approved by the algorithm.\n\nTake the time to test drive it. Click through every module, run the readiness checks, and look at the tools. Get familiar with the full flow so you can speak to it confidently when you are putting it in front of your audience.\n\nAny constructive criticism is welcome. If something feels off, unclear, or could be sharper, tell me. This platform is going to keep evolving, and your feedback shapes where it goes next.\n\nGoing forward, this is the platform to point people to. It is how business credit gets built correctly in 2026 - not the wrong way the internet is still teaching.\n\nLog in here:\nhttps://www.vergefive.com/login/\n\nVerge Five team'
      };
    }    function applyAdminEmailTemplate(form,member,template){
      if(!form)return;
      if(template==='custom'){
        if(form.elements.subject)form.elements.subject.value='';
        if(form.elements.message)form.elements.message.value='';
        return;
      }
      var data=template==='test-drive-welcome'?testDriveWelcomeTemplate(member):template==='stalled-business-credit'?stalledBusinessCreditTemplate(member):template==='business-credit-game-changed'?businessCreditGameChangedTemplate(member):template==='potential-affiliate-full-access'?potentialAffiliateFullAccessTemplate(member):null;
      if(!data)return;
      if(form.elements.subject)form.elements.subject.value=data.subject;
      if(form.elements.message)form.elements.message.value=data.message;
    }
    function envStatusItem(label,ready,detail){
      var status=ready?'ready':'wait';
      var text=ready?'Ready':'Needs setup';
      return '<article class="admin-env-item"><div><strong>'+escapeHtml(label)+'</strong><small>'+escapeHtml(detail||'')+'</small></div><span class="match-status '+status+'">'+text+'</span></article>';
    }
    function loadEnvironmentStatus(){
      if(!envList)return;
      fetch('/api/config').then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Unable to load environment status');return data})}).then(function(data){
        if(!data.emailProviderConfigured){
          adminMessage('Email is not configured in this Cloudflare environment. Use the live admin at https://www.vergefive.com/admin/ or add Resend secrets to this preview environment.',true);
        }
        var items=[
          envStatusItem('Turnstile',!!data.turnstileConfigured,'Bot protection for signup/login'),
          envStatusItem('Email provider',!!data.emailProviderConfigured,'Resend API key and sender address'),
          envStatusItem('Email verification',!!data.emailVerificationRequired,'Required verification policy'),
          envStatusItem('Password reset debug',!data.passwordResetDebugLinks,'Debug links should stay off outside private QA'),
          envStatusItem('Stripe secret',!!data.stripeSecretConfigured,'Checkout and billing portal server key'),
          envStatusItem('Monthly Stripe price',!!data.stripeMonthlyConfigured,'Monthly checkout price'),
          envStatusItem('Annual Stripe price',!!data.stripeAnnualConfigured,'Annual checkout price'),
          envStatusItem('Stripe webhook',!!data.stripeWebhookConfigured,'Payment lifecycle events')
        ];
        envList.innerHTML=items.join('');
      }).catch(function(err){envList.innerHTML='<p class="legal">'+escapeHtml(err.message)+'</p>'});
    }
    function addAdminToolbar(){
      if(!search||document.querySelector('[data-admin-export]'))return;
      var wrap=search.closest('.vendor-library-tools')||search.parentElement;
      if(!wrap)return;
      var exportLink=document.createElement('a');
      exportLink.className='btn secondary';
      exportLink.href='/api/admin/members?format=csv';
      exportLink.setAttribute('data-admin-export','');
      exportLink.textContent='Export members CSV';
      wrap.appendChild(exportLink);
    }
    addAdminToolbar();
    function addMemberCreator(){
      if(document.querySelector('[data-admin-create-member]'))return;
      var workspace=document.querySelector('.admin-workspace');
      if(!workspace)return;
      var section=document.createElement('section');
      section.className='content-block admin-create-member-panel';
      section.setAttribute('data-admin-create-member','');
      section.innerHTML='<div class="block-head"><div><p class="kicker">Create access</p><h2>Add a member manually</h2><p>Create a login, assign access, and optionally send a setup email with a password link.</p></div></div><form class="admin-create-member-form"><label>First name<input class="input" name="firstName" placeholder="First name"></label><label>Last name<input class="input" name="lastName" placeholder="Last name"></label><label>Email<input class="input" name="email" type="email" required placeholder="name@example.com"></label><label>Phone<input class="input" name="phone" placeholder="Optional"></label><label>Access type<select class="input" name="accessType"><option value="test_drive">Test drive</option><option value="paid_member">Paid member</option><option value="grandfathered">Grandfathered member</option><option value="potential_affiliate">Potential affiliate - full access</option><option value="internal_admin">Internal/admin label</option></select></label><label class="admin-checkbox"><input type="checkbox" name="sendSetupEmail" checked> Send setup email</label><button class="btn" type="submit">Create member</button></form><div class="admin-reset-output hide" data-admin-create-output></div>';
      workspace.parentNode.insertBefore(section,workspace);
      var form=section.querySelector('form');
      var output=section.querySelector('[data-admin-create-output]');
      form.addEventListener('submit',function(e){
        e.preventDefault();
        var payload={action:'create-member',firstName:(form.elements.firstName||{}).value||'',lastName:(form.elements.lastName||{}).value||'',email:(form.elements.email||{}).value||'',phone:(form.elements.phone||{}).value||'',accessType:(form.elements.accessType||{}).value||'test_drive',sendSetupEmail:!!(form.elements.sendSetupEmail&&form.elements.sendSetupEmail.checked)};
        adminMessage('Creating member...');
        if(output){output.classList.remove('hide');output.textContent='Creating member...'}
        postAdminAction(payload).then(function(data){
          adminMessage('Member created.');
          if(output){output.innerHTML='<strong>Member created</strong><input class="input" readonly value="'+escapeHtml(data.resetUrl||'')+'"><small>'+(data.setupEmailSent?'Setup email sent.':'Setup email was not sent. Use this setup link manually.')+'</small>'}
          form.reset();
          if(form.elements.sendSetupEmail)form.elements.sendSetupEmail.checked=true;
          loadMembers().then(function(){if(data.memberId)loadMemberDetail(data.memberId)});
        }).catch(function(err){adminMessage(err.message,true);if(output){output.innerHTML='<strong>Unable to create member</strong><small>'+escapeHtml(err.message)+'</small>'}});
      });
    }
    addMemberCreator();
    function addLegacyCampaignPanel(){
      if(document.querySelector('[data-legacy-campaign-panel]'))return;
      var workspace=document.querySelector('.admin-workspace');
      var adminShell=document.querySelector('.admin-shell');
      if(!workspace||!adminShell)return;
      var section=document.createElement('section');
      section.className='content-block legacy-campaign-panel';
      section.setAttribute('data-legacy-campaign-panel','');
      section.innerHTML='<div class="block-head"><div><p class="kicker">Legacy client campaigns</p><h2>Import previous-platform clients without mixing them into members.</h2><p>These contacts stay separate as campaign leads until they click the tracked link and register for the Verge Five test drive.</p></div><button class="btn secondary" type="button" data-legacy-refresh>Refresh</button></div><div class="legacy-campaign-metrics" data-legacy-metrics><article><strong>0</strong><span>Imported</span></article><article><strong>0</strong><span>Sent</span></article><article><strong>0</strong><span>Clicked</span></article><article><strong>0</strong><span>Registered</span></article></div><form class="legacy-campaign-form" data-legacy-campaign-form><div class="scan-two"><label>Campaign name<input class="input" name="name" placeholder="Legacy Verge Five clients"></label><label>Email subject<input class="input" name="subject" placeholder="Is [Phone Number] still attached to your business?"></label></div><label>Preview text<input class="input" name="previewText" placeholder="You did not fail the process before - you just could not see it."></label><label>Email template<textarea class="input" name="message" rows="12" placeholder="Use [First Name], [Phone Number], and [Test Drive Link]"></textarea></label><div class="legacy-manual-entry"><div><p class="kicker">Add one user</p><h3>Input a legacy lead manually.</h3><p class="legal">Use this when you only need to add one client without uploading a spreadsheet.</p></div><div class="legacy-manual-grid"><label>First name<input class="input" name="manualFirstName" placeholder="First name"></label><label>Last name<input class="input" name="manualLastName" placeholder="Last name"></label><label>Email<input class="input" name="manualEmail" type="email" placeholder="name@example.com"></label><label>Phone<input class="input" name="manualPhone" placeholder="Business phone"></label></div><button class="btn secondary" type="button" data-legacy-add-user>Add user to campaign</button></div><label>Import Excel or CSV file<input class="input" type="file" accept=".csv,.txt,.xlsx,.xls" data-legacy-file-import><small class="legal">Upload a spreadsheet with email, first name, last name, and phone columns. Excel files are read in the browser before import.</small></label><label>Import contacts<textarea class="input" name="contacts" rows="5" placeholder="First name, Last name, email@example.com, phone number&#10;First name, email@example.com"></textarea><small class="legal">Paste one contact per line. Accepted formats: email, first,email, first,last,email, or first,last,email,phone.</small></label><div class="proof-actions"><button class="btn" type="submit" data-legacy-save-import>Save and import contacts</button><button class="btn secondary" type="button" data-legacy-send-selected>Send selected</button><button class="btn secondary" type="button" data-legacy-send-next>Send next 100 unsent</button></div><p class="auth-message" data-legacy-message></p></form><div class="vendor-library-tools"><input class="input" data-legacy-search placeholder="Search legacy leads"></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th><input type="checkbox" data-legacy-check-all></th><th>Contact</th><th>Status</th><th>Sent</th><th>Clicked</th><th>Registered</th><th>Link</th><th>Action</th></tr></thead><tbody data-legacy-leads><tr><td colspan="8">Loading legacy campaign leads...</td></tr></tbody></table></div>';
      adminShell.appendChild(section);
      var form=section.querySelector('[data-legacy-campaign-form]');
      var msg=section.querySelector('[data-legacy-message]');
      var metrics=section.querySelector('[data-legacy-metrics]');
      var tbody=section.querySelector('[data-legacy-leads]');
      var searchInput=section.querySelector('[data-legacy-search]');
      var checkAll=section.querySelector('[data-legacy-check-all]');
      var fileInput=section.querySelector('[data-legacy-file-import]');
      var campaign=null;
      var leads=[];
      function legacyMessage(text,danger){if(msg){msg.textContent=text||'';msg.classList.toggle('danger',!!danger)}}
      function postLegacy(payload){
        return fetch('/api/admin/legacy-campaigns',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload||{})})
          .then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Unable to update legacy campaign');return data})});
      }
      function leadFullName(lead){return [lead.first_name,lead.last_name].filter(Boolean).join(' ')||'Legacy contact'}
      function leadStatusClass(status){status=String(status||'').toLowerCase();return status==='registered'?'ready':status==='clicked'?'almost':status==='sent'?'wait':'wait'}
      function selectedLeadIds(){return [].slice.call(section.querySelectorAll('[data-legacy-lead-check]:checked')).map(function(input){return input.value});}
      function csvEscape(value){
        value=String(value||'').trim();
        return /[",\n]/.test(value)?'"'+value.replace(/"/g,'""')+'"':value;
      }
      function splitLegacyCsvLine(line){
        var out=[],current='',quoted=false;
        for(var i=0;i<line.length;i+=1){
          var ch=line[i];
          if(ch==='"'&&line[i+1]==='"'){current+='"';i+=1}
          else if(ch==='"'){quoted=!quoted}
          else if(ch===','&&!quoted){out.push(current.trim());current=''}
          else current+=ch;
        }
        out.push(current.trim());
        return out;
      }
      function headerIndex(headers,patterns){
        for(var p=0;p<patterns.length;p+=1){
          for(var i=0;i<headers.length;i+=1){
            if(patterns[p].test(headers[i]))return i;
          }
        }
        return -1;
      }
      function rowsToLegacyContacts(rows){
        rows=(rows||[]).filter(function(row){return row&&row.some(function(cell){return String(cell||'').trim()})});
        if(!rows.length)return '';
        var headers=rows[0].map(function(cell){return String(cell||'').toLowerCase().trim()});
        var hasHeader=headers.some(function(cell){return /email|e-mail|first|last|phone|mobile|number/.test(cell)});
        var emailCol=hasHeader?headerIndex(headers,[/e-?mail/]): -1;
        var firstCol=hasHeader?headerIndex(headers,[/first/,/name/]): -1;
        var lastCol=hasHeader?headerIndex(headers,[/last/,/surname/]): -1;
        var phoneCol=hasHeader?headerIndex(headers,[/business.*phone/,/phone/,/mobile/,/number/]): -1;
        return rows.slice(hasHeader?1:0).map(function(row){
          row=row||[];
          var email=emailCol>-1?row[emailCol]:(row.find(function(cell){return /@/.test(String(cell||''))})||'');
          if(!email)return '';
          var emailIndex=row.indexOf(email);
          var first=firstCol>-1?row[firstCol]:(emailIndex>0?row[0]:'');
          var last=lastCol>-1?row[lastCol]:(emailIndex>2?row[1]:'');
          var phone=phoneCol>-1?row[phoneCol]:(row.find(function(cell,idx){return idx!==emailIndex&&/[0-9][0-9().\-\s]{6,}/.test(String(cell||''))})||'');
          return [first,last,email,phone].map(csvEscape).join(',');
        }).filter(Boolean).join('\n');
      }
      function parseLegacyCsv(text){return rowsToLegacyContacts(String(text||'').split(/\r?\n/).map(splitLegacyCsvLine));}
      function ensureXlsx(){
        if(window.XLSX)return Promise.resolve(window.XLSX);
        return new Promise(function(resolve,reject){
          var script=document.createElement('script');
          script.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
          script.onload=function(){resolve(window.XLSX)};
          script.onerror=function(){reject(new Error('Excel importer could not load. Save the spreadsheet as CSV and try again.'))};
          document.head.appendChild(script);
        });
      }
      function appendImportedContacts(text){
        if(!text.trim()){legacyMessage('No valid email rows found in that file.',true);return;}
        var current=form.elements.contacts.value.trim();
        form.elements.contacts.value=(current?current+'\n':'')+text;
        legacyMessage('Spreadsheet rows loaded. Review them, then click Save and import contacts.');
      }
      function renderLegacy(){
        var q=(searchInput&&searchInput.value||'').toLowerCase();
        var filtered=leads.filter(function(lead){return !q||(lead.email+' '+leadFullName(lead)+' '+(lead.phone||'')+' '+(lead.status||'')).toLowerCase().indexOf(q)>-1});
        if(metrics){
          var total=leads.length;
          var sent=leads.filter(function(lead){return !!lead.email_sent_at}).length;
          var clicked=leads.filter(function(lead){return !!lead.clicked_at}).length;
          var registered=leads.filter(function(lead){return !!lead.registered_at}).length;
          metrics.innerHTML='<article><strong>'+total+'</strong><span>Imported</span></article><article><strong>'+sent+'</strong><span>Sent</span></article><article><strong>'+clicked+'</strong><span>Clicked</span></article><article><strong>'+registered+'</strong><span>Registered</span></article>';
        }
        if(!filtered.length){tbody.innerHTML='<tr><td colspan="8">No legacy leads found yet.</td></tr>';return;}
        tbody.innerHTML=filtered.map(function(lead){
          var link=location.origin+'/api/legacy/track?token='+encodeURIComponent(lead.token||'');
          var checkedDisabled=lead.registered_at||lead.do_not_contact?'disabled':'';
          return '<tr><td><input type="checkbox" data-legacy-lead-check value="'+escapeHtml(lead.id)+'" '+checkedDisabled+'></td><td><strong>'+escapeHtml(leadFullName(lead))+'</strong><small>'+escapeHtml(lead.email||'')+'</small><small>'+escapeHtml(lead.phone||'')+'</small><small>'+escapeHtml(lead.source||'')+'</small></td><td><span class="match-status '+leadStatusClass(lead.status)+'">'+escapeHtml(lead.status||'imported')+'</span>'+(lead.do_not_contact?'<small>Do not contact</small>':'')+'</td><td>'+fmtDateTime(lead.email_sent_at)+'<small>'+Number(lead.email_send_count||0)+' sends</small><small>'+escapeHtml(lead.email_last_provider_id||lead.email_last_result||'')+'</small></td><td>'+fmtDateTime(lead.clicked_at)+'<small>'+Number(lead.click_count||0)+' clicks</small></td><td>'+fmtDateTime(lead.registered_at)+'<small>'+escapeHtml(lead.member_email||lead.user_id||'')+'</small></td><td><input class="input legacy-link-input" readonly value="'+escapeHtml(link)+'"></td><td><button class="btn secondary small" type="button" data-copy-legacy-link="'+escapeHtml(link)+'">Copy link</button><button class="btn ghost small" type="button" data-legacy-dnc="'+escapeHtml(lead.id)+'">Do not contact</button><button class="btn danger small" type="button" data-legacy-delete="'+escapeHtml(lead.id)+'">Delete</button></td></tr>';
        }).join('');
      }
      function loadLegacy(){
        return fetch('/api/admin/legacy-campaigns').then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Unable to load legacy campaigns');return data})}).then(function(data){
          campaign=(data.campaigns||[]).find(function(item){return item.id===data.activeCampaignId})||(data.campaigns||[])[0]||null;
          leads=data.leads||[];
          if(campaign&&form){
            form.elements.name.value=campaign.name||'';
            form.elements.subject.value=campaign.subject||'';
            form.elements.previewText.value=campaign.preview_text||'';
            form.elements.message.value=campaign.message||'';
          }
          renderLegacy();
        }).catch(function(err){legacyMessage(err.message,true);if(tbody)tbody.innerHTML='<tr><td colspan="8">'+escapeHtml(err.message)+'</td></tr>'});
      }
      form.addEventListener('submit',function(e){
        e.preventDefault();
        legacyMessage('Saving campaign and importing contacts...');
        var campaignId=campaign&&campaign.id||'';
        postLegacy({action:'save-campaign',campaignId:campaignId,name:form.elements.name.value,subject:form.elements.subject.value,previewText:form.elements.previewText.value,message:form.elements.message.value}).then(function(saved){
          campaignId=saved.campaignId;
          var contacts=form.elements.contacts.value||'';
          if(!contacts.trim())return {ok:true,imported:0,skipped:0,campaignId:campaignId};
          return postLegacy({action:'import-leads',campaignId:campaignId,contacts:contacts,source:'Previous Verge Five platform'});
        }).then(function(data){
          legacyMessage('Campaign saved. Imported '+Number(data.imported||0)+' contact(s), skipped '+Number(data.skipped||0)+'.');
          form.elements.contacts.value='';
          loadLegacy();
        }).catch(function(err){legacyMessage(err.message,true)});
      });
      section.querySelector('[data-legacy-add-user]').addEventListener('click',function(){
        var first=(form.elements.manualFirstName&&form.elements.manualFirstName.value||'').trim();
        var last=(form.elements.manualLastName&&form.elements.manualLastName.value||'').trim();
        var email=(form.elements.manualEmail&&form.elements.manualEmail.value||'').trim().toLowerCase();
        var phone=(form.elements.manualPhone&&form.elements.manualPhone.value||'').trim();
        if(!email||email.indexOf('@')<1){legacyMessage('Enter an email address before adding the user.',true);return;}
        legacyMessage('Adding user to legacy campaign...');
        var row=[first,last,email,phone].map(csvEscape).join(',');
        var campaignId=campaign&&campaign.id||'';
        postLegacy({action:'save-campaign',campaignId:campaignId,name:form.elements.name.value,subject:form.elements.subject.value,previewText:form.elements.previewText.value,message:form.elements.message.value}).then(function(saved){
          campaignId=saved.campaignId;
          return postLegacy({action:'import-leads',campaignId:campaignId,contacts:row,source:'Manual admin entry'});
        }).then(function(data){
          legacyMessage('User added. Imported '+Number(data.imported||0)+', skipped '+Number(data.skipped||0)+'.');
          ['manualFirstName','manualLastName','manualEmail','manualPhone'].forEach(function(name){if(form.elements[name])form.elements[name].value=''});
          loadLegacy();
        }).catch(function(err){legacyMessage(err.message,true)});
      });
      section.querySelector('[data-legacy-send-selected]').addEventListener('click',function(){
        if(!campaign)return;
        var ids=selectedLeadIds();
        legacyMessage('Sending selected legacy emails...');
        postLegacy({action:'send-campaign',campaignId:campaign.id,mode:'selected',leadIds:ids}).then(function(data){
          legacyMessage('Sent '+Number(data.sent||0)+' email(s). Failed '+Number(data.failed||0)+'.'+((data.sentIds||[]).length?' Resend ID: '+data.sentIds.join(' | '):'')+((data.errors||[]).length?' '+data.errors.join(' | '):''),!!data.failed);
          loadLegacy();
        }).catch(function(err){legacyMessage(err.message,true)});
      });
      section.querySelector('[data-legacy-send-next]').addEventListener('click',function(){
        if(!campaign)return;
        legacyMessage('Sending next 100 unsent legacy emails...');
        postLegacy({action:'send-campaign',campaignId:campaign.id,mode:'next-unsent'}).then(function(data){
          legacyMessage('Sent '+Number(data.sent||0)+' email(s). Failed '+Number(data.failed||0)+'.'+((data.sentIds||[]).length?' Resend ID: '+data.sentIds.join(' | '):'')+((data.errors||[]).length?' '+data.errors.join(' | '):''),!!data.failed);
          loadLegacy();
        }).catch(function(err){legacyMessage(err.message,true)});
      });
      section.querySelector('[data-legacy-refresh]').addEventListener('click',function(){legacyMessage('Refreshing...');loadLegacy().then(function(){legacyMessage('Legacy campaign refreshed.')})});
      if(searchInput)searchInput.addEventListener('input',renderLegacy);
      if(checkAll)checkAll.addEventListener('change',function(){section.querySelectorAll('[data-legacy-lead-check]:not(:disabled)').forEach(function(input){input.checked=checkAll.checked})});
      if(fileInput)fileInput.addEventListener('change',function(){
        var file=fileInput.files&&fileInput.files[0];
        if(!file)return;
        legacyMessage('Reading spreadsheet...');
        var isExcel=/\.(xlsx|xls)$/i.test(file.name);
        var reader=new FileReader();
        reader.onerror=function(){legacyMessage('Unable to read that file.',true)};
        if(isExcel){
          reader.onload=function(){
            ensureXlsx().then(function(XLSX){
              var workbook=XLSX.read(new Uint8Array(reader.result),{type:'array'});
              var sheet=workbook.Sheets[workbook.SheetNames[0]];
              appendImportedContacts(rowsToLegacyContacts(XLSX.utils.sheet_to_json(sheet,{header:1,defval:''})));
            }).catch(function(err){legacyMessage(err.message,true)});
          };
          reader.readAsArrayBuffer(file);
        }else{
          reader.onload=function(){appendImportedContacts(parseLegacyCsv(reader.result||''))};
          reader.readAsText(file);
        }
      });
      tbody.addEventListener('click',function(e){
        var copy=e.target.closest('[data-copy-legacy-link]');
        if(copy){var link=copy.getAttribute('data-copy-legacy-link');navigator.clipboard&&navigator.clipboard.writeText(link);legacyMessage('Tracking link copied.');return;}
        var dnc=e.target.closest('[data-legacy-dnc]');
        if(dnc){postLegacy({action:'do-not-contact',leadId:dnc.getAttribute('data-legacy-dnc')}).then(loadLegacy).catch(function(err){legacyMessage(err.message,true)});return;}
        var del=e.target.closest('[data-legacy-delete]');
        if(del&&confirm('Delete this legacy lead? Registered leads are not deleted here.')){postLegacy({action:'delete-lead',leadId:del.getAttribute('data-legacy-delete')}).then(loadLegacy).catch(function(err){legacyMessage(err.message,true)});}
      });
      loadLegacy();
    }
    addLegacyCampaignPanel();
    loadEnvironmentStatus();
    function render(){
      var q=(search&&search.value||'').toLowerCase();
      var filtered=members.filter(function(m){return !q||(m.email+' '+(m.name||'')).toLowerCase().indexOf(q)>-1});
      if(!filtered.length){tbody.innerHTML='<tr><td colspan="7">No members found.</td></tr>';return}
      tbody.innerHTML=filtered.map(function(m){
        var active=/active|trial|trialing|paid|lifetime/i.test(m.membership_status);
        var lockStatus=(m.readiness_lock_status||'clear').toLowerCase();
        var lockActive=lockStatus&&lockStatus!=='clear'&&!m.readiness_admin_unlocked_at;
        return '<tr><td><strong>'+escapeHtml(m.name||'Member')+'</strong><small>'+escapeHtml(m.id)+'</small></td><td><span class="match-status '+(active?'ready':'wait')+'">'+escapeHtml(m.membership_status)+'</span><small>'+escapeHtml(m.plan||'')+'</small>'+(lockActive?'<span class="match-status wait">Readiness '+escapeHtml(lockStatus)+'</span>':'')+'</td><td>'+escapeHtml(m.email)+'<small>'+(m.email_verified_at?'Verified':'Not verified')+'</small></td><td>'+Number(m.progress_pages||0)+' pages<small>'+Number(m.signal_groups||0)+' signal groups, '+Number(m.reports||0)+' reports</small>'+(lockActive?'<small>Lock reason: '+escapeHtml(m.readiness_lock_reason||'review')+'</small>':'')+'</td><td>'+fmtDate(m.created_at)+'</td><td>'+fmtDate(m.last_login_at)+'</td><td><button class="btn secondary small" type="button" data-admin-member-id="'+escapeHtml(m.id)+'">View</button></td></tr>';
      }).join('');
    }
    function detailList(items, emptyText, renderItem){
      if(!items||!items.length)return '<p class="legal">'+escapeHtml(emptyText)+'</p>';
      return '<div class="admin-detail-list">'+items.map(renderItem).join('')+'</div>';
    }
    function renderMemberDetail(data){
      var m=data.member||{};
      currentMemberId=m.id||'';
      var p=data.profile||{};
      var profileBits=['business_name','entity_type','formation_state','phone','address','website','email'].map(function(key){
        return p[key]?'<span><strong>'+escapeHtml(key.replace(/_/g,' '))+'</strong>'+escapeHtml(p[key])+'</span>':'';
      }).filter(Boolean).join('');
      var reports=detailList(data.reports,'No saved reports yet.',function(report){
        var summary=report.summary||{};
        var details=[summary.stage, summary.score!=null?'Score '+summary.score:'', summary.completed!=null?summary.completed+' completed':''].filter(Boolean).join(' - ');
        return '<article><strong>'+escapeHtml(report.reportType||'report')+'</strong><span>'+escapeHtml(report.readinessStage||details||'Readiness snapshot')+'</span><small>'+escapeHtml(report.createdAt||'')+'</small></article>';
      });
      var progress=detailList(data.progress,'No saved lesson progress yet.',function(item){
        var count=Array.isArray(item.completedIndexes)?item.completedIndexes.length:0;
        return '<article><strong>'+escapeHtml(item.pagePath||'Page')+'</strong><span>'+count+' checklist items saved</span><small>'+escapeHtml(item.lastOpenedAt||'')+'</small></article>';
      });
      var signals=detailList(data.signals,'No saved readiness signals yet.',function(item){
        var keys=Array.isArray(item.selectedKeys)?item.selectedKeys.join(', '):'';
        return '<article><strong>'+escapeHtml(item.signalType||'Signal group')+'</strong><span>'+escapeHtml(keys||'No selected keys')+'</span><small>'+escapeHtml(item.updatedAt||'')+'</small></article>';
      });
      var notes=detailList(data.notes,'No admin notes yet.',function(note){
        return '<article><strong>'+escapeHtml(note.adminEmail||'Admin')+'</strong><span>'+escapeHtml(note.note||'')+'</span><small>'+escapeHtml(note.createdAt||'')+'</small></article>';
      });
      var activity=detailList(data.activity,'No admin activity yet.',function(item){
        return '<article><strong>'+escapeHtml(item.action||'Activity')+'</strong><span>'+escapeHtml(item.adminEmail||'Admin')+'</span><small>'+escapeHtml(item.createdAt||'')+'</small></article>';
      });
      var lock=data.readinessLock||{};
      var lockActive=lock.status&&lock.status!=='clear'&&!lock.admin_unlocked_at;
      var readinessStatus='<div class="readiness-admin-card '+(lockActive?'locked':'clear')+'"><div><p class="kicker">Readiness lock</p><h3>'+(lockActive?'Advanced sections paused':'Advanced sections clear')+'</h3><p>'+escapeHtml(lock.message||lock.reason||'No active readiness lock for this member.')+'</p><small>Status: '+escapeHtml(lock.status||'clear')+(lock.unlock_after?' | Unlock after: '+escapeHtml(lock.unlock_after):'')+(lock.admin_unlocked_at?' | Admin unlocked: '+escapeHtml(lock.admin_unlocked_at):'')+'</small></div><div class="proof-actions"><button class="btn secondary" type="button" data-admin-action="unlock-readiness">Unlock advanced sections</button><button class="btn ghost" type="button" data-admin-action="lock-readiness">Require review</button></div></div>';
      var accessEvents=detailList(data.accessEvents,'No recent page access recorded yet.',function(item){
        return '<article><strong>'+escapeHtml(item.pagePath||'Page')+'</strong><span>'+escapeHtml(item.eventType||'page view')+'</span><small>'+escapeHtml(item.createdAt||'')+'</small></article>';
      });
      var stripeLinks='';
      if(data.billingLinks&&data.billingLinks.stripeCustomer)stripeLinks+='<a class="btn secondary small" target="_blank" rel="noopener" href="'+escapeHtml(data.billingLinks.stripeCustomer)+'">Open Stripe customer</a>';
      if(data.billingLinks&&data.billingLinks.stripeSubscription)stripeLinks+='<a class="btn secondary small" target="_blank" rel="noopener" href="'+escapeHtml(data.billingLinks.stripeSubscription)+'">Open Stripe subscription</a>';
      detailBody.innerHTML='<div class="admin-detail-head"><div><strong>'+escapeHtml(m.name||'Member')+'</strong><span>'+escapeHtml(m.email||'')+'</span><small>'+escapeHtml(m.id||'')+'</small></div><span class="match-status ready">'+escapeHtml(m.membership_status||'none')+'</span></div>'+
        '<div class="admin-control-panel"><div><label>Status<select class="input" data-admin-status><option>pending</option><option>trial</option><option>active</option><option>lifetime</option><option>paused</option><option>canceled</option></select></label><label>Plan<input class="input" data-admin-plan placeholder="monthly, annual, lifetime" value="'+escapeHtml(m.plan||'')+'"></label><label>Period end<input class="input" data-admin-period placeholder="YYYY-MM-DD or ISO date" value="'+escapeHtml(m.current_period_end||'')+'"></label><button class="btn" type="button" data-admin-action="update-status">Save status</button></div><div><label>Extend trial days<input class="input" data-admin-trial-days type="number" min="1" max="365" value="30"></label><button class="btn secondary" type="button" data-admin-action="extend-trial">Extend trial</button><button class="btn secondary" type="button" data-admin-action="verify-email">Mark email verified</button><button class="btn secondary" type="button" data-admin-action="reset-password">Send reset email</button><button class="btn ghost" type="button" data-admin-action="clear-progress">Clear progress</button><button class="btn danger" type="button" data-admin-action="delete-member">Delete member</button></div></div>'+
        '<div class="admin-reset-output hide" data-admin-reset-output></div>'+
        '<div class="admin-detail-section"><h3>Readiness safeguard</h3>'+readinessStatus+'<h4>Recent page movement</h4>'+accessEvents+'</div>'+
        '<div class="admin-detail-section"><h3>Custom email</h3><form data-admin-email-form class="admin-email-form"><p class="legal">Write your own email below, or load a preset and edit it before sending to '+escapeHtml(m.email||'this member')+'.</p><label>Template<select class="input" data-admin-email-template><option value="custom">Custom blank email</option><option value="test-drive-welcome">Welcome / test drive invite</option><option value="stalled-business-credit">Stalled business credit invite</option><option value="business-credit-game-changed">Business credit game changed</option><option value="potential-affiliate-full-access">Potential affiliate full access</option></select></label><label>Subject<input class="input" name="subject" placeholder="Write your subject line" value=""></label><label>Email body<textarea class="input" name="message" rows="12" placeholder="Write your custom email here. You can also load a template below and edit it before sending."></textarea></label><p class="legal" data-admin-email-edit-note>Custom starts blank. Presets only fill this draft and can be edited before sending. The affiliate access template labels the member as a potential affiliate and grants full platform access when sent.</p><div class="proof-actions"><button class="btn" type="submit">Send custom email</button><button class="btn secondary" type="button" data-admin-load-template="custom">Clear for custom email</button><button class="btn secondary" type="button" data-admin-load-template="test-drive-welcome">Load welcome template</button><button class="btn secondary" type="button" data-admin-load-template="stalled-business-credit">Load test drive invite</button><button class="btn secondary" type="button" data-admin-load-template="business-credit-game-changed">Load game changed email</button><button class="btn secondary" type="button" data-admin-load-template="potential-affiliate-full-access">Load affiliate access email</button><a class="btn secondary" href="mailto:'+encodeURIComponent(m.email||'')+'">Open email app</a></div><p class="legal" data-admin-email-status></p></form></div>'+
        '<div class="admin-detail-section"><h3>Billing</h3><p class="legal">Customer: '+escapeHtml(m.stripe_customer_id||'Not connected')+'<br>Subscription: '+escapeHtml(m.stripe_subscription_id||'Not connected')+'</p><div class="proof-actions">'+(stripeLinks||'<span class="legal">No Stripe links available for this member.</span>')+'</div></div>'+
        '<div class="admin-detail-section"><h3>Admin notes</h3><form data-admin-note-form class="admin-note-form"><textarea class="input" name="note" rows="3" placeholder="Add an internal note for this member"></textarea><button class="btn" type="submit">Add note</button></form>'+notes+'</div>'+
        '<div class="admin-detail-section"><h3>Business profile</h3><div class="admin-profile-bits">'+(profileBits||'<p class="legal">No business profile saved yet.</p>')+'</div></div><div class="admin-detail-section"><h3>Resume</h3><p class="legal">'+escapeHtml(data.resume&&data.resume.page_title?data.resume.page_title:'No resume location saved yet.')+'</p></div><div class="admin-detail-section"><h3>Recent reports</h3>'+reports+'</div><div class="admin-detail-section"><h3>Lesson progress</h3>'+progress+'</div><div class="admin-detail-section"><h3>Readiness signals</h3>'+signals+'</div><div class="admin-detail-section"><h3>Admin activity</h3>'+activity+'</div>';
      var statusSelect=detailBody.querySelector('[data-admin-status]');
      if(statusSelect)statusSelect.value=m.membership_status||'pending';
      var emailForm=detailBody.querySelector('[data-admin-email-form]');
      var templateSelect=detailBody.querySelector('[data-admin-email-template]');
      if(templateSelect&&emailForm){
        templateSelect.addEventListener('change',function(){applyAdminEmailTemplate(emailForm,m,templateSelect.value)});
      }
    }
    function focusMemberDetail(){
      var panel=detailBody&&detailBody.closest('.admin-member-detail');
      if(panel&&panel.scrollIntoView)panel.scrollIntoView({behavior:'smooth',block:'start'});
    }
    function loadMemberDetail(id){
      if(!detailBody||!id)return;
      currentMemberId=id;
      document.querySelectorAll('[data-admin-member-id]').forEach(function(btn){
        var active=btn.getAttribute('data-admin-member-id')===id;
        btn.classList.toggle('active',active);
        btn.textContent=active?'Viewing':'View';
      });
      detailBody.innerHTML='<div class="admin-loading-detail"><strong>Loading member profile...</strong><span>Opening saved profile, progress, notes, billing, and activity.</span></div>';
      focusMemberDetail();
      fetch('/api/admin/member?id='+encodeURIComponent(id)).then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Unable to load member detail');return data})}).then(function(data){
        renderMemberDetail(data);
        focusMemberDetail();
      }).catch(function(err){
        detailBody.innerHTML='<div class="admin-loading-detail error"><strong>Unable to open member.</strong><span>'+escapeHtml(err.message)+'</span></div>';
        focusMemberDetail();
      });
    }
    if(detailBody)detailBody.addEventListener('click',function(e){
      var loadTemplate=e.target.closest('[data-admin-load-template]');
      if(loadTemplate&&currentMemberId){
        var form=loadTemplate.closest('[data-admin-email-form]');
        var selected=members.find(function(item){return item.id===currentMemberId})||{};
        applyAdminEmailTemplate(form,selected,loadTemplate.getAttribute('data-admin-load-template'));
        var select=form&&form.querySelector('[data-admin-email-template]');
        if(select)select.value=loadTemplate.getAttribute('data-admin-load-template');
        return;
      }
      var btn=e.target.closest('[data-admin-action]');
      if(!btn||!currentMemberId)return;
      var action=btn.getAttribute('data-admin-action');
      if(action==='clear-progress'&&!confirm('Clear this member progress, signals, and resume location?'))return;
      if(action==='delete-member'){var typed=prompt('This permanently deletes the member, login, progress, reports, notes, and access. Type DELETE to confirm.');if(typed!=='DELETE')return;}
      adminMessage('Updating member...');
      var payload={action:action,memberId:currentMemberId};
      if(action==='update-status'){
        payload.status=(detailBody.querySelector('[data-admin-status]')||{}).value||'';
        payload.plan=(detailBody.querySelector('[data-admin-plan]')||{}).value||'';
        payload.currentPeriodEnd=(detailBody.querySelector('[data-admin-period]')||{}).value||'';
      }
      if(action==='extend-trial')payload.days=(detailBody.querySelector('[data-admin-trial-days]')||{}).value||30;
      if(action==='lock-readiness'){
        var lockMessage=prompt('Message to show internally for this readiness review:', 'Advanced sections require admin review before they reopen.');
        if(lockMessage===null)return;
        payload.message=lockMessage;
      }
      if(action==='delete-member')payload.confirm='DELETE';
      postAdminAction(payload).then(function(data){
        adminMessage(action==='delete-member'?'Member deleted.':'Member updated.');
        if(action==='delete-member'){currentMemberId='';detailBody.innerHTML='<p class="legal">Member deleted. Choose another member.</p>';loadMembers();return;}
        var out=detailBody.querySelector('[data-admin-reset-output]');
        if(data.resetUrl&&out){out.classList.remove('hide');out.innerHTML='<strong>Password reset '+(data.emailSent?'email sent':'link created')+'</strong><input class="input" readonly value="'+escapeHtml(data.resetUrl)+'"><small>'+(data.emailSent?'The reset email was sent. ':'Email was not sent: '+escapeHtml(data.emailReason||'provider unavailable')+'. ')+'Link expires in '+Number(data.expiresInMinutes||60)+' minutes.</small>'}
        loadMembers();
        loadMemberDetail(currentMemberId);
      }).catch(function(err){adminMessage(err.message,true)});
    });
    if(detailBody)detailBody.addEventListener('submit',function(e){
      var emailForm=e.target.closest('[data-admin-email-form]');
      if(emailForm&&currentMemberId){
        e.preventDefault();
        var status=emailForm.querySelector('[data-admin-email-status]');
        if(status)status.textContent='Sending email...';
        postAdminAction({action:'send-email',memberId:currentMemberId,template:((emailForm.querySelector('[data-admin-email-template]')||{}).value||'custom'),subject:(emailForm.elements.subject||{}).value||'',message:(emailForm.elements.message||{}).value||''})
          .then(function(){if(status)status.textContent='Email sent.';adminMessage('Email sent.');loadMemberDetail(currentMemberId)})
          .catch(function(err){if(status)status.textContent=err.message;adminMessage(err.message,true)});
        return;
      }
      var form=e.target.closest('[data-admin-note-form]');
      if(!form||!currentMemberId)return;
      e.preventDefault();
      var note=(form.elements.note||{}).value||'';
      adminMessage('Adding note...');
      postAdminAction({action:'add-note',memberId:currentMemberId,note:note}).then(function(){adminMessage('Note added.');loadMemberDetail(currentMemberId)}).catch(function(err){adminMessage(err.message,true)});
    });
    if(tbody)tbody.addEventListener('click',function(e){
      var btn=e.target.closest('[data-admin-member-id]');
      if(btn)loadMemberDetail(btn.getAttribute('data-admin-member-id'));
    });
    function loadMembers(){
      return fetch('/api/admin/members').then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Unable to load members');return data})}).then(function(data){
        members=data.members||[];
        if(totals){
          totals.innerHTML='<article><strong>'+Number(data.totals&&data.totals.total_users||0)+'</strong><span>Total users</span></article><article><strong>'+Number(data.totals&&data.totals.active_members||0)+'</strong><span>Active members</span></article><article><strong>'+Number(data.totals&&data.totals.verified_users||0)+'</strong><span>Verified emails</span></article><article><strong><a href="/api/admin/members?format=csv">CSV</a></strong><span>Export members</span></article>';
        }
        render();
      }).catch(function(err){if(tbody)tbody.innerHTML='<tr><td colspan="7">'+escapeHtml(err.message)+'</td></tr>'});
    }
    loadMembers();
    if(search)search.addEventListener('input',render);
    function loadAffiliates(){
      if(!affiliateBody||!commissionBody)return;
      fetch('/api/admin/affiliates').then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Unable to load affiliates');return data})}).then(function(data){
        var affiliates=data.affiliates||[];
        var commissions=data.commissions||[];
        if(!affiliates.length){affiliateBody.innerHTML='<tr><td colspan="5">No affiliates created yet.</td></tr>'}else{
          affiliateBody.innerHTML=affiliates.map(function(a){var link=location.origin+'/?ref='+encodeURIComponent(a.code);return '<tr><td><strong>'+escapeHtml(a.name)+'</strong><small>'+escapeHtml(a.email||a.code)+'</small></td><td><code>'+escapeHtml(link)+'</code></td><td>'+Number(a.referral_count||0)+'</td><td>'+money(a.payable_cents)+'</td><td>'+money(a.paid_cents)+'</td></tr>'}).join('');
        }
        if(!commissions.length){commissionBody.innerHTML='<tr><td colspan="7">No commission records yet.</td></tr>'}else{
          commissionBody.innerHTML=commissions.map(function(c){var status=String(c.status||'pending');var payments=Number(c.qualifying_payments_count||0)+' / '+Number(c.qualifying_payments_required||0);var action=status==='payable'?'<button class="btn secondary small" data-mark-paid="'+escapeHtml(c.id)+'">Mark paid</button>':'';return '<tr><td><strong>'+escapeHtml(c.affiliate_name)+'</strong><small>'+escapeHtml(c.affiliate_code)+'</small></td><td>'+escapeHtml(c.member_email||'')+'</td><td>'+escapeHtml(c.plan)+'</td><td><span class="match-status '+(status==='paid'?'ready':status==='payable'?'almost':'wait')+'">'+escapeHtml(status)+'</span></td><td>'+payments+'</td><td>'+money(c.amount_cents)+'</td><td>'+action+'</td></tr>'}).join('');
        }
      }).catch(function(err){affiliateBody.innerHTML='<tr><td colspan="5">'+escapeHtml(err.message)+'</td></tr>';commissionBody.innerHTML='<tr><td colspan="7">'+escapeHtml(err.message)+'</td></tr>'});
    }
    loadAffiliates();
    if(affiliateForm)affiliateForm.addEventListener('submit',function(e){
      e.preventDefault();
      var payload={action:'create'};
      Array.prototype.forEach.call(affiliateForm.elements,function(el){if(el.name)payload[el.name]=el.value});
      affiliateMsg('Creating affiliate...');
      fetch('/api/admin/affiliates',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})
        .then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Unable to create affiliate');return data})})
        .then(function(){affiliateForm.reset();affiliateMsg('Affiliate created.');loadAffiliates()})
        .catch(function(err){affiliateMsg(err.message,true)});
    });
    if(commissionBody)commissionBody.addEventListener('click',function(e){
      var btn=e.target.closest('[data-mark-paid]');
      if(!btn)return;
      affiliateMsg('Marking commission paid...');
      fetch('/api/admin/affiliates',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'mark-paid',commissionId:btn.getAttribute('data-mark-paid')})})
        .then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Unable to update commission');return data})})
        .then(function(){affiliateMsg('Commission marked paid.');loadAffiliates()})
        .catch(function(err){affiliateMsg(err.message,true)});
    });
  }
  initAdminBackend();

  function initAffiliateApplication(){
    var form=document.querySelector('[data-affiliate-application]');
    if(!form)return;
    var msg=document.querySelector('[data-affiliate-apply-message]');
    function setMsg(text,danger){if(msg){msg.textContent=text||'';msg.classList.toggle('danger',!!danger)}}
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var payload={};
      Array.prototype.forEach.call(form.elements,function(el){if(el.name)payload[el.name]=el.value});
      setMsg('Submitting application...');
      fetch('/api/affiliate/apply',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})
        .then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'Unable to submit application');return data})})
        .then(function(data){form.reset();setMsg(data.message||'Application received.')})
        .catch(function(err){setMsg(err.message,true)});
    });
  }
  initAffiliateApplication();

  function initPublicVisibilityScan(){
    var form=document.querySelector('[data-public-scan]');
    if(!form)return;
    var isMemberStartScan=form.hasAttribute('data-member-start-scan');
    if(isMemberStartScan){var existingProfile=loadProfile();['businessName','formationState','phone','website','address','email','industry'].forEach(function(key){var input=form.querySelector('[data-profile-field=\"'+key+'\"]');if(input&&existingProfile[key])input.value=existingProfile[key];});}
    var result=form.querySelector('[data-scan-result]');
    function checked(name){var el=form.elements[name];return !!(el&&el.checked)}
    function value(name){var el=form.elements[name];return el?String(el.value||'').trim():''}
    function fieldLabel(name){return form.querySelector('[data-required-field=\"'+name+'\"]')}
    function clearMissingMarks(){form.querySelectorAll('.identifier-missing').forEach(function(label){label.classList.remove('identifier-missing');var note=label.querySelector('.scan-field-error');if(note)note.remove()})}
    function markMissingFields(names){clearMissingMarks();names.forEach(function(name){var label=fieldLabel(name);if(!label)return;label.classList.add('identifier-missing');if(!label.querySelector('.scan-field-error')){var note=document.createElement('small');note.className='scan-field-error';note.textContent='Required before this score can guide applications';label.appendChild(note)}})}
    form.querySelectorAll('input,select,textarea').forEach(function(el){el.addEventListener('input',clearMissingMarks);el.addEventListener('change',clearMissingMarks)})
    function localLabel(score){
      if(score<=3)return 'Not publicly ready';
      if(score<=5)return 'Visible, but weak foundation';
      if(score<=7)return 'Some signals present, risk remains';
      if(score===8)return 'Close, but verify before applying';
      return 'Strong visibility, still verify readiness';
    }
    function missingRequiredScanFields(payload){
      var missing=[];
      if(!payload.state)missing.push('state');
      if(!payload.phone)missing.push('business phone');
      if(!payload.website)missing.push('website');
      if(!payload.address)missing.push('business address');
      return missing;
    }
    function requiredScanMessage(missing){
      return '<strong>Core business identifiers required.</strong><span>Enter the '+escapeHtml(missing.join(', '))+' before running this scan. If the business does not have these yet, that is the sign to go through Module 1 before using a visibility score as an application readiness signal.</span><a class="btn dark" href="/nap-overview/">Start Module 1</a>';
    }    function localAdvice(score){
      if(score<=3)return 'The company may be hard for vendors, banks, or lenders to verify. Build the foundation before applying.';
      if(score<=5)return 'The company has limited visibility, but visibility is not the same as being ready for credit applications.';
      if(score<=7)return 'Some public signals are present, but the profile still needs a readiness review before choosing vendors or cards.';
      if(score===8)return 'The company looks closer, but it still needs the full Verge Five readiness path before applications.';
      return 'Strong visibility is a good sign, but the platform still checks identifier quality, vendor readiness, and card timing.';
    }
    function localScan(payload){
      var score=1;
      var missing=[];
      if(payload.state)score++;else missing.push('state');
      if(payload.website)score+=2;else missing.push('website');
      if(payload.phone)score+=2;else missing.push('business phone');
      if(payload.address)score+=1;else missing.push('business address');
      if(payload.website&&payload.phone&&payload.address)score+=2;
      else missing.push('more public proof signals');
      score=Math.max(1,Math.min(10,score));
      return {score:score,label:localLabel(score),sourceMode:'entered-signals',engine:'browser fallback',findings:['This fallback score used the signals entered on the form.'],redFlags:missing.length?['Missing or weak: '+missing.join(', ')+'.']:[],evidence:[],disclaimer:'This is a public visibility scan, not a credit approval guarantee.'};
    }
    function consistencyGate(score){
      var high=(Number(score)||0)>=7;
      return "<div class='scan-consistency-gate"+(high?' high':'')+"'><b>NAP consistency review "+(high?'required':'needed')+"</b><span>"+(high?'Your business is publicly visible. Before applying anywhere, verify that the legal name, address, phone, website, email, and listings match across the board.':'Visibility is only step one. The platform still checks whether the business identifiers match before applications.')+"</span><a href='/nap-overview/'>Start NAP cleanup</a></div>";
    }
    function readinessLocks(score){
      var low=Number(score)||1;
      var items=[
        ['NAP consistency gate',low>=7?'Review':'Locked','Name, address, phone, website, email, and listings must match.'],
        ['Vendor readiness path',low>=8?'Review':'Locked','Which Net 30 vendors should wait or move forward.'],
        ['Credit card readiness path',low>=9?'Review':'Locked','Which card path fits before using an inquiry.']
      ];
      return "<div class='scan-locks'><b>Full platform readiness still checks</b>"+items.map(function(item){var cls=item[1]==='Locked'?' locked':' review';return "<div class='scan-lock"+cls+"'><strong>"+escapeHtml(item[0])+"</strong><span>"+escapeHtml(item[1])+"</span><small>"+escapeHtml(item[2])+"</small></div>"}).join('')+"</div>";
    }
    function renderScan(data){
      var source=data.sourceMode==='public-search'?'Live public lookup':'Basic signal scan';
      var evidence=(data.evidence||[]).slice(0,3).map(function(item){return "<li><a href='"+escapeHtml(item.url)+"' target='_blank' rel='noopener'>"+escapeHtml(item.title||item.domain||item.url)+"</a></li>"}).join('');
      var redFlags=(data.redFlags||[]).slice(0,4).map(function(item){return "<li>"+escapeHtml(item)+"</li>"}).join('');
      var findings=(data.findings||[]).slice(0,4).map(function(item){return "<li>"+escapeHtml(item)+"</li>"}).join('');
      var cta=isMemberStartScan?"<a class='btn dark' href='/nap-overview/'>Continue to Module 1</a>":"<a class='btn dark' href='/start-here/'>Start the full readiness path</a>";
      var scanNote=isMemberStartScan?"<em>This member scan saves the profile to the account and becomes the starting baseline. Public homepage scan entries are only previews.</em>":"<em>Visibility is only the surface check. It does not confirm full vendor, credit card, funding, or NAP consistency readiness.</em>";
      result.innerHTML="<div class='scan-source'>"+escapeHtml(source)+"</div><div class='scan-score'><span>"+escapeHtml(data.score)+"</span><small>/ 10</small></div><strong>"+escapeHtml(data.label)+"</strong><span>"+escapeHtml(data.aiRecommendation||localAdvice(Number(data.score)||1))+"</span>"+scanNote+consistencyGate(data.score)+readinessLocks(data.score)+(findings?"<div class='scan-list'><b>What we found</b><ul>"+findings+"</ul></div>":"")+(redFlags?"<div class='scan-list danger'><b>What may need work</b><ul>"+redFlags+"</ul></div>":"")+(evidence?"<div class='scan-list'><b>Public evidence</b><ul>"+evidence+"</ul></div>":"<em>"+(data.sourceMode==='public-search'?'No evidence links returned.':'Live public lookup is not configured yet; this score uses entered signals.')+"</em>")+cta;
    }
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var name=value('businessName');
      if(!name){result.innerHTML='<strong>Business name required.</strong><span>Enter the exact business name first.</span>';return}
      var mode=(form.elements.scanMode&&form.elements.scanMode.value)||'before';
      var payload={mode:mode,businessName:name,state:value('state'),website:value('website'),phone:value('phone'),address:value('address'),email:checked('email'),directory:checked('directory'),entity:checked('entity')};
      if(isMemberStartScan){var p=loadProfile();p.businessName=payload.businessName;p.formationState=payload.state;p.website=payload.website;p.phone=payload.phone;p.address=payload.address;p.email=value('domainEmail')||p.email||'';p.industry=value('industry')||p.industry||'';saveProfile(p);saveMemberProfile(p);renderProfileMentions();}
      var missing=missingRequiredScanFields(payload);
      if(missing.length){markMissingFields(missing.map(function(item){return item==='business phone'?'phone':item==='business address'?'address':item}));result.innerHTML=requiredScanMessage(missing);return}
      clearMissingMarks();
      result.innerHTML='<strong>Checking visibility...</strong><span>Looking for public-facing business signals.</span>';
      fetch('/api/visibility-scan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})
        .then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'scan failed');return data})})
        .catch(function(){return localScan(payload)})
        .then(function(data){
          var saved={mode:mode,businessName:name,state:payload.state,score:data.score,label:data.label,sourceMode:data.sourceMode,time:new Date().toISOString()};
          if(isMemberStartScan){memberApi('POST','/api/member/visibility-audits',{mode:mode,businessName:name,result:data}).catch(function(){});}
          renderScan(data);
        });
    });
  }
  initPublicVisibilityScan();

  function initCopyPromptButtons(){
    document.querySelectorAll('[data-copy-prompt]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var target=document.querySelector(btn.getAttribute('data-copy-prompt'));
        if(!target)return;
        var text=target.textContent.trim();
        function done(){btn.textContent='Copied';setTimeout(function(){btn.textContent='Copy prompt'},1800)}
        if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(done).catch(function(){})}
        else{
          var area=document.createElement('textarea');
          area.value=text;
          document.body.appendChild(area);
          area.select();
          try{document.execCommand('copy');done()}catch(e){}
          area.remove();
        }
      });
    });
  }
  initCopyPromptButtons();

  function addAuditToolLinks(){
    if(location.pathname==='/homeefe757a6/'){
      var tools=Array.prototype.find.call(document.querySelectorAll('.side .content-block'),function(block){return /Platform tools/.test(block.textContent)});
      if(tools&&!tools.querySelector('[href="/business-visibility-audit/"]')){
        var p=document.createElement('p');
        p.innerHTML="<a href='/business-visibility-audit/'>Business Visibility Audit</a>";
        tools.insertBefore(p,tools.firstElementChild.nextSibling);
      }
      var grid=document.querySelector('.module-grid');
      if(grid&&!document.querySelector('[data-audit-card]')){
        var card=document.createElement('div');
        card.className='content-block dashboard-audit-tool';
        card.setAttribute('data-audit-card','');
        card.innerHTML="<div class='audit-alert-mark'>!</div><div><span class='module-step'>Pay attention before Module 1</span><h3>Business Visibility Audit</h3><p><strong>Run this scan before you start, then run it again after the core modules are cleaned up.</strong> This gives the member a before-and-after record of public-facing business signals.</p><div class='audit-alert-badges'><span>Before scan</span><span>After scan</span><span>Saved to account</span></div></div><a class='btn dark' href='/business-visibility-audit/'>Run audit</a>";
        grid.parentNode.insertBefore(card,grid);
      }
    }
    if(location.pathname==='/start-here/'&&!document.querySelector('[data-start-audit-alert]')){
      var lead=document.querySelector('.orientation-lead-panel');
      if(lead){
        var alert=document.createElement('div');
        alert.className='content-block start-audit-alert';
        alert.setAttribute('data-start-audit-alert','');
        alert.innerHTML="<div class='audit-alert-mark'>!</div><div><p class='kicker'>Before Module 1 checkpoint</p><h2>Run the Business Visibility Audit before you begin the buildout.</h2><p>This is the baseline. It shows what the public business profile looks like before the phone, address, website, banking, and readiness modules clean things up.</p><div class='start-audit-steps'><span><strong>1</strong> Run before scan</span><span><strong>2</strong> Complete core modules</span><span><strong>3</strong> Run after scan</span></div></div><a class='btn dark' href='/business-visibility-audit/'>Run Business Visibility Audit</a>";
        lead.insertAdjacentElement('afterend',alert);
      }
    }    if(location.pathname==='/downloads/'){
      var grid3=document.querySelector('.grid-3');
      if(grid3&&!grid3.querySelector('[data-audit-download-card]')){
        var tool=document.createElement('div');
        tool.className='card';
        tool.setAttribute('data-audit-download-card','');
        tool.innerHTML="<h3>Business Visibility Audit</h3><p>Run and compare before-and-after public visibility scans inside the platform.</p><p><a class='btn secondary' href='/business-visibility-audit/'>Open audit</a></p>";
        grid3.appendChild(tool);
      }
    }
  }
  addAuditToolLinks();

  function currentResumeLocation(){
    var title=(document.querySelector('h1')||{}).textContent||'Verge Five';
    var crumb=(document.querySelector('.crumbs')||{}).textContent||'Member area';
    return {path:location.pathname,title:title.trim(),crumb:crumb.trim(),time:new Date().toISOString()};
  }
  function isMemberExperiencePath(){
    return ['/account/','/start-here/','/homeefe757a6/','/nap-overview/','/phones-and-411/','/business-address/','/website-domain-email/','/llc-vs-corporation/','/contact-list/','/ein/','/bank-account/','/bank-rating/','/business-plan/','/equifax-business/','/comparable-credit/','/business-credit-criteria/','/about-net-30/','/about-net-30/','/nav-ecredable/','/revolving-business-credit-cards/','/general-credit-cards/','/starter-cards/','/cd-business-loans/','/business-plan-report/','/final-readiness-summary/','/downloads/','/business-visibility-audit/','/conversational-ai-bot/','/support/'].some(function(prefix){return location.pathname===prefix||location.pathname.indexOf(prefix)===0});
  }
  function memberApi(method,url,payload){
    return fetch(url,{
      method:method,
      credentials:'same-origin',
      headers:{'content-type':'application/json'},
      body:payload?JSON.stringify(payload):undefined
    }).then(function(res){
      if(!res.ok)throw new Error('member api '+res.status);
      return res.json();
    });
  }
  function renderReadinessLockBanner(summary){
    var params=new URL(location.href).searchParams;
    var lock=summary&&summary.lock||{};
    var locked=summary&&summary.locked;
    var redirected=params.get('readiness')==='locked';
    if(!locked&&!redirected)return;
    var main=document.querySelector('.member-dashboard main')||document.querySelector('.member-main')||document.querySelector('main');
    if(!main||document.querySelector('[data-readiness-lock-banner]'))return;
    var message=params.get('message')||lock.message||'Advanced sections are paused while your business profile has time to settle and verify.';
    var unlockAfter=lock.unlock_after||'';
    var banner=document.createElement('section');
    banner.className='content-block readiness-lock-banner';
    banner.setAttribute('data-readiness-lock-banner','');
    banner.innerHTML="<div class='audit-alert-mark'>!</div><div><p class='kicker'>Readiness checkpoint</p><h2>Some sections open after your business signals settle.</h2><p>"+escapeHtml(message)+"</p><p class='legal'>This keeps the platform aligned with the approval process: scan the business, make the foundation changes, give public records time to update, then move into vendors, cards, reports, and funding when the profile is ready.</p>"+(unlockAfter?"<p class='legal'><strong>Estimated unlock:</strong> "+escapeHtml(unlockAfter)+"</p>":"")+"</div><div class='proof-actions'><a class='btn dark' href='/business-visibility-audit/'>Run or review scan</a><a class='btn secondary' href='/start-here/'>Continue foundation</a></div>";
    main.insertBefore(banner,main.firstChild);
  }
  function saveMemberProgress(payload){
    memberApi('PUT','/api/member/progress',payload).catch(function(){});
  }
  function saveMemberSignal(signalType,selectedKeys){
    memberApi('PUT','/api/member/progress',{signalType:signalType,selectedKeys:selectedKeys||[]}).catch(function(){});
  }
  function signalStorageKey(signalType){
    return signalType==='vendor'?'vf-vendor-signals':signalType==='card'?'vf-card-signals':signalType==='funding'?'vf-funding-signals':'';
  }
  function signalSelector(signalType){
    return signalType==='vendor'?'data-vendor-signal':signalType==='card'?'data-card-signal':signalType==='funding'?'data-funding-signal':'';
  }
  function applySignalsToPage(signalType,keys){
    var attr=signalSelector(signalType);
    if(!attr)return;
    document.querySelectorAll('['+attr+']').forEach(function(input){
      input.checked=keys.indexOf(input.getAttribute(attr))>-1;
      input.dispatchEvent(new Event('change',{bubbles:true}));
    });
  }
  function rememberCurrentLocation(){
    if(!isMemberExperiencePath())return;
    if(location.pathname==='/'||location.pathname==='/homeefe757a6/'||location.pathname.indexOf('/whats-inside/')===0||location.pathname.indexOf('/demo/')===0||location.pathname.indexOf('/trial-roadmap/')===0||location.pathname.indexOf('/blog/')===0||location.pathname.indexOf('/membership/')===0||location.pathname.indexOf('/login/')===0||location.pathname.indexOf('/signup/')===0)return;
    var saved=currentResumeLocation();
    try{localStorage.setItem('vf-last-location',JSON.stringify(saved))}catch(e){}
    saveMemberProgress({pagePath:saved.path,pageTitle:saved.title,breadcrumb:saved.crumb,completedIndexes:readArray('vf-progress:'+saved.path)});
  }
  function renderResumePanel(saved){
    if(!saved||!saved.path||saved.path==='/homeefe757a6/')return;
    var main=document.querySelector('.member-dashboard main');
    if(!main)return;
    var panel=document.querySelector('[data-resume-panel]');
    if(!panel){
      panel=document.createElement('div');
      panel.className='content-block resume-panel';
      panel.setAttribute('data-resume-panel','');
      main.insertBefore(panel,main.firstElementChild);
    }
    var when=saved.time?new Date(saved.time).toLocaleString():'recently';
    panel.innerHTML="<div><p class='kicker'>Pick up where you left off</p><h2>"+escapeHtml(saved.title||'Continue your Verge Five buildout.')+"</h2><p>"+escapeHtml(saved.crumb||'Member area')+" &middot; Last opened "+escapeHtml(when)+"</p></div><a class='btn' href='"+escapeHtml(saved.path)+"'>Continue Buildout</a>";
  }
  function initResumePanel(){
    if(location.pathname!=='/homeefe757a6/')return;
    var main=document.querySelector('.member-dashboard main');
    if(!main||document.querySelector('[data-resume-panel]'))return;
    var saved=null;
    try{saved=JSON.parse(localStorage.getItem('vf-last-location')||'null')}catch(e){}
    renderResumePanel(saved);
    memberApi('GET','/api/member/progress').then(function(data){
      renderReadinessLockBanner(data.readinessLock);
      if(!data||!data.resume||!data.resume.page_path)return;
      var remote={path:data.resume.page_path,title:data.resume.page_title||'Continue your Verge Five buildout.',crumb:data.resume.breadcrumb||'Member area',time:data.resume.updated_at};
      try{localStorage.setItem('vf-last-location',JSON.stringify(remote))}catch(e){}
      renderResumePanel(remote);
    }).catch(function(){});
  }
  initResumePanel();
  rememberCurrentLocation();

  var pageKey='vf-progress:'+location.pathname;
  var checks=document.querySelectorAll('[data-check]');
  var saved=[];
  try{saved=JSON.parse(localStorage.getItem(pageKey)||'[]')}catch(e){saved=[]}
  function enhanceCompletionPanels(){
    if(!checks.length)return;
    var pageTitle=((document.querySelector('h1')||{}).textContent||'this lesson').trim();
    var why=((document.querySelector('.lesson-intro h2')||{}).textContent||'This step supports the business credit buildout sequence.').trim();
    document.querySelectorAll('[data-gated]').forEach(function(panel){
      if(panel.getAttribute('data-completion-enhanced'))return;
      var next=panel.querySelector('a.btn');
      var nextHtml=next?next.outerHTML:'';
      panel.setAttribute('data-completion-enhanced','true');
      panel.classList.add('lesson-completion-summary');
      panel.innerHTML="<p class='kicker'>Lesson complete</p><h3>What you completed</h3><div class='completion-summary-grid'><article><strong>What you completed</strong><span>You finished the checklist for "+escapeHtml(pageTitle)+" and saved the proof needed for this step.</span></article><article><strong>Why it matters</strong><span>"+escapeHtml(why)+"</span></article><article><strong>What happens next</strong><span>Use the saved proof in your progress report, then continue only when the business records match this lesson.</span></article></div>"+nextHtml;
    });
  }
  enhanceCompletionPanels();
  checks.forEach(function(el,i){
    if(saved.indexOf(i)>-1){el.classList.add('checked')}
    el.setAttribute('aria-pressed',el.classList.contains('checked')?'true':'false');
    var box=el.querySelector('.box');
    if(box){box.textContent=''}
  });
  function updateReadiness(){
    if(!checks.length)return;
    var done=Array.prototype.filter.call(checks,function(el){return el.classList.contains('checked')}).length;
    var pct=Math.round(done/checks.length*100);
    document.querySelectorAll('[data-score]').forEach(function(el){el.textContent=pct+'%'});
    document.querySelectorAll('[data-count]').forEach(function(el){el.textContent=done+' of '+checks.length+' complete'});
    document.querySelectorAll('[data-proof-count]').forEach(function(el){el.textContent=done+' of '+checks.length+' complete'});
    document.querySelectorAll('[data-proof-percent]').forEach(function(el){el.textContent=pct+'% complete'});
    document.querySelectorAll('[data-fill]').forEach(function(el){el.style.width=pct+'%'});
    document.querySelectorAll('[data-gated]').forEach(function(el){el.classList.toggle('hide',done!==checks.length)});
    document.querySelectorAll('[data-locked]').forEach(function(el){el.classList.toggle('hide',done===checks.length)});
    var completedIndexes=Array.prototype.map.call(checks,function(el,i){return el.classList.contains('checked')?i:null}).filter(function(v){return v!==null});
    checks.forEach(function(el){el.setAttribute('aria-pressed',el.classList.contains('checked')?'true':'false')});
    try{localStorage.setItem(pageKey,JSON.stringify(completedIndexes))}catch(e){}
    var resume=currentResumeLocation();
    saveMemberProgress({pagePath:resume.path,pageTitle:resume.title,breadcrumb:resume.crumb,completedIndexes:completedIndexes});
  }
  checks.forEach(function(el){el.addEventListener('click',function(){
    el.classList.toggle('checked');
    el.setAttribute('aria-pressed',el.classList.contains('checked')?'true':'false');
    var box=el.querySelector('.box');
    if(box){box.textContent=''}
    updateReadiness();
  })});
  updateReadiness();

  document.querySelectorAll('[data-select-choice]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var card=btn.closest('[data-choice]');
      if(!card)return;
      var group=card.parentElement;
      if(group){group.querySelectorAll('[data-choice]').forEach(function(c){c.classList.remove('selected'); var b=c.querySelector('[data-select-choice]'); if(b)b.textContent='Select option';})}
      card.classList.add('selected');
      btn.textContent='Selected';
    });
  });

  document.querySelectorAll('.proof-panel').forEach(function(panel){
    if(panel.classList.contains('report-hub-panel'))return;
    var h=panel.querySelector('h2');
    var p=panel.querySelector('p:not([class])');
    if(h)h.textContent='Save your member progress snapshot.';
    if(p)p.textContent='Download or print a progress report that shows where the business is in the process without exporting platform lessons or proprietary training content.';
  });

  var search=document.querySelector('[data-vendor-search]');
  var filter=document.querySelector('[data-vendor-filter]');
  function filterVendors(){
    var q=(search&&search.value||'').toLowerCase();
    var f=(filter&&filter.value||'all');
    document.querySelectorAll('[data-vendor]').forEach(function(card){
      var text=card.textContent.toLowerCase();
      var cat=card.getAttribute('data-category');
      card.style.display=(text.indexOf(q)>-1&&(f==='all'||cat===f))?'flex':'none';
    });
  }
  if(search)search.addEventListener('input',filterVendors);
  if(filter)filter.addEventListener('change',filterVendors);

  var profileKey='vf-business-profile';
  function profileSchema(){
    return {
      businessName:'Business legal name',
      tradeName:'DBA / trade name',
      entityType:'Entity type',
      formationState:'Formation state',
      ein:'EIN status',
      industry:'Industry / category',
      phone:'Business phone',
      address:'Business address',
      website:'Website',
      email:'Domain email',
      bank:'Business bank account',
      directory411:'Business 411 listing',
      bureauProfile:'Business credit bureau profile',
      vendorTradelines:'Starter tradelines',
      fundingReserve:'Funding reserve'
    };
  }
  function loadProfile(){
    try{return JSON.parse(localStorage.getItem(profileKey)||'{}')||{}}catch(e){return {}}
  }
  function saveProfile(profile){
    try{localStorage.setItem(profileKey,JSON.stringify(profile))}catch(e){}
  }
  var profileSaveTimer=null;
  function saveMemberProfile(profile){
    if(profileSaveTimer)clearTimeout(profileSaveTimer);
    profileSaveTimer=setTimeout(function(){
      memberApi('PUT','/api/member/profile',profile||loadProfile()).catch(function(){});
    },400);
  }
  function remoteProfileToLocal(row){
    row=row||{};
    return {
      businessName:row.businessName||row.business_name||'',
      tradeName:row.tradeName||row.trade_name||'',
      entityType:row.entityType||row.entity_type||'',
      formationState:row.formationState||row.formation_state||'',
      ein:row.ein||'',
      industry:row.industry||'',
      phone:row.phone||'',
      address:row.address||'',
      website:row.website||'',
      email:row.email||'',
      bank:!!row.bank,
      directory411:!!(row.directory411||row.directory_411),
      bureauProfile:!!(row.bureauProfile||row.bureau_profile),
      vendorTradelines:!!(row.vendorTradelines||row.vendor_tradelines),
      fundingReserve:!!(row.fundingReserve||row.funding_reserve)
    };
  }
  function mergeProfiles(local,remote){
    local=local||{};
    remote=remote||{};
    var merged={};
    Object.keys(profileSchema()).forEach(function(key){
      if(typeof remote[key]==='boolean'||typeof local[key]==='boolean')merged[key]=!!remote[key]||!!local[key];
      else merged[key]=local[key]||remote[key]||'';
    });
    return merged;
  }
  function parseStoredArray(value){
    if(Array.isArray(value))return value;
    try{return JSON.parse(value||'[]')||[]}catch(e){return []}
  }
  function mergeArrays(a,b){
    var set={};
    (a||[]).concat(b||[]).forEach(function(item){if(item!==undefined&&item!==null&&item!=='')set[item]=true});
    return Object.keys(set);
  }
  function mergeIndexes(a,b){
    return mergeArrays(a,b).map(function(item){return Number(item)}).filter(function(item){return Number.isInteger(item)&&item>=0});
  }
  function applyProgressToCurrentChecklist(indexes){
    if(!checks.length)return;
    checks.forEach(function(el,i){
      el.classList.toggle('checked',indexes.indexOf(i)>-1);
      el.setAttribute('aria-pressed',el.classList.contains('checked')?'true':'false');
    });
    updateReadiness();
  }
  function applyProfileToPage(){
    var profile=loadProfile();
    document.querySelectorAll('[data-profile-field]').forEach(function(input){
      var key=input.getAttribute('data-profile-field');
      if(document.activeElement!==input)input.value=profile[key]||'';
    });
    document.querySelectorAll('[data-profile-check]').forEach(function(input){
      var key=input.getAttribute('data-profile-check');
      input.checked=!!profile[key];
    });
    renderProfileMentions();
  }
  function syncMemberState(){
    if(!isMemberExperiencePath())return;
    memberApi('GET','/api/member/profile').then(function(data){
      var merged=mergeProfiles(loadProfile(),remoteProfileToLocal(data&&data.profile));
      saveProfile(merged);
      saveMemberProfile(merged);
      applyProfileToPage();
    }).catch(function(){});
    memberApi('GET','/api/member/progress').then(function(data){
      (data.progress||[]).forEach(function(row){
        var key='vf-progress:'+row.page_path;
        var merged=mergeIndexes(readArray(key),parseStoredArray(row.completed_indexes));
        try{localStorage.setItem(key,JSON.stringify(merged))}catch(e){}
        saveMemberProgress({pagePath:row.page_path,completedIndexes:merged});
        if(row.page_path===location.pathname)applyProgressToCurrentChecklist(merged);
      });
      (data.signals||[]).forEach(function(row){
        var key=signalStorageKey(row.signal_type);
        if(!key)return;
        var merged=mergeArrays(readArray(key),parseStoredArray(row.selected_keys));
        try{localStorage.setItem(key,JSON.stringify(merged))}catch(e){}
        saveMemberSignal(row.signal_type,merged);
        applySignalsToPage(row.signal_type,merged);
      });
    }).catch(function(){});
  }
  function progressCompletionMap(){
    return {
      '/nap-overview/':3,
      '/phones-and-411/':4,
      '/business-address/':4,
      '/website-domain-email/':5,
      '/llc-vs-corporation/':5,
      '/contact-list/':4,
      '/ein/':6,
      '/bank-account/':4,
      '/bank-rating/':4,
      '/business-plan/':4,
      '/equifax-business/':4,
      '/comparable-credit/':4,
      '/business-credit-criteria/':4,
      '/about-net-30/':4,
      '/nav-ecredable/':4,
      '/revolving-business-credit-cards/':4,
      '/cd-business-loans/':4
    };
  }
  function pageProgressCount(path){
    return readArray('vf-progress:'+path).length;
  }
  function isProgressPageComplete(path){
    var expected=progressCompletionMap()[path]||1;
    return pageProgressCount(path)>=expected;
  }
  function derivedProfileFromProgress(profile){
    profile=profile||{};
    var derived={};
    function fill(key,value){
      if(profile[key]===true||profile[key])return;
      derived[key]=value;
    }
    if(isProgressPageComplete('/phones-and-411/')){
      fill('phone','Completed in Business Phone and 411 module');
      derived.directory411=true;
    }
    if(isProgressPageComplete('/business-address/'))fill('address','Completed in Business Address module');
    if(isProgressPageComplete('/website-domain-email/')){
      fill('website','Completed in Website and Domain Email module');
      fill('email','Completed in Website and Domain Email module');
    }
    if(isProgressPageComplete('/llc-vs-corporation/')||isProgressPageComplete('/contact-list/')){
      fill('businessName','Completed in Legal Setup module');
      fill('entityType','Completed in Legal Setup module');
      fill('formationState','Completed in Secretary of State module');
    }
    if(isProgressPageComplete('/ein/'))fill('ein','Completed in EIN module');
    if(isProgressPageComplete('/business-plan/')){
      fill('industry','Documented in Business Plan module');
      fill('tradeName','Not used or not entered');
    }
    if(isProgressPageComplete('/bank-account/'))derived.bank=true;
    if(isProgressPageComplete('/equifax-business/'))derived.bureauProfile=true;
    if(isProgressPageComplete('/comparable-credit/')||isProgressPageComplete('/about-net-30/')||isProgressPageComplete('/nav-ecredable/'))derived.vendorTradelines=true;
    if(isProgressPageComplete('/cd-business-loans/'))derived.fundingReserve=true;
    return mergeProfiles(profile,derived);
  }
  function currentProgressSummary(){
    var title=(document.querySelector('h1')||{}).textContent||'Current platform page';
    var step=(document.querySelector('.crumbs')||{}).textContent||'Current member step';
    var done=Array.prototype.filter.call(checks,function(el){return el.classList.contains('checked')}).length;
    var pct=checks.length?Math.round(done/checks.length*100):0;
    return {title:title.trim(),step:step.trim(),done:done,total:checks.length,pct:pct};
  }
  function readArray(key){
    try{return JSON.parse(localStorage.getItem(key)||'[]')||[]}catch(e){return []}
  }
  function knownProgressPages(){
    return ['/nap-overview/','/phones-and-411/','/business-address/','/website-domain-email/','/llc-vs-corporation/','/contact-list/','/ein/','/bank-account/','/bank-rating/','/business-plan/','/equifax-business/','/comparable-credit/','/business-credit-criteria/','/about-net-30/','/nav-ecredable/','/revolving-business-credit-cards/','/cd-business-loans/'];
  }
  function finalSummaryData(){
    var profile=derivedProfileFromProgress(loadProfile()), labels=profileSchema();
    var profileKeys=Object.keys(labels);
    var profileDone=profileKeys.filter(function(key){return !!profile[key]}).length;
    var vendor=readArray('vf-vendor-signals'), card=readArray('vf-card-signals'), funding=readArray('vf-funding-signals');
    var completedPages=knownProgressPages().filter(function(path){return readArray('vf-progress:'+path).length>0});
    function has(list,key){return list.indexOf(key)>-1}
    var foundationCore=!!(profile.businessName&&profile.phone&&profile.address&&profile.website&&profile.email&&profile.bank&&profile.ein);
    var vendorReady=(has(vendor,'entity')&&has(vendor,'ein')&&has(vendor,'phone')&&has(vendor,'address')&&has(vendor,'bank'))||(foundationCore&&profile.directory411);
    var securedCardReady=(has(card,'entity')&&has(card,'ein')&&has(card,'address')&&has(card,'bank')&&has(card,'deposit'))||foundationCore;
    var bankCardReady=(has(card,'entity')&&has(card,'ein')&&has(card,'address')&&has(card,'bank')&&has(card,'goodCredit')&&has(card,'pgOk'))||(foundationCore&&isProgressPageComplete('/revolving-business-credit-cards/'));
    var corporateCardReady=(has(card,'entity')&&has(card,'ein')&&has(card,'bank')&&has(card,'website')&&has(card,'email')&&has(card,'revenue'))||(foundationCore&&profile.website&&profile.email&&isProgressPageComplete('/revolving-business-credit-cards/'));
    var fundingReady=(has(funding,'entity')&&has(funding,'ein')&&has(funding,'bank')&&has(funding,'relationship')&&has(funding,'statements')&&(has(funding,'reserve')||has(funding,'revenue')))||(foundationCore&&profile.fundingReserve&&isProgressPageComplete('/bank-rating/')&&isProgressPageComplete('/business-plan/'));
    var stage='Foundation buildout';
    if(fundingReady)stage='Funding review ready';
    else if(bankCardReady||corporateCardReady)stage='Business card review ready';
    else if(vendorReady)stage='Starter vendor credit ready';
    else if(foundationCore)stage='Foundation mostly aligned';
    var qualifications=[
      {label:'Starter vendor credit',status:vendorReady?'Likely ready to review':'Build first',note:vendorReady?'Core identity, EIN, phone, address, and banking signals are marked. Verify vendor requirements before applying.':'Finish core identity, EIN, phone, address, and banking signals before using vendor applications.'},
      {label:'Secured business cards',status:securedCardReady?'Likely ready to review':'May need more work',note:securedCardReady?'A secured-card path may fit if the deposit and business records are ready.':'A deposit, entity/EIN, address, and business banking should be in place first.'},
      {label:'Traditional business cards',status:bankCardReady?'Likely ready to review':'Do not rush',note:bankCardReady?'Good personal credit and personal-guarantee readiness are marked. Apply selectively.':'Traditional bank cards usually need stronger owner credit, business records, and underwriting support.'},
      {label:'Corporate/no-PG card paths',status:corporateCardReady?'Possible fit':'Not enough signals yet',note:corporateCardReady?'Revenue/cash flow, website, email, banking, and entity signals are marked. Confirm platform-specific requirements.':'No-PG/corporate card platforms usually review cash flow, banking, website/email, and operating strength.'},
      {label:'Bank funding / secured lending',status:fundingReady?'Ready for bank conversation':'Build bank file first',note:fundingReady?'The business has enough signals for a banker/lender conversation. Verify documents, terms, collateral, and guarantees.':'Build statements, bank relationship, reserves or revenue, and documentation before funding applications.'}
    ];
    var next=[];
    if(!foundationCore)next.push('Finish the business profile: legal name, phone, address, website, email, and bank account.');
    if(!vendorReady)next.push('Complete vendor readiness signals before applying for starter tradelines.');
    if(!securedCardReady&&!bankCardReady&&!corporateCardReady)next.push('Use the business credit card matcher to choose a card path that fits the current profile.');
    if(!fundingReady)next.push('Strengthen bank relationship, statements, reserves/revenue, and funding documentation before bank funding applications.');
    if(!next.length)next.push('Review all current issuer/lender requirements and apply selectively with matching records.');
    return {profile:profile,labels:labels,profileDone:profileDone,profileTotal:profileKeys.length,vendorSignals:vendor.length,cardSignals:card.length,fundingSignals:funding.length,completedPages:completedPages.length,totalPages:knownProgressPages().length,stage:stage,qualifications:qualifications,next:next};
  }
  function finalSummaryReportText(){
    var data=finalSummaryData(), labels=data.labels, profile=data.profile;
    var businessName=String(profile.businessName||'').trim();
    var lines=['Verge Five final readiness summary'];
    if(businessName)lines.push('Business: '+businessName);
    lines.push('','Generated: '+new Date().toLocaleString(),'Readiness stage: '+data.stage,'Profile captured: '+data.profileDone+' of '+data.profileTotal+' items','Platform progress started: '+data.completedPages+' of '+data.totalPages+' sections','','Business profile snapshot');
    Object.keys(labels).forEach(function(key){
      var value=profile[key];
      if(value===true)value='Complete';
      if(value===false||value===undefined||value==='')value='Not marked yet';
      lines.push(labels[key]+': '+value);
    });
    lines.push('','Likely qualification paths');
    data.qualifications.forEach(function(item){lines.push(item.label+': '+item.status+' - '+item.note)});
    lines.push('','Recommended next actions');
    data.next.forEach(function(item,i){lines.push((i+1)+'. '+item)});
    lines.push('','Important: this summary is a readiness guide, not a guarantee of approval. Requirements, reporting, deposits, guarantees, rates, and underwriting rules can change. Platform lessons and proprietary training remain inside Verge Five.');
    return lines.join('\n');
  }
  function lessonReportText(){
    if(document.querySelector('[data-final-summary]'))return finalSummaryReportText();
    var summary=currentProgressSummary();
    var data=finalSummaryData();
    var profile=data.profile;
    var labels=data.labels;
    var businessName=String(profile.businessName||'').trim();
    var lines=[
      'Verge Five member progress report'
    ];
    if(businessName)lines.push('Business: '+businessName);
    lines.push(
      '',
      'Generated: '+new Date().toLocaleString(),
      'Current location: '+summary.step+' - '+summary.title,
      'Current page completion: '+summary.done+' of '+summary.total+' items complete ('+summary.pct+'%)',
      'Overall readiness stage: '+data.stage,
      'Platform sections started: '+data.completedPages+' of '+data.totalPages,
      '',
      'Business profile snapshot'
    );
    Object.keys(labels).forEach(function(key){
      var value=profile[key];
      if(value===true)value='Complete';
      if(value===false||value===undefined||value==='')value='Not marked yet';
      lines.push(labels[key]+': '+value);
    });
    lines.push('');
    lines.push('Readiness insight');
    var complete=Object.keys(labels).filter(function(key){return !!profile[key]}).length;
    lines.push(complete+' of '+Object.keys(labels).length+' business profile items marked.');
    lines.push('Vendor readiness signals marked: '+data.vendorSignals);
    lines.push('Credit card readiness signals marked: '+data.cardSignals);
    lines.push('Funding readiness signals marked: '+data.fundingSignals);
    lines.push('');
    lines.push('Likely next qualification review');
    data.qualifications.forEach(function(item){lines.push(item.label+': '+item.status)});
    lines.push('');
    lines.push('Recommended next actions');
    data.next.slice(0,4).forEach(function(item,i){lines.push((i+1)+'. '+item)});
    lines.push('');
    lines.push('Member note: this report is only a progress snapshot. Lesson instructions, vendor lists, application strategy, and platform training content remain inside Verge Five.');
    return lines.join('\n');
  }
  function reportStyles(){
    return [
      '@page{size:letter;margin:.35in}',
      '*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}',
      'body{font-family:Inter,Arial,sans-serif;color:#071733;margin:0;background:#eef3f8;line-height:1.5}',
      '.print-wrap{max-width:920px;margin:28px auto;padding:0 18px}',
      '.print-btn{margin:0 0 16px;padding:11px 16px;border-radius:8px;border:1px solid #bfd8ed;background:#1769aa;color:#fff;font-weight:800;cursor:pointer}',
      '.report{background:#fff;border:1px solid #d6e2ee;border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(7,23,51,.12)}',
      '.report-hero{background:linear-gradient(135deg,#071733 0%,#0b3558 74%,#1769aa 100%);color:#fff;padding:28px 32px}',
      '.brand{display:flex;align-items:center;gap:10px;font-weight:900;margin-bottom:22px}',
      '.brand-mark{width:38px;height:38px;border-radius:10px;background:#020617;display:grid;place-items:center;border:1px solid rgba(255,255,255,.2)}',
      '.brand-mark img{width:28px;height:28px;object-fit:contain}',
      '.report-hero h1{font-size:34px;line-height:1.05;margin:0 0 10px;letter-spacing:-.03em;color:#fff}',
      '.report-business-name{font-size:20px!important;font-weight:900!important;color:#fff!important;margin:0 0 6px!important}',
      '.report-hero p{margin:0;color:#d8e9f7}',
      '.report-body{padding:28px 32px;background:#fff}',
      '.metric-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:22px}',
      '.metric{border:1px solid #d6e2ee;border-radius:10px;padding:16px;background:#f8fbff}',
      '.metric small{display:block;color:#5b6473;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.07em}',
      '.metric strong{display:block;font-size:24px;margin-top:6px;color:#071733;line-height:1.12}',
      '.progress-card{border:1px solid #bfd8ed;background:#e8f2fb;border-radius:12px;padding:18px;margin-bottom:22px}',
      '.progress-top{display:flex;justify-content:space-between;gap:16px;margin-bottom:10px;font-weight:900}',
      '.bar{height:10px;border-radius:999px;background:#fff;overflow:hidden;border:1px solid #bfd8ed}',
      '.bar span{display:block;height:100%;background:linear-gradient(90deg,#1769aa,#16825f)}',
      '.section-title{display:flex;justify-content:space-between;gap:16px;align-items:end;border-bottom:1px solid #d6e2ee;padding-bottom:8px;margin:24px 0 12px}',
      '.section-title h2{font-size:19px;line-height:1.15;margin:0;color:#071733}',
      '.section-title span{font-size:12px;color:#5b6473;font-weight:800}',
      '.profile-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
      '.profile-row{border:1px solid #d6e2ee;border-radius:9px;padding:11px 12px;background:#fff}',
      '.profile-row.done{border-color:#b8e0ce;background:#f1fbf6}',
      '.profile-row.missing{border-color:#ead6a4;background:#fffaf0}',
      '.profile-row strong{display:block;font-size:12px;color:#17324d;text-transform:uppercase;letter-spacing:.05em}',
      '.profile-row span{display:block;margin-top:4px;color:#071733;font-weight:750}',
      '.qual-grid{display:grid;gap:10px}',
      '.qual-card{border:1px solid #d6e2ee;border-radius:10px;padding:14px;background:#fff}',
      '.qual-card>div{display:flex;justify-content:space-between;gap:12px;align-items:start}',
      '.qual-card strong{font-size:15px;color:#071733}',
      '.qual-card span{border-radius:999px;padding:5px 9px;font-size:11px;font-weight:900;white-space:nowrap}',
      '.qual-card.ready{border-color:#b8e0ce}.qual-card.ready span{background:#e7f5ee;color:#16825f}',
      '.qual-card.review span{background:#e8f2fb;color:#0b3558}',
      '.qual-card.wait{border-color:#f0d39a}.qual-card.wait span{background:#fff4df;color:#9a6415}',
      '.qual-card p{margin:8px 0 0;color:#334155;font-size:13px;line-height:1.6}',
      '.next-list{list-style:none;padding:0;margin:0;display:grid;gap:9px}',
      '.next-list li{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:start;border:1px solid #d6e2ee;border-radius:9px;padding:12px;background:#f8fbff}',
      '.next-list b{width:28px;height:28px;border-radius:8px;background:#0b3558;color:#fff;display:grid;place-items:center}',
      '.next-list span{color:#17324d;font-weight:800;line-height:1.45}',
      '.safe-note{margin-top:24px;border-top:1px solid #d6e2ee;padding-top:14px;color:#5b6473;font-size:12px;line-height:1.6}',
      '.report-footer{background:#f8fbff;border-top:1px solid #d6e2ee;padding:16px 32px;color:#5b6473;font-size:12px;display:flex;justify-content:space-between;gap:12px;align-items:center}',
      '.report-footer strong{color:#071733}',
      '@media(max-width:760px){.metric-grid,.profile-grid{grid-template-columns:1fr}.report-hero,.report-body,.report-footer{padding-left:20px;padding-right:20px}.report-footer{display:grid}.qual-card>div{display:grid}}',
      '@media print{html,body{width:auto;min-height:auto;background:#eef3f8!important}.print-wrap{max-width:920px;margin:0 auto;padding:0}.print-btn{display:none!important}.report{box-shadow:0 8px 26px rgba(7,23,51,.10);border-radius:14px;border:1px solid #d6e2ee}.report-hero,.metric,.progress-card,.profile-row,.qual-card,.next-list li,.report-footer{break-inside:avoid;page-break-inside:avoid}.report-body{padding:24px 30px}.report-footer{padding:14px 30px}.metric-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.profile-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}'
    ].join('');
  }

  function reportSnapshotPayload(action){
    var data=finalSummaryData();
    var summary=currentProgressSummary();
    return {
      reportType:document.querySelector('[data-final-summary]')?'final-readiness':'progress',
      readinessStage:data.stage,
      summary:{
        action:action||'generated',
        generatedAt:new Date().toISOString(),
        location:location.pathname,
        currentPage:{title:summary.title,step:summary.step,done:summary.done,total:summary.total,pct:summary.pct},
        profileDone:data.profileDone,
        profileTotal:data.profileTotal,
        completedPages:data.completedPages,
        totalPages:data.totalPages,
        vendorSignals:data.vendorSignals,
        cardSignals:data.cardSignals,
        fundingSignals:data.fundingSignals,
        qualifications:data.qualifications.map(function(item){return {label:item.label,status:item.status}}),
        next:data.next.slice(0,5)
      }
    };
  }
  function saveReportSnapshot(action){
    memberApi('POST','/api/member/reports',reportSnapshotPayload(action)).catch(function(){});
  }
  function reportHtml(){
    var isFinal=!!document.querySelector('[data-final-summary]');
    var isReportHub=location.pathname==='/business-plan-report/';
    var summary=currentProgressSummary();
    var data=finalSummaryData(), labels=data.labels, profile=data.profile;
    var profileRows=Object.keys(labels).map(function(key){
      var value=profile[key];
      var marked=!!value;
      if(value===true)value='Complete';
      if(value===false||value===undefined||value==='')value='Not marked yet';
      return '<div class="profile-row '+(marked?'done':'missing')+'"><strong>'+escapeHtml(labels[key])+'</strong><span>'+escapeHtml(value)+'</span></div>';
    }).join('');
    var qualificationCards=data.qualifications.map(function(item){
      var cls=/ready|possible/i.test(item.status)?'ready':/rush|not enough|build/i.test(item.status)?'wait':'review';
      return '<article class="qual-card '+cls+'"><div><strong>'+escapeHtml(item.label)+'</strong><span>'+escapeHtml(item.status)+'</span></div><p>'+escapeHtml(item.note)+'</p></article>';
    }).join('');
    var nextActions=data.next.slice(0,5).map(function(item,i){return '<li><b>'+(i+1)+'</b><span>'+escapeHtml(item)+'</span></li>';}).join('');
    var usePlatformProgress=isFinal||isReportHub||summary.total===0;
    var pagePct=usePlatformProgress?Math.round(data.completedPages/data.totalPages*100):summary.pct;
    var pageLabel=usePlatformProgress?'Platform progress':'Current page';
    var pageValue=usePlatformProgress?(data.completedPages+' of '+data.totalPages+' sections started'):(summary.done+' of '+summary.total+' items complete');
    var reportTitle=isFinal?'Final readiness summary':'Member progress report';
    var currentLine=isFinal?'Full platform readiness snapshot':(isReportHub?'Progress snapshot after the Business Plan module':'Current location: '+summary.step+' - '+summary.title);
    var businessName=String(profile.businessName||'').trim();
    var businessNameLine=businessName?'<p class="report-business-name">'+escapeHtml(businessName)+'</p>':'';
    var style=reportStyles();
    return '<!doctype html><html><head><title>Verge Five '+(isFinal?'final readiness':'progress')+' report</title><style>'+style+'</style></head><body><div class="print-wrap"><button class="print-btn" onclick="window.print()">Print report</button><section class="report"><header class="report-hero"><div class="brand"><span class="brand-mark"><img src="/Resources/images/verge5-logo-mark.png" alt="Verge Five logo"></span><span>Verge Five</span></div><h1>'+escapeHtml(reportTitle)+'</h1>'+businessNameLine+'<p>'+escapeHtml(currentLine)+'</p></header><main class="report-body"><div class="metric-grid"><div class="metric"><small>Generated</small><strong>'+escapeHtml(new Date().toLocaleDateString())+'</strong></div><div class="metric"><small>Readiness stage</small><strong>'+escapeHtml(data.stage)+'</strong></div><div class="metric"><small>Profile captured</small><strong>'+data.profileDone+' / '+data.profileTotal+'</strong></div></div><section class="progress-card"><div class="progress-top"><span>'+escapeHtml(pageLabel)+'</span><span>'+escapeHtml(pageValue)+' ('+pagePct+'%)</span></div><div class="bar"><span style="width:'+Math.max(0,Math.min(100,pagePct))+'%"></span></div></section><div class="section-title"><h2>Business profile snapshot</h2><span>Member-entered progress</span></div><section class="profile-grid">'+profileRows+'</section><div class="section-title"><h2>Likely qualification review</h2><span>Readiness guide</span></div><section class="qual-grid">'+qualificationCards+'</section><div class="section-title"><h2>Recommended next actions</h2><span>Do next</span></div><ol class="next-list">'+nextActions+'</ol><p class="safe-note"><strong>Important:</strong> this report is a progress snapshot and readiness guide, not a guarantee of approval. Requirements, reporting, deposits, guarantees, rates, and underwriting rules can change. Platform lessons, vendor lists, and proprietary training remain inside Verge Five.</p></main><footer class="report-footer"><span><strong>Verge Five LLC</strong> - From vision to venture.</span><span>Member-safe report: no lesson content exported.</span></footer></section></div></body></html>';
  }
  document.querySelectorAll('[data-print-report]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var win=window.open('','vf-progress-report','width=860,height=900');
      if(!win)return;
      win.document.open();
      win.document.write(reportHtml());
      win.document.close();
      win.focus();
      saveReportSnapshot('print');
      setTimeout(function(){win.print()},500);
    });
  });
  document.querySelectorAll('[data-download-report]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var blob=new Blob([reportHtml()],{type:'text/html'});
      var a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download=document.querySelector('[data-final-summary]')?'verge-five-final-readiness-summary.html':'verge-five-member-progress-report.html';
      document.body.appendChild(a);
      a.click();
      saveReportSnapshot('download');
      setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},0);
    });
  });

  function initBusinessProfileIntake(){
    var panel=document.querySelector('[data-business-profile-intake]');
    if(!panel)return;
    var profile=loadProfile();
    panel.querySelectorAll('[data-profile-field]').forEach(function(input){
      var key=input.getAttribute('data-profile-field');
      input.value=profile[key]||'';
      input.addEventListener('input',function(){
        var p=loadProfile();
        p[key]=input.value.trim();
        saveProfile(p);
        saveMemberProfile(p);
        updateProfileStatus();
        renderProfileMentions();
      });
    });
    panel.querySelectorAll('[data-profile-check]').forEach(function(input){
      var key=input.getAttribute('data-profile-check');
      input.checked=!!profile[key];
      input.addEventListener('change',function(){
        var p=loadProfile();
        p[key]=input.checked;
        saveProfile(p);
        saveMemberProfile(p);
        updateProfileStatus();
        renderProfileMentions();
      });
    });
    function updateProfileStatus(){
      var p=loadProfile();
      var intakeKeys=Array.prototype.map.call(panel.querySelectorAll('[data-profile-field]'),function(input){return input.getAttribute('data-profile-field')});
      var complete=intakeKeys.filter(function(key){return !!p[key]}).length;
      var total=intakeKeys.length;
      var strong=panel.querySelector('[data-profile-status]');
      var copy=panel.querySelector('[data-profile-status-copy]');
      if(strong)strong.textContent=complete+' of '+total+' starter profile fields captured.';
      if(copy)copy.textContent=complete===total?'The starter profile is captured. Now verify every item inside the modules before applying anywhere.':'Fill in what you know now. Blank items become part of what the modules help you build and verify.';
    }
    updateProfileStatus();
  }
  syncMemberState();
  initBusinessProfileIntake();
  function renderProfileMentions(){
    var profile=loadProfile();
    document.querySelectorAll('[data-profile-output]').forEach(function(el){
      var key=el.getAttribute('data-profile-output');
      var fallback=el.getAttribute('data-profile-fallback')||'Not entered yet';
      el.textContent=profile[key]||fallback;
    });
  }
  renderProfileMentions();
  function initMemberVisibilityAudit(){
    var root=document.querySelector('[data-member-visibility-audit]');
    if(!root)return;
    var form=root.querySelector('[data-audit-form]');
    var msg=root.querySelector('[data-audit-message]');
    var delta=root.querySelector('[data-audit-delta] strong');
    var buildoutSummary=root.querySelector('[data-buildout-summary]');
    var buildoutNext=root.querySelector('[data-buildout-next]');
    var buildoutSteps=root.querySelector('[data-buildout-steps]');
    function setMessage(text,isError){
      if(!msg)return;
      msg.textContent=text||'';
      msg.classList.toggle('error',!!isError);
    }
    function field(name){return form&&form.elements[name]}
    function setField(name,value){var el=field(name);if(el&&value!==undefined&&value!==null)el.value=value}
    function setCheck(name,value){var el=field(name);if(el)el.checked=!!value}
    function normalizeProfile(profile){
      profile=profile||{};
      return {
        businessName:profile.businessName||profile.business_name||'',
        state:profile.formationState||profile.formation_state||'',
        website:profile.website||'',
        phone:profile.phone||'',
        address:profile.address||'',
        email:!!(profile.email||profile.email === 1),
        directory:!!(profile.directory411||profile.directory_411),
        entity:!!(profile.entityType||profile.entity_type)
      };
    }
    function applyProfile(profile){
      var p=normalizeProfile(profile);
      setField('businessName',p.businessName);
      setField('state',p.state);
      setField('website',p.website);
      setField('phone',p.phone);
      setField('address',p.address);
    }
    function missingAuditFields(input){
      var missing=[];
      if(!input.state)missing.push('state');
      if(!input.phone)missing.push('business phone');
      if(!input.website)missing.push('website');
      if(!input.address)missing.push('business address');
      return missing;
    }
    function auditRequiredMessage(missing){
      return 'State, business phone, website, and business address are required before running this scan. Missing '+missing.join(', ')+' means the profile needs Module 1 before this score should guide applications.';
    }
    function fieldKeyFromMissing(item){return item==='business phone'?'phone':item==='business address'?'address':item}
    function clearAuditMissingMarks(){if(!form)return;form.querySelectorAll('.identifier-missing').forEach(function(label){label.classList.remove('identifier-missing');var note=label.querySelector('.scan-field-error');if(note)note.remove()})}
    function markAuditMissingFields(missing){clearAuditMissingMarks();missing.forEach(function(item){var label=form.querySelector('[data-required-field=\"'+fieldKeyFromMissing(item)+'\"]');if(!label)return;label.classList.add('identifier-missing');if(!label.querySelector('.scan-field-error')){var note=document.createElement('small');note.className='scan-field-error';note.textContent='Required before this score can guide applications';label.appendChild(note)}})}
    if(form)form.querySelectorAll('input,select,textarea').forEach(function(el){el.addEventListener('input',clearAuditMissingMarks);el.addEventListener('change',clearAuditMissingMarks)});
    function payload(mode){
      return {
        mode:mode,
        businessName:String(field('businessName')&&field('businessName').value||'').trim(),
        state:String(field('state')&&field('state').value||'').trim(),
        website:String(field('website')&&field('website').value||'').trim(),
        phone:String(field('phone')&&field('phone').value||'').trim(),
        address:String(field('address')&&field('address').value||'').trim(),
        email:false,
        directory:false,
        entity:false
      };
    }
    function parseResult(row){
      if(!row)return null;
      try{
        var result=typeof row.result_json==='string'?JSON.parse(row.result_json):row.result_json;
        result.createdAt=row.created_at||result.generatedAt||'';
        result.businessName=row.business_name||result.businessName||'';
        return result;
      }catch(e){return null}
    }
    function listHtml(title,items,cls){
      if(!items||!items.length)return '';
      return "<div class='scan-list "+(cls||'')+"'><b>"+escapeHtml(title)+"</b><ul>"+items.slice(0,4).map(function(item){return '<li>'+escapeHtml(item)+'</li>'}).join('')+"</ul></div>";
    }
    function auditConsistencyHtml(result){
      if(!result)return '';
      var high=(Number(result.score)||0)>=7;
      var copy=high?'This business has public visibility, but that does not prove the name, address, phone, website, email, and listings match across the board. Complete the NAP consistency review before applications.':'Use the NAP consistency review to make sure the business identifiers match before vendor, card, or funding applications.';
      return "<div class='audit-consistency-result"+(high?' high':'')+"'><strong>NAP consistency review "+(high?'required':'needed')+"</strong><span>"+escapeHtml(copy)+"</span><a href='/nap-overview/'>Start NAP cleanup</a></div>";
    }    function renderCard(mode,result){
      var card=root.querySelector('[data-audit-card="'+mode+'"]');
      if(!card)return;
      var score=card.querySelector('[data-audit-score]');
      var label=card.querySelector('[data-audit-label]');
      var rec=card.querySelector('[data-audit-recommendation]');
      var lists=card.querySelector('[data-audit-lists]');
      if(!result){
        if(score)score.textContent='--';
        return;
      }
      if(score)score.textContent=result.score||0;
      if(label)label.textContent=result.label||'Scan saved';
      if(rec)rec.textContent=result.aiRecommendation||'Saved '+(result.createdAt?new Date(result.createdAt).toLocaleString():'recently')+'. Visibility is a surface check, not an approval guarantee.';
      if(lists)lists.innerHTML=auditConsistencyHtml(result)+listHtml('What we found',result.findings,'')+listHtml('What may need work',result.redFlags,'danger');
    }
    function currentSignals(result){
      var formSignals=payload('before');
      var saved=(result&&result.signals)||{};
      return {
        state:saved.state!==undefined?saved.state:!!formSignals.state,
        website:saved.website!==undefined?saved.website:!!formSignals.website,
        phone:saved.phone!==undefined?saved.phone:!!formSignals.phone,
        address:saved.address!==undefined?saved.address:!!formSignals.address,
        email:saved.email!==undefined?saved.email:!!formSignals.email,
        directory:saved.directory!==undefined?saved.directory:!!formSignals.directory,
        entity:saved.entity!==undefined?saved.entity:!!formSignals.entity
      };
    }
    function hasRedFlag(result,needle){
      var flags=(result&&result.redFlags)||[];
      needle=needle.toLowerCase();
      return flags.some(function(flag){return String(flag||'').toLowerCase().indexOf(needle)>-1});
    }
    function stepState(ready,review){
      if(ready)return {cls:'ready',label:'Looks visible'};
      if(review)return {cls:'almost',label:'Verify'};
      return {cls:'wait',label:'Build first'};
    }
    function renderBuildout(result,mode){
      if(!buildoutSteps)return;
      var score=Number(result&&result.score||0);
      var signals=currentSignals(result);
      var phoneOk=signals.phone&&!hasRedFlag(result,'phone number did not appear');
      var directoryOk=signals.directory&&!hasRedFlag(result,'directory signal');
      var websiteOk=signals.website&&!hasRedFlag(result,'website domain did not appear');
      var entityOk=signals.entity&&signals.state&&!hasRedFlag(result,'business-name match');
      var addressOk=signals.address&&!hasRedFlag(result,'state was not provided');
      var steps=[
        {
          num:'01',
          title:'Legal name and entity record',
          href:'/llc-vs-corporation/',
          module:'Module 2',
          state:stepState(entityOk,signals.entity||signals.state),
          copy:'Confirm the entity is active, the exact name is used everywhere, and the state/public record can be found.'
        },
        {
          num:'02',
          title:'Business phone number',
          href:'/phones-and-411/',
          module:'Module 1',
          state:stepState(phoneOk,signals.phone),
          copy:'Use a real business phone service, not a mobile-style signal that lenders may flag.'
        },
        {
          num:'03',
          title:'Business 411 listing',
          href:'/phones-and-411/',
          module:'Module 1',
          state:stepState(directoryOk,signals.directory),
          copy:'Add the exact business name, phone, and address to Business 411 or a trusted commercial directory.'
        },
        {
          num:'04',
          title:'Commercial business address',
          href:'/business-address/',
          module:'Module 1',
          state:stepState(addressOk,signals.address),
          copy:'Use a valid commercial-style address where the owner can realistically work or meet a client.'
        },
        {
          num:'05',
          title:'Website and domain email',
          href:'/website-domain-email/',
          module:'Module 1',
          state:stepState(websiteOk&&signals.email,websiteOk||signals.email),
          copy:'Publish a professional website and use domain-based email so the company looks finished and reachable.'
        },
        {
          num:'06',
          title:'Banking foundation',
          href:'/bank-account/',
          module:'Module 3',
          state:stepState(score>=7,false),
          copy:'After identity signals are consistent, open and maintain the business bank account under the same profile.'
        },
        {
          num:'07',
          title:'12-point readiness gate',
          href:'/business-credit-criteria/',
          module:'Module 5',
          state:stepState(score>=8,score>=6),
          copy:'Use the full readiness criteria before vendor, card, or funding applications.'
        }
      ];
      var firstWait=steps.find(function(step){return step.state.cls!=='ready'});
      if(buildoutSummary){
        buildoutSummary.textContent=result?'Latest '+(mode==='after'?'after':'before')+' scan: '+score+'/10. Visibility is not enough; use this path to clean up NAP and business identifiers before applications.':'Run a scan to generate the member buildout path. The plan will point back into the correct Verge Five modules.';
      }
      if(buildoutNext){
        buildoutNext.innerHTML=firstWait?'<strong>Next move:</strong> '+escapeHtml(firstWait.title)+' - '+escapeHtml(firstWait.copy):'<strong>Next move:</strong> Run the after scan, save proof, then review vendor and credit card readiness.';
      }
      buildoutSteps.innerHTML=steps.map(function(step){
        var needsMark=/phone|address|website/i.test(step.title)&&(step.state.cls!=='ready'||score<=5);
        var mark=needsMark?"<div class='audit-action-mark'><b>!</b><span>Needs attention here</span></div>":'';
        return "<article class='audit-buildout-step "+step.state.cls+"'><span>"+escapeHtml(step.num)+"</span><div><div class='audit-step-top'><strong>"+escapeHtml(step.title)+"</strong><em class='match-status "+step.state.cls+"'>"+escapeHtml(step.state.label)+"</em></div>"+mark+"<p>"+escapeHtml(step.copy)+"</p><a href='"+escapeHtml(step.href)+"'>Open "+escapeHtml(step.module)+"</a></div></article>";
      }).join('');
    }
    function renderAudits(rows){
      rows=rows||[];
      var before=parseResult(rows.find(function(row){return row.mode==='before'}));
      var after=parseResult(rows.find(function(row){return row.mode==='after'}));
      renderCard('before',before);
      renderCard('after',after);
      renderBuildout(after||before,after?'after':before?'before':'');
      if(delta){
        if(before&&after){
          var diff=Number(after.score||0)-Number(before.score||0);
          delta.textContent=(diff>=0?'+':'')+diff+' points';
        }else{
          delta.textContent='Not compared yet';
        }
      }
    }
    function loadAudits(){
      return memberApi('GET','/api/member/visibility-audits').then(function(data){
        renderAudits(data.audits||[]);
      }).catch(function(){});
    }
    function loadProfileForAudit(){
      memberApi('GET','/api/member/profile').then(function(data){
        var profile=data.profile||{};
        if(!profile.business_name&&!profile.businessName)profile=loadProfile();
        applyProfile(profile);
      }).catch(function(){applyProfile(loadProfile())});
    }
    root.querySelectorAll('[data-run-audit]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var mode=btn.getAttribute('data-run-audit')==='after'?'after':'before';
        var input=payload(mode);
        if(!input.businessName){setMessage('Enter the business name first.',true);return}
        var missing=missingAuditFields(input);
        if(missing.length){markAuditMissingFields(missing);setMessage(auditRequiredMessage(missing),true);return}
        clearAuditMissingMarks();
        setMessage('Running '+mode+' visibility scan...');
        fetch('/api/visibility-scan',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(input)})
          .then(function(res){return res.json().then(function(data){if(!res.ok)throw new Error(data.error||'scan failed');return data})})
          .then(function(result){
            renderBuildout(result,mode);
            return memberApi('POST','/api/member/visibility-audits',{mode:mode,businessName:input.businessName,result:result}).then(function(){return result});
          })
          .then(function(){setMessage('Saved '+mode+' scan to this member account.');return loadAudits()})
          .catch(function(err){setMessage(err.message||'The scan could not be completed. Check the required identifiers and try again.',true)});
      });
    });
    var refresh=root.querySelector('[data-refresh-audits]');
    if(refresh)refresh.addEventListener('click',function(){setMessage('Refreshing saved scans...');loadAudits().then(function(){setMessage('Saved scans refreshed.')})});
    loadProfileForAudit();
    loadAudits();
  }
  initMemberVisibilityAudit();
  if(location.pathname==='/phones-and-411/'){
    document.querySelectorAll('[data-business-profile-intake], .business-profile-intake').forEach(function(panel){
      panel.remove();
    });
  }
  function initFinalSummary(){
    var root=document.querySelector('[data-final-summary]');
    if(!root)return;
    function render(){
      var data=finalSummaryData();
      var score=data.profileTotal?Math.round(data.profileDone/data.profileTotal*100):0;
      var profileEl=root.querySelector('[data-summary-profile]');
      var qualEl=root.querySelector('[data-summary-qualifications]');
      var nextEl=root.querySelector('[data-summary-next]');
      root.querySelectorAll('[data-summary-stage]').forEach(function(el){el.textContent=data.stage});
      root.querySelectorAll('[data-summary-score]').forEach(function(el){el.textContent=score+'%'});
      root.querySelectorAll('[data-summary-profile-count]').forEach(function(el){el.textContent=data.profileDone+' of '+data.profileTotal+' profile items captured'});
      root.querySelectorAll('[data-summary-progress-count]').forEach(function(el){el.textContent=data.completedPages+' of '+data.totalPages+' sections started'});
      root.querySelectorAll('[data-summary-fill]').forEach(function(el){el.style.width=score+'%'});
      if(profileEl){
        profileEl.innerHTML=Object.keys(data.labels).map(function(key){
          var value=data.profile[key];
          if(value===true)value='Complete';
          if(value===false||value===undefined||value==='')value='Not marked yet';
          return "<div><strong>"+escapeHtml(data.labels[key])+"</strong><span>"+escapeHtml(value)+"</span></div>";
        }).join('');
      }
      if(qualEl){
        qualEl.innerHTML=data.qualifications.map(function(item){
          var cls=item.status.indexOf('Likely')===0||item.status==='Possible fit'?'ready':item.status.indexOf('Build')===0||item.status.indexOf('Do not')===0||item.status.indexOf('Not')===0?'wait':'almost';
          return "<article class='summary-qualification "+cls+"'><span class='match-status "+cls+"'>"+escapeHtml(item.status)+"</span><h3>"+escapeHtml(item.label)+"</h3><p>"+escapeHtml(item.note)+"</p></article>";
        }).join('');
      }
      if(nextEl){
        nextEl.innerHTML=data.next.map(function(item){return '<li>'+escapeHtml(item)+'</li>'}).join('');
      }
    }
    render();
    window.addEventListener('storage',render);
  }
  initFinalSummary();

  var matcher=document.querySelector('[data-vendor-match-tool]');
  if(matcher){
    var vendorData=window.vfVendorLibrary||[
      {name:'Quill',category:'Starter Net 30',reports:'Business bureaus vary',url:'/about-net-30/',level:'Starter friendly',requires:['entity','ein','phone','address','bank'],recommended:['website','email','411'],notes:'Office supplies. Best after the basic identity and banking foundation are clean.'},
      {name:'Uline',category:'Starter Net 30',reports:'Business bureaus vary',url:'/about-net-30/',level:'Starter friendly',requires:['entity','ein','phone','address','bank'],recommended:['website','email','411'],notes:'Shipping and operational supplies. Track invoice dates and pay cleanly.'},
      {name:'Nav Business Boost',category:'Credit profile tool',reports:'D&B and Experian reporting may apply by plan',url:'/nav-ecredable/',level:'Starter friendly',requires:['entity','ein','address','bank'],recommended:['phone','website','email','duns'],notes:'Optional visibility tool. It does not replace proper company setup.'},
      {name:'Grainger',category:'Industrial / Net 30',reports:'Business bureaus vary',url:'/building-and-industrial/',level:'Foundation first',requires:['entity','ein','phone','address','bank','website'],recommended:['email','411','duns','time'],notes:'Better when the business has a real industrial or supply purchasing need.'},
      {name:'Crown Office Supplies',category:'Office supplies',reports:'Business bureaus vary',url:'/office-and-cleaning/',level:'Starter friendly',requires:['entity','ein','phone','address'],recommended:['bank','website','email'],notes:'Use only if the purchase fits the business and payment can be tracked.'},
      {name:'Betty Mills',category:'Office and cleaning',reports:'Business bureaus vary',url:'/office-and-cleaning/',level:'Foundation first',requires:['entity','ein','phone','address','bank'],recommended:['website','email','411'],notes:'Useful for office, cleaning, and facility supplies.'},
      {name:'Office Depot Business',category:'Office supplies',reports:'Business bureaus vary',url:'/office-and-cleaning/',level:'Foundation first',requires:['entity','ein','phone','address','bank','website'],recommended:['email','duns','time'],notes:'Better after the business profile looks established.'},
      {name:'Staples Business',category:'Office supplies',reports:'Business bureaus vary',url:'/office-and-cleaning/',level:'Foundation first',requires:['entity','ein','phone','address','bank','website'],recommended:['email','duns','time'],notes:'Use for real office supply purchasing with consistent records.'},
      {name:'Amazon Business',category:'Retail / wholesale',reports:'May require business verification',url:'/retail-and-wholesale/',level:'Foundation first',requires:['entity','ein','phone','address','website'],recommended:['bank','email','time'],notes:'Good operational account, but do not assume every purchase reports to credit bureaus.'},
      {name:'Home Depot Pro',category:'Building and industrial',reports:'Business bureaus vary',url:'/building-and-industrial/',level:'Established profile',requires:['entity','ein','phone','address','bank','website','time'],recommended:['duns','tradelines','pg'],notes:'Best for construction, maintenance, real estate, or service businesses with a real use case.'},
      {name:'Lowe\'s Pro',category:'Building and industrial',reports:'Business bureaus vary',url:'/building-and-industrial/',level:'Established profile',requires:['entity','ein','phone','address','bank','website','time'],recommended:['duns','tradelines','pg'],notes:'Higher fit after starter tradelines and clean banking history.'},
      {name:'BP Business Solutions',category:'Gas and fleet',reports:'Business bureaus vary',url:'/gas-fleet-and-auto/',level:'Established profile',requires:['entity','ein','phone','address','bank','time'],recommended:['website','email','tradelines','pg'],notes:'Best when the business has vehicle or fuel purchasing needs.'},
      {name:'Shell Fleet',category:'Fleet card',reports:'Business bureaus vary',url:'/retail-and-fleet/',level:'Established profile',requires:['entity','ein','phone','address','bank','time'],recommended:['website','email','tradelines','pg'],notes:'Fleet products may involve additional underwriting and owner review.'},
      {name:'WEX',category:'Fleet card',reports:'Business bureaus vary',url:'/retail-and-fleet/',level:'Established profile',requires:['entity','ein','phone','address','bank','time'],recommended:['website','email','tradelines','pg'],notes:'Use after the business can support fuel or fleet spending.'},
      {name:'Capital One Spark',category:'Business credit card',reports:'Bank card reporting varies',url:'/starter-cards/',level:'Higher-level credit',requires:['entity','ein','phone','address','bank','website','pg'],recommended:['time','tradelines','email'],notes:'Often depends on owner credit and underwriting. Not a first-step substitute.'},
      {name:'American Express Business',category:'Business credit card',reports:'Bank card reporting varies',url:'/general-credit-cards/',level:'Higher-level credit',requires:['entity','ein','phone','address','bank','website','pg'],recommended:['time','tradelines','email'],notes:'Better after the foundation, banking, and credit profile are stronger.'},
      {name:'Ramp',category:'Corporate card',reports:'Business bureaus vary',url:'/general-credit-cards/',level:'Higher-level credit',requires:['entity','ein','phone','address','bank','website','time'],recommended:['tradelines','email'],notes:'Typically looks at business banking, revenue, and company profile strength.'},
      {name:'Brex',category:'Corporate card',reports:'Business bureaus vary',url:'/starter-cards/',level:'Higher-level credit',requires:['entity','ein','phone','address','bank','website','time'],recommended:['tradelines','email'],notes:'Best for companies with stronger banking and operational history.'}
    ];
    var signalLabels={entity:'Legal entity',ein:'EIN',phone:'Business phone',411:'411 listing',address:'Business address',website:'Website',email:'Domain email',bank:'Business bank account',duns:'DUNS/profile',tradelines:'Existing tradelines',time:'90+ days',pg:'Personal guarantee ok'};
    var resultBox=matcher.querySelector('[data-vendor-match-results]');
    var librarySearch=matcher.querySelector('[data-vendor-library-search]');
    var libraryCategory=matcher.querySelector('[data-vendor-library-category]');
    var detail=document.createElement('div');
    detail.className='vendor-detail-modal hide';
    detail.innerHTML="<div class='vendor-detail-backdrop' data-vendor-detail-close></div><article class='vendor-detail-card'><button class='vendor-detail-close' type='button' data-vendor-detail-close>Close</button><div data-vendor-detail-body></div></article>";
    document.body.appendChild(detail);
    var recommendation=matcher.querySelector('[data-vendor-recommendation]');
    var scoreEl=matcher.querySelector('[data-vendor-score]');
    var countEl=matcher.querySelector('[data-vendor-count]');
    var activeFilter='all';
    if(libraryCategory){
      var cats=[];
      vendorData.forEach(function(v){if(cats.indexOf(v.category)<0)cats.push(v.category)});
      cats.sort().forEach(function(cat){var opt=document.createElement('option');opt.value=cat;opt.textContent=cat;libraryCategory.appendChild(opt)});
    }
    function selectedSignals(){
      var set={};
      matcher.querySelectorAll('[data-vendor-signal]').forEach(function(input){if(input.checked)set[input.getAttribute('data-vendor-signal')]=true});
      return set;
    }
    function classify(v,set){
      var missing=v.requires.filter(function(key){return !set[key]});
      var recommendedMissing=v.recommended.filter(function(key){return !set[key]});
      var status=missing.length===0?'ready':missing.length<=2?'almost':'wait';
      if(v.level==='Higher-level credit'&&(!set.tradelines||!set.time))status=missing.length<=2?'almost':'wait';
      return {missing:missing,recommendedMissing:recommendedMissing,status:status};
    }
    function statusLabel(status){return status==='ready'?'Ready now':status==='almost'?'Almost ready':'Do not apply yet'}
    function renderMatcher(){
      var set=selectedSignals();
      var selected=Object.keys(set).length;
      var pct=Math.round(selected/12*100);
      if(scoreEl)scoreEl.textContent=pct+'%';
      if(countEl)countEl.textContent=selected+' of 12 signals ready';
      var ready=0, almost=0;
      var html='';
      var query=(librarySearch&&librarySearch.value||'').toLowerCase();
      var category=(libraryCategory&&libraryCategory.value)||'all';
      vendorData.forEach(function(v){
        var fit=classify(v,set);
        if(fit.status==='ready')ready++;
        if(fit.status==='almost')almost++;
        if(activeFilter!=='all'&&fit.status!==activeFilter)return;
        if(category!=='all'&&v.category!==category)return;
        if(query&&(v.name+' '+v.category+' '+v.notes+' '+v.reports).toLowerCase().indexOf(query)<0)return;
        var missingText=fit.missing.length?fit.missing.map(function(k){return signalLabels[k]}).join(', '):'Core prerequisites selected';
        var recText=fit.recommendedMissing.length?fit.recommendedMissing.map(function(k){return signalLabels[k]}).join(', '):'Recommended signals selected';
        html += "<button class='vendor-match-card compact " + fit.status + "' type='button' data-vendor-detail='" + vendorData.indexOf(v) + "'><span class='match-status " + fit.status + "'>" + statusLabel(fit.status) + "</span><strong>" + v.name + "</strong><small>" + v.category + "</small><em>" + (fit.status==='wait'?'Do not waste an application':fit.missing.length?fit.missing.length+' required signal(s) missing':'Core match') + "</em></button>";
      });
      resultBox.innerHTML=html;
      if(recommendation){
        var strong=recommendation.querySelector('strong'), span=recommendation.querySelector('span');
        if(ready>0){strong.textContent=ready+' vendor options look aligned.'; span.textContent='Verify current vendor terms, apply slowly, and document each approval and payment date.'}
        else if(almost>0){strong.textContent=almost+' vendor options are close.'; span.textContent='Finish the missing prerequisite signals before applying so you do not waste applications.'}
        else {strong.textContent='Build the foundation before applying.'; span.textContent='Complete identity, EIN, address, phone, website, and banking before using vendor applications.'}
      }
      try{localStorage.setItem('vf-vendor-signals',JSON.stringify(Object.keys(set)))}catch(e){}
    }
    function openVendorDetail(index){
      var v=vendorData[index];
      if(!v)return;
      var set=selectedSignals();
      var fit=classify(v,set);
      var missingText=fit.missing.length?fit.missing.map(function(k){return signalLabels[k]}).join(', '):'Core prerequisites selected';
      var recText=fit.recommendedMissing.length?fit.recommendedMissing.map(function(k){return signalLabels[k]}).join(', '):'Recommended signals selected';
      detail.querySelector('[data-vendor-detail-body]').innerHTML="<div class='vendor-match-top'><span class='match-status "+fit.status+"'>"+statusLabel(fit.status)+"</span><span>"+v.category+"</span></div><h2>"+v.name+"</h2><p>"+v.notes+"</p><div class='vendor-prereqs'><strong>Required prerequisites</strong><span>"+v.requires.map(function(k){return signalLabels[k]}).join(', ')+"</span></div><div class='vendor-prereqs'><strong>Recommended signals</strong><span>"+v.recommended.map(function(k){return signalLabels[k]}).join(', ')+"</span></div><div class='vendor-prereqs'><strong>Reports / review note</strong><span>"+v.reports+"</span></div><div class='vendor-gap "+(fit.status==='wait'?'danger':'')+"'><strong>Match note:</strong> "+(fit.status==='ready'?'You selected the core prerequisites. Verify current vendor terms before applying.':fit.status==='almost'?'Fix these first before applying: '+missingText:'Do not waste an application yet. Build these missing items first: '+missingText)+".</div><small>Helpful next improvements: "+recText+".</small><small>Research note: "+(v.source||'Vendor/category research')+". Requirements and reporting can change.</small><div class='proof-actions'><a class='btn' href='"+v.url+"' target='_blank' rel='noopener'>Open vendor site</a><button class='btn secondary' type='button' data-vendor-detail-close>Close</button></div>";
      detail.classList.remove('hide');
    }
    try{
      JSON.parse(localStorage.getItem('vf-vendor-signals')||'[]').forEach(function(key){
        var input=matcher.querySelector('[data-vendor-signal=\"'+key+'\"]'); if(input)input.checked=true;
      });
    }catch(e){}
    matcher.querySelectorAll('[data-vendor-signal]').forEach(function(input){input.addEventListener('change',function(){
      renderMatcher();
      saveMemberSignal('vendor',readArray('vf-vendor-signals'));
    })});
    matcher.querySelectorAll('[data-vendor-match-filter]').forEach(function(btn){
      btn.addEventListener('click',function(){
        activeFilter=btn.getAttribute('data-vendor-match-filter');
        matcher.querySelectorAll('[data-vendor-match-filter]').forEach(function(b){b.classList.toggle('active',b===btn)});
        renderMatcher();
      });
    });
    if(librarySearch)librarySearch.addEventListener('input',renderMatcher);
    if(libraryCategory)libraryCategory.addEventListener('change',renderMatcher);
    resultBox.addEventListener('click',function(e){
      var card=e.target.closest('[data-vendor-detail]');
      if(card)openVendorDetail(Number(card.getAttribute('data-vendor-detail')));
    });
    detail.addEventListener('click',function(e){if(e.target.closest('[data-vendor-detail-close]'))detail.classList.add('hide')});
    renderMatcher();
  }

  function escapeHtml(value){
    return String(value||'').replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }
  function initCardMatcher(){
    var matcher=document.querySelector('[data-card-match-tool]');
    if(!matcher)return;
    var cardData=window.vfCardLibrary||[];
    var signalLabels={entity:'Legal entity',ein:'EIN',phone:'Business phone',address:'Valid business address',website:'Business website',email:'Domain business email',bank:'Business bank account',deposit:'Deposit available',pgOk:'Personal guarantee acceptable',goodCredit:'Good personal credit',revenue:'Revenue / cash flow',time:'90+ days in records',tradelines:'Existing tradelines',noPgNeed:'Need no-PG corporate card',duns:'DUNS / bureau profile'};
    var signalTotal=14;
    var resultBox=matcher.querySelector('[data-card-match-results]');
    var librarySearch=matcher.querySelector('[data-card-library-search]');
    var libraryCategory=matcher.querySelector('[data-card-library-category]');
    var recommendation=matcher.querySelector('[data-card-recommendation]');
    var scoreEl=matcher.querySelector('[data-card-score]');
    var countEl=matcher.querySelector('[data-card-count]');
    var activeFilter='all';
    var detail=document.createElement('div');
    detail.className='vendor-detail-modal hide card-detail-modal';
    detail.innerHTML="<div class='vendor-detail-backdrop' data-card-detail-close></div><article class='vendor-detail-card'><button class='vendor-detail-close' type='button' data-card-detail-close>Close</button><div data-card-detail-body></div></article>";
    document.body.appendChild(detail);
    if(libraryCategory){
      var cats=[];
      cardData.forEach(function(card){if(cats.indexOf(card.category)<0)cats.push(card.category)});
      cats.sort().forEach(function(cat){var opt=document.createElement('option');opt.value=cat;opt.textContent=cat;libraryCategory.appendChild(opt)});
    }
    function selectedSignals(){
      var set={};
      matcher.querySelectorAll('[data-card-signal]').forEach(function(input){if(input.checked)set[input.getAttribute('data-card-signal')]=true});
      return set;
    }
    function classify(card,set){
      var missing=card.requires.filter(function(key){return !set[key]});
      var recommendedMissing=card.recommended.filter(function(key){return !set[key]});
      var status=missing.length===0?'ready':missing.length<=2?'almost':'wait';
      if(card.type&&card.type.toLowerCase().indexOf('traditional')>-1&&(!set.goodCredit||!set.pgOk))status='wait';
      if(card.type&&card.type.toLowerCase().indexOf('secured')>-1&&!set.deposit)status='wait';
      if(card.type&&card.type.toLowerCase().indexOf('no pg')>-1&&(!set.revenue||!set.website||!set.email))status='wait';
      if(card.type&&card.type.toLowerCase().indexOf('corporate')>-1&&(!set.revenue||!set.bank))status=missing.length<=2?'almost':'wait';
      return {missing:missing,recommendedMissing:recommendedMissing,status:status};
    }
    function statusLabel(status){return status==='ready'?'Ready now':status==='almost'?'Almost ready':'Do not apply yet'}
    function renderMatcher(){
      var set=selectedSignals();
      var selected=Object.keys(set).length;
      var pct=Math.round(selected/signalTotal*100);
      if(scoreEl)scoreEl.textContent=pct+'%';
      if(countEl)countEl.textContent=selected+' of '+signalTotal+' signals ready';
      var ready=0, almost=0, html='';
      var query=(librarySearch&&librarySearch.value||'').toLowerCase();
      var category=(libraryCategory&&libraryCategory.value)||'all';
      cardData.forEach(function(card,index){
        var fit=classify(card,set);
        if(fit.status==='ready')ready++;
        if(fit.status==='almost')almost++;
        if(activeFilter!=='all'&&fit.status!==activeFilter)return;
        if(category!=='all'&&card.category!==category)return;
        if(query&&(card.name+' '+card.category+' '+card.type+' '+card.notes+' '+card.reports).toLowerCase().indexOf(query)<0)return;
        html += "<button class='vendor-match-card compact card-match-card " + fit.status + "' type='button' data-card-detail='" + index + "'><span class='match-status " + fit.status + "'>" + statusLabel(fit.status) + "</span><strong>" + escapeHtml(card.name) + "</strong><small>" + escapeHtml(card.category) + "</small><em>" + (fit.status==='wait'?'Do not waste an application':fit.missing.length?fit.missing.length+' required signal(s) missing':'Core match') + "</em></button>";
      });
      resultBox.innerHTML=html||"<p class='legal'>No card options match that search yet.</p>";
      if(recommendation){
        var strong=recommendation.querySelector('strong'), span=recommendation.querySelector('span');
        if(ready>0){strong.textContent=ready+' card options look aligned.'; span.textContent='Verify the issuer terms, apply selectively, and track utilization and payment dates.'}
        else if(almost>0){strong.textContent=almost+' card options are close.'; span.textContent='Finish the missing signals before applying so you do not burn an inquiry or waste an application.'}
        else {strong.textContent='Do not apply yet.'; span.textContent='Business credit cards are not the first step. Build identity, banking, website/email, and the right secured or starter path first.'}
      }
      try{localStorage.setItem('vf-card-signals',JSON.stringify(Object.keys(set)))}catch(e){}
    }
    function openCardDetail(index){
      var card=cardData[index];
      if(!card)return;
      var fit=classify(card,selectedSignals());
      var missingText=fit.missing.length?fit.missing.map(function(k){return signalLabels[k]}).join(', '):'Core prerequisites selected';
      var recText=fit.recommendedMissing.length?fit.recommendedMissing.map(function(k){return signalLabels[k]}).join(', '):'Recommended signals selected';
      detail.querySelector('[data-card-detail-body]').innerHTML="<div class='vendor-match-top'><span class='match-status "+fit.status+"'>"+statusLabel(fit.status)+"</span><span>"+escapeHtml(card.category)+"</span></div><h2>"+escapeHtml(card.name)+"</h2><p>"+escapeHtml(card.notes)+"</p><div class='vendor-prereqs'><strong>Card type</strong><span>"+escapeHtml(card.type)+"</span></div><div class='vendor-prereqs'><strong>Required prerequisites</strong><span>"+card.requires.map(function(k){return signalLabels[k]}).join(', ')+"</span></div><div class='vendor-prereqs'><strong>Recommended signals</strong><span>"+card.recommended.map(function(k){return signalLabels[k]}).join(', ')+"</span></div><div class='vendor-prereqs'><strong>Reports / review note</strong><span>"+escapeHtml(card.reports)+"</span></div><div class='vendor-gap "+(fit.status==='wait'?'danger':'')+"'><strong>Match note:</strong> "+(fit.status==='ready'?'You selected the core prerequisites. Verify current issuer terms before applying.':fit.status==='almost'?'Fix these first before applying: '+missingText:'Do not waste an application yet. Build these missing items first: '+missingText)+".</div><small>Helpful next improvements: "+recText+".</small><small>Research note: "+escapeHtml(card.source||'Card/issuer research')+". Requirements, deposits, personal guarantees, rewards, and reporting can change.</small><div class='proof-actions'><a class='btn' href='"+escapeHtml(card.url)+"' target='_blank' rel='noopener'>Open issuer site</a><button class='btn secondary' type='button' data-card-detail-close>Close</button></div>";
      detail.classList.remove('hide');
    }
    try{
      JSON.parse(localStorage.getItem('vf-card-signals')||'[]').forEach(function(key){
        var input=matcher.querySelector('[data-card-signal=\"'+key+'\"]'); if(input)input.checked=true;
      });
    }catch(e){}
    matcher.querySelectorAll('[data-card-signal]').forEach(function(input){input.addEventListener('change',function(){
      renderMatcher();
      saveMemberSignal('card',readArray('vf-card-signals'));
    })});
    matcher.querySelectorAll('[data-card-match-filter]').forEach(function(btn){
      btn.addEventListener('click',function(){
        activeFilter=btn.getAttribute('data-card-match-filter');
        matcher.querySelectorAll('[data-card-match-filter]').forEach(function(b){b.classList.toggle('active',b===btn)});
        renderMatcher();
      });
    });
    if(librarySearch)librarySearch.addEventListener('input',renderMatcher);
    if(libraryCategory)libraryCategory.addEventListener('change',renderMatcher);
    resultBox.addEventListener('click',function(e){
      var card=e.target.closest('[data-card-detail]');
      if(card)openCardDetail(Number(card.getAttribute('data-card-detail')));
    });
    detail.addEventListener('click',function(e){if(e.target.closest('[data-card-detail-close]'))detail.classList.add('hide')});
    renderMatcher();
  }
  function applyModuleLabels(){
    document.querySelectorAll('body *').forEach(function(el){
      if(el.children.length)return;
      var text=el.textContent.trim();
      if(text==='Nav, eCredable, and revolving account timing.')el.textContent='Nav, eCredable, and business credit card timing.';
    });
  }
  function initFundingMatcher(){
    var matcher=document.querySelector('[data-funding-match-tool]');
    if(!matcher)return;
    var fundingData=window.vfFundingLibrary||[];
    var signalLabels={entity:'Legal entity',ein:'EIN',address:'Valid business address',bank:'Business bank account',relationship:'Bank relationship started',statements:'3-6 months bank statements',reserve:'Cash reserve / CD funds',revenue:'Revenue / cash flow',time2yr:'2+ years in business',goodCredit:'Good personal credit',taxReturns:'Tax returns / financials',collateral:'Collateral available',plan:'Business plan / funding purpose',tradelines:'Existing tradelines',noRecentNegatives:'No recent negatives',pgOk:'Personal guarantee acceptable',website:'Website',email:'Domain email'};
    var signalTotal=16;
    var resultBox=matcher.querySelector('[data-funding-match-results]');
    var librarySearch=matcher.querySelector('[data-funding-library-search]');
    var libraryCategory=matcher.querySelector('[data-funding-library-category]');
    var recommendation=matcher.querySelector('[data-funding-recommendation]');
    var scoreEl=matcher.querySelector('[data-funding-score]');
    var countEl=matcher.querySelector('[data-funding-count]');
    var activeFilter='all';
    var detail=document.createElement('div');
    detail.className='vendor-detail-modal hide funding-detail-modal';
    detail.innerHTML="<div class='vendor-detail-backdrop' data-funding-detail-close></div><article class='vendor-detail-card'><button class='vendor-detail-close' type='button' data-funding-detail-close>Close</button><div data-funding-detail-body></div></article>";
    document.body.appendChild(detail);
    if(libraryCategory){
      var cats=[];
      fundingData.forEach(function(item){if(cats.indexOf(item.category)<0)cats.push(item.category)});
      cats.sort().forEach(function(cat){var opt=document.createElement('option');opt.value=cat;opt.textContent=cat;libraryCategory.appendChild(opt)});
    }
    function selectedSignals(){
      var set={};
      matcher.querySelectorAll('[data-funding-signal]').forEach(function(input){if(input.checked)set[input.getAttribute('data-funding-signal')]=true});
      return set;
    }
    function classify(item,set){
      var missing=item.requires.filter(function(key){return !set[key]});
      var recommendedMissing=item.recommended.filter(function(key){return !set[key]});
      var status=missing.length===0?'ready':missing.length<=2?'almost':'wait';
      if((item.category==='SBA-backed funding'||item.category==='Traditional bank loan')&&(!set.revenue||!set.plan||!set.goodCredit))status=missing.length<=2?'almost':'wait';
      if(item.category==='CD / asset-secured loan'&&!set.reserve&&!set.collateral)status='wait';
      if(item.category==='Cash-secured credit line'&&!set.reserve)status='wait';
      if(item.category==='Funding caution')status=set.revenue?'almost':'wait';
      return {missing:missing,recommendedMissing:recommendedMissing,status:status};
    }
    function statusLabel(status){return status==='ready'?'Ready now':status==='almost'?'Almost ready':'Do not apply yet'}
    function renderMatcher(){
      var set=selectedSignals();
      var selected=Object.keys(set).length;
      var pct=Math.round(selected/signalTotal*100);
      if(scoreEl)scoreEl.textContent=pct+'%';
      if(countEl)countEl.textContent=selected+' of '+signalTotal+' signals ready';
      var ready=0, almost=0, html='';
      var query=(librarySearch&&librarySearch.value||'').toLowerCase();
      var category=(libraryCategory&&libraryCategory.value)||'all';
      fundingData.forEach(function(item,index){
        var fit=classify(item,set);
        if(fit.status==='ready')ready++;
        if(fit.status==='almost')almost++;
        if(activeFilter!=='all'&&fit.status!==activeFilter)return;
        if(category!=='all'&&item.category!==category)return;
        if(query&&(item.name+' '+item.category+' '+item.type+' '+item.notes).toLowerCase().indexOf(query)<0)return;
        html += "<button class='vendor-match-card compact funding-match-card " + fit.status + "' type='button' data-funding-detail='" + index + "'><span class='match-status " + fit.status + "'>" + statusLabel(fit.status) + "</span><strong>" + escapeHtml(item.name) + "</strong><small>" + escapeHtml(item.category) + "</small><em>" + (fit.status==='wait'?'Do not waste an application':fit.missing.length?fit.missing.length+' required signal(s) missing':'Funding path aligned') + "</em></button>";
      });
      resultBox.innerHTML=html||"<p class='legal'>No funding options match that search yet.</p>";
      if(recommendation){
        var strong=recommendation.querySelector('strong'), span=recommendation.querySelector('span');
        if(ready>0){strong.textContent=ready+' funding paths look aligned.'; span.textContent='Talk with the bank or lender before applying, verify documentation, and keep proof of every term and payment.'}
        else if(almost>0){strong.textContent=almost+' funding paths are close.'; span.textContent='Finish the missing banking, reserve, revenue, or documentation items before submitting applications.'}
        else {strong.textContent='Do not apply yet.'; span.textContent='Build the bank relationship, cash reserve, statements, plan, and documentation first so the business does not waste funding applications.'}
      }
      try{localStorage.setItem('vf-funding-signals',JSON.stringify(Object.keys(set)))}catch(e){}
    }
    function openFundingDetail(index){
      var item=fundingData[index];
      if(!item)return;
      var fit=classify(item,selectedSignals());
      var missingText=fit.missing.length?fit.missing.map(function(k){return signalLabels[k]}).join(', '):'Core prerequisites selected';
      var recText=fit.recommendedMissing.length?fit.recommendedMissing.map(function(k){return signalLabels[k]}).join(', '):'Recommended signals selected';
      detail.querySelector('[data-funding-detail-body]').innerHTML="<div class='vendor-match-top'><span class='match-status "+fit.status+"'>"+statusLabel(fit.status)+"</span><span>"+escapeHtml(item.category)+"</span></div><h2>"+escapeHtml(item.name)+"</h2><p>"+escapeHtml(item.notes)+"</p><div class='vendor-prereqs'><strong>Funding type</strong><span>"+escapeHtml(item.type)+"</span></div><div class='vendor-prereqs'><strong>Required prerequisites</strong><span>"+item.requires.map(function(k){return signalLabels[k]}).join(', ')+"</span></div><div class='vendor-prereqs'><strong>Recommended signals</strong><span>"+item.recommended.map(function(k){return signalLabels[k]}).join(', ')+"</span></div><div class='vendor-gap "+(fit.status==='wait'?'danger':'')+"'><strong>Match note:</strong> "+(fit.status==='ready'?'This funding path matches the core selected signals. Verify lender terms before applying.':fit.status==='almost'?'Fix these first before applying: '+missingText:'Do not waste a funding application yet. Build these missing items first: '+missingText)+".</div><small>Helpful next improvements: "+recText+".</small><small>Research note: "+escapeHtml(item.source||'Funding research')+". Requirements, documentation, collateral, guarantees, and reporting can change.</small><div class='proof-actions'><a class='btn' href='"+escapeHtml(item.url)+"' target='_blank' rel='noopener'>Open resource</a><button class='btn secondary' type='button' data-funding-detail-close>Close</button></div>";
      detail.classList.remove('hide');
    }
    try{
      JSON.parse(localStorage.getItem('vf-funding-signals')||'[]').forEach(function(key){
        var input=matcher.querySelector('[data-funding-signal=\"'+key+'\"]'); if(input)input.checked=true;
      });
    }catch(e){}
    matcher.querySelectorAll('[data-funding-signal]').forEach(function(input){input.addEventListener('change',function(){
      renderMatcher();
      saveMemberSignal('funding',readArray('vf-funding-signals'));
    })});
    matcher.querySelectorAll('[data-funding-match-filter]').forEach(function(btn){
      btn.addEventListener('click',function(){
        activeFilter=btn.getAttribute('data-funding-match-filter');
        matcher.querySelectorAll('[data-funding-match-filter]').forEach(function(b){b.classList.toggle('active',b===btn)});
        renderMatcher();
      });
    });
    if(librarySearch)librarySearch.addEventListener('input',renderMatcher);
    if(libraryCategory)libraryCategory.addEventListener('change',renderMatcher);
    resultBox.addEventListener('click',function(e){
      var card=e.target.closest('[data-funding-detail]');
      if(card)openFundingDetail(Number(card.getAttribute('data-funding-detail')));
    });
    detail.addEventListener('click',function(e){if(e.target.closest('[data-funding-detail-close]'))detail.classList.add('hide')});
    renderMatcher();
  }
  function isFundingPage(){
    return document.querySelector('.page-title')&&document.querySelector('.page-title').textContent.trim()==='CD-secured business loans';
  }
  function upgradeFundingPage(){
    if(!window.vfFundingLibrary||!isFundingPage())return;
    if(document.querySelector('[data-funding-match-tool]'))return;
    var blocks=[].slice.call(document.querySelectorAll('.member-main .content-block'));
    var target=blocks.find(function(block){return block.textContent.indexOf('Recommended options for this step')>-1});
    if(!target)return;
    target.className='content-block vendor-match-tool funding-match-tool';
    target.setAttribute('data-funding-match-tool','');
    target.innerHTML="<div class='proof-actions funding-back-nav' data-funding-back-nav><a class='btn secondary' href='/cd-business-loans/'>Back to Module 7 lesson</a><a class='btn ghost' href='/about-net-30/'>Back to Module 6</a><a class='btn ghost' href='/homeefe757a6/'>Dashboard</a></div><div class='vendor-match-head'><div><p class='kicker'>Funding readiness matcher</p><h2>Match the business to realistic bank funding paths before applying.</h2><p>Check what the company already has. This tool compares the member profile against CD-secured loans, secured lines, SBA-backed options, community lenders, and equipment or receivables financing.</p></div><div class='vendor-score-card'><span data-funding-score>0%</span><strong>Funding readiness</strong><small data-funding-count>0 of 16 signals ready</small></div></div><div class='vendor-intake-grid'><label><input type='checkbox' data-funding-signal='entity'> Legal entity formed</label><label><input type='checkbox' data-funding-signal='ein'> EIN issued by IRS</label><label><input type='checkbox' data-funding-signal='address'> Valid business address</label><label><input type='checkbox' data-funding-signal='bank'> Business bank account</label><label><input type='checkbox' data-funding-signal='relationship'> Bank relationship started</label><label><input type='checkbox' data-funding-signal='statements'> 3-6 months bank statements</label><label><input type='checkbox' data-funding-signal='reserve'> Cash reserve / CD funds</label><label><input type='checkbox' data-funding-signal='revenue'> Revenue / cash flow showing</label><label><input type='checkbox' data-funding-signal='time2yr'> 2+ years in business</label><label><input type='checkbox' data-funding-signal='goodCredit'> Good personal credit</label><label><input type='checkbox' data-funding-signal='taxReturns'> Tax returns / financials ready</label><label><input type='checkbox' data-funding-signal='collateral'> Collateral available</label><label><input type='checkbox' data-funding-signal='plan'> Funding purpose / plan</label><label><input type='checkbox' data-funding-signal='tradelines'> Existing tradelines</label><label><input type='checkbox' data-funding-signal='noRecentNegatives'> No recent negatives</label><label><input type='checkbox' data-funding-signal='pgOk'> Personal guarantee acceptable</label></div><div class='vendor-recommendation funding-recommendation' data-funding-recommendation><strong>Do not apply yet.</strong><span>Check the items you already have to see which funding path fits this business stage.</span></div><div class='vendor-library-tools'><input class='input' data-funding-library-search placeholder='Search funding options'><select class='input' data-funding-library-category><option value='all'>All categories</option></select></div><div class='vendor-match-filters'><button class='vendor-filter active' type='button' data-funding-match-filter='all'>All funding paths</button><button class='vendor-filter' type='button' data-funding-match-filter='ready'>Ready now</button><button class='vendor-filter' type='button' data-funding-match-filter='almost'>Almost ready</button><button class='vendor-filter' type='button' data-funding-match-filter='wait'>Do not apply yet</button></div><div class='vendor-match-grid' data-funding-match-results></div><p class='legal vendor-disclaimer'><strong>Funding warning:</strong> lender requirements, guarantees, collateral rules, rates, terms, and documentation can change. This is a readiness guide, not guaranteed approval. Do not submit funding applications until the business can support the request.</p>";
    var note=blocks.find(function(block){return block.textContent.indexOf('Secured credit note')>-1});
    if(note){
      note.innerHTML="<p class='kicker'>Funding strategy note</p><h2>Bank funding should be matched to the business stage, not chased too early.</h2><p>CD-secured and cash-secured products can help create a lower-risk bank relationship. SBA, term-loan, and line-of-credit paths require stronger documentation, revenue, credit, and underwriting support.</p><div class='lesson-note-list'><span>Ask the bank what documentation is required before applying.</span><span>Use deposit-backed options only with funds the business can keep reserved.</span><span>Avoid high-cost funding unless cash flow can clearly support it.</span><span>Save loan documents, terms, payment proof, and payoff proof.</span></div>";
    }
    document.querySelectorAll('a[href="/homeefe757a6/"],a[href="/support/"]').forEach(function(a){
      var text=a.textContent.trim().toLowerCase();
      if(text==='dashboard'||text==='continue to coaching and support'||text==='support') {
        a.href='/final-readiness-summary/';
        a.textContent=text==='dashboard'?'Final summary':'Continue to final summary';
      }
    });
    document.querySelectorAll('.next-lesson-card h3').forEach(function(h){if(h.textContent.trim()==='Dashboard')h.textContent='Final summary'});
  }
  function isBusinessCardPage(){
    return document.querySelector('.page-title')&&document.querySelector('.page-title').textContent.trim()==='Revolving business credit cards';
  }
  function upgradeBusinessCardPage(){
    if(!window.vfCardLibrary||!isBusinessCardPage())return;
    if(document.querySelector('[data-card-match-tool]'))return;
    var blocks=[].slice.call(document.querySelectorAll('.member-main .content-block'));
    var target=blocks.find(function(block){return block.textContent.indexOf('Recommended options for this step')>-1});
    if(!target)return;
    target.className='content-block vendor-match-tool card-match-tool';
    target.setAttribute('data-card-match-tool','');
    target.innerHTML="<div class='proof-actions funding-back-nav' data-funding-back-nav><a class='btn secondary' href='/cd-business-loans/'>Back to Module 7 lesson</a><a class='btn ghost' href='/about-net-30/'>Back to Module 6</a><a class='btn ghost' href='/homeefe757a6/'>Dashboard</a></div><div class='vendor-match-head'><div><p class='kicker'>Business card readiness matcher</p><h2>Match the business profile to secured, corporate, and revolving card options.</h2><p>Check what the company already has. This tool separates secured cards, bank cards, corporate no-PG cards, store cards, and fleet cards so members do not waste applications before the profile is ready.</p></div><div class='vendor-score-card'><span data-card-score>0%</span><strong>Card readiness</strong><small data-card-count>0 of 14 signals ready</small></div></div><div class='vendor-intake-grid'><label><input type='checkbox' data-card-signal='entity'> Legal entity formed</label><label><input type='checkbox' data-card-signal='ein'> EIN issued by IRS</label><label><input type='checkbox' data-card-signal='phone'> Business phone number</label><label><input type='checkbox' data-card-signal='address'> Valid business address</label><label><input type='checkbox' data-card-signal='website'> Business website</label><label><input type='checkbox' data-card-signal='email'> Domain business email</label><label><input type='checkbox' data-card-signal='bank'> Business bank account</label><label><input type='checkbox' data-card-signal='time'> 90+ days in business records</label><label><input type='checkbox' data-card-signal='tradelines'> Existing vendor tradelines</label><label><input type='checkbox' data-card-signal='goodCredit'> Good personal credit</label><label><input type='checkbox' data-card-signal='pgOk'> Personal guarantee acceptable</label><label><input type='checkbox' data-card-signal='deposit'> Deposit available for secured card</label><label><input type='checkbox' data-card-signal='revenue'> Revenue / cash flow showing</label><label><input type='checkbox' data-card-signal='noPgNeed'> Need no-PG corporate card</label></div><div class='vendor-recommendation card-recommendation' data-card-recommendation><strong>Do not apply yet.</strong><span>Check the items you already have to see which card path fits this business stage.</span></div><div class='vendor-library-tools'><input class='input' data-card-library-search placeholder='Search card library'><select class='input' data-card-library-category><option value='all'>All categories</option></select></div><div class='vendor-match-filters'><button class='vendor-filter active' type='button' data-card-match-filter='all'>All cards</button><button class='vendor-filter' type='button' data-card-match-filter='ready'>Ready now</button><button class='vendor-filter' type='button' data-card-match-filter='almost'>Almost ready</button><button class='vendor-filter' type='button' data-card-match-filter='wait'>Do not apply yet</button></div><div class='vendor-match-grid' data-card-match-results></div><p class='legal vendor-disclaimer'><strong>Application warning:</strong> issuer requirements, deposits, personal guarantees, rewards, and bureau reporting can change. This is a readiness guide, not guaranteed approval. Apply only when the company profile matches the card path.</p>";
    var note=blocks.find(function(block){return block.textContent.indexOf('Credit card timing note')>-1});
    if(note){
      note.innerHTML="<p class='kicker'>Business card timing note</p><h2>Secured, corporate, store, fleet, and traditional bank cards are different tools.</h2><p>Use secured cards when a deposit is the safest bridge. Use traditional business cards when owner credit and the business profile can support underwriting. Use corporate no-PG cards only when the business has the cash flow, bank activity, website, email, and operating history those platforms review.</p><div class='lesson-note-list'><span>Do not use credit cards as a replacement for proper setup.</span><span>Do not waste applications before matching the prerequisites.</span><span>Keep utilization controlled after approval.</span><span>Verify current reporting before assuming a card builds business credit.</span></div>";
    }
  }
  function initDemoDrive(){
  
  document.querySelectorAll('[data-bank-rating-tool]').forEach(function(tool){
    if(tool.getAttribute('data-bank-rating-ready'))return;
    tool.setAttribute('data-bank-rating-ready','true');
    var result=tool.querySelector('[data-bank-rating-result]');
    var note=tool.querySelector('[data-bank-rating-note]');
    var key='vf-bank-rating-tracker';
    function field(name){return tool.querySelector('[data-bank-rating-field="'+name+'"]')}
    function value(name){var el=field(name);return el?Number(el.value||0):0}
    function reviewValue(){var el=field('review');return el?el.value.trim():''}
    function statusFromScore(score,nsf){
      if(nsf===0||score<5)return {code:'wait',label:'Build first',title:'Do not use this bank profile for stronger applications yet.',copy:'The account needs cleaner handling, more balance strength, or more history before the business asks for stronger credit.',next:['Correct overdraft or NSF activity first.','Keep deposits and balances stable for the next 30 to 90 days.','Save monthly statements as proof.']};
      if(score<8)return {code:'almost',label:'Building',title:'The banking foundation is improving, but it still needs time.',copy:'The business may be able to continue the buildout, but stronger cards or funding should wait until the balance and account history are stronger.',next:['Keep the account clean.','Set a target average balance.','Review again before vendor, card, or funding applications.']};
      return {code:'ready',label:'Stronger foundation',title:'The bank profile is in a stronger position.',copy:'This does not guarantee approval, but the account is showing better balance, age, deposit, and clean activity signals.',next:['Save current statements.','Confirm NAP and EIN details match the bank account.','Continue only when the rest of the readiness checklist is complete.']};
    }
    function render(data){
      var balance=data&&data.balance!=null?Number(data.balance):value('balance');
      var age=data&&data.age!=null?Number(data.age):value('age');
      var deposits=data&&data.deposits!=null?Number(data.deposits):value('deposits');
      var nsf=data&&data.nsf!=null?Number(data.nsf):value('nsf');
      var review=data&&data.review!=null?data.review:reviewValue();
      var score=balance+age+deposits+nsf;
      var status=statusFromScore(score,nsf);
      if(result){
        result.innerHTML="<span class='rating-pill "+status.code+"'>"+escapeHtml(status.label)+"</span><h3>"+escapeHtml(status.title)+"</h3><p>"+escapeHtml(status.copy)+"</p><div class='bank-rating-score'><strong>"+score+" / 12</strong><span>Banking readiness estimate</span></div><ul>"+status.next.map(function(item){return '<li>'+escapeHtml(item)+'</li>'}).join('')+"</ul>"+(review?"<p class='legal'><strong>Next review:</strong> "+escapeHtml(review)+"</p>":'');
      }
      return {balance:balance,age:age,deposits:deposits,nsf:nsf,review:review,score:score,status:status.label};
    }
    function save(){
      var data=render();
      try{localStorage.setItem(key,JSON.stringify(data))}catch(e){}
      if(note)note.textContent='Saved tracker result: '+data.status+' ('+data.score+' / 12). Use the checklist below to mark the review complete.';
    }
    try{
      var saved=JSON.parse(localStorage.getItem(key)||'null');
      if(saved){
        ['balance','age','deposits','nsf','review'].forEach(function(name){var el=field(name);if(el&&saved[name]!=null)el.value=saved[name]});
        render(saved);
        if(note)note.textContent='Loaded saved tracker result: '+saved.status+' ('+saved.score+' / 12).';
      }
    }catch(e){}
    var calc=tool.querySelector('[data-bank-rating-calc]');
    var saveBtn=tool.querySelector('[data-bank-rating-save]');
    var reset=tool.querySelector('[data-bank-rating-reset]');
    if(calc)calc.addEventListener('click',function(){render()});
    if(saveBtn)saveBtn.addEventListener('click',save);
    if(reset)reset.addEventListener('click',function(){
      ['balance','age','deposits','nsf'].forEach(function(name){var el=field(name);if(el)el.selectedIndex=0});
      var review=field('review'); if(review)review.value='';
      try{localStorage.removeItem(key)}catch(e){}
      if(result)result.innerHTML="<span class='rating-pill wait'>Not calculated</span><h3>Enter the banking facts and calculate the status.</h3><p>This will show whether the business should wait, build more bank history, or prepare for stronger credit conversations.</p><ul><li>Average balance matters.</li><li>Clean account handling matters.</li><li>Account age and deposits matter.</li></ul>";
      if(note)note.textContent='Saved results stay in this browser and can be used as proof that the member reviewed banking readiness before applying.';
    });
  });
  document.querySelectorAll('[data-demo-drive]').forEach(function(demo){
    if(demo.getAttribute('data-demo-initialized'))return;
    demo.setAttribute('data-demo-initialized','true');
    var scoreEls=document.querySelectorAll('[data-demo-score]');
    var stageEls=document.querySelectorAll('[data-demo-stage]');
    var fillEls=document.querySelectorAll('[data-demo-fill]');
    var summaryEls=demo.querySelectorAll('[data-demo-summary]');
    var vendorBox=demo.querySelector('[data-demo-vendors]');
    var cardBox=demo.querySelector('[data-demo-cards]');
    var vendorCount=demo.querySelector('[data-demo-vendor-count]');
    var cardCount=demo.querySelector('[data-demo-card-count]');
    var report=demo.querySelector('[data-demo-report]');
    var nextList=demo.querySelector('[data-demo-next]');
    var riskList=demo.querySelector('[data-demo-risk-list]');
    var reportOpen=demo.querySelector('[data-demo-report-open]');
    var currentReport={score:0,stage:'Too early to apply',summary:'Start by checking the sample signals.',next:[]};
    var labels={entity:'legal entity',ein:'EIN',phone:'right type of business phone with professional call handling',directory:'Business 411 listing',address:'right type of commercial address lenders can validate',website:'professional website',email:'domain business email',bank:'business bank account',time:'90+ days in records',tradelines:'tradeline history',credit:'owner credit support',deposit:'deposit available'};
    var vendors=[
      {name:'Starter office supplier',type:'Net 30 sample',requires:['entity','ein','phone','address','bank'],recommended:['directory','website','email']},
      {name:'Commercial fuel account',type:'Fleet sample',requires:['entity','ein','phone','address','bank','time'],recommended:['website','email','tradelines']},
      {name:'Industrial supplier',type:'Trade account sample',requires:['entity','ein','phone','address','bank','website'],recommended:['directory','email','tradelines']},
      {name:'Higher-tier vendor',type:'Established profile sample',requires:['entity','ein','phone','directory','address','website','email','bank','time','tradelines'],recommended:['credit']}
    ];
    var cards=[
      {name:'HarborLine Bank Secured Visa',type:'Secured business credit card',requires:['entity','ein','address','bank','deposit'],recommended:['phone','website','email']},
      {name:'Summit Bank Business Rewards',type:'Bank business credit card',requires:['entity','ein','phone','address','website','email','bank','credit'],recommended:['time','tradelines']},
      {name:'Pioneer Commercial Fleet Card',type:'Fleet and fuel card',requires:['entity','ein','phone','address','bank'],recommended:['directory','website','email','time']},
      {name:'CapitalBridge Corporate Charge',type:'Corporate charge card',requires:['entity','ein','website','email','bank','time','tradelines'],recommended:['credit']}
    ];
    var presets={
      start:['ein','phone'],
      partial:['entity','ein','phone','directory','address','website','email','bank'],
      ready:['entity','ein','phone','directory','address','website','email','bank','time','tradelines','credit','deposit']
    };
    function selected(){
      var set={};
      demo.querySelectorAll('[data-demo-signal]').forEach(function(input){
        if(input.checked)set[input.getAttribute('data-demo-signal')]=true;
      });
      var visibleKeys=[];
      demo.querySelectorAll('[data-demo-visual-signal]').forEach(function(item){
        visibleKeys.push(item.getAttribute('data-demo-visual-signal'));
      });
      var allVisibleReady=visibleKeys.length&&visibleKeys.every(function(key){return !!set[key]});
      if(allVisibleReady){
        ['entity','tradelines','credit','deposit'].forEach(function(key){set[key]=true});
      }
      return set;
    }
    function applyPreset(name){
      var selectedPreset=presets[name]||[];
      demo.querySelectorAll('[data-demo-signal]').forEach(function(input){
        input.checked=selectedPreset.indexOf(input.getAttribute('data-demo-signal'))>-1;
      });
      demo.querySelectorAll('[data-demo-preset]').forEach(function(btn){
        btn.classList.toggle('active',btn.getAttribute('data-demo-preset')===name);
      });
      render();
    }
    function missingText(keys,set){
      var missing=keys.filter(function(k){return !set[k]});
      return missing.length?missing.map(function(k){return labels[k]||k}).join(', '):'Core items selected';
    }
    function classify(item,set){
      var missing=item.requires.filter(function(k){return !set[k]});
      if(missing.length===0)return 'ready';
      if(missing.length<=2)return 'almost';
      return 'wait';
    }
    function statusText(status){
      return status==='ready'?'Ready':status==='almost'?'Almost ready':'Do not apply yet';
    }
    function cardHtml(item,set){
      var status=classify(item,set);
      var reqMissing=missingText(item.requires,set);
      var recMissing=missingText(item.recommended,set);
      return "<button class='vendor-match-card compact demo-sample-card "+status+"' type='button'><span class='match-status "+status+"'>"+statusText(status)+"</span><strong>"+escapeHtml(item.name)+"</strong><small>"+escapeHtml(item.type)+"</small><em>"+(status==='ready'?'Verify exact criteria inside':status==='almost'?'Fix or verify: '+escapeHtml(reqMissing):'Do not apply yet')+"</em></button>";
    }
    function riskItems(set){
      var risks=[];
      if(set.phone)risks.push('The phone number may be present, but it still has to pull up with the business profile and not classify as mobile/residential.');
      else risks.push('The phone number may not pull up with the business profile or may classify as mobile/residential.');
      if(set.website)risks.push('The website may exist, but it can still look incomplete, template-built, or disconnected from the legal business name.');
      else risks.push('The website may look incomplete, template-built, or disconnected from the legal business name.');
      if(set.entity)risks.push('Secretary of State information may exist, but the name, status, and state record still have to match the application.');
      else risks.push('Secretary of State information may be missing or not match application records.');
      if(set.address)risks.push('The address may be present, but it still has to validate as a real commercial location, not mailbox-only.');
      else risks.push('The address may look mailbox-only or fail as a real commercial location.');
      if(!set.directory)risks.push('Business 411 or directory records may not connect the phone number to the company.');
      if(!set.email)risks.push('A domain business email may be missing, which can make the company look less established.');
      if(!set.ein)risks.push('EIN records may not be captured consistently across bank, vendor, and public records.');
      if(!set.bank)risks.push('Banking history may not support underwriting yet.');
      if(!set.time)risks.push('The business may be too new for vendors that look for 90+ days in records.');
      if(!risks.length)risks.push('Even when signals are present, the platform still verifies the exact phone type, address type, website quality, public records, and matching NAP information before applications.');
      return risks.slice(0,4);
    }
    function render(){
      var set=selected();
      var checked=Object.keys(set).length;
      var score=Math.round((checked/12)*100);
      var stage=score>=84?'Application path preview ready':score>=58?'Some signals present, risks remain':score>=34?'Build the foundation first':'Too early to apply';
      var summary=score>=84?'This sample profile has most readiness signals selected. Members still verify that the phone, address, website, email, banking, and public records meet the right criteria before applying.':score>=58?'This sample business is close, but weak or wrong identifiers can still create denials. The platform checks whether each signal is the right type, not merely present.':score>=34?'The foundation is forming, but applications should wait until the business has the right phone setup, valid address, website, domain email, banking, and timing signals.':'This is where many new businesses start. Build the business identity first, then make sure each identifier meets lender and vendor expectations.';
      scoreEls.forEach(function(el){el.textContent=score});
      stageEls.forEach(function(el){el.textContent=stage});
      fillEls.forEach(function(el){el.style.width=score+'%'});
      summaryEls.forEach(function(el){el.textContent=summary});
      var vendorReady=vendors.filter(function(item){return classify(item,set)==='ready'}).length;
      var cardReady=cards.filter(function(item){return classify(item,set)==='ready'}).length;
      if(vendorCount)vendorCount.textContent=vendorReady+' ready';
      if(cardCount)cardCount.textContent=cardReady+' ready';
      demo.querySelectorAll('[data-demo-visual-signal]').forEach(function(item){
        var key=item.getAttribute('data-demo-visual-signal');
        item.classList.toggle('checked',!!set[key]);
        item.setAttribute('aria-pressed',set[key]?'true':'false');
      });
      if(vendorBox)vendorBox.innerHTML=vendors.map(function(item){return cardHtml(item,set)}).join('');
      if(cardBox)cardBox.innerHTML=cards.map(function(item){return cardHtml(item,set)}).join('');
      var next=[];
      ['entity','ein','phone','directory','address','website','email','bank','time','tradelines','credit','deposit'].forEach(function(k){
        if(!set[k]&&next.length<5)next.push('Add or verify '+labels[k]+'.');
      });
      if(!next.length)next.push('Use the paid platform to verify the exact vendor, card, funding, and reporting rules before applying.');
      if(report)report.textContent=summary+' The paid report saves the member profile, readiness stage, next actions, and likely qualification path without exporting the lesson content.';
      if(nextList)nextList.innerHTML=next.map(function(item){return '<li>'+escapeHtml(item)+'</li>'}).join('');
      if(riskList)riskList.innerHTML=riskItems(set).map(function(item){return '<li>'+escapeHtml(item)+'</li>'}).join('');
      currentReport={score:score,stage:stage,summary:summary,next:next,checked:checked,vendorReady:vendorReady,cardReady:cardReady,set:set};
    }
    function openSampleReport(){
      var modal=document.querySelector('[data-demo-report-modal]');
      if(!modal){
        modal=document.createElement('div');
        modal.className='vendor-detail-modal demo-report-modal hide';
        modal.setAttribute('data-demo-report-modal','');
        modal.innerHTML="<div class='vendor-detail-backdrop' data-demo-report-close></div><article class='vendor-detail-card demo-report-card'><button class='vendor-detail-close' type='button' data-demo-report-close>Close</button><div data-demo-report-body></div></article>";
        document.body.appendChild(modal);
        modal.addEventListener('click',function(e){if(e.target.closest('[data-demo-report-close]'))modal.classList.add('hide')});
      }
      var sampleName='Blue Harbor Logistics LLC';
      var generated=new Date().toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
      var set=currentReport.set||{};
      var profileRows=[
        ['Legal business name',sampleName,true],
        ['State','Florida',true],
        ['EIN',set.ein?'Captured':'Needs verification',!!set.ein],
        ['Business phone',set.phone?'Right type selected':'Needs commercial phone review',!!set.phone],
        ['Business 411',set.directory?'Listing selected':'Not listed yet',!!set.directory],
        ['Business address',set.address?'Commercial address selected':'Address criteria missing',!!set.address],
        ['Website',set.website?'Professional website selected':'Website missing',!!set.website],
        ['Domain email',set.email?'Domain email selected':'Domain email missing',!!set.email]
      ].map(function(row){return "<div class='profile-row "+(row[2]?'done':'missing')+"'><strong>"+escapeHtml(row[0])+"</strong><span>"+escapeHtml(row[1])+"</span></div>"}).join('');
      var qualCards=[
        {label:'Net 30 vendor path',status:currentReport.vendorReady>0?'Review ready':'Build first',cls:currentReport.vendorReady>0?'ready':'wait',note:currentReport.vendorReady>0?'Some sample vendor paths match the selected profile signals. Full vendor criteria stay inside the platform.':'The business should finish identity, address, phone, banking, and timing signals before vendor applications.'},
        {label:'Credit card path',status:currentReport.cardReady>0?'Review ready':'Do not apply yet',cls:currentReport.cardReady>0?'ready':'wait',note:currentReport.cardReady>0?'Some sample secured, bank, fleet, or corporate card paths match the selected signals.':'The profile is not strong enough for card applications without wasting inquiries.'},
        {label:'Identifier quality',status:currentReport.score>=58?'Verify details':'Needs setup',cls:currentReport.score>=58?'review':'wait',note:'The full platform checks whether phone, address, website, email, and public records are the right type, not merely present.'}
      ].map(function(item){return "<article class='qual-card "+item.cls+"'><div><strong>"+escapeHtml(item.label)+"</strong><span>"+escapeHtml(item.status)+"</span></div><p>"+escapeHtml(item.note)+"</p></article>"}).join('');
      var reportNext=currentReport.next.map(function(item,index){return '<li><b>'+(index+1)+'</b><span>'+escapeHtml(item)+'</span></li>'}).join('');
      modal.querySelector('[data-demo-report-body]').innerHTML="<section class='sample-report-doc internal-report-sample'><header class='report-hero'><div class='brand'><span class='brand-mark'><img src='/Resources/images/verge5-logo-mark.png' alt='Verge Five logo'></span><span>Verge Five</span></div><h2>Sample progress report</h2><p>"+escapeHtml(sampleName)+" - generated "+escapeHtml(generated)+"</p></header><main class='report-body'><div class='metric-grid'><div class='metric'><small>Generated</small><strong>"+escapeHtml(generated)+"</strong></div><div class='metric'><small>Readiness stage</small><strong>"+escapeHtml(currentReport.stage)+"</strong></div><div class='metric'><small>Profile captured</small><strong>"+escapeHtml((currentReport.checked||0)+' / 12')+"</strong></div></div><section class='progress-card'><div class='progress-top'><span>Sample readiness score</span><span>"+escapeHtml(currentReport.score)+"%</span></div><div class='bar'><span style='width:"+Math.max(0,Math.min(100,currentReport.score))+"%'></span></div></section><div class='section-title'><h3>Business profile snapshot</h3><span>Sample business</span></div><section class='profile-grid'>"+profileRows+"</section><div class='section-title'><h3>Likely qualification review</h3><span>Readiness guide</span></div><section class='qual-grid'>"+qualCards+"</section><div class='section-title'><h3>Recommended next actions</h3><span>Do next</span></div><ol class='next-list'>"+reportNext+"</ol><p class='safe-note'><strong>Important:</strong> this sample report is a progress snapshot and readiness guide, not a guarantee of approval. Platform lessons, vendor lists, and proprietary training remain inside Verge Five.</p></main><footer class='report-footer'><span><strong>Verge Five LLC</strong> - From vision to venture.</span><a class='btn' href='/membership/'>Unlock full report access</a></footer></section>";
      modal.classList.remove('hide');
    }
    demo.querySelectorAll('[data-demo-signal]').forEach(function(input){input.addEventListener('change',render)});
    demo.querySelectorAll('[data-demo-preset]').forEach(function(btn){
      btn.addEventListener('click',function(){applyPreset(btn.getAttribute('data-demo-preset'))});
    });
    demo.querySelectorAll('[data-demo-visual-signal]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var key=btn.getAttribute('data-demo-visual-signal');
        var input=demo.querySelector('[data-demo-signal="'+key+'"]');
        if(!input)return;
        input.checked=!input.checked;
        demo.querySelectorAll('[data-demo-preset]').forEach(function(preset){preset.classList.remove('active')});
        render();
      });
    });
    if(reportOpen)reportOpen.addEventListener('click',openSampleReport);
    demo.addEventListener('click',function(e){
      var sampleCard=e.target.closest('.demo-sample-card');
      if(!sampleCard)return;
      var title=sampleCard.querySelector('strong');
      var label=title?title.textContent.trim():'sample path';
      var modal=document.querySelector('[data-demo-locked-modal]');
      if(!modal){
        modal=document.createElement('div');
        modal.className='vendor-detail-modal demo-locked-modal hide';
        modal.setAttribute('data-demo-locked-modal','');
        modal.innerHTML="<div class='vendor-detail-backdrop' data-demo-locked-close></div><article class='vendor-detail-card demo-locked-card'><button class='vendor-detail-close' type='button' data-demo-locked-close>Close</button><p class='kicker'>Locked in the full platform</p><h2 data-demo-locked-title>Sample path</h2><p>This test drive shows the readiness logic without exposing the full vendor library, full credit card criteria, application links, or proprietary lesson content.</p><div class='lesson-note-list'><span>Upgrade to see the complete prerequisites and timing warnings.</span><span>Use your real member profile instead of this sample profile.</span><span>Save progress and generate the styled member report.</span></div><a class='btn' href='/membership/'>Unlock full access</a></article>";
        document.body.appendChild(modal);
        modal.addEventListener('click',function(ev){if(ev.target.closest('[data-demo-locked-close]'))modal.classList.add('hide')});
      }
      var titleTarget=modal.querySelector('[data-demo-locked-title]');
      if(titleTarget)titleTarget.textContent=label;
      modal.classList.remove('hide');
    });
    render();
    });
  }
  function initWhatsInsideReportModal(){
    var modal=document.querySelector('[data-whats-report-modal]');
    var open=document.querySelector('[data-whats-report-open]');
    if(!modal||!open)return;
    function closeModal(){modal.classList.add('hide');document.body.classList.remove('modal-open')}
    open.addEventListener('click',function(){modal.classList.remove('hide');document.body.classList.add('modal-open')});
    modal.addEventListener('click',function(e){if(e.target.closest('[data-whats-report-close]'))closeModal()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.classList.contains('hide'))closeModal()});
  }
  initWhatsInsideReportModal();  function initVideoPlayCues(){
    document.querySelectorAll('.video-play-frame video').forEach(function(video){
      var frame=video.closest('.video-play-frame');
      if(!frame)return;
      video.addEventListener('play',function(){frame.classList.add('is-playing','has-played')});
      video.addEventListener('pause',function(){frame.classList.remove('is-playing')});
      video.addEventListener('ended',function(){frame.classList.remove('is-playing')});
    });
  }
  initVideoPlayCues();  initDemoDrive();
  applyModuleLabels();
  if(isBusinessCardPage()&&!window.vfCardLibrary){
    var cardScript=document.createElement('script');
    cardScript.src='/Scripts/vf-card-library.js';
    cardScript.onload=function(){upgradeBusinessCardPage();initCardMatcher();};
    document.head.appendChild(cardScript);
  }else{
    upgradeBusinessCardPage();
    initCardMatcher();
  }
  if(isFundingPage()&&!window.vfFundingLibrary){
    var fundingScript=document.createElement('script');
    fundingScript.src='/Scripts/vf-funding-library.js';
    fundingScript.onload=function(){upgradeFundingPage();initFundingMatcher();};
    document.head.appendChild(fundingScript);
  }else{
    upgradeFundingPage();
    initFundingMatcher();
  }
})();


