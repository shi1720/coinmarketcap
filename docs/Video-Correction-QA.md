# Demo narration correction

Corrected public video: https://youtu.be/0XljJqixhMU
Hosted video: https://runway-guard-cmc.web.app/demo.html
DoraHacks project: https://dorahacks.io/buidl/49254
Correction post: https://x.com/ShivamGuptaim/status/2105282566807015714

The script now uses spoken letter names for CSV and USD, separates Coin Market Cap into spoken words, and replaces specialist terms such as fiat and depeg with plain language. The new narrator is the generic Indian English Prabhat voice. This is synthetic narration, not a clone of Shivam Gupta's voice.

- Narration: 137.48 seconds. Final hosted MP4: 137.5 seconds.
- H.264 1920 × 1080 video, AAC audio, embedded English subtitle track and 33 burned caption cues.
- Word timing from the speech generator aligns captions and screen cuts to the revised recording.
- FFmpeg silence detection found no pauses lasting one second or longer at a -45 dB threshold.
- A local Whisper transcription recognized Shivam Gupta, CSV, the amounts and the principal sentences. It transcribed the accented word coin approximately as con. This automated check is not a human listening review.
- YouTube public playback reached 46 seconds with readyState 4 and no media error. Its synthetic-content disclosure is visible.
- Firebase playback uses the revised version query, reports 137.5 seconds, and plays with readyState 4 and no media error. The server sends Cache-Control: no-cache for demo assets.
- The updated English SRT was published through YouTube Studio. Availability of the optional watch-page closed-caption toggle remains unverified. Burned captions are present regardless of that toggle.
- DoraHacks saved the updated YouTube link, and the updated story link was verified after reloading.
- The previous YouTube recording is unlisted and points to the corrected recording in its title and first description lines.
- X does not allow editing this post without Premium. A correction reply links the replacement video and submission from the original thread.

The assistant cannot directly audition audio in this environment. No claim of perfect pronunciation or human listening approval is made.

Release verification: code and corrected media commit 2623b1c873221a25526a9331be9552b395a3fc18 passed GitHub CI https://github.com/shi1720/coinmarketcap/actions/runs/36719900226. Both production deployments succeeded.
