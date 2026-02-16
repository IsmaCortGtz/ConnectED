/* import React from 'react';
import { useNavigate } from 'react-router'; */

export default function HomePage() {
  /* const navigate = useNavigate();

  const handleJoinVideoCall = () => {
    navigate('/video-call/ebe24a8d-6234-4f8b-92dc-c8e930b4f4de');
  }; */

  return (
    <section style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Inicio</h2>
      <p>Bienvenido a ConnectED</p>
      
      {/* <button 
        onClick={handleJoinVideoCall}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          backgroundColor: '#1f9bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: '500',
        }}
      >
        Unirse a Videollamada
      </button> */}
    </section>
  );
}