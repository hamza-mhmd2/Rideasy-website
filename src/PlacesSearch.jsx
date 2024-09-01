import React, { useRef, useEffect } from 'react';
import { useLoadScript, StandaloneSearchBox } from '@react-google-maps/api';

const PlacesSearch = ({ onPlaceSelected, placeholder }) => {
  const searchBoxRef = useRef(null);

  const handleLoad = (searchBox) => {
    searchBoxRef.current = searchBox;
  };

  const handlePlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      onPlaceSelected(places[0]);
    }
  };

  return (
    <StandaloneSearchBox
      onLoad={handleLoad}
      onPlacesChanged={handlePlacesChanged}
    >
      <input
        type="text"
        placeholder={placeholder}
        className="search-input"
      />
    </StandaloneSearchBox>
  );
};

export default PlacesSearch;
