const SUPABASE_URL = "https://zffruusmcezndbjskkyi.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_U1SiLIKfRdg7weSeLwpJwQ_lJ8WuDIu";

const { createClient } = supabase;

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


        message.textContent =
          "Account created! Check your email to verify your account.";

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

message.textContent =
  "Login successful!";

setTimeout(() => {

  closeAuth();

  openSecurityPhoto();

}, 700);

      }


    } catch (error) {

      message.textContent =
        error.message;

    }


    button.disabled = false;

    button.textContent =
      authMode === "signup"
        ? "Create Account"
        : "Sign In";

  });


// ==============================
// SHOW LOGGED-IN USER
// ==============================

function showLoggedInUser(user) {

  const navLogin =
    document.querySelector(".nav-login");

  if (navLogin) {
    navLogin.textContent = "Account";
    navLogin.onclick = function() {
      openDashboard();
    };
  }

  const mobileBtn =
    document.getElementById("mobileAccountBtn");

  if (mobileBtn) {
    mobileBtn.textContent = "Account";
    mobileBtn.onclick = function() {
      handleMobileAccount();
    };
  }

  const heroBtn =
    document.getElementById("heroGetStarted");

  if (heroBtn) {
    heroBtn.innerHTML = 'My Account <span>→</span>';
    heroBtn.onclick = function() {
      openDashboard();
    };
  }

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
      .select("full_name, avatar_url")
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


// OPEN SECURITY PHOTO
function openSecurityPhoto() {

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


  // GO TO HOME PAGE
  showLoggedInUser(user);

  document.getElementById("home").scrollIntoView({ behavior: "smooth" });

}


// STOP CAMERA
function stopSecurityCamera() {

  if (securityStream) {

    securityStream
      .getTracks()
      .forEach(track => track.stop());

    securityStream = null;

  }

}
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
    mobileMenu.innerHTML = `
      <a href="#home" onclick="closeMobileMenu()">Home</a>
      <a href="#services" onclick="closeMobileMenu()">Services</a>
      <a href="#about" onclick="closeMobileMenu()">About</a>
      <a href="#team" onclick="closeMobileMenu()">Team</a>
      <a href="#blog" onclick="closeMobileMenu()">Blog</a>
      <a href="#contact" onclick="closeMobileMenu()">Contact</a>
      <a href="javascript:void(0)" id="mobileAccountBtn" onclick="handleMobileAccount()">Login</a>
    `;
    document.body.appendChild(mobileMenu);
  }

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
    exp: "4+ Years",
    speciality: "Full Stack Development",
    bio: "Expert in building scalable web applications and modern tech stacks. Drives the core development at NovaIT with clean, efficient code.",
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