module.exports = catLines

var fs = require("fs")
var split = require("split")
var splice = require("../")
var map = require("through2-map")

function catLines(filename, options) {
  var rs = fs.createReadStream(filename, options)
  var reAddNewline = map(function (chunk) { return chunk.toString() + "\n" })

  return splice(rs, split(), reAddNewline)
}