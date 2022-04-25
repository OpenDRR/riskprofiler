document.documentElement.classList.remove('no-js');

var current_script = document.currentScript.src
var filename = current_script.split('/').pop()
var theme_dir = current_script.replace('/resources/js/' + filename, '') + '/'

const global_logging = true;

var swipers = []

//
// LANGUAGE
//

var current_lang = 'en';

//
// INITIAL LOCATION HASH
//

// if (window.location.hash) {
//   var init_scroll = window.location.hash
//
//   console.log(window.location.hash);
//   console.log(init_scroll);
//
//   if (document.getElementById(init_scroll.substr(1)) !== null) {
//     history.replaceState(null, document.title, location.protocol + '//' + location.host + location.pathname);
//     console.log('scroll to ' + init_scroll);
//   }
// }

var sticky_offset = 0,
    scroll_offset = 0,
    chart_globals;

(function($) {

  $(function() {

    //
    // URLs
    //

    $(document).data('site_url', '/')
    $(document).data('theme_dir', theme_dir)

    // console.log($(document).data())

    scroll_offset += $('#page-header').outerHeight();

    if ($('body').hasClass('lang-fr')) {
      current_lang = 'fr';
    }

    //
    // GLOBAL BEHAVIOURS
    //

    $('body').on('click', '.prevent-default', function(e) {
      e.preventDefault();
    });

    //
    // GLOBAL OPTIONS
    //

	  //
	  // BOOTSTRAP
	  //

    //
    // TEMPLATE INTERACTIONS / BEHAVIOURS
    //

    if ($('#header-alert').length) {

      $('#header-alert .alert-close').click(function() {
    	  $('body').addClass('alert-closing');

    	  $('#header-alert').slideUp(400, function() {
      	  $('body').removeClass('alert-closing').addClass('alert-closed');

          $('.sticky').trigger('sticky_kit:recalc')
    	  });
  	  });

    }

		// COLLAPSIBLE ELEMENTS

		if ($('[data-collapsible]').length) {
			$('[data-collapsible]').each(function() {

				var trigger_settings = JSON.parse($(this).attr('data-collapsible'))

				var this_trigger = $(this).find('[data-toggle="collapse"]')

				if (trigger_settings.append != '') {
					this_trigger.appendTo($(trigger_settings.append))
				}

				$(this).on('show.bs.collapse', function() {
					this_trigger.find('span').text(trigger_settings.collapse_text)
					this_trigger.find('i').removeClass(trigger_settings.expand_icon).addClass(trigger_settings.collapse_icon)
				})

				$(this).on('hide.bs.collapse', function() {
					this_trigger.find('span').text(trigger_settings.expand_text)
					this_trigger.find('i').removeClass(trigger_settings.collapse_icon).addClass(trigger_settings.expand_icon)
				})

			})

		}

    //
    // COMPONENTS
    //

    if ($('body').hasClass('admin-bar')) {

      if ($(window).width() > 782) {
        sticky_offset += 32
      } else {
        sticky_offset += 46
      }
    }

    if ($('#page-header').hasClass('fixed-top')) {
      sticky_offset += $('#page-header').outerHeight()
    }

    // console.log(sticky_offset)

    // FOOTNOTES

    if ($('.footnote').length) {
      $(document).footnotes()
    }

    // SMOOTH SCROLL

		var smooth_scroll_offset = 0

		if ($('#wpadminbar').length) {
			smooth_scroll_offset += $('#wpadminbar').outerHeight()
		}

    $(document).smooth_scroll({
      debug: false,
      offset: smooth_scroll_offset
    })

    // if (init_scroll && $(init_scroll).length) {
    //
    //   setTimeout(function() {
    //     console.log('smooth scroll', init_scroll);
    //
    //     $(document).smooth_scroll('scroll_to', init_scroll);
    //
    //   }, 500);
    //
    //   //console.log('init scroll');
    //
	  // }

	  // SUPERMENU

    // $('#header-primary .supermenu-toggle').each(function() {
    //   var caret = $('<i class="nav-item-caret fas fa-caret-down"></i>').appendTo($(this));
    // });
    //
	  // $('#supermenu').supermenu({
  	//   events: {
    // 	  slide_change: function() {
    //
    //   	  if ($('#supermenu').find('.slick-current').find('.select2').length) {
    //
    //     	  $('#location-search').select2('open');
    //
    //   	  }
    //
    // 	  }
  	//   }
	  // });

	  // OVERLAY

	  $(document).overlay()

    if ($('.swiper').length) {

			// console.log($('.swiper-container'))

      $('.swiper').each(function(i) {

        var this_id = $(this).attr('id')

        var swiper_settings = $(this).attr('data-swiper-settings')

        swiper_settings = JSON.parse(swiper_settings)

        // console.log($(this).attr('id'))

        // if ($(this).attr('id') == 'hero-images-swiper-container') {
        //   swiper_settings.navigation = {
        //     'prevEl': '#hero-text-prev',
        //     'nextEl': '#hero-text-next'
        //   }
        // }

				// if the swiper is a bootstrap .container,
				// wrap each .col-* slide in a .row

				// console.log($(this).parent().hasClass())

				if ($(this).parent().hasClass('row')) {

					$(this).find('.swiper-slide').removeClass('swiper-slide')

					$(this).find('.fw-column').wrap('<div class="row justify-content-center swiper-slide">')

				}

        // console.log(swiper_settings)

        swipers[i] = {
          id: $(this).attr('id'),
          settings: swiper_settings,
          instance: new Swiper('#' + this_id, swiper_settings)
        }

      })
    }


    //
    // SOCIAL WIDGETS
    //

    //
    // GRAPHICS
    //

    // RENDERER

    if ($('.renderable').length) {
      $(document).renderer()
      // console.log('renderer')
    }

    //
    // VENDOR
    //

		// LAZY

		if ($('.lazy').length) {
			$('.lazy').Lazy()
		}

    // SLICK CAROUSEL

    // $('[data-slick]').each(function() {
		//
    //   $(this).on('beforeChange', function(event, slick, currentSlide, nextSlide) {
    //     $(this).addClass('sliding');
    //   });
		//
    //   $(this).on('afterChange', function(event, slick, currentSlide) {
    //     $(this).removeClass('sliding');
    //   });
		//
		//   if (!$(this).hasClass('slick-initialized')) {
  	// 	  $(this).slick();
  	// 	}
		//
    //   // $(this).slick('refresh');
		//
    // });

	  // STICKY KIT

    function sticky_responsive(element, breakpoint, options) {
      if (breakpoint !== false && $(window).width() < breakpoint) {
        element.trigger('sticky_kit:detach')
      } else {
        element.stick_in_parent(options)
      }
    }

    if ($('.sticky').length) {

			$('.sticky-offset').each(function() {
				sticky_offset += $(this).outerHeight()
			})

      $('.sticky').each(function() {

        var sticky_element = $(this)

        var element_height = sticky_element.outerHeight()

        var sticky_options = {
          offset_top: sticky_offset
        }

        // if the page header is sticky or fixed
        // and this is NOT the page header,

        // if (
        //   $(this).attr('id') != 'page-header' &&
        //   ($('body').hasClass('header-position-sticky') || $('body').hasClass('header-position-fixed'))
        // ) {
        //   sticky_options.offset_top += element_height
        // }

        if (
					typeof sticky_element.attr('data-sticky-parent') !== 'undefined' &&
					$(sticky_element.attr('data-sticky-parent')).length
				) {
          sticky_options.parent = sticky_element.attr('data-sticky-parent')
        }

        if (typeof sticky_element.attr('data-sticky-spacer') !== 'undefined') {
          sticky_options.spacer = sticky_element.attr('data-sticky-spacer')
        }

        if (
					typeof sticky_element.attr('data-sticky-offset') !== 'undefined' &&
					sticky_element.attr('data-sticky-offset') !== ''
				) {

          if (sticky_element.attr('data-sticky-offset') == 'center') {
            sticky_options.offset_top = ($(window).height() / 2) - (sticky_element.outerHeight() / 2)
          } else {
            sticky_options.offset_top = parseInt(sticky_element.attr('data-sticky-offset'))
          }

        }

        var sticky_breakpoint = false

        if (
          typeof sticky_element.attr('data-sticky-breakpoint') !== 'undefined' &&
          sticky_element.attr('data-sticky-breakpoint') !== '' &&
          sticky_element.attr('data-sticky-breakpoint') !== 'never'
        ) {

          sticky_breakpoint = parseInt(sticky_element.attr('data-sticky-breakpoint'))

        }

        console.log('sticky options', sticky_options)

        sticky_element.stick_in_parent(sticky_options)

        if (sticky_breakpoint != false) {

          sticky_responsive(sticky_element, sticky_breakpoint, sticky_options)

          $(window).resize(function() {
            sticky_responsive(sticky_element, sticky_breakpoint, sticky_options)
          })

        }

        // after activating,
        // see if this is the page header or a child of the page header
        // if so, add its height to the sticky_offset value for future sticky elements

        if (sticky_element.parents('#page-header').length) {
          sticky_offset += element_height
        }


      })

    }

    // MAGNIFY

    if ($('.magnify').length) {
      $('.magnify img').magnify()
    }

		if (!$('body').hasClass('has-query')) {
			$('body').removeClass('spinner-on')
		}

    if (global_logging == true) {
      console.log('end of global-functions');
      console.log('- - - - -');
    }

  });
})(jQuery);
