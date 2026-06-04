return class extends Mod {
  // Metadata
  ID = "split-blocks"; // the id of the mod
  NAME = "Split! blocks"; // human-readable name
  DESCRIPTION = "Split! blocks for Snap!"; // description
  VERSION = "1.0"; // version
  AUTHOR = "d016"; // author
  DEPENDS = []; // dependencies (mod ids, useful for libraries)
  OPTIONS_FORMAT = [
    {
      id: "squareStrings",
      name: "Use square string slots?",
      type: "boolean",
      default: false,
    },
    {
      id: "useSymbols",
      name: "Use Scratch symbols?",
      type: "boolean",
      default: true,
    },
  ];

  // Main function - gets ran when the mod is loaded
  main() {
    // allow access to the API in the menu functions and such, shortcut
    let api = this.api;
    api.disallowSnaps("Split");
    this.addEventListener("optionsChanged", () => {
      InputSlotMorph.prototype.squareStrings = this.options.squareStrings;
      api.world.rerender();
    });
    InputSlotMorph.prototype.isSquare = function () {
      return this.squareStrings
        ? !this.isNumeric && (!this.isReadOnly || this.isStatic)
        : this.isStatic || this instanceof TextSlotMorph;
    };
    api.wrapFunction(
      CommandBlockMorph.prototype,
      "nextBlock",
      function (block) {
        // set / get the block attached to my bottom
        if (block) {
          var nb = this.nextBlock(),
            affected = this.parentThatIsA(CommandSlotMorph, ReporterSlotMorph);
          this.add(block);
          if (nb) {
            block.bottomBlock().nextBlock(nb);
          }
          block.setPosition(
            new Point(this.left(), this.bottom() - this.corner - this.flatEdge),
          );
          if (affected) {
            affected.fixLayout();
          }
        } else {
          return detect(
            this.children,
            (child) => child instanceof CommandBlockMorph && !child.isPrototype,
          );
        }
      },
      true,
      2,
    );
    api.wrapFunction(
      SyntaxElementMorph.prototype,
      "setScale",
      function (num) {
        var scale = Math.max(num, 1);

        this.contrast = 20; //65;
        this.scale = scale;
        this.corner = 3 * scale;
        this.rounding = 9 * scale;
        this.edge = scale;
        this.flatEdge = scale * 0.65;
        this.jag = 10 * scale;
        this.dentPlus = 1.5 * scale;
        this.dentCorner = 3.5 * scale;
        this.inset = 6.5 * scale;
        this.hatHeight = 15 * scale;
        this.hatWidth = 60 * scale;
        this.rfBorder = 0 * scale;
        this.minWidth = 6 * scale;
        this.dent = 11 * scale;
        this.bottomPadding = 9 * scale; //7 * scale;
        this.cSlotPadding = 4 * scale;
        this.typeInPadding = 3 * scale;
        this.labelPadding = 4 * scale;
        this.labelFontName = "Helvetica, Arial"; //'Verdana';
        this.labelFontStyle = "sans-serif";
        this.fontSize = 9.5 * scale; //10 * scale;
        this.embossing = new Point(
          -1 * Math.max(scale / 2, 1),
          -1 * Math.max(scale / 2, 1),
        );
        this.labelWidth = 450 * scale;
        this.labelWordWrap = true;
        this.dynamicInputLabels = true;
        this.feedbackMinHeight = 5;
        this.minSnapDistance = 20;
        this.reporterDropFeedbackPadding = 10 * scale;
        this.labelContrast = 25;
        this.activeHighlight = new Color(255, 242, 0);
        this.errorHighlight = new Color(255, 0, 0);
        this.activeBlur = 8 * this.scale;
        this.activeBorder = 3 * this.scale;
        this.rfColor = new Color(120, 120, 120);
      },
      true,
      2,
    );
    api.wrapFunction(
      SyntaxElementMorph.prototype,
      "fixLayout",
      function () {
        var nb,
          parts = this.parts(),
          pos = this.position(),
          x = 0,
          y,
          isReporter = this instanceof ReporterBlockMorph,
          lineHeight = 0,
          maxX = 0,
          blockWidth = this.minWidth,
          blockHeight,
          myself = this,
          l = [],
          lines = [],
          space = this.isPrototype
            ? 1
            : Math.floor(fontHeight(this.fontSize) / 3),
          ico =
            this instanceof BlockMorph && this.hasLocationPin()
              ? this.methodIconExtent().x + space
              : 0,
          bottomCorrection,
          rightCorrection = 0,
          rightMost,
          hasLoopCSlot = false,
          hasLoopArrow = false;

        if (this instanceof MultiArgMorph && this.slotSpec !== "%cs") {
          blockWidth += this.arrows().width() / 2;
        } else if (isReporter) {
          blockWidth += this.rounding * 2 + this.edge * 2;
        } else {
          blockWidth +=
            this.corner * 0.9 + this.edge * 2 + this.inset * 2.5 + this.dent;
        }

        if (this.nextBlock) {
          nb = this.nextBlock();
        }

        // determine lines
        parts.forEach((part) => {
          if (
            part instanceof CSlotMorph ||
            (part instanceof MultiArgMorph && part.slotSpec.includes("%cs"))
          ) {
            if (l.length > 0) {
              lines.push(l);
              lines.push([part]);
              l = [];
              x = 0;
            } else {
              lines.push([part]);
            }
          } else if (this.isVertical() && !(part instanceof FrameMorph)) {
            // variadic ring-inputs are arranged vertically
            // except the arrows for expanding and collapsing them
            if (l.length > 0) {
              lines.push(l);
            }
            if (part.isVisible) {
              // ignore hidden collapse labels
              l = [part];
              x = part.fullBounds().width() + space;
            }
          } else {
            if (part.isVisible) {
              x += part.fullBounds().width() + space;
            }
            if (x > this.labelWidth || part.isBlockLabelBreak) {
              if (l.length > 0) {
                lines.push(l);
                l = [];
                x = part.fullBounds().width() + space;
              }
            }
            l.push(part);
            if (part.isBlockLabelBreak) {
              x = 0;
            }
          }
        });
        if (l.length > 0) {
          lines.push(l);
        }

        // distribute parts on lines
        if (this instanceof CommandBlockMorph) {
          y = this.top() + this.corner + this.edge;
          if (this instanceof HatBlockMorph) {
            y += this.hatHeight;
          }
        } else if (isReporter) {
          y = this.top() + this.edge * 2;
        } else if (
          this instanceof MultiArgMorph ||
          this instanceof ArgLabelMorph
        ) {
          y = this.top();
          if (this.slotSpec === "%cs" && this.inputs().length > 0) {
            y -= this.rounding;
          }
        }

        this.lineCount = lines.length;
        lines.forEach((line, index) => {
          if (hasLoopCSlot) {
            hasLoopArrow = true;
            hasLoopCSlot = false;
          }
          x =
            this.left() +
            ico +
            this.edge +
            this.labelPadding /
              ((line[0] instanceof InputSlotMorph ||
                line[0] instanceof BooleanSlotMorph) &&
              this.constructor.name.includes("ReporterBlockMorph") &&
              !line[0]?.isSquare?.()
                ? 2
                : 1);
          if (this instanceof RingMorph) {
            x = this.left() + space; //this.labelPadding;
          } else if (this?.isPredicate) {
            x =
              this.left() +
              ico +
              this.rounding *
                (line[0] instanceof BlockLabelMorph ||
                line[0].constructor.name ==
                  "BlockLabelFragmentPlaceHolderMorph" ||
                line[0] instanceof BooleanSlotMorph ||
                (line[0] instanceof MultiArgMorph &&
                  line[0].slotSpec.includes("%b"))
                  ? 1.1
                  : 1.4);
          } else if (
            this instanceof MultiArgMorph ||
            this instanceof ArgLabelMorph
          ) {
            x = this.left();
          } else if (
            isReporter &&
            (line[0] instanceof BlockLabelMorph ||
              line[0].constructor.name == "BlockLabelFragmentPlaceHolderMorph")
          ) {
            x =
              this.left() +
              ico +
              this.edge +
              this.labelPadding *
                (line[0] instanceof InputSlotMorph ||
                line[0] instanceof BooleanSlotMorph
                  ? 1
                  : 1.5);
          }

          y += lineHeight;

          lineHeight = 0;
          line.forEach((part, partIndex) => {
            if (part.isLoop) {
              hasLoopCSlot = true;
            }
            if (
              index == 0 &&
              !part?.isBlockLabelBreak &&
              (part instanceof InputSlotMorph ||
                part instanceof BooleanSlotMorph ||
                part instanceof ReporterBlockMorph ||
                (!(part instanceof BlockLabelMorph) &&
                  !(
                    part.constructor.name ==
                    "BlockLabelFragmentPlaceHolderMorph"
                  ) &&
                  !(part instanceof CSlotMorph) &&
                  !(part instanceof ArrowMorph) &&
                  !(
                    part instanceof MultiArgMorph &&
                    part.slotSpec.includes("%cs")
                  ) &&
                  !(part instanceof SymbolMorph))) &&
              this.constructor.name.includes("CommandBlockMorph")
            ) {
              if (typeof x == "number") {
                x = Math.max(
                  x,
                  this.left() + this.dent + this.inset + this.corner * 4,
                );
              }
            }

            if (part instanceof CSlotMorph) {
              x -= this.corner / 2;
              if (this.isPredicate) {
                x = this.left() + ico + this.rounding;
              }
              part.setColor(this.color);
              part.setPosition(new Point(x, y));
              lineHeight = part.height();
            } else if (
              part instanceof MultiArgMorph &&
              part.slotSpec.includes("%cs")
            ) {
              if (this.isPredicate) {
                x += this.corner;
              }
              part.setPosition(new Point(x, y));
              lineHeight = part.height();
              maxX = Math.max(
                maxX,
                Math.max(
                  ...part.children
                    .filter(
                      (each) => each.isVisible && !(each instanceof CSlotMorph),
                    )
                    .map((each) => each.right()),
                ),
              );
            } else {
              if (part?.name == "loop") {
                y += part.scale * 10;
              }
              if (
                ((!line[0].isVisible && partIndex == 1) || partIndex == 0) &&
                part instanceof BooleanSlotMorph
              ) {
                x -= this.labelPadding * 1.5;
              }
              if (
                this.isPredicate &&
                partIndex === 0 &&
                !(part instanceof ArgMorph)
              ) {
                x += this.rounding / 4;
              }
              part.setPosition(new Point(x, y));
              if (!part.isBlockLabelBreak) {
                if (part.slotSpec === "%c" || part.slotSpec === "%loop") {
                  x += part.width();
                } else if (part.isVisible) {
                  let getPartSpace = (i) =>
                    line[i] instanceof SymbolMorph ||
                    (line[i + 1] || {}) instanceof SymbolMorph
                      ? space / 2
                      : 0;
                  x +=
                    part.fullBounds().width() + space + getPartSpace(partIndex);
                }
              }
              maxX = Math.max(maxX, x);
              lineHeight = Math.max(
                lineHeight,
                part instanceof SymbolMorph &&
                  SymbolMorph.prototype.extensionSymbolNames.includes(part.name)
                  ? part.height() * (isReporter ? 1 : 1.25)
                  : part instanceof StringMorph
                    ? part.rawHeight()
                    : part.height(),
              );
            }
            var i = this instanceof CommandBlockMorph ? -2 : 0,
              isCommand = this instanceof CommandBlockMorph;
            lineHeight =
              Math.max(
                lineHeight - i,
                isCommand && index == 0
                  ? this.scale * 22
                  : isCommand
                    ? this.scale * 15
                    : this.scale * 18,
              ) + i;
          });

          // adjust label row below a loop-arrow C-slot to accomodate the loop icon
          if (hasLoopArrow) {
            x += this.fontSize * 1.5;
            maxX = Math.max(maxX, x);
            hasLoopArrow = false;
          }

          // center parts vertically on each line:
          line.forEach((part) => {
            part.moveBy(
              new Point(
                0,
                Math.floor((lineHeight - part.height()) / 2) -
                  (part instanceof SymbolMorph &&
                  SymbolMorph.prototype?.extensionSymbolNames?.includes?.(
                    part.name,
                  )
                    ? this.scale * (isReporter ? 0 : -2)
                    : part instanceof BlockLabelMorph
                      ? 0.2 * this.scale
                      : 0),
              ),
            );
          });
        });

        // determine my height:
        y += lineHeight;
        if (this.children.some((any) => any instanceof CSlotMorph)) {
          bottomCorrection = this.bottomPadding;
          rightMost = this.inputs()[this.inputs().length - 1];
          if (rightMost instanceof MultiArgMorph) {
            bottomCorrection = -this.bottomPadding;
            if (rightMost.slotSpec.includes("%cs")) {
              if (rightMost.inputs().length) {
                bottomCorrection -= this.bottomPadding / 2;
              } else {
                bottomCorrection += this.bottomPadding / 2;
              }
            }
          }
          if (isReporter && !this.isPredicate) {
            bottomCorrection = Math.max(
              this.bottomPadding,
              this.rounding - this.bottomPadding,
            );
          }
          y += bottomCorrection;
        }
        if (this instanceof CommandBlockMorph) {
          blockHeight = y - this.top() + this.corner * 2;
        } else if (isReporter) {
          blockHeight = y - this.top() + this.edge * 2;
        } else if (
          this instanceof MultiArgMorph ||
          this instanceof ArgLabelMorph
        ) {
          blockHeight = y - this.top();
        }

        // determine my width:
        if (this.isPredicate) {
          blockWidth = Math.max(blockWidth, maxX - this.left() + this.rounding);
          rightCorrection = space;
        } else if (
          (this instanceof MultiArgMorph && this.slotSpec !== "%cs") ||
          this instanceof ArgLabelMorph
        ) {
          blockWidth = Math.max(
            blockWidth,
            maxX -
              this.left() -
              space *
                (this.arrows && this.arrows().children[1].isVisible ? 1.5 : 0),
          );
        } else {
          blockWidth = Math.max(
            blockWidth,
            maxX - this.left() + this.labelPadding * 1 - this.edge,
          );
          rightCorrection = space;
        }

        // adjust right padding if rightmost input has arrows
        rightMost = parts[parts.length - 1];
        if (
          rightMost instanceof MultiArgMorph &&
          rightMost.isVisible &&
          lines.length === 1
        ) {
          blockWidth -= rightCorrection;
        }
        // adjust right padding if rightmost input in a reporter is round
        if (
          rightMost instanceof InputSlotMorph &&
          !rightMost?.isSquare() &&
          isReporter &&
          lines.length === 1
        ) {
          blockWidth -= this.labelPadding / 2;
        }
        if (
          rightMost instanceof BooleanSlotMorph &&
          isReporter &&
          lines.length === 1
        ) {
          blockWidth -= this.labelPadding * 1.5;
        }

        // adjust width to hat width
        if (this instanceof HatBlockMorph) {
          blockWidth = Math.max(blockWidth, this.hatWidth * 1.1);
        }
        // adjust CSlotMorphs

        if (
          !(this.constructor.name == "JaggedBlockMorph") &&
          parts.some((part) => part instanceof CSlotMorph)
        ) {
          blockWidth = Math.max(blockWidth, 89 * this.scale);
        }

        // center text in ReporterBlockMorph
        if (lines.length == 1 && isReporter) {
          lines.forEach((line) => {
            if (
              ((line.length == 2 && line[0].isBlockLabelBreak) ||
                line.length === 1) &&
              isReporter &&
              !parts.some((part) => part instanceof CSlotMorph)
            ) {
              line[0].moveBy(
                new Point(
                  Math.floor(blockWidth - line[0].width()) / 2 -
                    (line[0].left() - this.left()),
                  0,
                ),
              );
            }
          });
        }

        // set my extent (silently, because we'll redraw later anyway):
        this.alwaysRound = lines.length == 1;
        if (lines.length > 0) {
          if (
            this.isPredicate &&
            lines.length > 0 &&
            !(lines[Math.floor(lines.length / 2)].at(-1) instanceof ArgMorph)
          ) {
            blockWidth += this.rounding / 4;
          }
        }
        this.bounds.setWidth(blockWidth);
        this.bounds.setHeight(
          blockHeight + (this instanceof CommandBlockMorph ? this.dentPlus : 0),
        );

        // adjust CSlots and collect holes
        this.containsCSlot = false;
        this.holes = [];
        parts.forEach((part) => {
          var adjustMultiWidth = 0;
          if (
            part instanceof CSlotMorph ||
            (part.slotSpec && part.slotSpec.includes("%cs"))
          ) {
            this.containsCSlot = true;
            if (this.isPredicate) {
              adjustMultiWidth = blockHeight / 2;
              part.bounds.corner.x = blockWidth;
            } else {
              part.setRight(this.right());
              part.setLeft(this.left() + this.labelPadding);
              part.bounds.corner.x = part.parent.right();
              //part.setWidth(this.width() - this.labelPadding);
              //adjustMultiWidth = this.corner + this.edge;
            }
            if (part.fixLoopLayout) {
              part.fixLoopLayout();
            }
          }
          if (part instanceof MultiArgMorph && part.slotSpec.includes("%cs")) {
            part
              .inputs()
              .filter((each) => each instanceof CSlotMorph)
              .forEach(
                (slot) => (
                  !(slot instanceof ArrowMorph) &&
                    slot.setLeft(this.left() + this.labelPadding),
                  slot.bounds.setWidth(part.right() - slot.left())
                ),
              );
          }
          part.fixHolesLayout();
          this.holes.push.apply(
            this.holes,
            part.holes.map((hole) =>
              hole.translateBy(part.position().subtract(pos)),
            ),
          );
        });

        // position next block:
        if (nb) {
          nb.setPosition(
            new Point(
              this.left(),
              this.bottom() - (this.corner + this.dentPlus + this.flatEdge),
            ),
          );
        }

        // find out if one of my parents needs to be fixed
        if (
          this instanceof BlockMorph &&
          this.parent &&
          this.parent.fixLayout
        ) {
          this.parent.fixLayout();
          this.parent.changed();
          if (this.parent instanceof SyntaxElementMorph) {
            return;
          }
        }

        this.fixHighlight();
      },
      true,
      2,
    );
    api.wrapFunction(
      BlockLabelMorph.prototype,
      "init",
      function () {
        this.isBold = !this.isBold;
        this.fixLayout();
      },
      false,
      2,
    );
    api.wrapFunction(
      ReporterBlockMorph.prototype,
      "init",
      function () {
        this.alwaysRound = false;
        delete this.alpha; // ugh
      },
      false,
      2,
    );
    api.wrapFunction(
      BlockMorph.prototype,
      "render",
      function (ctx) {
        this.cachedClr = this.color.toString();
        this.cachedClrBright = this.bright();
        this.cachedClrDark = this.dark();

        if (MorphicPreferences.isFlat) {
          /*// draw the outline
    ctx.fillStyle = this.cachedClrDark;
    ctx.beginPath();
    this.outlinePath(ctx, 0);
    ctx.closePath();
    ctx.fill();*/
          ctx.strokeStyle = this.cachedClrDark;
          ctx.lineWidth = this.flatEdge;

          // draw the inner filled shaped
          ctx.fillStyle = this.cachedClr;
          ctx.beginPath();
          this.outlinePath(ctx, this.flatEdge / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          // draw the flat shape
          ctx.fillStyle = this.cachedClr;
          ctx.beginPath();
          this.outlinePath(ctx, 0);
          ctx.closePath();
          ctx.fill();

          // add 3D-Effect:
          this.drawEdges(ctx);
        }

        // draw infinity / chain link icon if applicable
        if (this.isRuleHat()) {
          this.drawRuleIcon(ctx);
        }

        // draw location pin icon if applicable
        if (this.hasLocationPin()) {
          this.drawMethodIcon(ctx);
        }
      },
      true,
      2,
    );
    api.wrapFunction(
      CommandBlockMorph.prototype,
      "outlinePath",
      function (ctx, inset) {
        var indent = this.corner * 2 + this.inset,
          bottom = this.height() - this.corner,
          bottomCorner = this.height() - this.corner * 2,
          radius = Math.max(this.corner - inset, 0),
          pos = this.position();

        // top left:
        ctx.arc(
          this.corner,
          this.corner,
          radius,
          radians(-180),
          radians(-90),
          false,
        );

        // top dent:
        if (false) {
          ctx.lineTo(this.corner + this.inset, inset); //before dent
          ctx.arc(
            this.corner / 2 + this.inset,
            this.corner,
            radius,
            radians(-90),
            radians(-45),
            false,
          );
          ctx.lineTo(indent / 1.1, this.corner / 2 + this.dentPlus + inset); //left edge of dent
          if (false) {
            ctx.arc(
              indent + this.corner / 2,
              (this.corner + this.dentPlus + inset) / 1.5,
              radius,
              radians(45),
              radians(180),
              false,
            );
          }
          ctx.lineTo(indent, this.corner + this.dentPlus + inset);
          ctx.lineTo(indent + this.dent, this.corner + this.dentPlus + inset);
          ctx.lineTo(this.corner * 3 + this.inset + this.deltaPoint, inset); //right edge
          ctx.arc(
            this.corner * 3.5 + this.inset + this.dent,
            this.corner,
            radius,
            radians(-135),
            radians(-90),
            false,
          );
        } else {
          var w = this.dent * 1.75 + this.corner / 2,
            h = this.corner + this.dentPlus + inset / 2,
            offset = this.inset + this.corner / 2,
            c = this.dentCorner;
          this.drawRoundedDent(ctx, inset, 0, 0);
        }

        ctx.lineTo(this.width() - this.corner, inset); // after dent

        // top right:
        ctx.arc(
          this.width() - this.corner,
          this.corner,
          radius,
          radians(-90),
          radians(-0),
          false,
        );

        // C-Slots
        this.cSlots().forEach((slot) => {
          slot.outlinePath(ctx, inset, slot.position().subtract(pos));
        });

        // bottom right:
        ctx.arc(
          this.width() - this.corner,
          bottomCorner - this.dentPlus,
          radius,
          radians(0),
          radians(90),
          false,
        );

        if (!this.isStop()) {
          if (false) {
            ctx.lineTo(
              this.width() - this.corner,
              bottom - inset - this.dentPlus,
            );
            ctx.lineTo(
              this.corner * 3 + this.inset + this.dent,
              bottom - inset + 0 - this.dentPlus,
            );
            ctx.lineTo(indent + this.dent, bottom + this.corner - inset + 0);
            ctx.lineTo(indent, bottom + this.corner - inset - 0);
            ctx.arc(
              this.corner / 0.9 + this.inset,
              bottom + inset,
              radius,
              radians(-90),
              radians(-45),
              false,
            );
          } else {
            this.drawRoundedDent(
              ctx,
              inset,
              0,
              bottom - this.dentPlus * 1.5,
              true,
            );
          }
          ctx.lineTo(this.corner + this.inset, bottom - inset - this.dentPlus);
        }

        // bottom left:
        ctx.arc(
          this.corner,
          bottomCorner - this.dentPlus,
          radius,
          radians(90),
          radians(180),
          false,
        );
      },
      true,
      2,
    );
    api.wrapFunction(
      ReporterBlockMorph.prototype,
      "outlinePathOval",
      function (ctx, inset) {
        // draw the 'flat' shape
        var h = this.height(),
          w = this.width(),
          r =
            this instanceof TemplateSlotMorph ||
            (this?.alwaysRound && !(this instanceof RingMorph))
              ? Math.min(h / 2, w / 2)
              : Math.min(Math.round(1.5 * this.rounding), h / 2),
          radius = Math.max(r - inset, 0),
          pos = this.position();

        // top left:
        ctx.arc(r, r, radius, radians(-180), radians(-90), false);

        // top right:
        ctx.arc(w - r, r, radius, radians(-90), radians(-0), false);

        // C-Slots
        this.cSlots().forEach((slot) => {
          slot.outlinePath(ctx, inset, slot.position().subtract(pos));
        });

        // bottom right:
        ctx.arc(w - r, h - r, radius, radians(0), radians(90), false);

        // bottom left:
        ctx.arc(r, h - r, radius, radians(90), radians(180), false);

        ctx.lineTo(r - radius, r); // close the path so we can clip it for rings
      },
      true,
      2,
    );
    api.wrapFunction(
      ReporterBlockMorph.prototype,
      "outlinePathDiamond",
      function (ctx, inset) {
        // draw the 'flat' shape:
        var w = this.width(),
          h = this.height(),
          h2 = Math.floor(h / 2),
          r = h / 2,
          right = w - r,
          pos = this.position(),
          cslots = this.cSlots();

        ctx.moveTo(inset, h2);
        ctx.lineTo(r, inset);
        ctx.lineTo(right - inset, inset);

        if (cslots.length) {
          this.cSlots().forEach((slot) => {
            slot.outlinePath(ctx, inset, slot.position().subtract(pos));
          });
        } else {
          ctx.lineTo(w - inset, h2);
        }

        ctx.lineTo(right - inset, h - inset);
        ctx.lineTo(r, h - inset);
      },
      true,
      2,
    );
    TemplateSlotMorph.prototype.outlinePath =
      ReporterBlockMorph.prototype.outlinePathOval; // ugh
    SyntaxElementMorph.prototype.drawRoundedDent = function (
      ctx,
      inset,
      x,
      y,
      reverse,
    ) {
      var w = this.dent * 1.75 + this.corner / 2,
        h = this.corner + this.dentPlus + inset,
        offset = this.inset + this.corner / 2,
        c = this.dentCorner;
      if (!isNil(x)) {
        ctx.save();
        ctx.translate(x || 0, y || 0);
      }
      if (reverse) {
        ctx.translate(w + offset * 2, 0);
        ctx.scale(-1, 1);
      }
      ctx.lineTo(0 + offset, -h + h + inset);
      ctx.bezierCurveTo(
        c + offset,
        -h + h + inset,
        c + offset,
        -0 + h + inset,
        c * 2 + offset,
        -0 + h + inset / 4,
      );
      ctx.lineTo(w - c * 2 + offset, h + inset / 4);
      ctx.bezierCurveTo(
        w - c + offset,
        0 + h + inset,
        w - c + offset,
        -h + h + inset,
        w + offset,
        -h + h + inset,
      );
      if (!isNil(x)) {
        ctx.restore();
      }
    };

    // Input Slots
    api.wrapFunction(
      InputSlotMorph.prototype,
      "fixLayout",
      function () {
        var width,
          height,
          arrowWidth,
          contents = this.contents(),
          arrow = this.arrow(),
          tp = this.topBlock();

        contents.isNumeric = this.isNumeric && !this.isAlphanumeric;
        contents.isEditable = !this.isReadOnly;
        this.hoverCursor = this.isReadOnly ? "pointer" : "text";
        if (this.isReadOnly) {
          contents.disableSelecting();
          contents.color = WHITE;
        } else {
          contents.enableSelecting();
          contents.color = new Color(87, 94, 117);
          //contents.color = new Color(87, 94, 117);
        }
        arrow.color =
          this.isReadOnly || this.isStatic ? WHITE : new Color(87, 94, 117);

        if (this.choices) {
          arrow.setSize(10 * this.scale);
          arrow.show();
        } else {
          arrow.hide();
        }
        arrowWidth = arrow.isVisible ? arrow.width() + 4 * this.scale : 0;
        var arrowWidth0 = arrow.isVisible ? arrow.width() : 0;

        // determine slot dimensions
        if (this.selectedBlock) {
          // a "wish" in the OF-block's left slot
          height = this.selectedBlock.height() + this.edge * 2;
          width =
            this.selectedBlock.width() +
            arrowWidth +
            this.edge * 2 +
            this.typeInPadding * 2;
        } else {
          if (this.symbol) {
            this.symbol.fixLayout();
            this.symbol.setPosition(this.position().add(this.edge * 2));
            height = this.symbol.height() + this.edge * 4;
            width =
              this.symbol.width() +
              arrowWidth +
              this.edge * 4 +
              this.typeInPadding * 2;
          }
          height = contents.height() + this.edge * 8; // + this.typeInPadding * 2
          if (!(this instanceof TextSlotMorph || this.isStatic)) {
            width = Math.max(
              contents.width() +
                Math.floor(arrowWidth * 0.5) +
                height +
                arrowWidth / 6 -
                this.typeInPadding * 1.5,
              this.scale * (this.isReadOnly ? 30 : 24),
            );
          } else {
            width = Math.max(
              contents.width() +
                arrowWidth +
                this.edge * (arrowWidth > 0 ? 2 : 6) +
                arrowWidth / 6 +
                this.typeInPadding,
              contents.rawHeight // single vs. multi-line contents
                ? contents.rawHeight() + arrowWidth
                : fontHeight(contents.fontSize) / 1.3 + arrowWidth,
              this.scale * (this.isReadOnly ? 30 : 24), //this.minWidth // for text-type slots
            );
          }
        }
        this.bounds.setExtent(new Point(width, height));
        //move everything inside
        if (true) {
          //this.isReadOnly || !(this instanceof TextSlotMorph)) {
          //this.isNumeric) {
          contents.setPosition(
            new Point(
              Math.floor(width / 2) -
                contents.width() / 2 -
                this.typeInPadding -
                arrowWidth / 3,
              this.edge + this.typeInPadding * 0.9,
            )
              .add(new Point(this.typeInPadding, 0))
              .add(this.position()),
          );
        } else {
          contents.setPosition(
            new Point(this.edge, this.edge + this.typeInPadding * 0.7)
              .add(new Point(this.typeInPadding, 0))
              .add(this.position()),
          );
        }

        if (arrow.isVisible) {
          arrow.setCenter(this.center());
          arrow.setPosition(
            new Point(
              this.right() - arrowWidth - this.edge,
              arrow.top() - arrowWidth0 / 5,
            ),
          );
        }

        if (this.parent && this.parent.fixLayout) {
          tp.fullChanged();
          this.parent.fixLayout();
          tp.fullChanged();
        }
      },
      true,
      2,
    );
    api.wrapFunction(
      InputSlotMorph.prototype,
      "render",
      function (ctx) {
        var borderColor, r;

        // initialize my surface property
        if (this.cachedNormalColor) {
          // if flashing
          borderColor = this.color;
        } else if (this.parent) {
          borderColor = this.parent.color;
        } else {
          borderColor = new Color(120, 120, 120);
        }
        ctx.fillStyle = this.color.toString();
        if (this.isReadOnly && !this.cachedNormalColor) {
          // unless flashing
          ctx.fillStyle = borderColor.darker(10).toString();
          if (this.isStatic) {
            ctx.fillStyle = borderColor.toString();
          }
        }

        // cache my border colors
        this.cachedClr = borderColor.toString();
        this.cachedClrBright = borderColor.lighter(this.contrast).toString();
        this.cachedClrDark = borderColor.darker(this.contrast).toString();
        ctx.strokeStyle = this.parent.color.darker(20).toString();
        ctx.lineWidth = this.flatEdge * 2;
        if (this.isSquare()) {
          ctx.beginPath();
          ctx.save();
          ctx.translate(ctx.lineWidth / 1.5, ctx.lineWidth / 1.5);
          ctx.arc(
            this.corner,
            this.corner,
            this.corner,
            radians(-180),
            radians(-90),
          );
          ctx.arc(
            this.width() - this.corner * 1.5,
            this.corner,
            this.corner,
            radians(-90),
            radians(0),
          );
          ctx.arc(
            this.width() - this.corner * 1.5,
            this.height() - this.corner * 1.5,
            this.corner,
            radians(0),
            radians(90),
          );
          ctx.arc(
            this.corner,
            this.height() - this.corner * 1.5,
            this.corner,
            radians(90),
            radians(180),
          );
          ctx.arc(
            this.corner,
            this.corner,
            this.corner,
            radians(-180),
            radians(-90),
          );
          ctx.stroke();
          ctx.fill();
          ctx.restore();
          if (!MorphicPreferences.isFlat) {
            this.drawRectBorder(ctx);
          }
        } else {
          r = Math.max((this.height() - this.edge * 2) / 2, 0);
          ctx.beginPath();
          ctx.arc(
            r + this.edge,
            r + this.edge,
            r,
            radians(90),
            radians(-90),
            false,
          );
          ctx.arc(
            this.width() - r - this.edge,
            r + this.edge,
            r,
            radians(-90),
            radians(90),
            false,
          );
          ctx.closePath();

          ctx.stroke();
          ctx.fill();
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
      2,
    );
    api.wrapFunction(
      BooleanSlotMorph.prototype,
      "fixLayout",
      function () {
        // determine my extent
        var text, h;
        if (this.isWide()) {
          text = this.textLabelExtent();
          h = text.y + this.edge * 3;
          this.bounds.setWidth(text.x + h * 1 + this.edge * 2);
          this.bounds.setHeight(this.fontSize * 1.3 + this.edge * 7);
        } else {
          this.bounds.setWidth((this.fontSize + this.edge * 3) * 2.2);
          this.bounds.setHeight(this.fontSize + this.edge * 8);
        }
      },
      true,
      2,
    );
    api.wrapFunction(
      BooleanSlotMorph.prototype,
      "drawDiamond",
      function (ctx, progress) {
        var w = this.width(),
          h = this.height(),
          r = h / 2,
          w2 = w / 2,
          shift = this.edge / 2,
          gradient;

        // "tick:"
        var drawTick = () => {
          var w = this.width(),
            r = this.height() / 2 - this.edge,
            r2 = r / 2,
            shift = this.edge / 2,
            text,
            x,
            y = this.height() / 2;
          x = this.width() / 2;
          if (!MorphicPreferences.isFlat && useBlurredShadows) {
            ctx.shadowOffsetX = -shift;
            ctx.shadowOffsetY = -shift;
            ctx.shadowBlur = shift;
            ctx.shadowColor = "rgb(0, 100, 0)";
          }
          ctx.strokeStyle = "white";
          ctx.lineWidth = this.edge + shift;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(x - r2, y);
          ctx.lineTo(x, y + r2);
          ctx.lineTo(x + r2, r2 + this.edge);
          ctx.stroke();
        };

        // "cross:"
        var drawCross = () => {
          var w = this.width(),
            r = this.height() / 2 - this.edge,
            r2 = r / 2,
            shift = this.edge / 2,
            text,
            x,
            y = this.height() / 2;
          x = this.width() / 2;
          if (!MorphicPreferences.isFlat && useBlurredShadows) {
            ctx.shadowOffsetX = -shift;
            ctx.shadowOffsetY = -shift;
            ctx.shadowBlur = shift;
            ctx.shadowColor = "rgb(100, 0, 0)";
          }
          ctx.strokeStyle = "white";
          ctx.lineWidth = this.edge + shift;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(x - r2, y - r2);
          ctx.lineTo(x + r2, y + r2);
          ctx.moveTo(x - r2, y + r2);
          ctx.lineTo(x + r2, y - r2);
          ctx.stroke();
        };

        // draw the 'flat' shape:
        var clr;
        if (this.cachedNormalColor) {
          // if flashing
          clr = this.color;
        } else {
          switch (this.value) {
            case true:
              clr = new Color(0, 200, 0);
              break;
            case false:
              clr = new Color(200, 0, 0);
              break;
            default:
              clr = this.color.darker(25);
          }
        }
        if (progress == -1) {
          clr = this.color.darker(10);
        }
        ctx.fillStyle = clr.toString();

        if (progress > 0) {
          var rightHalf = () => {
              ctx.fillStyle = this.isEmptySlot()
                ? this.color.darker(25).toString()
                : "rgb(200, 0, 0)";
              ctx.beginPath();
              ctx.moveTo(w2, 0);
              ctx.lineTo(w - r, 0);
              ctx.lineTo(w, r);
              ctx.lineTo(w - r, h);
              ctx.lineTo(w2, h);
              ctx.closePath();
              ctx.fill();
            },
            leftHalf = () => {
              ctx.fillStyle = "rgb(0, 200, 0)";
              ctx.beginPath();
              ctx.moveTo(0, r);
              ctx.lineTo(r, 0);
              ctx.lineTo(w2, 0);
              ctx.lineTo(w2, h);
              ctx.lineTo(r, h);
              ctx.closePath();

              ctx.fill();
            };

          // right half:

          rightHalf();

          // left half:
          leftHalf();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, r);
          ctx.lineTo(r, 0);
          ctx.lineTo(w - r, 0);
          ctx.lineTo(w, r);
          ctx.lineTo(w - r, h);
          ctx.lineTo(r, h);
          ctx.closePath();
        }

        ctx.fill();
        if (
          this.parentThatIsA(BlockMorph)?.alpha < 0.6 ||
          !this.isEmptySlot() ||
          progress > 0
        ) {
          var e = this.flatEdge / 2;
          ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
          ctx.lineWidth = this.flatEdge;
          ctx.beginPath();
          ctx.moveTo(e, r);
          ctx.lineTo(r, e);
          ctx.lineTo(w - r, e);
          ctx.lineTo(w - e, r);
          ctx.lineTo(w - r, h - e);
          ctx.lineTo(r, h - e);
          ctx.closePath();
          ctx.stroke();
        }

        if (progress < 0 || !this.isEmptySlot() || progress == 1) {
          if (this.value) {
            drawTick();
          } else {
            drawCross();
          }
        }

        //! drawLabel

        if (this.isEmptySlot()) {
          return;
        }

        if (false) {
          //this.isWide()) {
          // draw the full text label
          text = this.textLabelExtent();
          y = this.height() - (this.height() - text.y) / 2;
          if (this.value) {
            x = this.width() / 2 - this.width() / 5;
          } else {
            x = this.width() - this.height() / 2 - text.x;
          }
          ctx.save();
          if (!MorphicPreferences.isFlat && useBlurredShadows) {
            ctx.shadowOffsetX = -shift;
            ctx.shadowOffsetY = -shift;
            ctx.shadowBlur = shift;
            ctx.shadowColor = this.value ? "rgb(0, 100, 0)" : "rgb(100, 0, 0)";
          }
          ctx.font = new StringMorph(null, this.fontSize, null, true).font();
          ctx.textAlign = "left";
          ctx.textBaseline = "bottom";
          ctx.fillStyle = "rgb(255, 255, 255";
          ctx.fillText(localize(this.value ? "true" : "false"), x, y);
          ctx.restore();
          return;
        }
      },
      true,
      2,
    );
    api.wrapFunction(BooleanSlotMorph.prototype, "drawKnob", nop, true, 2);
    api.wrapFunction(BooleanSlotMorph.prototype, "drawLabel", nop, true, 2);
    api.wrapFunction(
      ColorSlotMorph.prototype,
      "fixLayout",
      function () {
        // determine my extent
        var side = this.fontSize + this.edge * 2 + this.typeInPadding * 2;
        this.bounds.setWidth(side * 1.3);
        this.bounds.setHeight(side * 1.1);
      },
      true,
      2,
    );
    api.wrapFunction(
      ColorSlotMorph.prototype,
      "render",
      function (ctx) {
        var borderColor;

        if (this.parent) {
          borderColor = this.parent.color;
        } else {
          borderColor = new Color(120, 120, 120);
        }
        ctx.fillStyle = this.color.toString();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1 * this.scale;
        // cache my border colors
        this.cachedClr = borderColor.toString();
        this.cachedClrBright = borderColor.lighter(this.contrast).toString();

        this.cachedClrDark = borderColor.darker(this.contrast).toString();

        if (false) {
          ctx.fillRect(
            this.edge,
            this.edge,
            this.width() - this.edge * 2,
            this.height() - this.edge * 2,
          );
        } else {
          var r = Math.max((this.height() - this.edge * 2) / 2, 0);
          ctx.beginPath();
          ctx.arc(
            r + this.edge,
            r + this.edge,
            r,
            radians(90),
            radians(-90),
            false,
          );
          ctx.arc(
            this.width() - r - this.edge,
            r + this.edge,
            r,
            radians(-90),
            radians(90),
            false,
          );
          ctx.closePath();

          ctx.stroke();
          ctx.fill();
        }
        if (!MorphicPreferences.isFlat) {
          this.drawRectBorder(ctx);
        }
      },
      true,
      2,
    );
    api.wrapFunction(
      HatBlockMorph.prototype,
      "outlinePath",
      function (ctx, inset) {
        var indent = this.corner * 2 + this.inset,
          bottom = this.height() - this.corner,
          bottomCorner =
            this.height() - this.corner - this.dentPlus * 2 + this.flatEdge / 2,
          radius = Math.max(this.corner - inset, 0),
          s = this.hatWidth,
          h = this.hatHeight,
          r = (4 * h * h + s * s) / (8 * h),
          a = degrees(4 * Math.atan((2 * h) / s)),
          sa = a / 2,
          sp = Math.min(s * 1.7, this.width() - this.corner),
          pos = this.position();

        // top arc:
        ctx.moveTo(inset, h + this.corner - radius);
        ctx.ellipse(
          s / 2,
          r / 1.4 + inset + 4 * this.scale,
          r,
          r / 1.4,
          0,
          radians(-sa - 90),
          radians(sa - 90),
          0,
        );
        /*ctx.bezierCurveTo(
        s,
        0,
        s,
        h,
        sp,
        h
    );*/

        // top right:
        ctx.arc(
          this.width() - this.corner,
          h + this.corner,
          radius,
          radians(-90),
          radians(-0),
          false,
        );

        // C-Slots
        this.cSlots().forEach((slot) => {
          slot.outlinePath(ctx, inset, slot.position().subtract(pos));
        });

        // bottom right:
        ctx.arc(
          this.width() - this.corner,
          bottomCorner + inset * 2 - radius,
          radius,
          radians(0),
          radians(90),
          false,
        );

        if (!this.isStop()) {
          var w = this.dent * 1.75 + this.corner / 2,
            h = this.corner + this.dentPlus,
            offset = this.inset + this.corner / 2,
            c = this.dentCorner;
          this.drawRoundedDent(ctx, inset, 0, bottomCorner + inset, true);
        }

        // bottom left:
        ctx.arc(
          this.corner,
          bottomCorner + inset * 2 - radius,
          radius,
          radians(90),
          radians(180),
          false,
        );
      },
      true,
      2,
    );
    api.wrapFunction(
      ReporterSlotMorph.prototype,
      "fixLayout",
      function () {
        var contents = this.contents();
        if (!contents) {
          contents = this.emptySlot();
          this.add(contents);
        }
        this.bounds.setExtent(
          contents.extent().add(this.edge * 2 + this.rfBorder * 2),
        );
        contents.setCenter(this.center());
        if (this.parent) {
          if (this.parent.fixLayout) {
            this.parent.fixLayout();
          }
        }
      },
      true,
      2,
    );
    api.wrapFunction(
      ReporterSlotMorph.prototype,
      "emptySlot",
      function () {
        var empty = new ArgMorph(),
          shrink = 0; //this.rfBorder * 2 + this.edge * 2;
        empty.color = this.rfColor;
        empty.alpha = 0;
        empty.bounds.setExtent(
          new Point(
            (this.fontSize + this.edge * 2) * (this.isBoolean ? 2.5 : 2) -
              shrink,
            this.fontSize * 1.3 + this.edge * 3 - shrink,
          ),
        );
        return empty;
      },
      true,
      2,
    );

    api.wrapFunction(
      CSlotMorph.prototype,
      "fixLayout",
      function () {
        var nb = this.nestedBlock();
        if (nb) {
          nb.setPosition(
            new Point(this.left() + this.inset, this.top() + this.corner),
          );
          this.bounds.setHeight(nb.fullBounds().height() + this.corner);
          this.bounds.setWidth(nb.fullBounds().width() + this.cSlotPadding * 2);
        } else {
          this.bounds.setHeight(this.corner * 6 + this.cSlotPadding); // default
          this.bounds.setWidth(
            this.corner * 4 +
              this.inset * 2 +
              this.dent +
              this.cSlotPadding * 2,
          );
          if (this.parent) {
            this.bounds.corner.x = this.parent.right();
          }
        }

        if (this.parent && this.parent.fixLayout) {
          this.parent.fixLayout();
        }
      },
      true,
      2,
    );
    api.wrapFunction(
      CSlotMorph.prototype,
      "outlinePath",
      function (ctx, inset, offset) {
        var ox = offset.x,
          oy = offset.y,
          radius = Math.max(this.corner - inset, 0);

        // top corner:
        ctx.lineTo(this.width() + ox - inset, oy);

        // top right:
        ctx.arc(
          this.width() - this.corner + ox,
          oy,
          radius,
          radians(0),
          radians(90),
        );
        // jigsaw shape:
        var w = this.dent * 1.75 + this.corner / 2,
          h = this.corner + this.dentPlus,
          offset = this.inset * 1 + this.dent / 1.6 + ox,
          c = this.dentCorner;
        this.drawRoundedDent(
          ctx,
          inset,
          inset + this.corner * 2 + ox,
          this.corner + oy - inset * 2,
          true,
        );

        ctx.arc(
          this.inset + this.corner + ox,
          this.corner * 2 + oy,
          this.corner + inset,
          radians(270),
          radians(180),
          true,
        );

        // bottom:
        ctx.lineTo(
          this.inset + ox - inset,
          this.height() - this.corner * 2 + oy - this.dentPlus,
        );
        ctx.arc(
          this.inset + this.corner + ox,
          this.height() - this.corner * 2 + oy - this.dentPlus,
          this.corner + inset,
          radians(180),
          radians(90),
          true,
        );
        var block = this.nestedBlock(),
          flatEdge = true;
        if (!isNil(block)) {
          // new fix
          if (block.bottomBlock().isStop()) flatEdge = false;
        }
        if (flatEdge) {
          this.drawRoundedDent(
            ctx,
            inset,
            inset + this.corner * 2 + ox,
            this.height() - this.corner + oy - this.dentPlus,
          );
          ctx.lineTo(
            this.width() - this.corner + ox,
            this.height() - this.corner + oy + inset - this.dentPlus,
          );
        }
        ctx.arc(
          this.width() - this.corner + ox,
          this.height() + oy - this.dentPlus,
          radius,
          radians(-90),
          radians(-0),
          false,
        );
      },
      true,
      2,
    );
    api.wrapFunction(
      CommandSlotMorph.prototype,
      "fixLayout",
      function () {
        var nb = this.nestedBlock();
        if (this.parent) {
          if (!this.color.eq(this.parent.color)) {
            this.setColor(this.parent.color);
          }
        }
        if (nb) {
          nb.setPosition(
            new Point(
              this.left() + this.edge + this.rfBorder,
              this.top() + this.edge + this.rfBorder,
            ),
          );
          this.bounds.setWidth(
            nb.fullBounds().width() + (this.edge + this.rfBorder) * 2,
          );
          this.bounds.setHeight(
            nb.fullBounds().height() +
              this.edge +
              this.rfBorder * 2 -
              (this.corner - this.edge),
          );
        } else {
          this.bounds.setHeight(this.corner * 6);
          this.bounds.setWidth(this.corner * 4 + this.inset + this.dent * 1.3);
        }
        if (this.parent && this.parent.fixLayout) {
          this.parent.fixLayout();
        }
      },
      true,
      2,
    );
    api.wrapFunction(
      RingReporterSlotMorph.prototype,
      "outlinePathOval",
      function (ctx, offset) {
        var ox = offset.x,
          oy = offset.y,
          w = this.width(),
          h = this.height(),
          r = Math.min(h / 2, h / 2);

        // top left:
        ctx.arc(
          r + this.edge + ox,
          r + this.edge + oy,
          r,
          radians(-180),
          radians(-90),
          false,
        );

        // top right:
        ctx.arc(
          w - r - this.edge + ox,
          r + this.edge + oy,
          r,
          radians(-90),
          radians(-0),
          false,
        );

        // bottom right:
        ctx.arc(
          w - r - this.edge + ox,
          h - r - this.edge + oy,
          r,
          radians(0),
          radians(90),
          false,
        );

        // bottom left:
        ctx.arc(
          r + this.edge + ox,
          h - r - this.edge + oy,
          r,
          radians(90),
          radians(180),
          false,
        );

        // "close" the path
        ctx.lineTo(this.edge + ox, r + this.edge + oy);
      },
      true,
      2,
    );
    api.wrapFunction(
      RingCommandSlotMorph.prototype,
      "outlinePath",
      function (ctx, offset) {
        var ox = offset.x,
          oy = offset.y,
          isFilled = this.nestedBlock() !== null,
          ins = isFilled ? this.inset : this.inset / 2,
          dent = isFilled ? this.dent : this.dent,
          indent = this.corner * 2 + ins,
          edge = this.edge,
          w = this.width(),
          h = this.height(),
          rf = isFilled ? this.rfBorder : 0,
          y = h - this.corner - edge;

        // top left:
        ctx.arc(
          this.corner + edge + ox,
          this.corner + edge + oy,
          this.corner,
          radians(-180),
          radians(-90),
          false,
        );

        // dent:
        //ctx.lineTo(this.corner + ins + edge + rf * 2 + ox, edge + oy);
        if (false) {
          ctx.lineTo(
            indent + edge + rf * 2 + ox,
            this.corner + edge + oy + this.dentPlus,
          );
          ctx.lineTo(
            indent + edge + rf * 2 + (dent - rf * 2) + ox,
            this.corner + edge + oy + this.dentPlus,
          );
          ctx.lineTo(
            indent + edge + rf * 2 + (dent - rf * 2) + this.corner + ox,
            edge + oy,
          );
        } else {
          (() => {
            const dentW = this.dent * 1.75 + this.corner / 2,
              inset = oy,
              dentH = this.corner + this.dentPlus,
              dentOffset = this.corner / 2 + ins + edge + rf * 2 + ox,
              c = this.dentCorner;
            ctx.save();
            ctx.translate(0, inset + 1);
            ctx.lineTo(0 + dentOffset, -dentH + dentH);
            ctx.bezierCurveTo(
              c + dentOffset,
              -dentH + dentH,
              c + dentOffset,
              -0 + dentH,
              c * 2 + dentOffset,
              -0 + dentH,
            );
            ctx.lineTo(dentW - c * 2 + dentOffset, dentH);
            ctx.bezierCurveTo(
              dentW - c + dentOffset,
              0 + dentH,
              dentW - c + dentOffset,
              -dentH + dentH,
              dentW + dentOffset,
              -dentH + dentH,
            );
            ctx.restore();
          })();
        }
        ctx.lineTo(this.width() - this.corner - edge + ox, edge + oy);

        // top right:
        ctx.arc(
          w - this.corner - edge + ox,
          this.corner + edge + oy,
          this.corner,
          radians(-90),
          radians(-0),
          false,
        );

        // bottom right:
        ctx.arc(
          this.width() - this.corner - edge + ox,
          y + oy - this.dentPlus,
          this.corner,
          radians(0),
          radians(90),
          false,
        );

        // bottom left:
        ctx.arc(
          this.corner + edge + ox,
          y + oy - this.dentPlus,
          this.corner,
          radians(90),
          radians(180),
          false,
        );

        // close the path, so we can clip it:
        ctx.lineTo(
          this.corner + edge + ox - this.corner, // this needs to be adjusted
          this.corner + edge + oy,
        );
      },
      true,
      2,
    );
    api.wrapFunction(
      RingReporterSlotMorph.prototype,
      "outlinePathDiamond",
      function (ctx, offset) {
        var ox = offset.x,
          oy = offset.y,
          w = this.width(),
          h = this.height(),
          h2 = Math.floor(h / 2),
          r = Math.min(h2, h2);

        ctx.moveTo(ox + this.edge, h2 + oy);
        ctx.lineTo(r + this.edge + ox, this.edge + oy);
        ctx.lineTo(w - r - this.edge + ox, this.edge + oy);
        ctx.lineTo(w - this.edge + ox, h2 + oy);
        ctx.lineTo(w - r - this.edge + ox, h - this.edge + oy);
        ctx.lineTo(r + this.edge + ox, h - this.edge + oy);
        ctx.lineTo(ox + this.edge, h2 + oy);
      },
      true,
      2,
    );
    // SymbolMorph
    SymbolMorph.prototype.flagSymbol = new Image();
    SymbolMorph.prototype.flagSymbol.src =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJMYXllcl8xIiBkYXRhLW5hbWU9IkxheWVyIDEiIHdpZHRoPSIxNi42MyIgaGVpZ2h0PSIxNy41IiB2aWV3Qm94PSIwIDAgMTYuNjMgMTcuNSI+CiAgICA8ZGVmcz4KICAgICAgICA8c3R5bGU+LmNscy0xLC5jbHMtMntmaWxsOiM0Y2JmNTY7c3Ryb2tlOiM0NTk5M2Q7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO30uY2xzLTJ7c3Ryb2tlLXdpZHRoOjEuNXB4O308L3N0eWxlPgogICAgPC9kZWZzPgogICAgPHRpdGxlPmljb24tLWdyZWVuLWZsYWc8L3RpdGxlPgogICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNLjc1LDJBNi40NCw2LjQ0LDAsMCwxLDguNDQsMmgwYTYuNDQsNi40NCwwLDAsMCw3LjY5LDBWMTIuNGE2LjQ0LDYuNDQsMCwwLDEtNy42OSwwaDBhNi40NCw2LjQ0LDAsMCwwLTcuNjksMCIvPgogICAgPGxpbmUgY2xhc3M9ImNscy0yIiB4MT0iMC43NSIgeTE9IjE2Ljc1IiB4Mj0iMC43NSIgeTI9IjAuNzUiLz4KPC9zdmc+";
    SymbolMorph.prototype.stopSymbol = new Image();
    SymbolMorph.prototype.stopSymbol.src =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE0IiBoZWlnaHQ9IjE0IiB2aWV3Qm94PSIwIDAgMTQgMTQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDE0IDE0OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0VDNTk1OTtzdHJva2U6I0I4NDg0ODtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fQo8L3N0eWxlPgo8cG9seWdvbiBjbGFzcz0ic3QwIiBwb2ludHM9IjQuMywwLjUgOS43LDAuNSAxMy41LDQuMyAxMy41LDkuNyA5LjcsMTMuNSA0LjMsMTMuNSAwLjUsOS43IDAuNSw0LjMgIi8+Cjwvc3ZnPg==";

    SymbolMorph.prototype.turnRightImage = new Image();
    SymbolMorph.prototype.turnRightImage.src =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMjIuNjggMTIuMmExLjYgMS42IDAgMCAxLTEuMjcuNjNoLTcuNjlhMS41OSAxLjU5IDAgMCAxLTEuMTYtMi41OGwxLjEyLTEuNDFhNC44MiA0LjgyIDAgMCAwLTMuMTQtLjc3IDQuMzEgNC4zMSAwIDAgMC0yIC44QTQuMjUgNC4yNSAwIDAgMCA3LjIgMTAuNmE1LjA2IDUuMDYgMCAwIDAgLjU0IDQuNjJBNS41OCA1LjU4IDAgMCAwIDEyIDE3Ljc0YTIuMjYgMi4yNiAwIDAgMS0uMTYgNC41MkExMC4yNSAxMC4yNSAwIDAgMSAzLjc0IDE4YTEwLjE0IDEwLjE0IDAgMCAxLTEuNDktOS4yMiA5LjcgOS43IDAgMCAxIDIuODMtNC4xNEE5LjkyIDkuOTIgMCAwIDEgOS42NiAyLjVhMTAuNjYgMTAuNjYgMCAwIDEgNy43MiAxLjY4bDEuMDgtMS4zNWExLjU3IDEuNTcgMCAwIDEgMS4yNC0uNiAxLjYgMS42IDAgMCAxIDEuNTQgMS4yMWwxLjcgNy4zN2ExLjU3IDEuNTcgMCAwIDEtLjI2IDEuMzlaIiBzdHlsZT0iZmlsbDojMDAwMyIvPjxwYXRoIGQ9Ik0yMS4zOCAxMS44M2gtNy42MWEuNTkuNTkgMCAwIDEtLjQzLTFsMS43NS0yLjE5YTUuOSA1LjkgMCAwIDAtNC43LTEuNTggNS4wNyA1LjA3IDAgMCAwLTQuMTEgMy4xN0E2IDYgMCAwIDAgNyAxNS43N2E2LjUxIDYuNTEgMCAwIDAgNSAyLjkyIDEuMzEgMS4zMSAwIDAgMS0uMDggMi42MiA5LjMgOS4zIDAgMCAxLTcuMzUtMy44MiA5LjE2IDkuMTYgMCAwIDEtMS40LTguMzdBOC41MSA4LjUxIDAgMCAxIDUuNzEgNS40YTguNzYgOC43NiAwIDAgMSA0LjExLTEuOTIgOS43MSA5LjcxIDAgMCAxIDcuNzUgMi4wN2wxLjY3LTIuMWEuNTkuNTkgMCAwIDEgMSAuMjFMMjIgMTEuMDhhLjU5LjU5IDAgMCAxLS42Mi43NVoiIHN0eWxlPSJmaWxsOiNmZmYiLz48L3N2Zz4=";
    SymbolMorph.prototype.turnRightImageBlack = new Image();
    SymbolMorph.prototype.turnRightImageBlack.src =
      "data:image/svg+xml;base64,PHN2ZyBpZD0icm90YXRlLWNvdW50ZXItY2xvY2t3aXNlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzAwMH08L3N0eWxlPjwvZGVmcz48cGF0aCBkPSJNMjEuMzggMTEuODNoLTcuNjFhLjU5LjU5IDAgMCAxLS40My0xbDEuNzUtMi4xOWE1LjkgNS45IDAgMCAwLTQuNy0xLjU4IDUuMDcgNS4wNyAwIDAgMC00LjExIDMuMTdBNiA2IDAgMCAwIDcgMTUuNzdhNi41MSA2LjUxIDAgMCAwIDUgMi45MiAxLjMxIDEuMzEgMCAwIDEtLjA4IDIuNjIgOS4zIDkuMyAwIDAgMS03LjM1LTMuODIgOS4xNiA5LjE2IDAgMCAxLTEuNC04LjM3QTguNTEgOC41MSAwIDAgMSA1LjcxIDUuNGE4Ljc2IDguNzYgMCAwIDEgNC4xMS0xLjkyIDkuNzEgOS43MSAwIDAgMSA3Ljc1IDIuMDdsMS42Ny0yLjFhLjU5LjU5IDAgMCAxIDEgLjIxTDIyIDExLjA4YS41OS41OSAwIDAgMS0uNjIuNzVaIiBzdHlsZT0iZmlsbDojMDAwIi8+PC9zdmc+";
    SymbolMorph.prototype.turnLeftImage = new Image();
    SymbolMorph.prototype.turnLeftImage.src =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMjAuMzQgMTguMjFhMTAuMjQgMTAuMjQgMCAwIDEtOC4xIDQuMjIgMi4yNiAyLjI2IDAgMCAxLS4xNi00LjUyIDUuNTggNS41OCAwIDAgMCA0LjI1LTIuNTMgNS4wNiA1LjA2IDAgMCAwIC41NC00LjYyQTQuMjUgNC4yNSAwIDAgMCAxNS41NSA5YTQuMzEgNC4zMSAwIDAgMC0yLS44IDQuODIgNC44MiAwIDAgMC0zLjE1LjhsMS4xMiAxLjQxQTEuNTkgMS41OSAwIDAgMSAxMC4zNiAxM0gyLjY3YTEuNTYgMS41NiAwIDAgMS0xLjI2LS42M0ExLjU0IDEuNTQgMCAwIDEgMS4xMyAxMWwxLjcyLTcuNDNBMS41OSAxLjU5IDAgMCAxIDQuMzggMi40YTEuNTcgMS41NyAwIDAgMSAxLjI0LjZMNi43IDQuMzVhMTAuNjYgMTAuNjYgMCAwIDEgNy43Mi0xLjY4QTkuODggOS44OCAwIDAgMSAxOSA0LjgxIDkuNjEgOS42MSAwIDAgMSAyMS44MyA5YTEwLjA4IDEwLjA4IDAgMCAxLTEuNDkgOS4yMVoiIHN0eWxlPSJmaWxsOiMwMDAzIi8+PHBhdGggZD0iTTE5LjU2IDE3LjY1YTkuMjkgOS4yOSAwIDAgMS03LjM1IDMuODMgMS4zMSAxLjMxIDAgMCAxLS4wOC0yLjYyIDYuNTMgNi41MyAwIDAgMCA1LTIuOTIgNi4wNSA2LjA1IDAgMCAwIC42Ny01LjUxIDUuMzIgNS4zMiAwIDAgMC0xLjY0LTIuMTYgNS4yMSA1LjIxIDAgMCAwLTIuNDgtMUE1Ljg2IDUuODYgMCAwIDAgOSA4Ljg0TDEwLjc0IDExYS41OS41OSAwIDAgMS0uNDMgMUgyLjdhLjYuNiAwIDAgMS0uNi0uNzVsMS43MS03LjQyYS41OS41OSAwIDAgMSAxLS4yMWwxLjY3IDIuMWE5LjcxIDkuNzEgMCAwIDEgNy43NS0yLjA3IDguODQgOC44NCAwIDAgMSA0LjEyIDEuOTIgOC42OCA4LjY4IDAgMCAxIDIuNTQgMy43MiA5LjE0IDkuMTQgMCAwIDEtMS4zMyA4LjM2WiIgc3R5bGU9ImZpbGw6I2ZmZiIvPjwvc3ZnPg==";
    SymbolMorph.prototype.turnLeftImageBlack = new Image();
    SymbolMorph.prototype.turnLeftImageBlack.src =
      "data:image/svg+xml;base64,PHN2ZyBpZD0icm90YXRlLWNsb2Nrd2lzZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMzZDc5Y2N9PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTE5LjU2IDE3LjY1YTkuMjkgOS4yOSAwIDAgMS03LjM1IDMuODMgMS4zMSAxLjMxIDAgMCAxLS4wOC0yLjYyIDYuNTMgNi41MyAwIDAgMCA1LTIuOTIgNi4wNSA2LjA1IDAgMCAwIC42Ny01LjUxIDUuMzIgNS4zMiAwIDAgMC0xLjY0LTIuMTYgNS4yMSA1LjIxIDAgMCAwLTIuNDgtMUE1Ljg2IDUuODYgMCAwIDAgOSA4Ljg0TDEwLjc0IDExYS41OS41OSAwIDAgMS0uNDMgMUgyLjdhLjYuNiAwIDAgMS0uNi0uNzVsMS43MS03LjQyYS41OS41OSAwIDAgMSAxLS4yMWwxLjY3IDIuMWE5LjcxIDkuNzEgMCAwIDEgNy43NS0yLjA3IDguODQgOC44NCAwIDAgMSA0LjEyIDEuOTIgOC42OCA4LjY4IDAgMCAxIDIuNTQgMy43MiA5LjE0IDkuMTQgMCAwIDEtMS4zMyA4LjM2WiIgc3R5bGU9ImZpbGw6IzAwMCIvPjwvc3ZnPg==";
    SymbolMorph.prototype.arrowImage = new Image();
    SymbolMorph.prototype.arrowImage.src =
      "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMi43MSIgaGVpZ2h0PSI4Ljc5IiB2aWV3Qm94PSIwIDAgMTIuNzEgOC43OSI+PHRpdGxlPmRyb3Bkb3duLWFycm93PC90aXRsZT48ZyBvcGFjaXR5PSIwLjEiPjxwYXRoIGQ9Ik0xMi43MSwyLjQ0QTIuNDEsMi40MSwwLDAsMSwxMiw0LjE2TDguMDgsOC4wOGEyLjQ1LDIuNDUsMCwwLDEtMy40NSwwTDAuNzIsNC4xNkEyLjQyLDIuNDIsMCwwLDEsMCwyLjQ0LDIuNDgsMi40OCwwLDAsMSwuNzEuNzFDMSwwLjQ3LDEuNDMsMCw2LjM2LDBTMTEuNzUsMC40NiwxMiwuNzFBMi40NCwyLjQ0LDAsMCwxLDEyLjcxLDIuNDRaIiBmaWxsPSIjMjMxZjIwIi8+PC9nPjxwYXRoIGQ9Ik02LjM2LDcuNzlhMS40MywxLjQzLDAsMCwxLTEtLjQyTDEuNDIsMy40NWExLjQ0LDEuNDQsMCwwLDEsMC0yYzAuNTYtLjU2LDkuMzEtMC41Niw5Ljg3LDBhMS40NCwxLjQ0LDAsMCwxLDAsMkw3LjM3LDcuMzdBMS40MywxLjQzLDAsMCwxLDYuMzYsNy43OVoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=";
    SymbolMorph.prototype.arrowImageBlack = new Image();
    SymbolMorph.prototype.arrowImageBlack.src =
      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTYgMTYiPgogIDxzdHlsZT4uc3Qye2ZpbGw6I2ZmZn08L3N0eWxlPgogIDxnIGlkPSJUdXRvcmlhbHNfeDJGX05hdmlnYXRpb25feDJGX05leHQiIHRyYW5zZm9ybT0ibWF0cml4KDAsIC0xLCAxLCAwLCAtNywgLTcpIiBzdHlsZT0idHJhbnNmb3JtLW9yaWdpbjogMTZweCAxNnB4OyI+CiAgICA8cGF0aCBkPSJNMjIuNiAxNi4zek0xNi4yIDE5bC01LjYtLjhhMi41IDIuNSAwIDAgMS0yLjEtMi40di0uM2MuMi0xLjEgMS0xLjkgMi0ybDUuNi0uOHYtMS4xYzAtLjcuNC0xLjMgMS0xLjYuNi0uMyAxLjMtLjEgMS44LjRsNC4zIDQuM2MuMy4zLjUuNy41IDEuMiAwIC40LS4yLjktLjUgMS4yTDE5IDIxLjRjLS41LjUtMS4yLjYtMS44LjMtLjYtLjMtMS0uOS0xLTEuNVYxOXoiIHN0cm9rZS1vcGFjaXR5PSIuMSIgc3R5bGU9InN0cm9rZS1taXRlcmxpbWl0OiA0LjIyOyBzdHJva2Utd2lkdGg6IDBweDsiLz4KICAgIDxkZWZzPgogICAgICA8ZmlsdGVyIGlkPSJBZG9iZV9PcGFjaXR5TWFza0ZpbHRlciIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4PSI2IiB5PSI2IiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiPgogICAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0iMSAwIDAgMCAwIDAgMSAwIDAgMCAwIDAgMSAwIDAgMCAwIDAgMSAwIi8+CiAgICAgIDwvZmlsdGVyPgogICAgPC9kZWZzPgogICAgPG1hc2sgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iNiIgeT0iNiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBpZD0ibWFzay0yXzFfIj4KICAgICAgPGcgZmlsdGVyPSJ1cmwoI0Fkb2JlX09wYWNpdHlNYXNrRmlsdGVyKSI+CiAgICAgICAgPHBhdGggaWQ9InBhdGgtMV8xXyIgY2xhc3M9InN0MiIgZD0iTTIzIDE2LjcgMTguNyAyMWMtLjQuMy0uOS40LTEuMy4ycy0uNy0uNi0uNy0xLjF2LTEuNmwtNi0uOGMtMS0uMS0xLjctLjktMS43LTEuOXYtLjJjLjEtLjkuOC0xLjUgMS42LTEuNmw2LS45di0xLjZjMC0uNS4zLS45LjctMS4xLjQtLjIuOS0uMSAxLjMuM0wyMyAxNWMuMi4yLjMuNS4zLjhsLS4zLjl6Ii8+CiAgICAgIDwvZz4KICAgIDwvbWFzaz4KICAgIDxnIGlkPSJDb2xvcl94MkZfV2hpdGUiIG1hc2s9InVybCgjbWFzay0yXzFfKSI+CiAgICAgIDxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik02IDZoMjB2MjBINnoiIGlkPSJDb2xvciIgc3R5bGU9InN0cm9rZS1taXRlcmxpbWl0OiA0LjIyOyBzdHJva2Utd2lkdGg6IDBweDsgZmlsbDogcmdiKDAsIDAsIDApOyIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+";
    SymbolMorph.prototype.arrowOutImage = new Image();
    SymbolMorph.prototype.arrowOutImage.src =
      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTYgMTYiPgogIDxzdHlsZT4uc3Qye2ZpbGw6I2ZmZn08L3N0eWxlPgogIDxnIGlkPSJUdXRvcmlhbHNfeDJGX05hdmlnYXRpb25feDJGX05leHQiIHRyYW5zZm9ybT0ibWF0cml4KDAsIC0xLCAxLCAwLCAtNywgLTcpIiBzdHlsZT0idHJhbnNmb3JtLW9yaWdpbjogMTZweCAxNnB4OyI+CiAgICA8cGF0aCBkPSJNIDIyLjUgMTYuNDM2IFogTSAxNi4xIDE5LjEzNiBMIDEwLjUgMTguMzM2IEMgOS4zMTUgMTguMTQ0IDguNDMzIDE3LjEzNiA4LjQgMTUuOTM2IEwgOC40IDE1LjYzNiBDIDguNiAxNC41MzYgOS40IDEzLjczNiAxMC40IDEzLjYzNiBMIDE2IDEyLjgzNiBMIDE2IDExLjczNiBDIDE2IDExLjAzNiAxNi40IDEwLjQzNiAxNyAxMC4xMzYgQyAxNy42IDkuODM2IDE4LjMgMTAuMDM2IDE4LjggMTAuNTM2IEwgMjMuMSAxNC44MzYgQyAyMy40IDE1LjEzNiAyMy42IDE1LjUzNiAyMy42IDE2LjAzNiBDIDIzLjYgMTYuNDM2IDIzLjQgMTYuOTM2IDIzLjEgMTcuMjM2IEwgMTguOSAyMS41MzYgQyAxOC40IDIyLjAzNiAxNy43IDIyLjEzNiAxNy4xIDIxLjgzNiBDIDE2LjUgMjEuNTM2IDE2LjEgMjAuOTM2IDE2LjEgMjAuMzM2IEwgMTYuMSAxOS4xMzYgWiIgc3R5bGU9ImZpbGw6IG5vbmU7IHN0cm9rZTogcmdiKDI1NSwgMjU1LCAyNTUpOyIvPgogIDwvZz4KPC9zdmc+";
    SymbolMorph.prototype.arrowOutImageBlack = new Image();
    SymbolMorph.prototype.arrowOutImageBlack.src =
      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTYgMTYiPgogIDxzdHlsZT4uc3Qye2ZpbGw6I2ZmZn08L3N0eWxlPgogIDxnIGlkPSJUdXRvcmlhbHNfeDJGX05hdmlnYXRpb25feDJGX05leHQiIHRyYW5zZm9ybT0ibWF0cml4KDAsIC0xLCAxLCAwLCAtNywgLTcpIiBzdHlsZT0idHJhbnNmb3JtLW9yaWdpbjogMTZweCAxNnB4OyI+CiAgICA8cGF0aCBkPSJNIDIyLjUgMTYuNDM2IFogTSAxNi4xIDE5LjEzNiBMIDEwLjUgMTguMzM2IEMgOS4zMTUgMTguMTQ0IDguNDMzIDE3LjEzNiA4LjQgMTUuOTM2IEwgOC40IDE1LjYzNiBDIDguNiAxNC41MzYgOS40IDEzLjczNiAxMC40IDEzLjYzNiBMIDE2IDEyLjgzNiBMIDE2IDExLjczNiBDIDE2IDExLjAzNiAxNi40IDEwLjQzNiAxNyAxMC4xMzYgQyAxNy42IDkuODM2IDE4LjMgMTAuMDM2IDE4LjggMTAuNTM2IEwgMjMuMSAxNC44MzYgQyAyMy40IDE1LjEzNiAyMy42IDE1LjUzNiAyMy42IDE2LjAzNiBDIDIzLjYgMTYuNDM2IDIzLjQgMTYuOTM2IDIzLjEgMTcuMjM2IEwgMTguOSAyMS41MzYgQyAxOC40IDIyLjAzNiAxNy43IDIyLjEzNiAxNy4xIDIxLjgzNiBDIDE2LjUgMjEuNTM2IDE2LjEgMjAuOTM2IDE2LjEgMjAuMzM2IEwgMTYuMSAxOS4xMzYgWiIgc3R5bGU9ImZpbGw6IG5vbmU7IHN0cm9rZTogcmdiKDAsIDAsIDApOyIvPgogIDwvZz4KPC9zdmc+";
    SymbolMorph.prototype.loopSymbol = new Image();
    SymbolMorph.prototype.loopSymbol.src =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjQgMjQiIHhtbDpzcGFjZT0icHJlc2VydmUiPgogICAgPHBhdGggZD0iTTIzLjMgMTFjLS4zLjYtLjkgMS0xLjUgMWgtMS42Yy0uMSAxLjMtLjUgMi41LTEuMSAzLjYtLjkgMS43LTIuMyAzLjItNC4xIDQuMS0xLjcuOS0zLjYgMS4yLTUuNS45LTEuOC0uMy0zLjUtMS4xLTQuOS0yLjMtLjctLjctLjctMS45IDAtMi42LjYtLjYgMS42LS43IDIuMy0uMkg3Yy45LjYgMS45LjkgMi45LjlzMS45LS4zIDIuNy0uOWMxLjEtLjggMS44LTIuMSAxLjgtMy41aC0xLjVjLS45IDAtMS43LS43LTEuNy0xLjcgMC0uNC4yLS45LjUtMS4ybDQuNC00LjRjLjctLjYgMS43LS42IDIuNCAwTDIzIDkuMmMuNS41LjYgMS4yLjMgMS44eiIgc3R5bGU9ImZpbGw6IzAwMDMiLz4KICAgIDxwYXRoIGQ9Ik0yMS44IDExaC0yLjZjMCAxLjUtLjMgMi45LTEgNC4yLS44IDEuNi0yLjEgMi44LTMuNyAzLjYtMS41LjgtMy4zIDEuMS00LjkuOC0xLjYtLjItMy4yLTEtNC40LTIuMS0uNC0uMy0uNC0uOS0uMS0xLjIuMy0uNC45LS40IDEuMi0uMSAxIC43IDIuMiAxLjEgMy40IDEuMXMyLjMtLjMgMy4zLTFjLjktLjYgMS42LTEuNSAyLTIuNi4zLS45LjQtMS44LjItMi44aC0yLjRjLS40IDAtLjctLjMtLjctLjcgMC0uMi4xLS4zLjItLjRsNC40LTQuNGMuMy0uMy43LS4zLjkgMEwyMiA5LjhjLjMuMy40LjYuMy45cy0uMy4zLS41LjN6IiBzdHlsZT0iZmlsbDojZmZmIi8+Cjwvc3ZnPg==";
    SymbolMorph.prototype.loopSymbolBlack = new Image();
    SymbolMorph.prototype.loopSymbolBlack.src =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciICB3aWR0aD0iMjQiIGhlaWdodD0iMjQiICB2aWV3Qm94PSIwIDAgMjQgMjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI0IDI0IiB4bWw6c3BhY2U9InByZXNlcnZlIj48cGF0aCBkPSJNMjEuOCAxMWgtMi42YzAgMS41LS4zIDIuOS0xIDQuMi0uOCAxLjYtMi4xIDIuOC0zLjcgMy42LTEuNS44LTMuMyAxLjEtNC45LjgtMS42LS4yLTMuMi0xLTQuNC0yLjEtLjQtLjMtLjQtLjktLjEtMS4yLjMtLjQuOS0uNCAxLjItLjEgMSAuNyAyLjIgMS4xIDMuNCAxLjFzMi4zLS4zIDMuMy0xYy45LS42IDEuNi0xLjUgMi0yLjYuMy0uOS40LTEuOC4yLTIuOGgtMi40Yy0uNCAwLS43LS4zLS43LS43IDAtLjIuMS0uMy4yLS40bDQuNC00LjRjLjMtLjMuNy0uMy45IDBMMjIgOS44Yy4zLjMuNC42LjMuOXMtLjMuMy0uNS4zeiIgc3R5bGU9ImZpbGw6IzAwMCIvPjwvc3ZnPg==";
    SymbolMorph.prototype.drawImage = function (ctx, image) {
      ctx.drawImage(image, 0, 0, this.width(), this.height());
    };
    SymbolMorph.prototype.extensionSymbolNames = [
      "penIcon",
      "ttsIcon",
      "translateIcon",
    ];
    //api.wrapFunction(SymbolMorph.prototype);

    // ArrowMorph
    ArrowMorph.prototype.whiteArrow = new Image();
    ArrowMorph.prototype.whiteArrow.src =
      "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMi43MSIgaGVpZ2h0PSI4Ljc5IiB2aWV3Qm94PSIwIDAgMTIuNzEgOC43OSI+PHRpdGxlPmRyb3Bkb3duLWFycm93PC90aXRsZT48ZyBvcGFjaXR5PSIwLjEiPjxwYXRoIGQ9Ik0xMi43MSwyLjQ0QTIuNDEsMi40MSwwLDAsMSwxMiw0LjE2TDguMDgsOC4wOGEyLjQ1LDIuNDUsMCwwLDEtMy40NSwwTDAuNzIsNC4xNkEyLjQyLDIuNDIsMCwwLDEsMCwyLjQ0LDIuNDgsMi40OCwwLDAsMSwuNzEuNzFDMSwwLjQ3LDEuNDMsMCw2LjM2LDBTMTEuNzUsMC40NiwxMiwuNzFBMi40NCwyLjQ0LDAsMCwxLDEyLjcxLDIuNDRaIiBmaWxsPSIjMjMxZjIwIi8+PC9nPjxwYXRoIGQ9Ik02LjM2LDcuNzlhMS40MywxLjQzLDAsMCwxLTEtLjQyTDEuNDIsMy40NWExLjQ0LDEuNDQsMCwwLDEsMC0yYzAuNTYtLjU2LDkuMzEtMC41Niw5Ljg3LDBhMS40NCwxLjQ0LDAsMCwxLDAsMkw3LjM3LDcuMzdBMS40MywxLjQzLDAsMCwxLDYuMzYsNy43OVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=";
    ArrowMorph.prototype.blackArrow = new Image();
    ArrowMorph.prototype.blackArrow.src =
      "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMi43MSIgaGVpZ2h0PSI4Ljc5IiB2aWV3Qm94PSIwIDAgMTIuNzEgOC43OSI+PHRpdGxlPmRyb3Bkb3duLWFycm93PC90aXRsZT48ZyBvcGFjaXR5PSIwLjEiPjxwYXRoIGQ9Ik0xMi43MSwyLjQ0QTIuNDEsMi40MSwwLDAsMSwxMiw0LjE2TDguMDgsOC4wOGEyLjQ1LDIuNDUsMCwwLDEtMy40NSwwTDAuNzIsNC4xNkEyLjQyLDIuNDIsMCwwLDEsMCwyLjQ0LDIuNDgsMi40OCwwLDAsMSwuNzEuNzFDMSwwLjQ3LDEuNDMsMCw2LjM2LDBTMTEuNzUsMC40NiwxMiwuNzFBMi40NCwyLjQ0LDAsMCwxLDEyLjcxLDIuNDRaIiBmaWxsPSIjMjMxZjIwIi8+PC9nPjxwYXRoIGQ9Ik02LjM2LDcuNzlhMS40MywxLjQzLDAsMCwxLTEtLjQyTDEuNDIsMy40NWExLjQ0LDEuNDQsMCwwLDEsMC0yYzAuNTYtLjU2LDkuMzEtMC41Niw5Ljg3LDBhMS40NCwxLjQ0LDAsMCwxLDAsMkw3LjM3LDcuMzdBMS40MywxLjQzLDAsMCwxLDYuMzYsNy43OVoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=";
    ArrowMorph.prototype.greyArrow = new Image();
    ArrowMorph.prototype.greyArrow.src =
      "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIgogICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTIuNzEiIGhlaWdodD0iOC43OSIgdmlld0JveD0iMCAwIDEyLjcxIDguNzkiPgogICAgPHRpdGxlPmRyb3Bkb3duLWFycm93PC90aXRsZT4KICAgIDxnIG9wYWNpdHk9IjAuMSI+CiAgICAgICAgPHBhdGggZD0iTTEyLjcxLDIuNDRBMi40MSwyLjQxLDAsMCwxLDEyLDQuMTZMOC4wOCw4LjA4YTIuNDUsMi40NSwwLDAsMS0zLjQ1LDBMMC43Miw0LjE2QTIuNDIsMi40MiwwLDAsMSwwLDIuNDQsMi40OCwyLjQ4LDAsMCwxLC43MS43MUMxLDAuNDcsMS40MywwLDYuMzYsMFMxMS43NSwwLjQ2LDEyLC43MUEyLjQ0LDIuNDQsMCwwLDEsMTIuNzEsMi40NFoiIGZpbGw9IiMyMzFmMjAiLz4KICAgIDwvZz4KICAgIDxwYXRoIGQ9Ik02LjM2LDcuNzlhMS40MywxLjQzLDAsMCwxLTEtLjQyTDEuNDIsMy40NWExLjQ0LDEuNDQsMCwwLDEsMC0yYzAuNTYtLjU2LDkuMzEtMC41Niw5Ljg3LDBhMS40NCwxLjQ0LDAsMCwxLDAsMkw3LjM3LDcuMzdBMS40MywxLjQzLDAsMCwxLDYuMzYsNy43OVoiIGZpbGw9IiM1NzVlNzUiLz4KPC9zdmc+";
    ArrowMorph.prototype.drawImage = function (ctx, image, horiz) {
      // I have a feeling that this might be turning into spagetti code...
      var pr = !isRetinaEnabled() ? 1 : window.devicePixelRatio || 1,
        pad = horiz
          ? 0
          : this.padding +
            (this.parent instanceof InputFieldMorph ? 0 : 2) * this.scale,
        w = this.width(),
        h = this.height(),
        ow = image.width,
        oh = image.height,
        i1 = [pad - (ow / 10) * this.scale, h - h / 1.7],
        i2 = [w - pad - 0.5 * this.scale, h / 2];
      image.width = (ow / pr) * pr;
      image.height = (oh / pr) * pr;
      ctx.drawImage(
        image,
        ...(!horiz ? i1 : [i1[1], i1[0]]),
        ...(!horiz ? i2 : [i2[1], i2[0]]),
      );
      image.width = ow;
      image.height = oh;
      return;
    };
    api.wrapFunction(
      ArrowMorph.prototype,
      "render",
      function (ctx) {
        // initialize my surface property
        var pad = this.padding,
          h = this.height(),
          h2 = h / 2,
          w = this.width(),
          w2 = w / 2;
        if (false) {
          ctx.save();
          var horiz = Math.abs(this.direction) == 90,
            nw = horiz ? h : w,
            nh = horiz ? w : h;
          ctx.translate(nw / 2, nh / 2);
          ctx.rotate(
            radians(
              ((d) => {
                switch (d) {
                  case "down":
                    return 0;
                  case "up":
                    return 180;
                  case "left":
                    return 90;
                  case "right":
                    return -90;
                }
              })(this.direction),
            ),
          );
          ctx.translate(nw / -2, nh / -2);
          this.drawImage(
            ctx,
            this.getRenderColor().eq(new Color(87, 94, 117))
              ? ArrowMorph.prototype.greyArrow
              : this.getRenderColor().b < 118
                ? ArrowMorph.prototype.blackArrow
                : ArrowMorph.prototype.whiteArrow,
            horiz,
          );

          ctx.restore();
          return;
        }
        ctx.fillStyle = this.getRenderColor().toString();
        ctx.beginPath();
        if (this.direction === "down") {
          ctx.moveTo(pad, h2);
          ctx.lineTo(w - pad, h2);
          ctx.lineTo(w2, h - pad);
        } else if (this.direction === "up") {
          ctx.moveTo(pad, h2);
          ctx.lineTo(w - pad, h2);
          ctx.lineTo(w2, pad);
        } else if (this.direction === "left") {
          ctx.moveTo(pad, h2);
          ctx.lineTo(w2, pad);
          ctx.lineTo(w2, h - pad);
        } else {
          // 'right'
          ctx.moveTo(w2, pad);
          ctx.lineTo(w - pad, h2);
          ctx.lineTo(w2, h - pad);
        }
        ctx.closePath();
        ctx.fill();
      },
      true,
      2,
    );
    api.wrapFunction(
      ArrowMorph.prototype,
      "getRenderColor",
      function () {
        if (this.isBlockLabel) {
          if (IDE_Morph.prototype.isBright) {
            return SyntaxElementMorph.prototype.alpha > 0.5
              ? this.color
              : BLACK;
          }
          return SyntaxElementMorph.prototype.alpha > 0.5 ? this.color : WHITE;
        }
        return this.color;
      },
      true,
      2,
    );

    SpriteMorph.prototype.blockColor = {
      motion: new Color(76, 151, 255),
      looks: new Color(151, 100, 251),
      sound: new Color(207, 99, 207),
      pen: new Color(15, 189, 140),
      events: new Color(255, 191, 0),
      control: new Color(255, 171, 25),
      sensing: new Color(92, 177, 214),
      operators: new Color(89, 192, 89),
      variables: new Color(255, 140, 26),
      lists: new Color(255, 102, 26),
      other: new Color(170, 170, 170),
    };

    SyntaxElementMorph.prototype.setScale(SyntaxElementMorph.prototype.scale);
    api.refreshBlocks();
    this.api.ide.rerender();
  }
  cleanupFunc() {
    this.api.ide.rerender();
  }
};
