/*
This code is licensed under the CC BY-NC-SA 3.0 license, available at https://creativecommons.org/licenses/by-nc-sa/3.0/deed.en.

Large portions of this work were sourced from https://forum.snap.berkeley.edu/t/snavanced-part-1/13125, a forum post from alessandrito123 (https://forum.snap.berkeley.edu/u/alessandrito123/summary) and were used under license.
*/

return class extends Mod {
    // Metadata
    ID = "snavanced-icons"; // the id of the addon
    NAME = "Snavanced! Icon Theme"; // human-readable name
    DESCRIPTION = "Change Snap!'s icons to look more like Snavanced!."; // description
    VERSION = "1.2.0"; // version
    AUTHOR = "PPPDUD"; // author
    CONTRIBUTORS = "Alessandrito123"; // contributors
    DEPENDS = []; // dependencies (addon ids, useful for libraries)
    DO_MENU = false; // whether to add a menu item

    // Main function - gets ran when the addon is loaded
    main() {
        this.api.wrapFunction(SymbolMorph.prototype, "renderSymbolFlag", function(ctx, color) {
            // draw a flag
            var w = this.symbolWidth(),
                h = this.size,
                l = Math.max(w / 12, 1);

            ctx.lineWidth = l;
            ctx.strokeStyle = color.toString();
            ctx.beginPath();
            ctx.moveTo(l * 2, 0);
            ctx.lineTo(0, h);
            ctx.stroke();

            ctx.lineWidth = h / 2;
            ctx.beginPath();
            ctx.moveTo(w / 8, h / 4);
            ctx.bezierCurveTo(
                w / 1.25,
                h / 2,
                w / 2,
                h / 2,
                w,
                h / 2
            );
            ctx.stroke();
        }, true);

        this.api.wrapFunction(SymbolMorph.prototype, "renderSymbolGears", function(ctx, color) {
            // draw gears
            var w = this.symbolWidth(),
                r = w / 2,
                e = w / 8;

            ctx.strokeStyle = color.toString();
            ctx.lineWidth = this.symbolWidth() / 4;

            ctx.beginPath();
            ctx.arc(r, r, w, 0, radians(360), true);
            ctx.arc(r, r, e * 2, 0, radians(360), false);
            ctx.closePath();
            ctx.clip();

            ctx.moveTo(0, r);
            ctx.lineTo(w, r);
            ctx.stroke();

            ctx.moveTo(r, 0);
            ctx.lineTo(r, w);
            ctx.stroke();

            ctx.moveTo(e, e);
            ctx.lineTo(w - e, w - e);
            ctx.stroke();

            ctx.moveTo(w - e, e);
            ctx.lineTo(e, w - e);
            ctx.stroke();
        }, true);

        this.api.wrapFunction(SymbolMorph.prototype, "renderSymbolGlobeBig", function(ctx, color) {
            this.renderSymbolGlobe(ctx, color, true);
        }, true);

        this.api.wrapFunction(SymbolMorph.prototype, "renderSymbolGlobe", function(ctx, color, detailed) {
            // draw a stylized globe
            var w = this.symbolWidth(),
                l = Math.max(w / 30, 0.5);

            ctx.strokeStyle = color.toString();
            ctx.lineWidth = l * 2;

            ctx.beginPath();
            ctx.arc(w / 2, w / 2, w / 2 - l, 0, radians(360), false);
            ctx.stroke();

            if (detailed) {
                ctx.moveTo(l * 4, w / 5);
                ctx.lineTo(w - l * 4, w / 5);
                ctx.stroke();
                ctx.moveTo(w / 2, 0);
                ctx.lineTo(w / 2, w);
                ctx.stroke();
                ctx.moveTo(l * 4, w * 4 / 5);
                ctx.lineTo(w - l * 4, w * 4 / 5);
                ctx.stroke();
            };

            // single line version, looks better when small:
            ctx.beginPath();
            ctx.moveTo(w / 2, l / 2);
            ctx.arcTo(0, w / 2, w / 2, w, w * 2 / 3);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, w / 2);
            ctx.lineTo(w, w / 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(w / 2, l / 2);
            ctx.arcTo(w, w / 2, w / 2, w, w * 2 / 3);
            ctx.stroke();
        }, true);

        this.api.wrapFunction(SymbolMorph.prototype, "renderSymbolTick", function(ctx, color) {
            // draw a check mark
            var w = this.symbolWidth() / 3;

            ctx.strokeStyle = color.toString();
            ctx.lineWidth = Math.max(w / 20, 1 / 2) * 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(w * 3 / 4, w * 2);
            ctx.lineTo(w * 5 / 4, w * 5 / 2);
            ctx.lineTo(w * 9 / 4, w / 2);
            ctx.stroke();
        }, true);
        this.api.world.rerender();
    }

    // Cleanup function - get ran when the addon is "deleted"
    cleanupFunc() {
        this.api.world.rerender();
    }
}