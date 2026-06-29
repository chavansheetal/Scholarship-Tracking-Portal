const API_BASE = "/api";


// ── USERS ──
export async function getUsers() {
  try {
    const res = await fetch(`${API_BASE}/auth/users`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function saveUser(user) {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    // Return data even if not ok, so the frontend can handle existingAppId/duplicates
    return data;
  } catch (err) {
    console.error("SaveUser Error:", err);
    throw err;
  }
}

export async function saveUserEdit(appId, updates) {
  try {
    const res = await fetch(`${API_BASE}/auth/user/${encodeURIComponent(appId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

export async function getUserByAppId(appId) {
  try {
    const res = await fetch(`${API_BASE}/auth/user/${encodeURIComponent(appId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getUserByAadhaar(aadhaar) {
  try {
    const res = await fetch(`${API_BASE}/auth/user/aadhaar/${aadhaar}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getUserByEmail(email) {
  try {
    const res = await fetch(`${API_BASE}/auth/user/email/${email}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function checkDuplicate(email, mobile) {
  try {
    const res = await fetch(`${API_BASE}/auth/check-duplicate?email=${encodeURIComponent(email)}&mobile=${encodeURIComponent(mobile)}`);
    return await res.json();
  } catch (err) {
    console.error("CheckDuplicate Error:", err);
    return { exists: false };
  }
}

export async function updateUserPassword(appId, newPassword) {
  try {
    const res = await fetch(`${API_BASE}/auth/user/${encodeURIComponent(appId)}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword })
    });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function loginUser(id, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password })
    });
    const data = await res.json();
    if (res.ok) return data.user;
    throw new Error(data.message);
  } catch (err) {
    throw err;
  }
}

export function generateAppId(state = "KA") {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `NSP/2025/${state}/${num}`;
}

// ── APPLICATIONS ──
export async function getApplications() {
  try {
    const res = await fetch(`${API_BASE}/applications`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function checkAadhaarInApplications(aadhaar, excludeAppId = "") {
  try {
    const res = await fetch(`${API_BASE}/applications/check-aadhaar/${aadhaar}?excludeAppId=${excludeAppId}`);
    return await res.json();
  } catch (err) {
    console.error("CheckAadhaarInApplications Error:", err);
    return { exists: false };
  }
}

export async function saveApplication(app) {
  try {
    const res = await fetch(`${API_BASE}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(app)
    });
    
    const text = await res.text();
    if (!text) throw new Error("Server returned an empty response.");
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Parse Error. Raw text:", text);
      throw new Error("Server returned invalid data format.");
    }
  } catch (err) {
    console.error("Save Application Error:", err);
    throw err;
  }
}

export async function uploadDocument(appId, docType, fileData) {
  try {
    const res = await fetch(`${API_BASE}/applications/${encodeURIComponent(appId)}/document`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docType, fileData })
    });
    return await res.json();
  } catch (err) {
    console.error(`Upload Error (${docType}):`, err);
  }
}

export async function saveRenewal(appId, updates) {
  try {
    const apps = await getApplications();
    const existing = apps.find(a => a.appId === appId);
    if (!existing) return false;

    const today = new Date().toLocaleDateString("en-IN");
    const updatedApp = {
      ...existing,
      status: "Renewal Submitted",
      updatedAt: new Date(),
      academicDetails: updates.academicDetails || existing.academicDetails,
      bankDetails: updates.bankDetails || existing.bankDetails,
      renewalDetails: {
        academicYear: updates.renewalAcademicYear,
        promotedToYear: updates.promotedToYear,
        lastYearMarks: updates.lastYearMarks,
        remarks: updates.remarks,
        files: updates.files,
      },
      timeline: [
        { step: "Renewal Submitted", date: today, done: true },
        { step: "Institute Verification", date: "Pending", done: false },
        { step: "State NOC", date: "—", done: false },
        { step: "Ministry Approval", date: "—", done: false },
        { step: "Amount Credited", date: "—", done: false },
      ]
    };

    const res = await fetch(`${API_BASE}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedApp)
    });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function getApplicationsByUser(user) {
  if (!user) return [];
  try {
    const res = await fetch(`${API_BASE}/applications/user/${encodeURIComponent(user.id || user.appId)}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function updateApplicationStatus(appId, status, reason = "") {
  try {
    const res = await fetch(`${API_BASE}/applications/${encodeURIComponent(appId)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

export async function deleteApplication(appId) {
  try {
    const res = await fetch(`${API_BASE}/applications/${encodeURIComponent(appId)}`, {
      method: "DELETE"
    });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// ── GRIEVANCES ──
export async function getGrievances() {
  try {
    const res = await fetch(`${API_BASE}/grievances`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function saveGrievance(grievance) {
  try {
    const res = await fetch(`${API_BASE}/grievances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(grievance)
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

export async function updateGrievance(id, updates) {
  try {
    const res = await fetch(`${API_BASE}/grievances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    return await res.json();
  } catch (err) {
    console.error(err);
  }
}

export function generateGrievanceId() {
  return `GRV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function verifyByInstitute(appId, role = "institute") {
  try {
    const res = await fetch(`${API_BASE}/applications/verify-institute/${encodeURIComponent(appId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function verifyByState(appId, role = "state") {
  try {
    const res = await fetch(`${API_BASE}/applications/verify-state/${encodeURIComponent(appId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function approveByMinistry(appId, role = "ministry") {
  try {
    const res = await fetch(`${API_BASE}/applications/approve/${encodeURIComponent(appId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function simulatePayment(appId) {
  try {
    const res = await fetch(`${API_BASE}/applications/payment/${encodeURIComponent(appId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export function initStore() {}