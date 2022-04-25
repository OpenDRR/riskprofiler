// togglebox
// v1.0

(function ($) {

  // custom select class

  function togglebox(item, options) {

    // options

    var defaults = {
      off: 'Off',
      on: 'On',
      debug: false,
			elements: {
				box: null
			}
    };

    this.options = $.extend(true, defaults, options);

    this.item = $(item);
    this.init();
  }

  togglebox.prototype = {

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
        console.log('initializing toggle');
        console.log('item', plugin_item);
      }

      var init_state = 'off';

      if (plugin_item.is(':checked') || plugin_item.hasClass('checked')) {
        init_state = 'on';
      }

      // togglebox markup

      plugin_elements.box = $('<div class="togglebox" data-state="' + init_state + '" />').insertAfter(plugin_item)

      // check for disabled input

      if (plugin_item.prop('disabled') == 'disabled' || plugin_item.hasClass('disabled')) {
				plugin_elements.box.addClass('disabled')
      }

      var on_text = plugin_settings.on;

      if (typeof plugin_item.attr('data-on') != 'undefined') {
        on_text = plugin_item.attr('data-on');
      }

      var off_text = plugin_settings.off;

      if (typeof plugin_item.attr('data-off') != 'undefined') {
        off_text = plugin_item.attr('data-off');
      }

      var markup = $('<div class="togglebox-track"><span class="on">' + on_text + '</span><span class="switch"></span><span class="off">' + off_text + '</span></div>');

      markup.appendTo(plugin_elements.box)

      // hide the checkbox

      plugin_item.addClass('togglebox-input')

      //
      // CLICK EVENTS
      //

      // disable click inside the label

      plugin_item.parents('label').click(function(e) {
        e.preventDefault();
      });

      // toggle

      plugin_elements.box.click(function() {

				if (!$(this).hasClass('disabled')) {

	        if ($(this).attr('data-state') == 'off') {
	          $(this).attr('data-state', 'on');
	        } else {
	          $(this).attr('data-state', 'off');
	        }

	        plugin_item.prop('checked', !plugin_item.prop('checked')).change()

	        //plugin_item.trigger('click');

				}

      });

    },

		toggle: function(action = null) {

			if (action == null) {

				plugin_elements.box.trigger('click')

			}

		},

		disable: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

			plugin_item.prop('disabled', true)

			plugin_item.addClass('disabled')
			plugin_elements.box.addClass('disabled')

		},

		enable: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

			plugin_item.prop('disabled', false)

			plugin_item.removeClass('disabled')
			plugin_elements.box.removeClass('disabled')

		},

    toggle: function(fn_options) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      // options

      var defaults = {
        action: 'on'
      };

      var settings = $.extend(true, defaults, fn_options);

    },

		get_state: function(fn_options) {

			return plugin_item.attr('data-state')

		}

  }

  // jQuery plugin interface

  $.fn.togglebox = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('togglebox');

      if (!instance) {

        // create plugin instance if not created
        item.data('togglebox', new togglebox(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));
