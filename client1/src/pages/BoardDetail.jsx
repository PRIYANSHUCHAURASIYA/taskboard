import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CardModal from "../components/CardModal";
import InviteModal from "../components/InviteModal";
import BoardSettingsMenu from "../components/BoardSettingsMenu";
import ConfirmDialog from "../components/ConfirmDialog";
import Composer from "../components/Composer";
import ListHeader from "../components/ListHearder";
import Avatar from "../components/Avatar";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import { getCurrentUserId } from "../utils/auth";
import API from "../api/axios";

const formatDue = (d) =>
    new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

function BoardDetail() {
    const { boardId } = useParams();
    const navigate = useNavigate();

    const [lists, setLists] = useState([]);
    const [cardsByList, setCardsByList] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCard, setSelectedCard] = useState(null);
    const [showInvite, setShowInvite] = useState(false);
    const [board, setBoard] = useState(null);
    const [listToDelete, setListToDelete] = useState(null);
    const [deletingList, setDeletingList] = useState(false);
    const [quickStarting, setQuickStarting] = useState(false);

    const currentUserId = getCurrentUserId();
    const isOwner = board && currentUserId && board.owner === currentUserId;
    const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

    const fetchListsAndCards = async () => {
        try {
            const listsRes = await API.get(`/lists/board/${boardId}`);
            setLists(listsRes.data);

            const cardsMap = {};
            await Promise.all(
                listsRes.data.map(async (list) => {
                    const cardsRes = await API.get(`/cards/list/${list._id}`);
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
                const res = await API.get(`/boards/${boardId}`);
                setBoard(res.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load board info");
            }
        };
        fetchBoard();
    }, [boardId]);

    const handleCreateList = async (title) => {
        try {
            const res = await API.post("/lists", { title, boardId });
            setLists((prev) => [...prev, res.data]);
            setCardsByList((prev) => ({ ...prev, [res.data._id]: [] }));
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create list");
            return false;
        }
    };

    const handleQuickStart = async () => {
        setQuickStarting(true);
        for (const title of ["To do", "Doing", "Done"]) {
            const ok = await handleCreateList(title);
            if (!ok) break;
        }
        setQuickStarting(false);
    };

    const handleRenameList = async (listId, title) => {
        const previous = lists.find((l) => l._id === listId)?.title;
        setLists((prev) => prev.map((l) => (l._id === listId ? { ...l, title } : l)));
        try {
            await API.put(`/lists/${listId}`, { title });
        } catch (err) {
            setLists((prev) => prev.map((l) => (l._id === listId ? { ...l, title: previous } : l)));
            setError(err.response?.data?.message || "Failed to rename list");
        }
    };

    const handleDeleteList = async () => {
        if (!listToDelete) return;
        setDeletingList(true);
        try {
            await API.delete(`/lists/${listToDelete._id}`);
            setLists((prev) => prev.filter((l) => l._id !== listToDelete._id));
            setCardsByList((prev) => {
                const next = { ...prev };
                delete next[listToDelete._id];
                return next;
            });
            setListToDelete(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete list");
        } finally {
            setDeletingList(false);
        }
    };

    const handleCreateCard = async (listId, title) => {
        try {
            const res = await API.post("/cards", { title, listId });
            setCardsByList((prev) => ({
                ...prev,
                [listId]: [...(prev[listId] || []), res.data],
            }));
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create card");
            return false;
        }
    };

    const handleDragEnd = async (result) => {
        const { source, destination, type } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        if (type === "LIST") {
            const reordered = Array.from(lists);
            const [moved] = reordered.splice(source.index, 1);
            reordered.splice(destination.index, 0, moved);
            setLists(reordered);
            try {
                await Promise.all(
                    reordered.map((list, index) =>
                        API.put(`/lists/${list._id}/reorder`, { order: index })
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
                        API.put(`/cards/${card._id}/move`, { listId: sourceListId, order: index })
                    )
                );
            } catch (err) {
                setError("Failed to save card order");
            }
        } else {
            const destCards = Array.from(cardsByList[destListId] || []);
            destCards.splice(destination.index, 0, movedCard);
            setCardsByList((prev) => ({ ...prev, [sourceListId]: sourceCards, [destListId]: destCards }));
            try {
                await Promise.all([
                    ...sourceCards.map((card, index) =>
                        API.put(`/cards/${card._id}/move`, { listId: sourceListId, order: index })
                    ),
                    ...destCards.map((card, index) =>
                        API.put(`/cards/${card._id}/move`, { listId: destListId, order: index })
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
        <div className="min-h-screen bg-paper font-sans">
            <header className="border-b border-line bg-surface">
                <div className="px-6 py-4 flex justify-between items-center">
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm text-ink/60 hover:text-ink transition-colors"
                    >
                        ← Boards
                    </button>

                    <div className="flex items-center gap-4">
                        <h1 className="font-display font-semibold text-lg text-ink">{board?.title}</h1>
                        <span className="text-xs text-ink/40">
                            {board?.members?.length || 0} member
                            {(board?.members?.length || 0) !== 1 ? "s" : ""}
                        </span>
                        <button
                            onClick={() => setShowInvite(true)}
                            className="bg-accent-soft text-accent px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent/20 transition-colors"
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
            </header>

            <Toast message={error} onClose={() => setError("")} />

            <main className="p-6">
                {lists.length === 0 && (
                    <div className="max-w-md mb-6 border border-dashed border-line rounded-lg p-5 bg-surface/50">
                        <p className="font-display font-medium text-ink mb-1">This board is empty</p>
                        <p className="text-sm text-ink/60 mb-3">
                            Lists are the columns your cards move through. Start with a common setup, or add your own below.
                        </p>
                        <button
                            onClick={handleQuickStart}
                            disabled={quickStarting}
                            className="bg-accent-soft text-accent px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
                        >
                            {quickStarting ? "Creating…" : "Create To do / Doing / Done"}
                        </button>
                    </div>
                )}

                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex gap-4 overflow-x-auto pb-4 items-start"
                            >
                                {lists.map((list, listIndex) => (
                                    <Draggable key={list._id} draggableId={list._id} index={listIndex}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`bg-surface border border-line rounded-md p-3 w-72 flex-shrink-0 transition-shadow ${
                                                    snapshot.isDragging ? "shadow-lg" : ""
                                                }`}
                                            >
                                                <ListHeader
                                                    list={list}
                                                    count={(cardsByList[list._id] || []).length}
                                                    dragHandleProps={provided.dragHandleProps}
                                                    onRename={(title) => handleRenameList(list._id, title)}
                                                    onDelete={() => setListToDelete(list)}
                                                />

                                                <Droppable droppableId={list._id} type="CARD">
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className="space-y-2 mb-2 min-h-[8px]"
                                                        >
                                                            {(cardsByList[list._id] || []).map((card, cardIndex) => (
                                                                <Draggable key={card._id} draggableId={card._id} index={cardIndex}>
                                                                    {(provided, snapshot) => {
                                                                        const assignee = board?.members?.find(
                                                                            (m) => m._id === card.assignee
                                                                        );
                                                                        const overdue =
                                                                            card.dueDate && card.dueDate.slice(0, 10) < todayStr;

                                                                        return (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                onClick={() => setSelectedCard(card)}
                                                                                className={`bg-paper border border-line rounded-md p-2.5 text-sm cursor-grab transition-shadow ${
                                                                                    snapshot.isDragging
                                                                                        ? "shadow-lg"
                                                                                        : "hover:border-accent/40"
                                                                                }`}
                                                                            >
                                                                                <p className="font-medium text-ink">{card.title}</p>
                                                                                {card.description && (
                                                                                    <p className="text-xs text-ink/50 mt-0.5 line-clamp-2">
                                                                                        {card.description}
                                                                                    </p>
                                                                                )}
                                                                                {(card.dueDate || assignee) && (
                                                                                    <div className="flex items-center justify-between mt-2">
                                                                                        {card.dueDate ? (
                                                                                            <span
                                                                                                className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                                                                                                    overdue
                                                                                                        ? "bg-danger/10 text-danger"
                                                                                                        : "bg-accent-soft text-accent"
                                                                                                }`}
                                                                                            >
                                                                                                {overdue ? "Overdue · " : ""}
                                                                                                {formatDue(card.dueDate)}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span />
                                                                                        )}
                                                                                        {assignee && <Avatar name={assignee.name} />}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    }}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>

                                                <Composer
                                                    triggerLabel="Add a card"
                                                    placeholder="Card title…"
                                                    submitLabel="Add card"
                                                    onAdd={(title) => handleCreateCard(list._id, title)}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}

                                <div className="bg-surface/50 border border-dashed border-line rounded-md p-3 w-72 flex-shrink-0">
                                    <Composer
                                        triggerLabel="Add a list"
                                        placeholder="List name…"
                                        submitLabel="Add list"
                                        onAdd={handleCreateList}
                                    />
                                </div>
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </main>

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

            {listToDelete && (
                <ConfirmDialog
                    title="Delete this list?"
                    message={`"${listToDelete.title}" and its ${
                        (cardsByList[listToDelete._id] || []).length
                    } card(s) will be permanently deleted.`}
                    confirmLabel="Delete list"
                    loading={deletingList}
                    onConfirm={handleDeleteList}
                    onCancel={() => setListToDelete(null)}
                />
            )}
        </div>
    );
}

export default BoardDetail;
