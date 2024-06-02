const gameBoard = (function gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(cell());
    }
  }

  //Method to render board
  const getBoard = () => board;

  //Method to take in player's choice and drops the player's token in
  const dropToken = (row, column, player) => {
    const availableCell = board[row][column].getValue() === "-";
    if (!availableCell) return;
    board[row][column].addToken(player);
  };

  return { getBoard, dropToken };
})();

function cell() {
  let value = "-";

  const addToken = (playerToken) => {
    value = playerToken;
  };

  const getValue = () => value;

  const clearValue = () => {
    value = "-";
  };
  return {
    addToken,
    getValue,
    clearValue,
  };
}

const gameController = (function manageGame(
  playerOneName = "Player One",
  playerTwoName = "Player Two"
) {
  const board = gameBoard;

  const players = [
    {
      name: playerOneName,
      token: "x",
    },
    {
      name: playerTwoName,
      token: "o",
    },
  ];
  let activePlayer = players[0];

  const getActivePlayer = () => activePlayer;

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  let gameWon = false;

  const getGameStatus = () => gameWon;

  let isTie = false;

  const getTieStatus = () => isTie;

  let wins = [];

  const playerOneScore = () => {
    const winCount = wins.filter((item) => item === players[0].token).length;
    return winCount;
  };
  const playerTwoScore = () => {
    const winCount = wins.filter((item) => item === players[1].token).length;
    return winCount;
  };

  const newGame = () => {
    switchPlayerTurn();
    gameWon = false;
    isTie = false;

    board.getBoard().forEach((row) => {
      row.forEach((column) => {
        column.clearValue();
      });
    });
  };

  const resetGame = () => {
    newGame();
    wins = [];
  };

  const checkWinner = () => {
    const [
      [cell0, cell1, cell2],
      [cell3, cell4, cell5],
      [cell6, cell7, cell8],
    ] = board.getBoard();

    const winCombinations = [
      [cell0, cell1, cell2],
      [cell3, cell4, cell5],
      [cell6, cell7, cell8],
      [cell0, cell3, cell6],
      [cell1, cell4, cell7],
      [cell2, cell5, cell8],
      [cell0, cell4, cell8],
      [cell2, cell4, cell6],
    ];
    for (let i = 0; i < winCombinations.length; i++) {
      const winCombination = winCombinations[i];
      const cellA = winCombination[0].getValue();
      const cellB = winCombination[1].getValue();
      const cellC = winCombination[2].getValue();

      if (cellA !== "-" && cellB !== "-" && cellC !== "-") {
        if (cellA === cellB && cellB === cellC) {
          gameWon = true;
          wins.push(getActivePlayer().token);
          break;
        }
      }
    }
  };

  const checkDraw = () => {
    let availableCells = 0;

    for (let i = 0; i < board.getBoard().length; i++) {
      for (let j = 0; j < board.getBoard()[i].length; j++) {
        board.getBoard()[i][j].getValue() === "-"
          ? availableCells++
          : (availableCells = availableCells);
      }
    }
    if (availableCells === 0 && gameWon === false) {
      isTie = true;
    }
  };
  const playRound = (row, column) => {
    board.dropToken(row, column, getActivePlayer().token);
    checkWinner();
    checkDraw();

    if (gameWon) {
      return;
    } else if (isTie) {
      return;
    } else {
      switchPlayerTurn();
    }
  };

  return {
    getBoard: board.getBoard,
    getActivePlayer,
    getGameStatus,
    playerOneScore,
    playerTwoScore,
    getTieStatus,
    playRound,
    resetGame,
    newGame,
  };
})();

const screenController = (function screenController() {
  const game = gameController;
  const boardDiv = document.querySelector(".board");
  const modal = document.querySelector("#modal");
  const overlay = document.querySelector("#overlay");
  const closeBtn = document.querySelector(".modal-close");
  const resetBtns = document.querySelectorAll(".reset");
  const newGameBtns = document.querySelectorAll(".new-game");

  const openModal = () => {
    modal.classList.add("active");
    overlay.classList.add("active");
  };

  const closeModal = () => {
    modal.classList.remove("active");
    overlay.classList.remove("active");
  };

  const resetGame = () => {
    game.resetGame();
    closeModal();
    updateScreen();
  };

  const newGame = () => {
    game.newGame();
    closeModal();
    updateScreen();
  };

  const updateScreen = () => {
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();
    const playerTurnDivs = document.querySelectorAll(".turn");
    const gameStatus = game.getGameStatus();
    const isTie = game.getTieStatus();
    const playerOneScore = game.playerOneScore;
    const playerTwoScore = game.playerTwoScore;
    const score1 = document.querySelector(".score1");
    const score2 = document.querySelector(".score2");

    boardDiv.textContent = "";

    if (gameStatus) {
      playerTurnDivs.forEach((div) => {
        div.textContent = `${activePlayer.name} won!!!`;
      });
      openModal();
    } else if (isTie) {
      playerTurnDivs.forEach((div) => {
        div.textContent = "It's a tie :(";
      });
      openModal();
    } else {
      playerTurnDivs.forEach((div) => {
        div.textContent = `${activePlayer.name} turn...`;
      });
    }

    board.forEach((row, rowIndex) => {
      row.forEach((column, columnIndex) => {
        const squareBtn = document.createElement("button");
        squareBtn.classList.add("square");
        squareBtn.dataset.column = columnIndex;
        squareBtn.dataset.row = rowIndex;
        squareBtn.textContent = column.getValue();
        boardDiv.appendChild(squareBtn);
      });
    });
  };

  function boardClickHandler(e) {
    if (e.target.textContent !== "-") {
      return;
    } else {
      const selectedColumn = e.target.dataset.column;
      const selectedRow = e.target.dataset.row;
      const gameWon = game.getGameStatus();

      if (!selectedColumn) return;
      if (!selectedRow) return;
      if (gameWon) return;
      game.playRound(selectedRow, selectedColumn);
      updateScreen();
    }
  }

  //Event Listeners
  boardDiv.addEventListener("click", boardClickHandler);
  closeBtn.addEventListener("click", closeModal);
  resetBtns.forEach((btn) => {
    btn.addEventListener("click", resetGame);
  });
  newGameBtns.forEach((btn) => {
    btn.addEventListener("click", newGame);
  });

  //Initial render
  updateScreen();
})();

screenController;
