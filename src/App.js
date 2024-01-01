import React, { useState, useEffect } from 'react'
import { nacteniTicketu, updateNotes, finishTicket } from './components/api';
import './App.css';

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [searchBoxText, setSearchBoxText] = useState("");
  const [selectedTicket, setSelectedTicket] = useState();
  const [notes, setNotes] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');

  const nowDate = Date.now();

  useEffect(() => {
    nacteniDB();
  }, [])

  const zobrazitDatum = (timestamp) => {
    var datum = new Date(timestamp);
    return datum.toLocaleDateString('cs-CZ'); // pro české formátování
  }

  const nacteniDB = async () => {
    try {
      const data = await nacteniTicketu(localStorage.getItem('password') );
      setTickets(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const saveNotes = async (id, notes, event) => {
    event.stopPropagation();
    setIsSaving(true);
    setSaveSuccess(null);
    setErrorMessage('');

    try {
      await updateNotes(id, notes);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(null);
      }, 2000);
    } catch (error) {
      setSaveSuccess(false);
      setErrorMessage(error.message);
    } finally {
      nacteniDB();
      setIsSaving(false);
    }
  }

  const validateTicket = async (id, event) => {
    event.stopPropagation();
    try {
      await finishTicket(id, 1800000000000);
    } catch (error) {
      console.log(error);
    } finally {
      setSelectedTicket();
      nacteniDB();
    }
  }

  const reBookTicket = async (id, event) => {
    event.stopPropagation();

    var datum = new Date();
    datum.setDate(datum.getDate() + 5); // přidání 5 dní
    datum.setHours(23, 59, 0, 0); // nastavení na půlnoc
    const expireDate = datum.getTime();

    try {
      await finishTicket(id, expireDate);
    } catch (error) {
      console.log(error);
    } finally {
      setSelectedTicket();
      nacteniDB();
    }
  }

  const deleteTicket = async (id, event) => {
    event.stopPropagation();
    try {
      await finishTicket(id, 18000000);
    } catch (error) {
      console.log(error);
    } finally {
      setSelectedTicket();
      nacteniDB();
    }
  }

  const editToggle = (index, ticket) => {
    if (selectedTicket == ticket._id) {
      setSelectedTicket();
    } else {
      setSelectedTicket(ticket._id);
      setNewNotes(ticket.notes)
      setNotes(ticket.notes);
    }
  }

  const checkDuplicates = () => {
    const activeTickets = tickets.filter(ticket => ticket.date > nowDate);
    const ticketCounts = {};
    const duplicates = [];

    for (const item of activeTickets) {
      if (ticketCounts[item.ticket]) {
        // Pokud ticket už existuje, znamená to, že jsme našli duplikát
        if (ticketCounts[item.ticket] === 1) {
          // Přidáme ticket do pole duplikátů pouze při prvním nalezení duplikátu
          duplicates.push(item.ticket);
        }
        ticketCounts[item.ticket] += 1;
      } else {
        ticketCounts[item.ticket] = 1; // Nastavíme počet na 1 pro každý nový ticket
      }
    }
    return duplicates;
  }

  const isAuthenticated = () => {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  const logOut = () => {
    localStorage.removeItem('password');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('password', password);
   // loginAdmin(password);
    window.location.reload();
  };

  if (tickets.length == 0) {
    return (
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Heslo"
        />
        <button type="submit">Přihlásit se</button>
      </form>
    );
  } else {
   return (
    <div className='container'>
      <h1>Rezervace ples FNOL</h1>
      <div className="toolbar">
        <div>
          Filtr e-mailů: <input onChange={(event) => { setSearchBoxText(event.target.value) }} type="text" name="" id="" />
        </div>
        <div>
          <a href="http://www.plesfnol.cz/rezervace" target='blank'>Přejít na rezervace</a>
          <a onClick={logOut} href="">Odhlásit se</a>
        </div>
      </div>

      {(checkDuplicates().length != 0) && <div className='warning'>Varování! Nalezeny duplikáty: {checkDuplicates().join(", ")}</div>}

      <div className='tickets-section'>
        <h3>Platné rezervace</h3>
        <div className="ticket-row ticket-header">
          <div className="ticket ticket-nr">číslo vstupenky</div>
          <div className="ticket ticket-email">e-mail</div>
          <div className="ticket ticket-date">datum expirace</div>
        </div>
        {
          tickets
            .filter(ticket => ticket.date > nowDate && ticket.date < 1790000000000 && ticket.email.includes(searchBoxText))
            .map((ticket, index) => (
              <div className="ticket-row" key={index} onClick={() => { editToggle(index, ticket) }}>
                <div className="ticket ticket-nr">{ticket.ticket}</div>
                <div className="ticket ticket-email">{ticket.email}</div>
                <div className="ticket ticket-date">{zobrazitDatum(ticket.date)}
                  <div className="ticket-btn">
                    <button className='btn btn-neutral' onClick={(event) => { reBookTicket(ticket._id, event) }}>prodloužit</button>
                    <button className='btn btn-positive' onClick={(event) => { validateTicket(ticket._id, event) }}>vyzvednout</button>
                  </div>
                </div>
                {selectedTicket == ticket._id &&
                  <div className="ticket-edit-row">
                    <textarea onClick={(event) => { event.stopPropagation() }} defaultValue={notes} onChange={(event) => { setNewNotes(event.target.value) }} name="" id="" cols="30" rows="3"></textarea>
                  </div>
                }
                {selectedTicket == ticket._id &&
                  <div className="ticket-edit-row ticket-controls">
                    {!isSaving && !saveSuccess && <button onClick={(event) => { saveNotes(ticket._id, newNotes, event) }}>uložit</button>}
                    {isSaving && <p>ukládání...</p>}
                    {saveSuccess && <p>uloženo</p>}
                    {saveSuccess === false && <p>chyba při ukládání: {errorMessage}</p>}
                  </div>
                }
              </div>
            ))
        }
      </div>
      <div className='tickets-section'>
        <h3>
          Vyzvednuté rezervace</h3>
        <div className="ticket-row ticket-header">
          <div className="ticket ticket-nr">číslo vstupenky</div>
          <div className="ticket ticket-email">e-mail</div>
          <div className="ticket ticket-date"></div>
        </div>
        {
          tickets
            .filter(ticket => ticket.date > 1790000000000 && ticket.email.includes(searchBoxText))
            .map((ticket, index) => (
              <div className="ticket-row" key={index} onClick={() => { editToggle(index, ticket) }}>
                <div className="ticket ticket-nr">{ticket.ticket}</div>
                <div className="ticket ticket-email">{ticket.email}</div>
                <div className="ticket ticket-date">
                  &nbsp;
                  <div className="ticket-btn">
                    <button className='btn btn-neutral' onClick={(event) => { reBookTicket(ticket._id, event) }}>zpět rezervovat</button>
                    <button className='btn btn-negative' onClick={(event) => { deleteTicket(ticket._id, event) }}>odstranit</button>
                  </div>
                </div>
                {selectedTicket == ticket._id &&
                  <div className="ticket-edit-row">
                    <textarea onClick={(event) => { event.stopPropagation() }} defaultValue={notes} onChange={(event) => { setNewNotes(event.target.value) }} name="" id="" cols="30" rows="3"></textarea>
                  </div>
                }
                {selectedTicket == ticket._id &&
                  <div className="ticket-edit-row ticket-controls">
                    {!isSaving && !saveSuccess && <button className='btn' onClick={(event) => { saveNotes(ticket._id, newNotes, event) }}>uložit</button>}
                    {isSaving && <p>ukládání...</p>}
                    {saveSuccess && <p>uloženo</p>}
                    {saveSuccess === false && <p>chyba při ukládání: {errorMessage}</p>}
                  </div>
                }
              </div>
            ))
        }
      </div>
      <div className="tickets-section">
        <h3>
          Expirované rezervace</h3>
        <div className="ticket-row ticket-header">
          <div className="ticket ticket-nr">číslo vstupenky</div>
          <div className="ticket ticket-email">e-mail</div>
          <div className="ticket ticket-date">datum expirace</div>
        </div>
        {
          tickets
            .filter(ticket => ticket.date < nowDate && ticket.email.includes(searchBoxText))
            .map((ticket, index) => (
              <div className="ticket-row" key={index} onClick={() => { editToggle(index, ticket) }}>
                <div className="ticket ticket-nr">{ticket.ticket}</div>
                <div className="ticket ticket-email">{ticket.email}</div>
                <div className="ticket ticket-date">{(ticket.date != 18000000) && zobrazitDatum(ticket.date)}
                </div>
                {selectedTicket == ticket._id &&
                  <div className="ticket-edit-row">
                    <textarea onClick={(event) => { event.stopPropagation() }} defaultValue={notes} onChange={(event) => { setNewNotes(event.target.value) }} name="" id="" cols="30" rows="3"></textarea>
                  </div>
                }
                {selectedTicket == ticket._id &&
                  <div className="ticket-edit-row ticket-controls">
                    {!isSaving && !saveSuccess && <button onClick={(event) => { saveNotes(ticket._id, newNotes, event) }}>uložit</button>}
                    {isSaving && <p>ukládání...</p>}
                    {saveSuccess && <p>uloženo</p>}
                    {saveSuccess === false && <p>chyba při ukládání: {errorMessage}</p>}
                  </div>
                }
              </div>
            ))
        }
      </div>
    </div>
  )}
}

export default App;