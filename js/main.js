$(document).ready(function(){

	//Xs or Os, based on user choice
	var pieces = {
        EMPTY: 0,
        EX: 1,
        CIRCLE: 2
    };

	//Determine whose turn it is
    var turn = {
        HUMAN: 0,
        COMP: 1
    };

	//Switch for games won/drawn and starting/ongoing
    var state = {
        GAMEON: 0,
        GAMEOVER: 1
    }

	//Score tally
    var score = {
        DRAW: 0,
        HUMAN: 1,
        COMP: 2
    }

    //Allows human player to select which character to play as, sets computer as the other piece
    $('#playasX').click(function(){
		match.setPiece(pieces.EX)
		$('#playasX').css({'background-color': '#ffa84d', 'color': '#fff'});
		$('#playasO').css({'background-color': '', 'color': ''});
		//console.log("Player has selected X");
	});
	$('#playasO').click(function(){
		match.setPiece(pieces.CIRCLE);
		$('#playasO').css({'background-color': '#ffa84d', 'color': '#fff'});
		$('#playasX').css({'background-color': '', 'color': ''});
		//console.log("Player has selected O");
	});

	//Setting up the playing field
    var Grid = function (human, comp) {
        var grid = [];
        var turns = 0;
        var totTurns = [];
        this.human = human;
        this.comp = comp;

        this.totalTurns = function () {
            return turns;
        }

        this.isEmpty = function (x) {
            return grid[x] === pieces.EMPTY;
        };

        this.set = function (x, type) {
            if (type !== pieces.EMPTY)
                turns++;
            grid[x] = type;
        };

        this.get = function (x) {
            return grid[x];
        };

        this.isFull = function () {
            for (var i = 0 ; i < 9; i++)
                if (pieces.EMPTY === grid[i])
                    return false;
            return true;
        };

        this.clear = function () {
            for (var i = 0; i < 9; i++)
                grid[i] = pieces.EMPTY;
            turns = 0;
            totTurns = [];
        };

        //Looks for win conditions
        this.checkWinner = function () {
            var win = false;
            for (var i = 0; i < 9; i += 3)
                if (grid[i] !== pieces.EMPTY &&
                    grid[i] === grid[i + 1] &&
                    grid[i] === grid[i + 2]) {
                    totTurns = [i, i + 1, i + 2];
                    return grid[i];
                }

            for (var i = 0; i < 3; i++)
                if (grid[i] !== pieces.EMPTY &&
                    grid[i] === grid[i + 3] &&
                    grid[i] === grid[i + 6]) {
                    totTurns = [i, i + 3, i + 6];
                    return (grid[i]);
                }
            if (grid[0] !== pieces.EMPTY &&
                grid[0] === grid[4] &&
                grid[0] === grid[8]) {
                totTurns = [0, 4, 8];
                return (grid[0]);
            }
            if (grid[2] !== pieces.EMPTY &&
                grid[2] === grid[4] &&
                grid[2] === grid[6]) {
                totTurns = [2, 4, 6];
                return (grid[2]);
            }
			//If no conditions are met and grid is full, end in a draw
            if (this.isFull())
                return score.DRAW;
            return win;
        };

        this.clear();
    };

    //AI - determines best move for computer, cannot lose
    var COMP = function (grid) {
        this.getMove = function () {
            var move = makeMove(grid, grid.comp, 0);
            grid.set(move.x, grid.comp);
            return { x: move.x };
        }

        var switchPlayer = function (human) {
            return grid.human === human ? grid.comp : grid.human;
        }

        var makeMove = function (grid, human, depth) {
        	//Analyze win conditions for human
            var win = grid.checkWinner();
            if (win !== false) {
                if (win === grid.human)
                    return { score: depth - 10 };
                return { score: 10 - depth };
            }
			//Do nothing if no more moves to make
            if (grid.isFull())
                return { score: 0 };
            var moves = [];

            for (var i = 0 ; i < 9; i++) {
                if (grid.isEmpty(i)) {
                    var move = {
                        x: i,
                        turn: human,
                        score: 0
                    };
                    grid.set(i, human);
                    move.score = makeMove(grid, switchPlayer(human), depth + 1).score;
                    moves.push(move);
                    grid.set(i, pieces.EMPTY);
                }
            }
			//Depending on win conditions for human player, devise a blocking move, or set up a win for the AI.
            var bestMove = 0;
            if (human === grid.comp) {
                var bestScore = -100;

                for (var i = 0; i < moves.length; i++)
                    if (moves[i].score > bestScore) {
                        bestScore = moves[i].score;
                        bestMove = i;
                    }
            } else {
                var bestScore = 100;
                for (var i = 0; i < moves.length; i++)
                    if (moves[i].score < bestScore) {
                        bestScore = moves[i].score;
                        bestMove = i;
                    }
            }
            return moves[bestMove];
        }
    }


    //Starts the match, watches for the winning move, and reinitializes when match is over
    var Match = function (div, tac) {
        var _grid = new Grid(tac, tac === pieces.EX ? pieces.CIRCLE : pieces.EX);
        var _turn = turn.HUMAN;
        var _callback;
        var _init = false;
        var _state = state.GAMEOVER;
        var _comp = new COMP(_grid);

        this.setPiece = function (t) {
            if (_grid.human !== t)
                changePieces();
        }

        this.clear = function () {
             _grid.clear();
             clearDraw();
        }
		
		//Switch turns after each move is made
        var changePieces = function () {
            for (var i = 0 ; i < 9; i++)
                if (_grid.get(i) === _grid.comp)
                    _grid.set(i, _grid.human);
                else if (_grid.get(i) === _grid.human)
                    _grid.set(i, _grid.comp);
            var aux = _grid.comp;
            _grid.comp = _grid.human;
            _grid.human = aux;
            redrawGrid();
        }

        var clearDraw = function () {
            $(div + '> h2').each(function (index, item) {
                $(item).html("");
            });
        }

        var redrawGrid = function () {
            for (var i = 0; i < 9; i++)
                updateDraw(i, _grid.get(i));
        }
		
	//End the game if someone wins or it has ended in a draw
       var checkWinner = function () {
            var win = _grid.checkWinner();
            if (win !== false) {
                _state = state.GAMEOVER;
                if (win !== score.DRAW)
                    win = _grid.comp === win ? score.COMP : score.HUMAN;
                _callback(win);
                return;
            }
        }

		//Finish turn for AI, check win conditions
       var update = function () {
            if (_state === state.GAMEON) {
                if (_turn === turn.COMP) {
                    var move = _comp.getMove();
                    updateDraw(move.x, _grid.comp);
                    _turn = turn.HUMAN;
                    checkWinner();
                    return;
                }
            }
        }

		//Begin the match - human goes first
        this.startMatch = function (callback) {
            if (!_init) {
                _callback = callback;
                $(div).click(function () {
                    if (_turn !== turn.HUMAN || _state === state.GAMEOVER)
                        return;
                    var cell = parseInt($(this).attr('value'));
                    if (_grid.isEmpty(cell)) {
                        _grid.set(cell, _grid.human);
                        updateDraw(cell, _grid.human);
                        checkWinner();
                        _turn = turn.COMP;
                        update();
                    }
                });
                _init = true;
            }
            _turn = turn.HUMAN;
            _state = state.GAMEON;
            update();
        }

		//Place Xs and Os in grid
        var updateDraw = function (x, type) {
            switch (type) {
                case pieces.EMPTY:
                    $($(div + '> h2')[x]).html('');
                    break;
                case pieces.EX:
                    $($(div + '> h2')[x]).html('X');
                    break;
                case pieces.CIRCLE:
                    $($(div + '> h2')[x]).html('O');
                    break;
            }

        }
     }
    var match = new Match('.tic', pieces.EX);
	var compScore = 0;
    var humanScore = 0;
    var draws = 0;

    //Takes score in the footer, restarts match
    var gameOver = function (win, moves) {
        switch (win) {
            case score.COMP:
                compScore++;
                $('#compscore').html(compScore);
                break;
            case score.HUMAN:
                humanScore++;
                $('#humanscore').html(humanScore);
                break;
            case score.DRAW:
                draws++;
                $('#draws').html(draws);
                break;
        }
        setTimeout(function () {
            match.clear();
            setTimeout(function () {
                match.startMatch(gameOver);
            }, 500);
        }, 1500);
    }
    match.startMatch(gameOver);

});
