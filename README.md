# SSB browser demo

Small playground for ssb in a browser. This was made as a demo for my
bornhack talk. It plays around with only getting the last few `post`
messages for users as a way of onboarding users quickly. It can
download and index around 5k messages in 30 seconds on my really slow
laptop. For this a blob (generate-onboarding-json.js) must be provided
that serves as a trusted onboard mechanism and as such should only be
used between friends.

The code is really rough especially the UI code. The backend is not a
full ssb implementation, it only implements the features needed for
this demo.

This is a playground (for me!) so please treat it as such :-) I'm not
interested in a fully working client.

Things that work:
 - viewing posts and threads
 - posting and replying to messages
 - private messages including private blobs
 - ooo messages

Tested in Chrome which provides a file api.

Chrome needs to be run with: --allow-file-access-from-files to work!

Also be sure to enable all 3 WASM options in
chrome://flags/. Otherwise crypto will be super slow (like validate).

The following patches from the patches folder are needed:
 - flumeview-level-mkdirp.patch
 - ssb-ebt.patch

The following branches are references directly until patches are merged and pushed:
 - https://github.com/dominictarr/flumelog-aligned-offset/pull/1
 - https://github.com/flumedb/flumeview-level/pull/22
 - https://github.com/ssbc/ssb-validate/pull/16

For a smaller bundle file, you can also apply
patches/sodium-browserify.patch

# Server

Server needs to have ws enabled. Futhermore as a test I've used the
https://github.com/arj03/ssb-get-thread plugin. This is not needed for
initial sync but only for browsing threads.

# Onboarding file

Generate a file of all feeds following with seq nos. The perspective
(user) can be changed in top.

```
node generate-onboarding-json.js > onboard.json
```

Add it as a blob to the network:

```
cat onboard.json | ../ssb-minimal-pub-server/bin.js blobs.add
```

=> something like

&Y2F+H91zVsblcW43KY3OdyI3yiu5H4iydRcysSpnTGc=.sha256

# Force WASM locally (outside browser)

rm -rf node_modules/sodium-chloride/

# browserify 2mb

Removing blobs means that we go down to 1.6mb. ssb-backlinks brings
this back to 2mb because of level.

browserify --full-paths core.js > bundle-core.js
browserify --full-paths browser-test.js > bundle-test.js

ssb-markdown increases the size quite substantially

## uglifyify

browserify --full-paths -g uglifyify -p common-shakeify core.js > bundle-core.js
browserify --full-paths -g uglifyify -p common-shakeify browser-test.js > bundle-test.js

=> 1.2mb

# Other

## check contents of db

```
var pull = require("pull-stream")

pull(
  store.stream(),
  pull.drain((msg) => {
    console.log(msg)
  })
)
```

List all files in browser

``` javascript
function listDir(fs, path)
{
	fs.root.getDirectory(path, {}, function(dirEntry){
		var dirReader = dirEntry.createReader();
		dirReader.readEntries(function(entries) {
		for(var i = 0; i < entries.length; i++) {
			var entry = entries[i];
			if (entry.isDirectory) {
				console.log('Directory: ' + entry.fullPath);
				listDir(fs, entry.fullPath)
			}
			else if (entry.isFile)
                console.log('File: ' + entry.fullPath);
			}
		})
	})
}

window.webkitRequestFileSystem(window.PERSISTENT, 0, function (fs) {
	listDir(fs, '/.ssb-lite/')
})
```

## indexes

Backlinks & query uses flumeview-level that stores it's db in indexdb
in the browser. These indexes are much slower in the browser.

## oasis

%owvZa0OwPBH2olaKUiex1wqyBO/+AeBlxEHcH7jORtA=.sha256

## mcss generate css

mcss plugs/app/page/books.mcss -o books.css
