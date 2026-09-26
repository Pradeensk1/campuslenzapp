'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { MessageSquare, Shield, Check, Send, UserCheck, Inbox } from 'lucide-react';
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
      previewMessage: 'Hi brother, saw you are in PSG Tech MCA batch. Wanted to ask about the coding interview rounds and faculty guidance.',
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
      {/* Header */}
      <div className="apple-card p-6 sm:p-8">
        <div className="flex items-center space-x-2 text-[#38E6A5]">
          <Shield className="h-5 w-5" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Direct Messaging & Networking
          </h1>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          Protected by Campus Lenz Message Requests: Unconnected users cannot message directly into your inbox until accepted.
        </p>

        {/* Tab switch */}
        <div className="mt-6 flex space-x-2 border-b border-[#1F3653] pb-3 text-xs">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'requests'
                ? 'bg-[#38E6A5] text-[#0B1320] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <span>Message Requests</span>
            <span className="rounded-full bg-[#192D48] px-2 py-0.5 text-[10px] font-black text-[#38E6A5]">
              {requests.filter(r => r.status === 'pending').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`rounded-xl px-4 py-2 font-bold transition-all duration-200 ${
              activeTab === 'chats'
                ? 'bg-[#38E6A5] text-[#0B1320] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Active Conversations
          </button>
        </div>
      </div>

      {activeTab === 'requests' ? (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="apple-card p-6 text-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#192D48] font-bold text-[#38E6A5]">
                    {req.senderName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#F8FAFC]">{req.senderName}</p>
                    <p className="text-[10px] uppercase font-semibold text-[#64748B]">{req.senderRole}</p>
                  </div>
                </div>
                <span className="rounded-md bg-[#192D48] px-2.5 py-1 text-[10px] font-bold uppercase text-[#F59E0B]">
                  {req.status}
                </span>
              </div>

              <div className="rounded-xl border border-[#1F3653] bg-[#192D48] p-4 text-[#F8FAFC] leading-relaxed">
                "{req.previewMessage}"
              </div>

              {req.status === 'pending' && (
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="apple-button-primary text-xs"
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    <span>Accept & Chat</span>
                  </button>
                  <button
                    onClick={() => setRequests(requests.filter(r => r.id !== req.id))}
                    className="apple-button-secondary text-xs text-[#94A3B8] hover:text-red-400"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="apple-card flex flex-col h-[460px] overflow-hidden">
          <div className="border-b border-[#1F3653] bg-[#192D48] px-6 py-4 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-[#F8FAFC]">Karthik Raja</span>
              <span className="rounded-md bg-[#38E6A5]/15 px-2 py-0.5 text-[10px] font-bold text-[#38E6A5]">
                Verified Alumni
              </span>
            </div>
            <span className="text-[11px] text-[#64748B]">PSG College of Technology</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-4 leading-relaxed ${
                    msg.sender === 'You'
                      ? 'bg-[#38E6A5] text-[#0B1320] font-medium rounded-br-none shadow-sm'
                      : 'bg-[#192D48] text-[#F8FAFC] rounded-bl-none border border-[#1F3653]'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`mt-1.5 block text-right text-[9px] ${msg.sender === 'You' ? 'text-[#0B1320]/75' : 'text-[#64748B]'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex border-t border-[#1F3653] p-3 bg-[#192D48]">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-[#1F3653] bg-[#132238] px-4 py-2.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#38E6A5] transition-colors"
            />
            <button
              type="submit"
              className="ml-2 apple-button-primary !p-2.5"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
