// smooth scroll
// v2.0

;(function ($) {

  // custom select class

  function smooth_scroll (item, options) {
    this.item = $(item)

    // options

    var defaults = {
      viewport: $('html, body'),
      auto_init: true,
      classes: {
        init: 'smooth-scroll',
        link: 'smooth-scroll-link',
        next: 'smooth-scroll-next'
      },
      animation: {
        speed: 500,
        ease: 'swing'
      },
      offset: 0,
      next: 'section',
      cancel: true,
      complete: null,
      debug: true
    }

    this.options = $.extend(true, defaults, options)
    this.init()
  }

  smooth_scroll.prototype = {

    // init

    init: function () {
      var plugin_instance = this
      var plugin_item = plugin_instance.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      plugin_item.addClass('smooth-scroll-initialized')

      if (plugin_item.debug == true) {
        plugin_item.addClass('smooth-scroll-debug')
      }

      //
      // AUTO-INIT: add .smooth-scroll to any #hash links on the page
      //

      if (plugin_settings.auto_init == true) {

        $('a[href^="#"]').each(function() {

					if ($(this).attr('role') != 'tab') {

		        $(this).addClass('smooth-scroll')

					}

        })

      }

      //
      // DO ANY .smooth-scroll ELEMENTS EXIST ON THE PAGE
      //

      if ($('.' + plugin_settings.classes.init).length) {

        plugin_instance.check_links()

        //
        // ACTIONS
        //

        // click .smooth-scroll-link

        $('body').on('click', '.' + plugin_settings.classes.link, function (e) {
          e.preventDefault()

          var link_data = $(this).data()

          // default settings

          var scroll_settings = {
            target_id: $(this).attr('href')
          }

          // check data atts for adjustments

          for (var key in link_data) {
            console.log(key, link_data[key])

            // if it's a callback

            if (key == 'complete') {
              scroll_settings[key] = new Function(link_data[key])
            } else {
              scroll_settings[key] = link_data[key]
            }

          }

          if ($(this).hasClass(plugin_settings.classes.next)) {
            scroll_settings.target_id = $(this).parents(plugin_settings.next).next(plugin_settings.next).attr('id')
          }

          plugin_instance.scroll_to(scroll_settings)

        })

      } else {

        if (plugin_settings.debug == true) {
          console.log('no smooth scroll elements exist on the page')
        }

      }

      if (plugin_settings.debug == true) {
        console.log('smooth scroll', 'initialized')
      }
    },

    scroll_to: function (fn_options) {
      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      // options

      if (typeof fn_options == 'string') {

        fn_options = {
          target_id: fn_options
        }

      }

      var defaults = $.extend(
        true,
        {
          target_id: null,
          viewport: $('html, body'),
          speed: plugin_settings.animation.speed,
          ease: plugin_settings.animation.ease,
          offset: plugin_settings.offset,
          cancel: plugin_settings.cancel,
          complete: plugin_settings.complete
        },
        fn_options
      )

      var settings = $.extend(true, defaults, fn_options)

      if (settings.target_id.charAt(0) != '#') {
        settings.target_id = '#' + settings.target_id
      }

      if ($(settings.target_id).length) {

        // the target element exists

        // viewport's position in the window
        var viewport_position = settings.viewport.offset().top

        // viewport's scroll position
        var viewport_scrolltop = settings.viewport.scrollTop()

        if (typeof settings.viewport == 'object') {
          var viewport_object = settings.viewport[settings.viewport.length - 1]
          viewport_scrolltop = $(viewport_object).scrollTop()
        }

        // element's position in the window
        var element_position = $(settings.target_id).offset().top

        // current scroll position PLUS the element's position (offset by the viewport's position)
        // var destination = (viewport_scrolltop + (element_position - viewport_position)) - settings.offset
        var destination = element_position - settings.offset

        if (plugin_settings.debug == true) {
          // console.log('id', settings.target_id)
          // console.log('viewport’s position in the window', viewport_position)
          // console.log('viewport’s current scroll position', viewport_scrolltop)
          // console.log('target element’s position', element_position)
          // console.log('final scroll position', destination)

          console.log('scroll ' + plugin_settings.viewport + ' to ' + destination + ' so that ' + settings.target_id + ' is in view')
        }

        if (settings.cancel === true) {
          settings.viewport.on('scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove', function () {
            settings.viewport.stop()
          })
        }

        plugin_settings.viewport.animate({
          scrollTop: destination
        }, {
          duration: settings.speed,
          easing: settings.ease,
          complete: function () {
            settings.viewport.off('scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove')
          }
        }).promise().then(function () {
          if (typeof (settings.complete) == 'function') {
            settings.complete.call(this)
          }
        })
      } else {
        if (plugin_settings.debug == true) {
          console.log("target element doesn't exist")
        }
      }

      if (plugin_settings.debug == true) {
        console.log('scroll to ' + settings.target_id)
      }
    },

		check_links: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

			// find all .smooth-scroll elements

			$('.' + plugin_settings.classes.init).each(function () {
				if ($(this).is('a')) {

					// if it's an <a> tag, add the class

					$(this).addClass(plugin_settings.classes.link)
				} else {

					// or, add the class to all <a> tags inside it

					$(this).find('a').each(function () {
						$(this).addClass(plugin_settings.classes.link)
					})
				}
			})

			//
			// CHECK EACH .smooth-scroll-link TO SEE IF ITS TARGET EXISTS ON THIS PAGE
			//

			$('.' + plugin_settings.classes.link).each(function () {
				var is_valid = true

				if (plugin_settings.debug == true) {
					console.log('checking', $(this).attr('href'))
				}

				var this_href = $(this).attr('href')

				if (typeof this_href !== 'undefined' && this_href !== null && this_href != '') {

					// the href is not blank

					if (this_href.charAt(0) == '#') {

						// the link is an anchor

						if (plugin_settings.debug == true) {
							console.log('href is an anchor')
						}

					} else {

						// if the URL part of the link is the current page

						this_path = this_href.substring(0, this_href.indexOf('#'))

						if (window.location.href.indexOf(this_path) !== -1) {

							if (plugin_settings.debug == true) {
								console.log('href contains the current URL')
							}

							// replace the href with just the anchor

							this_href = this_href.substring(this_href.indexOf("#"))

							$(this).attr('href', this_href)

							console.log($(this).attr('href'))

						} else {

							if (plugin_settings.debug == true) {
								console.log('href goes to another page')
							}

							is_valid = false

							$(this).addClass('smooth-scroll-external')

						}
					}

				} else {

					is_valid = false

					$(this).addClass('smooth-scroll-no-href')

				}

				if (is_valid == true) {

					// the link is still valid

					if (this_href == '#') {

						// the link is an empty # anchor, try and locate its parent

						if ($(this).parents(plugin_settings.next).length) {

							$(this).addClass(plugin_settings.classes.next);

						} else {

							is_valid = false

							$(this).addClass('smooth-scroll-no-target')

							if (plugin_settings.debug == true) {
								console.log('no matching parent')
							}

						}

					} else if ($(this_href).length) {

						if (plugin_settings.debug == true) {

							// the ID exists on the page
							console.log(this_href + ' exists')

						}

					} else {

						if (plugin_settings.debug == true) {
							console.log(this_href + ' doesn\'t exist')
						}

						is_valid = false

						$(this).addClass('smooth-scroll-no-element')

					}

				}

				if (is_valid == false) {

					// if the link is no longer valid,
					// remove the .smooth-scroll-link class
					// and add the .smooth-scroll-deactivated class

					$(this).removeClass(plugin_settings.classes.link).addClass('smooth-scroll-deactivated')

				} else {


				}

			})

		},

    next: function (fn_options) {
      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      // options

      if (typeof fn_options == 'string') {

        fn_options = {
          next: fn_options
        }

      }

      var defaults = $.extend(
        true,
        {
          next: plugin_settings.next
        },
        fn_options
      )

      var settings = $.extend(true, defaults, fn_options)

      // does the link have a parent tag the same as the set 'next' element

      if (settings.clicked.parents(settings.next).length) {

        next_element = settings.clicked.parents(settings.next)

      }

      // plugin_instance.scroll_to({
      //   target_id: settings.next
      // })

    }

  }

  // jQuery plugin interface

  $.fn.smooth_scroll = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1)

    return this.each(function () {
      var item = $(this)
      var instance = item.data('smooth_scroll')

      if (!instance) {

        // create plugin instance if not created
        item.data('smooth_scroll', new smooth_scroll(this, opt))
      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args)
        }
      }
    })
  }
}(jQuery))
