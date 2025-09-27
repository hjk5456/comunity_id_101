import React from 'react';
import { AppProvider } from './context/AppContext';
import { ChatInterface } from './components/ChatInterface';

const App: React.FC = () => {
    return (
        <AppProvider>
            <ChatInterface />
        </AppProvider>
    );
}

export default App;