export const vlozeniTicketu = async (ticket, email) => {
    const date = new Date()
    const expireDate = new Date(date);
    expireDate.setDate(date.getDate() + 1);

    try {
        const response = await fetch(process.env.REACT_APP_BACKEND + "/save-ticket", {
            method: "post",
            headers: {
                "Accept": "application/json",
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                ticket: ticket,
                email: email,
                notes: "",
                date: expireDate
            })
        })
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export const nahraniObjednavky = async (vybrane, email) => {
    // TODO2 získat klíč z databáze
    if (vybrane.length > 0) {
        const obsazene = await nacteniTicketu()
        console.log(obsazene);
        console.log(vybrane);

        let isTicketTaken = false;

        obsazene.forEach(obsazenyTicket => {
            if (vybrane.includes(obsazenyTicket)) {
                console.log("obsazeny ticket");
                console.log(obsazenyTicket);
                isTicketTaken = isTicketTaken || true
            }
        });

        if (isTicketTaken) {
            return 2;
        } else {
            vybrane.forEach(ticket => {
                vlozeniTicketu(ticket, email)
            });
            console.log("vráceno return 1");
            return 1;
        }
    }
    // TODO2 vrátit klíč databázi
}

export const nacteniTicketu = async () => {
    try {
        const response = await fetch(process.env.REACT_APP_BACKEND + '/get-tickets-admin')
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
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