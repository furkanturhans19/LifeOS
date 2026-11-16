'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  LockKeyhole,
  Film,
  Terminal,
  Wallet,
  Users,
  Car,
  Truck,
  Wrench,
  Bus,
  Briefcase,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useFamilyStore } from '@/stores/useFamilyStore';
import {
  ASSISTANT_TYPE_CONFIG,
  ASSISTANT_PERMISSION_SCOPES,
  type AssistantServiceKind,
  type AssistantTask,
} from '@/types/assistant';
import { useLocaleRender, getFormattingLocale } from '@/lib/i18n/runtime';

const SERVICE_BRIDGE: Record<
  AssistantServiceKind,
  { href: string; label: string; icon: typeof Car }
> = {
  taxi: { href: '/services/taxi?create=1', label: 'Taksi talebi oluştur', icon: Car },
  moving: { href: '/services/moving?create=1', label: 'Nakliye talebi oluştur', icon: Truck },
  craftsman: { href: '/services/craftsman?create=1', label: 'Usta talebi oluştur', icon: Wrench },
  travel: { href: '/services/travel', label: 'Seyahat ara', icon: Bus },
};

function resolveServiceKind(task: AssistantTask): AssistantServiceKind | undefined {
  if (task.serviceKind) return task.serviceKind;
  const blob = `${task.title} ${task.description}`.toLowerCase();
  if (blob.includes('taksi') || blob.includes('yolculuk')) return 'taxi';
  if (blob.includes('nakliye') || blob.includes('taşıma') || blob.includes('tasima')) return 'moving';
  if (blob.includes('usta') || blob.includes('tamirat')) return 'craftsman';
  if (blob.includes('seyahat') || blob.includes('otobüs') || blob.includes('otobus') || blob.includes('bilet'))
    return 'travel';
  return undefined;
}

interface AssistantTaskDetailModalProps {
  task: AssistantTask;
  isOpen: boolean;
  onClose: () => void;
}

export function AssistantTaskDetailModal({
  task,
  isOpen,
  onClose,
}: AssistantTaskDetailModalProps) {
  const localizeText = useLocaleRender();
  const { approveTask, cancelTask, deleteTask, completeTask } = useAssistantStore();
  const addExpense = useFinanceStore((s) => s.addExpense);
  const { family, addNote } = useFamilyStore();
  const [bridgeMsg, setBridgeMsg] = useState<string | null>(null);

  const config = ASSISTANT_TYPE_CONFIG[task.type];
  const isPendingApproval = task.status === 'pending_approval';
  const isInProgress = task.status === 'in_progress';
  const isCompleted = task.status === 'completed';
  const serviceKind = task.type === 'services' ? resolveServiceKind(task) : undefined;
  const serviceBridge = serviceKind ? SERVICE_BRIDGE[serviceKind] : null;

  async function handleApprove() {
    await approveTask(task.id);
  }

  function handleCancel() {
    cancelTask(task.id);
  }

  function pushToFinance() {
    addExpense({
      title: task.title.slice(0, 80),
      category: 'other',
      amountLm: 1,
      note: `Asistan taslağı (1 LM yer tutucu): ${task.description.slice(0, 160)}`,
    });
    setBridgeMsg(localizeText('Finansa taslak harcama eklendi (1 LM yer tutucu).'));
  }

  function pushToFamily() {
    if (!family) {
      setBridgeMsg(localizeText('Önce Aile oluştur.'));
      return;
    }
    addNote(task.title.slice(0, 80), task.description.slice(0, 500));
    setBridgeMsg(localizeText('Aile notlarına kaydedildi.'));
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {localizeText(config.titleTr)}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs text-muted-foreground">
              {localizeText(new Date(task.createdAt).toLocaleString(getFormattingLocale()))}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {localizeText(task.title)}
            </h2>
            <StatusBadge
              status={
                isPendingApproval
                  ? 'pending'
                  : isInProgress
                  ? 'bidding'
                  : isCompleted
                  ? 'completed'
                  : 'cancelled'
              }
              label={
                localizeText(isPendingApproval
                  ? 'Onay Bekliyor'
                  : isInProgress
                  ? 'İşleniyor'
                  : isCompleted
                  ? 'Tamamlandı'
                  : 'İptal Edildi')
              }
              size="sm"
            />
          </div>

          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {localizeText(task.description)}
          </p>
        </div>

        {/* Video / Content Specs Schema Box if present */}
        {task.contentDetails && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
              <Film className="h-4 w-4" />
              <span>{localizeText("Gelecek Video & İçerik Parametreleri")}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-muted-foreground block">{localizeText("Tür:")}</span>
                <span className="font-semibold text-foreground">{localizeText(task.contentDetails.contentType)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{localizeText("Platform:")}</span>
                <span className="font-semibold text-foreground">{localizeText(task.contentDetails.targetPlatform)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{localizeText("En/Boy Oranı:")}</span>
                <span className="font-semibold text-foreground">{localizeText(task.contentDetails.videoSpecs?.aspect || '9:16')}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{localizeText("Altyazı & Ses:")}</span>
                <span className="font-semibold text-emerald-500">{localizeText("Otomatik Planlandı")}</span>
              </div>
            </div>
          </div>
        )}

        {/* User Approval Alert Box */}
        {isPendingApproval && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <span>{localizeText("Kullanıcı Güvenlik Onayı Zorunludur")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {localizeText(task.approvalDescription ||
                'Bu görev harici işlem veya veri erişimi gerektirmektedir. Onayınız olmadan hiçbir işlem yürütülmez.')}
            </p>
            <div className="pt-2 flex items-center gap-2">
              <Button onClick={handleApprove} variant="primary" size="sm" className="font-semibold">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />{localizeText("Görevi Onayla & Başlat")}</Button>
              <Button onClick={handleCancel} variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">{localizeText("Görevi İptal Et")}</Button>
            </div>
          </div>
        )}

        {/* Step Breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">{localizeText("İşlem & Yürütme Adımları")}</h3>
          <div className="space-y-2">
            {task.steps.map((step, idx) => (
              <div
                key={step.id}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3 text-xs"
              >
                <div className="mt-0.5 shrink-0">
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : step.status === 'in_progress' ? (
                    <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border flex items-center justify-center text-[10px] text-muted-foreground">
                      {localizeText(idx + 1)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-bold text-foreground">{localizeText(step.title)}</div>
                  {step.details && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {localizeText(step.details)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Scopes */}
        {task.requiredScopes.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{localizeText("Veri İzinleri & Gizlilik Kapsamı")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {task.requiredScopes.map((scope) => {
                const isGranted = task.grantedScopes.includes(scope);
                const info = ASSISTANT_PERMISSION_SCOPES[scope];

                return (
                  <div
                    key={scope}
                    className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/30 p-2.5 text-xs"
                  >
                    <LockKeyhole className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <span>{localizeText(info?.titleTr || scope)}</span>
                        {isGranted ? (
                          <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">{localizeText("İzinli")}</span>
                        ) : (
                          <span className="text-[10px] text-amber-500 font-medium bg-amber-500/10 px-1.5 py-0.2 rounded">{localizeText("Onay Bekliyor")}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {localizeText(info?.descriptionTr)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {task.logs.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              <span>{localizeText("İşlem Günlüğü (Audit Trail)")}</span>
            </h3>
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-[11px] font-mono space-y-1 max-h-32 overflow-y-auto">
              {task.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-muted-foreground shrink-0">
                    {localizeText(new Date(log.timestamp).toLocaleTimeString(getFormattingLocale()))}
                  </span>
                  <span
                    className={
                      log.level === 'error'
                        ? 'text-destructive font-bold'
                        : log.level === 'warn'
                        ? 'text-amber-500'
                        : 'text-foreground'
                    }
                  >
                    {localizeText(log.message)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(task.type === 'finance' || task.type === 'family' || task.type === 'services') && (
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-3 space-y-2">
            <p className="text-xs font-semibold text-foreground">
              {localizeText('Modül bağlantısı')}
            </p>
            <div className="flex flex-wrap gap-2">
              {task.type === 'finance' && (
                <>
                  <Button type="button" size="sm" variant="outline" onClick={pushToFinance}>
                    <Wallet className="mr-1 h-3.5 w-3.5" />
                    {localizeText('Finansa taslak ekle')}
                  </Button>
                  <Link
                    href="/finance"
                    className="inline-flex items-center rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    {localizeText('Finansı aç')}
                  </Link>
                </>
              )}
              {task.type === 'family' && (
                <>
                  <Button type="button" size="sm" variant="outline" onClick={pushToFamily}>
                    <Users className="mr-1 h-3.5 w-3.5" />
                    {localizeText('Aile notuna kaydet')}
                  </Button>
                  <Link
                    href="/family"
                    className="inline-flex items-center rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    {localizeText('Aileyi aç')}
                  </Link>
                </>
              )}
              {task.type === 'services' && (
                <>
                  {serviceBridge ? (
                    <Link
                      href={serviceBridge.href}
                      onClick={onClose}
                      className="inline-flex items-center rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15"
                    >
                      <serviceBridge.icon className="mr-1.5 h-3.5 w-3.5" />
                      {localizeText(serviceBridge.label)}
                    </Link>
                  ) : null}
                  <Link
                    href="/services"
                    onClick={onClose}
                    className="inline-flex items-center rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Briefcase className="mr-1.5 h-3.5 w-3.5" />
                    {localizeText('Hizmetler merkezini aç')}
                  </Link>
                </>
              )}
            </div>
            {task.type === 'services' && (
              <p className="text-[11px] text-muted-foreground">
                {localizeText(
                  'Asistan yalnızca plan üretir; gerçek talep ilgili hizmet ekranında sizin tarafınızdan oluşturulur.'
                )}
              </p>
            )}
            {bridgeMsg && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{bridgeMsg}</p>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-end gap-2">
          {isPendingApproval && (
            <>
              <Button onClick={handleCancel} variant="ghost" size="sm">
                {localizeText('İptal')}
              </Button>
              <Button onClick={handleApprove} variant="primary" size="sm">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                {localizeText('Onayla')}
              </Button>
            </>
          )}
          {isInProgress && (
            <Button
              onClick={() => {
                completeTask(task.id);
                onClose();
              }}
              variant="primary"
              size="sm"
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              {localizeText('Tamamla')}
            </Button>
          )}
          {(isCompleted || task.status === 'cancelled') && (
            <Button
              onClick={() => {
                deleteTask(task.id);
                onClose();
              }}
              variant="ghost"
              size="sm"
              className="text-destructive"
            >
              {localizeText('Sil')}
            </Button>
          )}
          <Button onClick={onClose} variant="secondary" size="sm">
            {localizeText('Kapat')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
