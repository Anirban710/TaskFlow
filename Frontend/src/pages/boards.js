import { useEffect, useState } from "react";
import API from "../api/api";
import Board from "./board";

function Boards() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);

  useEffect(() => {
    API.get("/projects")
      .then((res) => setBoards(res.data))
      .catch(() => alert("Failed to load boards"));
  }, []);

  if (selectedBoard) {
    return (
      <Board
        project={selectedBoard}
        goBack={() => setSelectedBoard(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h2 className="text-3xl font-bold mb-6">My Boards</h2>

      <div className="grid grid-cols-3 gap-6">
        {boards.map((board) => (
          <div
            key={board._id}
            onClick={() => setSelectedBoard(board)}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl cursor-pointer transition"
          >
            <h3 className="text-xl font-semibold">{board.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Boards;
