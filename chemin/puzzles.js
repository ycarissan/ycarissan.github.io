// Puzzle format:
// playerPiece: { type, color, square }  — type: p/n/b/r/q/k, color: l(light/blanc) or d(dark/noir)
// enemies: [{ type, color, square }]
// friendly: [{ type, color, square }]  — optional friendly non-player pieces
// treasure: square string
// minMoves: minimum moves to reach treasure

const PUZZLES = {

  // ──────────────── 1 COUP ────────────────
  '1coup': [
    {
      // Cavalier blanc e4 → f6
      // Ennemis gardent toutes les destinations sauf f6
      // Tour g1 : g3, g5 / Fou e1 : f2, d2, c3 / Pion b6 : c5 / Pion c7 : d6
      id: 'c1p1',
      playerPiece: { type: 'n', color: 'l', square: 'e4' },
      enemies: [
        { type: 'r', color: 'd', square: 'g1' },
        { type: 'b', color: 'd', square: 'e1' },
        { type: 'p', color: 'd', square: 'b6' },
        { type: 'p', color: 'd', square: 'c7' },
      ],
      friendly: [],
      treasure: 'f6',
      minMoves: 1,
    },
    {
      // Cavalier blanc d5 → e7
      // Pion d4 : c3,e3 / Pion a5 : b4 / Pion a7 : b6
      // Pion b8 : c7 / Pion g7 : f6 / Pion g5 : f4
      id: 'c1p2',
      playerPiece: { type: 'n', color: 'l', square: 'd5' },
      enemies: [
        { type: 'p', color: 'd', square: 'd4' },
        { type: 'p', color: 'd', square: 'a5' },
        { type: 'p', color: 'd', square: 'a7' },
        { type: 'p', color: 'd', square: 'b8' },
        { type: 'p', color: 'd', square: 'g7' },
        { type: 'p', color: 'd', square: 'g5' },
      ],
      friendly: [],
      treasure: 'e7',
      minMoves: 1,
    },
    {
      // Cavalier blanc f3 → h4
      // Tour g8 : g1,g5 / Pion g3 : h2 / Pion d2 : e1
      // Pion d6 : e5 / Pion c3 : d2 / Pion c5 : d4
      id: 'c1p3',
      playerPiece: { type: 'n', color: 'l', square: 'f3' },
      enemies: [
        { type: 'r', color: 'd', square: 'g8' },
        { type: 'p', color: 'd', square: 'g3' },
        { type: 'p', color: 'd', square: 'd2' },
        { type: 'p', color: 'd', square: 'd6' },
        { type: 'p', color: 'd', square: 'c3' },
        { type: 'p', color: 'd', square: 'c5' },
      ],
      friendly: [],
      treasure: 'h4',
      minMoves: 1,
    },
  ],

  // ──────────────── 2 COUPS ────────────────
  '2coups': [
    {
      // Cavalier blanc a1 → c2 → b4
      // Pion a4 : b3 (force c2 en premier)
      // Tour a6 : a3 / Pion f4 : e3 / Pion d2 : e1 / Tour d7 : d4
      id: 'c2p1',
      playerPiece: { type: 'n', color: 'l', square: 'a1' },
      enemies: [
        { type: 'p', color: 'd', square: 'a4' },
        { type: 'r', color: 'd', square: 'a6' },
        { type: 'p', color: 'd', square: 'f4' },
        { type: 'p', color: 'd', square: 'd2' },
        { type: 'r', color: 'd', square: 'd7' },
      ],
      friendly: [],
      treasure: 'b4',
      minMoves: 2,
    },
    {
      // Cavalier blanc h1 → f2 → e4
      // Pion h4 : g3 (force f2 en premier)
      // Pion h5 : g4 / Pion g4 : h3 / Pion c4 : d3 / Pion c2 : d1
      id: 'c2p2',
      playerPiece: { type: 'n', color: 'l', square: 'h1' },
      enemies: [
        { type: 'p', color: 'd', square: 'h4' },
        { type: 'p', color: 'd', square: 'h5' },
        { type: 'p', color: 'd', square: 'g4' },
        { type: 'p', color: 'd', square: 'c4' },
        { type: 'p', color: 'd', square: 'c2' },
      ],
      friendly: [],
      treasure: 'e4',
      minMoves: 2,
    },
  ],
};
