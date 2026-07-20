const assistantForm = document.getElementById("assistantForm");
const assistantMessage = document.getElementById("assistantMessage");
const assistantSubmit = document.getElementById("assistantSubmit");
const assistantResponse = document.getElementById("assistantResponse");
const assistantIntent = document.getElementById("assistantIntent");
const assistantSources = document.getElementById("assistantSources");
const assistantHistory = document.getElementById("assistantHistory");
const assistantNextStep = document.getElementById("assistantNextStep");
const assistantMicroSummary = document.getElementById("assistantMicroSummary");
const assistantModes = document.getElementById("assistantModes");
const dynamicPromptRow = document.getElementById("dynamicPromptRow");
const voicePromptButton = document.getElementById("voicePromptButton");
const composeStayButton = document.getElementById("composeStayButton");
const reservationForm = document.getElementById("reservationForm");
const reservationSubmit = document.getElementById("reservationSubmit");
const reservationResult = document.getElementById("reservationResult");
const reservationResultBody = document.getElementById("reservationResultBody");
const manageForm = document.getElementById("manageForm");
const manageResultBody = document.getElementById("manageResultBody");
const manageStatusBadge = document.getElementById("manageStatusBadge");
const reservationIdInput = document.getElementById("reservationIdInput");
const accessTokenInput = document.getElementById("accessTokenInput");
const toast = document.getElementById("toast");
const scrollToAssistant = document.getElementById("scrollToAssistant");
const checkInInput = document.getElementById("checkInInput");
const checkOutInput = document.getElementById("checkOutInput");
const roomTypeInput = document.getElementById("roomTypeInput");
const guestCountInput = document.getElementById("guestCountInput");
const arrivalTimeInput = document.getElementById("arrivalTimeInput");
const occasionInput = document.getElementById("occasionInput");
const specialRequestInput = document.getElementById("specialRequestInput");
const generateConceptButton = document.getElementById("generateConceptButton");
const downloadReceiptButton = document.getElementById("downloadReceiptButton");
const copyReservationSummaryButton = document.getElementById("copyReservationSummaryButton");
const downloadManagedReceiptButton = document.getElementById("downloadManagedReceiptButton");
const conciergeState = document.getElementById("conciergeState");
const conciergeSignal = document.getElementById("conciergeSignal");
const timelineList = document.getElementById("timelineList");

const summaryGuestName = document.getElementById("summaryGuestName");
const summaryStayWindow = document.getElementById("summaryStayWindow");
const summaryNights = document.getElementById("summaryNights");
const summaryRoom = document.getElementById("summaryRoom");
const summaryGuests = document.getElementById("summaryGuests");
const summaryCheckIn = document.getElementById("summaryCheckIn");
const summaryCheckOut = document.getElementById("summaryCheckOut");
const summaryArrival = document.getElementById("summaryArrival");
const summaryEstimate = document.getElementById("summaryEstimate");

const promptSets = {
    policy: [
        "What is the cancellation policy?",
        "What time is check-in and check-out?",
        "Can you help me manage my reservation?",
    ],
    stay: [
        "Design a romantic ocean-view stay for two nights.",
        "Suggest the best room for a wellness retreat.",
        "How should I plan a family holiday here?",
    ],
    local: [
        "What should I do near the hotel in the evening?",
        "Suggest a relaxed arrival day plan.",
        "What local experiences fit a luxury weekend?",
    ],
};

const baseRates = {
    "Ocean Deluxe": 270,
    "Skyline Suite": 360,
    "Family Haven": 320,
    "Private Villa": 540,
};

const addOnRates = {
    "Airport pickup": 65,
    "Sunrise breakfast": 40,
    "Spa ritual": 120,
    "Chef tasting": 140,
    "Romance styling": 95,
    "Late checkout": 55,
};

const TODAY = "2026-07-19";

let manageAction = "view";
let activeMode = "policy";
let toastTimer = null;
let latestReservationData = null;
let latestManagedReservationData = null;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function setBusy(element, busy) {
    element.classList.toggle("is-loading", busy);
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);
}

function formatDate(value) {
    if (!value) {
        return "Select a date";
    }
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function calculateNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) {
        return 0;
    }
    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);
    const diff = end.getTime() - start.getTime();
    return diff > 0 ? Math.round(diff / 86400000) : 0;
}

function getSelectedAddOns() {
    return Array.from(document.querySelectorAll("#addonGrid input:checked")).map((checkbox) => checkbox.value);
}

function estimateStayTotal(formData) {
    const nights = calculateNights(formData.check_in, formData.check_out) || 2;
    const roomRate = baseRates[formData.room_type] || 270;
    const guestLift = Math.max(Number(formData.guest_count || 1) - 2, 0) * 35 * nights;
    const addOnCost = getSelectedAddOns().reduce((sum, item) => sum + (addOnRates[item] || 0), 0);
    return roomRate * nights + guestLift + addOnCost;
}

function estimateReservationTotalFromData(data) {
    const nights = calculateNights(data.check_in, data.check_out) || 2;
    const roomRate = baseRates[data.room_type] || 270;
    const guestLift = Math.max(Number(data.guest_count || 1) - 2, 0) * 35 * nights;
    const addOns = (data.add_on_summary || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    const addOnCost = addOns.reduce((sum, item) => sum + (addOnRates[item] || 0), 0);
    return roomRate * nights + guestLift + addOnCost;
}

function buildFormState() {
    const formData = Object.fromEntries(new FormData(reservationForm).entries());
    formData.guest_count = Number(formData.guest_count || 1);
    formData.arrival_time = formData.arrival_time || "";
    formData.occasion = formData.occasion || "";
    formData.add_ons = getSelectedAddOns();
    formData.add_on_summary = formData.add_ons.join(", ");
    formData.special_request = formData.special_request ? formData.special_request.trim() : "";
    formData.nights = calculateNights(formData.check_in, formData.check_out);
    formData.estimated_total = estimateStayTotal(formData);
    return formData;
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function renderSources(sources) {
    assistantSources.innerHTML = "";
    sources.forEach((source) => {
        const chip = document.createElement("span");
        chip.textContent = source;
        assistantSources.appendChild(chip);
    });
}

function setPromptRow(mode) {
    dynamicPromptRow.innerHTML = "";
    promptSets[mode].forEach((prompt) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "prompt-chip";
        button.dataset.prompt = prompt;
        button.textContent = prompt;
        button.addEventListener("click", () => {
            assistantMessage.value = prompt;
            assistantMessage.focus();
        });
        dynamicPromptRow.appendChild(button);
    });
}

function addHistoryItem(title, detail) {
    if (assistantHistory.children.length === 1 && assistantHistory.firstElementChild?.querySelector("strong")?.textContent === "Studio ready") {
        assistantHistory.innerHTML = "";
    }
    const item = document.createElement("article");
    item.className = "history-item";
    item.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p>`;
    assistantHistory.prepend(item);
    while (assistantHistory.children.length > 5) {
        assistantHistory.removeChild(assistantHistory.lastElementChild);
    }
}

function buildStayConcept(formState) {
    const additions = formState.add_ons.length
        ? `Layer in ${formState.add_ons.join(", ").toLowerCase()} for a more memorable rhythm.`
        : "Add one or two signature experiences to give the stay more personality.";
    const occasionLine = formState.occasion
        ? `Since this is for ${formState.occasion.toLowerCase()}, shape the details around ceremony and pacing.`
        : "Keep the stay versatile so it works for both rest and exploration.";
    const arrivalLine = formState.arrival_time
        ? `${formState.arrival_time} suggests a softer first touchpoint with ready-room coordination if available.`
        : "A flexible arrival leaves room for a calm check-in and lounge transition.";

    return `Curated concept: ${formState.room_type} for ${formState.guest_count} guest(s) across ${Math.max(formState.nights, 2)} night(s). ${occasionLine} ${arrivalLine} ${additions}`;
}

function renderTimeline(formState) {
    const addOns = formState.add_ons;
    const timeline = [
        {
            title: "Arrival moment",
            detail: formState.arrival_time
                ? `${formState.arrival_time} arrival with a lobby welcome and luggage-first flow.`
                : "Flexible arrival with a smooth check-in transition and welcome refreshment.",
        },
        {
            title: "Stay atmosphere",
            detail: formState.occasion
                ? `${formState.occasion} styling cues reflected through room preparation and concierge notes.`
                : `${formState.room_type} framing a calm, premium stay experience.`,
        },
        {
            title: "Signature layer",
            detail: addOns.length
                ? `${addOns.join(", ")} will shape the highlight moments of the visit.`
                : "Add an experience tile above to give the itinerary a stronger identity.",
        },
    ];

    timelineList.innerHTML = timeline
        .map((item) => `<article class="timeline-item"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p></article>`)
        .join("");
}

function updateStayPreview() {
    const formState = buildFormState();
    const nights = formState.nights;

    summaryGuestName.textContent = formState.guest_name || "Awaiting booking";
    summaryStayWindow.textContent = nights
        ? `${formatDate(formState.check_in)} to ${formatDate(formState.check_out)}`
        : "Choose your dates to preview your stay summary.";
    summaryNights.textContent = `${nights} ${nights === 1 ? "night" : "nights"}`;
    summaryRoom.textContent = formState.room_type || "Ocean Deluxe";
    summaryGuests.textContent = `${formState.guest_count} ${formState.guest_count === 1 ? "guest" : "guests"}`;
    summaryCheckIn.textContent = formatDate(formState.check_in);
    summaryCheckOut.textContent = formatDate(formState.check_out);
    summaryArrival.textContent = formState.arrival_time || "Flexible";
    summaryEstimate.textContent = formatCurrency(formState.estimated_total);
    renderTimeline(formState);
}

function renderReservationDetails(data, includeActions = true) {
    const addOnLine = data.add_on_summary
        ? `<p><strong>Signature add-ons</strong> ${escapeHtml(data.add_on_summary)}</p>`
        : "";
    const specialRequest = data.special_request
        ? `<p><strong>Special request</strong> ${escapeHtml(data.special_request)}</p>`
        : "";
    const arrival = data.arrival_time
        ? `<p><strong>Arrival</strong> ${escapeHtml(data.arrival_time)}</p>`
        : "";
    const occasion = data.occasion
        ? `<p><strong>Occasion</strong> ${escapeHtml(data.occasion)}</p>`
        : "";
    const issued = data.created_at
        ? `<p><strong>Receipt issued</strong> ${escapeHtml(new Date(data.created_at).toLocaleString("en-US"))}</p>`
        : "";
    const estimate = data.estimated_total
        ? `<p><strong>Estimated total</strong> ${escapeHtml(formatCurrency(data.estimated_total))}</p>`
        : "";
    const accessToken = includeActions && data.access_token
        ? `<p><strong>Access token</strong> ${escapeHtml(data.access_token)}</p>`
        : "";

    return `
        <p><strong>${escapeHtml(data.message || "Reservation updated.")}</strong></p>
        <p>${escapeHtml(data.guest_name)} reserved a <strong>${escapeHtml(data.room_type)}</strong> for ${data.guest_count} guest(s).</p>
        <p>${formatDate(data.check_in)} to ${formatDate(data.check_out)}</p>
        <p><strong>Reservation ID</strong> ${escapeHtml(data.reservation_id)}</p>
        ${arrival}
        ${occasion}
        ${addOnLine}
        ${specialRequest}
        ${estimate}
        ${accessToken}
        ${issued}
    `;
}

function applyManageStatus(status) {
    manageStatusBadge.textContent = status;
    manageStatusBadge.className = "status-badge";
    if (status === "confirmed") {
        manageStatusBadge.classList.add("confirmed");
        return;
    }
    if (status === "cancelled") {
        manageStatusBadge.classList.add("cancelled");
        return;
    }
    manageStatusBadge.classList.add("pending");
}

function buildReceiptHtml(data) {
    const addOns = data.add_on_summary || "No signature add-ons selected";
    const specialRequest = data.special_request || "No special request";
    const estimatedTotal = formatCurrency(data.estimated_total || estimateReservationTotalFromData(data));
    const createdAt = data.created_at
        ? new Date(data.created_at).toLocaleString("en-US")
        : "Sunday, July 19, 2026";

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Grand Azure Bay Hotel Receipt</title>
    <style>
        body {
            margin: 0;
            padding: 40px;
            background: linear-gradient(180deg, #f6fbff 0%, #edf4f7 100%);
            color: #12314b;
            font-family: "Segoe UI", sans-serif;
        }
        .receipt {
            max-width: 860px;
            margin: 0 auto;
            background: #fff;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 24px 70px rgba(18, 49, 75, 0.12);
        }
        .hero {
            padding: 34px;
            color: #fff;
            background: linear-gradient(135deg, #0b9aac 0%, #173f5f 100%);
        }
        .hero h1 {
            margin: 0;
            font-family: Georgia, serif;
            font-size: 44px;
            letter-spacing: -0.03em;
        }
        .hero p {
            margin: 12px 0 0;
            max-width: 55ch;
            opacity: 0.92;
            line-height: 1.7;
        }
        .content {
            padding: 28px 34px 34px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
            margin-top: 22px;
        }
        .card {
            border: 1px solid rgba(18, 49, 75, 0.08);
            border-radius: 18px;
            padding: 18px;
            background: #fbfdff;
        }
        .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            color: #0d6574;
        }
        .value {
            display: block;
            margin-top: 8px;
            font-size: 18px;
            font-weight: 700;
        }
        .meta {
            margin-top: 28px;
            border-top: 1px solid rgba(18, 49, 75, 0.08);
            padding-top: 22px;
        }
        .meta p {
            margin: 8px 0;
            line-height: 1.6;
        }
        .footer {
            margin-top: 26px;
            padding: 18px;
            border-radius: 18px;
            background: rgba(11, 154, 172, 0.08);
        }
        @media print {
            body {
                padding: 0;
                background: #fff;
            }
            .receipt {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="hero">
            <div class="label">Booking receipt</div>
            <h1>Grand Azure Bay Hotel</h1>
            <p>Your reservation is confirmed and packaged into a premium receipt layout ready to save, print, or share.</p>
        </div>
        <div class="content">
            <div class="grid">
                <div class="card"><span class="label">Guest</span><span class="value">${escapeHtml(data.guest_name)}</span></div>
                <div class="card"><span class="label">Reservation ID</span><span class="value">${escapeHtml(data.reservation_id)}</span></div>
                <div class="card"><span class="label">Room</span><span class="value">${escapeHtml(data.room_type)}</span></div>
                <div class="card"><span class="label">Guests</span><span class="value">${escapeHtml(String(data.guest_count))}</span></div>
                <div class="card"><span class="label">Check-in</span><span class="value">${escapeHtml(formatDate(data.check_in))}</span></div>
                <div class="card"><span class="label">Check-out</span><span class="value">${escapeHtml(formatDate(data.check_out))}</span></div>
                <div class="card"><span class="label">Arrival</span><span class="value">${escapeHtml(data.arrival_time || "Flexible")}</span></div>
                <div class="card"><span class="label">Occasion</span><span class="value">${escapeHtml(data.occasion || "General escape")}</span></div>
                <div class="card"><span class="label">Signature add-ons</span><span class="value">${escapeHtml(addOns)}</span></div>
                <div class="card"><span class="label">Estimated total</span><span class="value">${escapeHtml(estimatedTotal)}</span></div>
            </div>
            <div class="meta">
                <p><strong>Email:</strong> ${escapeHtml(data.email || "Stored securely")}</p>
                <p><strong>Access token:</strong> ${escapeHtml(data.access_token || "Use the token returned at booking")}</p>
                <p><strong>Special request:</strong> ${escapeHtml(specialRequest)}</p>
                <p><strong>Receipt issued:</strong> ${escapeHtml(createdAt)}</p>
                <p><strong>Status:</strong> ${escapeHtml(data.status || "confirmed")}</p>
            </div>
            <div class="footer">
                Save this receipt along with your reservation ID and access token to manage your booking later.
            </div>
        </div>
    </div>
</body>
</html>`;
}

function downloadReceipt(data) {
    if (!data) {
        showToast("Create or load a reservation before downloading the receipt.");
        return;
    }
    const receiptHtml = buildReceiptHtml(data);
    const blob = new Blob([receiptHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.reservation_id || "booking"}-receipt.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function buildReservationSummaryText(data) {
    return [
        `Grand Azure Bay Hotel`,
        `Reservation ID: ${data.reservation_id}`,
        `Guest: ${data.guest_name}`,
        `Room: ${data.room_type}`,
        `Dates: ${formatDate(data.check_in)} to ${formatDate(data.check_out)}`,
        `Guests: ${data.guest_count}`,
        `Arrival: ${data.arrival_time || "Flexible"}`,
        `Occasion: ${data.occasion || "General escape"}`,
        `Add-ons: ${data.add_on_summary || "None"}`,
        `Access token: ${data.access_token || "Stored separately"}`,
        `Status: ${data.status}`,
    ].join("\n");
}

async function copyText(text, successMessage) {
    try {
        await navigator.clipboard.writeText(text);
        showToast(successMessage);
    } catch (error) {
        showToast("Clipboard copy is unavailable in this browser.");
    }
}

function setAssistantMode(mode) {
    activeMode = mode;
    assistantModes.querySelectorAll(".mode-pill").forEach((button) => {
        button.classList.toggle("active", button.dataset.mode === mode);
    });
    setPromptRow(mode);
    conciergeState.textContent = mode === "policy" ? "Policy precision" : mode === "stay" ? "Stay stylist active" : "Local mood active";
    conciergeSignal.textContent = mode === "policy"
        ? "Best for hotel rules, timings, and booking help."
        : mode === "stay"
            ? "Best for shaping room choice, add-ons, and stay personality."
            : "Best for lighter inspiration around arrival rhythm and nearby moments.";
}

function runVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showToast("Voice input is not supported in this browser.");
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        assistantMessage.value = transcript;
        showToast("Voice prompt captured.");
    };
    recognition.onerror = () => showToast("Voice input could not be captured.");
    recognition.start();
}

function applyExperienceTile(tile) {
    const addOn = tile.dataset.addon;
    const room = tile.dataset.room;
    const note = tile.dataset.note;
    roomTypeInput.value = room;
    const matchingCheckbox = Array.from(document.querySelectorAll("#addonGrid input")).find((input) => input.value === addOn);
    if (matchingCheckbox) {
        matchingCheckbox.checked = true;
    }
    if (note && !specialRequestInput.value.includes(note)) {
        specialRequestInput.value = specialRequestInput.value
            ? `${specialRequestInput.value.trim()} ${note}`
            : note;
    }
    updateStayPreview();
    showToast(`${addOn} added to the stay concept.`);
}

assistantModes.querySelectorAll(".mode-pill").forEach((button) => {
    button.addEventListener("click", () => setAssistantMode(button.dataset.mode));
});

scrollToAssistant.addEventListener("click", () => {
    document.getElementById("assistant-section").scrollIntoView({ behavior: "smooth", block: "start" });
});

voicePromptButton.addEventListener("click", runVoiceInput);

composeStayButton.addEventListener("click", () => {
    const concept = buildStayConcept(buildFormState());
    assistantResponse.textContent = concept;
    assistantIntent.textContent = "stay vision";
    assistantNextStep.textContent = "Review the suggested mood, then confirm dates and add-ons below.";
    assistantMicroSummary.textContent = "The concierge used your live form choices to draft a more personal stay concept.";
    renderSources([]);
    addHistoryItem("Stay vision created", concept);
    setAssistantMode("stay");
});

generateConceptButton.addEventListener("click", () => {
    const concept = buildStayConcept(buildFormState());
    reservationResultBody.innerHTML = `<p><strong>AI stay concept</strong></p><p>${escapeHtml(concept)}</p>`;
    reservationResult.querySelector(".status-badge").textContent = "Concept";
    reservationResult.querySelector(".status-badge").className = "status-badge pending";
    showToast("Stay concept generated.");
});

document.querySelectorAll(".experience-tile").forEach((tile) => {
    tile.addEventListener("click", () => applyExperienceTile(tile));
});

manageForm.querySelectorAll("button[type='submit']").forEach((button) => {
    button.addEventListener("click", () => {
        manageAction = button.dataset.action;
    });
});

document.getElementById("copyAccessToken").addEventListener("click", async () => {
    const token = accessTokenInput.value.trim();
    if (!token) {
        showToast("No access token available to copy yet.");
        return;
    }
    await copyText(token, "Access token copied.");
});

downloadReceiptButton.addEventListener("click", () => downloadReceipt(latestReservationData));
downloadManagedReceiptButton.addEventListener("click", () => downloadReceipt(latestManagedReservationData || latestReservationData));
copyReservationSummaryButton.addEventListener("click", async () => {
    if (!latestReservationData) {
        showToast("Create a reservation before copying the summary.");
        return;
    }
    await copyText(buildReservationSummaryText(latestReservationData), "Reservation summary copied.");
});

assistantForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setBusy(assistantForm, true);
    assistantSubmit.textContent = "Thinking...";

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: assistantMessage.value.trim() }),
        });
        const data = await response.json();
        assistantResponse.textContent = data.answer || "No answer returned.";
        assistantIntent.textContent = data.intent || "Ready";
        assistantNextStep.textContent = activeMode === "policy"
            ? "Use the booking or manage panels below to act on this answer."
            : "Turn this idea into a real stay by locking in dates and guest details.";
        assistantMicroSummary.textContent = activeMode === "policy"
            ? "This response is best for operational clarity and reservation support."
            : "Use this reply as inspiration, then refine the live booking form.";
        renderSources(data.sources || []);
        addHistoryItem("Concierge asked", assistantMessage.value.trim());
        addHistoryItem("Concierge answered", data.answer || "No answer returned.");
    } catch (error) {
        assistantResponse.textContent = "The assistant is temporarily unavailable. Please try again.";
        assistantIntent.textContent = "Error";
        renderSources([]);
    } finally {
        setBusy(assistantForm, false);
        assistantSubmit.textContent = "Ask concierge";
    }
});

reservationForm.addEventListener("input", updateStayPreview);
roomTypeInput.addEventListener("change", updateStayPreview);
guestCountInput.addEventListener("change", updateStayPreview);
arrivalTimeInput.addEventListener("change", updateStayPreview);
occasionInput.addEventListener("change", updateStayPreview);
document.querySelectorAll("#addonGrid input").forEach((checkbox) => checkbox.addEventListener("change", updateStayPreview));

reservationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setBusy(reservationForm, true);
    reservationSubmit.textContent = "Creating...";

    const formState = buildFormState();
    const payload = {
        guest_name: formState.guest_name,
        email: formState.email,
        room_type: formState.room_type,
        check_in: formState.check_in,
        check_out: formState.check_out,
        guest_count: formState.guest_count,
        arrival_time: formState.arrival_time || null,
        occasion: formState.occasion || null,
        add_on_summary: formState.add_on_summary || null,
        special_request: formState.special_request || null,
    };

    try {
        const response = await fetch("/reservation/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Unable to create reservation.");
        }

        latestReservationData = { ...data, estimated_total: formState.estimated_total, email: formState.email };
        latestManagedReservationData = latestReservationData;
        reservationResultBody.innerHTML = renderReservationDetails(latestReservationData);
        reservationResult.querySelector(".status-badge").textContent = data.status;
        reservationResult.querySelector(".status-badge").className = `status-badge ${data.status}`;
        reservationIdInput.value = data.reservation_id;
        accessTokenInput.value = data.access_token || "";
        applyManageStatus("confirmed");
        manageResultBody.innerHTML = renderReservationDetails({
            ...latestReservationData,
            message: "Booking created and ready to manage.",
        });
        downloadReceiptButton.disabled = false;
        copyReservationSummaryButton.disabled = false;
        downloadManagedReceiptButton.disabled = false;
        assistantNextStep.textContent = "Your stay is confirmed. Save the receipt and access token before leaving the page.";
        assistantMicroSummary.textContent = "A downloadable receipt is now unlocked in both the booking and manage sections.";
        addHistoryItem("Reservation confirmed", `${data.reservation_id} for ${data.guest_name}`);
        showToast("Reservation created successfully.");
    } catch (error) {
        latestReservationData = null;
        reservationResultBody.textContent = error.message;
        reservationResult.querySelector(".status-badge").textContent = "Error";
        reservationResult.querySelector(".status-badge").className = "status-badge cancelled";
        downloadReceiptButton.disabled = true;
        copyReservationSummaryButton.disabled = true;
        showToast("Reservation could not be created.");
    } finally {
        setBusy(reservationForm, false);
        reservationSubmit.textContent = "Create reservation";
    }
});

manageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setBusy(manageForm, true);

    const payload = Object.fromEntries(new FormData(manageForm).entries());
    const endpoint = manageAction === "cancel" ? "/reservation/cancel" : "/reservation/view";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || "Unable to manage reservation.");
        }

        latestManagedReservationData = {
            ...data,
            estimated_total: latestReservationData?.reservation_id === data.reservation_id
                ? latestReservationData.estimated_total
                : estimateReservationTotalFromData(data),
        };
        manageResultBody.innerHTML = renderReservationDetails(latestManagedReservationData, false);
        applyManageStatus(data.status || "confirmed");
        downloadManagedReceiptButton.disabled = false;
        addHistoryItem(
            manageAction === "cancel" ? "Reservation cancelled" : "Reservation loaded",
            `${data.reservation_id} is now ${data.status}.`,
        );
        showToast(manageAction === "cancel" ? "Reservation cancelled successfully." : "Reservation details loaded.");
    } catch (error) {
        manageResultBody.textContent = error.message;
        applyManageStatus("Awaiting lookup");
        downloadManagedReceiptButton.disabled = true;
        showToast("Reservation lookup failed.");
    } finally {
        setBusy(manageForm, false);
    }
});

checkInInput.min = TODAY;
checkOutInput.min = TODAY;

checkInInput.addEventListener("change", () => {
    checkOutInput.min = checkInInput.value || TODAY;
    if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
        checkOutInput.value = "";
    }
    updateStayPreview();
});

checkOutInput.addEventListener("change", updateStayPreview);

setAssistantMode("policy");
updateStayPreview();
