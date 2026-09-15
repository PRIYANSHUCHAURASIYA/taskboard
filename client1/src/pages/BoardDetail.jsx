import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CardModal from "../components/CardModal";
import InviteModal from "../components/InviteModal";
import BoardSettingsMenu from "../components/BoardSettingsMenu";
import { getCurrentUserId } from "../utils/auth";
import API from "../api/axios";
import InlineSpinner from "../components/InlineSpinner";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

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
    const [showInvite, setShowInvite] = useState(false);
    const [board, setBoard] = useState(null);

    const currentUserId = getCurrentUserId();
    const isOwner = board && currentUserId && board.owner === currentUserId;

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

    useEffect(() => {
        const fetchBoard = async () => {
            try {
                const res = await API.get(`/api/boards/${boardId}`);
                setBoard(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load board info");
            }
        };
        fetchBoard();
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

    const handleDragEnd = async (result) => {
        const { source, destination, type } = result;

        if (!destination) return;

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

        const sourceListId = source.droppableId;
        const destListId = destination.droppableId;

        const sourceCards = Array.from(cardsByList[sourceListId] || []);
        const [movedCard] = sourceCards.splice(source.index, 1);

        if (sourceListId === destListId) {
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

    if (loading) return <Spinner size="lg" />;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate("/")}
                    className="text-blue-600 hover:underline"
                >
                    ← Back to Boards
                </button>

                <div className="flex items-center gap-4">
                    <h1 className="font-semibold text-lg">{board?.title}</h1>
                    <span className="text-sm text-gray-500">
                        {board?.members?.length || 0} member(s)
                    </span>
                    <button
                        onClick={() => setShowInvite(true)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
                    >
                        + Invite
                    </button>
                    {isOwner && (
                        <BoardSettingsMenu
                            board={board}
                            onRenamed={(updatedBoard) => setBoard(updatedBoard)}
                        />
                    )}
                </div>
            </div>

            <Toast message={error} onClose={() => setError("")} />

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
                                                                            {card.dueDate && (
                                                                                <p className="text-xs text-orange-500 mt-1">
                                                                                    Due{" "}
                                                                                    {new Date(
                                                                                        card.dueDate
                                                                                    ).toLocaleDateString()}
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
                                                    className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                                                >
                                                    {creatingCard[list._id] ? <InlineSpinner /> : "+"}
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
                                        className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {creatingList && <InlineSpinner />}
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
                    members={board?.members || []}
                    onClose={() => setSelectedCard(null)}
                    onUpdated={handleCardUpdated}
                    onDeleted={handleCardDeleted}
                />
            )}

            {showInvite && (
                <InviteModal
                    boardId={boardId}
                    onClose={() => setShowInvite(false)}
                    onInvited={(updatedBoard) => setBoard(updatedBoard)}
                />
            )}
        </div>
    );
}

export default BoardDetail;
