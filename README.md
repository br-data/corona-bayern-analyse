# Corona Bayern Analyse

Die interaktive Karte zeigt die Entwicklung der Corona-Pandemie in Bayern, ein halbes Jahr nach Bekanntwerden des ersten Falls. Der Fokus liegt dabei auf der schrittweisen Ausbreitung und den besonders betroffenen Städten und Landkreisen in Bayern.

**Artikel:**
**Karte:** <https://web.br.de/interaktiv/corona-rueckblick/>

## Verwendung

1. Repository klonen `git clone https://...`
2. Erforderliche Module installieren `npm install`
3. Entwicklungsserver starten `npm start`
4. Projekt bauen mit `npm run build`

Um die Module installieren und die Entwicklerwerkzeuge nutzen zu können, muss vorher die JavaScript-Runtime [Node.js](https://nodejs.org/en/download/) installiert werden.

## Daten

Die GeoDaten für die Bayernkarte (`./data/bayern-counties.geo.json`) stammen aus dem OpenData-Portal des [Bayerischen Vermessungsamts](https://www.ldbv.bayern.de/produkte/weitere/opendata.html). Die Metadaten (`./data/bayern-meta.json`) dazu kommen aus unterschiedlichen Quellen. Die Ortskoordinaten (Lat/Long) für die jeweiligen Kreise haben wir aus den Geodaten des Bayerischen Vermessungsamts berechnet. Die Einwohnerzahlen basieren auf Angaben des [Bayerischen Statistikamts](https://www.statistik.bayern.de/statistik/gebiet_bevoelkerung/bevoelkerungsstand/index.html).

Die Corona-Fallzahlen (`./data/bayern-cases.json`) kommen vom [Robert Koch-Institut](https://npgeo-corona-npgeo-de.hub.arcgis.com/). Um die Daten abzufragen, verwenden wir unseren eigenen [RKI-API-Wrapper](https://github.com/br-data/corona-deutschland-api). Dadurch lassen sich die historischen Fallzahlen (nach Erkennungsdatum) mit einem einfachen GET-Request abfragen:

```console
curl "https://europe-west3-brdata-corona.cloudfunctions.net/rkiApi/query?group=Landkreis&bundesland=Bayern&dateField=Refdatum" -o ./data/bayern-cases.json
```

## Analyse

Als Leitindikator verwenden wir die Anzahl der Neuinfektionen pro 100.000 Einwohner in den vergangenen 7 Tagen. Dieser Wert ist seit dem 6. Mai auch der Maßstab für die Einordnung des lokalen Infektionsgeschehens (Stichwort: Obergrenze). Für unsere Analyse beziehen wir uns dabei auf die Fallzahlen nach Erkennungsdatum. Das Erkennungsdatum, oder auch Referenzdatum, beschreibt den Beginn der Krankheit, zum Beispiel dann, wenn sich ein Patient mit Symptomen bei einem Arzt meldet. Das Meldedatum hingegen bezieht sich auf den Stichtag an dem ein Fall an die Behörden gemeldet wurde, unabhängig davon, wann eine Person erkrankt ist.

Für unsere Analyse berechnen wir die Neuinfektionen pro 100.000 Einwohner in den vergangenen 7 Tagen für jeden Kreis, an jedem Tag. Die Berechnungen werden mit folgendem Skript (Node.js) gestartet:

```console
node analyse.js
```

Das Ergebnis der Berechnung wird in der Datei `./data/bayern-timeline.json` gespeichert.

Im Skript selbst finden sich noch zwei auskommentierte, alternative Berechnungsarten: Fälle pro Tag und Fälle pro Woche. Die letztendlich gewählte Methode ist dabei ein guter Kompromiss aus beidem.

## Entwickeln

Zum lokalen Entwickeln ist ein kleiner [HTTP-Server](https://github.com/webpack/webpack-dev-server) integriert. Diesen kann man mit dem Befehl `npm start` starten. Der Server läuft unter <http://localhost:8080>. Beim Starten des Entwicklungsservers sollte automatisch ein neues Browserfenster aufgehen. Bei Änderungen am Quellcode wird die Seite automatisch neu geladen (Live Reloading).

Auch das CSS wird bei jeder Änderungen der Sass-Dateien neu erzeugt. Vendor-Prefixes wie `-webkit` oder `-moz` können weggelassen werden, das diese im Build durch den [Autoprefixer](https://github.com/postcss/autoprefixer) hinzugefügt werden.

Eine für die Auslieferung optimierte Version des Projekts kann mit `npm build` erstellt werden. Der transpilierte und minfizierte Code wird im Ordner `./build/` abgelegt.
