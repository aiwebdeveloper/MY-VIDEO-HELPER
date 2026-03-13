/**
 * MY VIDEO HELPER - Backend & Admin Management System
 */

// --- CONFIGURATION & DATABASE ---
const ADMIN_EMAIL_DEFAULT = "admin@helper.com";
const ADMIN_PASS_DEFAULT = "Admin@Secured#2026!";
const ALERT_EMAIL = "earnonlinemtn@gmail.com";

// Initialize mock DB
if (!localStorage.getItem('helper_users')) {
    localStorage.setItem('helper_users', JSON.stringify([]));
}
if (!localStorage.getItem('helper_admin_creds')) {
    localStorage.setItem('helper_admin_creds', JSON.stringify({ email: ADMIN_EMAIL_DEFAULT, pass: ADMIN_PASS_DEFAULT }));
}
if (!localStorage.getItem('trial_ips')) {
    localStorage.setItem('trial_ips', JSON.stringify([]));
}

// Security Configuration
const MIN_PASS_STRENGTH = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Integrity Fingerprint (Simulated)
const APP_INTEGRITY_KEY = "KINETIC_SEC_2026";

// --- SECURITY CORE ---

function validatePassword(pass) {
    return MIN_PASS_STRENGTH.test(pass);
}

async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (e) {
        return "unknown";
    }
}

function checkTampering() {
    // Check if critical functions were modified (simple check)
    const isTampered = window.drawFrame?.toString().includes('ctx.clearRect(0,0,canvas.width,canvas.height)') === false;
    if (localStorage.getItem('piracy_detected') === 'true' || isTampered) {
        document.body.innerHTML = `
            <div style="background:#000; color:red; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:monospace; text-align:center; padding:20px;">
                <h1>⚠️ CRITICAL SECURITY BREACH ⚠️</h1>
                <p>UNAUTHORIZED MODIFICATION DETECTED. SYSTEM MALWARE PROTECTION ACTIVE.</p>
                <p>An alert has been sent to the Master Admin.</p>
                <div style="margin-top:20px; color:#555; font-size:0.7rem;">Error Code: 0x8004100E_CORRUPT_FILES</div>
            </div>
        `;
        sendSecurityAlert("TAMPERING DETECTED: Files modified or integrity Key missing.");
        localStorage.setItem('piracy_detected', 'true');
        throw new Error("Piracy Protection Active");
    }
}

// --- SECURITY ALERT SYSTEM ---

async function sendSecurityAlert(reason) {
    const ip = await getClientIP();
    const timestamp = new Date().toLocaleString();
    const msg = `SECURITY ALERT for ${ALERT_EMAIL}:\nReason: ${reason}\nIP Address: ${ip}\nTime: ${timestamp}`;
    
    console.warn("!! SECURITY LOG !!", msg);
    
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.unshift({ reason, ip, timestamp }); // Latest first
    if (logs.length > 50) logs.pop(); // Keep last 50
    localStorage.setItem('security_logs', JSON.stringify(logs));
}

if (!localStorage.getItem('security_logs')) {
    localStorage.setItem('security_logs', JSON.stringify([]));
}

// Run integrity check
checkTampering();

// --- CORE AUTH LOGIC ---

function getAuthUsers() {
    return JSON.parse(localStorage.getItem('helper_users'));
}

function saveAuthUsers(users) {
    localStorage.setItem('helper_users', JSON.stringify(users));
}

// Check if current user is logged in and has active subscription
function checkAccess() {
    // Admin Bypass Check
    const isAdmin = localStorage.getItem('is_admin_mode') === 'true';
    if (isAdmin) return true;

    const loggedInUser = JSON.parse(localStorage.getItem('current_user'));
    if (!loggedInUser) return false;

    // Check for Unlimited/Lifetime Plan
    if (loggedInUser.plan === 'unlimited' || loggedInUser.expiry === -1) return true;

    // Check expiry
    const now = new Date().getTime();
    if (loggedInUser.expiry < now) {
        localStorage.removeItem('current_user');
        return false;
    }

    return true;
}

// Check if admin is logged in
function checkAdminAccess() {
    const isAdmin = localStorage.getItem('is_admin_mode') === 'true';
    if (!isAdmin) {
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

// --- FEE & DISCOUNT MANAGEMENT ---

const DEFAULT_PLANS = [
    { id: 'trial', name: '1 Day Free Trial', price: 0, days: 1 },
    { id: '1month', name: '1 Month Pro', price: 1000, days: 30 },
    { id: '3month', name: '3 Month Pro', price: 2500, days: 90 },
    { id: '6month', name: '6 Month Pro', price: 4000, days: 180 },
    { id: '1year', name: '1 Year Pro', price: 7000, days: 365 },
    { id: 'unlimited', name: 'Unlimited Lifetime', price: 15000, days: -1 },
    { id: 'friends_family', name: 'Friends & Family', price: 0, days: -1, hidden: true }
];

const DEFAULT_DISCOUNTS = [
    { code: 'WELCOME10', discount: 10, type: 'percent', active: true },
    { code: 'SAVE500', discount: 500, type: 'fixed', active: true }
];

if (!localStorage.getItem('helper_fee_plans')) {
    localStorage.setItem('helper_fee_plans', JSON.stringify(DEFAULT_PLANS));
}
if (!localStorage.getItem('helper_discounts')) {
    localStorage.setItem('helper_discounts', JSON.stringify(DEFAULT_DISCOUNTS));
}

function getFeePlans() {
    return JSON.parse(localStorage.getItem('helper_fee_plans'));
}

function getDiscounts() {
    return JSON.parse(localStorage.getItem('helper_discounts'));
}

function saveFeePlans(plans) {
    localStorage.setItem('helper_fee_plans', JSON.stringify(plans));
}

function saveDiscounts(discounts) {
    localStorage.setItem('helper_discounts', JSON.stringify(discounts));
}

function renderFeePlans() {
    const plans = getFeePlans();
    const container = document.getElementById('fee-plans-list');
    if (!container) return;

    container.innerHTML = plans.map((p, index) => `
        <div class="glass-panel p-3 mb-2" style="display:flex; justify-content:space-between; align-items:center; ${p.hidden ? 'border:1px solid var(--accent);' : ''}">
            <div>
                <strong>${p.name}</strong> ${p.hidden ? '<span class="badge-sm" style="background:var(--accent); color:#000; font-size:0.6rem; padding:2px 5px; border-radius:4px; margin-left:5px;">HIDDEN</span>' : ''} 
                <br><span class="text-secondary" style="font-size:0.8rem;">${p.price} PKR | ${p.days === -1 ? 'Lifetime' : p.days + ' Days'}</span>
            </div>
            <button onclick="deletePlan(${index})" class="btn-sm" style="background:var(--danger)"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

function renderDiscounts() {
    const discounts = getDiscounts();
    const container = document.getElementById('discounts-list');
    if (!container) return;

    container.innerHTML = discounts.map((d, index) => `
        <div class="glass-panel p-3 mb-2" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong>${d.code}</strong> - ${d.discount}${d.type === 'percent' ? '%' : ' PKR'} OFF ${d.active ? '<span style="color:var(--success)">(Active)</span>' : '<span style="color:var(--danger)">(Inactive)</span>'}
            </div>
            <div style="display:flex; gap:5px;">
                <button onclick="toggleDiscount(${index})" class="btn-sm" style="background:var(--accent)">${d.active ? 'Disable' : 'Enable'}</button>
                <button onclick="deleteDiscount(${index})" class="btn-sm" style="background:var(--danger)"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

window.addPlan = () => {
    const name = document.getElementById('plan-name').value;
    const price = parseInt(document.getElementById('plan-price').value);
    const days = parseInt(document.getElementById('plan-days').value);
    
    if(!name || isNaN(price) || isNaN(days)) return alert("Please fill all fields");
    
    const plans = getFeePlans();
    plans.push({ id: Date.now().toString(), name, price, days });
    saveFeePlans(plans);
    renderFeePlans();
    // Clear inputs
    document.getElementById('plan-name').value = '';
    document.getElementById('plan-price').value = '';
    document.getElementById('plan-days').value = '';
};

window.deletePlan = (index) => {
    if(confirm("Delete this plan?")) {
        const plans = getFeePlans();
        plans.splice(index, 1);
        saveFeePlans(plans);
        renderFeePlans();
    }
};

window.addDiscount = () => {
    const code = document.getElementById('disc-code').value.toUpperCase();
    const val = parseInt(document.getElementById('disc-val').value);
    const type = document.getElementById('disc-type').value;
    
    if(!code || isNaN(val)) return alert("Please fill all fields");
    
    const discounts = getDiscounts();
    discounts.push({ code, discount: val, type, active: true });
    saveDiscounts(discounts);
    renderDiscounts();
    // Clear inputs
    document.getElementById('disc-code').value = '';
    document.getElementById('disc-val').value = '';
};

window.toggleDiscount = (index) => {
    const discounts = getDiscounts();
    discounts[index].active = !discounts[index].active;
    saveDiscounts(discounts);
    renderDiscounts();
    renderSecurityLogs();
}

function renderSecurityLogs() {
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    const container = document.getElementById('security-logs-list');
    if (!container) return;

    if (logs.length === 0) {
        container.innerHTML = `<div class="text-center text-sm p-4 text-secondary">No security threats detected.</div>`;
        return;
    }

    container.innerHTML = logs.map(l => `
        <div class="glass-panel p-2 mb-2" style="border-left:3px solid var(--danger); font-size:0.75rem;">
            <div style="color:var(--danger); font-weight:bold;">${l.reason}</div>
            <div class="text-secondary">IP: ${l.ip} | ${l.timestamp}</div>
        </div>
    `).join('');
};

window.deleteDiscount = (index) => {
    if(confirm("Delete this discount?")) {
        const discounts = getDiscounts();
        discounts.splice(index, 1);
        saveDiscounts(discounts);
        renderDiscounts();
    }
};

window.logoutAdmin = () => {
    localStorage.removeItem('is_admin_mode');
    window.location.href = 'auth.html';
};

// Sign Up
const signupForm = document.getElementById('signup-form');
if(signupForm) {
    signupForm.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const pass = document.getElementById('signup-pass').value;
        const plan = document.getElementById('signup-plan').value;
        const botShield = document.getElementById('bot-shield-val').value;
        const country = document.getElementById('signup-country').value;
        const phone = document.getElementById('signup-phone').value;
        const dob = document.getElementById('signup-dob').value;
        const agree = document.getElementById('signup-agree').checked;

        // 1. Bot Check
        if (botShield !== "7") {
            alert("Bot Protection Failed! Solve the math correctly.");
            return;
        }

        // 2. Agreement Check
        if (!agree) {
            alert("You must agree to the Terms of Service.");
            return;
        }

        // 3. Age Validation (18+)
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            alert("SECURITY: Access Denied. You must be at least 18 years old.");
            return;
        }

        // 4. Password Strength
        if (!validatePassword(pass)) {
            alert("Password Too Weak! Must be 8+ chars with Upper, Lower, Number, and Special Char.");
            return;
        }

        // 1. Bot Check
        if (botShield !== "7") {
            alert("Bot Protection Failed! Solve the math correctly.");
            return;
        }

        // 5. IP Check for Trials
        const users = getAuthUsers();
        if (users.find(u => u.email === email)) {
            alert("Email already registered!");
            return;
        }

        // IP Tracking for Trials
        if (plan === 'trial') {
            getClientIP().then(ip => {
                const trialIps = JSON.parse(localStorage.getItem('trial_ips'));
                if (trialIps.includes(ip) && ip !== 'unknown') {
                    alert("SECURITY ALERT: This device has already used a Free Trial. Access Denied.");
                    return;
                }
                
                // If OK, proceed
                trialIps.push(ip);
                localStorage.setItem('trial_ips', JSON.stringify(trialIps));
                finalizeSignup(name, email, pass, plan, { country, phone, dob });
            });
        } else {
            finalizeSignup(name, email, pass, plan, { country, phone, dob });
        }
    };
}

function finalizeSignup(name, email, pass, plan, extra) {
    const plans = JSON.parse(localStorage.getItem('helper_fee_plans') || '[]');
    const selectedPlan = plans.find(p => p.id === plan) || { days: 0 };
    const days = selectedPlan.days;
    const users = getAuthUsers();

    const expiry = (days === -1) ? -1 : new Date().getTime() + (days * 24 * 60 * 60 * 1000);
    const signupDate = new Date().getTime();
    
    const newUser = { 
        name, 
        email, 
        pass, 
        plan, 
        expiry, 
        signupDate,
        phone: document.getElementById('signup-phone').value,
        status: 'pending' 
    };
    users.push(newUser);
    saveAuthUsers(users);

    alert("Account Created! Use Trial or Contact Admin for Payment Activation.");
    location.reload();
}

// Login
const loginForm = document.getElementById('login-form');
if(loginForm) {
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        const adminCreds = JSON.parse(localStorage.getItem('helper_admin_creds'));

        // Admin Login
        if (email === adminCreds.email && pass === adminCreds.pass) {
            localStorage.setItem('is_admin_mode', 'true');
            window.location.href = 'admin.html';
            return;
        }

        // Regular User
        const users = getAuthUsers();
        const user = users.find(u => u.email === email && u.pass === pass);

        if (user) {
            localStorage.setItem('current_user', JSON.stringify(user));
            localStorage.setItem('is_admin_mode', 'false');
            window.location.href = 'index.html';
        } else {
            sendSecurityAlert(`FAILED LOGIN ATTEMPT: Email: ${email}`);
            alert("Invalid Login Credentials!");
        }
    };
}

// Forgot Password Simulation
document.getElementById('btn-send-reset')?.addEventListener('click', () => {
    const email = document.getElementById('forgot-email').value;
    const users = getAuthUsers();
    const user = users.find(u => u.email === email);
    if(user) {
        alert("Reset Instructions sent to: " + email + "\n(Simulated: Your password is " + user.pass + ")");
    } else {
        alert("Email not found!");
    }
});

// Admin Control Panel Logic (Inside index.html later)
function renderAdminPanel() {
    const isAdmin = localStorage.getItem('is_admin_mode') === 'true';
    if (!isAdmin) return;

    const users = getAuthUsers();
    const list = document.getElementById('admin-user-list');
    if (!list) return;

    list.innerHTML = users.map((u, index) => `
        <div class="user-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="font-size:0.8rem;">
                <div style="font-weight:600;">${u.name}</div>
                <div style="color:rgba(255,255,255,0.5)">${u.email} (${u.plan})</div>
                <div style="font-size:0.7rem;">Expires: ${u.expiry === -1 ? '<span style="color:var(--success)">Lifetime</span>' : new Date(u.expiry).toLocaleDateString()}</div>
            </div>
            <div style="display:flex; gap:5px;">
                <button onclick="updateAccess(${index}, 30)" class="btn-sm" style="background:var(--success)">+30 Days</button>
                <button onclick="makeUnlimited(${index})" class="btn-sm" style="background:var(--accent)">Make Unlimited</button>
                <button onclick="assignSpecialPlan(${index})" class="btn-sm" style="background:#6c5ce7">Friends & Family</button>
                <button onclick="removeUserAccess(${index})" class="btn-sm" style="background:var(--danger)">Revoke</button>
            </div>
        </div>
    `).join('');
}

window.updateAccess = (index, days) => {
    const users = getAuthUsers();
    users[index].expiry += (days * 24 * 60 * 60 * 1000);
    saveAuthUsers(users);
    renderAdminPanel();
    alert("Access Extended!");
};

window.makeUnlimited = (index) => {
    if(confirm("Make this user Lifetime Unlimited?")) {
        const users = getAuthUsers();
        users[index].plan = 'unlimited';
        users[index].expiry = -1;
        saveAuthUsers(users);
        renderAdminPanel();
        alert("User is now Unlimited!");
    }
};

window.assignSpecialPlan = (index) => {
    if(confirm("Assign 'Friends & Family' Lifetime Zero-Cost Plan to this user?")) {
        const users = getAuthUsers();
        users[index].plan = 'friends_family';
        users[index].expiry = -1; // Lifetime
        saveAuthUsers(users);
        renderAdminPanel();
        alert("Special 'Friends & Family' Plan assigned!");
    }
};

window.removeUserAccess = (index) => {
    if(confirm("Are you sure?")) {
        const users = getAuthUsers();
        users.splice(index, 1);
        saveAuthUsers(users);
        renderAdminPanel();
    }
};

window.changeAdminEmail = (newEmail) => {
    if(!newEmail) return alert("Enter email");
    const creds = JSON.parse(localStorage.getItem('helper_admin_creds'));
    creds.email = newEmail;
    localStorage.setItem('helper_admin_creds', JSON.stringify(creds));
    alert("Admin Email Updated!");
};

window.changeAdminPass = (newPass) => {
    if(!newPass) return alert("Enter password");
    const creds = JSON.parse(localStorage.getItem('helper_admin_creds'));
    creds.pass = newPass;
    localStorage.setItem('helper_admin_creds', JSON.stringify(creds));
    alert("Admin Password Updated!");
};

// Initial Render for Admin Page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
        if(checkAdminAccess()) {
            renderAdminPanel();
            renderFeePlans();
            renderDiscounts();
            renderSecurityLogs();
        }
    }
});
