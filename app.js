'use strict';

var express = require('express'),
    compression = require('compression');

var app = module.exports = express(),
    router = express.Router();

// wyłączenie nagłówka
app.disable('x-powered-by');

// włączenie kompresji transmisji
app.use(compression());

// serwowanie plików statycznych
app.use('/radar', express.static(__dirname + '/'));

// analiza parametrów
router.param('controller', function (req, res, next, controller) {

    // TODO: obsługa parametrów
    console.log('par:controller:', controller);

    req.ctrlName = controller;

    next();
});

// obsługa ścieżki do kontrolera
router.all('/radar/api/:controller', function (req, res, next) {

    // TODO: akcja kontrolera
    console.log('ctl:', req.ctrlName, req.ctlAction);

    if (!serveRadar(req.ctrlName, req, res))
        next();
});

// domyslna ścieżka
router.all(/.*/i, function (req, res, next) {

    // TODO: kod tutaj
    console.log('fallback:404');

    res.status(404).end('404: strona nie istnieje bo nie ma pliku index.html lub nie znaleziono kontrolera.' + (req.ctrlName ? '\r\n[ctl:' + req.ctrlName + ']' : ''));
});

// przekierowanie wszystkich zapytań do routera
app.all(/.*/i, router);
app.all('/', router);

// wystartowanie Webserwera
app.listen(8010, function () {

    console.log('Express Webserver started');
});

// ==============================================

function serveRadar(radarFile, req, res) {

    var rOut = (/^radar(\d)\.png$/gi).exec(radarFile);

    if (!rOut)
        return false;

    var num = rOut[1];

    res.status(300).end('plik-' + num);
}