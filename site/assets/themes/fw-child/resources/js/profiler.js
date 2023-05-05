const geoapi_url = 'https://geo-api.riskprofiler.ca'
const pbf_url = 'https://riskprofiler.ca'
const api_url = 'https://api.riskprofiler.ca'

// scenario profiler
// v1.0

;(function ($) {

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

      var plugin = this;
      var plugin_item = this.item;
      var plugin_settings = plugin.options;
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

			// sort items

			$('body').on('click', '.sort-item', function(e) {

				var sort_order

				// if not selected
				// set sort to 'asc' and select

				if (!$(this).hasClass('selected')) {

					$(this).addClass('selected')

					$(this).siblings().attr('data-sort-order', 'asc').removeClass('selected')

					sort_order = 'asc'

				} else {

					// if selected,
					// reverse the order

					if ($(this).attr('data-sort-order') == 'asc') {
						sort_order = 'desc'
					} else {
						sort_order = 'asc'
					}

				}

				$(this).attr('data-sort-order', sort_order)

				plugin.sort_items({
					key: $(this).attr('data-sort-key'),
					order: sort_order
				})

			})

    },

    get_sidebar: function(fn_options) {

      var plugin = this
      var plugin_item = this.item
      var plugin_settings = plugin.options
      var plugin_elements = plugin_settings.elements

      // options

			var defaults = {
				url: '',
				method: 'GET',
				data: {
					lang: plugin_settings.lang
				},
				before: null,
				success: null,
				complete: null
			}

			if (typeof fn_options == 'string') {
				defaults.url = fn_options
				fn_options = {}
			}
			
      var settings = $.extend(true, defaults, fn_options)
			
			// console.log(settings)

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

      var plugin = this
      var plugin_item = this.item
      var plugin_settings = plugin.options
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

				},
				complete: function() {

					if (typeof settings.complete == 'function') {
						settings.complete()
					}

        }
			})

    },

		sort_items: function(fn_options) {

      var plugin = this
      var plugin_settings = plugin.options

			var settings = $.extend(true, {
				key: null,
				order: null
			}, fn_options)

			console.log($('body').find('.sidebar-item'))

			var result = $('body').find('.sidebar-item[data-' + settings.key + ']').sort(function (a, b) {

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

      var plugin = this
      var plugin_item = this.item
      var plugin_settings = plugin.options
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

			var plugin = this
			var plugin_settings = plugin.options

			var defaults = {
				url: {
					collection: 'psra_indicators',
					aggregation: 'csd',
					version: '1.4.3',
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
					before: null,
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

			// remove existing layer

			if (settings.map.hasLayer(settings.tiles)) {
				settings.map.removeLayer(settings.tiles)
			}

			if (settings.aggregation !== null) {
				settings.url.aggregation = settings.aggregation.current.agg
			}

			proto_URL = pbf_url + '/' + settings.url.collection + '_' + settings.url.aggregation + '/' + settings.url.projection + '/{z}/{x}/{y}.pbf'

			// console.log(settings.url)
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

			var plugin = this
			var plugin_settings = plugin.options

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

		},

		round: function(fn_options) {

			var settings = $.extend(true, {
				num: 0,
				power: 0
			}, fn_options)

			return settings.num * Math.pow(10, settings.power)
		},

		round_dollars: function(num) {

			var plugin = this,
					rounded_num

			if (num > 1000000000) {
				rounded_num = plugin._round(num, -9).toFixed(2) + ' billion'
			} else if (num > 100000) {
				rounded_num = plugin._round(num, -6).toFixed(2) + ' million'
			} else {
				rounded_num = num.toLocaleString('en-CA', {
					maximumFractionDigits: 0
				})
			}

			return '$' + rounded_num

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
