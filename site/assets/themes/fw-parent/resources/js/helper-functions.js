//
// OBJECT MANIPULATION
//

// is object empty

function is_empty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }

  return true;
}

// is JSON

function is_json(str) {
	try {
		JSON.parse(str)
	} catch (e) {
		return false
	}

	return true
}

//
// STRING MANIPULATION
//

// replace all substrings

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace)
}

//
// DELAY
//

function delay(callback, ms) {
  var timer = 0;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      callback.apply(context, args);
    }, ms || 0);
  };
}
