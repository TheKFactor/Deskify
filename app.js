const seedTickets = [
  {
    id: "INC-1048",
    type: "Incident",
    requester: "Maya Rao",
    service: "Network",
    summary: "VPN access failing for finance team",
    description: "Finance users cannot connect through VPN from managed laptops. Impact is blocking payroll review.",
    status: "In Progress",
    priority: "P1",
    assignee: "Alex Morgan",
    sla: "32m",
    slaState: "risk",
    timeline: [
      ["10:24", "Incident declared and finance leadership notified."],
      ["10:31", "Network team checking gateway logs."]
    ]
  },
  {
    id: "REQ-2271",
    type: "Request",
    requester: "Jordan Lee",
    service: "Hardware",
    summary: "New laptop request for onboarding",
    description: "Laptop, docking station, and standard engineering software needed before Monday.",
    status: "Waiting",
    priority: "P3",
    assignee: "Priya Shah",
    sla: "7h",
    slaState: "waiting",
    timeline: [["09:12", "Waiting for manager approval."]]
  },
  {
    id: "CHG-508",
    type: "Change",
    requester: "Noah Kim",
    service: "Security",
    summary: "Firewall rule update awaiting approval",
    description: "Temporary rule needed for vendor integration test window tonight.",
    status: "New",
    priority: "P2",
    assignee: "Unassigned",
    sla: "2h",
    slaState: "risk",
    timeline: [["08:46", "Change request created from security intake."]]
  },
  {
    id: "INC-1039",
    type: "Incident",
    requester: "Emma Patel",
    service: "Identity",
    summary: "SSO prompts looping for sales users",
    description: "Sales team reports repeated authentication prompts after password reset campaign.",
    status: "In Progress",
    priority: "P2",
    assignee: "Sam Rivera",
    sla: "3h",
    slaState: "good",
    timeline: [["Yesterday", "Identity provider session policy reviewed."]]
  },
  {
    id: "REQ-2263",
    type: "Request",
    requester: "Avery Stone",
    service: "Access",
    summary: "Add analytics workspace access",
    description: "Requester needs contributor access to the revenue analytics workspace.",
    status: "Resolved",
    priority: "P4",
    assignee: "Mina Chen",
    sla: "Done",
    slaState: "good",
    timeline: [["Today", "Access granted and requester notified."]]
  }
];

const savedTickets = JSON.parse(localStorage.getItem("deskifyTickets") || "null");
let tickets = Array.isArray(savedTickets) ? savedTickets : seedTickets;
let selectedId = tickets[0]?.id;
let currentView = "tickets";
let knowledgeQuery = "";
let knowledgeCategory = "All";
let selectedArticleId = "kb-vpn";

let rows = document.querySelector("#ticketRows");
let detailPanel = document.querySelector("#detailPanel");
let searchInput = document.querySelector("#searchInput");
let statusFilter = document.querySelector("#statusFilter");
let priorityFilter = document.querySelector("#priorityFilter");
const toolLayout = document.querySelector("#toolLayout");
const initialToolLayout = toolLayout.innerHTML;
const workspaceTitle = document.querySelector("#workspaceTitle");
const workspaceEyebrow = document.querySelector("#workspaceEyebrow");
const dialog = document.querySelector("#ticketDialog");
const ticketForm = document.querySelector("#ticketForm");
const saveTicketButton = document.querySelector("#saveTicketButton");
const resetDataButton = document.querySelector("#resetDataButton");
const logoutButton = document.querySelector("#logoutButton");
const userName = document.querySelector("#userName");
const viewButtons = document.querySelectorAll("[data-view]");

const handleSearchInput = () => renderRows();
const handleStatusChange = () => renderRows();
const handlePriorityChange = () => renderRows();

function bindWorkspaceControls() {
  rows = document.querySelector("#ticketRows");
  detailPanel = document.querySelector("#detailPanel");
  searchInput = document.querySelector("#searchInput");
  statusFilter = document.querySelector("#statusFilter");
  priorityFilter = document.querySelector("#priorityFilter");

  searchInput.removeEventListener("input", handleSearchInput);
  statusFilter.removeEventListener("change", handleStatusChange);
  priorityFilter.removeEventListener("change", handlePriorityChange);

  searchInput.addEventListener("input", handleSearchInput);
  statusFilter.addEventListener("change", handleStatusChange);
  priorityFilter.addEventListener("change", handlePriorityChange);
}

const user = JSON.parse(localStorage.getItem("deskifyUser") || "null");
userName.textContent = user?.name || "Demo user";

const viewConfig = {
  tickets: {
    title: "Ticket command center",
    eyebrow: "Service operations",
    type: "All"
  },
  requests: {
    title: "Request fulfillment",
    eyebrow: "Employee services",
    type: "Request"
  },
  changes: {
    title: "Change control",
    eyebrow: "Release governance",
    type: "Change"
  },
  reports: {
    title: "Operational reports",
    eyebrow: "Performance overview"
  },
  knowledge: {
    title: "Knowledge base",
    eyebrow: "Self-service answers"
  }
};

function saveTickets() {
  localStorage.setItem("deskifyTickets", JSON.stringify(tickets));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const knowledgeArticles = [
  {
    id: "kb-vpn",
    title: "VPN troubleshooting checklist",
    category: "Network",
    updated: "Updated today",
    owner: "Network operations",
    helpful: 94,
    summary: "A first-response runbook for VPN failures affecting one user, a team, or an office.",
    body: [
      "Confirm whether the issue affects one user, a department, or all remote users.",
      "Ask the requester to restart the VPN client and capture the exact error code.",
      "Check identity provider sign-in logs and VPN gateway health before escalating.",
      "For payroll, finance, or executive impact, mark the ticket P1 or P2 and notify the incident lead."
    ],
    related: ["INC-1048", "INC-1039"]
  },
  {
    id: "kb-laptop",
    title: "New laptop fulfillment",
    category: "Hardware",
    updated: "Updated yesterday",
    owner: "Endpoint services",
    helpful: 88,
    summary: "Steps for preparing laptops, accessories, asset assignment, and onboarding handoff.",
    body: [
      "Verify manager approval and employee start date before reserving hardware.",
      "Assign an asset tag, image the device, and install the required software profile.",
      "Add docking station, charger, keyboard, and shipping or pickup notes to the request.",
      "Close the request only after the employee confirms successful sign-in."
    ],
    related: ["REQ-2271"]
  },
  {
    id: "kb-firewall",
    title: "Firewall change review",
    category: "Security",
    updated: "Updated 2 days ago",
    owner: "Security engineering",
    helpful: 91,
    summary: "Approval requirements and rollback expectations for firewall rule changes.",
    body: [
      "Require business justification, source, destination, port, protocol, and expiration date.",
      "Confirm the change window and the named rollback owner.",
      "Attach test evidence before moving the change to approval.",
      "Reject broad access requests that do not include a clear owner or review date."
    ],
    related: ["CHG-508"]
  },
  {
    id: "kb-sso",
    title: "SSO prompt loop",
    category: "Identity",
    updated: "Updated this week",
    owner: "Identity team",
    helpful: 86,
    summary: "How to resolve repeated authentication prompts after password or policy changes.",
    body: [
      "Clear stale browser sessions and retry in a fresh profile.",
      "Check whether a password reset, MFA enrollment, or conditional access policy changed.",
      "Validate device compliance and token refresh status.",
      "Escalate to Identity if multiple users in the same group are affected."
    ],
    related: ["INC-1039"]
  },
  {
    id: "kb-access",
    title: "Analytics workspace access",
    category: "Access",
    updated: "Updated this month",
    owner: "Business systems",
    helpful: 82,
    summary: "Standard access path for analytics workspaces and revenue dashboards.",
    body: [
      "Confirm the requester role and workspace name.",
      "Validate manager approval for contributor access.",
      "Grant least-privilege access and document the group used.",
      "Ask the requester to confirm they can open the workspace before resolving."
    ],
    related: ["REQ-2263"]
  }
];

function filteredTickets() {
  const query = searchInput.value.trim().toLowerCase();
  const viewType = viewConfig[currentView].type;
  return tickets.filter((ticket) => {
    const matchesView = !viewType || viewType === "All" || ticket.type === viewType;
    const matchesQuery = !query || [ticket.id, ticket.requester, ticket.service, ticket.summary, ticket.assignee]
      .join(" ")
      .toLowerCase()
      .includes(query);
    const matchesStatus = statusFilter.value === "All" || ticket.status === statusFilter.value;
    const matchesPriority = priorityFilter.value === "All" || ticket.priority === priorityFilter.value;
    return matchesView && matchesQuery && matchesStatus && matchesPriority;
  });
}

function pillClass(value) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function renderMetrics() {
  document.querySelector("#metricOpen").textContent = tickets.filter((ticket) => ticket.status !== "Resolved").length;
  document.querySelector("#metricRisk").textContent = tickets.filter((ticket) => ticket.slaState === "risk").length;
  document.querySelector("#metricUnassigned").textContent = tickets.filter((ticket) => ticket.assignee === "Unassigned").length;
  document.querySelector("#metricResolved").textContent = tickets.filter((ticket) => ticket.status === "Resolved").length;
}

function renderRows() {
  const visibleTickets = filteredTickets();
  rows.innerHTML = "";

  if (!visibleTickets.length) {
    rows.innerHTML = '<p class="empty-state">No tickets match this view.</p>';
    return;
  }

  visibleTickets.forEach((ticket) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `ticket-row ${ticket.id === selectedId ? "active" : ""}`;
    row.innerHTML = `
      <span><span class="ticket-id">${ticket.id} - ${ticket.type}</span><span class="ticket-summary">${ticket.summary}</span></span>
      <span>${ticket.requester}</span>
      <span><span class="pill ${pillClass(ticket.status)}">${ticket.status}</span></span>
      <span><span class="pill ${ticket.priority.toLowerCase()}">${ticket.priority}</span></span>
      <span><span class="pill ${ticket.slaState}">${ticket.sla}</span></span>
    `;
    row.addEventListener("click", () => {
      selectedId = ticket.id;
      render();
    });
    rows.appendChild(row);
  });
}

function renderDetail() {
  const visibleTickets = filteredTickets();
  const ticket = visibleTickets.find((item) => item.id === selectedId) || visibleTickets[0];
  if (!ticket) {
    detailPanel.innerHTML = '<p class="empty-state">Select a ticket to view details.</p>';
    return;
  }
  selectedId = ticket.id;

  detailPanel.innerHTML = `
    <span class="ticket-id">${ticket.id} - ${ticket.type}</span>
    <h2 class="detail-title">${ticket.summary}</h2>
    <p>${ticket.description}</p>
    <div class="detail-meta">
      <div><span>Requester</span><strong>${ticket.requester}</strong></div>
      <div><span>Service</span><strong>${ticket.service}</strong></div>
      <div><span>Assignee</span><strong>${ticket.assignee}</strong></div>
      <div><span>SLA due</span><strong>${ticket.sla}</strong></div>
    </div>
    <div class="detail-actions">
      <label>Status
        <select id="detailStatus">
          ${["New", "In Progress", "Waiting", "Resolved"].map((status) => `<option ${status === ticket.status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </label>
      <label>Assignee
        <input id="detailAssignee" value="${ticket.assignee}">
      </label>
    </div>
    <button class="button secondary full" id="updateTicketButton" type="button">Update ticket</button>
    <div class="note-box">
      <label>Add activity note
        <textarea id="noteInput" rows="3" placeholder="Add customer update or internal note"></textarea>
      </label>
      <button class="button primary" id="addNoteButton" type="button">Add note</button>
    </div>
    <div class="timeline">
      <h3>Activity</h3>
      ${ticket.timeline.map(([time, text]) => `<article><small>${time}</small><p>${text}</p></article>`).join("")}
    </div>
  `;

  document.querySelector("#updateTicketButton").addEventListener("click", () => {
    ticket.status = document.querySelector("#detailStatus").value;
    ticket.assignee = document.querySelector("#detailAssignee").value.trim() || "Unassigned";
    if (ticket.status === "Resolved") {
      ticket.sla = "Done";
      ticket.slaState = "good";
    }
    ticket.timeline.unshift(["Now", `Ticket updated to ${ticket.status} by ${ticket.assignee}.`]);
    saveTickets();
    render();
  });

  document.querySelector("#addNoteButton").addEventListener("click", () => {
    const note = document.querySelector("#noteInput").value.trim();
    if (!note) return;
    ticket.timeline.unshift(["Now", note]);
    saveTickets();
    render();
  });
}

function renderTicketWorkspace() {
  toolLayout.className = "tool-layout";
  toolLayout.innerHTML = initialToolLayout;
  bindWorkspaceControls();
  renderRows();
  renderDetail();
}

function renderReports() {
  toolLayout.className = "tool-layout reports-view";
  toolLayout.innerHTML = `
    <div class="reports-panel">
      <h2>Operational reports</h2>
      <p>Coming soon: workload metrics, SLA trends, and team performance snapshots.</p>
    </div>
  `;
}

function renderKnowledge() {
  toolLayout.className = "tool-layout knowledge-view";
  toolLayout.innerHTML = `
    <div class="knowledge-panel">
      <h2>Knowledge base</h2>
      <p>Find self-service answers, quick references, and support guidelines here.</p>
    </div>
  `;
}

function render() {
  workspaceTitle.textContent = viewConfig[currentView].title;
  workspaceEyebrow.textContent = viewConfig[currentView].eyebrow;
  document.querySelector("#newTicketButton").hidden = currentView === "reports" || currentView === "knowledge";
  renderMetrics();

  if (currentView === "reports") {
    renderReports();
    return;
  }

  if (currentView === "knowledge") {
    renderKnowledge();
    return;
  }

  renderTicketWorkspace();
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    viewButtons.forEach((item) => item.classList.toggle("active", item === button));
    currentView = button.dataset.view;
    render();
  });
});

document.querySelector("#newTicketButton").addEventListener("click", () => dialog.showModal());

ticketForm.addEventListener("submit", (event) => {
  if (event.submitter !== saveTicketButton) return;
  event.preventDefault();
  const data = new FormData(ticketForm);
  const prefix = data.get("type") === "Incident" ? "INC" : data.get("type") === "Change" ? "CHG" : "REQ";
  const id = `${prefix}-${Math.floor(3000 + Math.random() * 6000)}`;
  const priority = data.get("priority");
  const ticket = {
    id,
    type: data.get("type"),
    requester: data.get("requester").trim(),
    service: data.get("service").trim(),
    summary: data.get("summary").trim(),
    description: data.get("description").trim(),
    status: "New",
    priority,
    assignee: data.get("assignee").trim() || "Unassigned",
    sla: data.get("sla").trim() || (priority === "P1" ? "1h" : "8h"),
    slaState: priority === "P1" || priority === "P2" ? "risk" : "good",
    timeline: [["Now", "Ticket created in Deskify."]]
  };
  tickets.unshift(ticket);
  selectedId = id;
  saveTickets();
  ticketForm.reset();
  dialog.close();
  render();
});

resetDataButton.addEventListener("click", () => {
  tickets = seedTickets.map((ticket) => ({
    ...ticket,
    timeline: ticket.timeline.map((entry) => [...entry])
  }));
  selectedId = tickets[0].id;
  saveTickets();
  render();
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("deskifyUser");
  window.location.href = "index.html#access";
});

render();
