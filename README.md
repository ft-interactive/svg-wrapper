svg-wrapper
===========

Load an SVG or define an image as a fallback.

## Usage

Example

```html

<iframe src="http://{hostname}/svg-wrapper/img.html#http://example.com/mygraphic.svg__.thing-to-hide__true__ff0000" width="100" height="0" scrolling="no" frameborder="0"></iframe>
```

In the iframe above you will notice that parameters to the SVG wrapper are provided via the hash/fragment. The has is used to improve caching.

Parameters are separated by a double underscore (`__`) and recognised by their position, for example the first param is the SVG url and the second is the fallback. If you dont want to provide a value for a particular param then you need to use 4 underscores (`____`). Therefore in the example above the SVG wrapper is being passed four parameters:

- `http://example.com/mygraphic.svg` The SVG url
- `.thing-to-hide` The fallback element
- `true` True if you want to append the SVG to the parent window or keep it contained in the iframe
- `ff0000` The background colour of the SVG - defaults to FT pink


### Params

#### 0 : Full absolute URL to the SVG (including `http://`). 

- Accepts a string
- If SVG is supported or the image fails to load then the fallback value will be used (see below).
- This parameter is mandatory. If no absolute URL is passed then the iframe will be hidden and an error message will be printed in the console.

#### 1 : Fallback content.

- Accepts a string
- This can be an absolute URL to an non-svg image or a CSS selector string to find elements on the parent window.
- If this value is a CSS selector then the matching elements will be hidden when the SVG successfully loads.
- This parameter is mandatory. Without a value the iframe is hidden and an error message will be printed in the console.
- If you want to make selectors a little bit more specific then you can prefix the selector with one of the following special characters
  * `:` will scope the selector to the ft.com element `#pageContainer .middleSection`
  * `=` will scope the selector to the svg-wrapper's parent window.

#### 2 : Append to parent window


- accepts a boolean
- defaults to `false`
- if `false` the SVG (or it's fallback image src) is loaded into the iframe of the SVG wrapper
- if `true` the SVG is inserted into the parent window immediately after the SVG wrapper's iframe element (i.e it will be the next sibling)

#### 3: Background color

- accepts a hex string. you dont need the '#' at the beginning.
- defaults to FT pink: `fff1e0`

### iframe dimensions**

The iframe's dimensions are used to set the size of the SVG (or the fallback image) nicely scaling the image automatically.

If one or either of the dimensions are `0` (or not defined) then these will automatically be calculated.

You can either use the `width` or `height` attributes or an inline style on the iframe e.g. `style="width:0;height:100px;"`.

If the SVG is being loaded into the iframe (rather than the parent window) then both the iframe and the image inside it will be the same size.

Examples:

`width="100" height="0"` : the SVG will be scaled so that it's 100px wide and the height will be set to whatever it needs to be to maintain the SVG's aspect ratio.

`width="0" height="100"` : the SVG will be scaled so that it's 100px high and the width will be set to whatever it needs to be to maintain the SVG's aspect ratio.

`width="0" height="0"` : the SVG (and the parent iframe) will be set to whatever the original dimension of the graphic are.

`width="100" height="100"` : the SVG (and the parent iframe) will resized to best fit the defined dimensions will maintaining aspect ratio.


