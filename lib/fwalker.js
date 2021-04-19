module.exports = FWalker;

var fs = require('fs'),
	path = require('path'),
	util = require('util'),
	FunctionQueue = require('fqueue'),
	immediately = process.nextTick;

if (global.setImmediate !== undefined) {
	immediately = global.setImmediate;
}

var lstat = process.platform === 'win32' ? 'stat' : 'lstat';

function FWalker(root, options) {
	if (!(this instanceof FWalker)) return new FWalker(root, options);

	FunctionQueue.call(this, options);

	var self = this;

	this.matchRegExp = null;

	this.recursive = true;

	options = options || {};

	var readStreamOptions = {
		flags: 'r',
		encoding: null,
		fd: null,
		mode: 0666,
		autoClose: true,
		highWaterMark: 64 * 1024
	};

	if (!options.readStream) {
		options.readStream = readStreamOptions;
	} else {
		// Overwrite only the specified properties
		for (var i in options.readStream) {
			readStreamOptions[i] = options.readStream[i];
		}
		options.readStream = readStreamOptions;
	}

	this.readStream = options.readStream;

	// Copy all the options properties to this, except 'readStream'
	Object.keys(options).forEach(function(k) {
		if (self.hasOwnProperty(k)) {
			self[k] = options[k];
		}
	});

	self.fs = options.fs || fs;

	this.root = path.resolve(root || '.');
}
util.inherits(FWalker, FunctionQueue);

FWalker.prototype._path = function(p) {
	if (path.relative) {
		return path.relative(this.root, p).split('\\').join('/');
	} else {
		return p.substr(this.root.length).split('\\').join('/');
	}
};

FWalker.prototype._stat = function(p) {
	var self = this;

	this.fs[lstat](p, function(err, s) {
		if (err) {
			self.error(err, self._stat, [ p ]);
		} else {
			if (s.isDirectory()) {
				self.enqueue(self._emitDir, [ self._path(p), s, p ]);
			} else {
				self.enqueue(self._emitFile, [ self._path(p), s, p ]);
			}
		}
		self.done();
	});
};

FWalker.prototype._emitDir = function(p, s, fullPath) {

  var self = this;

	if ( ! this.recursive && this.dirs > 0) { // Current dir only
    immediately(function() {
      self.done();
    });
		return;
	}

  this.total += 1;
	this.dirs += 1;
	this.emit('dir', p, s, fullPath);

	this.fs.readdir(fullPath, function(err, entries) {
		if (err) {
			self.error(err, self._emitDir, [ p, s, fullPath ]);
		} else {
			entries.forEach(function(entry) {
				self.enqueue(self._stat, [ path.join(fullPath, entry) ]);
			});
		}
		self.done();
	});
};

FWalker.prototype._emitFile = function(p, s, fullPath) {

  this.total += 1;
	this.files += 1;
	this.bytes += s.size;
	this.emit('file', p, s, fullPath);

	if (this.listeners('stream').length !== 0) {
		this.enqueue(this._emitStream, [ p, s, fullPath ]);
	}

	var self = this;
	immediately(function() {
		self.done();
	});
};

FWalker.prototype._emitStream = function(p, s, fullPath) {
	this.open += 1;
	var rs = this.fs.ReadStream(fullPath, this.readStream);

	var self = this;

	// retry on any error
	rs.on('error', function(err) {
		// handle "too many open files" error
		if ('EMFILE' == err.code || ('OK' == err.code && 0 === err.errno)) {
			if (self.open - 1 > self.detectedMaxOpen) {
				self.detectedMaxOpen = self.open - 1;
			}
			self.enqueue(self._emitStream, [ p, s, fullPath ]);
		} else {
			self.error(err, self._emitStream, [ p, s, fullPath ]);
		}

		self.open -= 1;
		self.done();
	});

	rs.on('close', function() {
		self.streamed += 1;
		self.open -= 1;
		self.done();
	});

	this.emit('stream', rs, p, s, fullPath);
};

FWalker.prototype.walk = function() {
	this.dirs = 0;
	this.files = 0;
	this.total = 0;
	this.bytes = 0;

	this.streamed = 0;
	this.open = 0;
	this.detectedMaxOpen = -1;

	this.queue = [];

	this.start(this._stat, [ this.root ]);
	return this;
};
