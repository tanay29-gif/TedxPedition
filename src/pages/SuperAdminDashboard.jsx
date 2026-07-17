import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js'; 
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [eventStatus, setEventStatus] = useState("loading...");

  // Add Admin State
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("Stall Admin");
  const [newAdminStall, setNewAdminStall] = useState("");

  // Edit Admin State
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("Stall Admin");
  const [editStall, setEditStall] = useState("");

  useEffect(() => {
    // 1. LIVE Listen to Admins
    const unsubscribeAdmins = onSnapshot(collection(db, "admin_users"), (snapshot) => {
      setAdmins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. LIVE Listen to Global Event Status
    const unsubscribeEvent = onSnapshot(doc(db, "Events", "global_state"), (docSnap) => {
      if (docSnap.exists()) {
        setEventStatus(docSnap.data().status);
      } else {
        setEventStatus("offline");
      }
    });

    return () => {
      unsubscribeAdmins();
      unsubscribeEvent();
    };
  }, []);

  // --- EVENT CONTROLS ---
  const updateEventStatus = async (newStatus) => {
    if (newStatus === 'ended') {
      const isConfirmed = window.confirm(`CRITICAL WARNING: Are you sure you want to END the event?`);
      if (!isConfirmed) return;
    }

    await setDoc(doc(db, "Events", "global_state"), {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  };

  // --- ADMIN MANAGEMENT ---
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminName) return;
    if (newAdminRole === "Stall Admin" && !newAdminStall) return;

    await addDoc(collection(db, "admin_users"), {
      name: newAdminName,
      role: newAdminRole,
      stallAssigned: newAdminRole === "Super Admin" ? "All" : parseInt(newAdminStall)
    });

    setNewAdminName("");
    setNewAdminStall("");
    setNewAdminRole("Stall Admin");
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    const isConfirmed = window.confirm(`Remove access for ${adminName}?`);
    if (!isConfirmed) return;
    await deleteDoc(doc(db, "admin_users", adminId));
  };

  // --- EDIT ADMIN LOGIC ---
  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setEditName(admin.name);
    setEditRole(admin.role || "Stall Admin");
    setEditStall(admin.stallAssigned === "All" ? "" : admin.stallAssigned);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;

    await updateDoc(doc(db, "admin_users", editingAdmin.id), {
      name: editName,
      role: editRole,
      stallAssigned: editRole === "Super Admin" ? "All" : parseInt(editStall)
    });
    
    setEditingAdmin(null);
  };

  // Sort admins so "Super Admin" always appears at the top of the list
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
          <h2 className="card-title">Event Status: <span style={{ textTransform: 'uppercase', color: '#e62b1e' }}>{eventStatus}</span></h2>
          <div className="event-controls">
            <button className="btn btn-start" onClick={() => updateEventStatus('running')}>Start Event</button>
            <button className="btn btn-end" onClick={() => updateEventStatus('ended')}>End Event</button>
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
          
          <form className="admin-form" onSubmit={handleAddAdmin} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <input type="text" className="tedx-input" placeholder="Admin Name" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} style={{ flex: 1 }}/>
            
            <select className="tedx-input" value={newAdminRole} onChange={(e) => setNewAdminRole(e.target.value)} style={{ width: '150px' }}>
              <option value="Stall Admin">Stall Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>

            {newAdminRole === "Stall Admin" && (
              <input type="number" className="tedx-input" placeholder="Stall (1-7)" value={newAdminStall} onChange={(e) => setNewAdminStall(e.target.value)} min="1" max="7" style={{ width: '120px' }}/>
            )}
            
            <button type="submit" className="btn btn-submit">Add User</button>
          </form>

          <ul className="data-list" style={{ marginTop: '20px' }}>
            {sortedAdmins.map(admin => (
              <li key={admin.id} className="data-item">
                <div>
                  <strong>{admin.name}</strong> 
                  <span className={admin.role === "Super Admin" ? "role-badge super" : "role-badge stall"}>
                    {admin.role || "Stall Admin"}
                  </span>
                  <br/>
                  <small style={{ color: '#888' }}>
                    {admin.role === "Super Admin" ? "Full System Access" : `Assigned to Stall ${admin.stallAssigned}`}
                  </small>
                </div>
                <div>
                  <button className="btn-edit" onClick={() => openEditModal(admin)}>Edit</button>
                  <button className="btn-delete" style={{ marginLeft: '10px' }} onClick={() => handleDeleteAdmin(admin.id, admin.name)}>Remove</button>
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
              <label>Name</label>
              <input type="text" className="tedx-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
              
              <label>Role</label>
              <select className="tedx-input" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                <option value="Stall Admin">Stall Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
              
              {editRole === "Stall Admin" && (
                <>
                  <label>Assigned Stall</label>
                  <input type="number" className="tedx-input" value={editStall} onChange={(e) => setEditStall(e.target.value)} min="1" max="7" />
                </>
              )}
              
              <div style={{ marginTop: '15px' }}>
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