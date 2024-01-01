export const nacteniTicketu = async (password) => {
    try {
        const username = 'admin'; // Uživatelské jméno pro autentizaci
        const base64Credentials = btoa(username + ':' + password); // Zakódování uživatelského jména a hesla do base64

        const response = await fetch(process.env.REACT_APP_BACKEND + '/get-tickets-admin', {
            headers: {
                // Přidání základní autentizační hlavičky
                'Authorization': 'Basic ' + base64Credentials
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.documents;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export const updateNotes = async (id, notes) => {
    const url = process.env.REACT_APP_BACKEND + `/save-ticket/${id}`;

    const username = 'admin'; // Uživatelské jméno pro autentizaci
    const base64Credentials = btoa(username + ':' + localStorage.getItem('password')); // Zakódování uživatelského jména a hesla do base64

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify({
                ["notes"]: notes
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64Credentials
            },
        })

        const data = await response.json();
        console.log(data);

    } catch (err) {
        console.log("error: ", err)
        throw err;
    }
}

export const finishTicket = async (id, time) => {
    const url = process.env.REACT_APP_BACKEND + `/save-ticket/${id}`;

    const username = 'admin'; // Uživatelské jméno pro autentizaci
    const base64Credentials = btoa(username + ':' + localStorage.getItem('password')); // Zakódování uživatelského jména a hesla do base64

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify({
                ["date"]: time
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64Credentials
            },
        })

        const data = await response.json();
        console.log(data);

    } catch (err) {
        console.log("error: ", err)
    }
}