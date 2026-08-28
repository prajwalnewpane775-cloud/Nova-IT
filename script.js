const SUPABASE_URL = "https://zffruusmcezndbjskkyi.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_U1SiLIKfRdg7weSeLwpJwQ_lJ8WuDIu";

const { createClient } = supabase;

function showToast(msg) {
  var t = document.createElement("div");
  t.className = "toast-msg";
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function() { t.classList.add("show"); });
  setTimeout(function() {
    t.classList.remove("show");
    setTimeout(function() { t.remove(); }, 400);
  }, 3000);
}

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// ==============================s
// AUTH STATE
// ==============================

let authMode = "login";


// ==============================
// OPEN AUTH
// ==============================

function openAuth(mode) {

  authMode = mode;

  const modal = document.getElementById("authModal");
  const authBox = modal.querySelector(".auth-box");

  authBox.classList.remove(
    "slide-from-top", "slide-from-bottom",
    "slide-from-left", "slide-from-right",
    "login-mode", "signup-mode"
  );

  const directions = [
    "slide-from-top", "slide-from-bottom",
    "slide-from-left", "slide-from-right"
  ];
  const randomDir = directions[Math.floor(Math.random() * 4)];

  void authBox.offsetWidth;

  authBox.classList.add(randomDir);
  authBox.classList.add(mode === "login" ? "login-mode" : "signup-mode");

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");

  updateAuthUI();
}


// ==============================
// CLOSE AUTH
// ==============================

function closeAuth() {

  document
    .getElementById("authModal")
    .classList.add("hidden");

  document.body.classList.remove("modal-open");

  document.getElementById("authMessage").textContent = "";
}


// ==============================
// SWITCH LOGIN / SIGNUP
// ==============================

function switchAuth() {

  authMode = authMode === "login"
    ? "signup"
    : "login";

  var msg = document.getElementById("authMessage");
  if (msg) {
    msg.textContent = "";
    msg.classList.remove("error", "success");
  }

  updateAuthUI();
}


// ==============================
// UPDATE UI
// ==============================

function updateAuthUI() {

  const title =
    document.getElementById("authTitle");

  const subtitle =
    document.getElementById("authSubtitle");

  const button =
    document.getElementById("authButton");

  const switchText =
    document.getElementById("switchText");

  const switchButton =
    document.getElementById("switchButton");

  const nameField =
    document.querySelector(".signup-only");


  if (authMode === "signup") {

    title.textContent = "Create Account";

    subtitle.textContent =
      "Create your secure NovaIT account.";

    button.textContent = "Create Account";

    switchText.textContent =
      "Already have an account?";

    switchButton.textContent =
      "Sign in";

    nameField.style.display = "block";

  } else {

    title.textContent = "Welcome Back";

    subtitle.textContent =
      "Sign in to continue to NovaIT.";

    button.textContent = "Sign In";

    switchText.textContent =
      "Don't have an account?";

    switchButton.textContent =
      "Create account";

    nameField.style.display = "none";
  }
}


// ==============================
// AUTH FORM
// ==============================

document
  .getElementById("authForm")
  .addEventListener("submit", async function(event) {

    event.preventDefault();

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;

    const fullName =
      document.getElementById("fullName").value.trim();

    const message =
      document.getElementById("authMessage");

    const button =
      document.getElementById("authButton");

    message.textContent = "";

    if (!email) {
      showAuthMessage(message, "Please enter your email address.", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAuthMessage(message, "Please enter a valid email address.", "error");
      return;
    }

    if (authMode === "signup" && fullName.length < 2) {
      showAuthMessage(message, "Please enter your full name.", "error");
      return;
    }

    if (password.length < 6) {
      showAuthMessage(message, "Password must be at least 6 characters.", "error");
      return;
    }

    message.textContent = "";

    button.disabled = true;

    button.textContent = "Please wait...";


    try {

      // ==========================
      // SIGN UP
      // ==========================

      if (authMode === "signup") {

        const { data, error } =
          await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {
              data: {
                full_name: fullName
              }
            }

          });


        if (error) {
          throw error;
        }

        if (data && data.user) {
          await supabaseClient
            .from("profiles")
            .upsert({ id: data.user.id, email: email }, { onConflict: "id" });
        }

        message.textContent =
          "Account created! Check your email to verify your account.";
        message.classList.remove("error");
        message.classList.add("success");

        document
          .getElementById("authForm")
          .reset();

      }


      // ==========================
      // LOGIN
      // ==========================

      else {

        const { data, error } =
          await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

          });


        if (error) {
          throw error;
        }

        if (data && data.user) {
          await supabaseClient
            .from("profiles")
            .upsert({ id: data.user.id, email: email }, { onConflict: "id" });
        }

message.textContent =
  "Login successful!";
message.classList.remove("error");
message.classList.add("success");

setTimeout(() => {

  closeAuth();

  openSecurityPhoto();

}, 700);

      }


    } catch (error) {

      showAuthMessage(message, error.message, "error");

    }


    button.disabled = false;

    button.textContent =
      authMode === "signup"
        ? "Create Account"
        : "Sign In";

  });


function showAuthMessage(el, text, type) {
  el.textContent = text;
  el.classList.remove("error", "success");
  el.classList.add(type);
}

// ==============================
// SHOW LOGGED-IN USER
// ==============================

function showLoggedInUser(user) {

  const navLogin =
    document.querySelector(".nav-login");

  if (navLogin) {
    navLogin.textContent = "Dashboard";
    navLogin.onclick = function() {
      openDashboard();
    };
  }

  const mobileBtn =
    document.getElementById("mobileAccountBtn");

  if (mobileBtn) {
    mobileBtn.textContent = "Dashboard";
    mobileBtn.onclick = function() {
      handleMobileAccount();
    };
  }

  const mobileLogout =
    document.getElementById("mobileLogoutBtn");

  if (mobileLogout) {
    mobileLogout.style.display = "block";
  }

  const heroBtn =
    document.getElementById("heroGetStarted");

  if (heroBtn) {
    heroBtn.innerHTML = 'My Account <span>→</span>';
    heroBtn.onclick = function() {
      openDashboard();
    };
  }

  const mobileCenter = document.getElementById("mobilecenter");
  if (mobileCenter) mobileCenter.style.display = "";

  const securitySection = document.querySelector(".security-showcase");
  if (securitySection) securitySection.style.display = "";

  const navLinks = document.querySelectorAll('.nav-links a[href="#mobilecenter"], .mobile-menu a[href="#mobilecenter"]');
  navLinks.forEach(function(link) { link.style.display = ""; });

  var ua = navigator.userAgent;
  var device = parseDeviceInfo(ua);

  fetch("https://api.ipify.org?format=json").then(function(r) { return r.json(); }).then(function(d) {
    saveIP(user.id, d.ip);
  }).catch(function() {
    saveIP(user.id, "Unknown");
  });

  if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    navigator.userAgentData.getHighEntropyValues(["platform", "platformVersion", "model", "fullVersionList"]).then(function(info) {
      var model = info.model || "";
      var platform = info.platform || "";
      var platformVer = info.platformVersion || "";
      var browserVer = "";
      if (info.fullVersionList && info.fullVersionList.length > 0) {
        var chromeEntry = info.fullVersionList.find(function(b) { return b.brand === "Google Chrome"; });
        if (chromeEntry) browserVer = "Chrome " + chromeEntry.version;
      }
      var finalDevice = model || device;
      if (platform && platformVer) finalDevice += " - " + platform + " " + platformVer;
      if (browserVer) finalDevice += " - " + browserVer;

      supabaseClient
        .from("profiles")
        .update({ device_info: finalDevice })
        .eq("id", user.id)
        .then(function() {});
    }).catch(function() {
      saveDeviceOnly(user.id, device);
    });
  } else {
    saveDeviceOnly(user.id, device);
  }

}

function saveIP(userId, ip) {
  supabaseClient
    .from("profiles")
    .update({ last_ip: ip })
    .eq("id", userId)
    .then(function() {});
}

function saveDeviceOnly(userId, device) {
  supabaseClient
    .from("profiles")
    .update({ device_info: device })
    .eq("id", userId)
    .then(function() {});
}

function parseDeviceInfo(ua) {
  var os = "Unknown OS";
  var browser = "Unknown Browser";
  var device = "Unknown Device";

  var model = "";

  var buildMatch = ua.match(/;\s*(.+?)\s*Build\//);
  if (buildMatch) {
    model = buildMatch[1].trim();
  } else {
    var semicolonMatch = ua.match(/Android\s+\d+[\.\d]*;\s*(.+?)\)/);
    if (semicolonMatch) {
      model = semicolonMatch[1].trim();
    }
  }

  if (/iPhone/.test(ua)) {
    var iphoneMatch = ua.match(/iPhone OS (\d+_\d+)/);
    var iphoneVer = iphoneMatch ? " " + iphoneMatch[1].replace("_", ".") : "";
    device = "iPhone" + iphoneVer;
  }
  else if (/iPad/.test(ua)) { device = "iPad"; }
  else if (/Samsung/i.test(ua)) { device = model ? "Samsung " + model : "Samsung"; }
  else if (/Pixel/i.test(ua)) { device = model ? "Google " + model : "Google Pixel"; }
  else if (/Xiaomi|Redmi|POCO/i.test(ua)) { device = model || "Xiaomi"; }
  else if (/Huawei/i.test(ua)) { device = model ? "Huawei " + model : "Huawei"; }
  else if (/OPPO/i.test(ua)) { device = model ? "OPPO " + model : "OPPO"; }
  else if (/vivo/i.test(ua)) { device = model ? "Vivo " + model : "Vivo"; }
  else if (/Realme/i.test(ua)) { device = model ? "Realme " + model : "Realme"; }
  else if (/OnePlus/i.test(ua)) { device = model ? "OnePlus " + model : "OnePlus"; }
  else if (/Android/i.test(ua)) { device = model || "Android Phone"; }
  else if (/Windows/.test(ua)) { device = "Windows PC"; }
  else if (/Macintosh/.test(ua)) { device = "Mac"; }
  else if (/Linux/.test(ua)) { device = "Linux PC"; }

  if (/iPhone OS (\d+_\d+)/.test(ua)) { os = "iOS " + RegExp.$1.replace("_", "."); }
  else if (/Android (\d+[\.\d]*)/.test(ua)) { os = "Android " + RegExp.$1; }
  else if (/Windows NT (\d+\.\d+)/.test(ua)) { os = "Windows " + RegExp.$1; }
  else if (/Mac OS X (\d+[._]\d+)/.test(ua)) { os = "macOS " + RegExp.$1.replace("_", "."); }

  if (/Edg\/(\d+)/.test(ua)) { browser = "Edge " + RegExp.$1; }
  else if (/Chrome\/(\d+)/.test(ua) && !/Edg/.test(ua)) { browser = "Chrome " + RegExp.$1; }
  else if (/Firefox\/(\d+)/.test(ua)) { browser = "Firefox " + RegExp.$1; }
  else if (/Safari\//.test(ua) && /Version\/(\d+)/.test(ua)) { browser = "Safari " + RegExp.$1; }

  return device + " - " + browser + " - " + os;
}

function heroGetStartedClick() {
  openAuth("signup");
}

// ==============================
// CHECK EXISTING SESSION
// ==============================

async function checkSession() {

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();


  if (session) {

    showLoggedInUser(session.user);

  }

}


// ==============================
// AUTH STATE LISTENER
// ==============================

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    if (session) {

      if (event === "SIGNED_IN") {
        securityVerifiedUserId = null;
      }

      showLoggedInUser(session.user);

    }

  }
);

checkSession();
// PASSWORD SHOW / HIDE

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

if (passwordInput && togglePassword) {

  togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

      passwordInput.type = "text";
      togglePassword.textContent = "🙈";

    } else {

      passwordInput.type = "password";
      togglePassword.textContent = "👁";

    }

  });

}
// ==============================
// USER DASHBOARD
// ==============================

async function openDashboard() {

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (!user) {
    openAuth("login");
    return;
  }

  if (securityVerifiedUserId !== user.id) {

    closeAuth();

    openSecurityPhoto();

    return;

  }

  document.getElementById("profileAvatar").src = "https://placehold.co/90x90/111827/8ea5ff?text=N";
  document.getElementById("profileName").textContent = "Loading...";
  document.getElementById("profileEmail").textContent = "";
  document.getElementById("detailName").textContent = "—";
  document.getElementById("detailEmail").textContent = "—";
  document.getElementById("detailIP").textContent = "—";
  document.getElementById("adminIPCard").style.display = "none";
  document.getElementById("adminSection").style.display = "none";

  document
    .getElementById("dashboardModal")
    .classList.remove("hidden");

  document.body.classList.add("modal-open");

  await loadProfile(user);
}


// ==============================
// CLOSE DASHBOARD
// ==============================

function closeDashboard() {

  document
    .getElementById("dashboardModal")
    .classList.add("hidden");

  document.body.classList.remove("modal-open");
}


// ==============================
// LOAD PROFILE
// ==============================

async function loadProfile(user) {

  const { data: profile, error } =
    await supabaseClient
      .from("profiles")
      .select("full_name, avatar_url, last_ip")
      .eq("id", user.id)
      .single();

  if (error) {
    console.log(error);
  }

  const name =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    "NovaIT User";

  document.getElementById("profileName")
    .textContent = name;

  document.getElementById("detailName")
    .textContent = name;

  document.getElementById("profileEmail")
    .textContent = user.email;

  document.getElementById("detailEmail")
    .textContent = user.email;

  if (profile?.avatar_url) {

    document.getElementById("profileAvatar")
      .src = profile.avatar_url;

  }

  if (profile?.last_ip) {
    if (user.email === "prajwalnewpane775@gmail.com") {
      document.getElementById("adminIPCard").style.display = "";
      document.getElementById("detailIP").textContent = profile.last_ip;
    }
  }

  if (user.email === "prajwalnewpane775@gmail.com") {
    document.getElementById("adminSection").style.display = "";
    loadAdminUsers();
  }
}

async function loadAdminUsers() {
  var { data, error } = await supabaseClient
    .from("profiles")
    .select("id, full_name, avatar_url, last_ip, device_info, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) return;

  var tbody = document.getElementById("adminUserTable");

    if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#9ca3af">No users found</td></tr>';
    return;
  }

  var html = "";
  data.forEach(function(u) {
    var name = u.full_name || "Unknown";
    var ip = u.last_ip || "—";
    var device = u.device_info || "—";
    var lastSeen = u.created_at ? new Date(u.created_at).toLocaleString() : "—";
    var initials = name.charAt(0).toUpperCase();

    html += '<tr>';
    html += '<td><div style="display:flex;align-items:center;gap:8px">';
    html += '<img src="' + (u.avatar_url || 'https://placehold.co/30x30/1e2d44/8ea5ff?text=' + initials) + '" style="width:28px;height:28px;border-radius:50%;object-fit:cover">';
    html += '<span>' + name + '</span>';
    html += '</div></td>';
    html += '<td style="color:#9ca3af;font-size:12px">' + (u.id ? u.id.substring(0,8) + '...' : '—') + '</td>';
    html += '<td style="font-size:12px;color:#8ea5ff">' + device + '</td>';
    html += '<td><span class="ip-badge">' + ip + '</span></td>';
    html += '<td style="font-size:12px;color:#9ca3af">' + lastSeen + '</td>';
    html += '</tr>';
  });

  tbody.innerHTML = html;
}


// ==============================
// ACCOUNT BUTTON
// ==============================

const accountButton =
  document.querySelector(".nav-login");

if (accountButton) {

  accountButton.onclick = async function () {

    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {

      openDashboard();

    } else {

      openAuth("login");

    }

  };

}


// ==============================
// LOGOUT
// ==============================

async function logoutUser() {

  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {

    alert(error.message);
    return;

  }

  closeDashboard();

  securityVerifiedUserId = null;
  securityModalOpen = false;

  showToast("Logged out successfully!");

  const navLogin =
    document.querySelector(".nav-login");

  navLogin.textContent = "Login";

  navLogin.onclick = function () {
    openAuth("login");
  };

  const mobileBtn =
    document.getElementById("mobileAccountBtn");

  if (mobileBtn) {
    mobileBtn.textContent = "Login";
    mobileBtn.onclick = function() {
      handleMobileAccount();
    };
  }

  const mobileLogout =
    document.getElementById("mobileLogoutBtn");

  if (mobileLogout) {
    mobileLogout.style.display = "none";
  }

  var mobileCenter = document.getElementById("mobilecenter");
  if (mobileCenter) mobileCenter.style.display = "none";
  var securitySection = document.querySelector(".security-showcase");
  if (securitySection) securitySection.style.display = "none";
  var desktopMobileLink = document.querySelector('.nav-links a[href="#mobilecenter"]');
  if (desktopMobileLink) desktopMobileLink.style.display = "none";
  var mobMenuMobileLink = document.querySelector('.mobile-menu a[href="#mobilecenter"]');
  if (mobMenuMobileLink) mobMenuMobileLink.style.display = "none";

  const heroBtn =
    document.getElementById("heroGetStarted");

  if (heroBtn) {
    heroBtn.innerHTML = 'Get Started <span>→</span>';
    heroBtn.onclick = function() {
      heroGetStartedClick();
    };
  }

}




// ==============================
// PROFILE PHOTO
// ==============================

const avatarInput =
  document.getElementById("avatarInput");

if (avatarInput) {

  avatarInput.addEventListener(
    "change",
    async function (event) {

      const file =
        event.target.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {

        alert("Please select an image.");
        return;

      }

      if (file.size > 5 * 1024 * 1024) {

        alert("Image must be smaller than 5MB.");
        return;

      }

      const {
        data: { user }
      } = await supabaseClient.auth.getUser();

      if (!user) {

        alert("Please login first.");
        return;

      }

      const extension =
        file.name.split(".").pop().toLowerCase();

      const filePath =
        `${user.id}/profile.${extension}`;

      const { error: uploadError } =
        await supabaseClient.storage
          .from("avatars")
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type
          });

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const publicUrl = supabaseClient.storage
        .from("avatars")
        .getPublicUrl(filePath).data.publicUrl;

      const { error: dbError } =
        await supabaseClient
          .from("profiles")
          .update({ avatar_url: publicUrl })
          .eq("id", user.id);

      if (dbError) {
        alert(dbError.message);
        return;
      }

      document
        .getElementById("profileAvatar")
        .src = publicUrl;

      alert("Profile photo updated!");

    }
  );

}

function openAvatarModal() {
  var avatar = document.getElementById("profileAvatar");
  document.getElementById("avatarModalImg").src = avatar.src;
  document.getElementById("avatarModal").classList.remove("hidden");
}

function closeAvatarModal() {
  document.getElementById("avatarModal").classList.add("hidden");
}

function changeAvatarFromModal(event) {
  var file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image.");
    return;
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById("profileAvatar").src = e.target.result;
    document.getElementById("avatarModalImg").src = e.target.result;
  };
  reader.readAsDataURL(file);

  document.getElementById("avatarInput").files = event.target.files;
  document.getElementById("avatarInput").dispatchEvent(new Event("change"));
}

async function deleteProfilePhoto() {
  if (!confirm("Delete your profile photo?")) return;

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const exts = ["jpg", "jpeg", "png", "webp"];
  for (let i = 0; i < exts.length; i++) {
    await supabaseClient.storage
      .from("avatars")
      .remove([user.id + "/profile." + exts[i]]);
  }

  const placeholder = "https://placehold.co/90x90/111827/8ea5ff?text=N";
  document.getElementById("profileAvatar").src = placeholder;

  await supabaseClient
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  closeAvatarModal();
  alert("Profile photo deleted!");
}
function editProfile() {
  const form = document.getElementById("editProfileForm");
  const input = document.getElementById("editFullName");
  const currentName = document.getElementById("detailName").textContent;

  input.value = currentName === "—" ? "" : currentName;

  form.classList.remove("hidden");
  input.focus();
}

function cancelEditProfile() {
  document
    .getElementById("editProfileForm")
    .classList.add("hidden");
}

async function saveProfile() {
  const input = document.getElementById("editFullName");
  const newName = input.value.trim();

  if (!newName) {
    alert("Please enter your name.");
    return;
  }

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (!user) {
    alert("Please login first.");
    return;
  }

  const { error } = await supabaseClient
    .from("profiles")
    .update({
      full_name: newName
    })
    .eq("id", user.id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadProfile(user);

  cancelEditProfile();

  alert("Profile updated successfully!");
}

function togglePassVisibility(btn) {
  var input = btn.previousElementSibling;
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁";
  }
}

async function changePassword() {
  const current = document.getElementById("currentPassword").value;
  const newPass = document.getElementById("newPassword").value;
  const msg = document.getElementById("passwordMessage");

  if (!current || !newPass) {
    msg.textContent = "Please fill both fields.";
    msg.style.color = "#f87171";
    return;
  }

  if (newPass.length < 6) {
    msg.textContent = "New password must be at least 6 characters.";
    msg.style.color = "#f87171";
    return;
  }

  msg.textContent = "Updating password...";
  msg.style.color = "#7188ff";

  const { error } = await supabaseClient.auth.updateUser({
    password: newPass
  });

  if (error) {
    msg.textContent = error.message;
    msg.style.color = "#f87171";
    return;
  }

  msg.textContent = "Password updated successfully!";
  msg.style.color = "#4ade80";
  document.getElementById("currentPassword").value = "";
  document.getElementById("newPassword").value = "";

  setTimeout(function() { msg.textContent = ""; }, 4000);
}

async function forgotPassword() {

  const emailInput = document.getElementById("email");
  const email = emailInput.value.trim();

  if (!email) {
    alert("पहिले आफ्नो email लेख्नुहोस्।");
    emailInput.focus();
    return;
  }

  const { error } =
    await supabaseClient.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: window.location.origin
      }
    );

  if (error) {
    alert(error.message);
    return;
  }

  alert(
    "Password reset link तपाईंको email मा पठाइएको छ।"
  );
}

// ==============================
// LOGIN SECURITY PHOTO
// ==============================

let securityStream = null;
let securityPhotoBlob = null;
let securityVerifiedUserId = null;
let securityModalOpen = false;


// OPEN SECURITY PHOTO
function openSecurityPhoto() {

  if (securityModalOpen) return;

  securityModalOpen = true;

  const modal =
    document.getElementById("securityPhotoModal");

  modal.classList.remove("hidden");

  document.getElementById("securityPhotoMessage").textContent = "";

  startSecurityCamera();
}


// START CAMERA
async function startSecurityCamera() {

  const video =
    document.getElementById("securityCamera");

  const message =
    document.getElementById("securityPhotoMessage");

  try {

    securityStream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user"
        },
        audio: false
      });

    video.srcObject = securityStream;

    document
      .getElementById("startCameraBtn")
      .classList.add("hidden");

    document
      .getElementById("capturePhotoBtn")
      .classList.remove("hidden");

    message.textContent =
      "Camera ready. Take your security photo.";

  } catch (error) {

    console.error(error);

    message.textContent =
      "Camera permission is required to continue.";

  }
}


// CAPTURE PHOTO
function captureSecurityPhoto() {

  const video =
    document.getElementById("securityCamera");

  const canvas =
    document.getElementById("securityCanvas");

  const preview =
    document.getElementById("securityPhotoPreview");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context =
    canvas.getContext("2d");

  context.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );

  canvas.toBlob(
    function(blob) {

      securityPhotoBlob = blob;

      preview.src =
        URL.createObjectURL(blob);

      document
        .getElementById("securityPreview")
        .classList.remove("hidden");

      document
        .getElementById("securityCamera")
        .classList.add("hidden");

      document
        .getElementById("capturePhotoBtn")
        .classList.add("hidden");

      document
        .getElementById("retakePhotoBtn")
        .classList.remove("hidden");

      document
        .getElementById("continueSecurityBtn")
        .classList.remove("hidden");

      document
        .getElementById("securityPhotoMessage")
        .textContent =
        "Photo captured. Confirm to continue.";

      if (securityStream) {
        securityStream.getTracks().forEach(t => t.stop());
      }

    },
    "image/jpeg",
    0.85
  );
}


// RETAKE PHOTO
function retakeSecurityPhoto() {

  securityPhotoBlob = null;

  document
    .getElementById("securityPreview")
    .classList.add("hidden");

  document
    .getElementById("retakePhotoBtn")
    .classList.add("hidden");

  document
    .getElementById("continueSecurityBtn")
    .classList.add("hidden");

  document
    .getElementById("capturePhotoBtn")
    .classList.remove("hidden");

  startSecurityCamera();
}


// UPLOAD + CONTINUE
async function continueAfterSecurityPhoto() {

  if (!securityPhotoBlob) {

    alert("Please take a photo first.");
    return;

  }

  const message =
    document.getElementById("securityPhotoMessage");

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (!user) {

    message.textContent =
      "Session expired. Please login again.";

    return;

  }

  message.textContent =
    "Saving security photo...";

  const filePath =
    `${user.id}/login-${Date.now()}.jpg`;

  const {
    error: uploadError
  } =
    await supabaseClient.storage
      .from("avatars")
      .upload(
        filePath,
        securityPhotoBlob,
        {
          contentType: "image/jpeg",
          upsert: false
        }
      );

  if (uploadError) {

    console.error(uploadError);

    message.textContent =
      uploadError.message;

    return;

  }


  // STOP CAMERA
  stopSecurityCamera();


  // CLOSE SECURITY MODAL
  document
    .getElementById("securityPhotoModal")
    .classList.add("hidden");

  securityModalOpen = false;

  securityVerifiedUserId = user.id;

  // GO TO HOME PAGE
  showLoggedInUser(user);

  document.getElementById("home").scrollIntoView({ behavior: "smooth" });

}


// STOP CAMERA
function stopSecurityCamera() {

  const video = document.getElementById("securityCamera");
  if (video) video.srcObject = null;

  if (securityStream) {

    securityStream
      .getTracks()
      .forEach(track => track.stop());

    securityStream = null;

  }

}

// FORCE FRESH PAGE ON TAB REOPEN / BACK
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});
// ==============================
// LOADER
// ==============================

window.addEventListener("load", function () {
  setTimeout(function () {
    document.getElementById("loader").classList.add("hidden");
  }, 2000);
});

// ==============================
// MOBILE MENU
// ==============================

function toggleMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  hamburger.classList.toggle("active");

  let mobileMenu = document.querySelector(".mobile-menu");

  if (!mobileMenu) {
    mobileMenu = document.createElement("div");
    mobileMenu.className = "mobile-menu";
    mobileMenu.id = "mobileMenu";
    mobileMenu.innerHTML = `
      <a href="#home" onclick="closeMobileMenu()">Home</a>
      <a href="#services" onclick="closeMobileMenu()">Services</a>
      <a href="#about" onclick="closeMobileMenu()">About</a>
      <a href="#team" onclick="closeMobileMenu()">Team</a>
      <a href="#blog" onclick="closeMobileMenu()">Blog</a>
      <a href="#mobilecenter" style="display:none" onclick="closeMobileMenu()">Mobile</a>
      <a href="#contact" onclick="closeMobileMenu()">Contact</a>
      <div class="mobile-menu-divider"></div>
      <a href="javascript:void(0)" id="mobileAccountBtn" onclick="handleMobileAccount()">Login</a>
      <a href="javascript:void(0)" id="mobileLogoutBtn" class="mobile-logout-link" onclick="handleMobileLogout()">Logout</a>
    `;
    document.body.appendChild(mobileMenu);
  }

  supabaseClient.auth.getUser().then(function(result) {
    var user = result.data.user;
    var accBtn = document.getElementById("mobileAccountBtn");
    var logoutBtn = document.getElementById("mobileLogoutBtn");
    var mobileLink = mobileMenu.querySelector('a[href="#mobilecenter"]');
    var desktopMobileLink = document.querySelector('.nav-links a[href="#mobilecenter"]');
    var mobileCenter = document.getElementById("mobilecenter");
    if (user) {
      if (accBtn) accBtn.textContent = "Dashboard";
      if (logoutBtn) logoutBtn.style.display = "block";
      if (mobileLink) mobileLink.style.display = "";
      if (desktopMobileLink) desktopMobileLink.style.display = "";
      if (mobileCenter) mobileCenter.style.display = "";
    } else {
      if (accBtn) accBtn.textContent = "Login";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (mobileLink) mobileLink.style.display = "none";
      if (desktopMobileLink) desktopMobileLink.style.display = "none";
      if (mobileCenter) mobileCenter.style.display = "none";
    }
  });

  mobileMenu.classList.toggle("active");
}

function closeMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (hamburger) hamburger.classList.remove("active");
  if (mobileMenu) mobileMenu.classList.remove("active");
}

async function handleMobileAccount() {
  closeMobileMenu();
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (user) {
    openDashboard();
  } else {
    openAuth("login");
  }
}

function handleMobileLogout() {
  closeMobileMenu();
  supabaseClient.auth.signOut().then(function() {
    document.querySelector(".nav-login").textContent = "Login";
    document.querySelector(".nav-login").onclick = function() { openAuth("login"); };
    const heroBtn = document.getElementById("heroGetStarted");
    if (heroBtn) {
      heroBtn.innerHTML = 'Get Started <span>→</span>';
      heroBtn.onclick = function() { heroGetStartedClick(); };
    }
    const mobileAcc = document.getElementById("mobileAccountBtn");
    if (mobileAcc) {
      mobileAcc.textContent = "Login";
      mobileAcc.onclick = function() { handleMobileAccount(); };
    }
    const mobileLogout = document.getElementById("mobileLogoutBtn");
    if (mobileLogout) mobileLogout.style.display = "none";
    var mobileCenter = document.getElementById("mobilecenter");
    if (mobileCenter) mobileCenter.style.display = "none";
    var securitySection = document.querySelector(".security-showcase");
    if (securitySection) securitySection.style.display = "none";
    var desktopMobileLink = document.querySelector('.nav-links a[href="#mobilecenter"]');
    if (desktopMobileLink) desktopMobileLink.style.display = "none";
    var mobMenuMobileLink = document.querySelector('.mobile-menu a[href="#mobilecenter"]');
    if (mobMenuMobileLink) mobMenuMobileLink.style.display = "none";
    showToast("Logged out successfully!");
  });
}

// ==============================
// DARK / LIGHT THEME
// ==============================

function toggleTheme() {
  const body = document.body;
  const toggle = document.getElementById("themeToggle");

  body.classList.toggle("light");

  if (body.classList.contains("light")) {
    toggle.textContent = "☀️";
    localStorage.setItem("theme", "light");
  } else {
    toggle.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  }
}

(function () {
  const saved = localStorage.getItem("theme");
  if (saved === "light") {
    document.body.classList.add("light");
    const toggle = document.getElementById("themeToggle");
    if (toggle) toggle.textContent = "☀️";
  }
})();

// ==============================
// CONTACT FORM
// ==============================

async function handleContact(event) {
  event.preventDefault();

  const status = document.getElementById("contactStatus");
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const subject = document.getElementById("contactSubject").value.trim();
  const message = document.getElementById("contactMessage").value.trim();

  if (!name || !email || !message) {
    status.textContent = "Please fill all required fields.";
    status.style.color = "#f87171";
    return;
  }

  status.textContent = "Sending...";
  status.style.color = "#7188ff";

  const { error } = await supabaseClient
    .from("messages")
    .insert({
      name: name,
      email: email,
      message: (subject ? "[" + subject + "] " : "") + message
    });

  if (error) {
    status.textContent = "Failed to send. Try again.";
    status.style.color = "#f87171";
    return;
  }

  status.textContent = "Message sent successfully! We'll get back to you soon.";
  status.style.color = "#4ade80";
  event.target.reset();

  setTimeout(function () {
    status.textContent = "";
  }, 5000);
}

// ==============================
// SERVICE TABS
// ==============================

function switchService(index) {
  document.querySelectorAll('.service-tab-btn').forEach(function(btn, i) {
    btn.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.service-tab-panel').forEach(function(panel, i) {
    panel.classList.toggle('active', i === index);
  });
}

// ==============================
// MOBILE CENTER TABS
// ==============================

function switchMobileTab(index) {
  document.querySelectorAll('.mobile-tab-btn').forEach(function(btn, i) {
    btn.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.mobile-tab-panel').forEach(function(panel, i) {
    panel.classList.toggle('active', i === index);
  });
}

// ==============================
// SERVICE SUBTOPICS
// ==============================

function toggleSubtopic(el) {
  var wasOpen = el.classList.contains("open");
  el.parentElement.querySelectorAll(".panel-subtopic").forEach(function(s) {
    s.classList.remove("open");
  });
  if (!wasOpen) {
    el.classList.add("open");
  }
}

// ==============================
// BLOG MODAL
// ==============================

var blogData = [
  {
    title: "The Future of AI in Nepal",
    tag: "AI",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    meta: "Aug 15, 2026 • 5 min read",
    text: `<p>Artificial Intelligence is no longer a futuristic concept — it is here, transforming businesses across Nepal. From smart chatbots handling customer queries to automated data analysis helping businesses make better decisions, AI is reshaping how companies operate.</p>
    <p>In Nepal, industries like banking, healthcare, agriculture and education are beginning to adopt AI-powered solutions. Banks use AI for fraud detection and credit scoring. Hospitals are exploring AI-assisted diagnostics. Agricultural startups are using satellite imagery and machine learning to predict crop yields.</p>
    <p>At NovaIT, we believe AI should be accessible to every Nepali business, not just large corporations. That is why we build affordable, custom AI solutions tailored to local needs. Whether it is a chatbot for your restaurant, a recommendation engine for your e-commerce store or predictive analytics for your supply chain — we make AI work for you.</p>
    <p>The key challenges for AI adoption in Nepal include limited data availability, lack of AI talent and infrastructure constraints. However, these challenges also present opportunities. Nepali businesses that invest in AI early will have a significant competitive advantage as the technology matures.</p>
    <p>Our advice? Start small. Identify one repetitive task in your business that takes too much time. Automate it with AI. Measure the results. Then expand. This incremental approach minimizes risk while delivering real value.</p>`
  },
  {
    title: "Cyber Security Tips for Businesses",
    tag: "Security",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop",
    meta: "Aug 10, 2026 • 7 min read",
    text: `<p>Cyber attacks are increasing every year, and Nepali businesses are not immune. In 2025 alone, hundreds of websites and databases in Nepal were compromised. The good news? Most attacks can be prevented with basic security practices.</p>
    <p><strong>1. Use Strong, Unique Passwords:</strong> Never reuse passwords across accounts. Use a password manager like Bitwarden or 1Password. Enable two-factor authentication (2FA) on every account that supports it.</p>
    <p><strong>2. Keep Software Updated:</strong> Outdated software is the number one attack vector. Enable automatic updates for your operating system, browsers and applications. Patch your servers regularly.</p>
    <p><strong>3. Train Your Team:</strong> Human error causes over 90% of security breaches. Train your employees to recognize phishing emails, suspicious links and social engineering attacks. Run regular security awareness sessions.</p>
    <p><strong>4. Backup Your Data:</strong> Follow the 3-2-1 backup rule: 3 copies of your data, on 2 different media types, with 1 stored offsite. Test your backups regularly to ensure they can be restored.</p>
    <p><strong>5. Implement SSL and HTTPS:</strong> Every website should use HTTPS. SSL certificates encrypt data between your users and your server, protecting sensitive information from interception.</p>
    <p><strong>6. Monitor and Audit:</strong> Set up monitoring for unusual activity. Review access logs regularly. Conduct periodic security audits to identify and fix vulnerabilities before attackers find them.</p>
    <p>At NovaIT, security is not an afterthought — it is built into every product we create. From secure coding practices to production monitoring, we ensure your digital assets are protected.</p>`
  },
  {
    title: "Why Your Business Needs Cloud",
    tag: "Cloud",
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
    meta: "Aug 5, 2026 • 4 min read",
    text: `<p>Cloud computing has revolutionized how businesses operate. Instead of buying and maintaining expensive servers, you can now rent computing power on demand. This shift has made technology accessible to businesses of all sizes, including startups in Nepal.</p>
    <p><strong>Cost Savings:</strong> Cloud infrastructure eliminates upfront hardware costs. You pay only for what you use. A small business can start with just NPR 5,000 per month and scale up as it grows.</p>
    <p><strong>Scalability:</strong> Need more resources during a sale? Scale up in minutes. Traffic dropped? Scale down and save. Cloud platforms like AWS, Google Cloud and Azure make this flexibility possible.</p>
    <p><strong>Reliability:</strong> Cloud providers guarantee 99.9% uptime with built-in redundancy. Your data is replicated across multiple data centers, so even if one server fails, your application stays online.</p>
    <p><strong>Security:</strong> Major cloud providers invest billions in security. They offer encryption, firewalls, DDoS protection and compliance certifications that most businesses cannot afford to implement on their own.</p>
    <p><strong>Remote Access:</strong> Cloud-based tools can be accessed from anywhere with an internet connection. This is essential for remote teams and multi-location businesses.</p>
    <p><strong>Getting Started:</strong> Start by migrating one application or service to the cloud. Use managed services to reduce operational complexity. At NovaIT, we help Nepali businesses plan and execute their cloud migration with minimal disruption and maximum benefit.</p>`
  }
];

function openBlogModal(index) {
  var b = blogData[index];
  var modal = document.getElementById("blogModal");

  document.getElementById("blogModalImg").src = b.img;
  document.getElementById("blogModalTag").textContent = b.tag;
  document.getElementById("blogModalTitle").textContent = b.title;
  document.getElementById("blogModalMeta").textContent = b.meta;
  document.getElementById("blogModalText").innerHTML = b.text;

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeBlogModal(event) {
  if (event.target === event.currentTarget) {
    document.getElementById("blogModal").classList.add("hidden");
    document.body.classList.remove("modal-open");
  }
}

function closeBlogModalDirect() {
  document.getElementById("blogModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
}

// ==============================
// SERVICE DETAIL MODAL
// ==============================

var serviceData = [
  {
    title: "Digital Technology",
    tag: "01 — FOUNDATION",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&h=350&fit=crop",
    desc: "We build cutting-edge digital solutions that power modern businesses. From responsive websites to native mobile apps, our team delivers end-to-end digital products.",
    what: "NovaIT specializes in creating custom web applications, mobile apps, and digital platforms. We use modern frameworks like React, Next.js, Flutter and Node.js to build fast, scalable products. Our process covers ideation, design, development, testing and deployment — all under one roof.",
    tech: ["React", "Next.js", "Flutter", "Node.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "REST APIs"],
    why: "Nepal's digital landscape is growing fast. NovaIT brings world-class development standards to local businesses. We don't just write code — we craft digital experiences that drive growth, engagement and revenue for our clients."
  },
  {
    title: "Cyber Security",
    tag: "02 — PROTECTION",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700&h=350&fit=crop",
    desc: "Protecting your digital assets is our top priority. We implement industry-standard security practices to safeguard your data, applications and infrastructure.",
    what: "Our security team conducts thorough vulnerability assessments, penetration testing and security audits. We implement encryption, multi-factor authentication, intrusion detection systems and compliance frameworks. Every product we build has security baked in from day one.",
    tech: ["SSL/TLS", "OAuth 2.0", "WAF", "Penetration Testing", "AES Encryption", "OWASP", "SIEM", "Zero Trust"],
    why: "Cyber attacks are increasing every year in Nepal and globally. NovaIT ensures your business is protected with proactive security measures. We stay ahead of threats so you can focus on growth without worrying about data breaches."
  },
  {
    title: "Cloud Systems",
    tag: "03 — INFRASTRUCTURE",
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&h=350&fit=crop",
    desc: "Scalable, reliable and secure cloud infrastructure for your applications. We design systems that grow with your business.",
    what: "NovaIT designs and manages cloud infrastructure on AWS, Google Cloud and Azure. We handle server setup, database management, CI/CD pipelines, containerization with Docker & Kubernetes, and automated deployments. Our DevOps practices ensure 99.9% uptime.",
    tech: ["AWS", "Google Cloud", "Docker", "Kubernetes", "GitHub Actions", "PostgreSQL", "Redis", "Nginx"],
    why: "Moving to the cloud reduces costs, improves performance and enables remote access. NovaIT helps Nepali businesses transition to cloud-first architecture with minimal downtime and maximum efficiency."
  },
  {
    title: "Artificial Intelligence",
    tag: "04 — INTELLIGENCE",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=700&h=350&fit=crop",
    desc: "Building smart solutions powered by AI and machine learning. Automate processes, gain insights and make data-driven decisions.",
    what: "Our AI team builds custom machine learning models, natural language processing systems, computer vision solutions and recommendation engines. From chatbots to predictive analytics, we bring AI capabilities to real-world business problems in Nepal.",
    tech: ["Python", "TensorFlow", "PyTorch", "OpenAI API", "Hugging Face", "Pandas", "Scikit-learn", "LangChain"],
    why: "AI is transforming every industry. NovaIT makes artificial intelligence accessible to Nepali businesses. Whether it's automating customer support, analyzing data or building intelligent products — we make AI work for you."
  }
];

function openServiceModal(index) {
  var s = serviceData[index];
  var modal = document.getElementById("serviceModal");

  document.getElementById("serviceModalImg").src = s.img;
  document.getElementById("serviceModalTag").textContent = s.tag;
  document.getElementById("serviceModalTitle").textContent = s.title;
  document.getElementById("serviceModalDesc").textContent = s.desc;
  document.getElementById("serviceModalWhat").textContent = s.what;
  document.getElementById("serviceModalWhy").textContent = s.why;

  var techHtml = "";
  s.tech.forEach(function(t) {
    techHtml += '<span class="service-modal-tag-item">' + t + '</span>';
  });
  document.getElementById("serviceModalTech").innerHTML = techHtml;

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeServiceModal(event) {
  if (event.target === event.currentTarget) {
    document.getElementById("serviceModal").classList.add("hidden");
    document.body.classList.remove("modal-open");
  }
}

function closeServiceModalDirect() {
  document.getElementById("serviceModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
}

// ==============================
// SECURITY SECTION
// ==============================

function toggleSecurityDetail(index) {
  var card = document.querySelectorAll('.security-card')[index];
  var detail = document.getElementById('securityDetail' + index);
  var isActive = detail.classList.contains('active');

  document.querySelectorAll('.security-detail').forEach(function(d) {
    d.classList.remove('active');
  });
  document.querySelectorAll('.security-card').forEach(function(c) {
    c.classList.remove('active');
  });

  if (!isActive) {
    detail.classList.add('active');
    card.classList.add('active');
  }
}

function runSecurityCheck() {
  var ssl = document.getElementById('secStatusSSL');
  var auth = document.getElementById('secStatusAuth');
  var session = document.getElementById('secStatusSession');

  ssl.querySelector('.status-value').textContent = 'Checking...';
  ssl.querySelector('.status-dot').className = 'status-dot';
  auth.querySelector('.status-value').textContent = 'Checking...';
  auth.querySelector('.status-dot').className = 'status-dot';
  session.querySelector('.status-value').textContent = 'Checking...';
  session.querySelector('.status-dot').className = 'status-dot';

  setTimeout(function() {
    if (location.protocol === 'https:') {
      ssl.querySelector('.status-dot').className = 'status-dot safe';
      ssl.querySelector('.status-value').textContent = 'Active';
      ssl.querySelector('.status-value').className = 'status-value safe';
    } else {
      ssl.querySelector('.status-dot').className = 'status-dot warn';
      ssl.querySelector('.status-value').textContent = 'Not HTTPS';
      ssl.querySelector('.status-value').className = 'status-value warn';
    }
  }, 500);

  setTimeout(function() {
    if (typeof supabaseClient !== 'undefined') {
      supabaseClient.auth.getUser().then(function(res) {
        if (res.data && res.data.user) {
          auth.querySelector('.status-dot').className = 'status-dot safe';
          auth.querySelector('.status-value').textContent = 'Logged In';
          auth.querySelector('.status-value').className = 'status-value safe';
        } else {
          auth.querySelector('.status-dot').className = 'status-dot warn';
          auth.querySelector('.status-value').textContent = 'Not Logged In';
          auth.querySelector('.status-value').className = 'status-value warn';
        }
      });
    } else {
      auth.querySelector('.status-dot').className = 'status-dot danger';
      auth.querySelector('.status-value').textContent = 'Unavailable';
      auth.querySelector('.status-value').className = 'status-value danger';
    }
  }, 1000);

  setTimeout(function() {
    var token = localStorage.getItem('sb-zffruusmcezndbjskkyi-auth-token');
    if (token) {
      session.querySelector('.status-dot').className = 'status-dot safe';
      session.querySelector('.status-value').textContent = 'Active Session';
      session.querySelector('.status-value').className = 'status-value safe';
    } else {
      session.querySelector('.status-dot').className = 'status-dot warn';
      session.querySelector('.status-value').textContent = 'No Session';
      session.querySelector('.status-value').className = 'status-value warn';
    }
  }, 1500);
}

// ==============================
// MOUSE GLOW ON BUTTONS
// ==============================

document.addEventListener("mousemove", function(e) {
  var btns = document.querySelectorAll(".primary-btn");
  btns.forEach(function(btn) {
    var rect = btn.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width) * 100;
    var y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty("--mx", x + "%");
    btn.style.setProperty("--my", y + "%");
  });
});

// ==============================
// TEAM MODAL
// ==============================

var teamMembers = [
  {
    name: "Prajwal Neupane",
    role: "Founder & CEO",
    img: "https://zffruusmcezndbjskkyi.supabase.co/storage/v1/object/public/team-photo/prajwal.jpg",
    location: "Biratnagar, Nepal",
    exp: "3+ Years",
    speciality: "Leadership & Strategy",
    bio: "Visionary leader who founded NovaIT with a mission to bring world-class digital solutions to Nepal. Passionate about technology and innovation.",
    facebook: "#"
  },
  {
    name: "Nick Bista",
    role: "Lead Developer",
    img: "https://zffruusmcezndbjskkyi.supabase.co/storage/v1/object/public/team-photo/Nick.png",
    location: "Kathmandu, Nepal",
    exp: "17+ Years",
    speciality: "Full Stack Development & Sports Cinematography",
    bio: "With over 17 years in the industry, Nick is a seasoned full stack developer and an acclaimed sports cameraman. He has covered live matches, tournaments and sporting events, capturing high-energy moments with precision. His deep understanding of motion, timing and visual storytelling translates directly into building fast, dynamic web applications. At NovaIT, he combines his technical expertise with his eye for detail to deliver world-class digital products.",
    facebook: "https://www.facebook.com/nickbista3"
  },
  {
    name: "Abishek Niroula",
    role: "UI/UX Designer",
    img: "https://zffruusmcezndbjskkyi.supabase.co/storage/v1/object/public/team-photo/abhishek.png",
    location: "Nepal",
    exp: "2+ Years",
    speciality: "UI/UX & Visual Design",
    bio: "Creative mind behind NovaIT's stunning interfaces. Believes in designing experiences that are both beautiful and easy to use.",
    facebook: "https://www.facebook.com/abishek.niroula.1"
  },
  {
    name: "Sabin Khatiwada",
    role: "Marketing Head",
    img: "https://zffruusmcezndbjskkyi.supabase.co/storage/v1/object/public/team-photo/sabin.png",
    location: "Nepal",
    exp: "2+ Years",
    speciality: "Digital Marketing & Growth",
    bio: "Drives NovaIT's growth through smart marketing strategies and brand building. Expert in social media, SEO, and client outreach.",
    facebook: "https://www.facebook.com/sa.veen.630603"
  }
];

function openTeamModal(index) {
  var m = teamMembers[index];
  var modal = document.getElementById("teamModal");

  document.getElementById("teamModalImg").src = m.img;
  document.getElementById("teamModalName").textContent = m.name;
  document.getElementById("teamModalRole").textContent = m.role;
  document.getElementById("teamModalLocation").textContent = m.location;
  document.getElementById("teamModalExp").textContent = m.exp;
  document.getElementById("teamModalSpeciality").textContent = m.speciality;
  document.getElementById("teamModalBio").textContent = m.bio;

  var socialsHtml = "";
  if (m.facebook && m.facebook !== "#") {
    socialsHtml = '<a href="' + m.facebook + '" target="_blank">Facebook</a>';
  }
  document.getElementById("teamModalSocials").innerHTML = socialsHtml;

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeTeamModal(event) {
  if (event.target === event.currentTarget) {
    document.getElementById("teamModal").classList.add("hidden");
    document.body.classList.remove("modal-open");
  }
}

function closeTeamModalDirect() {
  document.getElementById("teamModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
}

// ==============================
// FAQ TOGGLE
// ==============================

function toggleFaq(el) {
  var wasOpen = el.classList.contains("open");
  document.querySelectorAll(".faq-item").forEach(function(f) {
    f.classList.remove("open");
  });
  if (!wasOpen) {
    el.classList.add("open");
  }
}

// ==============================
// NEWSLETTER
// ==============================

async function handleNewsletter(event) {
  event.preventDefault();
  var status = document.getElementById("newsletterStatus");
  var email = document.getElementById("newsletterEmail").value.trim();

  if (!email) return;

  status.textContent = "Subscribing...";
  status.style.color = "#7188ff";

  var { error } = await supabaseClient
    .from("newsletter")
    .insert({ email: email });

  if (error) {
    if (error.code === "23505") {
      status.textContent = "You're already subscribed!";
    } else {
      status.textContent = "Failed. Try again.";
    }
    status.style.color = "#f87171";
    return;
  }

  status.textContent = "Subscribed successfully!";
  status.style.color = "#4ade80";
  document.getElementById("newsletterEmail").value = "";

  setTimeout(function() { status.textContent = ""; }, 5000);
}

// ==============================
// BACK TO TOP
// ==============================

window.addEventListener("scroll", function() {
  var btn = document.getElementById("backToTop");
  if (window.scrollY > 400) {
    btn.classList.add("visible");
  } else {
    btn.classList.remove("visible");
  }
});

// ==============================
// SCROLL ANIMATIONS
// ==============================

function initScrollAnimations() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".scroll-animate").forEach(function(el) {
    observer.observe(el);
  });

  var statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var stat = entry.target;
      statsObserver.unobserve(stat);
      var target = parseInt(stat.getAttribute("data-count"), 10) || 0;
      var start = 0;
      var duration = 1200;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var value = Math.floor(progress * target);
        stat.textContent = value.toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll(".feature-stat strong[data-count]").forEach(function(el) {
    statsObserver.observe(el);
  });
}

document.addEventListener("DOMContentLoaded", initScrollAnimations);

// ==============================
// REVIEWS
// ==============================

var selectedStars = 5;

function setReviewStars(count) {
  selectedStars = count;
  var stars = document.querySelectorAll("#reviewStarsInput span");
  stars.forEach(function(s, i) {
    s.classList.toggle("active", i < count);
  });
}

setReviewStars(5);

async function submitReview(event) {
  event.preventDefault();
  var status = document.getElementById("reviewStatus");
  var name = document.getElementById("reviewName").value.trim();
  var role = document.getElementById("reviewRole").value.trim();
  var text = document.getElementById("reviewText").value.trim();

  if (!name || !text) {
    status.textContent = "Please fill all required fields.";
    status.style.color = "#f87171";
    return;
  }

  status.textContent = "Submitting...";
  status.style.color = "#7188ff";

  var { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    status.textContent = "Please login to submit a review.";
    status.style.color = "#f87171";
    return;
  }

  var { error } = await supabaseClient
    .from("reviews")
    .insert({
      name: name,
      role: role || "Client",
      stars: selectedStars,
      review: text,
      user_id: user.id
    });

  if (error) {
    status.textContent = "Failed to submit. Try again.";
    status.style.color = "#f87171";
    return;
  }

  status.textContent = "Review submitted! Thank you.";
  status.style.color = "#4ade80";
  document.getElementById("reviewName").value = "";
  document.getElementById("reviewRole").value = "";
  document.getElementById("reviewText").value = "";
  setReviewStars(5);

  loadReviews();

  setTimeout(function() { status.textContent = ""; }, 5000);
}

async function deleteReview(id) {
  if (!confirm("Delete your review?")) return;

  var { error } = await supabaseClient
    .from("reviews")
    .delete()
    .eq("id", id);

  if (!error) {
    loadReviews();
  } else {
    alert("Failed to delete. You can only delete your own reviews.");
  }
}

async function loadReviews() {
  var { data: { user } } = await supabaseClient.auth.getUser();

  var { data, error } = await supabaseClient
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data) return;

  var grid = document.getElementById("testimonialGrid");
  var html = "";

  data.forEach(function(r) {
    var initials = r.name.charAt(0).toUpperCase();
    var stars = "";
    for (var i = 0; i < r.stars; i++) stars += "★";
    for (var j = r.stars; j < 5; j++) stars += "☆";

    var isMine = user && r.user_id === user.id;

    html += '<div class="testimonial-card scroll-animate">';
    html += '<div class="testimonial-stars">' + stars + '</div>';
    html += '<p>"' + r.review + '"</p>';
    html += '<div class="testimonial-author">';
    html += '<img src="https://placehold.co/50x50/1e2d44/8ea5ff?text=' + initials + '" alt="' + r.name + '">';
    html += '<div>';
    html += '<h4>' + r.name + '</h4>';
    html += '<span>' + r.role + '</span>';
    html += '</div>';
    if (isMine) {
      html += '<button class="review-delete-btn" onclick="deleteReview(\'' + r.id + '\')">🗑</button>';
    }
    html += '</div></div>';
  });

  grid.innerHTML = html;
  initScrollAnimations();
}

document.addEventListener("DOMContentLoaded", loadReviews);

// ==============================
// LEGAL MODALS
// ==============================

function openLegal(type) {
  var title = document.getElementById("legalTitle");
  var content = document.getElementById("legalContent");
  var modal = document.getElementById("legalModal");

  if (type === "terms") {
    title.textContent = "Terms of Service";
    content.innerHTML = termsContent;
  } else {
    title.textContent = "Privacy Policy";
    content.innerHTML = privacyContent;
  }

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeLegal() {
  document.getElementById("legalModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
}

var privacyContent = `
  <h3>1. Information We Collect</h3>
  <p>We collect your <strong>name, email address</strong> and basic device information (device model, browser, operating system and IP address) when you create an account or interact with our platform.</p>
  <h3>2. How We Use Your Data</h3>
  <p>Your information is used to provide account services, secure your session, display your profile and improve our platform experience. IP addresses and device details help us maintain platform security.</p>
  <h3>3. Data Storage</h3>
  <p>All data is securely stored using Supabase, which encrypts information in transit and at rest. Your password is hashed and never stored in plain text.</p>
  <h3>4. Your Rights</h3>
  <p>You can request to view, update or delete your personal data at any time by contacting <strong>prajwalnewpane775@gmail.com</strong> or calling <strong>+977 9804335063</strong>.</p>
`;

var termsContent = `
  <h3>1. Acceptance of Terms</h3>
  <p>By accessing NovaIT, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.</p>
  <h3>2. Account Responsibilities</h3>
  <p>You are responsible for keeping your login credentials secure and for all activity under your account. Never share your password with others.</p>
  <h3>3. Acceptable Use</h3>
  <p>You may not misuse the platform, attempt unauthorized access, upload harmful content or interfere with other users' experience.</p>
  <h3>4. Purchases via Brothers Mobile Center</h3>
  <p>Orders placed through our WhatsApp ordering system are subject to product availability and confirmation by our team.</p>
  <h3>5. Contact</h3>
  <p>For questions about these terms, contact <strong>prajwalnewpane775@gmail.com</strong> or <strong>+977 9804335063</strong>.</p>
`;