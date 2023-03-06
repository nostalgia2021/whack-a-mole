const View = (() => {
  const domSelector = {
    gameBoard: document.getElementById("gameBoard"),
    startBtn: document.getElementById("startBtn"),
    timer: document.getElementById("timer"),
    score: document.getElementById("score"),
  };

  const createTemplate = function (data) {
    const items = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].type === 0) {
        const circle = document.createElement("div");
        circle.classList.add("circle");
        circle.dataset.id = i;
        items.push(circle);
      } else if (data[i].type === 1) {
        const mole = document.createElement("img");
        mole.src = "./asset/images/mole.jpeg";
        mole.classList.add("mole-img");
        mole.dataset.id = i;
        items.push(mole);
      } else {
        const snake = document.createElement("img");
        snake.src = "./asset/images/mine.jpeg";
        snake.classList.add("snake-img");
        snake.dataset.id = i;
        items.push(snake);
      }
    }
    return items;
  };

  const render = function (element, template) {
    element.innerHTML = "";
    element.append(...template);
  };

  return { createTemplate, render, domSelector };
})();

const Model = ((view) => {
  const { createTemplate, render, domSelector } = view;

  class Entity {
    #type = 0;
    #appearances = 0;
    constructor(type, app) {
      this.#type = type;
      this.#appearances = app;
    }
    set appearance(app) {
      this.#appearances = app;
    }
    get appearance() {
      return this.#appearances;
    }
    set type(type) {
      if (type > 2) return 0;
      this.#type = type;
    }
    get type() {
      return this.#type;
    }
  }

  class GameBoard {
    #items;
    constructor(items) {
      this.#items = items;
    }

    get items() {
      return this.#items;
    }

    set items(items) {
      this.#items = items;
      const temp = createTemplate(this.#items);
      render(domSelector.gameBoard, temp);
    }
    #getPositionOfUnclickedMole(board) {
      const pos = [];
      for (let i = 0; i < board.length; i++) {
        if (board[i].type === 1 || board[i].type === 2) {
          pos.push(i);
          board[i].appearance += 1;
          if (board[i].appearance >= 2) {
            pos.pop(i);
            board[i].type = 0;
            board[i].appearance = 0;
          }
        }
      }
      return pos;
    }
    initBoard(type = 0, app = 0) {
      const board = [];
      for (let i = 0; i < 12; i++) {
        board.push(new Entity(type, app));
      }
      return board;
    }
    clickedSnake() {
      return this.initBoard(2, 0);
    }
    generateNewBoard() {
      let moles = this.#getPositionOfUnclickedMole(this.#items);
      for (let i = moles.length; i < 4; i++) {
        let rand = Math.floor(Math.random() * 12);
        while (moles.includes(rand)) {
          rand = Math.floor(Math.random() * 12);
        }
        moles.push(rand);
      }
      let snake = moles[3];
      moles.pop();
      const newBoard = this.#items;
      for (let i = 0; i < newBoard.length; i++) {
        if (moles.includes(i)) {
          newBoard[i].type = 1;
        }
      }
      newBoard[snake].type = 2;
      return newBoard;
    }
  }

  return { GameBoard, Entity };
})(View);

const Controller = ((model, view) => {
  const { GameBoard } = model;
  const { domSelector } = view;
  //global var to controller.
  const second = 1000;
  let timeLimit = 30;
  let si, timer;

  function clickHandler(e) {
    if (
      !e.target.classList.contains("mole-img") &&
      !e.target.classList.contains("snake-img")
    ) {
      return;
    }
    if (e.target.classList.contains("snake-img")) {
      gb.items = gb.clickedSnake();
      stopGame("none");
    } else {
      const pos = e.target.dataset.id;
      const currentBoard = gb.items;
      currentBoard[pos].type = 0;
      e.target.style.visibility = "hidden";
      domSelector.score.innerText = parseInt(domSelector.score.innerText) + 1;
    }
  }
  function startTimer() {
    domSelector.timer.innerText = "0";
    timer = setInterval(() => {
      timeLimit--;
      domSelector.timer.innerText = timeLimit;
      if (timeLimit <= 0) {
        stopGame("none");
      }
    }, second);
  }
  function stopGame(pointer) {
    clearInterval(si);
    clearInterval(timer);
    domSelector.gameBoard.style.pointerEvents = pointer;
  }
  function startNewGame() {
    gb.items = gb.initBoard();
    stopGame("auto");
    timeLimit = 30;
    domSelector.score.innerText = "0";
    startTimer();
    generateNewMole();
  }
  function generateNewMole() {
    si = setInterval(() => {
      const newboard = gb.generateNewBoard();
      gb.items = newboard;
    }, second);
  }

  const gb = new GameBoard([]);
  gb.items = gb.initBoard(0, 0);
  domSelector.startBtn.addEventListener("click", startNewGame);
  domSelector.gameBoard.addEventListener("click", clickHandler);
})(Model, View);
