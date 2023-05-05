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

    scroll_offset += $('#main-header').outerHeight();

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

    if ($('#main-header').hasClass('fixed-top')) {
      sticky_offset += $('#main-header').outerHeight()
    }

    // console.log(sticky_offset)

    // FOOTNOTES

    if ($('.footnote').length) {
      $(document).footnotes()
    }
		
		// OVERLAY
		
		$(document).overlay()

    // SMOOTH SCROLL

		var smooth_scroll_offset = 0

		if ($('#wpadminbar').length) {
			smooth_scroll_offset += $('#wpadminbar').outerHeight()
		}

		$(document).smooth_scroll({
			debug: false,
			offset: smooth_scroll_offset,
			next: '.fw-section'
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

    if ($('.swiper').length) {

			// console.log($('.swiper-container'))

      $('.swiper').each(function(i) {

        let this_id = $(this).attr('id'),
            swiper_settings = JSON.parse($(this).attr('data-swiper-settings'))

				// if the swiper is a bootstrap .container,
				// wrap each .col-* slide in a .row

				if ($(this).parent().hasClass('row')) {

					$(this).find('.swiper-slide').removeClass('swiper-slide')

					$(this).find('.fw-column').wrap('<div class="row justify-content-center swiper-slide">')

				}

        // console.log(swiper_settings)
        
        swipers[i] = {
          id: this_id,
          settings: swiper_settings
        }

      })
      
      if (swipers.length) {
        
        // console.log('swipers', swipers)
        
        swipers.forEach(function(swiper_element, i) {
          
          swipers[i]['instance'] = new Swiper('#' + swiper_element.id, swiper_element.settings)
          
        })
        
      }
      
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
    
    // AOS
    
    if ($('[data-aos]').length) {
      AOS.init()
    }

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
        // and this is NOT the page header

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
            
            if ($('body').hasClass('admin-bar')) {
              sticky_options.offset_top += 32
            }
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

        if (sticky_element.parents('#main-header').length) {
          sticky_offset += element_height
        }


      })

    }

    // MAGNIFY

    if ($('.magnify').length) {
      $('.magnify img').magnify()
    }
		
		// INVIEW
		
		if ($('[data-header-style]').length) {
			
			inView.offset({
				top: 100,
				bottom: $(window).outerHeight() - 100
			})
			
			$(window).scroll(function() {
			
				// check for dark styles in view
		
				var header_style = 'light'
		
				$('[data-header-style="dark"]').each(function() {
		
					if (inView.is(document.querySelector('#' + $(this).attr('id')))) {
						header_style = 'dark'
					}
		
				})
		
				// check for hidden styles in view
				
				$('[data-header-style="hidden"]').each(function() {
					
					if (inView.is(document.querySelector('#' + $(this).attr('id')))) {
						
						header_style = 'hidden'
						
					}
		
				})
		
				// default to light
		
				$('#main-header').attr('data-current-style', header_style)
		
			})
			
		}
		
		//
		// PAGE STATES
		//

		if (!$('body').hasClass('has-query')) {
			$('body').removeClass('spinner-on')
		}

    if (global_logging == true) {
      console.log('end of global-functions');
      console.log('- - - - -');
    }

  });
})(jQuery);
