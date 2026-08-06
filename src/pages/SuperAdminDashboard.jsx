import React, { useState, useEffect } from 'react';
import { createAdmin, updateAdmin, disableAdmin, subscribeAdmins } from '../services/admin/adminService.js';
import { endEvent, subscribeEventStatus } from '../services/event/eventService.js';
import { startEventForAllTeams } from "../services/event/eventStart";
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [eventStatus, setEventStatus] = useState("loading...");

  // Add Admin State
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("stall_admin");
  const [newAdminStall, setNewAdminStall] = useState("1");

  // Edit Admin State
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("stall_admin");
  const [editStall, setEditStall] = useState("1");

  useEffect(() => {
    // 1. LIVE Listen to Admins using service subscription helper
    const unsubscribeAdmins = subscribeAdmins((adminsList) => {
      setAdmins(adminsList);
    });

    // 2. LIVE Listen to Global Event Status using service subscription helper
    const unsubscribeEvent = subscribeEventStatus((statusData) => {
      setEventStatus(statusData?.status || "offline");
    });

    return () => {
      unsubscribeAdmins();
      unsubscribeEvent();
    };
  }, []);

  // --- EVENT CONTROLS ---
  const handleStartEvent = async () => {
    try {
      await startEventForAllTeams();
    } catch (err) {
      console.error(err);
      alert("Failed to start event: " + err.message);
    }
  };

  const handleEndEvent = async () => {
    const isConfirmed = window.confirm(`CRITICAL WARNING: Are you sure you want to END the event?`);
    if (!isConfirmed) return;
    try {
      await endEvent();
    } catch (err) {
      console.error(err);
      alert("Failed to end event: " + err.message);
    }
  };

  // --- ADMIN MANAGEMENT ---
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) return;
    if (newAdminRole === "stall_admin" && !newAdminStall) return;

    const res = await createAdmin({
      name: newAdminName,
      email: newAdminEmail,
      role: newAdminRole,
      stallAssigned: newAdminRole === "Super Admin" ? "All" : newAdminStall
    });

    if (res.success) {
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminStall("1");
      setNewAdminRole("stall_admin");
    } else {
      alert(res.message);
    }
  };

  const handleDisableAdmin = async (email, adminName) => {
    const isConfirmed = window.confirm(`Remove access for ${adminName}?`);
    if (!isConfirmed) return;
    
    const res = await disableAdmin(email);
    if (!res.success) {
      alert(res.message);
    }
  };

  // --- EDIT ADMIN LOGIC ---
  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setEditName(admin.name);
    setEditEmail(admin.email || admin.id);
    setEditRole(admin.role || "stall_admin");
    
    // Parse stall number or string
    let parsedStall = "1";
    if (admin.stallAssigned) {
      const match = String(admin.stallAssigned).match(/STALL0?([1-7])/);
      if (match) {
        parsedStall = match[1];
      }
    }
    setEditStall(parsedStall);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;

    const res = await updateAdmin(editingAdmin.email, {
      name: editName,
      role: editRole,
      stallAssigned: (editRole === "Super Admin" || editRole === "stall_admin") ? "All" : editStall
    });
    
    if (res.success) {
      setEditingAdmin(null);
    } else {
      alert(res.message);
    }
  };

  // Helper to format stall name in UI
  const formatStall = (stallVal) => {
    if (!stallVal) return "None";
    if (stallVal === "All") return "Full System Access";
    const match = String(stallVal).match(/STALL0?([1-7])/i);
    if (match) return `Mission ${Number(match[1])}`;
    return stallVal;
  };

  // Sort admins so Super Admins always appear at the top of the list
  const sortedAdmins = [...admins].sort((a, b) => {
    if (a.role === "Super Admin" && b.role !== "Super Admin") return -1;
    if (a.role !== "Super Admin" && b.role === "Super Admin") return 1;
    return 0;
  });

  return (
    <div className="super-admin-container">
      <h1 className="tedx-header">TEDxpedition Master Control</h1>
      
      <div className="dashboard-grid">
        
        {/* EVENT CONTROL PANEL */}
        <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
          <h2 className="card-title">
            Event Status: <span style={{ textTransform: 'uppercase', color: '#e62b1e' }}>{eventStatus}</span>
          </h2>
          <div className="event-controls">
            {eventStatus === "loading..." && <span>Loading event status...</span>}
            {eventStatus === "offline" && <span>Event system offline</span>}
            {eventStatus === "READY" && (
              <button className="btn btn-start" onClick={handleStartEvent}>Start Event</button>
            )}
            {eventStatus === "RUNNING" && (
              <button className="btn btn-end" onClick={handleEndEvent}>End Event</button>
            )}
            {eventStatus === "ENDED" && (
              <span style={{ fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>
                Event has Concluded
              </span>
            )}
          </div>
        </div>

        {/* ADMIN MANAGEMENT */}
        <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
          <h2 className="card-title">
            System Administrators 
            <span style={{ float: 'right', color: '#888', fontSize: '1rem' }}>
              Total Users: {admins.length}
            </span>
          </h2>
          
          <form className="admin-form" onSubmit={handleAddAdmin}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ccc' }}>Name *</label>
                <input 
                  type="text" 
                  className="tedx-input" 
                  placeholder="Admin Name" 
                  value={newAdminName} 
                  onChange={(e) => setNewAdminName(e.target.value)} 
                  required 
                />
              </div>
              
              <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ccc' }}>IITGN Email *</label>
                <input 
                  type="email" 
                  className="tedx-input" 
                  placeholder="example@iitgn.ac.in" 
                  value={newAdminEmail} 
                  onChange={(e) => setNewAdminEmail(e.target.value)} 
                  required 
                />
              </div>
              
              <div style={{ width: '160px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ccc' }}>Role *</label>
                <select 
                  className="tedx-input" 
                  value={newAdminRole} 
                  onChange={(e) => setNewAdminRole(e.target.value)}
                >
                  <option value="stall_admin">Stall Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              {newAdminRole === "stall_admin" && (
                <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ccc' }}>Mission *</label>
                  <input 
                    type="number" 
                    className="tedx-input" 
                    placeholder="1-7" 
                    value={newAdminStall} 
                    onChange={(e) => setNewAdminStall(e.target.value)} 
                    min="1" 
                    max="7" 
                    required 
                  />
                </div>
              )}
              
              <button type="submit" className="btn btn-submit" style={{ height: '46px' }}>Add User</button>
            </div>
          </form>

          <ul className="data-list" style={{ marginTop: '20px' }}>
            {sortedAdmins.map(admin => (
              <li key={admin.id} className="data-item">
                <div>
                  <strong>{admin.name}</strong> 
                  <span className={(admin.role === "Super Admin" || admin.role === "stall_admin") ? "role-badge super" : "role-badge stall"}>
                   {( admin.role === "Super Admin"|| admin.role === "stall_admin") ? "Super Admin" : "Stall Admin"}
                  </span>
                  <span className={`status-badge ${admin.active ? 'active' : 'inactive'}`}>
                    {admin.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  <br/>
                  <small style={{ color: '#888', display: 'block', margin: '4px 0' }}>
                    {admin.email}
                  </small>
                  <small style={{ color: '#ccc' }}>
                    {admin.role === "Super Admin" ? "Full System Access" : formatStall(admin.stallAssigned)}
                  </small>
                </div>
                <div>
                  <button className="btn-edit" onClick={() => openEditModal(admin)}>Edit</button>
                  {admin.active && (
                    <button className="btn-delete" style={{ marginLeft: '10px' }} onClick={() => handleDisableAdmin(admin.email || admin.id, admin.name)}>Remove</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* EDIT ADMIN MODAL */}
      {editingAdmin && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="card-title">Edit User</h2>
            <form className="admin-form" onSubmit={handleUpdateAdmin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ccc' }}>Name *</label>
                  <input type="text" className="tedx-input" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ccc' }}>IITGN Email (Read-Only)</label>
                  <input type="email" className="tedx-input" value={editEmail} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ccc' }}>Role *</label>
                  <select className="tedx-input" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                    <option value="stall_admin">Stall Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                
                {editRole === "stall_admin" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ccc' }}>Mission *</label>
                    <input type="number" className="tedx-input" value={editStall} onChange={(e) => setEditStall(e.target.value)} min="1" max="7" required />
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-submit">Save Changes</button>
                <button type="button" className="btn btn-cancel" onClick={() => setEditingAdmin(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;