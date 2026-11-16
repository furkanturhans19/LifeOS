import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AssistantConversation,
  AssistantMessage,
  AssistantToolCall,
  AssistantPermissionScopeKey,
  AssistantPermissionLevel,
  DataAccessLog,
  PhotoAnalysisItem,
  AssistantTask,
  AssistantTaskStep,
  AssistantTaskLog,
} from '@/types/assistant';
import { ASSISTANT_PERMISSION_SCOPES } from '@/types/assistant';
import { LocalDeterministicAssistantAdapter } from '@/services/assistant/MockAssistantAdapter';
import { useThemeStore } from '@/stores/useThemeStore';

const taskAdapter = new LocalDeterministicAssistantAdapter();

const DEFAULT_PERMISSIONS: Record<AssistantPermissionScopeKey, AssistantPermissionLevel> = {
  tasks: 'ask_always',
  calendar: 'ask_always',
  family: 'denied',
  services: 'denied',
  finance: 'denied',
  photos: 'denied',
  files: 'denied',
};

interface AssistantStoreState {
  // Mode View: 'chat' | 'tasks' | 'permissions'
  currentView: 'chat' | 'tasks' | 'permissions';
  setCurrentView: (view: 'chat' | 'tasks' | 'permissions') => void;

  // AI Provider State
  providerInfo: {
    providerId: string;
    providerName: string;
    model: string;
    isOnline: boolean;
    message?: string;
  };
  fetchProviderHealth: () => Promise<void>;

  // Conversations & Chat
  conversations: AssistantConversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  activeError: string | null;
  createNewConversation: () => string;
  selectConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  sendMessage: (content: string, attachedPhoto?: PhotoAnalysisItem) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  resolveToolCall: (conversationId: string, messageId: string, toolCallId: string, approved: boolean) => Promise<void>;

  // Permissions & Audit
  permissions: Record<AssistantPermissionScopeKey, AssistantPermissionLevel>;
  setPermissionLevel: (scope: AssistantPermissionScopeKey, level: AssistantPermissionLevel) => void;
  revokeAllPermissions: () => void;
  grantSessionPermission: (conversationId: string, scope: AssistantPermissionScopeKey) => void;
  dataAccessLogs: DataAccessLog[];
  logDataAccess: (entry: Omit<DataAccessLog, 'id' | 'timestamp'>) => void;
  clearDataAccessLogs: () => void;

  // Photos
  stagedPhotos: PhotoAnalysisItem[];
  stagePhoto: (photo: PhotoAnalysisItem) => void;
  approvePhotoAnalysis: (photoId: string) => void;
  removeStagedPhoto: (photoId: string) => void;
  clearAllStagedPhotos: () => void;

  // Task Center State (Preserved)
  tasks: AssistantTask[];
  activeTaskTab: 'all' | 'pending_approval' | 'in_progress' | 'completed';
  selectedTaskCategory: string;
  isProcessingTask: boolean;
  activeTab: 'all' | 'pending_approval' | 'in_progress' | 'completed';
  selectedCategory: string;
  isProcessing: boolean;
  setActiveTaskTab: (tab: 'all' | 'pending_approval' | 'in_progress' | 'completed') => void;
  setSelectedTaskCategory: (category: string) => void;
  setActiveTab: (tab: 'all' | 'pending_approval' | 'in_progress' | 'completed') => void;
  setSelectedCategory: (category: string) => void;
  createTaskFromCommand: (command: string) => Promise<string>;
  addLocalTask: (title: string, description?: string) => string;
  completeTask: (taskId: string) => void;
  approveTask: (taskId: string) => Promise<void>;
  cancelTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  /** Offline / AI kapalıyken yerel plan üretip görev oluştur */
  runPlanOnlyReply: (command: string, conversationId: string) => Promise<void>;
}

export const useAssistantStore = create<AssistantStoreState>()(
  persist(
    (set, get) => ({
      currentView: 'chat',
      setCurrentView: (currentView) => set({ currentView }),

      // Provider State
      providerInfo: {
        providerId: 'ollama',
        providerName: 'Ollama Yerel AI',
        model: 'llama3.2',
        isOnline: false,
      },

      fetchProviderHealth: async () => {
        try {
          const res = await fetch('/api/assistant/chat', { method: 'GET' });
          if (res.ok) {
            const data = await res.json();
            set({
              providerInfo: {
                providerId: data.activeProvider || 'ollama',
                providerName: data.providerName || 'Ollama Yerel AI',
                model: data.activeModel || data.model || 'llama3.2',
                isOnline: Boolean(data.isAvailable),
                message: data.message,
              },
            });
          }
        } catch {
          set((state) => ({
            providerInfo: { ...state.providerInfo, isOnline: false },
          }));
        }
      },

      // Chat State
      conversations: [],
      activeConversationId: null,
      isStreaming: false,
      activeError: null,

      // Permissions State
      permissions: DEFAULT_PERMISSIONS,
      dataAccessLogs: [],

      // Photos State
      stagedPhotos: [],

      // Tasks State
      tasks: [],
      activeTaskTab: 'all',
      selectedTaskCategory: 'all',
      isProcessingTask: false,
      activeTab: 'all',
      selectedCategory: 'all',
      isProcessing: false,

      setActiveTaskTab: (activeTaskTab) => set({ activeTaskTab, activeTab: activeTaskTab }),
      setSelectedTaskCategory: (selectedTaskCategory) => set({ selectedTaskCategory, selectedCategory: selectedTaskCategory }),
      setActiveTab: (activeTab) => set({ activeTab, activeTaskTab: activeTab }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory, selectedTaskCategory: selectedCategory }),

      // -----------------------------------------------------------------------
      // CONVERSATION ACTIONS
      // -----------------------------------------------------------------------
      createNewConversation: () => {
        const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const now = new Date().toISOString();
        const newConv: AssistantConversation = {
          id,
          title: 'Yeni Sohbet',
          createdAt: now,
          updatedAt: now,
          messages: [],
          sessionGrantedScopes: [],
        };

        set((state) => ({
          conversations: [newConv, ...state.conversations],
          activeConversationId: id,
          activeError: null,
        }));

        return id;
      },

      selectConversation: (id) => {
        set({ activeConversationId: id, activeError: null });
      },

      renameConversation: (id, newTitle) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title: newTitle.trim() || c.title, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      deleteConversation: (id) => {
        set((state) => {
          const remaining = state.conversations.filter((c) => c.id !== id);
          return {
            conversations: remaining,
            activeConversationId:
              state.activeConversationId === id
                ? remaining.length > 0
                  ? remaining[0].id
                  : null
                : state.activeConversationId,
          };
        });
      },

      clearAllConversations: () => {
        set({ conversations: [], activeConversationId: null });
      },

      sendMessage: async (content: string, attachedPhoto?: PhotoAnalysisItem) => {
        let convId = get().activeConversationId;
        if (!convId) {
          convId = get().createNewConversation();
        }

        const now = new Date().toISOString();
        const userMsgId = `msg_${Date.now()}_user`;
        const userMessage: AssistantMessage = {
          id: userMsgId,
          role: 'user',
          content,
          timestamp: now,
          attachedPhotoIds: attachedPhoto ? [attachedPhoto.id] : undefined,
        };

        // If conversation has default title and this is first message, generate title from prompt
        const currentConv = get().conversations.find((c) => c.id === convId);
        const shouldRename = currentConv && (currentConv.title === 'Yeni Sohbet' || currentConv.messages.length === 0);
        const newTitle = shouldRename
          ? content.length > 28
            ? `${content.substring(0, 26)}...`
            : content
          : currentConv?.title || 'Sohbet';

        // Add user message to conversation
        set((state) => ({
          isStreaming: true,
          activeError: null,
          conversations: state.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  title: newTitle,
                  updatedAt: now,
                  messages: [...c.messages, userMessage],
                }
              : c
          ),
        }));

        // Determine accessible scopes for this request
        const effectiveScopes: AssistantPermissionScopeKey[] = [];
        const { permissions } = get();
        const conv = get().conversations.find((c) => c.id === convId);
        const sessionScopes = conv?.sessionGrantedScopes || [];

        (Object.keys(permissions) as AssistantPermissionScopeKey[]).forEach((scope) => {
          const level = permissions[scope];
          if (level === 'allowed' || (level === 'session_only' && sessionScopes.includes(scope))) {
            effectiveScopes.push(scope);
          }
        });

        // Log data access for granted scopes if used
        if (effectiveScopes.length > 0) {
          effectiveScopes.forEach((sc) => {
            get().logDataAccess({
              scope: sc,
              actionName: 'context_scope_passed',
              reason: 'Kullanıcının izin verdiği bağlam modele iletildi.',
              targetProvider: 'LifeOS AI Sunucu Adaptörü',
              status: 'allowed',
            });
          });
        }

        try {
          // Send to server API route
          const allMsgs = [...(conv?.messages || []), userMessage];
          const response = await fetch('/api/assistant/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: convId,
              messages: allMsgs,
              permissionScopes: effectiveScopes,
              contextData: { locale: useThemeStore.getState().locale },
              attachedPhoto: attachedPhoto
                ? {
                    fileName: attachedPhoto.fileName,
                    mimeType: attachedPhoto.mimeType,
                    analysisPurpose: attachedPhoto.analysisPurpose,
                    metadataStripped: false,
                  }
                : undefined,
            }),
          });

          const resData = await response.json();
          const assistantMsgId = `msg_${Date.now()}_assistant`;

          if (resData.provider) {
            set((state) => ({
              providerInfo: {
                ...state.providerInfo,
                providerId: resData.provider,
                providerName: resData.providerName || state.providerInfo.providerName,
                model: resData.model || state.providerInfo.model,
                isOnline: resData.status === 'success',
              },
            }));
          }

          if (!resData.configured || resData.status === 'offline' || resData.status === 'unconfigured') {
            set((state) => ({
              providerInfo: {
                ...state.providerInfo,
                isOnline: false,
                message: resData.message,
              },
            }));
            await get().runPlanOnlyReply(content, convId!);
            return;
          }

          if (resData.status === 'error' || resData.error) {
            const errorMsg: AssistantMessage = {
              id: assistantMsgId,
              role: 'assistant',
              content: `Bağlantı/Model Hatası: ${resData.message || resData.errorMessage || 'Model yanıtı alınamadı.'}`,
              timestamp: new Date().toISOString(),
              status: 'error',
              error: resData.message || resData.errorMessage,
            };

            set((state) => ({
              isStreaming: false,
              activeError: resData.message || resData.errorMessage,
              conversations: state.conversations.map((c) =>
                c.id === convId ? { ...c, messages: [...c.messages, errorMsg] } : c
              ),
            }));
            return;
          }

          const assistantMsg: AssistantMessage = {
            id: assistantMsgId,
            role: 'assistant',
            content: resData.content || '',
            timestamp: new Date().toISOString(),
            status: 'complete',
            toolCalls: resData.suggestedToolCalls?.length > 0 ? resData.suggestedToolCalls : undefined,
          };

          set((state) => ({
            isStreaming: false,
            conversations: state.conversations.map((c) =>
              c.id === convId ? { ...c, messages: [...c.messages, assistantMsg] } : c
            ),
          }));
        } catch (err: any) {
          set((state) => ({
            providerInfo: { ...state.providerInfo, isOnline: false },
            activeError: err?.message || 'Bağlantı hatası',
          }));
          await get().runPlanOnlyReply(content, convId!);
        }
      },

      runPlanOnlyReply: async (command: string, conversationId: string) => {
        const now = new Date().toISOString();
        try {
          const taskId = await get().createTaskFromCommand(command);
          const task = get().tasks.find((t) => t.id === taskId);
          const stepsText =
            task?.steps.map((s, i) => `${i + 1}. ${s.title}`).join('\n') || '—';

          const planMsg: AssistantMessage = {
            id: `msg_${Date.now()}_plan`,
            role: 'assistant',
            content: [
              'AI modeli şu an kapalı — **plan-only** modundayım.',
              'Komutunu yerel görev planına çevirdim (cihazında saklanır).',
              '',
              `**${task?.title || 'Görev'}**`,
              task?.description || '',
              '',
              'Adımlar:',
              stepsText,
              '',
              'Görevler sekmesinden onaylayabilir veya tamamlayabilirsin. Ollama açıksa sohbet AI yanıtı da gelir.',
            ].join('\n'),
            timestamp: now,
            status: 'complete',
            toolCalls: [
              {
                id: `tc_open_task_${taskId}`,
                name: 'open_local_task',
                labelTr: 'Görevi aç',
                isWriteAction: false,
                arguments: { taskId },
                status: 'executed',
              },
            ],
          };

          set((state) => ({
            isStreaming: false,
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, updatedAt: now, messages: [...c.messages, planMsg] }
                : c
            ),
          }));
        } catch {
          const errMsg: AssistantMessage = {
            id: `msg_${Date.now()}_plan_err`,
            role: 'assistant',
            content:
              'AI kapalı ve yerel plan da oluşturulamadı. Görevler sekmesinden elle görev ekleyebilirsin.',
            timestamp: now,
            status: 'error',
          };
          set((state) => ({
            isStreaming: false,
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, messages: [...c.messages, errMsg] }
                : c
            ),
          }));
        }
      },

      retryLastMessage: async () => {
        const convId = get().activeConversationId;
        if (!convId) return;
        const conv = get().conversations.find((c) => c.id === convId);
        if (!conv || conv.messages.length === 0) return;

        // Find last user message
        const lastUserMsg = [...conv.messages].reverse().find((m) => m.role === 'user');
        if (!lastUserMsg) return;

        // Remove last assistant message if errored
        const cleanedMessages = conv.messages.filter((m, idx) => {
          if (idx === conv.messages.length - 1 && m.role === 'assistant') return false;
          return true;
        });

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId ? { ...c, messages: cleanedMessages } : c
          ),
        }));

        await get().sendMessage(lastUserMsg.content);
      },

      resolveToolCall: async (conversationId: string, messageId: string, toolCallId: string, approved: boolean) => {
        const conv = get().conversations.find((c) => c.id === conversationId);
        if (!conv) return;

        const msg = conv.messages.find((m) => m.id === messageId);
        if (!msg || !msg.toolCalls) return;

        const toolCall = msg.toolCalls.find((t) => t.id === toolCallId);
        if (!toolCall) return;

        if (approved) {
          if (toolCall.requiredScope) {
            get().grantSessionPermission(conversationId, toolCall.requiredScope);
            get().logDataAccess({
              scope: toolCall.requiredScope,
              actionName: toolCall.name,
              reason: toolCall.permissionReason || 'Kullanıcı sohbet içi veri izni verdi.',
              targetProvider: 'LifeOS Güvenli AI Sunucusu',
              status: 'allowed',
            });
          }

          const toolName = toolCall.name.toLowerCase();
          if (
            toolName.includes('task') ||
            toolName === 'create_lifeos_task' ||
            toolName === 'create_life_task'
          ) {
            const title =
              (typeof toolCall.arguments?.title === 'string' && toolCall.arguments.title) ||
              (typeof toolCall.arguments?.command === 'string' && toolCall.arguments.command) ||
              toolCall.labelTr ||
              'Yeni görev';
            const description =
              typeof toolCall.arguments?.description === 'string'
                ? toolCall.arguments.description
                : undefined;
            if (toolCall.arguments?.command && typeof toolCall.arguments.command === 'string') {
              await get().createTaskFromCommand(toolCall.arguments.command);
            } else {
              get().addLocalTask(title, description);
            }
          }

          // Mark toolCall as executed
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === messageId
                        ? {
                            ...m,
                            toolCalls: m.toolCalls?.map((tc) =>
                              tc.id === toolCallId ? { ...tc, status: 'executed' as const } : tc
                            ),
                          }
                        : m
                    ),
                  }
                : c
            ),
          }));
        } else {
          // Rejected
          if (toolCall.requiredScope) {
            get().logDataAccess({
              scope: toolCall.requiredScope,
              actionName: toolCall.name,
              reason: 'Kullanıcı veri erişim isteğini reddetti.',
              targetProvider: 'LifeOS Güvenli AI Sunucusu',
              status: 'denied',
            });
          }

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === messageId
                        ? {
                            ...m,
                            toolCalls: m.toolCalls?.map((tc) =>
                              tc.id === toolCallId ? { ...tc, status: 'rejected' as const } : tc
                            ),
                          }
                        : m
                    ),
                  }
                : c
            ),
          }));
        }
      },

      // -----------------------------------------------------------------------
      // PERMISSION ACTIONS
      // -----------------------------------------------------------------------
      setPermissionLevel: (scope, level) => {
        set((state) => ({
          permissions: {
            ...state.permissions,
            [scope]: level,
          },
        }));

        get().logDataAccess({
          scope,
          actionName: 'update_permission_policy',
          reason: `İzin düzeyi güncellendi: ${level}`,
          targetProvider: 'LifeOS Güvenlik Merkezi',
          status: level === 'denied' ? 'denied' : 'allowed',
        });
      },

      revokeAllPermissions: () => {
        set({
          permissions: DEFAULT_PERMISSIONS,
          conversations: get().conversations.map((c) => ({
            ...c,
            sessionGrantedScopes: [],
          })),
        });

        get().logDataAccess({
          scope: 'tasks',
          actionName: 'revoke_all_permissions',
          reason: 'Kullanıcı tüm asistan izinlerini tek noktadan sıfırladı.',
          targetProvider: 'LifeOS Güvenlik Merkezi',
          status: 'revoked',
        });
      },

      grantSessionPermission: (conversationId, scope) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  sessionGrantedScopes: Array.from(new Set([...c.sessionGrantedScopes, scope])),
                }
              : c
          ),
        }));
      },

      logDataAccess: (entry) => {
        const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const logItem: DataAccessLog = {
          id,
          timestamp: new Date().toISOString(),
          ...entry,
        };

        set((state) => ({
          dataAccessLogs: [logItem, ...state.dataAccessLogs.slice(0, 99)],
        }));
      },

      clearDataAccessLogs: () => {
        set({ dataAccessLogs: [] });
      },

      // -----------------------------------------------------------------------
      // PHOTO ACTIONS
      // -----------------------------------------------------------------------
      stagePhoto: (photo) => {
        set((state) => ({
          stagedPhotos: [photo, ...state.stagedPhotos],
        }));
      },

      approvePhotoAnalysis: (photoId) => {
        set((state) => ({
          stagedPhotos: state.stagedPhotos.map((p) =>
            p.id === photoId ? { ...p, approved: true, status: 'ready_for_analysis' as const } : p
          ),
        }));

        get().logDataAccess({
          scope: 'photos',
          actionName: 'approve_photo_analysis',
          reason: 'Kullanıcı seçili fotoğrafın modele gönderilmesini onayladı.',
          targetProvider: 'LifeOS Güvenli AI Sunucusu',
          status: 'allowed',
        });
      },

      removeStagedPhoto: (photoId) => {
        set((state) => ({
          stagedPhotos: state.stagedPhotos.filter((p) => p.id !== photoId),
        }));
      },

      clearAllStagedPhotos: () => {
        set({ stagedPhotos: [] });
      },

      // -----------------------------------------------------------------------
      // TASK ACTIONS (PRESERVED)
      // -----------------------------------------------------------------------
      addLocalTask: (title, description) => {
        const now = new Date().toISOString();
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const trimmed = title.trim().slice(0, 120) || 'Yeni görev';
        const newTask: AssistantTask = {
          id: taskId,
          title: trimmed,
          description: (description || 'Elle eklenen yerel görev').slice(0, 500),
          type: 'planning',
          status: 'in_progress',
          createdAt: now,
          updatedAt: now,
          requiredScopes: ['tasks'],
          grantedScopes: ['tasks'],
          requiresApproval: false,
          steps: [
            {
              id: 's1',
              title: 'Görevi tamamla',
              status: 'in_progress',
              details: 'İş bitince Tamamla ile işaretle.',
            },
          ],
          logs: [
            {
              timestamp: now,
              level: 'info',
              message: 'Yerel görev oluşturuldu (plan-only).',
            },
          ],
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        return taskId;
      },

      completeTask: (taskId) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId && t.status !== 'completed' && t.status !== 'cancelled'
              ? {
                  ...t,
                  status: 'completed' as const,
                  completedAt: now,
                  updatedAt: now,
                  steps: t.steps.map((s) => ({ ...s, status: 'completed' as const })),
                  resultSummary: `"${t.title}" yerel olarak tamamlandı.`,
                  logs: [
                    ...t.logs,
                    {
                      timestamp: now,
                      level: 'info' as const,
                      message: 'Görev kullanıcı tarafından tamamlandı olarak işaretlendi.',
                    },
                  ],
                }
              : t
          ),
        }));
      },

      createTaskFromCommand: async (command: string) => {
        set({ isProcessingTask: true, isProcessing: true });
        try {
          const parsed = await taskAdapter.parseCommand(command);
          const now = new Date().toISOString();
          const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

          const initialSteps: AssistantTaskStep[] = parsed.steps.map((s, idx) => ({
            id: s.id,
            title: s.title,
            details: s.details,
            status: idx === 0 ? 'in_progress' : 'pending',
          }));

          const initialLogs: AssistantTaskLog[] = [
            {
              timestamp: now,
              level: 'info',
              message: `Görev oluşturuldu: "${parsed.title}". Yerel plan adımları hazır.`,
            },
          ];

          const newTask: AssistantTask = {
            id: taskId,
            title: parsed.title,
            description: parsed.description,
            type: parsed.type,
            status: parsed.requiresApproval ? 'pending_approval' : 'in_progress',
            createdAt: now,
            updatedAt: now,
            requiredScopes: parsed.requiredScopes,
            grantedScopes: [],
            requiresApproval: parsed.requiresApproval,
            approvalDescription: parsed.approvalDescription,
            approvalRequestedAt: parsed.requiresApproval ? now : undefined,
            steps: initialSteps,
            logs: initialLogs,
            contentDetails: parsed.contentDetails,
            serviceKind: parsed.serviceKind,
          };

          set((state) => ({
            tasks: [newTask, ...state.tasks],
            isProcessingTask: false,
            isProcessing: false,
          }));

          return taskId;
        } catch (error) {
          set({ isProcessingTask: false, isProcessing: false });
          throw error;
        }
      },

      approveTask: async (taskId: string) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;

        const now = new Date().toISOString();
        const updatedLogs: AssistantTaskLog[] = [
          ...task.logs,
          {
            timestamp: now,
            level: 'info',
            message: 'Kullanıcı onayı verildi. Görev adımları güvenli ortamda yürütülüyor.',
          },
        ];

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'in_progress',
                  approvedAt: now,
                  grantedScopes: Array.from(new Set([...t.grantedScopes, ...t.requiredScopes])),
                  updatedAt: now,
                  logs: updatedLogs,
                }
              : t
          ),
        }));

        setTimeout(() => {
          const completedNow = new Date().toISOString();
          const allCompletedSteps = task.steps.map((s) => ({
            ...s,
            status: 'completed' as const,
          }));

          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    status: 'completed',
                    completedAt: completedNow,
                    updatedAt: completedNow,
                    steps: allCompletedSteps,
                    resultSummary: `"${t.title}" görevi tüm güvenlik kontrollerinden geçerek başarıyla tamamlandı.`,
                    logs: [
                      ...t.logs,
                      {
                        timestamp: completedNow,
                        level: 'info',
                        message: 'Tüm adımlar ve doğrulama süreçleri başarıyla tamamlandı.',
                      },
                    ],
                  }
                : t
            ),
          }));
        }, 1200);
      },

      cancelTask: (taskId: string) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'cancelled',
                  updatedAt: now,
                  logs: [
                    ...t.logs,
                    {
                      timestamp: now,
                      level: 'warn',
                      message: 'Görev kullanıcı tarafından iptal edildi.',
                    },
                  ],
                }
              : t
          ),
        }));
      },

      deleteTask: (taskId: string) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        }));
      },
    }),
    {
      name: 'life-assistant-v2',
      partialize: (state) => ({
        conversations: state.conversations,
        permissions: state.permissions,
        dataAccessLogs: state.dataAccessLogs,
        tasks: state.tasks,
        currentView: state.currentView,
      }),
      merge: (persisted, current) => {
        const p = (persisted || {}) as Partial<AssistantStoreState>;
        let legacy: Partial<AssistantStoreState> = {};
        if (typeof window !== 'undefined') {
          try {
            const raw = window.localStorage.getItem('lifeos-assistant-storage');
            if (raw) {
              const parsed = JSON.parse(raw);
              legacy = (parsed?.state || parsed) as Partial<AssistantStoreState>;
            }
          } catch {
            /* ignore */
          }
        }
        return {
          ...current,
          ...legacy,
          ...p,
          conversations: p.conversations ?? legacy.conversations ?? current.conversations,
          permissions: p.permissions ?? legacy.permissions ?? current.permissions,
          dataAccessLogs: p.dataAccessLogs ?? legacy.dataAccessLogs ?? current.dataAccessLogs,
          tasks: p.tasks ?? legacy.tasks ?? current.tasks,
          currentView: p.currentView ?? legacy.currentView ?? current.currentView,
        };
      },
    }
  )
);
