var FWalker = require('..');
var assert = require('assert');
var path = require('path');
var memfs = require('memfs');
var fs = memfs.fs;

describe('FWalker', function() {

    var currDir = path.normalize(process.cwd());

    var a = path.join(currDir, 'a');
    var a_f1 = path.join(a, 'a-f1.txt');
    var a_f2 = path.join(a, 'a-f2.txt');

    var a_a = path.join(a, 'a_a');
    var a_a_f1 = path.join(a_a, 'a-a-f1.txt');
    var a_a_f2 = path.join(a_a, 'a-a-f2.txt');

    var a_a_a = path.join(a_a, 'a_a_a');
    var a_a_a_f1 = path.join(a_a, 'a-a-a-f1.txt');
    var a_a_a_f2 = path.join(a_a, 'a-a-a-f2.txt');

    var b = path.join(currDir, 'b');
    var b_f1 = path.join(a, 'b-f1.txt');
    var b_f2 = path.join(a, 'b-f2.txt');

    var b_b = path.join(a, 'b_b');
    var b_b_f1 = path.join(a_a, 'b-b-f1.txt');
    var b_b_f2 = path.join(a_a, 'b-b-f2.txt');

    var b_b_b = path.join(a_a, 'b_b_b');
    var b_b_b_f1 = path.join(a_a, 'b-b-b-f1.txt');
    var b_b_b_f2 = path.join(a_a, 'b-b-b-f2.txt');

    var c = path.join(currDir, 'c');


    fs.mkdirSync( currDir, { recursive: true } ); // Synchronize with the current dir

    fs.mkdirSync( a );
    fs.writeFileSync( a_f1, 'hello1' );
    fs.writeFileSync( a_f2, 'hello2' );
    fs.mkdirSync( a_a );
    fs.writeFileSync( a_a_f1, 'hello1' );
    fs.writeFileSync( a_a_f2, 'hello2' );
    fs.mkdirSync( a_a_a );
    fs.writeFileSync( a_a_a_f1, 'hello1' );
    fs.writeFileSync( a_a_a_f2, 'hello2' );

    fs.mkdirSync( b );
    fs.writeFileSync( b_f1, 'hello1' );
    fs.writeFileSync( b_f2, 'hello2' );
    fs.mkdirSync( b_b );
    fs.writeFileSync( b_b_f1, 'hello1' );
    fs.writeFileSync( b_b_f2, 'hello2' );
    fs.mkdirSync( b_b_b );
    fs.writeFileSync( b_b_b_f1, 'hello1' );
    fs.writeFileSync( b_b_b_f2, 'hello2' );

    fs.mkdirSync( c );



    it('works with a different fs', function( done ) {
        FWalker( currDir, { fs: fs } )
            .on('done', function( ) {
                assert.strictEqual( this.dirs, 8 ); // current + 7 sub dirs
                assert.strictEqual( this.files, 12 ); // 2 in each of 6 sub dirs
                done();
            })
            .walk();
    });



    it('counts recursive dirs correclty when recursive is false', function( done ) {
        FWalker( currDir, { fs: fs, recursive: false } )
            .on('done', function( ) {
                assert.strictEqual( this.dirs, 1 ); // current only
                assert.strictEqual( this.files, 0 );
                done();
            })
            .walk();
    });

});