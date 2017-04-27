var recursive = require('recursive-readdir');
var ExifImage = require('exif').ExifImage;
var async = require('async');
var mysql = require('mysql');
var sharp = require('sharp');
var fs = require("q-io/fs");
var request = require('request');
var dms2dec = require('dms2dec');

var indexPath = "/mnt/SMB/DigitalCameraBilder/";

// Start server for frontend
var server = require('./server');

var pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'Photos'
});

console.log("Gathering list of files in directory");

function insertImage(path, exifData, width, height, callback) {
    pool.query('INSERT INTO photos (path, time, width, height) VALUES (?,?,?,?)',
        [path, exifData.exif.CreateDate, width, height],
        function (error, results, fields) {
            if (error) {
                // On error, aka when the image has already been indexed, update the entry
                console.log(path, "already in database");
                pool.query('UPDATE photos SET time=?, width=?, height=? WHERE path=?',
                    [exifData.exif.CreateDate, width, height, path],
                    function (error, results, fields) {
                        if (error) console.log(error);
                        else console.log(path, 'image data updated');
                        callback();
                    });
            } else {
                callback();
            }
        });
}

function indexImage(file, cb) {
    console.log("Indexing file ", file);
    fs.read(file, "b").then(function (content) {

        async.waterfall([
            function (callback) {
                // Get exif data from image
                new ExifImage({image: content}, function (error, exifData) {
                    callback(null, error, exifData)
                });
            },
            function (error, exifData, callback) {
                if (error) return callback(null, error, exifData);
                sharp(content).metadata()
                    .then(function (info) {
                        var img_width = info.width;
                        var img_height = info.height;

                        insertImage(file, exifData, img_width, img_height, function () {
                            callback(null, error, exifData)
                        });
                    });
            },
            function (error, exifData, callback) {
                if (error) return callback(null, error, exifData, 0);

                pool.query('SELECT * FROM photos where path=? ', [file], function (error, results, fields) {
                    if (error) console.log(error);
                    var img_id = results[0]['id'];

                    // Index metadata for images
                    for (var type in exifData) {
                        for (var tag in exifData[type]) {
                            pool.query('SELECT * FROM exif where photo_id=? and entry=?',
                                [img_id, tag],
                                function (error, results, fields) {
                                    if (error) console.log(error);
                                    if (!results[0]) {
                                        pool.query('INSERT INTO exif (photo_id, entry, value) VALUES (?,?,?)',
                                            [img_id, tag, exifData[type][tag]],
                                            function (error, results, fields) {
                                                if (error) console.log(error);
                                            });
                                    }
                                });
                        }
                    }

                    // Generate thumnails for images
                    // Render HQ thumbnail
                    sharp(content)
                        .resize(500)
                        .quality(75)
                        .toFile('thumbnails/' + img_id + '.jpg', function (err, info) {
                            if (err) console.log(err);
                            console.log('Rendering of thumnail for ' + file + ' complete');
                            callback(null, error, exifData, img_id)
                        });
                });
            },
            function (error, exifData, img_id, callback) {
                if (error) return callback(null, error, img_id, exifData);

                if (exifData.gps !== undefined && exifData.gps.GPSLatitude !== undefined) {
                    var gps = exifData.gps;
                    var dec = dms2dec(gps.GPSLatitude, gps.GPSLatitudeRef, gps.GPSLongitude, gps.GPSLongitudeRef);
                    var lat = dec[0];
                    var long = dec[1];

                    // Get location name via GeoNames
                    //http://api.geonames.org/findNearbyPlaceNameJSON?lat=$latitude&lng=$longitude&username=robinp
                    request('http://api.geonames.org/findNearbyPlaceNameJSON?lat=' + lat + '&lng=' + long + '&username=mysunland', function (error, response, body) {
                        var geonames = JSON.parse(body);
                        if (geonames.geonames) {
                            if (geonames.geonames[0] !== undefined) {
                                place_name = geonames.geonames[0].name;
                                place_countryName = geonames.geonames[0].countryName;
                                place_countryCode = geonames.geonames[0].countryCode;
                                place_adminCode = geonames.geonames[0].adminCode1;
                                place_adminName = geonames.geonames[0].adminName1;

                                pool.query('INSERT INTO location (photo_id, countryName, countryCode, adminCode, adminName, name) VALUES (?,?,?,?,?,?)',
                                    [img_id, place_countryName, place_countryCode, place_adminCode, place_adminName, place_name],
                                    function (error, results, fields) {
                                        if (error) console.log(error);
                                        callback(null, error, img_id, exifData);
                                    });

                                console.log(place_name);
                            }
                        }
                    });

                } else {
                    callback(null, error, img_id, exifData);
                }
            },
            function (error, exifData, img_id, callback) {
                if (error) return callback(null, error, img_id, exifData);

                callback(null, error, img_id, exifData);
            }
        ], cb);
    });
}

async.waterfall([
    function (callback) {
        callback(null, indexPath)
    },
    recursive,
    function (files, cb) {
        console.log("File paths retrieved");
        async.eachLimit(files, 50, function (file, callback) {
            indexImage(file, callback)
        }, cb);
    }
], function () {
    console.log('Index finished')
});
