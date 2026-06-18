import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import TaskList from '../components/Tasks/TaskList';
import ProjectModal from '../components/Modals/ProjectModal';
import TaskModal from '../components/Modals/TaskModal';
import TagModal from '../components/Modals/TagModal';
import ConfirmModal from '../components/Modals/ConfirmModal';
import Toast from '../components/UI/Toast';
import './Dashboard.css';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Estados locais para controlar abertura dos modais
  const [projectModal, setProjectModal] = useState({ isOpen: false, project: null });
  const [taskModal, setTaskModal] = useState({ isOpen: false, task: null });
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeModals = () => {
    setProjectModal({ isOpen: false, project: null });
    setTaskModal({ isOpen: false, task: null });
    setIsTagModalOpen(false);
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  return (
    <div className="dashboard-layout">
      <Toast />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onOpenProjectModal={(project) => setProjectModal({ isOpen: true, project })}
        onOpenConfirm={(config) => setConfirmModal({ isOpen: true, ...config })}
      />
      
      <div className="main-content">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="content-area">
          <TaskList 
            onOpenTaskModal={(task) => setTaskModal({ isOpen: true, task })}
            onOpenTagModal={() => setIsTagModalOpen(true)}
            onOpenConfirm={(config) => setConfirmModal({ isOpen: true, ...config })}
          />
        </main>
      </div>

      {/* Modais */}
      {projectModal.isOpen && (
        <ProjectModal 
          onClose={closeModals} 
          projectToEdit={projectModal.project} 
        />
      )}

      {taskModal.isOpen && (
        <TaskModal 
          onClose={closeModals} 
          taskToEdit={taskModal.task} 
        />
      )}

      {isTagModalOpen && (
        <TagModal 
          onClose={closeModals} 
          onOpenConfirm={(config) => setConfirmModal({ isOpen: true, ...config })}
        />
      )}

      {confirmModal.isOpen && (
        <ConfirmModal 
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={closeModals}
        />
      )}
    </div>
  );
};

export default Dashboard;
