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

  // Generate time-based greeting
  function getTerminalGreeting() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 || 12;
    var mStr = m < 10 ? '0' + m : m;
    var timeStr = (h12 < 10 ? '0' + h12 : h12) + ':' + mStr + ' ' + ampm;
    var greeting;
    if (h >= 5 && h < 12) greeting = 'Good morning';
    else if (h >= 12 && h < 17) greeting = 'Good afternoon';
    else if (h >= 17 && h < 21) greeting = 'Good evening';
    else greeting = 'Burning the midnight oil';
    return '[' + timeStr + '] ' + greeting + ', welcome to my terminal.';
  }

  function runTerminalSequence() {
    // Set greeting text
    $('#greetingText').text(getTerminalGreeting());

    var steps = [
      function(next) { showOutput('#termLine0', next); },
      function(next) { typeText($('#termLine1 .terminal-text'), next); },
      function(next) { showOutput('#termLine2', next); },
      function(next) { showOutput('#termLine3', function() { typeText($('#termLine3 .terminal-text'), next); }); },
      function(next) { showOutput('#termLine4', next); },
      function(next) { showOutput('#termLine5', function() { typeText($('#termLine5 .terminal-text'), next); }); },
      function(next) { showOutput('#termLine6', next); },
      function(next) { showOutput('#termLine7', function() { typeText($('#termLine7 .terminal-text'), next); }); },
      function(next) { showOutput('#termLine8', next); },
      function(next) { showOutput('#termCursor', next); },
      function() {
        $('#heroCta').animate({ opacity: 1 }, 600);
        // Enable interactive terminal after animation
        setTimeout(enableInteractiveTerminal, 800);
      }
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
    'sre-dashboard': 'portfolio',
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

  // ======= Testimonials Slider (Pure CSS + JS) =======
  (function() {
    var $slides = $('.testimonial-slide');
    var $dots = $('.testimonial-dot');
    var total = $slides.length;
    var current = 0;
    var timer;

    function goToSlide(index) {
      if (index === current) return;
      $slides.removeClass('active');
      $dots.removeClass('active');
      current = index;
      $slides.eq(current).addClass('active');
      $dots.eq(current).addClass('active');
    }

    function nextSlide() {
      goToSlide((current + 1) % total);
    }

    function startAutoRotate() {
      clearInterval(timer);
      timer = setInterval(nextSlide, 6000);
    }

    $dots.on('click', function() {
      goToSlide(parseInt($(this).data('index')));
      startAutoRotate();
    });

    if (total > 0) startAutoRotate();
  })();

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
  // Store the fixed position of where tabs start (just below hero)
  var tabStartPosition = 0;
  $(window).on('load', function() {
    tabStartPosition = document.getElementById('tabNav').offsetTop;
  });

  function switchTab(tab) {
    var $oldTab = $('.tab-content.active');
    var $newTab = $('#tab-' + tab);

    // Update buttons
    $('.tab-btn').removeClass('active');
    $('.tab-btn[data-tab="' + tab + '"]').addClass('active');

    // Crossfade: fade out old
    $oldTab.removeClass('visible');

    // After fade out, swap and fade in
    setTimeout(function() {
      $oldTab.removeClass('active');
      $newTab.addClass('active');

      // Scroll to tab start
      window.scrollTo(0, tabStartPosition);

      // Reset transforms
      $('.section-title span').css('transform', 'none');

      // Trigger fade in on next frame
      requestAnimationFrame(function() {
        $newTab.addClass('visible');
        window.scrollTo(0, tabStartPosition);
        AOS.refresh();
      });
    }, 300);
  }

  // Make default tab visible on load
  $('.tab-content.active').addClass('visible');

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

  // Accordion toggle
  $(document).on('click', '.accordion-toggle', function() {
    var $item = $(this).closest('.accordion-item');
    $item.toggleClass('open');
  });

  // ======= Interactive Terminal =======
  function enableInteractiveTerminal() {
    var $cursor = $('#termCursor');
    var $interactive = $('#termInteractive');
    var $input = $('#termInput');
    var $output = $('#termOutput');
    var $termBody = $('.terminal-body');

    // Hide the blinking cursor line, show interactive area
    $cursor.hide();
    $interactive.show();
    $input.attr('placeholder', 'type help...');

    // Click anywhere on terminal to focus input
    $('.terminal').on('click', function() {
      $input.focus();
    });

    var commandHistory = [];
    var historyIndex = -1;

    var commands = {
      'help': function() {
        return [
          '<span style="color:var(--accent-2);font-weight:700;">Available commands:</span>',
          '  whoami         — who is Gurpreet',
          '  ls projects    — featured repositories',
          '  ls skills      — technical skills',
          '  cat about.txt  — short bio',
          '  uptime         — career runtime',
          '  ping reliability — system status',
          '  sudo hire gurpreet — try it ;)',
          '  clear          — clear terminal',
          '  help           — show this message'
        ].join('\n');
      },
      'whoami': function() {
        return 'Gurpreet Singh - Senior Staff SRE @ NatWest Group';
      },
      'ls projects': function() {
        var repos = [
          'IDP_Backstage', 'auto-agent-k8s', 'Samaira',
          'fraud-detection-mlops', 'gitops_aws', 'FinOps',
          'airflow', 'smart_llm_gateway', 'rag-llm', 'SRE'
        ];
        return repos.join('  ');
      },
      'ls skills': function() {
        var skills = [
          'SRE', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform',
          'Observability', 'AIOps', 'FinOps', 'DevSecOps',
          'GitOps', 'Python', 'Go', 'System Design'
        ];
        return skills.join('  ');
      },
      'cat about.txt': function() {
        return '14+ years building reliable, scalable systems at enterprise scale.\nFrom IBM trainee to Senior Staff SRE at one of the UK\'s largest banks.\nI turn chaos into calm — complex distributed systems into\npredictable, autonomous platforms.';
      },
      'uptime': function() {
        return '14+ years, 7 companies, and counting...';
      },
      'ping reliability': function() {
        return '99.99% — all systems operational';
      },
      'sudo hire gurpreet': function() {
        setTimeout(function() { $(document).trigger('easter-trigger'); }, 500);
        return '<span style="color:var(--accent-2);">Access granted.</span> Initiating recruitment sequence...';
      },
      'clear': function() {
        return '__CLEAR__';
      }
    };

    function scrollTerminal() {
      $termBody.scrollTop($termBody[0].scrollHeight);
    }

    function processCommand(cmd) {
      var trimmed = cmd.trim().toLowerCase();
      if (!trimmed) return;

      commandHistory.unshift(trimmed);
      historyIndex = -1;

      // Add the command echo
      var cmdLine = '<div class="terminal-line"><span class="terminal-prompt">$</span> ' + $('<span>').text(cmd.trim()).html() + '</div>';
      $output.append(cmdLine);

      // Look up command
      var result;
      if (commands[trimmed]) {
        result = commands[trimmed]();
      } else {
        result = '<span style="color:#ff5f57;">' + $('<span>').text(trimmed).html() + ': command not found.</span> Type \'help\' for available commands.';
      }

      if (result === '__CLEAR__') {
        $output.empty();
        // Also hide the original terminal lines
        $('#termLine0, #termLine1, #termLine2, #termLine3, #termLine4, #termLine5, #termLine6, #termLine7, #termLine8').hide();
      } else {
        var outputLine = '<div class="terminal-line terminal-output" style="display:block;padding-left:22px;white-space:pre-wrap;">' + result + '</div>';
        $output.append(outputLine);
      }

      scrollTerminal();
    }

    $input.on('keydown', function(e) {
      if (e.key === 'Enter') {
        var cmd = $input.val();
        $input.val('');
        processCommand(cmd);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          $input.val(commandHistory[historyIndex]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          $input.val(commandHistory[historyIndex]);
        } else {
          historyIndex = -1;
          $input.val('');
        }
      }
    });
  }

  // ======= SRE Dashboard Animations =======
  function animateSREDashboard() {
    // Animate counters
    $('.sre-counter').each(function() {
      var $el = $(this);
      if ($el.data('animated')) return;
      $el.data('animated', true);

      var target = parseFloat($el.data('target'));
      var decimals = parseInt($el.data('decimals')) || 0;
      var duration = 2000;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = eased * target;
        if (decimals > 0) {
          $el.text(current.toFixed(decimals));
        } else {
          $el.text(Math.floor(current).toLocaleString());
        }
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          if (decimals > 0) {
            $el.text(target.toFixed(decimals));
          } else {
            $el.text(target.toLocaleString());
          }
        }
      }
      requestAnimationFrame(step);
    });

    // Animate ring charts
    $('.sre-ring-fill').each(function() {
      var $ring = $(this);
      if ($ring.hasClass('animated')) return;
      var percent = parseFloat($ring.data('percent'));
      var circumference = 326.73; // 2 * PI * 52
      var offset = circumference - (percent / 100) * circumference;
      $ring.css('--target-offset', offset + 'px');
      $ring.addClass('animated');
    });

    // Animate bars
    $('.sre-metric-bar').each(function() {
      var $bar = $(this);
      if ($bar.hasClass('animated')) return;
      var width = parseFloat($bar.data('width'));
      $bar.css('--target-width', width + '%');
      $bar.addClass('animated');
    });

    // Animate progress fills
    $('.sre-metric-progress-fill').each(function() {
      var $fill = $(this);
      if ($fill.hasClass('animated')) return;
      var width = parseFloat($fill.data('width'));
      $fill.css('--target-width', width + '%');
      $fill.addClass('animated');
    });
  }

  // Trigger SRE dashboard animation when scrolled into view
  if ($('#sre-dashboard').length) {
    var sreObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateSREDashboard();
          sreObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    sreObserver.observe(document.getElementById('sre-dashboard'));
  }


  // ======= Custom Cursor =======
  var $glow = $('#cursorGlow');
  var $dot = $('#cursorDot');
  var mouseX = 0, mouseY = 0;
  var glowX = 0, glowY = 0;

  // Only on non-touch devices
  if (window.matchMedia('(hover: hover)').matches) {
    $(document).on('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      $dot.css({ left: mouseX, top: mouseY });
      if (!$dot.hasClass('active')) {
        $dot.addClass('active');
        $glow.addClass('active');
      }
    });

    // Smooth glow follow
    function animateGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      $glow.css({ left: glowX, top: glowY });
      requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // Enlarge dot on hoverable elements
    $(document).on('mouseenter', 'a, button, .tab-btn, .project-card, .article-card, .accordion-toggle, .resume-item', function() {
      $dot.addClass('hovering');
    }).on('mouseleave', 'a, button, .tab-btn, .project-card, .article-card, .accordion-toggle, .resume-item', function() {
      $dot.removeClass('hovering');
    });

    // Hide on mouse leave window
    $(document).on('mouseleave', function() {
      $dot.removeClass('active');
      $glow.removeClass('active');
    });
  }

  // ======= Photo Rotator =======
  (function() {
    var $photos = $('.photo-slide');
    if ($photos.length <= 1) return;
    var current = 0;
    setInterval(function() {
      $photos.eq(current).removeClass('active');
      current = (current + 1) % $photos.length;
      $photos.eq(current).addClass('active');
    }, 10000);
  })();

  // ======= Keyboard Shortcuts (1-4 for tabs) =======
  var tabShortcuts = { '1': 'portfolio', '2': 'projects', '3': 'explorations', '4': 'articles' };

  $(document).on('keydown', function(e) {
    // Don't trigger when typing in input fields
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    var tab = tabShortcuts[e.key];
    if (tab) {
      e.preventDefault();
      switchTab(tab);
    }
  });

  // ======= Easter Egg: Konami Code =======
  var konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // up up down down left right left right B A
  var konamiProgress = 0;

  function showEasterEgg() {
    var $overlay = $('#easterOverlay');
    $overlay.addClass('active');

    // Confetti burst
    var colors = ['#6c63ff', '#00d4aa', '#ff5f57', '#febc2e', '#28c840', '#fff'];
    for (var i = 0; i < 60; i++) {
      var $conf = $('<div class="confetti"></div>');
      $conf.css({
        left: Math.random() * 100 + 'vw',
        top: -10,
        background: colors[Math.floor(Math.random() * colors.length)],
        width: (Math.random() * 8 + 4) + 'px',
        height: (Math.random() * 8 + 4) + 'px',
        animationDuration: (Math.random() * 2 + 2) + 's',
        animationDelay: (Math.random() * 1) + 's'
      });
      $('body').append($conf);
      setTimeout(function() { $conf.remove(); }, 5000);
    }
  }

  $(document).on('keydown', function(e) {
    if (e.keyCode === konamiSequence[konamiProgress]) {
      konamiProgress++;
      if (konamiProgress === konamiSequence.length) {
        konamiProgress = 0;
        showEasterEgg();
      }
    } else {
      konamiProgress = 0;
    }
  });

  // Close easter egg
  $(document).on('click', '#easterClose, .easter-overlay', function(e) {
    if (e.target === this) {
      $('#easterOverlay').removeClass('active');
    }
  });

  // ======= Enhanced sudo hire gurpreet =======
  // Override the terminal command to also trigger the easter egg
  var originalSudoHire = null;

})(jQuery);

// Hook into sudo hire after terminal is ready
$(document).on('easter-trigger', function() {
  var $overlay = $('#easterOverlay');
  $overlay.addClass('active');

  var colors = ['#6c63ff', '#00d4aa', '#ff5f57', '#febc2e', '#28c840', '#fff'];
  for (var i = 0; i < 60; i++) {
    var $conf = $('<div class="confetti"></div>');
    $conf.css({
      left: Math.random() * 100 + 'vw',
      top: -10,
      background: colors[Math.floor(Math.random() * colors.length)],
      width: (Math.random() * 8 + 4) + 'px',
      height: (Math.random() * 8 + 4) + 'px',
      animationDuration: (Math.random() * 2 + 2) + 's',
      animationDelay: (Math.random() * 1) + 's'
    });
    $('body').append($conf);
    setTimeout(function() { $conf.remove(); }, 5000);
  }
});