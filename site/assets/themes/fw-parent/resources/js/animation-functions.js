(function($) {
  $(function() {

    var slick_settings
    var animations = {}
    var animations_in_carousels = {}
    var carousels_with_animations = []

    // create an array of all animations on the page

    $('.animation').each(function() {

      var container = $(this)

      if (
        typeof container.attr('id') != 'undefined' &&
        container.attr('id') != ''
      ) {

        var container_ID = container.attr('id')

        var new_anim = {
          element: $(this),
          id: $(this).attr('id'),
          rewind: false
        }

        new_anim.settings = {
          container: document.getElementById(new_anim.id),
          renderer: 'svg',
          loop: false,
          autoplay: false,
          path: new_anim.element.attr('data-anim-path')
        }

        if (new_anim.element.attr('data-anim-loop') == 'true') {
          new_anim.settings.loop = true
        }

        if (new_anim.element.attr('data-anim-rewind') == 'true') {
          new_anim.rewind = true
        }

        if (new_anim.element.attr('data-anim-in-view') == 'false') {
          new_anim.settings.autoplay = true
        }

        new_anim.lottie = lottie.loadAnimation(new_anim.settings)

        // in carousel

        if (container.parents('.carousel').length) {

          new_anim['element'].addClass('in-carousel')

          // add it to the animations_in_carousels object
          animations_in_carousels[new_anim.id] = new_anim

          // add the carousel to the carousels_with_animations array
          carousels_with_animations.push(container.closest('.carousel').parent().attr('id'))

          // add listener to advance slides when the animation is done

          animations_in_carousels[new_anim.id]['lottie'].addEventListener('complete', function(e) {

            animations_in_carousels[new_anim.id]['lottie'].goToAndStop(0)

            carousel_element = animations_in_carousels[new_anim.id]['element'].parents('.carousel')

            carousel_obj = carousel_element.slick('getSlick')

            current_slide = carousel_element.slick('slickCurrentSlide')

            //console.log(carousel_obj.$slides.length - 1, current_slide)

            if (carousel_obj.$slides.length - 1 != current_slide) {
              // console.log('go to next')
              carousel_element.slick('slickNext')
            } else {
              // console.log('last slide, go to 0')
              carousel_element.slick('slickGoTo', 0)
            }

          })

        } else {

          // add it to the animations object

          animations[new_anim.id] = new_anim
        }

        // animations[new_anim.id] = new_anim

      }

    })

    // console.log('animations')
    // console.log(animations)
    // console.log('animations in carousels')
    // console.log(animations_in_carousels)


    var carousels_unique = Array.from(new Set(carousels_with_animations))

    // console.log(carousels_unique)

    carousels_unique.forEach(function(carousel_id) {

      var this_carousel = $('#' + carousel_id).find('.carousel')

      // var this_carousel = $(animations_in_carousels[anim]['element']).parents('.carousel')

      if (!this_carousel.hasClass('re-initialized')) {

        // save its settings and destroy it
        slick_settings = JSON.parse(this_carousel.attr('data-slick'))
        this_carousel.slick('unslick')

        // add centermode settings
        slick_settings.centerMode = true
        slick_settings.variableWidth = true

        slick_settings.responsive.push({
          'breakpoint': 1000,
          'settings': {
            centerMode: false,
            variableWidth: false
          }
        })

        // add init and afterChange functions

        this_carousel.on('init', function(slick) {
          this_carousel.addClass('re-initialized')
          // console.log('re-initialized ' + carousel_id)
        })

        this_carousel.on('afterChange', function(event, slick, currentSlide) {
          this_carousel.removeClass('sliding')

          if ($(slick.$slides.get(currentSlide)).find('.animation').length) {
            // console.log('this slide has an animation')

            var slide1_anim = $(slick.$slides.get(currentSlide)).find('.animation').attr('id')

            // stop/pause all other animations

            for (var key in animations_in_carousels) {
              if (animations_in_carousels[key]['rewind'] == true) {
                animations_in_carousels[key]['lottie'].goToAndStop(0)
                // console.log('stop ' + key)
              } else {
                animations_in_carousels[key]['lottie'].pause()
                // console.log('pause ' + key)
              }
            }

            // play this one

            animations_in_carousels[slide1_anim]['lottie'].play()

          }

        })

        // re-initialize the carousel
        this_carousel.attr('data-slick', JSON.stringify(slick_settings))

        setTimeout(function() {
          this_carousel.slick(slick_settings)
        }, 500)

      }

    })

    //
    // set inview events
    //

    // var carousels_unique = Array.from(new Set(carousels_with_animations))

    carousels_unique.forEach(function(carousel_id) {

      // play/pause when the carousel is in view

      inView('#' + carousel_id)
        .on('enter', function() {

          console.log(carousel_id + ' is in view')

          // if the current slide has an animation
          // play it

          if ($('#' + carousel_id).find('.slick-current').find('.animation').length) {

            var slide1_anim = $('#' + carousel_id).find('.slick-current').find('.animation').attr('id')

            // stop all animations

            for (var key in animations_in_carousels) {
              animations_in_carousels[key]['lottie'].pause()
            }

            // play this one
            animations_in_carousels[slide1_anim]['lottie'].play()

          }

        })
        .on('exit', function() {

          // console.log(carousel_id + ' is not in view')

          if ($('#' + carousel_id).find('.slick-current').find('.animation').length) {

            var slide1_anim = $('#' + carousel_id).find('.slick-current').find('.animation').attr('id')

            // stop/pause

            if (animations_in_carousels[slide1_anim]['rewind'] == true) {
              animations_in_carousels[slide1_anim]['lottie'].goToAndStop(0)
              // console.log('stop ' + slide1_anim)
            } else {
              animations_in_carousels[slide1_anim]['lottie'].pause()
              // console.log('pause ' + slide1_anim)
            }

          }

        })

    })

    //
    // other animations
    //

    inView('.animation:not(.in-carousel)')
      .on('enter', function(element) {

        var this_id = $(element).attr('id')

        // console.log('play ' + this_id)

        animations[this_id]['lottie'].play()

      })
      .on('exit', function(element) {

        var this_id = $(element).attr('id')

        // console.log('stop ' + this_id)

        if (animations[this_id]['rewind'] == true) {
          animations[this_id]['lottie'].goToAndStop(0)
          // console.log('stop ' + anim)
        } else {
          animations[this_id]['lottie'].pause()
          // console.log('pause ' + anim)
        }

      })

  });
})(jQuery);
