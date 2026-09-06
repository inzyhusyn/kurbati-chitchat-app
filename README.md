# Kurbati Connect

import React, { useState } from 'react';

import { Home, Search, Video, MessageCircle, User, Heart, MessageSquare, Send, Plus, Compass } from 'lucide-react';



export default function App() {

  const [activeTab, setActiveTab] = useState('home');



  return (

    <div className="flex justify-center items-center min-h-screen bg-neutral-950 font-sans text-white">

      {/* Mobile Frame Container */}

      <div className="w-full max-w-md h-screen bg-[#000000] flex flex-col justify-between border-x border-neutral-900 relative overflow-hidden shadow-2xl">

        

        {/* TOP HEADER */}

        <header className="flex justify-between items-center px-4 py-3 border-b border-neutral-900 bg-[#000000] sticky top-0 z-50">

          <h1 className="text-2xl font-serif italic tracking-wide text-amber-600 font-bold">Kurbati Chitchat</h1>

          <div className="flex gap-4 items-center">

            <Heart className="w-6 h-6 cursor-pointer hover:text-amber-500 transition" />

            <MessageCircle className="w-6 h-6 cursor-pointer hover:text-amber-500 transition" onClick={() => setActiveTab('chat')} />

          </div>

        </header>



        {/* MAIN DYNAMIC CONTENT AREA */}

        <main className="flex-1 overflow-y-auto pb-16">

          {activeTab === 'home' && <HomeFeed />}

          {activeTab === 'search' && <ExplorePage />}

          {activeTab === 'reels' && <ReelsPage />}

          {activeTab === 'chat' && <ChatPage />}

          {activeTab === 'profile' && <ProfilePage />}

        </main>



        {/* BOTTOM NAVIGATION BAR */}

        <nav className="flex justify-around items-center py-3 border-t border-neutral-900 bg-[#000000] absolute bottom-0 w-full z-50">

          <Home 

            className={`w-6 h-6 cursor-pointer ${activeTab === 'home' ? 'text-white' : 'text-neutral-500'}`} 

            onClick={() => setActiveTab('home')} 

          />

          <Search 

            className={`w-6 h-6 cursor-pointer ${activeTab === 'search' ? 'text-white' : 'text-neutral-500'}`} 

            onClick={() => setActiveTab('search')} 

          />

          <Video 

            className={`w-6 h-6 cursor-pointer ${activeTab === 'reels' ? 'text-white' : 'text-neutral-500'}`} 

            onClick={() => setActiveTab('reels')} 

          />

          <MessageCircle 

            className={`w-6 h-6 cursor-pointer ${activeTab === 'chat' ? 'text-white' : 'text-neutral-500'}`} 

            onClick={() => setActiveTab('chat')} 

          />

          <User 

            className={`w-6 h-6 cursor-pointer ${activeTab === 'profile' ? 'text-white' : 'text-neutral-500'}`} 

            onClick={() => setActiveTab('profile')} 

          />

        </nav>



      </div>

    </div>

  );

}



// 1. HOME FEED COMPONENT

function HomeFeed() {

  const stories = [

    { id: 1, name: 'Your Story', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },

    { id: 2, name: 'Aarav', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },

    { id: 3, name: 'Sanya', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },

    { id: 4, name: 'Kabir', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },

  ];



  return (

    <div className="flex flex-col">

      {/* Stories Bar */}

      <div className="flex gap-4 px-4 py-3 overflow-x-auto border-b border-neutral-900 scrollbar-none">

        {stories.map((story) => (

          <div key={story.id} className="flex flex-col items-center flex-shrink-0 cursor-pointer">

            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 to-orange-600">

              <img src={story.img} alt={story.name} className="w-full h-full object-cover rounded-full border-2 border-black" />

            </div>

            <span className="text-xs mt-1 text-neutral-400">{story.name}</span>

          </div>

        ))}

      </div>



      {/* Post Item */}

      <div className="border-b border-neutral-900">

        <div className="flex items-center justify-between px-4 py-3">

          <div className="flex items-center gap-3">

            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" alt="user" className="w-8 h-8 rounded-full object-cover" />

            <span className="text-sm font-semibold">aarav_official</span>

          </div>

          <span className="text-neutral-500 font-bold">...</span>

        </div>



        <div className="w-full h-96 bg-neutral-900 flex items-center justify-center">

          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe" alt="Post content" className="w-full h-full object-cover" />

        </div>



        <div className="px-4 py-3">

          <div className="flex justify-between items-center mb-2">

            <div className="flex gap-4">

              <Heart className="w-6 h-6 cursor-pointer hover:text-red-500 transition" />

              <MessageSquare className="w-6 h-6 cursor-pointer" />

              <Send className="w-6 h-6 cursor-pointer" />

            </div>

          </div>

          <p className="text-sm font-semibold mb-1">1,245 likes</p>

          <p className="text-sm text-neutral-300"><span className="font-semibold text-white mr-2">aarav_official</span>Exploring the deep dark aesthetics of code and design ✨</p>

        </div>

      </div>

    </div>

  );

}



// 2. EXPLORE / SEARCH COMPONENT

function ExplorePage() {

  return (

    <div className="p-4">

      <div className="bg-neutral-900 rounded-lg px-3 py-2 flex items-center gap-2 mb-4 text-neutral-400">

        <Search className="w-4 h-4" />

        <input type="text" placeholder="Search users or tags..." className="bg-transparent outline-none w-full text-white text-sm" />

      </div>

      <div className="grid grid-cols-3 gap-1">

        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (

          <div key={item} className="h-32 bg-neutral-900">

            <img src={`https://picsum.photos/seed/kurbati${item}/300/300`} alt="grid" className="w-full h-full object-cover" />

          </div>

        ))}

      </div>

    </div>

  );

}



// 3. REELS COMPONENT

function ReelsPage() {

  return (

    <div className="h-full flex flex-col items-center justify-center relative bg-black">

      <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23" alt="reel background" className="absolute inset-0 w-full h-full object-cover opacity-60" />

      <div className="absolute bottom-6 left-4 z-10">

        <h3 className="font-semibold text-lg">@zoya_design</h3>

        <p className="text-sm text-neutral-300">Vibing with the late night build sessions 🚀 #kurbati</p>

      </div>

    </div>

  );

}



// 4. CHAT COMPONENT

function ChatPage() {

  const chats = [

    { id: 1, name: 'Rohan Sharma', msg: 'Bhai project kahan tak pahuncha?', time: '2m ago' },

    { id: 2, name: 'Priya Verma', msg: 'Check out the new dark UI concept.', time: '1h ago' },

  ];



  return (

    <div className="flex flex-col p-4">

      <h2 className="text-xl font-bold mb-4">Messages</h2>

      {chats.map((chat) => (

        <div key={chat.id} className="flex items-center justify-between py-3 border-b border-neutral-900 cursor-pointer hover:bg-neutral-900/50 px-2 rounded">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-amber-500">

              {chat.name[0]}

            </div>

            <div>

              <h4 className="text-sm font-semibold">{chat.name}</h4>

              <p className="text-xs text-neutral-400">{chat.msg}</p>

            </div>

          </div>

          <span className="text-xs text-neutral-500">{chat.time}</span>

        </div>

      ))}

    </div>

  );

}



// 5. PROFILE COMPONENT

function ProfilePage() {

  return (

    <div className="flex flex-col p-4">

      <div className="flex items-center justify-between mb-4">

        <div className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-amber-600 overflow-hidden">

          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb" alt="Profile" className="w-full h-full object-cover" />

        </div>

        <div className="flex gap-6 text-center">

          <div><span className="font-bold block">12</span><span className="text-xs text-neutral-400">Posts</span></div>

          <div><span className="font-bold block">1.4K</span><span className="text-xs text-neutral-400">Followers</span></div>

          <div><span className="font-bold block">280</span><span className="text-xs text-neutral-400">Following</span></div>

        </div>

      </div>

      <h3 className="font-bold">Kurbati Creator</h3>

      <p className="text-sm text-neutral-300 mb-4">Building Kurbati Chitchat 🌙 Strict deep dark mode enthusiast.</p>

      <button className="bg-neutral-900 border border-neutral-800 py-2 rounded-lg font-semibold text-sm mb-4 hover:bg-neutral-800 transition">Edit Profile</button>

      

      <div className="grid grid-cols-3 gap-1">

        {[1, 2, 3].map((item) => (

          <div key={item} className="h-32 bg-neutral-900">

            <img src={`https://picsum.photos/seed/profile${item}/300/300`} alt="user post" className="w-full h-full object-cover" />

          </div>

        ))}

      </div>

    </div>

  );

}

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/47d0cb10-7dfb-457e-b7fb-bdae375dc784).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
