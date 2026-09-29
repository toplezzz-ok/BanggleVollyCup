import { db } from "../firebase.js";

import {
    collection,
    doc,
    setDoc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    GROUP_A,
    GROUP_B,
    ALL_TEAMS
} from "../modules/teams.js";


// =====================================================
// FIRESTORE
// =====================================================

const matchesRef =
    collection(db, "matches");


// =====================================================
// VARIABLE
// =====================================================

let allMatches = [];

let currentFilter = "all";

const TOTAL_SLOTS = 23;


// =====================================================
// ELEMENT
// =====================================================

const matchesContainer =
    document.getElementById(
        "matchesContainer"
    );

const message =
    document.getElementById(
        "message"
    );

const editModal =
    document.getElementById(
        "editModal"
    );

const editForm =
    document.getElementById(
        "editForm"
    );

const editGroup =
    document.getElementById(
        "editGroup"
    );
// =====================================================
// PILIH BABAK
// =====================================================

let editStage =
    document.getElementById(
        "editStage"
    );


// Kalau belum ada di HTML,
// buat otomatis.
if (!editStage) {

    const groupElement =
        document.getElementById(
            "editGroup"
        );


    editStage =
        document.createElement(
            "select"
        );

    editStage.id =
        "editStage";


    editStage.innerHTML = `

        <option value="group">
            Fase Grup
        </option>

        <option value="semifinal">
            Semifinal
        </option>

        <option value="final">
            Final
        </option>

    `;


    // Masukkan sebelum pilihan grup
    groupElement.parentNode.insertBefore(
        editStage,
        groupElement
    );


    // Label
    const label =
        document.createElement(
            "label"
        );

    label.textContent =
        "Babak";

    label.style.display =
        "block";

    label.style.marginBottom =
        "6px";

    label.style.fontWeight =
        "700";


    groupElement.parentNode.insertBefore(
        label,
        editStage
    );

}
const editTeamA =
    document.getElementById(
        "editTeamA"
    );

const editTeamB =
    document.getElementById(
        "editTeamB"
    );

const closeModal =
    document.getElementById(
        "closeModal"
    );

const cancelBtn =
    document.getElementById(
        "cancelBtn"
    );

const createSlotsBtn =
    document.getElementById(
        "createSlotsBtn"
    );


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    text,
    type = "success"
) {

    message.textContent =
        text;

    message.className =
        `message ${type}`;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    setTimeout(() => {

        message.classList.add(
            "hidden"
        );

    }, 5000);

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(date) {

    if (!date) {

        return "Tanggal belum diatur";

    }


    const parts =
        String(date).split("-");


    if (
        parts.length !== 3
    ) {

        return date;

    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


// =====================================================
// STATUS
// =====================================================

function getStatusText(
    status
) {

    if (
        status === "finished"
    ) {

        return "SELESAI";

    }


    if (
        status === "live"
    ) {

        return "LIVE";

    }


    return "BELUM MAIN";

}


function getStatusClass(
    status
) {

    if (
        status === "finished"
    ) {

        return "finished";

    }


    if (
        status === "live"
    ) {

        return "live";

    }


    return "scheduled";

}


// =====================================================
// BUAT 23 SLOT
// =====================================================

function createEmptySlots() {

    const slots = [];


    for (
        let i = 1;
        i <= TOTAL_SLOTS;
        i++
    ) {

        const id =
            `match_${String(i).padStart(2, "0")}`;


        let stage = "group";
let group = "";

if (i === 21 || i === 22) {
    stage = "semifinal";
}

if (i === 23) {
    stage = "final";
}

slots.push({

    id,

    slotNumber: i,

    teamA: "",

    teamB: "",

    group,

    stage,

    date: "",

    time: "",

    location: "",

    status: "scheduled",

    scoreA: null,

    scoreB: null

});

    }


    return slots;

}


// =====================================================
// GABUNGKAN SLOT + FIREBASE
// =====================================================

function getDisplayMatches() {

    const slots =
        createEmptySlots();


    allMatches.forEach(
        firebaseMatch => {

            const index =
                slots.findIndex(
                    slot =>
                        slot.id ===
                        firebaseMatch.id
                );


            if (
                index !== -1
            ) {

                slots[index] = {

                    ...slots[index],

                    ...firebaseMatch

                };

            }

        }
    );


    return slots;

}


// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateSummary() {

    const matches =
        getDisplayMatches();


    const filled =
        matches.filter(
            match =>
                match.teamA &&
                match.teamB
        ).length;


    document.getElementById(
        "totalSlots"
    ).textContent =
        TOTAL_SLOTS;


    document.getElementById(
        "filledSlots"
    ).textContent =
        filled;


    document.getElementById(
        "emptySlots"
    ).textContent =
        TOTAL_SLOTS - filled;

}


// =====================================================
// ISI DROPDOWN TIM
// =====================================================

function populateTeams(
    group,
    selectedA = "",
    selectedB = "",
    stage = "group"
) {

    let teams = [];


    // ==========================================
    // FASE GRUP
    // ==========================================

    if (stage === "group") {

        if (group === "A") {

            teams = GROUP_A;

        }

        else if (group === "B") {

            teams = GROUP_B;

        }

    }


    // ==========================================
    // SEMIFINAL / FINAL
    // SEMUA TIM BOLEH DIPILIH
    // ==========================================

    else {

        teams = ALL_TEAMS;

    }


    // ==========================================
    // TIM A
    // ==========================================

    editTeamA.innerHTML = `

        <option value="">
            Pilih Tim A
        </option>

    `;


    // ==========================================
    // TIM B
    // ==========================================

    editTeamB.innerHTML = `

        <option value="">
            Pilih Tim B
        </option>

    `;


    teams.forEach(team => {

        editTeamA.innerHTML += `

            <option value="${escapeHTML(team)}">

                ${escapeHTML(team)}

            </option>

        `;


        editTeamB.innerHTML += `

            <option value="${escapeHTML(team)}">

                ${escapeHTML(team)}

            </option>

        `;

    });


    editTeamA.disabled =
        teams.length === 0;


    editTeamB.disabled =
        teams.length === 0;


    editTeamA.value =
        selectedA;


    editTeamB.value =
        selectedB;

}


// =====================================================
// OPEN MODAL
// =====================================================

function openEditModal(
    id
) {

    const matches =
        getDisplayMatches();


    const match =
        matches.find(
            item =>
                item.id === id
        );


    if (!match) {

        return;

    }


    document.getElementById(
        "editId"
    ).value =
        match.id;


    document.getElementById(
        "modalTitle"
    ).textContent =
        `Match ${String(
            match.slotNumber
        ).padStart(2, "0")}`;


    // ==========================================
// BABAK
// ==========================================

const currentStage =
    match.stage || "group";

editStage.value = currentStage;


// ==========================================
// GRUP
// ==========================================

editGroup.value =
    match.group || "";

editGroup.disabled =
    currentStage !== "group";


// ==========================================
// TIM
// ==========================================

populateTeams(

    match.group || "",

    match.teamA || "",

    match.teamB || "",

    match.stage || "group"

);


    document.getElementById(
        "editDate"
    ).value =
        match.date || "";


    document.getElementById(
        "editTime"
    ).value =
        match.time || "";


    document.getElementById(
        "editLocation"
    ).value =
        match.location || "";


    document.getElementById(
        "editStatus"
    ).value =
        match.status ||
        "scheduled";


    document.getElementById(
        "editScoreA"
    ).value =
        match.scoreA ??
        "";


    document.getElementById(
        "editScoreB"
    ).value =
        match.scoreB ??
        "";


    editModal.classList.remove(
        "hidden"
    );

}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeEditModal() {

    editModal.classList.add(
        "hidden"
    );

}


// =====================================================
// RENDER
// =====================================================

function renderMatches() {

    let matches =
        getDisplayMatches();


    // ==========================================
    // FILTER
    // ==========================================

    if (
        currentFilter === "A"
    ) {

        matches =
            matches.filter(
                match =>
                    match.group === "A"
            );

    }


    if (
        currentFilter === "B"
    ) {

        matches =
            matches.filter(
                match =>
                    match.group === "B"
            );

    }


    if (
        currentFilter === "scheduled"
    ) {

        matches =
            matches.filter(
                match =>
                    match.teamA &&
                    match.teamB &&
                    match.status !==
                    "finished"
            );

    }


    if (
        currentFilter === "finished"
    ) {

        matches =
            matches.filter(
                match =>
                    match.status ===
                    "finished"
            );

    }


    // ==========================================
    // RENDER
    // ==========================================

    matchesContainer.innerHTML =
        matches.map(
            match => {

                const filled =
                    match.teamA &&
                    match.teamB;


                const scoreExists =
                    match.scoreA !== null &&
                    match.scoreA !== undefined &&
                    match.scoreB !== null &&
                    match.scoreB !== undefined;


                const stageLabel =
                    match.stage === "semifinal"
                        ? "SEMIFINAL"
                        : match.stage === "final"
                            ? "FINAL"
                            : `GRUP ${match.group}`;

                const emptyMeta =
                    match.stage === "group"
                        ? "Pilih grup dan tim"
                        : "Pilih tim";

                if (!filled) {

                    return `

                        <div
                            class="match-admin-card empty-match"
                        >

                            <div class="match-number">

                                MATCH
                                ${String(
                                    match.slotNumber
                                ).padStart(2, "0")}

                                <br>

                                <span class="match-group">
                                    ${escapeHTML(stageLabel)}
                                </span>

                            </div>


                            <div>

                                <div class="empty-match-title">

                                    🏐
                                    Pertandingan belum diatur

                                </div>


                                <div class="match-meta">

                                    <span>
                                        ${emptyMeta}
                                    </span>

                                </div>

                            </div>


                            <div class="match-action">

                                <button
                                    class="btn-edit"
                                    data-id="${match.id}"
                                >

                                    ✏️ Isi

                                </button>

                            </div>

                        </div>

                    `;

                }


                return `

                    <div
                        class="match-admin-card"
                    >

                        <div class="match-number">

                            MATCH
                            ${String(
                                match.slotNumber
                            ).padStart(2, "0")}


                            <br>


                            <span class="match-group">

                                ${escapeHTML(stageLabel)}

                            </span>

                        </div>


                        <div>


                            <div class="match-teams">

                                <strong>

                                    ${escapeHTML(
                                        match.teamA
                                    )}

                                </strong>


                                <span>
                                    VS
                                </span>


                                <strong>

                                    ${escapeHTML(
                                        match.teamB
                                    )}

                                </strong>

                            </div>


                            ${
                                scoreExists
                                    ?

                                    `

                                    <div class="match-score">

                                        ${match.scoreA}
                                        -
                                        ${match.scoreB}

                                    </div>

                                    `

                                    :

                                    ""

                            }


                            <div class="match-meta">

                                <span>

                                    📅
                                    ${formatDate(
                                        match.date
                                    )}

                                </span>


                                <span>

                                    ⏰
                                    ${escapeHTML(
                                        match.time ||
                                        "--:--"
                                    )}

                                </span>


                                <span>

                                    📍
                                    ${escapeHTML(
                                        match.location ||
                                        "Lokasi belum ditentukan"
                                    )}

                                </span>

                            </div>


                            <span
                                class="
                                    status-badge
                                    status-${getStatusClass(
                                        match.status
                                    )}
                                "
                            >

                                ${getStatusText(
                                    match.status
                                )}

                            </span>


                        </div>


                        <div class="match-action">

                            <button
                                class="btn-edit"
                                data-id="${match.id}"
                            >

                                ✏️ Edit

                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");


    // ==========================================
    // BUTTON EVENT
    // ==========================================

    document
        .querySelectorAll(
            ".btn-edit"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openEditModal(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    updateSummary();

}


// =====================================================
// SIMPAN
// =====================================================

// =====================================================
// NORMALIZE TEAM
// =====================================================

function normalizeTeamName(name) {

    return String(name || "")
        .trim()
        .toLowerCase();

}


// =====================================================
// CEK PASANGAN SUDAH ADA
// =====================================================

function isDuplicateMatch(
    currentId,
    group,
    teamA,
    teamB
) {

    const currentPair = [

        normalizeTeamName(teamA),

        normalizeTeamName(teamB)

    ].sort().join("|");


    const matches =
        getDisplayMatches();


    return matches.some(match => {

        // Jangan bandingkan dengan dirinya sendiri
        if (
            match.id === currentId
        ) {

            return false;

        }


        // Harus satu grup
        if (
            match.group !== group
        ) {

            return false;

        }


        // Pertandingan kosong tidak dihitung
        if (
            !match.teamA ||
            !match.teamB
        ) {

            return false;

        }


        const existingPair = [

            normalizeTeamName(
                match.teamA
            ),

            normalizeTeamName(
                match.teamB
            )

        ].sort().join("|");


        return (
            existingPair ===
            currentPair
        );

    });

}


// =====================================================
// HITUNG MATCH PER GRUP
// =====================================================

function countGroupMatches(
    group,
    currentId
) {

    return getDisplayMatches()
        .filter(match => {

            if (
                match.id === currentId
            ) {

                return false;

            }


            return (
                match.group === group &&
                match.teamA &&
                match.teamB
            );

        })
        .length;

}


// =====================================================
// SIMPAN PERTANDINGAN
// =====================================================

async function saveMatch(
    event
) {

    event.preventDefault();


    // =================================================
    // AMBIL DATA FORM
    // =================================================

    const id =
        document.getElementById(
            "editId"
        ).value;


    const group =
        editGroup.value;

        const stage =
    editStage.value;


    const teamA =
        editTeamA.value;


    const teamB =
        editTeamB.value;


    const date =
        document.getElementById(
            "editDate"
        ).value;


    const time =
        document.getElementById(
            "editTime"
        ).value;


    const location =
        document.getElementById(
            "editLocation"
        ).value.trim();


    const status =
        document.getElementById(
            "editStatus"
        ).value;


    const scoreAValue =
        document.getElementById(
            "editScoreA"
        ).value;


    const scoreBValue =
        document.getElementById(
            "editScoreB"
        ).value;

    // =================================================
// VALIDASI GRUP
// HANYA UNTUK FASE GRUP
// =================================================

if (
    stage === "group" &&
    !group
) {

    showMessage(
        "⚠️ Silakan pilih grup terlebih dahulu.",
        "error"
    );

    return;

}


    // =================================================
    // VALIDASI TIM A
    // =================================================

    if (!teamA) {

        showMessage(
            "⚠️ Silakan pilih Tim A.",
            "error"
        );

        return;

    }


    // =================================================
    // VALIDASI TIM B
    // =================================================

    if (!teamB) {

        showMessage(
            "⚠️ Silakan pilih Tim B.",
            "error"
        );

        return;

    }


    // =================================================
    // TIM TIDAK BOLEH SAMA
    // =================================================

    if (
        normalizeTeamName(teamA) ===
        normalizeTeamName(teamB)
    ) {

        showMessage(
            "❌ Tim A dan Tim B tidak boleh sama.",
            "error"
        );

        return;

    }

  // =================================================
// VALIDASI TIM SESUAI GRUP
// HANYA FASE GRUP
// =================================================

if (stage === "group") {

    const groupTeams =
        group === "A"
            ? GROUP_A
            : GROUP_B;


    if (!groupTeams.includes(teamA)) {

        showMessage(
            `❌ ${teamA} bukan anggota Grup ${group}.`,
            "error"
        );

        return;

    }


    if (!groupTeams.includes(teamB)) {

        showMessage(
            `❌ ${teamB} bukan anggota Grup ${group}.`,
            "error"
        );

        return;

    }

}

    // =================================================
// CEK MAKSIMAL 10 MATCH PER GRUP
// HANYA FASE GRUP
// =================================================

if (stage === "group") {

    const totalGroupMatches =
        countGroupMatches(
            group,
            id
        );


    if (
        totalGroupMatches >= 10
    ) {

        showMessage(

            `❌ Grup ${group} sudah memiliki 10 pertandingan.`,

            "error"

        );

        return;

    }

}


    // =================================================
    // CEK DUPLIKAT PASANGAN
    // =================================================

   if (
    stage === "group" &&
    isDuplicateMatch(
        id,
        group,
        teamA,
        teamB
    )
)
    {

        showMessage(

            `⚠️ Pertandingan ${teamA} vs ${teamB} ` +
            `sudah pernah dibuat di Grup ${group}.`,

            "error"

        );

        return;

    }


// =================================================
// VALIDASI SKOR
// =================================================

let scoreA = null;
let scoreB = null;


// =================================================
// JIKA BELUM SELESAI
// SKOR DIANGGAP KOSONG
// =================================================

if (status !== "finished") {

    scoreA = null;
    scoreB = null;

} else {

    // =============================================
    // PERTANDINGAN SELESAI WAJIB ADA SKOR
    // =============================================

    if (
        scoreAValue === "" ||
        scoreBValue === ""
    ) {

        showMessage(
            "❌ Pertandingan selesai harus memiliki skor.",
            "error"
        );

        return;
    }


    // =============================================
    // UBAH KE ANGKA
    // =============================================

    scoreA = Number(scoreAValue);
    scoreB = Number(scoreBValue);


    // =============================================
    // HARUS ANGKA BULAT
    // =============================================

    if (
        !Number.isInteger(scoreA) ||
        !Number.isInteger(scoreB)
    ) {

        showMessage(
            "❌ Skor harus berupa angka bulat.",
            "error"
        );

        return;
    }


    // =============================================
    // SKOR HANYA 0 - 3
    // =============================================

    if (
        scoreA < 0 ||
        scoreA > 3 ||
        scoreB < 0 ||
        scoreB > 3
    ) {

        showMessage(
            "❌ Skor hanya boleh 0 sampai 3.",
            "error"
        );

        return;
    }


    // =============================================
    // TIDAK BOLEH SERI
    // =============================================

    if (scoreA === scoreB) {

        showMessage(
            "❌ Skor pertandingan tidak boleh seri.",
            "error"
        );

        return;
    }


    // =============================================
    // SALAH SATU HARUS MENCAPAI 3
    // =============================================

    if (
        scoreA !== 3 &&
        scoreB !== 3
    ) {

        showMessage(
            "❌ Salah satu tim harus mencapai 3 set.",
            "error"
        );

        return;
    }

}

    // =================================================
    // STATUS SELESAI HARUS PUNYA SKOR
    // =================================================

    if (
        status === "finished" &&
        (
            scoreA === null ||
            scoreB === null
        )
    ) {

        showMessage(
            "❌ Pertandingan selesai harus memiliki skor.",
            "error"
        );

        return;

    }


    // =================================================
    // STATUS BELUM MAIN TIDAK PERLU SKOR
    // =================================================

    if (
        status !== "finished"
    ) {

        scoreA = null;

        scoreB = null;

    }


    // =================================================
    // DATA FIRESTORE
    // =================================================

    const data = {

    teamA,

    teamB,

    group,

    stage,

    date,

    time,

    location,

    status,

    scoreA,

    scoreB,

    updatedAt:
        new Date().toISOString()

};


    // =================================================
    // SIMPAN KE FIRESTORE
    // =================================================

    try {

        const matchRef =
            doc(
                db,
                "matches",
                id
            );


        await setDoc(

            matchRef,

            data,

            {
                merge: true
            }

        );


        // Tutup modal
        closeEditModal();


        // Pesan berhasil
        showMessage(

            `✅ Match berhasil disimpan: ` +
            `${teamA} vs ${teamB}`,

            "success"

        );


        console.log(
            "Match berhasil disimpan:",
            data
        );


    } catch (error) {

        console.error(
            "Gagal menyimpan:",
            error
        );


        showMessage(

            "❌ Gagal menyimpan pertandingan: " +
            error.message,

            "error"

        );

    }

}


// =====================================================
// BUAT 23 SLOT
// =====================================================

function createSlots() {

    const confirmed =
        confirm(
            "Buat 23 slot pertandingan kosong?\n\n" +
            "Slot akan muncul di panel admin dan bisa kamu isi satu per satu."
        );


    if (!confirmed) {

        return;

    }


    /*
        Slot sebenarnya sudah tersedia
        secara otomatis di tampilan.

        Tombol ini hanya merender ulang.
    */

    renderMatches();


    showMessage(
        "✅ 23 slot pertandingan siap diisi.",
        "success"
    );

}


// =====================================================
// FILTER
// =====================================================

document
    .querySelectorAll(
        ".filter-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".filter-btn"
                        )
                        .forEach(
                            btn => {

                                btn.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    currentFilter =
                        button.dataset.filter;


                    renderMatches();

                }
            );

        }
    );


// =====================================================
// GRUP BERUBAH
// =====================================================

// =====================================================
// BABAK BERUBAH
// =====================================================

editStage.addEventListener(
    "change",
    () => {

        const stage =
            editStage.value;


        // Semifinal / Final
        // tidak membutuhkan grup

        if (
            stage === "semifinal" ||
            stage === "final"
        ) {

            editGroup.value = "";

            editGroup.disabled = true;


            populateTeams(
                "",
                "",
                "",
                stage
            );

            return;

        }


        // Fase grup
        editGroup.disabled = false;


        populateTeams(
            editGroup.value,
            "",
            "",
            "group"
        );

    }
);


// =====================================================
// GRUP BERUBAH
// =====================================================

editGroup.addEventListener(
    "change",
    () => {

        populateTeams(
            editGroup.value,
            "",
            "",
            editStage.value
        );

    }
);


// =====================================================
// CLOSE
// =====================================================

closeModal.addEventListener(
    "click",
    closeEditModal
);


cancelBtn.addEventListener(
    "click",
    closeEditModal
);


editModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            editModal
        ) {

            closeEditModal();

        }

    }
);


// =====================================================
// FORM
// =====================================================

editForm.addEventListener(
    "submit",
    saveMatch
);


createSlotsBtn.addEventListener(
    "click",
    createSlots
);


// =====================================================
// FIREBASE REALTIME
// =====================================================

function loadMatches() {

    const matchesQuery =
        query(
            matchesRef,
            orderBy(
                "date",
                "asc"
            )
        );


    onSnapshot(

        matchesQuery,

        snapshot => {

            allMatches = [];


            snapshot.forEach(
                document => {

                    const data =
                        document.data();


                    /*
                        Hanya ambil
                        pertandingan fase grup
                        atau dokumen yang menggunakan
                        format match_XX.
                    */

                   if (
    data.stage === "group" ||
    data.stage === "semifinal" ||
    data.stage === "final" ||
    document.id.startsWith("match_")
) {

    allMatches.push({

        id: document.id,

        ...data

    });

}

                }
            );


            renderMatches();

        },


        error => {

            console.error(
                "Firebase error:",
                error
            );


            matchesContainer.innerHTML = `

                <div class="empty">

                    ❌ Gagal mengambil data.

                    <br><br>

                    ${escapeHTML(
                        error.message
                    )}

                </div>

            `;

        }

    );

}


// =====================================================
// START
// =====================================================

console.log(
    "================================="
);

console.log(
    "BANGGLE VOLLEY CUP ADMIN"
);

console.log(
    "Mode: Manual Team Selection"
);

console.log(
    "Total tim:",
    ALL_TEAMS.length
);

console.log(
    "================================="
);


loadMatches();