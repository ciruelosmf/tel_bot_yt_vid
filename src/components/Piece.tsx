// components/Piece.tsx

import React, { useState } from 'react';
import { Piece as ChessJSPiece } from 'chess.js';

type PieceProps = {
  piece: ChessJSPiece;
};

const Piece: React.FC<PieceProps> = ({ piece }) => {

  const [variant] = useState(() => Math.random() < 0.5 ? 1 : 2);
  const [variant2] = useState(() => Math.floor(Math.random() * 8) + 1);


  // Mapping for white pieces to custom images
  const whitePieceImages: { [key: string]: string } = {
    p: `/pieces/pawn_${variant2}.png`,
    n: '/pieces/knight_1.png',
    b: '/pieces/bishop_1.png',
    r: '/pieces/rook_1.png',
    q: `/pieces/queen_${piece.type === 'q' ? variant : 1}.png`,
    k: `/pieces/king_${piece.type === 'k' ? variant : 1}.png`,
  };

  // Mapping for black pieces to Unicode characters (you can customize this too)
  const blackPieceUnicode: { [key: string]: string } = {
    p: '♟',
    n: '♞',
    b: '♝',
    r: '♜',
    q: '♛',
    k: '♚',
  };

  const pieceType = piece.type;
  const pieceColor = piece.color;

  if (pieceColor === 'w') {
    // Use custom images for white pieces
    const imageSrc = whitePieceImages[pieceType];
    return (
      <div className="flex justify-center items-center w-full h-full select-none">
        <img
          src={imageSrc}
          alt={`White ${pieceType}`}
          className="w-full h-full object-contain"
        />
      </div>
    );
  } else {
    // Use Unicode characters for black pieces (or custom images if preferred)
    const code = blackPieceUnicode[pieceType];
    return (
      <div className="flex justify-center items-center w-full h-full select-none">
        <span className="text-3xl leading-none">{code}</span>
      </div>
    );
  }
};

export default Piece;