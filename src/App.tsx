import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { ProjectList } from './components/ProjectList';
import { TeamList } from './components/TeamList';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskList />;
      case 'projects':
        return <ProjectList />;
      case 'team':
        return <TeamList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
}

export default App;
