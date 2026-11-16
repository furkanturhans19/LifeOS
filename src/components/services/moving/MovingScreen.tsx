'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  PackagePlus,
  Truck,
  ShieldCheck,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Inbox,
  Coins,
  CheckCircle2,
  FileText,
  Package,
} from 'lucide-react';
import { MovingHeader } from './MovingHeader';
import { CreateRequestModal } from './CreateRequestModal';
import { SubmitBidModal } from './SubmitBidModal';
import { RequestDetailModal } from './RequestDetailModal';
import { LockedServicesModal } from '@/components/services/LockedServicesModal';
import { ServiceHonestBanner } from '@/components/services/ServiceHonestBanner';
import { ProviderGuardView } from '@/components/services/provider/ProviderGuardView';
import { Dock } from '@/components/os/Dock';
import { useMovingStore } from '@/stores/useMovingStore';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';
import {
  MOVING_CATEGORY_DEFINITIONS,
  MOVING_STATUS_LABELS,
  type MovingCategoryType,
  type MovingRequest,
} from '@/types/moving';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLocaleRender, getFormattingLocale } from '@/lib/i18n/runtime';

export function MovingScreen() {
  const localizeText = useLocaleRender();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    currentRole,
    config,
    myRequests,
    getMarketplaceRequestsForProvider,
    getMySubmittedBids,
    getBidsForMyRequest,
  } = useMovingStore();

  const { isVerifiedFor } = useProviderAuthStore();
  const isMovingVerified = isVerifiedFor('moving');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [prefillMovingType, setPrefillMovingType] =
    useState<MovingCategoryType>('home_to_home');
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<MovingRequest | null>(null);
  const [selectedRequestForBid, setSelectedRequestForBid] = useState<MovingRequest | null>(null);
  const [lockedFeatureTitle, setLockedFeatureTitle] = useState<string | null>(null);

  function openCreate(type?: MovingCategoryType) {
    if (type) setPrefillMovingType(type);
    setIsCreateModalOpen(true);
  }

  useEffect(() => {
    if (searchParams.get('create') !== '1') return;
    if (currentRole === 'customer') openCreate();
    router.replace(pathname, { scroll: false });
  }, [searchParams, currentRole, router, pathname]);

  // Guarantee deduplication for UI rendering
  const deduplicatedMyRequests = Array.from(new Map(myRequests.map((r) => [r.id, r])).values());
  // Provider only sees marketplace requests excluding their own created requests
  const providerMarketplaceRequests = getMarketplaceRequestsForProvider();
  const myBids = Array.from(new Map(getMySubmittedBids().map((b) => [b.id, b])).values());

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Header */}
      <MovingHeader />

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        <ServiceHonestBanner productHint="Taşıma türü → adresler → teklif kartları (nakliye pazarı akışı)." />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-3 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{localizeText('Taşıma türü · teklif topla')}</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-foreground">
                {localizeText(
                  currentRole === 'customer' ? 'Ne taşıyacaksın?' : 'Açık taşıma işleri'
                )}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {localizeText(
                  currentRole === 'customer'
                    ? 'Evden eve, parça eşya veya ofis — tür seç, adresleri gir, teklif al.'
                    : 'Açık ilanlara fiyat ver. Diğer teklifler gizlidir.'
                )}
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl shadow-sm">
              🚚
            </div>
          </div>
        </motion.div>

        {currentRole === 'customer' && (
          <div className="space-y-6">
            <div className="mt-5 px-4">
              <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {localizeText('Taşıma türleri')}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {MOVING_CATEGORY_DEFINITIONS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => openCreate(cat.id)}
                    className="flex flex-col items-start gap-1 rounded-2xl border border-border/80 bg-card p-3 text-left hover:border-emerald-500/40 hover:bg-emerald-500/5"
                  >
                    <span className="text-xl">{cat.iconEmoji}</span>
                    <span className="text-xs font-bold text-foreground">
                      {localizeText(cat.labelTr)}
                    </span>
                    <span className="line-clamp-2 text-[10px] text-muted-foreground">
                      {localizeText(cat.descriptionTr)}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={() => openCreate()}
                  size="sm"
                  className="rounded-2xl bg-emerald-500 font-semibold text-xs text-white hover:bg-emerald-600"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  {localizeText('Yeni talep')}
                </Button>
              </div>
            </div>

            {/* 2. My Requests Section */}
            <div className="px-4">
              <div className="mb-3 px-2 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{localizeText("Taleplerim & Gelen Teklifler")}</h2>
                <span className="text-[11px] font-medium text-emerald-500">
                  {localizeText(deduplicatedMyRequests.length)}{localizeText(" Talep")}</span>
              </div>

              {deduplicatedMyRequests.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{localizeText("Henüz Bir Taşıma Talebiniz Yok")}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{localizeText("Yukarıdaki butona basarak ilk taşıma talebinizi anonim olarak yayınlayabilirsiniz.")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deduplicatedMyRequests.map((req) => {
                    const statusInfo = MOVING_STATUS_LABELS[req.status];
                    const reqBids = getBidsForMyRequest(req.id);

                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequestForDetail(req)}
                        className="group rounded-3xl border border-border/80 bg-card p-4.5 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-emerald-500">
                                #{localizeText(req.id)}
                              </span>
                              <Badge variant={statusInfo.badgeVariant} className="text-[10px] py-0 px-2">
                                {localizeText(statusInfo.tr)}
                              </Badge>
                            </div>
                            <h3 className="text-sm font-bold text-foreground mt-1">
                              {localizeText(req.fromCity)} → {localizeText(req.toCity)}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                              {localizeText(req.loadDescription)}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {localizeText(reqBids.length)}{localizeText(" Teklif")}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {localizeText(req.requestedDate)}
                          </span>
                          <span className="font-semibold text-emerald-500 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>{localizeText("Detayları ve Teklifleri Gör")}</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PROVIDER VIEW: YETKİ KONTROLÜ (SADECE NAKLİYE YETKİSİ KONTROL EDİLİR) */}
        {/* ========================================================================= */}
        {currentRole === 'provider' && (
          <>
            {/* If NOT verified for moving, show the Nakliye ProviderGuardView */}
            {!isMovingVerified ? (
              <ProviderGuardView serviceType="moving" />
            ) : (
              /* Verified Moving Transporter View */
              <div className="mt-5 px-4 space-y-6">
                {/* Open Marketplace Requests */}
                <div>
                  <div className="mb-3 px-2 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{localizeText("Açık Taşıma İlanları (Pazar Yeri)")}</h2>
                    <span className="text-[11px] font-medium text-emerald-500">
                      {localizeText(providerMarketplaceRequests.length)}{localizeText(" İlan")}</span>
                  </div>

                  {providerMarketplaceRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-5 text-center text-xs text-muted-foreground">{localizeText("Şu anda teklif verilebilecek açık ilan bulunmuyor.")}</div>
                  ) : (
                    <div className="space-y-3">
                      {providerMarketplaceRequests.map((req) => {
                        const statusInfo = MOVING_STATUS_LABELS[req.status];
                        const hasGivenBid = myBids.some((b) => b.requestId === req.id);

                        return (
                          <div
                            key={req.id}
                            onClick={() => setSelectedRequestForBid(req)}
                            className="group rounded-3xl border border-border/80 bg-card p-4.5 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-emerald-500">{localizeText("İlan #")}{localizeText(req.id)}
                                  </span>
                                  <Badge variant={statusInfo.badgeVariant} className="text-[10px] py-0 px-2">
                                    {localizeText(statusInfo.tr)}
                                  </Badge>
                                </div>
                                <h3 className="text-sm font-bold text-foreground mt-1 group-hover:text-emerald-500 transition-colors">
                                  {localizeText(req.fromCity)} → {localizeText(req.toCity)}
                                </h3>
                              </div>

                              {hasGivenBid && (
                                <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-blue-500">{localizeText("Teklifiniz Var")}</span>
                              )}
                            </div>

                            {/* Load info - NO customer personal details */}
                            <p className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl leading-relaxed line-clamp-2">
                              📦 {localizeText(req.loadDescription)}
                            </p>

                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {localizeText(req.requestedDate)}
                              </span>
                              {req.notes && (
                                <span className="line-clamp-1">{localizeText("Not: ")}{localizeText(req.notes)}</span>
                              )}
                            </div>

                            {/* Submit Bid Button */}
                            <div className="mt-3.5 pt-2.5 border-t border-border/40 flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">{localizeText("Kredi:")}<strong className="text-foreground">{localizeText(config.bidCreditFee)} {localizeText(config.currency)}</strong>
                              </span>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRequestForBid(req);
                                }}
                                size="sm"
                                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm"
                              >
                                {localizeText(hasGivenBid ? 'Teklifi Düzenle' : 'Fiyat Teklifi Ver')}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* My Submitted Bids */}
                <div>
                  <div className="mb-3 px-2 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{localizeText("Verdiğim Teklifler (")}{localizeText(myBids.length)})
                    </h2>
                    <span className="text-[11px] font-medium text-muted-foreground">{localizeText("Sadece Sizin Teklifleriniz")}</span>
                  </div>

                  {myBids.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-5 text-center text-xs text-muted-foreground">{localizeText("Henüz bir ilana teklif vermediniz.")}</div>
                  ) : (
                    <div className="space-y-2.5">
                      {myBids.map((bid) => (
                        <div
                          key={bid.id}
                          className="rounded-2xl border border-border/80 bg-card p-3.5 text-xs flex items-center justify-between shadow-sm"
                        >
                          <div>
                            <div className="font-semibold text-foreground">{localizeText("Talep #")}{localizeText(bid.requestId)}{localizeText(" için Teklifiniz")}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              "{localizeText(bid.bidNote)}"
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm text-emerald-500">
                              {localizeText(bid.price.toLocaleString(getFormattingLocale()))} {localizeText(bid.currency)}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {localizeText(bid.status === 'accepted' ? '✓ Kabul Edildi' : 'Beklemede')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom spacer */}
        <div className="h-6" />
      </div>

      {/* Dock */}
      <Dock />

      {/* Customer: Create Request Modal */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialMovingType={prefillMovingType}
      />

      {/* Customer: Request Detail & Bids Modal */}
      <RequestDetailModal
        isOpen={!!selectedRequestForDetail}
        onClose={() => setSelectedRequestForDetail(null)}
        request={selectedRequestForDetail}
      />

      {/* Transporter: Submit Bid Modal */}
      <SubmitBidModal
        isOpen={!!selectedRequestForBid}
        onClose={() => setSelectedRequestForBid(null)}
        request={selectedRequestForBid}
      />

      {/* Locked Feature Modal */}
      <LockedServicesModal
        isOpen={!!lockedFeatureTitle}
        onClose={() => setLockedFeatureTitle(null)}
        serviceTitle={lockedFeatureTitle || 'Bu Özellik'}
      />
    </div>
  );
}
