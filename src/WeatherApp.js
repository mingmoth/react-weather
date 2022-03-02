import React, { useState, useEffect, useCallback } from 'react'
import styled from "@emotion/styled"

import WeatherIcon from './WeatherIcon'

import { ReactComponent as AirFlowIcon } from './assets/images/airFlow.svg';
import { ReactComponent as RainIcon } from './assets/images/rain.svg';
import { ReactComponent as RefreshIcon } from './assets/images/refresh.svg';
import { ReactComponent as LoadingIcon } from './assets/images/loading.svg';

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

const WeatherCard = styled.div`
    position: relative;
    min-width: 360px;
    box-shadow: ${({ theme }) => theme.boxShadow};
    background-color: ${({ theme }) => theme.foregroundColor};
    box-sizing: border-box;
    padding: 30px 15px;
    text-align: start;
    `
const Location = styled.div`
  font-size: 28px;
  color: ${({ theme }) => theme.titleColor};
  margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: ${({ theme }) => theme.temperatureColor};
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  margin-bottom: 20px;
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: ${({ theme }) => theme.textColor};
  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Refresh = styled.div`
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: 12px;
  display: inline-flex;
  align-items: flex-end;
  color: ${({ theme }) => theme.textColor};

  svg {
    margin-left: 10px;
    width: 15px;
    height: 15px;
    cursor: pointer;
    animation: rotate infinite 1.5s linear;
    animation-duration: ${({ isLoading }) => (isLoading ? '1.5s' : '0s')};
  }
  @keyframes rotate {
    from {
      transform: rotate(360deg);
    }
    to {
      transform: rotate(0deg);
    }
  }
`
const fetchCurrentWeather = () => {
  return fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-0EFE490A-BF4C-40C8-9056-C7A2A29AC6FF&locationName=臺北')
    .then(response => response.json())
    .then(data => {
      const locationData = data.records.location[0]
      const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
        if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
          neededElements[item.elementName] = item.elementValue
        }
        return neededElements
      }, {})
      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD,
      }
    })
}

const fetchWeatherForecast = () => {
  return fetch('https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-0EFE490A-BF4C-40C8-9056-C7A2A29AC6FF&locationName=臺北市')
    .then(response => response.json())
    .then(data => {
      const locationData = data.records.location[0]
      const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
        neededElements[item.elementName] = item.time[0].parameter
        return neededElements
      }, {})

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      }
    })
}

const fetchSunriseNset = () => {
  const currentDay = new Date().toISOString().slice(0, 10)
  let tomorrow = new Date(new Date())
  tomorrow = new Date(tomorrow.setDate(tomorrow.getDate() + 1)).toISOString().slice(0, 10)
  return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/A-B0062-001?Authorization=CWB-0EFE490A-BF4C-40C8-9056-C7A2A29AC6FF&format=JSON&locationName=%E8%87%BA%E5%8C%97%E5%B8%82&timeFrom=${currentDay}&timeTo=${tomorrow}`)
    .then(response => response.json())
    .then(data => {
      const currentDate = data.records.locations.location[0].time[0].dataTime
      const locationData = data.records.locations.location[0].time[0].parameter
      const weatherElements = locationData.reduce((neededElements, item) => {
        if (['日出時刻', '日沒時刻'].includes(item.parameterName)) {
          neededElements[item.parameterName] = item.parameterValue
        }
        return neededElements
      }, {})
      const currentTime = new Date().getTime()
      const sunrise = new Date(`${currentDate} ${weatherElements['日出時刻']}`).getTime()
      const sunset = new Date(`${currentDate} ${weatherElements['日沒時刻']}`).getTime()
      return {
        moment: currentTime < sunrise || currentTime > sunset ? 'night' : 'day'
      }
    })
}

const WeatherApp = () => {
  const [weatherItem, setWeatherItem] = useState({
    observationTime: new Date(),
    locationName: '',
    humid: 0,
    temperature: 0,
    windSpeed: 0,
    description: '',
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: '',
    isLoading: true,
    moment: 'day',
  })
  const [currentMode, setCurrentMode] = useState('')

  const {
    observationTime,
    locationName,
    temperature,
    windSpeed,
    description,
    weatherCode,
    rainPossibility,
    comfortability,
    isLoading,
    moment,
  } = weatherItem

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast, currentMoment] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast(),
        fetchSunriseNset(),
      ])
      setWeatherItem({
        ...currentWeather,
        ...weatherForecast,
        ...currentMoment,
        isLoading: false,
      })
    }
    setWeatherItem(preState => ({
      ...preState,
      isLoading: true
    }))
    fetchingData()
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setCurrentMode(moment === 'day' ? 'light' : 'dark')
  }, [moment])

  return (
    <Container theme={theme[currentMode]}>
      <WeatherCard theme={theme[currentMode]}>
        <Location theme={theme[currentMode]}>{locationName}</Location>
        <Description theme={theme[currentMode]}>{description} {comfortability}</Description>
        <CurrentWeather theme={theme[currentMode]}>
          <Temperature theme={theme[currentMode]}>
            {Math.round(temperature)} <Celsius>°C</Celsius>
          </Temperature>
          <WeatherIcon currentWeatherCode={weatherCode} moment={moment} />
        </CurrentWeather>
        <AirFlow theme={theme[currentMode]}>
          <AirFlowIcon />
          {windSpeed} m/h
        </AirFlow>
        <Rain theme={theme[currentMode]}><RainIcon />{Math.round(rainPossibility)}%</Rain>
        <Refresh onClick={fetchData} isLoading={isLoading} theme={theme[currentMode]}>
          最後觀測時間：
          {new Intl.DateTimeFormat('zh-TW', {
            hour: 'numeric',
            minute: 'numeric',
          }).format(new Date(observationTime))}{' '}
          {isLoading ? <LoadingIcon /> : <RefreshIcon />}
        </Refresh >
      </WeatherCard>
    </Container>

  )
}


export default WeatherApp