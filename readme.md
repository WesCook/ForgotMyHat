# Forgot My Hat

A small quality-of-life mod to situationally dismiss the "Welcome Back" prompt in [Melvor Idle](https://melvoridle.com/).  The duration can be configured inside the mod settings.  Sometimes you just forgot your hat.

![You Left](assets/you-left.png "Welcome Back popup showing nothing has changed")

[Subscribe on mod.io](https://mod.io/g/melvoridle/m/forgot-my-hat) or via the Melvor Mod Manager.

## Changelog

v1.5.0 - 2024-06-23
- New method for dismissing modals.  Instead of waiting to trigger the modal confirm button, it now proxies the modal enqueue function to intercept and bypass certain modals.
- This has the upside of not dismissing earlier modals when returning to a window where a new modal should be dismissed.  However, time comparisons are now based on when you focus the tab and not when offline calculations finish (ie. it won't match what the Welcome Back modal says).

v1.4.0 - 2024-06-20
- Yet another fix to time detection due to refactor in Melvor v1.3 ?11482
- Fix contributed from BrendanMyers88

v1.3.1 - 2024-06-12
- Further tweaking detection for web version
- Increasing default duration from ten seconds to one minute

v1.3.0 - 2024-06-12
- Updating detection method for Melvor 1.3

v1.2.4 - 2023-09-22
- Version bump for mod.io tagging

v1.2.3 - 2023-04-11
- Version bump for mod.io tagging

v1.2.2 - 2023-04-11
- Compatibility fix for Melvor v1.1.2

v1.2.1 - 2023-01-03
- Improved letter spacing in settings

v1.2.0 - 2022-11-09
- Improved time detection
- Now supports all languages

v1.1.1 - 2022-11-03
- Prevent temporary scrollbar on Township

v1.1.0 - 2022-10-31
- Changing tack on modal detection

v1.0.1 - 2022-10-28
- Clean up any remaining classes

v1.0.0 - 2022-10-28
- Initial release
