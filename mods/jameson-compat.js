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
    ID = "jameson-compat";
    NAME = "Jameson Primitives";
    DESCRIPTION = "Extended primitives from the Jameson programming language.";
    VERSION = "1.5.0";
    AUTHOR = "PPPDUD";
    DEPENDS = [];
    DO_MENU = false;

    // Main function - gets ran when the mod is loaded
    main() {
        this.api.disallowSnaps("Jameson")
        // Jameson UUID v4 generation and WebCrypto access
        SnapExtensions.primitives.set(
            'generate_uuid()',
            function() {
                return self.crypto.randomUUID();
            }
        );

        SnapExtensions.primitives.set(
            'uuid_available()',
            function() {
                return Boolean(self?.crypto?.randomUUID);
            }
        );

        SnapExtensions.primitives.set(
            'webcrypto_available()',
            function() {
                return Boolean(self.crypto);
            }
        );

        // Jameson self-inspection primitives
        SnapExtensions.primitives.set(
            'trusted_urls()',
            function() {
                return IDE_Morph.prototype.newList(SnapExtensions.urls);
            }
        );


        SnapExtensions.primitives.set(
            'get_primitive_code(name)',
            function(name) {
                return SnapExtensions.primitives.get(name).toString();
            }
        );

        SnapExtensions.primitives.set(
            'all_primitives()',
            function() {
                let my_primitives = Object.fromEntries(SnapExtensions.primitives);
                return IDE_Morph.prototype.newList(Object.getOwnPropertyNames(my_primitives));
            }
        );

        // Jameson WebSocket support; not compatible with Snap! 12's upcoming WebSocket library
        SnapExtensions.primitives.set(
            'websocket_connect(url)',
            function(url) {
                let newWebSocket = new WebSocket(url);
                newWebSocket.jamesonLastMsg = "";
                newWebSocket.jamesonMsgChecked = true;
                newWebSocket.onmessage = function(event) {
                    this.jamesonLastMsg = event.data;
                    this.jamesonMsgChecked = false;
                };
                return newWebSocket;
            }
        );

        SnapExtensions.primitives.set(
            'websocket_close(obj, code)',
            function(obj, code) {
                obj.close(code);
                console.log("closed")
            }
        );

        SnapExtensions.primitives.set(
            'websocket_state(obj)',
            function(obj) {
                return obj.readyState;
            }
        );

        SnapExtensions.primitives.set(
            'websocket_send(obj, data)',
            function(obj, data) {
                obj.send(data);
            }
        );

        SnapExtensions.primitives.set(
            'websocket_lastmsg(obj)',
            function(obj, data) {
                obj.jamesonMsgChecked = true;
                return obj.jamesonLastMsg;
            }
        );

        SnapExtensions.primitives.set(
            'websocket_msgchecked(obj)',
            function(obj, data) {
                return obj.jamesonMsgChecked;
            }
        );

        // Jameson-specific APIs for detecting Sparkle
        SnapExtensions.primitives.set(
            "sparkle_detect()",
            function() {
                return true;
            },
        );

        SnapExtensions.primitives.set(
            "sparkle_version()",
            function() {
                return this.api.crackle?.version;
            },
        );

        SnapExtensions.primitives.set(
            "sparkle_source()",
            function() {
                return this.api.crackle?.source;
            },
        );

        SnapExtensions.primitives.set(
            "sparkle_isdev()",
            function() {
                return this.api.crackle?.isDev;
            },
        );

        SnapExtensions.primitives.set(
            "sparkle_addonrepo()",
            function() {
                return this.api.crackle?.addonRepoPath ?? "";
            },
        );
    }

    // Cleanup function - get ran when the mod is "deleted"
    cleanupFunc() {
        SnapExtensions.primitives.delete('generate_uuid()');
        SnapExtensions.primitives.delete('uuid_available()');
        SnapExtensions.primitives.delete('webcrypto_available()');
        SnapExtensions.primitives.delete('trusted_urls()');
        SnapExtensions.primitives.delete('all_primitives()');
        SnapExtensions.primitives.delete('websocket_connect(url)');
        SnapExtensions.primitives.delete('websocket_close(obj, code)');
        SnapExtensions.primitives.delete('websocket_state(obj)');
        SnapExtensions.primitives.delete('websocket_send(obj, data)');
        SnapExtensions.primitives.delete('websocket_lastmsg(obj)');
        SnapExtensions.primitives.delete('websocket_msgchecked(obj)');
        SnapExtensions.primitives.delete('sparkle_detect()');
        SnapExtensions.primitives.delete('sparkle_version()');
        SnapExtensions.primitives.delete('sparkle_source()');
        SnapExtensions.primitives.delete('sparkle_isdev()');
        SnapExtensions.primitives.delete('sparkle_addonrepo()');
    }
}