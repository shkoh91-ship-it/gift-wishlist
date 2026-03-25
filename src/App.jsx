import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const AVATARS = ["🎁","🧸","🌿","☕","🕯️","📖","🧣","🧤","🌸","🍂","✨","🪴","🍪","🎀","💛","🌙","🦋","🍋","🐚","🪵"];

export default function GiftWishlist() {
  const [event, setEvent] = useState(null);
  const [members, setMembers] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [activeMember, setActiveMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAddWish, setShowAddWish] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showClaim, setShowClaim] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditMember, setShowEditMember] = useState(null); // holds member object being edited

  const [newWish, setNewWish] = useState({ item: "", link: "", price: "" });
  const [newMember, setNewMember] = useState({ name: "", avatar: "🎁" });
  const [editMemberData, setEditMemberData] = useState({ name: "", avatar: "🎁" });
  const [claimNote, setClaimNote] = useState("");
  const [claimerName, setClaimerName] = useState("");
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(50);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentMember = members.find(m => m.id === activeMember);
  const currentWishes = wishes.filter(w => w.member_id === activeMember);
  const totalSpent = currentWishes.filter(w => w.claimed_by).reduce((s, w) => s + (w.price || 0), 0);
  const budget = event?.budget || 50;
  const budgetPct = Math.min((totalSpent / budget) * 100, 100);
  const overBudget = totalSpent > budget;

  useEffect(() => {
    async function init() {
      let { data: events } = await supabase.from("events").select("*").limit(1);
      if (events && events.length > 0) {
        setEvent(events[0]);
        setBudgetInput(events[0].budget);
        setNameInput(events[0].name);
        await loadMembers(events[0].id);
      } else {
        const { data: newEvent } = await supabase.from("events")
          .insert({ name: "Gift List", event_type: "general", budget: 50 })
          .select().single();
        setEvent(newEvent);
        setBudgetInput(50);
        setNameInput("Gift List");
      }
      setLoading(false);
    }
    init();
  }, []);

  async function loadMembers(eventId) {
    const { data } = await supabase.from("members").select("*").eq("event_id", eventId).order("created_at");
    setMembers(data || []);
    if (data && data.length > 0) {
      setActiveMember(data[0].id);
      await loadWishes(data.map(m => m.id));
    }
  }

  async function loadWishes(memberIds) {
    if (!memberIds.length) return;
    const { data } = await supabase.from("wishes").select("*").in("member_id", memberIds).order("created_at");
    setWishes(data || []);
  }

  async function addMember() {
    if (!newMember.name.trim() || !event) return;
    const { data } = await supabase.from("members")
      .insert({ event_id: event.id, name: newMember.name, avatar: newMember.avatar })
      .select().single();
    setMembers(m => [...m, data]);
    setActiveMember(data.id);
    setNewMember({ name: "", avatar: "🎁" });
    setShowAddMember(false);
  }

  async function saveMemberEdit() {
    if (!editMemberData.name.trim()) return;
    const { data } = await supabase.from("members")
      .update({ name: editMemberData.name, avatar: editMemberData.avatar })
      .eq("id", showEditMember.id).select().single();
    setMembers(m => m.map(x => x.id === data.id ? data : x));
    setShowEditMember(null);
    setShowDeleteConfirm(false);
  }

  async function deleteMember() {
    const id = showEditMember.id;
    await supabase.from("wishes").delete().eq("member_id", id);
    await supabase.from("members").delete().eq("id", id);
    const remaining = members.filter(m => m.id !== id);
    setMembers(remaining);
    setWishes(w => w.filter(x => x.member_id !== id));
    setActiveMember(remaining.length > 0 ? remaining[0].id : null);
    setShowEditMember(null);
    setShowDeleteConfirm(false);
  }

  async function addWish() {
    if (!newWish.item.trim() || !activeMember) return;
    const { data } = await supabase.from("wishes")
      .insert({ member_id: activeMember, item: newWish.item, link: newWish.link, price: parseFloat(newWish.price) || 0 })
      .select().single();
    setWishes(w => [...w, data]);
    setNewWish({ item: "", link: "", price: "" });
    setShowAddWish(false);
  }

  async function claimGift(wishId) {
    if (!claimerName.trim()) return;
    const { data } = await supabase.from("wishes")
      .update({ claimed_by: claimerName, note: claimNote, anonymous: true })
      .eq("id", wishId).select().single();
    setWishes(w => w.map(x => x.id === wishId ? data : x));
    setShowClaim(null); setClaimNote(""); setClaimerName("");
  }

  async function unclaimGift(wishId) {
    const { data } = await supabase.from("wishes")
      .update({ claimed_by: null, note: null, anonymous: false })
      .eq("id", wishId).select().single();
    setWishes(w => w.map(x => x.id === wishId ? data : x));
  }

  async function saveBudget() {
    const { data } = await supabase.from("events")
      .update({ budget: parseFloat(budgetInput) || budget })
      .eq("id", event.id).select().single();
    setEvent(data);
    setEditBudget(false);
  }

  async function saveListName() {
    if (!nameInput.trim()) return;
    const { data } = await supabase.from("events")
      .update({ name: nameInput })
      .eq("id", event.id).select().single();
    setEvent(data);
    setEditingName(false);
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --cream: #f5f0e8;
      --cream-dark: #ede6d8;
      --parchment: #e8dece;
      --walnut: #3d2b1f;
      --walnut-mid: #6b4c38;
      --walnut-light: #9c7a62;
      --caramel: #c49a6c;
      --caramel-light: #f0e4d0;
      --sage: #7a8c6e;
      --sage-light: #edf0e8;
      --surface: #fdfaf5;
      --border: #e0d5c4;
      --text: #2c1f14;
      --text-mid: #6b4c38;
      --text-muted: #a08878;
      --radius: 18px;
      --shadow-sm: 0 1px 4px rgba(61,43,31,0.06), 0 2px 12px rgba(61,43,31,0.05);
      --shadow-md: 0 4px 16px rgba(61,43,31,0.1), 0 8px 32px rgba(61,43,31,0.08);
    }
    body { font-family: 'Jost', sans-serif; background: var(--cream); color: var(--text); -webkit-font-smoothing: antialiased; min-height: 100vh; }
    .serif { font-family: 'Cormorant Garamond', serif; }

    .header { background: var(--walnut); padding: 32px 24px 56px; position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 80% 0%, rgba(196,154,108,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 100%, rgba(196,154,108,0.12) 0%, transparent 50%); }
    .header::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 40px; background: var(--cream); border-radius: 40px 40px 0 0; }
    .header-inner { position: relative; z-index: 1; }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .wordmark { color: var(--caramel); font-family: 'Cormorant Garamond', serif; font-size: 13px; font-style: italic; letter-spacing: 1px; opacity: 0.9; }
    .icon-btn { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); color: rgba(255,255,255,0.75); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 15px; transition: all 0.15s; }
    .icon-btn:hover { background: rgba(255,255,255,0.15); color: white; }
    .list-name-wrap { margin-bottom: 6px; }
    .list-name { color: white; font-size: 34px; line-height: 1.15; font-style: italic; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
    .list-name:hover .edit-hint { opacity: 1; }
    .edit-hint { opacity: 0; font-size: 13px; color: rgba(255,255,255,0.4); transition: opacity 0.15s; }
    .list-name-input { background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.3); color: white; font-family: 'Cormorant Garamond', serif; font-size: 30px; font-style: italic; border-radius: 10px; padding: 4px 12px; outline: none; width: 100%; }
    .list-subtitle { color: rgba(255,255,255,0.45); font-size: 12px; letter-spacing: 0.5px; margin-top: 4px; }
    .budget-strip { margin-top: 20px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 14px 16px; }
    .budget-row { display: flex; justify-content: space-between; align-items: center; }
    .budget-lbl { color: rgba(255,255,255,0.5); font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; }
    .budget-val { color: white; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px; }
    .budget-val:hover { color: var(--caramel); }
    .bar { height: 3px; background: rgba(255,255,255,0.15); border-radius: 10px; margin: 10px 0 6px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 10px; background: var(--caramel); transition: width 0.5s ease; }
    .bar-fill.warn { background: #e07b50; }
    .budget-meta { color: rgba(255,255,255,0.4); font-size: 11px; }
    .budget-inline { display: flex; gap: 6px; align-items: center; }
    .budget-input-el { width: 76px; padding: 4px 8px; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.1); color: white; font-family: 'Jost', sans-serif; font-size: 14px; outline: none; }
    .budget-save { background: var(--caramel); color: var(--walnut); border: none; border-radius: 8px; padding: 4px 12px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Jost', sans-serif; }

    /* TABS */
    .tabs { display: flex; gap: 8px; overflow-x: auto; padding: 16px 20px 4px; scrollbar-width: none; }
    .tabs::-webkit-scrollbar { display: none; }
    .tab-wrap { position: relative; flex-shrink: 0; }
    .tab { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 500; white-space: nowrap; cursor: pointer; border: 1.5px solid var(--border); background: var(--surface); color: var(--text-muted); box-shadow: var(--shadow-sm); transition: all 0.15s; }
    .tab:hover { border-color: var(--caramel); color: var(--walnut-mid); }
    .tab.active { background: var(--walnut); color: white; border-color: var(--walnut); }
    .tab-edit-btn { position: absolute; top: -5px; right: -5px; width: 18px; height: 18px; border-radius: 50%; background: var(--caramel); border: 1.5px solid white; color: white; font-size: 9px; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity 0.15s; line-height: 1; }
    .tab-wrap:hover .tab-edit-btn { opacity: 1; }
    .tab.add { background: transparent; border-style: dashed; border-color: var(--parchment); box-shadow: none; color: var(--text-muted); flex-shrink: 0; }
    .tab.add:hover { border-color: var(--caramel); color: var(--caramel); background: var(--caramel-light); }

    .main { padding: 20px 20px 100px; max-width: 520px; margin: 0 auto; }
    .section-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-title { font-size: 22px; font-style: italic; font-weight: 500; color: var(--walnut); }
    .section-sub { color: var(--text-muted); font-size: 12px; margin-top: 2px; font-family: 'Jost', sans-serif; }

    .card { background: var(--surface); border-radius: var(--radius); padding: 16px 18px; margin-bottom: 10px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: all 0.18s; animation: rise 0.28s ease both; }
    .card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); border-color: var(--parchment); }
    @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .card-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; }
    .card-name { font-size: 14px; font-weight: 500; color: var(--text); line-height: 1.45; }
    .card-meta { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; margin-top: 5px; }
    .price-tag { font-size: 13px; font-weight: 600; color: var(--caramel); }
    .link-tag { font-size: 11px; font-weight: 500; color: var(--walnut-mid); background: var(--caramel-light); padding: 2px 8px; border-radius: 6px; text-decoration: none; transition: opacity 0.15s; }
    .link-tag:hover { opacity: 0.7; }
    .anon-note { margin-top: 10px; padding: 8px 12px; background: var(--cream-dark); border-radius: 10px; font-size: 12px; color: var(--text-muted); font-style: italic; border-left: 2px solid var(--caramel); }

    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 11px; border-radius: 100px; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .badge-claimed { background: var(--sage-light); color: var(--sage); border: 1px solid #c8d4c0; }
    .badge-unclaim { display: block; margin-top: 4px; background: none; border: none; color: var(--text-muted); font-size: 10px; cursor: pointer; font-family: 'Jost', sans-serif; padding: 0; text-align: right; }
    .badge-unclaim:hover { color: #b05040; }
    .badge-claim { background: var(--caramel-light); color: var(--walnut-mid); border: 1.5px solid transparent; cursor: pointer; transition: all 0.15s; }
    .badge-claim:hover { border-color: var(--caramel); background: #e8d4b8; }

    .summary { background: var(--cream-dark); border-radius: var(--radius); padding: 16px 18px; border: 1px solid var(--border); margin-top: 6px; }
    .sum-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); padding: 4px 0; }
    .sum-row span:last-child { font-weight: 600; color: var(--text-mid); }
    .sum-row.pos span:last-child { color: var(--sage); }
    .sum-row.neg span:last-child { color: #b05040; }
    .sum-divider { height: 1px; background: var(--border); margin: 6px 0; }

    .empty { text-align: center; padding: 52px 24px; color: var(--text-muted); }
    .empty-icon { font-size: 40px; display: block; margin-bottom: 12px; }

    .btn { font-family: 'Jost', sans-serif; font-weight: 500; cursor: pointer; border: none; border-radius: 12px; transition: all 0.15s; }
    .btn-primary { background: var(--walnut); color: white; padding: 11px 20px; font-size: 13px; }
    .btn-primary:hover { background: var(--walnut-mid); }
    .btn-ghost { background: var(--cream-dark); color: var(--text); padding: 11px 20px; font-size: 13px; border: 1px solid var(--border); }
    .btn-ghost:hover { background: var(--parchment); }
    .btn-danger { background: #fdf0ee; color: #b05040; padding: 11px 20px; font-size: 13px; border: 1.5px solid #f0c8c0; }
    .btn-danger:hover { background: #f8e0dc; }
    .btn-sm { padding: 7px 15px; font-size: 12px; border-radius: 10px; }

    .overlay { position: fixed; inset: 0; background: rgba(44,31,20,0.45); backdrop-filter: blur(6px); display: flex; align-items: flex-end; justify-content: center; z-index: 300; padding: 12px; animation: fadeIn 0.2s; }
    .modal { background: var(--surface); border-radius: 24px; padding: 28px 24px; width: 100%; max-width: 460px; animation: slideUp 0.28s cubic-bezier(0.34,1.5,0.64,1); border: 1px solid var(--border); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(48px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-title { font-size: 24px; font-style: italic; color: var(--walnut); margin-bottom: 4px; }
    .modal-sub { color: var(--text-muted); font-size: 13px; margin-bottom: 22px; }
    .field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
    .field label { font-size: 10px; font-weight: 600; color: var(--text-muted); letter-spacing: 1.2px; text-transform: uppercase; }
    .field input { padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 11px; font-size: 14px; font-family: 'Jost', sans-serif; color: var(--text); background: var(--cream); outline: none; transition: all 0.15s; }
    .field input:focus { border-color: var(--caramel); background: white; box-shadow: 0 0 0 3px rgba(196,154,108,0.12); }
    .modal-btns { display: flex; gap: 10px; margin-top: 8px; }
    .modal-btns .btn { flex: 1; }
    .modal-divider { height: 1px; background: var(--border); margin: 20px 0 16px; }

    .av-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
    .av { width: 42px; height: 42px; border-radius: 50%; border: 2px solid var(--border); background: var(--cream); font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.13s; }
    .av:hover { border-color: var(--caramel); transform: scale(1.05); }
    .av.sel { border-color: var(--walnut); background: var(--caramel-light); }

    .delete-zone { background: #fdf0ee; border-radius: 14px; padding: 16px; border: 1px solid #f0c8c0; }
    .delete-zone p { font-size: 13px; color: #8a4030; margin-bottom: 12px; line-height: 1.5; }
  `;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f5f0e8", flexDirection: "column", gap: 12 }}>
      <span style={{ fontSize: 36 }}>🕯️</span>
      <p style={{ fontFamily: "'Jost', sans-serif", color: "#9c7a62", fontSize: 13, letterSpacing: 1 }}>Loading your list...</p>
    </div>
  );

  return (
    <div>
      <style>{css}</style>

      {/* HEADER */}
      <div className="header">
        <div className="header-inner">
          <div className="header-top">
            <span className="wordmark">giftlist</span>
            <button className="icon-btn" onClick={() => setShowSettings(true)}>⚙</button>
          </div>
          <div className="list-name-wrap">
            {editingName ? (
              <input className="list-name-input" value={nameInput} onChange={e => setNameInput(e.target.value)} onBlur={saveListName} onKeyDown={e => e.key === "Enter" && saveListName()} autoFocus />
            ) : (
              <div className="list-name serif" onClick={() => setEditingName(true)}>
                {event?.name}<span className="edit-hint">✎</span>
              </div>
            )}
            <div className="list-subtitle">{members.length} people · {wishes.length} wishes total</div>
          </div>
          <div className="budget-strip">
            <div className="budget-row">
              <span className="budget-lbl">Budget per person</span>
              {editBudget ? (
                <div className="budget-inline">
                  <input className="budget-input-el" type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} autoFocus onKeyDown={e => e.key === "Enter" && saveBudget()} />
                  <button className="budget-save" onClick={saveBudget}>Save</button>
                </div>
              ) : (
                <span className="budget-val" onClick={() => setEditBudget(true)}>${budget} <span style={{ opacity: 0.5, fontSize: 11 }}>✎</span></span>
              )}
            </div>
            <div className="bar"><div className={`bar-fill${overBudget ? " warn" : ""}`} style={{ width: `${budgetPct}%` }} /></div>
            <div className="budget-meta">${totalSpent} claimed for {currentMember?.name || "—"} · ${Math.max(0, budget - totalSpent)} remaining</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        {members.map(m => (
          <div key={m.id} className="tab-wrap">
            <button className={`tab${activeMember === m.id ? " active" : ""}`} onClick={() => setActiveMember(m.id)}>
              {m.avatar} {m.name}
            </button>
            <button className="tab-edit-btn" onClick={() => { setShowEditMember(m); setEditMemberData({ name: m.name, avatar: m.avatar }); setShowDeleteConfirm(false); }} title="Edit">✎</button>
          </div>
        ))}
        <button className="tab add" onClick={() => setShowAddMember(true)}>+ Add person</button>
      </div>

      {/* WISH LIST */}
      <div className="main">
        {!currentMember ? (
          <div className="empty">
            <span className="empty-icon">🌿</span>
            <p className="serif" style={{ fontSize: "22px", color: "#3d2b1f", marginBottom: 6 }}>Add your first person</p>
            <p style={{ fontSize: "13px" }}>Tap "+ Add person" above to get started</p>
          </div>
        ) : (
          <>
            <div className="section-hd">
              <div>
                <div className="serif section-title">{currentMember.avatar} {currentMember.name}'s Wishes</div>
                <div className="section-sub">{currentWishes.length} items · {currentWishes.filter(w => w.claimed_by).length} claimed</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddWish(true)}>+ Add wish</button>
            </div>

            {currentWishes.length === 0 && (
              <div className="empty">
                <span className="empty-icon">🎁</span>
                <p className="serif" style={{ fontSize: "20px", color: "#3d2b1f", marginBottom: 6 }}>No wishes yet</p>
                <p style={{ fontSize: "13px" }}>Add the first item to get started</p>
              </div>
            )}

            {currentWishes.map((wish, i) => (
              <div key={wish.id} className="card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="card-row">
                  <div style={{ flex: 1 }}>
                    <div className="card-name">{wish.item}</div>
                    <div className="card-meta">
                      {wish.price > 0 && <span className="price-tag">${wish.price}</span>}
                      {wish.link && <a href={wish.link} target="_blank" rel="noopener noreferrer" className="link-tag">🔗 View item</a>}
                    </div>
                    {wish.claimed_by && wish.note && <div className="anon-note">💬 "{wish.note}"</div>}
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    {wish.claimed_by ? (
                      <>
                        <span className="badge badge-claimed">✓ {wish.anonymous ? "Claimed" : `by ${wish.claimed_by}`}</span>
                        <button className="badge-unclaim" onClick={() => unclaimGift(wish.id)}>undo</button>
                      </>
                    ) : (
                      <span className="badge badge-claim" onClick={() => setShowClaim(wish.id)}>🎁 Claim</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {currentWishes.length > 0 && (
              <div className="summary">
                <div className="sum-row"><span>Total list value</span><span>${currentWishes.reduce((s, w) => s + (w.price || 0), 0)}</span></div>
                <div className="sum-divider" />
                <div className="sum-row pos"><span>Claimed so far</span><span>${totalSpent}</span></div>
                <div className={`sum-row${budget - totalSpent < 0 ? " neg" : " pos"}`}>
                  <span>Budget remaining</span><span>${budget - totalSpent}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* EDIT MEMBER MODAL */}
      {showEditMember && (
        <div className="overlay" onClick={() => { setShowEditMember(null); setShowDeleteConfirm(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="serif modal-title">Edit Person</div>
            <div className="modal-sub">Update {showEditMember.name}'s name or icon</div>
            <div className="field">
              <label>Name</label>
              <input value={editMemberData.name} onChange={e => setEditMemberData(d => ({ ...d, name: e.target.value }))} autoFocus />
            </div>
            <div className="field">
              <label>Icon</label>
              <div className="av-grid">
                {AVATARS.map(a => (
                  <button key={a} className={`av${editMemberData.avatar === a ? " sel" : ""}`} onClick={() => setEditMemberData(d => ({ ...d, avatar: a }))}>{a}</button>
                ))}
              </div>
            </div>
            <div className="modal-btns" style={{ marginBottom: 0 }}>
              <button className="btn btn-ghost" onClick={() => { setShowEditMember(null); setShowDeleteConfirm(false); }}>Cancel</button>
              <button className="btn btn-primary" onClick={saveMemberEdit}>Save changes</button>
            </div>

            <div className="modal-divider" />

            {!showDeleteConfirm ? (
              <button className="btn btn-danger" style={{ width: "100%" }} onClick={() => setShowDeleteConfirm(true)}>
                Remove {showEditMember.name} from list
              </button>
            ) : (
              <div className="delete-zone">
                <p>This will permanently delete <strong>{showEditMember.name}</strong> and all their wishes. This cannot be undone.</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>Keep them</button>
                  <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={deleteMember}>Yes, delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="serif modal-title">List Settings</div>
            <div className="modal-sub">Rename your list or update the budget</div>
            <div className="field"><label>List Name</label><input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="e.g. Christmas 2025" /></div>
            <div className="field"><label>Budget per person ($)</label><input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} placeholder="50" /></div>
            <div className="modal-btns">
              <button className="btn btn-ghost" onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={async () => { await saveListName(); await saveBudget(); setShowSettings(false); }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD WISH MODAL */}
      {showAddWish && (
        <div className="overlay" onClick={() => setShowAddWish(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="serif modal-title">Add a Wish</div>
            <div className="modal-sub">Adding to {currentMember?.name}'s list</div>
            <div className="field"><label>Gift idea *</label><input placeholder="e.g. Linen throw blanket" value={newWish.item} onChange={e => setNewWish({ ...newWish, item: e.target.value })} autoFocus /></div>
            <div className="field"><label>Link (optional)</label><input placeholder="https://..." value={newWish.link} onChange={e => setNewWish({ ...newWish, link: e.target.value })} /></div>
            <div className="field"><label>Price</label><input type="number" placeholder="$0" value={newWish.price} onChange={e => setNewWish({ ...newWish, price: e.target.value })} /></div>
            <div className="modal-btns">
              <button className="btn btn-ghost" onClick={() => setShowAddWish(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addWish}>Add wish</button>
            </div>
          </div>
        </div>
      )}

      {/* CLAIM MODAL */}
      {showClaim && (
        <div className="overlay" onClick={() => setShowClaim(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="serif modal-title">Claim this gift 🤫</div>
            <div className="modal-sub">Your name stays hidden from {currentMember?.name}</div>
            <div className="field"><label>Your name</label><input placeholder="e.g. Sarah" value={claimerName} onChange={e => setClaimerName(e.target.value)} autoFocus /></div>
            <div className="field"><label>Anonymous note (optional)</label><input placeholder="e.g. Splitting with Mom!" value={claimNote} onChange={e => setClaimNote(e.target.value)} /></div>
            <div className="modal-btns">
              <button className="btn btn-ghost" onClick={() => setShowClaim(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => claimGift(showClaim)}>Claim it</button>
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
            <div className="field"><label>Name</label><input placeholder="e.g. Mom" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} autoFocus /></div>
            <div className="field">
              <label>Pick an emoji</label>
              <div className="av-grid">
                {AVATARS.map(a => <button key={a} className={`av${newMember.avatar === a ? " sel" : ""}`} onClick={() => setNewMember({ ...newMember, avatar: a })}>{a}</button>)}
              </div>
            </div>
            <div className="modal-btns">
              <button className="btn btn-ghost" onClick={() => setShowAddMember(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addMember}>Add person</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}