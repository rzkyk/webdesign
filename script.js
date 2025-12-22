document.addEventListener('DOMContentLoaded', () => {
    // ================= 1. DATABASE DATA =================
    const dbGames = [
        { code: "mlbb", kategori: "mobile", nama: "Mobile Legends", img: "ml.png" },
        { code: "pubg", kategori: "mobile", nama: "PUBG Mobile", img: "pubg.png" },
        { code: "ff", kategori: "mobile", nama: "Free Fire", img: "ff.png" },
        { code: "genshin", kategori: "mobile", nama: "Genshin Impact", img: "genshin impact.png" },
        { code: "valorant", kategori: "pc", nama: "Valorant", img: "valorant.png" },
        { code: "steam", kategori: "pc", nama: "Steam Wallet", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/2048px-Steam_icon_logo.svg.png" },
        { code: "gpro", kategori: "gear", nama: "Logitech G Pro X", img: "https://resource.logitech.com/content/dam/gaming/en/products/pro-x-superlight/pro-x-superlight-black-gallery-1.png" },
        { code: "blackshark", kategori: "gear", nama: "Razer BlackShark V2", img: "shark.png" },
        { code: "blackwidow", kategori: "gear", nama: "Razer BlackWidow V4", img: "widow.png" }
    ];

    const dbItems = {
        "mlbb": [ {n:"3 Diamonds", h:1500}, {n:"12 Diamonds", h:4000}, {n:"50 Diamonds", h:15000}, {n:"100 Diamonds", h:30000}, {n:"Starlight Member", h:150000} ],
        "pubg": [ {n:"60 UC", h:14000}, {n:"325 UC", h:70000}, {n:"Royale Pass", h:150000} ],
        "ff": [ {n:"5 Diamonds", h:1000}, {n:"70 Diamonds", h:10000}, {n:"Weekly Member", h:30000} ],
        "genshin": [ {n:"60 Genesis", h:16000}, {n:"Welkin Moon", h:79000} ],
        "valorant": [ {n:"125 Points", h:15000}, {n:"700 Points", h:80000}, {n:"1375 Points", h:150000} ],
        "steam": [ {n:"IDR 12k", h:12000}, {n:"IDR 90k", h:90000}, {n:"IDR 250k", h:250000} ],
        "gpro": [ {n:"Mouse (Black)", h:1890000}, {n:"Mouse (White)", h:1890000} ], 
        "blackshark": [ {n:"Headset (Black)", h:2400000}, {n:"Headset (White)", h:2400000} ], 
        "blackwidow": [ {n:"Switch Green", h:2800000}, {n:"Switch Yellow", h:2800000} ]
    };

    // ================= 2. STATE VARIABLES =================
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let cart = 0;
    let shoppingCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    let currentCategory = '';
    let isWaitingForResponse = false; 

    // ================= 3. DOM ELEMENTS =================
    const navAuthBtn = document.getElementById('navAuthBtn');
    const userDropdown = document.getElementById('userDropdown');
    const overlay = document.getElementById('loginOverlay');
    const cartOverlay = document.getElementById('cartOverlay');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const receiptOverlay = document.getElementById('receiptOverlay');
    
    // Chat Elements
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatBody = document.getElementById('chatBody');
    const chatBox = document.getElementById('chatBox');

    // ================= 4. MAIN FUNCTIONS =================

    window.openPage = function(kategori) {
        if (!isLoggedIn) { overlay.classList.add('active'); showToast("🔒 Please login first!", "error"); return; }
        
        currentCategory = kategori;
        document.getElementById('homeView').style.display = 'none';
        document.getElementById('productView').style.display = 'block';
        document.getElementById('detailView').style.display = 'none';
        
        const container = document.getElementById('productContainer');
        document.getElementById('pageTitle').innerHTML = kategori === 'mobile' ? "🔥 Mobile Games" : kategori === 'pc' ? "💻 PC Games" : "🎧 Gaming Gear";
        container.innerHTML = "";
        
        const hasil = dbGames.filter(item => item.kategori === kategori);
        hasil.forEach(game => renderGameCard(game, container));
        window.scrollTo(0, 0);
    }

    window.openDetail = function(code, namaGame, imgGame) {
        document.getElementById('productView').style.display = 'none';
        document.getElementById('detailView').style.display = 'block';
        document.getElementById('detailName').innerText = namaGame;
        document.getElementById('detailImg').src = imgGame;
        const container = document.getElementById('detailContainer');
        container.innerHTML = "";
        
        const items = dbItems[code];
        if(items) {
            items.forEach(item => {
                container.innerHTML += `
                    <div class="card">
                        <h3 style="margin-top:10px;">${item.n}</h3>
                        <p style="color:#22c55e; font-weight:bold; font-size:1.1rem;">Rp ${item.h.toLocaleString()}</p>
                        <button class="btn-buy" onclick="addToCart('${namaGame} - ${item.n}', ${item.h}, '${imgGame}')">+ Add to Cart</button>
                    </div>`;
            });
        }
        window.scrollTo(0, 0);
    }

    window.goHome = function() {
        document.getElementById('productView').style.display = 'none';
        document.getElementById('detailView').style.display = 'none';
        document.getElementById('homeView').style.display = 'block';
        document.getElementById('searchInput').value = ''; 
        window.scrollTo(0, 0);
    }

    window.backToProduct = function() { window.openPage(currentCategory); }

    // --- Search Function ---
    window.searchGame = function() {
        const input = document.getElementById('searchInput');
        const keyword = input.value.toLowerCase();
        
        if (!isLoggedIn) { showToast("🔒 Login to search games!", "error"); return; }
        if (keyword.length === 0) return;

        document.getElementById('homeView').style.display = 'none';
        document.getElementById('detailView').style.display = 'none';
        document.getElementById('productView').style.display = 'block';
        
        const container = document.getElementById('productContainer');
        document.getElementById('pageTitle').innerText = "🔍 Result: " + keyword;
        container.innerHTML = "";

        const hasil = dbGames.filter(game => game.nama.toLowerCase().includes(keyword));
        
        if(hasil.length > 0) {
            hasil.forEach(game => renderGameCard(game, container));
        } else {
            container.innerHTML = "<p style='text-align:center; width:100%; color:#94a3b8;'>Game not found.</p>";
        }
    }

    // --- Cart Functions ---
    window.addToCart = function(nama, harga, img) {
        if(!isLoggedIn) { overlay.classList.add('active'); return; }
        shoppingCart.push({nama, harga, img});
        updateCartUI();
        showToast(`🛒 ${nama} added to cart!`, "success");
    }

    window.toggleCart = function(show) {
        if(show) { renderCartItems(); cartOverlay.classList.add('active'); } 
        else { cartOverlay.classList.remove('active'); }
    }

    window.hapusItem = function(index) {
        shoppingCart.splice(index, 1); 
        updateCartUI();
        renderCartItems();
    }

    window.openCheckout = function() {
        if(shoppingCart.length === 0) { showToast("❌ Cart is empty!", "error"); return; }
        window.toggleCart(false);
        checkoutOverlay.classList.add('active');
    }

    window.closeCheckout = function() { checkoutOverlay.classList.remove('active'); }
    window.closeReceipt = function() { receiptOverlay.classList.remove('active'); window.goHome(); }

    // ================= 5. HELPER FUNCTIONS =================

    function renderGameCard(game, container) {
        container.innerHTML += `
            <div class="card" onclick="openDetail('${game.code}', '${game.nama}', '${game.img}')" style="cursor: pointer;">
                <img src="${game.img}" alt="${game.nama}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/566/566281.png'">
                <h3>${game.nama}</h3>
                <p style="color:var(--primary); font-size:0.9rem;">Select Price ➤</p>
            </div>`;
    }

    function updateCartUI() {
        cart = shoppingCart.length;
        document.getElementById('cartCount').textContent = cart;
        localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
    }

    function renderCartItems() {
        const list = document.getElementById('cartItemsList');
        const totalLabel = document.getElementById('cartTotal');
        list.innerHTML = "";
        let total = 0;

        if(shoppingCart.length === 0) { 
            list.innerHTML = "<p style='text-align:center; color:#94a3b8;'>Empty...</p>"; 
            totalLabel.innerText = "Rp 0"; 
            return; 
        }

        shoppingCart.forEach((item, index) => {
            total += item.harga;
            list.innerHTML += `
                <div style="display:flex; gap:10px; margin-bottom:10px; background:#0f1116; padding:10px; border-radius:10px; align-items:center;">
                    <img src="${item.img}" style="width:40px; height:40px; border-radius:5px; object-fit:cover;">
                    <div style="flex:1;"><h4 style="font-size:0.9rem;">${item.nama}</h4><span style="color:#94a3b8; font-size:0.8rem;">Rp ${item.harga.toLocaleString()}</span></div>
                    <button onclick="hapusItem(${index})" style="background:#ef4444; border:none; color:white; width:25px; height:25px; border-radius:50%; cursor:pointer;">×</button>
                </div>`;
        });
        totalLabel.innerText = `Rp ${total.toLocaleString()}`;
        document.getElementById('checkoutTotal').innerText = `Rp ${total.toLocaleString()}`;
    }

    function showToast(msg, type) {
        const t = document.getElementById('toast');
        t.innerText = msg;
        t.style.borderColor = type==="success"?"#22c55e":"#ef4444"; 
        t.style.color = type==="success"?"#22c55e":"#ef4444";
        t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000);
    }

    function updateAuthUI() {
        if(isLoggedIn) { 
            navAuthBtn.textContent = `👤 ${localStorage.getItem('user')}`; 
            navAuthBtn.style.color = "#00d2ff"; 
        } else { 
            navAuthBtn.textContent = "Login"; 
            navAuthBtn.style.color = ""; 
            userDropdown.classList.remove('active'); 
        }
    }

    // ================= 6. EVENT LISTENERS =================

    // Search Input Enter Key
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if(e.key === 'Enter') window.searchGame();
    });

    // Checkout Submit
    document.getElementById('checkoutForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const method = document.getElementById('paymentMethod').value;
        const total = document.getElementById('checkoutTotal').innerText;
        const trxId = "INV-" + Math.floor(Math.random() * 1000000);

        // Fill Receipt
        document.getElementById('receiptDate').innerText = new Date().toLocaleString();
        document.getElementById('receiptTrx').innerText = trxId;
        document.getElementById('receiptId').innerText = userId;
        document.getElementById('receiptMethod').innerText = method;
        document.getElementById('receiptTotal').innerText = total;

        let itemsHtml = "";
        shoppingCart.forEach(item => itemsHtml += `<p style="display:flex; justify-content:space-between;"><span>${item.nama}</span><span>${item.harga.toLocaleString()}</span></p>`);
        document.getElementById('receiptItems').innerHTML = itemsHtml;

        window.closeCheckout();
        showToast("⏳ Processing...", "success");
        setTimeout(() => {
            receiptOverlay.classList.add('active');
            shoppingCart = []; updateCartUI();
            document.getElementById('checkoutForm').reset();
        }, 1500);
    });

    // Auth Listeners
    navAuthBtn.addEventListener('click', (e) => { 
        e.preventDefault(); 
        if(!isLoggedIn) overlay.classList.add('active'); 
        else userDropdown.classList.toggle('active'); 
    });
    
    document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', () => {
        overlay.classList.remove('active');
        cartOverlay.classList.remove('active');
        checkoutOverlay.classList.remove('active');
    }));

    document.getElementById('toRegister').onclick = () => { document.getElementById('loginBox').style.display='none'; document.getElementById('registerBox').style.display='block'; };
    document.getElementById('toLogin').onclick = () => { document.getElementById('registerBox').style.display='none'; document.getElementById('loginBox').style.display='block'; };

    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;
        if(email === localStorage.getItem('email') && pass === localStorage.getItem('pass')) {
            isLoggedIn = true; localStorage.setItem('isLoggedIn', 'true');
            overlay.classList.remove('active'); updateAuthUI(); showToast("🚀 Login Successful!", "success");
        } else { showToast("❌ Wrong Email/Password", "error"); }
    };

    document.getElementById('registerForm').onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('user', document.getElementById('regUser').value);
        localStorage.setItem('email', document.getElementById('regEmail').value);
        localStorage.setItem('pass', document.getElementById('regPass').value);
        showToast("✅ Account Created! Please Login.", "success");
        document.getElementById('toLogin').click();
    };

    document.getElementById('logoutBtn').onclick = () => {
        isLoggedIn = false; localStorage.removeItem('isLoggedIn');
        updateAuthUI(); showToast("👋 Bye bye!", "success"); window.goHome();
    };

    // ================= 7. LIVE CHAT SYSTEM =================
    
    document.getElementById('chatTrigger').onclick = () => chatBox.classList.toggle('active');
    document.getElementById('closeChat').onclick = () => chatBox.classList.remove('active');

    function appendMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `message ${sender}`; // 'user' or 'admin'
        div.textContent = text;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function handleSend() {
        const txt = chatInput.value.trim();
        if(!txt) return;
        
        appendMessage('user', txt);
        chatInput.value = "";

        if(!isWaitingForResponse) {
            isWaitingForResponse = true;
            setTimeout(() => {
                let reply = "Hello! How can we help?";
                const low = txt.toLowerCase();
                if(low.includes('price') || low.includes('pay') || low.includes('cost')) reply = "Prices are listed on each item. Payment via QRIS/DANA.";
                else if(low.includes('top up') || low.includes('buy')) reply = "Please select a game on the main page, then click the package you want.";
                else if(low.includes('long') || low.includes('time')) reply = "Automatic process 1-5 mins. Max 24 hours if disrupted.";
                
                appendMessage('admin', reply);
                isWaitingForResponse = false;
            }, 1000);
        } else {
            appendMessage('admin', "Please wait, one by one...");
        }
    }

    sendChatBtn.onclick = handleSend;
    chatInput.onkeypress = (e) => { if(e.key === 'Enter') handleSend(); };

    // Initialize UI
    updateAuthUI();
    updateCartUI();
});