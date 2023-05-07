var click_flag = false
var bounds

var y = 0, z = 0

var color_ramp = [
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
				current_zoom: 3,
				last_zoom: -1,
				last_click: null,
				clicked_feature: null,
				selected_feature: null,
				tiles: null,
				layers: {
					feature: null,
					fsa: null
				},
				popup: null,
				tooltip: null,
				defaults: {
					coords: [60, -110],
					zoom: 3
				}
			},
			api: {
				base_URL: geoapi_url + '/collections/opendrr_psra_indicators_',
				version: '1.4.3',
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

			var plugin = this;
			var plugin_item = this.item;
			var plugin_settings = plugin.options;
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

			var current_year = new Date().getFullYear()
			var basemap_URL = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&region=CA'
			var basemap_att = 'Map data © ' + current_year + ' Google | <a href="https://www.google.com/intl/en_ca/help/terms_maps/" target="_blank">Terms of use</a>'

			if ($('body').hasClass('lang-fr')) {
				basemap_URL += '&hl=fr-CA'
				basemap_att = 'Données cartographiques © ' + current_year + ' Google | <a href="https://www.google.com/intl/fr_ca/help/terms_maps/" target="_blank">Conditions d’utilisation</a>'
			} else {
				basemap_URL += '&hl=en'
			}

			L.tileLayer(basemap_URL, {
				attribution: basemap_att
			}).addTo(map)

			// PANES

			// data - for tile layer
			plugin_settings.map.panes.data = plugin_settings.map.object.createPane('data')
			plugin_settings.map.panes.data.style.zIndex = 560
			plugin_settings.map.panes.data.style.pointerEvents = 'all'

			// popup

			plugin_settings.map.panes.popup = plugin_settings.map.object.createPane('popup')
			plugin_settings.map.panes.popup.style.zIndex = 580
			plugin_settings.map.panes.popup.style.pointerEvents = 'all'

			// fsa - for loss exceedance boundary
			plugin_settings.map.panes.fsa = plugin_settings.map.object.createPane('fsa')
			plugin_settings.map.panes.fsa.style.zIndex = 570
			plugin_settings.map.panes.fsa.style.display = 'none'
			plugin_settings.map.panes.fsa.style.pointerEvents = 'none'

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
				pane: 'popup',
				className: 'risk-popup'
			})

			plugin_settings.map.tooltip = L.tooltip({
				pane: 'popup',
				direction: 'top',
				className: 'risk-tooltip'
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

					plugin_settings.search.element.innerHTML = '<input name="map-search-input" id="map-search-input" class="form-control" placeholder="' + rp.search_communities + '">'

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
						url: 'https://geogratis.gc.ca/services/geolocation/' + plugin_settings.lang + '/locate?q=*' + term + '*',
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

			// HIGHCHARTS

			Highcharts.setOptions({
				lang: {
					thousandsSep: ','
				},
				credits: {
					enabled: false
				}
			})
			
			if (plugin_settings.lang == 'fr') {
				Highcharts.setOptions({
					lang: {
						numericSymbols: [" k", " M", " G", " T", " P", " E"]
					}
				})
			}

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

				plugin.prep_for_api({
					event: 'zoomend'
				})

				plugin_settings.map.last_zoom = plugin_settings.map.current_zoom

			})

			// close popup

			map.on('popupclose', function(e) {

				if (map.hasLayer(plugin_settings.map.tiles)) {

					// if (plugin_settings.current_view != 'detail') {

						// if not in detail view,
						// see if a selected feature exists,
						// i.e. the popup closed because it was opened somewhere else

						if (plugin_settings.map.clicked_feature != null) {

							// reset the selected feature

							plugin_settings.map.tiles.resetFeatureStyle(plugin_settings.map.clicked_feature)

							// console.log('clicked', plugin_settings.map.clicked_feature)
							// console.log('selected', plugin_settings.map.selected_feature)

							if (plugin_settings.map.clicked_feature == plugin_settings.map.selected_feature) {

								plugin.set_selected_style()

							}

							plugin_settings.map.clicked_feature = null

						}

						// wait a sec

						setTimeout(function() {

							// if there's still no selected feature

							if (plugin_settings.map.clicked_feature == null) {

								// do this

								$('.app-main').removeClass('feature-selected')

							}

						}, 500)

					// }

				}

			});

			//
			// SIDEBAR
			//

			plugin_settings.sidebar.items = JSON.parse($('.app-sidebar-content').attr('data-items'))

			$('body').find('.app-sidebar-content').removeAttr('data-items')

			// console.log(plugin_settings.sidebar.items)

			$(document).profiler('get_sidebar', {
				url: (plugin_settings.lang_prepend ? '../..' : '..') + plugin_settings.lang_prepend + '/community/index.html',
				success: function(data) {

				},
				complete: function() {

					plugin_settings.sidebar.list = $('body').find('.sidebar-items')
					
					plugin.sort_sidebar()

					plugin.prep_for_api()

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

			$('body').on('click', '.risk-var-link', function() {

				plugin.set_indicator(JSON.parse($(this).closest('.risk-var').attr('data-indicator')))

				plugin.sort_sidebar()

				plugin.prep_for_api()

			})

			$(document).on('overlay_show', function() {

				if ($('.app-main').attr('data-mode') == 'risk-detail') {

					$('.app-head-back').trigger('click')

				} else {

					// reset the sidebar sorting

					$('body').find('.control-toggle').removeClass('open')
					$('body').find('.app-sidebar-control').slideUp(200)

					$('body').find('.sort-item').removeClass('selected').attr('data-sort-order', 'asc').first().addClass('selected')

					plugin.sort_sidebar()

				}

			})

			// click the indicator breadcrumb

			$('#breadcrumb-indicator').click(function() {

				$('.app-head-back').trigger('click')

			})

			// click the 'view details' button in a feature popup

			$('body').on('click', '.risk-detail-link', function() {
				plugin.item_detail($(this).attr('data-id'))
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

				// reset the clicked & selected features

				plugin_settings.map.tiles.resetFeatureStyle(plugin_settings.map.clicked_feature)
				plugin_settings.map.clicked_feature = null

				plugin_settings.map.tiles.resetFeatureStyle(plugin_settings.map.selected_feature)
				plugin_settings.map.selected_feature = null

				// close the popup

				plugin_settings.map.object.closePopup().closeTooltip(plugin_settings.map.tooltip)

				// reset the FSA layer

				if (map.hasLayer(plugin_settings.map.layers.fsa)) {
					plugin_settings.map.panes.fsa.style.display = 'none'
					map.removeLayer(plugin_settings.map.layers.fsa)
				}

				// reset the app view mode

				if (plugin_settings.map.current_zoom > 5) {
					$('.app-page').attr('data-sidebar-width', 'none')
				} else {
					$('.app-page').attr('data-sidebar-width', '')
				}

				$('.app-main').attr('data-mode', '')

				// reset the sidebar items

				plugin.sort_sidebar()

			})

			// click the 'retrofit' toggle

			$('#retrofit-toggle .togglebox').click(function() {
				if (!$(this).hasClass('disabled')) {

					if (plugin_settings.api.retrofit == 'b0') {
						plugin_settings.api.retrofit = 'r1'
					} else {
						plugin_settings.api.retrofit = 'b0'
					}

					plugin_settings.map.object.closePopup().closeTooltip(plugin_settings.map.tooltip)

					plugin.prep_for_api()

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

			plugin.set_indicator(JSON.parse(init_item.attr('data-indicator')))

		},

		set_indicator: function(indicator) {

			var plugin = this
			var plugin_settings = plugin.options

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

			var plugin = this
			var plugin_settings = plugin.options

			// console.log('sort', plugin_settings.indicator.ranking)
			
			console.log(plugin_settings.indicator)

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
							.attr('data-rank', i + 1)
							.attr('data-province', result_data.pr_val)

						new_item.find('.sidebar-item-value').html(i + 1)

						new_item.find('.sidebar-item-header').html(result_data.name)

						new_item.find('.sidebar-item-province').html(result_data.pr_name)

					}

				})

			} else {

				plugin_settings.sidebar.items.forEach(function(result, i) {

					var new_item = $(plugin_settings.sidebar.markup)
						.appendTo(plugin_settings.sidebar.list)
						.attr('id', result.slug)
						.attr('data-id', result.post_id)
						.attr('data-name', result.name)
						.attr('data-feature', result.feature)
						.attr('data-rank', i + 1)
						.attr('data-province', result.pr_val)

					// new_item.find('.sidebar-item-value').html(i + 1)

					new_item.find('.sidebar-item-header').html(result.name)

					new_item.find('.sidebar-item-province').html(result.pr_name)

				})

			}

		},

		set_community: function(fn_options) {

			var plugin = this
			var plugin_settings = plugin.options

			// plugin_settings.community = {
			// 	title: '',
			// 	id: '',
			// }

		},

		prep_for_api: function(fn_options) {

			var plugin = this
			var plugin_settings = plugin.options

			var map = plugin_settings.map.object

			var settings = $.extend(true, {
				event: null
			}, fn_options)

			// console.log('prep', plugin_settings.indicator.key)

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
				plugin.update_map()

			}


		},

		update_map: function(fn_options) {

			var plugin = this
			var plugin_settings = plugin.options

			var map = plugin_settings.map.object

			map.closePopup()
			map.closeTooltip(plugin_settings.map.tooltip)

			var indicator_key = plugin_settings.indicator.key + '_' + plugin_settings.api.retrofit

			var feature_ID_key = plugin_settings.aggregation.current.prop

			if (plugin_settings.aggregation.current.agg == 's') {

				plugin_settings.indicator.key = plugin_settings.indicator.key.replace('eC_', 'eCt_').replace('eCr_', 'eCtr_')

			} else {

				plugin_settings.indicator.key = plugin_settings.indicator.key.replace('eCt_', 'eC_').replace('eCtr_', 'eCr_')

			}

			if (map.hasLayer(plugin_settings.map.layers.fsa)) {
				plugin_settings.map.panes.fsa.style.display = 'none'
				// map.removeLayer(plugin_settings.map.layers.fsa)
			}

			var indicator_key = plugin_settings.indicator.key + '_' + plugin_settings.api.retrofit

			$(document).profiler('get_tiles', {
				map: map,
				indicator: plugin_settings.indicator,
				aggregation: plugin_settings.aggregation,
				tiles: plugin_settings.map.tiles,
				options: {
					pane: 'data',
					getFeatureId: function(feature) {

						// if (feature.properties[indicator_key] > z) {
						// 	z = feature.properties[indicator_key]
						// 	console.log(z)
						// }

						if (feature.properties['eqri_abs_score_' + plugin_settings.api.retrofit] > plugin_settings.sidebar.max.eqri_abs_score) {
							plugin_settings.sidebar.max.eqri_abs_score = feature.properties['eqri_abs_score_' + plugin_settings.api.retrofit]
						}

						return feature.properties[feature_ID_key]
					},
					bounds: bounds,
					vectorTileLayerStyles: plugin.set_choro_style('psra_indicators_' + plugin_settings.aggregation.current.agg, indicator_key)
				},
				functions: {
					add: function(e) {

						// set the tile var to the new layer that was created
						plugin_settings.map.tiles = e.target

						// set selected feature style
						plugin.set_selected_style()

						// if we're switching aggregations to S,
						// and the expected loss accordion is selected,
						// turn the FSA pane/layer back on

						if (
							plugin_settings.aggregation.current.agg == 's' &&
							map.hasLayer(plugin_settings.map.layers.fsa)
						) {
							plugin_settings.map.panes.fsa.style.display = ''
						}

						// update the legend

						plugin_settings.legend.grades = plugin_settings.indicator.aggregation[plugin_settings.aggregation.current.agg].legend

						plugin_settings.map.legend.addTo(map)

						$('body').find('.legend-item').tooltip()

					},
					mouseover: function(e) {

						var this_ID = parseInt(e.layer.properties[feature_ID_key])

						$('.app-sidebar').find('.sidebar-item').removeClass('hover')

						$('.app-sidebar').find('[data-feature="' + this_ID + '"]').addClass('hover')

						if (!$('.app-main').hasClass('feature-selected')) {

							plugin_settings.map.tooltip.setContent(function() {

								var current_agg = plugin_settings.aggregation.current.agg

								var aggregation = plugin_settings.indicator.aggregation[current_agg]
								
								var rounding = parseInt(aggregation['rounding'])
								
								var tooltip_val
								
								var this_val = plugin._format_figure(e.layer.properties[indicator_key], rounding)
								
								if (e.layer.properties.csdname == 'Calgary') {
									console.log(e.layer.properties[indicator_key], this_val)
								}
								
								if (plugin._format_figure(e.layer.properties[indicator_key], rounding).charAt(0) == '<') {
									
									tooltip_val = rp.less_than
										+ ' '
										+ plugin_settings.indicator.legend.prepend
										+ plugin._format_figure(e.layer.properties[indicator_key]).substring(1)
										+ ' '
										+ plugin_settings.indicator.legend.append
										
								} else {
									
									tooltip_val = plugin_settings.indicator.legend.prepend 
										+ this_val 
										+ ' '
										+ plugin_settings.indicator.legend.append
									
									
								}
								
								return tooltip_val
									
							})
								.setLatLng(e.latlng)
								.addTo(map)

						}

					},
					click: function(e) {

						var properties = e.layer.properties

						// if we have a clicked feature, reset its style
						if (plugin_settings.map.clicked_feature != null) {
							plugin_settings.map.tiles.resetFeatureStyle(plugin_settings.map.clicked_feature)
						}

						plugin_settings.community = properties

						$('.app-main').addClass('feature-selected')

						// set the clicked feature id

						plugin_settings.map.clicked_feature = properties[feature_ID_key]
						plugin_settings.map.clicked_fill = e.layer.options.fillColor

						// set the clicked feature style

						plugin.set_clicked_style(plugin_settings.map.clicked_fill)

						// set the popup content
						plugin_settings.map.popup.setContent(function() {

							return plugin.popup_content(properties)

						})
							.setLatLng(e.latlng)
							.openOn(map)

					},
					complete: function() {
						// console.log('z', z)
					}
				}
			})
		},

		set_clicked_style: function(fill_color) {

			var plugin = this
			var plugin_settings = plugin.options

			plugin_settings.map.tiles.setFeatureStyle(plugin_settings.map.clicked_feature, {
				fill: true,
				fillColor: fill_color,
				fillOpacity: 0.8,
				color: '#2b2c42',
				opacity: 1,
				weight: 2,
			})

		},

		set_selected_style: function() {

			var plugin = this
			var plugin_settings = plugin.options

			plugin_settings.map.tiles.setFeatureStyle(plugin_settings.map.selected_feature, {
				fill: true,
				fillColor: plugin_settings.map.clicked_fill,
				fillOpacity: 0.8,
				color: '#d90429',
				opacity: 0.8,
				weight: 1,
			})

		},

		set_choro_style: function(pbf_key, indicator_key) {

			var plugin = this
			var plugin_settings = plugin.options

			var layer_style = {},
					fillColor

			var rounding = parseInt(plugin_settings.indicator.aggregation[plugin_settings.aggregation.current.agg]['rounding'])
			
			layer_style[pbf_key] = function(properties) {
				
				var rounded_color = 0
				
				if (typeof properties[indicator_key] != 'undefined') {
				
					rounded_color = properties[indicator_key] * Math.pow(10, rounding)
					
					// if (rounded_color != 0 && z < 20) {
					// 	
					// 	console.log(properties[indicator_key], rounded_color, fillColor)
					// 	z+=1
					// }
					
				}
	
				fillColor = plugin._choro_color(rounded_color)
				
				return {
					fillColor: fillColor,
					fillOpacity: 0.8,
					color: '#2b2c42',
					opacity: 0.6,
					weight: 0.1,
					fill: true
				}
			}

			return layer_style
		},

		_choro_color: function(d) {

			var plugin = this
			var plugin_settings = plugin.options

			var current_agg = plugin_settings.aggregation.current.agg,
					agg_settings = plugin_settings.indicator.aggregation[current_agg]

			var rounding = parseInt(agg_settings['rounding'])

			var return_i = 0
			
			agg_settings.legend.forEach(function(grade, i) {
				
				if (d >= grade) {
					return_i = i
				}
				
			})
			
			// if (plugin_settings.community.csduid == 4806016) {
			// if (z < 100 && d == 0) {
			// 	console.log(d, return_i, color_ramp[return_i])
			// 	z += 1
			// }
			
			return color_ramp[return_i]

			// return d >= grades[0] ? '#800026' :
			// 	d >= grades[1] ? '#bd0026' :
			// 	d >= grades[2] ? '#e31a1c' :
			// 	d >= grades[3] ? '#fc4e2a' :
			// 	d >= grades[4] ? '#fd8d3c' :
			// 	d >= grades[5] ? '#feb24c' :
			// 	d >= grades[6] ? '#fed976' :
			// 	d >= grades[7] ? '#ffeda0' :
			// 	'#ffffcc'

		},

		popup_content: function(properties) {

			var plugin = this
			var plugin_settings = plugin.options
			
			var current_agg = plugin_settings.aggregation.current.agg
			
			var aggregation = plugin_settings.indicator.aggregation[current_agg]

			// console.log(properties)

			var popup_name = properties.csdname,
					popup_name_label = rp.census_subdivision

			if (current_agg == 's') {
				popup_name += ' (' + properties.fsauid + ')'
				popup_name_label = rp.forward_sortation_area
			}

			var popup_markup = '<div class="popup-detail p-2">'
			
				popup_markup += '<h6 class="mb-0">' + popup_name_label + '</h6>'

				popup_markup += '<h5 class="risk-popup-city mb-3">' + popup_name + '</h5>'
				
				popup_markup += '<h6 class="mb-0">' + plugin_settings.indicator.title + '</h6>'

				var this_val = plugin._format_figure(properties[plugin_settings.indicator.key + '_' + plugin_settings.api.retrofit], parseInt(aggregation['rounding']))
				
				if (this_val.charAt(0) == '<') {
					this_val = rp.less_than + ' ' + this_val.substring(1)
				}
				
				popup_markup += '<div class="risk-popup-rank text-primary">' 
					+ plugin_settings.indicator.legend.prepend
					+ this_val
					+ ' '
					+ plugin_settings.indicator.legend.append
					+ '</div>'

			popup_markup += '</div>'

			popup_markup += '<div class="risk-popup-details bg-light p-2">'

				// popup_markup += '<p>real: ' + properties[plugin_settings.indicator.key + '_' + plugin_settings.api.retrofit] + '</p>'

				popup_markup += '<span class="risk-detail-link btn btn-outline-primary" data-id="' + plugin_settings.aggregation.current.prop + '">' + rp.view_details + '</span>'

			popup_markup += '</div>'

			return popup_markup

		},

		item_detail: function(fn_options) {

			var plugin = this
			var plugin_item = this.item
			var plugin_settings = plugin.options
			var plugin_elements = plugin_settings.elements

			var map = plugin_settings.map.object

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

			// reset the sidebar sorting

			$('body').find('.control-toggle').removeClass('open')
			$('body').find('.app-sidebar-control').slideUp(200)

			$('body').find('.sort-item').removeClass('selected').attr('data-sort-order', 'asc').first().addClass('selected')

			// remove previously added FSA

			if (map.hasLayer(plugin_settings.map.layers.fsa)) {
				map.removeLayer(plugin_settings.map.layers.fsa)
			}

			// reset the existing selected feature

			if (plugin_settings.map.selected_feature != null) {
				plugin_settings.map.tiles.resetFeatureStyle(plugin_settings.map.selected_feature)
			}

			// the clicked feature becomes the selected feature

			plugin_settings.map.selected_feature = plugin_settings.map.clicked_feature

			// set the new selected style

			plugin.set_selected_style()

			$(document).profiler('get_sidebar', {
				url: (plugin_settings.lang == 'fr') ? 'risks/detail-fr.php' : 'risks/detail.php',
				before: function() {

					$('.app-page').attr('data-sidebar-width', 'half')
					$('.app-main').attr('data-mode', 'risk-detail')

				},
				success: function(data) {

					// UX

					plugin_settings.current_view = 'detail'

					var detail_content = $('body').find('.sidebar-detail')

					// populate labels

					if (plugin_settings.community.csdname) {
						detail_content.find('.city-name').html(plugin_settings.community.csdname)
					}

					if (plugin_settings.community.fsauid) {
						detail_content.find('.city-name').append(' (' + plugin_settings.community.fsauid + ')')
					}

					// populate indicator values
					
					detail_content.find('[data-indicator]').each(function() {

						var temp_key = $(this).attr('data-indicator'),
								this_key = $(this).attr('data-indicator'),
								this_val

						if (plugin_settings.aggregation.current.agg == 's') {

							this_key = this_key.replace('eC_', 'eCt_')
							this_key = this_key.replace('eCr_', 'eCtr_')

						}
						
						if (typeof plugin_settings.community[this_key + '_' + plugin_settings.api.retrofit] != 'undefined') {
							
							this_val = plugin_settings.community[this_key + '_' + plugin_settings.api.retrofit]
							
						} else if (typeof plugin_settings.community[this_key] != 'undefined') {
							
							this_val = plugin_settings.community[this_key]
							
						} else {
							
							// indicator not found
							
							$(this).hide()
							
						}
						
						if (typeof this_val != 'undefined') {
						
							// use new formatting function
							
							if (
								this_key == 'eqri_abs_score' ||
								this_key == 'eqri_norm_score'
							) {
								
								// this_val = plugin._significant_figs(this_val)
								
								this_val = this_val.toFixed(1)
								
							} else {
								
								// get indicator data from the list
								
								console.log(temp_key, $('body').find('#risk-var-' + temp_key))
								
								if ($('body').find('#risk-var-' + temp_key).length) {
									
									this_indicator = JSON.parse($('#risk-var-' + temp_key).attr('data-indicator'))
									
									rounding = parseInt(this_indicator.aggregation[plugin_settings.aggregation.current.agg]['rounding'])
									
									console.log(temp_key, this_val, plugin._format_figure(this_val, rounding, this_indicator))
									
									this_val = plugin._format_figure(this_val, rounding, this_indicator)
									
								}
															
							}
							
							if (typeof $(this).attr('data-prepend') != 'undefined') {
	
								this_val = $(this).attr('data-prepend') + this_val
	
							}
	
							if (typeof $(this).attr('data-append') != 'undefined') {
	
								this_val += $(this).attr('data-append')
	
							}
							
							if ($(this).hasClass('range')) {
								
								$(this).attr('data-val', this_val)
								
							} else if (
								this_key == 'eqri_abs_rank' ||
								this_key == 'eqri_norm_rank'
							) {
								
								// abs
								// Very Low Score
								// Low Score
								// Moderate Score
								// High Score
								// Very High Score
								
								// norm
								// Very Low Score
								// Relatively Low Score
								// Relatively Moderate Score
								// Relatively High Score
								// Very High Score
								
								var well = 0
								
								switch (this_val) {
									case 'Very Low Score' : 
										well = 0
										break;
										
									case 'Low Score' :
									case 'Relatively Low Score' :
										well = 1
										break
										
									case 'Moderate Score' :
									case 'Relatively Moderate Score' :
										well = 2
										break
										
									case 'High Score' :
									case 'Relatively High Score' :
										well = 3
										break
										
									case 'Very High Score' :
										well = 4
										break
										
								}
								
								let val_string = this_val.toLowerCase().replaceAll(' ', '_')
								
								if (rp[val_string] != '') {
									$(this).html(rp[val_string])
								} else {
									$(this).html(this_val)
								}
								
								// set this label
								
								// find the well
								
								console.log(this_key, this_val, val_string, well)
								
								var this_range = $('body').find('.range[data-indicator="' + this_key.replace('rank', 'score') + '"]')
								
								var this_range_val = this_range.attr('data-val')
								
								this_range.find('.well').eq(well).addClass('active').html(this_range_val)
								
							} else {
								
								$(this).html(this_val)
								
							}
	
						} // if != undefined
						
					}) // each [data-indicator]
					
					
					setTimeout(function() {
						
						$('body').find('.score-chart-rank').animate({
							opacity: 1
						}, 600)
						
					}, 1000)

					
					// fetch the feature from geoapi, use its geometry to zoom to the vector tile feature

					var feature_ID_key = (plugin_settings.aggregation.current.agg == 's') ? 'Sauid' : 'csduid'

					$.ajax({
						url: plugin_settings.api.base_URL
							+ plugin_settings.aggregation.current.agg
							+ '/items/'
							+ plugin_settings.community[feature_ID_key],
						dataType: 'json',
						success: function(data) {

							// add the feature

							plugin_settings.map.layers.feature = new L.GeoJSON(data)

							// fit bounds

							plugin_settings.map.object.fitBounds(plugin_settings.map.layers.feature.getBounds(), {
								paddingTopLeft: [($(window).outerWidth() / 2) + 50, 100],
								paddingBottomRight: [50, 50]
							})

						}
					})

					// run elastic search query to create loss curve chart

					if (plugin_settings.community.fsauid) {

						var request_data = {
							"aggs": {
								"0": {
									"terms": {
										"field": "properties.eEL_Period",
										"order": {
											"1": "asc"
										},
										"size": 15
									},
									"aggs": {
										"1": {
											"sum": {
												"field": "properties.eEL_b0"
											}
										},
										"2": {
											"avg": {
												"field": "properties.e5L_b0"
											}
										},
										"3": {
											"sum": {
												"field": "properties.e95L_b0"
											}
										}
									}
								}
							},
							"size": 0,
							"fields": [],
							"script_fields": {},
							"stored_fields": [ "*" ],
							"runtime_mappings": {},
							"_source": { "excludes": [] },
							"query": {
								"bool": {
									"must": [],
									"filter": [
										{
											"match_phrase": {
												"properties.eEL_FSAUID.keyword": plugin_settings.community.fsauid
											}
										},
										{
											"match_phrase": {
												"properties.eEL_OccGen.keyword": "RES"
											}
										},
										{
											"match_phrase": {
												"properties.eEL_BldgType.keyword": "Concrete"
											}
										},
										{
											"match_phrase": {
												"properties.eEL_type.keyword": "structural"
											}
										}
									],
									"should": [],
									"must_not": []
								}
							}
						}

						var this_series = [
							{ name: rp.five_percent, data: [] },
							{ name: rp.mean, data: [] },
							{ name: rp.ninety_five_percent, data: [] }
						]

						$.ajax({
							method: 'POST',
							tryCount : 0,
							retryLimit : 3,
							crossDomain: true,
							headers: { "content-type": "application/json" },
							url: api_url + '/opendrr_psra_expected_loss_fsa/_search',
							data: JSON.stringify(request_data),
							success: function(data) {

								data.aggregations[0].buckets.forEach(function(item) {

									// 5%
									this_series[0]['data'].push([item.key, item[2]['value']])

									// mean
									this_series[1]['data'].push([item.key, item[1]['value']])

									// 95%
									this_series[2]['data'].push([item.key, item[3]['value']])

								})

								// create chart

								var chart = Highcharts.chart('risk-detail-chart', {
									tooltip: {
										useHTML: true,
										headerFormat: '',
										formatter: function() {
											
											let output = '<strong>' + this.x + 'y RP:</strong> '

											if (plugin_settings.lang == 'fr') {
												output += plugin._format_figure(this.y) + ' $'
											} else {
												output += '$' + plugin._format_figure(this.y)
											}
												
											return output
											
										}
									},
									chart: {
										inverted: true,
										styledMode: true
									},
									title: {
										text: null,
										enabled: false
									},
									xAxis: {
										reversed: false,
										title: {
											text: rp.return_period_years
										},
										tickInterval: 250
									},
									yAxis: {
										title: {
											text: rp.loss_cad
										},
									},
									plotOptions: {
										series: {
											marker: {
												enabled: true
											}
										}
									},
									series: this_series,
									legend: {
										margin: 20
									},
									navigation: {
										buttonOptions: {
											y: -10
										}
									},
									exporting: {
										enabled: false
									}
								})

							}
						})

					} else {

						$('body').find('#loss-exceedance-chart').remove()

					}

					// accordion behaviours

					$('.app-sidebar').find('.accordion').on('shown.bs.collapse', function (e) {

						var selected_card = $('.app-sidebar').find('.collapse.show'),
								selected_header = selected_card.prev()

						// add 'open' class to header

						selected_header.addClass('open')

						if ($(e.target).is('#detail-exceedance-collapse')) {

							map.closePopup().closeTooltip(plugin_settings.map.tooltip)

							// get FSA shape via elastic search

							// delete the old FSA
							if (map.hasLayer(plugin_settings.map.layers.fsa)) {
								map.removeLayer(plugin_settings.map.layers.fsa)
							}

							// create the request

							var fsa_request = {
								"size": 1000,
								"fields": [],
								"script_fields": {},
								"stored_fields": [ "*" ],
								"runtime_mappings": {},
								"_source": { "excludes": [] },
								"query": {
									"bool": {
										"must": [],
										"filter": [
											{
												"match_phrase": {
													"properties.CFSAUID.keyword": plugin_settings.community.fsauid
												}
											}
										],
										"should": [],
										"must_not": []
									}
								}
							}

							$.ajax({
								method: 'POST',
								tryCount : 0,
								retryLimit : 3,
								crossDomain: true,
								headers: { "content-type": "application/json" },
								url: api_url + '/opendrr_geometry_fsauid/_search',
								data: JSON.stringify(fsa_request),
								success: function(data) {

									var source

									// if a geometry exists

									if (data.hits.hits[0]._source) {

										source = data.hits.hits[0]._source

										// show the pane

										plugin_settings.map.panes.fsa.style.display = ''

										// add the layer

										plugin_settings.map.layers.fsa = new L.GeoJSON(source, {
											style: {
												fill: false,
												color: '#000000',
												weight: 2,
												opacity: 0.6
											},
											pane: 'fsa'
										}).addTo(map)

										// fit bounds

										plugin_settings.map.object.fitBounds(plugin_settings.map.layers.fsa.getBounds(), {
											paddingTopLeft: [($(window).outerWidth() / 2) + 50, 100],
											paddingBottomRight: [50, 50]
										})

									}

								}
							})

						} else {

							// hide the FSA pane (don't remove the layer)

							plugin_settings.map.panes.fsa.style.display = 'none'

							// fit the feature's bounds

							plugin_settings.map.object.fitBounds(plugin_settings.map.layers.feature.getBounds(), {
								paddingTopLeft: [($(window).outerWidth() / 2) + 50, 100],
								paddingBottomRight: [50, 50]
							})

						}

					}).on('hide.bs.collapse', function () {

						$('.app-sidebar').find('.collapse').prev().removeClass('open')

						// hide the FSA pane (don't remove the layer)

						plugin_settings.map.panes.fsa.style.display = 'none'

						// fit the feature's bounds

						plugin_settings.map.object.fitBounds(plugin_settings.map.layers.feature.getBounds(), {
							paddingTopLeft: [($(window).outerWidth() / 2) + 50, 100],
							paddingBottomRight: [50, 50]
						})

					})

				},
				complete: function() {

					$('body').removeClass('spinner-on')
					$('#spinner-progress').text('')

				}
			})


		},

		_round: function(num, power) {
			return num * Math.pow(10, power)
		},

		_round_dollars: function(num) {

			var plugin = this,
					rounded_num

			if (num > 1000000000) {
				rounded_num = plugin._round(num, -9).toFixed(2) + ' ' + rp.billion
			} else if (num > 100000) {
				rounded_num = plugin._round(num, -6).toFixed(2) + ' ' + rp.million
			} else {
				rounded_num = num.toLocaleString('en-CA', {
					maximumFractionDigits: 0
				})
			}

			return '$' + rounded_num

		},
		
		_format_figure: function(num, rounding = 0, indicator = null) {
			
			var plugin = this
			var plugin_settings = plugin.options
			
			var rounded_num = num
			
			if (indicator == null) {
				indicator = plugin_settings.indicator
			}
			
			if (typeof num == 'undefined') {
				num = 0
			}
			
			if (rounding != 0) {
				num = num * Math.pow(10, rounding)
			}
			
			if (indicator.key.includes('_Fatality')) {
				
				if (num == 0) {
					rounded_num = 0
				} else {
					rounded_num = plugin._significant_figs(num)
				}
				
			} else if (
				indicator.key.includes('eDtr') ||
				indicator.key.includes('eAALm')
			) {
				
				// ratios
				
				if (num == 0) {
					rounded_num = 0
				} else {
					rounded_num = plugin._significant_figs(num)
				}
					
			} else if (indicator.type == 'dollars') {
				
				// dollars
				
				if (num == 0) {
					rounded_num = 0
				} else if (num < 1000) {
					rounded_num = '<1000'
				} else {
					rounded_num = plugin._significant_figs(num)
				}
		
			} else {
				
				// standard formatting for injuries/damage
				
				if (num == 0) {
					rounded_num = 0
				} else if (num <= 1) {
					rounded_num = rp.one_or_less
				} else if ( num <= 10) {
					rounded_num = 10
				} else if (num <= 100) {
					rounded_num = plugin._round(num, -1).toFixed(0) * 10
				} else {
					rounded_num = plugin._significant_figs(num)
				}
				
			}
			
			return rounded_num.toString()
			
		},
		
		_significant_figs: function(num) {
			
			var plugin = this
			
			var rounded_num = num
			
			if (num.toString().includes('e-')) {
				
				var exponent = num.toString().split('e-'),
						zeros = parseInt(exponent[1]) - 1,
						digit = exponent[0].split('.')[0]
				
				rounded_num = '0.' + '0'.repeat(zeros) + digit
				
			} else if (num < 0.01) {
				
				// 0.0[...]X
				
				rounded_num = ''
				
				var num = num.toString().split(''),
						loop_continue = true
				
				num.forEach(function(digit) {
					
					if (loop_continue == true) {
						rounded_num += digit
						
						if (digit != '0' && digit != '.') {
							loop_continue = false
						}
					}
					
				})
				
			} else if (num < 1) {
				
				// 0.XX
				
				rounded_num = num.toPrecision(2)
				
			} else if (num < 100) {
				
				rounded_num = parseFloat(num.toFixed(2))
				
			} else if (num < 1000) {
				
				// XX0
				
				rounded_num = (plugin._round(num, -1).toFixed(0) * 10)
				
			} else if (num < 10000) {
				
				// X.X thousand
				
				rounded_num = plugin._round(num, -3).toFixed(1).replace(/[.,]0$/, '') + ' ' + rp.thousand
				
			} else if (num < 100000) {
				
				// XX thousand
				
				rounded_num = plugin._round(num, -3).toFixed(0) + ' ' + rp.thousand
				
			} else if (num < 1000000) {
				
				// XX0 thousand
				
				rounded_num = (plugin._round(num, -4).toFixed(0) * 10) + ' ' + rp.thousand
				
			} else if (num < 10000000) {
				
				// X.X million
				
				rounded_num = plugin._round(num, -6).toFixed(1).replace(/[.,]0$/, '') + ' ' + rp.million
				
			} else if (num < 100000000) {
				
				// XX million
				
				rounded_num = plugin._round(num, -6).toFixed(0) + ' ' + rp.million
				
			} else if (num < 1000000000) {
				
				// XX0 million
				
				rounded_num = (plugin._round(num, -7).toFixed(0) * 10) + ' ' + rp.million
				
			} else if (num < 10000000000) {
				
				// X.X billion
				
				rounded_num = plugin._round(num, -9).toFixed(1).replace(/[.,]0$/, '') + ' ' + rp.million
				
			} else if (num < 100000000000) {
				
				// XX billion
				
				rounded_num = plugin._round(num, -9).toFixed(0) + ' ' + rp.million
				
			} else if (num < 1000000000000) {
				
				// XX0 billion
				
				rounded_num = (plugin._round(num, -10).toFixed(0) * 10) + ' ' + rp.million
				
			}
			
			// console.log(num, rounded_num)
			
			return rounded_num
			
		}

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
