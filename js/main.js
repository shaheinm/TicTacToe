$(document).ready(function(){

	var pieces = {
        EMPTY: 0,
        EX: 1,
        CIRCLE: 2
    };

    var turn = {
        HUMAN: 0,
        COMP: 1,
        DRAW: 2
    };

    var state = {
        GAMEON: 0,
        GAMEOVER: 1
    }


    $('#playasX').click(function(){
		match.setPiece(pieces.EX)
		$('#playasX').css({'background-color': '#ffa84d', 'color': '#fff'});
		$('#playasO').css({'background-color': '', 'color': ''});
		console.log("Player has selected X");
	});
	$('#playasO').click(function(){
		match.setPiece(pieces.CIRCLE);
		$('#playasO').css({'background-color': '#ffa84d', 'color': '#fff'});
		$('#playasX').css({'background-color': '', 'color': ''});
		console.log("Player has selected O");
	});

    var Grid = function (human, comp) {
        var grid = [];
        var turns = 0;
        var totTurns = [];
        this.human = human;
        this.comp = comp;

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

        this.clear = function () {
            for (var i = 0; i < 9; i++)
                grid[i] = pieces.EMPTY;
            turns = 0;
            totTurns = [];
        };

        this.clear();
    };


    var Match = function (div, tac) {
        var _grid = new Grid(tac, tac === pieces.EX ? pieces.CIRCLE : pieces.EX);
        var _turn = turn.HUMAN;
        var _callback;
        var _init = false;
        var _state = state.GAMEOVER;

        this.setPiece = function (t) {
            if (_grid.human !== t)
                changePieces();
        }

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

        var redrawGrid = function () {
            for (var i = 0; i < 9; i++)
                updateDraw(i, _grid.get(i));
        }

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
                        _turn = turn.COMP;
                    }
                });
                _init = true;
            }
            _state = state.GAMEON;
        }

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

    match.startMatch();

});
