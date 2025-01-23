"use client";
import Image from "next/image";
// components/Chessboard.tsx
import { useEffect, useState, useRef } from 'react';
import { Chess, Square, Piece as ChessJSPiece, Move } from 'chess.js';
import Piece from './Piece';
import { StockfishEngine } from '../utils/stockfish';
import { useStockfish } from '../hooks/stockfish';




const TEXT_SNIPPETS = [
  "Replace the word hard for valuable and you will instantly see how motivation appears from thin air.",
  "If you're sad, you deserve it. If you want to be happy. Good. It’s time to work.",
"Why do something and not try? Why do something and not be the best? Winners understand this. Losers do not. ",
"I always feel a deep calm because I do not believe I can fail. ",
"The Matrix will not imprison the unwilling. ",
"You’ve never pushed yourself because you believe the goal can never be achieved. ",
"You have to give up the peace of mind for an extraordinary life. Learn to be at peace with the chaos. ",
"You should TRAIN LIKE AN ANIMAL. Learn more. And talk much less.  ",
"Some people were born to be losers. They will always be losers. What are you? ",
"Doesn’t matter how useless that politician is, he’s smooth in interviews and everybody knows his name.This is the end goal for a man. ",
"Brave men use fear to heighten senses - then proceed ANYWAY. Cowards scream “don’t be afraid!” ",
"Money is like water. Stand in the right place at the right time - you get wet. ",
"Don’t take mindset tips from the happy man. Take them from the depressed miserable man who still performs exceptionally. ",
"Keep the anger - learn some self-control - and focus effectively. Unlimited motivation awaits.",
"Be sad and enjoy being sad. Be happy and enjoy being happy.",
"This life is fucking WAR. Everything must be fought for, obtained, and HELD.",
"Depression isn't a disease. It's a state of mind designed to motivate you.",
"Moody females steal your power. It’s dangerous for a man. A man must remain focused.",
"I have failed. I did not move quickly enough for the sun. I will never have all of the blossoms.",
"Master, forgive me. But tell me - what scarred you for life, above your left eye? - Curiosity, he replied.",
"Master, if I can not execute your most powerful move, will you at least show it to me? - I’ve shown you already. Using only my tongue, I broke your Zen.",
"Anything less than breaking your current record should be alarming.",
"You are only so comfortable living without an edge because you've never exploited one in the first place.",
"Too much dreaming, and not enough doing. Chances are you already know all you need to know.",
"Mindset is the solid foundation for any endeavor you may counter.",

];




type SquareType = ChessJSPiece | null;
type BoardType = SquareType[][];

const Chessboard: React.FC = () => {


  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [snippets] = useState(TEXT_SNIPPETS);




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
        
          setCurrentSnippetIndex(Math.floor(Math.random() * snippets.length));

          


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
          // Delay the AI move by 1 second
          setTimeout(() => {
            game.move(bestMove, { strict: false });
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
              } else if (game.isDraw()) {
                alert('Draw!');
              }
            }
          }, 1000); // 1000 milliseconds = 1 second delay
        }
      }
    });
      // Send the current position to Stockfish
      stockfish.send('ucinewgame');
      stockfish.send(`position fen ${game.fen()}`);
      stockfish.send('go depth 1');
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
        className={`sm:w-16 sm:h-16     md:w-24  md:h-24     h-12 w-12    relative ${
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


    <div className="flex flex-col items-center">
    {/* Existing chessboard rendering */}
    <div>
      {boardState.map((rowArray, rowIdx) => (
        <div key={rowIdx} className="flex">
          {rowArray.map((square, colIdx) =>
            renderSquare(square, rowIdx, colIdx)
          )}
        </div>
      ))}
    </div>

    {/* Add this text snippet display */}
    <div className="mt-8 p-2 bg-gray-800 rounded-lg text-green-400 text-center max-w-2xl">
      <p className="md:text-xl  md:text-xl text-xs font-mono">{snippets[currentSnippetIndex]}</p>
    </div>
  </div>


  );
};

export default Chessboard;