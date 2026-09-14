# VoXide redistribution audit

- Game release: VoXide v0.1.11, official repository commit `0ad45c42b13e9973c032541f933499c22ed9d581`.
- Game code: GPL-2.0-or-later; full license is present upstream and with the release.
- Shipped game assets: upstream `assets/pack/CREDITS.md` states everything shipped is CC0 1.0. It identifies the OpenGameArt block pack, Kenney sound packs and exact Freesound works. Procedural tiles are original. The repository expressly states that no Mojang assets, code or data are used.
- Emulator: PSoXide, GPL-2.0-or-later. Deployed official browser build snapshot downloaded from the PSoXide itch release on 2026-09-14; source repository snapshot `38af605ac5a6961f3798d432bcfb7cceacece239`.
- Portal wrapper: original integration code in this repository, MIT licensed.
- Disc adaptation: track 1 is the unmodified official BIN. The web delivery image appends a three-second silent CD-DA track because the official streaming frontend expects at least one audio track. This does not modify game code or data.

Sources: https://github.com/ABelliqueux/voxide and https://github.com/EBonura/PSoXide-emulator

