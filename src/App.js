// src/App.js
import React, { useState, useEffect } from 'react';
import './styles.css';
import PeopleTable from './components/PeopleTable';
import SortPopup from './components/SortPopup';
import FilterPopup from './components/FilterPopup';
import sortIcon from './sort.svg';
import filterIcon from './filter.svg';
import closeIcon from './close.svg'

const App = () => {
  const [peopleData, setPeopleData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCriteria, setSortCriteria] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState([]);
  // eslint-disable-next-line no-unused-vars
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    fetchPeopleData(sortCriteria, filterCriteria);
  }, []);

  const updateQueryParams = (newSortCriteria, newFilterCriteria) => {
    const params = new URLSearchParams();
    if (newSortCriteria.length > 0) {
      params.set('sortField', newSortCriteria[0].column);
      params.set('sortOrder', newSortCriteria[0].order);
    }
    if (newFilterCriteria.length > 0) {
      params.set('filterField', newFilterCriteria[0].column);
      params.set('filterValue', newFilterCriteria[0].value);
    }

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  };

  const fetchPeopleData = async (sortCriteriaToUse, filterCriteriaToUse) => {
    setIsLoading(true);
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.remove('loader-hidden');
    }

    let newPeopleData = [];
    const baseUrl = 'https://corsproxy.io/?http://services.odata.org/TripPinRESTierService/People';
    const pageSize = 10;
    let skip = 0;
    let hasMore = true;

    let queryParams = [];

    if (sortCriteriaToUse.length > 0) {
      const orderBy = sortCriteriaToUse.map((c) => `${c.column} ${c.order}`).join(',');
      queryParams.push(`$orderby=${orderBy}`);
    }

    if (filterCriteriaToUse.length > 0) {
      const filters = filterCriteriaToUse.map((criterion) => {
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

  const resetSort = () => {
    setIsLoading(true);
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.remove('loader-hidden');
    }
    setSortCriteria([]);
    updateQueryParams([], filterCriteria)
    fetchPeopleData([], filterCriteria);
  };

  const resetFilter = () => {
    setIsLoading(true);
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.remove('loader-hidden');
    }
    setFilterCriteria([]);
    updateQueryParams(sortCriteria, [])
    fetchPeopleData(sortCriteria, []);
  };

  const refreshData = () => {
    setIsLoading(true);
    const loader = document.querySelector('.loader');
    if (loader) {
      loader.classList.remove('loader-hidden');
    }
    setSortCriteria([]);
    setFilterCriteria([]);
    updateQueryParams([], []);
    fetchPeopleData([], []);
  };

  return (
    <div className="container">
      <h1>People List (React)</h1>
      <div className="table-controls">
        <button
          id="sortBtn"
          className={`sort-btn ${sortCriteria.length > 0 ? 'sorted' : ''}`}
          onClick={() => setShowSortPopup(true)}
        >
          <span
            className="sort-image"
            style={{ display: sortCriteria.length > 0 ? 'none' : 'inline' }}
          >
            <img alt="sort icon" src={sortIcon} height="15" width="15" />
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
            <img src={closeIcon}/>
          </span>
        </button>
        <button
          id="filterBtn"
          className={`filter-btn ${filterCriteria.length > 0 ? 'filtered' : ''}`}
          onClick={() => setShowFilterPopup(true)}
        >
          <span
            className="filter-image"
            style={{ display: filterCriteria.length > 0 ? 'none' : 'inline' }}
          >
            <img alt="filter icon" src={filterIcon} height="15" width="15" />
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
            <img src={closeIcon}/>
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
          onApply={(newSortCriteria) => {
            setIsLoading(true);
            const loader = document.querySelector('.loader');
            if (loader) {
              loader.classList.remove('loader-hidden');
            }
            setShowSortPopup(false);
            updateQueryParams(newSortCriteria, filterCriteria);
            fetchPeopleData(newSortCriteria, filterCriteria);
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
          onApply={(newFilterCriteria) => {
            setIsLoading(true);
            const loader = document.querySelector('.loader');
            if (loader) {
              loader.classList.remove('loader-hidden');
            }
            setShowFilterPopup(false);
            updateQueryParams(sortCriteria, newFilterCriteria);
            fetchPeopleData(sortCriteria, newFilterCriteria);
          }}
        />
      )}
    </div>
  );
};

export default App;