// src/components/PeopleTable.js
import React from 'react';

const PeopleTable = ({ peopleData, currentPage, setCurrentPage, peoplePerPage }) => {
  const totalPages = Math.ceil(peopleData.length / peoplePerPage);
  const startIndex = (currentPage - 1) * peoplePerPage;
  const endIndex = startIndex + peoplePerPage;
  const paginatedPeople = peopleData.slice(startIndex, endIndex);

  const jumpToFirstPage = () => setCurrentPage(1);
  const previousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const jumpToLastPage = () => setCurrentPage(totalPages);

  return (
    <div className="table-container">
      <table id="peopleTable">
        <thead>
          <tr>
            <th>UserName</th>
            <th>FirstName</th>
            <th>LastName</th>
            <th>MiddleName</th>
            <th>Gender</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody id="peopleTableBody">
          {paginatedPeople.length === 0 ? (
            <tr>
              <td colSpan="7" className="no-tickets">
                No people data available
              </td>
            </tr>
          ) : (
            paginatedPeople.map((person, index) => (
              <tr key={person.UserName}>
                <td>{person.UserName}</td>
                <td>{person.FirstName}</td>
                <td>{person.LastName}</td>
                <td>{person.MiddleName || 'N/A'}</td>
                <td>{person.Gender}</td>
                <td>{person.Age || 'N/A'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={jumpToFirstPage} disabled={currentPage === 1}>
          First
        </button>
        <button onClick={previousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
        <button onClick={jumpToLastPage} disabled={currentPage === totalPages}>
          Last
        </button>
      </div>
    </div>
  );
};

export default PeopleTable;