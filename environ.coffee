colors = require 'colors'
keypress = require 'keypress'
fs = require 'fs'

red = (str) -> str.red
green = (str) -> str.green
blue = (str) -> str.blue

cellColors = [red, blue, green]

infiles = []

for arg, i in process.argv
  if arg is '-o'
    genefile = process.argv[i + 1]
  else if arg is '-i'
    infiles.push process.argv[i + 1]

dir = [
  [-1, -1]
  [0, -1]
  [1, -1]
  [1, 0]
  [1, 1]
  [0, 1]
  [-1, 1]
  [-1, 0]
]
req = {
  0: 0
  1: 10
  8: 0
  9: 10
  128: 0
  129: 14
  136: 0
  137: 12
  386: 4
}

class Cell
  constructor: (@map, @color = red) ->
    unless @map?
      @map = new Uint8Array 2 ** 9
      for el, i in @map
        @map[i] = Math.floor Math.random() * 25

      #for key, val of req
      #  @map[key] = val

    @prime = @age = 0

  getMove: (v) ->
    n = 0
    for el in v
      n = (n << 1) + el
    n = (n << 1) + if @prime >= 4 then 1 else 0
    return @map[n]

  mutate: ->
    newMap = new Uint8Array @map.length
    for el, i in @map
      if Math.random() < 0.01
        newMap[i] = Math.round Math.random() * 25
      else
        newMap[i] = el
    return new Cell newMap, @color

class Board
  constructor: (@w, @h) ->
    @cells = ((null for [0...@h]) for [0...@w])

  tick: ->
    moves = ((null for [0...@h]) for [0...@w])
    for col, x in @cells
      for cell, y in col when cell
        v = [
          @cells[(x - 1) %% @w][(y - 1) %% @h]?
          @cells[x %% @w][(y - 1) %% @h]?
          @cells[(x + 1) %% @w][(y - 1) %% @h]?
          @cells[(x + 1) %% @w][y %% @h]?
          @cells[(x + 1) %% @w][(y + 1) %% @h]?
          @cells[x %% @w][(y + 1) %% @h]?
          @cells[(x - 1) %% @w][(y + 1) %% @h]?
          @cells[(x - 1) %% @w][y %% @h]?
        ]
        moves[x][y] = cell.getMove v

    newCells = ((null for [0...@h]) for [0...@w])

    for col, x in moves
      for move, y in col when move is 0
        cell = newCells[x][y] = @cells[x][y]
        if cell.prime < 4
          cell.prime += 1

    # MOVE
    for col, x in moves
      for move, y in col when 1 <= move <= 8
        dest = {x: (x + dir[move - 1][0]) %% @w, y: (y + dir[move - 1][1]) %% @h}
        if not newCells[dest.x][dest.y]?
          newCells[dest.x][dest.y] = @cells[x][y]

    # SPLIT
    for col, x in moves
      for move, y in col when 9 <= move <= 16
        dest = {x: (x + dir[move - 9][0]) %% @w, y: (y + dir[move - 9][1]) %% @h}
        newCells[x][y] = @cells[x][y]
        if @cells[x][y].prime >= 4 and not newCells[dest.x][dest.y]?
          @cells[x][y].prime = 0
          newCells[dest.x][dest.y] = @cells[x][y].mutate()

    # ATTACK
    for col, x in moves
      for move, y in col when 17 <= move <= 24
        dest = {x: (x + dir[move - 17][0]) %% @w, y: (y + dir[move - 17][1]) %% @h}
        newCells[dest.x]?[dest.y] = null

    for col, x in newCells
      for cell, y in col when cell?
        if cell.age > 12
          newCells[x][y] = null
        else
          cell.age += 1

    @cells = newCells

  render: ->
    strs = ('' for [0...@h])
    for col, x in @cells
      for cell, y in col
        if cell?
          unless cell.prime? then throw new Error 'Cell has no prime data?'
          strs[y] += cell.color cell.prime.toString()
        else
          strs[y] += '_'
    return strs.join '\n'

  reseed: ->
    cells = []
    for col, x in @cells
      for cell, y in col when cell?
        cells.push cell

    newCells = ((null for [0...@h]) for [0...@w])

    for col, x in newCells
      for cell, y in col when Math.random() < 0.1
        map = new Uint8Array 2 ** 9
        for el, i in map
          map[i] = cells[Math.floor Math.random() * cells.length].map[i]
        newCells[x][y] = new Cell map

    @cells = newCells

    # And generate one big representative map
    map = new Uint8Array 2 ** 9
    for el, i in map
      map[i] = cells[Math.floor Math.random() * cells.length].map[i]

    return map

serialize = (array) ->
  buffer = new Buffer 2 ** 9
  for el, i in array
    buffer[i] = array[i]
  return buffer

parse = (buffer) ->
  array = new Uint8Array 2 ** 9
  for el, i in array
    array[i] = buffer[i]
  return array

baseMaps = (parse(fs.readFileSync(infile)) for infile in infiles)

board = new Board 85, 35

if baseMaps.length > 0
  locations = (Math.floor(i * 85 / baseMaps.length) for _, i in baseMaps)
else
  locations = (i for i in [0...85] by 2)

for col, x in board.cells
  for cell, y in col when y is 0 and x in locations
    if baseMaps.length > 0
      i = locations.indexOf x
      board.cells[x][y] = new Cell baseMaps[i], cellColors[i]
    else
      board.cells[x][y] = new Cell()

turns = 0

keypress process.stdin
process.stdin.on 'keypress', (ch, key) ->
  fs.writeFileSync(genefile, serialize(board.reseed())); i = 0

str = ''
setInterval (->
  board.tick(); turns += 1
  str = board.render()
  redCount = blueCount = 0
  for col, x in board.cells
    for cell, y in col when cell?
      if cell.color is red then redCount++
      else blueCount++
  console.log '\u001B[2J'
  console.log 'TURN '  + turns + '\tRED ' + redCount.toString().red + '\tBLUE ' + blueCount.toString().blue + '\n' + str + '\r'
), 50
