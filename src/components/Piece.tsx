// components/Piece.tsx
import React from 'react';
import { Piece as ChessJSPiece } from 'chess.js';

type PieceProps = {
  piece: ChessJSPiece;
};

const Piece: React.FC<PieceProps> = ({ piece }) => {
  const pieceUnicode: { [key: string]: string } = {
    wp: '♙',
    wn: '♘',
    wb: '♗',
    wr: '♖',
    wq: '♕',
    wk: '♔',
    bp: '♟',
    bn: '♞',
    bb: '♝',
    br: '♜',
    bq: '♛',
    bk: '♚',
  };

  const code = pieceUnicode[`${piece.color}${piece.type}`];

  return (
    <div className="text-4xl flex justify-center items-center h-full select-none">
      {code}
    </div>
  );
};

export default Piece;