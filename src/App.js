import React, { useState, useEffect } from 'react'
import { nacteniTicketu } from './components/api';

const App = () => {

  const [tickets, setTickets] = useState([]);
  const nowDate = Date.now();

  useEffect(() => {
    nacteniTicketu()
    .then(data => {
        setTickets(data)
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
}, [])

const dateToText = (miliseconds) => { 
  const date = new Date(miliseconds);
  const formatedDate = date.toLocaleString()
  return formatedDate;
 }

  return (
    <div>Aktuální vstupenky: 
      <div>
      {
  tickets
    .filter(ticket => ticket.date > nowDate)
    .map((ticket, index) => (
      <div key={index}>Číslo vstupenky: {ticket.ticket}, email: {ticket.email}, datum: {dateToText(ticket.date)}</div>
    ))
}
    </div>
    Expirované vstupenky:
    {
  tickets
    .filter(ticket => ticket.date < nowDate)
    .map((ticket, index) => (
      <div key={index}>Číslo vstupenky: {ticket.ticket}, email: {ticket.email}, datum: {dateToText(ticket.date)}</div>
    ))
}
      </div>
  )
}

export default App;