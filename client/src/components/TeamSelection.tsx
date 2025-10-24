export default function TeamSelection() {
  const teams = ['Raptors', 'Bulldogs', 'Eagles', 'Mustangs'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>		
      {teams.map((name, idx) => (
        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', alignItems: 'center', gap: 20, marginLeft: 20 }}>
          <span>{name}</span>
          <span>Team info will appear here.</span>
          <button 
            type="button" 
            style={{
              padding: '10px 20px',
              fontSize: '16px'
            }}
            onClick={() => { 
              /* join action placeholder */ 
            }}>
            Join
          </button>
        </div>
			))}
	  </div>
  );
}