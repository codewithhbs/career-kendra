import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Search, Eye, Trash2, Edit } from "lucide-react";
import Swal from "sweetalert2";

const ContactMessages = () => {

  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(false);


  /* ================= FETCH ================= */

  const fetchMessages = async () => {
    try {

      setLoading(true);

      const res = await api.get("/contact");

      setMessages(res.data.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMessages();
  }, []);


  /* ================= DELETE ================= */

  const deleteMessage = async (id) => {

    const confirm = await Swal.fire({
      title: "Delete Message?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    try {

      await api.delete(`/contact/${id}`);

      Swal.fire("Deleted", "Message deleted successfully", "success");

      fetchMessages();

    } catch (error) {

      Swal.fire("Error", "Failed to delete", "error");

    }

  };


  /* ================= UPDATE STATUS ================= */

  const updateMessage = async (message) => {

    const { value: status } = await Swal.fire({
      title: "Update Status",
      input: "select",
      inputOptions: {
        new: "New",
        read: "Read",
        replied: "Replied",
        closed: "Closed"
      },
      inputValue: message.status,
      showCancelButton: true
    });

    if (!status) return;

    try {

      await api.put(`/contact/${message.id}`, { status });

      Swal.fire("Updated", "Status updated", "success");

      fetchMessages();

    } catch (error) {

      Swal.fire("Error", "Update failed", "error");

    }

  };


  /* ================= SEARCH ================= */

  const filtered = messages.filter((msg) =>
    msg.name?.toLowerCase().includes(search.toLowerCase()) ||
    msg.email?.toLowerCase().includes(search.toLowerCase())
  );


  /* ================= PAGINATION ================= */

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);
  const totalPages = Math.ceil(filtered.length / limit);


  return (

    <div className="p-6">

      <h2 className="text-2xl font-semibold mb-6">
        Contact Messages
      </h2>


      {/* SEARCH */}

      <div className="mb-4 flex items-center gap-2 border p-2 rounded w-80">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search name or email"
          className="outline-none w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      {/* TABLE */}

      <div className="overflow-x-auto border rounded">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>

              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>

          </thead>

          <tbody>

            {paginated.map((msg) => (

              <tr key={msg.id} className="border-t">

                <td className="p-3">{msg.name}</td>

                <td className="p-3">{msg.email}</td>

                <td className="p-3">{msg.phone}</td>



                <td className="p-3 capitalize">{msg.status}</td>

                <td className="p-3 flex gap-2">

                  <button
                    onClick={() =>
                      Swal.fire({
                        title: msg.subject,
                        html: `<p>${msg.message}</p>`,
                      })
                    }
                    className="text-blue-600"
                  >
                    <Eye size={18} />
                  </button>


                  <button
                    onClick={() => updateMessage(msg)}
                    className="text-green-600"
                  >
                    <Edit size={18} />
                  </button>


                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* PAGINATION */}

      <div className="flex gap-2 mt-6">

        {[...Array(totalPages)].map((_, i) => (

          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              page === i + 1 ? "bg-black text-white" : ""
            }`}
          >
            {i + 1}
          </button>

        ))}

      </div>

    </div>
  );
};

export default ContactMessages;