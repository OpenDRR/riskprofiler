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
			lang: 'en',
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

			// lang

			if ($('body').hasClass('lang-fr')) {
				plugin_settings.lang = 'fr'
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
			// $('#spinner-progress').text('Initializing')

			if (typeof settings.before == 'function') {
				settings.before()
			}

			var ajax_url

			if (settings.url.charAt(0) == '/' || settings.url.charAt(0) == '.' || settings.url.indexOf('http') !== -1) {
				ajax_url = settings.url
			} else {
				ajax_url = '../site/assets/themes/fw-child/template/' + settings.url
			}

			// console.log('get ' + ajax_url)

			$('.app-sidebar-content').fadeOut(125, function() {

				$.ajax({
					url: ajax_url,
					method: settings.method,
					data: settings.data,
					success: function(data) {

						var new_html = $(data)

						if (new_html.filter('.ajax-content').length) {
							new_html = new_html.filter('.ajax-content')
						}

						$('.app-sidebar-content').html(new_html).fadeIn(500).scrollTop(0)

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

					if (typeof settings.success == 'function') {
						settings.success()
					}

					// sort

					// $.ajax({
					// 	url: '../site/assets/themes/fw-child/template/' + settings.dir + '/control-sort.php',
					// 	data: {
					// 		lang: plugin_settings.lang
					// 	},
					// 	success: function(sort_data) {
					// 		$('.app-sidebar-sort').html(sort_data)
					//
					// 		if (typeof settings.success == 'function') {
					// 			settings.success()
					// 		}
					//
					// 		if (typeof settings.complete == 'function') {
					// 			settings.complete()
					// 		}
					// 	},
					// 	complete: function() {
					// 		$('body').removeClass('spinner-on')
					// 		$('#spinner-progress').text('')
					// 	}
					// })

				},
				complete: function() {

					if (typeof settings.complete == 'function') {
						settings.complete()
					}



        }
			})

    },

		sort_items: function(fn_options) {

      var plugin_instance = this
      var plugin_settings = plugin_instance.options

			var settings = $.extend(true, {
				key: null,
				order: null
			}, fn_options)

			console.log($('body').find('.sidebar-item:visible'))

			var result = $('body').find('.sidebar-item[data-' + settings.key + ']:visible').sort(function (a, b) {

				var item = $(a).attr('data-' + settings.key)
				var compare = $(b).attr('data-' + settings.key)

				console.log($(a).attr('data-' + settings.key), $(b).attr('data-' + settings.key))

				if (!isNaN($(a).attr('data-' + settings.key))) {

				  item = parseFloat(item)
				  compare = parseFloat(compare)

				}

				if (settings.order == 'asc') {
					return (item < compare) ? -1 : (item > compare) ? 1 : 0
				} else {
					return (item > compare) ? -1 : (item < compare) ? 1 : 0
				}

			})

			$('body').find('.sidebar-items').html(result)

			console.log('sort', settings.key, settings.order)

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

		get_tiles: function(fn_options) {

			var plugin_instance = this
			var plugin_settings = plugin_instance.options

			var defaults = {
				url: {
					collection: 'psra_indicators',
					aggregation: 'csd',
					version: '1.4.0',
					projection: 'EPSG_900913'
				},
				map: null,
				indicator: null,
				aggregation: null,
				options: {
		      rendererFactory: L.canvas.tile,
					pane: 'data',
		      interactive: true
				},
				functions: {
					add: null,
					mouseover: null,
					mouseout: null,
					click: null,
					complete: null
				}
			}

			if (fn_options.options) {
				defaults.options = $.extend(true, defaults.options, fn_options.options)
			}

			var settings = $.extend(true, defaults, fn_options)

			// console.log('get_tiles', settings)

			if (settings.map.hasLayer(settings.tiles)) {
				settings.map.removeLayer(settings.tiles)
			}

			if (settings.aggregation !== null) {

				settings.url.aggregation = settings.aggregation.current.agg

			}

			proto_URL = pbf_url + '/' + settings.url.collection + '_' + settings.url.aggregation /*+ '_v' + settings.url.version */ + '/' + settings.url.projection + '/{z}/{x}/{y}.pbf'

			// console.log('pbf url', proto_URL)

			// load the tiles
      var tiles = L.vectorGrid.protobuf(
				proto_URL,
				settings.options
			)

			// events

			if (typeof settings.functions.mouseover == 'function') {
				tiles.on('mouseover', function(e) {
					settings.functions.mouseover(e)
				})
			}

			if (typeof settings.functions.mouseout == 'function') {
				tiles.on('mouseout', function(e) {
					settings.functions.mouseout(e)
				})
			}

			tiles.on('click', function(e) {

				L.DomEvent.stop(e)

				if (typeof settings.functions.click == 'function') {
					settings.functions.click(e)
				}
			})

			tiles.on('add', function(e) {

				if (typeof settings.functions.add == 'function') {
					settings.functions.add(e)
				}

				return tiles
			})

			tiles.addTo(settings.map)

			if (typeof settings.functions.complete == 'function') {
				settings.functions.complete()
			}

			$('body').removeClass('spinner-on')

		},

		do_history: function(hash) {

			var plugin_instance = this
			var plugin_settings = plugin_instance.options

			var new_title = plugin_settings.history.title,
					new_url = plugin_settings.history.url

			if (hash) {

				new_url = new_url + hash

				if ($('body').find(hash).length) {
					new_title = $('body').find(hash).find('.sidebar-item-title').text() + ' — ' + new_title
				}

			}

			// update page title

			$('title').text(new_title)

			// replace history state

			history.replaceState({}, new_title, new_url)

			if ($('body').attr('id') == 'page-scenarios') {
				// scroll to sidebar item

				setTimeout(function() {

					if (hash) {

						// scroll to
						// the element's position
						// plus
						// the container's current scroll position
						// minus item padding (12px)

						var new_scroll = $('body').find(hash).position().top + $('.app-sidebar-content').scrollTop() - 12

						// adjust if sort menu is open

						if ($('body').find('#control-toggle-sort').hasClass('open')) {
							new_scroll -= $('#app-control-sort').outerHeight()
						}

						$('.app-sidebar-content').animate({
							scrollTop: new_scroll
						}, 500)
					}

				}, 1000)

			}

			// console.log('history', new_url, new_title)

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
