var restify = require('restify');
var mysql = require('mysql');

// Create mysql connection pool
var pool = mysql.createPool({
    connectionLimit: 200,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'Photos'
});

var server = restify.createServer();

server.use(restify.CORS());

server.get('/photos/:page', function respond(req, res, next) {
    pool.query('SELECT * FROM photos ORDER BY time DESC LIMIT 50 OFFSET ?', [req.params.page * 50], function (error, results, fields) {
        res.send(results);
        next();
    });
});

server.get('/photos/:type/:term/:page', function respond(req, res, next) {
    pool.query('SELECT *, photo_id as id FROM location LEFT JOIN (photos) ON (photos.id = location.photo_id) WHERE name LIKE ? OR countryName LIKE ? OR adminName LIKE ? GROUP BY photos.time DESC LIMIT 50 OFFSET ?', ['%'+req.params.term+'%','%'+req.params.term+'%','%'+req.params.term+'%', req.params.page * 50], function (error, results, fields) {
        res.send(results);
        next();
    });
});

server.get('/search/geo/:term', function respond(req, res, next) {
    pool.query('SELECT * FROM location WHERE name LIKE ? OR countryName LIKE ? OR adminName LIKE ? GROUP BY name', ['%'+req.params.term+'%','%'+req.params.term+'%','%'+req.params.term+'%'], function (error, results, fields) {
        res.send(results);
        next();
    });
});

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});
