export const nacteniTicketu = async (password) => {
    try {
        const username = 'admin'; // Uživatelské jméno pro autentizaci

        // Zakódování uživatelského jména a hesla do base64
        const base64Credentials = btoa(username + ':' + password);

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

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify({
                ["notes"]: notes
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
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

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify({
                ["date"]: time
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })

        const data = await response.json();
        console.log(data);

    } catch (err) {
        console.log("error: ", err)
    }
}