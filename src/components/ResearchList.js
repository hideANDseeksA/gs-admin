import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import EditBook from "./EditResearch";
import "../styles/ResearchList.css";

const ResearchList = ({ onBookUpdated }) => {
    const [books, setBooks] = useState([]);
    const [editingBook, setEditingBook] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchBooks = async () => {
        try {
            Swal.fire({
                title: "Loading...",
                text: "Fetching Research data, please wait.",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await axios.get("https://backend-j2o4.onrender.com/api/research");
            setBooks(response.data);

            Swal.close();
        } catch (error) {
            console.error("Error fetching Research:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "There was an error fetching the Research. Please try again later.",
            });
        }
    };

    const deleteBook = async (bookId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    Swal.fire({
                        title: "Deleting...",
                        text: "Please wait while the research is being deleted.",
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        },
                    });

                    await axios.delete(`https://backend-j2o4.onrender.com/api/research/${bookId}`);

                    // Show success message before refreshing
                    Swal.fire('Deleted!', 'Research has been deleted.', 'success').then(() => {
                        fetchBooks(); // Refresh books list after the success message is shown
                    });
                } catch (error) {
                    console.error("Error deleting research:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to delete the research. Please try again later.",
                    });
                }
            }
        });
    };


    useEffect(() => {
        fetchBooks();
    }, []);

    const handleEdit = (book) => {
        setEditingBook(book);
        setShowEditModal(true);
    };

    const handleBookUpdated = () => {
        fetchBooks();
    };

    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.year.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="book-list-container modern-container">
            <h2 className="section-title modern-title">Research Repository</h2>

            <div className="book-list-actions">
                <div className="search-container modern-search-container">
                    <i className="fa fa-search search-icon"></i>
                    <input
                        type="text"
                        placeholder="Search by title or year..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-bar modern-search-bar"
                    />
                </div>
            </div>

            <table className="book-list-table modern-table">
                <thead>
                    <tr>
                        <th>Research Title</th>
                        <th>Date Submitted</th>
                        <th>Abstract</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBooks.map((book) => (
                        <tr key={book.id} className="modern-table-row">
                            <td className="modern-title-cell">{book.title}</td>
                            <td>{book.year}</td>
                            <td>
                                <td>
                                    <a href={book.abstract_url} rel="noopener noreferrer" className="modern-link">
                                        View Abstract
                                    </a>
                                </td>

                            </td>
                            <td>
                                <button onClick={() => handleEdit(book)} className="edit-button modern-button">
                                    Edit
                                </button>
                                <button onClick={() => deleteBook(book.id)} className="delete-button modern-button">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showEditModal && (
                <EditBook
                    book={editingBook}
                    onClose={() => setShowEditModal(false)}
                    onBookUpdated={handleBookUpdated}
                />
            )}
        </div>
    );
};

export default ResearchList;
