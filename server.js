var SecretStack = require('secret-stack')
var caps = require('ssb-caps')
var ssbKeys = require('ssb-keys')

var path = require('path')

exports.init = function(dir) {
  var keys = ssbKeys.loadOrCreateSync(path.join(dir, 'secret'))

  var r = SecretStack({
    caps: { shs: Buffer.from(caps.shs, 'base64') },
    keys,
    connections: {
      outgoing: {
	net: [{ transform: 'shs' }],
	onion: [{ transform: 'shs' }],
	ws: [{ transform: 'shs' }],
      }
    },
    path: dir
  })
  .use(require('./ssb-db'))
  .use(require('./simple-ooo'))
  .use(require('ssb-onion'))
  .use(require('ssb-ws'))
  .use(require('ssb-ebt'))
  //.use(require('ssb-blobs'))
  ()

  r.blobs = require("./simple-blobs")(dir)

  return r
}
