module.exports = splice

var Transform = require("stream").Transform
  || require("readable-stream/transform")

function splice() {
  var streams = [].slice.call(arguments)
  if (streams.length == 0) throw new Error("No streams provided to splice")
  if (streams.length == 1) return streams[0]

  var first = streams[0]
  var last = streams.reduce(function join(prev, curr) {
    return prev.pipe(curr)
  })

  first.pipe = function (destination, options) {
    Transform.prototype.pipe.call(last, destination, options)
    return destination
  }

  return first
}
