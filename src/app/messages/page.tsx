'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { MessageSquare, Shield, Check, Send, User } from 'lucide-react';
import { MessageRequest } from '@/types';

export default function MessagesPage() {
  const { currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('requests');
  const [requests, setRequests] = useState<MessageRequest[]>([
    {
      id: 'req-1',
      senderId: 'user-stud-4',
      senderName: 'Vignesh M',
      senderRole: 'student',
      receiverId: currentUser?.id || '',
      previewMessage: 'Hi brother, saw you are in PSG Tech MCA batch. Wanted to ask about the coding interview preparation.',
      status: 'pending',
      createdAt: '2026-09-26T12:00:00Z'
    }
  ]);

  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>([
    {
      id: 'm1',
      sender: 'Karthik Raja (Alumni)',
      text: 'Hello Arun! Feel free to ask any questions regarding campus placement rounds.',
      time: '10:30 AM'
    },
    {
      id: 'm2',
      sender: 'You',
      text: 'Thanks Karthik! What topics should I prioritize for product companies?',
      time: '10:32 AM'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleAcceptRequest = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
    setActiveTab('chats');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        id: `msg-${Date.now()}`,
        sender: 'You',
        text: inputMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Header with Anti-Spam Gate notice */}
      <div className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-5">
        <div className="flex items-center space-x-2 text-[#38E6A5]">
          <Shield className="h-5 w-5" />
          <h1 className="text-lg font-bold text-[#F8FAFC]">Direct Messaging & Networking</h1>
        </div>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Protected by Campus Lenz Message Requests: Unconnected users cannot message directly into your inbox until accepted.
        </p>

        {/* Tab switch */}
        <div className="mt-4 flex space-x-2 border-b border-[#1E3A5F] pb-2 text-xs">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
              activeTab === 'requests'
                ? 'bg-[#38E6A5] text-[#07111F]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <span>Message Requests</span>
            <span className="rounded-full bg-[#162D4A] px-1.5 py-0.2 text-[10px] text-[#38E6A5]">
              {requests.filter(r => r.status === 'pending').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`rounded-lg px-3 py-1.5 font-bold transition ${
              activeTab === 'chats'
                ? 'bg-[#38E6A5] text-[#07111F]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Active Conversations
          </button>
        </div>
      </div>

      {activeTab === 'requests' ? (
        /* Message Requests Queue */
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border border-[#1E3A5F] bg-[#112238] p-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#162D4A] font-bold text-[#38E6A5]">
                    {req.senderName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[#F8FAFC]">{req.senderName}</p>
                    <p className="text-[10px] uppercase text-[#94A3B8]">{req.senderRole}</p>
                  </div>
                </div>
                <span className="rounded bg-[#162D4A] px-2 py-0.5 text-[10px] text-[#FBBF24]">
                  {req.status}
                </span>
              </div>

              <div className="mt-3 rounded-lg bg-[#162D4A] p-3 text-[#F8FAFC]">
                "{req.previewMessage}"
              </div>

              {req.status === 'pending' && (
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="flex items-center space-x-1 rounded-lg bg-[#38E6A5] px-3 py-1.5 font-bold text-[#07111F] hover:bg-[#70F3C1]"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Accept & Chat</span>
                  </button>
                  <button
                    onClick={() => setRequests(requests.filter(r => r.id !== req.id))}
                    className="rounded-lg border border-[#1E3A5F] bg-[#162D4A] px-3 py-1.5 text-[#94A3B8] hover:text-red-400"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Active Chat Window */
        <div className="flex flex-col h-[420px] rounded-xl border border-[#1E3A5F] bg-[#112238]">
          <div className="border-b border-[#1E3A5F] bg-[#162D4A] p-3 text-xs">
            <span className="font-bold text-[#F8FAFC]">Karthik Raja</span>
            <span className="ml-2 rounded bg-[#38E6A5]/20 px-2 py-0.5 text-[10px] text-[#38E6A5]">
              Verified Alumni
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    msg.sender === 'You'
                      ? 'bg-[#38E6A5] text-[#07111F] font-medium'
                      : 'bg-[#162D4A] text-[#F8FAFC]'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="mt-1 block text-right text-[9px] opacity-75">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex border-t border-[#1E3A5F] p-2 bg-[#162D4A]">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-[#1E3A5F] bg-[#112238] px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
            <button
              type="submit"
              className="ml-2 rounded-lg bg-[#38E6A5] px-3 py-2 text-[#07111F] hover:bg-[#70F3C1]"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
