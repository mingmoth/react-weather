import React, { useState, useEffect } from 'react'
import styled from "@emotion/styled"
import { findLocation } from './utils';
import useWeatherApi from './useWeatherApi';
import WeatherCard  from './components/WeatherCard';
import WeatherSetting from './components/WeatherSetting'

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;


const WeatherApp = () => {
  const [currentMode, setCurrentMode] = useState('')
  const [currentPage, setCurrentPage] = useState('WeatherCard')
  const [currentCity, setCurrentCity] = useState('臺北市')
  const currentLocation = findLocation(currentCity)
  const [weatherItem, fetchData] = useWeatherApi(currentLocation)
  const { moment } = weatherItem

  useEffect(() => {
    setCurrentMode(moment === 'day' ? 'light' : 'dark')
  }, [moment])

  return (
    <Container theme={theme[currentMode]}>
      {currentPage === 'WeatherCard' && (
        <WeatherCard weatherItem={weatherItem} fetchData={fetchData} theme={theme} currentMode={currentMode} setCurrentPage={setCurrentPage} cityName={currentLocation.cityName}/>
      )}
      {currentPage === 'WeatherSetting' && (
        <WeatherSetting weatherItem={weatherItem} fetchData={fetchData} theme={theme} currentMode={currentMode} setCurrentPage={setCurrentPage} cityName={currentLocation.cityName} setCurrentCity={setCurrentCity} />
      )}
    </Container>
  )
}

export default WeatherApp