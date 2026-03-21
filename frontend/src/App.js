import Login from "./pages/Login";
import Register from "./pages/Register";
import { useState } from "react";

function App() {
  const [page, setPage] = useState("register");

  return (
    <div>
      {page === "login" ? (
        <Login setPage={setPage} />
      ) : (
        <Register setPage={setPage} />
      )}
    </div>
  );
}

export default App;