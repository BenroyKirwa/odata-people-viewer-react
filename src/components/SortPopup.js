// src/components/SortPopup.js
import React from 'react';
import sortIcon from '../sort.svg';
import cancelIcon from '../cancel.svg';

const SortPopup = ({ sortCriteria, setSortCriteria, onClose, onApply }) => {
  const addSortCriteria = () => {
    setSortCriteria([...sortCriteria, { id: Date.now(), column: 'UserName', order: 'asc' }]);
  };

  const deleteSortCriteria = (id) => {
    setSortCriteria(sortCriteria.filter((c) => c.id !== id));
  };

  const updateSortCriterion = (id, field, value) => {
    setSortCriteria(sortCriteria.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  return (
    <div id="popup" className="popup" style={{ display: 'block' }}>
      <div className="popup-content">
        <div className="sort-popup">
          <div className="sort-popup-header">
            <div className="sort-header-start">
              <img src={sortIcon} alt="image" width="20" height="20" />
              <h2>Sort People</h2>
            </div>
            <img className="close" onClick={onClose} src={cancelIcon} alt="image" width="20" height="20" />
          </div>
          <div className="sort-body">
            <div id="sortCriteriaList">
              {sortCriteria.length === 0 ? (
                <button onClick={addSortCriteria}>Add Sort</button>
              ) : (
                sortCriteria.map((criterion) => (
                  <div key={criterion.id} className="sort-criterion-list" data-id={criterion.id}>
                    <div>
                      <p>
                        <b>Column</b>
                      </p>
                      <select
                        className="sort-column"
                        value={criterion.column}
                        onChange={(e) => updateSortCriterion(criterion.id, 'column', e.target.value)}
                      >
                        <option value="UserName">UserName</option>
                        <option value="FirstName">FirstName</option>
                        <option value="LastName">LastName</option>
                        <option value="MiddleName">MiddleName</option>
                        <option value="Gender">Gender</option>
                        <option value="Age">Age</option>
                      </select>
                    </div>
                    <div>
                      <p>
                        <b>Order</b>
                      </p>
                      <select
                        className="sort-order"
                        value={criterion.order}
                        onChange={(e) => updateSortCriterion(criterion.id, 'order', e.target.value)}
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                    <button className="delete-sort" onClick={() => deleteSortCriteria(criterion.id)}>
                      🗑️
                    </button>
                  </div>
                ))
              )}
              {sortCriteria.length > 0 && <button onClick={addSortCriteria}>Add Sort</button>}
            </div>
          </div>
          <div className="sort-popup-footer">
            <button id="resetBtn" onClick={() => setSortCriteria([])}>
              Reset Sorting
            </button>
            <button id="submitBtn" onClick={onApply}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortPopup;