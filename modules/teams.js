// =====================================================
// DATA TIM BANGGLE VOLLEY CUP 2026
// =====================================================

export const GROUP_A = [
    "Mak Yem",
    "UD Sunan Jati",
    "Jibrat Klelet",
    "Pule Ceria",
    "Samador"
];

export const GROUP_B = [
    "Pak Wo",
    "Rembo",
    "Lek Man",
    "Karang Taruna",
    "Pak Yo"
];

export const ALL_TEAMS = [
    ...GROUP_A,
    ...GROUP_B
];

export function getTeamGroup(teamName) {

    if (GROUP_A.includes(teamName)) {
        return "A";
    }

    if (GROUP_B.includes(teamName)) {
        return "B";
    }

    return null;
}