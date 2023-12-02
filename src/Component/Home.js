import React, { useEffect, useState } from 'react';
import { BsPencil, BsTrash, BsCheck, BsX } from 'react-icons/bs';
import '../App.css';

const url = "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json";

const rowsPerPage = 10;

export default function Home() {
    const [data, setData] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [page, setPage] = useState(1);
    const [selectedRowCount, setSelectedRowCount] = useState(0);
    const [editedFields, setEditedFields] = useState({});

    useEffect(() => {
        getApi(url);
    }, []);

    async function getApi(url) {
        try {
            const response = await fetch(url);
            const jsonData = await response.json();
            const dataWithSelection = jsonData.map(item => ({ ...item, selected: false }));
            setData(dataWithSelection);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        const updatedData = data.map((item, index) => {
            if (index >= startIndex && index < endIndex) {
                return { ...item, selected: !selectAll };
            }
            return item;
        });
        setData(updatedData);
        setSelectedRowCount(selectAll ? 0 : Math.min(page === totalPages ? data.length % 10 : rowsPerPage, filteredData.length))
    };

    const handleCheckboxChange = (index) => {
        const updatedData = [...data];
        updatedData[index].selected = !updatedData[index].selected;
        setData(updatedData);
        const allSelected = updatedData.every((item) => item.selected);
        setSelectAll(allSelected);
        const selectedRows = updatedData.filter((item) => item.selected);
        setSelectedRowCount(selectedRows.length);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const setEditedField = (index, field, value) => {
        setEditedFields(prevState => ({
            ...prevState,
            [index]: {
                ...prevState[index],
                [field]: value,
            },
        }));
    };

    const handleEdit = (index) => {
        setEditingIndex(index);
        setEditedFields(prevState => ({
            ...prevState,
            [index]: {
                name: data[index].name,
                email: data[index].email,
                role: data[index].role,
            },
        }));
    };

    const handleSaveEdit = (index) => {
        const updatedData = [...data];
        updatedData[index] = {
            ...updatedData[index],
            ...editedFields[index],
        };
        setEditingIndex(null);
        setData(updatedData);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
    };

    const handleDelete = (index) => {
        const updatedData = [...data];
        updatedData.splice(index, 1);
        setData(updatedData);
        setSelectedRowCount(0);
    };

    const handlePageChange = (page) => {
        setSelectAll(false)
        setSelectedRowCount(0)
        setPage(page)
        setCurrentPage(page);
    };

    const handleDeleteSelected = () => {
        const updatedData = data.filter((item) => !item.selected);
        setData(updatedData);
        setSelectAll(false);
        setSelectedRowCount(0)
    };

    const filteredData = data.filter((item) => {
        return (
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.role.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const handleLeft = () => {
        const p = page;
        p > 1 ? handlePageChange(p - 1) : handlePageChange(1);
    };

    const handleRight = () => {
        const p = page;
        p < 5 ? handlePageChange(p + 1) : handlePageChange(1);
    };

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    let currentRows = filteredData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    return (
        <div>
            <div className="header">
                <div className="headerInput">
                    <input
                        type="text"
                        placeholder="Search Value..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className='delAll'>
                    <BsTrash onClick={handleDeleteSelected} disabled={!data.some((item) => item.selected)} />
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRows.map((row, index) => (
                        <tr key={startIndex + index} className={row.selected ? 'selected-row' : ''}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={row.selected || false}
                                    onChange={() => handleCheckboxChange(startIndex + index)}
                                />
                            </td>
                            <td>
                                {editingIndex === startIndex + index ? (
                                    <input
                                        type="text"
                                        value={editedFields[index]?.name || ''}
                                        onChange={(e) => setEditedField(index, 'name', e.target.value)}
                                    />
                                ) : (
                                    row.name
                                )}
                            </td>
                            <td>
                                {editingIndex === startIndex + index ? (
                                    <input
                                        type="text"
                                        value={editedFields[index]?.email || ''}
                                        onChange={(e) => setEditedField(index, 'email', e.target.value)}
                                    />
                                ) : (
                                    row.email
                                )}
                            </td>
                            <td>
                                {editingIndex === startIndex + index ? (
                                    <input
                                        type="text"
                                        value={editedFields[index]?.role || ''}
                                        onChange={(e) => setEditedField(index, 'role', e.target.value)}
                                    />
                                ) : (
                                    row.role
                                )}
                            </td>
                            <td>
                                {editingIndex === startIndex + index ? (
                                    <div className='editdelBtn' >
                                        <div className='editBtn'>
                                            <BsCheck onClick={() => handleSaveEdit(startIndex + index)} />
                                        </div >  <div className='deleteBtn'>
                                            <BsX onClick={handleCancelEdit} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className='editdelBtn' >
                                        <div className='editBtn'>
                                            <BsPencil onClick={() => handleEdit(startIndex + index)} />
                                        </div >  <div className='deleteBtn'> <BsTrash onClick={() => handleDelete(startIndex + index)} />
                                        </div>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div >
                <div className='footerLeft' style={{ float: "left", left: '2px' }}>
                    <p>{selectedRowCount} of {filteredData.length} row(s) selected</p>
                </div>
                <div className="footerRight" style={{ float: "right", right: '2px' }}>
                    <p>Page {page} of {totalPages}</p> &nbsp; &nbsp; &nbsp;
                    <button onClick={() => handlePageChange(1)}>&lt;&lt;</button>
                    <button onClick={() => handleLeft()}>&lt;</button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button className='btns'
                            key={index}
                            style={{ cursor: 'pointer', fontWeight: currentPage === index + 1 ? 'bold' : 'normal' }}
                            onClick={() => handlePageChange(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button onClick={() => handleRight()}>&gt;</button>
                    <button onClick={() => handlePageChange(totalPages)}>&gt;&gt;</button>

                </div>
            </div>
        </div>
    );
}