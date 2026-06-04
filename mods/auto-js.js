return class extends Mod {
    // Metadata
    ID = "auto-js"; // the id of the addon
    NAME = "Auto JS"; // human-readable name
    DESCRIPTION = "Automatically, by default, enable JavaScript extensions."; // description
    VERSION = "1.1.0"; // version
    AUTHOR = "codingisfun2831"; // author
    DEPENDS = []; // dependencies (addon ids, useful for libraries)
    DO_MENU = false; // whether to add a menu item

    // Main function - gets ran when the addon is loaded
    main() {
        this.startingValue = Process.prototype.enableJS;
        Process.prototype.enableJS = true;
    }

    // Cleanup function - get ran when the addon is "deleted"
    cleanupFunc() {
        Process.prototype.enableJS = this.startingValue;
    }
}