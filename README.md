# Sudoku Solver

This project contains both a web UI to play Sudoku, and an educational Sudoku solver. The web UI lets you play a sudoku grid, as well as solve it automatically by pressing a button. It then shows you step-by-step which techniques were used to solve it. It may resolve to brute-force (i.e. trying all possible combinations) at the end of a solve, if no technique allows to finish.

[Demo!](https://lwouis.github.io/sudoku-solver/)

# How to use

This is a [Create React App](https://create-react-app.dev/) project. You need to:

* Download dependencies by running `npm install`
* Run the web app by running `npm start`

# Solver correctness (i.e. datasets, unit tests, etc)

You can play around with the unit tests and datasets bundled with the project by:

* Decompressing the dataset files: `unzip dataset.zip` (~140MB compressed / ~610MB uncompressed)
* Run unit tests with `npm test`

# Developping the UI

I used Storybook.js to develop the UI, so you can play with that by running `npm run storybook`
