import { useState, useEffect, useRef } from "react";
import { Send, Search, MoreVertical, ArrowLeft, Plus, Check, CheckCheck, MessageSquare } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { notifyEchoDataUpdated } from "../utils/dataEvents";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  sentByMe: boolean;
  read: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
}

interface Conversation {
  contactId: string;
  messages: Message[];
}

const SAMPLE_CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "SC",
    lastMessage: "Hey! How are you doing?",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2,
    online: true,
  },
  {
    id: "2",
    name: "Alex Thompson",
    avatar: "AT",
    lastMessage: "Did you see the new design?",
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
    online: true,
  },
  {
    id: "3",
    name: "Jordan Lee",
    avatar: "JL",
    lastMessage: "Thanks for your help!",
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0,
    online: false,
  },
  {
    id: "4",
    name: "Morgan Davis",
    avatar: "MD",
    lastMessage: "Let's catch up soon",
    lastMessageTime: new Date(Date.now() - 172800000).toISOString(),
    unreadCount: 1,
    online: false,
  },
];

export function ChatPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedContacts = localStorage.getItem("whatsapp-contacts");
    const savedConversations = localStorage.getItem("whatsapp-conversations");

    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    } else {
      setContacts(SAMPLE_CONTACTS);
      localStorage.setItem("whatsapp-contacts", JSON.stringify(SAMPLE_CONTACTS));
      notifyEchoDataUpdated();
    }

    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    } else {
      const initialConversations: Conversation[] = [
        {
          contactId: "1",
          messages: [
            {
              id: "1",
              text: "Hey! How are you doing?",
              timestamp: new Date().toISOString(),
              sentByMe: false,
              read: false,
            },
            {
              id: "2",
              text: "Are you free this weekend?",
              timestamp: new Date().toISOString(),
              sentByMe: false,
              read: false,
            },
          ],
        },
        {
          contactId: "2",
          messages: [
            {
              id: "1",
              text: "Did you see the new design?",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              sentByMe: false,
              read: true,
            },
          ],
        },
      ];
      setConversations(initialConversations);
      localStorage.setItem("whatsapp-conversations", JSON.stringify(initialConversations));
      notifyEchoDataUpdated();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedContact, conversations]);

  const saveData = (updatedContacts: Contact[], updatedConversations: Conversation[]) => {
    setContacts(updatedContacts);
    setConversations(updatedConversations);
    localStorage.setItem("whatsapp-contacts", JSON.stringify(updatedContacts));
    localStorage.setItem("whatsapp-conversations", JSON.stringify(updatedConversations));
    notifyEchoDataUpdated();
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedContact) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      sentByMe: true,
      read: false,
    };

    // Update conversation
    const conversationIndex = conversations.findIndex(
      (conv) => conv.contactId === selectedContact.id
    );

    let updatedConversations = [...conversations];
    if (conversationIndex >= 0) {
      updatedConversations[conversationIndex].messages.push(newMessage);
    } else {
      updatedConversations.push({
        contactId: selectedContact.id,
        messages: [newMessage],
      });
    }

    // Update contact last message
    const updatedContacts = contacts.map((contact) =>
      contact.id === selectedContact.id
        ? {
            ...contact,
            lastMessage: newMessage.text,
            lastMessageTime: newMessage.timestamp,
          }
        : contact
    );

    saveData(updatedContacts, updatedConversations);
    setInputText("");

    // Simulate response
    setTimeout(() => {
      const responses = [
        "Got it! 👍",
        "Sure, sounds good!",
        "I'll check that out.",
        "Thanks for letting me know!",
        "Awesome!",
        "Haha, that's great!",
      ];

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        sentByMe: false,
        read: false,
      };

      const savedConvs = localStorage.getItem("whatsapp-conversations");
      if (savedConvs) {
        const currentConvs: Conversation[] = JSON.parse(savedConvs);
        const convIndex = currentConvs.findIndex(
          (conv) => conv.contactId === selectedContact.id
        );
        if (convIndex >= 0) {
          currentConvs[convIndex].messages.push(responseMessage);
        }

        const savedContacts = localStorage.getItem("whatsapp-contacts");
        if (savedContacts) {
          const currentContacts: Contact[] = JSON.parse(savedContacts);
          const updatedContacts = currentContacts.map((contact) =>
            contact.id === selectedContact.id
              ? {
                  ...contact,
                  lastMessage: responseMessage.text,
                  lastMessageTime: responseMessage.timestamp,
                  unreadCount: contact.unreadCount + 1,
                }
              : contact
          );
          saveData(updatedContacts, currentConvs);
        }
      }
    }, 1500);
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    
    // Mark messages as read
    const updatedConversations = conversations.map((conv) =>
      conv.contactId === contact.id
        ? {
            ...conv,
            messages: conv.messages.map((msg) => ({ ...msg, read: true })),
          }
        : conv
    );

    const updatedContacts = contacts.map((c) =>
      c.id === contact.id ? { ...c, unreadCount: 0 } : c
    );

    saveData(updatedContacts, updatedConversations);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MM/dd/yy");
    }
  };

  const currentMessages =
    conversations.find((conv) => conv.contactId === selectedContact?.id)?.messages || [];

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-7rem)] lg:h-[calc(100vh-7rem)] flex relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-32 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-96 -right-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-300/15 blur-3xl animate-float" style={{ animationDelay: "4s" }} />

      {/* Contacts Sidebar */}
      <div className={`${selectedContact ? "hidden lg:flex" : "flex"} w-full lg:w-[380px] border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex-col relative z-10`}>
        {/* Sidebar Header */}
        <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Messages</h1>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">Direct and team conversations</p>
          </div>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact, idx) => (
            <div
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
              className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all animate-slide-in-left ${
                selectedContact?.id === contact.id ? "bg-slate-100 dark:bg-slate-800 border-l-4 border-l-sky-600" : ""
              }`}
              style={{ animationDelay: `${0.08 + idx * 0.06}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-semibold shadow-sm">
                    {contact.avatar}
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{contact.name}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatMessageTime(contact.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex-1">{contact.lastMessage}</p>
                    {contact.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-sky-700 text-white text-xs rounded-full font-medium shadow-sm">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredContacts.length === 0 && (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              <p>No contacts found</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col relative z-10">
          {/* Chat Header */}
          <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm flex items-center justify-between shadow-sm animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedContact(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all lg:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-semibold shadow-sm">
                  {selectedContact.avatar}
                </div>
                {selectedContact.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">{selectedContact.name}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedContact.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/70 dark:bg-slate-950/50 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="max-w-4xl mx-auto space-y-3">
              {currentMessages.map((message, index) => {
                const showTimestamp =
                  index === 0 ||
                  new Date(message.timestamp).getTime() -
                    new Date(currentMessages[index - 1].timestamp).getTime() >
                    300000; // 5 minutes

                return (
                  <div key={message.id}>
                    {showTimestamp && (
                      <div className="flex justify-center my-4">
                        <span className="px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg text-xs text-slate-500 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700">
                          {formatMessageTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex ${message.sentByMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          message.sentByMe
                            ? "bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-tr-md"
                            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-md"
                        }`}
                      >
                        <p className="break-words leading-relaxed">{message.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1.5">
                          <span className={`text-[10px] ${message.sentByMe ? "text-indigo-100" : "text-slate-400 dark:text-slate-500"}`}>
                            {format(new Date(message.timestamp), "h:mm a")}
                          </span>
                          {message.sentByMe && (
                            <span className="text-indigo-100">
                              {message.read ? (
                                <CheckCheck className="w-3.5 h-3.5" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 md:p-5 border-t border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-3">
              <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                <Plus className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="p-3 bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-2xl hover:shadow-lg hover:shadow-sky-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-slate-50/70 dark:bg-slate-950/50 relative z-10">
          <div className="text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-blue-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/30">
              <MessageSquare className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Welcome to Messages</h2>
            <p className="text-slate-500 dark:text-slate-400">Select a contact to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}