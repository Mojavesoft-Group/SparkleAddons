/*MIT License

Copyright (c) 2026 PPPDUD

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

return class extends Mod {
    // Metadata
    ID = "snap-inspector"; // the id of the addon
    NAME = "Snap! Inspector"; // human-readable name
    DESCRIPTION = "Inspect Snap!'s internals and temporarily patch them."; // description
    VERSION = "1.2.0"; // version
    AUTHOR = "PPPDUD"; // author
    DEPENDS = []; // dependencies (addon ids, useful for libraries)
    DO_MENU = true; // whether to add a menu item

    // Main function - gets ran when the addon is loaded
    main() {
        let ide = this.api.ide;
        this.menu.addItem("Execute JavaScript", () => {
            new DialogBoxMorph(
                this,
                (input) => {
                    eval(input);
                },
                this,
            ).promptCode(
                "Execute JavaScript",
                "// JavaScript code goes here.",
                world,
            );
        });

        this.menu.addItem("Edit trusted code domains", () => {
            new DialogBoxMorph(
                this,
                (input) => {
                    SnapExtensions.urls = input.split("\n");
                },
                this,
            ).promptCode(
                "Edit trusted code domains",
                SnapExtensions.urls.join("\n"),
                world,
            );
        });

        this.menu.addItem("Edit addon code", () => {
            let new_obj = {};
            //let json_obj = JSON.parse(localStorage.getItem("crackle_autoload_mods"));
            Object.keys(this.api.crackle.modCodes).forEach((e) => {
                new_obj[e] = e;
            });
            ide.prompt(
                "Select an addon",
                (name) => {
                    console.log(name);
                    new DialogBoxMorph(
                        this,
                        (input) => {
                            console.log(input);
                            this.api.crackle.modCodes[name] = input;
                            if (name in this.api.crackle.autoloadMods) {
                                add(name);
                            }
                            this.ide.inform("In order to changes to take effect, you may have to refresh this page.", "Notice");
                        },
                        this,
                    ).promptCode("Edit addon code", this.api.crackle.modCodes[name], world);
                },
                new_obj,
                "",
            );
        });

        this.menu.addItem("View primitive code", () => {
            let new_obj = {};
            let primitives_dict = Object.fromEntries(SnapExtensions.primitives);
            Object.keys(primitives_dict).forEach((e) => {
                new_obj[e] = e;
            });
            ide.prompt(
                "Select a primitive",
                (name) => {
                    console.log(name);
                    new DialogBoxMorph(this, (input) => {}, this).promptCode(
                        "View code",
                        primitives_dict[name].toString(),
                        world,
                    );
                },
                new_obj,
                "",
            );
        });
    }

    // Cleanup function - get ran when the addon is "deleted"
    cleanupFunc() {}
};