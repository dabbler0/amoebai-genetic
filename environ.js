// Generated by CoffeeScript 1.7.1
(function() {
  var Board, Cell, board, dir;

  dir = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];

  Cell = (function() {
    function Cell(map) {
      var el, i, _i, _len, _ref;
      this.map = map;
      if (this.map == null) {
        this.map = new Uint8Array(Math.pow(2, 9));
        _ref = this.map;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          el = _ref[i];
          this.map[i] = Math.round(Math.random() * 25);
        }
      }
      this.prime = 0;
    }

    Cell.prototype.getMove = function(v) {
      var el, n, _i, _len;
      n = 0;
      for (_i = 0, _len = v.length; _i < _len; _i++) {
        el = v[_i];
        n = (n << 1) + el;
      }
      n = (n << 1) + (this.prime >= 4);
      return this.map[n];
    };

    Cell.prototype.mutate = function() {
      var el, i, newMap, _i, _len, _ref;
      newMap = new Uint8Array(this.map.length);
      _ref = this.map;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        el = _ref[i];
        if (Math.random() < 0.05) {
          newMap[i] = Math.round(Math.random() * 25);
        } else {
          newMap[i] = el;
        }
      }
      return new Cell(newMap);
    };

    return Cell;

  })();

  Board = (function() {
    function Board(w, h) {
      this.w = w;
      this.h = h;
      this.cells = (function() {
        var _i, _ref, _results;
        _results = [];
        for (_i = 0, _ref = this.w; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--) {
          _results.push((function() {
            var _j, _ref1, _results1;
            _results1 = [];
            for (_j = 0, _ref1 = this.h; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; 0 <= _ref1 ? _j++ : _j--) {
              _results1.push(null);
            }
            return _results1;
          }).call(this));
        }
        return _results;
      }).call(this);
    }

    Board.prototype.tick = function() {
      var cell, col, dest, move, moves, newCells, v, x, y, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      moves = (function() {
        var _i, _ref, _results;
        _results = [];
        for (_i = 0, _ref = this.w; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--) {
          _results.push((function() {
            var _j, _ref1, _results1;
            _results1 = [];
            for (_j = 0, _ref1 = this.h; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; 0 <= _ref1 ? _j++ : _j--) {
              _results1.push(null);
            }
            return _results1;
          }).call(this));
        }
        return _results;
      }).call(this);
      _ref = this.cells;
      for (x = _i = 0, _len = _ref.length; _i < _len; x = ++_i) {
        col = _ref[x];
        for (y = _j = 0, _len1 = col.length; _j < _len1; y = ++_j) {
          cell = col[y];
          if (!(cell)) {
            continue;
          }
          v = [this.cells[x - 1][y - 1], this.cells[x][y - 1], this.cells[x + 1][y - 1], this.cells[x + 1][y], this.cells[x + 1][y + 1], this.cells[x][y + 1], this.cells[x - 1][y + 1], this.cells[x - 1][y]];
          moves[x][y] = cell.getMove(v);
        }
      }
      newCells = (function() {
        var _k, _ref1, _results;
        _results = [];
        for (_k = 0, _ref1 = this.w; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; 0 <= _ref1 ? _k++ : _k--) {
          _results.push((function() {
            var _l, _ref2, _results1;
            _results1 = [];
            for (_l = 0, _ref2 = this.h; 0 <= _ref2 ? _l < _ref2 : _l > _ref2; 0 <= _ref2 ? _l++ : _l--) {
              _results1.push(null);
            }
            return _results1;
          }).call(this));
        }
        return _results;
      }).call(this);
      for (x = _k = 0, _len2 = moves.length; _k < _len2; x = ++_k) {
        col = moves[x];
        for (y = _l = 0, _len3 = col.length; _l < _len3; y = ++_l) {
          move = col[y];
          if (move === 0) {
            (newCells[x][y] = this.cells[x][y]).prime += 1;
          }
        }
      }
      for (x = _m = 0, _len4 = moves.length; _m < _len4; x = ++_m) {
        col = moves[x];
        for (y = _n = 0, _len5 = col.length; _n < _len5; y = ++_n) {
          move = col[y];
          if (!((1 <= move && move <= 8))) {
            continue;
          }
          dest = {
            x: x + dir[move - 1].x,
            y: dir[move - 1].y
          };
          if ((0 <= (_ref1 = dest.x) && _ref1 < this.h) && (0 <= (_ref2 = dest.y) && _ref2 < this.h) && (newCells[dest.x][dest.y] == null)) {
            newCells[dest.x][dest.y] = this.cells[x][y];
          }
        }
      }
      for (x = _o = 0, _len6 = moves.length; _o < _len6; x = ++_o) {
        col = moves[x];
        for (y = _p = 0, _len7 = col.length; _p < _len7; y = ++_p) {
          move = col[y];
          if (!((9 <= move && move <= 16))) {
            continue;
          }
          dest = {
            x: x + dir[move - 9].x,
            y: dir[move - 9].y
          };
          newCells[dest.x][dest.y] = this.cells[x][y];
          if ((0 <= (_ref3 = dest.x) && _ref3 < this.h) && (0 <= (_ref4 = dest.y) && _ref4 < this.h) && this.cells[x][y].prime >= 4 && (newCells[dest.x][dest.y] == null)) {
            newCells[dest.x][dest.y] = this.cells[x][y];
          }
        }
      }
      for (x = _q = 0, _len8 = moves.length; _q < _len8; x = ++_q) {
        col = moves[x];
        for (y = _r = 0, _len9 = col.length; _r < _len9; y = ++_r) {
          move = col[y];
          if (!((17 <= move && move <= 24))) {
            continue;
          }
          dest = {
            x: x + dir[move - 17].x,
            y: dir[move - 17].y
          };
          if ((_ref5 = newCells[dest.x]) != null) {
            _ref5[dest.y] = null;
          }
        }
      }
      return this.cells = newCells;
    };

    Board.prototype.render = function() {
      var cell, col, strs, x, y, _i, _j, _len, _len1, _ref;
      strs = (function() {
        var _i, _ref, _results;
        _results = [];
        for (_i = 0, _ref = this.h; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--) {
          _results.push('');
        }
        return _results;
      }).call(this);
      _ref = this.cells;
      for (x = _i = 0, _len = _ref.length; _i < _len; x = ++_i) {
        col = _ref[x];
        for (y = _j = 0, _len1 = col.length; _j < _len1; y = ++_j) {
          cell = col[y];
          if (cell != null) {
            strs[y] += cell.prime;
          } else {
            strs[y] += ' ';
          }
        }
      }
      return strs.join('\n');
    };

    return Board;

  })();

  board = new Board(25, 25);

  board.cells[12][12] = new Cell();

  board.cells[12][13] = new Cell();

  board.cells[12][14] = new Cell();

  setInterval((function() {
    board.tick();
    return console.lo(board.render());
  }), 200);

}).call(this);
