/**
* Template Name: MyResume - v2.2.0
* Template URL: https://bootstrapmade.com/free-html-bootstrap-template-my-resume/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
!(function($) {
  "use strict";

  // Preloader
  $(window).on('load', function() {
    if ($('#preloader').length) {
      $('#preloader').delay(100).fadeOut('slow', function() {
        $(this).remove();
      });
    }
  });

  // Terminal typing effect
  function typeText($el, callback) {
    var text = $el.data('text');
    var i = 0;
    var interval = setInterval(function() {
      $el.text(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        $el.addClass('done');
        if (callback) setTimeout(callback, 200);
      }
    }, 50);
  }

  function showOutput(id, callback) {
    $(id).fadeIn(150, callback);
  }

  function runTerminalSequence() {
    var steps = [
      function(next) { typeText($('#termLine1 .terminal-text'), next); },
      function(next) { showOutput('#termLine2', next); },
      function(next) { showOutput('#termLine3', function() { typeText($('#termLine3 .terminal-text'), next); }); },
      function(next) { showOutput('#termLine4', next); },
      function(next) { showOutput('#termLine5', function() { typeText($('#termLine5 .terminal-text'), next); }); },
      function(next) { showOutput('#termLine6', next); },
      function(next) { showOutput('#termLine7', function() { typeText($('#termLine7 .terminal-text'), next); }); },
      function(next) { showOutput('#termLine8', next); },
      function(next) { showOutput('#termCursor', next); },
      function() { $('#heroCta').animate({ opacity: 1 }, 600); }
    ];

    var i = 0;
    function run() {
      if (i < steps.length) {
        steps[i](function() { i++; setTimeout(run, 300); });
      }
    }
    run();
  }

  $(window).on('load', function() {
    setTimeout(runTerminalSequence, 800);
  });

  // Map sections to their parent tab
  var sectionTabMap = {
    'stats': 'portfolio',
    'about': 'portfolio',
    'skills': 'portfolio',
    'resume': 'portfolio',
    'testimonials': 'portfolio',
    'projects': 'projects'
  };

  // Smooth scroll for links with .scrollto class
  $(document).on('click', '.scrollto', function(e) {
    if (this.hash) {
      e.preventDefault();
      var hash = this.hash.substring(1);
      var requiredTab = sectionTabMap[hash];

      // If target is inside a tab, switch to that tab first
      if (requiredTab) {
        // Switch tab without scrolling
        $('.tab-btn').removeClass('active');
        $('.tab-btn[data-tab="' + requiredTab + '"]').addClass('active');
        $('.tab-content').removeClass('active');
        $('#tab-' + requiredTab).addClass('active');
        $('.section-title span').css('transform', 'none');
        setTimeout(function() { AOS.refresh(); }, 50);
      }

      // Scroll to target after tab is visible
      setTimeout(function() {
        var target = $('#' + hash);
        if (target.length && target.is(':visible')) {
          $('html, body').animate({
            scrollTop: target.offset().top
          }, 800, 'easeInOutExpo');
        }
      }, requiredTab ? 100 : 0);

      return false;
    }
  });

  // Back to top button
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });

  $('.back-to-top').click(function() {
    $('html, body').animate({
      scrollTop: 0
    }, 1500, 'easeInOutExpo');
    return false;
  });

  // jQuery counterUp
  $('[data-toggle="counter-up"]').counterUp({
    delay: 10,
    time: 1000
  });

  // Skills section
  $('.skills-content').waypoint(function() {
    $('.progress .progress-bar').each(function() {
      $(this).css("width", $(this).attr("aria-valuenow") + '%');
    });
  }, {
    offset: '80%'
  });

  // Init AOS
  function aos_init() {
    AOS.init({
      duration: 800,
      once: true,
      offset: 60,
      easing: 'ease-out-cubic'
    });
  }

  // Porfolio isotope and filter
  $(window).on('load', function() {
    var portfolioIsotope = $('.portfolio-container').isotope({
      itemSelector: '.portfolio-item'
    });

    $('#portfolio-flters li').on('click', function() {
      $("#portfolio-flters li").removeClass('filter-active');
      $(this).addClass('filter-active');

      portfolioIsotope.isotope({
        filter: $(this).data('filter')
      });
      aos_init();
    });

    // Initiate venobox (lightbox feature used in portofilo)
    $('.venobox').venobox({
      'share': false
    });

    // Initiate aos_init() function
    aos_init();

  });

  // Testimonials carousel (uses the Owl Carousel library)
  $(".testimonials-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    items: 1
  });

  // Portfolio details carousel
  $(".portfolio-details-carousel").owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    items: 1
  });

  // GitHub Projects - fetch and render
  // *** EDIT THIS LIST to choose which repos to feature ***
  var featuredRepos = [
    'IDP_Backstage',
    'auto-agent-k8s',
    'Samaira',
    'fraud-detection-mlops',
    'gitops_aws',
    'FinOps',
    'airflow',
    'smart_llm_gateway',
    'rag-llm',
    'SRE'
  ];

  var langColors = {
    'Python': 'lang-python',
    'Go': 'lang-go',
    'JavaScript': 'lang-javascript',
    'HCL': 'lang-hcl',
    'Shell': 'lang-shell',
    'C#': 'lang-csharp',
    'TypeScript': 'lang-typescript'
  };

  function renderProjects(repos, target) {
    var grid = $(target || '#projectsGrid');
    grid.empty();
    repos.forEach(function(repo) {
      var langClass = langColors[repo.language] || 'lang-default';
      var langHtml = repo.language
        ? '<span class="project-lang"><span class="lang-dot ' + langClass + '"></span>' + repo.language + '</span>'
        : '';
      var desc = repo.description || 'No description provided';
      if (desc.length > 120) desc = desc.substring(0, 120) + '...';

      var card = '<div class="col-lg-4 col-md-6 mb-4" data-aos="fade-up">' +
        '<div class="project-card" data-url="' + repo.html_url + '">' +
          '<div class="project-header">' +
            '<h4>' + repo.name + '</h4>' +
            '<i class="bx bxl-github project-icon"></i>' +
          '</div>' +
          '<p class="project-desc">' + desc + '</p>' +
          '<div class="project-meta">' +
            langHtml +
            '<span class="project-stat"><i class="bx bx-star"></i> ' + repo.stargazers_count + '</span>' +
            '<span class="project-stat"><i class="bx bx-git-repo-forked"></i> ' + repo.forks_count + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
      grid.append(card);
    });
  }

  // Show skeleton loaders
  (function() {
    var grid = $('#projectsGrid');
    var latestGrid = $('#latestGrid');
    for (var i = 0; i < 6; i++) {
      grid.append('<div class="col-lg-4 col-md-6 mb-4"><div class="project-skeleton"></div></div>');
      latestGrid.append('<div class="col-lg-4 col-md-6 mb-4"><div class="project-skeleton"></div></div>');
    }
  })();

  // Click anywhere on project card to open repo
  $(document).on('click', '.project-card', function() {
    var url = $(this).data('url');
    if (url) window.open(url, '_blank');
  });

  // Fetch repos from GitHub API
  $.get('https://api.github.com/users/supersaiyane/repos?per_page=100&sort=pushed', function(data) {
    // Filter out ALL forks
    var originals = data.filter(function(r) { return !r.fork; });
    var repoMap = {};
    originals.forEach(function(r) { repoMap[r.name] = r; });

    // Featured repos (only from your curated list, only originals)
    var featured = [];
    featuredRepos.forEach(function(name) {
      if (repoMap[name]) featured.push(repoMap[name]);
    });
    renderProjects(featured, '#projectsGrid');

    // Latest 6 original repos (excluding featured)
    var featuredNames = featured.map(function(r) { return r.name; });
    var latest = originals
      .filter(function(r) { return featuredNames.indexOf(r.name) === -1; })
      .sort(function(a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); })
      .slice(0, 6);
    renderProjects(latest, '#latestGrid');
  }).fail(function() {
    var fallback = featuredRepos.map(function(name) {
      return { name: name, html_url: 'https://github.com/supersaiyane/' + name, description: '', language: null, stargazers_count: 0, forks_count: 0 };
    });
    renderProjects(fallback, '#projectsGrid');
    $('#latestGrid').html('<p style="color:#5a5a6e;text-align:center;width:100%;">Could not load latest repos.</p>');
  });

  // ======= Tab Navigation =======
  function switchTab(tab) {
    // Update tab buttons
    $('.tab-btn').removeClass('active');
    $('.tab-btn[data-tab="' + tab + '"]').addClass('active');

    // Switch tab content
    $('.tab-content').removeClass('active');
    $('#tab-' + tab).addClass('active');

    // Reset transforms
    $('.section-title span').css('transform', 'none');

    // Force scroll to top of tab bar after DOM updates
    requestAnimationFrame(function() {
      var scrollTarget = document.getElementById('tabNav').offsetTop;
      window.scrollTo({ top: scrollTarget, behavior: 'instant' });
      setTimeout(function() { AOS.refresh(); }, 50);
    });
  }

  // Tab bar button click
  $(document).on('click', '.tab-btn', function(e) {
    e.preventDefault();
    switchTab($(this).data('tab'));
  });

  // ======= Stats Counter Animation =======
  function animateCounters() {
    $('.stat-number').each(function() {
      var $this = $(this);
      if ($this.data('animated')) return;
      var target = parseInt($this.data('count'));
      var duration = 1500;
      var start = 0;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        $this.text(Math.floor(eased * target));
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          $this.text(target);
        }
      }
      $this.data('animated', true);
      requestAnimationFrame(step);
    });
  }

  // Trigger counter when stats section is in view
  if ($('#stats').length) {
    var statsObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(document.getElementById('stats'));
  }

  // ======= Articles from Medium RSS =======
  var MEDIUM_FEED = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@gurpreet.singh_89';

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function estimateReadTime(text) {
    var words = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200)) + ' min';
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function extractFirstTag(categories) {
    if (categories && categories.length > 0) return categories[0];
    return 'Article';
  }

  function renderArticles(articles) {
    var grid = $('#articlesGrid');
    grid.empty();
    if (!articles || articles.length === 0) {
      grid.html('<div class="articles-empty"><i class="bx bx-pen"></i><p>Articles coming soon. Stay tuned.</p></div>');
      return;
    }
    articles.forEach(function(article) {
      var card = '<div class="article-card" data-url="' + article.url + '">' +
        '<span class="article-tag">' + article.tag + '</span>' +
        '<h3 class="article-title"><a href="' + article.url + '" target="_blank" rel="noopener">' + article.title + '</a></h3>' +
        '<p class="article-excerpt">' + article.excerpt + '</p>' +
        '<div class="article-meta">' +
          '<span class="article-date">' + article.date + '</span>' +
          '<span class="article-read-time"><i class="bx bx-time-five"></i> ' + article.readTime + '</span>' +
        '</div>' +
      '</div>';
      grid.append(card);
    });
  }

  // Show skeleton loaders for articles
  (function() {
    var grid = $('#articlesGrid');
    for (var i = 0; i < 6; i++) {
      grid.append('<div class="project-skeleton" style="height:220px;margin-bottom:24px;"></div>');
    }
  })();

  // Click anywhere on article card to open in new tab
  $(document).on('click', '.article-card', function() {
    var url = $(this).data('url');
    if (url) window.open(url, '_blank');
  });

  // Fetch from Medium via rss2json
  $.get(MEDIUM_FEED, function(data) {
    if (data.status === 'ok' && data.items && data.items.length > 0) {
      var articles = data.items.map(function(item) {
        var plainText = stripHtml(item.description || item.content || '');
        var excerpt = plainText.substring(0, 150).trim();
        if (plainText.length > 150) excerpt += '...';
        return {
          title: item.title,
          url: item.link,
          tag: extractFirstTag(item.categories),
          excerpt: excerpt,
          date: formatDate(item.pubDate),
          readTime: estimateReadTime(plainText)
        };
      });
      renderArticles(articles);
    } else {
      renderArticles([]);
    }
  }).fail(function() {
    // Fallback: show empty state
    renderArticles([]);
  });

  // Scroll progress bar
  $(window).on('scroll', function() {
    var scrolled = $(this).scrollTop();
    var docHeight = $(document).height() - $(window).height();
    var progress = (scrolled / docHeight) * 100;
    $('#scrollProgress').css('width', progress + '%');
  });

  // Resume toggle - show/hide earlier experience
  $('#resumeToggle').on('click', function() {
    var $btn = $(this);
    var $section = $('#resumeEarlier');
    $btn.toggleClass('active');
    $section.toggleClass('expanded');
    if ($btn.hasClass('active')) {
      $btn.find('.toggle-text').text('Show Less');
    } else {
      $btn.find('.toggle-text').text('Show Earlier Experience');
    }
  });

})(jQuery);