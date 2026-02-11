import React from 'react';
import './loading-screen.scss';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p>Connecting to video call...</p>
    </div>
  );
};
