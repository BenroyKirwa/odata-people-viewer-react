import React, { useState, useEffect } from 'react';
import './styles.css';
import DynamicTable from './components/DynamicTable';

const App = () => {
  const [peopleData, setPeopleData] = useState([]);

  const columns = [
    { key: 'UserName', label: 'User Name' },
    { key: 'FirstName', label: 'First Name' },
    { key: 'LastName', label: 'Last Name' },
    { key: 'MiddleName', label: 'Middle Name', formatter: (value) => value || 'N/A' },
    { key: 'Gender', label: 'Gender' },
    { key: 'Age', label: 'Age', formatter: (value) => value || 'N/A' },
  ];


  useEffect(() => {
    fetchPeopleData([], []);
  }, []);


  const fetchPeopleData = async (sortCriteria, filterCriteria) => {
    let newPeopleData = [];
    const baseUrl = 'http://172.20.94.31:8080/http://services.odata.org/TripPinRESTierService/People';
    const pageSize = 10;
    let skip = 0;
    let hasMore = true;

    // Generate OData query using DynamicTable’s logic
    const sortQuery = sortCriteria.map((c) => `${c.column} ${c.order}`).join(',');
    const filterQuery = filterCriteria
      .map((c) => {
        const { column, relation, value } = c;
        if (!value) return null;
        // Simplified OData filter syntax based on DynamicTable relations
        if (relation === 'eq') return `${column} eq '${value}'`;
        if (relation === 'contains') return `contains(${column}, '${value}')`;
        if (relation === 'startswith') return `startswith(${column}, '${value}')`;
        if (relation === 'gt') return `${column} gt ${value}`;
        if (relation === 'lt') return `${column} lt ${value}`;
        return null;
      })
      .filter((f) => f !== null)
      .join(' and ');

    let queryParams = [];
    if (sortQuery) queryParams.push(`$orderby=${sortQuery}`);
    if (filterQuery) queryParams.push(`$filter=${filterQuery}`);

    while (hasMore) {
      try {
        let url = `${baseUrl}?$skip=${skip}&$top=${pageSize}`;
        if (queryParams.length > 0) {
          url += `&${queryParams.join('&')}`;
        }
        const response = await fetch(url, {
          headers: {
            'x-cors-api-key': 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          }
        });
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
  };

  const handleQueryChange = async (queryString) => {
    let odataQuery = '';
    if (queryString) {
      const params = new URLSearchParams(queryString.slice(1));
      const sort = params.get('sort');
      const filter = params.get('filter');
      const odataParams = [];
      if (sort) {
        const sortParts = sort.split(',').map((s) => {
          const [field, order] = s.split(':');
          return `${field} ${order}`;
        });
        odataParams.push(`$orderby=${sortParts.join(',')}`);
      }
      if (filter) {
        const filterParts = filter.split(',').map((f) => {
          const [field, relation, value] = f.split(':');
          if (!value) return '';
          if (relation === 'eq') return `${field} eq '${decodeURIComponent(value)}'`;
          // Add others as confirmed working
          return '';
        });
        odataParams.push(`$filter=${filterParts.join(' and ')}`);
      }
      odataQuery = odataParams.length ? `?${odataParams.join('&')}` : '';
    }

    console.log('OData Query:', odataQuery);
    const response = await fetch(`http://172.20.94.31:8080/http://services.odata.org/TripPinRESTierService/People${odataQuery}`);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const newData = await response.json();
    const newPeopleData = (newData.value || []).map((item, index) => ({
      ...item,
      id: `${item.UserName}-${index}`,
    }));
    setPeopleData(newPeopleData);
  };

  const handleRefresh = () => {
    fetchPeopleData([], []);
  };

  return (
    <div className="container">
      <h1>People List (React)</h1>
      <DynamicTable
        data={peopleData}
        columns={columns}
        onRefresh={handleRefresh}
        enablePagination={true}
        enableSort={true}
        enableFilter={true}
        itemsPerPage={5}
        isApiDriven={true}
        onQueryChange={handleQueryChange}
      />
    </div>
  );
};

export default App;