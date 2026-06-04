return class extends Mod {
    // Metadata
    ID = "better-flat-design"; // the id of the addon
    NAME = "Better Flat Design"; // human-readable name
    DESCRIPTION = "Makes flat design BETTER!"; // description
    VERSION = "1.1.1"; // version
    AUTHOR = "d016"; // author
    DEPENDS = []; // dependencies (addon ids, useful for libraries)
    DO_MENU = false; // whether to add a menu item

    // Main function - gets ran when the addon is loaded
    main() {
        this.api.disallowSnaps("Split"); // split is a mod of snap to look like scratch, it already has better flat design

        this.api.wrapFunction(
            DialogBoxMorph.prototype,
            "render",
            function(ctx) {
                var gradient,
                    w = this.width(),
                    h = this.height(),
                    th = Math.floor(
                        fontHeight(this.titleFontSize) + (this.titlePadding * 2)
                    ),
                    shift = this.corner / 2,
                    x,
                    y,
                    isFlat = MorphicPreferences.isFlat && !this.is3D;

                // this.alpha = isFlat ? 0.9 : 1;

                // title bar
                if (isFlat) {
                    ctx.fillStyle = this.titleBarColor.toString();
                } else {
                    gradient = ctx.createLinearGradient(0, 0, 0, th);
                    gradient.addColorStop(
                        0,
                        this.titleBarColor.lighter(this.contrast / 2).toString(),
                    );
                    gradient.addColorStop(
                        1,
                        this.titleBarColor.darker(this.contrast).toString(),
                    );
                    ctx.fillStyle = gradient;
                }
                ctx.beginPath();
                this.outlinePathTitle(ctx, this.corner); // isFlat ? 0 : this.corner);
                ctx.closePath();
                ctx.fill();

                // flat shape
                // body
                ctx.fillStyle = this.color.toString();
                ctx.beginPath();
                this.outlinePathBody(ctx, this.corner); // isFlat ? 0 : this.corner);
                ctx.closePath();
                ctx.fill();

                if (isFlat) {
                    return;
                }

                // 3D-effect
                // bottom left corner
                gradient = ctx.createLinearGradient(0, h - this.corner, 0, h);
                gradient.addColorStop(0, this.color.toString());
                gradient.addColorStop(1, this.color.darker(this.contrast.toString()));

                ctx.lineWidth = this.corner;
                ctx.lineCap = "round";
                ctx.strokeStyle = gradient;

                ctx.beginPath();
                ctx.moveTo(this.corner, h - shift);
                ctx.lineTo(this.corner + 1, h - shift);
                ctx.stroke();

                // bottom edge
                gradient = ctx.createLinearGradient(0, h - this.corner, 0, h);
                gradient.addColorStop(0, this.color.toString());
                gradient.addColorStop(1, this.color.darker(this.contrast.toString()));

                ctx.lineWidth = this.corner;
                ctx.lineCap = "butt";
                ctx.strokeStyle = gradient;

                ctx.beginPath();
                ctx.moveTo(this.corner, h - shift);
                ctx.lineTo(w - this.corner, h - shift);
                ctx.stroke();

                // right body edge
                gradient = ctx.createLinearGradient(w - this.corner, 0, w, 0);
                gradient.addColorStop(0, this.color.toString());
                gradient.addColorStop(1, this.color.darker(this.contrast).toString());

                ctx.lineWidth = this.corner;
                ctx.lineCap = "butt";
                ctx.strokeStyle = gradient;

                ctx.beginPath();
                ctx.moveTo(w - shift, th);
                ctx.lineTo(w - shift, h - this.corner);
                ctx.stroke();

                // bottom right corner
                x = w - this.corner;
                y = h - this.corner;

                gradient = ctx.createRadialGradient(x, y, 0, x, y, this.corner);
                gradient.addColorStop(0, this.color.toString());
                gradient.addColorStop(1, this.color.darker(this.contrast.toString()));

                ctx.lineCap = "butt";

                ctx.strokeStyle = gradient;

                ctx.beginPath();
                ctx.arc(x, y, shift, radians(90), 0, true);
                ctx.stroke();

                // left body edge
                gradient = ctx.createLinearGradient(0, 0, this.corner, 0);
                gradient.addColorStop(0, this.color.lighter(this.contrast).toString());
                gradient.addColorStop(1, this.color.toString());

                ctx.lineCap = "butt";
                ctx.strokeStyle = gradient;

                ctx.beginPath();
                ctx.moveTo(shift, th);
                ctx.lineTo(shift, h - this.corner * 2);
                ctx.stroke();

                // left vertical bottom corner
                gradient = ctx.createLinearGradient(0, 0, this.corner, 0);
                gradient.addColorStop(0, this.color.lighter(this.contrast).toString());
                gradient.addColorStop(1, this.color.toString());

                ctx.lineCap = "round";
                ctx.strokeStyle = gradient;

                ctx.beginPath();
                ctx.moveTo(shift, h - this.corner * 2);
                ctx.lineTo(shift, h - this.corner - shift);
                ctx.stroke();
            },
            true,
        );
        this.api.wrapFunction(SliderMorph.prototype, "init", function() {
            this.target = null;
            this.action = null;
            this.start = start;
            this.stop = stop;
            this.value = value;
            this.size = size;
            this.offset = null;
            this.button = new SliderButtonMorph();
            this.button.isDraggable = false;
            this.button.alpha = MorphicPreferences.isFlat ? 0.7 : 1;
            this.button.color = MorphicPreferences.isFlat ?
                new Color(100, 100, 100) :
                new Color(200, 200, 200);
            this.button.highlightColor = new Color(210, 210, 255);
            this.button.pressColor = new Color(180, 180, 255);
            SliderMorph.uber.init.call(this, orientation);
            this.add(this.button);
            this.alpha = MorphicPreferences.isFlat ? 0.08 : 0.3;
            this.color = color || new Color(0, 0, 0);
            this.setExtent(new Point(20, 100));
            this.fixLayout();
        });
        this.api.wrapFunction(
            PushButtonMorph.prototype,
            "drawOutline",
            function(ctx) {
                var outlineStyle,
                    isFlat = MorphicPreferences.isFlat && !this.is3D,
                    isTransparent = this.color.a < 1;

                if (!this.outline) {
                    return null;
                }
                if (false) {
                    // this.outlineGradient && !(!this.outline || isFlat)) {
                    outlineStyle = ctx.createLinearGradient(0, 0, 0, this.height());
                    outlineStyle.addColorStop(0, this.outlineColor.darker().toString());
                    outlineStyle.addColorStop(1, "white");
                } else {
                    outlineStyle = this.outlineColor.toString();
                }
                ctx.fillStyle = outlineStyle;
                ctx.strokeStyle = outlineStyle;
                ctx.lineWidth = this.outline;
                ctx.beginPath();
                this.outlinePath(
                    ctx,
                    this.corner,
                    isTransparent ? this.outline / 2 : 0,
                );
                ctx.closePath();
                isTransparent ? ctx.stroke() : ctx.fill();
            },
            true,
        );
        this.api.wrapFunction(
            PushButtonMorph.prototype,
            "drawBackground",
            function(ctx, color) {
                var isFlat = MorphicPreferences.isFlat && !this.is3D;

                ctx.fillStyle = color.toString();
                ctx.beginPath();
                this.outlinePath(
                    ctx,
                    Math.max(this.corner - this.outline, 0),
                    this.outline,
                );
                ctx.closePath();
                ctx.fill();
                ctx.lineWidth = this.outline;
            },
            true,
        );
        this.api.wrapFunction(
            BooleanSlotMorph.prototype,
            "drawDiamond",
            function(ctx, progress) {
                var w = this.width(),
                    h = this.height(),
                    r = h / 2,
                    w2 = w / 2,
                    edge = MorphicPreferences.isFlat ? this.flatEdge : this.edge,
                    shift = edge / 2,
                    gradient;

                // draw the 'flat' shape:
                if (this.cachedNormalColor) {
                    // if flashing
                    ctx.fillStyle = this.color.toString();
                } else if (progress < 0) {
                    // 'fade'
                    ctx.fillStyle = this.color.darker(25).toString();
                } else {
                    switch (this.value) {
                        case true:
                            ctx.fillStyle = "rgb(0, 200, 0)";
                            break;
                        case false:
                            ctx.fillStyle = "rgb(200, 0, 0)";
                            break;
                        default:
                            ctx.fillStyle = this.color.darker(25).toString();
                    }
                }

                if (progress > 0 && !this.isEmptySlot()) {
                    // left half:
                    ctx.fillStyle = "rgb(0, 200, 0)";
                    ctx.beginPath();
                    ctx.moveTo(0, r);
                    ctx.lineTo(r, 0);
                    ctx.lineTo(w2, 0);
                    ctx.lineTo(w2, h);
                    ctx.lineTo(r, h);
                    ctx.closePath();
                    ctx.fill();

                    // right half:
                    ctx.fillStyle = "rgb(200, 0, 0)";
                    ctx.beginPath();
                    ctx.moveTo(w2, 0);
                    ctx.lineTo(w - r, 0);
                    ctx.lineTo(w, r);
                    ctx.lineTo(w - r, h);
                    ctx.lineTo(w2, h);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(0, r);
                    ctx.lineTo(r, 0);
                    ctx.lineTo(w - r, 0);
                    ctx.lineTo(w, r);
                    ctx.lineTo(w - r, h);
                    ctx.lineTo(r, h);
                    ctx.closePath();
                    ctx.fill();
                }

                // if (MorphicPreferences.isFlat) {return; }

                // add 3D-Effect:
                ctx.lineWidth = edge;
                ctx.lineJoin = "round";
                ctx.lineCap = "round";

                if (useBlurredShadows && !MorphicPreferences.isFlat) {
                    ctx.shadowOffsetX = shift;
                    ctx.shadowBlur = shift;
                    ctx.shadowColor = "black";
                }

                // top edge: left corner
                if (MorphicPreferences.isFlat) {
                    gradient = this.color.darker(this.contrast);
                } else {
                    gradient = ctx.createLinearGradient(
                        0,
                        r,
                        this.edge * 0.6,
                        r + this.edge * 0.6,
                    );
                    gradient.addColorStop(1, this.cachedClrDark);
                    gradient.addColorStop(0, this.cachedClr);
                }
                ctx.strokeStyle = gradient;

                ctx.beginPath();
                ctx.moveTo(shift, r);
                ctx.lineTo(r, shift);
                ctx.closePath();
                ctx.stroke();

                // top edge: left bottom corner
                if (MorphicPreferences.isFlat) {
                    ctx.beginPath();
                    ctx.moveTo(shift, h - r);
                    ctx.lineTo(r, h - shift);
                    ctx.closePath();
                    ctx.stroke();
                }

                // top edge: straight line
                if (useBlurredShadows && !MorphicPreferences.isFlat) {
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = shift;
                    ctx.shadowBlur = this.edge;
                }
                if (MorphicPreferences.isFlat) {
                    gradient = this.color.darker(this.contrast);
                } else {
                    gradient = ctx.createLinearGradient(0, 0, 0, this.edge);
                    gradient.addColorStop(1, this.cachedClrDark);
                    gradient.addColorStop(0, this.cachedClr);
                }
                ctx.strokeStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(r, shift);
                ctx.lineTo(w - r, shift);
                ctx.closePath();
                ctx.stroke();

                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 0;

                // bottom edge: right corner
                if (MorphicPreferences.isFlat) {
                    gradient = this.color.darker(this.contrast);
                } else {
                    gradient = ctx.createLinearGradient(
                        w - r - this.edge * 0.6,
                        h - this.edge * 0.6,
                        w - r,
                        h,
                    );
                    gradient.addColorStop(1, this.cachedClr);
                    gradient.addColorStop(0, this.cachedClrBright);
                }
                ctx.strokeStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(w - r, h - shift);
                ctx.lineTo(w - shift, r);
                ctx.closePath();
                ctx.stroke();

                // top edge: right corner
                if (MorphicPreferences.isFlat) {
                    ctx.beginPath();
                    ctx.moveTo(w - r, shift);
                    ctx.lineTo(w - shift, h - r);
                    ctx.closePath();
                    ctx.stroke();
                }

                // bottom edge: straight line
                if (MorphicPreferences.isFlat) {
                    gradient = this.color.darker(this.contrast);
                } else {
                    gradient = ctx.createLinearGradient(0, h - this.edge, 0, h);
                    gradient.addColorStop(1, this.cachedClr);
                    gradient.addColorStop(0, this.cachedClrBright);
                }
                ctx.strokeStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(r, h - shift);
                ctx.lineTo(w - r - shift, h - shift);
                ctx.closePath();
                ctx.stroke();
            },
            true,
        );
        this.api.wrapFunction(
            InputSlotMorph.prototype,
            "render",
            function(ctx) {
                var borderColor, r, fillStyle, edge;

                // initialize my surface property
                if (this.cachedNormalColor) {
                    // if flashing
                    borderColor = this.color;
                } else if (this.parent) {
                    borderColor = this.parent.color;
                } else {
                    borderColor = new Color(120, 120, 120);
                }
                fillStyle = this.color.toString();
                if (this.isReadOnly && !this.cachedNormalColor) {
                    // unless flashing
                    fillStyle = borderColor.darker().toString();
                }
                ctx.fillStyle = fillStyle;

                // cache my border colors
                this.cachedClr = borderColor.toString();
                this.cachedClrBright = borderColor.lighter(this.contrast).toString();
                this.cachedClrDark = borderColor.darker(this.contrast).toString();
                edge = MorphicPreferences.isFlat ? this.flatEdge : this.edge;
                if (!this.isNumeric) {
                    if (MorphicPreferences.isFlat) {
                        ctx.fillStyle = borderColor.darker(this.contrast).toString();
                        ctx.fillRect(0, 0, this.width(), this.height());
                        ctx.fillStyle = fillStyle;
                    }
                    ctx.fillRect(
                        edge,
                        edge,
                        this.width() - edge * 2,
                        this.height() - edge * 2,
                    );
                    if (!MorphicPreferences.isFlat) {
                        this.drawRectBorder(ctx);
                    }
                } else {
                    var drawRoundSlot = (e) => {
                        r = Math.max((this.height() - e * 2) / 2, 0);
                        ctx.beginPath();
                        ctx.arc(r + e, r + e, r, radians(90), radians(-90), false);
                        ctx.arc(
                            this.width() - r - e,
                            r + e,
                            r,
                            radians(-90),
                            radians(90),
                            false,
                        );
                        ctx.closePath();
                        ctx.fill();
                    };
                    if (MorphicPreferences.isFlat) {
                        ctx.fillStyle = borderColor.darker(this.contrast).toString();
                        drawRoundSlot(0);
                        ctx.fillStyle = fillStyle;
                    }

                    drawRoundSlot(edge);

                    if (!MorphicPreferences.isFlat) {
                        this.drawRoundBorder(ctx);
                    }
                }

                // draw my "wish" block, if any
                if (this.selectedBlock) {
                    ctx.drawImage(
                        this.doWithAlpha(1, () => this.selectedBlock.fullImage()),
                        this.edge + this.typeInPadding,
                        this.edge,
                    );
                }
            },
            true,
        );
        MorphicPreferences.isFlat = true;
        this.api.ide.refreshIDE();
    }
    cleanupFunc() {}
};