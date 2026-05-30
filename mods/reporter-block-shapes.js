return class extends Mod {
    // Metadata
    ID = "reporter-block-shapes"; // the id of the addon
    NAME = "Reporter Block Shapes"; // human-readable name
    DESCRIPTION = "Change the shape of a reporter depending on what it returns."; // description
    VERSION = "1.0.0"; // version
    AUTHOR = "codingisfun2831"; // author
    DEPENDS = []; // dependencies (addon ids, useful for libraries)
    DO_MENU = false; // whether to add a menu item

    // Main function - gets ran when the addon is loaded
    main() {
        // getBlockShape - return shape string for a reporter block

        ReporterBlockMorph.prototype.getBlockShape = function () {
            var choice;

            if (this.isPredicate) return "Diamond";
            if (this.reports === "color") return "Rectangle";

            if (this.selector == "getPenAttribute" || this.selector == "reportAspect") {
                choice = this.inputs()[0].evaluate();
                if (choice instanceof Array && choice[0] === "color") return "Rectangle";
            }

            return "Oval";
        }

        // fix up outlinePath for that
        ReporterBlockMorph.prototype._outlinePath =
            ReporterBlockMorph.prototype.outlinePath;
        ReporterBlockMorph.prototype.outlinePath = function (ctx, inset) {
            let shape = this.getBlockShape();
            let func = "outlinePath" + shape;

            if (this[func]) this[func](ctx, inset);
            else this.outlinePathOval(ctx, inset);
        };

        // and drawEdges
        ReporterBlockMorph.prototype._drawEdges =
            ReporterBlockMorph.prototype.drawEdges;
        ReporterBlockMorph.prototype.drawEdges = function (ctx) {
            let shape = this.getBlockShape();
            let func = "drawEdges" + shape;

            if (this[func]) this[func](ctx);
            else this.drawEdgesOval(ctx);
        };

        // rectangle shape
        ReporterBlockMorph.prototype.outlinePathRectangle = function (ctx, inset) {
            // not how i want to do it at all, but we need to do this so
            // c slots work fine (no color reporter should use one, but
            // i'm still gonna do this)

            // draw the 'flat' shape
            var h = this.height(),
                w = this.width(),
                pos = this.position();

            // top left:
            ctx.arc(
                0,
                0,
                0,
                radians(-180),
                radians(-90),
                false
            );

            // top right:
            ctx.arc(
                w,
                0,
                0,
                radians(-90),
                radians(-0),
                false
            );

            // C-Slots
            this.cSlots().forEach(slot => {
                slot.outlinePath(ctx, inset, slot.position().subtract(pos));
            });

            // bottom right:
            ctx.arc(
                w,
                h,
                0,
                radians(0),
                radians(90),
                false
            );

            // bottom left:
            ctx.arc(
                0,
                h,
                0,
                radians(90),
                radians(180),
                false
            );

            ctx.lineTo(0, 0); // close the path so we can clip it for rings
        };

        ReporterBlockMorph.prototype.drawEdgesRectangle = function (ctx) {
            var h = this.height(),
                w = this.width();

            ctx.lineWidth = this.edge;

            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.lineTo(0, 0);
            ctx.lineTo(w, 0);
            ctx.strokeStyle = this.cachedClrBright;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(w, 0);
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.strokeStyle = this.cachedClrDark;
            ctx.stroke();
        };
    }

    // Cleanup function - get ran when the addon is "deleted"
    cleanupFunc() {
        // delete extra funcs
        delete ReporterBlockMorph.prototype.getBlockShape;
        delete ReporterBlockMorph.prototype.outlinePathRectangle;
        delete ReporterBlockMorph.prototype.drawEdgesRectangle;

        // bring back old funcs
        ReporterBlockMorph.prototype.drawEdges =
            ReporterBlockMorph.prototype._drawEdges;
        ReporterBlockMorph.prototype.outlinePath =
            ReporterBlockMorph.prototype._outlinePath;
    }
}