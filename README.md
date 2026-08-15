# YTM Remote

A browser remote control for the [YouTube Music desktop app](https://github.com/th-ch/youtube-music). One HTML file, no build step, no backend — it talks straight to the app's **API Server** plugin running on your own machine.

**→ [Open the remote](https://surajbhari.com/ytm-remote/)**

Your connection details stay in `localStorage` in your browser. Nothing is sent anywhere except to the player address you enter.

## Setup

1. In the YouTube Music desktop app, open **Plugins → API Server** and enable it. Note the port it reports (mine is `26538`).
2. Open the remote and click **Connections**.
3. Enter the address (`http://localhost:26538`), give it a name, and click **Add and connect**.
4. If the plugin is set to ask before granting access, an approval prompt appears in the desktop app — accept it. The request blocks until you do.

The token you get back is saved locally, so you only do this once per device. You can save several players and switch between them.

## What it does

**Playback** — play/pause, previous, next, seek by dragging the counter bar, jump back and forward 10 seconds.

**Track** — title, artist, album, artwork, play count, release year, duration, media type, and a link to the track on YouTube.

**Rating** — like and dislike, showing the current state.

**Modes** — shuffle, repeat (off / all / one), volume, mute, and fullscreen on the desktop player.

**Queue** — the full queue with the current track highlighted; click to jump to a track, reorder it, remove it, or clear the queue. A separate tab shows what's coming up next.

**Search** — search the YouTube Music catalogue and drop any result into the queue. You can also paste a raw video ID.

### Keyboard

| Key | Action | Key | Action |
|---|---|---|---|
| `Space` | Play / pause | `M` | Mute |
| `←` `→` | Seek ∓10s | `S` | Shuffle |
| `N` / `P` | Next / previous | `R` | Repeat |
| `L` | Like | `F` | Fullscreen |

## Browser support

The page is served over HTTPS from GitHub Pages but calls `http://localhost`. Browsers treat `localhost` as a trusted origin, so this is allowed in **Chrome and Edge** (the plugin also sends `Access-Control-Allow-Private-Network`, which Chrome requires).

**Safari blocks it.** If you use Safari, download `index.html` and open it locally, or serve it over plain `http://`.

## Notes on the API

Two things worth knowing if you build against the same API:

- `POST /api/v1/queue` with `insertPosition: INSERT_AT_END` returns `204` but does not change an autoplay/radio queue. `INSERT_AFTER_CURRENT_VIDEO` works, so every add here uses it.
- `GET /api/v1/queue` returns a large payload (~900 KB for 50 tracks), so the queue is fetched on demand rather than on the polling loop.

State comes from polling `/api/v1/song` once a second, with the plugin's WebSocket layered on top for instant response to play/pause, volume, shuffle and repeat changes.

## Licence

MIT
