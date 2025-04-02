import React, { useState, useEffect } from 'react';
import './styles.css';
import DynamicTable from './components/DynamicTable';

const App = () => {
  const [peopleData, setPeopleData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const columns = [
    { key: 'UserName', label: 'User Name' },
    { key: 'FirstName', label: 'First Name' },
    { key: 'LastName', label: 'Last Name' },
    { key: 'MiddleName', label: 'Middle Name', formatter: (value) => value || 'N/A' },
    { key: 'Gender', label: 'Gender' },
    { key: 'Age', label: 'Age', formatter: (value) => value || 'N/A' },
  ];

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sortField = params.get('sortField') || '';
    const sortOrder = params.get('sortOrder') || 'asc';
    const filterField = params.get('filterField') || '';
    const filterValue = params.get('filterValue') || '';

    let initialSortCriteria = [];
    let initialFilterCriteria = [];

    if (sortField && sortOrder) {
      initialSortCriteria = [{ id: Date.now(), column: sortField, order: sortOrder }];
    }
    if (filterField && filterValue) {
      const relation = columnTypes[filterField] === 'string' ? 'eq' : 'eq';
      initialFilterCriteria = [{ id: Date.now(), column: filterField, relation, value: filterValue }];
    }

    fetchPeopleData(initialSortCriteria, initialFilterCriteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchPeopleData = async (sortCriteria, filterCriteria) => {
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

    newPeopleData = newPeopleData.map((item, index) => ({
      ...item,
      id: `${item.UserName}-${index}`,
    }));

    setPeopleData(newPeopleData);
    setIsLoading(false);

    if (loader) {
      loader.classList.add('loader-hidden');
    }
  };

  const handleRefresh = () => {
    fetchPeopleData([], []);
    updateQueryParams([], []);
  };

  return (
    <div className="container">
      <h1>People List (React)</h1>
      {isLoading && <div>Loading...</div>}
      <DynamicTable
        data={peopleData}
        columns={columns}
        onRefresh={handleRefresh}
        enablePagination={true}
        enableSort={true}
        enableFilter={true}
        itemsPerPage={5}
        columnTypes={columnTypes}
        relationsByType={relationsByType}
      />
    </div>
  );
};

export default App;