import React, { useState, useEffect } from "react";
import { GiFlowerStar, GiExplosiveMaterials } from "react-icons/gi";
import m1 from "./audio/1.mp3";
import m2 from "./audio/2.mp3";
import m3 from "./audio/3.mp3";

const gridSize = 10;
const cellSize = 40;

const SpaceInvaders = () => {
  const [spaceshipPosition, setSpaceshipPosition] = useState([4, 9]); // [x, y]
  const [flowers, setFlowers] = useState([]);
  const [bombs, setBombs] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [difficulty, setDifficulty] = useState(1); // Increase difficulty as the game progresses

  const audio10 = new Audio(m1);
  const audio50 = new Audio(m2);
  const audio100 = new Audio(m3);

  const checkCollision = (x1, y1, x2, y2) => x1 === x2 && y1 === y2;

  const generateItems = () => {
    const positions = new Set();
    const getRandomPosition = () => {
      let pos;
      do {
        pos = `${Math.floor(Math.random() * gridSize)}-${Math.floor(Math.random() * (gridSize - 1))}`;
      } while (positions.has(pos));
      positions.add(pos);
      return pos.split("-").map(Number);
    };

    const newFlowers = Array.from({ length: 5 + difficulty }, () => {
      const [x, y] = getRandomPosition();
      return { x, y };
    });

    const newBombs = Array.from({ length: 3 + difficulty }, () => {
      const [x, y] = getRandomPosition();
      return { x, y };
    });

    setFlowers(newFlowers);
    setBombs(newBombs);
  };

  const getScoreColor = (score) => {
    const greenShade = Math.min(255, score * 2.5); // Increase the green value as score increases
    return `rgb(0, ${greenShade}, 0)`; // Return an RGB color with varying green intensity
  };

  useEffect(() => {
    generateItems();

    const handleKeyDown = (e) => {
      if (!gameOver && !win) {
        const movements = {
          ArrowLeft: () => setSpaceshipPosition((pos) => [Math.max(0, pos[0] - 1), pos[1]]),
          ArrowRight: () => setSpaceshipPosition((pos) => [Math.min(gridSize - 1, pos[0] + 1), pos[1]]),
          ArrowUp: () => setSpaceshipPosition((pos) => [pos[0], Math.max(0, pos[1] - 1)]),
          ArrowDown: () => setSpaceshipPosition((pos) => [pos[0], Math.min(gridSize - 1, pos[1] + 1)]),
        };

        if (movements[e.key]) movements[e.key]();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, win]);

  useEffect(() => {
    const interval = setInterval(() => {
      flowers.forEach((flower, index) => {
        if (checkCollision(spaceshipPosition[0], spaceshipPosition[1], flower.x, flower.y)) {
          setFlowers((prevFlowers) => prevFlowers.filter((_, i) => i !== index));
          const newScore = score + 1;
          setScore(newScore);

          if (newScore === 10) {
            audio10.play();
          } else if (newScore === 50) {
            audio50.play();
          } else if (newScore === 100) {
            audio100.play();
          }

          // If all flowers are collected
          if (flowers.length === 1) {
            setDifficulty((prev) => prev + 1);
            generateItems();
          }
        }
      });

      if (bombs.some((bomb) => checkCollision(spaceshipPosition[0], spaceshipPosition[1], bomb.x, bomb.y))) {
        setGameOver(true);
      }

      // Check for win condition
      if (score >= 100) {
        setWin(true);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [spaceshipPosition, flowers, bombs, score, audio10, audio50, audio100]);

  const handlePlayAgain = () => {
    setGameOver(false);
    setWin(false);
    setScore(0);
    setDifficulty(1);
    setSpaceshipPosition([4, 9]);
    generateItems();
  };

  if (gameOver) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 h-screen flex justify-center items-center">
        <div className="text-white text-3xl text-center">
          Game Over! Your score: {score}
          <button onClick={handlePlayAgain} className="mt-4 p-2 bg-green-500 text-white rounded">
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (win) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 h-screen flex justify-center items-center">
        <div className="text-white text-3xl text-center">
          Congratulations! You won! Your score: {score}
          <button onClick={handlePlayAgain} className="mt-4 p-2 bg-green-500 text-white rounded">
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 h-screen flex justify-center items-center">
      <div className="relative w-[420px] h-[420px] bg-gray-800 border-4 border-yellow-500 rounded-lg shadow-lg flex flex-col items-center justify-center">
        {Array.from({ length: gridSize }).map((_, row) => (
          <div key={row} className="flex">
            {Array.from({ length: gridSize }).map((_, col) => {
              const isFlower = flowers.some(flower => flower.x === col && flower.y === row);
              const isBomb = bombs.some(bomb => bomb.x === col && bomb.y === row);
              const isSpaceship = spaceshipPosition[0] === col && spaceshipPosition[1] === row;

              return (
                <div
                  key={col}
                  className={`w-${cellSize} h-${cellSize} flex items-center justify-center`}
                  style={{ position: "relative", width: cellSize, height: cellSize }}
                >
                  {isSpaceship && <div className="text-blue-500 text-3xl">🚀</div>}
                  {!isSpaceship && isFlower && !isBomb && <GiFlowerStar className="text-green-500 text-3xl" />}
                  {!isSpaceship && isBomb && !isFlower && <GiExplosiveMaterials className="text-red-500 text-3xl" />}
                </div>
              );
            })}
          </div>
        ))}
      
      </div>
      <div className="absolute top-0 text-center font-bold text-4xl  text-white p-4" style={{ color: getScoreColor(score) }}>
          Score: {score}
        </div>
    </div>
  );
};

export default SpaceInvaders;
