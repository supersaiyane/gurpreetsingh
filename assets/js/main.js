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

  // Smooth scroll for the navigation menu and links with .scrollto classes
  $(document).on('click', '.nav-menu a, .scrollto', function(e) {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      if (target.length) {
        e.preventDefault();

        var scrollto = target.offset().top;

        $('html, body').animate({
          scrollTop: scrollto
        }, 1500, 'easeInOutExpo');

        if ($(this).parents('.nav-menu, .mobile-nav').length) {
          $('.nav-menu .active, .mobile-nav .active').removeClass('active');
          $(this).closest('li').addClass('active');
        }

        if ($('body').hasClass('mobile-nav-active')) {
          $('body').removeClass('mobile-nav-active');
          $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
        }
        return false;
      }
    }
  });

  // Activate smooth scroll on page load with hash links in the url
  $(document).ready(function() {
    if (window.location.hash) {
      var initial_nav = window.location.hash;
      if ($(initial_nav).length) {
        var scrollto = $(initial_nav).offset().top;
        $('html, body').animate({
          scrollTop: scrollto
        }, 1500, 'easeInOutExpo');
      }
    }
  });

  $(document).on('click', '.mobile-nav-toggle', function(e) {
    $('body').toggleClass('mobile-nav-active');
    $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
  });

  $(document).click(function(e) {
    var container = $(".mobile-nav-toggle");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
      if ($('body').hasClass('mobile-nav-active')) {
        $('body').removeClass('mobile-nav-active');
        $('.mobile-nav-toggle i').toggleClass('icofont-navigation-menu icofont-close');
      }
    }
  });

  // Navigation active state on scroll
  var nav_sections = $('section');
  var main_nav = $('.nav-menu, #mobile-nav');

  $(window).on('scroll', function() {
    var cur_pos = $(this).scrollTop() + 300;

    nav_sections.each(function() {
      var top = $(this).offset().top,
        bottom = top + $(this).outerHeight();

      if (cur_pos >= top && cur_pos <= bottom) {
        if (cur_pos <= bottom) {
          main_nav.find('li').removeClass('active');
        }
        main_nav.find('a[href="#' + $(this).attr('id') + '"]').parent('li').addClass('active');
      }
      if (cur_pos < 200) {
        $(".nav-menu ul:first li:first").addClass('active');
      }
    });
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

  // Parallax scroll effect on sections
  $(window).on('scroll', function() {
    var scrolled = $(this).scrollTop();

    // Parallax for ambient blobs
    $('.ambient-blob-1').css('transform', 'translateY(' + (scrolled * 0.04) + 'px)');
    $('.ambient-blob-2').css('transform', 'translateY(' + (scrolled * -0.03) + 'px)');

    // Parallax for section titles - subtle float
    $('.section-title span').each(function() {
      var sectionTop = $(this).closest('section').offset().top;
      var offset = (scrolled - sectionTop) * 0.05;
      $(this).css('transform', 'translateY(' + offset + 'px)');
    });
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