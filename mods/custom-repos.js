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
    ID = "custom-repos";
    NAME = "Custom Repositories";
    DESCRIPTION = "Configure a custom addon repository in Sparkle.";
    VERSION = "1.1.0";
    AUTHOR = "PPPDUD";
    DEPENDS = [];
    DO_MENU = false;

    OPTIONS_FORMAT = [
        "Repository settings",
        {
            id: "repoURL",
            name: "Repository base URL",
            type: "string",
            default: "https://raw.githubusercontent.com/Mojavesoft-Group/SparkleMods/refs/heads/master/",
        },
    ];

    main() {
        console.log(this.options.repoURL);
        this.api.crackle.addonRepoPath = this.options.repoURL;
        this.addEventListener("optionsChanged", () => {
            this.api.crackle.addonRepoPath = this.options.repoURL;
        });
    };

    cleanupFunc() {
        this.api.crackle.addonRepoPath = "https://raw.githubusercontent.com/Mojavesoft-Group/SparkleMods/refs/heads/master/";
    }
}
