# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-10-08

### Added

- The reference site has page jobs (a hero, proof, a card grid, a split, a quote, a dark band, a closing section, and an alert) and four assembled layouts: landing, plugin page, article, and tool.
- Styles load as `brand.css` (fonts and colors) or `ui.css` (layout and components). `rf.css` still loads both, so an existing page keeps working.
- A picture can sit in a circle, or on the other side of a split. On a dark green band, form labels and text links stay light enough to read.
- Tool screens can use folder tabs, an on/off toggle, and a taller filter menu.
- The reference pages are labeled Brand kit, Atoms, Molecules, Organisms, and Pages. Those labels are not new folders.
- A WordPress block theme in `wordpress/rf` is compiled from this contract.

### Changed

- A page gets one moss primary button. An orange button on a dark band uses the page's orange, so the closing section does not get a second orange button.
- The color guide lists the CSS variable beside each color name. Soft orange is `--rf-orange-soft`.

[Unreleased]: https://github.com/Roots-and-Fruit/brand/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Roots-and-Fruit/brand/releases/tag/v1.0.0
