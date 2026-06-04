/*
Copyright (C) 2026 by PPPDUD, with some portions copyright (C) 2025 by Jens Mönig
---------------------------------------------------------------------------------
This addon uses the AGPLv3 license found at https://raw.githubusercontent.com/Mojavesoft-Group/SparkleAddons/refs/heads/master/LICENSES/agplv3.txt, or at LICENSES/agplv3.txt in the SparkleAddons Git repository.

Parts of this addon are derived from Snap! v11's src/gui.js file, which includes the following license statements:

Copyright (C) 2025 by Jens Mönig

Snap! is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

return class extends Mod {
    ID = "classic-settings";
    NAME = "Classic Settings Menu";
    DESCRIPTION = "Patch Snap! v12's settings menu to look like the one in Snap! v11. Note that settings introduced in Snap! v12 are not shown in the classic settings menu.";
    VERSION = "1.0.1";
    AUTHOR = "PPPDUD, Jens Mönig";
    DEPENDS = [];
    DO_MENU = false;
    main() {
        this.oldSettingsMenu = this.api.ide.settingsMenu;
        this.api.ide.settingsMenu = function () {
    var menu,
        stage = this.stage,
        world = this.world(),
        pos = this.controlBar.settingsButton.bottomLeft(),
        shiftClicked = (world.currentKey === 16),
        on = new SymbolMorph(
            'checkedBox',
            MorphicPreferences.menuFontSize * 0.75
        ),
        off = new SymbolMorph(
            'rectangle',
            MorphicPreferences.menuFontSize * 0.75
        );

    function addPreference(label, toggle, test, onHint, offHint, hide) {
        if (!hide || shiftClicked) {
            menu.addItem(
                [
                    (test? on : off),
                    localize(label)
                ],
                toggle,
                test ? onHint : offHint,
                hide ? new Color(100, 0, 0) : null
            );
        }
    }

    function addSubPreference(label, toggle, test, onHint, offHint, hide) {
        if (!hide || shiftClicked) {
            menu.addItem(
                [
                    (test? on : off),
                    '  ' + localize(label)
                ],
                toggle,
                test ? onHint : offHint,
                hide ? new Color(100, 0, 0) : null
            );
        }
    }

    menu = new MenuMorph(this);
    menu.addPair(
        [
            new SymbolMorph(
                'globe',
                MorphicPreferences.menuFontSize
            ),
            localize('Language...')
        ],
        'languageMenu'
    );
    menu.addItem(
        localize('Looks') + '...',
        'looksMenu'
    );
    menu.addItem(
        'Zoom blocks...',
        'userSetBlocksScale'
    );
    menu.addItem(
        'Fade blocks...',
        'userFadeBlocks'
    );
    menu.addItem(
        'Afterglow blocks...',
        'userSetBlocksAfterglow'
    );
    menu.addItem(
        'Stage size...',
        'userSetStageSize'
    );
    if (shiftClicked) {
        menu.addItem(
            'Dragging threshold...',
            'userSetDragThreshold',
            'specify the distance the hand has to move\n' +
                'before it picks up an object',
            new Color(100, 0, 0)
        );
    }
    menu.addItem(
        'Microphone resolution...',
        'microphoneMenu'
    );
    menu.addLine();
    if (shiftClicked) {
        menu.addItem(
            'Primitives palette',
            () => this.stage.restorePrimitives(),
            'EXPERIMENTAL - switch (back) to\n' +
                'primitive blocks in the palette',
            new Color(100, 0, 0)
        );
        menu.addItem(
            'Customize primitives',
            () => this.stage.customizeBlocks(),
            'EXPERIMENTAL - overload primitives\n' +
                'with custom block definitions',
            new Color(100, 0, 0)
        );
        menu.addLine();
        addPreference(
            'Blocks all the way',
            () => {
                if (SpriteMorph.prototype.isBlocksAllTheWay()) {
                    this.stage.restorePrimitives();
                } else {
                    this.bootstrapCustomizedPrimitives(
                        this.stage.customizeBlocks()
                    );
                }
            },
            SpriteMorph.prototype.isBlocksAllTheWay(),
            'uncheck to disable editing primitives\n' +
                'in the palette as custom blocks',
            'check to edit primitives\nin the palette as custom blocks',
            new Color(100, 0, 0)

        );
        if (SpriteMorph.prototype.hasCustomizedPrimitives()) {
            menu.addItem(
                'Use custom blocks',
                () => SpriteMorph.prototype.toggleAllCustomizedPrimitives(
                    this.stage,
                    false
                ),
                'EXPERIMENTAL - use custom blocks\n' +
                    'in all palette blocks',
                new Color(100, 0, 0)
            );
            menu.addItem(
                'Use primitives',
                () => SpriteMorph.prototype.toggleAllCustomizedPrimitives(
                    this.stage,
                    true
                ),
                'EXPERIMENTAL - use primitives\n' +
                    'in all palette blocks',
                new Color(100, 0, 0)
            );
            menu.addLine();
        }
    }
    addPreference(
        'JavaScript extensions',
        () => {
            /*
            if (!Process.prototype.enableJS) {
                this.logout();
            }
            */
            Process.prototype.enableJS = !Process.prototype.enableJS;
            if (Process.prototype.enableJS) {
                // show JS-func primitive in case a microworld hides it
                delete StageMorph.prototype.hiddenPrimitives.reportJSFunction;
            }
            this.flushBlocksCache('operators');
            this.refreshPalette();
            this.categories.refreshEmpty();
        },
        Process.prototype.enableJS,
        'uncheck to disable support for\nnative JavaScript functions',
        'check to support\nnative JavaScript functions' /* +
            '.\n' +
            'NOTE: You will have to manually\n' +
            'sign in again to access your account.' */
    );
    addPreference(
        'Extension blocks',
        () => {
            SpriteMorph.prototype.showingExtensions =
                !SpriteMorph.prototype.showingExtensions;
            this.flushBlocksCache('variables');
            this.refreshPalette();
            this.categories.refreshEmpty();
        },
        SpriteMorph.prototype.showingExtensions,
        'uncheck to hide extension\nprimitives in the palette',
        'check to show extension\nprimitives in the palette'
    );
    /*
    addPreference(
        'Add scenes',
        () => this.isAddingScenes = !this.isAddingScenes,
        this.isAddingScenes,
        'uncheck to replace the current project,\nwith a new one',
        'check to add other projects,\nto this one',
        true
    );
    */
    if (isRetinaSupported()) {
        addPreference(
            'Retina display support',
            'toggleRetina',
            isRetinaEnabled(),
            'uncheck for lower resolution,\nsaves computing resources',
            'check for higher resolution,\nuses more computing resources',
            true
        );
    }
    addPreference(
        'Input sliders',
        'toggleInputSliders',
        MorphicPreferences.useSliderForInput,
        'uncheck to disable\ninput sliders for\nentry fields',
        'check to enable\ninput sliders for\nentry fields'
    );
    if (MorphicPreferences.useSliderForInput) {
        addSubPreference(
            'Execute on slider change',
            'toggleSliderExecute',
            ArgMorph.prototype.executeOnSliderEdit,
            'uncheck to suppress\nrunning scripts\nwhen moving the slider',
            'check to run\nthe edited script\nwhen moving the slider'
        );
    }
    addPreference(
        'Turbo mode',
        'toggleFastTracking',
        this.stage.isFastTracked,
        'uncheck to run scripts\nat normal speed',
        'check to prioritize\nscript execution'
    );
    addPreference(
        'Visible stepping',
        'toggleSingleStepping',
        Process.prototype.enableSingleStepping,
        'uncheck to turn off\nvisible stepping',
        'check to turn on\n visible stepping (slow)',
        false
    );
    addPreference(
        'Log pen vectors',
        () => StageMorph.prototype.enablePenLogging =
            !StageMorph.prototype.enablePenLogging,
        StageMorph.prototype.enablePenLogging,
        'uncheck to turn off\nlogging pen vectors',
        'check to turn on\nlogging pen vectors',
        false
    );
    addPreference(
        'Case sensitivity',
        () => Process.prototype.isCaseInsensitive =
            !Process.prototype.isCaseInsensitive,
        !Process.prototype.isCaseInsensitive,
        'uncheck to ignore upper- and\n lowercase when comparing texts',
        'check to distinguish upper- and\n lowercase when comparing texts',
        false
    );
    addPreference(
        'Ternary Boolean slots',
        () => BooleanSlotMorph.prototype.isTernary =
            !BooleanSlotMorph.prototype.isTernary,
        BooleanSlotMorph.prototype.isTernary,
        'uncheck to limit\nBoolean slots to true / false',
        'check to allow\nempty Boolean slots',
        true
    );
    addPreference(
        'Camera support',
        'toggleCameraSupport',
        CamSnapshotDialogMorph.prototype.enableCamera,
        'uncheck to disable\ncamera support',
        'check to enable\ncamera support',
        true
    );
    addPreference(
        'Dynamic sprite rendering',
        () => SpriteMorph.prototype.isCachingImage =
            !SpriteMorph.prototype.isCachingImage,
        !SpriteMorph.prototype.isCachingImage,
        'uncheck to render\nsprites dynamically',
        'check to cache\nsprite renderings',
        true
    );
    addPreference(
        'Dynamic scheduling',
        () => StageMorph.prototype.enableQuicksteps =
            !StageMorph.prototype.enableQuicksteps,
        StageMorph.prototype.enableQuicksteps,
        'uncheck to schedule\nthreads framewise',
        'check to quickstep\nthreads atomically',
        true
    );
    addPreference(
        'Performer mode',
        () => this.togglePerformerMode(),
        this.performerMode,
        'uncheck to go back to regular\nlayout',
        'check to have the stage use up\nall space and go behind the\n' +
        'scripting area'
    );
    if (this.performerMode) {
        menu.addItem(
            'Performer mode scale...',
            'userSetPerformerModeScale',
            'specify the scale of the stage\npixels in performer mode'
        );
    }
    menu.addLine(); // everything visible below is persistent
    addPreference(
        'Blurred shadows',
        'toggleBlurredShadows',
        useBlurredShadows,
        'uncheck to use solid drop\nshadows and highlights',
        'check to use blurred drop\nshadows and highlights',
        true
    );
    addPreference(
        'Zebra coloring',
        'toggleZebraColoring',
        BlockMorph.prototype.zebraContrast,
        'uncheck to disable alternating\ncolors for nested block',
        'check to enable alternating\ncolors for nested blocks',
        true
    );
    addPreference(
        'Dynamic input labels',
        'toggleDynamicInputLabels',
        SyntaxElementMorph.prototype.dynamicInputLabels,
        'uncheck to disable dynamic\nlabels for variadic inputs',
        'check to enable dynamic\nlabels for variadic inputs',
        true
    );
    addPreference(
        'Prefer empty slot drops',
        'togglePreferEmptySlotDrops',
        ScriptsMorph.prototype.isPreferringEmptySlots,
        'uncheck to allow dropped\nreporters to kick out others',
        'settings menu prefer empty slots hint',
        true
    );
    addPreference(
        'Long form input dialog',
        'toggleLongFormInputDialog',
        InputSlotDialogMorph.prototype.isLaunchingExpanded,
        'uncheck to use the input\ndialog in short form',
        'check to always show slot\ntypes in the input dialog'
    );
    addPreference(
        'Plain prototype labels',
        'togglePlainPrototypeLabels',
        BlockLabelPlaceHolderMorph.prototype.plainLabel,
        'uncheck to always show (+) symbols\nin block prototype labels',
        'check to hide (+) symbols\nin block prototype labels'
    );
    addPreference(
        'Clicking sound',
        () => {
            BlockMorph.prototype.toggleSnapSound();
            if (BlockMorph.prototype.snapSound) {
                this.saveSetting('click', true);
            } else {
                this.removeSetting('click');
            }
        },
        BlockMorph.prototype.snapSound,
        'uncheck to turn\nblock clicking\nsound off',
        'check to turn\nblock clicking\nsound on'
    );
    addPreference(
        'Animations',
        () => this.isAnimating = !this.isAnimating,
        this.isAnimating,
        'uncheck to disable\nIDE animations',
        'check to enable\nIDE animations',
        true
    );
    /*
    addPreference(
        'Cache Inputs',
        () => {
            BlockMorph.prototype.isCachingInputs =
                !BlockMorph.prototype.isCachingInputs;
        },
        BlockMorph.prototype.isCachingInputs,
        'uncheck to stop caching\ninputs (for debugging the evaluator)',
        'check to cache inputs\nboosts recursion',
        true
    );
    */
    addPreference(
        'Rasterize SVGs',
        () => MorphicPreferences.rasterizeSVGs =
            !MorphicPreferences.rasterizeSVGs,
        MorphicPreferences.rasterizeSVGs,
        'uncheck for smooth\nscaling of vector costumes',
        'check to rasterize\nSVGs on import',
        true
    );
    addPreference(
        'Nested auto-wrapping',
        () => {
            ScriptsMorph.prototype.enableNestedAutoWrapping =
                !ScriptsMorph.prototype.enableNestedAutoWrapping;
            if (ScriptsMorph.prototype.enableNestedAutoWrapping) {
                this.removeSetting('autowrapping');
            } else {
                this.saveSetting('autowrapping', false);
            }
        },
        ScriptsMorph.prototype.enableNestedAutoWrapping,
        'uncheck to confine auto-wrapping\nto top-level block stacks',
        'check to enable auto-wrapping\ninside nested block stacks',
        true
    );
    addPreference(
        'Sprite Nesting',
        () => SpriteMorph.prototype.enableNesting =
            !SpriteMorph.prototype.enableNesting,
        SpriteMorph.prototype.enableNesting,
        'uncheck to disable\nsprite composition',
        'check to enable\nsprite composition',
        true
    );
    addPreference(
        'First-Class Sprites',
        () => {
            SpriteMorph.prototype.enableFirstClass =
                !SpriteMorph.prototype.enableFirstClass;
            this.flushBlocksCache('sensing');
            this.refreshPalette();
            this.categories.refreshEmpty();
        },
        SpriteMorph.prototype.enableFirstClass,
        'uncheck to disable support\nfor first-class sprites',
        'check to enable support\n for first-class sprite',
        true
    );
    addPreference(
        'Keyboard Editing',
        () => {
            ScriptsMorph.prototype.enableKeyboard =
                !ScriptsMorph.prototype.enableKeyboard;
            this.currentSprite.scripts.updateToolbar();
            if (ScriptsMorph.prototype.enableKeyboard) {
                this.removeSetting('keyboard');
            } else {
                this.saveSetting('keyboard', false);
            }
        },
        ScriptsMorph.prototype.enableKeyboard,
        'uncheck to disable\nkeyboard editing support',
        'check to enable\nkeyboard editing support',
        true
    );
    addPreference(
        'Table support',
        () => {
            List.prototype.enableTables =
                !List.prototype.enableTables;
            if (List.prototype.enableTables) {
                this.removeSetting('tables');
            } else {
                this.saveSetting('tables', false);
            }
        },
        List.prototype.enableTables,
        'uncheck to disable\nmulti-column list views',
        'check for multi-column\nlist view support',
        true
    );
    if (List.prototype.enableTables) {
        addPreference(
            'Table lines',
            () => {
                TableMorph.prototype.highContrast =
                    !TableMorph.prototype.highContrast;
                if (TableMorph.prototype.highContrast) {
                    this.saveSetting('tableLines', true);
                } else {
                    this.removeSetting('tableLines');
                }
            },
            TableMorph.prototype.highContrast,
            'uncheck for less contrast\nmulti-column list views',
            'check for higher contrast\ntable views',
            true
        );
    }
    addPreference(
        'Live coding support',
        () => Process.prototype.enableLiveCoding =
            !Process.prototype.enableLiveCoding,
        Process.prototype.enableLiveCoding,
        'EXPERIMENTAL! uncheck to disable live\ncustom control structures',
        'EXPERIMENTAL! check to enable\n live custom control structures',
        true
    );
    addPreference(
        'JIT compiler support',
        () => {
            Process.prototype.enableCompiling =
                !Process.prototype.enableCompiling;
            this.flushBlocksCache('operators');
            this.refreshPalette();
            this.categories.refreshEmpty();
        },
        Process.prototype.enableCompiling,
        'EXPERIMENTAL! uncheck to disable live\nsupport for compiling',
        'EXPERIMENTAL! check to enable\nsupport for compiling',
        true
    );
    menu.addLine(); // everything below this line is stored in the project
    addPreference(
        'Thread safe scripts',
        () => stage.isThreadSafe = !stage.isThreadSafe,
        this.stage.isThreadSafe,
        'uncheck to allow\nscript reentrance',
        'check to disallow\nscript reentrance'
    );
    addPreference(
        'Flat line ends',
        () => SpriteMorph.prototype.useFlatLineEnds =
            !SpriteMorph.prototype.useFlatLineEnds,
        SpriteMorph.prototype.useFlatLineEnds,
        'uncheck for round ends of lines',
        'check for flat ends of lines'
    );
    addPreference(
        'Codification support',
        () => {
            StageMorph.prototype.enableCodeMapping =
                !StageMorph.prototype.enableCodeMapping;
            this.flushBlocksCache('variables');
            this.refreshPalette();
            this.categories.refreshEmpty();
        },
        StageMorph.prototype.enableCodeMapping,
        'uncheck to disable\nblock to text mapping features',
        'check for block\nto text mapping features',
        false
    );
    addPreference(
        'Inheritance support',
        () => {
            StageMorph.prototype.enableInheritance =
                !StageMorph.prototype.enableInheritance;
            this.flushBlocksCache('variables');
            this.refreshPalette();
            this.categories.refreshEmpty();
        },
        StageMorph.prototype.enableInheritance,
        'uncheck to disable\nsprite inheritance features',
        'check for sprite\ninheritance features',
        true
    );
    addPreference(
        'Hyper blocks support',
        () => Process.prototype.enableHyperOps =
            !Process.prototype.enableHyperOps,
        Process.prototype.enableHyperOps,
        'uncheck to disable\nusing operators on lists and tables',
        'check to enable\nusing operators on lists and tables',
        true
    );
    addPreference(
        'Single palette',
        () => this.toggleUnifiedPalette(),
        this.scene.unifiedPalette,
        'uncheck to show only the selected category\'s blocks',
        'check to show all blocks in a single palette',
        false
    );
    if (this.scene.unifiedPalette) {
        addSubPreference(
            'Show categories',
            () => this.toggleCategoryNames(),
            this.scene.showCategories,
            'uncheck to hide\ncategory names\nin the palette',
            'check to show\ncategory names\nin the palette'
        );
        addSubPreference(
            'Show buttons',
            () => this.togglePaletteButtons(),
            this.scene.showPaletteButtons,
            'uncheck to hide buttons\nin the palette',
            'check to show buttons\nin the palette'
        );
    }
    addPreference(
        'Wrap list indices',
        () => {
            List.prototype.enableWrapping =
                !List.prototype.enableWrapping;
        },
        List.prototype.enableWrapping,
        'uncheck to disable\nwrapping list indices',
        'check for wrapping\nlist indices',
        true
    );
    addPreference(
        'Persist linked sublist IDs',
        () => StageMorph.prototype.enableSublistIDs =
            !StageMorph.prototype.enableSublistIDs,
        StageMorph.prototype.enableSublistIDs,
        'uncheck to disable\nsaving linked sublist identities',
        'check to enable\nsaving linked sublist identities',
        true
    );
    addPreference(
        'Enable command drops in all rings',
        () => RingReporterSlotMorph.prototype.enableCommandDrops =
            !RingReporterSlotMorph.prototype.enableCommandDrops,
        RingReporterSlotMorph.prototype.enableCommandDrops,
        'uncheck to disable\ndropping commands in reporter rings',
        'check to enable\ndropping commands in all rings',
        true
    );

    addPreference(
        'HSL pen color model',
        () => {
            SpriteMorph.prototype.penColorModel =
                SpriteMorph.prototype.penColorModel === 'hsl' ? 'hsv' : 'hsl';
            this.refreshIDE();
        },
        SpriteMorph.prototype.penColorModel === 'hsl',
        'uncheck to switch pen colors\nand graphic effects to HSV',
        'check to switch pen colors\nand graphic effects to HSL',
        false
    );

    addPreference(
        'Disable click-to-run',
        () => ThreadManager.prototype.disableClickToRun =
            !ThreadManager.prototype.disableClickToRun,
        ThreadManager.prototype.disableClickToRun,
        'uncheck to enable\ndirectly running blocks\nby clicking on them',
        'check to disable\ndirectly running blocks\nby clicking on them',
        false
    );
    addPreference(
        'Disable dragging data',
        () => SpriteMorph.prototype.disableDraggingData =
            !SpriteMorph.prototype.disableDraggingData,
        SpriteMorph.prototype.disableDraggingData,
        'uncheck to drag media\nand blocks out of\nwatchers and balloons',
        'disable dragging media\nand blocks out of\nwatchers and balloons',
        false
    );
    menu.popup(world, pos);
};
    };

    cleanupFunc() {
        // TODO: Complete cleanFunc() implementation.
        this.api.ide.settingsMenu = this.oldSettingsMenu;
    }
}

