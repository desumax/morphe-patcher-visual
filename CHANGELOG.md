# Visual settings editor changelog

Changes of each test release of the visual settings editor bundle, newest first, as Morphe Manager shows them.
Drafted with `visual-editor/bundle/changelog.py --version 0.1.0-test.N`, then tidied by hand before the release.
The patcher engine's own changelog is in docs/PATCHER-CHANGELOG.md.


# [0.1.0-test.9](https://github.com/desumax/morphe-patcher-visual/compare/visual-editor-test-1...visual-editor-test-9) (2026-11-24)


### Features

* **YouTube - Visual settings editor:** The editor is the designed live preview, running inside Morphe settings on a full-screen card menu with predictive back
* **YouTube - Visual settings editor:** Values, titles, list choices, defaults and availability come live from your Morphe build; only settings with a row in your Morphe list are shown
* **YouTube - Visual settings editor:** Morphe's action rows work in the editor (import / export, export logs, links)
* **YouTube - Visual settings editor:** Save for later: changes that need a restart are kept, and the next visit offers Apply and restart, Reset or Continue
* **YouTube - Visual settings editor:** Three UI designs (Original, Morphe, Liquid Glass) with automatic device tiers
* **YouTube - Visual settings editor:** Redesigned group cards, locked settings with an unlock animation, gliding option pills and toggles
* **YouTube - Visual settings editor:** Side-by-side comparisons and animations for most settings, reorganised by where they act
* **YouTube - Visual settings editor:** Renamed Morphe settings keep their preview; new list values show plainly
* **YouTube - Visual settings editor:** Disable new design button in the screen menu; "Redesign unsupported on this device" when the WebView can't run it


### Bug Fixes

* **YouTube - Visual settings editor:** The patch never makes patching fail; it only logs a warning when Morphe settings are missing
* **YouTube - Visual settings editor:** Changes are no longer undone by Morphe's forced restart when settings close
* **YouTube - Visual settings editor:** A greyed-out setting can't be changed, and a failed read opens the regular Morphe list instead
* **YouTube - Visual settings editor:** Settings without a row (deprecated, internal) stay out of the editor
* **YouTube - Visual settings editor:** Setting titles no longer carry Morphe's invisible new-setting marker
* **YouTube - Visual settings editor:** Many animation fixes: autoplay, loop count, quality priority, toolbar tabs, menus, fullscreen, captions


### Performance Improvements

* **YouTube - Visual settings editor:** Lighter scrolling and redraws, cheaper glass rendering, faster unlock and glides
