
// useParams => its react hook.
//  and it is used to handle dynamic parameters of the routes


import { useEffect , useState } from "react";
import { useParams , useNavigate } from "react-router-dom";
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
}
