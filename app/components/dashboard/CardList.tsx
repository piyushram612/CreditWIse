'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Card } from '../../../lib/types';
import { PlusIcon, EditIcon, TrashIcon, CreditCardIcon, EyeIcon } from '../icons';

const CardDetailsModal = ({ card, onClose }: { card: Card; onClose: () => void; }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">{card.card_name} Benefits</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="space-y-2 text-gray-300 max-h-60 overflow-y-auto pr-2">
                    {/* FIX: Check if benefits is an array before mapping */}
                    {Array.isArray(card.benefits) && card.benefits.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                            {card.benefits.map((benefit, index) => (
                                <li key={index}>{String(benefit)}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No benefits listed for this card.</p>
                    )}
                </div>
                 <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">Close</button>
                </div>
            </div>
        </div>
    );
};


interface AddCardModalProps {
    allCards: Card[];
    onCardAdded: () => void;
    onClose: () => void;
}

const AddCardModal = ({ allCards, onCardAdded, onClose }: AddCardModalProps) => {
    const [selectedCardId, setSelectedCardId] = useState('');
    const [creditLimit, setCreditLimit] = useState('');
    const [amountUsed, setAmountUsed] = useState('');
    const supabase = createClientComponentClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !selectedCardId || !creditLimit) return;
        
        const selectedMasterCard = allCards.find(c => c.id === selectedCardId);

        const { error } = await supabase.from('user_owned_cards').insert({
            user_id: user.id,
            card_id: selectedCardId, // FIX: Use card_id
            credit_limit: parseFloat(creditLimit),
            used_amount: parseFloat(amountUsed) || 0, // FIX: Use used_amount
            // Add other fields from your schema that are required or have defaults
            card_name: selectedMasterCard?.card_name,
            issuer: selectedMasterCard?.card_issuer,
        });

        if (error) {
            alert('Error adding card: ' + error.message);
        } else {
            alert('Card added successfully!');
            onCardAdded();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg w-full max-w-md shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-white">Add a New Card</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Card</label>
                        <select value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">Select a card from the database</option>
                            {allCards.map((card) => (
                                <option key={card.id} value={card.id}>{card.card_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Credit Limit</label>
                        <input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., 100000" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Amount Used (Optional)</label>
                        <input type="number" value={amountUsed} onChange={(e) => setAmountUsed(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., 25000"/>
                    </div>
                    <div className="flex justify-end space-x-4 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">Add Card</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface EditCardModalProps {
    card: Card;
    onCardUpdated: () => void;
    onClose: () => void;
}

const EditCardModal = ({ card, onCardUpdated, onClose }: EditCardModalProps) => {
    const [creditLimit, setCreditLimit] = useState(card.credit_limit?.toString() ?? '');
    const [amountUsed, setAmountUsed] = useState(card.used_amount?.toString() ?? '');
    const supabase = createClientComponentClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('user_owned_cards').update({
            credit_limit: parseFloat(creditLimit),
            used_amount: parseFloat(amountUsed), // FIX: Use used_amount
        }).eq('id', card.id);

        if (error) {
            alert('Error updating card: ' + error.message);
        } else {
            alert('Card updated!');
            onCardUpdated();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg w-full max-w-md shadow-2xl">
                <h2 className="text-xl font-bold mb-4 text-white">Edit {card.card_name}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Credit Limit</label>
                        <input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Amount Used</label>
                        <input type="number" value={amountUsed} onChange={(e) => setAmountUsed(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">Update Card</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface CardListProps {
    cards: Card[];
    onCardUpdate: () => void;
    allCards: Card[];
}

export default function CardList({ cards, onCardUpdate, allCards }: CardListProps) {
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [viewingCard, setViewingCard] = useState<Card | null>(null);
    const supabase = createClientComponentClient();

    const handleDelete = async (cardId: string) => { // ID is now string
        if (!window.confirm("Are you sure you want to delete this card?")) return;
        
        const { error } = await supabase.from('user_owned_cards').delete().eq('id', cardId);
        if (error) {
            alert('Error deleting card: ' + error.message);
        } else {
            alert('Card deleted.');
            onCardUpdate();
        }
    };

    return (
        <div className="bg-gray-800/50 rounded-xl p-6 h-full">
            {showAddCardModal && <AddCardModal allCards={allCards} onCardAdded={onCardUpdate} onClose={() => setShowAddCardModal(false)} />}
            {editingCard && <EditCardModal card={editingCard} onCardUpdated={onCardUpdate} onClose={() => setEditingCard(null)} />}
            {viewingCard && <CardDetailsModal card={viewingCard} onClose={() => setViewingCard(null)} />}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Your Wallet</h2>
                <button onClick={() => setShowAddCardModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors">
                    <PlusIcon className="h-5 w-5" />
                    Add Card
                </button>
            </div>
            <div className="space-y-4">
                {cards.length > 0 ? cards.map(card => (
                    <div key={card.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-lg text-white">{card.card_name}</p>
                                <p className="text-sm text-gray-400">{card.card_issuer}</p>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => setViewingCard(card)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><EyeIcon className="h-4 w-4" /></button>
                                <button onClick={() => setEditingCard(card)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><EditIcon className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(card.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Used: ₹{(card.used_amount ?? 0).toLocaleString()}</span>
                                <span>Limit: ₹{(card.credit_limit ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full" style={{ width: `${((card.used_amount ?? 0) / (card.credit_limit ?? 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                )) : (
                     <div className="text-center py-16 px-4 border-2 border-dashed border-gray-700 rounded-lg">
                        <CreditCardIcon className="mx-auto h-12 w-12 text-gray-500" />
                        <h3 className="mt-2 text-lg font-medium text-white">Your wallet is empty</h3>
                        <p className="mt-1 text-sm text-gray-400">Add your first credit card to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
