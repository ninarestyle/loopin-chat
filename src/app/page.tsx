import { Chat } from '@/app/components/chat';
import React from 'react';


const Home: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Chat />
    </div>
  );
};

export default Home;
