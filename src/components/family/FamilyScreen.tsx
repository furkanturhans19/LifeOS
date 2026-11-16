'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';
import { FamilyHeader } from './FamilyHeader';
import { FamilyMembersList } from './FamilyMembersList';
import { FamilyFeaturesGrid, type FeatureCardConfig } from './FamilyFeaturesGrid';
import { FamilyNotesView } from './FamilyNotesView';
import { FamilyCalendarView } from './FamilyCalendarView';
import { FamilyMemoriesView } from './FamilyMemoriesView';
import { FamilySharedSpaceView } from './FamilySharedSpaceView';
import { CreateFamilyModal } from './CreateFamilyModal';
import { InviteMemberModal } from './InviteMemberModal';
import { Dock } from '@/components/os/Dock';
import { useFamilyStore } from '@/stores/useFamilyStore';
import { useLocaleRender } from '@/lib/i18n/runtime';
import type { FamilyFeatureKey } from '@/types/family';
import { LocalBackupPanel } from '@/components/common/LocalBackupPanel';

const TOOL_TITLES: Record<FamilyFeatureKey, string> = {
  shared_space: 'Ortak Alan',
  memories: 'Anılar',
  calendar: 'Takvim',
  notes: 'Notlar',
};

export function FamilyScreen() {
  const localizeText = useLocaleRender();
  const { family } = useFamilyStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [openTool, setOpenTool] = useState<FamilyFeatureKey | null>(null);

  function handleFeatureClick(feature: FeatureCardConfig) {
    setOpenTool(feature.id);
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <FamilyHeader
        onOpenInvite={() => setIsInviteModalOpen(true)}
        onOpenCreate={() => setIsCreateModalOpen(true)}
      />

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        {openTool ? (
          <div className="space-y-3 px-4 pt-4 sm:px-6">
            <button
              type="button"
              onClick={() => setOpenTool(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {localizeText('Aileye dön')}
              <span className="text-foreground">· {localizeText(TOOL_TITLES[openTool])}</span>
            </button>
            {openTool === 'notes' && <FamilyNotesView />}
            {openTool === 'calendar' && <FamilyCalendarView />}
            {openTool === 'memories' && <FamilyMemoriesView />}
            {openTool === 'shared_space' && <FamilySharedSpaceView />}
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-4 mt-4 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                    <Heart className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{localizeText('Life Aile Alanı')}</span>
                  </div>
                  <h2 className="mt-1 text-base font-bold text-foreground">
                    {localizeText(
                      family ? `${family.name} — yerel aile alanı` : 'Aileniz için yerel alan'
                    )}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {localizeText(
                      'Notlar, takvim, anılar ve duyurular bu cihazda saklanır. Çok cihazlı paylaşım için bulut henüz bağlı değil.'
                    )}
                  </p>
                </div>
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-2xl shadow-sm">
                  ✨
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{localizeText('Cihazda saklanır')}</span>
                </div>
                <span className="text-muted-foreground/40">•</span>
                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>{localizeText('Offline MVP')}</span>
                </div>
              </div>
            </motion.div>

            <FamilyMembersList
              onOpenInvite={() => setIsInviteModalOpen(true)}
              onOpenCreate={() => setIsCreateModalOpen(true)}
            />

            <FamilyFeaturesGrid
              onFeatureClick={handleFeatureClick}
              hasFamily={!!family}
            />
            <div className="mt-4 px-4 sm:px-6">
              <LocalBackupPanel scope="family" />
            </div>
          </>
        )}

        <div className="h-6" />
      </div>

      <Dock />

      <CreateFamilyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        inviteCode={family?.inviteCode}
      />
    </div>
  );
}
