import { useState } from "react";
import Login from "./pages/login";
import Boards from "./pages/boards";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <div>
      {loggedIn ? <Boards /> : <Login setLoggedIn={setLoggedIn} />}
    </div>
  );
}

export default App;
