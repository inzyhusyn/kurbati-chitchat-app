<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep post ownership keyed by the authenticated user ID, not username, so owner actions remain correct when profile names change.
- Use the shared post model and invalidate feed, profile, detail, saves, and archive queries after mutations so every post surface stays synchronized.
- Archive posts with a dedicated flag and owner-only read policy; filter them out of normal post lists so archiving preserves data privately.
- Mount profile and post overlays in the app frame and portal action sheets above scroll containers so navigation never changes sheet positioning or clips controls.
