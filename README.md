# Corona Bayern Analyse

Entwicklung der Corona-Fallzahlen in den bayerischen Städten und Landkreise

**Artikel:**

## Verwendung

1. Repository klonen `git clone https://...`
2. Erforderliche Module installieren `npm install`
3. Entwicklungsserver starten `npm start`
4. Projekt bauen mit `npm run build`

Um die Module installieren und die Entwicklerwerkzeuge nutzen zu können, muss vorher die JavaScript-Runtime [Node.js](https://nodejs.org/en/download/) installiert werden.

## Daten

```console
curl "https://europe-west3-brdata-corona.cloudfunctions.net/rkiApi/query?group=Landkreis&bundesland=Bayern&dateField=Refdatum" -o data/landkreise.json
```
