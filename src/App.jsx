import { useState, useEffect } from "react";

const EVENT_THEMES = {
  christmas: {
    label: "Christmas",
    emoji: "🎄",
    accent: "#1a6b3c",
    accentLight: "#e8f5ee",
    accentMid: "#2d8a52",
    headerGrad: "linear-gradient(135deg, #0f3d24 0%, #1a6b3c 60%, #0d5530 100%)",
    particles: ["❄️","🎄","⭐","🎁","🔔"],
    defaultName: "Christmas 2025",
  },
  birthday: {
    label: "Birthday",
    emoji: "🎂",
    accent: "#7c3aed",
    accentLight: "#f3eeff",
    accentMid: "#9461f5",
    headerGrad: "linear-gradient(135deg, #3b1a8c 0%, #7c3aed 60%, #5b21b6 100%)",
    particles: ["🎂","🎉","🎈","✨","🥳"],
    defaultName: "Birthday Wishlist",
  },
  wedding: {
    label: "Wedding",
    emoji: "💍",
    accent: "#b5863a",
    accentLight: "#fdf6ea",
    accentMid: "#c9973f",
    headerGrad: "linear-gradient(135deg, #5c3d10 0%, #b5863a 60%, #8a621c 100%)",
    particles: ["💍","💐","🥂","✨","🕊️"],
    defaultName: "Wedding Registry",
  },
  baby: {
    label: "Baby Shower",
    emoji: "🍼",
    accent: "#0ea5a0",
    accentLight: "#e6fafa",
    accentMid: "#14b8a6",
    headerGrad: "linear-gradient(135deg, #064e4b 0%, #0ea5a0 60%, #0d8c88 100%)",
    particles: ["🍼","⭐","🌙","🐣","💛"],
    defaultName: "Baby Shower List",
  },
  housewarming: {
    label: "Housewarming",
    emoji: "🏠",
    accent: "#c2500a",
    accentLight: "#fef0e8",
    accentMid: "#d9621a",
    headerGrad: "linear-gradient(135deg, #6b2500 0%, #c2500a 60%, #a34008 100%)",
    particles: ["🏠","🪴","🕯️","✨","🛋️"],
    defaultName: "Housewarming Wishlist",
  },
};

const SAMPLE_DATA = {
  eventName: "Christmas 2025",
  eventType: "christmas",
  budget: 50,
  members: [
    {
      id: 1, name: "Mom", avatar: "🧣",
      wishes: [
        { id: 1, item: "Cozy slippers", link: "https://amazon.com", price: 35, claimedBy: "You", note: "She mentioned these in October!", anonymous: true },
        { id: 2, item: "Le Creuset Dutch Oven", link: "", price: 120, claimedBy: null, note: "", anonymous: false },
      ]
    },
    {
      id: 2, name: "Dad", avatar: "🧤",
      wishes: [
        { id: 1, item: "Noise cancelling headphones", link: "https://bestbuy.com", price: 49, claimedBy: "Sarah", note: "Splitting with me!", anonymous: true },
        { id: 2, item: "Golf rangefinder", link: "", price: 89, claimedBy: null, note: "", anonymous: false },
      ]
    },
    {
      id: 3, name: "Sarah", avatar: "🎀",
      wishes: [
        { id: 1, item: "Kindle Paperwhite", link: "https://amazon.com", price: 45, claimedBy: null, note: "", anonymous: false },
        { id: 2, item: "Yoga mat", link: "", price: 30, claimedBy: "Mom", note: "Already grabbed this one 🤫", anonymous: true },
      ]
    }
  ]
};

const AVATARS = ["🎁","🧣","🧤","🎀","⭐","🍪","🕯️","🦌","❄️","🔔","🌸","🎂","🎈","💐","🏠","🪴","🍼","💍","🐣","🌙"];

export default function GiftWishlist() {
  const [data, setData] = useState(SAMPLE_DATA);
  const [activeMember, setActiveMember] = useState(1);
  const [showAddWish, setShowAddWish] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showClaim, setShowClaim] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newWish, setNewWish] = useState({ item: "", link: "", price: "" });
  const [newMember, setNewMember] = useState({ name: "", avatar: "🎁" });
  const [claimNote, setClaimNote] = useState("");
  const [claimerName, setClaimerName] = useState("");
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(data.budget);
  const [particles, setParticles] = useState([]);

  const theme = EVENT_THEMES[data.eventType] || EVENT_THEMES.christmas;
  const currentMember = data.members.find(m => m.id === activeMember);
  const totalSpent = currentMember?.wishes.filter(w => w.claimedBy).reduce((s, w) => s + (w.price || 0), 0) || 0;
  const budgetPct = Math.min((totalSpent / data.budget) * 100, 100);

  useEffect(() => {
    const p = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      symbol: theme.particles[i % theme.particles.length],
      left: `${8 + i * 16}%`,
      delay: `${i * 1.3}s`,
      duration: `${7 + i * 1.2}s`,
    }));
    setParticles(p);
  }, [data.eventType]);

  function addWish() {
    if (!newWish.item.trim()) return;
    setData(d => ({ ...d, members: d.members.map(m => m.id === activeMember ? { ...m, wishes: [...m.wishes, { id: Date.now(), ...newWish, price: parseFloat(newWish.price) || 0, claimedBy: null, note: "", anonymous: false }] } : m) }));
    setNewWish({ item: "", link: "", price: "" });
    setShowAddWish(false);
  }

  function claimGift(wishId) {
    if (!claimerName.trim()) return;
    setData(d => ({ ...d, members: d.members.map(m => m.id === activeMember ? { ...m, wishes: m.wishes.map(w => w.id === wishId ? { ...w, claimedBy: claimerName, note: claimNote, anonymous: true } : w) } : m) }));
    setShowClaim(null); setClaimNote(""); setClaimerName("");
  }

  function unclaimGift(wishId) {
    setData(d => ({ ...d, members: d.members.map(m => m.id === activeMember ? { ...m, wishes: m.wishes.map(w => w.id === wishId ? { ...w, claimedBy: null, note: "", anonymous: false } : w) } : m) }));
  }

  function addMember() {
    if (!newMember.name.trim()) return;
    const newId = Date.now();
    setData(d => ({ ...d, members: [...d.members, { id: newId, name: newMember.name, avatar: newMember.avatar, wishes: [] }] }));
    setActiveMember(newId);
    setNewMember({ name: "", avatar: "🎁" });
    setShowAddMember(false);
  }

  function changeEventType(type) {
    setData(d => ({ ...d, eventType: type, eventName: EVENT_THEMES[type].defaultName }));
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --accent: ${theme.accent};
      --accent-light: ${theme.accentLight};
      --surface: #ffffff;
      --bg: #f6f6f8;
      --text: #111118;
      --text-muted: #888899;
      --border: #e4e4ec;
      --radius: 16px;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.05);
      --shadow-md: 0 2px 8px rgba(0,0,0,0.07), 0 8px 24px rgba(0,0,0,0.08);
    }
    body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
    .serif { font-family: 'DM Serif Display', serif; }

    .app-shell { min-height: 100vh; }

    .header {
      background: ${theme.headerGrad};
      padding: 28px 22px 52px;
      position: relative; overflow: hidden;
    }
    .header::after {
      content: '';
      position: absolute; bottom: -1px; left: 0; right: 0; height: 36px;
      background: var(--bg); border-radius: 36px 36px 0 0;
    }
    .particle {
      position: absolute; font-size: 17px; opacity: 0.15; pointer-events: none;
      animation: floatUp var(--dur) var(--delay) infinite ease-in-out;
    }
    @keyframes floatUp {
      0%   { transform: translateY(0) rotate(0deg); opacity: 0.15; }
      50%  { opacity: 0.25; }
      100% { transform: translateY(-90px) rotate(25deg); opacity: 0; }
    }

    .header-top { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; margin-bottom: 14px; }
    .event-chip { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.14); color: rgba(255,255,255,0.88); font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; padding: 5px 12px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.18); }
    .icon-btn { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 15px; transition: background 0.15s; }
    .icon-btn:hover { background: rgba(255,255,255,0.22); }
    .event-title { color: white; font-size: 28px; line-height: 1.2; position: relative; z-index: 1; }

    .budget-card {
      position: relative; z-index: 1; margin-top: 16px;
      background: rgba(255,255,255,0.11); border: 1px solid rgba(255,255,255,0.16);
      border-radius: 14px; padding: 14px 16px;
    }
    .budget-row { display: flex; justify-content: space-between; align-items: center; }
    .budget-lbl { color: rgba(255,255,255,0.65); font-size: 10px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; }
    .budget-val { color: white; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; }
    .budget-edit-icon { opacity: 0.55; font-size: 11px; }
    .bar { height: 4px; background: rgba(255,255,255,0.18); border-radius: 10px; margin: 10px 0 6px; overflow: hidden; }
    .bar-inner { height: 100%; border-radius: 10px; background: rgba(255,255,255,0.7); transition: width 0.5s ease; }
    .bar-inner.warn { background: #ffb347; }
    .budget-note { color: rgba(255,255,255,0.55); font-size: 11px; }
    .budget-inline { display: flex; gap: 6px; align-items: center; }
    .budget-input { width: 76px; padding: 4px 8px; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.35); background: rgba(255,255,255,0.14); color: white; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; outline: none; }
    .budget-save-btn { background: white; color: var(--accent); border: none; border-radius: 8px; padding: 4px 10px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; }

    .tabs-wrap { display: flex; gap: 7px; overflow-x: auto; padding: 14px 20px 2px; scrollbar-width: none; }
    .tabs-wrap::-webkit-scrollbar { display: none; }
    .tab {
      flex-shrink: 0; display: flex; align-items: center; gap: 6px;
      padding: 8px 15px; border-radius: 100px; cursor: pointer;
      font-size: 13px; font-weight: 500; white-space: nowrap;
      border: 1.5px solid var(--border); background: var(--surface);
      color: var(--text-muted); box-shadow: var(--shadow-sm);
      transition: all 0.15s ease;
    }
    .tab:hover { color: var(--text); border-color: #ccc; }
    .tab.active { background: var(--accent); color: white; border-color: var(--accent); }
    .tab.add { background: transparent; border-style: dashed; box-shadow: none; }
    .tab.add:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

    .main { padding: 20px 20px 80px; max-width: 520px; margin: 0 auto; }

    .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .list-title { font-size: 19px; }
    .list-sub { color: var(--text-muted); font-size: 12px; margin-top: 2px; }

    .card {
      background: var(--surface); border-radius: var(--radius);
      padding: 17px 18px; margin-bottom: 9px;
      border: 1px solid var(--border); box-shadow: var(--shadow-sm);
      transition: box-shadow 0.18s, transform 0.18s;
      animation: popIn 0.25s ease both;
    }
    .card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
    @keyframes popIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .card-top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
    .card-name { font-size: 14px; font-weight: 500; line-height: 1.4; }
    .card-meta { display: flex; gap: 7px; flex-wrap: wrap; align-items: center; margin-top: 5px; }
    .price { font-size: 13px; font-weight: 600; color: var(--accent); }
    .link-pill { font-size: 11px; font-weight: 600; color: var(--accent); background: var(--accent-light); padding: 2px 8px; border-radius: 6px; text-decoration: none; }
    .link-pill:hover { opacity: 0.75; }
    .anon-note { margin-top: 9px; padding: 8px 11px; background: var(--bg); border-radius: 9px; font-size: 12px; color: var(--text-muted); font-style: italic; border-left: 3px solid var(--accent-light); }

    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .badge-ok { background: #edfaf0; color: #1b7a37; border: 1px solid #c3e8cd; }
    .badge-claim { background: var(--accent-light); color: var(--accent); border: 1.5px solid transparent; cursor: pointer; transition: border-color 0.15s; }
    .badge-claim:hover { border-color: var(--accent); }
    .undo-btn { display: block; margin-top: 3px; background: none; border: none; color: var(--text-muted); font-size: 10px; cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 0; text-align: right; }
    .undo-btn:hover { color: #d9344a; }

    .summary { background: var(--surface); border-radius: var(--radius); padding: 16px 18px; border: 1px solid var(--border); margin-top: 4px; }
    .sum-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); padding: 4px 0; }
    .sum-row b { font-weight: 600; color: var(--text); }
    .sum-row.pos b { color: #1b7a37; }
    .sum-row.neg b { color: #c92a2a; }
    .sum-divider { height: 1px; background: var(--border); margin: 6px 0; }

    .empty { text-align: center; padding: 52px 20px; color: var(--text-muted); }
    .empty-icon { font-size: 42px; display: block; margin-bottom: 10px; }

    .btn { font-family: 'DM Sans', sans-serif; font-weight: 600; cursor: pointer; border: none; border-radius: 12px; transition: all 0.15s; }
    .btn-accent { background: var(--accent); color: white; padding: 10px 18px; font-size: 13px; }
    .btn-accent:hover { filter: brightness(1.08); }
    .btn-ghost { background: var(--bg); color: var(--text); padding: 10px 18px; font-size: 13px; border: 1px solid var(--border); }
    .btn-ghost:hover { background: var(--border); }
    .btn-sm { padding: 7px 14px; font-size: 12px; border-radius: 10px; }

    .overlay { position: fixed; inset: 0; background: rgba(10,10,20,0.38); backdrop-filter: blur(5px); display: flex; align-items: flex-end; justify-content: center; z-index: 300; padding: 12px; animation: fadeIn 0.18s; }
    .modal { background: var(--surface); border-radius: 22px; padding: 26px 22px; width: 100%; max-width: 460px; animation: slideUp 0.26s cubic-bezier(0.34,1.5,0.64,1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(44px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-title { font-size: 21px; margin-bottom: 3px; }
    .modal-sub { color: var(--text-muted); font-size: 13px; margin-bottom: 20px; }

    .field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 13px; }
    .field label { font-size: 10px; font-weight: 700; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }
    .field input { padding: 10px 13px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: var(--text); background: var(--bg); outline: none; transition: border-color 0.15s, background 0.15s; }
    .field input:focus { border-color: var(--accent); background: white; }

    .modal-btns { display: flex; gap: 9px; margin-top: 6px; }
    .modal-btns .btn { flex: 1; }

    .event-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 18px; }
    .event-opt { padding: 13px; border-radius: 13px; border: 2px solid var(--border); background: var(--bg); cursor: pointer; display: flex; align-items: center; gap: 9px; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
    .event-opt:hover { border-color: var(--accent); background: var(--accent-light); }
    .event-opt.sel { border-color: var(--accent); background: var(--accent-light); }
    .event-opt span:first-child { font-size: 21px; }
    .event-opt strong { font-size: 13px; font-weight: 600; color: var(--text); }

    .avatar-grid { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 6px; }
    .av { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--border); background: var(--bg); font-size: 19px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.13s; }
    .av:hover { border-color: var(--accent); }
    .av.sel { border-color: var(--accent); background: var(--accent-light); }
  `;

  return (
    <div className="app-shell">
      <style>{css}</style>

      {/* HEADER */}
      <div className="header">
        {particles.map(p => (
          <span key={p.id} className="particle" style={{ left: p.left, bottom: "18%", "--delay": p.delay, "--dur": p.duration }}>{p.symbol}</span>
        ))}
        <div className="header-top">
          <span className="event-chip">{theme.emoji} {theme.label}</span>
          <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">⚙</button>
        </div>
        <h1 className="serif event-title">{data.eventName}</h1>
        <div className="budget-card">
          <div className="budget-row">
            <span className="budget-lbl">Budget per person</span>
            {editBudget ? (
              <div className="budget-inline">
                <input className="budget-input" type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} autoFocus onKeyDown={e => e.key === "Enter" && (() => { setData(d => ({ ...d, budget: parseFloat(budgetInput) || d.budget })); setEditBudget(false); })()} />
                <button className="budget-save-btn" onClick={() => { setData(d => ({ ...d, budget: parseFloat(budgetInput) || d.budget })); setEditBudget(false); }}>Save</button>
              </div>
            ) : (
              <span className="budget-val" onClick={() => setEditBudget(true)}>${data.budget} <span className="budget-edit-icon">✎</span></span>
            )}
          </div>
          <div className="bar"><div className={`bar-inner${budgetPct > 90 ? " warn" : ""}`} style={{ width: `${budgetPct}%` }} /></div>
          <div className="budget-note">${totalSpent} claimed for {currentMember?.name} · ${Math.max(0, data.budget - totalSpent)} remaining</div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-wrap">
        {data.members.map(m => (
          <button key={m.id} className={`tab${activeMember === m.id ? " active" : ""}`} onClick={() => setActiveMember(m.id)}>
            {m.avatar} {m.name}
          </button>
        ))}
        <button className="tab add" onClick={() => setShowAddMember(true)}>+ Add</button>
      </div>

      {/* LIST */}
      <div className="main">
        <div className="list-header">
          <div>
            <div className="serif list-title">{currentMember?.avatar} {currentMember?.name}'s Wishes</div>
            <div className="list-sub">{currentMember?.wishes.length} items · {currentMember?.wishes.filter(w => w.claimedBy).length} claimed</div>
          </div>
          <button className="btn btn-accent btn-sm" onClick={() => setShowAddWish(true)}>+ Add wish</button>
        </div>

        {currentMember?.wishes.length === 0 && (
          <div className="empty">
            <span className="empty-icon">🎁</span>
            <p className="serif" style={{ fontSize: "19px", marginBottom: "5px" }}>No wishes yet</p>
            <p style={{ fontSize: "13px" }}>Add the first item to get started</p>
          </div>
        )}

        {currentMember?.wishes.map((wish, i) => (
          <div key={wish.id} className="card" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="card-top">
              <div style={{ flex: 1 }}>
                <div className="card-name">{wish.item}</div>
                <div className="card-meta">
                  {wish.price > 0 && <span className="price">${wish.price}</span>}
                  {wish.link && <a href={wish.link} target="_blank" rel="noopener noreferrer" className="link-pill">🔗 View</a>}
                </div>
                {wish.claimedBy && wish.note && <div className="anon-note">💬 "{wish.note}"</div>}
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                {wish.claimedBy ? (
                  <>
                    <span className="badge badge-ok">✓ {wish.anonymous ? "Claimed" : `by ${wish.claimedBy}`}</span>
                    <button className="undo-btn" onClick={() => unclaimGift(wish.id)}>undo</button>
                  </>
                ) : (
                  <span className="badge badge-claim" onClick={() => setShowClaim(wish.id)}>🎁 Claim</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {currentMember?.wishes.length > 0 && (
          <div className="summary">
            <div className="sum-row"><span>Total list value</span><b>${currentMember.wishes.reduce((s, w) => s + (w.price || 0), 0)}</b></div>
            <div className="sum-divider" />
            <div className="sum-row pos"><span>Claimed so far</span><b>${totalSpent}</b></div>
            <div className={`sum-row${data.budget - totalSpent < 0 ? " neg" : " pos"}`}><span>Budget remaining</span><b>${data.budget - totalSpent}</b></div>
          </div>
        )}
      </div>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="serif modal-title">Event Settings</div>
            <div className="modal-sub">Choose your event type and name</div>
            <div className="event-grid">
              {Object.entries(EVENT_THEMES).map(([key, t]) => (
                <button key={key} className={`event-opt${data.eventType === key ? " sel" : ""}`} onClick={() => changeEventType(key)}>
                  <span>{t.emoji}</span><strong>{t.label}</strong>
                </button>
              ))}
            </div>
            <div className="field">
              <label>Event Name</label>
              <input value={data.eventName} onChange={e => setData(d => ({ ...d, eventName: e.target.value }))} placeholder="e.g. Sarah's 30th" />
            </div>
            <div className="modal-btns">
              <button className="btn btn-accent" onClick={() => setShowSettings(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD WISH MODAL */}
      {showAddWish && (
        <div className="overlay" onClick={() => setShowAddWish(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="serif modal-title">Add a Wish ✨</div>
            <div className="modal-sub">Adding to {currentMember?.name}'s list</div>
            <div className="field"><label>Gift idea *</label><input placeholder="e.g. Cozy slippers" value={newWish.item} onChange={e => setNewWish({ ...newWish, item: e.target.value })} autoFocus /></div>
            <div className="field"><label>Link (optional)</label><input placeholder="https://..." value={newWish.link} onChange={e => setNewWish({ ...newWish, link: e.target.value })} /></div>
            <div className="field"><label>Price</label><input type="number" placeholder="$0" value={newWish.price} onChange={e => setNewWish({ ...newWish, price: e.target.value })} /></div>
            <div className="modal-btns">
              <button className="btn btn-ghost" onClick={() => setShowAddWish(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={addWish}>Add wish 🎁</button>
            </div>
          </div>
        </div>
      )}

      {/* CLAIM MODAL */}
      {showClaim && (
        <div className="overlay" onClick={() => setShowClaim(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="serif modal-title">Claim this gift 🤫</div>
            <div className="modal-sub">Your name stays hidden from {currentMember?.name}!</div>
            <div className="field"><label>Your name</label><input placeholder="e.g. Sarah" value={claimerName} onChange={e => setClaimerName(e.target.value)} autoFocus /></div>
            <div className="field"><label>Anonymous note (optional)</label><input placeholder="e.g. Splitting with Mom!" value={claimNote} onChange={e => setClaimNote(e.target.value)} /></div>
            <div className="modal-btns">
              <button className="btn btn-ghost" onClick={() => setShowClaim(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={() => claimGift(showClaim)}>Claim it 🎁</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {showAddMember && (
        <div className="overlay" onClick={() => setShowAddMember(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="serif modal-title">Add a person</div>
            <div className="modal-sub">They'll get their own wishlist</div>
            <div className="field"><label>Name</label><input placeholder="e.g. Grandma" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} autoFocus /></div>
            <div className="field">
              <label>Pick an emoji</label>
              <div className="avatar-grid">
                {AVATARS.map(a => <button key={a} className={`av${newMember.avatar === a ? " sel" : ""}`} onClick={() => setNewMember({ ...newMember, avatar: a })}>{a}</button>)}
              </div>
            </div>
            <div className="modal-btns">
              <button className="btn btn-ghost" onClick={() => setShowAddMember(false)}>Cancel</button>
              <button className="btn btn-accent" onClick={addMember}>Add person</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}