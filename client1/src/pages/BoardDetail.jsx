
// useParams => its react hook.
//  and it is used to handle dynamic parameters of the routes


import { useEffect , useState } from "react";
import { useParams , useNavigate, data } from "react-router-dom";
import API from "../api/axios";

function BoardDetail() {
    const { boardId }= useParams();
    const navigate = useNavigate();

    const [ lists , setLists ] = useState([]);
    const [ cardsByList , setCardsByList ] = useState({});
    const [loading ,setLoading ] = useState(true);
    const [ error , setError ] = useState("");

    const [ newListTitle , setNewTitle ] = useState("");
    const [ creatingList , setCreatingList ] = useState(false);

    const [ newCardTitle  , setNewCardTitle ] = useState({}) ;
    const [creatingCard , setCreatingCard] = useState({}) ;

    const fetchListsAndCards = async() => {
        try{
            const listsRes = await API.get(`/api/lists/board/${boardId}`);
            setLists(listsRes.data);
            const cardsMap = {};
            await Promise.all(
                listsRes.data.map(async (list) =>{
                    const cardsRes = await API.get(`/api/cards/list/${list._id}`);
                    cardsMap[list._id] =  cardsRes.data;
                } )
            );
            setCardsByList(cardsMap);
        }catch(err){
            setError(err.response?.data?.message || "Failed to load board");
        }finally{
            setLoading(false);
        }
    };
    useEffect(() =>{
        fetchListsAndCards();

    }, [boardId]);

    const handleCreateList = async(e) =>{
        e.preventDefualt();
        if(!newListTitle.trim())return;
        setCreatingList(true);

        try{
            const res = await API.post("/api/lists" , {
                title:newListTitle,
                boardId,
            });
            setLists((prev) => [...prev , res.data]);
            setCardsByList((prev) => ({ ...prev , [res.data._id] : [] }));
            setNewTitle("");
        }catch(err){
            setError(err.response?.data?.message || "Failed to create list");
        }
        finally{
            setCreatingList(false);
        }

    };
    const handleCreateCard = async(e , listId) =>{
        e.preventDefualt();
        const title = setNewCardTitle[listId]?.trim();
        if(!title)return;

        setCreatingCard((prev) => ({...prev , [listId] : true}));
        try{
            const res = await API.post("/api/cards" , {
                title,
                listId
            });
            setCardsByList((prev) =>({
                ...prev,
                [listId] : [...(prev[listId] || []) , res.data]
            }));
            setNewCardTitle((prev) => ({ ...prev , [listId] : ""}));
        }catch(err){
            setError(err.response?.data?.message || "Failed to  create card")
        }finally {
            setCreatingCard((prev) =>({...prev , [listId] : false}));
        }
    };

    if(loading) return <p className="p-6">Loading board...</p>;
}
