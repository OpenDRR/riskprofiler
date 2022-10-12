// overlay
// v1.1

(function ($) {

  // custom select class

  function overlay(item, options) {

    this.item = $(item);

    // options

    var defaults = {
      open: false,
      current: null,
      position: 'top',
      bg: '0,0,0,0.6',
      opacity: 0.6,
      debug: false,
      elements: {
      },
			youtube: {
				placeholder: $('<div id="youtube-embed">'),
				player: '',
				script: '',
				done: false
			}
    };

    this.options = $.extend(true, defaults, options);
    this.init();
  }

  overlay.prototype = {

    // init

    init: function () {

      var plugin_instance = this;
      var plugin_item = plugin_instance.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;

      if (plugin_settings.debug == true) {
        // console.log('overlay');
      }

      //
      // ELEMENTS
      //

      plugin_item.addClass('overlay-initialized');

      plugin_elements.overlay = plugin_item.find('.overlay-content-wrap');

      //plugin_elements.position = $('<div id="overlay" class="overlay-position"></div>').appendTo('body');
      plugin_elements.wrap = $('<div class="overlay-wrap container-fluid"></div>').appendTo('body');
      //plugin_elements.container = $('<div class="overlay row" data-position="' + plugin_settings.position + '"></div>');

      // hide content that is linked to with an 'inline' attribute

			$('body').find('.overlay-toggle').each(function() {

				var target_div,
						found_div = false

				if (
					typeof $(this).attr('href') != 'undefined' &&
					$(this).attr('href').charAt(0) == '#'
				) {

					target_div = $(this).attr('href')
					found_div = true

				} else if ($(this).find('[href^="#"]').length) {

					// move the class from this to the link

					target_href = $(this).find('[href^="#"]')[0]
					target_div = $(target_href).attr('href')

					$(this).removeClass('overlay-toggle')
					$(target_href).addClass('overlay-toggle')

					found_div = true

				}

				if (found_div == true && $(target_div).length) {
					$(target_div).hide()
				}

			})

      // $('body').find('.overlay-toggle[href^="#"]').each(function() {
			// 	console.log('toggle', $(this))
      //   var target_div = $(this).attr('href')
      //   $(target_div).hide()
      // })

      // convert classes to data attributes

      $('body').find('.overlay-toggle[class*="overlay-"]').each(function() {

        var split_class = $(this).attr('class').split(' ')

        for (var key in split_class) {

          if (
            split_class[key] != 'overlay-toggle' &&
            split_class[key].indexOf('overlay-') !== -1
          ) {

            atts = split_class[key].split('-').slice(1)

            $(this).attr('data-overlay-' + atts[0], atts[1])

          }

        }

      })

      //
      // ACTIONS
      //

      $('body').on('click', '.overlay-toggle', function(e) {
        e.preventDefault();

        var show_overlay = true;

        var link_href = $(this).attr('href')

				var overlay_content = ''

				if (typeof $(this).attr('data-overlay-content') != 'undefined' && (this).attr('data-overlay-content') != '') {
        	var overlay_content = $(this).attr('data-overlay-content')
				}

        // if the clicked link is already open

        if (
          plugin_settings.open == true &&
          plugin_settings.current.href == link_href &&
          plugin_settings.current.content == overlay_content
        ) {

          show_overlay = false

        }

        if (show_overlay == true) {

          var show_options = {
            href: link_href,
            content: overlay_content,
            position: 'top',
            title: $(this).attr('data-overlay-title'),
            caption: $(this).attr('data-overlay-caption')
          }

          if (typeof $(this).attr('data-overlay-position') !== 'undefined') {
            show_options.position = $(this).attr('data-overlay-position');
          }

          if (typeof $(this).attr('data-overlay-opacity') !== 'undefined') {
            plugin_settings.opacity = $(this).attr('data-overlay-opacity');
          } else {
            plugin_settings.opacity = 0.6;
          }

          if (typeof $(this).attr('data-overlay-bg') !== 'undefined') {
            plugin_settings.bg = $(this).attr('data-overlay-bg');
          } else {
            plugin_settings.bg = '0,0,0,0.6'
          }

          if (plugin_settings.debug == true) {
            console.log('overlay', link_href, overlay_content);
          }

          if (typeof $(this).attr('data-overlay-ajax-target') !== 'undefined' && $(this).attr('data-overlay-ajax-target') != '') {

            show_options.ajax_target = $(this).attr('data-overlay-ajax-target')

          }

          plugin_instance.show(show_options)

        }

      });

      // close

      $('body').on('click', '.overlay-close', function(e) {

        plugin_instance.hide();

      });

      // 'esc' key

      $('body').keypress(function(e) {
        if ($('body').hasClass('overlay-open') && e.which == 27){
          plugin_instance.hide();
        }
      });

      if (plugin_settings.debug == true) {
        console.log('overlay', 'initialized');
      }

    },

    hide: function(fn_options) {

      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;

      // options

      var defaults = {
        href: null,
        slug: null,
        timeout: 0,
        complete: null
      };

      var settings = $.extend(true, defaults, fn_options);

      if (plugin_settings.debug == true) {
        console.log('hide overlay');
      }

      plugin_item.find('.overlay').removeClass('current');

      $('body').removeClass('overlay-open').removeClass('overlay-position-right').removeClass('overlay-position-top');

      $('body').attr('data-overlay-content', '');

      setTimeout(function() {
        plugin_item.find('.overlay').remove();
        plugin_elements.wrap.find('.overlay-close').remove();
      }, 400);

      plugin_settings.open = false;
      plugin_settings.current = null;

      // $('#supermenu').supermenu('enable');

      $(document).trigger('overlay_hide')

    },

    show: function(fn_options) {

      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;

      // options

      var settings = $.extend(true, {
        href: null,
        data: null,
        content: null,
        position: plugin_settings.position,
        ajax_target: null,
        callback: null
      }, fn_options);

      // adjust content

      if (settings.href.charAt(0) == '#') {
        settings.content = 'inline'
      } else if (settings.href.includes('youtube')) {

				settings.content = 'youtube'

				plugin_settings.youtube.video_ID = settings.href.split('v=')[1]

				if (plugin_settings.youtube.video_ID.includes('&')) {
					plugin_settings.youtube.video_ID = plugin_settings.youtube.video_ID.split('&')[0]
				}

			} else if (settings.href.includes('youtu.be')) {

				settings.content = 'youtube'

				plugin_settings.youtube.video_ID = settings.href.split('.be/')[1]

			}

      // ajax stuff

      var ajax_data = {
        content: settings.content
      };

      ajax_data = $.extend(ajax_data, settings.data);

      // containers

      var new_container, new_content

      // if the overlay is already open,
      // hide it and delay showing the new overlay

      var show_timeout = 0;

      if (plugin_settings.open == true) {
        plugin_instance.hide();
        show_timeout = 400;
      }

      // plugin_elements.wrap.css('background-color', 'rgba(0,0,0,' + plugin_settings.opacity + ')');

      plugin_elements.wrap.css('background-color', 'rgba(' + plugin_settings.bg + ')');

      setTimeout(function() {

        // open the overlay

				if (plugin_settings.debug == true) {
	        console.log('show', settings.content)
				}

        new_container = $('<div class="overlay" data-content="' + settings.content + '" data-position="' + settings.position + '">').appendTo(plugin_elements.wrap);

        $('<div class="overlay-close"><i class="fas fa-times"></i></div>').insertBefore(new_container);

        //
        // CONTENT TYPES
        //

				switch (settings.content) {

					case 'image' :

	          // add the image to the container

	          new_content = $('<div class="overlay-image"><img src="' + settings.href + '"></div>').appendTo(new_container);

	          if (settings.title || settings.caption) {

	            var caption_markup = '<div class="overlay-caption">'

	            if (settings.title) {
	              caption_markup += '<h5 class="overlay-caption-title">' + settings.title + '</h5>'
	            }

	            if (settings.caption) {
	              caption_markup += '<p class="overlay-caption-text">' + settings.caption + '</p>'
	            }

	            caption_markup += '</div>'

	            $(caption_markup).insertAfter(new_content)

	          }

	          // add body classes

	          setTimeout(function() {
	            $('body').addClass('overlay-open').removeClass('spinner-on');
	            $('body').addClass('overlay-position-' + settings.position);
	            $('body').attr('data-overlay-content', settings.content);
	          }, 1);

						break

					case 'inline' :

	          // inline content

	          if (plugin_settings.debug == true) {
	            console.log('inline');
	          }

	          // find the div

	          if ($(settings.href).length) {

	            new_content = $('<div class="overlay-content">').appendTo(new_container)

	            var inline_html = $(settings.href).clone().appendTo(new_content)
	            inline_html.show()

	          }

	          // add body classes

	          setTimeout(function() {
	            $('body').addClass('overlay-open').removeClass('spinner-on')
	            $('body').addClass('overlay-position-' + settings.position)
	            $('body').attr('data-overlay-content', settings.content)
	            $(document).trigger('overlay_show')
	          }, 1);

						break

					case 'youtube' :

						new_content = $('<div class="overlay-content">').appendTo(new_container)

						// append the placeholder
						plugin_settings.youtube.placeholder.appendTo(new_content)

						if (plugin_settings.youtube.script == '') {

							// create the youtube API script
							plugin_settings.youtube.script = document.createElement('script')
				      plugin_settings.youtube.script.src = 'https://www.youtube.com/iframe_api'

							// insert the script
				      var firstScriptTag = document.getElementsByTagName('script')[0]
				      firstScriptTag.parentNode.insertBefore(plugin_settings.youtube.script, firstScriptTag)

						} else {

							plugin_instance._youtube_api(plugin_settings.youtube.video_ID)

						}

						// API ready function
						window.onYouTubeIframeAPIReady = function() {
							plugin_instance._youtube_api(plugin_settings.youtube.video_ID)
						}

						// add body classes

	          setTimeout(function() {
	            $('body').addClass('overlay-open').removeClass('spinner-on')
	            $('body').addClass('overlay-position-' + settings.position)
	            $('body').attr('data-overlay-content', settings.content)
	            $(document).trigger('overlay_show')
	          }, 1);

						break

					default :

	          // ajax

	          console.log('ajax');

	          $('body').addClass('spinner-on');

	          var ajax_html = ''

	          $.ajax({
	            url: settings.href,
	            data: ajax_data,
	            success: function(data, textStatus, jqXHR) {

	              ajax_html = data

	              if (
	                settings.ajax_target != null &&
	                $(ajax_html).find(settings.ajax_target).length
	              ) {
	                ajax_html = $(ajax_html).find(settings.ajax_target)
	              }

	              console.log(settings.ajax_target)

	              ajax_html.appendTo(new_container)

	              // if (settings.position == 'right') {
	              //   $('<div class="overlay-close bg-primary text-white"><i class="fas fa-times"></i></div>').insertBefore(new_container);
	              // }

	            },
	            complete: function() {

	              var callback_data = '';

	              if (plugin_settings.debug == true) {
	                console.log($(ajax_html).find('#callback-data'));
	              }

	              if ($(ajax_html).find('#callback-data').length) {
	                callback_data = JSON.parse($(ajax_html).find('#callback-data').html());
	              }

	              if (typeof(settings.callback) == 'function') {
	                settings.callback(callback_data);
	              }

	              // $('#supermenu').supermenu('disable');

	              // add body classes

	              setTimeout(function() {
	                $('body').addClass('overlay-open').removeClass('spinner-on');
	                $('body').addClass('overlay-position-' + settings.position);
	                $('body').attr('data-overlay-content', settings.content);

	                $(document).trigger('overlay_show')

	              }, 1);

	            }
	          });

        }

        plugin_settings.open = true;

        plugin_settings.current = {
          href: settings.href,
          content: settings.content
        };

      }, show_timeout);

    },

    _set_position: function(new_position) {

      var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      if (plugin_settings.debug == true) {
        console.log('set position to ' + new_position);
      }

      plugin_settings.position = new_position;
      //plugin_elements.position.attr('data-position', new_position);

    },

		_youtube_api: function() {

			var plugin_instance = this
      var plugin_item = this.item
      var plugin_settings = plugin_instance.options

			console.log('ready', plugin_settings.youtube.video_ID)

			plugin_settings.youtube.player = new YT.Player('youtube-embed', {
				width: '100%',
				height: '100%',
				videoId: plugin_settings.youtube.video_ID,
				events: {
					'onReady': function(e) {
						// e.target.playVideo()
					},
					'onStateChange': function(e) {

						if (e.data == YT.PlayerState.PLAYING && !plugin_settings.youtube.done) {

							// setTimeout(function() {
							// 	plugin_settings.youtube.player.stopVideo()
							// }, 6000)

							plugin_settings.youtube.done = true

						}

					}
				}
			})

		}

  }

  // jQuery plugin interface

  $.fn.overlay = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('overlay');

      if (!instance) {

        // create plugin instance if not created
        item.data('overlay', new overlay(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));
