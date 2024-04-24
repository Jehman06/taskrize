import React from 'react';
import { SearchResults } from '../../redux/reducers/appSlice';
import { Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import './Dropdown.css';

interface UserQueryDropdownProps {
    searchResults?: SearchResults[];
}

const UserQueryDropdown: React.FC<UserQueryDropdownProps> = ({ searchResults }) => {
    const isInputFocused = useSelector((state: RootState) => state.app.isInputFocused);

    const showDropdown = isInputFocused && searchResults && searchResults.length > 0;

    return (
        <Dropdown show={showDropdown}>
            <Dropdown.Menu className="query-dropdown-menu">
                {Array.isArray(searchResults) && searchResults.length > 0 ? ( // Check if searchResults is defined and not empty
                    searchResults.map((searchResult, index) => (
                        <Dropdown.Item key={index} className="query-dropdown-items">
                            <p className="query-dropdown-item">
                                {searchResult.name ? searchResult.name : ''}{' '}
                                {searchResult.nickname ? `(${searchResult.nickname})` : ''}
                            </p>
                            <p className="query-dropdown-item">{searchResult.email}</p>
                        </Dropdown.Item>
                    ))
                ) : (
                    <Dropdown.Item>No results found</Dropdown.Item> // Display a message when no results are available
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default UserQueryDropdown;
