import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import "./index.css";

const App = () => {
  return (
    <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
