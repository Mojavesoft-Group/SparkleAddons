return class extends Mod {
    // Metadata
    ID = "reporter-block-shapes"; // the id of the addon
    NAME = "Reporter Block Shapes"; // human-readable name
    DESCRIPTION = "Change the shape of a reporter depending on what it returns. Inspired by Snavanced, by alessandrito123"; // description
    VERSION = "1.0.0"; // version
    AUTHOR = "codingisfun2831, d016"; // author
    DEPENDS = []; // dependencies (addon ids, useful for libraries)
    DO_MENU = false; // whether to add a menu item
    OPTIONS_FORMAT = [
        {
            id: "squareType",
            name: "Square Block Type",
            type: "string",
            default: "color",
            menu: {
                "color": "color",
                "string": "text",
                "list": "list",
            },
            readOnly: true,
        }
    ]

    // Main function - gets ran when the addon is loaded
    main() {
        // getBlockShape - return shape string for a reporter block
        let options = this.options,
        api = this.api;
        this.addEventListener("optionsChanged", (e) => {
            api.ide.rerender()
        });

        ReporterBlockMorph.prototype.getRealReports = function() {
            var choice;

            if ((this.selector == "getPenAttribute" || this.selector == "reportAspect")) {
                choice = this.inputs()[0].evaluate();
                if (choice instanceof Array && choice[0] === "color") return "color";
            }

            return this.reports;
        };

        ReporterBlockMorph.prototype.getBlockShape = function () {
            var reports = this.getRealReports();

            if (reports === options.squareType) return "Rectangle";
            if ([
                "agent",
                "sprite",
                "stage",
                "costume", // should we include costumes and sounds???
                "sound"
            ].includes(reports)) return "Object";
            if (this.isPredicate) return "Diamond";

            return "Oval";
        }

        // fix up outlinePath for that
        api.wrapFunction(ReporterBlockMorph.prototype, "outlinePath", function (ctx, inset) {
            let shape = this.getBlockShape();
            let func = "outlinePath" + shape;

            if (this[func]) this[func](ctx, inset);
            else this.outlinePathOval(ctx, inset);
        }, true);

        // and drawEdges
        api.wrapFunction(ReporterBlockMorph.prototype, "drawEdges", function (ctx) {
            let shape = this.getBlockShape();
            let func = "drawEdges" + shape;

            if (this[func]) this[func](ctx);
            else this.drawEdgesOval(ctx);
        }, true);

        // rectangle shape
        ReporterBlockMorph.prototype.outlinePathRectangle = function (ctx, inset) {
            // not how i want to do it at all, but we need to do this so
            // c slots work fine (no color reporter should use one, but
            // i'm still gonna do this)

            // draw the 'flat' shape
            var h = this.height(),
                w = this.width(),
                pos = this.position(),
                corner = this.corner;

            // top left:
            ctx.arc(
                corner + inset,
                corner + inset,
                corner,
                radians(-180),
                radians(-90),
                false
            );

            // top right:
            ctx.arc(
                w - corner - inset,
                corner + inset,
                corner,
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
                w - corner - inset,
                h - corner - inset,
                corner,
                radians(0),
                radians(90),
                false
            );

            // bottom left:
            ctx.arc(
                corner + inset,
                h - corner - inset,
                corner,
                radians(90),
                radians(180),
                false
            );

            ctx.lineTo(inset, corner + inset); // close the path so we can clip it for rings
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

        ReporterBlockMorph.prototype.outlinePathObject = function (ctx, inset) {
            // draw the 'flat' shape:
            var w = this.width(),
                h = this.height(),
                h2 = Math.floor(h / 2),
                r = this.rounding,
                right = w - r,
                pos = this.position(),
                cslots = this.cSlots();

            ctx.moveTo(r, h2);
            ctx.lineTo(inset, inset);
            ctx.lineTo(right - inset, inset);

            if (cslots.length) {
                this.cSlots().forEach(slot => {
                    slot.outlinePath(ctx, inset, slot.position().subtract(pos));
                });
            } else {
                ctx.lineTo(w - inset, h2);
            }

            ctx.lineTo(right - inset, h - inset);
            ctx.lineTo(inset, h - inset);
        }
        ReporterBlockMorph.prototype.drawEdgesObject = function (ctx) {
            // add 3D-Effect
            var w = this.width(),
                h = this.height(),
                h2 = Math.floor(h / 2),
                r = this.rounding,
                shift = this.edge / 2,
                cslots = this.cSlots(),
                top = this.top(),
                y,
                gradient;

            ctx.lineWidth = this.edge;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            // half-tone edges
            // bottom left corner
            gradient = ctx.createLinearGradient(
                r,
                0,
                -r,
                0
            );
            gradient.addColorStop(1, this.cachedClr);
            gradient.addColorStop(0, this.cachedClrBright);
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(r, h2);
            ctx.lineTo(shift, h - shift);
            ctx.closePath();
            ctx.stroke();

            // normal gradient edges
            // top edge: left corner
            gradient = ctx.createLinearGradient(
                r,
                0,
                0,
                0
            );
            gradient.addColorStop(0, this.cachedClrBright);
            gradient.addColorStop(1, this.cachedClr);
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(r, h2);
            ctx.lineTo(shift, shift);
            ctx.closePath();
            ctx.stroke();

            // top edge: straight line
            gradient = ctx.createLinearGradient(
                0,
                0,
                0,
                this.edge
            );
            gradient.addColorStop(0, this.cachedClrBright);
            gradient.addColorStop(1, this.cachedClr);
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(shift, shift);

            // right edge
            if (cslots.length) {
                // end of top edge
                ctx.lineTo(w - r - shift, shift);
                ctx.closePath();
                ctx.stroke();

                // right vertical edge
                gradient = ctx.createLinearGradient(w - r - this.edge, 0, w - r, 0);
                gradient.addColorStop(0, this.cachedClr);
                gradient.addColorStop(1, this.cachedClrDark);

                ctx.lineWidth = this.edge;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.strokeStyle = gradient;

                ctx.beginPath();
                ctx.moveTo(w - r - shift, this.edge + shift);
                cslots.forEach(slot => {
                    y = slot.top() - top;
                    ctx.lineTo(w - r - shift, y);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(w - r - shift, y + slot.height());
                });
                ctx.lineTo(w - r - shift, h - shift);
                ctx.stroke();
            } else {
                // end of top edge
                ctx.lineTo(w - r, shift);
                ctx.closePath();
                ctx.stroke();

                // top diagonal slope right
                gradient = ctx.createLinearGradient(
                    w - r,
                    0,
                    w + r,
                    0
                );
                gradient.addColorStop(0, this.cachedClr);
                gradient.addColorStop(1, this.cachedClrDark);
                ctx.strokeStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(w - shift, h2);
                ctx.lineTo(w - r, shift);
                ctx.closePath();
                ctx.stroke();

                // bottom diagonal slope right
                gradient = ctx.createLinearGradient(
                    w - r,
                    0,
                    w,
                    0
                );
                gradient.addColorStop(0, this.cachedClr);
                gradient.addColorStop(1, this.cachedClrDark);
                ctx.strokeStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(w - r, h - shift);
                ctx.lineTo(w - shift, h2);
                ctx.closePath();
                ctx.stroke();
            }

            // bottom edge: straight line
            gradient = ctx.createLinearGradient(
                0,
                h - this.edge,
                0,
                h
            );
            gradient.addColorStop(0, this.cachedClr);
            gradient.addColorStop(1, this.cachedClrDark);
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(shift, h - shift);
            ctx.lineTo(w - r - shift, h - shift);
            ctx.closePath();
            ctx.stroke();
        }
        SyntaxElementMorph.prototype.fixLayout.__blockShapesModLoaded__ = true
        if (!SyntaxElementMorph.prototype.fixLayout.__isBlockShapes__) {
            SyntaxElementMorph.prototype.fixLayout = new Proxy(
                SyntaxElementMorph.prototype.fixLayout,
                {
                    apply(target, ctx, args) {
                        if (!SyntaxElementMorph.prototype.fixLayout.__blockShapesModLoaded__) {
                            return Reflect.apply(target, ctx, args)
                        };
                        let isObject = ctx.getBlockShape && (ctx.getBlockShape() === "Object")
                        if (isObject) {
                            ctx.isPredicate = true
                        }
                        console.warn(ctx, ctx.getBlockShape)
                        Reflect.apply(target, ctx, args)
                        if (isObject) {
                            const parts = ctx.parts();
                            ctx.bounds.setWidth(ctx.width() + ctx.corner)
                            parts.forEach((part) => part.setLeft(part.left() + ctx.corner))
                        }
                    }
                }
            )
            SyntaxElementMorph.prototype.fixLayout.__isBlockShapes__ = Symbol("thisIsBlockShapes")
        }   
        this.api.ide.refreshIDE();
    }

    // Cleanup function - get ran when the addon is "deleted"
    cleanupFunc() {
        // delete extra funcs
        delete ReporterBlockMorph.prototype.getBlockShape;
        delete ReporterBlockMorph.prototype.outlinePathRectangle;
        delete ReporterBlockMorph.prototype.drawEdgesRectangle;
        delete ReporterBlockMorph.prototype.outlinePathObject;
        delete ReporterBlockMorph.prototype.drawEdgesObject;
        SyntaxElementMorph.prototype.fixLayout.__blockShapesModLoaded__ = false
    }
}