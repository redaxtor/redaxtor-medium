var MediumEditor = require('medium-editor/dist/js/medium-editor.js');
import vanillaColorPicker from '../helpers/VanillaColorPicker';

(function () {
    'use strict';
    var ColorPicker = MediumEditor.extensions.button.extend({
        name: "colorPicker",
        action: "applyForeColor",
        aria: "color picker",
        contentDefault: "<i class='fa fa-paint-brush editor-color-picker' aria-hidden='true'></i>",

        handleClick: function (e) {
            e.preventDefault();
            e.stopPropagation();

            this.selectionState = this.base.exportSelection();

            // If no text selected, stop here.
            if (this.selectionState && (this.selectionState.end - this.selectionState.start === 0)) {
                return;
            }

            // colors for picker
            var pickerColors = [
                "#9b59b6",
                "#34495e",
                "#16a085",
                "#27ae60",
                "#2980b9",
                "#8e44ad",
                "#2c3e50",
                "#f1c40f",
                "#e67e22",
                "#e74c3c",
                "#bdc3c7",
                "#95a5a6",
                "#666",
                "#212121",
                "#f39c12",
                "#d2d064",
                "#4fbbf7",
                "#ffffff"
            ];

            var picker = vanillaColorPicker(this.document.querySelector(".medium-editor-toolbar-active .editor-color-picker"));
            picker.set("customColors", pickerColors);
            picker.set("positionOnTop");
            picker.openPicker();
            picker.on("colorChosen", function (color) {
                this.base.importSelection(this.selectionState);
                this.document.execCommand("styleWithCSS", false, true);
                this.document.execCommand("foreColor", false, color);
            }.bind(this));
        }
    });
    MediumEditor.extensions.colorPicker = ColorPicker;
}());