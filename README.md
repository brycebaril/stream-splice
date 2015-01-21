stream-splice
=====

[![NPM](https://nodei.co/npm/stream-splice.svg)](https://nodei.co/npm/stream-splice/)

Compose multi-step streams into a single pipeline segment.

E.g. your transform module is actually two consecutive transform operations, but you want it exposed as a single "stream.Transform" object.

```javascript
// In your module
module.exports = tx
var filter = require("through2-filter")
var map = require("through2-map")
var splice = require("stream-splice")

function tx() {
  var noBs = filter(function (chunk) { return /[^bB]/.exec(chunk) })
  var uc = map(function (chunk) { return chunk.toString().toUpperCase() })
  var zz = map(function (chunk) { return chunk.toString() + "z" })

  return splice(noBs, uc, zz)
}

// Using your module:
var tx = require("my-module")

source.pipe(tx()).pipe(/* ... */)

// That is equivalent to:
source.pipe(noBs)
  .pipe(uc)
  .pipe(zz)
  .pipe(/* ... */)

// A less contrived example:
// catLines is equivalent to fs.createReadStream except stream chunks
// will be the lines of the file
module.exports = catLines

var fs = require("fs")
var split = require("split")
var map = require("through2-map")
var splice = require("stream-splice")

function catLines(filename, options) {
  var rs = fs.createReadStream(filename, options)
  var reAddNewline = map(function (chunk) { return chunk.toString() + "\n" })
  return splice(rs, split(), reAddNewline)
}


```

API
===

`splice(stream1 [,stream2] [,...streamN])`
---

Creates a pipeline that can be piped into/out of which is composed of all of the spliced streams piped together.

E.g.

```javascript
source.pipe(splice(a, b, c)).pipe(drain)

// is roughly equivalent to

source.pipe(a)
  .pipe(b)
  .pipe(c)
  .pipe(drain)

```

Error Handling:
---

Just like `pipe`, `splice` does **NOT** attempt to do error forwarding. Sure, it could do something where all the errors in the pipeline are forwarded onto the topmost stream, however this would create a hidden requirement of code organization where your error handlers would have to be above the `splice` call to avoid double-handled errors.

So do this:
```js
a.on("error", someErrHandler)
b.on("error", someErrHandler)
c.on("error", someErrHandler)

source.pipe(splice(a, b, c)).pipe(drain)
```

This will let you keep the maximum flexibility with your error handling.

LICENSE
=======

MIT
