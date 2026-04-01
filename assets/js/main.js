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
    'contact': 'portfolio',
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
      duration: 1000,
      once: true
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
  var featuredRepos = [
    'IDP_Backstage',
    'auto-agent-k8s',
    'Samaira',
    'fraud-detection-mlops',
    'gitops_aws',
    'FinOps',
    'airflow',
    'smart_llm_gateway'
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
        '<div class="project-card">' +
          '<div class="project-header">' +
            '<h4><a href="' + repo.html_url + '" target="_blank" rel="noopener">' + repo.name + '</a></h4>' +
            '<i class="bx bx-git-repo-forked project-icon"></i>' +
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

  // Fetch repos from GitHub API
  $.get('https://api.github.com/users/supersaiyane/repos?per_page=100&sort=pushed', function(data) {
    // Featured repos
    var featured = [];
    var repoMap = {};
    data.forEach(function(r) { repoMap[r.name] = r; });
    featuredRepos.forEach(function(name) {
      if (repoMap[name]) featured.push(repoMap[name]);
    });
    if (featured.length < 8) {
      var sorted = data.filter(function(r) { return !r.fork && featuredRepos.indexOf(r.name) === -1; })
        .sort(function(a, b) { return b.stargazers_count - a.stargazers_count; });
      for (var i = 0; i < sorted.length && featured.length < 8; i++) {
        featured.push(sorted[i]);
      }
    }
    renderProjects(featured, '#projectsGrid');

    // Latest 6 repos (non-fork, excluding featured)
    var featuredNames = featured.map(function(r) { return r.name; });
    var latest = data
      .filter(function(r) { return !r.fork && featuredNames.indexOf(r.name) === -1; })
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

    // Show/hide tab content
    $('.tab-content').removeClass('active');
    $('#tab-' + tab).addClass('active');

    // Reset any stale transforms and re-init AOS
    $('.section-title span').css('transform', 'none');
    setTimeout(function() { AOS.refresh(); }, 100);

    // Scroll to top of tab content
    var scrollTarget = $('#tabNav').offset().top;
    $('html, body').animate({ scrollTop: scrollTarget }, 400, 'easeInOutExpo');
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

  // ======= Articles =======
  // Add your articles here. Each article is an object with title, url, tag, excerpt, date, readTime.
  var articles = [
    {
      title: "SRE at Scale: How We Built an SLO Framework for Banking",
      url: "https://medium.com/@gurpreet.singh_89",
      tag: "SRE",
      excerpt: "A deep dive into how we designed and implemented SLO frameworks across mission-critical banking platforms, balancing regulatory compliance with engineering velocity.",
      date: "2025",
      readTime: "8 min"
    },
    {
      title: "From Monolith to Microservices: Lessons from MakeMyTrip",
      url: "https://medium.com/@gurpreet.singh_89",
      tag: "Architecture",
      excerpt: "The real story of migrating high-traffic travel platforms from monolithic services to microservices on AWS — what worked, what didn't, and what we'd do differently.",
      date: "2025",
      readTime: "10 min"
    },
    {
      title: "AIOps in Practice: Reducing MTTR with Intelligent Automation",
      url: "https://medium.com/@gurpreet.singh_89",
      tag: "AIOps",
      excerpt: "How we leveraged LLMs and automated remediation to cut Mean Time To Recovery by 60% across distributed systems in regulated environments.",
      date: "2025",
      readTime: "7 min"
    },
    {
      title: "FinOps for Engineers: A Practical Guide to Cloud Cost Optimization",
      url: "https://medium.com/@gurpreet.singh_89",
      tag: "FinOps",
      excerpt: "Cloud cost optimization isn't just a finance problem. Here's how engineering teams can drive FinOps initiatives with data-driven decisions and automated guardrails.",
      date: "2024",
      readTime: "9 min"
    },
    {
      title: "Building an Internal Developer Platform with Backstage",
      url: "https://medium.com/@gurpreet.singh_89",
      tag: "Platform Engineering",
      excerpt: "Our journey building a Backstage-powered IDP with GitOps, guardrails, observability, and incident automation — making developers self-sufficient at scale.",
      date: "2024",
      readTime: "12 min"
    },
    {
      title: "Kubernetes Auto-Remediation: Building a Self-Healing Platform",
      url: "https://medium.com/@gurpreet.singh_89",
      tag: "Kubernetes",
      excerpt: "How we built a K8s DaemonSet that handles auto-remediation, scaling decisions, and root cause analysis using LLMs — making on-call less painful.",
      date: "2024",
      readTime: "11 min"
    }
  ];

  function renderArticles() {
    var grid = $('#articlesGrid');
    if (articles.length === 0) {
      grid.html('<div class="articles-empty"><i class="bx bx-pen"></i><p>Articles coming soon. Stay tuned.</p></div>');
      return;
    }
    articles.forEach(function(article) {
      var card = '<div class="article-card">' +
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

  renderArticles();

  // Parallax scroll effect on sections
  $(window).on('scroll', function() {
    var scrolled = $(this).scrollTop();

    // Parallax for ambient blobs
    $('.ambient-blob-1').css('transform', 'translateY(' + (scrolled * 0.04) + 'px)');
    $('.ambient-blob-2').css('transform', 'translateY(' + (scrolled * -0.03) + 'px)');
  });

  // Water ripple effect on click
  $(document).on('click', 'section', function(e) {
    var $section = $(this);
    var ripple = $('<div class="ripple"></div>');
    var size = Math.max($section.outerWidth(), $section.outerHeight());
    var x = e.pageX - $section.offset().left - size / 2;
    var y = e.pageY - $section.offset().top - size / 2;

    // Ensure section has ripple container
    if (!$section.find('.ripple-container').length) {
      $section.css('position', 'relative');
      $section.append('<div class="ripple-container"></div>');
    }

    ripple.css({ width: size, height: size, left: x, top: y });
    $section.find('.ripple-container').append(ripple);

    setTimeout(function() { ripple.remove(); }, 2000);
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