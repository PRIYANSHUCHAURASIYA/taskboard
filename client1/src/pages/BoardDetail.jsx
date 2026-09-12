
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
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate("/")}
                    className="text-blue-600 hover:underline"
                >
                    ← Back to Boards
                </button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="flex gap-4 overflow-x-auto pb-4">
                {lists.map((list) => (
                    <div
                        key={list._id}
                        className="bg-white rounded-lg shadow p-4 w-72 flex-shrink-0"
                    >
                        <h2 className="font-semibold mb-3">{list.title}</h2>

                        <div className="space-y-2 mb-3">
                            {(cardsByList[list._id] || []).map((card) => (
                                <div
                                    key={card._id}
                                    className="bg-gray-50 border rounded p-2 text-sm"
                                >
                                    <p className="font-medium">{card.title}</p>
                                    {card.description && (
                                        <p className="text-xs text-gray-500">
                                            {card.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                            {(cardsByList[list._id] || []).length === 0 && (
                                <p className="text-xs text-gray-400">No cards yet</p>
                            )}
                        </div>

                        <form
                            onSubmit={(e) => handleCreateCard(e, list._id)}
                            className="flex gap-1"
                        >
                            <input
                                type="text"
                                placeholder="New card"
                                value={newCardTitle[list._id] || ""}
                                onChange={(e) =>
                                    setNewCardTitle((prev) => ({
                                        ...prev,
                                        [list._id]: e.target.value,
                                    }))
                                }
                                className="flex-1 border rounded px-2 py-1 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={creatingCard[list._id]}
                                className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                                +
                            </button>
                        </form>
                    </div>
                ))}

                <div className="bg-white rounded-lg shadow p-4 w-72 flex-shrink-0">
                    <h2 className="font-semibold mb-3 text-gray-500">Add List</h2>
                    <form onSubmit={handleCreateList} className="flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="List title"
                            value={newListTitle}
                            onChange={(e) => setNewListTitle(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={creatingList}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                            {creatingList ? "Adding..." : "Add List"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default BoardDetail;
