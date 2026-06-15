<template>
  <div class="admin-panel">
    <div class="container">
      <header class="admin-header card">
        <div class="admin-header-inner">
          <div>
            <h1>🛠️ 故事管理中心</h1>
            <p class="admin-subtitle">管理所有社区微小说，支持重置与归档</p>
          </div>
          <button class="btn-secondary" @click="loadStories">
            🔄 刷新列表
          </button>
        </div>
      </header>

      <div class="tab-bar">
        <button
          :class="['tab-btn', activeTab === 'active' ? 'active' : '']"
          @click="activeTab = 'active'"
        >
          📖 活跃故事
          <span v-if="activeStories.length" class="badge">{{ activeStories.length }}</span>
        </button>
        <button
          :class="['tab-btn', activeTab === 'archived' ? 'active' : '']"
          @click="activeTab = 'archived'"
        >
          📦 归档故事
          <span v-if="archivedStories.length" class="badge badge-muted">{{ archivedStories.length }}</span>
        </button>
      </div>

      <section v-if="activeTab === 'active'" class="admin-content card">
        <div v-if="loading" class="loading">正在加载...</div>

        <div v-else-if="activeStories.length === 0" class="empty">
          <div class="empty-icon">📭</div>
          <p>暂无活跃故事</p>
        </div>

        <template v-else>
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>故事标题</th>
                  <th class="num-col">参与人数</th>
                  <th class="num-col">段数</th>
                  <th class="num-col">字数</th>
                  <th class="status-col">状态</th>
                  <th class="time-col">最后更新</th>
                  <th class="action-col">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in activeStories" :key="s.id">
                  <td class="title-cell">
                    <router-link :to="`/story/${s.id}`" class="story-link">
                      <span class="story-name">{{ s.title }}</span>
                    </router-link>
                    <span class="story-id">#{{ s.id.slice(0, 8) }}</span>
                  </td>
                  <td class="num-col">
                    <span
                      :class="['num-val', s.participantCount >= 10 ? 'num-warn' : '']"
                    >
                      {{ s.participantCount }}/10
                    </span>
                  </td>
                  <td class="num-col">{{ s.entryCount }}</td>
                  <td class="num-col">
                    <span
                      :class="['num-val', s.totalChars >= 5000 ? 'num-warn' : '']"
                    >
                      {{ s.totalChars }}/5000
                    </span>
                  </td>
                  <td class="status-col">
                    <span
                      :class="['tag', s.locked ? 'tag-success' : 'tag-warning']"
                    >
                      {{ s.locked ? '已完结' : '进行中' }}
                    </span>
                  </td>
                  <td class="time-col">
                    <span class="time">{{ formatTime(s.updatedAt) }}</span>
                  </td>
                  <td class="action-col">
                    <div class="actions">
                      <button
                        class="btn-secondary btn-sm"
                        @click="viewStory(s.id, s.archived)"
                      >查看</button>
                      <button
                        class="btn-danger btn-sm"
                        :disabled="resetting === s.id || s.entryCount <= 1"
                        @click="askReset(s)"
                      >
                        {{ resetting === s.id ? '重置中...' : '重置' }}
                      </button>
                      <button
                        class="btn-archive btn-sm"
                        :disabled="archiving === s.id"
                        @click="askArchive(s)"
                      >
                        {{ archiving === s.id ? '归档中...' : '归档' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            共 <strong>{{ activeStories.length }}</strong> 篇活跃故事
          </div>
        </template>
      </section>

      <section v-if="activeTab === 'archived'" class="admin-content card">
        <div v-if="loading" class="loading">正在加载...</div>

        <div v-else-if="archivedStories.length === 0" class="empty">
          <div class="empty-icon">📭</div>
          <p>暂无归档故事</p>
        </div>

        <template v-else>
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>故事标题</th>
                  <th class="num-col">段数</th>
                  <th class="num-col">字数</th>
                  <th class="status-col">状态</th>
                  <th class="time-col">归档时间</th>
                  <th class="action-col">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in archivedStories" :key="s.id" class="archived-row">
                  <td class="title-cell">
                    <router-link :to="`/story/${s.id}`" class="story-link">
                      <span class="story-name">{{ s.title }}</span>
                    </router-link>
                    <span class="story-id">#{{ s.id.slice(0, 8) }}</span>
                  </td>
                  <td class="num-col">{{ s.entryCount }}</td>
                  <td class="num-col">{{ s.totalChars }}/5000</td>
                  <td class="status-col">
                    <span class="tag tag-info">已归档</span>
                  </td>
                  <td class="time-col">
                    <span class="time">{{ formatTime(s.archivedAt) }}</span>
                  </td>
                  <td class="action-col">
                    <div class="actions">
                      <button
                        class="btn-secondary btn-sm"
                        @click="viewStory(s.id, s.archived)"
                      >查看</button>
                      <button
                        class="btn-unarchive btn-sm"
                        :disabled="unarchiving === s.id"
                        @click="askUnarchive(s)"
                      >
                        {{ unarchiving === s.id ? '恢复中...' : '恢复' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            共 <strong>{{ archivedStories.length }}</strong> 篇归档故事
          </div>
        </template>
      </section>
    </div>

    <div
      v-if="confirmVisible"
      class="modal-mask"
      @click.self="confirmVisible = false"
    >
      <div class="modal card confirm-modal">
        <div :class="['modal-header', confirmAction === 'reset' ? 'danger' : '']">
          <h3>{{ confirmAction === 'reset' ? '⚠️ 确认重置' : confirmAction === 'archive' ? '📦 确认归档' : '📖 确认恢复' }}</h3>
          <button class="close-btn" @click="confirmVisible = false">×</button>
        </div>
        <div class="modal-body">
          <div class="confirm-content">
            <div class="confirm-icon">{{ confirmAction === 'reset' ? '💥' : confirmAction === 'archive' ? '📦' : '📖' }}</div>
            <p class="confirm-text">
              <template v-if="confirmAction === 'reset'">
                确定要重置故事 <strong>{{ targetStory?.title }}</strong> 吗？
              </template>
              <template v-else-if="confirmAction === 'archive'">
                确定要归档故事 <strong>{{ targetStory?.title }}</strong> 吗？
              </template>
              <template v-else>
                确定要将故事 <strong>{{ targetStory?.title }}</strong> 恢复到广场吗？
              </template>
            </p>
            <ul class="confirm-info">
              <template v-if="confirmAction === 'reset'">
                <li>当前 <strong>{{ targetStory?.entryCount }}</strong> 段接龙将被清除</li>
                <li>只保留开篇第一段内容</li>
                <li>重置后状态将变为「进行中」</li>
                <li>此操作不可撤销</li>
              </template>
              <template v-else-if="confirmAction === 'archive'">
                <li>归档后故事将从广场隐藏</li>
                <li>管理中心仍可查看和恢复</li>
                <li>已归档的故事不会出现在故事广场</li>
              </template>
              <template v-else>
                <li>故事将重新出现在故事广场</li>
                <li>恢复后可继续接龙（如未锁定）</li>
              </template>
            </ul>
          </div>
          <div v-if="confirmError" class="error-text">{{ confirmError }}</div>
        </div>
        <div class="modal-footer">
          <button
            class="btn-secondary"
            :disabled="confirmLoading"
            @click="confirmVisible = false"
          >
            取消
          </button>
          <button
            :class="[confirmAction === 'reset' ? 'btn-danger' : confirmAction === 'archive' ? 'btn-archive' : 'btn-unarchive']"
            :disabled="confirmLoading"
            @click="doConfirm"
          >
            {{ confirmLoading ? '处理中...' : confirmAction === 'reset' ? '确认重置' : confirmAction === 'archive' ? '确认归档' : '确认恢复' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api.js'
import { formatTime } from '../utils.js'

const router = useRouter()
const stories = ref([])
const loading = ref(false)
const resetting = ref(null)
const archiving = ref(null)
const unarchiving = ref(null)
const activeTab = ref('active')

const confirmVisible = ref(false)
const confirmAction = ref('')
const confirmError = ref('')
const confirmLoading = ref(false)
const targetStory = ref(null)

const toast = ref({ show: false, message: '', type: 'success' })

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => (toast.value.show = false), 2800)
}

const activeStories = computed(() => stories.value.filter(s => !s.archived))
const archivedStories = computed(() => stories.value.filter(s => s.archived))

async function loadStories() {
  loading.value = true
  try {
    stories.value = await api.getStories({ includeArchived: 'true' })
  } catch (e) {
    showToast('加载失败：' + e.message, 'error')
  } finally {
    loading.value = false
  }
}

function viewStory(id, isArchived) {
  if (isArchived) {
    router.push({ path: `/story/${id}`, query: { admin: 'true' } })
  } else {
    router.push(`/story/${id}`)
  }
}

function askReset(story) {
  targetStory.value = story
  confirmAction.value = 'reset'
  confirmError.value = ''
  confirmVisible.value = true
}

function askArchive(story) {
  targetStory.value = story
  confirmAction.value = 'archive'
  confirmError.value = ''
  confirmVisible.value = true
}

function askUnarchive(story) {
  targetStory.value = story
  confirmAction.value = 'unarchive'
  confirmError.value = ''
  confirmVisible.value = true
}

async function doConfirm() {
  if (!targetStory.value) return
  confirmError.value = ''
  confirmLoading.value = true
  const id = targetStory.value.id
  try {
    if (confirmAction.value === 'reset') {
      resetting.value = id
      await api.resetStory(id)
      confirmVisible.value = false
      showToast('故事已重置成功')
    } else if (confirmAction.value === 'archive') {
      archiving.value = id
      await api.archiveStory(id)
      confirmVisible.value = false
      showToast('故事已归档')
    } else if (confirmAction.value === 'unarchive') {
      unarchiving.value = id
      await api.unarchiveStory(id)
      confirmVisible.value = false
      showToast('故事已恢复到广场')
    }
    await loadStories()
  } catch (e) {
    confirmError.value = e.message
  } finally {
    resetting.value = null
    archiving.value = null
    unarchiving.value = null
    confirmLoading.value = false
  }
}

onMounted(loadStories)
</script>

<style scoped>
.admin-header {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #fef3c7 0%, #fee2e2 100%);
  border-color: #fed7aa;
}

.admin-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.admin-header h1 {
  font-size: 22px;
  margin-bottom: 4px;
}

.admin-subtitle {
  color: var(--text-muted);
  font-size: 14px;
}

.tab-bar {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 0;
  transition: all 0.2s;
}

.tab-btn:first-child {
  border-radius: var(--radius-sm) 0 0 var(--radius-sm);
}

.tab-btn:last-child {
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  border-left: none;
}

.tab-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.tab-btn.active .badge-muted {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.badge-muted {
  background: var(--surface-alt);
  color: var(--text-muted);
}

.table-wrap {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.admin-table thead th {
  text-align: left;
  padding: 12px 14px;
  background: var(--surface-alt);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 13px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.admin-table tbody td {
  padding: 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.admin-table tbody tr:hover {
  background: var(--surface-alt);
}

.archived-row {
  opacity: 0.75;
}

.archived-row:hover {
  opacity: 1;
}

.admin-table tbody tr:last-child td {
  border-bottom: none;
}

.num-col {
  text-align: center;
  white-space: nowrap;
}

.status-col,
.time-col,
.action-col {
  text-align: center;
  white-space: nowrap;
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.story-link {
  display: inline;
}

.story-name {
  font-weight: 500;
  color: var(--text);
}

.story-link:hover .story-name {
  color: var(--primary);
}

.story-id {
  font-size: 11px;
  color: var(--text-light);
  font-family: monospace;
}

.num-val {
  font-variant-numeric: tabular-nums;
}

.num-warn {
  color: var(--error);
  font-weight: 600;
}

.time {
  font-size: 13px;
  color: var(--text-muted);
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-archive {
  background: #6366f1;
  color: white;
  padding: 10px 20px;
  font-size: 14px;
}

.btn-archive:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-archive.btn-sm {
  padding: 6px 14px;
  font-size: 12px;
}

.btn-unarchive {
  background: #10b981;
  color: white;
  padding: 10px 20px;
  font-size: 14px;
}

.btn-unarchive:hover:not(:disabled) {
  background: #059669;
}

.btn-unarchive.btn-sm {
  padding: 6px 14px;
  font-size: 12px;
}

.table-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  text-align: right;
  color: var(--text-muted);
  font-size: 13px;
}

.table-footer strong {
  color: var(--primary);
  font-size: 16px;
  margin: 0 4px;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  width: 100%;
  max-width: 460px;
}

.confirm-modal {
  animation: zoomIn 0.2s ease;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}

.modal-header.danger h3 {
  color: var(--error);
}

.modal-header h3 {
  font-size: 18px;
}

.close-btn {
  background: none;
  font-size: 28px;
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  padding: 0;
  line-height: 1;
  border-radius: 50%;
}

.close-btn:hover {
  background: var(--surface-alt);
  color: var(--text);
}

.confirm-content {
  text-align: center;
  margin-bottom: 16px;
}

.confirm-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.confirm-text {
  font-size: 16px;
  margin-bottom: 14px;
}

.confirm-text strong {
  color: var(--primary);
}

.confirm-info {
  text-align: left;
  list-style: none;
  background: var(--surface-alt);
  padding: 14px 18px;
  border-radius: var(--radius-sm);
}

.confirm-info li {
  padding: 4px 0;
  color: var(--text-muted);
  font-size: 13px;
}

.confirm-info li::before {
  content: '• ';
  color: var(--primary);
  font-weight: bold;
}

.modal-header.danger + .modal-body .confirm-info li::before {
  color: var(--error);
}

.confirm-info strong {
  color: var(--error);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  margin-top: 8px;
}

.toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  color: white;
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
  box-shadow: var(--shadow-lg);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.toast.success {
  background: var(--success);
}

.toast.error {
  background: var(--error);
}

@media (max-width: 640px) {
  .admin-header-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .confirm-info {
    padding: 12px 14px;
  }
  .tab-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
  .actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
