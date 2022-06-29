const geoapi_url = 'https://geo-api.riskprofiler.ca'
const pbf_url = 'https://riskprofiler.ca'

var click_flag = false
var bounds

var z = 0

// risk profiler
// v1.0

;(function ($) {

  // custom select class

  function rp_risks(item, options) {

    // options

    var defaults = {
			map: {
				object: null,
				panes: [],
				offset: $('.app-sidebar').outerWidth(),
				geojson: null,
				choropleth: null,
				current_zoom: 3,
				last_zoom: -1,
				last_click: null,
				selected_feature: null,
				tiles: null,
				defaults: {
					coords: [60, -110],
					zoom: 3
				}
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
      aggregation: {
        'current': {},
        'previous': null,
        'settings': {
          'default': [
            { min: 11, max: 15, agg: 's', prop: 'Sauid', bbox: true },
            { min: 1, max: 10, agg: 'csd', prop: 'csduid', bbox: false }
          ]
        }
      },
			indicator: {
				key: 'eC_Fatality',
				retrofit: 'b0'
			},
			legend: {
				max: 0,
        grades: [],
				colors: [
					'#ffffcc',
					'#ffeda0',
					'#fed976',
					'#feb24c',
					'#fd8d3c',
					'#fc4e2a',
					'#e31a1c',
					'#bd0026',
					'#800026'
				]
			},
			popup: null,
			community: null,
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
				items: [],
				markup: '<div class="sidebar-item city list-group-item list-group-item-action p-0"><div class="d-flex pt-1"><h5 class="sidebar-item-value d-flex align-items-center justify-content-center px-3 mb-0 border-right font-weight-normal text-center text-gray-500"></h5><div class="px-3 py-1"><p class="sidebar-item-header mb-0 text-body"></p><p class="sidebar-item-province mb-0"></p></div></div></div>',
				item: null,
				max: {
					eqri_abs_score: 100,
					eqri_norm_score: 100
				},
				features: []
			},
			lang: 'en',
			lang_prepend: '',
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
				plugin_settings.lang_prepend = '/fr'
			}

			//
			// MAP
			//

			// OBJECT

	    plugin_settings.map.object = L.map('map', {
				zoomControl: false,
				maxZoom: 14,
				crs: L.CRS.EPSG900913,
			}).setView(plugin_settings.map.defaults.coords, plugin_settings.map.defaults.zoom)

			var map = plugin_settings.map.object

			L.control.zoom({
				position: 'topright'
			}).addTo(map);

			plugin_settings.map.legend = L.control( { position: 'bottomleft' } )

			plugin_settings.map.legend.onAdd = function () {

				// console.log(plugin_settings.indicator)

				var div = L.DomUtil.create('div', 'info legend'),
						current_agg = plugin_settings.aggregation.current.agg,
						aggregation = plugin_settings.indicator.aggregation[current_agg],
						legend = plugin_settings.indicator.legend,
						prepend = legend.prepend,
						append = legend.append,
						grades = aggregation.legend

				// switch (aggregation[current_agg]['rounding']) {
				// 	case -9 :
				// 		append = 'billion ' + append
				// 		break
				// 	case -6 :
				// 		append = 'million ' + append
				// 		break
				// 	case -3 :
				// 		append = 'thousand ' + append
				// 		break
				// }

				legend_markup = '<h6>' + plugin_settings.indicator.title + '</h6>'

				// console.log(current_agg, aggregation, grades)

				// loop through our density intervals and generate a label with a colored square for each interval

				legend_markup += '<div class="items">'

				for (var i = 1; i <= grades.length; i++) {

					var row_markup = '<div class="legend-item" data-toggle="tooltip" data-placement="top" style="background-color: '
            + plugin_settings.legend.colors[i - 1] + ';"'
						+ ' title="'
						+ prepend
						+ grades[i - 1].toLocaleString(undefined, {
								maximumFractionDigits: aggregation['decimals']
							})

					if (grades[i]) {

						row_markup += ' – '
							+ prepend
							+ grades[i].toLocaleString(undefined, { maximumFractionDigits: aggregation['decimals'] })
							+ ' '
							+ append

					} else {

						row_markup += '+ ' + append

					}

					row_markup += '"></div>'

					legend_markup += row_markup

				}

				legend_markup	+= '</div>'

				div.innerHTML = legend_markup

				return div

			}

			// BASEMAP

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map)

			// PANES

			// data - for tile layer
			plugin_settings.map.panes.data = plugin_settings.map.object.createPane('data')
			plugin_settings.map.panes.data.style.zIndex = 560
			plugin_settings.map.panes.data.style.pointerEvents = 'all'

			// PBF

			bounds = L.latLngBounds(L.latLng(
				41.6755,
				-141.003
			), L.latLng(
				83.1139,
				-52.6174
			))

			// POPUP

			plugin_settings.map.popup = L.popup({
				pane: 'data',
				className: 'risk-popup'
			})


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

								var found = false

								data.forEach(function(i) {

									if (i.qualifier == 'LOCATION') {

										var new_result = $('<div class="search-result list-group-item list-group-item-action">' + i.title + '</div>')

										if (i.bbox) {

											new_result.attr('data-bounds', JSON.stringify(i.bbox))

										}

										if (i.geometry.coordinates) {

											new_result.attr('data-coords', '[' + i.geometry.coordinates[1] + ',' + i.geometry.coordinates[0] + ']')

										}

										found = true

										plugin_settings.search.results.append(new_result)

									}

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
						paddingTopLeft: [50, 50],
						paddingBottomRight: [50, 50]
					})

				} else if ($(this).attr('data-coords')) {

					$('body').profiler('center_map', {
						map: map,
						coords: JSON.parse($(this).attr('data-coords')),
						offset: $(window).outerWidth() / 4,
						zoom: 8
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

			// RETROFIT

			$('#retrofit-togglebox').togglebox({
				off: '',
				on: ''
			})

			//
			// EVENTS
			//

			// adjust aggregation on zoom
			plugin_settings.map.object.on('zoomend dragend', function (e) {

				// console.log('zoom drag', plugin_settings.map.object.getZoom())

				plugin_settings.map.current_zoom = e.target.getZoom()

				plugin_settings.aggregation.previous = plugin_settings.aggregation.current.agg

				if (plugin_settings.current_view != 'detail') {

					if (plugin_settings.map.current_zoom > 5) {

						$('body').attr('data-sidebar-width', 'none')

					} else {

						$('body').attr('data-sidebar-width', '')

					}

				}

				plugin_instance.prep_for_api({
					event: 'zoomend'
				})

				plugin_settings.map.last_zoom = plugin_settings.map.current_zoom

			})

			// close popup

			map.on('popupclose', function(e) {

				if (map.hasLayer(plugin_settings.map.tiles)) {

					// if there's a selected feature

					if (plugin_settings.map.selected_feature != null) {

						// reset it

						plugin_settings.map.tiles.resetFeatureStyle(plugin_settings.map.selected_feature)

						plugin_settings.map.selected_feature = null

					}

					// wait a sec

					setTimeout(function() {

						// if there's still no selected feature

						if (plugin_settings.map.selected_feature == null) {

							// do this

							$('.app-main').removeClass('feature-selected')

		        }

					}, 500)

				}

			});

			//
			// SIDEBAR
			//

			plugin_settings.sidebar.items = JSON.parse($('.app-sidebar-content').attr('data-items'))

			// console.log(plugin_settings.sidebar.items)

			$(document).profiler('get_sidebar', {
				url: plugin_settings.lang_prepend + '/community',
				success: function(data) {

				},
				complete: function() {

					plugin_settings.sidebar.list = $('body').find('.sidebar-items')

					plugin_instance.sort_sidebar()

					plugin_instance.prep_for_api()

					// $('body').addClass('spinner-on')
					// $('#spinner-progress').text('Loading items')

				}
			})

			$('body').on('mouseover', '.sidebar-item.city', function() {



			}).on('mouseleave', '.sidebar-item.city', function() {



			}).on('click', '.sidebar-item.city', function() {

				$.ajax({
					url: plugin_settings.api.base_URL + plugin_settings.aggregation.current.agg
						// + '_v' + plugin_settings.api.version
						+ '/items/'
						+ $(this).attr('data-feature'),
					dataType: 'json',
					success: function(data) {

						var path = new L.GeoJSON(data),
								path_bounds = path.getBounds()

						console.log(data)

						plugin_settings.map.object.fitBounds(path_bounds, {
							paddingTopLeft: [50, 50],
							paddingBottomRight: [50, 50]
						})

					}
				})

			})

			//
			// CLICK EVENTS
			//

			// click an indicator item

			$('body').on('click', '.risk-var', function() {

				plugin_instance.set_indicator(JSON.parse($(this).attr('data-indicator')))

				plugin_instance.sort_sidebar()

				plugin_instance.prep_for_api()

			})

			$(document).on('overlay_show', function() {

				if ($('.app-main').attr('data-mode') == 'risk-detail') {

					$('.app-head-back').trigger('click')

				}
			})

			// click the indicator breadcrumb

			$('#breadcrumb-indicator').click(function() {

				$('.app-head-back').trigger('click')

			})

			// click the 'view details' button in a feature popup

			$('body').on('click', '.risk-detail-link', function() {
				// map.closePopup()

				// plugin_instance.set_community()
				plugin_instance.item_detail($(this).attr('data-id'))
			})

			// click the 'back' button to close the detail view

			$('body').on('click', '.app-head-back', function(e) {

				plugin_settings.current_view = 'init'

				plugin_settings.community = null

				plugin_settings.map.object.getPane('data').style.pointerEvents = 'all'

				// reset the map view
				plugin_settings.map.object.setView(
					plugin_settings.map.defaults.coords,
					plugin_settings.map.defaults.zoom
				)

				if (plugin_settings.map.current_zoom > 5) {
					$('.app-page').attr('data-sidebar-width', 'none')
				} else {
					$('.app-page').attr('data-sidebar-width', '')
				}

				$('.app-main').attr('data-mode', '')

				plugin_instance.sort_sidebar()

			})

			// click the 'retrofit' toggle

			$('#retrofit-toggle .togglebox').click(function() {
				if (!$(this).hasClass('disabled')) {

					if (plugin_settings.api.retrofit == 'b0') {
						plugin_settings.api.retrofit = 'r1'
					} else {
						plugin_settings.api.retrofit = 'b0'
					}

					plugin_settings.map.object.closePopup()

					plugin_instance.prep_for_api()

				}
			})

			//
			// MISC
			//

			$(window).resize(function() {
				plugin_settings.map.offset = $('.app-sidebar').outerWidth()
			})

			// LOAD

			var init_id, init_item

			if (window.location.hash) {

				// if an indicator is set

				init_id = window.location.hash.substring(1)
				init_item = $('body').find('#risk-var-' + init_id)

				// console.log(window.location.hash, init_item)

			} else {

				// get the first menu item

				init_item = $('body').find('.risk-var').first()

			}

			plugin_instance.set_indicator(JSON.parse(init_item.attr('data-indicator')))

    },

		set_indicator: function(indicator) {

			var plugin_instance = this
			var plugin_settings = plugin_instance.options

			plugin_settings.indicator = indicator

			// reset the history state
			$(document).profiler('do_history', '#' + plugin_settings.indicator.key)

			// reset legend max
			plugin_settings.legend.max = 0

			if ($('body').hasClass('overlay-open')) {
				$(document).overlay('hide')
			}

			// update the breadcrumb

			$('.app-breadcrumb .indicator-title').last().html(plugin_settings.indicator.title)

			// update the sidebar

			// update the translation link

			$('#header-menu-lang a').each(function() {

				var translation_URL = $(this).attr('href')

				if (translation_URL.includes('#')) {
					translation_URL = translation_URL.split('#')[0]
				}

				$(this).attr('href', translation_URL + '#' + plugin_settings.indicator.key)

			})

		},

		sort_sidebar: function() {

			var plugin_instance = this
			var plugin_settings = plugin_instance.options

			// console.log('sort', plugin_settings.indicator.ranking)

			$('.app-sidebar-content').html(plugin_settings.sidebar.list)

			plugin_settings.sidebar.list.empty()

			if (plugin_settings.indicator.ranking.length) {

				plugin_settings.indicator.ranking.forEach(function(item_id, i) {

					var result = plugin_settings.sidebar.items.filter(obj => {
					  return obj.post_id === parseInt(item_id)
					})

					if (result.length) {

						var result_data = result[0]

						var new_item = $(plugin_settings.sidebar.markup)
							.appendTo(plugin_settings.sidebar.list)
							.attr('id', result_data.slug)
							.attr('data-id', result_data.post_id)
							.attr('data-name', result_data.name)
							.attr('data-feature', result_data.feature)

						new_item.find('.sidebar-item-value').html(i + 1)

						new_item.find('.sidebar-item-header').html(result_data.name)

						new_item.find('.sidebar-item-province').html(result_data.province)

					}

				})

			} else {

				plugin_settings.sidebar.items.forEach(function(result) {

					var new_item = $(plugin_settings.sidebar.markup)
						.appendTo(plugin_settings.sidebar.list)
						.attr('id', result.slug)
						.attr('data-id', result.post_id)
						.attr('data-name', result.name)
						.attr('data-feature', result.feature)

					// new_item.find('.sidebar-item-value').html(i + 1)

					new_item.find('.sidebar-item-header').html(result.name)

					new_item.find('.sidebar-item-province').html(result.province)

				})

			}

		},

		set_community: function(fn_options) {

			var plugin_instance = this
			var plugin_settings = plugin_instance.options

			// plugin_settings.community = {
			// 	title: '',
			// 	id: '',
			// }

		},

		prep_for_api: function(fn_options) {

			var plugin_instance = this
			var plugin_settings = plugin_instance.options

			var map = plugin_settings.map.object

      var settings = $.extend(true, {
				event: null
			}, fn_options)

			console.log('prep', plugin_settings.indicator.key)

			var fetch = false

			// check for new aggregation

			plugin_settings.aggregation.settings.default.forEach(function (i) {

				// console.log('checking current (' + plugin_settings.map.current_zoom + ') vs ' + i.min + ' and ' + i.max )

				if (
					plugin_settings.map.current_zoom >= i.min &&
					plugin_settings.map.current_zoom <= i.max
				) {

					// found the agg settings that match the zoom level

					if (plugin_settings.aggregation.current.agg != i.agg) {

						// agg settings doesn't match the plugin's current aggregation

						plugin_settings.aggregation.current = i

					}

				}

			})

			// conditions for fetching new data
      // 1. zoom action changed the aggregation setting
      // 2. previous aggregation is empty - initial load of scenario

			// if (settings.event == null) {
			// 	console.log('no event')
			// }
			//
			// if ((
			// 	plugin_settings.aggregation.previous !== null &&
			// 	plugin_settings.aggregation.current.agg !== plugin_settings.aggregation.previous
			// )) {
			// 	console.log('new aggregation')
			// }

      if (
				settings.event == null ||
        (
          plugin_settings.aggregation.previous !== null &&
          plugin_settings.aggregation.current.agg !== plugin_settings.aggregation.previous
        ) ||
        plugin_settings.aggregation.previous == null
      ) {

        // RESET MAP FEATURES

        // reset legend max
        plugin_settings.legend.max = 0

        // fetch new data
        fetch = true

      }

      if (fetch == true) {

				// console.log('update map')

        // get the tiles
				plugin_instance.update_map()

      }


		},

		update_map: function(fn_options) {

			var plugin_instance = this
			var plugin_settings = plugin_instance.options

			var map = plugin_settings.map.object

			map.closePopup()

			var indicator_key = plugin_settings.indicator.key + '_' + plugin_settings.api.retrofit

			var feature_ID_key = plugin_settings.aggregation.current.prop

			if (plugin_settings.aggregation.current.agg == 's') {

				plugin_settings.indicator.key = plugin_settings.indicator.key.replace('eC_', 'eCt_').replace('eCr_', 'eCtr_')

			} else {

				plugin_settings.indicator.key = plugin_settings.indicator.key.replace('eCt_', 'eC_').replace('eCtr_', 'eCr_')

			}

			var indicator_key = plugin_settings.indicator.key + '_' + plugin_settings.api.retrofit

			$(document).profiler('get_tiles', {
				map: map,
				indicator: plugin_settings.indicator,
				aggregation: plugin_settings.aggregation,
				tiles: plugin_settings.map.tiles,
				bounds: bounds,
				options: {
					pane: 'data',
		      getFeatureId: function(feature) {

						if (feature.properties[indicator_key] > z) {
							z = feature.properties[indicator_key]
							// console.log(z)
						}

						if (feature.properties['eqri_abs_score_' + plugin_settings.api.retrofit] > plugin_settings.sidebar.max.eqri_abs_score) {
							plugin_settings.sidebar.max.eqri_abs_score = feature.properties['eqri_abs_score_' + plugin_settings.api.retrofit]
						}

						return feature.properties[feature_ID_key]
		      },
					bounds: bounds,
		      vectorTileLayerStyles: plugin_instance.set_choro_style('psra_indicators_' + plugin_settings.aggregation.current.agg, indicator_key)
				},
				functions: {
					add: function(e) {

						// set the tile var to the new layer that was created
						plugin_settings.map.tiles = e.target

						//

						// console.log(plugin_settings.indicator)

						plugin_settings.legend.grades = plugin_settings.indicator.aggregation[plugin_settings.aggregation.current.agg].legend

						plugin_settings.map.legend.addTo(map)

						$('body').find('.legend-item').tooltip()

					},
					mouseover: function(e) {

						var this_ID = parseInt(e.layer.properties[feature_ID_key])

						$('.app-sidebar').find('.sidebar-item').removeClass('hover')

						$('.app-sidebar').find('[data-feature="' + this_ID + '"]').addClass('hover')

					},
					click: function(e) {

						// if we have a selected feature, reset the style
		        if (plugin_settings.map.selected_feature != null) {
		          plugin_settings.map.tiles.resetFeatureStyle(plugin_settings.map.selected_feature)
		        }

						$('.app-main').addClass('feature-selected')

		        // set the selected feature id
		        plugin_settings.map.selected_feature = e.layer.properties[feature_ID_key]

						plugin_settings.community = e.layer.properties

						// set the selected feature style
		        plugin_settings.map.tiles.setFeatureStyle(plugin_settings.map.selected_feature, {
		          fill: true,
							fillColor: '#9595a0',
							color: '#2b2c42',
		          weight: 0.8,
		          fillOpacity: 0.5
		        })

						// set the popup content
		        plugin_settings.map.popup.setContent(function() {

							return plugin_instance.popup_content(e.layer.properties)

						})
			        .setLatLng(e.latlng)
			        .openOn(map)



					},
					complete: function() {
						console.log('z', z)
					}
				}
			})
		},

		set_choro_style: function(pbf_key, indicator_key) {

			var plugin_instance = this
			var plugin_settings = plugin_instance.options

			var layer_style = {},
					fillColor,
					weight = 0.1

			var rounding = parseInt(plugin_settings.indicator.aggregation[plugin_settings.aggregation.current.agg]['rounding'])

			// console.log(pbf_key, indicator_key)

			layer_style[pbf_key] = function(properties) {

				var rounded_color = properties[indicator_key] * Math.pow(10, rounding)

				fillColor = plugin_instance._choro_color(rounded_color)

				return {
					fillColor: fillColor,
					weight: weight,
					fillOpacity: 0.8,
					color: '#000000',
					opacity: 0.6,
					fill: true
				}
			}

			return layer_style
		},

		_choro_color: function(d) {

      var plugin_instance = this
      var plugin_settings = plugin_instance.options

			var current_agg = plugin_settings.aggregation.current.agg,
					agg_settings = plugin_settings.indicator.aggregation[current_agg]

			var grades = [].concat(agg_settings.legend).reverse()

			var rounding = parseInt(agg_settings['rounding'])

			// if (plugin_settings.map.object.getZoom() > 10 && d > 3 && d < 6) {
			// 	console.log(d, rounding)
			// 	console.log(grades[0], grades[1], grades[2])
			// }

			return d >= grades[0] ? '#800026' :
				d >= grades[1] ? '#bd0026' :
				d >= grades[2] ? '#e31a1c' :
				d >= grades[3] ? '#fc4e2a' :
				d >= grades[4] ? '#fd8d3c' :
				d >= grades[5] ? '#feb24c' :
				d >= grades[6] ? '#fed976' :
				d >= grades[7] ? '#ffeda0' :
        '#ffffcc'

		},

		popup_content: function(properties) {

      var plugin_instance = this
      var plugin_settings = plugin_instance.options

			// console.log(properties)

			var popup_name = properties.csdname

			if (plugin_settings.aggregation.current.agg == 's') {
				popup_name += ' (' + properties.fsauid + ')'
			}

			var popup_markup = '<div class="d-flex align-items-center">'

				popup_markup += '<h5 class="risk-popup-city flex-grow-1 mb-0 p-2">' + popup_name + '</h5>'

				var this_val = properties[plugin_settings.indicator.key + '_' + plugin_settings.api.retrofit]

				var current_agg = plugin_settings.aggregation.current.agg

				var aggregation = plugin_settings.indicator.aggregation[current_agg]

				popup_markup += '<div class="risk-popup-rank border-left py-2 px-3 font-size-lg text-primary">'
					+ plugin_settings.indicator.legend.prepend
					+ plugin_instance._round(this_val, aggregation['rounding']).toLocaleString(undefined, { maximumFractionDigits: aggregation['decimals'] })
					+ ' ' + plugin_settings.indicator.legend.append
					+ '</div>'

			popup_markup += '</div>'

			popup_markup += '<div class="risk-popup-details bg-light p-2">'

				popup_markup += '<p>real: ' + properties[plugin_settings.indicator.key + '_' + plugin_settings.api.retrofit] + '</p>'

				popup_markup += '<span class="risk-detail-link btn btn-outline-primary" data-id="' + plugin_settings.aggregation.current.prop + '">View Details</span>'

			popup_markup += '</div>'

			return popup_markup

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

			console.log('risks', 'detail', plugin_settings.community)

			$(document).profiler('get_sidebar', {
				url: 'risks/detail.php',
				before: function() {

					$('.app-page').attr('data-sidebar-width', 'half')
					$('.app-main').attr('data-mode', 'risk-detail')

				},
				success: function(data) {

					plugin_settings.current_view = 'detail'

					var detail_content = $('body').find('.sidebar-detail')

					if (plugin_settings.community.csdname) {
						detail_content.find('.city-name').html(plugin_settings.community.csdname)
					}

					// console.log(plugin_settings.community)
					// console.log(plugin_settings.api.retrofit)

					// populate indicator values

					detail_content.find('[data-indicator').each(function() {

						var this_key = $(this).attr('data-indicator')

						if (plugin_settings.aggregation.current.agg == 's') {

							this_key = this_key.replace('eC_', 'eCt_')
							this_key = this_key.replace('eCr_', 'eCtr_')

						}

						var this_val = plugin_settings.community[this_key + '_' + plugin_settings.api.retrofit]

						if (typeof $(this).attr('data-decimals') != 'undefined') {

							this_val = this_val.toFixed(parseInt($(this).attr('data-decimals')))

						}

						$(this).html(this_val)

					})

					// score chart

					setTimeout(function() {

						detail_content.find('.score-chart').each(function() {

							var score_chart = $(this),
									score_key = $(this).find('[data-indicator]').attr('data-indicator')
									score_label = $(this).find('.label'),
									score_marker = $(this).find('.marker')

							// treated score value
							var score = parseFloat(plugin_settings.community[score_key + '_' + plugin_settings.api.retrofit])

							// score as percentage of max
							var score_percent = score / plugin_settings.sidebar.max[score_key]

							if (score_percent > 1) {
								score_percent = 1
							}

							var css_prop = 'left',
									css_val = (score_percent * 100) + '%'

							if (score_percent > 0.7) {
								css_prop = 'right'
								css_val = (100 - (score_percent * 100)) + '%'
							}

							score_label.css(css_prop, css_val)

							// animate marker
							score_marker.animate({
								left: (score_percent * 100) + '%'
							}, {
								duration: 1000,
								easing: 'swing',
								complete: function() {
									$('body').find('.score-chart .label').fadeIn(150)
								}
							})



						})

					}, 1000)


				},
				complete: function() {

					// console.log('risks', 'detail', 'done')

					// fetch the feature from geoapi, use its geometry to zoom to the vector tile feature

					var feature_ID_key = 'csduid'

					if (plugin_settings.aggregation.current.agg == 's') {
						feature_ID_key = 'Sauid'
					}

					// console.log(plugin_settings.community[feature_ID_key], plugin_settings.api.base_URL + plugin_settings.aggregation.current.agg + '_v' + plugin_settings.api.version + '/items/' + plugin_settings.community[feature_ID_key])

					$.ajax({
						url: plugin_settings.api.base_URL + plugin_settings.aggregation.current.agg
						// + '_v' + plugin_settings.api.version
						+ '/items/'
						+ plugin_settings.community[feature_ID_key],
						dataType: 'json',
						success: function(data) {

							var path = new L.GeoJSON(data)

							plugin_settings.map.object.fitBounds(path.getBounds(), {
								paddingTopLeft: [($(window).outerWidth() / 2) + 50, 50],
								paddingBottomRight: [50, 50]
							})

						}
					})

					// initialize charts

					Highcharts.setOptions({
				    lang: {
				      thousandsSep: ','
				    },
						credits: {
							enabled: false
						}
				  })

					var chart = Highcharts.chart('risk-detail-chart', {
						tooltip: {
							useHTML: true,
							headerFormat: '',
							// formatter: function() {
							//
							// 	var series_name = this.series.name
							//
							// 	if (this.series.name != this.series.userOptions.custom.full_name) {
							// 		series_name = this.series.userOptions.custom.full_name + ' (' + this.series.name + ')'
							// 	}
							//
							// 	return '<strong>' + series_name + ':</strong> '
							// 		+ plugin_settings.indicator.legend.prepend
							// 		+ this.y.toLocaleString(undefined, {
							// 			maximumFractionDigits: plugin_settings.indicator.aggregation[plugin_settings.aggregation.current.agg]['decimals']
							// 		})
							// 		+ ' '
							// 		+ plugin_settings.indicator.legend.append
							//
							// }
						},
						chart: {
							type: 'column',
					    height: 250,
							marginTop: 30,
							marginLeft: 60,
							styledMode: true
						},
						title: {
							enabled: false,
							text: null,
							align: 'left',
							x: 0
						},
						xAxis: {
							labels: {
								enabled: false
							},
							tickLength: 0
						},
						yAxis: {
							min: 0,
							title: { enabled: false },
							labels: {
								x: -5,
							}
						},
						plotOptions: {
							column: {
								groupPadding: 0.02,
								pointPadding: 0.2,
								borderWidth: 0
							}
						},
						series: [],
						legend: {
							enabled: false,
							width: '100%',
							maxHeight: 100,
							margin: 10
						},
						navigation: {
							buttonOptions: {
								y: -10
							}
						},
						exporting: {
							menuItemDefinitions: {
								dataModal: {
									onclick: function() {

										$('#chart-data-placeholder').html(this.getTable())

										$('#chart-data-placeholder').find('table').addClass('table table-responsive')

										$('#data-modal .modal-title').html(plugin_settings.indicator.label + ' ' + rp.by + ' ' + request.name)

										$('#data-modal').modal('show')

									},
									text: 'View data table'
								}
							},
							buttons: {
								contextButton: {
									menuItems: [ 'downloadPNG', 'downloadPDF', 'downloadSVG', 'separator', 'downloadCSV', 'dataModal' ]
								}
							}
						}
					}, function (chart) {



			    })

          $('body').removeClass('spinner-on')
					$('#spinner-progress').text('')

				}
			})


    },

		_round: function(num, power) {
			return num * Math.pow(10, power)
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
