import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CardModal from "../components/CardModal";
import API from "../api/axios";

function BoardDetail() {
    const { boardId } = useParams();
    const navigate = useNavigate();

    const [lists, setLists] = useState([]);
    const [cardsByList, setCardsByList] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [newListTitle, setNewListTitle] = useState("");
    const [creatingList, setCreatingList] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState({});
    const [creatingCard, setCreatingCard] = useState({});
    const [selectedCard, setSelectedCard] = useState(null);

    const fetchListsAndCards = async () => {
        try {
            const listsRes = await API.get(`/api/lists/board/${boardId}`);
            setLists(listsRes.data);

            const cardsMap = {};
            await Promise.all(
                listsRes.data.map(async (list) => {
                    const cardsRes = await API.get(`/api/cards/list/${list._id}`);
                    cardsMap[list._id] = cardsRes.data;
                })
            );
            setCardsByList(cardsMap);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load board");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListsAndCards();
    }, [boardId]);

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;

        setCreatingList(true);
        try {
            const res = await API.post("/api/lists", {
                title: newListTitle,
                boardId,
            });
            setLists((prev) => [...prev, res.data]);
            setCardsByList((prev) => ({ ...prev, [res.data._id]: [] }));
            setNewListTitle("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create list");
        } finally {
            setCreatingList(false);
        }
    };

    const handleCreateCard = async (e, listId) => {
        e.preventDefault();
        const title = newCardTitle[listId]?.trim();
        if (!title) return;

        setCreatingCard((prev) => ({ ...prev, [listId]: true }));
        try {
            const res = await API.post("/api/cards", { title, listId });
            setCardsByList((prev) => ({
                ...prev,
                [listId]: [...(prev[listId] || []), res.data],
            }));
            setNewCardTitle((prev) => ({ ...prev, [listId]: "" }));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create card");
        } finally {
            setCreatingCard((prev) => ({ ...prev, [listId]: false }));
        }
    };

    // --- DRAG AND DROP LOGIC ---
    const handleDragEnd = async (result) => {
        const { source, destination, type } = result;

        // dropped outside any droppable
        if (!destination) return;

        // dropped in same place
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        if (type === "LIST") {
            const reordered = Array.from(lists);
            const [moved] = reordered.splice(source.index, 1);
            reordered.splice(destination.index, 0, moved);
            setLists(reordered);

            // Persist new order for every list whose position changed
            try {
                await Promise.all(
                    reordered.map((list, index) =>
                        API.put(`/api/lists/${list._id}/reorder`, { order: index })
                    )
                );
            } catch (err) {
                setError("Failed to save list order");
            }
            return;
        }

        // CARD drag (default type)
        const sourceListId = source.droppableId;
        const destListId = destination.droppableId;

        const sourceCards = Array.from(cardsByList[sourceListId] || []);
        const [movedCard] = sourceCards.splice(source.index, 1);

        if (sourceListId === destListId) {
            // reorder within same list
            sourceCards.splice(destination.index, 0, movedCard);
            setCardsByList((prev) => ({ ...prev, [sourceListId]: sourceCards }));

            try {
                await Promise.all(
                    sourceCards.map((card, index) =>
                        API.put(`/api/cards/${card._id}/move`, {
                            listId: sourceListId,
                            order: index,
                        })
                    )
                );
            } catch (err) {
                setError("Failed to save card order");
            }
        } else {
            // moving to a different list
            const destCards = Array.from(cardsByList[destListId] || []);
            destCards.splice(destination.index, 0, movedCard);

            setCardsByList((prev) => ({
                ...prev,
                [sourceListId]: sourceCards,
                [destListId]: destCards,
            }));

            try {
                await Promise.all([
                    ...sourceCards.map((card, index) =>
                        API.put(`/api/cards/${card._id}/move`, {
                            listId: sourceListId,
                            order: index,
                        })
                    ),
                    ...destCards.map((card, index) =>
                        API.put(`/api/cards/${card._id}/move`, {
                            listId: destListId,
                            order: index,
                        })
                    ),
                ]);
            } catch (err) {
                setError("Failed to save card move");
            }
        }
    };

    const handleCardUpdated = (updatedCard) => {
        setCardsByList((prev) => ({
            ...prev,
            [updatedCard.list]: prev[updatedCard.list].map((c) =>
                c._id === updatedCard._id ? updatedCard : c
            ),
        }));
    };

    const handleCardDeleted = (cardId) => {
        setCardsByList((prev) => {
            const updated = { ...prev };
            for (const listId in updated) {
                updated[listId] = updated[listId].filter((c) => c._id !== cardId);
            }
            return updated;
        });
    };

    if (loading) return <p className="p-6">Loading board...</p>;

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

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex gap-4 overflow-x-auto pb-4"
                        >
                            {lists.map((list, listIndex) => (
                                <Draggable
                                    key={list._id}
                                    draggableId={list._id}
                                    index={listIndex}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="bg-white rounded-lg shadow p-4 w-72 flex-shrink-0"
                                        >
                                            <h2
                                                {...provided.dragHandleProps}
                                                className="font-semibold mb-3 cursor-grab"
                                            >
                                                {list.title}
                                            </h2>

                                            <Droppable droppableId={list._id} type="CARD">
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className="space-y-2 mb-3 min-h-[10px]"
                                                    >
                                                        {(cardsByList[list._id] || []).map(
                                                            (card, cardIndex) => (
                                                                <Draggable
                                                                    key={card._id}
                                                                    draggableId={card._id}
                                                                    index={cardIndex}
                                                                >
                                                                    {(provided) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            onClick={() =>
                                                                                setSelectedCard(card)
                                                                            }
                                                                            className="bg-gray-50 border rounded p-2 text-sm cursor-grab"
                                                                        >
                                                                            <p className="font-medium">
                                                                                {card.title}
                                                                            </p>
                                                                            {card.description && (
                                                                                <p className="text-xs text-gray-500">
                                                                                    {card.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            )
                                                        )}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>

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
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}

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
                    )}
                </Droppable>
            </DragDropContext>

            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                    onUpdated={handleCardUpdated}
                    onDeleted={handleCardDeleted}
                />
            )}
        </div>
    );
}

export default BoardDetail;
