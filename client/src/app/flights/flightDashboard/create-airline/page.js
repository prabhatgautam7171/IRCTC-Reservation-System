"use client";
import { useState } from "react";
import axios from "axios";

export default function CreateAirlinePage() {
  const [form, setForm] = useState({
    name: "",
    code: "",
    country: "",
    status: "active",
    contact: { supportEmail: "", supportPhone: "", address: "", website: "" },
  });
  const [logoFile, setLogoFile] = useState(null); // store file
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("contact.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        contact: { ...prev.contact, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.country) {
      alert("Name, Code, and Country are required!");
      return;
    }
    if (!logoFile) {
      alert("Please upload a logo!");
      return;
    }

    setLoading(true);
    try {
      // prepare formData
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("code", form.code);
      formData.append("country", form.country);
      formData.append("status", form.status);
      formData.append("logo", logoFile); // file upload
      formData.append("contact[supportEmail]", form.contact.supportEmail);
      formData.append("contact[supportPhone]", form.contact.supportPhone);
      formData.append("contact[address]", form.contact.address);
      formData.append("contact[website]", form.contact.website);

      const res = await axios.post(
        "http://localhost:8000/api/v1/airline/create-airline",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert(`Airline "${res.data.airline.name}" created successfully!`);
        setForm({
          name: "",
          code: "",
          country: "",
          status: "active",
          contact: { supportEmail: "", supportPhone: "", address: "", website: "" },
        });
        setLogoFile(null);
      }
    } catch (err) {
      console.error("Error creating airline:", err.response?.data?.message || err.message);
      alert("Failed to create airline. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Create New Airline</h1>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Airline Name"
          value={form.name}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="code"
          placeholder="Airline Code (e.g., AI)"
          value={form.code}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Logo Upload */}
        <input
          type="file"
          name="logo"
          accept="image/*"
          onChange={handleFileChange}
          className="p-2 border rounded"
          required
        />

        {/* Contact */}
        <input
          type="email"
          name="contact.supportEmail"
          placeholder="Support Email"
          value={form.contact.supportEmail}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="contact.supportPhone"
          placeholder="Support Phone"
          value={form.contact.supportPhone}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="contact.address"
          placeholder="Address"
          value={form.contact.address}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="contact.website"
          placeholder="Website"
          value={form.contact.website}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className={`mt-3 p-2 rounded text-white ${loading ? "bg-gray-500" : "bg-blue-500"}`}
        >
          {loading ? "Creating..." : "Create Airline"}
        </button>
      </form>
    </div>
  );
}
