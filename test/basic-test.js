
var assert = require('assert');
var FWalker = require('..');

var examplesDir = require('path').resolve(__dirname, 'examples');
var examplesFile = require('path').resolve(__filename);
var examplesNumOfDirs = 2;
var examplesNumOfFiles = 2;
var examplesNumOfBytes = 6;

function reallyReadTheReadStream(rs) {
  // Since NodeJS v0.10 and Streams2 we must subscribe to the data-event of
  // the file, or the end/close-event will not happen.
  rs.on('data', function(){});
}

describe('FWalker', function() {
  describe('Basics', function() {
    it('Exports one function', function() {
      assert.ok(FWalker instanceof Function);
    });
    it('That function creates an instances of a FWalker-class', function() {
      assert.ok(FWalker() instanceof Object);
    });
  });

  describe('Instances of a FWalker-class', function() {
    var fw;
    beforeEach(function() {
      fw = FWalker(examplesDir);
    });
    afterEach(function() {
      fw = null;
    });

    it('are instances of events.EventEmitter too', function() {
      assert.ok(fw instanceof require('events').EventEmitter);
    });
    it('are instances of fqueue', function() {
      assert.ok(fw instanceof require('fqueue'));
    });
    it('should have a .maxPending property <number>', function() {
      assert.ok(fw.maxPending!=null);
      assert.strictEqual(typeof fw.maxPending, 'number');
    });
    it('should have a .maxAttempts property <number>', function() {
      assert.ok(fw.maxAttempts!=null);
      assert.strictEqual(typeof fw.maxAttempts, 'number');
    });
    it('should have a .attemptTimeout property <number>', function() {
      assert.ok(fw.attemptTimeout!=null);
      assert.strictEqual(typeof fw.attemptTimeout, 'number');
    });
    it('should have a .matchRegExp property <number>', function() {
      assert.strictEqual(fw.matchRegExp, null);
    });
    it('should have a .recursive property <boolean>', function() {
      assert.strictEqual(fw.recursive, true);
    });
    it('should have a .walk() method', function() {
      assert.ok(fw.walk instanceof Function);
    });
    it('should have a .pause() method', function() {
      assert.ok(fw.pause instanceof Function);
    });
    it('should have a .resume() method', function() {
      assert.ok(fw.resume instanceof Function);
    });
    it('should have a .on() method', function() {
      assert.ok(fw.on instanceof Function);
    });

    describe('properties after a call to .walk()', function() {
      it('.pending must be 0', function(done) {
        fw.on('done', function() {
          assert.ok(fw.pending!=null);
          assert.strictEqual(typeof fw.pending, 'number');
          assert.strictEqual(fw.pending, 0);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('.paused must be false', function(done) {
        fw.on('done', function() {
          assert.ok(fw.paused!=null);
          assert.strictEqual(typeof fw.paused, 'boolean');
          assert.strictEqual(fw.paused, false);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('.dirs must be '+examplesNumOfDirs, function(done) {
        fw.on('done', function() {
          assert.ok(fw.dirs!=null);
          assert.strictEqual(typeof fw.dirs, 'number');
          assert.strictEqual(fw.dirs, examplesNumOfDirs);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('.files must be '+examplesNumOfFiles, function(done) {
        fw.on('done', function() {
          assert.ok(fw.files!=null);
          assert.strictEqual(typeof fw.files, 'number');
          assert.strictEqual(fw.files, examplesNumOfFiles);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('.total must be '+(examplesNumOfFiles+examplesNumOfDirs), function(done) {
        fw.on('done', function() {
          assert.ok(fw.total!=null);
          assert.strictEqual(typeof fw.total, 'number');
          assert.strictEqual(fw.total, (examplesNumOfFiles+examplesNumOfDirs));
        });
        fw.on('done', done);
        fw.walk();
      });

      it('.bytes must be '+examplesNumOfBytes, function(done) {
        fw.on('done', function() {
          assert.ok(fw.bytes!=null);
          assert.strictEqual(typeof fw.bytes, 'number');
          assert.strictEqual(fw.bytes, examplesNumOfBytes);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('.errors must be 0', function(done) {
        fw.on('done', function() {
          assert.ok(fw.errors!=null);
          assert.strictEqual(typeof fw.errors, 'number');
          assert.strictEqual(fw.errors, 0);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('.attempts must be 0', function(done) {
        fw.on('done', function() {
          assert.ok(fw.attempts!=null);
          assert.strictEqual(typeof fw.attempts, 'number');
          assert.strictEqual(fw.attempts, 0);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('.streamed must be 0 if no listener for stream-event', function(done) {
        fw.on('done', function() {
          assert.ok(fw.streamed!=null);
          assert.strictEqual(typeof fw.streamed, 'number');
          assert.strictEqual(fw.streamed, 0);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('.streamed must be '+examplesNumOfFiles+' if listener for stream-event', function(done) {
        fw.on('stream', function(rs){
          reallyReadTheReadStream(rs);
        });
        fw.on('done', function() {
          assert.ok(fw.streamed!=null);
          assert.strictEqual(typeof fw.streamed, 'number');
          assert.strictEqual(fw.streamed, examplesNumOfFiles);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('.open must be 0 if listener for stream-event', function(done) {
        fw.on('stream', function(rs){
          reallyReadTheReadStream(rs);
        });
        fw.on('done', function() {
          assert.ok(fw.open!=null);
          assert.strictEqual(typeof fw.open, 'number');
          assert.strictEqual(fw.open, 0);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('.detectedMaxOpen must be -1 if listener for stream-event', function(done) {
        fw.on('stream', function(rs){
          reallyReadTheReadStream(rs);
        });
        fw.on('done', function() {
          assert.ok(fw.detectedMaxOpen!=null);
          assert.strictEqual(typeof fw.detectedMaxOpen, 'number');
          assert.strictEqual(fw.detectedMaxOpen, -1);
        });
        fw.on('done', done);
        fw.walk();
      });
    });

    describe('events after .walk()', function() {

      it('"done" event with 0 arguments', function(done) {
        fw.on('done', function() {
          assert.strictEqual(arguments.length, 0);
          done();
        });
        fw.walk();
      });

      it('"dir" event with 3 arguments', function(done) {
        var fired = 0;
        fw.on('dir', function(p, s, fullPath) {
          assert.strictEqual(arguments.length, 3);
          assert.ok(p instanceof String || typeof p === 'string', 'Type or instance of string');
          assert.ok(s instanceof require('fs').Stats, 'Instance of fs.Stats');
          assert.ok(fullPath instanceof String || typeof fullPath === 'string', 'Type or instance of string');
          fired += 1;
        });
        fw.on('done', function() {
          assert.strictEqual(fired, examplesNumOfDirs);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('"file" event with 3 arguments', function(done) {
        var fired = 0;
        fw.on('file', function(p, s, fullPath) {
          assert.strictEqual(arguments.length, 3);
          assert.ok(p instanceof String || typeof p === 'string', 'Type or instance of string');
          assert.ok(s instanceof require('fs').Stats, 'Instance of fs.Stats');
          assert.ok(fullPath instanceof String || typeof fullPath === 'string', 'Type or instance of string');
          fired += 1;
        });
        fw.on('done', function() {
          assert.strictEqual(fired, examplesNumOfFiles);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('"stream" event with 4 arguments', function(done) {
        var fired = 0;
        fw.on('stream', function(rs, p, s, fullPath) {
          assert.strictEqual(arguments.length, 4);
          assert.ok(rs instanceof require('fs').ReadStream, 'Instance of fs.ReadStream');
          assert.ok(p instanceof String || typeof p === 'string', 'Type or instance of string');
          assert.ok(s instanceof require('fs').Stats, 'Instance of fs.Stats');
          assert.ok(fullPath instanceof String || typeof fullPath === 'string', 'Type or instance of string');
          fired += 1;
          reallyReadTheReadStream(rs);
        });
        fw.on('done', function() {
          assert.strictEqual(fired, examplesNumOfFiles);
        });
        fw.on('done', done);
        fw.walk();
      });

      it('"pause" event with 0 arguments', function(done) {
        var fired = 0;
        fw.on('pause', function() {
          assert.strictEqual(arguments.length, 0);
          fw.resume();
          fired += 1;
        });
        fw.on('done', function() {
          assert.strictEqual(fired, 1);
        });
        fw.on('done', done);
        fw.walk();
        fw.pause();
      });

      it('"resume" event with 0 arguments', function(done) {
        var fired = 0;
        fw.on('pause', function() {
          fw.resume();
        });
        fw.on('resume', function() {
          assert.strictEqual(arguments.length, 0);
          fired += 1;
        });
        fw.on('done', function() {
          assert.strictEqual(fired, 1);
        });
        fw.on('done', done);
        fw.walk();
        fw.pause();
      });
    });

    describe('.pause() and .resume()', function() {
      it('"done" event must fire if they play ping-pong', function(done) {
        var fired = 0;
        fw.on('pause', function() {
          fw.resume();
          fired += 1;
        });
        fw.on('resume', function() {
          fw.pause();
          fired += 1;
        });
        fw.on('done', function() {
          assert.ok(fired > 1);
        });
        fw.on('done', done);
        fw.walk();
        fw.pause();
      });
    });
  });

  describe('feature: FWalker on a path to a file', function() {
    var fw;
    before(function() {
      fw = FWalker(examplesFile);
    });
    after(function() {
      fw = null;
    });

    it('emits the "stream", "file" and "done" event', function(done) {
      fw.on('dir', function() {
        assert.ok(false, '"dir" event must not fire');
      });
      fw.on('file', function(p, s, fullPath) {
        assert.strictEqual(arguments.length, 3);
        assert.ok(p instanceof String || typeof p === 'string', 'Type or instance of string');
        assert.ok(s instanceof require('fs').Stats, 'Instance of fs.Stats');
        assert.ok(fullPath instanceof String || typeof fullPath === 'string', 'Type or instance of string');
      });
      fw.on('stream', function(rs, p, s, fullPath) {
        assert.strictEqual(arguments.length, 4);
        assert.ok(rs instanceof require('fs').ReadStream, 'Instance of fs.ReadStream');
        assert.ok(p instanceof String || typeof p === 'string', 'Type or instance of string');
        assert.ok(s instanceof require('fs').Stats, 'Instance of fs.Stats');
        assert.ok(fullPath instanceof String || typeof fullPath === 'string', 'Type or instance of string');
        reallyReadTheReadStream(rs);
      });
      fw.on('done', function() {
        assert.strictEqual(arguments.length, 0);
      });
      fw.on('done', done);
      fw.walk();
    });
  });

  describe('feature: non-recursive walking', function() {
    var fw;
    beforeEach(function() {
      fw = FWalker(examplesDir, {recursive: false});
    });
    afterEach(function() {
      fw = null;
    });

    it('computes correctly on "done"', function(done) {
      fw.on('done', function() {
        assert.strictEqual(this.total, 2, 'total');
        assert.strictEqual(this.dirs,  1, 'dirs');
        assert.strictEqual(this.files, 1, 'files');
        done();
      });
      fw.walk();
    });

  });

  describe('feature: use given readStream options', function() {
      var myHighWaterMark = 1024*1024;
      var fw;
      beforeEach(function() {
        fw = FWalker(examplesFile, { readStream: { highWaterMark: myHighWaterMark } } );
      });
      afterEach(function() {
        fw = null;
      });
      it('when "stream", it should be using the given readStream option', function(done) {
        fw.on('stream', function(rs, p, s, fullPath) {
          assert.strictEqual( fw.readStream.highWaterMark, myHighWaterMark );
          assert.strictEqual( fw.readStream.highWaterMark, rs._readableState.highWaterMark );
          reallyReadTheReadStream(rs);
        });
        fw.on('done', done);
        fw.walk();
      });

  });
});
