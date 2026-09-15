import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Boards from "./pages/Boards";
import BoardDetail from "./pages/BoardDetail";
//@ts-ignore
import ProtectedRoute from "./components/ProtectedRoute.jsx"
function App() {
    const isAuthenticated = !!localStorage.getItem("token");
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Boards />
                        </ProtectedRoute>
                    }
                />
                <Route path = "/boards/:boardId" element={
                        <ProtectedRoute>
                            <BoardDetail />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
