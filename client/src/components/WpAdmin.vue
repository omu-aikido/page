<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";

const currentHash = ref(window.location.hash.replace(/^#/, ''));
const isSidebarCollapsed = ref(false);
const showHelp = ref(false);
const showScreenOptions = ref(false);

const updateHash = () => {
  const newHash = window.location.hash.replace(/^#/, '');
  currentHash.value = newHash;
  showHelp.value = false;
  showScreenOptions.value = false;
};

onMounted(() => {
  window.addEventListener('hashchange', updateHash);
  window.addEventListener('popstate', updateHash);
  updateHash();
});

onUnmounted(() => {
  window.removeEventListener("hashchange", updateHash);
  window.removeEventListener("popstate", updateHash);
});

const logout = () => {
  sessionStorage.removeItem("wp_logged_in");
  window.location.href = "/wp-login.php";
};

const navItems = [
  {
    name: "ダッシュボード",
    hash: "",
    icon: "i-ri-dashboard-fill",
    sub: [
      { name: "ホーム", hash: "" },
      { name: "更新", hash: "update-core" },
    ],
  },
  {
    name: "投稿",
    hash: "posts",
    icon: "i-ri-pushpin-fill",
    sub: [
      { name: "投稿一覧", hash: "posts" },
      { name: "新規追加", hash: "post-new" },
      { name: "カテゴリー", hash: "edit-tags?taxonomy=category" },
      { name: "タグ", hash: "edit-tags?taxonomy=post_tag" },
    ],
  },
  {
    name: "メディア",
    hash: "media",
    icon: "i-ri-image-fill",
    sub: [
      { name: "ライブラリ", hash: "media" },
      { name: "新規追加", hash: "media-new" },
    ],
  },
  {
    name: "固定ページ",
    hash: "pages",
    icon: "i-ri-file-copy-2-fill",
    sub: [
      { name: "固定ページ一覧", hash: "pages" },
      { name: "新規追加", hash: "page-new" },
    ],
  },
  { name: "コメント", hash: "comments", icon: "i-ri-chat-3-fill", count: 12 },
  {
    name: "外観",
    hash: "appearance",
    icon: "i-ri-palette-fill",
    sub: [
      { name: "テーマ", hash: "themes" },
      { name: "カスタマイズ", hash: "customize" },
      { name: "ウィジェット", hash: "widgets" },
      { name: "メニュー", hash: "nav-menus" },
    ],
  },
  {
    name: "プラグイン",
    hash: "plugins",
    icon: "i-ri-plug-fill",
    count: 2,
    sub: [
      { name: "インストール済みプラグイン", hash: "plugins" },
      { name: "新規追加", hash: "plugin-install" },
      { name: "プラグインファイルエディター", hash: "plugin-editor" },
    ],
  },
  {
    name: "ユーザー",
    hash: "users",
    icon: "i-ri-user-fill",
    sub: [
      { name: "ユーザー一覧", hash: "users" },
      { name: "新規追加", hash: "user-new" },
      { name: "プロフィール", hash: "profile" },
    ],
  },
  {
    name: "ツール",
    hash: "tools",
    icon: "i-ri-tools-fill",
    sub: [
      { name: "利用可能なツール", hash: "tools" },
      { name: "インポート", hash: "import" },
      { name: "エクスポート", hash: "export" },
      { name: "サイトヘルス", hash: "site-health" },
    ],
  },
  {
    name: "設定",
    hash: "settings",
    icon: "i-ri-settings-3-fill",
    sub: [
      { name: "一般", hash: "settings" },
      { name: "投稿設定", hash: "settings-writing" },
      { name: "表示設定", hash: "settings-reading" },
      { name: "ディスカッション", hash: "settings-discussion" },
      { name: "メディア", hash: "settings-media" },
      { name: "パーマリンク", hash: "settings-permalink" },
    ],
  },
];

const posts = [
  { id: 1, title: "四方投げの極意について", author: "合氣道 太郎", categories: "技法解説", tags: "四方投げ, 初心者", comments: 5, date: "2024/04/22", status: "公開済み" },
  { id: 2, title: "【速報】畳を新調しました", author: "主務", categories: "お知らせ", tags: "道場設備", comments: 12, date: "2024/04/15", status: "公開済み" },
  { id: 3, title: "春季合宿のしおり（案）", author: "主務", categories: "イベント", tags: "合宿", comments: 0, date: "2024/04/10", status: "下書き" },
  { id: 4, title: "入部体験会のお知らせ", author: "広報", categories: "お知らせ", tags: "新入生", comments: 3, date: "2024/04/05", status: "公開済み" },
];

const comments = [
  { id: 1, author: "稽古生A", content: "非常に参考になりました！", post: "四方投げの極意について", date: "2024/04/23" },
  { id: 2, author: "OB 斉藤", content: "畳が新しくなると気合が入りますね。", post: "【速報】畳を新調しました", date: "2024/04/20" },
];

const isActive = (hash: string) => {
  return currentHash.value === hash;
};

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const toggleHelp = () => {
  showHelp.value = !showHelp.value;
  showScreenOptions.value = false;
};

const toggleScreenOptions = () => {
  showScreenOptions.value = !showScreenOptions.value;
  showHelp.value = false;
};
</script>

<template>
  <div class="bg-[#f0f0f1] text-[#3c434a] font-sans h-screen flex flex-col overflow-hidden select-none">
    <!-- Top Bar -->
    <header class="h-8 bg-[#1d2327] text-[#c3c4c7] flex items-center justify-between shrink-0 z-[60]">
      <div class="flex items-center h-full">
        <a href="/wp-admin#" aria-label="トップ" class="flex items-center gap-1 h-full px-3 hover:bg-[#2c3338] hover:text-[#72aee6] cursor-pointer transition-colors">
          <div class="i-ri-wordpress-fill text-lg"></div>
        </a>
        <a href="/wp-admin#" class="flex items-center gap-2 h-full px-3 hover:bg-[#2c3338] hover:text-[#72aee6] cursor-pointer transition-colors" title="サイトを表示">
          <div class="i-ri-home-4-line text-lg"></div>
          <span class="font-bold text-sm hidden sm:inline">大阪公立大学合氣道部</span>
        </a>
        <div class="flex items-center gap-1 h-full px-3 hover:bg-[#2c3338] hover:text-[#72aee6] cursor-pointer transition-colors" title="更新">
          <div class="i-ri-refresh-line text-lg"></div>
          <span class="text-xs hidden sm:inline">2</span>
        </div>
        <div class="flex items-center gap-1 h-full px-3 hover:bg-[#2c3338] hover:text-[#72aee6] cursor-pointer transition-colors" title="コメント">
          <div class="i-ri-chat-3-line text-lg"></div>
          <span class="text-xs hidden sm:inline">12</span>
        </div>
        <div class="flex items-center gap-1 h-full px-3 hover:bg-[#2c3338] hover:text-[#72aee6] cursor-pointer transition-colors relative group">
          <div class="i-ri-add-line text-lg font-bold"></div>
          <span class="text-sm hidden sm:inline">新規</span>
          <div class="absolute top-8 left-0 w-32 bg-[#2c3338] hidden group-hover:block border-t border-[#1d2327] shadow-lg">
            <a href="#posts" class="block px-3 py-1.5 hover:text-[#72aee6] text-xs">投稿</a>
            <a href="#media" class="block px-3 py-1.5 hover:text-[#72aee6] text-xs">メディア</a>
            <a href="#pages" class="block px-3 py-1.5 hover:text-[#72aee6] text-xs">固定ページ</a>
            <a href="#users" class="block px-3 py-1.5 hover:text-[#72aee6] text-xs">ユーザー</a>
          </div>
        </div>
      </div>
      <div class="flex items-center h-full">
        <div class="flex items-center gap-2 h-full px-3 hover:bg-[#2c3338] hover:text-[#72aee6] cursor-pointer transition-colors group relative" @click="logout">
          <span class="text-sm">こんにちは、<span class="font-bold">管理者</span> さん</span>
          <div class="w-6 h-6 bg-[#8c8f94] rounded-full overflow-hidden border border-[#c3c4c7]/30">
            <img src="https://secure.gravatar.com/avatar/fb3d6291696230f8139556ee0e311094?s=32&d=mm&r=g" class="w-full h-full object-cover opacity-80 group-hover:opacity-100" alt="user icon" />
          </div>
          <div class="absolute top-8 right-0 w-48 bg-[#2c3338] hidden group-hover:block border-t border-[#1d2327] shadow-lg text-[13px] z-[70]">
             <div class="p-3 border-b border-[#1d2327] flex items-center gap-3">
                <div class="w-10 h-10 bg-[#8c8f94] rounded-full overflow-hidden">
                   <img src="https://secure.gravatar.com/avatar/fb3d6291696230f8139556ee0e311094?s=64&d=mm&r=g" class="w-full h-full" />
                </div>
                <div>
                   <div class="font-bold text-white">管理者</div>
                   <div class="text-[11px] text-[#a7aaad]">pod@honey.omu-aikido.com</div>
                </div>
             </div>
             <a href="#profile" class="block px-3 py-2 hover:text-[#72aee6]">プロフィールを編集</a>
             <a href="/wp-admin#" class="block px-3 py-2 hover:text-[#72aee6]" @click.stop="logout">ログアウト</a>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden relative">
      <!-- Sidebar -->
      <aside class="bg-[#1d2327] text-[#c3c4c7] flex flex-col shrink-0 transition-all duration-300 z-40" :class="isSidebarCollapsed ? 'w-9' : 'w-40 md:w-48'">
        <nav class="flex flex-col text-[14px] py-2 flex-1 overflow-y-auto overflow-x-hidden">
          <div v-for="item in navItems" :key="item.hash" class="relative group">
            <a :href="'#' + item.hash" class="flex items-center h-9 cursor-pointer border-l-4 transition-all" :class="isActive(item.hash) ? 'bg-[#2271b1] text-white border-[#2271b1]' : 'text-[#a7aaad] hover:bg-[#2c3338] hover:text-[#72aee6] border-transparent'">
              <div :class="`${item.icon} ${isActive(item.hash) ? 'opacity-100' : ''}`" class="text-xl min-w-[32px] flex items-center justify-center ml-[-4px] opacity-70 group-hover:opacity-100"></div>
              <span v-if="!isSidebarCollapsed" class="flex-1 truncate pr-2">{{ item.name }}</span>
              <span v-if="!isSidebarCollapsed && item.count" class="mr-2 bg-[#d63638] text-white text-[10px] px-1.5 rounded-full leading-tight py-0.5">{{ item.count }}</span>
            </a>
            <div v-if="!isSidebarCollapsed && item.sub" class="bg-[#2c3338] overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-64" :class="isActive(item.hash) ? 'max-h-64 bg-[#1d2327]' : ''">
              <a v-for="subItem in item.sub" :key="subItem.hash" :href="'#' + subItem.hash" class="block pl-10 py-1.5 text-[13px] text-[#a7aaad] hover:text-[#72aee6]" :class="currentHash === subItem.hash ? 'font-bold text-white' : ''">{{ subItem.name }}</a>
            </div>
            <div v-if="isSidebarCollapsed" class="absolute left-full top-0 ml-0 bg-[#2c3338] text-white w-48 hidden group-hover:block z-[100] shadow-md">
              <div class="px-3 py-2 bg-[#1d2327] font-bold text-[13px] border-b border-[#2c3338]">{{ item.name }}</div>
              <div v-if="item.sub">
                <a v-for="subItem in item.sub" :key="subItem.hash" :href="'#' + subItem.hash" class="block px-3 py-1.5 text-[13px] text-[#a7aaad] hover:text-[#72aee6]">{{ subItem.name }}</a>
              </div>
            </div>
          </div>
        </nav>
        <div class="h-9 flex items-center px-2 cursor-pointer hover:bg-[#2c3338] hover:text-[#72aee6] border-t border-[#2c3338]" @click="toggleSidebar">
          <div class="i-ri-arrow-left-double-line text-lg transition-transform" :class="isSidebarCollapsed ? 'rotate-180' : ''"></div>
          <span v-if="!isSidebarCollapsed" class="ml-2 text-xs">メニューを閉じる</span>
        </div>
      </aside>

      <!-- Main Area -->
      <main class="flex-1 overflow-y-auto bg-[#f0f0f1] relative">
        <!-- Screen Options & Help -->
        <div class="absolute top-0 right-0 z-[55] flex gap-0 px-4">
          <button class="bg-white border-x border-b border-[#c3c4c7] px-3 py-0.5 text-xs text-[#646970] hover:text-[#2271b1] flex items-center gap-1 transition-colors relative" :class="showHelp ? 'z-[60] !border-b-white pb-1' : ''" @click="toggleHelp">
            <span>ヘルプ</span>
            <div class="i-ri-arrow-down-s-line transition-transform" :class="showHelp ? 'rotate-180' : ''"></div>
          </button>
          <button class="bg-white border-r border-b border-[#c3c4c7] px-3 py-0.5 text-xs text-[#646970] hover:text-[#2271b1] flex items-center gap-1 transition-colors relative" :class="showScreenOptions ? 'z-[60] !border-b-white pb-1' : ''" @click="toggleScreenOptions">
            <span>表示オプション</span>
            <div class="i-ri-arrow-down-s-line transition-transform" :class="showScreenOptions ? 'rotate-180' : ''"></div>
          </button>
        </div>

        <div v-if="showHelp" class="absolute top-0 left-0 right-0 bg-white border-b border-[#c3c4c7] z-[50] shadow-md animate-slide-down">
          <div class="max-w-6xl mx-auto flex p-4 min-h-[200px]">
            <div class="w-1/4 border-r border-[#c3c4c7] pr-4">
              <ul class="text-[13px] space-y-2">
                <li class="bg-[#f0f0f1] font-bold px-2 py-1 border-l-4 border-[#2271b1]">概要</li>
                <li class="px-2 py-1 text-[#2271b1] hover:underline cursor-pointer">ナビゲーション</li>
                <li class="px-2 py-1 text-[#2271b1] hover:underline cursor-pointer">レイアウト</li>
                <li class="px-2 py-1 text-[#2271b1] hover:underline cursor-pointer">サポート</li>
              </ul>
            </div>
            <div class="w-3/4 pl-6 text-[13px] leading-relaxed">
              <h4 class="font-bold mb-2">概要</h4>
              <p class="mb-4">ダッシュボード画面には、あなたのサイトの状況がひと目でわかるウィジェットが含まれています。</p>
              <p>左側のメニューから、投稿や固定ページの作成、サイトの外観の設定などを行えます。</p>
            </div>
          </div>
        </div>

        <div v-if="showScreenOptions" class="absolute top-0 left-0 right-0 bg-white border-b border-[#c3c4c7] z-[50] shadow-md animate-slide-down">
          <div class="max-w-6xl mx-auto p-4">
            <h4 class="font-bold text-[13px] mb-3">画面上の要素</h4>
            <div class="flex flex-wrap gap-4 text-[13px]">
              <label class="flex items-center gap-1"><input type="checkbox" checked /> サイトヘルスステータス</label>
              <label class="flex items-center gap-1"><input type="checkbox" checked /> 概要</label>
              <label class="flex items-center gap-1"><input type="checkbox" checked /> アクティビティ</label>
              <label class="flex items-center gap-1"><input type="checkbox" checked /> クイックドラフト</label>
              <label class="flex items-center gap-1"><input type="checkbox" checked /> WordPress ニュース</label>
            </div>
          </div>
        </div>

        <transition name="fade" mode="out-in">
          <div :key="currentHash" class="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
            <!-- Dashboard -->
            <div v-if="currentHash === ''">
              <h1 class="text-2xl font-light mb-4">ダッシュボード</h1>
              <div class="bg-white border border-[#c3c4c7] mb-5 relative">
                <button class="absolute top-4 right-4 text-[#2271b1] hover:text-[#135e96] text-[13px]">非表示</button>
                <div class="p-6 md:p-10">
                  <h2 class="text-3xl font-light mb-2">WordPress へようこそ !</h2>
                  <p class="text-[#646970] text-lg mb-8">サイトをさらに使いやすくするための設定をいくつかご用意しました。</p>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div class="space-y-5">
                      <h3 class="text-xl font-medium">さあ始めましょう</h3>
                      <button class="bg-[#2271b1] text-white px-5 py-2 rounded-sm font-medium hover:bg-[#135e96] text-sm">サイトをカスタマイズ</button>
                      <p class="text-xs text-[#646970]">または <a href="/wp-admin#" class="text-[#2271b1] hover:underline">テーマを完全に変更</a></p>
                    </div>
                    <div class="space-y-4">
                      <h3 class="text-[13px] font-bold">次のステップ</h3>
                      <ul class="text-sm space-y-3">
                        <li class="flex items-center gap-2"><div class="i-ri-edit-2-line text-[#646970]"></div><a href="#posts" class="text-[#2271b1] hover:underline">最初の投稿を書く</a></li>
                        <li class="flex items-center gap-2"><div class="i-ri-add-circle-line text-[#646970]"></div><a href="#pages" class="text-[#2271b1] hover:underline">新しい固定ページを追加</a></li>
                        <li class="flex items-center gap-2"><div class="i-ri-external-link-line text-[#646970]"></div><a href="/" class="text-[#2271b1] hover:underline">サイトを表示</a></li>
                      </ul>
                    </div>
                    <div class="space-y-4">
                      <h3 class="text-[13px] font-bold">その他の操作</h3>
                      <ul class="text-sm space-y-3">
                        <li class="flex items-center gap-2"><div class="i-ri-layout-line text-[#646970]"></div><span>ウィジェットまたは <a href="/wp-admin#" class="text-[#2271b1] hover:underline">メニュー</a> を管理</span></li>
                        <li class="flex items-center gap-2"><div class="i-ri-chat-3-line text-[#646970]"></div><span><a href="/wp-admin#" class="text-[#2271b1] hover:underline">コメントのオン/オフ</a></span></li>
                        <li class="flex items-center gap-2"><div class="i-ri-question-line text-[#646970]"></div><span><a href="/wp-admin#" class="text-[#2271b1] hover:underline">WordPress について詳しく</a></span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div class="bg-white border border-[#c3c4c7]">
                  <div class="px-3 py-2.5 border-b border-[#c3c4c7] font-bold text-[14px]">サイトヘルスステータス</div>
                  <div class="p-4 flex items-start gap-4">
                    <div class="w-10 h-10 rounded-full bg-[#f0f0f1] flex items-center justify-center text-[#4ab866] shrink-0 mt-1"><div class="i-ri-check-line text-2xl"></div></div>
                    <div>
                      <p class="text-[13px] font-bold mb-1">サイトのステータスは良好です</p>
                      <p class="text-[13px] text-[#646970] leading-relaxed">サイトヘルスチェックにより、サイトのパフォーマンスとセキュリティに関する情報が得られます。</p>
                      <a href="/wp-admin#" class="text-[#2271b1] text-xs hover:underline mt-2 inline-block">サイトヘルス画面を表示</a>
                    </div>
                  </div>
                </div>

                <div class="bg-white border border-[#c3c4c7]">
                  <div class="px-3 py-2.5 border-b border-[#c3c4c7] font-bold text-[14px]">概要</div>
                  <div class="p-4 grid grid-cols-2 gap-y-3 text-[13px]">
                    <div class="flex items-center gap-2"><div class="i-ri-pushpin-fill text-[#646970]"></div><a href="#posts" class="text-[#2271b1] hover:underline">48件の投稿</a></div>
                    <div class="flex items-center gap-2"><div class="i-ri-chat-3-fill text-[#646970]"></div><a href="#comments" class="text-[#2271b1] hover:underline">312個のコメント</a></div>
                    <div class="flex items-center gap-2"><div class="i-ri-file-copy-2-fill text-[#646970]"></div><a href="#pages" class="text-[#2271b1] hover:underline">12個の固定ページ</a></div>
                  </div>
                  <div class="px-4 py-3 bg-[#f6f7f7] border-t border-[#c3c4c7] text-xs text-[#646970]">WordPress 6.4.3 はテーマ <span class="font-bold text-[#2271b1]">Omu Aikido 2024</span> で動作中です。</div>
                </div>

                <div class="bg-white border border-[#c3c4c7]">
                  <div class="px-3 py-2.5 border-b border-[#c3c4c7] font-bold text-[14px]">アクティビティ</div>
                  <div class="p-4 text-[13px]">
                    <div class="text-[#646970] mb-3 pb-2 border-b border-[#f0f0f1]">最近の公開済み</div>
                    <div class="space-y-3 mb-6">
                      <div v-for="post in posts.slice(0, 3)" :key="post.id" class="flex gap-2">
                        <span class="text-[#646970] whitespace-nowrap opacity-60">{{ post.date.substring(5) }}</span>
                        <a href="/wp-admin#" class="text-[#2271b1] hover:underline truncate">{{ post.title }}</a>
                      </div>
                    </div>
                    <div class="text-[#646970] mb-3 pb-2 border-b border-[#f0f0f1]">最近のコメント</div>
                    <div class="space-y-4">
                      <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
                        <div class="w-8 h-8 bg-[#f0f0f1] rounded-sm flex items-center justify-center shrink-0"><div class="i-ri-user-3-fill text-[#c3c4c7]"></div></div>
                        <div class="flex-1">
                          <div class="text-xs text-[#646970]"><span class="font-bold text-[#2271b1]">{{ comment.author }}</span> より <a href="/wp-admin#" class="text-[#2271b1] hover:underline">{{ comment.post }}</a></div>
                          <div class="mt-1 line-clamp-1 italic text-[#3c434a]">"{{ comment.content }}"</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-white border border-[#c3c4c7]">
                  <div class="px-3 py-2.5 border-b border-[#c3c4c7] font-bold text-[14px]">クイックドラフト</div>
                  <div class="p-4 space-y-4">
                    <input type="text" placeholder="タイトル" class="w-full border border-[#8c8f94] p-1.5 rounded-sm text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]" />
                    <textarea placeholder="何を考えていますか ?" rows="3" class="w-full border border-[#8c8f94] p-1.5 rounded-sm text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] resize-none"></textarea>
                    <button class="bg-[#2271b1] text-white px-4 py-1.5 rounded-sm text-[13px] font-medium hover:bg-[#135e96]">下書きとして保存</button>
                    <div class="pt-4 border-t border-[#f0f0f1]">
                      <div class="text-[13px] font-bold mb-2">最近の下書き</div>
                      <div class="flex justify-between items-center text-[13px]"><a href="/wp-admin#" class="text-[#2271b1] hover:underline">春季合宿のしおり（案）</a><span class="text-[#646970] text-xs">2024/04/10</span></div>
                    </div>
                  </div>
                </div>

                <div class="bg-white border border-[#c3c4c7]">
                  <div class="px-3 py-2.5 border-b border-[#c3c4c7] font-bold text-[14px]">WordPress ニュース</div>
                  <div class="p-4 space-y-4 text-[13px]">
                    <div><a href="/wp-admin#" class="text-[#2271b1] font-bold hover:underline">WordPress 6.5 "Regina"</a><p class="text-[#646970] mt-1">最新の WordPress 6.5 がリリースされました。フォントライブラリなどの新機能をご紹介します。</p></div>
                    <div><a href="/wp-admin#" class="text-[#2271b1] font-bold hover:underline">State of the Word 2023</a><p class="text-[#646970] mt-1">Matt Mullenweg による年次基調講演のハイライトをご覧ください。</p></div>
                    <div class="mt-4 pt-4 border-t border-[#f0f0f1] flex gap-3 text-xs">
                      <a href="/wp-admin#" class="text-[#2271b1] hover:underline">ミートアップ</a>
                      <a href="/wp-admin#" class="text-[#2271b1] hover:underline">WordCamp</a>
                      <a href="/wp-admin#" class="text-[#2271b1] hover:underline">ニュース</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Posts -->
            <div v-else-if="currentHash === 'posts'">
              <div class="flex items-center gap-2 mb-4">
                <h1 class="text-2xl font-light">投稿</h1>
                <button class="border border-[#2271b1] text-[#2271b1] px-2 py-0.5 rounded-sm text-xs hover:bg-[#f6f7f7] font-medium">新規追加</button>
              </div>
              <div class="flex gap-2 mb-4 text-[13px]">
                <a href="/wp-admin#" class="text-black font-bold border-r border-[#c3c4c7] pr-2">すべて (48)</a>
                <a href="/wp-admin#" class="text-[#2271b1] border-r border-[#c3c4c7] px-2 hover:underline">公開済み (45)</a>
                <a href="/wp-admin#" class="text-[#2271b1] pl-2 hover:underline">下書き (3)</a>
              </div>
              <div class="flex justify-between items-center mb-1 text-[13px]">
                <div class="flex items-center gap-1">
                  <select class="border border-[#dcdcde] px-1 py-0.5 rounded-sm outline-none focus:border-[#2271b1]"><option>一括操作</option><option>編集</option><option>ゴミ箱へ移動</option></select>
                  <button class="border border-[#c3c4c7] bg-[#f6f7f7] px-2 py-0.5 rounded-sm hover:bg-[#f0f0f1]">適用</button>
                </div>
                <div>48個の項目</div>
              </div>
              <div class="bg-white border border-[#c3c4c7]">
                <table class="w-full text-[13px] text-left border-collapse">
                  <thead>
                    <tr class="border-b border-[#c3c4c7]"><th class="p-2 w-10 text-center"><input type="checkbox" /></th><th class="p-2 font-bold py-3">タイトル</th><th class="p-2 font-bold">作成者</th><th class="p-2 font-bold">カテゴリー</th><th class="p-2 font-bold">タグ</th><th class="p-2 text-center"><div class="i-ri-chat-3-fill mx-auto text-lg text-[#646970]"></div></th><th class="p-2 font-bold">日付</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="(post, idx) in posts" :key="post.id" class="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] group" :class="idx % 2 === 1 ? 'bg-[#f6f7f7]/50' : 'bg-white'">
                      <td class="p-2 text-center"><input type="checkbox" /></td>
                      <td class="p-2 py-3">
                        <div class="text-[#2271b1] font-bold hover:text-[#135e96] cursor-pointer text-[14px]">{{ post.title }} <span v-if="post.status === '下書き'" class="text-[#646970] font-normal">— {{ post.status }}</span></div>
                        <div class="flex gap-2 text-[11px] text-[#2271b1] opacity-0 group-hover:opacity-100 mt-1">
                          <span class="hover:text-[#135e96] cursor-pointer">編集</span><span class="text-[#c3c4c7]">|</span><span class="hover:text-[#135e96] cursor-pointer">クイック編集</span><span class="text-[#c3c4c7]">|</span><span class="text-[#d63638] hover:text-[#bc0b0d] cursor-pointer">ゴミ箱へ移動</span><span class="text-[#c3c4c7]">|</span><span class="hover:text-[#135e96] cursor-pointer">表示</span>
                        </div>
                      </td>
                      <td class="p-2 text-[#2271b1] hover:underline cursor-pointer">{{ post.author }}</td>
                      <td class="p-2 text-[#2271b1] hover:underline cursor-pointer">{{ post.categories }}</td>
                      <td class="p-2 text-[#2271b1]">{{ post.tags }}</td>
                      <td class="p-2 text-center"><div class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f0f1] text-[11px] font-bold text-[#646970]">{{ post.comments }}</div></td>
                      <td class="p-2"><div class="text-[#3c434a]">{{ post.status === '公開済み' ? '公開済み' : '最終更新' }}</div><div class="text-xs">{{ post.date }}</div></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Media -->
            <div v-else-if="currentHash === 'media'">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-2"><h1 class="text-2xl font-light">メディアライブラリ</h1><button class="border border-[#2271b1] text-[#2271b1] px-2 py-0.5 rounded-sm text-xs hover:bg-[#f6f7f7] font-medium">新規追加</button></div>
                <div class="flex border border-[#c3c4c7] rounded-sm bg-white overflow-hidden"><div class="p-1.5 hover:bg-[#f0f0f1] cursor-pointer border-r border-[#c3c4c7] text-[#2271b1]"><div class="i-ri-grid-fill"></div></div><div class="p-1.5 hover:bg-[#f0f0f1] cursor-pointer text-[#646970]"><div class="i-ri-list-check"></div></div></div>
              </div>
              <div class="flex items-center gap-4 mb-4 text-[13px]">
                <select class="border border-[#dcdcde] px-2 py-1 rounded-sm outline-none"><option>すべてのメディア項目</option><option>画像</option><option>動画</option></select>
                <select class="border border-[#dcdcde] px-2 py-1 rounded-sm outline-none"><option>すべての期間</option><option>2024年4月</option></select>
                <button class="border border-[#c3c4c7] bg-[#f6f7f7] px-3 py-1 rounded-sm hover:bg-[#f0f0f1]">一括選択</button>
              </div>
              <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                <div v-for="n in 24" :key="n" class="aspect-square bg-white border border-[#c3c4c7] flex items-center justify-center text-[#c3c4c7] hover:border-[#2271b1] hover:ring-2 hover:ring-[#2271b1]/20 cursor-pointer relative group overflow-hidden">
                  <div class="i-ri-image-line text-4xl opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-transform"></div>
                  <div class="absolute bottom-0 left-0 right-0 bg-white/90 p-1 text-[10px] text-[#3c434a] truncate opacity-0 group-hover:opacity-100 border-t border-[#c3c4c7] transition-opacity">aikido-{{ n }}.jpg</div>
                </div>
              </div>
            </div>

            <!-- Settings -->
            <div v-else-if="currentHash === 'settings'">
              <h1 class="text-2xl font-light mb-6">一般設定</h1>
              <div class="bg-white p-6 border border-[#c3c4c7] max-w-4xl">
                <table class="w-full text-[13px] border-separate border-spacing-y-5">
                  <tbody>
                    <tr><th class="w-1/4 text-left font-bold align-top pt-1">サイトのタイトル</th><td><input type="text" value="大阪公立大学合氣道部" class="w-full md:w-2/3 border border-[#dcdcde] p-2 rounded-sm focus:border-[#2271b1] outline-none" /></td></tr>
                    <tr><th class="text-left font-bold align-top pt-1">キャッチフレーズ</th><td><input type="text" value="合気道で心身を練成する" class="w-full md:w-2/3 border border-[#dcdcde] p-2 rounded-sm focus:border-[#2271b1] outline-none" /><p class="text-[11px] text-[#646970] mt-1.5">このサイトの簡単な説明。</p></td></tr>
                    <tr><th class="text-left font-bold align-top pt-1">管理者メールアドレス</th><td><input type="email" value="pod@honey.omu-aikido.com" class="w-full md:w-2/3 border border-[#dcdcde] p-2 rounded-sm focus:border-[#2271b1] outline-none" /><p class="text-[11px] text-[#646970] mt-1.5">このアドレスは管理者権限のために使用されます。</p></td></tr>
                    <tr><th class="text-left font-bold align-top pt-1">タイムゾーン</th><td><select class="w-full md:w-2/3 border border-[#dcdcde] p-2 rounded-sm focus:border-[#2271b1] outline-none"><option>東京 (UTC+9)</option></select></td></tr>
                  </tbody>
                </table>
                <div class="mt-10 pt-6 border-t border-[#f0f0f1]"><button class="bg-[#2271b1] text-white px-4 py-1.5 rounded-sm font-medium hover:bg-[#135e96]">変更を保存</button></div>
              </div>
            </div>

            <!-- Fallback -->
            <div v-else>
              <h1 class="text-2xl font-light mb-6 uppercase">{{ currentHash }}</h1>
              <div class="bg-white p-12 border border-[#c3c4c7] flex flex-col items-center justify-center text-center">
                <div class="w-20 h-20 bg-[#f0f0f1] rounded-full flex items-center justify-center mb-6"><div class="i-ri-error-warning-line text-4xl text-[#a7aaad]"></div></div>
                <h3 class="text-xl mb-2 font-medium">このページは現在利用できません</h3>
                <p class="text-[13px] text-[#646970] max-w-md">権限が不足しているか、カスタム機能が未設定の可能性があります。</p>
                <button class="mt-8 bg-[#2271b1] text-white px-4 py-1.5 rounded-sm text-sm font-medium hover:bg-[#135e96]" @click="currentHash = ''">ダッシュボードへ戻る</button>
              </div>
            </div>
          </div>
        </transition>

        <!-- Footer -->
        <footer class="p-4 text-[13px] text-[#646970] flex justify-between items-center max-w-6xl mx-auto border-t border-[#c3c4c7]/30 mt-8 mb-4">
          <p>WordPress をご利用いただきありがとうございます。</p>
          <p class="opacity-50 text-xs">バージョン 6.4.3</p>
        </footer>
      </main>
    </div>
  </div>
</template>

<style scoped>
:deep(*) { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes slide-down { from { transform: translateY(-100%); } to { transform: translateY(0); } }
.animate-slide-down { animation: slide-down 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: #f0f0f1; }
::-webkit-scrollbar-thumb { background: #c3c4c7; border-radius: 5px; border: 2px solid #f0f0f1; }
::-webkit-scrollbar-thumb:hover { background: #a7aaad; }
input[type="checkbox"] { accent-color: #2271b1; width: 1rem; height: 1rem; cursor: pointer; }
input[type="text"], input[type="email"], textarea, select { background: white; border: 1px solid #8c8f94; font-size: 14px; }
input:focus, textarea:focus, select:focus { border-color: #2271b1; box-shadow: 0 0 0 1px #2271b1; outline: none; }
button, a { transition: all 0.1s ease; }
</style>
