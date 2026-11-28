# Visual settings editor changelog

Changes of each test release of the visual settings editor bundle, newest first, as Morphe Manager shows them.
Drafted with `visual-editor/bundle/changelog.py --version 0.1.N` (test N), then tidied by hand before the release.
Versions carry no "-" suffix: Manager treats those as prereleases and leaves them out of the changelog.
The patcher engine's own changelog is in docs/PATCHER-CHANGELOG.md.


# [0.1.18](https://github.com/desumax/morphe-patcher-visual/compare/v0.1.17...v0.1.18) (2026-11-28)


### Features

* **YouTube - Visual settings editor:** Drag and drop: the miniplayer settles into the nearest corner
* **YouTube - Visual settings editor:** The Morphe design keeps Morphe Manager's dark colours and card edge
* **YouTube - Visual settings editor:** The preview follows Morphe's code for light strength, player overlay and button background opacity, slider ranges and Material You indicators
* **YouTube - Visual settings editor:** Outlines follow each part's shape; hidden channel parts lock what they contain (Channel and Subscribe button)
* **YouTube - Visual settings editor:** Remove viewer discretion dialog gets its own story, with its messages under the dialog


### Bug Fixes

* **YouTube - Visual settings editor:** Every main menu card's screen grows from the card's own edges (the top cards started at the top of the menu)
* **YouTube - Visual settings editor:** Settings described as "Prevents ..." read "Allows ..." instead of carrying an Off tag
* **YouTube - Visual settings editor:** Comparisons stay put at the top instead of shifting
* **YouTube - Visual settings editor:** Story messages step off dialogs and sheets instead of sitting on their edge
* **YouTube - Visual settings editor:** Wheels run the full height of their card and no longer flash after each change


# [0.1.17](https://github.com/desumax/morphe-patcher-visual/compare/v0.1.16...v0.1.17) (2026-11-26)


### Bug Fixes

* **YouTube - Visual settings editor:** Menu cards open without a pop or flash at the end (every card)
* **YouTube - Visual settings editor:** The top bar follows only your finger, so scrolling no longer hides and shows it by itself
* **YouTube - Visual settings editor:** Steadier scrolling: hiding or showing the top bar no longer restyles the whole page
* **YouTube - Visual settings editor:** No stray green glass block in SponsorBlock
* **YouTube - Visual settings editor:** A slow swipe start no longer pops the hold line or a hidden preview part into view


# [0.1.16](https://github.com/desumax/morphe-patcher-visual/compare/v0.1.15...v0.1.16) (2026-11-26)


### Features

* **YouTube - Visual settings editor:** Entering the redesign plays the leave motion backwards, and leaving is 15% faster
* **YouTube - Visual settings editor:** Navigation bar style is its own card above Glass navigation bar
* **YouTube - Visual settings editor:** Search within channel shows Morphe's icon and results sheet; the Off side goes to YouTube's results page
* **YouTube - Visual settings editor:** Open Shorts with: the Short grows from its tile into the chosen player
* **YouTube - Visual settings editor:** Dim while scrolling scrolls the page for real; Navigation bar animations plays four times with its tap
* **YouTube - Visual settings editor:** Subscribed channels bar shows four channels; Custom font file asks for TTF or OTF
* **YouTube - Visual settings editor:** New stories for the theme colours and Startup animation


### Bug Fixes

* **YouTube - Visual settings editor:** With Opaque navigation bar style, Glass navigation bar (locked) and Narrow navigation buttons stay visible
* **YouTube - Visual settings editor:** Long press to reorder playlist videos: the finger stays on the dragged row
* **YouTube - Visual settings editor:** Extra sentences removed from several stories


# [0.1.15](https://github.com/desumax/morphe-patcher-visual/compare/v0.1.14...v0.1.15) (2026-11-25)


### Features

* **YouTube - Visual settings editor:** Menu cards grow into their screen, and the menu from the back arrow settles with half the bounce
* **YouTube - Visual settings editor:** Value wheel stands upright beside the title, keeps the row height and turns at a speed set by its range
* **YouTube - Visual settings editor:** Disable new design pill is tighter and a softer red
* **YouTube - Visual settings editor:** Player controls background sits right after the three area boxes, Player menu toggles are grouped, and Shorts menu follows the preview order
* **YouTube - Visual settings editor:** Show messages in YouTube snackbar plays three times, faster
* **YouTube - Visual settings editor:** Copy timestamp by default: each side keeps its link, and the time sits above the seekbar
* **YouTube - Visual settings editor:** Hands in every story are sized from their phone, so none is too big on a small phone


### Bug Fixes

* **YouTube - Visual settings editor:** Back swipe from Navigation shows the card menu once, with no second pop-in, ghost or text resize
* **YouTube - Visual settings editor:** Leaving the redesign for YouTube's settings fades out instead of flashing white
* **YouTube - Visual settings editor:** Miscellaneous: the top bar follows only your finger
* **YouTube - Visual settings editor:** Edit video effects and other code values open in Morphe instead of showing garbled chips
* **YouTube - Visual settings editor:** Show messages in YouTube snackbar no longer clips its right side
* **YouTube - Visual settings editor:** Menu cards fit their longest line in the web view too
* **YouTube - Visual settings editor:** Video action bar layout: the finger stays on the action bar while the page scrolls back to its top


# [0.1.14](https://github.com/desumax/morphe-patcher-visual/compare/v0.1.13...v0.1.14) (2026-11-25)


### Features

* **YouTube - Visual settings editor:** Number settings turn on a 3D wheel; tap the middle or double tap to type the value in a pill above the keyboard
* **YouTube - Visual settings editor:** Settings are grouped in location boxes (Top, Middle, Bottom area and more) for Player controls, Shorts, Comments, Player menu, Description, Channel and Seekbar
* **YouTube - Visual settings editor:** The Glass navigation bar preview is drawn like the real bar, and Navigation buttons without labels has its preview
* **YouTube - Visual settings editor:** Shorts icon style shows the chosen icon set
* **YouTube - Visual settings editor:** Popups, dropdowns and Import / export grow from the button you tap
* **YouTube - Visual settings editor:** Flying comments stories follow your Display area, font size and duration; slider comparisons follow the slider live
* **YouTube - Visual settings editor:** Return YouTube Dislike feed likes, estimated likes and connection alerts show what they do
* **YouTube - Visual settings editor:** Show messages in YouTube snackbar redrawn from Morphe's code
* **YouTube - Visual settings editor:** Action bar buttons sit two to a line; Comments carousel filter names are toggles
* **YouTube - Visual settings editor:** Glass is switched off for good on weak devices after a longer check


### Bug Fixes

* **YouTube - Visual settings editor:** The green outline of a part is never cut at the top or bottom
* **YouTube - Visual settings editor:** In landscape the screen menu keeps its card size and popups fit
* **YouTube - Visual settings editor:** The Shorts menu no longer restarts its opening animation; Download in Shorts menu is in that same menu
* **YouTube - Visual settings editor:** About is no longer listed under Shorts
* **YouTube - Visual settings editor:** The 'Pull up for precise seeking' pill no longer stays on screen in other seekbar settings
* **YouTube - Visual settings editor:** Menu cards show their longest line in full ('Seekbar & gestures', 'Flying comments')
* **YouTube - Visual settings editor:** The tour button steps through the tour in order
* **YouTube - Visual settings editor:** The text caret no longer shows over the preview
* **YouTube - Visual settings editor:** Copy timestamp by default, Resuming on startup and Spoof app version drop their extra sentences


# [0.1.13](https://github.com/desumax/morphe-patcher-visual/compare/visual-editor-test-12...v0.1.13) (2026-11-25)


### Features

* **YouTube - Visual settings editor:** The web view's screen menu matches the app: Reset order in the top bar, grouped cards fill the menu without scrolling, no card marked before one is opened, closing a search started on the menu goes back to it
* **YouTube - Visual settings editor:** Disable choices sit last in every SponsorBlock section and turn grey when picked
* **YouTube - Visual settings editor:** New previews for Quick actions top margin, Select text of descriptions and posts, Search comments and Comments carousel filter
* **YouTube - Visual settings editor:** Ten Flying comments settings get their own preview; the rest no longer flash the whole preview
* **YouTube - Visual settings editor:** Display area, Comment font size and Travel duration in portrait appear below Separate settings for portrait, which now has a lock
* **YouTube - Visual settings editor:** Morphe settings show only the Visual settings editor switch above About (the Open visual editor row did nothing)


### Bug Fixes

* **YouTube - Visual settings editor:** Return YouTube Dislike off shows the dislike count as a hidden part with its red outline (it left a small green square)
* **YouTube - Visual settings editor:** Video action bar layout and Like and Subscribe glow scroll the preview to the action bar when you're scrolled down
* **YouTube - Visual settings editor:** A hidden part pulses on its own instead of its whole row ('Create a Short' button)
* **YouTube - Visual settings editor:** Minimal comments button, Sanitize highlighted search links and Search comments drop their extra white sentences


# [0.1.12](https://github.com/desumax/morphe-patcher-visual/compare/visual-editor-test-11...visual-editor-test-12) (2026-11-24)


### Features

* **YouTube - Visual settings editor:** The grouped card menu fits the screen without scrolling
* **YouTube - Visual settings editor:** Reset order sits in the top bar beside the title
* **YouTube - Visual settings editor:** Closing search opened from the menu goes back to the menu
* **YouTube - Visual settings editor:** No card is marked as selected on first open
* **YouTube - Visual settings editor:** Hidden parts fade out with their red outline, no leftover red line
* **YouTube - Visual settings editor:** Comparisons open in their final shape, with labels already in place
* **YouTube - Visual settings editor:** Scrolling is 20% less sensitive, with the phone's own fling feel
* **YouTube - Visual settings editor:** The glass is 30% softer everywhere
* **YouTube - Visual settings editor:** The screen menu is 15% darker


### Bug Fixes

* **YouTube - Visual settings editor:** Morphe Manager shows each release's changes (it showed the same one-line text every time)


# [0.1.11](https://github.com/desumax/morphe-patcher-visual/compare/visual-editor-test-10...visual-editor-test-11) (2026-11-24)


### Features

* **YouTube - Visual settings editor:** The two phones of a comparison stay level whatever their labels (Play next in queue type moved up and down between options)
* **YouTube - Visual settings editor:** The top bar always comes back at the top of the list (it could stay hidden after Show on Mute button until a small scroll down and up)
* **YouTube - Visual settings editor:** The list stretches half as far past its ends
* **YouTube - Visual settings editor:** Opening a screen from the card menu shows only that screen (the last one's preview frame flashed first)
* **YouTube - Visual settings editor:** With screens not grouped, each menu card is one compact row in Morphe's order
* **YouTube - Visual settings editor:** Comparison labels fit from the first moment of each round (six comparisons stuck out briefly)
* **YouTube - Visual settings editor:** A glide's travelling colour keeps the glass edge of the part it lands on, and the part's own fill takes over in the same frame (no grey fade or label flash at the end)


### Bug Fixes

* **YouTube - Visual settings editor:** A back swipe that is started and then let go no longer flashes the screen or leaves a see-through menu fading over it
* **YouTube - Visual settings editor:** The regular Morphe list no longer shows for a moment before the visual editor opens
* **YouTube - Visual settings editor:** Only delay with Bluetooth audio pills no longer overlap on small phones


### Performance Improvements

* **YouTube - Visual settings editor:** Popups open and close 1.5x as fast


# [0.1.10](https://github.com/desumax/morphe-patcher-visual/compare/visual-editor-test-9...visual-editor-test-10) (2026-11-24)


### Features

* **YouTube - Visual settings editor:** iOS-like feel in every design: springy presses and glides, popups grow out of the tapped button, lists stretch at their ends, the back swipe follows your finger, light system haptics
* **YouTube - Visual settings editor:** Smoother entry: Morphe settings stay visible while the editor loads, then it rises in as one motion
* **YouTube - Visual settings editor:** Import / Export works like Morphe's own dialog, and values refresh after it
* **YouTube - Visual settings editor:** Settings Morphe edits with its own picker (button order, file and folder pickers) open Morphe's editor instead of a text field
* **YouTube - Visual settings editor:** Search understands the words people type (hyphens, word endings, swipe / pull / slide / drag)
* **YouTube - Visual settings editor:** A search result for a Morphe screen opens that screen's tab
* **YouTube - Visual settings editor:** Morphe design uses the Glass card list
* **YouTube - Visual settings editor:** Comparisons start at once; 104 of them show only the part of the screen they are about, drawn larger
* **YouTube - Visual settings editor:** New and redrawn stories: Post buttons layout, Narrow navigation buttons, pinch-to-zoom, Shorts, feeds, Like and Subscribe glow, Downloads and more
* **YouTube - Visual settings editor:** The redesign needs WebView (Chromium) 138 or newer; older WebViews get the regular Morphe list


### Bug Fixes

* **YouTube - Visual settings editor:** Importing settings no longer switches the redesign off or brings up Morphe's own restart dialog
* **YouTube - Visual settings editor:** An import no longer overwrites Morphe's internal state (an old player script hash stopped every video)
* **YouTube - Visual settings editor:** Tab and toggle glides end without a pop, and glass pills keep their rim
* **YouTube - Visual settings editor:** Many animation fixes: seekbar thumb, overlapping previews, jumping parts, clipped and shifting stories


### Performance Improvements

* **YouTube - Visual settings editor:** Tabs and options glide smoothly on the phone even while a new screen is drawn
* **YouTube - Visual settings editor:** Popups grow from the tapped button on the compositor; quicker comparisons and stories


# [0.1.9](https://github.com/desumax/morphe-patcher-visual/compare/visual-editor-test-1...visual-editor-test-9) (2026-11-24)


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
