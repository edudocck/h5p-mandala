#H5P.Mandala 1.1.1 – überarbeitete Testversion

Eigenständiger H5P-Inhaltstyp zum flächenweisen Ausmalen eines von der Lehrkraft
hochgeladenen Schwarz-Weiß-Bildes. Ausschließlich JPG/JPEG und PNG;
keine SVG-Dateien, keine Vektorisierung. Keine externen Skripte, Fonts, CDN-Aufrufe
erforderlich. Die mitgelieferte Bibliothek H5PEditor.Mandala ergänzt das
Autorenformular und wird mit dem Paket installiert. Code unter MIT-Lizenz.

Schnellstart in Moodle

Als Administrator die Datei H5P.Mandala-1.1.1.h5p unter
Website-Administration → H5P → H5P-Inhaltstypen verwalten hochladen.
Menübezeichnungen können je nach Moodle-Version abweichen.

Im Inhaltspeicher Mandala / Ausmalbild auswählen und ein JPG oder
PNG hochladen. Titel, Aufgabenstellung und Bildbeschreibung ausfüllen.

Speichern und eine H5P-Aktivität im Kurs mit diesem Inhalt anlegen.

Alternativ Mandala-Demo-1.1.1.h5p als Administrator in den Inhaltspeicher
hochladen: Die Datei enthält die Bibliothek und ein sofort nutzbares PNG-Beispiel.
Ein normales Trainerkonto kann eine neue Bibliothek meist nicht installieren.
Die Bibliothek ist noch nicht im offiziellen H5P-Hub veröffentlicht.

Funktionen

Ein Ausmalbild pro Aktivität; autorenseitiger Bild-Upload.

Standardpalette mit 13 Farben, ergänzt durch bis zu 32 eigene Autorenfarben.

Schalter Standardfarben ausblenden für eine ausschließlich eigene Palette.

Farbe hinzufügen mit nativem Farbpicker und optionaler #RRGGBB-Eingabe.

Optionaler freier Farbwähler für Lernende; bis zu 32 bereits verwendete eigene
Farben erscheinen als erneut auswählbare Farbfelder und werden mit Resume gespeichert.

Optional sichtbarer aktiver Farbwert als #RRGGBB und RGB(r, g, b).

Fülleimer, Radierer zum Wiederherstellen der ursprünglichen Fläche.

Rückgängig/Wiederholen der letzten 100 Änderungen, Zurücksetzen mit Bestätigung.

Zoom von 1× bis 8× gegenüber der automatisch angepassten Ansicht.

Verschieben per Ziehen bei vergrößertem Bild; kein separates Verschieben-Werkzeug.

Keine Anpassen-Schaltfläche; die Grundansicht passt sich automatisch an.

Pointer Events für Maus und Touch; Zwei-Finger-Zoom und -Verschieben.

PNG-Download optional; exportiert nur das Bild in Arbeitsauflösung.

Vollbild über die H5P-Funktion einschließlich Rückkehr zur normalen Ansicht.
Ohne H5P-Vollbilddienst wird die Browserfunktion verwendet; wenn diese blockiert
ist, erscheint eine vergrößerte Ansicht innerhalb der Einbettung.

Tastatur: Tab zum Canvas; Pfeiltasten bewegen die sichtbare Markierung um
10 Pixel, Umschalt+Pfeil um 1 Pixel; Enter/Leertaste färbt die Fläche.
Strg/Cmd+Z für Undo, Strg/Cmd+Y bzw. Strg/Cmd+Umschalt+Z für Redo.

Deutsch ist ausdrücklich die Standardsprache. Unter Textänderungen stehen
ausgefüllte deutsche Vorgaben und eine Umschaltung auf vollständige englische Texte.

Eigene Textänderungen bleiben beim Hin- und Herschalten innerhalb des geöffneten
Editors erhalten. Im H5P-Inhalt wird die zuletzt gewählte Sprache mit ihren Texten gespeichert.

Bildverarbeitung

Beim Laden werden transparente PNG-Bereiche auf Weiß gelegt. Bilder mit großer
Auflösung werden auf maximal 1536 Pixel je längster Kante reduziert, einstellbar
zwischen 256 und 2048. Das hochgeladene Original verbleibt im H5P-Paket.
Auch das exportierte Bild hat die Arbeitsauflösung.

Der Grenzwert für Konturen beträgt standardmäßig 110 von 255. Pixel bis zu diesem
mittleren RGB-Helligkeitswert gelten als Begrenzung. Ein Flood-Fill ermittelt
vierfach zusammenhängende Rasterflächen im unveränderten Ausgangsbild. Dadurch
bleibt auch eine schwarz ausgemalte Fläche später umfärbbar. Graue Linienränder
werden beim Färben in ihrer Helligkeit erhalten. Der Algorithmus schließt keine
Lücken: Offene Konturen führen zu verbundenen Flächen. Sehr dünne Linien können
beim Verkleinern verloren gehen. Verwenden Sie scharfe, geschlossene Konturen.
Der Grenzwert liegt im Autorenformular, nicht in der Lernendenansicht.

Malstand / Resume

getCurrentState() liefert eine kompakte Liste aus Flächenseeds und Farben.
H5P übergibt diese bei einem späteren Aufruf als extras.previousState zurück.
Es werden keine Bild-Snapshots in den Lernstand geschrieben. Bild-Fingerprint,
Arbeitsabmessungen und Liniengrenzwert schützen vor dem Anwenden eines alten
Malstands auf eine veränderte Bildvorlage. Undo/Redo-Verlauf und Zoom werden
nicht dauerhaft gespeichert. Zurücksetzen löscht die Bemalung. Bereits verwendete eigene Farben bleiben für
weitere Versuche auswählbar und werden weiterhin im Resume-Zustand gespeichert.
Ohne solche Farben und ohne Bemalung wird ein leerer Zustand zurückgegeben.

Die Lernplattform muss Resume aktivieren und speichern. Der Inhaltstyp kann
diese Serverfunktion nicht erzwingen. Bei Gastzugriff, deaktivierter Speicherung
oder reinem Einbetten ohne passenden Plattformdienst ist kein dauerhafter
Malstand garantiert. Als Sicherung kann das PNG heruntergeladen werden.
Es gibt keinen zusätzlichen Serverdienst und kein automatisches Lehrer-Dashboard
mit den fertigen Bildern. Für eine Abgabe: PNG herunterladen und in einer
Moodle-Aufgabe einreichen.

Bewertung und Abschluss

Keine Punkte und keine Bewertung. Fertig ist für neue Inhalte standardmäßig
aktiviert und kann von der Lehrkraft deaktiviert werden. Nach mindestens einer
gefärbten Fläche sendet der Button ein xAPI-completed mit result.completion = true,
ohne Score und ohne Bestehensbehauptung. Wie Moodle dies für Aktivitätsabschluss
verwendet, muss auf der konkreten Installation geprüft werden. Eine Option
„Bestehensnote erreichen“ passt nicht zu diesem unbewerteten Inhaltstyp.
Nach Fertig erscheint eine sichtbare Abschlussmeldung, die Malwerkzeuge
werden gesperrt, der Button heißt Weiter bearbeiten. Download und Zoom bleiben
nutzbar. Weiter bearbeiten öffnet die Werkzeuge erneut. Ein bereits
serverseitig gesetzter Moodle-Abschluss wird dadurch nicht zurückgenommen.

Entwicklung / reproduzierbarer Build

JavaScript und CSS werden direkt ausgeliefert. Kein npm-Build notwendig.

python3 build.py
npm install
npm test
python3 -m http.server 8765 --directory .
# In einem weiteren Terminal:
npx playwright install chromium
npm run test:browser

build.py benötigt Python 3 und Pillow und erzeugt Bibliotheks- und Demo-Paket
im benachbarten Ordner deliverables. Die HTML-Datei unter demo/index.html
ist eine lokale Vorschau mit kleinem H5P-Testadapter, keine vollständige
Moodle-/H5P-Integration. Zum Testen im Browser http://localhost:8765/demo/
öffnen. Der Testadapter speichert keine Zustände automatisch.

Grenzen und Teststand

Überarbeitete Testversion, noch kein eigener Importtest in Moodle. Der
Import, das H5P-Autorenformular, tatsächliche Resume-Speicherung und die
Moodle-Abschlussverarbeitung müssen auf der Zielinstanz getestet werden.
Die räumliche Tastaturbedienung bietet keine semantische Beschreibung jeder
Bildfläche; vollständige Screenreader-Zugänglichkeit des Ausmalens wird nicht
behauptet. Freihandzeichnen, Malbuchseiten und automatische Lehreransicht
sind nicht enthalten.

Referenzen: https://h5p.org/semantics,
https://h5p.org/library-definition,
https://h5p.org/documentation/developers/json-file-definitions,
https://h5p.org/documentation/developers/contracts.

Änderungen gegenüber 1.0

Das Inhaltstyp-Feld „Titel“ heißt im Editor Überschrift. Der allgemeine
H5P-Metadatentitel bleibt „Titel“. Der gespeicherte Parameter heißt weiter
title, damit vorhandene Überschriften erhalten bleiben.

Die Bildhöhe wird aus der verfügbaren Breite bestimmt; keine vh-Höhen
im eingebetteten Normalmodus. Dies beseitigt die Rückkopplung zwischen
iframe-Höhe und H5P-Größenanpassung als mögliche Ursache des Flackerns.

Ganzzahlige CSS-Bildpositionen, keine transformierte Zentrierung des Canvas
und weniger Layoutänderungen. Statusmeldungen haben einen festen Platz.

Anpassen und Verschieben als Schaltflächen entfernt.

Fertig sichtbar wirksam; Vollbild nutzt H5P statt des bloßen Browseraufrufs.

Aktualisierung auf 1.1.1

Als Administrator H5P.Mandala-1.1.1.h5p installieren oder die neue Demo importieren.
Beide Pakete enthalten auch H5PEditor.Mandala 1.1.1 für das Autorenformular.

Bestehende 1.1-Inhalte verwenden nach der Patch-Installation den aktualisierten
Code. Bild, Aufgabenstellung und bisherige Malstände bleiben vom Datenformat
her kompatibel. Die neuen Einstellungen können im Autorenformular geändert werden.

Inhalte aus 1.0 benötigen weiterhin eine Aktualisierung auf die Minor-Version
1.1 über die Aktualisierungsfunktion der H5P-Integration, sofern angeboten.
Das bereits vorhandene upgrades.js bleibt enthalten.

Neue Änderungen in 1.1.1

Das vom Nutzer bereitgestellte Mandala_H5P_Icon.png ist unverändert als
icon.png enthalten. Für die H5P-Bibliotheksanzeige wird dieses Rasterbild
zusätzlich in den von H5P erwarteten, selbständigen icon.svg-Container
eingebettet. Es findet keine Vektorisierung statt. Die Darstellung als Moodle-
Kursaktivitätsicon hängt von Moodles Theme und H5P-Integration ab; die Bibliothek
allein ersetzt nicht das allgemeine Icon des Moodle-Moduls mod_h5pactivity.

Eigene Autorenfarben ergänzen jetzt die Standardpalette. Gleiche Farbcodes
werden zusammengeführt. Standardfarben können ausgeblendet werden.

Ist bei ausgeblendeten Standardfarben keine eigene Farbe vorhanden, wird der
freie Farbpicker automatisch eingeblendet, damit die Aktivität bedienbar bleibt.

Farbpicker im Autorenformular, weiter nutzbare Hex-Farbcodes und Validierung.

Deutsch als vorausgefüllte Standardsprache und Englisch-Umschaltung. Vorhandene
eigene Beschriftungen werden beim Öffnen erhalten; leere Texte nutzen Vorgaben.

Erneut auswählbare freie Farben einschließlich Resume. Es werden bis zu 32
Farben gemerkt. Der PNG-Export enthält weiterhin nur das Bild.

Optionale RGB-/Hex-Anzeige. In der Demo ist die Anzeige aktiviert.

Die Änderungen aus 1.1 bleiben enthalten: Überschrift statt zweitem Titel,
keine Anpassen- oder Verschieben-Schaltfläche, stabile Bildhöhe, sichtbarer
Fertig-Zustand mit Weiter bearbeiten sowie H5P-Vollbild.

Importkorrektur vom 04.10.2026

Der Lizenzwert im Paketmanifest h5p.json wurde von MIT auf U
(nicht angegeben) korrigiert. Moodle akzeptiert MIT dort nicht als Inhaltslizenz.
Die Codebibliotheken behalten ihre MIT-Lizenz in library.json und LICENSE.txt.
Die Bibliotheksversion bleibt 1.1.1, da ausschließlich die Paketmetadaten
korrigiert wurden. Die vorherige Datei wurde von Moodle vor der Installation
abgewiesen.
