const geoapi_url = 'https://geo-api.riskprofiler.ca';

// risk profiler
// v1.0

(function ($) {

  // custom select class

  function rp_risks(item, options) {

    // options

    var defaults = {
			map: {
				object: null,
				offset: $('.app-sidebar').outerWidth(),
				geojson: null,
				choropleth: null,
				selected_polygon: null,
			},
			api: {
				base_URL: geoapi_url + '/collections/opendrr_psra_indicators_',
				version: '1.4.0',
				retrofit: 'b0', // or r1
				aggregation: 'csd', // or s
				agg_prop: 'csduid', // or Sauid,
				featureProperties: '', // Limit fetched properties for performance
				limit: 100,
				lang: 'en_US',
				bbox: null,
				geojson_URL: null,
				data: [],
				features: []
			},
			variable: {
				key: 'eC_Fatality',
				retrofit: 'b0'
			},
			legend: {
				max: 0,
        grades: []
			},
			search: {
				input: null
			},
			colors: {
				shape: '#8b0707',
				shape_hover: '#ba0728',
				shape_select: '#d90429'
			},
			sidebar: {
				list: null,
				item: null
			},
			lang: 'en',
			logging: {
				feature_count: 0,
				update_count: 0
			},
      debug: false
    };

    this.options = $.extend(true, defaults, options);

    this.item = $(item);
    this.init();
  }

  rp_risks.prototype = {

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
        console.log('risks', 'initializing')
      }

			if ($('body').hasClass('lang-fr')) {
				plugin_settings.lang = 'fr'
			}

			//
			// MAP
			//

			// create object

	    plugin_settings.map.object = L.map('map', {
				zoomControl: false
			}).setView([55,-105], 4);

			var map = plugin_settings.map.object

			L.control.zoom({
				position: 'topright'
			}).addTo(map);

			// basemaps

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map)

			// GEOJSON

			// layer for choropleth

			plugin_settings.map.choropleth = L.geoJSON([], {
		    style: {
					color: plugin_settings.colors.shape,
					fillColor: plugin_settings.colors.shape,
					weight: 0.7
				},
				onEachFeature: function (feature, layer) {

					var prop_key = plugin_settings.variable.key + '_' + plugin_settings.api.retrofit

					plugin_settings.api.features[feature.id] = layer

					// console.log(plugin_instance._choro_color(feature.properties[prop_key]))

					if (typeof feature !== 'undefined') {

						layer.setStyle(plugin_instance._choro_style(feature))

						layer
							.bindPopup(function(e) {

								console.log(e.feature.properties[plugin_settings.variable.key + '_' + plugin_settings.api.retrofit])

								var popup_markup = '<div class="d-flex align-items-center">'

									popup_markup += '<h5 class="risk-popup-city flex-grow-1 mb-0 p-2">' + e.feature.properties.csdname + '</h5>'
									popup_markup += '<div class="risk-popup-rank border-left py-2 px-3 font-size-lg text-primary">' + 'X' + '</div>'

								popup_markup += '</div>'

								popup_markup += '<div class="risk-popup-details bg-light p-2">'

									popup_markup += '<span class="risk-detail-link btn btn-outline-primary" data-id="' + e.feature.properties.csduid + '">View Details</span>'

								popup_markup += '</div>'

								return L.Util.template(popup_markup)

							}, {
								className: 'risk-popup'
							})
							.on('mouseover', function () {

								// if the shape isn't already selected

								if (plugin_settings.map.selected_polygon != feature.properties.csduid) {

									this.setStyle({
										'color': plugin_settings.colors.shape_hover,
										'fillColor': plugin_settings.colors.shape_hover
									})

									// $('.sidebar-item').removeClass('hover')
									//
									// $('.sidebar-item[data-id="' + feature.properties.csduid + '"]').addClass('hover')

								}

	            })
							.on('mouseout', function () {

								// if already selected, do nothing
								// if another layer is selected, reset this one

								// $('.sidebar-item').removeClass('hover')
								//

								if (plugin_settings.map.selected_polygon != feature.properties.csduid) {

									this.setStyle(plugin_instance._choro_style(this.feature))

								}

	            })
							.on('click', function() {

								plugin_instance.item_select({
									item_id: feature.properties.csduid,
									polygon: this
								})

							})

					}

				}

			}).addTo(map)

			// CONTROLS

			// search

			plugin_settings.search.spinner = $('<div id="map-search-spinner" class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading...</span></div>').hide()

			plugin_settings.search.clear = $('<div id="map-search-clear"><i class="fas fa-times-circle"></i></div>')

			plugin_settings.search.menu = $('<div id="map-search-menu">')

			plugin_settings.search.results = $('<ul class="list-group"></ul>')

			plugin_settings.search.element = L.DomUtil.create('div', 'map-search')

			L.Control.Search = L.Control.extend({
		    onAdd: function(map) {

					plugin_settings.search.element.innerHTML = '<input name="map-search-input" id="map-search-input" class="form-control" placeholder="Search communities">'

	        return plugin_settings.search.element
		    }
			})

			L.control.search = function(opts) {
		    return new L.Control.Search(opts)
			}

			plugin_settings.map.search = L.control.search({
				position: 'topleft'
			}).addTo(map)

			// enable input on the search field
			plugin_settings.search.input = document.getElementById('map-search-input')
			L.DomEvent.disableClickPropagation(plugin_settings.search.input)

			plugin_settings.search.input = $(plugin_settings.search.input)

			// append elements

			$(plugin_settings.search.element)
				.append(plugin_settings.search.clear)
				.append(plugin_settings.search.menu)

			$(plugin_settings.search.menu)
				.append(plugin_settings.search.spinner)
				.append(plugin_settings.search.results)

			// enable scrolling in search results

			el_menu = L.DomUtil.get('map-search-menu')

			L.DomEvent.on(el_menu, 'mousewheel', L.DomEvent.stopPropagation)

			// events

			plugin_settings.search.input.on('focus', function() {
				if (plugin_settings.search.input.val() != '') {
					plugin_settings.search.menu.show()
				}
			})

			plugin_settings.search.input.on('input', function() {

				plugin_settings.search.menu.show()
				plugin_settings.search.spinner.show()
				plugin_settings.search.results.empty()

				var term = $(this).val()

				if (term != '') {

					plugin_settings.search.clear.show()

					$.ajax({
						url: 'http://geogratis.gc.ca/services/geolocation/' + plugin_settings.lang + '/locate?q=*' + term + '*',
						success: function(data) {

							if (data.length) {

								data.forEach(function(i) {

									var new_result = $('<div class="search-result list-group-item list-group-item-action">' + i.title + '</div>')

									if (i.bbox) {

										new_result.attr('data-bounds', JSON.stringify(i.bbox))

									} else if (i.geometry.coordinates) {

										new_result.attr('data-coords', '[' + i.geometry.coordinates[1] + ',' + i.geometry.coordinates[0] + ']')

									}

									plugin_settings.search.results.append(new_result)

								})

							}

							plugin_settings.search.spinner.hide()

						}
					})

				} else {

					plugin_settings.search.clear.fadeOut(250)
					plugin_settings.search.menu.fadeOut(250)
					plugin_settings.search.spinner.fadeOut(250)

				}

			})

			$('body').on('click', '.search-result', function(e) {

				L.DomEvent.stop(e)
				e.stopPropagation()

				if ($(this).attr('data-bounds')) {

					var bounds = JSON.parse($(this).attr('data-bounds'))

					map.fitBounds([
						[bounds[1], bounds[0]],
						[bounds[3], bounds[2]]
					], {
						paddingTopLeft: [$(window).outerWidth() / 4, 0]
					})

				} else if ($(this).attr('data-coords')) {

					$('body').profiler('center_map', {
						map: map,
						coords: JSON.parse($(this).attr('data-coords')),
						offset: $(window).outerWidth() / 4
					})

				}

				plugin_settings.search.menu.hide()

			})

			plugin_settings.search.clear.click(function() {
				plugin_settings.search.input.val('')
				plugin_settings.search.clear.fadeOut(250)
				plugin_settings.search.results.empty()
				plugin_settings.search.menu.hide()
				plugin_settings.search.spinner.hide()
			})

			$('body').on('click', '.risk-var', function() {

				console.log('click var')

				var this_var = JSON.parse($(this).attr('data-indicator'))

				console.log(this_var)

				plugin_settings.variable.key = this_var.key

				// reset the history state
				$(document).profiler('do_history', '#' + plugin_settings.variable.key)

        // reset legend max
        plugin_settings.legend.max = 0

				$(document).overlay('hide')

				plugin_instance.fetch_geoapi()

			})

			// EVENTS

			map.on('popupclose', function(e) {

				plugin_instance.item_select({
					event: 'popupclose'
				})

			});

			//
			// FILTER
			//

			$(document).profiler('get_controls', 'risks')

			//
			// SIDEBAR
			//

			$(document).profiler('get_sidebar', {
				url: 'risks/items.php',
				complete: function() {

					plugin_settings.sidebar.list = $('body').find('.sidebar-items .list-group')

					plugin_settings.sidebar.item = plugin_settings.sidebar.list.find('.sidebar-item')[0]

					$('body').addClass('spinner-on')
					$('#spinner-progress').text('Loading items')

				}
			})

			$('body').on('mouseover', '.sidebar-item.city', function() {

				// if this item is not already selected

				if (!$(this).hasClass('selected')) {

					// this shape is not selected

					var this_id = parseInt($(this).attr('data-id'))

					// reset the choropleth, then go through all the shapes and re-evaluate

					plugin_settings.map.choropleth.resetStyle().eachLayer(function(layer) {

						if (layer.feature.properties.csduid == plugin_settings.map.selected_polygon) {

							// if the shape is selected

							layer.setStyle({
								'color': plugin_settings.colors.shape_select,
								'fillColor': plugin_settings.colors.shape_select
							})

						} else if (this_id == layer.feature.properties.csduid) {

							// if the shape matches the hovered sidebar item

							layer.setStyle({
								'color': plugin_settings.colors.shape_hover,
								'fillColor': plugin_settings.colors.shape_hover
							})

						}

					})

				}

			}).on('mouseleave', '.sidebar-item.city', function() {

				// if this item is not already selected

				if (!$(this).hasClass('selected')) {

					// this shape is not selected

					var this_id = parseInt($(this).attr('data-id'))

					// reset the choropleth, then find the selected polygon and set its colors

					plugin_settings.map.choropleth.resetStyle().eachLayer(function(layer) {

						layer.setStyle(plugin_instance._choro_style(layer.feature))

						// if (layer.feature.properties.csduid == plugin_settings.map.selected_polygon) {
						//
						//
						//
						// 	layer.setStyle({
						// 		'color': plugin_settings.colors.shape_select,
						// 		'fillColor': plugin_settings.colors.shape_select
						// 	})
						//
						// }

					})

				}

			}).on('click', '.sidebar-item.city', function() {

				if (!$(this).hasClass('selected')) {

					var this_id = parseInt($(this).attr('data-id'))

					plugin_settings.map.choropleth.resetStyle().eachLayer(function(layer) {

						if (this_id == layer.feature.properties.csduid) {

							plugin_instance.item_select({
								item_id: layer.feature.properties.csduid,
								polygon: layer
							})

							layer.openPopup()

						}

					})

				}

			})

			// LOAD

			if (window.location.hash) {

				console.log('hash exists')

				var init_id = window.location.hash.substring(1),
						init_item = $('body').find('#risk-var-' + init_id)

				console.log(window.location.hash, init_item)

				// trigger click the item

				init_item.trigger('click')

			} else {

				plugin_instance.fetch_geoapi()

			}

			//
			// DUMMY CLICKS
			//

			$('body').on('click', '.risk-detail-link', function() {
				map.closePopup()

				plugin_instance.item_detail($(this).attr('data-id'))
			})

			$('body').on('click', '.app-head-back', function(e) {

				$(document).profiler('get_sidebar', {
					url: 'risks/items.php',
					before: function() {

						$('.app-sidebar').attr('data-width', '')
						$('.app-head').attr('data-mode', '')

					},
					success: function() {

					}
				})

			})

			//
			// MISC
			//

			$(window).resize(function() {
				plugin_settings.map.offset = $('.app-sidebar').outerWidth()
			})

    },

		update_api_url: function() {

      var plugin_instance = this
      var plugin_settings = plugin_instance.options

			url = plugin_settings.api.base_URL
					+ plugin_settings.api.aggregation
					+ '_v' + plugin_settings.api.version
					+ '/items?'
					+ 'lang=' + plugin_settings.api.lang
					+ '&f=json'
					+ '&limit=' + plugin_settings.api.limit
					+ '&startindex=4300'

			if (plugin_settings.variable.key !== '') {

				url += '&properties=csdname,' + plugin_settings.api.agg_prop
						+ ','
					 	+ plugin_settings.variable.key
  					+ '_'
						+ plugin_settings.api.retrofit
      }

      if (plugin_settings.api.bbox !== null) {
        url += '&bbox=' + plugin_settings.api.bbox
      }

			plugin_settings.api.geojson_URL = url

			console.log('update_api_url', url)

			return url

		},

		fetch_geoapi: function(url = null, do_legend = true) {

      var plugin_instance = this
      var plugin_settings = plugin_instance.options

			var nxt_lnk

			$('body').addClass('spinner-on')
			$('#spinner-progress').text('Retrieving data')

			if ( url == null ) {
				url = plugin_instance.update_api_url()
			}

			$.ajax({
				url: url,
				success: function(data) {

					console.log(data)

					if (typeof data.features !== 'undefined') {

						data.features.forEach(function(feature) {

							var feature_val_key = plugin_settings.variable.key + '_' + plugin_settings.api.retrofit

							// check/update max value

							if (feature.properties[feature_val_key] > plugin_settings.legend.max) {
								plugin_settings.legend.max = feature.properties[feature_val_key]
							}

						})

						plugin_settings.api.data.push(data)

					}

					for (var l in data.links) {
						lnk = data.links[l]

						if (lnk.rel == 'next') {
							nxt_lnk = lnk.href
							break
						}
					}

					// if a 'next' link exists, continue loading data

					// if (nxt_lnk) {
					//
					// 	// recursive
	 				// 	// inherit do_legend setting
					// 	plugin_instance.fetch_geoapi(nxt_lnk, do_legend)
					//
					// } else {
					//
					// 	console.log('max', plugin_settings.legend.max)
					//
					// 	plugin_instance.process_geoapi()
					//
					// }

					// if (do_legend == true) {

						// console.log('process new legend')

						// determine legend grades

            var max_step = plugin_settings.legend.max

            // var max_step = plugin_settings.legend.max * Math.pow(10, plugin_settings.indicator.aggregation[plugin_settings.aggregation.current.agg]['rounding'])

            var pow = 0,
                legend_steps = 9,
								legend_step = 0

						plugin_settings.legend.grades = []

						console.log('max ' + max_step)

						if (max_step >= 1) {

							while (max_step > 100) {
								pow += 1
								max_step = plugin_settings.legend.max / Math.pow(10, pow)
							}

							// create an array of breaks for the legend values

							legend_step = max_step / legend_steps

							// console.log('step', legend_step)

              for (i = 1; i <= legend_steps; i += 1) {
                plugin_settings.legend.grades.push((max_step - (legend_step * i)) * Math.pow(10, pow))
              }

						} else {

							legend_step = max_step / legend_steps

							// console.log('step', legend_step)

              for (i = 1; i <= legend_steps; i += 1) {
                plugin_settings.legend.grades.push(max_step - (legend_step * i))
              }

						}

						// console.log('legend', plugin_settings.legend.grades)

					// }

					plugin_instance.process_geoapi()

				}
			})

		},

		process_geoapi: function() {

      var plugin_instance = this
      var plugin_settings = plugin_instance.options

			plugin_settings.api.data.forEach(function(collection) {

				// iterate through the returned features

				// console.log(collection)

				collection.features.forEach(function(feature, z) {

					var prop_key = plugin_settings.variable.key + '_' + plugin_settings.api.retrofit

					// console.log(feature.id, feature.properties.csdname)

					if (typeof plugin_settings.api.features[feature.id] !== 'undefined') {

						plugin_settings.api.features[feature.id]['feature'] = feature

						// var rounded_color = feature.properties[prop_key] * Math.pow(10, plugin_settings.indicator.aggregation[plugin_settings.aggregation.current.agg]['rounding'])

						plugin_settings.api.features[feature.id].setStyle({
							fillColor: plugin_instance._choro_color(feature.properties[prop_key])
						})/*.setPopupContent(function(e) {

							// update the popup content

							return L.Util.template('<p>'
								+ plugin_settings.indicator.legend.prepend
								+ feature.properties[prop_key].toLocaleString(undefined, { maximumFractionDigits: plugin_settings.indicator.aggregation[plugin_settings.aggregation.current.agg]['decimals'] })
								+ ' '
								+ plugin_settings.indicator.legend.append
								+ '</p>'
							)

						})*/

						plugin_settings.logging.update_count += 1

					} else {

						// console.log(feature)

						plugin_settings.map.choropleth.addData(feature)

						plugin_settings.logging.feature_count += 1

						// var new_item = $(plugin_settings.sidebar.item).clone().appendTo(plugin_settings.sidebar.list)
						//
						// new_item.attr('data-id', feature.properties.csduid)
						// new_item.find('.sidebar-item-header').html(feature.properties.csdname)

					}

				})
			})

			console.log('added ' + plugin_settings.logging.feature_count + ' layers, updated ' + plugin_settings.logging.update_count + ' layers')

			plugin_settings.logging.feature_count = 0
			plugin_settings.logging.update_count = 0

			// remove progress
			$('body').removeClass('spinner-on')
			$('#spinner-progress').text('')

		},

		create_popup: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      // options

			var defaults = {
				item_id: 1
			}

			if (typeof fn_options == 'number') {
				defaults.item_id = fn_options
				fn_options = {}
			}

      var settings = $.extend(true, defaults, fn_options)

			var popup_data = {
				1: {
					city: 'Ottawa-Gatineau',
					province: 'Ontario',
					rank: 1
				},
				2: {
					city: 'Vancouver',
					province: 'British Columbia',
					rank: 2
				},
			}

			var this_popup = popup_data[settings.item_id]

			var popup_markup = '<div class="d-flex align-items-center">'

				popup_markup += '<h5 class="risk-popup-city flex-grow-1 mb-0 p-2">' + this_popup.city + '</h5>'
				popup_markup += '<div class="risk-popup-rank border-left py-2 px-3 font-size-lg text-primary">' + this_popup.rank + '</div>'

			popup_markup += '</div>'

			popup_markup += '<div class="risk-popup-details bg-light p-2">'

				popup_markup += '<span class="risk-detail-link btn btn-outline-primary" data-id="' + settings.item_id + '">View Details</span>'

			popup_markup += '</div>'

			return popup_markup

		},

    item_select: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      // options

			var defaults = {
				item_id: null,
				polygon: null,
				event: null
			}

			if (typeof fn_options == 'number') {
				defaults.item_id = fn_options
				fn_options = {}
			}

      var settings = $.extend(true, defaults, fn_options)

			console.log('risks', 'select', settings)

			var timeout = 250

 			// if this is triggered by a popup close,
			// wait and see if another one was opened

			if (settings.event == 'popupclose') {

				timeout = 0

			}

			setTimeout(function() {

				// selected polygon = clicked ID or null
				plugin_settings.map.selected_polygon = settings.item_id

				// reset choropleth
				// plugin_settings.map.choropleth.resetStyle()

				// reset sidebar
				$('.sidebar-item').removeClass('selected')

				if (settings.item_id != null) {

					// select the polygon

					settings.polygon.setStyle({
						color: plugin_settings.colors.shape_select,
						fillColor: plugin_settings.colors.shape_select
					})

					// center the map on the clicked polygon

					$('body').profiler('center_map', {
						map: plugin_settings.map.object,
						coords: settings.polygon.getCenter(),
						offset: plugin_settings.map.offset
					})

					// select the sidebar item

					$('.sidebar-item[data-id="' + settings.item_id + '"]').addClass('selected')

				}

			}, timeout)

    },

    item_detail: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      // options

			var defaults = {
				item_id: 1
			}

			if (typeof fn_options == 'string') {
				defaults.item_id = fn_options
				fn_options = {}
			}

      var settings = $.extend(true, defaults, fn_options)

			console.log('risks', 'detail', settings.item_id)

			var detail_html

			$(document).profiler('get_sidebar', {
				url: 'risks/detail.php',
				data: {
					id: settings.item_id
				},
				before: function() {

					$('.app-sidebar').attr('data-width', 'half')
					$('.app-head').attr('data-mode', 'risk-detail')

				},
				success: function(data) {

					console.log('risks', 'detail', 'success')

				},
				complete: function() {

					console.log('risks', 'detail', 'done')

					$('.app-sidebar').find('.accordion').on('shown.bs.collapse', function () {

						$('.app-sidebar').find('.collapse.show').prev().addClass('open')

					}).on('hide.bs.collapse', function () {

						$('.app-sidebar').find('.collapse').prev().removeClass('open')

					})

				}
			})


    },

		_choro_color: function(d) {

      var plugin_instance = this
      var plugin_settings = plugin_instance.options

			return d >= plugin_settings.legend.grades[0] ? '#800026' :
				d >= plugin_settings.legend.grades[1] ? '#bd0026' :
				d >= plugin_settings.legend.grades[2] ? '#e31a1c' :
				d >= plugin_settings.legend.grades[3] ? '#fc4e2a' :
				d >= plugin_settings.legend.grades[4] ? '#fd8d3c' :
				d >= plugin_settings.legend.grades[5] ? '#feb24c' :
				d >= plugin_settings.legend.grades[6] ? '#fed976' :
				d >= plugin_settings.legend.grades[7] ? '#ffeda0' :
        '#ffffcc'

		},

		_choro_style: function(feature) {

      var plugin_instance = this
      //var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      //var plugin_elements = plugin_settings.elements

			// console.log(feature)

      var stroke = 0.4

			var prop_key = plugin_settings.variable.key + '_' + plugin_settings.api.retrofit

			// var rounded_color = feature.properties[prop_key] * Math.pow(10, plugin_settings.indicator.aggregation[plugin_settings.aggregation.current.agg]['rounding'])

			return {
				fillColor: plugin_instance._choro_color(feature.properties[prop_key]),
				weight: stroke,
				fillOpacity: 0.7,
				color: '#4b4d4d',
				opacity: 1
			}
		},

  }

  // jQuery plugin interface

  $.fn.rp_risks = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('rp_risks');

      if (!instance) {

        // create plugin instance if not created
        item.data('rp_risks', new rp_risks(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));
