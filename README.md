# Radar opadowy
Aplikacja internetowa do oglądania ostatnich kilku map radarowych Polski.
[http://www.pieszynski.com/radar/](http://www.pieszynski.com/radar/)

#### Czyszczenie ApplicationCache w przeglądarce Chrome
[chrome://appcache-internals/](chrome://appcache-internals/)

#### Rozwijanie aplikacji lokalnie na stacji
```bash
> node app.js
```

#### Usługa w systemie Linux: node + pm2
```bash
> pm2 start app.js --watch --name "RadarOpadowy"
> pm2 save
```
