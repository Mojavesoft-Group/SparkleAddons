return class extends Mod { 
    ID = "auto-everything";
    NAME = "Auto Everything";
    DESCRIPTION = "Automatically enable various settings.";
    VERSION = "1.0.0";
    AUTHOR = "PPPDUD, codingisfun2831, d016";
    DEPENDS = [];
    DO_MENU = false;
    OPTIONS_FORMAT = [
        "Auto Everything Settings",
        {
            id: "dropDown",
            name: "Auto-enable extensions?",
            type: "string",
            default: "No",
            menu: {
                "Yes": "Yes",
                "No": "No",
            },
            readOnly: true,
        },

        {
            id: "dropDown2",
            name: "Auto-enable JS support?",
            type: "string",
            default: "No",
            menu: {
                "Yes": "Yes",
                "No": "No",
            },
            readOnly: true,
        },
    ]

    main() {
        let myself = this;

        function update_settings() {
            if (myself.options.dropDown == "Yes") {
                SpriteMorph.prototype.showingExtensions =
                    true;
                myself.api.ide.flushBlocksCache('variables');
                myself.api.ide.refreshPalette();
                myself.api.ide.categories.refreshEmpty();
            }

            if (myself.options.dropDown2 == "Yes") {
                Process.prototype.enableJS = true;
            }
        }
        update_settings();

        myself.addEventListener("optionsChanged", () => {
            myself.api.ide.inform("Auto Everything", "In order for your changes to take effect, you need to reload Snap!.");
        });
    }

    cleanupFunc() {
        // TODO: Add cleanupFunc for auto-everything.js.
    }
}
