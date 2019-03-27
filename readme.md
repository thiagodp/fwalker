
# fwalker

> Fast and rock-solid asynchronous traversing of directories and files for NodeJS

[![Build Status](https://secure.travis-ci.org/thiagodp/fwalker.png)](http://travis-ci.org/thiagodp/fwalker)

This library is a fork of [oleics/node-filewalker](https://github.com/oleics/node-filewalker), created by [Oliver Leics](https://github.com/oleics/node-filewalker#mit-license). Since `node-filewalker` is not maintained anymore, I decided to continue its development here.

This library is designed to provide maximum
reliance paired with maximum throughput/performance.

## Installation

```bash
npm install --save fwalker
```

## Usage

Simple directory listing and disk-usage report:

```js
var fwalker = require('fwalker');

fwalker('.')
  .on('dir', function(p) {
    console.log('dir:  %s', p);
  })
  .on('file', function(p, s) {
    console.log('file: %s, %d bytes', p, s.size);
  })
  .on('error', function(err) {
    console.error(err);
  })
  .on('done', function() {
    console.log('%d dirs, %d files, %d bytes', this.dirs, this.files, this.bytes);
  })
.walk();
```

Calculate md5-hash for every file:

```js
var started = Date.now();

var createHash = require('crypto').createHash,
    fwalker = require('fwalker');

var options = {
  maxPending: 10, // throttle handles
};

fwalker('/', options)
  .on('stream', function(rs, p, s, fullPath) {
    var hash = createHash('md5');
    rs.on('data', function(data) {
      hash.update(data);
    });
    rs.on('end', function(data) {
      console.log(hash.digest('hex'), ('                '+s.size).slice(-16), p);
    });
  })
  .on('error', function(err) {
    console.error(err);
  })
  .on('done', function() {
    var duration = Date.now()-started;
    console.log('%d ms', duration);
    console.log('%d dirs, %d files, %d bytes', this.dirs, this.files, this.bytes);
  })
.walk();
```

## `FWalker` pseudo-class

Inherits from [node-fqueue](https://github.com/oleics/node-fqueue).

### Options

#### `maxPending`

- Default: `-1`
- Maximum asynchronous jobs. Useful to throttle the number of simultaneous disk-operations.

#### `maxAttempts`
- Default: `3`
- Maximum reattempts on error.
- Set to `0` to disable reattempts.
- Set to `-1` for infinite reattempts.

#### `attemptTimeout`
- Default: `5000` ms
- Minimum time to wait before reattempt, in milliseconds.
- Useful to let network-drives remount, etc.

#### `matchRegExp`
- Default: `null`
- A RegExp-instance the path to a file must match in order to emit a "file" event.
- Set to `null` to emit all paths.

#### `recursive`
- Default: `true`
- Traverse in a recursive manner.
- In case you wish to target only the current directory, disable this.

#### `readStream`
- Default: `fs.createReadStream()`'s [default values](https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options)
- New in `fwalker` (it does not exist in node-filewalker)
- Allow to handle streams better. For example, the following configuration allows to read a text file from a range of bytes:
```javascript

var options = {
  // will read from byte 90 to 99
  readStream: {
    start: 90,
    end: 99
  },
  // from simple.txt
  matchRegExp: /simple\.txt/
};

fwalker( '.', options )
  ...
```

#### `fs`
- Default: `fs` from NodeJS
- New in `fwalker` (it does not exist in node-filewalker)
- Allow to use a filesystem library different from [fs](https://nodejs.org/api/fs.html), such as [memfs](https://github.com/streamich/memfs).
- Allow to use in-memory filesystems.
- Very useful for testing purposes.


### Properties

```
maxPending
maxAttempts
attemptTimeout
matchRegExp

pending
dirs
files
total
bytes
errors
attempts
streamed
open
detectedMaxOpen
```

### Methods

```javascript
walk()
pause()
resume()
```

### Events

- file
  - relative path
  - fs.Stats instance
  - absolute path
- dir
  - relative path
  - fs.Stats instance
  - absolute path
- stream
  - fs.ReadStream instance
  - relative path
  - fs.Stats instance
  - absolute path
- pause
- resume
- done
- error
  - instance of Error

**Notice**: There will be no `fs.ReadStream` created if no listener listens to the 'stream'-event.

## License

[MIT](https://opensource.org/licenses/MIT) (c) [Thiago Delgado Pinto](https://github.com/thiagodp/) and [Oliver Leics](https://github.com/oleics)
