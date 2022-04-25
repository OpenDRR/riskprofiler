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
			colors: {
				shape: '#8b0707',
				shape_hover: '#ba0728',
				shape_select: '#d90429'
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

			//
			// MAP
			//

			// create object

	    plugin_settings.map.object = L.map('map', {
				zoomControl: false
			}).setView([55,-105], 4);

			L.control.zoom({
				position: 'bottomleft'
			}).addTo(plugin_settings.map.object);

			// basemaps

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(plugin_settings.map.object)

			// GEOJSON

			plugin_settings.map.geojson = [{
		    "type": "Feature",
		    "properties": {
					id: 1,
					city: 'Ottawa-Gatineau'
				},
		    "geometry": {
	        "type": "Polygon",
	        "coordinates": [[
            [-105, 55],
				    [-107, 55.5],
				    [-108, 57],
				    [-110, 55],
				    [-108, 54]
	        ]]
		    }
			}, {
		    "type": "Feature",
		    "properties": {
					id: 2,
					city: 'Vancouver'
				},
		    "geometry": {
	        "type": "Polygon",
	        "coordinates": [[
            [-120, 50],
				    [-122, 53],
				    [-125, 52]
	        ]]
		    }
			}]

			plugin_settings.map.choropleth = L.geoJSON(plugin_settings.map.geojson, {
		    style: {
					color: plugin_settings.colors.shape,
					fillColor: plugin_settings.colors.shape
				},
				onEachFeature: function (feature, layer) {

					if (typeof feature !== 'undefined') {

						layer
							.bindPopup(plugin_instance.create_popup(feature.properties.id), {
								className: 'risk-popup'
							})
							.on('mouseover', function () {

								// if the shape isn't already selected

								if (plugin_settings.map.selected_polygon != feature.properties.id) {

									this.setStyle({
										'color': plugin_settings.colors.shape_hover,
										'fillColor': plugin_settings.colors.shape_hover
									})

									$('.sidebar-item').removeClass('hover')

									$('.sidebar-item[data-id="' + feature.properties.id + '"]').addClass('hover')

								}

	            })
							.on('mouseout', function () {

								// if already selected, do nothing
								// if another layer is selected, reset this one

								$('.sidebar-item').removeClass('hover')

								if (plugin_settings.map.selected_polygon != feature.properties.id) {

									this.setStyle({
										'color': plugin_settings.colors.shape,
										'fillColor': plugin_settings.colors.shape
									})

								}

	            })
							.on('click', function() {

								plugin_instance.item_select({
									item_id: feature.properties.id,
									polygon: this
								})

							})

					}

				}

			}).addTo(plugin_settings.map.object)

			// EVENTS

			plugin_settings.map.object.on('popupclose', function(e) {

				plugin_instance.item_select({
					event: 'popupclose'
				})

			});

			//
			// FILTER
			//

			$(document).profiler('get_filter', 'risks/filter.php')

			//
			// SIDEBAR
			//

			$(document).profiler('get_sidebar', 'risks/items.php')

			$('body').on('mouseover', '.sidebar-item.city', function() {

				// if this item is not already selected

				if (!$(this).hasClass('selected')) {

					// this shape is not selected

					var this_id = parseInt($(this).attr('data-id'))

					// reset the choropleth, then go through all the shapes and re-evaluate

					plugin_settings.map.choropleth.resetStyle().eachLayer(function(layer) {

						if (layer.feature.properties.id == plugin_settings.map.selected_polygon) {

							// if the shape is selected

							layer.setStyle({
								'color': plugin_settings.colors.shape_select,
								'fillColor': plugin_settings.colors.shape_select
							})

						} else if (this_id == layer.feature.properties.id) {

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

						if (layer.feature.properties.id == plugin_settings.map.selected_polygon) {

							layer.setStyle({
								'color': plugin_settings.colors.shape_select,
								'fillColor': plugin_settings.colors.shape_select
							})

						}

					})

				}

			}).on('click', '.sidebar-item.city', function() {

				if (!$(this).hasClass('selected')) {

					var this_id = parseInt($(this).attr('data-id'))

					plugin_settings.map.choropleth.resetStyle().eachLayer(function(layer) {

						if (this_id == layer.feature.properties.id) {

							plugin_instance.item_select({
								item_id: layer.feature.properties.id,
								polygon: layer
							})

							layer.openPopup()

						}

					})

				}

			})

			//
			// DUMMY CLICKS
			//

			$('body').on('click', '.risk-detail-link', function() {
				plugin_settings.map.object.closePopup()

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
				plugin_settings.map.choropleth.resetStyle()

				// reset sidebar
				$('.sidebar-item').removeClass('selected')

				if (settings.item_id != null) {

					// select the polygon

					settings.polygon.setStyle({
						color: plugin_settings.colors.shape_select,
						fillColor: plugin_settings.colors.shape_select
					})

					// center the map on the clicked polygon

					$('body').profiler('_center_map', {
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
