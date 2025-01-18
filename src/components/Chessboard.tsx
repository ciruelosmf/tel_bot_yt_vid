"use client";
import Image from "next/image";
// components/Chessboard.tsx
import { useEffect, useState, useRef } from 'react';
import { Chess, Square, Piece as ChessJSPiece, Move } from 'chess.js';
import Piece from './Piece';
import { StockfishEngine } from '../utils/stockfish';
import { useStockfish } from '../hooks/stockfish';



type SquareType = ChessJSPiece | null;
type BoardType = SquareType[][];

const Chessboard: React.FC = () => {
  // Use useRef to store the 'game' object
  const gameRef = useRef<Chess>(new Chess());

  // State to trigger re-renders when the game state changes
  const [, setGameState] = useState(0);

  // Store the board state
  const [boardState, setBoardState] = useState<BoardType>(gameRef.current.board());

  // Selected square
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  // Possible moves from selected square
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);

  // Convert row and column to algebraic notation
  const getSquareNotation = (row: number, col: number): Square => {
    const files = 'abcdefgh';
    return (files[col] + (8 - row)) as Square;
  };






  const engine = useStockfish();
  const stockfishRef = useRef<StockfishEngine | null>(null);

  useEffect(() => {
    if (engine) {
      stockfishRef.current = new StockfishEngine();
    }
  }, [engine])







  const handleSquareClick = (row: number, col: number) => {
    const clickedSquare = getSquareNotation(row, col);
    const game = gameRef.current;

    const piece = game.get(clickedSquare);

    // If a piece is already selected
    if (selectedSquare) {
      if (clickedSquare === selectedSquare) {
        // Clicked on the selected square again - deselect
        setSelectedSquare(null);
        setPossibleMoves([]);
        console.log("Deselected piece on", clickedSquare);
      } else if (piece && piece.color === game.turn()) {
        // Clicked on another of the player's own pieces - change selection
        setSelectedSquare(clickedSquare);
        // Get possible moves for the new selected piece
        const moves = game.moves({ square: clickedSquare, verbose: true }) as Move[];
        const destinations = moves.map((move) => move.to as Square);
        setPossibleMoves(destinations);
        console.log("Selected new piece on", clickedSquare);
      } else {
        // Attempt to make the move
        let move;
        try {
          move = game.move({ from: selectedSquare, to: clickedSquare, promotion: 'q' });
        } catch (error) {
          move = null;
        }

        if (move) {
          // Move was successful
          setBoardState([...game.board()]);
          setSelectedSquare(null);
          setPossibleMoves([]);
          // Force re-render
          setGameState((prev) => prev + 1);
          console.log("Move successful from", selectedSquare, "to", clickedSquare);
        
          // Check for game over conditions
          if (game.isGameOver()) {
            if (game.isCheckmate()) {
              alert('Checkmate!');
            } else if (game.isStalemate()) {
              alert('Stalemate!');
            } 
          } else {
            // Let the AI make a move
            makeAIMove();
          }
        } else {
          // Move was invalid
          setSelectedSquare(null);
          setPossibleMoves([]);
          console.log("Invalid move from", selectedSquare, "to", clickedSquare);
        }


      }
    } else {
      // No piece selected yet
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(clickedSquare);
        // Get possible moves
        const moves = game.moves({ square: clickedSquare, verbose: true }) as Move[];
        const destinations = moves.map((move) => move.to as Square);
        setPossibleMoves(destinations);
        console.log("Selected piece on", clickedSquare);
      } else {
        // Clicked on empty square or opponent's piece but no piece selected - do nothing
        console.log("Clicked on", clickedSquare, "but no piece selected");
      }


      if (!game.isGameOver()) {
        // makeAIMove();
      }

    }
  };





  const makeAIMove = () => {
    const game = gameRef.current;
    const stockfish = stockfishRef.current;

    if (stockfish) {
      // Set up a handler to receive the engine's move
      stockfish.onMessage((message) => {
        if (message.startsWith('bestmove')) {
          const bestMove = message.split(' ')[1];
          if (bestMove) {
            game.move(bestMove, { sloppy: true });
            setBoardState([...game.board()]);
            setSelectedSquare(null);
            setPossibleMoves([]);
            setGameState((prev) => prev + 1);
            
            // Check for game over conditions
            if (game.isGameOver()) {
              if (game.isCheckmate()) {
                alert('Checkmate! You lose.');
              } else if (game.isStalemate()) {
                alert('Stalemate!');
              } 
            }
          }
        }
      });
      // Send the current position to Stockfish
      stockfish.send('ucinewgame');
      stockfish.send(`position fen ${game.fen()}`);
      stockfish.send('go depth 15');
    }
  };




  const renderSquare = (square: SquareType, row: number, col: number) => {
    const isWhiteSquare = (row + col) % 2 === 0;
    const squareNotation = getSquareNotation(row, col);
    const isSelected = selectedSquare === squareNotation;
    const isPossibleMove = possibleMoves.includes(squareNotation);

    return (
      <div
        key={`${row},${col}`}
        className={`w-16 h-16 relative ${
          isWhiteSquare ? 'bg-gray-900' : 'bg-green-600'
        } ${isSelected ? 'border-4 border-yellow-500' : ''}`}
        onClick={() => handleSquareClick(row, col)}
      >
        {square && square.type && (
          <Piece piece={square} />
        )}
        {isPossibleMove && (
          <div className="absolute inset-0 bg-yellow-300 opacity-50"></div>
        )}
      </div>
    );
  };

  return (
    <div>
      {boardState.map((rowArray, rowIdx) => (
        <div key={rowIdx} className="flex">
          {rowArray.map((square, colIdx) =>
            renderSquare(square, rowIdx, colIdx)
          )}
        </div>
      ))}
    </div>
  );
};

export default Chessboard;