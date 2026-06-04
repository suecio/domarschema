<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diamond TV | Live & On-Demand</title>
    <!-- OG_TAGS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.4.10/hls.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #020617; color: #f8fafc; overflow-x: hidden; }
        .clip-modal { z-index: 60 !important; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        @keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); } 50% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.8); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="antialiased">
    <div id="app" class="min-h-screen flex flex-col"></div>
    <script>
        const API_BASE = window.location.hostname.includes('deportes.se') ? '' : 'http://localhost:5000';
        let state = {
            activeTab: 'home', adminActiveTab: 'broadcasts', activeProfile: null, activeProfileType: null,
            matches: [], tournaments: [], teams: [], users: [], reels: [], subscriptions: [], viewers: {},
            engineStatus: { isRunning: false, active_match_id: null },
            currentUser: null, token: null, activeVideo: null, activeWaitingRoom: null, filterYear: 'All',
            toast: { message: '', visible: false, isError: false },
            userModal: { isOpen: false }, userForm: { id: '', username: '', password: '', role: 'member' },
            clipModal: { isOpen: false, matchId: null, title: '', startTime: '', stopTime: '' },
            matchForm: { id: '', title: '', teamHome: '', teamAway: '', startTime: '', endTime: '', url: 'https://deportes.se/live_stream/index.m3u8', joymoUrl: '', tournament: '', year: new Date().getFullYear().toString(), homeLogo: '', awayLogo: '' },
            tournForm: { id: '', name: '', year: new Date().getFullYear().toString(), sport: 'Baseball', hostCity: '', hostCountry: '', websiteUrl: '', logoUrl: '' },
            teamForm: { id: '', name: '', code: '', countryFull: '', sport: 'Baseball', logoUrl: '' },
            deleteModal: { isOpen: false, id: null, type: null }
        };

        try { state.currentUser = JSON.parse(localStorage.getItem('dtv_user')); state.token = localStorage.getItem('dtv_token'); } catch(e){}

        function showToast(msg, isError=false) {
            state.toast = { message: msg, visible: true, isError };
            render();
            setTimeout(() => { state.toast.visible = false; render(); }, 4000);
        }

        function getTeamLogo(teamName) {
            const team = state.teams.find(t => t.name.toLowerCase() === teamName.toLowerCase() || (t.code && t.code.toLowerCase() === teamName.toLowerCase()));
            return team && team.logoUrl ? team.logoUrl : `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=1e293b&color=94a3b8`;
        }

        function getCountryShort(teamName) {
            const team = state.teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
            return team && team.code ? `<span class="text-slate-500 font-bold uppercase ml-1">(${team.code})</span>` : '';
        }

        function safePushState(url) {
            try { window.history.pushState({}, '', url); } catch (e) { console.log('Sandbox blocked URL update'); }
        }

        async function fetchAllData() {
            try {
                const headers = state.token ? { 'Authorization': `Bearer ${state.token}` } : {};
                if (!state.activeVideo) {
                    const mRes = await fetch(`${API_BASE}/api/matches`);
                    if(mRes.ok) state.matches = await mRes.json();
                }
                const tRes = await fetch(`${API_BASE}/api/tournaments`);
                if(tRes.ok) state.tournaments = await tRes.json();
                const tmRes = await fetch(`${API_BASE}/api/teams`);
                if(tmRes.ok) state.teams = await tmRes.json();
                const rRes = await fetch(`${API_BASE}/api/reels`);
                if(rRes.ok) state.reels = await rRes.json();
                
                if (state.currentUser) {
                    const sRes = await fetch(`${API_BASE}/api/subscriptions`, { headers });
                    if(sRes.ok) state.subscriptions = await sRes.json();
                }
                if (state.currentUser && state.currentUser.role === 'admin') {
                    const uRes = await fetch(`${API_BASE}/api/users`, { headers });
                    if(uRes.ok) state.users = await uRes.json();
                }

                if (!state.activeVideo && !state.activeWaitingRoom) {
                    const params = new URLSearchParams(window.location.search);
                    if (params.get('match') && state.matches.length > 0) {
                        const m = state.matches.find(x => x.id == params.get('match') || x.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() === params.get('match'));
                        if (m) {
                            const now = new Date();
                            if (now < new Date(m.startTime)) openWaitingRoom(m.id);
                            else playVideo(m.id);
                        } else render();
                    } else render();
                }
            } catch(e) { 
                if (state.matches.length === 0) {
                    state.matches = [{ id: '1', title: 'European Cup Final', teamHome: 'Bonn Capitals', teamAway: 'Draci Brno', startTime: new Date(new Date().getTime() - 3600000).toISOString(), endTime: new Date(new Date().getTime() + 3600000).toISOString(), url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', views: 1420 }];
                    render();
                }
            }
        }

        async function fetchTelemetry() {
            const now = new Date();
            const liveMatches = state.matches.filter(m => now >= new Date(m.startTime) && now <= new Date(m.endTime));
            for (const match of liveMatches) {
                try {
                    const res = await fetch(`${API_BASE}/api/viewers/${match.id}`, { method: 'POST' });
                    if (res.ok) state.viewers[match.id] = (await res.json()).viewers;
                } catch(e){}
            }
            if (state.currentUser && state.currentUser.role === 'admin') {
                try {
                    const res = await fetch(`${API_BASE}/api/status`);
                    if (res.ok) state.engineStatus = await res.json();
                } catch(e){}
            }
            updateTelemetryDOM();
        }

        function updateTelemetryDOM() {
            Object.keys(state.viewers).forEach(id => {
                const el = document.getElementById(`live-card-viewers-${id}`);
                if (el) el.innerText = state.viewers[id];
                if (state.activeVideo && state.activeVideo.id == id && !state.activeVideo.url.includes('.mp4')) {
                    const overlay = document.getElementById('overlay-viewer-count');
                    if (overlay) overlay.innerText = state.viewers[id];
                }
            });
            if (state.currentUser && state.currentUser.role === 'admin') {
                document.querySelectorAll('.engine-status-dot').forEach(dot => {
                    const mId = dot.getAttribute('data-match-id');
                    dot.className = (state.engineStatus.isRunning && state.engineStatus.active_match_id == mId) ? 'engine-status-dot w-2 h-2 rounded-full bg-emerald-500 animate-pulse' : 'engine-status-dot w-2 h-2 rounded-full bg-slate-600';
                });
            }
        }

        window.handleSaveMatch = async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API_BASE}/api/matches`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` }, body: JSON.stringify(state.matchForm) });
                if(res.ok) { showToast('Match Saved'); state.matchForm = { id: '', title: '', teamHome: '', teamAway: '', startTime: '', endTime: '', url: 'https://deportes.se/live_stream/index.m3u8', joymoUrl: '', tournament: '', year: '2026', homeLogo: '', awayLogo: '' }; fetchAllData(); } else showToast(`Server Error`, true);
            } catch(e) { showToast(`Network Error`, true); }
        };

        window.handleSaveTournament = async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API_BASE}/api/tournaments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` }, body: JSON.stringify(state.tournForm) });
                if(res.ok) { showToast('Saved'); state.tournForm = { id: '', name: '', year: '2026', sport: 'Baseball', hostCity: '', hostCountry: '', websiteUrl: '', logoUrl: '' }; fetchAllData(); } else showToast(`Database Error`, true);
            } catch(e) { showToast(`Network Error`, true); }
        };

        window.handleSaveTeam = async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API_BASE}/api/teams`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` }, body: JSON.stringify(state.teamForm) });
                if(res.ok) { showToast('Saved'); state.teamForm = { id: '', name: '', code: '', countryFull: '', sport: 'Baseball', logoUrl: '' }; fetchAllData(); } else showToast(`Database Error`, true);
            } catch(e) { showToast(`Network Error`, true); }
        };

        window.confirmDelete = async () => {
            try {
                await fetch(`${API_BASE}/api/${state.deleteModal.type}/${state.deleteModal.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${state.token}` } });
                showToast('Deleted'); fetchAllData();
            } catch (e) { showToast('Failed to delete', true); }
            state.deleteModal = { isOpen: false, id: null, type: null }; render();
        };

        window.startEngine = async (url, mId) => {
            if (!url) return showToast('Missing Joymo URL.', true);
            showToast('Sending start command...');
            try {
                const res = await fetch(`${API_BASE}/api/start`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` }, body: JSON.stringify({ source_url: url, match_id: mId }) });
                const data = await res.json();
                if(res.ok) { showToast(data.message); fetchTelemetry(); } else showToast(data.error || 'Failed', true);
            } catch (e) { showToast('Network Error', true); }
        };

        window.stopEngine = async () => {
            showToast('Sending stop command...');
            try {
                const res = await fetch(`${API_BASE}/api/stop`, { method: 'POST', headers: { 'Authorization': `Bearer ${state.token}` } });
                const data = await res.json();
                if(res.ok) { showToast(data.message); fetchTelemetry(); } else showToast(data.error || 'Failed', true);
            } catch (e) { showToast('Network Error', true); }
        };

        window.switchTab = (tab) => { state.activeTab = tab; state.activeProfile = null; state.activeProfileType = null; state.filterYear = 'All'; if(state.activeVideo) closeVideo(); safePushState('/'); render(); };
        window.switchAdminTab = (tab) => { state.adminActiveTab = tab; render(); };
        window.viewProfile = (id, type) => { const list = type === 'team' ? state.teams : state.tournaments; const p = list.find(x => x.id == id); if (p) { state.activeProfile = p; state.activeProfileType = type; state.activeTab = 'profile_view'; render(); } };

        // --- USER & AUTH COMMANDS ---
        window.openUserModal = (id) => { const u = state.users.find(x => x.id == id); if(u) { state.userForm = {...u, password: ''}; state.userModal.isOpen = true; render(); } };
        window.handleSaveUser = async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API_BASE}/api/users/${state.userForm.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` }, body: JSON.stringify(state.userForm) });
                if(res.ok) { showToast('User updated'); state.userModal.isOpen = false; fetchAllData(); } else { const err = await res.json(); showToast(err.error || 'Update failed', true); }
            } catch(e) { showToast('Network Error', true); }
        };

        window.handleProfileUpdate = async (e) => {
            e.preventDefault();
            const u = document.getElementById('prof_user').value;
            const p = document.getElementById('prof_pass').value;
            try {
                const res = await fetch(`${API_BASE}/api/users/${state.currentUser.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` }, body: JSON.stringify({username: u, password: p}) });
                if(res.ok) {
                    const data = await res.json();
                    state.currentUser = data.user;
                    try { localStorage.setItem('dtv_user', JSON.stringify(data.user)); } catch(e){}
                    showToast('Profile updated!'); render();
                } else { const err = await res.json(); showToast(err.error || 'Update failed', true); }
            } catch(e) { showToast('Network Error', true); }
        };

        window.handleSubscribe = async (profileId, type) => {
            if (!state.currentUser) { showToast("Please sign in to subscribe to alerts!", true); switchTab('login'); return; }
            try {
                const res = await fetch(`${API_BASE}/api/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` }, body: JSON.stringify({targetId: profileId, targetType: type}) });
                if (res.ok) { const data = await res.json(); showToast(data.message); fetchAllData(); }
            } catch(e) { showToast('Network Error', true); }
        };

        window.openWaitingRoom = (id) => {
            const m = state.matches.find(x => x.id == id);
            if(m) {
                state.activeWaitingRoom = m;
                const slug = m.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                safePushState(`?match=${slug}`); render();
                window.countdownInterval = setInterval(() => {
                    const diff = new Date(m.startTime).getTime() - new Date().getTime();
                    if (diff <= 0) { clearInterval(window.countdownInterval); closeWaitingRoom(); playVideo(m.id); } 
                    else {
                        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        const sec = Math.floor((diff % (1000 * 60)) / 1000);
                        const el = document.getElementById('countdown-timer');
                        if (el) el.innerText = `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
                    }
                }, 1000);
            }
        };

        window.closeWaitingRoom = () => { if(window.countdownInterval) clearInterval(window.countdownInterval); state.activeWaitingRoom = null; safePushState('/'); render(); };

        window.updateForm = (form, key, val) => { 
            state[form][key] = val; 
            if (form === 'matchForm' && ['tournament', 'year', 'teamHome', 'teamAway'].includes(key)) {
                const y = state.matchForm.year || new Date().getFullYear();
                const t = state.matchForm.tournament || '[Tournament]';
                const away = state.matchForm.teamAway || '[Away]';
                const home = state.matchForm.teamHome || '[Home]';
                state.matchForm.title = `${y} ${t}: ${away} vs ${home}`;
                const titleInput = document.getElementById('title-input');
                if (titleInput) titleInput.value = state.matchForm.title;
            }
        };

        window.playVideo = (id) => {
            const m = state.matches.find(x => x.id == id);
            if(m) { 
                state.activeVideo = m; state.viewerCount = 1;
                const slug = m.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
                safePushState(`?match=${slug}`);
                try { fetch(`${API_BASE}/api/view/${id}`, { method: 'POST' }); } catch(e){}
                render(); initPlayer(); pingViewers(id); state.heartbeatInterval = setInterval(() => pingViewers(id), 15000);
            }
        };

        window.closeVideo = () => {
            if(window.hlsInstance) { window.hlsInstance.destroy(); window.hlsInstance = null; }
            if(state.heartbeatInterval) { clearInterval(state.heartbeatInterval); state.heartbeatInterval = null; }
            if(window.stallBuster) { clearTimeout(window.stallBuster); window.stallBuster = null; }
            state.activeVideo = null; state.viewerCount = 0; safePushState('/'); fetchAllData(); render();
        };

        // --- CLIPPER ENGINE ---
        window.handleClipClick = () => {
            if (!state.currentUser || (state.currentUser.role !== 'admin' && state.currentUser.role !== 'verified')) { showToast("Please Sign In as a verified user to create clips!", true); switchTab('login'); return; }
            const video = document.getElementById('main-player');
            if(!video) return;
            video.pause();
            const now = video.currentTime;
            const formatTime = (sec) => new Date(sec * 1000).toISOString().substr(11, 8);
            state.clipModal = { isOpen: true, matchId: state.activeVideo.id, title: '', startTime: formatTime(Math.max(0, now - 15)), stopTime: formatTime(Math.min(video.duration || now + 15, now + 15)) };
            render();
        };

        window.saveClip = async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API_BASE}/api/reels`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` }, body: JSON.stringify(state.clipModal) });
                if(res.ok) { showToast('Clip Saved to Reels!'); state.clipModal.isOpen = false; fetchAllData(); } else showToast('Error saving clip', true);
            } catch(e) { showToast('Network Error', true); }
        };

        // --- AUTH FORMS ---
        window.doLogin = async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username: document.getElementById('l_user').value, password: document.getElementById('l_pass').value}) });
                if(res.ok) {
                    const data = await res.json(); state.token = data.token; state.currentUser = data.user;
                    try { localStorage.setItem('dtv_token', data.token); localStorage.setItem('dtv_user', JSON.stringify(data.user)); } catch(e){}
                    showToast(`Welcome, ${data.user.username}`); switchTab('home'); fetchAllData();
                } else showToast("Invalid credentials", true);
            } catch(e) { showToast("Network error.", true); }
        };

        window.doRegister = async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API_BASE}/api/auth/register`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username: document.getElementById('r_user').value, password: document.getElementById('r_pass').value}) });
                if(res.ok) { showToast("Account created! Please log in."); switchTab('login'); } else showToast("Registration failed", true);
            } catch(e) { showToast("Network error", true); }
        };

        window.doLogout = () => {
            state.token = null; state.currentUser = null;
            try { localStorage.removeItem('dtv_token'); localStorage.removeItem('dtv_user'); } catch(e){}
            window.setTab('home'); showToast("Logged out");
        };

        function initPlayer() {
            const video = document.getElementById('main-player');
            if (!video || !state.activeVideo) return;
            const src = state.activeVideo.url;

            if (window.stallBuster) clearTimeout(window.stallBuster);
            video.addEventListener('waiting', () => {
                const syncMsg = document.getElementById('sync-msg');
                window.stallBuster = setTimeout(() => {
                    if (!video.paused && window.hlsInstance) { 
                        if(syncMsg) syncMsg.classList.remove('hidden');
                        video.currentTime += 0.5; video.play().catch(e=>e); 
                    }
                }, 4000); 
            });
            video.addEventListener('playing', () => { 
                if (window.stallBuster) clearTimeout(window.stallBuster); 
                const syncMsg = document.getElementById('sync-msg');
                if(syncMsg) syncMsg.classList.add('hidden');
            });

            if (src.toLowerCase().includes('.mp4')) {
                video.src = src; video.play().catch(e=>e); return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({ capLevelToPlayerSize: true, maxBufferLength: 60, liveSyncDuration: 30, enableWorker: true });
                window.hlsInstance = hls;
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data.fatal) {
                        switch (data.type) {
                            case window.Hls.ErrorTypes.NETWORK_ERROR: hls.startLoad(); break;
                            case window.Hls.ErrorTypes.MEDIA_ERROR: hls.recoverMediaError(); break;
                            default: hls.destroy(); setTimeout(initPlayer, 2000); break;
                        }
                    } else if (data.details === window.Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
                        video.currentTime += 0.5;
                    }
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, () => video.play().catch(e=>e));
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src; video.addEventListener('loadedmetadata', () => video.play().catch(e=>e));
            }
        }

        const svgs = {
            diamond: `<svg viewBox="0 0 400 400" class="w-8 h-8"><rect width="400" height="400" rx="80" fill="#0f172a"/><path d="M200 60 L340 200 L200 340 L60 200 Z" fill="none" stroke="#3b82f6" stroke-width="12" filter="drop-shadow(0px 0px 10px rgba(59, 130, 246, 0.8))"/><path d="M200 110 L290 200 L200 290 L110 200 Z" fill="#1e293b" stroke="#60a5fa" stroke-width="4"/><path d="M160 140 L210 140 C245 140 260 165 260 200 C260 235 245 260 210 260 L160 260 Z" fill="none" stroke="#f8fafc" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/><path d="M190 175 L220 200 L190 225 Z" fill="#3b82f6"/></svg>`,
            play: `<svg class="w-16 h-16 text-slate-700 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
            scissors: `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path></svg>`
        };

        function render() {
            const app = document.getElementById('app');
            const now = new Date();
            let html = '';

            // TOAST & MODALS
            if(state.toast.visible) html += `<div class="fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl font-bold shadow-2xl transition-all ${state.toast.isError ? 'bg-red-600' : 'bg-emerald-500'} text-white">${state.toast.message}</div>`;
            if (state.deleteModal.isOpen) html += `<div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"><div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"><h3 class="text-xl font-black text-white mb-2">Confirm Deletion</h3><p class="text-slate-400 mb-6">This cannot be undone.</p><div class="flex gap-3"><button onclick="confirmDelete()" class="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl">Delete</button><button onclick="state.deleteModal.isOpen=false; render()" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl">Cancel</button></div></div></div>`;
            if (state.clipModal.isOpen) html += `<div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"><div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"><h3 class="text-xl font-black text-white mb-4 flex items-center gap-2">${svgs.scissors} Clip Editor</h3><form onsubmit="saveClip(event)" class="space-y-4"><div><label class="text-xs text-slate-400">Clip Title</label><input type="text" value="${state.clipModal.title}" oninput="state.clipModal.title=this.value" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white" required></div><div class="grid grid-cols-2 gap-4"><div><label class="text-xs text-slate-400">Start (HH:MM:SS)</label><input type="text" value="${state.clipModal.startTime}" oninput="state.clipModal.startTime=this.value" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm" required></div><div><label class="text-xs text-slate-400">End (HH:MM:SS)</label><input type="text" value="${state.clipModal.stopTime}" oninput="state.clipModal.stopTime=this.value" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm" required></div></div><div class="flex gap-3 mt-6"><button type="button" onclick="state.clipModal.isOpen=false; render()" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl">Cancel</button><button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl">Create Reel</button></div></form></div></div>`;
            if (state.userModal.isOpen) html += `<div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"><div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"><h3 class="text-xl font-black text-white mb-4">Edit User</h3><form onsubmit="handleSaveUser(event)" class="space-y-4"><div><label class="text-xs text-slate-400">Username</label><input type="text" value="${state.userForm.username}" oninput="state.userForm.username=this.value" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white" required></div><div><label class="text-xs text-slate-400">New Password (leave blank to keep)</label><input type="password" value="${state.userForm.password}" oninput="state.userForm.password=this.value" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"></div><div><label class="text-xs text-slate-400">Role</label><select onchange="state.userForm.role=this.value" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"><option value="user" ${state.userForm.role==='user'?'selected':''}>User</option><option value="verified" ${state.userForm.role==='verified'?'selected':''}>Verified</option><option value="admin" ${state.userForm.role==='admin'?'selected':''}>Admin</option></select></div><div class="flex gap-3 mt-6"><button type="button" onclick="state.userModal.isOpen=false; render()" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl">Cancel</button><button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl">Save</button></div></form></div></div>`;

            // NAVBAR
            html += `<nav class="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50"><div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"><div class="flex items-center gap-3 cursor-pointer" onclick="switchTab('home')">${svgs.diamond}<span class="font-black text-xl tracking-tight text-white hidden sm:inline">Diamond TV</span></div><div class="flex gap-1 sm:gap-2 items-center overflow-x-auto no-scrollbar"><button onclick="switchTab('home')" class="px-3 py-2 rounded-lg text-sm font-bold transition-all ${state.activeTab==='home' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}">Home</button><button onclick="switchTab('reels')" class="px-3 py-2 rounded-lg text-sm font-bold transition-all ${state.activeTab==='reels' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}">Reels</button><button onclick="switchTab('competitions')" class="px-3 py-2 rounded-lg text-sm font-bold transition-all ${state.activeTab==='competitions' || state.activeProfileType==='tournament' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}">Competitions</button><button onclick="switchTab('teams')" class="px-3 py-2 rounded-lg text-sm font-bold transition-all ${state.activeTab==='teams' || state.activeProfileType==='team' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}">Teams</button>${state.currentUser ? `<div class="h-6 w-px bg-slate-800 mx-1"></div>${state.currentUser.role === 'admin' ? `<button onclick="switchTab('admin')" class="px-3 py-2 rounded-lg text-sm font-bold transition-all ${state.activeTab==='admin' ? 'bg-emerald-600 text-white' : 'text-emerald-500 hover:bg-slate-800'}">Admin</button>` : ''}<button onclick="switchTab('profile')" class="px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${state.activeTab==='profile' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}"><div class="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white uppercase">${state.currentUser.username.charAt(0)}</div><span class="hidden sm:inline">${state.currentUser.username}</span></button><button onclick="doLogout()" class="p-2 text-slate-500 hover:text-red-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg></button>` : `<div class="h-6 w-px bg-slate-800 mx-1"></div><button onclick="switchTab('login')" class="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white">Sign In</button>`}</div></div></nav><main class="flex-1 w-full max-w-7xl mx-auto px-4 py-8 pb-24">`;

            // VIEWS
            if (state.activeWaitingRoom) {
                const m = state.activeWaitingRoom;
                html += `<div class="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-4"><button onclick="closeWaitingRoom()" class="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button><div class="text-center w-full max-w-md"><div class="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-8 border border-blue-500/30">Upcoming Broadcast</div><div class="flex flex-col gap-6 mb-8"><div class="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800"><img src="${getTeamLogo(m.teamAway)}" class="w-16 h-16 object-contain shrink-0"><div class="text-left min-w-0"><h3 class="text-white font-black text-2xl truncate">${m.teamAway} ${getCountryShort(m.teamAway)}</h3><span class="text-slate-500 text-xs font-bold uppercase tracking-wider">Away</span></div></div><div class="text-slate-600 font-black text-xl italic">VS</div><div class="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800"><img src="${getTeamLogo(m.teamHome)}" class="w-16 h-16 object-contain shrink-0"><div class="text-left min-w-0"><h3 class="text-white font-black text-2xl truncate">${m.teamHome} ${getCountryShort(m.teamHome)}</h3><span class="text-slate-500 text-xs font-bold uppercase tracking-wider">Home</span></div></div></div><p class="text-sm text-slate-400 mb-8">${m.title}</p><div class="bg-black rounded-3xl p-8 shadow-2xl shadow-blue-900/20 inline-block w-full" style="animation: pulseGlow 4s infinite;"><div class="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Stream Begins In</div><div id="countdown-timer" class="text-5xl font-black text-white font-mono tracking-tight">00:00:00</div></div></div></div>`;
            } else if (state.activeVideo) {
                const m = state.activeVideo;
                const isLive = !m.url.toLowerCase().includes('.mp4');
                html += `<div class="max-w-6xl mx-auto space-y-6 animate-in fade-in pt-6"><div class="flex items-center justify-between gap-4 mb-4"><button onclick="closeVideo()" class="text-slate-400 hover:text-white flex items-center gap-2 font-bold bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">← Back</button><button onclick="handleClipClick()" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all border border-blue-400/20">${svgs.scissors} Clip Reel</button></div><div id="video-wrapper" class="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group"><div class="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">${isLive ? `<span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span><span id="sync-msg" class="text-slate-300 mr-1 hidden">Re-syncing...</span>` : '📼'}<span id="overlay-viewer-count">${isLive ? (state.viewers[m.id]||0) : m.views}</span> ${isLive ? 'Watching' : 'Views'}</div><video id="main-player" class="w-full h-full" controls playsinline x-webkit-airplay="allow"></video></div><div class="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6"><div class="flex-1 text-center md:text-left min-w-0"><h1 class="text-2xl sm:text-3xl font-black text-white mb-2 truncate">${m.title}</h1><p class="text-slate-400 font-medium">${new Date(m.startTime).toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p></div><div class="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 shrink-0 w-full md:w-auto overflow-x-auto no-scrollbar"><div class="flex flex-col items-center gap-2 min-w-[80px]"><img src="${getTeamLogo(m.teamAway)}" class="w-10 h-10 object-contain rounded-full bg-white p-1"><span class="text-xs font-bold text-white text-center truncate w-full">${m.teamAway} ${getCountryShort(m.teamAway)}</span><span class="text-slate-500 text-[10px] font-bold uppercase">Away</span></div><span class="text-slate-600 font-black italic text-lg">VS</span><div class="flex flex-col items-center gap-2 min-w-[80px]"><img src="${getTeamLogo(m.teamHome)}" class="w-10 h-10 object-contain rounded-full bg-white p-1"><span class="text-xs font-bold text-white text-center truncate w-full">${m.teamHome} ${getCountryShort(m.teamHome)}</span><span class="text-slate-500 text-[10px] font-bold uppercase">Home</span></div></div></div></div>`;
            } else if (state.activeTab === 'home') {
                let upcoming = [], live = [], archived = [];
                state.matches.forEach(m => {
                    if(!m.startTime || !m.endTime) return;
                    const start = new Date(m.startTime);
                    const end = new Date(m.endTime);
                    if (now < start) upcoming.push(m);
                    else if (now >= start && now <= end) live.push(m);
                    else archived.push(m);
                });
                upcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                archived.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

                html += `<div class="space-y-12 animate-in fade-in">`;
                if (live.length > 0) {
                    html += `<section><div class="flex items-center gap-2 mb-6"><span class="flex h-3 w-3 relative"><span class="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative rounded-full h-3 w-3 bg-red-500"></span></span><h2 class="text-2xl font-black text-white">Live Now</h2></div><div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${live.map(m => `
                            <div onclick="playVideo('${m.id}')" class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-500 transition-colors group flex flex-col shadow-xl">
                                <div class="aspect-video bg-slate-950 relative flex justify-center items-center">
                                    <div class="absolute top-4 left-4 z-20 flex gap-2"><span class="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">LIVE</span><span class="bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10"><span id="live-card-viewers-${m.id}">${state.viewers[m.id] || 0}</span> Watching</span></div>
                                    <img src="${getTeamLogo(m.teamAway)}" class="absolute left-1/4 w-16 h-16 opacity-30 group-hover:scale-110 transition-transform blur-sm" />
                                    <img src="${getTeamLogo(m.teamHome)}" class="absolute right-1/4 w-16 h-16 opacity-30 group-hover:scale-110 transition-transform blur-sm" />
                                    ${svgs.play}
                                </div>
                                <div class="p-5 flex-1 flex flex-col justify-between">
                                    <h3 class="font-bold text-lg text-white line-clamp-1 mb-1">${m.title}</h3>
                                    <div class="flex items-center gap-2 mt-2"><img src="${getTeamLogo(m.teamAway)}" class="w-5 h-5 rounded-full bg-white object-contain"><span class="text-slate-400 text-sm truncate">${m.teamAway} @ ${m.teamHome}</span></div>
                                </div>
                            </div>
                        `).join('')}
                    </div></section>`;
                }
                if (upcoming.length > 0) {
                    html += `<section><h2 class="text-2xl font-black text-white mb-6">Upcoming Matches</h2><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${upcoming.map(m => `
                            <div onclick="openWaitingRoom('${m.id}')" class="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col hover:border-blue-500 cursor-pointer transition-colors shadow-lg">
                                <div class="text-xs font-bold text-blue-400 mb-4 tracking-wider uppercase">STARTS: ${new Date(m.startTime).toLocaleString(undefined, {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</div>
                                <div class="flex flex-col gap-3 flex-1 justify-center bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                                    <div class="flex items-center gap-3"><img src="${getTeamLogo(m.teamAway)}" class="w-8 h-8 object-contain bg-white rounded-full p-0.5 shrink-0"><h3 class="font-bold text-white text-base leading-tight">${m.teamAway} ${getCountryShort(m.teamAway)}</h3></div>
                                    <div class="text-slate-600 font-black text-sm italic pl-11">VS</div>
                                    <div class="flex items-center gap-3"><img src="${getTeamLogo(m.teamHome)}" class="w-8 h-8 object-contain bg-white rounded-full p-0.5 shrink-0"><h3 class="font-bold text-white text-base leading-tight">${m.teamHome} ${getCountryShort(m.teamHome)}</h3></div>
                                </div>
                                <div class="mt-4 pt-3 border-t border-slate-800 text-slate-500 text-xs truncate">${m.title}</div>
                            </div>
                        `).join('')}
                    </div></section>`;
                }
                html += `<section><h2 class="text-2xl font-black text-white mb-6">Recent Archives</h2>
                    ${archived.length === 0 && live.length === 0 ? `<div class="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500 font-medium">No matches available.</div>` : ''}
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${archived.slice(0,12).map(m => `
                            <div onclick="playVideo('${m.id}')" class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-slate-600 transition-colors group shadow-lg">
                                <div class="aspect-video bg-slate-950 relative">
                                     ${m.thumbnailUrl ? `<img src="${m.thumbnailUrl}" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity">` : `<div class="w-full h-full flex items-center justify-center opacity-20"><svg class="w-12 h-12 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>`}
                                     <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                                </div>
                                <div class="p-5 -mt-6 relative z-10">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-[10px] font-black bg-slate-800 border border-slate-700 text-slate-400 px-2 py-1 rounded uppercase tracking-wider inline-block">VOD • ${new Date(m.endTime).toLocaleDateString()}</span>
                                        <div class="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded-full flex items-center gap-1 border border-slate-800"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> ${m.views || 0}</div>
                                    </div>
                                    <h3 class="font-bold text-lg text-white line-clamp-1">${m.title}</h3>
                                    <div class="flex items-center gap-2 mt-2"><div class="flex -space-x-2"><img src="${getTeamLogo(m.teamAway)}" class="w-6 h-6 rounded-full border-2 border-slate-900 bg-white object-contain"><img src="${getTeamLogo(m.teamHome)}" class="w-6 h-6 rounded-full border-2 border-slate-900 bg-white object-contain"></div><p class="text-slate-500 text-sm truncate">${m.teamAway} @ ${m.teamHome}</p></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section></div>`;
            }
            else if (state.activeTab === 'teams' || state.activeTab === 'competitions') {
                const isTeams = state.activeTab === 'teams';
                const items = isTeams ? state.teams : state.tournaments;
                let years = [];
                if (!isTeams) years = [...new Set(state.tournaments.map(t => t.year))].sort().reverse();
                const filteredItems = (!isTeams && state.filterYear !== 'All') ? items.filter(t => t.year === state.filterYear) : items;

                html += `<div class="space-y-8 animate-in fade-in">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <h2 class="text-3xl font-black text-white">${isTeams ? 'Teams Directory' : 'Competitions Directory'}</h2>
                        ${!isTeams ? `
                            <div class="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto no-scrollbar">
                                <button onclick="state.filterYear='All'; render()" class="px-4 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors ${state.filterYear === 'All' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}">All Years</button>
                                ${years.map(y => `<button onclick="state.filterYear='${y}'; render()" class="px-4 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors ${state.filterYear === y ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}">${y}</button>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        ${filteredItems.map(item => `
                            <div onclick="viewProfile('${item.id}', '${isTeams ? 'team' : 'tournament'}')" class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500 hover:bg-slate-800 transition-all group shadow-lg relative">
                                ${item.sport ? `<span class="absolute top-2 right-2 text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">${item.sport === 'Baseball' ? '⚾' : '🥎'}</span>` : ''}
                                <img src="${item.logoUrl || getTeamLogo(item.name)}" class="w-16 h-16 sm:w-24 sm:h-24 object-contain bg-white rounded-xl p-2 group-hover:scale-110 transition-transform shadow-md">
                                <div class="text-center">
                                    ${!isTeams && item.year ? `<div class="text-[10px] font-black text-blue-500 mb-1">${item.year}</div>` : ''}
                                    <h3 class="font-bold text-white text-sm line-clamp-2">${item.name}</h3>
                                    ${isTeams && item.countryFull ? `<div class="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-wider">${item.countryFull}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
            }
            else if (state.activeTab === 'profile_view' && state.activeProfile) {
                const p = state.activeProfile;
                const isTeam = state.activeProfileType === 'team';
                const isSubbed = state.subscriptions.some(s => s.targetId === p.id);
                const relatedMatches = state.matches.filter(m => isTeam ? (m.teamHome === p.name || m.teamAway === p.name) : (m.tournament === p.name)).sort((a,b) => new Date(b.startTime) - new Date(a.startTime));

                html += `<div class="space-y-8 animate-in fade-in">
                    <button onclick="switchTab('${isTeam ? 'teams' : 'competitions'}')" class="text-slate-400 hover:text-white flex items-center gap-2 font-bold mb-4 bg-slate-900 px-4 py-2 rounded-lg w-fit border border-slate-800">← Back to Directory</button>
                    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden shadow-2xl">
                        <div class="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none"></div>
                        <img src="${p.logoUrl || getTeamLogo(p.name)}" class="w-32 h-32 sm:w-48 sm:h-48 object-contain bg-white rounded-2xl p-4 shadow-2xl relative z-10 border-4 border-slate-800">
                        <div class="relative z-10 text-center sm:text-left flex-1">
                            <span class="text-blue-500 font-bold uppercase tracking-widest text-sm mb-2 block">${isTeam ? p.countryFull || 'Team Profile' : p.year || 'Competition'}</span>
                            <h1 class="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">${p.name}</h1>
                            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                                ${!isTeam && (p.hostCity || p.hostCountry) ? `<div class="flex items-center gap-1.5 text-slate-400 text-sm font-medium bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>${p.hostCity ? p.hostCity + ', ' : ''}${p.hostCountry || ''}</div>` : ''}
                                ${p.websiteUrl ? `<a href="${p.websiteUrl}" target="_blank" class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-700 shadow-md">Official Site ↗</a>` : ''}
                                <button onclick="handleSubscribe('${p.id}', '${state.activeProfileType}')" class="${isSubbed ? 'bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/30' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'} px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ml-auto sm:ml-0">${isSubbed ? '🔕 Unsubscribe' : '🔔 Subscribe for Alerts'}</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 class="text-2xl font-black text-white mb-6 border-b border-slate-800 pb-2">Broadcasts</h2>
                        ${relatedMatches.length === 0 ? `<div class="bg-slate-900/50 rounded-2xl p-8 text-center text-slate-500 border border-slate-800 border-dashed">No matches found for ${p.name}.</div>` : `
                        <div class="space-y-4">
                            ${relatedMatches.map(m => {
                                const isLive = now >= new Date(m.startTime) && now <= new Date(m.endTime);
                                const isUpcoming = now < new Date(m.startTime);
                                return `
                                <div onclick="${isUpcoming ? `openWaitingRoom('${m.id}')` : `playVideo('${m.id}')`}" class="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-blue-500 transition-colors group shadow-lg">
                                    <div class="flex-1 min-w-0">
                                        <h3 class="font-bold text-white text-lg flex items-center gap-3 mb-2">
                                            <img src="${getTeamLogo(m.teamAway)}" class="h-6 w-6 object-contain bg-white rounded-full p-0.5"> ${m.teamAway} <span class="text-slate-500 text-xs font-black italic">vs</span> ${m.teamHome} <img src="${getTeamLogo(m.teamHome)}" class="h-6 w-6 object-contain bg-white rounded-full p-0.5">
                                        </h3>
                                        <p class="text-slate-400 text-sm truncate">${m.title}</p>
                                    </div>
                                    <div class="text-left md:text-right shrink-0 bg-slate-950 p-3 rounded-xl border border-slate-800">
                                        <div class="text-white font-bold text-sm mb-1">${new Date(m.startTime).toLocaleDateString()}</div>
                                        <span class="text-[10px] uppercase font-black px-2 py-1 rounded inline-block ${isLive ? 'bg-red-500/20 text-red-400 border border-red-500/30' : isUpcoming ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}">${isLive ? 'LIVE NOW' : isUpcoming ? 'UPCOMING' : 'VOD'}</span>
                                    </div>
                                </div>`;
                            }).join('')}
                        </div>
                        `}
                    </div>
                </div>`;
            }
            else if (state.activeTab === 'profile' && state.currentUser) {
                const mySubs = state.subscriptions.map(s => {
                    let item = s.targetType === 'team' ? state.teams.find(t=>t.id===s.targetId) : state.tournaments.find(t=>t.id===s.targetId);
                    return item ? `<div class="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between"><div class="flex items-center gap-3"><img src="${item.logoUrl || getTeamLogo(item.name)}" class="w-8 h-8 object-contain bg-white rounded p-1"><span class="font-bold text-white text-sm">${item.name}</span></div><span class="text-[10px] uppercase text-slate-500 font-bold bg-slate-900 px-2 py-1 rounded">${s.targetType}</span></div>` : '';
                }).join('');

                html += `<div class="max-w-4xl mx-auto space-y-8 animate-in fade-in">
                    <div class="bg-slate-900 border border-slate-800 p-8 sm:p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden">
                        <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-600 flex items-center justify-center text-4xl sm:text-5xl text-white font-black uppercase mx-auto mb-6 shadow-xl shadow-blue-500/30 border-4 border-slate-800">${state.currentUser.username.charAt(0)}</div>
                        <h1 class="text-3xl sm:text-4xl font-black text-white">${state.currentUser.username}</h1>
                        <span class="inline-block mt-3 bg-slate-950 border border-slate-700 text-slate-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-inner">${state.currentUser.role} Account</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
                            <h2 class="text-xl font-black text-white mb-6">Account Security</h2>
                            <form onsubmit="handleProfileUpdate(event)" class="space-y-5">
                                <div><label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Username</label><input type="text" id="prof_user" value="${state.currentUser.username}" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"></div>
                                <div><label class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">New Password</label><input type="password" id="prof_pass" placeholder="Leave blank to keep current" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"></div>
                                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">Save Profile</button>
                            </form>
                        </div>
                        <div class="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl flex flex-col">
                            <h2 class="text-xl font-black text-white mb-6">My Subscriptions</h2>
                            <div class="flex-1 overflow-y-auto space-y-3">
                                ${mySubs || '<p class="text-slate-500 text-sm italic">You have no active subscriptions. Visit a Team or Competition page to subscribe for alerts.</p>'}
                            </div>
                        </div>
                    </div>
                </div>`;
            }
            else if (state.activeTab === 'reels') {
                html += `<div class="space-y-8 animate-in fade-in"><h2 class="text-3xl font-black text-white border-b border-slate-800 pb-4">Community Reels</h2>
                    ${state.reels.length === 0 ? `<div class="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl p-16 text-center text-slate-500 font-medium">No reels created yet.</div>` : `
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        ${state.reels.map(r => `
                            <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group cursor-pointer hover:border-blue-500 transition-all shadow-lg">
                                <div class="aspect-[9/16] bg-slate-950 relative flex items-center justify-center">
                                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                                    <div class="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-blue-600 transition-colors shadow-lg z-20">${svgs.play}</div>
                                    <div class="absolute bottom-0 left-0 right-0 p-4 z-20"><h3 class="font-bold text-white text-sm line-clamp-2">${r.title}</h3></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>`}
                </div>`;
            }
            else if (state.activeTab === 'login' || state.activeTab === 'register') {
                const isLogin = state.activeTab === 'login';
                html += `<div class="max-w-md mx-auto bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl mt-12 animate-in fade-in zoom-in-95">
                    <div class="flex justify-center mb-8">${svgs.diamond}</div>
                    <h2 class="text-2xl font-black text-white mb-6 text-center">${isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <form onsubmit="${isLogin ? 'doLogin(event)' : 'doRegister(event)'}" class="space-y-4">
                        <input id="${isLogin ? 'l_user' : 'r_user'}" type="text" placeholder="Username" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                        <input id="${isLogin ? 'l_pass' : 'r_pass'}" type="password" placeholder="Password" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl mt-4 shadow-lg">${isLogin ? 'Sign In' : 'Register'}</button>
                    </form>
                    <div class="mt-8 text-center border-t border-slate-800 pt-6">
                        <p class="text-sm text-slate-400 font-medium">${isLogin ? `Don't have an account? <button onclick="switchTab('register')" class="text-blue-500 font-bold hover:underline">Register</button>` : `Already registered? <button onclick="switchTab('login')" class="text-blue-500 font-bold hover:underline">Sign In</button>`}</p>
                    </div>
                </div>`;
            }
            else if (state.activeTab === 'admin' && state.currentUser && state.currentUser.role === 'admin') {
                html += `<div class="space-y-8 animate-in fade-in max-w-full overflow-hidden">
                    <div class="bg-slate-900 border border-slate-800 p-1.5 rounded-xl flex gap-1 w-full overflow-x-auto no-scrollbar shadow-lg">
                        <button onclick="switchAdminTab('broadcasts')" class="whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${state.adminActiveTab === 'broadcasts' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}">📺 Broadcasts & Clips</button>
                        <button onclick="switchAdminTab('teams')" class="whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${state.adminActiveTab === 'teams' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}">🛡️ Teams</button>
                        <button onclick="switchAdminTab('competitions')" class="whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${state.adminActiveTab === 'competitions' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}">🏆 Competitions</button>
                        <button onclick="switchAdminTab('users')" class="whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${state.adminActiveTab === 'users' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}">👥 Users</button>
                    </div>`;

                if (state.adminActiveTab === 'broadcasts') {
                    html += `<div class="grid grid-cols-1 xl:grid-cols-3 gap-8"><div class="xl:col-span-1"><div class="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 sticky top-24 shadow-2xl"><div class="flex justify-between items-center mb-6"><h3 class="text-xl font-black text-white">Schedule</h3>${state.matchForm.id ? `<button type="button" onclick="state.matchForm={year:'2026'}; render();" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full font-bold">New</button>` : ''}</div><form onsubmit="handleSaveMatch(event)" class="space-y-4"><div class="grid grid-cols-3 gap-3"><div class="col-span-1"><label class="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Year</label><input required type="text" value="${state.matchForm.year}" oninput="updateForm('matchForm', 'year', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm shadow-inner"></div><div class="col-span-2"><label class="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Tournament</label><select required onchange="updateForm('matchForm', 'tournament', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm appearance-none shadow-inner"><option value="">Select...</option>${state.tournaments.map(t => `<option value="${t.name}" ${state.matchForm.tournament===t.name?'selected':''}>${t.name}</option>`).join('')}</select></div></div><div class="grid grid-cols-2 gap-3"><div><label class="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Away Team</label><select required onchange="updateForm('matchForm', 'teamAway', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm appearance-none shadow-inner"><option value="">Away...</option>${state.teams.map(t => `<option value="${t.name}" ${state.matchForm.teamAway===t.name?'selected':''}>${t.name}</option>`).join('')}</select></div><div><label class="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Home Team</label><select required onchange="updateForm('matchForm', 'teamHome', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm appearance-none shadow-inner"><option value="">Home...</option>${state.teams.map(t => `<option value="${t.name}" ${state.matchForm.teamHome===t.name?'selected':''}>${t.name}</option>`).join('')}</select></div></div><div><label class="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Title (Auto)</label><input required id="title-input" type="text" value="${state.matchForm.title}" oninput="updateForm('matchForm', 'title', this.value)" class="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-300 text-sm shadow-inner" /></div><div class="grid grid-cols-2 gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50"><div><label class="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Goes Live at:</label><input required type="datetime-local" value="${state.matchForm.startTime}" oninput="updateForm('matchForm', 'startTime', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-xs [color-scheme:dark]" /></div><div><label class="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Archives at:</label><input required type="datetime-local" value="${state.matchForm.endTime}" oninput="updateForm('matchForm', 'endTime', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-xs [color-scheme:dark]" /></div></div><div><label class="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Playback URL</label><input required type="text" value="${state.matchForm.url}" oninput="updateForm('matchForm', 'url', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 font-mono text-xs shadow-inner" /></div><div><label class="block text-[10px] font-black text-emerald-500 mb-1 uppercase tracking-widest">Joymo Source URL</label><input type="text" value="${state.matchForm.joymoUrl}" oninput="updateForm('matchForm', 'joymoUrl', this.value)" class="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-4 py-3 text-slate-300 font-mono text-xs shadow-inner focus:outline-none focus:border-emerald-500" /></div><button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-lg mt-2 transition-colors">Save Match</button></form></div></div><div class="xl:col-span-2 space-y-6"><h3 class="text-2xl font-black text-white">Broadcasts Database</h3><div class="space-y-3">${state.matches.length === 0 ? `<div class="text-slate-500 bg-slate-900 border border-slate-800 rounded-xl p-8 text-center border-dashed">No matches found.</div>` : state.matches.map(m => `<div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg"><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-2"><div class="engine-status-dot w-2 h-2 rounded-full ${state.engineStatus.isRunning && state.engineStatus.active_match_id == m.id ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}" data-match-id="${m.id}"></div><h4 class="font-bold text-white text-base truncate">${m.title}</h4></div><p class="text-xs text-slate-500 font-medium">${m.startTime.replace('T', ' ')}</p></div><div class="flex flex-wrap items-center gap-2">${(now >= new Date(m.startTime) && now <= new Date(m.endTime)) || (now < new Date(m.startTime)) ? `<div class="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 mr-2 shadow-inner"><button onclick="startEngine('${m.joymoUrl || ''}', '${m.id}')" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md">▶ Engine</button><button onclick="stopEngine()" class="px-4 py-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-colors">■ Stop</button></div>` : `<button onclick="handleClipClick()" class="px-4 py-2 bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold mr-2">${svgs.scissors} Clip</button>`}<button onclick="state.matchForm={...${JSON.stringify(m).replace(/"/g, '&quot;')}}; render();" class="px-5 py-2 bg-slate-950 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold shadow-sm">Edit</button><button onclick="state.deleteModal = {isOpen:true, id:'${m.id}', type:'matches'}; render();" class="px-5 py-2 bg-red-950/30 border border-red-900/50 hover:bg-red-900/60 text-red-400 rounded-xl text-xs font-bold shadow-sm">Delete</button></div></div>`).join('')}</div></div></div>`;
                }
                else if (state.adminActiveTab === 'teams') {
                    html += `<div class="grid grid-cols-1 lg:grid-cols-3 gap-8"><div class="lg:col-span-1"><div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 sticky top-24 shadow-xl"><div class="flex justify-between items-center mb-6"><h3 class="text-xl font-bold text-white">Teams</h3>${state.teamForm.id ? `<button type="button" onclick="state.teamForm={sport:'Baseball'}; render();" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full font-bold">New</button>` : ''}</div><form onsubmit="handleSaveTeam(event)" class="space-y-4"><input type="text" value="${state.teamForm.name}" oninput="updateForm('teamForm', 'name', this.value)" placeholder="Team Name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"><div class="grid grid-cols-2 gap-3"><input type="text" value="${state.teamForm.code}" oninput="updateForm('teamForm', 'code', this.value)" placeholder="CODE (SWE)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm uppercase"><input type="text" value="${state.teamForm.countryFull}" oninput="updateForm('teamForm', 'countryFull', this.value)" placeholder="Full (Sweden)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"></div><div class="grid grid-cols-2 gap-3"><select onchange="updateForm('teamForm', 'sport', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm appearance-none"><option value="Baseball" ${state.teamForm.sport==='Baseball'?'selected':''}>Baseball</option><option value="Softball" ${state.teamForm.sport==='Softball'?'selected':''}>Softball</option></select><input type="text" value="${state.teamForm.logoUrl}" oninput="updateForm('teamForm', 'logoUrl', this.value)" placeholder="Logo URL" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"></div><button type="submit" class="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-xl mt-2 shadow-lg transition-colors">Save Team</button></form></div></div><div class="lg:col-span-2"><h3 class="text-2xl font-black text-white mb-6">Teams Database</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${state.teams.map(t => `<div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg"><div><h4 class="font-bold text-white text-sm mb-1">${t.name}</h4><p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">${t.countryFull || t.code || ''} - ${t.sport}</p></div><div class="flex gap-2"><button onclick="state.teamForm={...${JSON.stringify(t).replace(/"/g, '&quot;')}}; render();" class="text-xs font-bold bg-slate-950 text-white px-4 py-2 rounded-xl border border-slate-700">Edit</button><button onclick="state.deleteModal = {isOpen:true, id:'${t.id}', type:'teams'}; render();" class="text-xs font-bold bg-red-950/30 text-red-500 px-4 py-2 rounded-xl border border-red-900/50">Del</button></div></div>`).join('')}</div></div></div>`;
                }
                else if (state.adminActiveTab === 'competitions') {
                    html += `<div class="grid grid-cols-1 lg:grid-cols-3 gap-8"><div class="lg:col-span-1"><div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 sticky top-24 shadow-xl"><h3 class="text-xl font-bold text-white mb-6">Competitions</h3><form onsubmit="handleSaveTournament(event)" class="space-y-4"><input type="text" value="${state.tournForm.name}" oninput="updateForm('tournForm', 'name', this.value)" placeholder="Tournament Name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"><div class="grid grid-cols-2 gap-3"><select onchange="updateForm('tournForm', 'sport', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm appearance-none"><option value="Baseball" ${state.tournForm.sport==='Baseball'?'selected':''}>Baseball</option><option value="Softball" ${state.tournForm.sport==='Softball'?'selected':''}>Softball</option></select><input type="text" value="${state.tournForm.logoUrl}" oninput="updateForm('tournForm', 'logoUrl', this.value)" placeholder="Logo URL" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"></div><div class="grid grid-cols-2 gap-3"><input type="text" value="${state.tournForm.hostCity}" oninput="updateForm('tournForm', 'hostCity', this.value)" placeholder="Host City" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"><input type="text" value="${state.tournForm.hostCountry}" oninput="updateForm('tournForm', 'hostCountry', this.value)" placeholder="Country" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"></div><input type="text" value="${state.tournForm.websiteUrl}" oninput="updateForm('tournForm', 'websiteUrl', this.value)" placeholder="Website URL" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm"><button type="submit" class="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-xl mt-2 shadow-lg transition-colors">Save</button></form></div></div><div class="lg:col-span-2"><h3 class="text-2xl font-black text-white mb-6">Competitions Database</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${state.tournaments.map(t => `<div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg"><div><h4 class="font-bold text-white text-sm mb-1">${t.name}</h4><p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">${t.year} • ${t.sport}</p></div><div class="flex gap-2"><button onclick="state.tournForm={...${JSON.stringify(t).replace(/"/g, '&quot;')}}; render();" class="text-xs font-bold bg-slate-950 text-white px-4 py-2 rounded-xl border border-slate-700">Edit</button><button onclick="state.deleteModal = {isOpen:true, id:'${t.id}', type:'tournaments'}; render();" class="text-xs font-bold bg-red-950/30 text-red-500 px-4 py-2 rounded-xl border border-red-900/50">Del</button></div></div>`).join('')}</div></div></div>`;
                }
                else if (state.adminActiveTab === 'users') {
                    html += `<div class="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-4xl"><h3 class="text-2xl font-black text-white mb-8">User Management</h3><div class="space-y-3">${state.users.map(u => `<div class="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center justify-between"><div class="flex items-center gap-4"><div class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400 uppercase">${u.username.charAt(0)}</div><div><span class="font-bold text-white text-lg block mb-1">${u.username}</span><span class="text-[10px] uppercase font-black bg-slate-800 text-slate-400 px-2.5 py-1 rounded tracking-widest">${u.role}</span></div></div><button onclick="window.openUserModal('${u.id}')" class="text-xs font-bold text-blue-500 bg-blue-500/10 hover:bg-blue-600 hover:text-white px-5 py-2.5 rounded-xl transition-colors">Edit</button></div>`).join('')}</div></div>`;
                }
            }

            html += `</main>`;
            app.innerHTML = html;
        }

        window.onload = () => {
            fetchAllData();
            state.dataInterval = setInterval(() => { if (!state.activeVideo) fetchAllData(); }, 60000);
            state.telemetryInterval = setInterval(fetchTelemetry, 10000);
            fetchTelemetry(); 

            // KEYBOARD SCRUBBING
            window.addEventListener('keydown', (e) => {
                const video = document.getElementById('main-player');
                if (!video || state.activeWaitingRoom) return;
                if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;

                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 10);
                    showToast("⏪ 10s");
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    video.currentTime = Math.min(video.duration || video.currentTime, video.currentTime + 10);
                    showToast("⏩ 10s");
                }
            });
        };
    </script>
</body>
</html>
