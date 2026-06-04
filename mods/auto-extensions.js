return class extends Mod {
    ID = "auto-extensions";
    NAME = "Auto Extension Blocks";
    DESCRIPTION = "Automatically enable the \"Extension blocks\" setting.";
    VERSION = "1.0.1";
    AUTHOR = "d016";
    DEPENDS = [];
    DO_MENU = false;

    main() {
        this.startingValue = SpriteMorph.prototype.showingExtensions;
        SpriteMorph.prototype.showingExtensions =
            true;
        this.api.ide.flushBlocksCache('variables');
        this.api.ide.refreshPalette();
        this.api.ide.categories.refreshEmpty();
    }

    cleanupFunc() {
        SpriteMorph.prototype.showingExtensions =
            this.startingValue;
        this.api.ide.flushBlocksCache('variables');
        this.api.ide.refreshPalette();
        this.api.ide.categories.refreshEmpty();
    }
}