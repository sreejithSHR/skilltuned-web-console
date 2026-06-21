# Roadmap / TODO — deferred features

Things we've discussed and intentionally left for later. Nothing here is a bug;
the app builds and runs without them.

## Playlists (sequential scenes)
Teacher groups scenes into an ordered playlist that plays one after another.
- Prisma: `Playlist` model (ordered list of sceneKeys) + relation to Org.
- API: create / list / delete playlists.
- Server: on `play_playlist` → load scene 1; on **`scene_done`** event from a headset → advance to next; stop at the end.
- Scenes page: build/order a playlist + a Play button.
- Unreal: each level emits a **`scene_done`** event when finished (timer or a "finish" trigger).
- Decision already made: advance via **VR signals scene complete** (`scene_done`).

## Super Admin "View as / drill into institution"
Right now the Super Admin monitors all institutions on the Institutions page, but the
deep pages (Dashboard, Sessions, Scenes, Audit) are still scoped to their own org.
- Add an "Open / View as" on each institution card that switches the Super Admin into
  that org's context (impersonation) so they can see its sessions, scenes, and audit.
- Needs an org-context override in the token/session and org checks that honor it.

## Scene thumbnail upload (instead of URL)
Currently thumbnails are a pasted URL (deploy-safe on serverless).
- Add an uploader (Cloudinary or UploadThing free tier) so admins upload images
  from their machine and we store the returned URL.

## Live audit (no polling)
Audit page + dashboard activity currently poll every 10s.
- Subscribe to the `audit_log` socket event (server already emits it) for instant updates.

## Bento dashboard polish
Push the dashboard further toward the reference: hero/profile tile, a "now playing"
tile (active scene across headsets), and small charts.

## Scaling / ops
- Move the in-memory live-session registry (`activeVRUsers`) to Redis if we ever run
  more than one server instance (Render scale-out).
- Real headset telemetry (battery/status) reported from the Unreal app on a heartbeat.

## Roles / management
- Viewer role surfaces (read-only).
- Per-institution admin management UI (add/remove admins for an institution).
