var H5PUpgrades = H5PUpgrades || {};
H5PUpgrades['H5P.Mandala'] = {
  1: {
    1: function(parameters, finished, extras) {
      parameters.l10n = parameters.l10n || {};
      var de = /Fülleimer|Zurücksetzen/.test((parameters.l10n.fill || '') + (parameters.l10n.reset || ''));
      delete parameters.l10n.pan;
      delete parameters.l10n.fit;
      parameters.l10n.continueEditing = de ? 'Weiter bearbeiten' : 'Continue editing';
      parameters.l10n.exitFullscreen = de ? 'Vollbild verlassen' : 'Exit fullscreen';
      parameters.l10n.fullscreenFallback = de ? 'Die vergrößerte Ansicht wird innerhalb der Einbettung angezeigt.' : 'The enlarged view is displayed within the embed.';
      parameters.l10n.finished = de ? 'Bearbeitung abgeschlossen. Das Bild kann heruntergeladen oder mit „Weiter bearbeiten“ erneut geöffnet werden.' : 'Activity completed. Download the image or select Continue editing to make more changes.';
      parameters.l10n.hint = de ? 'Wählen Sie eine Farbe und tippen Sie in eine Fläche. Bei vergrößerter Ansicht das Bild ziehen, um es zu verschieben. Mit zwei Fingern zoomen. Tastatur: Tab zum Bild, Pfeiltasten bewegen die Markierung, Eingabe färbt die Fläche.' : 'Choose a color and tap an area. Drag to pan when zoomed in. Pinch with two fingers to zoom. Keyboard: Tab to the image, use arrow keys to move the marker, Enter to color.';
      // Keep parameter name title: existing headings, files and settings survive.
      finished(null, parameters, extras);
    }
  }
};
