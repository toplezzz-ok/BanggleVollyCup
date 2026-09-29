import { db } from "./firebase.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// =====================================================
// BANGGLE VOLLEY CUP 2026
// =====================================================

console.log("Banggle Volley Cup 2026 siap! 🏐");
console.log("Firebase Firestore:", db);


// =====================================================
// DATA TIM
// =====================================================

const GROUP_A = [
    "Mak Yem",
    "UD Sunan Jati",
    "Jibrat Klelet",
    "Pule Ceria",
    "Samador"
];

const GROUP_B = [
    "Pak Wo",
    "Rembo",
    "Lek Man",
    "Karang Taruna",
    "Pak Yo"
];

const ALL_TEAMS = [
    ...GROUP_A,
    ...GROUP_B
];


// =====================================================
// ELEMENT HTML
// =====================================================

const heroCard = document.querySelector(".hero-card");

const scheduleSection = document.querySelector("#jadwal");

const standingsSection = document.querySelector("#klasemen");

const resultSection = document.querySelector("#hasil");


// =====================================================
// HELPER
// =====================================================

function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =====================================================
// NORMALISASI NAMA TIM
// =====================================================

function normalizeTeamName(name) {

    if (!name) {
        return "";
    }

    const text = String(name).trim().toLowerCase();

    const teamMap = {

        "mak yem": "Mak Yem",

        "ud sunan jati": "UD Sunan Jati",

        "jibrat klelet": "Jibrat Klelet",

        "pule ceria": "Pule Ceria",

        "samador": "Samador",

        "pak wo": "Pak Wo",

        "rembo": "Rembo",

        "lek man": "Lek Man",

        "karang taruna": "Karang Taruna",

        "pak yo": "Pak Yo"
    };

    return teamMap[text] || String(name).trim();
}


// =====================================================
// CEK GRUP TIM
// =====================================================

function getTeamGroup(teamName) {

    const team = normalizeTeamName(teamName);

    if (GROUP_A.includes(team)) {
        return "A";
    }

    if (GROUP_B.includes(team)) {
        return "B";
    }

    return null;
}


// =====================================================
// PARSE TANGGAL
// =====================================================

function getMatchDate(match) {

    if (!match.date) {
        return null;
    }

    const date = String(match.date);

    const parts = date.split("-");

    if (parts.length !== 3) {
        return null;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    return new Date(year, month, day);
}


// =====================================================
// PARSE WAKTU
// =====================================================

function getMatchDateTime(match) {

    const date = getMatchDate(match);

    if (!date) {
        return null;
    }

    let hours = 0;
    let minutes = 0;

    if (match.time) {

        const timeParts = String(match.time).split(":");

        hours = Number(timeParts[0]) || 0;
        minutes = Number(timeParts[1]) || 0;
    }

    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatDateIndonesia(date) {

    if (!date) {
        return "-";
    }

    const days = [
        "MINGGU",
        "SENIN",
        "SELASA",
        "RABU",
        "KAMIS",
        "JUMAT",
        "SABTU"
    ];

    const months = [
        "JANUARI",
        "FEBRUARI",
        "MARET",
        "APRIL",
        "MEI",
        "JUNI",
        "JULI",
        "AGUSTUS",
        "SEPTEMBER",
        "OKTOBER",
        "NOVEMBER",
        "DESEMBER"
    ];

    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}


// =====================================================
// FORMAT TANGGAL PENDEK
// =====================================================

function formatShortDate(date) {

    if (!date) {
        return "-";
    }

    const months = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MEI",
        "JUN",
        "JUL",
        "AGU",
        "SEP",
        "OKT",
        "NOV",
        "DES"
    ];

    return `${date.getDate()} ${months[date.getMonth()]}`;
}


// =====================================================
// FORMAT STATUS
// =====================================================

function getStatusText(status) {

    const value = String(status || "").toLowerCase();

    if (
        value === "finished" ||
        value === "finish" ||
        value === "selesai" ||
        value === "completed"
    ) {
        return "SELESAI";
    }

    if (
        value === "live" ||
        value === "playing" ||
        value === "berlangsung"
    ) {
        return "SEDANG BERLANGSUNG";
    }

    return "AKAN DIMULAI";
}


// =====================================================
// CEK MATCH SELESAI
// =====================================================

function isFinished(match) {

    const status = String(match.status || "").toLowerCase();

    return (
        status === "finished" ||
        status === "finish" ||
        status === "selesai" ||
        status === "completed"
    );
}


// =====================================================
// CEK MATCH LIVE
// =====================================================

function isLive(match) {

    const status = String(match.status || "").toLowerCase();

    return (
        status === "live" ||
        status === "playing" ||
        status === "berlangsung"
    );
}


// =====================================================
// AMBIL SKOR
// =====================================================

function getScore(match, field) {

    const value = Number(match[field]);

    if (Number.isNaN(value)) {
        return 0;
    }

    return value;
}


// =====================================================
// PERTANDINGAN BERIKUTNYA
// =====================================================

function getNextMatch(matches) {

    const upcoming = matches
        .filter(match => !isFinished(match))
        .sort((a, b) => {

            const dateA = getMatchDateTime(a);
            const dateB = getMatchDateTime(b);

            if (!dateA) return 1;
            if (!dateB) return -1;

            return dateA - dateB;
        });

    return upcoming[0] || null;
}


// =====================================================
// UPDATE HERO
// =====================================================

function renderHero(match) {

    if (!heroCard) {
        return;
    }

    if (!match) {

        heroCard.innerHTML = `

            <span class="label">
                PERTANDINGAN BERIKUTNYA
            </span>

            <div class="match-date">
                BELUM ADA JADWAL
            </div>

            <div class="match-time">
                --:-- WIB
            </div>

            <div class="teams">

                <div class="team">

                    <div class="team-logo">
                        🏐
                    </div>

                    <strong>
                        -
                    </strong>

                </div>

                <div class="vs">
                    VS
                </div>

                <div class="team">

                    <div class="team-logo">
                        🏐
                    </div>

                    <strong>
                        -
                    </strong>

                </div>

            </div>

            <div class="location">
                📍 Menunggu jadwal pertandingan
            </div>

        `;

        return;
    }


    const date = getMatchDate(match);

    const teamA = normalizeTeamName(match.teamA);
    const teamB = normalizeTeamName(match.teamB);

    const time = match.time || "--:--";

    const location =
        match.location ||
        "Lokasi belum ditentukan";


    let label = "PERTANDINGAN BERIKUTNYA";

    if (isLive(match)) {
        label = "🔴 SEDANG BERLANGSUNG";
    }


    heroCard.innerHTML = `

        <span class="label">
            ${label}
        </span>

        <div class="match-date">
            ${formatDateIndonesia(date)}
        </div>

        <div class="match-time">
            ${escapeHTML(time)} WIB
        </div>

        <div class="teams">

            <div class="team">

                <div class="team-logo">
                    🏐
                </div>

                <strong>
                    ${escapeHTML(teamA)}
                </strong>

            </div>

            <div class="vs">
                VS
            </div>

            <div class="team">

                <div class="team-logo">
                    🏐
                </div>

                <strong>
                    ${escapeHTML(teamB)}
                </strong>

            </div>

        </div>

        <div class="location">
            📍 ${escapeHTML(location)}
        </div>

    `;
}


// =====================================================
// RENDER JADWAL
// =====================================================

function renderSchedule(matches) {

    if (!scheduleSection) {
        return;
    }

    const sortedMatches = [...matches].sort((a, b) => {

        const dateA = getMatchDateTime(a);
        const dateB = getMatchDateTime(b);

        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateA - dateB;
    });


    const today = new Date();

    const todayMatches = sortedMatches.filter(match => {

        const date = getMatchDate(match);

        if (!date) {
            return false;
        }

        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );

    });


    const matchesToShow =
        todayMatches.length > 0
            ? todayMatches
            : sortedMatches;


    let html = `

        <div class="section-title">

            <div>

                <span>
                    PERTANDINGAN
                </span>

                <h2>
                    Jadwal Pertandingan
                </h2>

            </div>

            <span class="date-badge">
                ${formatShortDate(
                    getMatchDate(matchesToShow[0])
                )}
            </span>

        </div>

    `;


    if (matchesToShow.length === 0) {

        html += `

            <div class="empty-card">

                <div>🏐</div>

                <strong>
                    Belum ada jadwal pertandingan
                </strong>

                <p>
                    Jadwal pertandingan akan muncul di sini.
                </p>

            </div>

        `;

        scheduleSection.innerHTML = html;

        return;
    }


    matchesToShow.forEach(match => {

        const teamA = normalizeTeamName(match.teamA);
        const teamB = normalizeTeamName(match.teamB);

        const statusText = getStatusText(match.status);

        const finished = isFinished(match);

        const live = isLive(match);

        let statusClass = "upcoming";

        if (finished) {
            statusClass = "finished";
        }

        if (live) {
            statusClass = "live";
        }


        let scoreHTML = "";

        if (finished || live) {

            scoreHTML = `

                <div class="match-score">

                    <strong>
                        ${getScore(match, "scoreA")}
                    </strong>

                    <span>
                        -
                    </span>

                    <strong>
                        ${getScore(match, "scoreB")}
                    </strong>

                </div>

            `;

        }


        html += `

            <div class="match-card">

                <div class="match-info">

                    <span>
                        ${escapeHTML(match.time || "--:--")} WIB
                    </span>

                    <small>
                        ${escapeHTML(
                            match.location ||
                            "Lokasi belum ditentukan"
                        )}
                    </small>

                </div>

                <div class="match-teams">

                    <strong>
                        ${escapeHTML(teamA)}
                    </strong>

                    ${scoreHTML || "<span>VS</span>"}

                    <strong>
                        ${escapeHTML(teamB)}
                    </strong>

                </div>

                <span class="status ${statusClass}">

                    ${statusText}

                </span>

            </div>

        `;

    });


    scheduleSection.innerHTML = html;
}


// =====================================================
// BUAT DATA KLASEMEN AWAL
// =====================================================

function createStandings() {

    const standings = {};

    ALL_TEAMS.forEach(team => {

        standings[team] = {

            name: team,

            group: getTeamGroup(team),

            played: 0,

            wins: 0,

            losses: 0,

            points: 0,

            scoreFor: 0,

            scoreAgainst: 0,

            difference: 0

        };

    });

    return standings;
}


// =====================================================
// HITUNG KLASEMEN
// =====================================================

function calculateStandings(matches) {

    const standings = createStandings();

    matches
        .filter(match => isFinished(match))
        .forEach(match => {

            const teamA = normalizeTeamName(match.teamA);
            const teamB = normalizeTeamName(match.teamB);

            const scoreA = getScore(match, "scoreA");
            const scoreB = getScore(match, "scoreB");

            // Pastikan tim terdaftar
            if (!standings[teamA]) {
                return;
            }

            if (!standings[teamB]) {
                return;
            }


            // ==========================================
            // JUMLAH PERTANDINGAN
            // ==========================================

            standings[teamA].played++;
            standings[teamB].played++;


            // ==========================================
            // JUMLAH SET
            // ==========================================

            standings[teamA].scoreFor += scoreA;
            standings[teamA].scoreAgainst += scoreB;

            standings[teamB].scoreFor += scoreB;
            standings[teamB].scoreAgainst += scoreA;


            // ==========================================
            // PERHITUNGAN MENANG / KALAH + POIN
            // ==========================================

            if (scoreA > scoreB) {

                // Tim A MENANG
                standings[teamA].wins++;
                standings[teamB].losses++;


                // ======================================
                // ATURAN POIN BANGGLE VOLLEY CUP
                // ======================================

                if (scoreA === 3 && scoreB === 2) {

                    // Menang 3-2
                    standings[teamA].points += 2;
                    standings[teamB].points += 0;

                }

                else {

                    // Menang 3-0 atau 3-1
                    standings[teamA].points += 3;
                    standings[teamB].points += 0;

                }

            }


            else if (scoreB > scoreA) {

                // Tim B MENANG
                standings[teamB].wins++;
                standings[teamA].losses++;


                // ======================================
                // ATURAN POIN BANGGLE VOLLEY CUP
                // ======================================

                if (scoreB === 3 && scoreA === 2) {

                    // Menang 3-2
                    standings[teamB].points += 2;
                    standings[teamA].points += 0;

                }

                else {

                    // Menang 3-0 atau 3-1
                    standings[teamB].points += 3;
                    standings[teamA].points += 0;

                }

            }

        });


    // ==========================================
    // SELISIH SET
    // ==========================================

    Object.values(standings).forEach(team => {

        team.difference =
            team.scoreFor -
            team.scoreAgainst;

    });


    return standings;
}


// =====================================================
// URUTKAN KLASEMEN
// =====================================================

function sortStandings(teams) {

    return teams.sort((a, b) => {

        // Poin terlebih dahulu
        if (b.points !== a.points) {
            return b.points - a.points;
        }

        // Selisih skor
        if (b.difference !== a.difference) {
            return b.difference - a.difference;
        }

        // Jumlah kemenangan
        if (b.wins !== a.wins) {
            return b.wins - a.wins;
        }

        // Jumlah skor
        return b.scoreFor - a.scoreFor;

    });

}


// =====================================================
// RENDER SATU GRUP
// =====================================================

function renderGroupStandings(groupName, teams) {

    const sorted = sortStandings([...teams]);


    let html = `

        <div class="group-title">

            <span>
                GRUP ${groupName}
            </span>

        </div>

        <div class="standings">

            <div class="standing-row header-row">

                <span>#</span>

                <span>Tim</span>

                <span>M</span>

                <span>W</span>

                <span>L</span>

                <span>PTS</span>

            </div>

    `;


    sorted.forEach((team, index) => {

        let rankClass = "";

        if (index === 0) {
            rankClass = "first";
        }

        else if (index === 1) {
            rankClass = "second";
        }

        else if (index === 2) {
            rankClass = "third";
        }


        html += `

            <div class="standing-row">

                <span class="rank ${rankClass}">
                    ${index + 1}
                </span>

                <strong>
                    ${escapeHTML(team.name)}
                </strong>

                <span>
                    ${team.played}
                </span>

                <span>
                    ${team.wins}
                </span>

                <span>
                    ${team.losses}
                </span>

                <strong>
                    ${team.points}
                </strong>

            </div>

        `;

    });


    html += `

        </div>

        <div class="standing-note">

            M = Main &nbsp; | &nbsp;
            W = Menang &nbsp; | &nbsp;
            L = Kalah &nbsp; | &nbsp;
            PTS = Poin

        </div>

    `;


    return html;
}


// =====================================================
// RENDER KLASEMEN
// =====================================================

function renderStandings(matches) {

    if (!standingsSection) {
        return;
    }


    const standings = calculateStandings(matches);


    const groupA = GROUP_A.map(team => standings[team]);

    const groupB = GROUP_B.map(team => standings[team]);


    standingsSection.innerHTML = `

        <div class="section-title">

            <div>

                <span>
                    STANDING
                </span>

                <h2>
                    Klasemen
                </h2>

            </div>

            <span class="trophy">
                🏆
            </span>

        </div>


        ${renderGroupStandings("A", groupA)}

        ${renderGroupStandings("B", groupB)}

    `;

}


// =====================================================
// RENDER HASIL
// =====================================================

function renderResults(matches) {

    if (!resultSection) {
        return;
    }


    const finishedMatches = matches
        .filter(match => isFinished(match))
        .sort((a, b) => {

            const dateA = getMatchDateTime(a);
            const dateB = getMatchDateTime(b);

            if (!dateA) return 1;
            if (!dateB) return -1;

            return dateB - dateA;

        });


    let html = `

        <div class="section-title">

            <div>

                <span>
                    PERTANDINGAN
                </span>

                <h2>
                    Hasil Terbaru
                </h2>

            </div>

        </div>

    `;


    if (finishedMatches.length === 0) {

        html += `

            <div class="empty-card">

                <div>
                    🏐
                </div>

                <strong>
                    Belum ada hasil pertandingan
                </strong>

                <p>
                    Hasil pertandingan akan muncul di sini.
                </p>

            </div>

        `;

        resultSection.innerHTML = html;

        return;
    }


    finishedMatches.forEach(match => {

        const teamA = normalizeTeamName(match.teamA);
        const teamB = normalizeTeamName(match.teamB);

        const scoreA = getScore(match, "scoreA");
        const scoreB = getScore(match, "scoreB");

        const date = getMatchDate(match);


        html += `

            <div class="match-card result-card">

                <div class="match-info">

                    <span>
                        ${escapeHTML(match.time || "--:--")} WIB
                    </span>

                    <small>
                        ${formatShortDate(date)}
                    </small>

                </div>


                <div class="match-teams">

                    <strong>
                        ${escapeHTML(teamA)}
                    </strong>

                    <div class="match-score">

                        <strong>
                            ${scoreA}
                        </strong>

                        <span>
                            -
                        </span>

                        <strong>
                            ${scoreB}
                        </strong>

                    </div>

                    <strong>
                        ${escapeHTML(teamB)}
                    </strong>

                </div>


                <span class="status finished">
                    SELESAI
                </span>

            </div>

        `;

    });


    resultSection.innerHTML = html;

}

// =====================================================
// SEMIFINAL
// =====================================================

function getSemiFinalTeams(matches) {

    // ==========================================
    // AMBIL HANYA PERTANDINGAN FASE GRUP
    // ==========================================

    const groupMatches = matches.filter(match => {

        return (
            match.stage === "group" ||
            match.group === "A" ||
            match.group === "B"
        );

    });


    // ==========================================
    // PISAHKAN GRUP A DAN GRUP B
    // ==========================================

    const groupAMatches =
        groupMatches.filter(
            match => match.group === "A"
        );


    const groupBMatches =
        groupMatches.filter(
            match => match.group === "B"
        );


    // ==========================================
    // HITUNG YANG SUDAH SELESAI
    // ==========================================

    const groupAFinished =
        groupAMatches.filter(
            match => isFinished(match)
        );


    const groupBFinished =
        groupBMatches.filter(
            match => isFinished(match)
        );


    // ==========================================
    // SETIAP GRUP HARUS MENYELESAIKAN
    // 10 PERTANDINGAN
    // ==========================================

    const groupAComplete =
        groupAFinished.length >= 10;


    const groupBComplete =
        groupBFinished.length >= 10;


    // ==========================================
    // KALAU BELUM SELESAI
    // JANGAN TENTUKAN SEMIFINAL
    // ==========================================

    if (
        !groupAComplete ||
        !groupBComplete
    ) {

        return {

            ready: false,

            groupAFinished:
                groupAFinished.length,

            groupBFinished:
                groupBFinished.length,

            groupATotal:
                groupAMatches.length,

            groupBTotal:
                groupBMatches.length,

            groupAFirst: null,

            groupASecond: null,

            groupBFirst: null,

            groupBSecond: null

        };

    }


    // ==========================================
    // HITUNG KLASEMEN
    // ==========================================

    const standings =
        calculateStandings(matches);


    // ==========================================
    // KLASEMEN GRUP A
    // ==========================================

    const groupA =
        sortStandings(

            GROUP_A.map(
                team =>
                    standings[team]
            )

        );


    // ==========================================
    // KLASEMEN GRUP B
    // ==========================================

    const groupB =
        sortStandings(

            GROUP_B.map(
                team =>
                    standings[team]
            )

        );


    // ==========================================
    // SEMIFINAL SIAP
    // ==========================================

    return {

        ready: true,

        groupAFinished:
            groupAFinished.length,

        groupBFinished:
            groupBFinished.length,

        groupATotal:
            groupAMatches.length,

        groupBTotal:
            groupBMatches.length,

        // Juara Grup A
        groupAFirst:
            groupA[0],

        // Runner-up Grup A
        groupASecond:
            groupA[1],

        // Juara Grup B
        groupBFirst:
            groupB[0],

        // Runner-up Grup B
        groupBSecond:
            groupB[1]

    };

}


// =====================================================
// TAMPILKAN INFO SEMIFINAL
// =====================================================

function showQualification(matches) {

    const result =
        getSemiFinalTeams(matches);


    console.log(
        "================================="
    );

    console.log(
        "        STATUS SEMIFINAL"
    );

    console.log(
        "================================="
    );


    // ==========================================
    // BELUM SELESAI
    // ==========================================

    if (!result.ready) {

        console.log(
            "⏳ SEMIFINAL BELUM DITENTUKAN"
        );


        console.log(
            `Grup A: ${result.groupAFinished}/10 pertandingan selesai`
        );


        console.log(
            `Grup B: ${result.groupBFinished}/10 pertandingan selesai`
        );


        console.log(
            "Semifinal akan ditentukan setelah seluruh fase grup selesai."
        );


        console.log(
            "================================="
        );


        return;

    }


    // ==========================================
    // SEMIFINAL 1
    // JUARA A VS RUNNER-UP B
    // ==========================================

    if (
        result.groupAFirst &&
        result.groupBSecond
    ) {

        console.log(
            "SEMIFINAL 1:",
            result.groupAFirst.name,
            "vs",
            result.groupBSecond.name
        );

    }


    // ==========================================
    // SEMIFINAL 2
    // JUARA B VS RUNNER-UP A
    // ==========================================

    if (
        result.groupBFirst &&
        result.groupASecond
    ) {

        console.log(
            "SEMIFINAL 2:",
            result.groupBFirst.name,
            "vs",
            result.groupASecond.name
        );

    }


    console.log(
        "================================="
    );

}
// =====================================================
// DATA PEMAIN
// =====================================================

const TEAM_PLAYERS = {
    "Mak Yem": [
        "Vio",
        "Viki",
        "Kinyong",
        "Japras",
        "Gilang",
        "Rama"
    ],

    "UD Sunan Jati": [
        "Harjito",
        "Purwanto",
        "Prastyo",
        "Galih",
        "Rizal",
        "Aspa"
    ],

    "Jibrat Klelet": [
        "Rendi",
        "Pudin",
        "Kocok",
        "Darmono",
        "Kijun",
        "Rudik",
        "Sugik"
    ],

    "Pule Ceria": [
        "Briyan",
        "Hildan",
        "Joni",
        "Bagus",
        "Fajar"
    ],

    "Samador": [
        "Anom Suroto",
        "Priyadi",
        "Nizam",
        "Fitra",
        "Sibro",
        "Rendi",
        "Satria"
    ],

    "Pak Wo": [
        "Ro'is",
        "Nanda",
        "Kaka",
        "Pak Wo",
        "Gio",
        "Renal",
        "Marsono"
    ],

    "Rembo": [
        "Sandi",
        "Anto",
        "Paoyan",
        "Alparo",
        "Argawa",
        "Jopino",
        "Edi Silus"
    ],

    "Lek Man": [
        "Lek Man",
        "Agung",
        "Endra",
        "Zaki",
        "Ipen",
        "Kampret",
        "Riyan"
    ],

    "Karang Taruna": [
        "Arjun",
        "Kholil",
        "Dani",
        "Syahdan",
        "Elsa",
        "Vino",
        "Fabian"
    ],

    "Pak Yo": [
        "Rio",
        "Rendi",
        "Tarmanto",
        "Wahyu",
        "Anggar",
        "Aril",
        "Ismanto"
    ]
};


// =====================================================
// RENDER DAFTAR TIM
// =====================================================

function renderTeams() {

    const teamsSection =
        document.querySelector("#tim");

    if (!teamsSection) {
        console.warn("Section #tim tidak ditemukan.");
        return;
    }

    let html = `

        <div class="section-title">

            <div>

                <span>
                    PESERTA
                </span>

                <h2>
                    Daftar Tim
                </h2>

            </div>

            <span class="trophy">
                🏐
            </span>

        </div>

        <div class="teams-groups">

            <!-- GRUP A -->

            <div class="team-group">

                <div class="group-title">
                    <span>GRUP A</span>
                </div>

                <div class="team-list">
    `;

    GROUP_A.forEach((team, index) => {

        const players =
            TEAM_PLAYERS[team] || [];

        html += `

            <div class="team-expand">

                <button
                    class="team-item"
                    type="button"
                    onclick="toggleTeam(this)"
                >

                    <span class="team-number">
                        ${index + 1}
                    </span>

                    <div class="team-logo">
                        🏐
                    </div>

                    <strong>
                        ${escapeHTML(team)}
                    </strong>

                    <span class="team-arrow">
                        ›
                    </span>

                </button>

                <div class="player-list">

                    <div class="player-title">
                        DAFTAR PEMAIN
                    </div>
        `;

        players.forEach((player, playerIndex) => {

            html += `

                <div class="player-item">

                    <span class="player-number">
                        ${String(playerIndex + 1).padStart(2, "0")}
                    </span>

                    <span>
                        ${escapeHTML(player)}
                    </span>

                </div>

            `;

        });

        html += `

                </div>

            </div>

        `;

    });

    html += `

                </div>

            </div>


            <!-- GRUP B -->

            <div class="team-group">

                <div class="group-title">
                    <span>GRUP B</span>
                </div>

                <div class="team-list">
    `;

    GROUP_B.forEach((team, index) => {

        const players =
            TEAM_PLAYERS[team] || [];

        html += `

            <div class="team-expand">

                <button
                    class="team-item"
                    type="button"
                    onclick="toggleTeam(this)"
                >

                    <span class="team-number">
                        ${index + 1}
                    </span>

                    <div class="team-logo">
                        🏐
                    </div>

                    <strong>
                        ${escapeHTML(team)}
                    </strong>

                    <span class="team-arrow">
                        ›
                    </span>

                </button>

                <div class="player-list">

                    <div class="player-title">
                        DAFTAR PEMAIN
                    </div>
        `;

        players.forEach((player, playerIndex) => {

            html += `

                <div class="player-item">

                    <span class="player-number">
                        ${String(playerIndex + 1).padStart(2, "0")}
                    </span>

                    <span>
                        ${escapeHTML(player)}
                    </span>

                </div>

            `;

        });

        html += `

                </div>

            </div>

        `;

    });

    html += `

                </div>

            </div>

        </div>

    `;

    teamsSection.innerHTML = html;
}


// =====================================================
// BUKA / TUTUP PEMAIN
// =====================================================

window.toggleTeam = function(button) {

    const parent =
        button.closest(".team-expand");

    if (!parent) {
        return;
    }

    const playerList =
        parent.querySelector(".player-list");

    const arrow =
        button.querySelector(".team-arrow");

    const isOpen =
        parent.classList.contains("open");

    // Tutup semua tim lain
    document
        .querySelectorAll(".team-expand.open")
        .forEach(team => {

            if (team !== parent) {

                team.classList.remove("open");

                const otherArrow =
                    team.querySelector(".team-arrow");

                if (otherArrow) {
                    otherArrow.textContent = "›";
                }

            }

        });

    if (isOpen) {

        parent.classList.remove("open");

        if (arrow) {
            arrow.textContent = "›";
        }

    } else {

        parent.classList.add("open");

        if (arrow) {
            arrow.textContent = "⌄";
        }

    }
}
// =====================================================
// LOAD SEMUA DATA
// =====================================================

function processMatches(snapshot) {

    const matches = [];


    snapshot.forEach(doc => {

        matches.push({

            id: doc.id,

            ...doc.data()

        });

    });


    console.log("=================================");
    console.log("DATA PERTANDINGAN");
    console.log("=================================");


    matches.forEach(match => {

        console.log(
            match.teamA,
            "vs",
            match.teamB,
            "|",
            match.scoreA,
            "-",
            match.scoreB
        );

    });


    console.log("Semua pertandingan:", matches);


    // ===============================
    // UPDATE WEBSITE
    // ===============================

    const nextMatch = getNextMatch(matches);


   renderHero(nextMatch);

renderSchedule(matches);

renderStandings(matches);

renderResults(matches);

renderTeams();

showQualification(matches);

}


// =====================================================
// REALTIME FIRESTORE
// =====================================================

const matchesRef = collection(db, "matches");


onSnapshot(

    matchesRef,

    snapshot => {

        console.log(
            "Firebase berhasil mengambil data pertandingan."
        );

        processMatches(snapshot);

    },

    error => {

        console.error(
            "Gagal mengambil data pertandingan:",
            error
        );


        if (heroCard) {

            heroCard.innerHTML = `

                <span class="label">
                    PERTANDINGAN
                </span>

                <div class="match-date">
                    GAGAL MEMUAT DATA
                </div>

                <div class="match-time">
                    ⚠️
                </div>

                <div class="location">
                    Periksa koneksi Firebase.
                </div>

            `;

        }

    }

);