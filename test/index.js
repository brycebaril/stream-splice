var test = require("tape").test

var spigot = require("stream-spigot")
var filter = require("through2-filter")
var map = require("through2-map")
var concat = require("concat-stream")
var through2 = require("through2")
var splice = require("../")

test("init", function (t) {
  t.plan(2)
  t.ok(splice, "loaded splice")
  t.equals(typeof splice, "function", "And it is a function")
})

test("edge cases", function (t) {
  t.throws(splice, "Splice with no args throws")
  var source = spigot(["a", "b", "c"])
  t.equals(splice(source), source, "Splicing a single stream is a noop")
  t.end()
})

test("two transforms", function (t) {
  t.plan(2)

  var source = spigot(["a", "b", "c"])

  function collect(results) {
    t.equals(results.toString(), "AC", "Both streams ran")
  }

  var noBs = filter(function (chunk) { return /[^b]/.exec(chunk) })

  var uc = map(function (chunk) { return chunk.toString().toUpperCase() })

  var pipeline = splice(noBs, uc)

  t.equal(pipeline, noBs, "pipeline is actually the first stream")

  source.pipe(pipeline).pipe(concat(collect))
})

test("2 + 1 transforms", function (t) {
  t.plan(2)

  var source = spigot(["a", "b", "c"])

  function collect(results) {
    t.equals(results.toString(), "AzCz", "All three streams ran")
  }

  var noBs = filter(function (chunk) { return /[^b]/.exec(chunk) })

  var uc = map(function (chunk) { return chunk.toString().toUpperCase() })

  var zz = map(function (chunk) { return chunk.toString() + "z" })

  var pipeline = splice(noBs, uc)

  t.equal(pipeline, noBs, "pipeline is actually the first stream")

  source.pipe(pipeline)
    .pipe(zz)
    .pipe(concat(collect))
})

test("three transforms", function (t) {
  t.plan(2)

  var source = spigot(["a", "b", "c"])

  function collect(results) {
    t.equals(results.toString(), "AzCz", "All three streams ran")
  }

  var noBs = filter(function (chunk) { return /[^b]/.exec(chunk) })

  var uc = map(function (chunk) { return chunk.toString().toUpperCase() })

  var zz = map(function (chunk) { return chunk.toString() + "z" })

  var pipeline = splice(noBs, uc, zz)

  t.equal(pipeline, noBs, "pipeline is actually the first stream")

  source.pipe(pipeline).pipe(concat(collect))
})

test("readable + transform", function (t) {
  t.plan(2)

  var source = spigot(["a", "b", "c"])

  function collect(results) {
    t.equals(results.toString(), "ABC", "Both streams ran")
  }

  var uc = map(function (chunk) { return chunk.toString().toUpperCase() })

  var pipeline = splice(source, uc)

  t.equal(pipeline, source, "pipeline is actually the first stream")

  pipeline.pipe(concat(collect))
})

test("errors", function (t) {
  t.plan(1)
  var source = spigot(["a", "b", "c"])
  var noop = through2()

  var i = 0
  var tx = through2(function _w(chunk, encoding, callback) {
    if (++i == 2) {
      return callback(new Error("CRASH"))
    }
    callback(null, chunk)
  })


  source.on("error", function (err) {
    t.fail("no error here")
  })
  noop.on("error", function (err) {
    t.fail("no error here")
  })
  tx.on("error", function (err) {
    t.ok(err instanceof Error, "error is an Error")
  })
  function collect(results) {
    t.fail("stream not finished because of error")
  }

  var pipeline = splice(source, noop, tx)
  pipeline.pipe(concat(collect))
})
