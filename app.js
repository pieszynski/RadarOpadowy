'use strict';

var http = require('http'),
    express = require('express'),
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
    //console.log('par:controller:', controller);

    req.ctrlName = controller;

    next();
});

// obsługa ścieżki do kontrolera
router.all('/radar/api/:controller', function (req, res, next) {

    // TODO: akcja kontrolera
    //console.log('ctl:', req.ctrlName, req.ctlAction);

    if (!serveRadar(req.ctrlName, req, res))
        next();
});

// domyslna ścieżka
router.all(/.*/i, function (req, res, next) {

    // TODO: kod tutaj
    //console.log('fallback:404');

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
// funkcje pomocnicze do buforowania obrazków w pamięci

var radars = [], // globalny bufor map radarowych
    refreshCacheInterval = 5 * 60 * 1000, // co 5min
    maxFilesInBuf = 3; // trzy najświeższe mapy radarowe

function serveRadar(radarFile, req, res) {

    // pozwalamy pobierać tylko plik o nazwie "radarN.png"
    var rOut = (/^radar(\d)\.png$/gi).exec(radarFile);

    if (!rOut)
        return false;

    var num = parseInt(rOut[1]);

    // jeśli plik o wskazanym numerze jest w buforze to go zwracamy
    if (undefined !== radars[num]) {
        res.status(200);
        res.write(radars[num]);
        res.end();
    }
    else {
        res.status(404).end();
    }

    return true;
}

function pullRadarLinks(callback) {
    if (!callback)
        return;

    // pobranie zawartości strony http://pogodynka.pl/radary
    var req = http.request('http://pogodynka.pl/radary', function (res) {
        res.setEncoding('utf8');
        var text = '';

        // złączenie bufora zwracanego w jeden ciąg tekstowy
        res.on('data', function (chunk) { text += chunk; });
        
        // na koniec przeszukujemy wstawki JavaScript "img_tab=new Array(); ... player.show(false);"
        res.on('end', function () {
            var mStart = (/img_tab=new Array\(\);/gi).exec(text);
            var mStop = (/player.show\(false\);/gi).exec(text);

            // jeśli znaleziono to wycinamy ją i wyciągamy URLe do map radarowych
            if (mStart && mStop) {
                text = text.substring(mStart.index, mStop.index);

                // pobranie maxFilesInBuf najnowszych map radarowych
                var lnks = parseAndGetLinks(text);

                // aktualizacja bufora map na podstawie linków
                callback(undefined, lnks);
            }
            else {
                // nie udało się pobrać strony
                callback('brak linków na http://pogodynka.pl/radary', undefined);
            }
        });
    })

    // obsługa błędów (LOL)
    req.on('error', function(err) { console.log(err); });

    // faktyczne wykonanie zapytania do strony
    req.end();
}

function parseAndGetLinks(text) {
    // funkcja pobierających ostatnich maxFilesInBuf linków map radarowych 
    //  z wstępnie okrojonej treści strony

    var response = [];
    if (!text)
        return response;

    var baseAddr = 'http://pogodynka.pl',
        rx = /\]\s*=\s*'([^']+)'/i,
        data = undefined;

    while(data = rx.exec(text)) 
    {
        var upath = data[1];
        response.push(baseAddr + upath);

        // zwracanych zostaje tylko ostatnich "maxFilesInBuf" map radarowych
        if (maxFilesInBuf <= response.length)
            break;

        // skrócenie tekstu o to co już zostało wyszukane
        text = text.substring(data.index + upath.length);
    }

    return response;
}

function loadImageToBuffer(url, callback) {
    // pobieranie obrazka do bufora w pamięci

    if (!url || !callback)
        return false;

    var req = http.request(url, function (res) {

        var loadResponse = new Buffer(0);

        // obrazek przychodzi w częsciach dlatego jest łączony w jeden bufor
        res.on('data', function (chunk) {
            if (Buffer.isBuffer(chunk)) {
                loadResponse = Buffer.concat([loadResponse, chunk]);
            }
        });

        // zwrócenie pobranych danych
        res.on('end', function () {
            callback(undefined, loadResponse);
        });
    })

    // obsługa błędów i wykonanie zapytania
    req.on('error', function (err) { callback(err); });
    req.end();
}

function loadRadar(url, idx) {
    // aktualizacja bufora konkretnego obrazka o wskazanym indeksie "idx"

    loadImageToBuffer(url, function(err, buf) { 
        if (err) { 
            console.log(err); 
            return;
        } 
        
        console.log('buf' + idx + ' OK!');
        radars[idx] = buf;
    });
}

function refreshCache() {
    // akcja wykonywanan cyklicznie do aktualizacji bufora map radarowych

    console.log('czas odświeżyć bufor obrazków...');
    pullRadarLinks(function(err, links) {
        if (err) {
            console.log(err);
            return;
        }

        for(var i = 0; i < links.length; i++) {
            loadRadar(links[i], i);
        }
    });
}


// ==============================================
// start buforowania obrazków w pamięci
refreshCache();
var rec = setInterval(function () {
    refreshCache();
}, refreshCacheInterval);
