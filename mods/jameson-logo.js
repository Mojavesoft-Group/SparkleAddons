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
    ID = "jameson-logo";
    NAME = "Jameson Logo";
    DESCRIPTION = "Replace the Snap! logo with Jameson's logo.";
    VERSION = "1.4.0";
    AUTHOR = "PPPDUD";
    DEPENDS = [];
    DO_MENU = false;
f
    main() {
        this.api.disallowSnaps("Jameson");
        this.api.suggestSnaps("Snap", "JamesonNew");
        this.api.ide.createLogo = function() {
            let oldRenderCachedTexture = this.logo.renderCachedTexture;
            let oldMouseClickLeft = this.logo.mouseClickLeft;
            let oldRender = this.logo.render;
            this.logo.destroy();
            this.logo = new Morph();
            this.logo.texture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAYCAYAAACBbx+6AAAC5klEQVR4AdSWsY7TQBCGf9OQCkdCQApkCgQFUmho754g1BQgOjoqrkEIIURFdx0FggYhUdAhkSfgnoAIBAUFhiKCJqbhkJDMfOs4bBJ7ndzFxVn+PbszO+N/dsfePaYjdq1KOLe8HDqdjpNlv0aaup17FcIQ1GRHmjyQft/ZV/5i4Prvb0ng620JvLs5I4nPYTEL5jeaCPNS5U+3FB+X4r9T109D1++fkkByotAj80exS4YEXJIkaqBPcm+vSYA2dvTI/J4Eikj1zybCbuY0SWcRosfSImQXZMHoW6bsj5Scjp2M40JiI7nBeQnQZhLQIy3ESncjYRdsShii06iRyRJzCfQvJI5s+iNzUvsmpytgPsHbi187bjXC5u4Fg6hpZjf9ElboqbLMSCaJoofZXDLECGEa8X+sqcIXjYTLF/hOoTbjWZU0nZVRSWBVGQqvJsJVLwkFZLxGP5eH2EeW2wc2w2RHOVgeGdY0EQ5711j56NJf80Y+MjTYWAHae995rodWCEN26+w8ESuV6NwTRZefK+ruFrj6Wm5F5keGe60QZgaHX8IvPqi1FcIsP6SrSNnm4GqXerad0bWp5RJVPr6uFcJJ4L9LDVMygKQcTkr0fWJ17VYIhz4m6pc63n5Z1DO1Hd0v2tjqiJb6JsKcJXyUfkHJrK06Y8FAFcYmwu4gY3VX4VqvooavX1q2l3Xq1y61zD96eXS1ppEwy0vdVbtXa5ndqs2D0cw+CSEZh24dBAn3ej0NriR+vLI8fJ3fxu76HIJcw3tQo9RsKanl8t/sDQs2g4TH47E4bTHLtnT+eRViVXBjkot9qTuXaJDEOsYgYQINP2Ri16IsWEKIA6tHR85v53Z4JzmNR8o+7+G+cTQStu1T3V0ps02UQzmARXwmEeSoReSrj2gl/sH08Sk0m302ETaaAtp+puJ8a2dcqztFd1PZv9QlQ1I33hR2bOhVXM63aG7mWUt4ITwvPggWwhy++w8AAP//y1Y21wAAAAZJREFUAwAZOiJAY+EUjQAAAABJRU5ErkJgggAA";
            this.logo.setExtent(new Point(200, 28));
            this.logo.render = oldRender;
            this.logo.renderCachedTexture = oldRenderCachedTexture;
            this.logo.mouseClickLeft = oldMouseClickLeft;
            this.add(this.logo);
        }
        this.api.requestPendingAction("refreshLogo");
    }

    cleanupFunc() {
        // TODO: Add cleanup function.
    }
}