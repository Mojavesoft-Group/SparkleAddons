# Sparkle Addons
> [!WARNING]
> Some of Sparkle's addon APIs have recently been deprecated and their usage is no longer allowed in SparkleAddons effective immediately. See Mojavesoft-Group/sparkle#39 for more information.


Collection of Sparkle addons, downloaded/installed by the menu in Sparkle.

## Development
### Submitting an addon
Fork this repo, add the addon in the "mods" directory as `[id].js`. Then, create a pull request with that fork to this repo, where we will review it. If it is, it'll be merged in the main repo where people can install it!

Addonss are submitted with the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html), if not said otherwise.

Submitting an update to an addon is the same, just fork the repo again, and update the addon file.

Whenever changes are pushed to the `master` branch, a GitHub Actions bot will automatically regenerate the `mods.json` file using the `generate.js` script (historically, addon developers were expected to do this on their own).

### Code formatting
Don't worry about formatting your addon code; a GitHub Actions bot will clean it up automatically when your pull request is merged!

### Dealing with Jameson addons
Addons with filenames following the pattern `mods/jameson-*.js` are Jameson addons, and changes to them must be done with care, because any mistakes will cause issues in an upcoming version of Jameson.

If you _must_ modify a Jameson addon in a major way, please consider opening a pull request so that your changes can be easily reviewed and reverted.

To prevent confusion, you should _not_ create new addons following that naming pattern, unless you are a Jameson developer. 

## A note about manmade code
The owner of this project believes in good faith that it complies with [The Manmade Software Declaration 1.0](https://mojavesoft.net/ai-policy/1.0).
Contributors are encouraged to follow the guidelines described at the aforementioned link when proposing any code changes, and patches that appear to violate those rules may be rejected at any time.
