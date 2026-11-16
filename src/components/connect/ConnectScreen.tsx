'use client';

import React, { useEffect } from 'react';
import { useConnectStore } from '@/stores/useConnectStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { ConnectSidebar } from './ConnectSidebar';
import { ConnectChatArea } from './ConnectChatArea';
import { ConnectCallModal } from './ConnectCallModal';
import { ConnectContextTransformModal } from './ConnectContextTransformModal';
import { ConnectNewChatModal } from './ConnectNewChatModal';
import { useLocaleRender } from '@/lib/i18n/runtime';

export function ConnectScreen() {
  const localizeText = useLocaleRender();
  const user = useAuthStore((s) => s.user);
  const {
    fetchConversations,
    checkLiveKitStatus,
    isTransformModalOpen,
    transformTargetMessage,
    closeTransformModal,
    transformMessage,
    backendAvailable,
    backendHint,
    currentUser,
  } = useConnectStore();

  useEffect(() => {
    fetchConversations();
    checkLiveKitStatus();
  }, [fetchConversations, checkLiveKitStatus]);

  useEffect(() => {
    if (!user) return;
    useConnectStore.setState({
      currentUser: {
        ...currentUser,
        id: user.id || 'usr-local',
        name: user.displayName || user.email?.split('@')[0] || 'Ben',
        badge: 'Local',
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync when auth user identity changes
  }, [user?.id, user?.displayName, user?.email]);

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden bg-background">
      {!backendAvailable && (
        <div className="shrink-0 border-b border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-100">
          <p className="font-semibold">{localizeText('Sohbet backend kapalı')}</p>
          <p className="mt-0.5 opacity-90">
            {localizeText(
              backendHint ||
                'Connect API emekli. Lifechat için Supabase oturumu gerekir — bilinçli olarak bağlı değil.'
            )}
          </p>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <ConnectSidebar />
        <ConnectChatArea />
      </div>

      <ConnectCallModal />
      <ConnectNewChatModal />
      <ConnectContextTransformModal
        isOpen={isTransformModalOpen}
        onClose={closeTransformModal}
        message={transformTargetMessage}
        onTransform={transformMessage}
      />
    </div>
  );
}
