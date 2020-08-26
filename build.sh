#tsc --outfile tmp/snake.js engine/tge.ts engine/event.ts engine/timer.ts games/snake/model.ts games/snake/render.ts games/snake/game.ts games/snake/main.ts
#node tmp/snake.js
tsc --outfile tmp/asciie.js engine/tge.ts engine/event.ts engine/timer.ts engine/ascii.ts tool/asc2editor/model.ts tool/asc2editor/game.ts tool/asc2editor/render.ts tool/asc2editor/main.ts
#node tmp/asciie.js
