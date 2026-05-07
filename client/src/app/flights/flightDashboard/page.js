"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [airlines, setAirlines] = useState([]);
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [aircrafts, setAircrafts] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  // Airline Form
  const [airlineForm, setAirlineForm] = useState({
    name: "",
    code: "",
    country: "",
    status: "active",
    logo: "",
    contact: { supportEmail: "", supportPhone: "", address: "", website: "" },
  });

  // Aircraft Form
  const [aircraftForm, setAircraftForm] = useState({
    name: "",
    code: "",
    totalSeats: 0,
    status: "active",
  });

  // Flight Form
  const [flightForm, setFlightForm] = useState({
    name: "",
    code: "",
    source: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    status: "scheduled",
  });

  // API endpoints
  const API = {
    airlines: "http://localhost:8000/api/v1/airline/get-allAirlines",
    airline: (id) => `/api/airlines/${id}`,
    aircraftsByAirline: (airlineId) => `/api/airlines/${airlineId}/aircrafts`,
    aircraft: (id) => `/api/aircrafts/${id}`,
    flightsByAircraft: (aircraftId) => `/api/aircrafts/${aircraftId}/flights`,
    flight: (id) => `/api/flights/${id}`,
  };

  // Fetch all airlines
  const fetchAirlines = async () => {
    try {
      const res = await axios.get(API.airlines);
      setAirlines(res.data.allAirlines || []);
    } catch (err) {
      console.error("Error fetching airlines:", err.message);
    }
  };

  useEffect(() => {
    fetchAirlines();
  }, []);

  // Fetch aircrafts for selected airline
  useEffect(() => {
    if (!selectedAirline) return;
    const fetchAircrafts = async () => {
      try {
        const res = await axios.get(API.aircraftsByAirline(selectedAirline._id));
        setAircrafts(res.data.aircrafts || []);
      } catch (err) {
        console.error("Error fetching aircrafts:", err.message);
      }
    };
    fetchAircrafts();
    setSelectedAircraft(null);
  }, [selectedAirline]);

  // // Fetch flights for selected aircraft
  // useEffect(() => {
  //   if (!selectedAircraft) return;
  //   const fetchFlights = async () => {
  //     try {
  //       const res = await axios.get(API.flightsByAircraft(selectedAircraft._id));
  //       setFlights(res.data.flights || []);
  //     } catch (err) {
  //       console.error("Error fetching flights:", err.message);
  //     }
  //   };
  //   fetchFlights();
  // }, [selectedAircraft]);

  // --- Handlers ---

  // Airline CRUD
  const handleAirlineSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedAirline) {
        await axios.put(API.airline(selectedAirline._id), airlineForm);
      } else {
        await axios.post(API.airlines, airlineForm);
      }
      fetchAirlines();
      setSelectedAirline(null);
      setAirlineForm({
        name: "",
        code: "",
        country: "",
        status: "active",
        logo: "",
        contact: { supportEmail: "", supportPhone: "", address: "", website: "" },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAirlineDelete = async (id) => {
    if (!confirm("Delete this airline?")) return;
    setLoading(true);
    try {
      await axios.delete(API.airline(id));
      fetchAirlines();
      setSelectedAirline(null);
      setAircrafts([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Aircraft CRUD
  const handleAircraftSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAirline) return alert("Select airline first");
    setLoading(true);
    try {
      if (selectedAircraft) {
        await axios.put(API.aircraft(selectedAircraft._id), aircraftForm);
      } else {
        await axios.post(API.aircraftsByAirline(selectedAirline._id), aircraftForm);
      }
      const res = await axios.get(API.aircraftsByAirline(selectedAirline._id));
      setAircrafts(res.data.aircrafts || []);
      setSelectedAircraft(null);
      setAircraftForm({ name: "", code: "", totalSeats: 0, status: "active" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAircraftDelete = async (id) => {
    if (!confirm("Delete this aircraft?")) return;
    setLoading(true);
    try {
      await axios.delete(API.aircraft(id));
      const res = await axios.get(API.aircraftsByAirline(selectedAirline._id));
      setAircrafts(res.data.aircrafts || []);
      setSelectedAircraft(null);
      setFlights([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Flight CRUD
  const handleFlightSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAircraft) return alert("Select aircraft first");
    setLoading(true);
    try {
      if (flightForm._id) {
        await axios.put(API.flight(flightForm._id), flightForm);
      } else {
        await axios.post(API.flightsByAircraft(selectedAircraft._id), flightForm);
      }
      const res = await axios.get(API.flightsByAircraft(selectedAircraft._id));
      setFlights(res.data.flights || []);
      setFlightForm({ name: "", code: "", source: "", destination: "", departureTime: "", arrivalTime: "", status: "scheduled" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlightDelete = async (id) => {
    if (!confirm("Delete this flight?")) return;
    setLoading(true);
    try {
      await axios.delete(API.flight(id));
      const res = await axios.get(API.flightsByAircraft(selectedAircraft._id));
      setFlights(res.data.flights || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      {/* Airlines Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{selectedAirline ? "Update Airline" : "Create Airline"}</h2>
        <form className="flex flex-col gap-2 mb-4" onSubmit={handleAirlineSubmit}>
          <input className="p-2 border rounded" placeholder="Name" value={airlineForm.name} onChange={e => setAirlineForm({ ...airlineForm, name: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Code" value={airlineForm.code} onChange={e => setAirlineForm({ ...airlineForm, code: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Country" value={airlineForm.country} onChange={e => setAirlineForm({ ...airlineForm, country: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Logo URL" value={airlineForm.logo} onChange={e => setAirlineForm({ ...airlineForm, logo: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Support Email" value={airlineForm.contact.supportEmail} onChange={e => setAirlineForm({ ...airlineForm, contact: { ...airlineForm.contact, supportEmail: e.target.value } })} />
          <input className="p-2 border rounded" placeholder="Support Phone" value={airlineForm.contact.supportPhone} onChange={e => setAirlineForm({ ...airlineForm, contact: { ...airlineForm.contact, supportPhone: e.target.value } })} />
          <input className="p-2 border rounded" placeholder="Address" value={airlineForm.contact.address} onChange={e => setAirlineForm({ ...airlineForm, contact: { ...airlineForm.contact, address: e.target.value } })} />
          <input className="p-2 border rounded" placeholder="Website" value={airlineForm.contact.website} onChange={e => setAirlineForm({ ...airlineForm, contact: { ...airlineForm.contact, website: e.target.value } })} />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{selectedAirline ? "Update" : "Create"}</button>
            {selectedAirline && <button type="button" onClick={() => { setSelectedAirline(null); setAirlineForm({ name:"", code:"", country:"", status:"active", logo:"", contact:{ supportEmail:"", supportPhone:"", address:"", website:"" } }) }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {airlines.map(a => (
            <div key={a._id} className="p-4 border rounded cursor-pointer" onClick={() => { setSelectedAirline(a); setAirlineForm({ ...a }); }}>
              <h3 className="font-bold">{a.name} ({a.code})</h3>
              <p>Country: {a.country}</p>
              <p>Email: {a.contact?.supportEmail}</p>
              <p>Phone: {a.contact?.supportPhone}</p>
              <button className="mt-2 bg-red-500 text-white px-2 py-1 rounded" onClick={e => { e.stopPropagation(); handleAirlineDelete(a._id); }}>Delete</button>
            </div>
          ))}
        </div>
      </section>

      {/* Aircrafts Section */}
      {selectedAirline && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{selectedAircraft ? "Update Aircraft" : "Add Aircraft"} for {selectedAirline.name}</h2>
          <form className="flex flex-col gap-2 mb-4" onSubmit={handleAircraftSubmit}>
            <input className="p-2 border rounded" placeholder="Name" value={aircraftForm.name} onChange={e => setAircraftForm({ ...aircraftForm, name: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Code" value={aircraftForm.code} onChange={e => setAircraftForm({ ...aircraftForm, code: e.target.value })} />
            <input className="p-2 border rounded" type="number" placeholder="Total Seats" value={aircraftForm.totalSeats} onChange={e => setAircraftForm({ ...aircraftForm, totalSeats: e.target.value })} />
            <div className="flex gap-2">
              <button className="bg-blue-500 text-white px-4 py-2 rounded">{selectedAircraft ? "Update" : "Create"}</button>
              {selectedAircraft && <button type="button" onClick={() => { setSelectedAircraft(null); setAircraftForm({ name:"", code:"", totalSeats:0, status:"active" }) }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
            </div>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aircrafts.map(ac => (
              <div key={ac._id} className="p-4 border rounded cursor-pointer" onClick={() => { setSelectedAircraft(ac); setAircraftForm(ac); }}>
                <h3 className="font-bold">{ac.name} ({ac.code})</h3>
                <p>Total Seats: {ac.totalSeats}</p>
                <p>Status: {ac.status}</p>
                <button className="mt-2 bg-red-500 text-white px-2 py-1 rounded" onClick={e => { e.stopPropagation(); handleAircraftDelete(ac._id); }}>Delete</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Flights Section */}
      {selectedAircraft && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Flights of {selectedAircraft.name}</h2>
          <form className="flex flex-col gap-2 mb-4" onSubmit={handleFlightSubmit}>
            <input className="p-2 border rounded" placeholder="Flight Name" value={flightForm.name} onChange={e => setFlightForm({ ...flightForm, name: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Flight Code" value={flightForm.code} onChange={e => setFlightForm({ ...flightForm, code: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Source" value={flightForm.source} onChange={e => setFlightForm({ ...flightForm, source: e.target.value })} />
            <input className="p-2 border rounded" placeholder="Destination" value={flightForm.destination} onChange={e => setFlightForm({ ...flightForm, destination: e.target.value })} />
            <input className="p-2 border rounded" type="datetime-local" placeholder="Departure Time" value={flightForm.departureTime} onChange={e => setFlightForm({ ...flightForm, departureTime: e.target.value })} />
            <input className="p-2 border rounded" type="datetime-local" placeholder="Arrival Time" value={flightForm.arrivalTime} onChange={e => setFlightForm({ ...flightForm, arrivalTime: e.target.value })} />
            <div className="flex gap-2">
              <button className="bg-blue-500 text-white px-4 py-2 rounded">Add/Update Flight</button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flights.map(f => (
              <div key={f._id} className="p-4 border rounded">
                <h3 className="font-bold">{f.name} ({f.code})</h3>
                <p>From: {f.source} To: {f.destination}</p>
                <p>Dep: {new Date(f.departureTime).toLocaleString()} | Arr: {new Date(f.arrivalTime).toLocaleString()}</p>
                <p>Status: {f.status}</p>
                <button className="mt-2 bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleFlightDelete(f._id)}>Delete</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
