// scenario profiler
// v1.0

(function ($) {

  // custom select class

  function profiler(item, options) {

    // options

    var defaults = {
			history: {
				title: null,
				url: null
			},
      debug: false
    };

    this.options = $.extend(true, defaults, options);

    this.item = $(item);
    this.init();
  }

  profiler.prototype = {

    // init

    init: function () {

      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;

      //
      // INITIALIZE
      //

      if (plugin_settings.debug == true) {
        console.log('profiler', 'initializing')
      }

			// store the page title for history API stuff

			plugin_settings.history.title = document.title
			plugin_settings.history.url = window.location.href

			if (plugin_settings.history.url.indexOf('#') !== -1) {
				plugin_settings.history.url = plugin_settings.history.url.substr(0, plugin_settings.history.url.indexOf('#'))
			}

			$('<div id="spinner-overlay">').insertBefore('#spinner')
			$('<div id="spinner-progress">').insertAfter('#spinner')

			//
			// ACTIONS
			//

			// CONTROLS

			$('body').on('click', '.control-toggle', function() {

				var this_control = $(this).attr('data-control')

				if ($(this).hasClass('open')) {

					$(this).removeClass('open')

					$('body').find('#app-control-' + this_control).slideUp(200)

				} else {

					$('body').find('.control-toggle').removeClass('open')

					$(this).addClass('open')

					$('body').find('.app-sidebar-control').not('#app-control-' + this_control).slideUp(200)

					$('body').find('#app-control-' + this_control).slideDown(200)

				}

			})

    },

    get_sidebar: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      // options

			var defaults = {
				url: '',
				method: 'GET',
				data: null,
				before: null,
				success: null,
				complete: null
			}

			if (typeof fn_options == 'string') {
				defaults.url = fn_options
				fn_options = {}
			}

      var settings = $.extend(true, defaults, fn_options)

			$('body').addClass('spinner-on')
			$('#spinner-progress').text('Initializing')

			if (typeof settings.before == 'function') {
				settings.before()
			}

			$('.app-sidebar-content').fadeOut(125, function() {

				$.ajax({
					url: '../site/assets/themes/fw-child/template/' + settings.url,
					method: settings.method,
					data: settings.data,
					success: function(data) {

						$('.app-sidebar-content').html(data).fadeIn(500).scrollTop(0)

						if (typeof settings.success == 'function') {
	            settings.success(data)
	          }
					},
					complete: function() {

	          if (typeof settings.complete == 'function') {
	            settings.complete()
	          }
	        }
				})

			})

    },

    get_controls: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      // options

			var defaults = {
				dir: ''
			}

			if (typeof fn_options == 'string') {
				defaults.dir = fn_options
				fn_options = {}
			}

      var settings = $.extend(true, defaults, fn_options)

			// bar

			$.ajax({
				url: '../site/assets/themes/fw-child/template/' + settings.dir + '/control-bar.php',
				success: function(bar_data) {
					$('.app-controls-content').html(bar_data)

					// filter

					$.ajax({
						url: '../site/assets/themes/fw-child/template/' + settings.dir + '/control-filter.php',
						success: function(filter_data) {
							$('.app-sidebar-filter').html(filter_data)

							// sort

							$.ajax({
								url: '../site/assets/themes/fw-child/template/' + settings.dir + '/control-sort.php',
								success: function(sort_data) {
									$('.app-sidebar-sort').html(sort_data)

									if (typeof settings.success == 'function') {
				            settings.success()
				          }

				          if (typeof settings.complete == 'function') {
				            settings.complete()
				          }
								},
								complete: function() {
				          $('body').removeClass('spinner-on')
									$('#spinner-progress').text('')
								}
							})

						}
					})

				},
				complete: function() {

					$('body').on('input', '#control-search-input', function() {

						var search_val = $(this).val().toUpperCase(),
								results

						if (search_val != '') {

							$('.sidebar-item-title').each(function() {

								console.log($(this).text().toUpperCase(), search_val, $(this).text().toUpperCase().indexOf(search_val))

								if ($(this).text().toUpperCase().indexOf(search_val) === -1) {

									$(this).closest('.sidebar-item').hide()

								} else {

									$(this).closest('.sidebar-item').show()

								}

							})

							// results = $('.sidebar-item-header:contains("' + search_val + '")')
							//
							// console.log(results)

						} else {

							$('body').find('.sidebar-item').show()

						}

					})

					$('body').on('click', '.sort-item', function(e) {

						// sort by what

						var sort_key = $(this).attr('data-sort-key')

						// sort order

						var sort_order = $(this).attr('data-sort-order')

						if ($(this).hasClass('selected')) {

							// already selected, reverse order

							sort_order = (sort_order == 'asc') ? 'desc' : 'asc'

						} else {

							// not selected

							$('body').find('.sort-item').removeClass('selected').attr('data-sort-order', 'asc')
							$(this).addClass('selected')

						}

						$(this).attr('data-sort-order', sort_order)

						plugin_instance.sort_items(sort_key, sort_order)

					})

        }
			})

    },

		sort_items: function(sort_key, sort_order) {

      var plugin_instance = this
      var plugin_settings = plugin_instance.options

			var result = $('body').find('.sidebar-item').sort(function (a, b) {

				var item = $(a).attr('data-' + sort_key)
				var compare = $(b).attr('data-' + sort_key)

				// console.log($(a).attr('data-' + sort_key), $(b).attr('data-' + sort_key))

				if (!isNaN($(a).attr('data-' + sort_key))) {

				  item = parseFloat(item)
				  compare = parseFloat(compare)

				}

				if (sort_order == 'asc') {
					return (item < compare) ? -1 : (item > compare) ? 1 : 0
				} else {
					return (item > compare) ? -1 : (item < compare) ? 1 : 0
				}

			})

			$('body').find('.sidebar-items').html(result)

			console.log('sort', sort_key, sort_order)

		},

		center_map: function(fn_options) {

			// centers the map on a point with an X offset of half of the width of the sidebar

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

			var settings = $.extend(true, {
				map: null,
				coords: [0, 0],
				offset: 0,
				zoom: 5
			}, fn_options)

			var center = settings.map.project(settings.coords)

			center = settings.map.unproject(new L.point(center.x - (settings.offset / 2), center.y))

			console.log('center', settings.coords, center)

      settings.map.setView([center.lat, center.lng], settings.zoom)

		},

		do_history: function(hash) {

			var plugin_instance = this
			var plugin_settings = plugin_instance.options

			var new_title = plugin_settings.history.title,
					new_url = plugin_settings.history.url

			if (hash) {

				new_title = $('body').find(hash).find('.sidebar-item-title').text() + ' — ' + new_title

				new_url = new_url + hash

			}

			// update page title

			$('title').text(new_title)

			// replace history state

			history.replaceState({}, new_title, new_url)

			// scroll to sidebar item

			setTimeout(function() {

				if (hash) {

					$('.app-sidebar-content').animate({
						scrollTop: $('body').find(hash).position().top + $('.app-sidebar-content').scrollTop() - 12
					}, 500)
				}

			}, 1000)

			console.log('history', new_url, new_title)

		}

  }

  // jQuery plugin interface

  $.fn.profiler = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('profiler');

      if (!instance) {

        // create plugin instance if not created
        item.data('profiler', new profiler(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));
