import { useState } from "react";
import toast from "react-hot-toast";
import { settingsStyles as styles } from "./styles";
import { User, Shield, Image as ImageIcon, Trash2, Key, Mail, Phone, Briefcase, FileText, CheckCircle } from "./Icons";

function Settings() {
  const [name, setName] = useState(localStorage.getItem("userName") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [phone, setPhone] = useState(localStorage.getItem("phone") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [bio, setBio] = useState(localStorage.getItem("bio") || "");
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || "");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
      localStorage.setItem("profilePic", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = () => {
    if (!name || !email) return toast.error("Name & Email required ❌");
    localStorage.setItem("userName", name);
    localStorage.setItem("email", email);
    localStorage.setItem("phone", phone);
    localStorage.setItem("role", role);
    localStorage.setItem("bio", bio);
    toast.success("Profile updated ✅");
  };

  const handlePasswordChange = () => {
    if (!password || !confirmPassword) return toast.error("Fill all fields ❌");
    if (password !== confirmPassword) return toast.error("Passwords do not match ❌");
    toast.success("Password updated ✅");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div style={styles.pageWrap}>
      <div style={styles.contentGrid}>
        
        <div style={styles.card}>
          <h2 style={styles.cardTitle}><User size={22} color="#8e2de2" /> Personal Profile</h2>
          
          <div style={styles.avatarSection}>
            <div style={{position: 'relative'}}>
                <img 
                    src={profilePic || "https://img.icons8.com/bubbles/100/000000/user.png"} 
                    alt="profile" 
                    style={styles.avatar} 
                />
                <div style={{position: 'absolute', bottom: 5, right: 5, background: '#fff', borderRadius: '50%', padding: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
                    <ImageIcon size={14} color="#8e2de2" />
                </div>
            </div>
            <div style={styles.uploadBox}>
              <label style={styles.uploadBtn}>
                <span>Change Photo</span>
                <input type="file" style={{ display: "none" }} onChange={handleImageUpload} />
              </label>
              <p style={styles.mutedText}>JPG, PNG or GIF. Max 1MB.</p>
            </div>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}><User size={14} /> Full Name</label>
              <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}><Mail size={14} /> Email Address</label>
              <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}><Phone size={14} /> Phone Number</label>
              <input style={styles.input} placeholder="+91 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}><Briefcase size={14} /> Designation</label>
              <input style={styles.input} value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div style={{ ...styles.field, gridColumn: "span 2" }}>
              <label style={styles.label}><FileText size={14} /> Professional Bio</label>
              <textarea style={{ ...styles.input, height: 100, borderRadius: '15px' }} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
          </div>
          <button style={styles.primaryBtn} onClick={handleProfileUpdate}>Update Details</button>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}><Shield size={22} color="#8e2de2" /> Account Security</h2>
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}><Key size={14} /> New Password</label>
              <div style={styles.passwordWrapper}>
                <input type={showNewPassword ? "text" : "password"} style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button style={styles.eyeBtn} onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}><CheckCircle size={14} /> Confirm Password</label>
              <div style={styles.passwordWrapper}>
                <input type={showConfirmPassword ? "text" : "password"} style={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <button style={styles.eyeBtn} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          </div>
          <button style={styles.primaryBtn} onClick={handlePasswordChange}>Change Password</button>

          <hr style={styles.divider} />

          <h2 style={{ ...styles.cardTitle, color: "#ef4444" }}>⚠️ Danger Zone</h2>
          <p style={styles.mutedText}>Resetting your account will clear all locally saved preferences and session data.</p>
          <button style={styles.dangerBtn} onClick={() => { 
                if(window.confirm("Are you sure? This will log you out.")) {
                    localStorage.clear(); 
                    window.location.href = "/";
                }
          }}>
            <Trash2 size={16} /> Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;