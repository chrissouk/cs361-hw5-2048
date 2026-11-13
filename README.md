# 2048 with Undo

CS361 Homework 5 project, based on [Gabriele Cirulli's 2048](https://github.com/gabrielecirulli/2048).

I used OpenAI Codex to add a one-move Undo feature. Click **Undo move** or press **U** to restore the board and score from before the last successful move. The best score stays saved. Undo resets when starting a new game or refreshing the page.

## Run

Open `index.html` in a browser, or run a local server:

```sh
python3 -m http.server 8361 --bind 127.0.0.1
```

Then open http://127.0.0.1:8361. Use the arrow keys to play.

## Build and checks

`node build.mjs` checks the JavaScript syntax and copies the app into `build/`.

The browser checks in `verify.mjs` use Playwright and Google Chrome. With those installed and the local server running, run `node verify.mjs`. They cover merging, invalid moves, winning, losing, restarting, and refreshing.

Prompts are recorded in [HOMEWORK_PROMPTS.md](HOMEWORK_PROMPTS.md). Screenshots are in [screenshots](screenshots/).

Original project is MIT licensed. Its license and credits are included.
