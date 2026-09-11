import { useEffect , useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../api/axios";

function Boards(){
    const [boards , setBoards] = useState([]);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState("");
    const [newTitle , setNewTitle ] = useState("");
    const [creating ,setCreating ] = useState(false);
    const navigate = useNavigate();

    const fetchBoards = async() =>{
        try{
            const res = await API.get("/api/boards");
            setBoards(res.data);
        }catch(err){
            setError(err.respose?.data?.message || "Failed to load boards");
        } finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoards();
    } , []);

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        setCreating(true);
        try {
            const res = await api.post("/api/boards", { title: newTitle });
            setBoards((prev) => [res.data, ...prev]);
            setNewTitle("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create board");
        } finally {
            setCreating(false);
        }
    };
}
