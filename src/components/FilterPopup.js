// src/components/FilterPopup.js
import React, { useState, useEffect } from 'react';
import filterIcon from '../filter.svg';
import cancelIcon from '../cancel.svg';

const FilterPopup = ({ filterCriteria, setFilterCriteria, columnTypes, relationsByType, onClose, onApply }) => {
  // Local state to manage temporary filter criteria in the popup
  const [tempFilterCriteria, setTempFilterCriteria] = useState([]);

  // Initialize tempFilterCriteria with the current filterCriteria when the popup opens
  useEffect(() => {
    setTempFilterCriteria(filterCriteria);
  }, [filterCriteria]);

  const addFilterCriteria = () => {
    const defaultColumn = 'UserName';
    const defaultType = columnTypes[defaultColumn];
    const defaultRelations = relationsByType[defaultType];
    setTempFilterCriteria([
      ...tempFilterCriteria,
      { id: Date.now(), column: defaultColumn, relation: defaultRelations[0].value, value: '' },
    ]);
  };

  const deleteFilterCriteria = (id) => {
    setTempFilterCriteria(tempFilterCriteria.filter((c) => c.id !== id));
  };

  const updateFilterCriterion = (id, field, value) => {
    if (field === 'column') {
      const newType = columnTypes[value] || 'string';
      const newRelations = relationsByType[newType];
      setTempFilterCriteria(
        tempFilterCriteria.map((c) =>
          c.id === id ? { ...c, column: value, relation: newRelations[0].value, value: '' } : c
        )
      );
    } else {
      setTempFilterCriteria(
        tempFilterCriteria.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
    }
  };

  const handleApply = () => {
    setFilterCriteria(tempFilterCriteria); // Update parent state only on "Submit"
    onApply();
  };

  const handleReset = () => {
    setTempFilterCriteria([]); // Reset temporary criteria
    setFilterCriteria([]); // Reset parent criteria
  };

  return (
    <div id="popup" className="popup" style={{ display: 'block' }}>
      <div className="popup-content">
        <div className="filter-popup">
          <div className="filter-popup-header">
            <div className="filter-header-start">
              <img src={filterIcon} alt="image" width="20" height="20" />
              <h2>Filter People</h2>
            </div>
            <img className="close" onClick={onClose} src={cancelIcon} alt="image" width="20" height="20" />
          </div>
          <div className="filter-popup-body">
            <div id="filterCriteriaList">
              {tempFilterCriteria.length === 0 ? (
                <button onClick={addFilterCriteria}>Add Filter</button>
              ) : (
                tempFilterCriteria.map((criterion) => {
                  const columnType = columnTypes[criterion.column];
                  const relations = relationsByType[columnType];
                  return (
                    <div key={criterion.id} className="filter-criterion" data-id={criterion.id}>
                      <div>
                        <p>
                          <b>Column:</b>
                        </p>
                        <select
                          className="filter-column"
                          value={criterion.column}
                          onChange={(e) => updateFilterCriterion(criterion.id, 'column', e.target.value)}
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
                          <b>Relation:</b>
                        </p>
                        <select
                          className="filter-relation"
                          value={criterion.relation}
                          onChange={(e) => updateFilterCriterion(criterion.id, 'relation', e.target.value)}
                        >
                          {relations.map((rel) => (
                            <option key={rel.value} value={rel.value}>
                              {rel.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p>
                          <b>Filter value:</b>
                        </p>
                        <input
                          className="filter-value"
                          type="text"
                          value={criterion.value}
                          placeholder="Enter a value"
                          onChange={(e) => updateFilterCriterion(criterion.id, 'value', e.target.value)}
                        />
                      </div>
                      <button className="delete-filter" onClick={() => deleteFilterCriteria(criterion.id)}>
                        🗑️
                      </button>
                    </div>
                  );
                })
              )}
              {tempFilterCriteria.length > 0 && <button onClick={addFilterCriteria}>Add Filter</button>}
            </div>
          </div>
          <div className="filter-popup-footer">
            <button id="resetBtn" onClick={handleReset}>
              Reset Filter
            </button>
            <button id="submitBtn" onClick={handleApply}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;