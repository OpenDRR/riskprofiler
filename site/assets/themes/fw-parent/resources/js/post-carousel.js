// post carousel
// dependencies: jquery
// v1.0

(function ($) {

  // custom select class

  function post_carousel(item, options) {

    this.item = $(item);

    // options

    var defaults = {
      item_id: null,
      classes: {
        item: 'query-item',
        item_wrap: 'swiper-wrapper'
      },
      slider_settings: {},
      paged: false,
      current_page: 1,
      elements: {},
      debug: false
    };

    this.options = $.extend(true, defaults, options);

    this.init();
  }

  post_carousel.prototype = {

    // init

    init: function () {

      var plugin_instance   = this
      var plugin_item       = plugin_instance.item
      var plugin_settings   = plugin_instance.options
      var plugin_classes    = plugin_settings.classes
      var plugin_elements   = plugin_settings.elements

      if (plugin_settings.debug == true) {
        console.log('post carousel', 'init', plugin_item.attr('id'));
      }

      // item ID

      // plugin_settings.item_id = plugin_item.attr('id')
      // plugin_settings.item_id = plugin_item.closest('.block-type-query').attr('id')
			plugin_settings.item_id = plugin_item.closest('.block-type-query_new').attr('id')

			// max pages

			plugin_settings.max_pages = plugin_item.attr('data-max-pages')

      //
      // ELEMENTS
      //

      plugin_elements.carousel = plugin_item.find('.swiper')

      var this_swiper_id = plugin_elements.carousel.attr('id')

      // find & destroy

      swipers.forEach(function(i) {

        if (i.id == this_swiper_id) {

          // plugin_settings.slider_settings = i.settings

          plugin_elements.carousel = i.instance

          // i.instance.destroy(false, true)
          // console.log('destroyed')

        }
      })

			plugin_elements.carousel.on('transitionEnd', function (swiper) {
				if (swiper.progress > 0.66666) {
					if (plugin_settings.current_page < plugin_settings.max_pages) {
		        plugin_instance._get_next()
					}
				}
			})

      // plugin_elements.carousel.on('reachEnd', function () {
      //   console.log('end')
			//
			// 	if (plugin_settings.current_page < plugin_settings.max_pages) {
	    //     plugin_instance._get_next()
			// 	}
			//
      // })


      // init

      if (typeof plugin_item.attr('data-page') != 'undefined') {
        plugin_settings.paged = true
      }

      //
      // INIT
      //

			console.log(plugin_item.attr('per-page'))
			console.log(plugin_elements.carousel)
			console.log(plugin_elements.carousel.params)

			if (parseInt(plugin_item.attr('per-page')) <= plugin_elements.carousel.params.slidesPerView) {
				console.log('init, get next')
	      plugin_instance._get_next()
			}

      //
      // ACTIONS
      //

      if (plugin_settings.debug == true) {
        console.log('post carousel', 'initialized')
      }

    },

    _get_next: function(fn_options) {

      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_classes = plugin_settings.classes;
      var plugin_elements = plugin_settings.elements;

      // options

      var defaults = {
        clicked: null,
        append: false
      };

      var settings = $.extend(true, defaults, fn_options);

			console.log('get next')

      if (plugin_settings.paged == true) {

        // plugin_elements.item_wrap.addClass('loading')
        $('body').addClass('spinner-on')

        // does the next page exist?

        var ajax_url = window.location.href.replace(window.location.search, '')

        // console.log(ajax_url)
        console.log(ajax_url + '?' + plugin_settings.item_id + '-page=' + (plugin_settings.current_page + 1))

        plugin_item.acf_query('get_page', {
          url: ajax_url + '?' + plugin_settings.item_id + '-page=' + (plugin_settings.current_page + 1),
          success: function(success_data) {

            console.log(success_data)

            if (success_data.empty == false && success_data.items.length) {

              plugin_settings.current_page += 1

              plugin_item.attr('data-page', plugin_settings.current_page)

              plugin_elements.carousel.appendSlide(success_data.items)

            }

          },
          complete: function() {

            // plugin_elements.item_wrap.removeClass('loading')
            $('body').removeClass('spinner-on')

          }
        });

      }

    }

  }

  // jQuery plugin interface

  $.fn.post_carousel = function (opt) {

    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('post_carousel');

      if (!instance) {

        // create plugin instance if not created
        item.data('post_carousel', new post_carousel(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));





/*

// post carousel
// dependencies: jquery
// v1.0

(function ($) {

  // custom select class

  function post_carousel(item, options) {

    this.item = $(item);

    // options

    var defaults = {
      item_id: null,
      classes: {
        item: 'query-item',
        item_wrap: 'slick-track'
      },
      paged: false,
      current_page: 1,
      elements: {},
      debug: false
    };

    this.options = $.extend(true, defaults, options);

    this.init();
  }

  post_carousel.prototype = {

    // init

    init: function () {

      var plugin_instance   = this
      var plugin_item       = plugin_instance.item
      var plugin_settings   = plugin_instance.options
      var plugin_classes    = plugin_settings.classes
      var plugin_elements   = plugin_settings.elements

      if (plugin_settings.debug == true) {
        console.log('post carousel', 'init', plugin_item.attr('id'));
      }

      // item ID

      // plugin_settings.item_id = plugin_item.attr('id')
      plugin_settings.item_id = plugin_item.closest('.block-type-query').attr('id')


      //
      // ELEMENTS
      //

      plugin_elements.carousel = plugin_item.find('[data-slick]');

      if (plugin_elements.carousel.hasClass('slick-initialized')) {
        plugin_elements.carousel.slick('unslick');
        console.log('unslick');
      }

      if (typeof plugin_elements.carousel.attr('data-page') != 'undefined') {
        plugin_settings.paged = true
      }

      // SET SLICK EVENTS

      // init

      plugin_elements.carousel.on('init', function() {
        plugin_elements.item_wrap = plugin_item.find('.' + plugin_classes.item_wrap)
      })

      // before change

      plugin_elements.carousel.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
        plugin_elements.carousel.addClass('sliding')
      });

      // after change

      plugin_elements.carousel.on('afterChange', function(event, slick, currentSlide) {
        plugin_elements.carousel.removeClass('sliding')

        // console.log('after change');

        if (
          plugin_elements.carousel.find('.' + plugin_classes.item).last().hasClass('slick-active')) {

          // console.log('get next')
          plugin_instance._get_next()

        }

      });

      // re-initialize as plugin element

      plugin_elements.carousel.slick()

      //
      // INIT
      //

      console.log('init, get next');
      plugin_instance._get_next()

      //
      // ACTIONS
      //

      if (plugin_settings.debug == true) {
        console.log('post carousel', 'initialized')
      }

    },

    _get_next: function(fn_options) {

      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_classes = plugin_settings.classes;
      var plugin_elements = plugin_settings.elements;

      // options

      var defaults = {
        clicked: null,
        append: false
      };

      var settings = $.extend(true, defaults, fn_options);

      if (plugin_settings.paged == true) {

        plugin_elements.item_wrap.addClass('loading')
        $('body').addClass('spinner-on')

        // does the next page exist?

        var ajax_url = window.location.href.replace(window.location.search, '')

        console.log(ajax_url)
        console.log(ajax_url + '?' + plugin_settings.item_id + '-page=' + (plugin_settings.current_page + 1))

        plugin_item.acf_query('get_page', {
          url: ajax_url + '?' + plugin_settings.item_id + '-page=' + (plugin_settings.current_page + 1),
          success: function(success_data) {

            if (success_data.items.length) {

              plugin_settings.current_page += 1

              success_data.items.each(function() {

                plugin_elements.carousel.slick('slickAdd', $(this))

              })

            }

          },
          complete: function() {

            plugin_elements.item_wrap.removeClass('loading')
            $('body').removeClass('spinner-on')

          }
        });

      }

    }

  }

  // jQuery plugin interface

  $.fn.post_carousel = function (opt) {

    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('post_carousel');

      if (!instance) {

        // create plugin instance if not created
        item.data('post_carousel', new post_carousel(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));


*/
