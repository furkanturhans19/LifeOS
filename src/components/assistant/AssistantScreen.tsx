'use client';

import React, { useEffect } from 'react';
import { AssistantHeader } from './AssistantHeader';
import { AssistantSecurityBanner } from './AssistantSecurityBanner';
import { AssistantModeBanner } from './AssistantModeBanner';
import { AssistantCommandInput } from './AssistantCommandInput';
import { AssistantTaskTabs } from './AssistantTaskTabs';
import { AssistantTaskList } from './AssistantTaskList';
import { AssistantChatView } from './AssistantChatView';
import { AssistantPermissionCenter } from './AssistantPermissionCenter';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { Dock } from '@/components/os/Dock';

export function AssistantScreen() {
  const { currentView, fetchProviderHealth } = useAssistantStore();
  useEffect(() => {
    useAssistantStore.getState().setCurrentView('tasks');
    fetchProviderHealth();
  }, [fetchProviderHealth]);

  return (
    <div className="flex h-full flex-col bg-background">
      <AssistantHeader />
      <AssistantModeBanner />

      {currentView === 'chat' && (
        <div className="flex-1 overflow-hidden">
          <AssistantChatView />
        </div>
      )}

      {currentView === 'tasks' && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
          <AssistantSecurityBanner />
          <AssistantCommandInput />

          {/* Task Tabs & Filters */}
          <AssistantTaskTabs />

          {/* Tasks List */}
          <AssistantTaskList />
        </div>
      )}

      {currentView === 'permissions' && (
        <div className="flex-1 overflow-hidden">
          <AssistantPermissionCenter />
        </div>
      )}

      {/* Mobile Glass Dock (hidden in chat view to avoid overlapping bottom bar, or included consistently) */}
      <Dock />
    </div>
  );
}

