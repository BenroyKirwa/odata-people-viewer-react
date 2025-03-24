// src/App.js
import React, { useState, useEffect } from 'react';
import './styles.css';
import PeopleTable from './components/PeopleTable';
import SortPopup from './components/SortPopup';
import FilterPopup from './components/FilterPopup';
import sortIcon from './sort.svg';
import filterIcon from './filter.svg';
import closeIcon from './close.svg';

const App = () => {
  const [peopleData, setPeopleData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCriteria, setSortCriteria] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSortPopup, setShowSortPopup] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const peoplePerPage = 5;

  const columnTypes = {
    UserName: 'string',
    FirstName: 'string',
    LastName: 'string',
    MiddleName: 'string',
    Gender: 'string',
    Age: 'number',
  };

  const relationsByType = {
    string: [
      { value: 'eq', label: 'Equals' },
      { value: 'contains', label: 'Contains' },
      { value: 'startswith', label: 'Starts With' },
    ],
    number: [
      { value: 'eq', label: 'Equals' },
      { value: 'gt', label: 'Greater Than' },
      { value: 'lt', label: 'Less Than' },
    ],
  };

  // Read query parameters from the URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sortField = params.get('sortField') || '';
    const sortOrder = params.get('sortOrder') || 'asc';
    const filterField = params.get('filterField') || '';
    const filterValue = params.get('filterValue') || '';

    if (sortField && sortOrder) {
      setSortCriteria([{ id: Date.now(), column: sortField, order: sortOrder }]);
    }
    if (filterField && filterValue) {
      const relation = columnTypes[filterField] === 'string' ? 'eq' : 'eq';
      setFilterCriteria([{ id: Date.now(), column: filterField, relation, value: filterValue }]);
    }

    fetchPeopleData();
  }, []);

  // Update the browser's URL with the first sorting and filtering parameters
  const updateQueryParams = () => {
    const params = new URLSearchParams();
    if (sortCriteria.length > 0) {
      params.set('sortField', sortCriteria[0].column);
      params.set('sortOrder', sortCriteria[0].order);
    }
    if (filterCriteria.length > 0) {
      params.set('filterField', filterCriteria[0].column);
      params.set('filterValue', filterCriteria[0].value);
    }

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  };

  // Fetch people data with sorting and filtering
  const fetchPeopleData = async () => {
    setIsLoading(true);
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.remove('loader-hidden');
    }

    let newPeopleData = [];
    const baseUrl = 'https://cors-anywhere.herokuapp.com/http://services.odata.org/TripPinRESTierService/People';
    const pageSize = 10;
    let skip = 0;
    let hasMore = true;

    let queryParams = [];

    if (sortCriteria.length > 0) {
      const orderBy = sortCriteria.map((c) => `${c.column} ${c.order}`).join(',');
      queryParams.push(`$orderby=${orderBy}`);
    }

    if (filterCriteria.length > 0) {
      const filters = filterCriteria.map((criterion) => {
        const { column, relation, value } = criterion;
        if (!value) return null;

        if (columnTypes[column] === 'string') {
          if (relation === 'eq') {
            return `${column} eq '${value}'`;
          } else if (relation === 'contains') {
            return `contains(${column}, '${value}')`;
          } else if (relation === 'startswith') {
            return `startswith(${column}, '${value}')`;
          }
        } else if (columnTypes[column] === 'number') {
          return `${column} ${relation} ${value}`;
        }
        return null;
      }).filter((f) => f !== null);

      if (filters.length > 0) {
        queryParams.push(`$filter=${filters.join(' and ')}`);
      }
    }

    while (hasMore) {
      try {
        let url = `${baseUrl}?$skip=${skip}&$top=${pageSize}`;
        if (queryParams.length > 0) {
          url += `&${queryParams.join('&')}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        const data = await response.json();
        const batch = data.value || [];
        newPeopleData.push(...batch);

        if (batch.length < pageSize) {
          hasMore = false;
        } else {
          skip += pageSize;
        }
      } catch (error) {
        console.error('Error fetching people data:', error.message);
        hasMore = false;
      }
    }

    setPeopleData(newPeopleData);
    setCurrentPage(1);
    setIsLoading(false);

    if (loader) {
      loader.classList.add('loader-hidden');
    }
  };

  // Reset sorting
  const resetSort = () => {
    setIsLoading(true);
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.remove('loader-hidden');
    }
    setSortCriteria([]);
    setShowSortPopup(true);
    fetchPeopleData();
  };

  // Reset filtering
  const resetFilter = () => {
    setIsLoading(true);
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.remove('loader-hidden');
    }
    setFilterCriteria([]);
    setShowFilterPopup(true);
    fetchPeopleData();
  };

  // Refresh data
  const refreshData = () => {
    setIsLoading(true);
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.remove('loader-hidden');
    }
    setSortCriteria([]);
    setFilterCriteria([]);
    updateQueryParams();
    fetchPeopleData();
  };

  return (
    <div className="container">
      <h1>People List (React)</h1>
      <div className="table-controls">
        <button id="sortBtn" className="sort-btn" onClick={() => setShowSortPopup(true)}>
          <span
            className="sort-image"
            style={{ display: sortCriteria.length > 0 ? 'none' : 'inline' }}
          >
            <img alt="image" src={sortIcon} height="15" width="15" />
          </span>
          <span className="sort-label">
            <b>{sortCriteria.length > 0 ? `${sortCriteria.length} Sort` : 'Sort'}</b>
          </span>
          <span
            id="closeSortBtn"
            className="close-sort"
            style={{ display: sortCriteria.length > 0 ? 'inline' : 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              resetSort();
            }}
          >
            <img alt="image" src={closeIcon} />
          </span>
        </button>
        <button id="filterBtn" className="filter-btn" onClick={() => setShowFilterPopup(true)}>
          <span
            className="filter-image"
            style={{ display: filterCriteria.length > 0 ? 'none' : 'inline' }}
          >
            <img alt="image" src={filterIcon} height="15" width="15" />
          </span>
          <span className="filter-label">
            <b>{filterCriteria.length > 0 ? `${filterCriteria.length} Filter` : 'Filter'}</b>
          </span>
          <span
            id="closeFilterBtn"
            className="close-filter"
            style={{ display: filterCriteria.length > 0 ? 'block' : 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              resetFilter();
            }}
          >
            ×
          </span>
        </button>
        <button id="refreshBtn" className="refresh-btn" onClick={refreshData}>
          <b>↻ Refresh</b>
        </button>
      </div>
      <PeopleTable
        peopleData={peopleData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        peoplePerPage={peoplePerPage}
      />
      {showSortPopup && (
        <SortPopup
          sortCriteria={sortCriteria}
          setSortCriteria={setSortCriteria}
          onClose={() => setShowSortPopup(false)}
          onApply={() => {
            setIsLoading(true);
            const loader = document.querySelector('.loader');
            if (loader) {
              loader.classList.remove('loader-hidden');
            }
            setShowSortPopup(false);
            updateQueryParams();
            fetchPeopleData();
          }}
        />
      )}
      {showFilterPopup && (
        <FilterPopup
          filterCriteria={filterCriteria}
          setFilterCriteria={setFilterCriteria}
          columnTypes={columnTypes}
          relationsByType={relationsByType}
          onClose={() => setShowFilterPopup(false)}
          onApply={() => {
            setIsLoading(true);
            const loader = document.querySelector('.loader');
            if (loader) {
              loader.classList.remove('loader-hidden');
            }
            setShowFilterPopup(false);
            updateQueryParams();
            fetchPeopleData();
          }}
        />
      )}
    </div>
  );
};

export default App;
