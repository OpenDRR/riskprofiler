// post grid
// dependencies: jquery
// v1.0

(function ($) {

  // custom select class

  function acf_query(item, options) {

    this.item = $(item);

    // options

    var defaults = {
      classes: {
        item_wrap: 'query-item-wrap',
        item: 'query-item',
        next_btn: 'acf-query-next-btn'
      },
      current_page: 1,
      filters: {},
      active_filters: [],
      elements: {},
      debug: true
    };

    this.options = $.extend(true, defaults, options);

    this.init();
  }

  acf_query.prototype = {

    // init

    init: function () {

      var plugin_instance = this;
      var plugin_item = plugin_instance.item;
      var plugin_settings = plugin_instance.options;
      var plugin_classes = plugin_settings.classes;
      var plugin_elements = plugin_settings.elements;

      if (plugin_settings.debug == true) {
        console.log('acf query', 'init', plugin_item.attr('id'));
      }

      //
      // ELEMENTS
      //

      // ajax 'next page' button

      if (plugin_item.find('.' + plugin_classes.next_btn).length) {
        plugin_elements.next_btn = plugin_item.find('.' + plugin_classes.next_btn)
      }

      // item wrapper

      plugin_elements.item_wrap = plugin_item.find('.' + plugin_classes.item_wrap)

      // filter menu

      // console.log(plugin_item.find('.query-filter-wrap'))

      if (plugin_item.find('.query-filter-wrap').length) {
        plugin_elements.filter_menu = plugin_item.find('.query-filter-wrap')
      } else {
        plugin_elements.filter_menu = null
      }

      //console.log(plugin_item.attr('id'), plugin_item.attr('data-filters'))

      if (
        typeof plugin_item.attr('data-filters') != 'undefined' &&
        plugin_item.attr('data-filters') != null &&
        plugin_item.attr('data-filters').length
      ) {
        plugin_settings.filters = plugin_item.attr('data-filters').split(',')
      } else {
        plugin_settings.filters = null
      }

      //
      // INIT
      //

      //
      // ACTIONS
      //

      if (plugin_settings.debug == true) {
        console.log('acf query', 'initialized')
      }

    },

    get_page: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_classes = plugin_settings.classes
      var plugin_elements = plugin_settings.elements

      // options

      var settings = $.extend(true, {
        url: window.location.href,
        success: null,
        args: null,
        complete: null
      }, fn_options)

      var ajax_data, items

      var success_data = {
        items: null,
        next_link: false,
				empty: false
      }

      $('body').addClass('spinner-on')

      $.ajax({
        url: settings.url,
        data: settings.args,
        success: function(data) {

          if (plugin_settings.debug == true) {
            console.log(plugin_item.attr('id') + ' items', $(data).find('#' + plugin_item.attr('id') + ' .query-item'))

						// console.log('args', settings.args)

						$(data).find('.ajax-output').each(function() {
							console.log($(this).html())
						})
          }

          ajax_data = data

          plugin_settings.current_page += 1

          plugin_item.attr('data-page', plugin_settings.current_page)

					if ($(ajax_data).find('.query-empty').length) {

						success_data.items = $(ajax_data).find('.query-empty')

						success_data.empty = true

					} else {

          	success_data.items = $(ajax_data).find('#' + plugin_item.attr('id')).find('.' + plugin_classes.item)

					}

          if ($(ajax_data).find('#' + plugin_item.attr('id') + ' .' + plugin_classes.next_btn).length) {

            if (plugin_settings.debug == true) {
              console.log($(ajax_data).find('#' + plugin_item.attr('id') + ' .' + plugin_classes.next_btn))
            }

            success_data.next_link = $(ajax_data).find('#' + plugin_item.attr('id') + ' .' + plugin_classes.next_btn).attr('href')

          }

					success_data.post_count = {
						num: $(ajax_data).find('#' + plugin_item.attr('id') + ' .post-count-num').text(),
						total: $(ajax_data).find('#' + plugin_item.attr('id') + ' .post-count-total').text()
					}

          if (typeof settings.success == 'function') {
            settings.success(success_data)
          }

        },
        complete: function() {

          $('body').removeClass('spinner-on')

          if (typeof settings.complete == 'function') {
            settings.complete(items)
          }
        }
      })

    },

    eval_query: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_classes = plugin_settings.classes
      var plugin_elements = plugin_settings.elements

      // options

      var settings = $.extend(true, {
        success: null,
        complete: null
      }, fn_options)




    },

    eval_filters: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_classes = plugin_settings.classes
      var plugin_elements = plugin_settings.elements

      // options

      var settings = $.extend(true, {
        success: null,
        complete: null
      }, fn_options)

      console.log('eval');

      plugin_settings.active_filters = []

      plugin_item.find('.query-filter-item').each(function() {

				if (
					$(this).attr('data-filter-type') == 'search' &&
					$(this).attr('data-filter-value') != ''
				) {

					plugin_settings.active_filters.push('search_' + $(this).attr('data-filter-value'))

				} else {

	        if ($(this).hasClass('selected')) {

	          var filter_type = $(this).attr('data-filter-type'),
	              filter_key = $(this).attr('data-filter-key'),
	              filter_value = $(this).attr('data-filter-value')

	          var new_arg = filter_type + '_'

	          if (typeof filter_key !== 'undefined') {
	            new_arg += filter_key + '_'
	          }

	          new_arg += filter_value

	          plugin_settings.active_filters.push(new_arg)

	        }

				}

      })

      plugin_item.attr('data-filters', plugin_settings.active_filters)

      if (typeof settings.complete == 'function') {
        settings.complete(plugin_settings.active_filters)
      }

    }

  }

  // jQuery plugin interface

  $.fn.acf_query = function (opt) {

    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('acf_query');

      if (!instance) {

        // create plugin instance if not created
        item.data('acf_query', new acf_query(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));
