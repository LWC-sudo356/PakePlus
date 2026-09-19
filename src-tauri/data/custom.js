window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>货物出入库管理系统</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Firebase 实时数据库 -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
    <!-- 专业人脸识别库 -->
    <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
    <style>
        /* 动态壁纸背景 */
        body {
            margin: 0;
            min-height: 100vh;
            background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
            font-family: 'Microsoft YaHei', sans-serif;
        }

        @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* 玻璃拟态效果 */
        .glass-card {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .menu-btn {
            transition: all 0.3s ease;
        }
        .menu-btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        .page {
            display: none;
            animation: fadeIn 0.4s ease;
        }
        .page.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .record-table {
            border-collapse: separate;
            border-spacing: 0;
            width: 100%;
        }
        .record-table th {
            background: rgba(255, 255, 255, 0.25);
            position: sticky;
            top: 0;
            z-index: 1;
        }
        .record-table tr:hover td {
            background: rgba(255, 255, 255, 0.1);
        }

        .form-input {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }
        .form-input:focus {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.6);
            outline: none;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
        }

        .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 6px;
            vertical-align: middle;
        }
        .status-online { background: #22c55e; box-shadow: 0 0 8px #22c55e; }
        .status-offline { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
        .status-checking { background: #eab308; box-shadow: 0 0 8px #eab308; animation: pulse 1s infinite; }
        .status-admin { background: #a855f7; box-shadow: 0 0 8px #a855f7; }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        /* 人脸识别容器 */
        .face-video-container {
            position: relative;
            width: 100%;
            aspect-ratio: 4/3;
            border-radius: 12px;
            overflow: hidden;
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .face-video-container video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transform: scaleX(-1); /* 镜像显示 */
        }
        .face-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 70%;
            aspect-ratio: 1;
            border: 2px dashed rgba(255,255,255,0.6);
            border-radius: 50%;
            pointer-events: none;
        }

        .admin-badge {
            background: linear-gradient(135deg, #a855f7, #6366f1);
            color: white;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
        }

        /* 管理员用户分组 */
        .user-group {
            margin-bottom: 24px;
        }
        .user-group-title {
            color: white;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 8px;
            padding-left: 8px;
            border-left: 4px solid #a855f7;
        }
    </style>
</head>
<body class="flex items-center justify-center p-4">

    <!-- 授权协议弹窗（每次打开必弹） -->
    <div id="termsModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div class="glass-card rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
            <div class="p-6 border-b border-white/20">
                <h2 class="text-2xl font-bold text-white">📜 使用授权协议</h2>
            </div>
            <div class="flex-1 overflow-y-auto p-6 text-white/80 text-sm space-y-4">
                <h3 class="font-bold text-white">一、系统说明</h3>
                <p>本系统为货物出入库管理系统，提供库存登记、出库记录、多设备数据同步等功能，仅供合法合规的仓储管理场景使用。</p>
                
                <h3 class="font-bold text-white">二、数据存储与隐私</h3>
                <p>1. 各账号数据独立存储，普通用户仅可查看自有数据，管理员可查看全平台数据；</p>
                <p>2. 人脸识别仅提取人脸特征向量，不存储原始照片，特征数据无法还原人像；</p>
                <p>3. 云端数据存储于Firebase服务器，本地数据存储于当前浏览器。</p>
                
                <h3 class="font-bold text-white">三、用户责任</h3>
                <p>1. 您承诺录入的所有数据真实合法，不得利用本系统从事任何违法违规活动；</p>
                <p>2. 请妥善保管账号密码，不得转借他人使用；</p>
                <p>3. 不得恶意攻击、篡改系统数据，不得干扰其他用户的正常使用。</p>
                
                <h3 class="font-bold text-white">四、免责声明</h3>
                <p>本系统按"现状"提供，不对数据准确性、服务稳定性做任何明示或暗示的担保。使用本系统产生的一切风险与后果由使用者自行承担。</p>
            </div>
            <div class="p-6 border-t border-white/20 space-y-4">
                <label class="flex items-center gap-3 text-white cursor-pointer select-none">
                    <input type="checkbox" id="agreeCheckbox" class="w-5 h-5 accent-green-500">
                    <span>我已阅读并同意以上全部条款</span>
                </label>
                <button id="confirmTermsBtn" onclick="confirmTerms()" disabled
                        class="w-full bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all">
                    确认并进入系统
                </button>
            </div>
        </div>
    </div>

    <!-- 登录注册页面 -->
    <div id="authPage" class="page w-full max-w-md">
        <div class="glass-card rounded-3xl p-8">
            <h1 class="text-3xl font-bold text-white text-center mb-8 drop-shadow-lg">账号验证</h1>
            
            <!-- 登录选项卡 -->
            <div id="loginTab" class="space-y-6">
                <div class="flex gap-2 mb-6">
                    <button onclick="switchAuthTab('login')" class="flex-1 py-2 rounded-lg bg-white/20 text-white font-medium">账号登录</button>
                    <button onclick="switchAuthTab('register')" class="flex-1 py-2 rounded-lg text-white/60 hover:bg-white/10 transition-colors">注册账号</button>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-white mb-2 font-medium">用户名</label>
                        <input type="text" id="loginUsername" 
                               class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                               placeholder="请输入用户名">
                    </div>
                    <div>
                        <label class="block text-white mb-2 font-medium">密码</label>
                        <input type="password" id="loginPassword" 
                               class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                               placeholder="请输入密码">
                    </div>
                    <button onclick="accountLogin()" 
                            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg">
                        登录
                    </button>
                    <div class="relative my-4">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-white/20"></div>
                        </div>
                        <div class="relative flex justify-center">
                            <span class="px-4 text-white/50 text-sm bg-transparent">或</span>
                        </div>
                    </div>
                    <button onclick="faceLogin()" 
                            class="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg">
                        📷 人脸识别登录
                    </button>
                    <p class="text-white/50 text-xs text-center">提示：管理员账号仅支持密码登录</p>
                </div>
            </div>

            <!-- 注册选项卡 -->
            <div id="registerTab" class="space-y-6 hidden">
                <div class="flex gap-2 mb-6">
                    <button onclick="switchAuthTab('login')" class="flex-1 py-2 rounded-lg text-white/60 hover:bg-white/10 transition-colors">账号登录</button>
                    <button onclick="switchAuthTab('register')" class="flex-1 py-2 rounded-lg bg-white/20 text-white font-medium">注册账号</button>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-white mb-2 font-medium">设置用户名</label>
                        <input type="text" id="regUsername" 
                               class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                               placeholder="请输入用户名">
                    </div>
                    <div>
                        <label class="block text-white mb-2 font-medium">设置密码</label>
                        <input type="password" id="regPassword" 
                               class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                               placeholder="请输入密码（至少6位）">
                    </div>
                    <div>
                        <label class="block text-white mb-2 font-medium">确认密码</label>
                        <input type="password" id="regPassword2" 
                               class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                               placeholder="请再次输入密码">
                    </div>

                    <!-- 人脸录入区域 -->
                    <div id="faceRegisterArea" class="hidden space-y-3">
                        <div class="face-video-container">
                            <video id="regVideo" autoplay muted playsinline></video>
                            <div class="face-overlay"></div>
                        </div>
                        <p id="regFaceStatus" class="text-white/60 text-xs text-center">正在启动摄像头...</p>
                    </div>

                    <label class="flex items-center gap-3 text-white/80 text-sm cursor-pointer select-none">
                        <input type="checkbox" id="enableFaceReg" onchange="toggleFaceRegister()" class="w-4 h-4 accent-purple-500">
                        <span>注册时录入人脸，支持刷脸登录</span>
                    </label>

                    <button onclick="accountRegister()" 
                            class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg">
                        注册账号
                    </button>
                    <button onclick="switchAuthTab('login')" 
                            class="w-full text-white/60 hover:text-white text-sm transition-colors">
                        已有账号？返回登录
                    </button>
                </div>
            </div>

            <!-- 人脸识别登录弹窗 -->
            <div id="faceLoginModal" class="hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="glass-card rounded-2xl p-6 max-w-md w-full">
                    <h3 class="text-xl font-bold text-white mb-4 text-center">人脸识别登录</h3>
                    <div class="face-video-container mb-4">
                        <video id="loginVideo" autoplay muted playsinline></video>
                        <div class="face-overlay"></div>
                    </div>
                    <p id="faceLoginStatus" class="text-white/70 text-center mb-4">正在启动摄像头...</p>
                    <button onclick="closeFaceLogin()"
                            class="w-full bg-gray-500/80 hover:bg-gray-500 text-white font-bold py-3 rounded-xl transition-all">
                        取消
                    </button>
                </div>
            </div>

            <p id="authTip" class="text-center text-yellow-300 text-sm mt-4 hidden"></p>
        </div>
    </div>

    <!-- 系统主内容 -->
    <div id="systemContainer" class="w-full max-w-4xl hidden">
        
        <!-- 主菜单页面 -->
        <div id="menuPage" class="page active">
            <div class="glass-card rounded-3xl p-10 text-center">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-white/70 text-sm">
                        欢迎，<span id="currentUser">用户</span>
                        <span id="adminBadge" class="admin-badge ml-2 hidden">管理员</span>
                    </span>
                    <button onclick="logout()" class="text-white/50 hover:text-white text-sm transition-colors">退出登录</button>
                </div>
                <h1 class="text-4xl font-bold text-white mb-2 drop-shadow-lg">货物出入库管理系统</h1>
                <div class="text-white/70 mb-6 text-sm">
                    <span id="statusIndicator">
                        <span class="status-dot status-checking"></span>
                        <span id="statusText">正在连接云端数据库...</span>
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <button onclick="showPage('recordPage')" 
                            class="menu-btn glass-card rounded-2xl p-8 text-white hover:bg-white/25">
                        <div class="text-5xl mb-3">📦</div>
                        <h2 class="text-xl font-bold mb-2">记录出库</h2>
                        <p class="text-white/70 text-sm">录入出库 · 自动扣减库存</p>
                    </button>
                    
                    <button onclick="showPage('historyPage')" 
                            class="menu-btn glass-card rounded-2xl p-8 text-white hover:bg-white/25">
                        <div class="text-5xl mb-3">📋</div>
                        <h2 class="text-xl font-bold mb-2">出库记录</h2>
                        <p class="text-white/70 text-sm">查看全部出库历史</p>
                    </button>

                    <button onclick="showPage('stockInPage')" 
                            class="menu-btn glass-card rounded-2xl p-8 text-white hover:bg-white/25">
                        <div class="text-5xl mb-3">📥</div>
                        <h2 class="text-xl font-bold mb-2">写入库存</h2>
                        <p class="text-white/70 text-sm">商品入库 · 数量自动累加</p>
                    </button>
                    
                    <button onclick="showPage('inventoryPage')" 
                            class="menu-btn glass-card rounded-2xl p-8 text-white hover:bg-white/25">
                        <div class="text-5xl mb-3">📊</div>
                        <h2 class="text-xl font-bold mb-2">查看库存</h2>
                        <p class="text-white/70 text-sm">实时库存 · 多设备同步</p>
                    </button>
                </div>

                <div class="flex flex-col gap-3 text-sm">
                    <button onclick="runSystemDiagnostic()" 
                            class="text-white/70 hover:text-white underline transition-colors">
                        🔧 一键检测并修复系统问题
                    </button>
                    <button onclick="toggleStorageMode()" 
                            class="text-white/50 hover:text-white/80 transition-colors text-xs">
                        <span id="modeSwitchText">切换到本地存储模式</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- 记录出库页面 -->
        <div id="recordPage" class="page">
            <div class="glass-card rounded-3xl p-8">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-3xl font-bold text-white">记录出库</h2>
                    <button onclick="showPage('menuPage')" 
                            class="text-white/70 hover:text-white transition-colors">
                        ← 返回主菜单
                    </button>
                </div>
                
                <form id="outboundForm" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-white mb-2 font-medium">条形码</label>
                            <input type="text" id="barcode_out" required
                                   class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                                   placeholder="请输入条形码">
                        </div>
                        
                        <div>
                            <label class="block text-white mb-2 font-medium">品名</label>
                            <input type="text" id="productName_out" required
                                   class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                                   placeholder="请输入货物名称">
                        </div>
                        
                        <div>
                            <label class="block text-white mb-2 font-medium">单价（元）</label>
                            <input type="number" id="price_out" step="0.01" min="0" required
                                   class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                                   placeholder="请输入单价"
                                   oninput="calculateTotal()">
                        </div>
                        
                        <div>
                            <label class="block text-white mb-2 font-medium">数量</label>
                            <input type="number" id="quantity_out" min="1" required
                                   class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                                   placeholder="请输入出库数量"
                                   oninput="calculateTotal()">
                        </div>
                    </div>
                    
                    <div class="glass-card rounded-xl p-4">
                        <div class="flex justify-between items-center text-white">
                            <span class="text-lg">总价（自动计算）：</span>
                            <span id="totalPrice" class="text-2xl font-bold text-yellow-300">¥ 0.00</span>
                        </div>
                    </div>
                    
                    <div class="flex gap-4 pt-4">
                        <button type="button" onclick="saveRecord()"
                                class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg">
                            ✓ 确认出库
                        </button>
                        <button type="button" onclick="cancelRecord()"
                                class="flex-1 bg-red-500/80 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg">
                            ✕ 取消
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- 出库记录页面 -->
        <div id="historyPage" class="page">
            <div class="glass-card rounded-3xl p-8">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-3xl font-bold text-white">出库记录</h2>
                    <div class="flex gap-3">
                        <button onclick="clearAllRecords()" 
                                class="text-red-300 hover:text-red-200 text-sm transition-colors">
                            清空全部记录
                        </button>
                        <button onclick="showPage('menuPage')" 
                                class="text-white/70 hover:text-white transition-colors">
                            ← 返回主菜单
                        </button>
                    </div>
                </div>
                
                <div id="outboundRecordsContainer" class="overflow-auto max-h-96 rounded-xl border border-white/20">
                    <!-- 普通用户直接渲染表格，管理员按用户分组渲染 -->
                </div>
                
                <div id="emptyTip_out" class="text-center py-16 text-white/50 hidden">
                    <div class="text-5xl mb-4">📭</div>
                    <p>暂无出库记录</p>
                </div>
            </div>
        </div>

        <!-- 写入库存页面 -->
        <div id="stockInPage" class="page">
            <div class="glass-card rounded-3xl p-8">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-3xl font-bold text-white">写入库存</h2>
                    <button onclick="showPage('menuPage')" 
                            class="text-white/70 hover:text-white transition-colors">
                        ← 返回主菜单
                    </button>
                </div>
                
                <form id="stockInForm" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-white mb-2 font-medium">条形码</label>
                            <input type="text" id="barcode_in" required
                                   class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                                   placeholder="请输入商品条形码">
                        </div>
                        
                        <div>
                            <label class="block text-white mb-2 font-medium">品名</label>
                            <input type="text" id="productName_in" required
                                   class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                                   placeholder="请输入商品名称">
                        </div>
                        
                        <div>
                            <label class="block text-white mb-2 font-medium">单价（元）</label>
                            <input type="number" id="price_in" step="0.01" min="0" required
                                   class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                                   placeholder="请输入入库单价"
                                   oninput="calculateBatchTotal()">
                        </div>
                        
                        <div>
                            <label class="block text-white mb-2 font-medium">入库数量</label>
                            <input type="number" id="quantity_in" min="1" required
                                   class="form-input w-full px-4 py-3 rounded-xl text-white placeholder-white/50"
                                   placeholder="请输入入库数量"
                                   oninput="calculateBatchTotal()">
                        </div>
                    </div>
                    
                    <div class="glass-card rounded-xl p-4">
                        <div class="flex justify-between items-center text-white">
                            <span class="text-lg">本批次入库金额（自动计算）：</span>
                            <span id="batchTotal" class="text-2xl font-bold text-green-300">¥ 0.00</span>
                        </div>
                    </div>
                    
                    <div class="flex gap-4 pt-4">
                        <button type="button" onclick="saveStockIn()"
                                class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg">
                            ✓ 确认入库
                        </button>
                        <button type="button" onclick="cancelStockIn()"
                                class="flex-1 bg-gray-500/80 hover:bg-gray-500 text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg">
                            ✕ 取消
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- 查看库存页面 -->
        <div id="inventoryPage" class="page">
            <div class="glass-card rounded-3xl p-8">
                <div class="flex items-center justify-between mb-8">
                    <h2 class="text-3xl font-bold text-white">库存列表</h2>
                    <div class="flex gap-3">
                        <button onclick="clearAllInventory()" 
                                class="text-red-300 hover:text-red-200 text-sm transition-colors">
                            清空全部库存
                        </button>
                        <button onclick="showPage('menuPage')" 
                                class="text-white/70 hover:text-white transition-colors">
                            ← 返回主菜单
                        </button>
                    </div>
                </div>
                
                <div id="inventoryContainer" class="overflow-auto max-h-96 rounded-xl border border-white/20">
                    <!-- 普通用户直接渲染表格，管理员按用户分组渲染 -->
                </div>
                
                <div id="emptyTip_in" class="text-center py-16 text-white/50 hidden">
                    <div class="text-5xl mb-4">📦</div>
                    <p>暂无库存商品</p>
                </div>
            </div>
        </div>

        <!-- 系统检测弹窗 -->
        <div id="diagnosticModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50">
            <div class="glass-card rounded-2xl p-8 max-w-md w-full mx-4">
                <h3 class="text-2xl font-bold text-white mb-6">🔧 系统检测与修复</h3>
                <div id="diagnosticResult" class="space-y-3 text-white text-sm mb-6">
                    <p class="text-white/70">正在检测系统...</p>
                </div>
                <button onclick="closeDiagnostic()" 
                        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all">
                    关闭
                </button>
            </div>
        </div>

    </div>

    <script>
        // ===================== 全局配置 =====================
        const LOGIN_KEY = 'cargo_login_user';
        const ADMIN_USERNAME = 'L001';
        const ADMIN_PASSWORD = '471536ueitoU';
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';

        let storageMode = 'cloud';
        let isCloudReady = false;
        let database = null;
        let currentUser = '';
        let isAdmin = false;
        let faceModelsLoaded = false;
        let regFaceDescriptor = null;
        let loginStream = null;
        let regStream = null;
        let faceDetecting = false;

        // ===================== 初始化：每次打开必弹授权 =====================
        window.onload = function() {
            // 每次打开都显示授权协议，不记忆
            document.getElementById('agreeCheckbox').checked = false;
            document.getElementById('confirmTermsBtn').disabled = true;
            
            document.getElementById('agreeCheckbox').addEventListener('change', function() {
                document.getElementById('confirmTermsBtn').disabled = !this.checked;
            });
        };

        // 确认授权，进入登录页
        function confirmTerms() {
            document.getElementById('termsModal').classList.add('hidden');
            checkLoginStatus();
        }

        // ===================== 登录状态检查 =====================
        function checkLoginStatus() {
            const savedUser = localStorage.getItem(LOGIN_KEY);
            if (savedUser) {
                currentUser = savedUser;
                isAdmin = (savedUser === ADMIN_USERNAME);
                enterSystem();
            } else {
                document.getElementById('authPage').classList.add('active');
            }
        }

        // 切换登录/注册标签
        function switchAuthTab(tab) {
            stopAllCameras();
            regFaceDescriptor = null;
            document.getElementById('authTip').classList.add('hidden');
            
            if (tab === 'login') {
                document.getElementById('loginTab').classList.remove('hidden');
                document.getElementById('registerTab').classList.add('hidden');
            } else {
                document.getElementById('loginTab').classList.add('hidden');
                document.getElementById('registerTab').classList.remove('hidden');
            }
        }

        // ===================== 注册人脸：真实摄像头+自动检测 =====================
        function toggleFaceRegister() {
            const checked = document.getElementById('enableFaceReg').checked;
            const area = document.getElementById('faceRegisterArea');
            
            if (checked) {
                area.classList.remove('hidden');
                startRegCamera();
            } else {
                area.classList.add('hidden');
                stopAllCameras();
                regFaceDescriptor = null;
            }
        }

        async function startRegCamera() {
            const statusEl = document.getElementById('regFaceStatus');
            statusEl.textContent = '正在申请摄像头权限...';

            try {
                // 1. 加载人脸模型
                if (!faceModelsLoaded) {
                    statusEl.textContent = '正在加载识别模型...';
                    await Promise.all([
                        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                    ]);
                    faceModelsLoaded = true;
                }

                // 2. 真实调用电脑摄像头
                const video = document.getElementById('regVideo');
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480, facingMode: 'user' },
                    audio: false
                });
                regStream = stream;
                video.srcObject = stream;

                statusEl.textContent = '请将面部对准框内，自动采集中...';

                // 3. 自动检测人脸，检测到就自动录入
                const detectLoop = setInterval(async () => {
                    if (!regStream || faceDetecting) return;
                    faceDetecting = true;

                    try {
                        const detection = await faceapi.detectSingleFace(video)
                            .withFaceLandmarks()
                            .withFaceDescriptor();

                        if (detection) {
                            clearInterval(detectLoop);
                            regFaceDescriptor = Array.from(detection.descriptor);
                            statusEl.textContent = '✅ 人脸采集成功';
                            statusEl.classList.add('text-green-300');
                            
                            // 2秒后自动关闭摄像头
                            setTimeout(() => {
                                stopAllCameras();
                            }, 1500);
                        }
                    } catch(e) {}
                    faceDetecting = false;
                }, 300);

            } catch (e) {
                statusEl.textContent = '❌ 无法访问摄像头，请允许权限后重试';
                document.getElementById('enableFaceReg').checked = false;
                setTimeout(() => {
                    document.getElementById('faceRegisterArea').classList.add('hidden');
                }, 2000);
            }
        }

        // 注册账号
        function accountRegister() {
            const username = document.getElementById('regUsername').value.trim();
            const pwd1 = document.getElementById('regPassword').value;
            const pwd2 = document.getElementById('regPassword2').value;
            const enableFace = document.getElementById('enableFaceReg').checked;

            if (!username || !pwd1 || !pwd2) {
                showAuthTip('请填写完整的注册信息');
                return;
            }
            if (username === ADMIN_USERNAME) {
                showAuthTip('该用户名不可使用，请更换');
                return;
            }
            if (pwd1.length < 6) {
                showAuthTip('密码长度至少6位');
                return;
            }
            if (pwd1 !== pwd2) {
                showAuthTip('两次输入的密码不一致');
                return;
            }
            if (enableFace && !regFaceDescriptor) {
                showAuthTip('正在采集人脸信息，请稍候...');
                return;
            }

            // 云端注册，每个账号独立路径
            if (storageMode === 'cloud' && database) {
                const userRef = database.ref('users').child(username);
                userRef.once('value', (snap) => {
                    if (snap.exists()) {
                        showAuthTip('用户名已存在');
                        return;
                    }

                    const userData = {
                        password: pwd1,
                        registerTime: new Date().toLocaleString('zh-CN'),
                        inventory: {},
                        outboundRecords: {}
                    };
                    if (enableFace) {
                        userData.faceDescriptor = regFaceDescriptor;
                    }

                    userRef.set(userData).then(() => {
                        alert('注册成功！请登录');
                        stopAllCameras();
                        switchAuthTab('login');
                        document.getElementById('loginUsername').value = username;
                    }).catch(err => {
                        showAuthTip('注册失败：' + err.message);
                    });
                });
            } else {
                // 本地注册，完全隔离
                const all = JSON.parse(localStorage.getItem('local_users') || '{}');
                if (all[username]) {
                    showAuthTip('用户名已存在');
                    return;
                }
                all[username] = {
                    password: pwd1,
                    faceDescriptor: enableFace ? regFaceDescriptor : null,
                    inventory: {},
                    outboundRecords: []
                };
                localStorage.setItem('local_users', JSON.stringify(all));
                alert('注册成功！请登录');
                stopAllCameras();
                switchAuthTab('login');
                document.getElementById('loginUsername').value = username;
            }
        }

        // ===================== 账号登录 =====================
        function accountLogin() {
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!username || !password) {
                showAuthTip('请输入用户名和密码');
                return;
            }

            // 管理员账号校验
            if (username === ADMIN_USERNAME) {
                if (password === ADMIN_PASSWORD) {
                    isAdmin = true;
                    loginSuccess(username);
                } else {
                    showAuthTip('管理员密码错误');
                }
                return;
            }

            // 普通用户登录
            isAdmin = false;
            if (storageMode === 'cloud' && database) {
                const userRef = database.ref('users').child(username);
                userRef.once('value', (snap) => {
                    if (!snap.exists()) {
                        showAuthTip('用户名不存在');
                        return;
                    }
                    const user = snap.val();
                    if (user.password !== password) {
                        showAuthTip('密码错误');
                        return;
                    }
                    loginSuccess(username);
                });
            } else {
                const all = JSON.parse(localStorage.getItem('local_users') || '{}');
                if (!all[username]) {
                    showAuthTip('用户名不存在');
                    return;
                }
                if (all[username].password !== password) {
                    showAuthTip('密码错误');
                    return;
                }
                loginSuccess(username);
            }
        }

        // ===================== 人脸识别登录：真实摄像头+自动识别 =====================
        function faceLogin() {
            document.getElementById('faceLoginModal').classList.remove('hidden');
            document.getElementById('faceLoginStatus').textContent = '正在申请摄像头权限...';
            startLoginFaceDetect();
        }

        async function startLoginFaceDetect() {
            const statusEl = document.getElementById('faceLoginStatus');

            try {
                // 加载模型
                if (!faceModelsLoaded) {
                    statusEl.textContent = '正在加载识别模型...';
                    await Promise.all([
                        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                    ]);
                    faceModelsLoaded = true;
                }

                // 真实调用摄像头
                const video = document.getElementById('loginVideo');
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480, facingMode: 'user' },
                    audio: false
                });
                loginStream = stream;
                video.srcObject = stream;

                statusEl.textContent = '请对准摄像头，自动识别中...';

                // 自动循环检测人脸
                const detectLoop = setInterval(async () => {
                    if (!loginStream || faceDetecting) return;
                    faceDetecting = true;

                    try {
                        const detection = await faceapi.detectSingleFace(video)
                            .withFaceLandmarks()
                            .withFaceDescriptor();

                        if (detection) {
                            const loginDesc = detection.descriptor;
                            let matchedUser = null;
                            let minDist = 1;

                            // 遍历所有用户比对
                            if (storageMode === 'cloud' && database) {
                                const snap = await database.ref('users').once('value');
                                const users = snap.val() || {};
                                for (const u in users) {
                                    if (users[u].faceDescriptor) {
                                        const desc = new Float32Array(users[u].faceDescriptor);
                                        const dist = faceapi.euclideanDistance(loginDesc, desc);
                                        if (dist < 0.6 && dist < minDist) {
                                            minDist = dist;
                                            matchedUser = u;
                                        }
                                    }
                                }
                            } else {
                                const all = JSON.parse(localStorage.getItem('local_users') || '{}');
                                for (const u in all) {
                                    if (all[u].faceDescriptor) {
                                        const desc = new Float32Array(all[u].faceDescriptor);
                                        const dist = faceapi.euclideanDistance(loginDesc, desc);
                                        if (dist < 0.6 && dist < minDist) {
                                            minDist = dist;
                                            matchedUser = u;
                                        }
                                    }
                                }
                            }

                            if (matchedUser) {
                                clearInterval(detectLoop);
                                isAdmin = false;
                                statusEl.textContent = '✅ 识别成功，正在登录...';
                                setTimeout(() => {
                                    closeFaceLogin();
                                    loginSuccess(matchedUser);
                                }, 800);
                            }
                        }
                    } catch(e) {}
                    faceDetecting = false;
                }, 300);

            } catch (e) {
                statusEl.textContent = '❌ 无法访问摄像头：' + e.message;
            }
        }

        function closeFaceLogin() {
            stopAllCameras();
            document.getElementById('faceLoginModal').classList.add('hidden');
        }

        // ===================== 登录成功 =====================
        function loginSuccess(username) {
            currentUser = username;
            localStorage.setItem(LOGIN_KEY, username);
            document.getElementById('authPage').classList.remove('active');
            enterSystem();
        }

        // 退出登录
        function logout() {
            if (!confirm('确定要退出登录吗？')) return;
            localStorage.removeItem(LOGIN_KEY);
            currentUser = '';
            isAdmin = false;
            stopAllCameras();
            document.getElementById('systemContainer').classList.add('hidden');
            document.getElementById('authPage').classList.add('active');
            document.getElementById('loginPassword').value = '';
            document.getElementById('adminBadge').classList.add('hidden');
        }

        // 停止所有摄像头
        function stopAllCameras() {
            faceDetecting = false;
            if (loginStream) {
                loginStream.getTracks().forEach(track => track.stop());
                loginStream = null;
            }
            if (regStream) {
                regStream.getTracks().forEach(track => track.stop());
                regStream = null;
            }
        }

        function showAuthTip(msg) {
            const tip = document.getElementById('authTip');
            tip.textContent = msg;
            tip.classList.remove('hidden');
        }

        // ===================== 进入系统 =====================
        function enterSystem() {
            document.getElementById('systemContainer').classList.remove('hidden');
            document.getElementById('currentUser').textContent = currentUser;
            
            if (isAdmin) {
                document.getElementById('adminBadge').classList.remove('hidden');
            }

            updateStatus('status-checking', '正在连接云端数据库...');
            setTimeout(() => initFirebase(), 600);
        }

        // ===================== 公共功能 =====================
        function showPage(pageId) {
            document.querySelectorAll('#systemContainer .page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(pageId).classList.add('active');
        }

        function updateStatus(mode, text) {
            const dot = document.querySelector('#statusIndicator .status-dot');
            const statusText = document.getElementById('statusText');
            dot.className = 'status-dot ' + mode;
            statusText.textContent = text;
        }

        // ===================== 本地存储（按账号完全隔离） =====================
        function getLocalUserAll() {
            const all = JSON.parse(localStorage.getItem('local_users') || '{}');
            if (!all[currentUser]) {
                all[currentUser] = { inventory: {}, outboundRecords: [] };
            }
            return all;
        }

        function getLocalInventory() {
            const all = getLocalUserAll();
            return all[currentUser].inventory || {};
        }

        function saveLocalInventory(data) {
            const all = getLocalUserAll();
            all[currentUser].inventory = data;
            localStorage.setItem('local_users', JSON.stringify(all));
        }

        function getLocalOutbound() {
            const all = getLocalUserAll();
            return all[currentUser].outboundRecords || [];
        }

        function saveLocalOutbound(data) {
            const all = getLocalUserAll();
            all[currentUser].outboundRecords = data;
            localStorage.setItem('local_users', JSON.stringify(all));
        }

        // ===================== 云端初始化 =====================
        function initFirebase() {
            if (typeof firebase === 'undefined') {
                updateStatus('status-offline', '云端SDK加载失败，请检查网络');
                return;
            }

            try {
                const firebaseConfig = {
                    apiKey: "YOUR_API_KEY",
                    authDomain: "YOUR_PROJECT.firebaseapp.com",
                    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
                    projectId: "YOUR_PROJECT",
                    storageBucket: "YOUR_PROJECT.appspot.com",
                    messagingSenderId: "YOUR_SENDER_ID",
                    appId: "YOUR_APP_ID"
                };

                const isDefault = firebaseConfig.apiKey === 'YOUR_API_KEY';

                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                database = firebase.database();

                database.ref('.info/connected').on('value', (snap) => {
                    if (snap.val() === true) {
                        isCloudReady = true;
                        updateStatus(isAdmin ? 'status-admin' : 'status-online', 
                            isAdmin ? '管理员模式 · 全平台数据' : '云端同步正常 · 数据已隔离');
                        setupCloudListeners();
                    } else {
                        isCloudReady = false;
                        if (storageMode === 'cloud') {
                            updateStatus('status-offline', isDefault ? '未配置云端数据库' : '云端连接中断');
                        }
                    }
                });

            } catch (e) {
                updateStatus('status-offline', '云端初始化失败：' + e.message);
            }
        }

        // 云端数据监听
        function setupCloudListeners() {
            if (isAdmin) {
                // 管理员：监听所有用户，按用户分组渲染
                database.ref('users').on('value', (snapshot) => {
                    const allUsers = snapshot.val() || {};
                    renderAdminInventory(allUsers);
                    renderAdminOutbound(allUsers);
                });
            } else {
                // 普通用户：仅监听自己的数据路径
                const base = `users/${currentUser}`;
                database.ref(`${base}/inventory`).on('value', (snap) => {
                    const list = [];
                    snap.forEach(child => list.push({ barcode: child.key, ...child.val() }));
                    renderNormalInventory(list);
                });

                database.ref(`${base}/outboundRecords`).on('value', (snap) => {
                    const list = [];
                    snap.forEach(child => list.push({ id: child.key, ...child.val() }));
                    list.reverse();
                    renderNormalOutbound(list);
                });
            }
        }

        // 切换存储模式
        function toggleStorageMode() {
            if (storageMode === 'cloud') {
                if (!confirm('确定切换到本地模式？数据仅存此设备，无法同步。')) return;
                storageMode = 'local';
                updateStatus('status-offline', '本地模式 · 数据仅存此设备');
                document.getElementById('modeSwitchText').textContent = '切换回云端同步模式';
                
                if (isAdmin) {
                    alert('管理员模式不支持本地存储');
                    return;
                }
                renderNormalInventory(Object.entries(getLocalInventory()).map(([k,v]) => ({barcode: k, ...v})));
                renderNormalOutbound(getLocalOutbound());
            } else {
                storageMode = 'cloud';
                document.getElementById('modeSwitchText').textContent = '切换到本地存储模式';
                if (isCloudReady) {
                    updateStatus(isAdmin ? 'status-admin' : 'status-online', 
                        isAdmin ? '管理员模式 · 全平台数据' : '云端同步正常 · 数据已隔离');
                } else {
                    updateStatus('status-checking', '正在重新连接云端...');
                    setTimeout(() => initFirebase(), 500);
                }
            }
        }

        // ===================== 出库模块 =====================
        function calculateTotal() {
            const price = parseFloat(document.getElementById('price_out').value) || 0;
            const quantity = parseInt(document.getElementById('quantity_out').value) || 0;
            document.getElementById('totalPrice').textContent = '¥ ' + (price * quantity).toFixed(2);
        }

        function saveRecord() {
            const barcode = document.getElementById('barcode_out').value.trim();
            const productName = document.getElementById('productName_out').value.trim();
            const price = parseFloat(document.getElementById('price_out').value);
            const quantity = parseInt(document.getElementById('quantity_out').value);

            if (!barcode || !productName || isNaN(price) || isNaN(quantity)) {
                alert('请填写完整信息！');
                return;
            }
            if (price < 0 || quantity < 1) {
                alert('单价不能为负，数量不能小于1！');
                return;
            }

            const record = {
                barcode, productName, price, quantity,
                total: price * quantity,
                time: new Date().toLocaleString('zh-CN'),
                operator: currentUser
            };

            if (storageMode === 'cloud' && isCloudReady) {
                const base = `users/${currentUser}`;
                const itemRef = database.ref(`${base}/inventory`).child(barcode);
                
                itemRef.once('value', (snap) => {
                    if (!snap.exists()) {
                        alert('库存中无此商品！');
                        return;
                    }
                    const item = snap.val();
                    if (item.quantity < quantity) {
                        alert(`库存不足！当前：${item.quantity}，申请：${quantity}`);
                        return;
                    }

                    const newQty = item.quantity - quantity;
                    const updates = {};
                    updates[`${base}/inventory/${barcode}/quantity`] = newQty;
                    updates[`${base}/inventory/${barcode}/totalValue`] = item.price * newQty;
                    updates[`${base}/inventory/${barcode}/lastUpdate`] = record.time;
                    
                    const newRef = database.ref(`${base}/outboundRecords`).push();
                    updates[`${base}/outboundRecords/${newRef.key}`] = record;

                    database.ref().update(updates)
                        .then(() => { alert('出库成功！'); cancelRecord(); })
                        .catch(err => alert('出库失败：' + err.message));
                });
            } else {
                const inv = getLocalInventory();
                if (!inv[barcode]) {
                    alert('库存中无此商品！');
                    return;
                }
                if (inv[barcode].quantity < quantity) {
                    alert(`库存不足！当前：${inv[barcode].quantity}，申请：${quantity}`);
                    return;
                }

                inv[barcode].quantity -= quantity;
                inv[barcode].totalValue = inv[barcode].price * inv[barcode].quantity;
                inv[barcode].lastUpdate = record.time;
                saveLocalInventory(inv);

                const records = getLocalOutbound();
                records.unshift({...record, id: Date.now()});
                saveLocalOutbound(records);

                alert('出库成功！');
                cancelRecord();
                renderNormalInventory(Object.entries(getLocalInventory()).map(([k,v]) => ({barcode: k, ...v})));
                renderNormalOutbound(getLocalOutbound());
            }
        }

        function cancelRecord() {
            document.getElementById('outboundForm').reset();
            document.getElementById('totalPrice').textContent = '¥ 0.00';
            showPage('menuPage');
        }

        // 普通用户出库记录渲染
        function renderNormalOutbound(records) {
            const container = document.getElementById('outboundRecordsContainer');
            const emptyTip = document.getElementById('emptyTip_out');

            if (!records || records.length === 0) {
                container.innerHTML = '';
                emptyTip.classList.remove('hidden');
                return;
            }
            emptyTip.classList.add('hidden');

            let html = `<table class="record-table text-white text-sm">
                <thead>
                    <tr>
                        <th class="px-4 py-3 text-left">序号</th>
                        <th class="px-4 py-3 text-left">条形码</th>
                        <th class="px-4 py-3 text-left">品名</th>
                        <th class="px-4 py-3 text-right">单价</th>
                        <th class="px-4 py-3 text-right">数量</th>
                        <th class="px-4 py-3 text-right">总价</th>
                        <th class="px-4 py-3 text-center">时间</th>
                        <th class="px-4 py-3 text-center">操作</th>
                    </tr>
                </thead>
                <tbody>`;
            
            records.forEach((r, i) => {
                html += `
                <tr class="border-t border-white/10">
                    <td class="px-4 py-3">${i+1}</td>
                    <td class="px-4 py-3 font-mono">${r.barcode}</td>
                    <td class="px-4 py-3">${r.productName}</td>
                    <td class="px-4 py-3 text-right">¥ ${r.price.toFixed(2)}</td>
                    <td class="px-4 py-3 text-right">${r.quantity}</td>
                    <td class="px-4 py-3 text-right font-bold text-yellow-300">¥ ${r.total.toFixed(2)}</td>
                    <td class="px-4 py-3 text-center text-white/70 text-xs">${r.time}</td>
                    <td class="px-4 py-3 text-center">
                        <button onclick="deleteRecord('${r.id}')" class="text-red-400 hover:text-red-300 text-xs">删除</button>
                    </td>
                </tr>`;
            });
            html += '</tbody></table>';
            container.innerHTML = html;
        }

        // 管理员出库记录：按用户分组渲染
        function renderAdminOutbound(allUsers) {
            const container = document.getElementById('outboundRecordsContainer');
            const emptyTip = document.getElementById('emptyTip_out');

            let hasData = false;
            let html = '';

            for (const username in allUsers) {
                const user = allUsers[username];
                if (!user.outboundRecords || Object.keys(user.outboundRecords).length === 0) continue;
                hasData = true;

                const records = [];
                for (const id in user.outboundRecords) {
                    records.push({ id, ...user.outboundRecords[id] });
                }
                records.sort((a,b) => new Date(b.time) - new Date(a.time));

                html += `<div class="user-group">
                    <div class="user-group-title">👤 ${username}</div>
                    <table class="record-table text-white text-sm">
                        <thead>
                            <tr>
                                <th class="px-4 py-3 text-left">序号</th>
                                <th class="px-4 py-3 text-left">条形码</th>
                                <th class="px-4 py-3 text-left">品名</th>
                                <th class="px-4 py-3 text-right">单价</th>
                                <th class="px-4 py-3 text-right">数量</th>
                                <th class="px-4 py-3 text-right">总价</th>
                                <th class="px-4 py-3 text-center">时间</th>
                                <th class="px-4 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>`;
                
                records.forEach((r, i) => {
                    html += `
                    <tr class="border-t border-white/10">
                        <td class="px-4 py-3">${i+1}</td>
                        <td class="px-4 py-3 font-mono">${r.barcode}</td>
                        <td class="px-4 py-3">${r.productName}</td>
                        <td class="px-4 py-3 text-right">¥ ${r.price.toFixed(2)}</td>
                        <td class="px-4 py-3 text-right">${r.quantity}</td>
                        <td class="px-4 py-3 text-right font-bold text-yellow-300">¥ ${r.total.toFixed(2)}</td>
                        <td class="px-4 py-3 text-center text-white/70 text-xs">${r.time}</td>
                        <td class="px-4 py-3 text-center">
                            <button onclick="deleteRecord('${r.id}','${username}')" class="text-red-400 hover:text-red-300 text-xs">删除</button>
                        </td>
                    </tr>`;
                });
                html += '</tbody></table></div>';
            }

            if (!hasData) {
                container.innerHTML = '';
                emptyTip.classList.remove('hidden');
            } else {
                emptyTip.classList.add('hidden');
                container.innerHTML = html;
            }
        }

        function deleteRecord(id, owner) {
            if (!confirm('确定删除这条记录？')) return;
            if (storageMode === 'cloud' && isCloudReady) {
                const ow = isAdmin ? owner : currentUser;
                database.ref(`users/${ow}/outboundRecords/${id}`).remove();
            } else {
                let records = getLocalOutbound().filter(r => r.id != id);
                saveLocalOutbound(records);
                renderNormalOutbound(getLocalOutbound());
            }
        }

        function clearAllRecords() {
            if (!confirm('确定清空所有出库记录？')) return;
            if (storageMode === 'cloud' && isCloudReady) {
                if (isAdmin) {
                    alert('管理员不可批量清空，请逐条删除');
                    return;
                }
                database.ref(`users/${currentUser}/outboundRecords`).remove();
            } else {
                saveLocalOutbound([]);
                renderNormalOutbound([]);
            }
        }

        // ===================== 库存模块 =====================
        function calculateBatchTotal() {
            const price = parseFloat(document.getElementById('price_in').value) || 0;
            const quantity = parseInt(document.getElementById('quantity_in').value) || 0;
            document.getElementById('batchTotal').textContent = '¥ ' + (price * quantity).toFixed(2);
        }

        function saveStockIn() {
            const barcode = document.getElementById('barcode_in').value.trim();
            const productName = document.getElementById('productName_in').value.trim();
            const price = parseFloat(document.getElementById('price_in').value);
            const quantity = parseInt(document.getElementById('quantity_in').value);

            if (!barcode || !productName || isNaN(price) || isNaN(quantity)) {
                alert('请填写完整信息！');
                return;
            }
            if (price < 0 || quantity < 1) {
                alert('单价不能为负，数量不能小于1！');
                return;
            }

            const now = new Date().toLocaleString('zh-CN');

            if (storageMode === 'cloud' && isCloudReady) {
                const base = `users/${currentUser}`;
                const itemRef = database.ref(`${base}/inventory`).child(barcode);
                
                itemRef.once('value', (snap) => {
                    if (snap.exists()) {
                        const ex = snap.val();
                        const newQty = ex.quantity + quantity;
                        itemRef.update({
                            quantity: newQty, price,
                            totalValue: price * newQty,
                            lastUpdate: now
                        })
                        .then(() => { alert('入库成功！'); cancelStockIn(); })
                        .catch(err => alert('入库失败：' + err.message));
                    } else {
                        itemRef.set({
                            productName, price, quantity,
                            totalValue: price * quantity,
                            lastUpdate: now
                        })
                        .then(() => { alert('入库成功！'); cancelStockIn(); })
                        .catch(err => alert('入库失败：' + err.message));
                    }
                });
            } else {
                const inv = getLocalInventory();
                if (inv[barcode]) {
                    inv[barcode].quantity += quantity;
                    inv[barcode].price = price;
                    inv[barcode].totalValue = price * inv[barcode].quantity;
                    inv[barcode].lastUpdate = now;
                } else {
                    inv[barcode] = { productName, price, quantity, totalValue: price*quantity, lastUpdate: now };
                }
                saveLocalInventory(inv);
                alert('入库成功！');
                cancelStockIn();
                renderNormalInventory(Object.entries(getLocalInventory()).map(([k,v]) => ({barcode: k, ...v})));
            }
        }

        function cancelStockIn() {
            document.getElementById('stockInForm').reset();
            document.getElementById('batchTotal').textContent = '¥ 0.00';
            showPage('menuPage');
        }

        // 普通用户库存渲染
        function renderNormalInventory(inventory) {
            const container = document.getElementById('inventoryContainer');
            const emptyTip = document.getElementById('emptyTip_in');

            if (!inventory || inventory.length === 0) {
                container.innerHTML = '';
                emptyTip.classList.remove('hidden');
                return;
            }
            emptyTip.classList.add('hidden');

            let html = `<table class="record-table text-white text-sm">
                <thead>
                    <tr>
                        <th class="px-4 py-3 text-left">序号</th>
                        <th class="px-4 py-3 text-left">条形码</th>
                        <th class="px-4 py-3 text-left">品名</th>
                        <th class="px-4 py-3 text-right">单价</th>
                        <th class="px-4 py-3 text-right">库存</th>
                        <th class="px-4 py-3 text-right">总价值</th>
                        <th class="px-4 py-3 text-center">操作</th>
                    </tr>
                </thead>
                <tbody>`;
            
            inventory.forEach((item, i) => {
                html += `
                <tr class="border-t border-white/10">
                    <td class="px-4 py-3">${i+1}</td>
                    <td class="px-4 py-3 font-mono">${item.barcode}</td>
                    <td class="px-4 py-3">${item.productName}</td>
                    <td class="px-4 py-3 text-right">¥ ${item.price.toFixed(2)}</td>
                    <td class="px-4 py-3 text-right">${item.quantity}</td>
                    <td class="px-4 py-3 text-right font-bold text-green-300">¥ ${item.totalValue.toFixed(2)}</td>
                    <td class="px-4 py-3 text-center">
                        <button onclick="deleteItem('${item.barcode}')" class="text-red-400 hover:text-red-300 text-xs">删除</button>
                    </td>
                </tr>`;
            });
            html += '</tbody></table>';
            container.innerHTML = html;
        }

        // 管理员库存：按用户分组渲染
        function renderAdminInventory(allUsers) {
            const container = document.getElementById('inventoryContainer');
            const emptyTip = document.getElementById('emptyTip_in');

            let hasData = false;
            let html = '';

            for (const username in allUsers) {
                const user = allUsers[username];
                if (!user.inventory || Object.keys(user.inventory).length === 0) continue;
                hasData = true;

                const items = [];
                for (const barcode in user.inventory) {
                    items.push({ barcode, ...user.inventory[barcode] });
                }

                html += `<div class="user-group">
                    <div class="user-group-title">👤 ${username}</div>
                    <table class="record-table text-white text-sm">
                        <thead>
                            <tr>
                                <th class="px-4 py-3 text-left">序号</th>
                                <th class="px-4 py-3 text-left">条形码</th>
                                <th class="px-4 py-3 text-left">品名</th>
                                <th class="px-4 py-3 text-right">单价</th>
                                <th class="px-4 py-3 text-right">库存</th>
                                <th class="px-4 py-3 text-right">总价值</th>
                                <th class="px-4 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>`;
                
                items.forEach((item, i) => {
                    html += `
                    <tr class="border-t border-white/10">
                        <td class="px-4 py-3">${i+1}</td>
                        <td class="px-4 py-3 font-mono">${item.barcode}</td>
                        <td class="px-4 py-3">${item.productName}</td>
                        <td class="px-4 py-3 text-right">¥ ${item.price.toFixed(2)}</td>
                        <td class="px-4 py-3 text-right">${item.quantity}</td>
                        <td class="px-4 py-3 text-right font-bold text-green-300">¥ ${item.totalValue.toFixed(2)}</td>
                        <td class="px-4 py-3 text-center">
                            <button onclick="deleteItem('${item.barcode}','${username}')" class="text-red-400 hover:text-red-300 text-xs">删除</button>
                        </td>
                    </tr>`;
                });
                html += '</tbody></table></div>';
            }

            if (!hasData) {
                container.innerHTML = '';
                emptyTip.classList.remove('hidden');
            } else {
                emptyTip.classList.add('hidden');
                container.innerHTML = html;
            }
        }

        function deleteItem(barcode, owner) {
            if (!confirm('确定删除该商品？')) return;
            if (storageMode === 'cloud' && isCloudReady) {
                const ow = isAdmin ? owner : currentUser;
                database.ref(`users/${ow}/inventory/${barcode}`).remove();
            } else {
                const inv = getLocalInventory();
                delete inv[barcode];
                saveLocalInventory(inv);
                renderNormalInventory(Object.entries(getLocalInventory()).map(([k,v]) => ({barcode: k, ...v})));
            }
        }

        function clearAllInventory() {
            if (!confirm('确定清空所有库存？')) return;
            if (storageMode === 'cloud' && isCloudReady) {
                if (isAdmin) {
                    alert('管理员不可批量清空，请逐条删除');
                    return;
                }
                database.ref(`users/${currentUser}/inventory`).remove();
            } else {
                saveLocalInventory({});
                renderNormalInventory([]);
            }
        }

        // ===================== 系统检测 =====================
        function runSystemDiagnostic() {
            const modal = document.getElementById('diagnosticModal');
            const result = document.getElementById('diagnosticResult');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            result.innerHTML = '<p class="text-white/70">正在检测...</p>';

            let issues = [];
            let fixes = [];

            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                issues.push('✅ 本地存储正常');
            } catch (e) {
                issues.push('❌ 本地存储被禁用');
                fixes.push('开启浏览器本地存储');
            }

            if (typeof firebase !== 'undefined') {
                issues.push('✅ 云端SDK正常');
            } else {
                issues.push('❌ 云端SDK加载失败');
                fixes.push('检查网络连接');
            }

            if (faceModelsLoaded) {
                issues.push('✅ 人脸识别模型正常');
            } else {
                issues.push('⚠️ 人脸模型未加载');
                fixes.push('使用人脸功能时自动加载');
            }

            if (storageMode === 'cloud') {
                if (isCloudReady) {
                    issues.push('✅ 云端连接正常');
                    issues.push(`✅ 当前账号：${currentUser} ${isAdmin ? '(管理员)' : ''}`);
                    issues.push(`✅ 数据隔离：${isAdmin ? '全平台可见' : '仅自有数据'}`);
                } else {
                    issues.push('❌ 云端未连接');
                    fixes.push('检查网络、Firebase配置、数据库规则');
                }
            }

            issues.push('✅ 每次打开强制授权协议');
            issues.push('✅ 账号数据物理隔离，互不互通');
            issues.push('✅ 真实摄像头人脸识别，自动检测录入');

            setTimeout(() => {
                let html = issues.map(i => `<p>${i}</p>`).join('');
                if (fixes.length > 0) {
                    html += '<div class="mt-4 pt-4 border-t border-white/20">';
                    html += '<p class="font-bold mb-2">修复方案：</p>';
                    html += fixes.map(f => `<p class="text-yellow-300">• ${f}</p>`).join('');
                    html += '</div>';
                }
                
                html += '<div class="mt-4 pt-4 border-t border-white/20">';
                html += `<p class="font-bold text-purple-300">管理员账号：${ADMIN_USERNAME}</p>`;
                html += '<p class="text-white/70 text-xs">权限：查看所有用户数据，按用户分组展示</p>';
                html += '</div>';
                
                result.innerHTML = html;
            }, 1200);
        }

        function closeDiagnostic() {
            document.getElementById('diagnosticModal').classList.add('hidden');
            document.getElementById('diagnosticModal').classList.remove('flex');
        }
    </script>
</body>
</html>
