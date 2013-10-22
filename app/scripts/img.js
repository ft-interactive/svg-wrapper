(function(){
  'use strict';
  
  window.console = window.console || { log: function() {}, error: function() {} };

  if (window.parent === window) {
    console.error('This wrapper must be loaded as an iframe');
    return;
  }

  var frameElement = window.frameElement;

  function hideThisFrame() {
    hideElement(frameElement);
  }

  function hideElement(el) {
    if (!el) return;
    var s = el.style;
    s.display = 'none';
    s.visibility = 'hidden';
  }

  function unhideElement(el) {
    if (!el) return;
    var s = el.style;
    s.display = '';
    s.visibility = '';
  }

  if (document.domain && /ft\.com$/.test(document.domain)) {
    document.domain = 'ft.com';
  }

  var params = window.location.hash.substr(1).split('__');
  var isAbsURL = /^(https?:)?\/\/\w/;

  if (!params[0] || !params[1]) {
    console.error('Incomplete parameters: You must provide a) a valid absolute URL to the SVG b) a fallback in the form of a URL or an CSS selector');
    hideThisFrame();
    return;
  }

  if (!isAbsURL.test(params[0])) {
    console.error('The SVG URL is not valid');
    hideThisFrame();
    return;
  }

  var svgSrc = params[0];
  var imgSrc = params[1];
  var fallbackSelector;
  var fallbackNodes;
  var appendToParent = typeof params[2] === 'undefined' ? false : /^(true|y|yes)$/i.test(params[2]);
  var bgColor = '#' + (params[3] || 'fff1e0').replace(/^#/, '');

  var iframeWidth = frameElement.width || frameElement.style.width;
  var iframeHeight = frameElement.height || frameElement.style.height;

  if (!iframeWidth || !iframeHeight) {
    // ideally this wont kick in because getComputedStyle causes reflows
    // and if there are multiple instances of our wrapper then we could causes layout thrashing
    var computedStyles = window.parent.getComputedStyle(frameElement, null);

    if (!iframeWidth) {
      iframeWidth = computedStyles.getPropertyValue('width');
    }

    if (!iframeHeight) {
      iframeHeight = computedStyles.getPropertyValue('height');
    }
  }

  iframeWidth = parseInt(iframeWidth || 0, 10);
  iframeHeight = parseInt(iframeHeight || 0, 10);

  document.documentElement.style.backgroundColor = bgColor;

  if (!isAbsURL.test(imgSrc)) {
    fallbackSelector = imgSrc;
  }

  // resizes image to specified width and returns array of the new sizes : [width, height]
  function fitWidth(img, width) {
    var w = img.width, h = img.height;
    return [img.width = width, Math.ceil(img.height = h + (((width - w) / w * 100) / 100 * h))];
  }

  // resizes image to specified height and returns array of the new sizes : [width, height]
  function fitHeight(img, height) {
    var w = img.width, h = img.height;
    return [Math.ceil(img.width = w + (((height - h) / h * 100) / 100 * w)), img.height = height];
  }

  // purges dom nodes of its function to avoid memory leaks in IE
  function purge(d) {
    var a = d.attributes, i, l, n;
    if (a) {
      for (i = a.length - 1; i >= 0; i -= 1) {
        n = a[i].name;
        if (typeof d[n] === 'function') {
          d[n] = null;
        }
      }
    }
    a = d.childNodes;
    if (a) {
      l = a.length;
      for (i = 0; i < l; i += 1) {
        purge(d.childNodes[i]);
      }
    }
  }

  // detect browser support for SVG in img elements
  // From Modernizr: !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
  // Modernizr doesn't give us the correct detection here so we use document.implementation
  var svgSupport = ('implementation' in document) && document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Image', '1.1');

  var img = document.createElement('img');

  img.src = svgSupport ? svgSrc : (!fallbackSelector ? imgSrc: '');

  var hasImageToLoad = !!img.src;

  if (hasImageToLoad) {
    img.onload = function () {
      var fe = frameElement;
      if (!iframeWidth && !iframeHeight) {

        fe.width = img.width;
        fe.height = img.height;

      } else if (!!iframeWidth && !iframeHeight) {
        // iframe width has been set.
        // scale image to fit specified width.
        // alter iframe height to same as image height
        fe.height = fitWidth(img, iframeWidth)[1];

      } else if (!!iframeHeight && !iframeWidth) {
        // iframe height has been set.
        // scale image to fit specified height.
        // alter iframe width to same as image width
        fe.width = fitHeight(img, iframeHeight)[0];

      } else {
        // both dimensions are set - do not alter iframe size at all.
        // if image to big for available space then reduce it to best fit 
        var w = img.width,
            h = img.height,
            wDiff = iframeWidth - w,
            widthIsClipped = wDiff < 0,
            hDiff = iframeHeight - h,
            heightIsClipped = hDiff < 0;
        if (widthIsClipped && heightIsClipped) {
          console.log(Math.min(wDiff, hDiff), wDiff, Math.min(wDiff, hDiff) === wDiff);
          if (Math.min(wDiff, hDiff) === hDiff) {
            fitWidth(img, iframeWidth);
          } else {
            fitHeight(img, iframeHeight);
          }
        // todo: do we align the image both horizontally and vertically according to available space?
        //       what if we are appending image to the parent frame - not to this frame?
        } else if (widthIsClipped) {
          fitWidth(img, iframeWidth);
        } else if (heightIsClipped) {
          fitWidth(img, iframeHeight);
        }
      }
    };



    img.onerror = function() {
      if (img) {
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }
        purge(img);
        img = null;
      }
      hideThisFrame();
      if (fallbackNodes) {
        for (var i = 0, x = fallbackNodes.length; i < x ; i += 1) {
          unhideElement(fallbackNodes[i]);
        }
      }
    };

    if (appendToParent) {
      frameElement.parentNode.insertBefore(img, frameElement.nextSibling);
      hideThisFrame();
    } else {
      document.body.appendChild(img);
    }

    if (!!fallbackSelector) {
      var fallbackContext;
      var firstChar = fallbackSelector.charAt(0);

      if (firstChar) {
        switch(firstChar) {
          case ':':
            fallbackSelector.replace(/^\:(\ +)?/, '');
            fallbackContext = window.parent.document.querySelector('#pageContainer .middleSection');
            break;
          case '=':
            fallbackSelector.replace(/^\=(\ +)?/, '');
            fallbackContext = window.frameElement.parentNode;
            break;
          default:
            fallbackContext = window.parent.document;
        };
        if (fallbackContext) {
          fallbackNodes = fallbackContext.querySelectorAll(fallbackSelector);
          if (fallbackNodes) {
            for (var i = 0, x = fallbackNodes.length; i < x ; i += 1) {
              hideElement(fallbackNodes[i]);
            }
          }
        }
      }
    }

  } else {
    console.log('HIDE THIS FRAME')
    hideThisFrame();
  }

  // make a bl.ocks.org example of how it works with a fallback
  // allow an optional stylesheet to pull in
  // when viewed in the preview frame write console.error messages to the preview frame.
  // todo: what about clever load decisions on poor connections?
}());
