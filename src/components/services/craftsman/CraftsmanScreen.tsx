'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Wrench,
  MapPin,
  Calendar,
  ShieldCheck,
  Sparkles,
  Plus,
  Inbox,
  Coins,
  ChevronRight,
  Clock,
  Timer,
} from 'lucide-react';
import { CraftsmanHeader } from './CraftsmanHeader';
import { CreateCraftsmanRequestModal } from './CreateCraftsmanRequestModal';
import { SubmitCraftsmanBidModal } from './SubmitCraftsmanBidModal';
import { CraftsmanRequestDetailModal } from './CraftsmanRequestDetailModal';
import { ServiceHonestBanner } from '@/components/services/ServiceHonestBanner';
import { ProviderGuardView } from '@/components/services/provider/ProviderGuardView';
import { Dock } from '@/components/os/Dock';
import { useCraftsmanStore } from '@/stores/useCraftsmanStore';
import { useProviderAuthStore } from '@/stores/useProviderAuthStore';
import {
  CRAFTSMAN_CATEGORIES_CONFIG,
  CRAFTSMAN_STATUS_LABELS,
  type CraftsmanCategory,
  type CraftsmanRequest,
} from '@/types/craftsman';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLocaleRender, getFormattingLocale } from '@/lib/i18n/runtime';

export function CraftsmanScreen() {
  const localizeText = useLocaleRender();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    currentRole,
    config,
    myRequests,
    getMarketplaceRequestsForCraftsman,
    getMySubmittedBids,
    getBidsForMyRequest,
  } = useCraftsmanStore();

  const { isVerifiedFor } = useProviderAuthStore();
  const isCraftsmanVerified = isVerifiedFor('craftsman');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [prefillCategory, setPrefillCategory] = useState<CraftsmanCategory>('electrical');
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<CraftsmanRequest | null>(null);
  const [selectedRequestForBid, setSelectedRequestForBid] = useState<CraftsmanRequest | null>(null);

  function openCreate(category?: CraftsmanCategory) {
    if (category) setPrefillCategory(category);
    setIsCreateModalOpen(true);
  }

  useEffect(() => {
    if (searchParams.get('create') !== '1') return;
    if (currentRole === 'customer') openCreate();
    router.replace(pathname, { scroll: false });
  }, [searchParams, currentRole, router, pathname]);

  // Guarantee deduplication for UI rendering
  const deduplicatedMyRequests = Array.from(new Map(myRequests.map((r) => [r.id, r])).values());
  const craftsmanMarketplaceRequests = getMarketplaceRequestsForCraftsman();
  const myBids = Array.from(new Map(getMySubmittedBids().map((b) => [b.id, b])).values());

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <CraftsmanHeader />

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32 scroll-smooth">
        <ServiceHonestBanner productHint="Kategori seç → talep oluştur → teklif karşılaştır (hizmet pazaryeri akışı)." />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mt-3 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{localizeText('Hizmet kategorileri · teklif topla')}</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-foreground">
                {localizeText(
                  currentRole === 'customer'
                    ? 'Ne yaptırmak istiyorsun?'
                    : 'Açık iş ilanları'
                )}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {localizeText(
                  currentRole === 'customer'
                    ? 'Elektrik, tesisat, boya… kategori seç, ihtiyacını yaz, ustalardan teklif al.'
                    : 'Açık taleplere fiyat ve süre teklifi ver. Diğer teklifler gizli.'
                )}
              </p>
            </div>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-2xl shadow-sm">
              🛠️
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* CUSTOMER VIEW (HİZMET ALAN / MÜŞTERİ) */}
        {/* ========================================================================= */}
        {currentRole === 'customer' && (
          <div className="space-y-6">
            <div className="mt-5 px-4">
              <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {localizeText('Popüler hizmetler')}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CRAFTSMAN_CATEGORIES_CONFIG.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => openCreate(cat.id)}
                    className="flex flex-col items-start gap-1 rounded-2xl border border-border/80 bg-card p-3 text-left hover:border-violet-500/40 hover:bg-violet-500/5"
                  >
                    <span className="text-xl">{cat.iconEmoji}</span>
                    <span className="text-xs font-bold text-foreground">{localizeText(cat.labelTr)}</span>
                    <span className="line-clamp-2 text-[10px] text-muted-foreground">
                      {localizeText(cat.descTr)}
                    </span>
                  </button>
                ))}
              </div>
              <Button
                onClick={() => openCreate()}
                className="mt-3 w-full rounded-2xl bg-violet-600 font-semibold text-white hover:bg-violet-700"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {localizeText('Hizmet talebi oluştur')}
              </Button>
            </div>

            {/* 2. My Requests Section */}
            <div className="px-4">
              <div className="mb-3 px-2 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{localizeText("Taleplerim & Gelen Teklifler")}</h2>
                <span className="text-[11px] font-medium text-purple-500">
                  {localizeText(deduplicatedMyRequests.length)}{localizeText(" Talep")}</span>
              </div>

              {deduplicatedMyRequests.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{localizeText("Henüz Bir Usta Talebiniz Yok")}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{localizeText("Yukarıdaki butona basarak ilk tamirat talebinizi anonim olarak oluşturabilirsiniz.")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deduplicatedMyRequests.map((req) => {
                    const statusInfo = CRAFTSMAN_STATUS_LABELS[req.status];
                    const categoryConfig = CRAFTSMAN_CATEGORIES_CONFIG.find((c) => c.id === req.category);
                    const reqBids = getBidsForMyRequest(req.id);

                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequestForDetail(req)}
                        className="group rounded-3xl border border-border/80 bg-card p-4.5 shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-purple-500">
                                #{localizeText(req.id)}
                              </span>
                              <Badge variant={statusInfo.badgeVariant} className="text-[10px] py-0 px-2">
                                {localizeText(statusInfo.tr)}
                              </Badge>
                            </div>
                            <h3 className="text-sm font-bold text-foreground mt-1 flex items-center gap-1.5">
                              <span>{localizeText(categoryConfig?.iconEmoji)}</span>
                              <span>{localizeText(categoryConfig?.labelTr)}</span>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              "{localizeText(req.problemDescription)}"
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {localizeText(req.location)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {localizeText(req.preferredDateTime)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                              {localizeText(reqBids.length)}{localizeText(" Teklif")}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{localizeText(req.notes ? `Not: ${req.notes}` : 'Ek not yok')}</span>
                          <span className="font-semibold text-purple-500 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>{localizeText("Teklifleri Gör")}</span>
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
        {/* CRAFTSMAN VIEW (HİZMET VEREN / USTA) */}
        {/* ========================================================================= */}
        {currentRole === 'provider' && (
          <>
            {/* If NOT verified specifically for craftsman, show Craftsman ProviderGuardView */}
            {!isCraftsmanVerified ? (
              <ProviderGuardView serviceType="craftsman" />
            ) : (
              /* Verified Craftsman View */
              <div className="mt-5 px-4 space-y-6">
                {/* Open Marketplace Requests */}
                <div>
                  <div className="mb-3 px-2 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{localizeText("Açık Usta Talepleri (Pazar Yeri)")}</h2>
                    <span className="text-[11px] font-medium text-purple-500">
                      {localizeText(craftsmanMarketplaceRequests.length)}{localizeText(" Talep")}</span>
                  </div>

                  {craftsmanMarketplaceRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-5 text-center text-xs text-muted-foreground">{localizeText("Şu anda teklif verilebilecek açık usta talebi bulunmuyor.")}</div>
                  ) : (
                    <div className="space-y-3">
                      {craftsmanMarketplaceRequests.map((req) => {
                        const statusInfo = CRAFTSMAN_STATUS_LABELS[req.status];
                        const categoryConfig = CRAFTSMAN_CATEGORIES_CONFIG.find((c) => c.id === req.category);
                        const hasGivenBid = myBids.some((b) => b.requestId === req.id);

                        return (
                          <div
                            key={req.id}
                            onClick={() => setSelectedRequestForBid(req)}
                            className="group rounded-3xl border border-border/80 bg-card p-4.5 shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-purple-500">{localizeText("Talep #")}{localizeText(req.id)}
                                  </span>
                                  <Badge variant={statusInfo.badgeVariant} className="text-[10px] py-0 px-2">
                                    {localizeText(statusInfo.tr)}
                                  </Badge>
                                </div>
                                <h3 className="text-sm font-bold text-foreground mt-1 group-hover:text-purple-500 transition-colors flex items-center gap-1.5">
                                  <span>{localizeText(categoryConfig?.iconEmoji)}</span>
                                  <span>{localizeText(categoryConfig?.labelTr)}</span>
                                </h3>
                              </div>

                              {hasGivenBid && (
                                <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-blue-500">{localizeText("Teklifiniz Var")}</span>
                              )}
                            </div>

                            <p className="mt-2 text-xs text-foreground bg-muted/40 p-2.5 rounded-xl leading-relaxed">
                              "{localizeText(req.problemDescription)}"
                            </p>

                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-purple-500" />
                                {localizeText(req.location)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-purple-500" />
                                {localizeText(req.preferredDateTime)}
                              </span>
                            </div>

                            {req.notes && (
                              <p className="mt-2 text-[11px] text-muted-foreground">{localizeText("Not: ")}{localizeText(req.notes)}
                              </p>
                            )}

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
                                className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm"
                              >
                                {localizeText(hasGivenBid ? 'Teklifi Düzenle' : 'Teklif İlet')}
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
                    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-5 text-center text-xs text-muted-foreground">{localizeText("Henüz bir usta talebine teklif vermediniz.")}</div>
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
                              "{localizeText(bid.bidNote)}" ({localizeText(bid.estimatedDuration)})
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm text-purple-500">
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

      {/* Modals */}
      <CreateCraftsmanRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialCategory={prefillCategory}
      />

      <CraftsmanRequestDetailModal
        isOpen={!!selectedRequestForDetail}
        onClose={() => setSelectedRequestForDetail(null)}
        request={selectedRequestForDetail}
      />

      <SubmitCraftsmanBidModal
        isOpen={!!selectedRequestForBid}
        onClose={() => setSelectedRequestForBid(null)}
        request={selectedRequestForBid}
      />
    </div>
  );
}
