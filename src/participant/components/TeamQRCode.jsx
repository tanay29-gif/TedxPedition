import QRCode from 'react-qr-code';

// Encodes the team's Firestore document ID. Module 2 (Admin Portal) scans
// this to look up the team directly by ID — no extra lookup step needed.
const TeamQRCode = ({ team }) => {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3>Team QR Code</h3>
      <div style={{ background: '#fff', padding: '12px', display: 'inline-block', borderRadius: '8px' }}>
        <QRCode value={team.id} size={140} />
      </div>
      <p style={{ opacity: 0.7, marginTop: '8px', fontSize: '0.85rem' }}>
        Show this to an admin at each stall
      </p>
    </div>
  );
};

export default TeamQRCode;
