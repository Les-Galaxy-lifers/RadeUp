
// Variable qui contiendra les données
let usersData = null;

function chargerUtilisateurs() {
    console.log("🔹 Tentative de chargement des utilisateurs...");

    // 1️⃣ Essayer localStorage
    const savedData = localStorage.getItem("usersData");
    if (savedData) {
        try {
            usersData = JSON.parse(savedData);
            console.log("✅ Données chargées depuis localStorage !");
            console.log("👥 Nombre de bénévoles :", usersData.bénévoles.length);
            console.table(usersData.bénévoles); // Affiche les bénévoles dans un joli tableau
            return usersData;
        } catch (err) {
            console.error("❌ Erreur en lisant localStorage :", err);
            // Si JSON invalide → repartir de la valeur initiale
        }
    }

    // 2️⃣ Sinon → données JS par défaut
    usersData = structuredClone(USERS_DATA_INITIAL);
    localStorage.setItem("usersData", JSON.stringify(usersData));
    console.log("✅ Données chargées depuis USERS_DATA_INITIAL !");
    console.log("👥 Nombre de bénévoles :", usersData.bénévoles.length);
    console.table(usersData.bénévoles); // Affiche les bénévoles dans un joli tableau
    return usersData;
}



// ===== AJOUT D'UN BÉNÉVOLE =====
function ajouterUtilisateur(firstName, lastName, email, password) {
    const nouvelId = usersData.bénévoles.length > 0
        ? Math.max(...usersData.bénévoles.map(b => b.id)) + 1
        : 1;

    const nouvelUtilisateur = {
        id: nouvelId,
        firstName,
        lastName,
        maidenName: "",
        age: null,
        gender: "",
        email,
        phone: "",
        bénévolename: email.split("@")[0],
        password,
        birthDate: "",
        image: "",
        role: "user",
        actions_id: []
    };

    usersData.bénévoles.push(nouvelUtilisateur);
    localStorage.setItem("usersData", JSON.stringify(usersData));

    return nouvelUtilisateur;
}

// ===== INITIALISATION =====
document.addEventListener("DOMContentLoaded", () => {
    chargerUtilisateurs();
});



// ===== DONNÉES INITIALES DIRECTEMENT DANS LE JS =====
const USERS_DATA_INITIAL = {
    "bénévoles": [
    {
      "id": 1,
      "firstName": "Emily",
      "lastName": "Johnson",
      "maidenName": "Smith",
      "age": 29,
      "gender": "female",
      "email": "emily.johnson@x.dummyjson.com",
      "phone": "+81 965-431-3024",
      "bénévolename": "emilys",
      "password": "emilyspass",
      "birthDate": "1996-5-30",
      "image": "https://dummyjson.com/icon/emilys/128",
      "role": "admin",
      "actions_id": [1, 3, 5, 7]
    },
    {
      "id": 2,
      "firstName": "Michael",
      "lastName": "Williams",
      "maidenName": "",
      "age": 36,
      "gender": "male",
      "email": "michael.williams@x.dummyjson.com",
      "phone": "+49 258-627-6644",
      "bénévolename": "michaelw",
      "password": "michaelwpass",
      "birthDate": "1989-8-10",
      "image": "https://dummyjson.com/icon/michaelw/128",
      "role": "bénévole",
      "actions_id": [2, 4, 6]
    },
    {
      "id": 3,
      "firstName": "Sophia",
      "lastName": "Brown",
      "maidenName": "",
      "age": 43,
      "gender": "female",
      "email": "sophia.brown@x.dummyjson.com",
      "phone": "+81 210-652-2785",
      "bénévolename": "sophiab",
      "password": "sophiabpass",
      "birthDate": "1982-11-6",
      "image": "https://dummyjson.com/icon/sophiab/128",
      "role": "bénévole",
      "actions_id": [1, 2, 8, 9]
    },
    {
      "id": 4,
      "firstName": "James",
      "lastName": "Davis",
      "maidenName": "",
      "age": 46,
      "gender": "male",
      "email": "james.davis@x.dummyjson.com",
      "phone": "+49 614-958-9364",
      "bénévolename": "jamesd",
      "password": "jamesdpass",
      "birthDate": "1979-5-4",
      "image": "https://dummyjson.com/icon/jamesd/128",
      "role": "bénévole",
      "actions_id": [3, 5, 6, 10]
    },
    {
      "id": 5,
      "firstName": "Emma",
      "lastName": "Miller",
      "maidenName": "Johnson",
      "age": 31,
      "gender": "female",
      "email": "emma.miller@x.dummyjson.com",
      "phone": "+91 759-776-1614",
      "bénévolename": "emmaj",
      "password": "emmajpass",
      "birthDate": "1994-6-13",
      "image": "https://dummyjson.com/icon/emmaj/128",
      "role": "bénévole",
      "actions_id": [1, 4, 7, 8, 9]
    },
    {
      "id": 6,
      "firstName": "Olivia",
      "lastName": "Wilson",
      "maidenName": "",
      "age": 23,
      "gender": "female",
      "email": "olivia.wilson@x.dummyjson.com",
      "phone": "+91 607-295-6448",
      "bénévolename": "oliviaw",
      "password": "oliviawpass",
      "birthDate": "2002-4-20",
      "image": "https://dummyjson.com/icon/oliviaw/128",
      "role": "bénévole",
      "actions_id": [2, 3, 6, 9]
    },
    {
      "id": 7,
      "firstName": "Alexander",
      "lastName": "Jones",
      "maidenName": "",
      "age": 39,
      "gender": "male",
      "email": "alexander.jones@x.dummyjson.com",
      "phone": "+61 260-824-4986",
      "bénévolename": "alexanderj",
      "password": "alexanderjpass",
      "birthDate": "1986-10-20",
      "image": "https://dummyjson.com/icon/alexanderj/128",
      "role": "bénévole",
      "actions_id": [1, 5, 7, 10]
    },
    {
      "id": 8,
      "firstName": "Ava",
      "lastName": "Taylor",
      "maidenName": "",
      "age": 28,
      "gender": "female",
      "email": "ava.taylor@x.dummyjson.com",
      "phone": "+1 458-853-7877",
      "bénévolename": "avat",
      "password": "avatpass",
      "birthDate": "1997-8-25",
      "image": "https://dummyjson.com/icon/avat/128",
      "role": "bénévole",
      "actions_id": [3, 4, 8]
    },
    {
      "id": 9,
      "firstName": "Ethan",
      "lastName": "Martinez",
      "maidenName": "",
      "age": 34,
      "gender": "male",
      "email": "ethan.martinez@x.dummyjson.com",
      "phone": "+92 933-608-5081",
      "bénévolename": "ethanm",
      "password": "ethanmpass",
      "birthDate": "1991-2-12",
      "image": "https://dummyjson.com/icon/ethanm/128",
      "role": "bénévole",
      "actions_id": [2, 5, 6, 9]
    },
    {
      "id": 10,
      "firstName": "Isabella",
      "lastName": "Anderson",
      "maidenName": "Davis",
      "age": 32,
      "gender": "female",
      "email": "isabella.anderson@x.dummyjson.com",
      "phone": "+49 770-658-4885",
      "bénévolename": "isabellad",
      "password": "isabelladpass",
      "birthDate": "1993-6-10",
      "image": "https://dummyjson.com/icon/isabellad/128",
      "role": "bénévole",
      "actions_id": [1, 4, 7, 8, 10]
    },
    {
      "id": 11,
      "firstName": "Liam",
      "lastName": "Garcia",
      "maidenName": "",
      "age": 30,
      "gender": "male",
      "email": "liam.garcia@x.dummyjson.com",
      "phone": "+92 870-217-6201",
      "bénévolename": "liamg",
      "password": "liamgpass",
      "birthDate": "1995-6-6",
      "image": "https://dummyjson.com/icon/liamg/128",
      "role": "bénévole",
      "actions_id": [3, 5, 9]
    },
    {
      "id": 12,
      "firstName": "Mia",
      "lastName": "Rodriguez",
      "maidenName": "",
      "age": 25,
      "gender": "female",
      "email": "mia.rodriguez@x.dummyjson.com",
      "phone": "+49 989-461-8403",
      "bénévolename": "miar",
      "password": "miarpass",
      "birthDate": "2000-8-4",
      "image": "https://dummyjson.com/icon/miar/128",
      "role": "bénévole",
      "actions_id": [1, 2, 6, 10]
    },
    {
      "id": 13,
      "firstName": "Noah",
      "lastName": "Hernandez",
      "maidenName": "",
      "age": 41,
      "gender": "male",
      "email": "noah.hernandez@x.dummyjson.com",
      "phone": "+49 393-605-6968",
      "bénévolename": "noahh",
      "password": "noahhpass",
      "birthDate": "1984-6-5",
      "image": "https://dummyjson.com/icon/noahh/128",
      "role": "bénévole",
      "actions_id": [4, 7, 8]
    },
    {
      "id": 14,
      "firstName": "Charlotte",
      "lastName": "Lopez",
      "maidenName": "Martinez",
      "age": 37,
      "gender": "female",
      "email": "charlotte.lopez@x.dummyjson.com",
      "phone": "+44 373-953-5028",
      "bénévolename": "charlottem",
      "password": "charlottempass",
      "birthDate": "1988-6-8",
      "image": "https://dummyjson.com/icon/charlottem/128",
      "role": "bénévole",
      "actions_id": [1, 3, 6, 9]
    },
    {
      "id": 15,
      "firstName": "William",
      "lastName": "Gonzalez",
      "maidenName": "",
      "age": 33,
      "gender": "male",
      "email": "william.gonzalez@x.dummyjson.com",
      "phone": "+81 905-252-7319",
      "bénévolename": "williamg",
      "password": "williamgpass",
      "birthDate": "1992-3-27",
      "image": "https://dummyjson.com/icon/williamg/128",
      "role": "bénévole",
      "actions_id": [2, 4, 5, 7, 10]
    },
    {
      "id": 16,
      "firstName": "Avery",
      "lastName": "Perez",
      "maidenName": "",
      "age": 26,
      "gender": "female",
      "email": "avery.perez@x.dummyjson.com",
      "phone": "+61 731-431-3457",
      "bénévolename": "averyp",
      "password": "averyppass",
      "birthDate": "1999-3-10",
      "image": "https://dummyjson.com/icon/averyp/128",
      "role": "bénévole",
      "actions_id": [3, 6, 8]
    },
    {
      "id": 17,
      "firstName": "Evelyn",
      "lastName": "Sanchez",
      "maidenName": "",
      "age": 38,
      "gender": "female",
      "email": "evelyn.sanchez@x.dummyjson.com",
      "phone": "+1 623-880-6871",
      "bénévolename": "evelyns",
      "password": "evelynspass",
      "birthDate": "1987-10-13",
      "image": "https://dummyjson.com/icon/evelyns/128",
      "role": "bénévole",
      "actions_id": [1, 2, 5, 9]
    },
    {
      "id": 18,
      "firstName": "Logan",
      "lastName": "Torres",
      "maidenName": "",
      "age": 32,
      "gender": "male",
      "email": "logan.torres@x.dummyjson.com",
      "phone": "+81 507-434-8733",
      "bénévolename": "logant",
      "password": "logantpass",
      "birthDate": "1993-10-26",
      "image": "https://dummyjson.com/icon/logant/128",
      "role": "bénévole",
      "actions_id": [4, 6, 7, 10]
    },
    {
      "id": 19,
      "firstName": "Abigail",
      "lastName": "Rivera",
      "maidenName": "",
      "age": 29,
      "gender": "female",
      "email": "abigail.rivera@x.dummyjson.com",
      "phone": "+91 228-363-7806",
      "bénévolename": "abigailr",
      "password": "abigailrpass",
      "birthDate": "1996-10-11",
      "image": "https://dummyjson.com/icon/abigailr/128",
      "role": "bénévole",
      "actions_id": [1, 3, 8, 9]
    },
    {
      "id": 20,
      "firstName": "Jackson",
      "lastName": "Evans",
      "maidenName": "",
      "age": 35,
      "gender": "male",
      "email": "jackson.evans@x.dummyjson.com",
      "phone": "+44 468-628-6686",
      "bénévolename": "jacksone",
      "password": "jacksonepass",
      "birthDate": "1990-11-30",
      "image": "https://dummyjson.com/icon/jacksone/128",
      "role": "bénévole",
      "actions_id": [2, 4, 5, 7]
    },
    {
      "id": 21,
      "firstName": "Madison",
      "lastName": "Collins",
      "maidenName": "",
      "age": 27,
      "gender": "female",
      "email": "madison.collins@x.dummyjson.com",
      "phone": "+81 259-957-5711",
      "bénévolename": "madisonc",
      "password": "madisoncpass",
      "birthDate": "1998-3-7",
      "image": "https://dummyjson.com/icon/madisonc/128",
      "role": "bénévole",
      "actions_id": [1, 6, 8]
    },
    {
      "id": 22,
      "firstName": "Elijah",
      "lastName": "Stewart",
      "maidenName": "",
      "age": 34,
      "gender": "male",
      "email": "elijah.stewart@x.dummyjson.com",
      "phone": "+44 468-357-7872",
      "bénévolename": "elijahs",
      "password": "elijahspass",
      "birthDate": "1991-10-22",
      "image": "https://dummyjson.com/icon/elijahs/128",
      "role": "bénévole",
      "actions_id": [2, 3, 5, 9]
    },
    {
      "id": 23,
      "firstName": "Chloe",
      "lastName": "Morales",
      "maidenName": "",
      "age": 40,
      "gender": "female",
      "email": "chloe.morales@x.dummyjson.com",
      "phone": "+92 468-541-7133",
      "bénévolename": "chloem",
      "password": "chloempass",
      "birthDate": "1985-4-21",
      "image": "https://dummyjson.com/icon/chloem/128",
      "role": "bénévole",
      "actions_id": [1, 4, 7, 10]
    },
    {
      "id": 24,
      "firstName": "Mateo",
      "lastName": "Nguyen",
      "maidenName": "",
      "age": 31,
      "gender": "male",
      "email": "mateo.nguyen@x.dummyjson.com",
      "phone": "+1 341-597-6694",
      "bénévolename": "mateon",
      "password": "mateonpass",
      "birthDate": "1994-6-2",
      "image": "https://dummyjson.com/icon/mateon/128",
      "role": "bénévole",
      "actions_id": [3, 6, 8, 9]
    },
    {
      "id": 25,
      "firstName": "Harper",
      "lastName": "Kelly",
      "maidenName": "Evans",
      "age": 28,
      "gender": "female",
      "email": "harper.kelly@x.dummyjson.com",
      "phone": "+92 518-863-2863",
      "bénévolename": "harpere",
      "password": "harperepass",
      "birthDate": "1997-3-3",
      "image": "https://dummyjson.com/icon/harpere/128",
      "role": "bénévole",
      "actions_id": [1, 2, 7, 10]
    },
    {
      "id": 26,
      "firstName": "Evelyn",
      "lastName": "Gonzalez",
      "maidenName": "",
      "age": 36,
      "gender": "female",
      "email": "evelyn.gonzalez@x.dummyjson.com",
      "phone": "+61 708-508-4638",
      "bénévolename": "evelyng",
      "password": "evelyngpass",
      "birthDate": "1989-2-5",
      "image": "https://dummyjson.com/icon/evelyng/128",
      "role": "bénévole",
      "actions_id": [3, 4, 6, 9]
    },
    {
      "id": 27,
      "firstName": "Daniel",
      "lastName": "Cook",
      "maidenName": "",
      "age": 42,
      "gender": "male",
      "email": "daniel.cook@x.dummyjson.com",
      "phone": "+44 254-761-6843",
      "bénévolename": "danielc",
      "password": "danielcpass",
      "birthDate": "1983-12-25",
      "image": "https://dummyjson.com/icon/danielc/128",
      "role": "bénévole",
      "actions_id": [2, 5, 7, 8]
    },
    {
      "id": 28,
      "firstName": "Lily",
      "lastName": "Lee",
      "maidenName": "Brown",
      "age": 30,
      "gender": "female",
      "email": "lily.lee@x.dummyjson.com",
      "phone": "+1 808-757-9867",
      "bénévolename": "lilyb",
      "password": "lilybpass",
      "birthDate": "1995-12-3",
      "image": "https://dummyjson.com/icon/lilyb/128",
      "role": "bénévole",
      "actions_id": [1, 3, 6]
    },
    {
      "id": 29,
      "firstName": "Henry",
      "lastName": "Hill",
      "maidenName": "",
      "age": 39,
      "gender": "male",
      "email": "henry.hill@x.dummyjson.com",
      "phone": "+1 240-833-4680",
      "bénévolename": "henryh",
      "password": "henryhpass",
      "birthDate": "1986-8-19",
      "image": "https://dummyjson.com/icon/henryh/128",
      "role": "bénévole",
      "actions_id": [2, 4, 8, 10]
    },
    {
      "id": 30,
      "firstName": "Addison",
      "lastName": "Wright",
      "maidenName": "",
      "age": 33,
      "gender": "female",
      "email": "addison.wright@x.dummyjson.com",
      "phone": "+1 514-384-3300",
      "bénévolename": "addisonw",
      "password": "addisonwpass",
      "birthDate": "1992-1-3",
      "image": "https://dummyjson.com/icon/addisonw/128",
      "role": "bénévole",
      "actions_id": [1, 5, 7, 9]
    }
  ]
};