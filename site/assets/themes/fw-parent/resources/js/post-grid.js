// post grid
// dependencies: jquery
// v1.0

(function ($) {

  // custom select class

  function post_grid(item, options) {

    this.item = $(item)

    // options

    var defaults = {
      append: false,
      classes: {
        item_container: 'type-query_items',
        item: 'query-item',
				filter_container: 'type-filter_items',
				filter_item: 'filter-item',
				sort_container: 'type-sort',
				search_input: 'filter-search-input',
        next_btn: 'post-grid-next-btn',
				filter_icon: 'fa-ellipsis-v',
				close_icon: 'fa-times'
      },
      query_args: {},
      elements: {
        next_btn: null,
				item_container: null,
        filter_container: null,
        filter_toggle: null,
				sort_container: null,
				post_count: null,
				search_input: null
      },
			filter_open: null,
			pagination: 'append',
      debug: false
    }

    this.options = $.extend(true, defaults, options)

    this.init()
  }

  post_grid.prototype = {

    // init

    init: function () {

      var plugin_instance = this;
      var plugin_item = plugin_instance.item;
      var plugin_settings = plugin_instance.options;
      var plugin_classes = plugin_settings.classes;
      var plugin_elements = plugin_settings.elements;

      if (plugin_settings.debug == true) {
        console.log('post grid', 'init');
      }

      //
      // FEATURES
      //

			if (typeof plugin_item.attr('data-pagination') != 'undefined') {
				plugin_settings.pagination = plugin_item.attr('data-pagination')
			}

			// if (plugin_settings.filter_open == null) {
      //   plugin_settings.filter_open = false
      // }
			//
      // if (plugin_item.attr('data-filter-open') == 'true') {
      //   plugin_settings.filter_open = true
      // }
			//
			// if (plugin_settings.debug == true) {
      // 	console.log('post grid', 'filter open', plugin_settings.filter_open)
			// }

      //
      // ELEMENTS
      //

			// next button

      if (plugin_item.find('.' + plugin_classes.next_btn).length) {
        plugin_elements.next_btn = plugin_item.find('.' + plugin_classes.next_btn)
      }

      // item wrapper

      plugin_elements.item_container = plugin_item.find('.' + plugin_classes.item_container)

      // filter menu

      if (plugin_item.find('.' + plugin_classes.filter_container).length) {

        plugin_elements.filter_container = plugin_item.find('.' + plugin_classes.filter_container)
        plugin_elements.filter_toggle = plugin_item.find('.query-filter-toggle')

				// show the 'clear' label if any items are pre-selected

				if (plugin_elements.filter_container.find('.selected').length) {
					plugin_elements.filter_container.find('.query-filter-clear').fadeIn()
				} else {
					plugin_elements.filter_container.find('.query-filter-clear').fadeOut()
				}

      }

			// sort menu

			if (plugin_item.find('.' + plugin_classes.sort_container).length) {

				plugin_elements.sort_container = plugin_item.find('.' + plugin_classes.sort_container)

				// show the 'clear' label if any items are pre-selected

				// if (plugin_elements.filter_container.find('.selected').length) {
				// 	plugin_elements.filter_container.find('.query-filter-clear').fadeIn()
				// } else {
				// 	plugin_elements.filter_container.find('.query-filter-clear').fadeOut()
				// }

			}

			// search input

			if (plugin_item.find('.' + plugin_classes.search_input).length) {
				plugin_elements.search_input = plugin_item.find('.' + plugin_classes.search_input)
			}

			// post count

			if (plugin_item.find('.post-count-num').length) {
				plugin_elements.post_count = plugin_item.find('.post-count-num')
			}

			console.log(plugin_elements)

      //
      // INIT
      //

      // if (plugin_settings.filter_open == true) {
      //   plugin_elements.filter_toggle.find('.icon').addClass(plugin_settings.classes.close_icon).removeClass(plugin_settings.classes.filter_icon)
      //   plugin_item.addClass('filter-open')
      // }

      //
      // ACTIONS
      //

      // console.log(plugin_elements.filter_container)

      if (plugin_elements.filter_container != null) {

        // FILTER TOGGLE CLICK

        plugin_elements.filter_toggle.find('.btn').click(function() {

          if (plugin_item.hasClass('filter-open')) {

						// open

            plugin_elements.filter_toggle.find('.icon').removeClass(plugin_settings.classes.close_icon).addClass(plugin_settings.classes.filter_icon)
            plugin_item.removeClass('filter-open')

						if (plugin_item.hasClass('filter-position-top')) {
							plugin_elements.filter_container.slideUp()
						}

          } else {

						// close

            plugin_elements.filter_toggle.find('.icon').addClass(plugin_settings.classes.close_icon).removeClass(plugin_settings.classes.filter_icon)
            plugin_item.addClass('filter-open')

						if (plugin_item.hasClass('filter-position-top')) {
							plugin_elements.filter_container.slideDown()
						}

          }

        })

        // FILTER ITEM CLICK

        plugin_elements.filter_container.find('.query-filter-item').click(function(e) {

					var this_icons = $(this).closest('.query-filter-list').attr('data-icons').split('|')

          // de-select if turned on already

          if ($(this).hasClass('selected')) {

            $(this).removeClass('selected')
            $(this).find('.icon').removeClass(this_icons[1]).addClass(this_icons[0])

          } else {

            $(this).addClass('selected')
            $(this).find('.icon').removeClass(this_icons[0]).addClass(this_icons[1])

            // remove sibling classes if not a multi-selectable filter

            if ($(this).closest('.query-filter-list').attr('data-multi') == 'false') {
              $(this).siblings().each(function() {
                $(this).removeClass('selected')
                $(this).find('.icon').removeClass(this_icons[1]).addClass(this_icons[0])
              })
            }

          }

          plugin_instance._eval_filters()

        })

				// SEARCH INPUT

				if (plugin_elements.search_input != null) {

					plugin_elements.search_input.on('keyup', delay(function (e) {

						$(this).closest('.query-filter-item').attr('data-filter-value', $(this).val())

					  plugin_instance._eval_filters()
					}, 250))

				}

        // CLEAR FILTERS

        plugin_elements.filter_container.find('.query-filter-clear').click(function(e) {

          plugin_elements.filter_container.find('.selected').each(function() {

						var this_icons = $(this).closest('.query-filter-list').attr('data-icons').split('|')

            $(this).removeClass('selected')
            $(this).find('.icon').removeClass(this_icons[1]).addClass(this_icons[0])
          })

					if (plugin_elements.search_input != null) {
						plugin_elements.search_input.val('').closest('.query-filter-item').attr('data-filter-value', '')
					}

          plugin_instance._eval_filters()

        })

      }

			if (plugin_elements.sort_container != null) {

        // SORT ITEM CLICK

        plugin_elements.sort_container.find('.query-filter-item').click(function(e) {

					var this_icons = $(this).closest('.query-filter-list').attr('data-icons').split('|')

          // de-select if turned on already

          if ($(this).hasClass('selected')) {

            $(this).removeClass('selected')
            $(this).find('.icon').removeClass(this_icons[1]).addClass(this_icons[0])

						// find the default value and select that

						if ($(this).closest('.query-filter-list').find('.sort-default').length) {
							$(this).closest('.query-filter-list').find('.sort-default').addClass('selected')

							$(this).closest('.query-filter-list').find('.sort-default .icon').removeClass(this_icons[0]).addClass(this_icons[1])
						}

          } else {

            $(this).addClass('selected')
            $(this).find('.icon').removeClass(this_icons[0]).addClass(this_icons[1])

            // remove sibling classes if not a multi-selectable filter

            $(this).siblings().each(function() {
              $(this).removeClass('selected')
              $(this).find('.icon').removeClass(this_icons[1]).addClass(this_icons[0])
            })

          }

          plugin_instance._eval_filters()

        })

			}

      // NEXT PAGE BUTTON

      if (plugin_elements.next_btn != null) {

        plugin_elements.next_btn.click(function(e) {
          e.preventDefault()
          e.stopImmediatePropagation()

          var clicked_btn = $(this)
          var link_href = clicked_btn.attr('href')

          plugin_settings.append = true

          plugin_elements.item_container.addClass('loading')
          $('body').addClass('spinner-on')

          plugin_item.acf_query('get_page', {
            url: link_href,
            args: plugin_settings.query_args,
            success: function(success_data) {

							plugin_item.find('.post-count-num').text(success_data.post_count.num)
							plugin_item.find('.post-count-total').text(success_data.post_count.total)

              plugin_instance._add_items({
                success_data: success_data
              })

            },
            complete: function() {

              plugin_elements.item_container.removeClass('loading')
              $('body').removeClass('spinner-on')

              setTimeout(function() {
                $(document.body).trigger('sticky_kit:recalc');
              }, 200)


            }
          });

        })

      }

      if (plugin_settings.debug == true) {
        console.log('post grid', 'initialized')
      }

    },

    _eval_filters: function(fn_options) {

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

      var settings = $.extend(true, defaults, fn_options)

      if (
				plugin_elements.filter_container.find('.selected').length ||
				(plugin_elements.search_input != null && plugin_elements.search_input.val() != '')
			) {
        plugin_elements.filter_container.find('.query-filter-clear').fadeIn()
      } else {
        plugin_elements.filter_container.find('.query-filter-clear').fadeOut()
      }

      plugin_item.acf_query('eval_filters', {
        complete: function() {

          console.log('eval done, get page now')

          plugin_settings.append = false

          plugin_settings.query_args[plugin_item.closest('.fw-block').attr('id') + '_filters'] = plugin_item.attr('data-filters')

          plugin_elements.item_container.addClass('loading')
          $('body').addClass('spinner-on')

					console.log(plugin_settings.query_args)

          plugin_item.acf_query('get_page', {
            url: window.location.href,
            args: plugin_settings.query_args,
            success: function(success_data) {

							console.log(plugin_item.find('.post-count-num'), success_data.post_count.num)

							plugin_item.find('.post-count-num').text(success_data.post_count.num)
							plugin_item.find('.post-count-total').text(success_data.post_count.total)

              plugin_instance._add_items({
                success_data: success_data
              })

							// if (plugin_elements.post_count != null) {
							// 	plugin_elements.post_count.text(success_data.post_count)
							// }

            },
            complete: function() {

              plugin_elements.item_container.removeClass('loading')
              $('body').removeClass('spinner-on')

              setTimeout(function() {
                $(document.body).trigger('sticky_kit:recalc');
              }, 200)

            }
          })

        }
      })

    },

    _add_items: function(fn_options) {

      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_classes = plugin_settings.classes;
      var plugin_elements = plugin_settings.elements;

      // options

      var settings = $.extend(true, {
        success_data: null,
        append: false
      }, fn_options);

      console.log('success data', settings.success_data)

      if (settings.success_data != null) {

        if (
					plugin_settings.pagination == 'replace' ||
					plugin_settings.append == false
				) {

          // remove existing items
          plugin_elements.item_container.empty() //find('.query-item').remove()

        }

        // add new items

        settings.success_data.items.appendTo(plugin_elements.item_container)

        // console.log(success_data.next_link)

        if (settings.success_data.next_link == false) {

          if (plugin_elements.next_btn != null) {
            plugin_elements.next_btn.fadeOut(250, function() {
              // $(this).remove()
            })
          }

        } else {

          if (plugin_settings.debug == true) {
            console.log('change next btn link href')
          }

          if (plugin_elements.next_btn != null) {
            plugin_elements.next_btn.show()

            plugin_elements.next_btn.attr('href', settings.success_data.next_link)
          }

        }

      }

    }

  }

  // jQuery plugin interface

  $.fn.post_grid = function (opt) {

    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('post_grid');

      if (!instance) {

        // create plugin instance if not created
        item.data('post_grid', new post_grid(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));
