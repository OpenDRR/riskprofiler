// renderer
// v1.0

(function ($) {

  // custom select class

  function renderer(item, options) {

    // options

    var defaults = {
      chart_dir: child_theme_dir + 'resources/js/charts/',
      chart_options: null,
      charts: {},
      map_dir: child_theme_dir + 'resources/js/maps/',
      generated_ID: 1,
      debug: false
    };

    this.options = $.extend(true, defaults, options);

    this.item = $(item);
    this.init();
  }

  renderer.prototype = {

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
        console.log('renderer', 'initializing')
      }

      if (typeof Highcharts !== 'undefined') {

        $.getJSON(
          $(document).data('theme_dir') + 'resources/json/highcharts.json',
          function(data) {

            plugin_settings.chart_options = data

            // Highcharts.setOptions(data)

            chart_options_set = true

            $('body').data('chart_dir', plugin_settings.chart_dir)

            // console.log(data)
            if (plugin_settings.debug == true) {
              console.log('renderer', 'highchart options set')
            }

            plugin_instance.find_objects()

          }
        )

      } else {

        plugin_instance.find_objects()

      }

    },

    find_objects: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      // options

      var settings = $.extend(true, {
        parent: 'body'
      }, fn_options)

      // console.log('finding objects', settings.parent)

      $(settings.parent).find('.renderable').each(function() {

        var container = $(this)

        var render_success = false;

        // console.log(container)

        var container_ID

        if (typeof container.attr('id') == 'undefined') {
          container_ID = 'renderable-' + plugin_settings.generated_ID
          container.attr('id', container_ID)
          plugin_settings.generated_ID += 1
        } else {
          container_ID = container.attr('id')
        }

        if (plugin_settings.debug == true) {
          console.log('renderer', container_ID, container.attr('data-renderable-type'));
        }

        switch (container.attr('data-renderable-type')) {

          case 'chart' :

            if (chart_options_set == true) {

              var chart_scripts = JSON.parse(container.attr('data-js'))

              if (plugin_settings.debug == true) {
                console.log(chart_scripts)
              }

              for (var key in chart_scripts) {
                if (plugin_settings.debug == true) {
                  console.log($(document).data('child_theme_dir') + 'resources/charts/' + chart_scripts[key] + '.js')
                }

                $.getScript($(document).data('child_theme_dir') + 'resources/charts/' + chart_scripts[key] + '.js', function() {

                  container.addClass('rendered')

                })

              }

            }

            break

          case 'map' :

            var map_scripts = JSON.parse(container.attr('data-js'))

            // for each script in the array

            // get scripts[0]

            // when done, remove the script from the array

            // if the array is not empty

            // get scripts[0]

            function get_next_script() {

              // get the first script

              $.getScript(child_theme_dir + 'resources/maps/' + map_scripts[0] + '.js', function() {

                  // remove the script from the array
                  map_scripts.shift()

                  if (map_scripts && map_scripts.length) {

                    // the array is not empty,
                    // run it again
                    get_next_script()

                  } else {

                    // the array is now empty,
                    // add the 'rendered' class

                    container.addClass('rendered')
                  }

                })

            }

            // run the function the first time
            get_next_script()

            break

          case 'swipe_compare' :

            $(this).swipe_compare()
            container.addClass('rendered')

            break

          case 'time-series' :

            $(this).time_series_slider()
            container.addClass('rendered')

            break

          case 'scroll-progress' :

            $(this).scroll_progress()
            container.addClass('rendered')

            break

          case 'share' :

            $(this).share_widget()
            container.addClass('rendered')

            break

					case 'query_grid' :
					case 'query_list' :

						$(this).acf_query()
						$(this).post_grid()
						container.addClass('rendered')

						break

					case 'query_carousel' :

						container.acf_query()
						container.post_carousel()
						container.addClass('rendered')

						break

          case 'post_grid' :
          case 'post_list' :

            $(this).acf_query()
            $(this).post_grid()
            container.addClass('rendered')

            break

          case 'post_swiper' :

            console.log('renderer', 'carousel')

            container.acf_query()
            container.post_carousel()
            container.addClass('rendered')

            break

          case 'hotspots' :

            $(this).hotspots()
            container.addClass('rendered')

            break

          case 'tabs' :

            var tab_ids = []

            $(this).find('.tab-panel').each(function(i) {
              tab_ids[i] = $(this).attr('id')
            })

            $(this).find('.tab-menu li a').each(function(i) {
              $(this).attr('href', '#' + tab_ids[i])
            })

            $(this).children().first().tabs({
              hide: { effect: 'fadeOut', duration: 250 },
              show: { effect: 'fadeIn', duration: 250 }
            })

        }

      })

    },


    _eval: function(fn_code) {

      return Function('return ' + fn_code)();

    }

  }

  // jQuery plugin interface

  $.fn.renderer = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('renderer');

      if (!instance) {

        // create plugin instance if not created
        item.data('renderer', new renderer(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));
