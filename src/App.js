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

  const nowDate = Date.now();

  useEffect(() => {
    nacteniDB();
  }, [])

  const nacteniDB = () => {
    nacteniTicketu()
      .then(data => {
        setTickets(data)
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  const dateToText = (miliseconds) => {
    const date = new Date(miliseconds);
    const formatedDate = date.toLocaleString()
    return formatedDate;
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
      }, 5000);
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

  return (
    <div>
      <div className="">
        <input onChange={(event) => { setSearchBoxText(event.target.value) }} type="text" name="" id="" /> {selectedTicket}
      </div>
      <div>
        Aktuální vstupenky:
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
                <div className="ticket ticket-date">{dateToText(ticket.date)}
                <button className='btn btn-positive' onClick={(event) => { validateTicket(ticket._id, event) }}>vyzvednout</button>
                </div>
                {selectedTicket == ticket._id &&
                  <div className="ticket-edit-row">
                    <textarea onClick={(event) => { event.stopPropagation() }} defaultValue={notes} onChange={(event) => { setNewNotes(event.target.value) }} name="" id="" cols="30" rows="3"></textarea>
                  </div>
                }
                {selectedTicket == ticket._id &&
                  <div className="ticket-edit-row ticket-controls">
                    {!isSaving && !saveSuccess && <button onClick={() => { saveNotes(ticket._id, newNotes) }}>uložit</button>}
                    {isSaving && <p>ukládání...</p>}
                    {saveSuccess && <p>uloženo</p>}
                    {saveSuccess === false && <p>chyba při ukládání: {errorMessage}</p>}
                  </div>
                }
              </div>
            ))
        }
      </div>
      <div>
        Vyzvednuté vstupenky:
        <div className="ticket-row ticket-header">
          <div className="ticket ticket-nr">číslo vstupenky</div>
          <div className="ticket ticket-email">e-mail</div>
          <div className="ticket ticket-date">datum expirace</div>
        </div>
        {
          tickets
            .filter(ticket => ticket.date > 1790000000000 && ticket.email.includes(searchBoxText))
            .map((ticket, index) => (
              <div className="ticket-row" key={index} onClick={() => { editToggle(index, ticket) }}>
              <div className="ticket ticket-nr">{ticket.ticket}</div>
                <div className="ticket ticket-email">{ticket.email}</div>
                <div className="ticket ticket-date">{dateToText(ticket.date)}
                  <button className='btn btn-negative' onClick={(event) => { deleteTicket(ticket._id, event) }}>odstranit</button>
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
      Expirované vstupenky:
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
              <div className="ticket ticket-date">{dateToText(ticket.date)}
                <button className='btn btn-positive' onClick={(event) => { validateTicket(ticket._id, event) }}>vyzvednout</button>
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
  )
}

export default App;